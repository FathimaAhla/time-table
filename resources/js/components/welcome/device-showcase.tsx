import { CalendarDays, Download, Lock, RefreshCw, Wand2 } from 'lucide-react';
import type { CSSProperties } from 'react';
import { tint } from '@/lib/subject-color';

/* ------------------------------------------------------------------ */
/* Sample data that mirrors the real class timetable page             */
/* ------------------------------------------------------------------ */

type Cell = { subject: keyof typeof subjects; locked?: boolean };
type Row = {
    start: string;
    end: string;
    name?: string;
    fixed?: string;
    cells?: Cell['subject'][];
};

const subjects = {
    Maths: { color: '#6366f1', teacher: 'Mr. Perera' },
    Science: { color: '#10b981', teacher: 'Mrs. Fernando' },
    English: { color: '#0ea5e9', teacher: 'Ms. Jayasinghe' },
    History: { color: '#f59e0b', teacher: 'Mr. Bandara' },
    Art: { color: '#ec4899', teacher: 'Ms. Dias' },
    ICT: { color: '#8b5cf6', teacher: 'Mr. Silva' },
    PE: { color: '#ef4444', teacher: 'Mr. Kumar' },
    Tamil: { color: '#14b8a6', teacher: 'Mrs. Nadarajah' },
} as const;

const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

const rows: Row[] = [
    { start: '07:30', end: '07:50', fixed: 'Assembly' },
    {
        start: '07:50',
        end: '08:30',
        name: 'P1',
        cells: ['Maths', 'Science', 'English', 'History', 'Maths'],
    },
    {
        start: '08:30',
        end: '09:10',
        name: 'P2',
        cells: ['Science', 'Maths', 'ICT', 'English', 'Art'],
    },
    {
        start: '09:10',
        end: '09:50',
        name: 'P3',
        cells: ['English', 'History', 'Maths', 'Science', 'PE'],
    },
    { start: '09:50', end: '10:10', fixed: 'Interval' },
    {
        start: '10:10',
        end: '10:50',
        name: 'P4',
        cells: ['ICT', 'English', 'Science', 'Maths', 'Tamil'],
    },
    {
        start: '10:50',
        end: '11:30',
        name: 'P5',
        cells: ['Art', 'Tamil', 'History', 'ICT', 'Science'],
    },
    {
        start: '11:30',
        end: '12:10',
        name: 'P6',
        cells: ['Tamil', 'PE', 'Art', 'Maths', 'English'],
    },
];

const lockedCells = new Set(['1-0', '5-3']);

/* ------------------------------------------------------------------ */
/* Timetable grid (same structure as pages/timetable/class-view.tsx)  */
/* ------------------------------------------------------------------ */

function TimetableGrid({
    dayCount = 5,
    compact = false,
    showTeacher = true,
}: {
    dayCount?: number;
    compact?: boolean;
    showTeacher?: boolean;
}) {
    const visibleDays = days.slice(0, dayCount);
    const text = compact ? 'text-[7px]' : 'text-[9px] xl:text-[10px]';
    let cellIndex = 0;

    return (
        <table className={`w-full table-fixed border-collapse ${text}`}>
            <thead>
                <tr>
                    <th className="w-[14%] border border-slate-200 bg-slate-100 p-1 text-left font-semibold text-slate-700">
                        Time
                    </th>
                    {visibleDays.map((day) => (
                        <th
                            key={day}
                            className="border border-slate-200 bg-slate-50 p-1 text-left font-semibold text-slate-700"
                        >
                            {compact ? day.slice(0, 3) : day}
                        </th>
                    ))}
                </tr>
            </thead>
            <tbody>
                {rows.map((row, rowIndex) => (
                    <tr key={row.start}>
                        <td className="border border-slate-200 bg-white p-1 align-top font-mono leading-tight text-slate-700">
                            <div>{row.start}</div>
                            <div className="text-slate-400">{row.end}</div>
                        </td>
                        {row.fixed ? (
                            <td
                                colSpan={visibleDays.length}
                                className="border border-slate-200 bg-orange-50 p-1 text-center font-medium text-orange-800"
                            >
                                {row.fixed}
                            </td>
                        ) : (
                            row
                                .cells!.slice(0, dayCount)
                                .map((name, dayIndex) => {
                                    const subject = subjects[name];
                                    const locked = lockedCells.has(
                                        `${rowIndex}-${dayIndex}`,
                                    );
                                    const delay = 300 + cellIndex++ * 25;

                                    return (
                                        <td
                                            key={dayIndex}
                                            className="border border-slate-200 bg-white p-[2px] align-top"
                                        >
                                            <div
                                                className="relative flex animate-cell-in flex-col justify-center rounded-[4px] border border-l-[3px] px-1 py-[3px] leading-tight opacity-0 transition hover:scale-105 hover:shadow-md"
                                                style={{
                                                    backgroundColor: tint(
                                                        subject.color,
                                                        0.14,
                                                    ),
                                                    borderColor: tint(
                                                        subject.color,
                                                        0.35,
                                                    ),
                                                    borderLeftColor:
                                                        subject.color,
                                                    animationDelay: `${delay}ms`,
                                                }}
                                            >
                                                <span className="truncate font-semibold text-slate-800">
                                                    {name}
                                                </span>
                                                {showTeacher && (
                                                    <span className="truncate text-slate-500">
                                                        {subject.teacher}
                                                    </span>
                                                )}
                                                {locked && (
                                                    <Lock className="absolute top-0.5 right-0.5 size-2 text-slate-500" />
                                                )}
                                            </div>
                                        </td>
                                    );
                                })
                        )}
                    </tr>
                ))}
            </tbody>
        </table>
    );
}

/* ------------------------------------------------------------------ */
/* Device frames                                                       */
/* ------------------------------------------------------------------ */

function PageHeader({ compact = false }: { compact?: boolean }) {
    return (
        <div className="mb-2 flex items-center justify-between gap-2">
            <div>
                <p
                    className={`font-semibold text-slate-900 ${compact ? 'text-[9px]' : 'text-xs xl:text-sm'}`}
                >
                    Class 10A Timetable
                </p>
                <p
                    className={`text-slate-500 ${compact ? 'text-[7px]' : 'text-[10px]'}`}
                >
                    Term 1 · Published
                </p>
            </div>
            {!compact && (
                <div className="flex gap-1.5 text-[9px] font-medium">
                    <span className="inline-flex items-center gap-1 rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700">
                        <RefreshCw className="size-2.5" /> Full re-generate
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-md bg-indigo-600 px-2 py-1 text-white">
                        <Download className="size-2.5" /> Export
                    </span>
                </div>
            )}
        </div>
    );
}

function SchoolTitle({ compact = false }: { compact?: boolean }) {
    return (
        <div className="mb-1.5 text-center">
            <div
                className={`font-bold text-slate-900 ${compact ? 'text-[8px]' : 'text-[11px] xl:text-xs'}`}
            >
                Your School Name
            </div>
            <div
                className={`tracking-wide text-slate-500 uppercase ${compact ? 'text-[6px]' : 'text-[8px]'}`}
            >
                Class 10A Timetable
            </div>
        </div>
    );
}

export function DesktopDevice({ style }: { style?: CSSProperties }) {
    return (
        <div style={style} className="relative">
            <div className="rounded-2xl border-[6px] border-slate-800 bg-slate-800 shadow-2xl shadow-indigo-900/40">
                {/* Browser bar */}
                <div className="flex items-center gap-2 rounded-t-lg bg-slate-100 px-3 py-1.5">
                    <span className="size-2 rounded-full bg-red-400" />
                    <span className="size-2 rounded-full bg-amber-400" />
                    <span className="size-2 rounded-full bg-green-400" />
                    <span className="ml-2 flex-1 truncate rounded-md bg-white px-2 py-0.5 text-[9px] text-slate-400">
                        yourschool · timetable / class 10A
                    </span>
                </div>
                <div className="flex rounded-b-lg bg-white">
                    {/* Mini sidebar */}
                    <div className="hidden w-28 shrink-0 border-r border-slate-100 bg-slate-50 p-2 sm:block">
                        <div className="mb-3 flex items-center gap-1.5 text-[9px] font-semibold text-slate-800">
                            <span className="rounded bg-indigo-600 p-0.5 text-white">
                                <CalendarDays className="size-2.5" />
                            </span>
                            School Timetable
                        </div>
                        {[
                            'Dashboard',
                            'Grades',
                            'Classes',
                            'Subjects',
                            'Teachers',
                            'Timetable',
                        ].map((item) => (
                            <div
                                key={item}
                                className={`mb-0.5 rounded px-1.5 py-1 text-[8px] ${item === 'Timetable' ? 'bg-indigo-100 font-semibold text-indigo-700' : 'text-slate-500'}`}
                            >
                                {item}
                            </div>
                        ))}
                    </div>
                    <div className="min-w-0 flex-1 p-2.5">
                        <PageHeader />
                        <div className="rounded-md border border-slate-200 p-1.5">
                            <SchoolTitle />
                            <div className="sm:hidden">
                                <TimetableGrid compact />
                            </div>
                            <div className="hidden sm:block">
                                <TimetableGrid />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            {/* Stand */}
            <div className="mx-auto h-6 w-24 bg-slate-700" />
            <div className="mx-auto h-1.5 w-44 rounded-full bg-slate-800" />
        </div>
    );
}

export function TabletDevice({ style }: { style?: CSSProperties }) {
    return (
        <div
            style={style}
            className="w-full rounded-[1.6rem] border-[8px] border-slate-900 bg-slate-900 shadow-2xl shadow-violet-900/40"
        >
            <div className="overflow-hidden rounded-[1rem] bg-white p-2">
                <PageHeader compact />
                <div className="rounded border border-slate-200 p-1">
                    <SchoolTitle compact />
                    <TimetableGrid compact />
                </div>
            </div>
        </div>
    );
}

export function PhoneDevice({ style }: { style?: CSSProperties }) {
    return (
        <div
            style={style}
            className="w-full rounded-[1.8rem] border-[6px] border-slate-900 bg-slate-900 shadow-2xl shadow-fuchsia-900/40"
        >
            <div className="relative overflow-hidden rounded-[1.4rem] bg-white">
                <div className="mx-auto mt-1 h-3 w-14 rounded-full bg-slate-900" />
                <div className="p-1.5">
                    <div className="mb-1.5 flex items-center justify-between">
                        <div>
                            <p className="text-[8px] font-semibold text-slate-900">
                                Class 10A
                            </p>
                            <p className="text-[6px] text-slate-500">
                                Term 1 · Published
                            </p>
                        </div>
                        <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[6px] font-semibold text-green-700">
                            0 clashes
                        </span>
                    </div>
                    <div className="relative overflow-hidden rounded border border-slate-200">
                        <TimetableGrid
                            dayCount={2}
                            compact
                            showTeacher={false}
                        />
                        {/* Fade hints that the table scrolls sideways, like on a real phone */}
                        <div className="pointer-events-none absolute inset-y-0 right-0 w-4 bg-gradient-to-l from-white" />
                    </div>
                    <div className="mt-1.5 flex items-center justify-center gap-1 rounded-md bg-indigo-600 py-1 text-[7px] font-semibold text-white">
                        <Wand2 className="size-2" /> Swipe for Wed – Fri
                    </div>
                </div>
            </div>
        </div>
    );
}
