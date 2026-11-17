import { Head, Link, router, usePage } from '@inertiajs/react';
import { Users } from 'lucide-react';
import { useMemo } from 'react';
import TimetableController from '@/actions/App/Http/Controllers/TimetableController';
import { ExportMenu } from '@/components/export-menu';
import { Button } from '@/components/ui/button';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';
import type { Grade, SchoolClass, Subject, Teacher, Term, TimeSlot, Timetable, TimetableSession, WeekDay } from '@/types/timetable';
import { index as timetableIndex, classMethod as classView, teacher as teacherView, teachers as allTeachers } from '@/routes/timetable';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Master Timetable', href: timetableIndex() }];

type ClassWithTimetable = SchoolClass & { timetables: Timetable[] };

export default function MasterTimetable({
    term,
    weekDays,
    timeSlots,
    classes,
    sessions,
    grades,
    teachers,
    subjects,
    filters,
}: {
    term: Term | null;
    weekDays: WeekDay[];
    timeSlots: TimeSlot[];
    classes: ClassWithTimetable[];
    sessions: TimetableSession[];
    grades: Grade[];
    teachers: Teacher[];
    subjects: Subject[];
    filters: Record<string, string | undefined>;
}) {
    const { currentInstitute, canManage } = usePage().props;

    function setFilter(key: string, value: string) {
        router.get(timetableIndex().url, { ...filters, [key]: value === 'all' ? undefined : value }, { preserveState: true });
    }

    function generateAll() {
        router.post(TimetableController.generateAll().url);
    }

    const sessionsByTimetable = useMemo(() => {
        const map = new Map<number, TimetableSession[]>();
        sessions.forEach((s) => {
            const arr = map.get(s.timetable_id) ?? [];
            arr.push(s);
            map.set(s.timetable_id, arr);
        });
        return map;
    }, [sessions]);

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <Head title="Master Timetable" />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold">Master Timetable</h1>
                    <p className="text-sm text-muted-foreground">{term ? term.name : 'No current term configured'} — all classes</p>
                </div>
                <div className="flex gap-2">
                    <Select value="" onValueChange={(value) => router.visit(value)}>
                        <SelectTrigger className="w-56">
                            <SelectValue placeholder="Open a class or teacher..." />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectGroup>
                                <SelectLabel>Classes</SelectLabel>
                                {classes.map((c) => (
                                    <SelectItem key={`c${c.id}`} value={classView(c.id).url}>
                                        Class {c.grade?.name}{c.name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                            <SelectGroup>
                                <SelectLabel>Teachers</SelectLabel>
                                {teachers.map((t) => (
                                    <SelectItem key={`t${t.id}`} value={teacherView(t.id).url}>
                                        {t.full_name}
                                    </SelectItem>
                                ))}
                            </SelectGroup>
                        </SelectContent>
                    </Select>
                    <Button variant="outline" asChild>
                        <Link href={allTeachers()}>
                            <Users className="size-4" />
                            All teacher timetables
                        </Link>
                    </Button>
                    {canManage && <Button onClick={generateAll}>Generate all classes</Button>}
                    <ExportMenu elementId="master-timetable-grid" filename="master-timetable" />
                </div>
            </div>

            <div className="flex flex-wrap gap-3 rounded-lg border p-3">
                <Select value={filters.grade_id ?? 'all'} onValueChange={(v) => setFilter('grade_id', v)}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="All grades" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All grades</SelectItem>
                        {grades.map((g) => (
                            <SelectItem key={g.id} value={String(g.id)}>
                                {g.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filters.school_class_id ?? 'all'} onValueChange={(v) => setFilter('school_class_id', v)}>
                    <SelectTrigger className="w-44">
                        <SelectValue placeholder="All classes" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All classes</SelectItem>
                        {classes.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                                {c.grade?.name}{c.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filters.teacher_id ?? 'all'} onValueChange={(v) => setFilter('teacher_id', v)}>
                    <SelectTrigger className="w-48">
                        <SelectValue placeholder="All teachers" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All teachers</SelectItem>
                        {teachers.map((t) => (
                            <SelectItem key={t.id} value={String(t.id)}>
                                {t.full_name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>

                <Select value={filters.subject_id ?? 'all'} onValueChange={(v) => setFilter('subject_id', v)}>
                    <SelectTrigger className="w-40">
                        <SelectValue placeholder="All subjects" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All subjects</SelectItem>
                        {subjects.map((s) => (
                            <SelectItem key={s.id} value={String(s.id)}>
                                {s.name}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            <div id="master-timetable-grid" className="flex flex-col gap-8">
                {currentInstitute && (
                    <div className="text-center">
                        <div className="text-lg font-bold">{currentInstitute.name}</div>
                        <div className="text-xs uppercase tracking-wide text-muted-foreground">Master Timetable</div>
                    </div>
                )}
                {classes.map((c) => {
                    const timetable = c.timetables?.[0];
                    const classSessions = timetable ? sessionsByTimetable.get(timetable.id) ?? [] : [];

                    return (
                        <div key={c.id} className="rounded-lg border p-3">
                            <div className="mb-2 flex items-center justify-between">
                                <h2 className="font-semibold">
                                    {currentInstitute ? `${currentInstitute.name} — ` : ''}
                                    {c.grade?.name}{c.name}
                                </h2>
                                <div className="flex items-center gap-2">
                                    {timetable?.is_out_of_sync && (
                                        <span className="rounded bg-amber-100 px-2 py-0.5 text-xs text-amber-800 dark:bg-amber-900/40 dark:text-amber-300">
                                            Out of sync
                                        </span>
                                    )}
                                    <a href={classView(c.id).url} className="text-xs text-primary underline">
                                        Open / edit
                                    </a>
                                </div>
                            </div>
                            <div className="overflow-x-auto">
                                <table className="w-full border-collapse text-xs">
                                    <thead>
                                        <tr>
                                            <th className="w-28 border bg-muted/50 p-1.5 text-left">Time</th>
                                            {weekDays.map((d) => (
                                                <th key={d.id} className="border bg-muted/50 p-1.5 text-left">
                                                    {d.short_code}
                                                </th>
                                            ))}
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {timeSlots.map((slot) => (
                                            <tr key={slot.id}>
                                                <td className="border p-1.5 font-mono">{slot.start_time.slice(0, 5)}-{slot.end_time.slice(0, 5)}</td>
                                                {slot.slot_type === 'fixed' ? (
                                                    <td
                                                        colSpan={weekDays.length}
                                                        className="border bg-orange-50 p-1.5 text-center text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                                                    >
                                                        {slot.fixed_activity_name}
                                                    </td>
                                                ) : (
                                                    weekDays.map((day) => {
                                                        const session = classSessions.find(
                                                            (s) => s.week_day_id === day.id && s.time_slot_id === slot.id,
                                                        );
                                                        return (
                                                            <td key={day.id} className="border p-1.5">
                                                                {session ? (
                                                                    <div>
                                                                        <div className="font-medium">{session.subject?.name}</div>
                                                                        <div className="text-muted-foreground">{session.teacher?.full_name}</div>
                                                                    </div>
                                                                ) : (
                                                                    <span className="text-muted-foreground">—</span>
                                                                )}
                                                            </td>
                                                        );
                                                    })
                                                )}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    );
                })}
                {classes.length === 0 && <p className="text-muted-foreground">No classes match the current filters.</p>}
            </div>
        </div>
    );
}

MasterTimetable.layout = { breadcrumbs };
