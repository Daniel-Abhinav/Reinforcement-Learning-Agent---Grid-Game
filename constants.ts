
import type { Position, Enemy } from './types';

export const GRID_SIZE = 10;
export const CELL_SIZE = 50;
export const MAX_STEPS = 200;

// Hyperparameters
export const ALPHA = 0.1;
export const GAMMA = 0.95;
export const EPSILON = 0.1;
export const EPISODES = 100000;

// Positions
export const AGENT_START: Position = { x: 0, y: 0 };
export const GOAL_POS: Position = { x: 9, y: 9 };
export const INITIAL_PITS: Position[] = [{ x: 5, y: 5 }, { x: 7, y: 3 }];
export const INITIAL_ENEMIES: Enemy[] = [
    { x: 0, y: 7, dir: 1 },
    { x: 5, y: 2, dir: 1 }
];

// Colors
export const AGENT_COLOR = '#3b82f6'; // blue-500
export const GOAL_COLOR = '#10b981'; // green-500
export const PIT_COLOR = '#ef4444'; // red-500
export const ENEMY_COLOR = '#a855f7'; // purple-500
export const GRID_LINE_COLOR = '#374151'; // gray-700
