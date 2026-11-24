import { Head, usePage } from '@inertiajs/react';
import { FileDown, Users } from 'lucide-react';
import { useMemo, useState } from 'react';
import { matchesSearch, SearchBar } from '@/components/data-page';
import { ColorfulToggle } from '@/components/colorful-toggle';
import { TeacherTimetableGrid } from '@/components/teacher-timetable-grid';
import { Button } from '@/components/ui/button';
import { exportManyAsPdf } from '@/lib/export-timetable';
import type { BreadcrumbItem } from '@/types';
import type {
    Teacher,
    Term,
    TimeSlot,
    TimetableSession,
    WeekDay,
} from '@/types/timetable';
import { teachers as allTeachersRoute } from '@/routes/timetable';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'All Teacher Timetables', href: allTeachersRoute() },
];

export default function AllTeachers({
    term,
    teachers,
    weekDays,
    timeSlots,
    sessions,
}: {
    term: Term | null;
    teachers: Teacher[];
    weekDays: WeekDay[];
    timeSlots: TimeSlot[];
    sessions: TimetableSession[];
}) {
    const { currentInstitute } = usePage().props;
    const [search, setSearch] = useState('');
    const [progress, setProgress] = useState<string | null>(null);

    const sessionsByTeacher = useMemo(() => {
        const grouped = new Map<number, TimetableSession[]>();
        sessions.forEach((session) => {
            if (session.teacher_id) {
                grouped.set(session.teacher_id, [
                    ...(grouped.get(session.teacher_id) ?? []),
                    session,
                ]);
            }
        });

        return grouped;
    }, [sessions]);

    const shown = teachers.filter((t) =>
        matchesSearch(search, t.full_name, t.employee_no),
    );

    async function downloadAll() {
        setProgress(`0 / ${shown.length}`);
        try {
            await exportManyAsPdf(
                shown.map((t) => `teacher-grid-${t.id}`),
                'teacher-timetables',
                (done, total) => setProgress(`${done} / ${total}`),
            );
        } finally {
            setProgress(null);
        }
    }

    return (
        <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
            <Head title="All Teacher Timetables" />
            <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                <div>
                    <h1 className="text-2xl font-semibold tracking-tight">
                        All Teacher Timetables
                    </h1>
                    <p className="mt-1 text-sm text-muted-foreground">
                        {term?.name ?? 'No current term'} · download one PDF
                        with a page for every teacher, ready to print and hand
                        out.
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    <ColorfulToggle />
                    <Button
                        onClick={downloadAll}
                        disabled={progress !== null || shown.length === 0}
                    >
                        <FileDown className="size-4" />
                        {progress
                            ? `Preparing ${progress}...`
                            : `Download all (${shown.length}) as PDF`}
                    </Button>
                </div>
            </div>

            <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Filter teachers..."
            />

            {shown.length === 0 && (
                <div className="flex flex-col items-center rounded-xl border py-12 text-center text-muted-foreground">
                    <Users className="mb-2 size-6" />
                    No teachers found.
                </div>
            )}

            <div className="flex flex-col gap-6">
                {shown.map((teacher) => (
                    <TeacherTimetableGrid
                        key={teacher.id}
                        id={`teacher-grid-${teacher.id}`}
                        teacher={teacher}
                        term={term}
                        instituteName={currentInstitute?.name}
                        weekDays={weekDays}
                        timeSlots={timeSlots}
                        sessions={sessionsByTeacher.get(teacher.id) ?? []}
                    />
                ))}
            </div>
        </div>
    );
}

AllTeachers.layout = { breadcrumbs };
