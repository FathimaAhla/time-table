import { Head, Link, usePage } from '@inertiajs/react';
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
    Wand2,
} from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import { dashboard, playground } from '@/routes';
import { index as assignmentsIndex } from '@/routes/assignments';
import { index as classesIndex } from '@/routes/classes';
import { index as gradesIndex } from '@/routes/grades';
import { index as subjectsIndex } from '@/routes/subjects';
import { index as teachersIndex } from '@/routes/teachers';
import { index as timeSlotsIndex } from '@/routes/time-slots';
import {
    classMethod as classTimetable,
    index as timetableIndex,
} from '@/routes/timetable';
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

type TimetableHealth = {
    generated: number;
    published: number;
    outOfSync: number;
    missing: number;
};

type TeacherLoad = {
    id: number;
    name: string;
    assigned: number;
    assignments: number;
    max: number;
};

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

const statColors = {
    indigo: {
        icon: 'bg-indigo-500 shadow-indigo-500/30',
        glow: 'bg-indigo-500/10',
        bar: 'bg-indigo-500',
    },
    emerald: {
        icon: 'bg-emerald-500 shadow-emerald-500/30',
        glow: 'bg-emerald-500/10',
        bar: 'bg-emerald-500',
    },
    sky: {
        icon: 'bg-sky-500 shadow-sky-500/30',
        glow: 'bg-sky-500/10',
        bar: 'bg-sky-500',
    },
    amber: {
        icon: 'bg-amber-500 shadow-amber-500/30',
        glow: 'bg-amber-500/10',
        bar: 'bg-amber-500',
    },
} as const;

function StatCard({
    label,
    value,
    hint,
    icon: Icon,
    href,
    color,
}: {
    label: string;
    value: number;
    hint: string;
    icon: LucideIcon;
    href: string;
    color: keyof typeof statColors;
}) {
    const palette = statColors[color];

    return (
        <Link
            href={href}
            className="group relative flex items-start justify-between overflow-hidden rounded-2xl border border-sidebar-border/70 bg-card p-5 transition-all duration-300 ease-out hover:-translate-y-1.5 hover:scale-[1.02] hover:border-transparent hover:shadow-xl dark:border-sidebar-border"
        >
            <span
                className={`pointer-events-none absolute -top-10 -right-10 size-32 rounded-full ${palette.glow} transition-transform duration-500 group-hover:scale-150`}
            />
            <span
                className={`absolute inset-x-0 bottom-0 h-1 ${palette.bar} scale-x-0 transition-transform duration-300 group-hover:scale-x-100`}
            />
            <div className="relative">
                <p className="text-sm font-medium text-muted-foreground">
                    {label}
                </p>
                <p className="mt-1 text-3xl font-bold tabular-nums">{value}</p>
                <p className="mt-1 text-xs text-muted-foreground">{hint}</p>
            </div>
            <span
                className={`relative rounded-xl p-2.5 text-white shadow-lg transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6 ${palette.icon}`}
            >
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
        {
            label: 'Add grades',
            done: counts.grades > 0,
            href: gradesIndex().url,
        },
        {
            label: 'Create classes',
            done: counts.classes > 0,
            href: classesIndex().url,
        },
        {
            label: 'Add subjects',
            done: counts.subjects > 0,
            href: subjectsIndex().url,
        },
        {
            label: 'Register teachers',
            done: counts.teachers > 0,
            href: teachersIndex().url,
        },
        {
            label: 'Define time slots',
            done: counts.teachingPeriods > 0,
            href: timeSlotsIndex().url,
        },
        {
            label: 'Assign teachers to classes',
            done: counts.assignments > 0,
            href: assignmentsIndex().url,
        },
        {
            label: 'Generate timetables',
            done: counts.classes > 0 && timetableHealth.missing === 0,
            href: timetableIndex().url,
        },
    ];
    const completedSteps = setupSteps.filter((step) => step.done).length;
    const setupPercent = Math.round((completedSteps / setupSteps.length) * 100);
    const coveragePercent =
        counts.classes > 0
            ? Math.round((timetableHealth.generated / counts.classes) * 100)
            : 0;
    const weeklyCapacity = counts.teachingPeriods * counts.schoolDays;
    const { auth } = usePage().props;
    const firstName = auth.user?.name?.split(' ')[0] ?? 'there';
    const hour = new Date().getHours();
    const greeting =
        hour < 12
            ? 'Good morning'
            : hour < 17
              ? 'Good afternoon'
              : 'Good evening';

    return (
        <>
            <Head title="Dashboard" />
            <div className="flex h-full flex-1 flex-col gap-6 overflow-x-auto p-4">
                <section className="relative overflow-hidden rounded-2xl bg-indigo-600 p-6 text-white shadow-lg sm:p-8">
                    <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.08)_1px,transparent_1px)] [mask-image:linear-gradient(to_left,black,transparent_70%)] bg-[size:32px_32px]" />
                    <div className="pointer-events-none absolute -top-16 -right-10 size-56 animate-float rounded-full bg-amber-300/30 blur-3xl" />
                    <div className="pointer-events-none absolute -bottom-20 left-1/3 size-56 animate-float rounded-full bg-sky-400/30 blur-3xl [animation-delay:2s]" />

                    <div className="relative flex flex-wrap items-center justify-between gap-6">
                        <div>
                            <p className="text-sm font-medium text-indigo-100">
                                {greeting},
                            </p>
                            <h1 className="mt-0.5 text-2xl font-bold sm:text-3xl">
                                {firstName} 👋
                            </h1>
                            <p className="mt-2 text-sm text-indigo-100">
                                {term ? (
                                    <>
                                        Current term:{' '}
                                        <span className="font-semibold text-white">
                                            {term.name}
                                        </span>{' '}
                                        · {formatDate(term.start_date)} →{' '}
                                        {formatDate(term.end_date)}
                                    </>
                                ) : (
                                    'No current academic term is configured yet.'
                                )}
                            </p>
                            <div className="mt-5 flex flex-wrap gap-2">
                                <Link
                                    href={timetableIndex()}
                                    className="inline-flex items-center gap-2 rounded-lg bg-white px-4 py-2 text-sm font-semibold text-indigo-700 shadow-md transition hover:-translate-y-0.5 hover:bg-indigo-50"
                                >
                                    <Wand2 className="size-4" />
                                    Open timetables
                                </Link>
                                <Link
                                    href={playground()}
                                    className="inline-flex items-center gap-2 rounded-lg border border-white/40 bg-white/10 px-4 py-2 text-sm font-medium backdrop-blur transition hover:bg-white/20"
                                >
                                    <Sparkles className="size-4" />
                                    Quick timetable maker
                                </Link>
                            </div>
                        </div>

                        {/* Setup ring */}
                        <div className="flex items-center gap-4 rounded-2xl bg-white/10 p-4 ring-1 ring-white/20 backdrop-blur">
                            <div className="relative size-20">
                                <svg
                                    viewBox="0 0 36 36"
                                    className="size-20 -rotate-90"
                                >
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="15.9"
                                        fill="none"
                                        stroke="rgba(255,255,255,0.25)"
                                        strokeWidth="3.5"
                                    />
                                    <circle
                                        cx="18"
                                        cy="18"
                                        r="15.9"
                                        fill="none"
                                        stroke="#fde047"
                                        strokeWidth="3.5"
                                        strokeLinecap="round"
                                        strokeDasharray={`${setupPercent} 100`}
                                        className="transition-all duration-1000"
                                    />
                                </svg>
                                <span className="absolute inset-0 flex items-center justify-center text-lg font-bold">
                                    {setupPercent}%
                                </span>
                            </div>
                            <div className="text-sm">
                                <p className="font-semibold">School setup</p>
                                <p className="text-indigo-100">
                                    {completedSteps} of {setupSteps.length}{' '}
                                    steps done
                                </p>
                                <p className="mt-1 text-indigo-100">
                                    {coveragePercent}% classes have a timetable
                                </p>
                            </div>
                        </div>
                    </div>
                </section>

                <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
                    <StatCard
                        label="Classes"
                        value={counts.classes}
                        hint={`across ${counts.grades} grades`}
                        icon={School}
                        href={classesIndex().url}
                        color="indigo"
                    />
                    <StatCard
                        label="Teachers"
                        value={counts.teachers}
                        hint={`${idleTeachers} without assignments`}
                        icon={Users}
                        href={teachersIndex().url}
                        color="emerald"
                    />
                    <StatCard
                        label="Subjects"
                        value={counts.subjects}
                        hint="active in the catalogue"
                        icon={BookOpen}
                        href={subjectsIndex().url}
                        color="sky"
                    />
                    <StatCard
                        label="Assignments"
                        value={counts.assignments}
                        hint="teacher → subject → class this term"
                        icon={ListChecks}
                        href={assignmentsIndex().url}
                        color="amber"
                    />
                </div>

                <div className="grid gap-4 lg:grid-cols-3">
                    <section className="rounded-2xl border border-t-4 border-sidebar-border/70 border-t-indigo-500 bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-sidebar-border">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="font-semibold">Setup progress</h2>
                            <span className="text-sm font-medium text-primary">
                                {setupPercent}%
                            </span>
                        </div>
                        <div className="mb-4 h-2 overflow-hidden rounded-full bg-muted">
                            <div
                                className="h-full rounded-full bg-indigo-500 transition-all duration-1000"
                                style={{ width: `${setupPercent}%` }}
                            />
                        </div>
                        <ul className="space-y-2 text-sm">
                            {setupSteps.map((step) => (
                                <li key={step.label}>
                                    <Link
                                        href={step.href}
                                        className="flex items-center gap-2 hover:text-primary"
                                    >
                                        {step.done ? (
                                            <CheckCircle2 className="size-4 text-green-600 dark:text-green-400" />
                                        ) : (
                                            <Circle className="size-4 text-muted-foreground" />
                                        )}
                                        <span
                                            className={
                                                step.done
                                                    ? 'text-muted-foreground line-through'
                                                    : ''
                                            }
                                        >
                                            {step.label}
                                        </span>
                                    </Link>
                                </li>
                            ))}
                        </ul>
                    </section>

                    <section className="rounded-2xl border border-t-4 border-sidebar-border/70 border-t-emerald-500 bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-sidebar-border">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="font-semibold">Timetable health</h2>
                            <CalendarCheck2 className="size-5 text-muted-foreground" />
                        </div>
                        <div className="mb-4 flex items-end gap-2">
                            <span className="text-4xl font-bold text-emerald-600 tabular-nums dark:text-emerald-400">
                                {coveragePercent}%
                            </span>
                            <span className="pb-1 text-sm text-muted-foreground">
                                of classes have a timetable
                            </span>
                        </div>
                        <dl className="grid grid-cols-2 gap-3 text-sm">
                            <div className="rounded-lg bg-indigo-50 p-3 dark:bg-indigo-900/20">
                                <dt className="text-indigo-800 dark:text-indigo-300">
                                    Generated
                                </dt>
                                <dd className="text-lg font-semibold">
                                    {timetableHealth.generated}
                                </dd>
                            </div>
                            <div className="rounded-lg bg-emerald-50 p-3 dark:bg-emerald-900/20">
                                <dt className="text-emerald-800 dark:text-emerald-300">
                                    Published
                                </dt>
                                <dd className="text-lg font-semibold">
                                    {timetableHealth.published}
                                </dd>
                            </div>
                            <div className="rounded-lg bg-amber-50 p-3 dark:bg-amber-900/20">
                                <dt className="text-amber-800 dark:text-amber-300">
                                    Needs review
                                </dt>
                                <dd className="text-lg font-semibold">
                                    {timetableHealth.outOfSync}
                                </dd>
                            </div>
                            <div className="rounded-lg bg-red-50 p-3 dark:bg-red-900/20">
                                <dt className="text-red-800 dark:text-red-300">
                                    Missing
                                </dt>
                                <dd className="text-lg font-semibold">
                                    {timetableHealth.missing}
                                </dd>
                            </div>
                        </dl>
                        {classesWithoutTimetable.length > 0 && (
                            <div className="mt-4">
                                <p className="mb-2 text-xs text-muted-foreground">
                                    Classes still waiting for a timetable:
                                </p>
                                <div className="flex flex-wrap gap-1.5">
                                    {classesWithoutTimetable.map(
                                        (schoolClass) => (
                                            <Link
                                                key={schoolClass.id}
                                                href={classTimetable(
                                                    schoolClass.id,
                                                )}
                                                className="rounded-full border px-2.5 py-0.5 text-xs hover:border-primary hover:text-primary"
                                            >
                                                {schoolClass.name}
                                            </Link>
                                        ),
                                    )}
                                </div>
                            </div>
                        )}
                    </section>

                    <section className="rounded-2xl border border-t-4 border-sidebar-border/70 border-t-amber-500 bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-sidebar-border">
                        <div className="mb-3 flex items-center justify-between">
                            <h2 className="font-semibold">School week</h2>
                            <CalendarClock className="size-5 text-muted-foreground" />
                        </div>
                        <dl className="space-y-3 text-sm">
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">
                                    School days
                                </dt>
                                <dd className="font-medium">
                                    {counts.schoolDays}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">
                                    Teaching periods / day
                                </dt>
                                <dd className="font-medium">
                                    {counts.teachingPeriods}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">
                                    Breaks & fixed activities
                                </dt>
                                <dd className="font-medium">
                                    {counts.timeSlots - counts.teachingPeriods}
                                </dd>
                            </div>
                            <div className="flex justify-between">
                                <dt className="text-muted-foreground">
                                    Periods per class / week
                                </dt>
                                <dd className="font-medium">
                                    {weeklyCapacity}
                                </dd>
                            </div>
                        </dl>
                        <div className="mt-4 space-y-2">
                            {overloadedTeachers > 0 && (
                                <p className="flex items-center gap-2 rounded-lg bg-red-50 p-2 text-xs text-red-800 dark:bg-red-900/20 dark:text-red-300">
                                    <AlertTriangle className="size-4 shrink-0" />
                                    {overloadedTeachers} teacher(s) are assigned
                                    more than their weekly maximum.
                                </p>
                            )}
                            {classesWithoutTeacher > 0 && (
                                <p className="flex items-center gap-2 rounded-lg bg-amber-50 p-2 text-xs text-amber-800 dark:bg-amber-900/20 dark:text-amber-300">
                                    <GraduationCap className="size-4 shrink-0" />
                                    {classesWithoutTeacher} class(es) have no
                                    class teacher yet.
                                </p>
                            )}
                        </div>
                    </section>
                </div>

                <section className="rounded-2xl border border-t-4 border-sidebar-border/70 border-t-violet-500 bg-card p-5 shadow-sm transition-shadow duration-300 hover:shadow-md dark:border-sidebar-border">
                    <div className="mb-4 flex items-center justify-between">
                        <h2 className="font-semibold">
                            Teacher workload this term
                        </h2>
                        <Link
                            href={teachersIndex()}
                            className="inline-flex items-center gap-1 text-sm text-primary hover:underline"
                        >
                            All teachers <ArrowRight className="size-4" />
                        </Link>
                    </div>
                    {teacherWorkload.length === 0 ? (
                        <p className="text-sm text-muted-foreground">
                            No teachers yet.
                        </p>
                    ) : (
                        <ul className="space-y-3">
                            {teacherWorkload.map((teacher) => {
                                const percent =
                                    teacher.max > 0
                                        ? Math.min(
                                              100,
                                              Math.round(
                                                  (teacher.assigned /
                                                      teacher.max) *
                                                      100,
                                              ),
                                          )
                                        : 0;
                                const isOverloaded =
                                    teacher.assigned > teacher.max;

                                return (
                                    <li
                                        key={teacher.id}
                                        className="grid grid-cols-[minmax(0,10rem)_1fr_auto] items-center gap-3 text-sm sm:grid-cols-[14rem_1fr_auto]"
                                    >
                                        <span className="truncate font-medium">
                                            {teacher.name}
                                        </span>
                                        <div className="h-3 overflow-hidden rounded-full bg-muted">
                                            <div
                                                className={`h-full rounded-full ${isOverloaded ? 'bg-red-500' : percent > 80 ? 'bg-amber-500' : 'bg-indigo-500'}`}
                                                style={{ width: `${percent}%` }}
                                            />
                                        </div>
                                        <span
                                            className={`tabular-nums ${isOverloaded ? 'font-semibold text-red-600' : 'text-muted-foreground'}`}
                                        >
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
