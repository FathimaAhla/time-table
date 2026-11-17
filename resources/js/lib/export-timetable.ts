import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

const COLOR_PROPS = [
    'color',
    'backgroundColor',
    'borderTopColor',
    'borderRightColor',
    'borderBottomColor',
    'borderLeftColor',
    'outlineColor',
] as const;

/**
 * html2canvas can't parse modern CSS color functions like oklch()/oklab(),
 * which Tailwind v4's default palette uses everywhere. Round-trip every
 * computed color through a canvas 2D context (browsers normalize that to
 * rgb/rgba) and bake it in as an inline style on the cloned document that
 * html2canvas actually rasterizes, so the live page is never touched.
 */
function flattenModernColors(clonedDoc: Document) {
    const probe = document.createElement('canvas').getContext('2d', { willReadFrequently: true });
    if (!probe) return;
    probe.canvas.width = 1;
    probe.canvas.height = 1;

    const cache = new Map<string, string | null>();

    // fillStyle's getter can just echo oklch()/oklab() back unchanged even though the
    // browser accepts it, so round-tripping through the getter doesn't normalize it.
    // Rasterizing a pixel and reading it back always yields real sRGB bytes, so do that
    // instead; a transparent (alpha 0) pixel means the source had alpha baked in oklch(... / a).
    const toRgb = (value: string): string | null => {
        if (!value || !/\b(oklch|oklab|lab|lch|color)\(/i.test(value)) return null;
        if (cache.has(value)) return cache.get(value)!;

        let result: string | null = null;
        try {
            probe.clearRect(0, 0, 1, 1);
            probe.fillStyle = value;
            probe.fillRect(0, 0, 1, 1);
            const [r, g, b, a] = probe.getImageData(0, 0, 1, 1).data;
            result = a === 255 ? `rgb(${r}, ${g}, ${b})` : `rgba(${r}, ${g}, ${b}, ${(a / 255).toFixed(3)})`;
        } catch {
            result = null;
        }

        cache.set(value, result);
        return result;
    };

    clonedDoc.querySelectorAll<HTMLElement>('*').forEach((el) => {
        const computed = clonedDoc.defaultView?.getComputedStyle(el);
        if (!computed) return;

        for (const prop of COLOR_PROPS) {
            const rgb = toRgb(computed[prop]);
            if (rgb) {
                el.style[prop] = rgb;
            }
        }
    });
}

async function renderToCanvas(elementId: string): Promise<HTMLCanvasElement> {
    const el = document.getElementById(elementId);
    if (!el) throw new Error(`Element #${elementId} not found for export`);

    return html2canvas(el, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true,
        onclone: (clonedDoc) => flattenModernColors(clonedDoc),
    });
}

export async function exportTimetableAsImage(elementId: string, filename: string, format: 'png' | 'jpeg' = 'png') {
    const canvas = await renderToCanvas(elementId);
    const link = document.createElement('a');
    link.download = `${filename}.${format === 'jpeg' ? 'jpg' : 'png'}`;
    link.href = canvas.toDataURL(format === 'jpeg' ? 'image/jpeg' : 'image/png', 0.95);
    link.click();
}

export async function exportTimetableAsPdf(elementId: string, filename: string) {
    const canvas = await renderToCanvas(elementId);
    const imgData = canvas.toDataURL('image/png', 1.0);

    const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';
    const pdf = new jsPDF({ orientation, unit: 'pt', format: 'a4' });

    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    const ratio = Math.min(pageWidth / canvas.width, pageHeight / canvas.height);
    const width = canvas.width * ratio;
    const height = canvas.height * ratio;

    pdf.addImage(imgData, 'PNG', (pageWidth - width) / 2, (pageHeight - height) / 2, width, height);
    pdf.save(`${filename}.pdf`);
}

/**
 * Export several timetables into one PDF, one per A4 page
 * (e.g. every teacher's timetable for printing and handing out).
 */
export async function exportManyAsPdf(elementIds: string[], filename: string, onProgress?: (done: number, total: number) => void) {
    let pdf: jsPDF | null = null;

    for (const [index, elementId] of elementIds.entries()) {
        const canvas = await renderToCanvas(elementId);
        const orientation = canvas.width > canvas.height ? 'landscape' : 'portrait';

        if (pdf === null) {
            pdf = new jsPDF({ orientation, unit: 'pt', format: 'a4' });
        } else {
            pdf.addPage('a4', orientation);
        }

        const pageWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 24;
        const ratio = Math.min((pageWidth - margin * 2) / canvas.width, (pageHeight - margin * 2) / canvas.height);
        const width = canvas.width * ratio;
        const height = canvas.height * ratio;

        pdf.addImage(canvas.toDataURL('image/png', 1.0), 'PNG', (pageWidth - width) / 2, margin, width, height);
        onProgress?.(index + 1, elementIds.length);
    }

    pdf?.save(`${filename}.pdf`);
}
