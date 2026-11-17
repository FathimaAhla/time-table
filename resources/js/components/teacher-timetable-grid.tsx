import type { Teacher, Term, TimeSlot, TimetableSession, WeekDay } from '@/types/timetable';

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
    const sessionAt = (dayId: number, slotId: number) => sessions.find((s) => s.week_day_id === dayId && s.time_slot_id === slotId);

    return (
        <div id={id} className="overflow-x-auto rounded-xl border bg-background p-4">
            <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b pb-3">
                <div>
                    {instituteName && <div className="text-lg font-bold">{instituteName}</div>}
                    <div className="text-base font-semibold">{teacher.full_name}</div>
                    <div className="text-xs text-muted-foreground">
                        {teacher.employee_no}
                        {teacher.subjects?.length ? ` · ${teacher.subjects.map((s) => s.name).join(', ')}` : ''}
                    </div>
                </div>
                <div className="text-right text-xs text-muted-foreground">
                    <div>{term?.name ?? 'No current term'}</div>
                    <div>
                        {sessions.length} / {teacher.max_periods_per_week} periods per week
                    </div>
                </div>
            </div>

            <table className="w-full border-collapse text-sm">
                <thead>
                    <tr>
                        <th className="w-28 border bg-muted/50 p-2 text-left">Time</th>
                        {weekDays.map((d) => (
                            <th key={d.id} className="border bg-muted/50 p-2 text-left">
                                {d.name}
                            </th>
                        ))}
                    </tr>
                </thead>
                <tbody>
                    {timeSlots.map((slot) => (
                        <tr key={slot.id}>
                            <td className="border p-2 align-top font-mono text-xs">
                                {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                            </td>
                            {slot.slot_type === 'fixed' ? (
                                <td
                                    colSpan={weekDays.length}
                                    className="border bg-orange-50 p-2 text-center text-xs font-medium text-orange-800 dark:bg-orange-900/20 dark:text-orange-300"
                                >
                                    {slot.fixed_activity_name}
                                </td>
                            ) : (
                                weekDays.map((day) => {
                                    const session = sessionAt(day.id, slot.id);
                                    const schoolClass = session?.timetable?.school_class;

                                    return (
                                        <td key={day.id} className="border p-1 align-top">
                                            {session ? (
                                                <div
                                                    className="flex min-h-12 flex-col justify-center rounded-md border-l-4 bg-emerald-50 p-2 text-xs dark:bg-emerald-900/30"
                                                    style={{ borderLeftColor: session.subject?.color_hex ?? '#10b981' }}
                                                >
                                                    <span className="font-semibold">
                                                        {schoolClass ? `${schoolClass.grade?.name ?? ''}${schoolClass.name}` : ''}
                                                    </span>
                                                    <span className="text-muted-foreground">{session.subject?.name}</span>
                                                </div>
                                            ) : (
                                                <div className="flex min-h-12 items-center justify-center text-xs text-muted-foreground/60">Free</div>
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
    );
}
