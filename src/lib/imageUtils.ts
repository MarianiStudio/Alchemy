/**
 * Image processing utilities for Alchemy
 */

export interface ImageMetadata {
    width: number;
    height: number;
    aspectRatio: string;
    fileSize: number;
    mimeType: string;
}

export interface ExtractedColor {
    hex: string;
    rgb: { r: number; g: number; b: number };
    percentage: number;
}

/**
 * Load image from file and return as HTMLImageElement
 */
export async function loadImage(file: File): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            resolve(img);
        };
        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image'));
        };

        img.src = url;
    });
}

/**
 * Load image from data URL
 */
export async function loadImageFromDataUrl(dataUrl: string): Promise<HTMLImageElement> {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = dataUrl;
    });
}

/**
 * Get image metadata
 */
export function getImageMetadata(img: HTMLImageElement, file: File): ImageMetadata {
    const gcd = (a: number, b: number): number => b === 0 ? a : gcd(b, a % b);
    const divisor = gcd(img.naturalWidth, img.naturalHeight);

    return {
        width: img.naturalWidth,
        height: img.naturalHeight,
        aspectRatio: `${img.naturalWidth / divisor}:${img.naturalHeight / divisor}`,
        fileSize: file.size,
        mimeType: file.type,
    };
}

/**
 * Extract dominant colors from image using k-means clustering
 */
export function extractColors(img: HTMLImageElement, colorCount: number = 6): ExtractedColor[] {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) return [];

    // Sample at reduced size for performance
    const sampleSize = 100;
    const scale = Math.min(sampleSize / img.naturalWidth, sampleSize / img.naturalHeight, 1);
    canvas.width = Math.floor(img.naturalWidth * scale);
    canvas.height = Math.floor(img.naturalHeight * scale);

    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
    const pixels = imageData.data;

    // Collect all colors
    const colorMap = new Map<string, number>();

    for (let i = 0; i < pixels.length; i += 4) {
        const r = Math.floor(pixels[i] / 16) * 16;
        const g = Math.floor(pixels[i + 1] / 16) * 16;
        const b = Math.floor(pixels[i + 2] / 16) * 16;
        const a = pixels[i + 3];

        if (a < 128) continue; // Skip transparent pixels

        const key = `${r},${g},${b}`;
        colorMap.set(key, (colorMap.get(key) || 0) + 1);
    }

    // Sort by frequency and take top colors
    const totalPixels = canvas.width * canvas.height;
    const sortedColors = Array.from(colorMap.entries())
        .sort((a, b) => b[1] - a[1])
        .slice(0, colorCount);

    return sortedColors.map(([key, count]) => {
        const [r, g, b] = key.split(',').map(Number);
        return {
            hex: `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`,
            rgb: { r, g, b },
            percentage: Math.round((count / totalPixels) * 100),
        };
    });
}

/**
 * Compress image with quality setting
 */
export async function compressImage(
    img: HTMLImageElement,
    quality: number,
    format: 'webp' | 'jpeg' = 'webp'
): Promise<{ blob: Blob; dataUrl: string; size: number }> {
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    ctx.drawImage(img, 0, 0);

    const mimeType = format === 'webp' ? 'image/webp' : 'image/jpeg';
    const dataUrl = canvas.toDataURL(mimeType, quality / 100);

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (b) => b ? resolve(b) : reject(new Error('Compression failed')),
            mimeType,
            quality / 100
        );
    });

    return { blob, dataUrl, size: blob.size };
}

/**
 * Resize image to specific dimensions
 */
export async function resizeImage(
    img: HTMLImageElement,
    width: number,
    height: number,
    format: 'webp' | 'png' | 'jpeg' = 'png'
): Promise<{ blob: Blob; dataUrl: string }> {
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('Canvas not supported');

    // Use high-quality scaling
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';

    ctx.drawImage(img, 0, 0, width, height);

    const mimeType = format === 'webp' ? 'image/webp'
        : format === 'png' ? 'image/png'
            : 'image/jpeg';

    const dataUrl = canvas.toDataURL(mimeType, 0.9);

    const blob = await new Promise<Blob>((resolve, reject) => {
        canvas.toBlob(
            (b) => b ? resolve(b) : reject(new Error('Resize failed')),
            mimeType,
            0.9
        );
    });

    return { blob, dataUrl };
}

/**
 * Calculate new dimensions maintaining aspect ratio
 */
export function calculateResizeDimensions(
    originalWidth: number,
    originalHeight: number,
    targetRatio: string
): { width: number; height: number } {
    const [ratioW, ratioH] = targetRatio.split(':').map(Number);

    if (!ratioW || !ratioH) {
        return { width: originalWidth, height: originalHeight };
    }

    const targetAspect = ratioW / ratioH;
    const currentAspect = originalWidth / originalHeight;

    if (currentAspect > targetAspect) {
        // Wider than target - crop width
        return {
            width: Math.round(originalHeight * targetAspect),
            height: originalHeight,
        };
    } else {
        // Taller than target - crop height
        return {
            width: originalWidth,
            height: Math.round(originalWidth / targetAspect),
        };
    }
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

/**
 * Download blob as file
 */
export function downloadBlob(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
}
