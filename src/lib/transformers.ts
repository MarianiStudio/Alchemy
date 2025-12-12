/**
 * Transformation functions for different data types
 */

// ============ JSON Transformers ============

/**
 * Pretty print JSON with indentation
 */
export function prettyPrintJson(input: string | object): string {
    try {
        const obj = typeof input === 'string' ? JSON.parse(input) : input;
        return JSON.stringify(obj, null, 2);
    } catch {
        return typeof input === 'string' ? input : JSON.stringify(input);
    }
}

/**
 * Minify JSON
 */
export function minifyJson(input: string | object): string {
    try {
        const obj = typeof input === 'string' ? JSON.parse(input) : input;
        return JSON.stringify(obj);
    } catch {
        return typeof input === 'string' ? input : JSON.stringify(input);
    }
}

/**
 * Generate TypeScript interface from JSON object
 */
export function jsonToTypeScript(input: string | object, interfaceName = 'Root'): string {
    try {
        const obj = typeof input === 'string' ? JSON.parse(input) : input;
        return generateInterface(obj, interfaceName);
    } catch {
        return '// Could not parse JSON';
    }
}

function generateInterface(obj: unknown, name: string, indent = ''): string {
    if (obj === null) return 'null';
    if (Array.isArray(obj)) {
        if (obj.length === 0) return 'unknown[]';
        const itemType = generateInterface(obj[0], `${name}Item`, indent);
        if (itemType.startsWith('interface')) {
            return itemType + `\n\ntype ${name} = ${name}Item[];`;
        }
        return `${itemType}[]`;
    }

    if (typeof obj === 'object') {
        const entries = Object.entries(obj as Record<string, unknown>);
        if (entries.length === 0) return 'Record<string, unknown>';

        const lines: string[] = [`interface ${name} {`];
        const nestedInterfaces: string[] = [];

        for (const [key, value] of entries) {
            const safeKey = /^[a-zA-Z_$][a-zA-Z0-9_$]*$/.test(key) ? key : `"${key}"`;
            const childName = key.charAt(0).toUpperCase() + key.slice(1);

            if (value === null) {
                lines.push(`${indent}  ${safeKey}: null;`);
            } else if (Array.isArray(value)) {
                if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
                    nestedInterfaces.push(generateInterface(value[0], childName, indent));
                    lines.push(`${indent}  ${safeKey}: ${childName}[];`);
                } else if (value.length > 0) {
                    lines.push(`${indent}  ${safeKey}: ${typeof value[0]}[];`);
                } else {
                    lines.push(`${indent}  ${safeKey}: unknown[];`);
                }
            } else if (typeof value === 'object') {
                nestedInterfaces.push(generateInterface(value, childName, indent));
                lines.push(`${indent}  ${safeKey}: ${childName};`);
            } else {
                lines.push(`${indent}  ${safeKey}: ${typeof value};`);
            }
        }

        lines.push(`${indent}}`);

        if (nestedInterfaces.length > 0) {
            return nestedInterfaces.join('\n\n') + '\n\n' + lines.join('\n');
        }
        return lines.join('\n');
    }

    return typeof obj;
}

// ============ Color Transformers ============

interface ColorRGB {
    r: number;
    g: number;
    b: number;
    a: number;
}

interface ColorHSL {
    h: number;
    s: number;
    l: number;
    a: number;
}

export interface ColorFormats {
    hex: string;
    hex8: string;
    rgb: string;
    rgba: string;
    hsl: string;
    hsla: string;
    tailwind: string;
    complementary: string;
    original: ColorRGB;
}

/**
 * Parse any color format to RGB
 */
function parseColor(input: string): ColorRGB | null {
    const trimmed = input.trim();

    // HEX
    const hexMatch = trimmed.match(/^#([A-Fa-f0-9]{3,8})$/);
    if (hexMatch) {
        const hex = hexMatch[1];
        let r: number, g: number, b: number, a = 1;

        if (hex.length === 3) {
            r = parseInt(hex[0] + hex[0], 16);
            g = parseInt(hex[1] + hex[1], 16);
            b = parseInt(hex[2] + hex[2], 16);
        } else if (hex.length === 6) {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
        } else if (hex.length === 8) {
            r = parseInt(hex.slice(0, 2), 16);
            g = parseInt(hex.slice(2, 4), 16);
            b = parseInt(hex.slice(4, 6), 16);
            a = parseInt(hex.slice(6, 8), 16) / 255;
        } else {
            return null;
        }

        return { r, g, b, a };
    }

    // RGB/RGBA
    const rgbMatch = trimmed.match(/^rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})\s*(?:,\s*([\d.]+))?\s*\)$/i);
    if (rgbMatch) {
        return {
            r: parseInt(rgbMatch[1], 10),
            g: parseInt(rgbMatch[2], 10),
            b: parseInt(rgbMatch[3], 10),
            a: rgbMatch[4] ? parseFloat(rgbMatch[4]) : 1,
        };
    }

    // HSL/HSLA
    const hslMatch = trimmed.match(/^hsla?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})%?\s*,\s*(\d{1,3})%?\s*(?:,\s*([\d.]+))?\s*\)$/i);
    if (hslMatch) {
        const hsl: ColorHSL = {
            h: parseInt(hslMatch[1], 10),
            s: parseInt(hslMatch[2], 10),
            l: parseInt(hslMatch[3], 10),
            a: hslMatch[4] ? parseFloat(hslMatch[4]) : 1,
        };
        return hslToRgb(hsl);
    }

    return null;
}

/**
 * Convert HSL to RGB
 */
function hslToRgb(hsl: ColorHSL): ColorRGB {
    const h = hsl.h / 360;
    const s = hsl.s / 100;
    const l = hsl.l / 100;

    let r: number, g: number, b: number;

    if (s === 0) {
        r = g = b = l;
    } else {
        const hue2rgb = (p: number, q: number, t: number) => {
            if (t < 0) t += 1;
            if (t > 1) t -= 1;
            if (t < 1 / 6) return p + (q - p) * 6 * t;
            if (t < 1 / 2) return q;
            if (t < 2 / 3) return p + (q - p) * (2 / 3 - t) * 6;
            return p;
        };

        const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        const p = 2 * l - q;
        r = hue2rgb(p, q, h + 1 / 3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1 / 3);
    }

    return {
        r: Math.round(r * 255),
        g: Math.round(g * 255),
        b: Math.round(b * 255),
        a: hsl.a,
    };
}

/**
 * Convert RGB to HSL
 */
function rgbToHsl(rgb: ColorRGB): ColorHSL {
    const r = rgb.r / 255;
    const g = rgb.g / 255;
    const b = rgb.b / 255;

    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    const l = (max + min) / 2;

    let h = 0;
    let s = 0;

    if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

        switch (max) {
            case r:
                h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
                break;
            case g:
                h = ((b - r) / d + 2) / 6;
                break;
            case b:
                h = ((r - g) / d + 4) / 6;
                break;
        }
    }

    return {
        h: Math.round(h * 360),
        s: Math.round(s * 100),
        l: Math.round(l * 100),
        a: rgb.a,
    };
}

/**
 * Find closest Tailwind color
 */
function findTailwindColor(rgb: ColorRGB): string {
    // Simplified Tailwind palette mapping
    const tailwindColors: Record<string, [number, number, number]> = {
        'slate-50': [248, 250, 252],
        'slate-100': [241, 245, 249],
        'slate-200': [226, 232, 240],
        'slate-300': [203, 213, 225],
        'slate-400': [148, 163, 184],
        'slate-500': [100, 116, 139],
        'slate-600': [71, 85, 105],
        'slate-700': [51, 65, 85],
        'slate-800': [30, 41, 59],
        'slate-900': [15, 23, 42],
        'slate-950': [2, 6, 23],
        'red-500': [239, 68, 68],
        'orange-500': [249, 115, 22],
        'amber-400': [251, 191, 36],
        'amber-500': [245, 158, 11],
        'yellow-500': [234, 179, 8],
        'lime-500': [132, 204, 22],
        'green-500': [34, 197, 94],
        'emerald-500': [16, 185, 129],
        'teal-500': [20, 184, 166],
        'cyan-500': [6, 182, 212],
        'sky-500': [14, 165, 233],
        'blue-500': [59, 130, 246],
        'indigo-500': [99, 102, 241],
        'violet-500': [139, 92, 246],
        'purple-500': [168, 85, 247],
        'fuchsia-500': [217, 70, 239],
        'pink-500': [236, 72, 153],
        'rose-500': [244, 63, 94],
        'white': [255, 255, 255],
        'black': [0, 0, 0],
    };

    let closest = 'slate-500';
    let minDistance = Infinity;

    for (const [name, [r, g, b]] of Object.entries(tailwindColors)) {
        const distance = Math.sqrt(
            Math.pow(rgb.r - r, 2) +
            Math.pow(rgb.g - g, 2) +
            Math.pow(rgb.b - b, 2)
        );

        if (distance < minDistance) {
            minDistance = distance;
            closest = name;
        }
    }

    return `bg-${closest}`;
}

/**
 * Get complementary color
 */
function getComplementary(rgb: ColorRGB): string {
    const comp = {
        r: 255 - rgb.r,
        g: 255 - rgb.g,
        b: 255 - rgb.b,
    };

    return `#${comp.r.toString(16).padStart(2, '0')}${comp.g.toString(16).padStart(2, '0')}${comp.b.toString(16).padStart(2, '0')}`;
}

/**
 * Convert color to all formats
 */
export function colorToFormats(input: string): ColorFormats | null {
    const rgb = parseColor(input);
    if (!rgb) return null;

    const hsl = rgbToHsl(rgb);

    const hex6 = `#${rgb.r.toString(16).padStart(2, '0')}${rgb.g.toString(16).padStart(2, '0')}${rgb.b.toString(16).padStart(2, '0')}`;
    const hex8 = `${hex6}${Math.round(rgb.a * 255).toString(16).padStart(2, '0')}`;

    return {
        hex: hex6,
        hex8,
        rgb: `rgb(${rgb.r}, ${rgb.g}, ${rgb.b})`,
        rgba: `rgba(${rgb.r}, ${rgb.g}, ${rgb.b}, ${rgb.a})`,
        hsl: `hsl(${hsl.h}, ${hsl.s}%, ${hsl.l}%)`,
        hsla: `hsla(${hsl.h}, ${hsl.s}%, ${hsl.l}%, ${hsl.a})`,
        tailwind: findTailwindColor(rgb),
        complementary: getComplementary(rgb),
        original: rgb,
    };
}

// ============ Timestamp Transformers ============

export interface TimestampFormats {
    local: string;
    utc: string;
    iso: string;
    relative: string;
    unix: number;
    unixMs: number;
}

/**
 * Convert epoch to human-readable formats
 */
export function epochToHuman(input: string | number): TimestampFormats {
    const num = typeof input === 'string' ? parseInt(input, 10) : input;
    const ms = num.toString().length === 10 ? num * 1000 : num;
    const date = new Date(ms);

    const now = Date.now();
    const diff = now - ms;

    let relative: string;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (diff < 0) {
        relative = 'in the future';
    } else if (seconds < 60) {
        relative = `${seconds} seconds ago`;
    } else if (minutes < 60) {
        relative = `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (hours < 24) {
        relative = `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else if (days < 30) {
        relative = `${days} day${days > 1 ? 's' : ''} ago`;
    } else {
        relative = date.toLocaleDateString();
    }

    return {
        local: date.toLocaleString(),
        utc: date.toUTCString(),
        iso: date.toISOString(),
        relative,
        unix: Math.floor(ms / 1000),
        unixMs: ms,
    };
}

// ============ HTML Transformers ============

/**
 * Strip HTML tags to get plain text
 */
export function htmlToPlainText(input: string): string {
    // Create a temporary element to parse HTML
    const div = document.createElement('div');
    div.innerHTML = input;

    // Get text content while preserving some structure
    const walker = document.createTreeWalker(div, NodeFilter.SHOW_TEXT | NodeFilter.SHOW_ELEMENT);

    const lines: string[] = [];
    let currentLine = '';

    while (walker.nextNode()) {
        const node = walker.currentNode;

        if (node.nodeType === Node.TEXT_NODE) {
            currentLine += node.textContent?.trim() ? node.textContent : '';
        } else if (node.nodeType === Node.ELEMENT_NODE) {
            const tagName = (node as Element).tagName.toLowerCase();
            if (['p', 'div', 'br', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'li'].includes(tagName)) {
                if (currentLine.trim()) {
                    lines.push(currentLine.trim());
                    currentLine = '';
                }
            }
        }
    }

    if (currentLine.trim()) {
        lines.push(currentLine.trim());
    }

    return lines.join('\n');
}

/**
 * Convert HTML to Markdown
 */
export function htmlToMarkdown(input: string): string {
    let md = input;

    // Headers
    md = md.replace(/<h1[^>]*>(.*?)<\/h1>/gi, '# $1\n\n');
    md = md.replace(/<h2[^>]*>(.*?)<\/h2>/gi, '## $1\n\n');
    md = md.replace(/<h3[^>]*>(.*?)<\/h3>/gi, '### $1\n\n');
    md = md.replace(/<h4[^>]*>(.*?)<\/h4>/gi, '#### $1\n\n');
    md = md.replace(/<h5[^>]*>(.*?)<\/h5>/gi, '##### $1\n\n');
    md = md.replace(/<h6[^>]*>(.*?)<\/h6>/gi, '###### $1\n\n');

    // Formatting
    md = md.replace(/<strong[^>]*>(.*?)<\/strong>/gi, '**$1**');
    md = md.replace(/<b[^>]*>(.*?)<\/b>/gi, '**$1**');
    md = md.replace(/<em[^>]*>(.*?)<\/em>/gi, '*$1*');
    md = md.replace(/<i[^>]*>(.*?)<\/i>/gi, '*$1*');
    md = md.replace(/<code[^>]*>(.*?)<\/code>/gi, '`$1`');

    // Links
    md = md.replace(/<a[^>]*href="([^"]*)"[^>]*>(.*?)<\/a>/gi, '[$2]($1)');

    // Images
    md = md.replace(/<img[^>]*src="([^"]*)"[^>]*alt="([^"]*)"[^>]*\/?>/gi, '![$2]($1)');
    md = md.replace(/<img[^>]*src="([^"]*)"[^>]*\/?>/gi, '![]($1)');

    // Lists
    md = md.replace(/<li[^>]*>(.*?)<\/li>/gi, '- $1\n');
    md = md.replace(/<\/?[uo]l[^>]*>/gi, '\n');

    // Paragraphs and breaks
    md = md.replace(/<p[^>]*>(.*?)<\/p>/gi, '$1\n\n');
    md = md.replace(/<br\s*\/?>/gi, '\n');
    md = md.replace(/<hr\s*\/?>/gi, '\n---\n');

    // Remove remaining tags
    md = md.replace(/<[^>]+>/g, '');

    // Decode HTML entities
    md = md.replace(/&nbsp;/g, ' ');
    md = md.replace(/&amp;/g, '&');
    md = md.replace(/&lt;/g, '<');
    md = md.replace(/&gt;/g, '>');
    md = md.replace(/&quot;/g, '"');

    // Clean up whitespace
    md = md.replace(/\n{3,}/g, '\n\n');

    return md.trim();
}

// ============ Code Beautifiers ============

/**
 * Beautify minified CSS
 */
export function beautifyCss(input: string): string {
    let css = input.trim();

    // Add newlines after braces and semicolons
    css = css.replace(/\{/g, ' {\n  ');
    css = css.replace(/\}/g, '\n}\n\n');
    css = css.replace(/;/g, ';\n  ');

    // Clean up extra whitespace
    css = css.replace(/\n  \n/g, '\n');
    css = css.replace(/\n{3,}/g, '\n\n');
    css = css.replace(/  +/g, '  ');

    return css.trim();
}

/**
 * Beautify minified JavaScript
 */
export function beautifyJs(input: string): string {
    let js = input.trim();
    let indent = 0;
    let result = '';
    let inString = false;
    let stringChar = '';

    for (let i = 0; i < js.length; i++) {
        const char = js[i];
        const prev = js[i - 1];

        // Track strings
        if ((char === '"' || char === "'" || char === '`') && prev !== '\\') {
            if (!inString) {
                inString = true;
                stringChar = char;
            } else if (char === stringChar) {
                inString = false;
            }
            result += char;
            continue;
        }

        if (inString) {
            result += char;
            continue;
        }

        // Handle braces and structure
        if (char === '{' || char === '[') {
            result += char + '\n' + '  '.repeat(++indent);
        } else if (char === '}' || char === ']') {
            result += '\n' + '  '.repeat(--indent) + char;
        } else if (char === ';') {
            result += ';\n' + '  '.repeat(indent);
        } else if (char === ',') {
            result += ',\n' + '  '.repeat(indent);
        } else {
            result += char;
        }
    }

    // Clean up
    result = result.replace(/\n +\n/g, '\n');
    result = result.replace(/\n{3,}/g, '\n\n');

    return result.trim();
}

// ============ Text Transformers ============

export interface TextStats {
    characters: number;
    charactersNoSpaces: number;
    words: number;
    lines: number;
    sentences: number;
}

/**
 * Analyze text and return statistics
 */
export function textStats(input: string): TextStats {
    const text = input || '';

    return {
        characters: text.length,
        charactersNoSpaces: text.replace(/\s/g, '').length,
        words: text.trim() ? text.trim().split(/\s+/).length : 0,
        lines: text.split(/\r?\n/).length,
        sentences: (text.match(/[.!?]+/g) || []).length || (text.trim() ? 1 : 0),
    };
}

/**
 * Transform text to uppercase
 */
export function toUpperCase(input: string): string {
    return input.toUpperCase();
}

/**
 * Transform text to lowercase
 */
export function toLowerCase(input: string): string {
    return input.toLowerCase();
}

/**
 * Transform text to title case
 */
export function toTitleCase(input: string): string {
    return input.replace(/\w\S*/g, (txt) =>
        txt.charAt(0).toUpperCase() + txt.substring(1).toLowerCase()
    );
}

/**
 * Transform text to camelCase
 */
export function toCamelCase(input: string): string {
    return input
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
        .replace(/^[A-Z]/, (char) => char.toLowerCase());
}

/**
 * Transform text to PascalCase
 */
export function toPascalCase(input: string): string {
    return input
        .replace(/[^a-zA-Z0-9]+(.)/g, (_, char) => char.toUpperCase())
        .replace(/^[a-z]/, (char) => char.toUpperCase());
}

/**
 * Transform text to snake_case
 */
export function toSnakeCase(input: string): string {
    return input
        .replace(/([a-z])([A-Z])/g, '$1_$2')
        .replace(/[^a-zA-Z0-9]+/g, '_')
        .replace(/^_|_$/g, '')
        .toLowerCase();
}

/**
 * Transform text to kebab-case
 */
export function toKebabCase(input: string): string {
    return input
        .replace(/([a-z])([A-Z])/g, '$1-$2')
        .replace(/[^a-zA-Z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .toLowerCase();
}

/**
 * Transform text to CONSTANT_CASE
 */
export function toConstantCase(input: string): string {
    return toSnakeCase(input).toUpperCase();
}

// ============ Base64 Transformers ============

/**
 * Encode string to Base64
 */
export function encodeBase64(input: string): string {
    try {
        return btoa(unescape(encodeURIComponent(input)));
    } catch {
        return btoa(input);
    }
}

/**
 * Decode Base64 to string
 */
export function decodeBase64(input: string): string {
    try {
        const normalized = input.replace(/-/g, '+').replace(/_/g, '/');
        return decodeURIComponent(escape(atob(normalized)));
    } catch {
        try {
            return atob(input);
        } catch {
            return 'Invalid Base64';
        }
    }
}

// ============ URL Transformers ============

/**
 * Encode string for URL
 */
export function encodeUrl(input: string): string {
    return encodeURIComponent(input);
}

/**
 * Decode URL encoded string
 */
export function decodeUrl(input: string): string {
    try {
        return decodeURIComponent(input);
    } catch {
        return input;
    }
}

/**
 * Encode full URL (preserves structure)
 */
export function encodeFullUrl(input: string): string {
    return encodeURI(input);
}

// ============ JWT Transformers ============

export interface JwtPayload {
    header: Record<string, unknown>;
    payload: Record<string, unknown>;
    signature: string;
    isExpired?: boolean;
    expiresAt?: Date;
    issuedAt?: Date;
}

/**
 * Parse JWT token
 */
export function parseJwt(token: string): JwtPayload | null {
    try {
        const parts = token.trim().split('.');
        if (parts.length !== 3) return null;

        const header = JSON.parse(atob(parts[0].replace(/-/g, '+').replace(/_/g, '/')));
        const payload = JSON.parse(atob(parts[1].replace(/-/g, '+').replace(/_/g, '/')));

        const result: JwtPayload = {
            header,
            payload,
            signature: parts[2],
        };

        // Check expiration
        if (payload.exp) {
            result.expiresAt = new Date(payload.exp * 1000);
            result.isExpired = Date.now() > payload.exp * 1000;
        }

        // Check issued at
        if (payload.iat) {
            result.issuedAt = new Date(payload.iat * 1000);
        }

        return result;
    } catch {
        return null;
    }
}

// ============ Number Base Transformers ============

export interface NumberFormats {
    decimal: string;
    hex: string;
    binary: string;
    octal: string;
}

/**
 * Convert number to all bases
 */
export function numberToAllBases(value: number): NumberFormats {
    return {
        decimal: value.toString(10),
        hex: '0x' + value.toString(16).toUpperCase(),
        binary: '0b' + value.toString(2),
        octal: '0o' + value.toString(8),
    };
}

/**
 * Parse number from any base
 */
export function parseNumber(input: string): number | null {
    const trimmed = input.trim();

    try {
        if (trimmed.startsWith('0x') || trimmed.startsWith('0X')) {
            return parseInt(trimmed, 16);
        }
        if (trimmed.startsWith('0b') || trimmed.startsWith('0B')) {
            return parseInt(trimmed.slice(2), 2);
        }
        if (trimmed.startsWith('0o') || trimmed.startsWith('0O')) {
            return parseInt(trimmed.slice(2), 8);
        }
        return parseInt(trimmed, 10);
    } catch {
        return null;
    }
}

// ============ UUID Generator ============

/**
 * Generate UUID v4
 */
export function generateUuid(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
        const r = (Math.random() * 16) | 0;
        const v = c === 'x' ? r : (r & 0x3) | 0x8;
        return v.toString(16);
    });
}

/**
 * Parse UUID and extract version
 */
export function parseUuid(uuid: string): { version: number; variant: string } | null {
    const cleaned = uuid.trim().toLowerCase();
    const match = cleaned.match(/^[0-9a-f]{8}-[0-9a-f]{4}-([0-9a-f])[0-9a-f]{3}-([0-9a-f])[0-9a-f]{3}-[0-9a-f]{12}$/);

    if (!match) return null;

    const version = parseInt(match[1], 16);
    const variantChar = parseInt(match[2], 16);

    let variant = 'Unknown';
    if ((variantChar & 0x8) === 0) variant = 'NCS';
    else if ((variantChar & 0xc) === 0x8) variant = 'RFC 4122';
    else if ((variantChar & 0xe) === 0xc) variant = 'Microsoft';
    else if ((variantChar & 0xe) === 0xe) variant = 'Future';

    return { version, variant };
}

// ============ Byte/Size Converter ============

export interface ByteFormats {
    bytes: string;
    kb: string;
    mb: string;
    gb: string;
}

/**
 * Convert bytes to all units
 */
export function bytesToAllUnits(bytes: number): ByteFormats {
    return {
        bytes: bytes.toLocaleString() + ' B',
        kb: (bytes / 1024).toFixed(2) + ' KB',
        mb: (bytes / (1024 * 1024)).toFixed(2) + ' MB',
        gb: (bytes / (1024 * 1024 * 1024)).toFixed(4) + ' GB',
    };
}

// ============ Lorem Ipsum Generator ============

const LOREM_WORDS = [
    'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing', 'elit',
    'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore', 'et', 'dolore',
    'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam', 'quis', 'nostrud',
    'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip', 'ex', 'ea', 'commodo',
    'consequat', 'duis', 'aute', 'irure', 'in', 'reprehenderit', 'voluptate',
    'velit', 'esse', 'cillum', 'fugiat', 'nulla', 'pariatur', 'excepteur', 'sint',
    'occaecat', 'cupidatat', 'non', 'proident', 'sunt', 'culpa', 'qui', 'officia',
    'deserunt', 'mollit', 'anim', 'id', 'est', 'laborum'
];

/**
 * Generate Lorem Ipsum text
 */
export function generateLorem(wordCount: number = 50): string {
    const words: string[] = [];
    for (let i = 0; i < wordCount; i++) {
        words.push(LOREM_WORDS[Math.floor(Math.random() * LOREM_WORDS.length)]);
    }

    // Capitalize first letter
    words[0] = words[0].charAt(0).toUpperCase() + words[0].slice(1);

    // Add periods every 8-15 words
    let sentenceLength = 0;
    const maxSentence = 8 + Math.floor(Math.random() * 7);

    return words.map((word, i) => {
        sentenceLength++;
        if (sentenceLength >= maxSentence && i < words.length - 1) {
            sentenceLength = 0;
            const next = words[i + 1];
            words[i + 1] = next.charAt(0).toUpperCase() + next.slice(1);
            return word + '.';
        }
        return word;
    }).join(' ') + '.';
}

