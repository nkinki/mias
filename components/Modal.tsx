import React from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    title: string;
    onClose: () => void;
    children: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ title, onClose, children }) => {
    return (
        <div 
            className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
            onClick={onClose}
        >
            <div 
                className="bg-surface w-full max-w-3xl max-h-[90vh] flex flex-col border border-medium rounded-lg shadow-lg"
                onClick={(e) => e.stopPropagation()}
            >
                <header className="flex justify-between items-center p-4 border-b border-medium">
                    <h2 className="text-2xl font-semibold text-dark">{title}</h2>
                    <button onClick={onClose} className="text-muted hover:text-dark transition-colors">
                        <X size={24} />
                    </button>
                </header>
                <main className="p-6 overflow-y-auto bg-light">
                    {children}
                </main>
            </div>
        </div>
    );
};