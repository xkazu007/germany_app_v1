'use client';

import React, { useState, DragEvent } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: (string | undefined | null | false)[]) {
    return twMerge(clsx(inputs));
}

interface Heading {
    id: string; // "A", "B", ...
    text: string;
}

interface Paragraph {
    id: number; // 1, 2, 3 ...
    text: string;
}

interface Part1Content {
    title: string;
    photo: string;
    headings: Heading[];
    paragraphs: Paragraph[];
}

interface Part1Props {
    content: Part1Content;
    answers: Record<string | number, string | null>;
    onChange: (newAnswers: Record<string | number, string | null>) => void;
    isSubmitted?: boolean;
    results?: Record<string | number, boolean>;
    correctAnswers?: Record<string | number, string>;
    showSolutions?: boolean;
    onPass?: () => void;
}

export default function Part1({ content, answers, onChange, isSubmitted, results, correctAnswers, showSolutions, onPass }: Part1Props) {
    const assignments = answers; // alias for clarity
    const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null);

    // --- Logic ---

    const handleDragStart = (e: DragEvent, answerId: string, fromQuestionId?: number) => {
        if (isSubmitted) return;
        e.dataTransfer.setData("text/plain", answerId);
        if (fromQuestionId !== undefined) {
            e.dataTransfer.setData("sourceQuestion", fromQuestionId.toString());
        }
        e.dataTransfer.effectAllowed = "move";
    };

    const handleDrop = (e: DragEvent, targetQuestionId: number) => {
        e.preventDefault();
        if (isSubmitted) return;

        const answerId = e.dataTransfer.getData("text/plain");
        const sourceQuestion = e.dataTransfer.getData("sourceQuestion");

        if (!answerId) return;

        let newAnswers = { ...assignments };

        // If dragged from another question, clear that one
        if (sourceQuestion) {
            const sourceId = parseInt(sourceQuestion, 10);
            if (sourceId !== targetQuestionId) {
                newAnswers[sourceId] = null;
            }
        }

        // Check if this answer is already used elsewhere
        Object.keys(newAnswers).forEach(key => {
            const k = parseInt(key, 10);
            if (newAnswers[k] === answerId && k !== targetQuestionId) {
                newAnswers[k] = null;
            }
        });

        newAnswers[targetQuestionId] = answerId;
        onChange(newAnswers);
        setActiveQuestionId(null);
    };

    const handleListDrop = (e: DragEvent) => {
        e.preventDefault();
        if (isSubmitted) return;

        const sourceQuestion = e.dataTransfer.getData("sourceQuestion");
        if (sourceQuestion) {
            const sId = parseInt(sourceQuestion, 10);
            const newAnswers = { ...assignments, [sId]: null };
            onChange(newAnswers);
        }
    };

    const handleZoneClick = (questionId: number) => {
        if (isSubmitted) return;

        // If active, deactivate
        if (assignments[questionId]) {
            const newAnswers = { ...assignments, [questionId]: null };
            onChange(newAnswers);
            return;
        }

        if (activeQuestionId === questionId) {
            setActiveQuestionId(null);
        } else {
            setActiveQuestionId(questionId);
        }
    };

    const handleOptionClick = (answerId: string) => {
        if (isSubmitted) return;

        const isPlaced = Object.values(assignments).includes(answerId);
        if (isPlaced) return;

        if (activeQuestionId !== null) {
            let newAnswers = { ...assignments };

            // Check duplicate use
            Object.keys(newAnswers).forEach(key => {
                const k = parseInt(key, 10);
                if (newAnswers[k] === answerId) {
                    newAnswers[k] = null;
                }
            });

            newAnswers[activeQuestionId] = answerId;
            onChange(newAnswers);
            setActiveQuestionId(null);
        }
    };

    const resetAll = () => {
        if (isSubmitted) return;
        const reset: Record<number, string | null> = {};
        Object.keys(assignments).forEach(k => reset[parseInt(k)] = null);
        onChange(reset);
    };

    return (
        <div className="flex flex-col h-full bg-[#f4f4f4] text-[#333] dark:bg-gray-900 dark:text-gray-100 transition-colors">
            {/* Instruction */}
            <div className="bg-alert-yellow border border-alert-border p-3 rounded mb-4 text-sm text-[#333] shrink-0 dark:bg-yellow-900/40 dark:border-yellow-700 dark:text-yellow-100">
                Lesen Sie die Überschriften a–j und die Texte 1–5 und entscheiden Sie, welche Überschrift am besten zu welchem Text passt.
            </div>

            {isSubmitted && (
                <div className="bg-blue-100 border border-blue-300 p-2 mb-4 rounded text-center font-bold text-telc-blue dark:bg-blue-900/30 dark:border-blue-700 dark:text-blue-200">
                    Ergebnis: {Object.values(results || {}).filter(Boolean).length} / {content.paragraphs.length} Punkte
                </div>
            )}

            <div className="flex gap-4 flex-1 overflow-hidden">
                {/* LEFT: Texts */}
                <div className="flex-[6] overflow-y-auto pr-1">
                    {content.paragraphs.map((p) => {
                        const isCorrect = results?.[p.id];
                        const hasAnswer = assignments[p.id];
                        const correctAnswer = correctAnswers?.[p.id];

                        const selectedHeading = content.headings.find(h => h.id === assignments[p.id]);

                        let zoneClass = "bg-white/50 border-[#999] text-[#666] hover:bg-white hover:border-telc-blue dark:bg-gray-600 dark:border-gray-500 dark:text-gray-300 dark:hover:bg-gray-500";
                        if (assignments[p.id]) {
                            zoneClass = "bg-telc-blue text-white border-telc-blue font-bold text-sm cursor-grab dark:bg-blue-600 dark:border-blue-500 px-2";
                        }
                        if (isSubmitted) {
                            if (isCorrect) {
                                zoneClass = "bg-green-600 text-white border-green-600 font-bold text-sm cursor-default px-2";
                            } else {
                                zoneClass = "bg-red-600 text-white border-red-600 font-bold text-sm cursor-default px-2";
                            }
                        } else if (activeQuestionId === p.id && !assignments[p.id]) {
                            zoneClass = "border-2 border-telc-red bg-[#fff0f0] animate-pulse shadow-[0_0_5px_rgba(227,0,27,0.3)] dark:bg-red-900/30 dark:border-red-500";
                        }

                        return (
                            <div key={p.id} className="bg-white border border-border-grey mb-6 shadow-sm dark:bg-gray-800 dark:border-gray-700">
                                {/* Header with Drop Zone */}
                                <div className="bg-light-purple px-4 py-2 text-telc-blue font-bold border-b border-border-grey text-sm flex flex-col items-start gap-2 h-auto min-h-[45px] dark:bg-gray-700 dark:text-blue-300 dark:border-gray-600">
                                    <div className="flex items-center w-full flex-wrap gap-2">
                                        <span>Frage {p.id}:</span>
                                        {/* Drop Zone */}
                                        <span
                                            className={cn(
                                                "inline-flex items-center justify-center min-w-[60px] min-h-[28px] border border-dashed rounded text-xs cursor-pointer transition-all duration-200 select-none whitespace-normal text-center leading-tight py-1",
                                                zoneClass
                                            )}
                                            onClick={() => handleZoneClick(p.id)}
                                            onDragOver={(e) => !isSubmitted && e.preventDefault()}
                                            onDrop={(e) => handleDrop(e, p.id)}
                                            draggable={!!assignments[p.id] && !isSubmitted}
                                            onDragStart={(e) => assignments[p.id] && handleDragStart(e, assignments[p.id]!, p.id)}
                                        >
                                            {selectedHeading ? (
                                                <span className="flex items-center">
                                                    <span className="font-extrabold mr-2 opacity-80">{selectedHeading.id}:</span>
                                                    {selectedHeading.text}
                                                </span>
                                            ) : (
                                                `... Hier ziehen ...`
                                            )}
                                        </span>
                                    </div>

                                    {isSubmitted && !isCorrect && showSolutions && correctAnswer && (
                                        <div className="text-xs text-red-600 font-bold dark:text-red-400 mt-1">
                                            (Korrekt: {correctAnswer} - {content.headings.find(h => h.id === correctAnswer)?.text || ''})
                                        </div>
                                    )}
                                </div>

                                {/* Fake Email Meta */}
                                <div className="bg-[#f9f9f9] border-b border-[#eee] py-2 px-4 dark:bg-gray-800 dark:border-gray-700">
                                    <div className="flex mb-1 items-center">
                                        <div className="w-[60px] text-[11px] font-bold text-[#666] dark:text-gray-400">An:</div>
                                        <div className="flex-1 bg-white border border-[#ccc] h-[20px] dark:bg-gray-700 dark:border-gray-600"></div>
                                    </div>
                                    <div className="flex mb-1 items-center">
                                        <div className="w-[60px] text-[11px] font-bold text-[#666] dark:text-gray-400">CC:</div>
                                        <div className="flex-1 bg-white border border-[#ccc] h-[20px] dark:bg-gray-700 dark:border-gray-600"></div>
                                    </div>
                                    <div className="flex items-center">
                                        <div className="w-[60px] text-[11px] font-bold text-[#666] dark:text-gray-400">Betreff:</div>
                                        <div className="flex-1 bg-white border border-[#ccc] h-[20px] dark:bg-gray-700 dark:border-gray-600"></div>
                                    </div>
                                </div>

                                {/* Content */}
                                <div className="p-5 text-sm leading-relaxed text-[#222] text-justify select-text dark:text-gray-200">
                                    {p.text}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* RIGHT: Options */}
                <div
                    className="flex-[4] bg-[#e8e8e8] border border-border-grey rounded p-2 overflow-y-auto flex flex-col gap-2 h-full dark:bg-gray-800 dark:border-gray-700"
                    onDragOver={(e) => !isSubmitted && e.preventDefault()}
                    onDrop={handleListDrop}
                >
                    {content.headings.map((h) => {
                        const isPlaced = Object.values(assignments).includes(h.id);
                        return (
                            <div
                                key={h.id}
                                className={cn(
                                    "bg-white border border-[#bbb] rounded-[3px] p-2 flex items-start text-xs transition-all duration-200 select-none dark:bg-gray-700 dark:border-gray-600 dark:text-gray-200",
                                    isPlaced ? "opacity-40 pointer-events-none bg-[#ddd] border-dashed dark:bg-gray-600 dark:opacity-30" : (isSubmitted ? "opacity-100 cursor-default" : "hover:bg-selection-blue hover:border-[#99c] hover:-translate-y-[1px] hover:shadow-sm cursor-grab dark:hover:bg-gray-600")
                                )}
                                draggable={!isPlaced && !isSubmitted}
                                onDragStart={(e) => handleDragStart(e, h.id)}
                                onClick={() => handleOptionClick(h.id)}
                            >
                                <span className="font-bold text-telc-blue mr-2 min-w-[15px] dark:text-blue-300">{h.id.toLowerCase()}</span>
                                <span className="leading-snug">{h.text}</span>
                            </div>
                        );
                    })}
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
