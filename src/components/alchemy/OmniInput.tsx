import { useState, useRef, useCallback, useEffect, type DragEvent, type ClipboardEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Upload, X, Zap, FileJson, Palette, Clock, Key, Binary, Link, Type, ImageIcon, Code } from 'lucide-react';
import { useI18n } from '../../lib/i18n';

interface OmniInputProps {
    onTextInput: (text: string) => void;
    onFileInput: (file: File) => void;
    hasResults: boolean;
    onClear: () => void;
}

// Example inputs to cycle through
const EXAMPLE_INPUTS = [
    { text: '{"name": "Alchemy", "version": "1.0"}', type: 'JSON', icon: FileJson },
    { text: '#FF6B35', type: 'Color', icon: Palette },
    { text: '1702382400', type: 'Timestamp', icon: Clock },
    { text: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...', type: 'JWT', icon: Key },
    { text: '0xFF42', type: 'Number', icon: Binary },
    { text: 'Hello%20World%21', type: 'URL Encoded', icon: Link },
];

const FEATURE_PILLS = [
    { icon: FileJson, label: 'JSON', color: 'text-emerald-400' },
    { icon: Palette, label: 'Colors', color: 'text-pink-400' },
    { icon: Clock, label: 'Timestamps', color: 'text-blue-400' },
    { icon: Key, label: 'JWT', color: 'text-amber-400' },
    { icon: Binary, label: 'Hex/Binary', color: 'text-purple-400' },
    { icon: Link, label: 'URL', color: 'text-cyan-400' },
    { icon: ImageIcon, label: 'Images', color: 'text-orange-400' },
    { icon: Code, label: 'Code', color: 'text-lime-400' },
    { icon: Type, label: 'Text', color: 'text-slate-400' },
];

export function OmniInput({ onTextInput, onFileInput, hasResults, onClear }: OmniInputProps) {
    const { t } = useI18n();
    const [isDragging, setIsDragging] = useState(false);
    const [value, setValue] = useState('');
    const [exampleIndex, setExampleIndex] = useState(0);
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    // Cycle through examples
    useEffect(() => {
        if (hasResults || value) return;

        const interval = setInterval(() => {
            setExampleIndex((prev) => (prev + 1) % EXAMPLE_INPUTS.length);
        }, 3000);

        return () => clearInterval(interval);
    }, [hasResults, value]);

    const handleDragOver = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);
    }, []);

    const handleDrop = useCallback((e: DragEvent) => {
        e.preventDefault();
        setIsDragging(false);

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];

            if (file.type.startsWith('image/')) {
                onFileInput(file);
                return;
            }

            const reader = new FileReader();
            reader.onload = (event) => {
                const text = event.target?.result as string;
                setValue(text);
                onTextInput(text);
            };
            reader.readAsText(file);
        }
    }, [onTextInput, onFileInput]);

    const handlePaste = useCallback((e: ClipboardEvent<HTMLTextAreaElement>) => {
        const items = e.clipboardData.items;
        for (const item of items) {
            if (item.type.startsWith('image/')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (file) {
                    onFileInput(file);
                    return;
                }
            }
        }
    }, [onFileInput]);

    const handleChange = useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
        const text = e.target.value;
        setValue(text);

        if (text.trim().length > 0) {
            onTextInput(text);
        }
    }, [onTextInput]);

    const handleClear = useCallback(() => {
        setValue('');
        onClear();
        textareaRef.current?.focus();
    }, [onClear]);

    const handleExampleClick = useCallback((exampleText: string) => {
        setValue(exampleText);
        onTextInput(exampleText);
    }, [onTextInput]);

    const currentExample = EXAMPLE_INPUTS[exampleIndex];

    return (
        <motion.div
            layout
            className={`relative w-full transition-all duration-500 ${hasResults ? 'mb-6' : 'flex-1 flex flex-col items-center justify-center py-8'
                }`}
        >
            {/* Hero Section - Only show when no results */}
            <AnimatePresence>
                {!hasResults && !value && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20, height: 0 }}
                        className="text-center mb-8 max-w-2xl mx-auto px-4"
                    >
                        {/* Tagline */}
                        <motion.h2
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.1 }}
                            className="text-2xl sm:text-3xl font-bold text-slate-100 mb-3"
                        >
                            <span className="bg-gradient-to-r from-amber-400 to-orange-500 bg-clip-text text-transparent">
                                {t('hero.title')}
                            </span>
                        </motion.h2>
                        <motion.p
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.2 }}
                            className="text-slate-400 text-sm sm:text-base mb-6"
                        >
                            {t('hero.subtitle')}
                        </motion.p>

                        {/* Feature Pills */}
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.3 }}
                            className="flex flex-wrap justify-center gap-2 mb-6"
                        >
                            {FEATURE_PILLS.map((pill, index) => (
                                <motion.span
                                    key={pill.label}
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ delay: 0.3 + index * 0.05 }}
                                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-800/50 border border-slate-700/50 text-xs"
                                >
                                    <pill.icon className={`w-3.5 h-3.5 ${pill.color}`} />
                                    <span className="text-slate-300">{pill.label}</span>
                                </motion.span>
                            ))}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Input Area */}
            <motion.div
                layout
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`relative w-full max-w-3xl mx-auto rounded-2xl transition-all duration-300 ${isDragging
                        ? 'bg-amber-400/10 border-2 border-dashed border-amber-400 shadow-lg shadow-amber-400/20'
                        : 'bg-slate-900/70 backdrop-blur-md border border-slate-800 hover:border-slate-700'
                    } ${hasResults ? '' : 'min-h-[160px] sm:min-h-[180px]'}`}
            >
                {/* Clear button */}
                {hasResults && (
                    <div className="absolute top-2 right-2 z-10">
                        <button
                            onClick={handleClear}
                            className="flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-medium text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition-colors"
                        >
                            <X className="w-3 h-3" />
                            {t('input.clear')}
                        </button>
                    </div>
                )}

                {/* Textarea */}
                <textarea
                    ref={textareaRef}
                    value={value}
                    onChange={handleChange}
                    onPaste={handlePaste}
                    placeholder={t('input.placeholder')}
                    className={`w-full bg-transparent text-slate-100 placeholder-slate-500 resize-none outline-none font-code text-sm leading-relaxed p-4 sm:p-6 ${hasResults ? 'min-h-[100px]' : 'min-h-[160px] sm:min-h-[180px]'
                        }`}
                    autoFocus
                />

                {/* Drag Overlay */}
                <AnimatePresence>
                    {isDragging && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            className="absolute inset-0 flex items-center justify-center bg-slate-950/90 rounded-2xl"
                        >
                            <div className="text-center">
                                <Upload className="w-12 h-12 text-amber-400 mx-auto mb-2 animate-bounce" />
                                <p className="text-amber-400 font-medium">{t('input.dropHint')}</p>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Animated Example Hint */}
                {!hasResults && !value && (
                    <div className="absolute bottom-3 left-4 right-4">
                        <div className="flex items-center justify-between">
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={exampleIndex}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    className="flex items-center gap-2"
                                >
                                    <span className="text-xs text-slate-500">{t('hero.tryExample')}</span>
                                    <button
                                        onClick={() => handleExampleClick(currentExample.text.replace('...', ''))}
                                        className="inline-flex items-center gap-1.5 px-2 py-1 rounded-lg bg-slate-800/80 hover:bg-slate-700 border border-slate-700 text-xs text-slate-300 transition-all hover:border-amber-400/50 hover:text-amber-400 group"
                                    >
                                        <currentExample.icon className="w-3 h-3 text-amber-400" />
                                        <code className="font-code text-[11px]">{currentExample.text}</code>
                                        <Zap className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity text-amber-400" />
                                    </button>
                                </motion.div>
                            </AnimatePresence>

                            {/* Dots indicator */}
                            <div className="flex gap-1">
                                {EXAMPLE_INPUTS.map((_, i) => (
                                    <div
                                        key={i}
                                        className={`w-1.5 h-1.5 rounded-full transition-colors ${i === exampleIndex ? 'bg-amber-400' : 'bg-slate-700'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                )}
            </motion.div>

            {/* Keyboard Shortcut Hint */}
            {!hasResults && !value && (
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.5 }}
                    className="text-center text-xs text-slate-600 mt-4"
                >
                    <kbd className="px-1.5 py-0.5 rounded bg-slate-800 border border-slate-700 text-slate-400 font-mono text-[10px]">
                        Ctrl+V
                    </kbd>
                    <span className="mx-2">{t('hero.orDrop')}</span>
                </motion.p>
            )}
        </motion.div>
    );
}
