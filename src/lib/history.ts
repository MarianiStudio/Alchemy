/**
 * LocalStorage history management for last 5 pastes
 */

import type { DetectedType } from './detector';

export interface HistoryItem {
    id: string;
    type: DetectedType;
    preview: string;
    timestamp: number;
    raw: string;
}

const HISTORY_KEY = 'alchemy_history';
const MAX_ITEMS = 5;
const MAX_RAW_LENGTH = 10000; // Limit stored raw content

/**
 * Generate unique ID
 */
function generateId(): string {
    return `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
}

/**
 * Create preview string from raw input
 */
function createPreview(raw: string, type: DetectedType): string {
    const maxLength = 60;
    let preview = raw.trim().replace(/\s+/g, ' ');

    if (type === 'json') {
        try {
            const parsed = JSON.parse(raw);
            if (typeof parsed === 'object' && parsed !== null) {
                const keys = Object.keys(parsed);
                preview = `{ ${keys.slice(0, 3).join(', ')}${keys.length > 3 ? '...' : ''} }`;
            }
        } catch {
            // Keep original preview
        }
    } else if (type === 'color') {
        preview = raw.trim();
    } else if (type === 'timestamp') {
        const num = parseInt(raw.trim(), 10);
        const ms = raw.length === 10 ? num * 1000 : num;
        preview = new Date(ms).toLocaleString();
    }

    if (preview.length > maxLength) {
        preview = preview.slice(0, maxLength - 3) + '...';
    }

    return preview;
}

/**
 * Get history from localStorage
 */
export function getHistory(): HistoryItem[] {
    try {
        const stored = localStorage.getItem(HISTORY_KEY);
        if (!stored) return [];
        return JSON.parse(stored) as HistoryItem[];
    } catch {
        return [];
    }
}

/**
 * Add item to history
 */
export function addToHistory(raw: string, type: DetectedType): HistoryItem {
    const history = getHistory();

    // Check for duplicates (same raw content)
    const existingIndex = history.findIndex(
        (item) => item.raw === raw.slice(0, MAX_RAW_LENGTH)
    );

    if (existingIndex !== -1) {
        // Move existing item to top
        const [existing] = history.splice(existingIndex, 1);
        existing.timestamp = Date.now();
        history.unshift(existing);
    } else {
        const newItem: HistoryItem = {
            id: generateId(),
            type,
            preview: createPreview(raw, type),
            timestamp: Date.now(),
            raw: raw.slice(0, MAX_RAW_LENGTH),
        };

        history.unshift(newItem);
    }

    // Keep only last MAX_ITEMS
    const trimmed = history.slice(0, MAX_ITEMS);

    try {
        localStorage.setItem(HISTORY_KEY, JSON.stringify(trimmed));
    } catch {
        // Storage full - clear and try again
        localStorage.removeItem(HISTORY_KEY);
        try {
            localStorage.setItem(HISTORY_KEY, JSON.stringify([trimmed[0]]));
        } catch {
            // Ignore if still fails
        }
    }

    return trimmed[0];
}

/**
 * Remove item from history
 */
export function removeFromHistory(id: string): void {
    const history = getHistory();
    const filtered = history.filter((item) => item.id !== id);
    localStorage.setItem(HISTORY_KEY, JSON.stringify(filtered));
}

/**
 * Clear all history
 */
export function clearHistory(): void {
    localStorage.removeItem(HISTORY_KEY);
}

/**
 * Get item by ID
 */
export function getHistoryItem(id: string): HistoryItem | null {
    const history = getHistory();
    return history.find((item) => item.id === id) ?? null;
}
