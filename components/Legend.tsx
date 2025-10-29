
import React from 'react';
import { AGENT_COLOR, GOAL_COLOR, PIT_COLOR, ENEMY_COLOR } from '../constants';

const LegendItem: React.FC<{ color: string; shape: 'circle' | 'square'; label: string; reward?: string }> = ({ color, shape, label, reward }) => {
    return (
        <div className="flex items-center space-x-2">
            {shape === 'circle' ? (
                <div className="w-5 h-5 rounded-full" style={{ backgroundColor: color }}></div>
            ) : (
                <div className="w-5 h-5" style={{ backgroundColor: color }}></div>
            )}
            <span className="text-sm">{label}</span>
            {reward && <span className="text-sm font-mono text-gray-400">{reward}</span>}
        </div>
    );
};

const Legend: React.FC = () => {
    return (
        <div className="bg-gray-800 p-4 rounded-lg shadow-md">
            <div className="flex flex-wrap justify-center items-center gap-x-6 gap-y-2">
                <LegendItem color={AGENT_COLOR} shape="circle" label="Agent" />
                <LegendItem color={GOAL_COLOR} shape="square" label="Goal" reward="(+100)" />
                <LegendItem color={PIT_COLOR} shape="square" label="Pits" reward="(-100)" />
                <LegendItem color={ENEMY_COLOR} shape="square" label="Enemies" reward="(-100)" />
            </div>
        </div>
    );
};

export default Legend;
