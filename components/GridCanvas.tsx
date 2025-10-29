
import React, { useRef, useEffect, useState } from 'react';
import type { Position } from '../types';
import { GRID_SIZE, CELL_SIZE, GOAL_POS, AGENT_COLOR, GOAL_COLOR, PIT_COLOR, ENEMY_COLOR, GRID_LINE_COLOR } from '../constants';

interface GridCanvasProps {
    agentPos: Position;
    enemyPositions: Position[];
    pits: Position[];
    isEditMode: boolean;
    onCanvasClick: (pos: Position) => void;
}

const GridCanvas: React.FC<GridCanvasProps> = ({ agentPos, enemyPositions, pits, isEditMode, onCanvasClick }) => {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [hoverPos, setHoverPos] = useState<Position | null>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        // Clear canvas
        ctx.fillStyle = '#1f2937'; // bg-gray-800
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // Draw grid lines
        ctx.strokeStyle = GRID_LINE_COLOR;
        ctx.lineWidth = 1;
        for (let i = 0; i <= GRID_SIZE; i++) {
            ctx.beginPath();
            ctx.moveTo(i * CELL_SIZE, 0);
            ctx.lineTo(i * CELL_SIZE, canvas.height);
            ctx.stroke();
            ctx.beginPath();
            ctx.moveTo(0, i * CELL_SIZE);
            ctx.lineTo(canvas.width, i * CELL_SIZE);
            ctx.stroke();
        }

        // Draw entities
        const drawSquare = (pos: Position, color: string) => {
            ctx.fillStyle = color;
            ctx.fillRect(pos.x * CELL_SIZE + 2, pos.y * CELL_SIZE + 2, CELL_SIZE - 4, CELL_SIZE - 4);
        };
        
        const drawCircle = (pos: Position, color: string) => {
            ctx.fillStyle = color;
            ctx.beginPath();
            ctx.arc(pos.x * CELL_SIZE + CELL_SIZE / 2, pos.y * CELL_SIZE + CELL_SIZE / 2, 16, 0, 2 * Math.PI);
            ctx.fill();
        };

        drawSquare(GOAL_POS, GOAL_COLOR);
        pits.forEach(pit => drawSquare(pit, PIT_COLOR));
        enemyPositions.forEach(enemy => drawSquare(enemy, ENEMY_COLOR));
        drawCircle(agentPos, AGENT_COLOR);
        
        // Draw hover effect in edit mode
        if (isEditMode && hoverPos) {
            ctx.strokeStyle = '#f59e0b'; // yellow-500
            ctx.lineWidth = 2;
            ctx.strokeRect(hoverPos.x * CELL_SIZE, hoverPos.y * CELL_SIZE, CELL_SIZE, CELL_SIZE);
        }

    }, [agentPos, enemyPositions, pits, isEditMode, hoverPos]);
    
    const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
        if (!isEditMode) return;
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
        const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
        if (x >= 0 && x < GRID_SIZE && y >= 0 && y < GRID_SIZE) {
            setHoverPos({ x, y });
        } else {
            setHoverPos(null);
        }
    };

    const handleMouseLeave = () => {
        setHoverPos(null);
    };
    
    const handleClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const rect = canvas.getBoundingClientRect();
        const x = Math.floor((e.clientX - rect.left) / CELL_SIZE);
        const y = Math.floor((e.clientY - rect.top) / CELL_SIZE);
        onCanvasClick({ x, y });
    };

    return (
        <canvas
            ref={canvasRef}
            width={GRID_SIZE * CELL_SIZE}
            height={GRID_SIZE * CELL_SIZE}
            className="rounded-lg shadow-lg border-2 border-gray-700"
            onClick={handleClick}
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
        />
    );
};

export default GridCanvas;
