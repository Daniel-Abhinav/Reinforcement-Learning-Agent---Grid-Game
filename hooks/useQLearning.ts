
import { useState, useRef, useCallback, useMemo } from 'react';
import type { Position, Hyperparameters, Stats, QTable, Enemy, GameState, PathStep } from '../types';
import { GRID_SIZE, MAX_STEPS, AGENT_START, GOAL_POS, INITIAL_ENEMIES } from '../constants';

interface QLearningProps {
    hyperparameters: Hyperparameters;
    pits: Position[];
    onStatsUpdate?: (stats: { episodes: number; successRate: number; avgSteps: number; totalRewards: number; }) => void;
}

export const useQLearning = ({ hyperparameters, pits, onStatsUpdate }: QLearningProps) => {
    const qTable = useRef<QTable>([]);
    const [isTrained, setIsTrained] = useState(false);
    const [isTraining, setIsTraining] = useState(false);
    const [isRunning, setIsRunning] = useState(false);

    const initialStats = useMemo<Stats>(() => ({
        episodes: 0,
        successCount: 0,
        totalSteps: 0,
        totalRewards: 0,
        goalsReached: 0,
        pitHits: 0,
        enemyHits: 0,
        timeouts: 0,
        successRate: 0,
        avgSteps: 0,
    }), []);

    const [stats, setStats] = useState<Stats>(initialStats);

    const initQTable = useCallback(() => {
        qTable.current = Array(GRID_SIZE).fill(0).map(() =>
            Array(GRID_SIZE).fill(0).map(() =>
                Array(GRID_SIZE).fill(0).map(() =>
                    Array(GRID_SIZE).fill(0).map(() => Array(4).fill(0))
                )
            )
        );
    }, []);

    const getReward = useCallback((agentPos: Position, currentEnemies: Position[], currentPits: Position[]): number => {
        if (agentPos.x === GOAL_POS.x && agentPos.y === GOAL_POS.y) return 100;
        if (currentPits.some(p => p.x === agentPos.x && p.y === agentPos.y)) return -100;
        if (currentEnemies.some(e => e.x === agentPos.x && e.y === agentPos.y)) return -100;
        return -1;
    }, []);

    const isTerminal = useCallback((agentPos: Position, currentEnemies: Position[], currentPits: Position[]): boolean => {
        return getReward(agentPos, currentEnemies, currentPits) !== -1;
    }, [getReward]);

    const moveAgent = (pos: Position, action: number): Position => {
        let { x, y } = pos;
        if (action === 0) y = Math.max(0, y - 1); // Up
        else if (action === 1) y = Math.min(GRID_SIZE - 1, y + 1); // Down
        else if (action === 2) x = Math.max(0, x - 1); // Left
        else if (action === 3) x = Math.min(GRID_SIZE - 1, x + 1); // Right
        return { x, y };
    };

    const moveEnemy = (enemy: Enemy): Enemy => {
        let { x, y, dir } = enemy;
        x += dir;
        if (x === 0 || x === GRID_SIZE - 1) {
            dir *= -1;
        }
        return { x, y, dir };
    };
    
    const chooseAction = (ay: number, ax: number, e1x: number, e2x: number, epsilon: number): number => {
        if (Math.random() < epsilon) {
            return Math.floor(Math.random() * 4); // Explore
        }
        const qValues = qTable.current[ay][ax][e1x][e2x];
        return qValues.indexOf(Math.max(...qValues)); // Exploit
    };

    const train = useCallback(async () => {
        setIsTraining(true);
        setIsTrained(false);
        setStats(initialStats);
        initQTable();

        const { alpha, gamma, epsilon, episodes } = hyperparameters;
        let tempStats: Stats = { ...initialStats };

        for (let episode = 1; episode <= episodes; episode++) {
            let agentPos = { ...AGENT_START };
            let enemies = INITIAL_ENEMIES.map(e => ({ ...e }));
            let steps = 0;
            let episodeReward = 0;

            while (steps < MAX_STEPS) {
                const state = [agentPos.y, agentPos.x, enemies[0].x, enemies[1].x];
                const action = chooseAction(state[0], state[1], state[2], state[3], epsilon);
                
                const nextAgentPos = moveAgent(agentPos, action);
                const nextEnemies = enemies.map(moveEnemy);
                const nextEnemyPositions = nextEnemies.map(e => ({ x: e.x, y: e.y }));

                const reward = getReward(nextAgentPos, nextEnemyPositions, pits);
                const isDone = isTerminal(nextAgentPos, nextEnemyPositions, pits);
                
                const nextState = [nextAgentPos.y, nextAgentPos.x, nextEnemies[0].x, nextEnemies[1].x];
                const oldQ = qTable.current[state[0]][state[1]][state[2]][state[3]][action];
                const maxNextQ = isDone ? 0 : Math.max(...qTable.current[nextState[0]][nextState[1]][nextState[2]][nextState[3]]);
                
                const newQ = oldQ + alpha * (reward + gamma * maxNextQ - oldQ);
                qTable.current[state[0]][state[1]][state[2]][state[3]][action] = newQ;

                agentPos = nextAgentPos;
                enemies = nextEnemies;
                episodeReward += reward;
                steps++;

                if (isDone) break;
            }

            tempStats.episodes = episode;
            tempStats.totalRewards += episodeReward;

            const finalReward = getReward(agentPos, enemies.map(e => ({ x: e.x, y: e.y })), pits);
            if (finalReward === 100) {
                tempStats.successCount++;
                tempStats.totalSteps += steps;
                tempStats.goalsReached++;
            } else if (finalReward === -100) {
                 if (pits.some(p => p.x === agentPos.x && p.y === agentPos.y)) tempStats.pitHits++;
                 else tempStats.enemyHits++;
            } else {
                tempStats.timeouts++;
            }

            if (episode % 1000 === 0) {
                tempStats.successRate = (tempStats.successCount / episode) * 100;
                tempStats.avgSteps = tempStats.successCount > 0 ? tempStats.totalSteps / tempStats.successCount : 0;
                setStats({ ...tempStats });
                onStatsUpdate?.({ episodes: episode, successRate: tempStats.successRate, avgSteps: tempStats.avgSteps, totalRewards: tempStats.totalRewards });
                await new Promise(resolve => setTimeout(resolve, 0)); // Yield to main thread
            }
        }
        
        tempStats.successRate = (tempStats.successCount / episodes) * 100;
        tempStats.avgSteps = tempStats.successCount > 0 ? tempStats.totalSteps / tempStats.successCount : 0;
        setStats(tempStats);

        setIsTraining(false);
        setIsTrained(true);
    }, [hyperparameters, pits, initQTable, getReward, isTerminal, onStatsUpdate, initialStats]);

    const run = useCallback(async (): Promise<{ path: PathStep[], outcome: string }> => {
        if (!isTrained) return { path: [], outcome: "Agent is not trained yet."};

        setIsRunning(true);
        let agentPos = { ...AGENT_START };
        let enemies = INITIAL_ENEMIES.map(e => ({ ...e }));
        let steps = 0;
        const path: PathStep[] = [{ agent: { ...agentPos }, enemies: enemies.map(e => ({ x: e.x, y: e.y })) }];
        
        while (steps < MAX_STEPS) {
            const state = [agentPos.y, agentPos.x, enemies[0].x, enemies[1].x];
            const action = chooseAction(state[0], state[1], state[2], state[3], 0); // Epsilon = 0 for exploitation

            agentPos = moveAgent(agentPos, action);
            enemies = enemies.map(moveEnemy);
            
            path.push({ agent: { ...agentPos }, enemies: enemies.map(e => ({ x: e.x, y: e.y })) });
            steps++;

            if (isTerminal(agentPos, enemies.map(e => ({ x: e.x, y: e.y })), pits)) {
                break;
            }
        }
        
        setIsRunning(false);
        
        const finalReward = getReward(agentPos, enemies.map(e => ({ x: e.x, y: e.y })), pits);
        let outcome = `Failed: Timeout after ${steps} steps.`;
        if (finalReward === 100) outcome = `Success! Reached goal in ${steps} steps.`;
        else if (finalReward === -100) outcome = `Failed: Hit an obstacle after ${steps} steps.`;
        
        return { path, outcome };
    }, [isTrained, pits, isTerminal, getReward]);
    
    const reset = useCallback(() => {
        setIsTrained(false);
        setIsTraining(false);
        setIsRunning(false);
        setStats(initialStats);
        initQTable();
    }, [initQTable, initialStats]);

    return { stats, isTrained, isTraining, isRunning, train, run, reset };
};
