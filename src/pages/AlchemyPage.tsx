import { useState, useCallback, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, Share2, Check } from 'lucide-react';
import { PageTransition } from '../components/ui/PageTransition';
import { LanguageSelector } from '../components/layout/LanguageSelector';
import { Footer } from '../components/layout/Footer';
import { OmniInput } from '../components/alchemy/OmniInput';
import { JsonResult } from '../components/results/JsonResult';
import { ColorResult } from '../components/results/ColorResult';
import { TimestampResult } from '../components/results/TimestampResult';
import { HtmlResult } from '../components/results/HtmlResult';
import { ImageResult } from '../components/results/ImageResult';
import { CodeResult } from '../components/results/CodeResult';
import { TextResult } from '../components/results/TextResult';
import { JwtResult } from '../components/results/JwtResult';
import { Base64Result } from '../components/results/Base64Result';
import { UrlResult } from '../components/results/UrlResult';
import { NumberResult } from '../components/results/NumberResult';
import { detect, detectFileType, type DetectedType } from '../lib/detector';
import { addToHistory } from '../lib/history';
import { copyShareLink, parseShareLink, clearShareFromUrl } from '../lib/share';
import { useI18n } from '../lib/i18n';

interface AlchemyState {
    type: DetectedType | null;
    data: string;
    file: File | null;
}

function AlchemyPage() {
    const { t } = useI18n();
    const [state, setState] = useState<AlchemyState>({ type: null, data: '', file: null });
    const [shareStatus, setShareStatus] = useState<'idle' | 'copied'>('idle');

    // Check for shared content on mount
    useEffect(() => {
        const shared = parseShareLink();
        if (shared) {
            setState({
                type: shared.type as DetectedType || null,
                data: shared.text,
                file: null,
            });
            clearShareFromUrl();

            // Re-detect to get proper type
            if (shared.text) {
                const result = detect(shared.text);
                setState(prev => ({ ...prev, type: result.type }));
                addToHistory(shared.text, result.type);
            }
        }
    }, []);

    const handleTextInput = useCallback((text: string) => {
        const result = detect(text);
        setState({ type: result.type, data: text, file: null });
        addToHistory(text, result.type);
    }, []);

    const handleFileInput = useCallback((file: File) => {
        const type = detectFileType(file);

        if (type === 'image') {
            setState({ type: 'image', data: '', file });
            addToHistory(file.name, 'image');
        } else {
            // Read file as text
            const reader = new FileReader();
            reader.onload = (e) => {
                const text = e.target?.result as string;
                const result = detect(text);
                setState({ type: result.type, data: text, file: null });
                addToHistory(text, result.type);
            };
            reader.readAsText(file);
        }
    }, []);

    const handleClear = useCallback(() => {
        setState({ type: null, data: '', file: null });
    }, []);

    const handleShare = useCallback(async () => {
        if (!state.data) return;

        const success = await copyShareLink({ text: state.data, type: state.type || undefined });
        if (success) {
            setShareStatus('copied');
            setTimeout(() => setShareStatus('idle'), 2000);
        }
    }, [state.data, state.type]);

    const hasResults = state.type !== null;

    const renderResults = () => {
        if (!state.type) return null;

        switch (state.type) {
            case 'json':
                return <JsonResult data={state.data} delay={0} />;
            case 'color':
                return <ColorResult data={state.data} delay={0} />;
            case 'timestamp':
                return <TimestampResult data={state.data} delay={0} />;
            case 'html':
                return <HtmlResult data={state.data} delay={0} />;
            case 'image':
                return state.file ? <ImageResult file={state.file} delay={0} /> : null;
            case 'css':
                return <CodeResult data={state.data} codeType="css" delay={0} />;
            case 'javascript':
                return <CodeResult data={state.data} codeType="javascript" delay={0} />;
            case 'jwt':
                return <JwtResult data={state.data} delay={0} />;
            case 'base64':
                return <Base64Result data={state.data} isEncoded={true} delay={0} />;
            case 'url':
                return <UrlResult data={state.data} isEncoded={true} delay={0} />;
            case 'number':
                return <NumberResult data={state.data} delay={0} />;
            case 'uuid':
            case 'text':
            default:
                return <TextResult data={state.data} delay={0} />;
        }
    };

    return (
        <PageTransition>
            <div className="flex flex-col min-h-screen w-full">
                {/* Header */}
                <header className="w-full px-4 py-4 sm:py-6">
                    <div className="max-w-4xl mx-auto flex items-center justify-between">
                        <motion.div
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="flex items-center gap-3"
                        >
                            <img
                                src="/alchemy-logo.avif"
                                alt="Alchemy"
                                className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg"
                            />
                            <div>
                                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-100">
                                    {t('app.title')}
                                </h1>
                                <p className="text-xs text-slate-500 hidden sm:block">
                                    {t('app.subtitle')}
                                </p>
                            </div>
                        </motion.div>

                        <div className="flex items-center gap-2">
                            {hasResults && state.data && (
                                <motion.button
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    onClick={handleShare}
                                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-300 ${shareStatus === 'copied'
                                        ? 'bg-amber-400 text-slate-900'
                                        : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                        }`}
                                >
                                    {shareStatus === 'copied' ? (
                                        <>
                                            <Check className="w-3.5 h-3.5" />
                                            {t('result.shareLink')}
                                        </>
                                    ) : (
                                        <>
                                            <Share2 className="w-3.5 h-3.5" />
                                            {t('result.share')}
                                        </>
                                    )}
                                </motion.button>
                            )}
                            <LanguageSelector />
                        </div>
                    </div>
                </header>

                {/* Main Content */}
                <main className={`flex-1 w-full px-4 flex flex-col ${hasResults ? '' : 'justify-center'}`}>
                    <div className="max-w-4xl mx-auto w-full">
                        {/* Omni Input */}
                        <OmniInput
                            onTextInput={handleTextInput}
                            onFileInput={handleFileInput}
                            hasResults={hasResults}
                            onClear={handleClear}
                        />

                        {/* Results Grid */}
                        <AnimatePresence mode="wait">
                            {hasResults && (
                                <motion.div
                                    key="results"
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-8"
                                >
                                    {/* Detection Badge */}
                                    <motion.div
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        className="col-span-full flex items-center justify-center gap-2 py-2"
                                    >
                                        <Sparkles className="w-4 h-4 text-amber-400" />
                                        <span className="text-sm text-slate-400">
                                            Detected:{' '}
                                            <span className="text-amber-400 font-semibold uppercase">
                                                {state.type}
                                            </span>
                                        </span>
                                    </motion.div>

                                    {/* Result Components */}
                                    {renderResults()}
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </div>
                </main>

                {/* Footer */}
                <Footer />
            </div>
        </PageTransition>
    );
}

export default AlchemyPage;
