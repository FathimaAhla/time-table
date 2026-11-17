import { Head, router, useForm } from '@inertiajs/react';
import { DoorOpen } from 'lucide-react';
import { useState } from 'react';
import ClassroomController from '@/actions/App/Http/Controllers/ClassroomController';
import {
    ConfirmDeleteModal,
    DataTable,
    EmptyRow,
    FormField,
    FormModal,
    matchesSearch,
    PageHeader,
    RowActions,
    SearchBar,
    StatusBadge,
} from '@/components/data-page';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';
import type { Classroom } from '@/types/timetable';
import { index as classroomsIndex } from '@/routes/classrooms';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Classrooms', href: classroomsIndex() }];

type ClassroomForm = { name: string; building: string; capacity: string; status: Classroom['status'] };

const emptyForm: ClassroomForm = { name: '', building: '', capacity: '', status: 'active' };

export default function ClassroomsIndex({ classrooms }: { classrooms: Classroom[] }) {
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Classroom | null>(null);
    const [deleting, setDeleting] = useState<Classroom | null>(null);
    const form = useForm<ClassroomForm>(emptyForm);

    const rows = classrooms.filter((room) => {
        const assigned = room.school_class ? `${room.school_class.grade?.name ?? ''}${room.school_class.name}` : '';

        return matchesSearch(search, room.name, room.building, assigned);
    });

    function openCreate() {
        setEditing(null);
        form.setData(emptyForm);
        form.clearErrors();
        setModalOpen(true);
    }

    function openEdit(room: Classroom) {
        setEditing(room);
        form.clearErrors();
        form.setData({ name: room.name, building: room.building ?? '', capacity: String(room.capacity), status: room.status });
        setModalOpen(true);
    }

    function submit() {
        const options = { preserveScroll: true, onSuccess: () => setModalOpen(false) };

        if (editing) {
            form.put(ClassroomController.update.url(editing.id), options);

            return;
        }

        form.post(ClassroomController.store().url, options);
    }

    return (
        <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
            <Head title="Classrooms" />
            <PageHeader
                title="Classrooms"
                description="The physical rooms in your school and how many students each one seats. Assign a room to a class from the Classes page."
                createLabel="New Classroom"
                onCreate={openCreate}
            />
            <SearchBar value={search} onChange={setSearch} placeholder="Search rooms, buildings or classes..." />

            <DataTable
                head={
                    <tr>
                        <th className="w-16">No</th>
                        <th>Room</th>
                        <th>Building</th>
                        <th>Seats</th>
                        <th>Assigned Class</th>
                        <th>Status</th>
                        <th className="w-12" />
                    </tr>
                }
            >
                {rows.map((room, index) => (
                    <tr key={room.id}>
                        <td className="text-muted-foreground">{index + 1}</td>
                        <td className="font-medium">{room.name}</td>
                        <td>{room.building ?? '—'}</td>
                        <td>{room.capacity}</td>
                        <td>
                            {room.school_class ? (
                                <span className="inline-flex rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                    {room.school_class.grade?.name}
                                    {room.school_class.name}
                                </span>
                            ) : (
                                <span className="text-muted-foreground">Available</span>
                            )}
                        </td>
                        <td>
                            <StatusBadge status={room.status} />
                        </td>
                        <td className="text-right">
                            <RowActions onEdit={() => openEdit(room)} onDelete={() => setDeleting(room)} />
                        </td>
                    </tr>
                ))}
                {rows.length === 0 && (
                    <EmptyRow
                        colSpan={7}
                        icon={<DoorOpen className="size-6" />}
                        title="No classrooms found"
                        hint="Add the rooms in your school so classes can be housed in them."
                        createLabel="New Classroom"
                        onCreate={openCreate}
                    />
                )}
            </DataTable>

            <FormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={editing ? 'Edit Classroom' : 'Create Classroom'}
                description="A room's seats limit how many students its class should hold."
                submitLabel={editing ? 'Update Classroom' : 'Create Classroom'}
                processing={form.processing}
                onSubmit={submit}
            >
                <FormField label="Room name" error={form.errors.name}>
                    <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Room 101" autoFocus required />
                </FormField>
                <FormField label="Building" error={form.errors.building}>
                    <Input value={form.data.building} onChange={(e) => form.setData('building', e.target.value)} placeholder="e.g. Main Block" />
                </FormField>
                <FormField label="Seats" error={form.errors.capacity}>
                    <Input
                        type="number"
                        min={1}
                        value={form.data.capacity}
                        onChange={(e) => form.setData('capacity', e.target.value)}
                        placeholder="e.g. 40"
                        required
                    />
                </FormField>
                {editing && (
                    <FormField label="Status" error={form.errors.status}>
                        <Select value={form.data.status} onValueChange={(value) => form.setData('status', value as Classroom['status'])}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">Inactive</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                )}
            </FormModal>

            <ConfirmDeleteModal
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete Classroom"
                message={`Delete ${deleting?.name}? Any class using it will be left without a room.`}
                onConfirm={() => deleting && router.delete(ClassroomController.destroy.url(deleting.id), { preserveScroll: true })}
            />
        </div>
    );
}

ClassroomsIndex.layout = { breadcrumbs };
