import { subjectColor, tint } from '@/lib/subject-color';
import type {
    Teacher,
    Term,
    TimeSlot,
    TimetableSession,
    WeekDay,
} from '@/types/timetable';

/**
 * One teacher's week: which class and subject they teach in each period.
 * Rendered with a plain white "paper" look so it exports cleanly to PDF/PNG.
 */
export function TeacherTimetableGrid({
    id,
    teacher,
    term,
    instituteName,
    weekDays,
    timeSlots,
    sessions,
}: {
    id: string;
    teacher: Teacher;
    term: Term | null;
    instituteName?: string | null;
    weekDays: WeekDay[];
    timeSlots: TimeSlot[];
    sessions: TimetableSession[];
}) {
    const sessionAt = (dayId: number, slotId: number) =>
        sessions.find(
            (s) => s.week_day_id === dayId && s.time_slot_id === slotId,
        );

    return (
        <div
            id={id}
            className="overflow-x-auto rounded-xl border bg-background p-4"
        >
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b pb-3">
                <div>
                    {instituteName && (
                        <div className="text-lg font-bold">{instituteName}</div>
                    )}
                    <div className="text-base font-semibold">
                        {teacher.full_name}
                    </div>
                    <div className="text-xs text-muted-foreground">
                        {teacher.employee_no}
                        {teacher.subjects?.length
                            ? ` · ${teacher.subjects.map((s) => s.name).join(', ')}`
                            : ''}
                    </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                    <div>{term?.name ?? 'No current term'}</div>
                    <div>
                        {sessions.length} / {teacher.max_periods_per_week}{' '}
                        periods per week
                    </div>
                </div>
            </div>

            <div className="overflow-x-auto">
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-10 w-20 border bg-muted p-2 text-left sm:w-28">
                                Time
                            </th>
                            {weekDays.map((d) => (
                                <th
                                    key={d.id}
                                    className="min-w-24 border bg-muted/50 p-2 text-left sm:min-w-0"
                                >
                                    {d.name}
                                </th>
                            ))}
                        </tr>
                    </thead>
                    <tbody>
                        {timeSlots.map((slot) => (
                            <tr key={slot.id}>
                                <td className="sticky left-0 z-10 border bg-background p-1.5 align-top font-mono text-[11px] sm:p-2 sm:text-xs">
                                    <div className="whitespace-nowrap">
                                        {slot.start_time.slice(0, 5)}
                                    </div>
                                    <div className="whitespace-nowrap text-muted-foreground">
                                        {slot.end_time.slice(0, 5)}
                                    </div>
                                </td>
                                {slot.slot_type === 'fixed' ? (
                                    <td
                                        colSpan={weekDays.length}
                                        className="border bg-orange-50 p-2 text-left text-xs font-medium text-orange-800 sm:text-center dark:bg-orange-900/20 dark:text-orange-300"
                                    >
                                        {slot.fixed_activity_name}
                                    </td>
                                ) : (
                                    weekDays.map((day) => {
                                        const session = sessionAt(
                                            day.id,
                                            slot.id,
                                        );
                                        const schoolClass =
                                            session?.timetable?.school_class;

                                        return (
                                            <td
                                                key={day.id}
                                                className="border p-1 align-top"
                                            >
                                                {session ? (
                                                    <div
                                                        className="flex min-h-12 flex-col justify-center rounded-md border-l-4 p-2 text-xs"
                                                        style={{
                                                            backgroundColor:
                                                                tint(
                                                                    subjectColor(
                                                                        session.subject,
                                                                    ),
                                                                    0.14,
                                                                ),
                                                            borderLeftColor:
                                                                subjectColor(
                                                                    session.subject,
                                                                ),
                                                        }}
                                                    >
                                                        <span className="font-semibold">
                                                            {schoolClass
                                                                ? `${schoolClass.grade?.name ?? ''}${schoolClass.name}`
                                                                : ''}
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            {
                                                                session.subject
                                                                    ?.name
                                                            }
                                                        </span>
                                                    </div>
                                                ) : (
                                                    <div className="flex min-h-12 items-center justify-center text-xs text-muted-foreground/60">
                                                        Free
                                                    </div>
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
}
