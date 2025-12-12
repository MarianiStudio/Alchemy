/**
 * The Alchemist - Auto-detection engine for input types
 */

export type DetectedType =
    | 'json'
    | 'html'
    | 'color'
    | 'timestamp'
    | 'css'
    | 'javascript'
    | 'text'
    | 'image'
    | 'base64'
    | 'url'
    | 'jwt'
    | 'number'
    | 'uuid';

export interface DetectionResult {
    type: DetectedType;
    confidence: number;
    raw: string;
    parsed?: unknown;
}

// Color patterns
const HEX_COLOR_REGEX = /^#([A-Fa-f0-9]{3}|[A-Fa-f0-9]{6}|[A-Fa-f0-9]{8})$/;
const RGB_COLOR_REGEX = /^rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(,\s*[\d.]+)?\s*\)$/i;
const HSL_COLOR_REGEX = /^hsla?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?\s*(,\s*[\d.]+)?\s*\)$/i;

// HTML pattern
const HTML_TAG_REGEX = /<\/?[a-z][\s\S]*?>/i;
const FULL_HTML_REGEX = /^[\s\S]*<[a-z][\s\S]*>[\s\S]*$/i;

// Epoch timestamp (10-13 digits)
const EPOCH_REGEX = /^\d{10,13}$/;

// Base64 pattern - must be at least 32 chars
const BASE64_REGEX = /^[A-Za-z0-9+/=]{32,}$/;
const BASE64_URL_SAFE_REGEX = /^[A-Za-z0-9_-]{32,}=*$/;

// URL encoded pattern (%XX)
const URL_ENCODED_REGEX = /%[0-9A-Fa-f]{2}/;

// JWT pattern (3 base64 parts separated by dots)
const JWT_REGEX = /^[A-Za-z0-9_-]+\.[A-Za-z0-9_-]+\.[A-Za-z0-9_-]*$/;

// UUID pattern
const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

// Number patterns (hex, binary, octal)
const HEX_NUMBER_REGEX = /^0x[0-9A-Fa-f]+$/;
const BINARY_REGEX = /^0b[01]+$/;
const OCTAL_REGEX = /^0o[0-7]+$/;

// Minified code patterns
const MINIFIED_JS_REGEX = /^[^\n]{200,}.*[;{}()].*$/;
const MINIFIED_CSS_REGEX = /^[^\n]{200,}.*[{}:;].*$/;

/**
 * Detect JWT tokens
 */
function detectJwt(input: string): DetectionResult | null {
    const trimmed = input.trim();

    if (!JWT_REGEX.test(trimmed)) {
        return null;
    }

    try {
        const parts = trimmed.split('.');
        if (parts.length !== 3) return null;

        // Try to decode header and payload
        const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

        if (header.alg || header.typ) {
            return {
                type: 'jwt',
                confidence: 1,
                raw: input,
                parsed: { header, payload, signature: parts[2] },
            };
        }
    } catch {
        return null;
    }

    return null;
}

/**
 * Detect UUID
 */
function detectUuid(input: string): DetectionResult | null {
    const trimmed = input.trim();

    if (UUID_REGEX.test(trimmed)) {
        return {
            type: 'uuid',
            confidence: 1,
            raw: input,
        };
    }

    return null;
}

/**
 * Detect Base64 encoded content
 */
function detectBase64(input: string): DetectionResult | null {
    const trimmed = input.trim();

    // Must be at least 32 chars and look like base64
    if (trimmed.length < 32) return null;

    if (!BASE64_REGEX.test(trimmed) && !BASE64_URL_SAFE_REGEX.test(trimmed)) {
        return null;
    }

    try {
        const decoded = atob(trimmed.replace(/-/g, '+').replace(/_/g, '/'));
        // Check if decoded content is printable (mostly ASCII)
        const printable = decoded.split('').filter(c => {
            const code = c.charCodeAt(0);
            return (code >= 32 && code <= 126) || code === 10 || code === 13 || code === 9;
        }).length;

        if (printable / decoded.length > 0.8) {
            return {
                type: 'base64',
                confidence: 0.85,
                raw: input,
                parsed: decoded,
            };
        }
    } catch {
        return null;
    }

    return null;
}

/**
 * Detect URL encoded content
 */
function detectUrlEncoded(input: string): DetectionResult | null {
    const trimmed = input.trim();

    // Must have URL encoding patterns
    const matches = trimmed.match(URL_ENCODED_REGEX);
    if (!matches) return null;

    // Count % occurrences
    const percentCount = (trimmed.match(/%/g) || []).length;
    if (percentCount < 2) return null;

    try {
        const decoded = decodeURIComponent(trimmed);
        if (decoded !== trimmed) {
            return {
                type: 'url',
                confidence: 0.9,
                raw: input,
                parsed: decoded,
            };
        }
    } catch {
        return null;
    }

    return null;
}

/**
 * Detect hex, binary, octal numbers
 */
function detectNumber(input: string): DetectionResult | null {
    const trimmed = input.trim();

    if (HEX_NUMBER_REGEX.test(trimmed)) {
        return {
            type: 'number',
            confidence: 1,
            raw: input,
            parsed: { base: 16, value: parseInt(trimmed, 16) },
        };
    }

    if (BINARY_REGEX.test(trimmed)) {
        return {
            type: 'number',
            confidence: 1,
            raw: input,
            parsed: { base: 2, value: parseInt(trimmed.slice(2), 2) },
        };
    }

    if (OCTAL_REGEX.test(trimmed)) {
        return {
            type: 'number',
            confidence: 1,
            raw: input,
            parsed: { base: 8, value: parseInt(trimmed.slice(2), 8) },
        };
    }

    return null;
}

/**
 * Detect if input is valid JSON
 */
function detectJson(input: string): DetectionResult | null {
    const trimmed = input.trim();
    if (!trimmed.startsWith('{') && !trimmed.startsWith('[')) {
        return null;
    }

    try {
        const parsed = JSON.parse(trimmed);
        return {
            type: 'json',
            confidence: 1,
            raw: input,
            parsed,
        };
    } catch {
        return null;
    }
}

/**
 * Detect if input is a color value
 */
function detectColor(input: string): DetectionResult | null {
    const trimmed = input.trim();

    if (HEX_COLOR_REGEX.test(trimmed)) {
        return { type: 'color', confidence: 1, raw: input };
    }

    if (RGB_COLOR_REGEX.test(trimmed)) {
        return { type: 'color', confidence: 1, raw: input };
    }

    if (HSL_COLOR_REGEX.test(trimmed)) {
        return { type: 'color', confidence: 1, raw: input };
    }

    return null;
}

/**
 * Detect if input is an epoch timestamp
 */
function detectTimestamp(input: string): DetectionResult | null {
    const trimmed = input.trim();

    if (EPOCH_REGEX.test(trimmed)) {
        const num = parseInt(trimmed, 10);
        const isSeconds = trimmed.length === 10 && num >= 0 && num <= 4102444800;
        const isMillis = trimmed.length === 13 && num >= 0 && num <= 4102444800000;

        if (isSeconds || isMillis) {
            return {
                type: 'timestamp',
                confidence: 0.9,
                raw: input,
                parsed: isMillis ? num : num * 1000,
            };
        }
    }

    return null;
}

/**
 * Detect if input is HTML
 */
function detectHtml(input: string): DetectionResult | null {
    const trimmed = input.trim();

    if (!HTML_TAG_REGEX.test(trimmed)) {
        return null;
    }

    const hasDoctype = /<!doctype/i.test(trimmed);
    const hasHtmlTag = /<html/i.test(trimmed);
    const hasBodyTag = /<body/i.test(trimmed);
    const hasDivTag = /<div/i.test(trimmed);
    const hasParagraph = /<p[\s>]/i.test(trimmed);
    const hasSpan = /<span/i.test(trimmed);
    const hasHeading = /<h[1-6]/i.test(trimmed);

    const indicators = [hasDoctype, hasHtmlTag, hasBodyTag, hasDivTag, hasParagraph, hasSpan, hasHeading];
    const score = indicators.filter(Boolean).length;

    if (score > 0 || FULL_HTML_REGEX.test(trimmed)) {
        return {
            type: 'html',
            confidence: Math.min(0.5 + score * 0.1, 1),
            raw: input,
        };
    }

    return null;
}

/**
 * Detect if input is minified CSS
 */
function detectCss(input: string): DetectionResult | null {
    const trimmed = input.trim();

    const hasCssSelectors = /[.#]?[a-z_-]+\s*\{/i.test(trimmed);
    const hasCssProperties = /:\s*[^;]+;/.test(trimmed);
    const isMinified = MINIFIED_CSS_REGEX.test(trimmed) && !trimmed.includes('\n');

    if (hasCssSelectors && hasCssProperties) {
        return {
            type: 'css',
            confidence: isMinified ? 0.9 : 0.7,
            raw: input,
        };
    }

    return null;
}

/**
 * Detect if input is minified JavaScript
 */
function detectJavaScript(input: string): DetectionResult | null {
    const trimmed = input.trim();

    const hasFunction = /function\s*\w*\s*\(|=>\s*\{|const\s+|let\s+|var\s+/.test(trimmed);
    const hasJsPatterns = /\)\s*\{|\}\s*\)|return\s+|if\s*\(|for\s*\(/.test(trimmed);
    const isMinified = MINIFIED_JS_REGEX.test(trimmed) && !trimmed.includes('\n');

    if ((hasFunction || hasJsPatterns) && isMinified) {
        return {
            type: 'javascript',
            confidence: 0.8,
            raw: input,
        };
    }

    return null;
}

/**
 * Fallback: plain text analysis
 */
function detectText(input: string): DetectionResult {
    return {
        type: 'text',
        confidence: 0.5,
        raw: input,
    };
}

/**
 * Main detection function - The Alchemist
 */
export function detect(input: string): DetectionResult {
    if (!input || typeof input !== 'string') {
        return detectText('');
    }

    // Priority order for detection
    const detectors = [
        detectJwt,        // JWT first (specific pattern)
        detectUuid,       // UUID detection
        detectJson,       // JSON
        detectColor,      // Colors
        detectTimestamp,  // Timestamps
        detectNumber,     // Hex/Binary/Octal numbers
        detectUrlEncoded, // URL encoded strings
        detectBase64,     // Base64 encoded
        detectHtml,       // HTML
        detectCss,        // CSS
        detectJavaScript, // JavaScript
    ];

    for (const detector of detectors) {
        const result = detector(input);
        if (result) {
            return result;
        }
    }

    return detectText(input);
}

/**
 * Detect file type from File object
 */
export function detectFileType(file: File): DetectedType {
    if (file.type.startsWith('image/')) {
        return 'image';
    }

    if (file.type === 'application/json' || file.name.endsWith('.json')) {
        return 'json';
    }

    if (file.type === 'text/html' || file.name.endsWith('.html') || file.name.endsWith('.htm')) {
        return 'html';
    }

    if (file.type === 'text/css' || file.name.endsWith('.css')) {
        return 'css';
    }

    if (file.type === 'text/javascript' || file.name.endsWith('.js') || file.name.endsWith('.ts')) {
        return 'javascript';
    }

    return 'text';
}
