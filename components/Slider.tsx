
import React from 'react';

interface SliderProps {
    label: string;
    value: number;
    min: number;
    max: number;
    step: number;
    onChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
    disabled?: boolean;
}

const Slider: React.FC<SliderProps> = ({ label, value, min, max, step, onChange, disabled }) => {
    return (
        <div>
            <div className="flex justify-between text-sm">
                <label className="font-medium text-gray-300">{label}</label>
                <span className="font-mono text-blue-300">{value}</span>
            </div>
            <input
                type="range"
                min={min}
                max={max}
                step={step}
                value={value}
                onChange={onChange}
                disabled={disabled}
                className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer disabled:cursor-not-allowed"
            />
        </div>
    );
};

export default Slider;
