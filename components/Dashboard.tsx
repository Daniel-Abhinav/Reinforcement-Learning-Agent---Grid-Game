
import React from 'react';
import type { Stats, Hyperparameters } from '../types';
import Slider from './Slider';
import Card from './Card';

interface DashboardProps {
    stats: Stats;
    hyperparameters: Hyperparameters;
    onHyperparameterChange: (params: Hyperparameters) => void;
    isTraining: boolean;
}

const StatItem: React.FC<{ label: string; value: string | number; color?: string }> = ({ label, value, color = 'text-gray-200' }) => (
    <div className="flex justify-between items-center text-sm">
        <span className="text-gray-400">{label}:</span>
        <span className={`font-bold font-mono ${color}`}>{value}</span>
    </div>
);

const Dashboard: React.FC<DashboardProps> = ({ stats, hyperparameters, onHyperparameterChange, isTraining }) => {
    
    const progress = hyperparameters.episodes > 0 ? (stats.episodes / hyperparameters.episodes) * 100 : 0;

    const handleSliderChange = (key: keyof Hyperparameters) => (e: React.ChangeEvent<HTMLInputElement>) => {
        onHyperparameterChange({
            ...hyperparameters,
            [key]: Number(e.target.value)
        });
    };
    
    const handleInputChange = (key: keyof Hyperparameters) => (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = parseInt(e.target.value, 10);
        if (!isNaN(value) && value > 0) {
            onHyperparameterChange({
                ...hyperparameters,
                [key]: value,
            });
        }
    };

    return (
        <div className="space-y-4">
            <Card title="Training Statistics">
                <div className="space-y-2">
                    <StatItem label="Episodes" value={`${stats.episodes.toLocaleString()} / ${hyperparameters.episodes.toLocaleString()}`} />
                    <div className="w-full bg-gray-700 rounded-full h-2.5">
                        <div className="bg-blue-600 h-2.5 rounded-full" style={{ width: `${progress}%`, transition: 'width 0.5s ease-in-out' }}></div>
                    </div>
                    <StatItem label="Success Rate" value={`${stats.successRate.toFixed(2)}%`} />
                    <StatItem label="Avg Steps/Success" value={stats.avgSteps.toFixed(2)} />
                    <StatItem label="Total Rewards" value={stats.totalRewards.toLocaleString()} />
                </div>
            </Card>

            <Card title="Performance Metrics">
                <div className="space-y-2">
                    <StatItem label="Goals Reached" value={stats.goalsReached.toLocaleString()} color="text-green-400" />
                    <StatItem label="Pit Hits" value={stats.pitHits.toLocaleString()} color="text-red-400" />
                    <StatItem label="Enemy Hits" value={stats.enemyHits.toLocaleString()} color="text-purple-400" />
                    <StatItem label="Timeouts" value={stats.timeouts.toLocaleString()} color="text-yellow-400" />
                </div>
            </Card>

            <Card title="Hyperparameters">
                <div className="space-y-4">
                    <Slider label="Learning Rate (α)" value={hyperparameters.alpha} min={0.01} max={1} step={0.01} onChange={handleSliderChange('alpha')} disabled={isTraining} />
                    <Slider label="Discount Factor (γ)" value={hyperparameters.gamma} min={0.01} max={1} step={0.01} onChange={handleSliderChange('gamma')} disabled={isTraining} />
                    <Slider label="Epsilon (ε)" value={hyperparameters.epsilon} min={0.01} max={1} step={0.01} onChange={handleSliderChange('epsilon')} disabled={isTraining} />
                     <div>
                        <label className="block text-sm font-medium text-gray-300">Training Episodes</label>
                        <input
                            type="number"
                            value={hyperparameters.episodes}
                            onChange={handleInputChange('episodes')}
                            disabled={isTraining}
                            className="mt-1 block w-full bg-gray-700 border border-gray-600 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
                        />
                    </div>
                </div>
            </Card>

            <Card title="State Space Info">
                <div className="space-y-2">
                    <StatItem label="Dimensions" value="10×10×10×10×4" />
                    <StatItem label="Total States" value={(10*10*10*10*4).toLocaleString()} />
                    <StatItem label="Actions" value="4 (↑, ↓, ←, →)" />
                </div>
            </Card>
        </div>
    );
};

export default Dashboard;
