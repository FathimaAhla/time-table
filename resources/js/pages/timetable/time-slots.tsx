import { Head, router, useForm } from '@inertiajs/react';
import { Clock } from 'lucide-react';
import { useState } from 'react';
import TimeSlotController from '@/actions/App/Http/Controllers/TimeSlotController';
import { ConfirmDeleteModal, DataTable, EmptyRow, FormField, FormModal, PageHeader, RowActions } from '@/components/data-page';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';
import type { TimeSlot, WeekDay } from '@/types/timetable';
import { index as timeSlotsIndex } from '@/routes/time-slots';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'School Day', href: timeSlotsIndex() }];

type SlotForm = {
    slot_type: TimeSlot['slot_type'];
    name: string;
    fixed_activity_name: string;
    start_time: string;
    end_time: string;
    sort_order: string;
};

function slotLabel(slot: TimeSlot): string {
    return (slot.slot_type === 'fixed' ? slot.fixed_activity_name : slot.name) ?? '';
}

export default function TimeSlotsIndex({ timeSlots, weekDays }: { timeSlots: TimeSlot[]; weekDays: WeekDay[] }) {
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<TimeSlot | null>(null);
    const [deleting, setDeleting] = useState<TimeSlot | null>(null);
    const form = useForm<SlotForm>({ slot_type: 'period', name: '', fixed_activity_name: '', start_time: '', end_time: '', sort_order: '' });

    function openCreate() {
        setEditing(null);
        const last = timeSlots[timeSlots.length - 1];
        form.setData({
            slot_type: 'period',
            name: '',
            fixed_activity_name: '',
            start_time: last ? last.end_time.slice(0, 5) : '',
            end_time: '',
            sort_order: String((last?.sort_order ?? 0) + 1),
        });
        form.clearErrors();
        setModalOpen(true);
    }

    function openEdit(slot: TimeSlot) {
        setEditing(slot);
        form.clearErrors();
        form.setData({
            slot_type: slot.slot_type,
            name: slot.name ?? '',
            fixed_activity_name: slot.fixed_activity_name ?? '',
            start_time: slot.start_time.slice(0, 5),
            end_time: slot.end_time.slice(0, 5),
            sort_order: String(slot.sort_order),
        });
        setModalOpen(true);
    }

    function submit() {
        form.transform((data) => ({
            ...data,
            name: data.name || (data.slot_type === 'fixed' ? data.fixed_activity_name : 'Period'),
            fixed_activity_name: data.slot_type === 'fixed' ? data.fixed_activity_name : null,
        }));

        const options = { preserveScroll: true, onSuccess: () => setModalOpen(false) };

        if (editing) {
            form.put(TimeSlotController.update.url(editing.id), options);

            return;
        }

        form.post(TimeSlotController.store().url, options);
    }

    return (
        <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
            <Head title="School Day" />
            <PageHeader
                title="School Day"
                description="The bell schedule: teaching periods and the breaks every class shares (assembly, interval, lunch)."
                createLabel="New Time Slot"
                onCreate={openCreate}
            />

            <div className="flex flex-wrap items-center gap-2 text-sm">
                <span className="font-medium">School days:</span>
                {weekDays.map((d) => (
                    <span key={d.id} className="rounded-full border px-3 py-0.5 text-xs">
                        {d.name}
                    </span>
                ))}
            </div>

            <DataTable
                head={
                    <tr>
                        <th className="w-16">Order</th>
                        <th>Name</th>
                        <th>Time</th>
                        <th>Type</th>
                        <th className="w-12" />
                    </tr>
                }
            >
                {timeSlots.map((slot) => (
                    <tr key={slot.id} className={slot.slot_type === 'fixed' ? 'bg-muted/30' : undefined}>
                        <td className="text-muted-foreground">{slot.sort_order}</td>
                        <td className="font-medium">{slotLabel(slot)}</td>
                        <td className="font-mono text-xs">
                            {slot.start_time.slice(0, 5)} – {slot.end_time.slice(0, 5)}
                        </td>
                        <td>
                            <span
                                className={
                                    slot.slot_type === 'period'
                                        ? 'rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300'
                                        : 'rounded-full bg-orange-50 px-2 py-0.5 text-xs font-medium text-orange-700 dark:bg-orange-900/30 dark:text-orange-300'
                                }
                            >
                                {slot.slot_type === 'period' ? 'Teaching period' : 'Break / activity'}
                            </span>
                        </td>
                        <td className="text-right">
                            <RowActions onEdit={() => openEdit(slot)} onDelete={() => setDeleting(slot)} />
                        </td>
                    </tr>
                ))}
                {timeSlots.length === 0 && (
                    <EmptyRow
                        colSpan={5}
                        icon={<Clock className="size-6" />}
                        title="No time slots yet"
                        hint="Add the periods and breaks that make up a school day."
                        createLabel="New Time Slot"
                        onCreate={openCreate}
                    />
                )}
            </DataTable>

            <FormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={editing ? 'Edit Time Slot' : 'Create Time Slot'}
                submitLabel={editing ? 'Update Time Slot' : 'Create Time Slot'}
                processing={form.processing}
                onSubmit={submit}
            >
                <FormField label="Type" error={form.errors.slot_type}>
                    <Select value={form.data.slot_type} onValueChange={(value) => form.setData('slot_type', value as TimeSlot['slot_type'])}>
                        <SelectTrigger>
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="period">Teaching period</SelectItem>
                            <SelectItem value="fixed">Break / activity</SelectItem>
                        </SelectContent>
                    </Select>
                </FormField>
                {form.data.slot_type === 'period' ? (
                    <FormField label="Name" error={form.errors.name}>
                        <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Period 1" />
                    </FormField>
                ) : (
                    <FormField label="Activity" error={form.errors.fixed_activity_name}>
                        <Input
                            value={form.data.fixed_activity_name}
                            onChange={(e) => form.setData('fixed_activity_name', e.target.value)}
                            placeholder="e.g. Lunch Break"
                            required
                        />
                    </FormField>
                )}
                <div className="grid grid-cols-3 gap-4">
                    <FormField label="Starts" error={form.errors.start_time}>
                        <Input type="time" value={form.data.start_time} onChange={(e) => form.setData('start_time', e.target.value)} required />
                    </FormField>
                    <FormField label="Ends" error={form.errors.end_time}>
                        <Input type="time" value={form.data.end_time} onChange={(e) => form.setData('end_time', e.target.value)} required />
                    </FormField>
                    <FormField label="Order" error={form.errors.sort_order}>
                        <Input type="number" value={form.data.sort_order} onChange={(e) => form.setData('sort_order', e.target.value)} />
                    </FormField>
                </div>
            </FormModal>

            <ConfirmDeleteModal
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete Time Slot"
                message={`Delete ${deleting ? slotLabel(deleting) : ''}? Lessons scheduled in it will be removed.`}
                onConfirm={() => deleting && router.delete(TimeSlotController.destroy.url(deleting.id), { preserveScroll: true })}
            />
        </div>
    );
}

TimeSlotsIndex.layout = { breadcrumbs };
