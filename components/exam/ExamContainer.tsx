
'use client';

import React, { useState, useMemo } from 'react';
import ExamHeader from './ExamHeader';
import Part1 from './Part1';
import Part2 from './Part2';
import { saveAttempt } from '@/utils/supabase/attempts';

interface ExamContainerProps {
    themeTitle: string;
    partsContent: {
        [key: number]: any; // content (questions)
    };
    partsSolutions: {
        [key: number]: any; // solutions
    };
    initialPart?: number;
    nextExamLink?: string | null;
    singlePartMode?: boolean;
    progress?: { current: number; total: number };
    backLink?: string; // New prop for practice mode exit
    // Tracking props for attempts
    teilId?: number;
    partId?: number;
    themeId?: number | null;
}

export default function ExamContainer({ themeTitle, partsContent, partsSolutions, initialPart = 1, nextExamLink, singlePartMode, progress, backLink, teilId, partId, themeId }: ExamContainerProps) {
    const [activePart, setActivePart] = useState<number>(initialPart);
    const [isSubmitted, setIsSubmitted] = useState(false);
    const [showSolutions, setShowSolutions] = useState(false);
    const [results, setResults] = useState<Record<number, Record<string | number, boolean>>>({});

    // Dev Mode Language State
    const [language, setLanguage] = useState<'de' | 'en'>('de');

    // Master state: { 1: { questionId: answerId }, 2: { ... } }
    const [allAnswers, setAllAnswers] = useState<Record<number, Record<string | number, string | null>>>({
        1: {},
        2: {}
    });

    // Handle Updates
    const handlePartAnswerChange = (partId: number, newAnswers: Record<string | number, string | null>) => {
        if (isSubmitted) return; // Prevent changes after submission
        setAllAnswers(prev => ({
            ...prev,
            [partId]: newAnswers
        }));
    };

    const handleSubmit = () => {
        // Validation: Check if all questions are answered for the active part
        const currentAnswers = allAnswers[activePart] || {};
        let isComplete = false;

        if (activePart === 1 && partsContent[1]) {
            isComplete = partsContent[1].paragraphs.every((p: any) => currentAnswers[p.id]);
        } else if (activePart === 2 && partsContent[2]) {
            isComplete = partsContent[2].questions.every((q: any) => currentAnswers[q.id]);
        }

        if (!isComplete) {
            alert("Bitte beantworten Sie alle Fragen, bevor Sie abgeben.");
            return;
        }

        if (confirm('Are you sure you want to submit the exam?')) {
            performSubmission();
        }
    };

    const handlePass = () => {
        if (confirm('Möchten Sie wirklich aufgeben und die Lösungen sehen?')) {
            performSubmission();
            setShowSolutions(true);
        }
    };

    const performSubmission = async () => {
        const newResults: Record<number, Record<string | number, boolean>> = {};

        // Grade Part 1
        if (partsSolutions[1] && allAnswers[1]) {
            newResults[1] = {};
            // Solution format: { "1": "J", "2": "C" ... }
            Object.entries(partsSolutions[1]).forEach(([qId, correctAns]) => {
                const userAns = allAnswers[1][qId] || null;
                newResults[1][qId] = userAns === correctAns;
            });
        }

        // Grade Part 2
        if (partsSolutions[2] && allAnswers[2]) {
            newResults[2] = {};
            Object.entries(partsSolutions[2]).forEach(([qId, correctAns]) => {
                const userAns = allAnswers[2][qId] || null;
                newResults[2][qId] = userAns === correctAns;
            });
        }

        setResults(newResults);
        setIsSubmitted(true);

        // Save attempts to database (if tracking props are provided)
        if (teilId && partId) {
            // In singlePartMode, we save one attempt for the active part
            const partResults = newResults[activePart] || {};
            const correctCount = Object.values(partResults).filter(Boolean).length;
            const totalCount = Object.keys(partResults).length;

            if (totalCount > 0) {
                await saveAttempt({
                    teilId,
                    partId,
                    themeId: themeId || null,
                    correctCount,
                    totalCount,
                });
            }
        } else if (!singlePartMode) {
            // In full exam mode without specific teilId, save attempts for each part
            // This requires the page to pass teil IDs - handled at page level
        }
    };

    // Completion Logic
    const completionStatus = useMemo(() => {
        const status: Record<number, boolean> = {};

        // Check Part 1
        if (partsContent[1]) {
            const p1Params = partsContent[1].paragraphs || [];
            const p1Answers = allAnswers[1] || {};
            // Complete if every paragraph ID has a non-null value
            const isP1Complete = p1Params.every((p: any) => p1Answers[p.id]);
            status[1] = isP1Complete && p1Params.length > 0;
        }

        // Check Part 2
        if (partsContent[2]) {
            const p2Questions = partsContent[2].questions || [];
            const p2Answers = allAnswers[2] || {};
            // Complete if every question ID has a non-null value
            const isP2Complete = p2Questions.every((q: any) => p2Answers[q.id]);
            status[2] = isP2Complete && p2Questions.length > 0;
        }

        return status;
    }, [allAnswers, partsContent]);

    return (
        <div className="flex flex-col h-screen bg-[#f4f4f4] text-[#333] dark:bg-gray-900 dark:text-gray-100 transition-colors">
            <ExamHeader
                activePart={activePart}
                themeTitle={themeTitle}
                onTabClick={setActivePart}
                completionStatus={completionStatus}
                onSubmit={handleSubmit}
                isSubmitted={isSubmitted}
                showSolutions={showSolutions}
                onToggleSolutions={() => setShowSolutions(!showSolutions)}
                nextExamLink={nextExamLink}
                singlePartMode={singlePartMode}
                progress={progress}
                backLink={backLink}
                language={language}
                onToggleLanguage={() => setLanguage(l => l === 'de' ? 'en' : 'de')}
            />

            <div className="flex-1 flex flex-col overflow-hidden p-4">
                {activePart === 1 && partsContent[1] && (
                    <Part1
                        content={partsContent[1]}
                        answers={allAnswers[1] || {}}
                        onChange={(ans) => handlePartAnswerChange(1, ans)}
                        isSubmitted={isSubmitted}
                        results={results[1]}
                        correctAnswers={partsSolutions[1]}
                        showSolutions={showSolutions}
                        onPass={handlePass}
                    />
                )}

                {activePart === 2 && partsContent[2] && (
                    <Part2
                        content={partsContent[2]}
                        answers={allAnswers[2] || {}}
                        onChange={(ans) => handlePartAnswerChange(2, ans)}
                        isSubmitted={isSubmitted}
                        results={results[2]}
                        correctAnswers={partsSolutions[2]}
                        showSolutions={showSolutions}
                        onPass={handlePass}
                    />
                )}

                {!partsContent[activePart] && (
                    <div className="p-8 text-center text-gray-500">
                        Part {activePart} is not available for this theme.
                    </div>
                )}
            </div>
        </div>
    );
}
