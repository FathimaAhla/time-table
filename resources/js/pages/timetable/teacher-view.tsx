import { Head, usePage } from '@inertiajs/react';
import { BookOpen, CalendarCheck, Coffee, School, UserX } from 'lucide-react';
import type { ReactNode } from 'react';
import { ExportMenu } from '@/components/export-menu';
import { TeacherTimetableGrid } from '@/components/teacher-timetable-grid';
import type { BreadcrumbItem } from '@/types';
import type { Teacher, Term, TimeSlot, TimetableSession, WeekDay } from '@/types/timetable';
import { index as timetableIndex } from '@/routes/timetable';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Teacher Timetable', href: timetableIndex() }];

function StatCard({ icon, label, value, hint }: { icon: ReactNode; label: string; value: string; hint?: string }) {
    return (
        <div className="flex items-center gap-3 rounded-xl border bg-card p-4">
            <div className="flex size-10 items-center justify-center rounded-lg bg-primary/10 text-primary">{icon}</div>
            <div>
                <div className="text-xs text-muted-foreground">{label}</div>
                <div className="text-lg font-semibold">{value}</div>
                {hint && <div className="text-xs text-muted-foreground">{hint}</div>}
            </div>
        </div>
    );
}

export default function TeacherView({
    term,
    teacher,
    weekDays,
    timeSlots,
    sessions,
    isOwnTimetable = false,
}: {
    term: Term | null;
    teacher: Teacher | null;
    weekDays: WeekDay[];
    timeSlots: TimeSlot[];
    sessions: TimetableSession[];
    isOwnTimetable?: boolean;
}) {
    const { currentInstitute } = usePage().props;

    if (!teacher) {
        return (
            <div className="flex flex-1 flex-col items-center justify-center gap-3 p-6 text-center">
                <Head title="My Timetable" />
                <div className="flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                    <UserX className="size-6" />
                </div>
                <h1 className="text-lg font-semibold">No teacher profile linked to your account</h1>
                <p className="max-w-md text-sm text-muted-foreground">
                    Ask the school admin to add your login email to your teacher profile. Your timetable will then show here automatically.
                </p>
            </div>
        );
    }

    const teachingPeriods = timeSlots.filter((slot) => slot.slot_type === 'period').length * weekDays.length;
    const classesTaught = new Set(sessions.map((s) => s.timetable?.school_class_id).filter(Boolean)).size;
    const subjectsTaught = new Set(sessions.map((s) => s.subject_id).filter(Boolean)).size;
    const loadPercent = teacher.max_periods_per_week ? Math.round((sessions.length / teacher.max_periods_per_week) * 100) : 0;
    const title = isOwnTimetable ? 'My Timetable' : `${teacher.full_name}'s Timetable`;

    return (
        <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
            <Head title={title} />

            <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
                    <p className="mt-1 text-sm text-muted-foreground">{term ? term.name : 'No current term'} · every class this teacher takes</p>
                </div>
                <ExportMenu elementId="teacher-timetable-grid" filename={`${teacher.full_name}-timetable`} />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard
                    icon={<CalendarCheck className="size-5" />}
                    label="Periods per week"
                    value={`${sessions.length} / ${teacher.max_periods_per_week}`}
                    hint={`${loadPercent}% of maximum load`}
                />
                <StatCard icon={<Coffee className="size-5" />} label="Free periods" value={String(Math.max(teachingPeriods - sessions.length, 0))} />
                <StatCard icon={<School className="size-5" />} label="Classes" value={String(classesTaught)} />
                <StatCard icon={<BookOpen className="size-5" />} label="Subjects" value={String(subjectsTaught)} />
            </div>

            <TeacherTimetableGrid
                id="teacher-timetable-grid"
                teacher={teacher}
                term={term}
                instituteName={currentInstitute?.name}
                weekDays={weekDays}
                timeSlots={timeSlots}
                sessions={sessions}
            />
        </div>
    );
}

TeacherView.layout = { breadcrumbs };
