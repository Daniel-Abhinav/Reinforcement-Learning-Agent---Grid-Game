
import React, { useState, useEffect, useCallback, useRef } from 'react';
import GridCanvas from './components/GridCanvas';
import Dashboard from './components/Dashboard';
import Controls from './components/Controls';
import Legend from './components/Legend';
import { useQLearning } from './hooks/useQLearning';
import type { Position, Hyperparameters } from './types';
import { AGENT_START, GOAL_POS, INITIAL_ENEMIES, INITIAL_PITS, EPISODES as INITIAL_EPISODES, ALPHA as INITIAL_ALPHA, GAMMA as INITIAL_GAMMA, EPSILON as INITIAL_EPSILON } from './constants';

const App: React.FC = () => {
    const [pits, setPits] = useState<Position[]>(INITIAL_PITS);
    const [isEditMode, setIsEditMode] = useState<boolean>(false);
    const [statusMessage, setStatusMessage] = useState<string>('Ready to train the agent.');
    const [hyperparameters, setHyperparameters] = useState<Hyperparameters>({
        alpha: INITIAL_ALPHA,
        gamma: INITIAL_GAMMA,
        epsilon: INITIAL_EPSILON,
        episodes: INITIAL_EPISODES,
    });

    const [agentPos, setAgentPos] = useState<Position>(AGENT_START);
    const [enemyPositions, setEnemyPositions] = useState<Position[]>(INITIAL_ENEMIES.map(e => ({ x: e.x, y: e.y })));
    const animationFrameId = useRef<number | null>(null);

    const onStatsUpdate = useCallback((stats: { episodes: number; successRate: number; avgSteps: number; totalRewards: number; }) => {
        setStatusMessage(`Training... Episode: ${stats.episodes.toLocaleString()}/${hyperparameters.episodes.toLocaleString()}`);
    }, [hyperparameters.episodes]);

    const {
        stats,
        isTrained,
        isTraining,
        isRunning,
        train,
        run,
        reset,
    } = useQLearning({ hyperparameters, pits, onStatsUpdate });

    const handleTrain = useCallback(async () => {
        setStatusMessage('Initializing training...');
        await train();
        setStatusMessage('Training complete! You can now run the learned agent.');
    }, [train]);

    const handleRun = useCallback(async () => {
        if (!isTrained) return;
        setStatusMessage('Running learned policy...');
        
        const { path, outcome } = await run();
        
        const animatePath = (index: number) => {
            if (index >= path.length) {
                setStatusMessage(outcome);
                return;
            }
            const { agent, enemies } = path[index];
            setAgentPos(agent);
            setEnemyPositions(enemies);
            animationFrameId.current = setTimeout(() => animatePath(index + 1), 200);
        };
        
        animatePath(0);

    }, [isTrained, run]);
    
    const handleReset = useCallback(() => {
        if (animationFrameId.current) {
            clearTimeout(animationFrameId.current);
            animationFrameId.current = null;
        }
        reset();
        setPits(INITIAL_PITS);
        setAgentPos(AGENT_START);
        setEnemyPositions(INITIAL_ENEMIES.map(e => ({ x: e.x, y: e.y })));
        setIsEditMode(false);
        setStatusMessage('Environment and agent reset.');
    }, [reset]);

    const toggleEditMode = () => {
        if (isTraining || isRunning) return;
        setIsEditMode(prev => !prev);
    };

    const handleCanvasClick = (pos: Position) => {
        if (!isEditMode) return;
        
        const isOccupied = 
            (pos.x === AGENT_START.x && pos.y === AGENT_START.y) ||
            (pos.x === GOAL_POS.x && pos.y === GOAL_POS.y) ||
            INITIAL_ENEMIES.some(e => e.x === pos.x && e.y === pos.y);

        if (isOccupied) {
            setStatusMessage("Cannot place a pit on start, goal, or enemy positions.");
            setTimeout(() => setStatusMessage("Editing pits..."), 2000);
            return;
        }

        setPits(prevPits => {
            const pitIndex = prevPits.findIndex(p => p.x === pos.x && p.y === pos.y);
            if (pitIndex > -1) {
                return prevPits.filter((_, i) => i !== pitIndex);
            } else {
                return [...prevPits, pos];
            }
        });
    };

    useEffect(() => {
        return () => {
            if (animationFrameId.current) {
                clearTimeout(animationFrameId.current);
            }
        };
    }, []);

    return (
        <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col p-4 lg:p-8 space-y-4">
            <header className="text-center">
                <h1 className="text-3xl md:text-4xl font-bold text-blue-400">Dynamic Reinforcement Learning Agent</h1>
                <p className="text-gray-400 mt-1">Q-Learning with Patrolling Enemies</p>
            </header>

            <main className="flex-grow grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8">
                <div className="lg:col-span-2 flex flex-col items-center space-y-4">
                    <GridCanvas
                        agentPos={agentPos}
                        enemyPositions={enemyPositions}
                        pits={pits}
                        isEditMode={isEditMode}
                        onCanvasClick={handleCanvasClick}
                    />
                    <Controls
                        onTrain={handleTrain}
                        onRun={handleRun}
                        onReset={handleReset}
                        onToggleEdit={toggleEditMode}
                        isTraining={isTraining}
                        isTrained={isTrained}
                        isRunning={isRunning}
                        isEditMode={isEditMode}
                    />
                    <div className="w-full text-center bg-gray-800 p-2 rounded-lg">
                        <p className="text-yellow-400 font-mono">{statusMessage}</p>
                    </div>
                </div>

                <div className="lg:col-span-1">
                    <Dashboard
                        stats={stats}
                        hyperparameters={hyperparameters}
                        onHyperparameterChange={setHyperparameters}
                        isTraining={isTraining}
                    />
                </div>
            </main>
            
            <footer className="w-full mt-4">
                <Legend />
            </footer>
        </div>
    );
};

export default App;
