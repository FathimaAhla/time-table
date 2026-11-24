/**
 * Colour helpers for timetable cells.
 *
 * Subjects can have their own `color_hex`. When one is missing we fall back to a
 * stable colour picked from a palette by subject id, so the same subject always
 * gets the same colour everywhere.
 */
const fallbackPalette = [
    '#6366f1',
    '#10b981',
    '#0ea5e9',
    '#f59e0b',
    '#ec4899',
    '#8b5cf6',
    '#ef4444',
    '#14b8a6',
    '#f97316',
    '#84cc16',
];

export function subjectColor(
    subject?: { id?: number; color_hex?: string | null } | null,
): string {
    if (subject?.color_hex && /^#[0-9a-f]{6}$/i.test(subject.color_hex)) {
        return subject.color_hex;
    }

    return fallbackPalette[(subject?.id ?? 0) % fallbackPalette.length];
}

/** "#6366f1" + 0.15 -> "rgba(99, 102, 241, 0.15)". rgba keeps PDF/PNG export (html2canvas) happy. */
export function tint(hex: string, alpha: number): string {
    const value = hex.replace('#', '');
    const r = parseInt(value.slice(0, 2), 16);
    const g = parseInt(value.slice(2, 4), 16);
    const b = parseInt(value.slice(4, 6), 16);

    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
