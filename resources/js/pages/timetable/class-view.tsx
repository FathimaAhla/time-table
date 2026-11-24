import { Head, router, usePage } from '@inertiajs/react';
import { AlertTriangle, Lock, Unlock } from 'lucide-react';
import { useState } from 'react';
import TimetableController from '@/actions/App/Http/Controllers/TimetableController';
import { ExportMenu } from '@/components/export-menu';
import { Button } from '@/components/ui/button';
import { subjectColor, tint } from '@/lib/subject-color';
import type { BreadcrumbItem } from '@/types';
import type {
    SchoolClass,
    TeacherAssignment,
    Term,
    TimeSlot,
    Timetable,
    TimetableSession,
    WeekDay,
} from '@/types/timetable';
import { index as timetableIndex } from '@/routes/timetable';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Timetable', href: timetableIndex() },
];

export default function ClassView({
    term,
    schoolClass,
    timetable,
    weekDays,
    timeSlots,
    sessions,
    pendingAssignments,
}: {
    term: Term | null;
    schoolClass: SchoolClass;
    timetable: Timetable | null;
    weekDays: WeekDay[];
    timeSlots: TimeSlot[];
    sessions: TimetableSession[];
    pendingAssignments: TeacherAssignment[];
}) {
    const [dragSessionId, setDragSessionId] = useState<number | null>(null);
    const { currentInstitute, canManage } = usePage().props;

    function sessionAt(dayId: number, slotId: number) {
        return sessions.find(
            (s) => s.week_day_id === dayId && s.time_slot_id === slotId,
        );
    }

    function generate() {
        router.post(TimetableController.generate.url(schoolClass.id));
    }

    function sync() {
        router.post(TimetableController.sync.url(schoolClass.id));
    }

    /**
     * Touch-friendly alternative to drag and drop: tap a period to select it,
     * then tap another period (swap) or an empty cell (move). Tap it again to cancel.
     */
    function onCellTap(
        dayId: number,
        slotId: number,
        session?: TimetableSession,
    ) {
        if (!canManage) return;

        if (dragSessionId === null) {
            if (session && !session.is_locked) setDragSessionId(session.id);

            return;
        }

        onDrop(dayId, slotId, session);
    }

    function onDrop(
        dayId: number,
        slotId: number,
        targetSession?: TimetableSession,
    ) {
        if (dragSessionId === null) return;
        const dragged = sessions.find((s) => s.id === dragSessionId);
        setDragSessionId(null);
        if (!dragged) return;

        if (targetSession && targetSession.id !== dragged.id) {
            router.post(TimetableController.swap.url(), {
                session_id_a: dragged.id,
                session_id_b: targetSession.id,
            });
            return;
        }

        if (targetSession?.id === dragged.id) return;

        router.post(TimetableController.move.url(), {
            session_id: dragged.id,
            week_day_id: dayId,
            time_slot_id: slotId,
        });
    }

    function toggleLock(session: TimetableSession) {
        router.post(TimetableController.toggleLock.url(session.id));
    }

    return (
        <div className="flex flex-1 flex-col gap-4 p-4">
            <Head
                title={`Timetable - ${schoolClass.grade?.name}${schoolClass.name}`}
            />

            <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                    <h1 className="text-xl font-semibold">
                        Class {schoolClass.grade?.name}
                        {schoolClass.name} Timetable
                    </h1>
                    <p className="text-sm text-muted-foreground">
                        {term ? term.name : 'No current term'}
                    </p>
                </div>
                <div className="flex flex-wrap gap-2">
                    {canManage && timetable?.is_out_of_sync && (
                        <Button variant="secondary" onClick={sync}>
                            Sync new changes
                        </Button>
                    )}
                    {canManage && (
                        <Button variant="outline" onClick={generate}>
                            Full re-generate
                        </Button>
                    )}
                    <ExportMenu
                        elementId="class-timetable-grid"
                        filename={`${schoolClass.grade?.name}-${schoolClass.name}-timetable`}
                    />
                </div>
            </div>

            {canManage && timetable?.is_out_of_sync && (
                <div className="flex items-start gap-2 rounded-lg border border-amber-300 bg-amber-50 p-3 text-sm text-amber-900 dark:border-amber-700 dark:bg-amber-900/30 dark:text-amber-200">
                    <AlertTriangle className="mt-0.5 size-4 shrink-0" />
                    <div>
                        This timetable is out of sync:{' '}
                        {pendingAssignments.length} assignment(s) are new,
                        changed, or not yet fully scheduled.{' '}
                        {pendingAssignments.map((a) => (
                            <span
                                key={a.id}
                                className="mr-2 inline-block rounded bg-white px-1.5 py-0.5 text-xs dark:bg-neutral-900"
                            >
                                {a.subject?.name} · {a.teacher?.full_name}
                            </span>
                        ))}
                        Use <strong>Sync new changes</strong> to place only
                        these into free slots, or{' '}
                        <strong>Full re-generate</strong> to rebuild the whole
                        timetable (locked cells are preserved either way).
                    </div>
                </div>
            )}

            <div
                id="class-timetable-grid"
                className="overflow-x-auto rounded-lg border bg-background p-2"
            >
                {currentInstitute && (
                    <div className="mb-2 text-center">
                        <div className="text-lg font-bold">
                            {currentInstitute.name}
                        </div>
                        <div className="text-xs tracking-wide text-muted-foreground uppercase">
                            Class {schoolClass.grade?.name}
                            {schoolClass.name} Timetable
                        </div>
                    </div>
                )}
                <table className="w-full border-collapse text-sm">
                    <thead>
                        <tr>
                            <th className="sticky left-0 z-10 w-20 border bg-muted p-2 text-left sm:w-32">
                                Time
                            </th>
                            {weekDays.map((d) => (
                                <th
                                    key={d.id}
                                    className="min-w-28 border bg-muted/50 p-2 text-left sm:min-w-0"
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
                                    {slot.slot_type === 'period' && (
                                        <div className="mt-0.5 text-muted-foreground">
                                            {slot.name}
                                        </div>
                                    )}
                                </td>
                                {slot.slot_type === 'fixed' ? (
                                    <td
                                        colSpan={weekDays.length}
                                        className="border bg-orange-50 p-2 text-left font-medium text-orange-800 sm:text-center dark:bg-orange-900/20 dark:text-orange-300"
                                    >
                                        {slot.fixed_activity_name}
                                    </td>
                                ) : (
                                    weekDays.map((day) => {
                                        const session = sessionAt(
                                            day.id,
                                            slot.id,
                                        );
                                        return (
                                            <td
                                                key={day.id}
                                                className="border p-1 align-top"
                                                onDragOver={(e) =>
                                                    e.preventDefault()
                                                }
                                                onDrop={() =>
                                                    onDrop(
                                                        day.id,
                                                        slot.id,
                                                        session,
                                                    )
                                                }
                                                onClick={() =>
                                                    onCellTap(
                                                        day.id,
                                                        slot.id,
                                                        session,
                                                    )
                                                }
                                            >
                                                {session ? (
                                                    <div
                                                        draggable={
                                                            canManage &&
                                                            !session.is_locked
                                                        }
                                                        onDragStart={() =>
                                                            setDragSessionId(
                                                                session.id,
                                                            )
                                                        }
                                                        onDragEnd={() =>
                                                            setDragSessionId(
                                                                null,
                                                            )
                                                        }
                                                        className={
                                                            'group relative flex min-h-14 flex-col justify-center rounded-md p-2 text-xs ' +
                                                            (session.is_locked
                                                                ? 'cursor-not-allowed border border-dashed bg-neutral-100 dark:bg-neutral-800'
                                                                : 'cursor-pointer border border-l-4 hover:shadow-md sm:cursor-grab') +
                                                            (dragSessionId ===
                                                            session.id
                                                                ? ' ring-2 ring-primary'
                                                                : '')
                                                        }
                                                        style={
                                                            session.is_locked
                                                                ? undefined
                                                                : {
                                                                      backgroundColor:
                                                                          tint(
                                                                              subjectColor(
                                                                                  session.subject,
                                                                              ),
                                                                              0.14,
                                                                          ),
                                                                      borderColor:
                                                                          tint(
                                                                              subjectColor(
                                                                                  session.subject,
                                                                              ),
                                                                              0.35,
                                                                          ),
                                                                      borderLeftColor:
                                                                          subjectColor(
                                                                              session.subject,
                                                                          ),
                                                                  }
                                                        }
                                                    >
                                                        <span className="font-medium">
                                                            {
                                                                session.subject
                                                                    ?.name
                                                            }
                                                        </span>
                                                        <span className="text-muted-foreground">
                                                            {
                                                                session.teacher
                                                                    ?.full_name
                                                            }
                                                        </span>
                                                        {canManage && (
                                                            <button
                                                                onClick={(
                                                                    e,
                                                                ) => {
                                                                    e.stopPropagation();
                                                                    toggleLock(
                                                                        session,
                                                                    );
                                                                }}
                                                                className="absolute top-0.5 right-0.5 rounded p-1.5 opacity-70 transition sm:p-1 sm:opacity-0 sm:group-hover:opacity-100"
                                                                title={
                                                                    session.is_locked
                                                                        ? 'Unlock'
                                                                        : 'Lock cell'
                                                                }
                                                                aria-label={
                                                                    session.is_locked
                                                                        ? 'Unlock cell'
                                                                        : 'Lock cell'
                                                                }
                                                            >
                                                                {session.is_locked ? (
                                                                    <Lock className="size-3.5" />
                                                                ) : (
                                                                    <Unlock className="size-3.5" />
                                                                )}
                                                            </button>
                                                        )}
                                                    </div>
                                                ) : (
                                                    <div
                                                        className={
                                                            'min-h-14 rounded-md border border-dashed' +
                                                            (dragSessionId !==
                                                            null
                                                                ? ' bg-primary/5'
                                                                : '')
                                                        }
                                                    />
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

            <p className="text-xs text-muted-foreground">
                Drag a period onto another to swap it, or onto an empty cell to
                move it. On a phone, tap a period, then tap where it should go.
                Locked periods (padlock icon) are skipped by sync and
                re-generation.
            </p>
        </div>
    );
}

ClassView.layout = { breadcrumbs };
