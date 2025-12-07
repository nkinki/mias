import React from 'react';

interface WidgetFrameProps {
    title: string;
    children: React.ReactNode;
    className?: string;
    headerControls?: React.ReactNode;
    leftControls?: React.ReactNode;
}

export const WidgetFrame: React.FC<WidgetFrameProps> = ({ title, children, className = '', headerControls, leftControls }) => {
    return (
        <div className={`bg-surface border border-medium p-4 rounded-lg shadow-md relative flex flex-col ${className}`}>
            <div className="relative mb-2 border-b border-medium pb-2 h-10 flex items-center justify-center">
                {leftControls && <div className="absolute left-0 top-0 h-full flex items-center">{leftControls}</div>}
                <h3 className="font-semibold text-dark text-lg truncate px-20">{title}</h3>
                <div className="absolute right-0 top-0 h-full flex items-center">{headerControls}</div>
            </div>
            <div className="flex-grow flex flex-col justify-center items-center">
                {children}
            </div>
        </div>
    );
};