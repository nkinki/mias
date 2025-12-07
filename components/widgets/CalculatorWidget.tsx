import React, { useState } from 'react';
import { WidgetFrame } from '../WidgetFrame';

export const CalculatorWidget: React.FC = () => {
    const [display, setDisplay] = useState('0');
    const [expression, setExpression] = useState('');

    const handleButtonClick = (value: string) => {
        if (value === 'C') {
            setDisplay('0');
            setExpression('');
        } else if (value === '=') {
            try {
                // Using Function constructor for safe evaluation
                const result = new Function(`return ${expression}`)();
                setDisplay(String(result));
                setExpression(String(result));
            } catch {
                setDisplay('Hiba');
                setExpression('');
            }
        } else if (value === '%') {
            try {
                const lastNumberStr = expression.match(/[\d\.]+$/)?.[0];
                if (!lastNumberStr) return; // No number at the end

                const restOfTheExpression = expression.substring(0, expression.length - lastNumberStr.length);
                if (!restOfTheExpression) { // Just a number, e.g. 50%
                    const percentageValue = parseFloat(lastNumberStr) / 100;
                    setExpression(String(percentageValue));
                    setDisplay(String(percentageValue));
                    return;
                }
                
                const lastOperator = restOfTheExpression.slice(-1);
                const expressionBeforeOperator = restOfTheExpression.slice(0, -1);
                const lastNumber = parseFloat(lastNumberStr);

                if (['+', '-'].includes(lastOperator)) {
                    // For + and -, calculate percentage of the value of the expression so far.
                    const baseValue = new Function(`return ${expressionBeforeOperator || '0'}`)();
                    const percentageValue = baseValue * (lastNumber / 100);
                    const newExpression = expressionBeforeOperator + lastOperator + percentageValue;
                    setExpression(newExpression);
                    setDisplay(newExpression);
                } else if (['*', '/'].includes(lastOperator)) {
                    // For * and /, just convert percentage to decimal. The base is already part of the multiplication.
                    const percentageValue = lastNumber / 100;
                    const newExpression = restOfTheExpression + percentageValue;
                    setExpression(newExpression);
                    setDisplay(newExpression);
                }
            } catch {
                setDisplay('Hiba');
                setExpression('');
            }
        } else {
            if (display === '0' || display === 'Hiba') {
                setDisplay(value);
                setExpression(value);
            } else {
                setDisplay(display + value);
                setExpression(expression + value);
            }
        }
    };

    const buttons = ['7', '8', '9', '/', '4', '5', '6', '*', '1', '2', '3', '-', '0', '.', '%', '+'];

    return (
        <WidgetFrame title="Számológép">
            <div className="w-full p-2 bg-light rounded-md border border-medium">
                <div className="h-8 mb-2 px-2 text-right text-xl font-mono bg-surface text-dark rounded flex items-center justify-end overflow-x-auto border border-medium">
                    {display}
                </div>
                <div className="grid grid-cols-4 gap-1">
                    {buttons.map(btn => (
                        <button
                            key={btn}
                            onClick={() => handleButtonClick(btn)}
                            className={`
                                h-8 rounded-sm text-dark font-semibold transition-all duration-200
                                ${'/*-+%'.includes(btn) ? 'bg-gray-200 hover:bg-gray-300' : 'bg-white hover:bg-gray-100 border border-medium'}
                            `}
                        >
                            {btn}
                        </button>
                    ))}
                    <button onClick={() => handleButtonClick('C')} className="h-8 rounded-sm text-white font-bold transition-all duration-200 bg-red-500 hover:bg-red-600 col-span-2">C</button>
                    <button onClick={() => handleButtonClick('=')} className="h-8 rounded-sm text-white font-bold transition-all duration-200 bg-accent hover:bg-accent-hover col-span-2">=</button>
                </div>
            </div>
        </WidgetFrame>
    );
};