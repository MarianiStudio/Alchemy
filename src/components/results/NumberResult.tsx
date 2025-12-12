import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Hash } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { numberToAllBases, parseNumber } from '../../lib/transformers';

interface NumberResultProps {
    data: string;
    delay?: number;
}

export function NumberResult({ data, delay = 0 }: NumberResultProps) {
    const { t } = useI18n();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const value = parseNumber(data);

    if (value === null) {
        return null;
    }

    const formats = numberToAllBases(value);

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const items = [
        { id: 'decimal', label: t('number.decimal'), value: formats.decimal },
        { id: 'hex', label: t('number.hex'), value: formats.hex },
        { id: 'binary', label: t('number.binary'), value: formats.binary },
        { id: 'octal', label: t('number.octal'), value: formats.octal },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-4 overflow-hidden"
        >
            <div className="flex items-center gap-2 mb-4">
                <Hash className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-slate-200">{t('number.title')}</span>
            </div>

            {/* Large decimal display */}
            <motion.div
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: delay + 0.1 }}
                className="bg-gradient-to-r from-amber-400/10 to-amber-500/5 border border-amber-400/20 rounded-xl p-4 mb-4 text-center"
            >
                <div className="text-3xl font-bold text-amber-400 font-code">
                    {value.toLocaleString()}
                </div>
                <div className="text-xs text-slate-500 mt-1">Decimal</div>
            </motion.div>

            {/* All formats */}
            <div className="space-y-2">
                {items.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: delay + 0.15 + index * 0.05 }}
                        className="flex items-center justify-between bg-slate-950/50 rounded-lg px-3 py-2"
                    >
                        <span className="text-xs text-slate-400">{item.label}:</span>
                        <div className="flex items-center gap-2">
                            <code className="font-code text-xs text-slate-200">{item.value}</code>
                            <button
                                onClick={() => handleCopy(item.value, item.id)}
                                className={`p-1 rounded transition-all duration-300 ${copiedId === item.id
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
