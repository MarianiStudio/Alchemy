import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Clock } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { epochToHuman } from '../../lib/transformers';

interface TimestampResultProps {
    data: string | number;
    delay?: number;
}

export function TimestampResult({ data, delay = 0 }: TimestampResultProps) {
    const { t } = useI18n();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const formats = epochToHuman(data);

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const timeItems = [
        { id: 'local', label: t('timestamp.local'), value: formats.local },
        { id: 'utc', label: t('timestamp.utc'), value: formats.utc },
        { id: 'iso', label: t('timestamp.iso'), value: formats.iso },
        { id: 'relative', label: t('timestamp.relative'), value: formats.relative },
        { id: 'unix', label: 'Unix (s)', value: formats.unix.toString() },
        { id: 'unixMs', label: 'Unix (ms)', value: formats.unixMs.toString() },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-4 overflow-hidden"
        >
            <div className="flex items-center gap-2 mb-4">
                <Clock className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-slate-200">{t('timestamp.title')}</span>
            </div>

            {/* Large readable date */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.1 }}
                className="bg-gradient-to-r from-amber-400/10 to-amber-500/5 border border-amber-400/20 rounded-xl p-4 mb-4 text-center"
            >
                <div className="text-2xl font-semibold text-amber-400 mb-1">
                    {new Date(formats.unixMs).toLocaleDateString(undefined, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                    })}
                </div>
                <div className="text-lg text-slate-300">
                    {new Date(formats.unixMs).toLocaleTimeString(undefined, {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                    })}
                </div>
                <div className="text-sm text-slate-500 mt-1">{formats.relative}</div>
            </motion.div>

            {/* All formats */}
            <div className="space-y-2">
                {timeItems.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: delay + 0.15 + index * 0.05 }}
                        className="flex items-center justify-between bg-slate-950/50 rounded-lg px-3 py-2"
                    >
                        <span className="text-xs text-slate-400">{item.label}:</span>
                        <div className="flex items-center gap-2">
                            <code className="font-code text-xs text-slate-200 truncate max-w-[200px]">
                                {item.value}
                            </code>
                            <button
                                onClick={() => handleCopy(item.value, item.id)}
                                className={`p-1 rounded flex-shrink-0 transition-all duration-300 ${copiedId === item.id
                                        ? 'bg-amber-400 text-slate-900'
                                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                                    }`}
                            >
                                {copiedId === item.id ? (
                                    <Check className="w-3 h-3" />
                                ) : (
                                    <Copy className="w-3 h-3" />
                                )}
                            </button>
                        </div>
                    </motion.div>
                ))}
            </div>
        </motion.div>
    );
}
