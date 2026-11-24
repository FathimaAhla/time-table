import { Palette } from 'lucide-react';
import { useColorful } from '@/hooks/use-colorful';

/** Normal / Colorful switch for timetable views. Exports follow the choice. */
export function ColorfulToggle() {
    const [colorful, setColorful] = useColorful();

    return (
        <div
            role="group"
            aria-label="Timetable style"
            className="inline-flex items-center rounded-md border bg-background p-0.5 text-sm"
        >
            {[
                { value: false, label: 'Normal' },
                { value: true, label: 'Colorful' },
            ].map((option) => (
                <button
                    key={option.label}
                    type="button"
                    onClick={() => setColorful(option.value)}
                    aria-pressed={colorful === option.value}
                    className={`inline-flex items-center gap-1.5 rounded px-3 py-1.5 font-medium transition ${colorful === option.value ? 'bg-indigo-600 text-white' : 'text-muted-foreground hover:text-foreground'}`}
                >
                    {option.value && <Palette className="size-3.5" />}
                    {option.label}
                </button>
            ))}
        </div>
    );
}
