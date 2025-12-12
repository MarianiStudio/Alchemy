import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Type, ArrowUp, ArrowDown, Heading } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { textStats, toUpperCase, toLowerCase, toTitleCase } from '../../lib/transformers';

interface TextResultProps {
    data: string;
    delay?: number;
}

export function TextResult({ data, delay = 0 }: TextResultProps) {
    const { t } = useI18n();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const stats = textStats(data);

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const transforms = [
        { id: 'upper', label: t('text.uppercase'), content: toUpperCase(data), icon: ArrowUp },
        { id: 'lower', label: t('text.lowercase'), content: toLowerCase(data), icon: ArrowDown },
        { id: 'title', label: t('text.titlecase'), content: toTitleCase(data), icon: Heading },
    ];

    const statItems = [
        { label: t('text.characters'), value: stats.characters },
        { label: t('text.words'), value: stats.words },
        { label: t('text.lines'), value: stats.lines },
    ];

    return (
        <>
            {/* Stats Card */}
            <motion.div
                initial={{ opacity: 0, y: 20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-4 overflow-hidden"
            >
                <div className="flex items-center gap-2 mb-4">
                    <Type className="w-4 h-4 text-amber-400" />
                    <span className="text-sm font-medium text-slate-200">{t('text.title')}</span>
                </div>

                <div className="grid grid-cols-3 gap-3">
                    {statItems.map((stat, index) => (
                        <motion.div
                            key={stat.label}
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: delay + 0.1 + index * 0.05 }}
                            className="bg-slate-950/50 rounded-xl p-3 text-center"
                        >
                            <div className="text-2xl font-bold text-amber-400 mb-1">
                                {stat.value.toLocaleString()}
                            </div>
                            <div className="text-[10px] uppercase tracking-wider text-slate-500">
                                {stat.label}
                            </div>
                        </motion.div>
                    ))}
                </div>
            </motion.div>

            {/* Transform Cards */}
            {transforms.map((transform, index) => (
                <motion.div
                    key={transform.id}
                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{ delay: delay + 0.15 + index * 0.1, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
                    className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-4 overflow-hidden"
                >
                    <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-2">
                            <transform.icon className="w-4 h-4 text-amber-400" />
                            <span className="text-sm font-medium text-slate-200">{transform.label}</span>
                        </div>
                        <button
                            onClick={() => handleCopy(transform.content, transform.id)}
                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all duration-300 ${copiedId === transform.id
                                    ? 'bg-amber-400 text-slate-900'
                                    : 'bg-slate-800 text-slate-200 hover:bg-slate-700'
                                }`}
                        >
                            {copiedId === transform.id ? (
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
                    <pre className="font-code text-xs text-slate-300 bg-slate-950/50 rounded-xl p-3 overflow-x-auto max-h-32 overflow-y-auto whitespace-pre-wrap">
                        {transform.content}
                    </pre>
                </motion.div>
            ))}
        </>
    );
}
