import { useState } from 'react';
import { motion } from 'motion/react';
import { Copy, Check, Key, AlertTriangle, CheckCircle } from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import { parseJwt, prettyPrintJson } from '../../lib/transformers';

interface JwtResultProps {
    data: string;
    delay?: number;
}

export function JwtResult({ data, delay = 0 }: JwtResultProps) {
    const { t } = useI18n();
    const [copiedId, setCopiedId] = useState<string | null>(null);

    const parsed = parseJwt(data);

    if (!parsed) {
        return null;
    }

    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    const headerJson = prettyPrintJson(parsed.header);
    const payloadJson = prettyPrintJson(parsed.payload);

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-4 overflow-hidden col-span-full"
        >
            <div className="flex items-center gap-2 mb-4">
                <Key className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-slate-200">{t('jwt.title')}</span>

                {/* Expiration Badge */}
                {parsed.isExpired !== undefined && (
                    <span className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full ml-auto ${parsed.isExpired
                            ? 'bg-red-500/20 text-red-400'
                            : 'bg-emerald-500/20 text-emerald-400'
                        }`}>
                        {parsed.isExpired ? (
                            <>
                                <AlertTriangle className="w-3 h-3" />
                                {t('jwt.expired')}
                            </>
                        ) : (
                            <>
                                <CheckCircle className="w-3 h-3" />
                                {t('jwt.valid')}
                            </>
                        )}
                    </span>
                )}
            </div>

            {/* Time Info */}
            {(parsed.expiresAt || parsed.issuedAt) && (
                <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
                    {parsed.issuedAt && (
                        <div className="bg-slate-950/50 rounded-lg px-3 py-2">
                            <span className="text-slate-500">{t('jwt.issuedAt')}:</span>
                            <span className="text-slate-300 ml-2">{parsed.issuedAt.toLocaleString()}</span>
                        </div>
                    )}
                    {parsed.expiresAt && (
                        <div className="bg-slate-950/50 rounded-lg px-3 py-2">
                            <span className="text-slate-500">{t('jwt.expiresAt')}:</span>
                            <span className={`ml-2 ${parsed.isExpired ? 'text-red-400' : 'text-slate-300'}`}>
                                {parsed.expiresAt.toLocaleString()}
                            </span>
                        </div>
                    )}
                </div>
            )}

            {/* Header & Payload */}
            <div className="grid md:grid-cols-2 gap-4">
                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">{t('jwt.header')}</span>
                        <button
                            onClick={() => handleCopy(headerJson, 'header')}
                            className={`p-1 rounded transition-all duration-300 ${copiedId === 'header'
                                    ? 'bg-amber-400 text-slate-900'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {copiedId === 'header' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                    </div>
                    <pre className="font-code text-xs text-slate-300 bg-slate-950/50 rounded-xl p-3 overflow-x-auto max-h-40 overflow-y-auto">
                        {headerJson}
                    </pre>
                </div>

                <div>
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-xs text-slate-400">{t('jwt.payload')}</span>
                        <button
                            onClick={() => handleCopy(payloadJson, 'payload')}
                            className={`p-1 rounded transition-all duration-300 ${copiedId === 'payload'
                                    ? 'bg-amber-400 text-slate-900'
                                    : 'text-slate-400 hover:text-slate-200'
                                }`}
                        >
                            {copiedId === 'payload' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                        </button>
                    </div>
                    <pre className="font-code text-xs text-slate-300 bg-slate-950/50 rounded-xl p-3 overflow-x-auto max-h-40 overflow-y-auto">
                        {payloadJson}
                    </pre>
                </div>
            </div>

            {/* Signature (truncated) */}
            <div className="mt-4">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-slate-400">{t('jwt.signature')}</span>
                    <button
                        onClick={() => handleCopy(parsed.signature, 'signature')}
                        className={`p-1 rounded transition-all duration-300 ${copiedId === 'signature'
                                ? 'bg-amber-400 text-slate-900'
                                : 'text-slate-400 hover:text-slate-200'
                            }`}
                    >
                        {copiedId === 'signature' ? <Check className="w-3 h-3" /> : <Copy className="w-3 h-3" />}
                    </button>
                </div>
                <div className="font-code text-xs text-slate-500 bg-slate-950/50 rounded-xl p-3 truncate">
                    {parsed.signature}
                </div>
            </div>
        </motion.div>
    );
}
