
'use client';

import React from 'react';
import Link from 'next/link';

interface ExamHeaderProps {
    activePart: number;
    themeTitle: string;
    onTabClick?: (part: number) => void;
    completionStatus?: Record<number, boolean>;
    onSubmit?: () => void;
    isSubmitted?: boolean;
    showSolutions?: boolean;
    onToggleSolutions?: () => void;
    nextExamLink?: string | null;
    singlePartMode?: boolean;
    progress?: { current: number; total: number };
    backLink?: string;
    language?: 'de' | 'en';
    onToggleLanguage?: () => void;
}

export default function ExamHeader({ activePart, themeTitle, onTabClick, completionStatus, onSubmit, isSubmitted, showSolutions, onToggleSolutions, nextExamLink, singlePartMode, progress, backLink, language = 'de', onToggleLanguage }: ExamHeaderProps) {

    // Labels Dictionary
    const labels = {
        de: {
            submit: '🏁 ABGABE',
            submitted: '✔ ABGEGEBEN',
            showSolutions: '👁 Lösungen anzeigen',
            hideSolutions: '👁 Lösungen verbergen',
            next: 'Nächste Übung →',
            save: '💾 SPEICHERN',
            time: 'Verbleibende Zeit',
            back: '← Zurück'
        },
        en: {
            submit: '🏁 SUBMIT',
            submitted: '✔ SUBMITTED',
            showSolutions: '👁 Show Solutions',
            hideSolutions: '👁 Hide Solutions',
            next: 'Next Exercise →',
            save: '💾 SAVE',
            time: 'Remaining Time',
            back: '← Back'
        }
    };

    const t = labels[language];

    return (
        <header className="flex flex-col w-full">
            <div className="bg-gradient-to-b from-header-bg-top to-header-bg-bottom text-white px-4 py-2 flex justify-between items-start min-h-[85px] h-auto relative">
                {/* Dev Language Toggle - Floating Top Right */}
                <button
                    onClick={onToggleLanguage}
                    className="absolute top-1 right-1 opacity-50 hover:opacity-100 text-[9px] border border-white/30 px-1 rounded z-50 uppercase"
                    title="Toggle Dev Language"
                >
                    {language}
                </button>

                {/* Logo Section */}
                <div className="flex items-center">
                    {backLink ? (
                        <Link href={backLink} className="mr-4 text-white/80 hover:text-white flex items-center font-bold text-sm bg-white/10 px-3 py-2 rounded hover:bg-white/20 transition-colors">
                            {t.back}
                        </Link>
                    ) : (
                        <Link href="/">
                            <div className="bg-telc-red text-white p-2 md:px-3 md:py-2 font-extrabold text-xl md:text-2xl rounded mr-4 shadow-sm leading-none flex flex-col justify-center cursor-pointer">
                                telc
                                <span className="text-[9px] uppercase tracking-wide mt-0.5 font-normal">
                                    Language Tests
                                </span>
                            </div>
                        </Link>
                    )}
                </div>

                {/* Tabs */}
                <div className="flex gap-1 self-end -mb-2">
                    {/* Tab 1 */}
                    {(!singlePartMode || activePart === 1) && (
                        <div
                            className={`tab-item ${activePart === 1 ? 'active' : ''} ${singlePartMode ? 'cursor-default pointer-events-none' : ''}`}
                            onClick={() => !singlePartMode && onTabClick?.(1)}
                        >
                            <strong>
                                Leseverstehen
                                {completionStatus?.[1] && <span className="ml-1 text-green-500">✓</span>}
                            </strong>
                            Teil 1
                            <div className="text-telc-red font-bold">(25 Punkte)</div>
                        </div>
                    )}

                    {/* Tab 2 */}
                    {(!singlePartMode || activePart === 2) && (
                        <div
                            className={`tab-item ${activePart === 2 ? 'active' : ''} ${singlePartMode ? 'cursor-default pointer-events-none' : ''}`}
                            onClick={() => !singlePartMode && onTabClick?.(2)}
                        >
                            <strong>
                                Leseverstehen
                                {completionStatus?.[2] && <span className="ml-1 text-green-500">✓</span>}
                            </strong>
                            Teil 2
                            <div className="text-telc-red font-bold">(25 Punkte)</div>
                        </div>
                    )}

                    {/* Placeholders for other parts - Hide in Single Part Mode */}
                    {!singlePartMode && (
                        <div className="tab-item opacity-50 cursor-not-allowed">
                            <strong>Leseverstehen</strong>
                            Teil 3
                            <div className="text-telc-red font-bold">(25 Punkte)</div>
                        </div>
                    )}
                </div>

                {/* Meta Controls */}
                <div className="flex flex-col items-end gap-1 text-xs min-w-[220px]">
                    <div className="flex justify-between w-full text-gray-300">
                        <span>Deutsch B2</span>
                        <span>Max Mustermann</span>
                    </div>
                    <button
                        className={`btn-action ${isSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
                        onClick={() => !isSubmitted && onSubmit?.()}
                    >
                        {isSubmitted ? t.submitted : t.submit}
                    </button>
                    {isSubmitted && (
                        <button
                            className="bg-gray-700 text-white border border-gray-500 rounded px-2 py-1 text-xs mt-1 hover:bg-gray-600 transition-colors"
                            onClick={onToggleSolutions}
                        >
                            {showSolutions ? t.hideSolutions : t.showSolutions}
                        </button>
                    )}
                    {isSubmitted && nextExamLink && (
                        <Link
                            href={nextExamLink}
                            className="bg-telc-red text-white border border-telc-red rounded px-3 py-1 text-xs mt-1 font-bold hover:bg-red-600 transition-colors text-center shadow-sm"
                        >
                            {t.next}
                        </Link>
                    )}
                    <div className="flex justify-end w-full mt-0.5">
                        <span className="text-[10px] text-gray-400">{t.time}: 88 Min</span>
                    </div>
                    <button className="btn-action">{t.save}</button>
                </div>
            </div>

            <div className="bg-telc-blue text-white px-5 py-2 text-base font-bold h-[40px] flex items-center shadow-sm z-10">
                <span>Leseverstehen, TEIL {activePart} - {themeTitle}</span>
                {progress && progress.total > 1 && (
                    <span className="ml-2 font-normal opacity-80 text-sm bg-white/20 px-2 py-0.5 rounded">
                        (Übung {progress.current}/{progress.total})
                    </span>
                )}
            </div>

            <style jsx>{`
        .tab-item {
          background-color: #666;
          color: #ccc;
          padding: 8px 10px;
          width: 110px;
          text-align: center;
          font-size: 11px;
          border-top-left-radius: 4px;
          border-top-right-radius: 4px;
          cursor: pointer;
          position: relative;
          box-shadow: inset 0 -5px 10px rgba(0, 0, 0, 0.2);
          line-height: 1.3;
        }
        .tab-item.active {
          background-color: white;
          color: #333;
          height: 65px;
          z-index: 10;
          box-shadow: 0 -2px 5px rgba(0, 0, 0, 0.1);
          display: flex;
          flex-direction: column;
          justify-content: center;
        }
        .tab-item strong {
            display: block;
            color: #eee;
            margin-bottom: 2px;
        }
        .tab-item.active strong {
            color: #000;
        }
        .btn-action {
          background: linear-gradient(
            to bottom,
            var(--color-btn-gradient-top),
            var(--color-btn-gradient-bottom)
          );
          border: 1px solid #0d4189;
          color: white;
          padding: 4px 10px;
          border-radius: 3px;
          font-weight: bold;
          font-size: 11px;
          cursor: pointer;
          width: 100%;
          text-align: left;
          display: flex;
          justify-content: space-between;
          align-items: center;
        }
        .btn-action::after {
          content: '>';
          font-weight: bold;
          margin-left: 5px;
        }
      `}</style>
        </header>
    );
}
