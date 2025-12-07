import React from 'react';
import { HardHat } from 'lucide-react';

interface MockProgramProps {
    message: string;
}

export const MockProgram: React.FC<MockProgramProps> = ({ message }) => {
    return (
        <div className="text-center p-8 bg-light border border-medium rounded-lg">
            <HardHat className="w-16 h-16 mx-auto mb-4 text-accent" />
            <h3 className="font-semibold text-2xl text-dark mb-2">Fejlesztés Alatt</h3>
            <p className="text-muted">{message}</p>
        </div>
    );
};