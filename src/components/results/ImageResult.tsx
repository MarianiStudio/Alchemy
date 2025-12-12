import { useState, useCallback, useEffect } from 'react';
import { motion } from 'motion/react';
import {
    Download, ImageIcon, Loader2, Copy, Check, Palette,
    Maximize2, FileDown, Info
} from 'lucide-react';
import { useI18n } from '../../lib/i18n';
import {
    loadImage,
    getImageMetadata,
    extractColors,
    compressImage,
    resizeImage,
    calculateResizeDimensions,
    formatFileSize,
    downloadBlob,
    type ImageMetadata,
    type ExtractedColor,
} from '../../lib/imageUtils';

interface ImageResultProps {
    file: File;
    delay?: number;
}

type ExportFormat = 'webp' | 'png' | 'jpeg';
type AspectRatio = '1:1' | '16:9' | '4:3' | '9:16' | 'original';

const ASPECT_RATIOS: { value: AspectRatio; label: string }[] = [
    { value: 'original', label: 'Original' },
    { value: '1:1', label: '1:1' },
    { value: '16:9', label: '16:9' },
    { value: '4:3', label: '4:3' },
    { value: '9:16', label: '9:16' },
];

export function ImageResult({ file, delay = 0 }: ImageResultProps) {
    const { t } = useI18n();

    // State
    const [preview, setPreview] = useState<string | null>(null);
    const [img, setImg] = useState<HTMLImageElement | null>(null);
    const [metadata, setMetadata] = useState<ImageMetadata | null>(null);
    const [colors, setColors] = useState<ExtractedColor[]>([]);
    const [quality, setQuality] = useState(80);
    const [compressedSize, setCompressedSize] = useState<number | null>(null);
    const [selectedRatio, setSelectedRatio] = useState<AspectRatio>('original');
    const [exporting, setExporting] = useState<string | null>(null);
    const [copiedId, setCopiedId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState<'export' | 'colors' | 'resize'>('export');

    // Load image on mount
    useEffect(() => {
        const load = async () => {
            try {
                const loadedImg = await loadImage(file);
                setImg(loadedImg);
                setMetadata(getImageMetadata(loadedImg, file));
                setColors(extractColors(loadedImg, 6));

                // Create preview
                const reader = new FileReader();
                reader.onload = (e) => setPreview(e.target?.result as string);
                reader.readAsDataURL(file);
            } catch (error) {
                console.error('Failed to load image:', error);
            }
        };
        load();
    }, [file]);

    // Update compressed size when quality changes
    useEffect(() => {
        if (!img) return;

        const updateSize = async () => {
            try {
                const { size } = await compressImage(img, quality, 'webp');
                setCompressedSize(size);
            } catch {
                setCompressedSize(null);
            }
        };

        const timeout = setTimeout(updateSize, 100);
        return () => clearTimeout(timeout);
    }, [img, quality]);

    // Handle copy
    const handleCopy = async (text: string, id: string) => {
        await navigator.clipboard.writeText(text);
        setCopiedId(id);
        setTimeout(() => setCopiedId(null), 1500);
    };

    // Handle export
    const handleExport = useCallback(async (format: ExportFormat) => {
        if (!img) return;
        setExporting(format);

        try {
            let dims = { width: img.naturalWidth, height: img.naturalHeight };

            if (selectedRatio !== 'original') {
                dims = calculateResizeDimensions(img.naturalWidth, img.naturalHeight, selectedRatio);
            }

            if (format === 'png') {
                const { blob } = await resizeImage(img, dims.width, dims.height, 'png');
                downloadBlob(blob, `alchemy-${Date.now()}.png`);
            } else {
                const { blob } = await compressImage(img, quality, format as 'webp' | 'jpeg');
                downloadBlob(blob, `alchemy-${Date.now()}.${format}`);
            }
        } catch (error) {
            console.error('Export failed:', error);
        } finally {
            setExporting(null);
        }
    }, [img, quality, selectedRatio]);



    const compressionSavings = metadata && compressedSize
        ? Math.round((1 - compressedSize / metadata.fileSize) * 100)
        : 0;

    return (
        <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ delay, duration: 0.3, ease: [0.34, 1.56, 0.64, 1] }}
            className="bg-slate-900/70 backdrop-blur-md border border-slate-800 rounded-2xl p-4 overflow-hidden col-span-full"
        >
            {/* Header */}
            <div className="flex items-center gap-2 mb-4">
                <ImageIcon className="w-4 h-4 text-amber-400" />
                <span className="text-sm font-medium text-slate-200">{t('image.title')}</span>
                <span className="text-xs text-slate-500 ml-auto truncate max-w-[150px]">{file.name}</span>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
                {/* Left: Preview + Metadata */}
                <div>
                    {/* Image Preview */}
                    {preview && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            className="mb-3 rounded-xl overflow-hidden bg-slate-950/50 border border-slate-800"
                        >
                            <img
                                src={preview}
                                alt="Preview"
                                className="max-w-full max-h-56 mx-auto object-contain"
                            />
                        </motion.div>
                    )}

                    {/* Metadata */}
                    {metadata && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: delay + 0.1 }}
                            className="flex flex-wrap items-center gap-2 text-xs text-slate-400 bg-slate-950/50 rounded-lg px-3 py-2"
                        >
                            <span className="flex items-center gap-1">
                                <Info className="w-3 h-3" />
                                {metadata.width}×{metadata.height}
                            </span>
                            <span className="text-slate-600">•</span>
                            <span>{formatFileSize(metadata.fileSize)}</span>
                            <span className="text-slate-600">•</span>
                            <span className="text-amber-400">{metadata.aspectRatio}</span>
                        </motion.div>
                    )}
                </div>

                {/* Right: Tools */}
                <div>
                    {/* Tab Buttons */}
                    <div className="flex gap-1 mb-3">
                        {[
                            { id: 'export', icon: FileDown, label: t('image.export') },
                            { id: 'colors', icon: Palette, label: t('image.colors') },
                            { id: 'resize', icon: Maximize2, label: t('image.resize') },
                        ].map((tab) => (
                            <button
                                key={tab.id}
                                onClick={() => setActiveTab(tab.id as typeof activeTab)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${activeTab === tab.id
                                    ? 'bg-amber-400 text-slate-900'
                                    : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                                    }`}
                            >
                                <tab.icon className="w-3 h-3" />
                                {tab.label}
                            </button>
                        ))}
                    </div>

                    {/* Export Tab */}
                    {activeTab === 'export' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-3"
                        >
                            {/* Quality Slider */}
                            <div className="bg-slate-950/50 rounded-lg p-3">
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-xs text-slate-400">{t('image.quality')}</span>
                                    <span className="text-xs font-mono text-amber-400">{quality}%</span>
                                </div>
                                <input
                                    type="range"
                                    min="10"
                                    max="100"
                                    value={quality}
                                    onChange={(e) => setQuality(Number(e.target.value))}
                                    className="w-full h-2 rounded-full bg-slate-700 appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-amber-400"
                                />
                                {metadata && compressedSize && (
                                    <div className="flex items-center justify-between mt-2 text-xs">
                                        <span className="text-slate-500">
                                            {formatFileSize(metadata.fileSize)} → {formatFileSize(compressedSize)}
                                        </span>
                                        <span className={`font-medium ${compressionSavings > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                                            {compressionSavings > 0 ? '-' : '+'}{Math.abs(compressionSavings)}%
                                        </span>
                                    </div>
                                )}
                            </div>

                            {/* Export Buttons */}
                            <div className="grid grid-cols-4 gap-2">
                                {(['webp', 'png', 'jpeg'] as ExportFormat[]).map((format) => (
                                    <button
                                        key={format}
                                        onClick={() => handleExport(format)}
                                        disabled={exporting !== null || !img}
                                        className={`flex items-center justify-center gap-1 px-2 py-2 rounded-lg text-xs font-semibold transition-all ${exporting === format
                                            ? 'bg-amber-400 text-slate-900'
                                            : 'bg-slate-800 text-slate-200 hover:bg-slate-700 disabled:opacity-50'
                                            }`}
                                    >
                                        {exporting === format ? (
                                            <Loader2 className="w-3 h-3 animate-spin" />
                                        ) : (
                                            <Download className="w-3 h-3" />
                                        )}
                                        <span className="uppercase">{format}</span>
                                    </button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Colors Tab */}
                    {activeTab === 'colors' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-2"
                        >
                            <p className="text-xs text-slate-500 mb-3">{t('image.colorsHint')}</p>
                            <div className="grid grid-cols-3 gap-2">
                                {colors.map((color, index) => (
                                    <motion.button
                                        key={color.hex}
                                        initial={{ opacity: 0, scale: 0.8 }}
                                        animate={{ opacity: 1, scale: 1 }}
                                        transition={{ delay: index * 0.05 }}
                                        onClick={() => handleCopy(color.hex, `color-${index}`)}
                                        className="group relative rounded-lg overflow-hidden transition-transform hover:scale-105"
                                    >
                                        <div
                                            className="h-12 w-full"
                                            style={{ backgroundColor: color.hex }}
                                        />
                                        <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                            {copiedId === `color-${index}` ? (
                                                <Check className="w-4 h-4 text-white" />
                                            ) : (
                                                <Copy className="w-4 h-4 text-white" />
                                            )}
                                        </div>
                                        <div className="bg-slate-950 px-2 py-1 text-center">
                                            <span className="text-[10px] font-mono text-slate-300">{color.hex}</span>
                                        </div>
                                    </motion.button>
                                ))}
                            </div>
                        </motion.div>
                    )}

                    {/* Resize Tab */}
                    {activeTab === 'resize' && (
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            className="space-y-3"
                        >
                            <p className="text-xs text-slate-500">{t('image.resizeHint')}</p>
                            <div className="flex flex-wrap gap-2">
                                {ASPECT_RATIOS.map((ratio) => (
                                    <button
                                        key={ratio.value}
                                        onClick={() => setSelectedRatio(ratio.value)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${selectedRatio === ratio.value
                                            ? 'bg-amber-400 text-slate-900'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                                            }`}
                                    >
                                        {ratio.label}
                                    </button>
                                ))}
                            </div>

                            {/* Frame Preview - shows image fitted inside target ratio frame */}
                            {selectedRatio !== 'original' && preview && (
                                <div className="space-y-2">
                                    {/* Preview Frame */}
                                    <div
                                        className="relative mx-auto rounded-lg overflow-hidden border-2 border-amber-400 bg-slate-950"
                                        style={{
                                            aspectRatio: selectedRatio.replace(':', '/'),
                                            maxWidth: '200px',
                                            maxHeight: '150px',
                                        }}
                                    >
                                        <img
                                            src={preview}
                                            alt="Preview"
                                            className="absolute inset-0 w-full h-full object-contain"
                                        />
                                        {/* Ratio badge */}
                                        <div className="absolute bottom-1 right-1 bg-amber-400 px-1.5 py-0.5 rounded text-[10px] text-slate-900 font-bold">
                                            {selectedRatio}
                                        </div>
                                    </div>

                                    {/* Info text */}
                                    <p className="text-[10px] text-slate-500 text-center">
                                        {t('image.framePreview')}
                                    </p>
                                </div>
                            )}
                        </motion.div>
                    )}
                </div>
            </div>
        </motion.div>
    );
}
