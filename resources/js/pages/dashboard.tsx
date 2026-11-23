import { Head, Link } from '@inertiajs/react';
import {
    AlertTriangle,
    ArrowRight,
    BookOpen,
    CalendarCheck2,
    CalendarClock,
    CheckCircle2,
    Circle,
    GraduationCap,
    ListChecks,
    School,
    Sparkles,
    Users,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { dashboard, playground } from '@/routes';
import { index as assignmentsIndex } from '@/routes/assignments';
import { index as classesIndex } from '@/routes/classes';
import { index as gradesIndex } from '@/routes/grades';
import { index as subjectsIndex } from '@/routes/subjects';
import { index as teachersIndex } from '@/routes/teachers';
import { index as timeSlotsIndex } from '@/routes/time-slots';
import { classMethod as classTimetable, index as timetableIndex } from '@/routes/timetable';
import type { Term } from '@/types/timetable';

type Counts = {
    grades: number;
    classes: number;
    subjects: number;
    teachers: number;
    assignments: number;
    timeSlots: number;
    teachingPeriods: number;
    schoolDays: number;
};

type TimetableHealth = { generated: number; published: number; outOfSync: number; missing: number };

type TeacherLoad = { id: number; name: string; assigned: number; assignments: number; max: number };

type DashboardProps = {
    term: Term | null;
    counts: Counts;
    timetableHealth: TimetableHealth;
    classesWithoutTimetable: { id: number; name: string }[];
    classesWithoutTeacher: number;
    teacherWorkload: TeacherLoad[];
    overloadedTeachers: number;
    idleTeachers: number;
};

/** "2026-09-01T00:00:00.000000Z" -> "1 Sep 2026" (date part only, no timezone shift). */
function formatDate(value: string): string {
    const [year, month, day] = value.slice(0, 10).split('-').map(Number);

    return new Date(year, month - 1, day).toLocaleDateString(undefined, {
        day: 'numeric',
        month: 'short',
        year: 'numeric',
    });
}

function StatCard({ label, value, hint, icon: Icon, href }: { label: string; value: number; hint: string; icon: LucideIcon; href: string }) {
    return (
        <Link
            href={href}
            className="group flex items-start justify-between rounded-xl border border-sidebar-border/70 bg-card p-4 transition hover:border-primary/40 hover:shadow-sm dark:border-sidebar-border"
        >
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="mt-1 text-3xl font-semibold tabular-nums">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </div>
            <span className="rounded-lg bg-primary/10 p-2 text-primary transition group-hover:bg-primary group-hover:text-primary-foreground">
                <Icon className="size-5" />
            </span>
        </Link>
    );
}

export default function Dashboard({
    term,
    counts,
    timetableHealth,
    classesWithoutTimetable,
    classesWithoutTeacher,
    teacherWorkload,
    overloadedTeachers,
    idleTeachers,
}: DashboardProps) {
    const setupSteps = [
        { label: 'Add grades', done: counts.grades > 0, href: gradesIndex().url },
        { label: 'Create classes', done: counts.classes > 0, href: classesIndex().url },
        { label: 'Add subjects', done: counts.subjects > 0, href: subjectsIndex().url },
        { label: 'Register teachers', done: counts.teachers > 0, href: teachersIndex().url },
        { label: 'Define time slots', done: counts.teachingPeriods > 0, href: timeSlotsIndex().url },
        { label: 'Assign teachers to classes', done: counts.assignments > 0, href: assignmentsIndex().url },
        { label: 'Generate timetables', done: counts.classes > 0 && timetableHealth.missing === 0, href: timetableIndex().url },
    ];
    const completedSteps = setupSteps.filter((step) => step.done).length;
    const setupPercent = Math.round((completedSteps / setupSteps.length) * 100);
    const coveragePercent = counts.classes > 0 ? Math.round((timetableHealth.generated / counts.classes) * 100) : 0;
    const weeklyCapacity = counts.teachingPeriods * counts.schoolDays;

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <div className="flex flex-wrap items-end justify-between gap-3">
                    <div>
                        <h1 className="text-2xl font-semibold">Dashboard</h1>
                        <p className="text-sm text-muted-foreground">
                            {term ? (
                                <>
                                    Current term: <span className="font-medium text-foreground">{term.name}</span> · {formatDate(term.start_date)} → {formatDate(term.end_date)}
                                </>
                            ) : (
                                'No current academic term is configured yet.'
                            )}
                        </p>
                    </div>
                    <Link
                        href={playground()}
                        className="inline-flex items-center gap-2 rounded-lg border border-primary/30 bg-primary/5 px-3 py-2 text-sm font-medium text-primary hover:bg-primary/10"
                    >
                        <Sparkles className="size-4" />
                        Open quick timetable maker
                    </Link>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard label="Classes" value={counts.classes} hint={`across ${counts.grades} grades`} icon={School} href={classesIndex().url} />
                    <StatCard label="Teachers" value={counts.teachers} hint={`${idleTeachers} without assignments`} icon={Users} href={teachersIndex().url} />
                    <StatCard label="Subjects" value={counts.subjects} hint="active in the catalogue" icon={BookOpen} href={subjectsIndex().url} />
                    <StatCard
                        label="Assignments"
                        value={counts.assignments}
                        hint="teacher → subject → class this term"
                        icon={ListChecks}
                        href={assignmentsIndex().url}
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <section className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="font-semibold">Setup progress</h2>
                            <span className="text-sm font-medium text-primary">{setupPercent}%</span>
                        </div>
                        <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
                            <div className="h-full rounded-full bg-primary transition-all" style={{ width: `${setupPercent}%` }} />
                        </div>
                        <ul className="space-y-2 text-sm">
                            {setupSteps.map((step) => (
                                <li key={step.label}>
                                    <Link href={step.href} className="flex items-center gap-2 hover:text-primary">
                                        {step.done ? (
                                            <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <Circle className="size-4 text-muted-foreground" />
                                        )}
                                        <span className={step.done ? 'text-muted-foreground line-through' : ''}>{step.label}</span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="font-semibold">Timetable health</h2>
                            <CalendarCheck2 className="size-5 text-muted-foreground" />
                        </div>
                        <div className="mb-4 flex items-end gap-2">
                            <span className="text-4xl font-semibold tabular-nums">{coveragePercent}%</span>
                            <span className="pb-1 text-sm text-muted-foreground">of classes have a timetable</span>
                        </div>
                        <dl className="grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-lg bg-muted/50 p-3">
                                <dt className="text-muted-foreground">Generated</dt>
                                <dd className="text-lg font-semibold">{timetableHealth.generated}</dd>
                            </div>
                            <div className="rounded-lg bg-muted/50 p-3">
                                <dt className="text-muted-foreground">Published</dt>
                                <dd className="text-lg font-semibold">{timetableHealth.published}</dd>
                            </div>
                            <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                                <dt className="text-amber-800 dark:text-amber-300">Needs review</dt>
                                <dd className="text-lg font-semibold">{timetableHealth.outOfSync}</dd>
                            </div>
                            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                                <dt className="text-red-800 dark:text-red-300">Missing</dt>
                                <dd className="text-lg font-semibold">{timetableHealth.missing}</dd>
                            </div>
                        </dl>
                        {classesWithoutTimetable.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 text-xs text-muted-foreground">Classes still waiting for a timetable:</p>
                                <div className="flex flex-wrap gap-1.5">
                                    {classesWithoutTimetable.map((schoolClass) => (
                                        <Link
                                            key={schoolClass.id}
                                            href={classTimetable(schoolClass.id)}
                                            className="rounded-full border px-2.5 py-0.5 text-xs hover:border-primary hover:text-primary"
                                        >
                                            {schoolClass.name}
                                        </Link>
                                    ))}
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="font-semibold">School week</h2>
                            <CalendarClock className="size-5 text-muted-foreground" />
                        </div>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">School days</dt>
                                <dd className="font-medium">{counts.schoolDays}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Teaching periods / day</dt>
                                <dd className="font-medium">{counts.teachingPeriods}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Breaks & fixed activities</dt>
                                <dd className="font-medium">{counts.timeSlots - counts.teachingPeriods}</dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">Periods per class / week</dt>
                                <dd className="font-medium">{weeklyCapacity}</dd>
                            </div>
                        </dl>
                        <div className="mt-4 space-y-2">
                            {overloadedTeachers > 0 && (
                                <p className="flex items-center gap-2 rounded-lg bg-red-50 p-2 text-xs text-red-800 dark:bg-red-900/20 dark:text-red-300">
                                    <AlertTriangle className="size-4 shrink-0" />
                                    {overloadedTeachers} teacher(s) are assigned more than their weekly maximum.
                                </p>
                            )}
                            {classesWithoutTeacher > 0 && (
                                <p className="flex items-center gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                                    <GraduationCap className="size-4 shrink-0" />
                                    {classesWithoutTeacher} class(es) have no class teacher yet.
                                </p>
                            )}
                        </div>
                    </section>
                </div>

                <section className="rounded-xl border border-sidebar-border/70 bg-card p-5 dark:border-sidebar-border">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold">Teacher workload this term</h2>
                        <Link href={teachersIndex()} className="inline-flex items-center gap-1 text-sm text-primary hover:underline">
                            All teachers <ArrowRight className="size-4" />
                        </Link>
                    </div>
                    {teacherWorkload.length === 0 ? (
                        <p className="text-sm text-muted-foreground">No teachers yet.</p>
                    ) : (
                        <ul className="space-y-3">
                            {teacherWorkload.map((teacher) => {
                                const percent = teacher.max > 0 ? Math.min(100, Math.round((teacher.assigned / teacher.max) * 100)) : 0;
                                const isOverloaded = teacher.assigned > teacher.max;

                                return (
                                    <li key={teacher.id} className="grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[14rem_1fr_auto]">
                                        <span className="truncate font-medium">{teacher.name}</span>
                                        <div className="h-2.5 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={`h-full rounded-full ${isOverloaded ? 'bg-red-500' : percent > 80 ? 'bg-amber-500' : 'bg-primary'}`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <span className={`tabular-nums ${isOverloaded ? 'font-semibold text-red-600' : 'text-muted-foreground'}`}>
                                            {teacher.assigned}/{teacher.max}
                                        </span>
                                    </li>
                                );
                            })}
                        </ul>
                    )}
                </section>
            </div>
        </>
    );
}

Dashboard.layout = {
    breadcrumbs: [
        {
            title: 'Dashboard',
            href: dashboard(),
        },
    ],
};
