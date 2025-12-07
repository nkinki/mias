import React from 'react';
import type { Program } from '../types';

interface ProgramCardProps {
    program: Program;
    onClick: () => void;
}

export const ProgramCard: React.FC<ProgramCardProps> = ({ program, onClick }) => {
    return (
        <button
            onClick={onClick}
            className="group bg-surface border border-medium p-4 rounded-lg text-left transition-all duration-300 hover:border-accent hover:shadow-md hover:-translate-y-1"
        >
            <div className="flex items-center mb-3">
                <program.icon className="w-8 h-8 mr-4 text-accent flex-shrink-0"/>
                <h3 className="font-semibold text-lg text-dark group-hover:text-accent transition-colors">{program.name}</h3>
            </div>
            <p className="text-sm text-muted">{program.description}</p>
        </button>
    );
};