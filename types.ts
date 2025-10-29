
export interface Position {
    x: number;
    y: number;
}

export interface Enemy extends Position {
    dir: 1 | -1;
}

export interface Stats {
    episodes: number;
    successCount: number;
    totalSteps: number;
    totalRewards: number;
    goalsReached: number;
    pitHits: number;
    enemyHits: number;
    timeouts: number;
    successRate: number;
    avgSteps: number;
}

export interface Hyperparameters {
    alpha: number;
    gamma: number;
    epsilon: number;
    episodes: number;
}

export type QTable = number[][][][][];

export interface GameState {
    agentPos: Position;
    enemies: Enemy[];
}

export interface PathStep {
    agent: Position;
    enemies: Position[];
}
