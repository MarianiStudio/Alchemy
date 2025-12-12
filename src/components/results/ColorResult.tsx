import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Palette } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { colorToFormats } from '../../lib/transformers';

interface ColorResultProps {
    data: string;
    delay?: number;
}

export function ColorResult({ data, delay = 0 }: ColorResultProps) {
    const { t } = useI18n();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const formats = colorToFormats(data);

    if (!formats) {
        return null;
    }

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const colorItems = [
        { id: 'hex', label: t('color.hex'), value: formats.hex },
        { id: 'rgb', label: t('color.rgb'), value: formats.rgb },
        { id: 'hsl', label: t('color.hsl'), value: formats.hsl },
        { id: 'tailwind', label: t('color.tailwind'), value: formats.tailwind },
        { id: 'complementary', label: t('color.complementary'), value: formats.complementary },
    ];

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-4 overflow-hidden"
        >
            <div className="flex items-center gap-2 mb-4">
                <Palette className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-slate-200">{t('color.title')}</span>
            </div>

            {/* Color Preview */}
            <div className="flex gap-4 mb-4">
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: delay + 0.1, type: 'spring', stiffness: 400, damping: 20 }}
                    className="w-20 h-20 rounded-xl border-2 border-slate-700 shadow-lg"
                    style={{ backgroundColor: formats.hex }}
                />
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ delay: delay + 0.2, type: 'spring', stiffness: 400, damping: 20 }}
                    className="w-20 h-20 rounded-xl border-2 border-slate-700 shadow-lg relative overflow-hidden"
                    style={{ backgroundColor: formats.complementary }}
                >
                    <span className="absolute bottom-1 right-1 text-[8px] text-white/60 font-medium px-1 bg-black/30 rounded">
                        COMP
                    </span>
                </motion.div>
            </div>

            {/* Color Values */}
            <div className="space-y-2">
                {colorItems.map((item, index) => (
                    <motion.div
                        key={item.id}
                        initial={{ opacity: 0, x: -10 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: delay + 0.1 + index * 0.05 }}
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
