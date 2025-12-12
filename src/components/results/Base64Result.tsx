import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Binary, ArrowLeftRight } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { encodeBase64, decodeBase64 } from '../../lib/transformers';

interface Base64ResultProps {
    data: string;
    isEncoded?: boolean;
    delay?: number;
}

export function Base64Result({ data, isEncoded = true, delay = 0 }: Base64ResultProps) {
    const { t } = useI18n();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const decoded = isEncoded ? decodeBase64(data) : data;
    const encoded = isEncoded ? data : encodeBase64(data);

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const results = [
        { id: 'decoded', label: t('base64.decoded'), content: decoded },
        { id: 'encoded', label: t('base64.encoded'), content: encoded },
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
                            {result.id === 'decoded' ? (
                                <ArrowLeftRight className="w-4 h-4 text-amber-400" />
                            ) : (
                                <Binary className="w-4 h-4 text-amber-400" />
                            )}
                            <span className="text-sm font-medium text-slate-200">{result.label}</span>
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
                    <pre className="font-code text-xs text-slate-300 bg-slate-950/50 rounded-xl p-3 overflow-x-auto max-h-48 overflow-y-auto whitespace-pre-wrap break-all">
                        {result.content}
                    </pre>
                </motion.div>
            ))}
        </>
    );
}
