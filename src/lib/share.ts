/**
 * Share link generation using Base64 URL encoding
 */

const MAX_SHARE_LENGTH = 4000; // URL length limit

/**
 * Encode string to Base64 (URL-safe)
 */
function toBase64Url(str: string): string {
    const base64 = btoa(unescape(encodeURIComponent(str)));
    return base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

/**
 * Decode Base64 URL to string
 */
function fromBase64Url(base64: string): string {
    const padded = base64.replace(/-/g, '+').replace(/_/g, '/');
    const padding = (4 - (padded.length % 4)) % 4;
    const withPadding = padded + '='.repeat(padding);
    return decodeURIComponent(escape(atob(withPadding)));
}

export interface ShareData {
    text: string;
    type?: string;
}

/**
 * Generate shareable link
 */
export function generateShareLink(data: ShareData): string | null {
    const json = JSON.stringify(data);

    if (json.length > MAX_SHARE_LENGTH) {
        return null; // Too large to share via URL
    }

    const encoded = toBase64Url(json);
    const baseUrl = window.location.origin + window.location.pathname;

    return `${baseUrl}?d=${encoded}`;
}

/**
 * Parse share link from URL
 */
export function parseShareLink(): ShareData | null {
    try {
        const params = new URLSearchParams(window.location.search);
        const encoded = params.get('d');

        if (!encoded) return null;

        const json = fromBase64Url(encoded);
        return JSON.parse(json) as ShareData;
    } catch {
        return null;
    }
}

/**
 * Copy share link to clipboard
 */
export async function copyShareLink(data: ShareData): Promise<boolean> {
    const link = generateShareLink(data);

    if (!link) {
        return false; // Content too large
    }

    try {
        await navigator.clipboard.writeText(link);
        return true;
    } catch {
        // Fallback for older browsers
        const textarea = document.createElement('textarea');
        textarea.value = link;
        textarea.style.position = 'fixed';
        textarea.style.opacity = '0';
        document.body.appendChild(textarea);
        textarea.select();

        try {
            document.execCommand('copy');
            document.body.removeChild(textarea);
            return true;
        } catch {
            document.body.removeChild(textarea);
            return false;
        }
    }
}

/**
 * Clear share data from URL without reload
 */
export function clearShareFromUrl(): void {
    const url = new URL(window.location.href);
    url.searchParams.delete('d');
    window.history.replaceState({}, '', url.toString());
}
