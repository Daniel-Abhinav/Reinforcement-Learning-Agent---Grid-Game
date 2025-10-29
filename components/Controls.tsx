
import React from 'react';

interface ControlsProps {
    onTrain: () => void;
    onRun: () => void;
    onReset: () => void;
    onToggleEdit: () => void;
    isTraining: boolean;
    isTrained: boolean;
    isRunning: boolean;
    isEditMode: boolean;
}

const Button: React.FC<React.PropsWithChildren<React.ButtonHTMLAttributes<HTMLButtonElement>>> = ({ children, ...props }) => {
    return (
        <button
            className="w-full px-4 py-2 font-bold text-white rounded-lg shadow-md transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
            {...props}
        >
            {children}
        </button>
    );
};

const Controls: React.FC<ControlsProps> = ({ onTrain, onRun, onReset, onToggleEdit, isTraining, isTrained, isRunning, isEditMode }) => {
    const anyActionInProgress = isTraining || isRunning;

    return (
        <div className="w-full max-w-lg grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button
                onClick={onTrain}
                disabled={anyActionInProgress || isEditMode}
                className="bg-blue-600 hover:bg-blue-700 focus:ring-blue-500"
            >
                {isTraining ? 'Training...' : 'Train Agent'}
            </Button>
            <Button
                onClick={onRun}
                disabled={!isTrained || anyActionInProgress || isEditMode}
                className="bg-green-600 hover:bg-green-700 focus:ring-green-500"
            >
                {isRunning ? 'Running...' : 'Run Learned Agent'}
            </Button>
            <Button
                onClick={onReset}
                disabled={anyActionInProgress}
                className="bg-red-600 hover:bg-red-700 focus:ring-red-500"
            >
                Reset
            </Button>
            <Button
                onClick={onToggleEdit}
                disabled={anyActionInProgress}
                className={`${isEditMode ? 'bg-yellow-500 hover:bg-yellow-600 focus:ring-yellow-400' : 'bg-purple-600 hover:bg-purple-700 focus:ring-purple-500'}`}
            >
                {isEditMode ? 'Done Editing' : 'Edit Pits'}
            </Button>
        </div>
    );
};

export default Controls;
