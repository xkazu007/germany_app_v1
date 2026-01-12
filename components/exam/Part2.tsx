'use client';

import React from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface Question {
    id: number;
    question: string;
    options: Record<string, string>;
}

interface Part2Content {
    title: string;
    text: string;
    questions: Question[];
}

interface Part2Props {
    content: Part2Content;
    answers: Record<string | number, string | null>;
    onChange: (newAnswers: Record<string | number, string | null>) => void;
    isSubmitted?: boolean;
    results?: Record<string | number, boolean>;
    correctAnswers?: Record<string | number, string>;
    showSolutions?: boolean;
    onPass?: () => void;
}

export default function Part2({ content, answers, onChange, isSubmitted, results, correctAnswers, showSolutions, onPass }: Part2Props) {

    const selectOption = (questionId: number, optionKey: string) => {
        if (isSubmitted) return;
        onChange({
            ...answers,
            [questionId]: optionKey
        });
    };

    const resetAll = () => {
        if (isSubmitted) return;
        const reset: Record<number, string | null> = {};
        content.questions.forEach(q => reset[q.id] = null);
        onChange(reset);
    };

    return (
        <div className="flex flex-col h-full bg-[#f4f4f4] text-[#333] dark:bg-gray-900 dark:text-gray-100 transition-colors">
            {/* Instruction */}
            <div className="bg-alert-yellow border border-alert-border p-3 rounded mb-4 text-sm text-[#333] shrink-0 dark:bg-yellow-900/40 dark:border-yellow-700 dark:text-yellow-100">
                Lesen Sie den Text und die Aufgaben 6–10. Entscheiden Sie, welche Antwort (a, b oder c) am besten passt.
            </div>

            {isSubmitted && (
                <div className="bg-blue-100 border border-blue-300 p-2 mb-4 rounded text-center font-bold text-telc-blue dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200">
                    Ergebnis: {Object.values(results || {}).filter(Boolean).length} / {content.questions.length} Punkte
                </div>
            )}

            <div className="flex gap-4 flex-1 overflow-hidden">
                {/* LEFT: Article */}
                <div className="flex-[6] bg-white border border-border-grey p-8 overflow-y-auto shadow-[0_2px_4px_rgba(0,0,0,0.05)] text-[15px] leading-relaxed dark:bg-gray-800 dark:border-gray-700">
                    <div className="text-2xl font-bold mb-4 text-telc-blue dark:text-blue-300">
                        {content.title}
                    </div>
                    <div className="text-justify select-text whitespace-pre-wrap dark:text-gray-200">
                        {content.text}
                    </div>
                </div>

                {/* RIGHT: Questions */}
                <div className="flex-[4] bg-[#e8e8e8] border border-border-grey rounded p-4 overflow-y-auto flex flex-col gap-4 dark:bg-gray-800 dark:border-gray-700">
                    {content.questions.map((q) => (
                        <div key={q.id} className="bg-white border border-[#bbb] rounded p-4 shadow-sm dark:bg-gray-700 dark:border-gray-600">
                            <div className="flex gap-2 font-bold mb-3 text-sm dark:text-gray-200">
                                <span className="text-telc-red dark:text-red-400">{q.id}.</span>
                                <span>{q.question}</span>
                            </div>

                            <div className="flex flex-col gap-2">
                                {Object.entries(q.options).map(([key, text]) => {
                                    const isSelected = answers[q.id] === key;
                                    const isCorrect = correctAnswers?.[q.id] === key;
                                    const isUserCorrect = results?.[q.id];

                                    let optionClass = "hover:bg-[#f0f0f5] dark:hover:bg-gray-600";
                                    let circleClass = "border-[#888] text-[#888] dark:border-gray-400 dark:text-gray-400";

                                    if (isSubmitted) {
                                        // Submitted State
                                        optionClass = ""; // No hover
                                        if (isSelected) {
                                            if (isUserCorrect) {
                                                // Selected & Correct -> Green
                                                optionClass = "bg-green-100 dark:bg-green-900/30";
                                                circleClass = "border-green-600 bg-green-600 text-white";
                                            } else {
                                                // Selected & Incorrect -> Red
                                                optionClass = "bg-red-100 dark:bg-red-900/30";
                                                circleClass = "border-red-600 bg-red-600 text-white";
                                            }
                                        } else if (isCorrect && showSolutions) {
                                            // Not selected but Correct -> Green Outline
                                            optionClass = "bg-green-50 border border-green-200 dark:bg-green-900/10 dark:border-green-800";
                                            circleClass = "border-green-600 text-green-600 font-bold";
                                        }
                                    } else {
                                        // Active State
                                        if (isSelected) {
                                            optionClass = "bg-[#f0f0f5] dark:bg-gray-600";
                                            circleClass = "border-telc-blue bg-telc-blue text-white dark:border-blue-500 dark:bg-blue-500";
                                        }
                                    }

                                    return (
                                        <div
                                            key={key}
                                            onClick={() => selectOption(q.id, key)}
                                            className={cn(
                                                "flex items-start gap-2 cursor-pointer p-1.5 rounded transition-colors duration-200 select-none",
                                                optionClass
                                            )}
                                        >
                                            <div className={cn(
                                                "w-[18px] h-[18px] border-2 rounded-full flex items-center justify-center mt-px shrink-0 text-[10px] font-bold transition-colors",
                                                circleClass
                                            )}>
                                                {key}
                                            </div>
                                            <div className="text-[13px] leading-snug dark:text-gray-300">
                                                {text}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Footer */}
            <div className="bg-[#eee] border-t border-border-grey p-2 pr-5 flex justify-end h-[50px] items-center mt-auto shrink-0 dark:bg-gray-800 dark:border-gray-700 gap-2">
                {!isSubmitted && (
                    <button
                        onClick={onPass}
                        className="bg-gray-500 text-white border-none py-2 px-5 rounded-[3px] font-bold text-xs cursor-pointer hover:opacity-90 transition-opacity"
                    >
                        Lösung anzeigen & Weiter
                    </button>
                )}
                <button
                    onClick={resetAll}
                    disabled={isSubmitted}
                    className={`bg-btn-blue text-white border-none py-2 px-5 rounded-[3px] font-bold text-xs hover:opacity-90 transition-opacity ${isSubmitted ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                >
                    Zurücksetzen
                </button>
            </div>
        </div>
    );
}
