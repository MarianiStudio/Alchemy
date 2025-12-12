import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Code } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { beautifyCss, beautifyJs } from '../../lib/transformers';
import type { DetectedType } from '../../lib/detector';

interface CodeResultProps {
    data: string;
    codeType: Extract<DetectedType, 'css' | 'javascript'>;
    delay?: number;
}

export function CodeResult({ data, codeType, delay = 0 }: CodeResultProps) {
    const { t } = useI18n();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const beautified = codeType === 'css' ? beautifyCss(data) : beautifyJs(data);
    const minified = data.trim();

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const results = [
        { id: 'beautified', label: t('code.beautified'), content: beautified },
        { id: 'minified', label: t('code.minified'), content: minified },
    ];

    return (
        <>
            {results.map((result, index) => (
                <motion.div
                    key={result.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: delay + index * 0.1, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                    className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-4 overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <Code className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-slate-200">{result.label}</span>
                            <span className="text-[10px] uppercase px-1.5 py-0.5 bg-slate-800 text-slate-400 rounded">
                                {codeType}
                            </span>
                        </div>
                        <button
                            onClick={() => handleCopy(result.content, result.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${copiedId === result.id
                                    ? 'bg-amber-400 text-slate-900'
                                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                }`}
                        >
                            {copiedId === result.id ? (
                                <>
                                    <Check className="w-3 h-3" />
                                    {t('result.copied')}
                                </>
                            ) : (
                                <>
                                    <Copy className="w-3 h-3" />
                                    {t('result.copy')}
                                </>
                            )}
                        </button>
                    </div>
                    <pre className="font-code text-xs text-slate-300 bg-slate-950/50 rounded-xl p-3 overflow-x-auto max-h-64 overflow-y-auto">
                        <code>{result.content}</code>
                    </pre>
                </motion.div>
            ))}
        </>
    );
}
