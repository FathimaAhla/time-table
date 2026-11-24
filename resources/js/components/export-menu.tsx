import { Download } from 'lucide-react';
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
    exportTimetableAsImage,
    exportTimetableAsPdf,
} from '@/lib/export-timetable';

export function ExportMenu({
    elementId,
    filename,
}: {
    elementId: string;
    filename: string;
}) {
    const [busy, setBusy] = useState(false);

    async function run(action: () => Promise<void>) {
        setBusy(true);
        try {
            await action();
        } finally {
            setBusy(false);
        }
    }

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" disabled={busy}>
                    <Download className="mr-1 size-4" />
                    Export
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                <DropdownMenuItem
                    onClick={() =>
                        run(() => exportTimetableAsPdf(elementId, filename))
                    }
                >
                    Download as PDF
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() =>
                        run(() =>
                            exportTimetableAsImage(elementId, filename, 'png'),
                        )
                    }
                >
                    Download as PNG
                </DropdownMenuItem>
                <DropdownMenuItem
                    onClick={() =>
                        run(() =>
                            exportTimetableAsImage(elementId, filename, 'jpeg'),
                        )
                    }
                >
                    Download as JPG
                </DropdownMenuItem>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
