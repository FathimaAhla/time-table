import { Head, Link, usePage } from '@inertiajs/react';
import { CalendarDays, Coffee, Eraser, GripVertical, Plus, RotateCcw, Sparkles, Trash2, Wand2, X } from 'lucide-react';
import { useMemo, useState } from 'react';
import { ExportMenu } from '@/components/export-menu';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dashboard, home, login, register } from '@/routes';

type PlaygroundSubject = { id: string; name: string; teacher: string; color: string };

type PlaygroundRow = { id: string; kind: 'period' | 'break'; label: string; start: string; end: string };

type DragPayload = { source: 'palette'; subjectId: string } | { source: 'cell'; cellKey: string };

const ALL_DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

const COLORS = ['#6366f1', '#0ea5e9', '#10b981', '#f59e0b', '#ef4444', '#ec4899', '#8b5cf6', '#14b8a6', '#f97316', '#84cc16', '#64748b', '#06b6d4'];

const SAMPLE_SUBJECTS: Array<Omit<PlaygroundSubject, 'id'>> = [
    { name: 'Mathematics', teacher: 'Mr. Perera', color: '#6366f1' },
    { name: 'Science', teacher: 'Ms. Fernando', color: '#10b981' },
    { name: 'English', teacher: 'Mrs. Silva', color: '#0ea5e9' },
    { name: 'History', teacher: 'Mr. Jayasuriya', color: '#f59e0b' },
    { name: 'ICT', teacher: 'Ms. Nazeer', color: '#8b5cf6' },
    { name: 'Art', teacher: 'Mr. Kumar', color: '#ec4899' },
    { name: 'Physical Ed.', teacher: 'Coach Raj', color: '#ef4444' },
];

let idCounter = 0;
const newId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${(idCounter++).toString(36)}`;

function addMinutes(time: string, minutes: number): string {
    const [hours, mins] = time.split(':').map(Number);
    const total = hours * 60 + mins + minutes;

    return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function buildRows(startTime: string, periodMinutes: number, periodCount: number, breakAfter: number, breakMinutes: number): PlaygroundRow[] {
    const rows: PlaygroundRow[] = [];
    let cursor = startTime;

    for (let period = 1; period <= periodCount; period++) {
        const end = addMinutes(cursor, periodMinutes);
        rows.push({ id: newId('row'), kind: 'period', label: `Period ${period}`, start: cursor, end });
        cursor = end;

        if (period === breakAfter && period !== periodCount) {
            const breakEnd = addMinutes(cursor, breakMinutes);
            rows.push({ id: newId('row'), kind: 'break', label: 'Interval', start: cursor, end: breakEnd });
            cursor = breakEnd;
        }
    }

    return rows;
}

export default function Playground() {
    const { auth } = usePage().props;

    const [title, setTitle] = useState('My Class Timetable');
    const [subtitle, setSubtitle] = useState('Grade 10 - A · Term 1');
    const [days, setDays] = useState<string[]>(ALL_DAYS.slice(0, 5));
    const [rows, setRows] = useState<PlaygroundRow[]>(() => buildRows('07:50', 40, 8, 4, 20));
    const [subjects, setSubjects] = useState<PlaygroundSubject[]>([]);
    const [cells, setCells] = useState<Record<string, string>>({});
    const [selectedSubjectId, setSelectedSubjectId] = useState<string | null>(null);
    const [hoverCell, setHoverCell] = useState<string | null>(null);

    const [newSubjectName, setNewSubjectName] = useState('');
    const [newSubjectTeacher, setNewSubjectTeacher] = useState('');

    const [startTime, setStartTime] = useState('07:50');
    const [periodMinutes, setPeriodMinutes] = useState(40);
    const [periodCount, setPeriodCount] = useState(8);
    const [breakAfter, setBreakAfter] = useState(4);
    const [breakMinutes, setBreakMinutes] = useState(20);

    const subjectsById = useMemo(() => new Map(subjects.map((subject) => [subject.id, subject])), [subjects]);

    const usage = useMemo(() => {
        const counts = new Map<string, number>();
        Object.values(cells).forEach((subjectId) => counts.set(subjectId, (counts.get(subjectId) ?? 0) + 1));

        return counts;
    }, [cells]);

    const periodRows = rows.filter((row) => row.kind === 'period');
    const filledCells = Object.keys(cells).filter((key) => days.includes(key.split('|')[0])).length;
    const totalCells = periodRows.length * days.length;

    function addSubject(e: React.FormEvent) {
        e.preventDefault();

        if (!newSubjectName.trim()) {
            return;
        }

        setSubjects((prev) => [
            ...prev,
            { id: newId('subject'), name: newSubjectName.trim(), teacher: newSubjectTeacher.trim(), color: COLORS[prev.length % COLORS.length] },
        ]);
        setNewSubjectName('');
        setNewSubjectTeacher('');
    }

    function removeSubject(subjectId: string) {
        setSubjects((prev) => prev.filter((subject) => subject.id !== subjectId));
        setCells((prev) => Object.fromEntries(Object.entries(prev).filter(([, id]) => id !== subjectId)));
        setSelectedSubjectId((current) => (current === subjectId ? null : current));
    }

    function updateSubject(subjectId: string, changes: Partial<PlaygroundSubject>) {
        setSubjects((prev) => prev.map((subject) => (subject.id === subjectId ? { ...subject, ...changes } : subject)));
    }

    function loadSamples() {
        setSubjects(SAMPLE_SUBJECTS.map((subject) => ({ ...subject, id: newId('subject') })));
        setCells({});
    }

    function autoFill() {
        if (subjects.length === 0) {
            return;
        }

        const filled: Record<string, string> = {};
        let index = 0;

        days.forEach((day, dayIndex) => {
            periodRows.forEach((row, rowIndex) => {
                filled[`${day}|${row.id}`] = subjects[(index + dayIndex * 2 + rowIndex) % subjects.length].id;
                index++;
            });
        });
        setCells(filled);
    }

    function rebuildRows() {
        setRows(buildRows(startTime, periodMinutes, periodCount, breakAfter, breakMinutes));
        setCells({});
    }

    function toggleDay(day: string) {
        setDays((prev) => (prev.includes(day) ? prev.filter((d) => d !== day) : ALL_DAYS.filter((d) => d === day || prev.includes(d))));
    }

    function updateRow(rowId: string, changes: Partial<PlaygroundRow>) {
        setRows((prev) => prev.map((row) => (row.id === rowId ? { ...row, ...changes } : row)));
    }

    function startDrag(e: React.DragEvent, payload: DragPayload) {
        e.dataTransfer.setData('application/json', JSON.stringify(payload));
        e.dataTransfer.effectAllowed = 'copyMove';
    }

    function readPayload(e: React.DragEvent): DragPayload | null {
        try {
            return JSON.parse(e.dataTransfer.getData('application/json')) as DragPayload;
        } catch {
            return null;
        }
    }

    function dropOnCell(e: React.DragEvent, cellKey: string) {
        e.preventDefault();
        setHoverCell(null);
        const payload = readPayload(e);

        if (!payload) {
            return;
        }

        setCells((prev) => {
            const next = { ...prev };

            if (payload.source === 'palette') {
                next[cellKey] = payload.subjectId;
            } else if (payload.cellKey !== cellKey) {
                const moving = prev[payload.cellKey];
                const target = prev[cellKey];
                next[cellKey] = moving;

                if (target) {
                    next[payload.cellKey] = target;
                } else {
                    delete next[payload.cellKey];
                }
            }

            return next;
        });
    }

    function dropOnTrash(e: React.DragEvent) {
        e.preventDefault();
        const payload = readPayload(e);

        if (payload?.source === 'cell') {
            setCells((prev) => {
                const next = { ...prev };
                delete next[payload.cellKey];

                return next;
            });
        }
    }

    function clickCell(cellKey: string) {
        if (selectedSubjectId) {
            setCells((prev) => ({ ...prev, [cellKey]: selectedSubjectId }));

            return;
        }

        if (cells[cellKey]) {
            setCells((prev) => {
                const next = { ...prev };
                delete next[cellKey];

                return next;
            });
        }
    }

    return (
        <>
            <Head title="Timetable Maker" />
            <div className="min-h-screen bg-gradient-to-b from-indigo-50/60 via-background to-background dark:from-indigo-950/30">
                <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
                    <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-4 py-3">
                        <Link href={home()} className="flex items-center gap-2 font-semibold">
                            <span className="rounded-lg bg-indigo-600 p-1.5 text-white">
                                <CalendarDays className="size-4" />
                            </span>
                            Timetable Maker
                        </Link>
                        <nav className="flex items-center gap-2 text-sm">
                            {auth.user ? (
                                <Link href={dashboard()} className="rounded-md border px-3 py-1.5 hover:bg-muted">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()} className="rounded-md px-3 py-1.5 hover:bg-muted">
                                        Log in
                                    </Link>
                                    <Link href={register()} className="rounded-md bg-indigo-600 px-3 py-1.5 text-white hover:bg-indigo-700">
                                        Get started
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <main className="mx-auto max-w-7xl px-4 py-6">
                    <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Build a timetable in minutes</h1>
                            <p className="mt-1 text-sm text-muted-foreground">
                                Add subjects, then drag them onto the grid. Drag a filled cell to move or swap it. On a phone, tap a subject then tap
                                cells.
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="rounded-full bg-amber-100 px-3 py-1 text-xs font-medium text-amber-900 dark:bg-amber-900/40 dark:text-amber-200">
                                Nothing is saved. Refreshing the page clears it, so download it first.
                            </span>
                            <ExportMenu elementId="playground-timetable" filename={title || 'timetable'} />
                        </div>
                    </div>

                    <div className="grid gap-6 lg:grid-cols-[300px_1fr]">
                        <aside className="space-y-4">
                            <section className="rounded-xl border bg-card p-4">
                                <h2 className="mb-3 flex items-center justify-between text-sm font-semibold">
                                    Subjects
                                    <button type="button" onClick={loadSamples} className="inline-flex items-center gap-1 text-xs font-normal text-primary hover:underline">
                                        <Sparkles className="size-3" /> Load samples
                                    </button>
                                </h2>
                                <form onSubmit={addSubject} className="mb-3 space-y-2">
                                    <Input placeholder="Subject (e.g. Mathematics)" value={newSubjectName} onChange={(e) => setNewSubjectName(e.target.value)} />
                                    <div className="flex gap-2">
                                        <Input placeholder="Teacher (optional)" value={newSubjectTeacher} onChange={(e) => setNewSubjectTeacher(e.target.value)} />
                                        <Button type="submit" size="icon" title="Add subject">
                                            <Plus className="size-4" />
                                        </Button>
                                    </div>
                                </form>

                                {subjects.length === 0 ? (
                                    <p className="rounded-lg border border-dashed p-4 text-center text-xs text-muted-foreground">
                                        No subjects yet. Add one above or load the samples.
                                    </p>
                                ) : (
                                    <ul className="space-y-2">
                                        {subjects.map((subject) => (
                                            <li
                                                key={subject.id}
                                                draggable
                                                onDragStart={(e) => startDrag(e, { source: 'palette', subjectId: subject.id })}
                                                onClick={() => setSelectedSubjectId((current) => (current === subject.id ? null : subject.id))}
                                                className={`group flex cursor-grab items-center gap-2 rounded-lg border-l-4 bg-muted/40 p-2 text-sm transition active:cursor-grabbing ${
                                                    selectedSubjectId === subject.id ? 'ring-2 ring-primary' : 'hover:bg-muted'
                                                }`}
                                                style={{ borderLeftColor: subject.color }}
                                            >
                                                <GripVertical className="size-4 shrink-0 text-muted-foreground" />
                                                <div className="min-w-0 flex-1">
                                                    <p className="truncate font-medium">{subject.name}</p>
                                                    {subject.teacher && <p className="truncate text-xs text-muted-foreground">{subject.teacher}</p>}
                                                </div>
                                                <span className="rounded bg-background px-1.5 text-xs tabular-nums text-muted-foreground" title="Periods per week">
                                                    {usage.get(subject.id) ?? 0}
                                                </span>
                                                <input
                                                    type="color"
                                                    value={subject.color}
                                                    onClick={(e) => e.stopPropagation()}
                                                    onChange={(e) => updateSubject(subject.id, { color: e.target.value })}
                                                    className="size-5 cursor-pointer rounded border-0 bg-transparent p-0"
                                                    title="Change colour"
                                                />
                                                <button
                                                    type="button"
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        removeSubject(subject.id);
                                                    }}
                                                    className="text-muted-foreground opacity-0 transition group-hover:opacity-100 hover:text-destructive"
                                                    title="Remove subject"
                                                >
                                                    <X className="size-4" />
                                                </button>
                                            </li>
                                        ))}
                                    </ul>
                                )}

                                {selectedSubjectId && (
                                    <p className="mt-3 rounded-lg bg-primary/10 p-2 text-xs text-primary">
                                        Painting with <strong>{subjectsById.get(selectedSubjectId)?.name}</strong>. Tap cells to fill them, or tap the
                                        subject again to stop.
                                    </p>
                                )}
                            </section>

                            <section className="rounded-xl border bg-card p-4">
                                <h2 className="mb-3 text-sm font-semibold">School days</h2>
                                <div className="flex flex-wrap gap-1.5">
                                    {ALL_DAYS.map((day) => (
                                        <button
                                            key={day}
                                            type="button"
                                            onClick={() => toggleDay(day)}
                                            className={`rounded-full border px-2.5 py-1 text-xs transition ${
                                                days.includes(day) ? 'border-indigo-600 bg-indigo-600 text-white' : 'hover:bg-muted'
                                            }`}
                                        >
                                            {day.slice(0, 3)}
                                        </button>
                                    ))}
                                </div>
                            </section>

                            <section className="rounded-xl border bg-card p-4">
                                <h2 className="mb-3 text-sm font-semibold">Bell schedule</h2>
                                <div className="grid grid-cols-2 gap-2 text-xs">
                                    <label className="grid gap-1">
                                        Day starts
                                        <Input type="time" value={startTime} onChange={(e) => setStartTime(e.target.value)} />
                                    </label>
                                    <label className="grid gap-1">
                                        Period (min)
                                        <Input type="number" min={10} max={120} value={periodMinutes} onChange={(e) => setPeriodMinutes(Number(e.target.value) || 40)} />
                                    </label>
                                    <label className="grid gap-1">
                                        Periods / day
                                        <Input type="number" min={1} max={14} value={periodCount} onChange={(e) => setPeriodCount(Math.min(14, Number(e.target.value) || 1))} />
                                    </label>
                                    <label className="grid gap-1">
                                        Break after period
                                        <Input type="number" min={0} max={14} value={breakAfter} onChange={(e) => setBreakAfter(Number(e.target.value) || 0)} />
                                    </label>
                                    <label className="col-span-2 grid gap-1">
                                        Break length (min)
                                        <Input type="number" min={5} max={90} value={breakMinutes} onChange={(e) => setBreakMinutes(Number(e.target.value) || 15)} />
                                    </label>
                                </div>
                                <Button type="button" variant="outline" size="sm" className="mt-3 w-full" onClick={rebuildRows}>
                                    <RotateCcw className="mr-1 size-3.5" /> Rebuild periods (clears grid)
                                </Button>
                            </section>

                            <div className="grid grid-cols-2 gap-2">
                                <Button type="button" variant="secondary" onClick={autoFill} disabled={subjects.length === 0}>
                                    <Wand2 className="mr-1 size-4" /> Auto-fill
                                </Button>
                                <Button type="button" variant="outline" onClick={() => setCells({})}>
                                    <Eraser className="mr-1 size-4" /> Clear grid
                                </Button>
                            </div>
                        </aside>

                        <section className="min-w-0 space-y-3">
                            <div className="flex items-center justify-between text-xs text-muted-foreground">
                                <span>
                                    {filledCells} of {totalCells} periods filled
                                </span>
                                <div
                                    onDragOver={(e) => e.preventDefault()}
                                    onDrop={dropOnTrash}
                                    className="flex items-center gap-1.5 rounded-lg border border-dashed border-red-300 px-3 py-1.5 text-red-600 dark:border-red-800"
                                >
                                    <Trash2 className="size-3.5" /> Drop here to remove
                                </div>
                            </div>

                            <div className="overflow-x-auto rounded-xl border bg-card">
                                <div id="playground-timetable" className="min-w-[640px] bg-white p-4 text-neutral-900">
                                    <div className="mb-3 text-center">
                                        <input
                                            value={title}
                                            onChange={(e) => setTitle(e.target.value)}
                                            className="w-full bg-transparent text-center text-xl font-bold outline-none"
                                        />
                                        <input
                                            value={subtitle}
                                            onChange={(e) => setSubtitle(e.target.value)}
                                            className="w-full bg-transparent text-center text-sm text-neutral-500 outline-none"
                                        />
                                    </div>
                                    <table className="w-full table-fixed border-collapse text-xs">
                                        <thead>
                                            <tr>
                                                <th className="w-28 border border-neutral-200 bg-neutral-100 p-2 text-left">Time</th>
                                                {days.map((day) => (
                                                    <th key={day} className="border border-neutral-200 bg-neutral-100 p-2">
                                                        {day}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {rows.map((row) =>
                                                row.kind === 'break' ? (
                                                    <tr key={row.id}>
                                                        <td className="border border-neutral-200 bg-amber-50 p-2 font-mono text-[11px] text-neutral-500">
                                                            {row.start}–{row.end}
                                                        </td>
                                                        <td colSpan={days.length} className="border border-neutral-200 bg-amber-50 p-1.5 text-center">
                                                            <span className="inline-flex items-center gap-1.5 font-medium text-amber-800">
                                                                <Coffee className="size-3.5" />
                                                                <input
                                                                    value={row.label}
                                                                    onChange={(e) => updateRow(row.id, { label: e.target.value })}
                                                                    className="w-32 bg-transparent text-center outline-none"
                                                                />
                                                            </span>
                                                        </td>
                                                    </tr>
                                                ) : (
                                                    <tr key={row.id}>
                                                        <td className="border border-neutral-200 bg-neutral-50 p-2 align-top">
                                                            <div className="font-semibold">{row.label}</div>
                                                            <div className="font-mono text-[11px] text-neutral-500">
                                                                {row.start}–{row.end}
                                                            </div>
                                                        </td>
                                                        {days.map((day) => {
                                                            const cellKey = `${day}|${row.id}`;
                                                            const subject = cells[cellKey] ? subjectsById.get(cells[cellKey]) : undefined;

                                                            return (
                                                                <td
                                                                    key={cellKey}
                                                                    onDragOver={(e) => {
                                                                        e.preventDefault();
                                                                        setHoverCell(cellKey);
                                                                    }}
                                                                    onDragLeave={() => setHoverCell((current) => (current === cellKey ? null : current))}
                                                                    onDrop={(e) => dropOnCell(e, cellKey)}
                                                                    onClick={() => clickCell(cellKey)}
                                                                    className={`h-14 border border-neutral-200 p-1 transition ${
                                                                        hoverCell === cellKey ? 'bg-indigo-50' : ''
                                                                    } ${selectedSubjectId ? 'cursor-copy' : ''}`}
                                                                >
                                                                    {subject ? (
                                                                        <div
                                                                            draggable
                                                                            onDragStart={(e) => startDrag(e, { source: 'cell', cellKey })}
                                                                            className="flex h-full cursor-grab flex-col justify-center rounded-md px-2 py-1 text-white shadow-sm active:cursor-grabbing"
                                                                            style={{ backgroundColor: subject.color }}
                                                                            title="Drag to move, or click to remove"
                                                                        >
                                                                            <span className="truncate font-semibold">{subject.name}</span>
                                                                            {subject.teacher && <span className="truncate text-[10px] opacity-90">{subject.teacher}</span>}
                                                                        </div>
                                                                    ) : (
                                                                        <div className="h-full rounded-md border border-dashed border-transparent hover:border-neutral-300" />
                                                                    )}
                                                                </td>
                                                            );
                                                        })}
                                                    </tr>
                                                ),
                                            )}
                                        </tbody>
                                    </table>
                                    {subjects.length > 0 && (
                                        <div className="mt-3 flex flex-wrap gap-3 text-[11px] text-neutral-600">
                                            {subjects.map((subject) => (
                                                <span key={subject.id} className="inline-flex items-center gap-1">
                                                    <span className="size-2.5 rounded-sm" style={{ backgroundColor: subject.color }} />
                                                    {subject.name}
                                                    {subject.teacher && ` (${subject.teacher})`} · {usage.get(subject.id) ?? 0}/wk
                                                </span>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </section>
                    </div>
                </main>
            </div>
        </>
    );
}
