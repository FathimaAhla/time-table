import { Head, Link, router, useForm } from '@inertiajs/react';
import { CalendarDays, Users } from 'lucide-react';
import { useState } from 'react';
import TeacherController from '@/actions/App/Http/Controllers/TeacherController';
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
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';
import type { Subject, Teacher } from '@/types/timetable';
import { index as teachersIndex } from '@/routes/teachers';
import { teacher as teacherTimetable } from '@/routes/timetable';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Teachers', href: teachersIndex() }];

type TeacherForm = {
    employee_no: string;
    full_name: string;
    phone: string;
    email: string;
    qualification: string;
    max_periods_per_day: string;
    max_periods_per_week: string;
    subject_ids: number[];
    status: Teacher['status'];
};

const emptyForm: TeacherForm = {
    employee_no: '',
    full_name: '',
    phone: '',
    email: '',
    qualification: '',
    max_periods_per_day: '6',
    max_periods_per_week: '30',
    subject_ids: [],
    status: 'active',
};

export default function TeachersIndex({ teachers, subjects }: { teachers: Teacher[]; subjects: Subject[] }) {
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Teacher | null>(null);
    const [deleting, setDeleting] = useState<Teacher | null>(null);
    const form = useForm<TeacherForm>(emptyForm);

    const rows = teachers.filter((t) => matchesSearch(search, t.full_name, t.employee_no, ...(t.subjects?.map((s) => s.name) ?? [])));

    function openCreate() {
        setEditing(null);
        form.setData(emptyForm);
        form.clearErrors();
        setModalOpen(true);
    }

    function openEdit(teacher: Teacher) {
        setEditing(teacher);
        form.clearErrors();
        form.setData({
            employee_no: teacher.employee_no,
            full_name: teacher.full_name,
            phone: teacher.phone ?? '',
            email: teacher.email ?? '',
            qualification: teacher.qualification ?? '',
            max_periods_per_day: String(teacher.max_periods_per_day),
            max_periods_per_week: String(teacher.max_periods_per_week),
            subject_ids: teacher.subjects?.map((s) => s.id) ?? [],
            status: teacher.status,
        });
        setModalOpen(true);
    }

    function toggleSubject(id: number) {
        const ids = form.data.subject_ids;
        form.setData('subject_ids', ids.includes(id) ? ids.filter((s) => s !== id) : [...ids, id]);
    }

    function submit() {
        const options = { preserveScroll: true, onSuccess: () => setModalOpen(false) };

        if (editing) {
            form.put(TeacherController.update.url(editing.id), options);

            return;
        }

        form.post(TeacherController.store().url, options);
    }

    return (
        <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
            <Head title="Teachers" />
            <PageHeader
                title="Teachers"
                description="Teaching staff, the subjects each one is qualified to teach, and their weekly load."
                createLabel="New Teacher"
                onCreate={openCreate}
            />
            <SearchBar value={search} onChange={setSearch} placeholder="Search by name, employee no. or subject..." />

            <DataTable
                head={
                    <tr>
                        <th className="w-16">No</th>
                        <th>Teacher</th>
                        <th>Subjects</th>
                        <th>Periods (day / week)</th>
                        <th>Status</th>
                        <th className="w-12" />
                    </tr>
                }
            >
                {rows.map((t, index) => (
                    <tr key={t.id}>
                        <td className="text-muted-foreground">{index + 1}</td>
                        <td>
                            <div className="font-medium">{t.full_name}</div>
                            <div className="font-mono text-xs text-muted-foreground">{t.employee_no}</div>
                        </td>
                        <td>
                            <div className="flex max-w-sm flex-wrap gap-1">
                                {t.subjects?.length
                                    ? t.subjects.map((s) => (
                                          <span key={s.id} className="rounded-md border px-1.5 py-0.5 text-xs">
                                              {s.name}
                                          </span>
                                      ))
                                    : '—'}
                            </div>
                        </td>
                        <td>
                            {t.max_periods_per_day} / {t.max_periods_per_week}
                        </td>
                        <td>
                            <StatusBadge status={t.status} />
                        </td>
                        <td className="text-right">
                            <RowActions onEdit={() => openEdit(t)} onDelete={() => setDeleting(t)}>
                                <DropdownMenuItem asChild>
                                    <Link href={teacherTimetable(t.id)}>
                                        <CalendarDays className="size-4" />
                                        View timetable
                                    </Link>
                                </DropdownMenuItem>
                            </RowActions>
                        </td>
                    </tr>
                ))}
                {rows.length === 0 && (
                    <EmptyRow
                        colSpan={6}
                        icon={<Users className="size-6" />}
                        title="No teachers found"
                        hint="Try a different search or add a teacher."
                        createLabel="New Teacher"
                        onCreate={openCreate}
                    />
                )}
            </DataTable>

            <FormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={editing ? 'Edit Teacher' : 'Create Teacher'}
                submitLabel={editing ? 'Update Teacher' : 'Create Teacher'}
                processing={form.processing}
                onSubmit={submit}
                className="sm:max-w-xl"
            >
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <FormField label="Employee no." error={form.errors.employee_no}>
                        <Input value={form.data.employee_no} onChange={(e) => form.setData('employee_no', e.target.value)} placeholder="T-1001" required />
                    </FormField>
                    <div className="col-span-2">
                        <FormField label="Full name" error={form.errors.full_name}>
                            <Input value={form.data.full_name} onChange={(e) => form.setData('full_name', e.target.value)} placeholder="e.g. Mrs. Amara Perera" required />
                        </FormField>
                    </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Phone" error={form.errors.phone}>
                        <Input value={form.data.phone} onChange={(e) => form.setData('phone', e.target.value)} />
                    </FormField>
                    <FormField label="Email" error={form.errors.email}>
                        <Input type="email" value={form.data.email} onChange={(e) => form.setData('email', e.target.value)} />
                    </FormField>
                </div>
                <FormField label="Qualification" error={form.errors.qualification}>
                    <Input value={form.data.qualification} onChange={(e) => form.setData('qualification', e.target.value)} placeholder="e.g. B.Ed (Mathematics)" />
                </FormField>
                <div className="grid grid-cols-3 gap-4">
                    <FormField label="Max periods / day" error={form.errors.max_periods_per_day}>
                        <Input type="number" value={form.data.max_periods_per_day} onChange={(e) => form.setData('max_periods_per_day', e.target.value)} />
                    </FormField>
                    <FormField label="Max periods / week" error={form.errors.max_periods_per_week}>
                        <Input type="number" value={form.data.max_periods_per_week} onChange={(e) => form.setData('max_periods_per_week', e.target.value)} />
                    </FormField>
                    {editing && (
                        <FormField label="Status" error={form.errors.status}>
                            <Select value={form.data.status} onValueChange={(value) => form.setData('status', value as Teacher['status'])}>
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
                </div>
                <FormField label="Qualified subjects" error={form.errors.subject_ids}>
                    <div className="flex flex-wrap gap-2">
                        {subjects.map((s) => {
                            const selected = form.data.subject_ids.includes(s.id);

                            return (
                                <button
                                    type="button"
                                    key={s.id}
                                    onClick={() => toggleSubject(s.id)}
                                    className={
                                        'rounded-full border px-3 py-1 text-xs transition ' +
                                        (selected ? 'border-primary bg-primary text-primary-foreground' : 'hover:bg-muted')
                                    }
                                >
                                    {s.name}
                                </button>
                            );
                        })}
                    </div>
                </FormField>
            </FormModal>

            <ConfirmDeleteModal
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete Teacher"
                message={`Delete ${deleting?.full_name}? Their periods will be left without a teacher.`}
                onConfirm={() => deleting && router.delete(TeacherController.destroy.url(deleting.id), { preserveScroll: true })}
            />
        </div>
    );
}

TeachersIndex.layout = { breadcrumbs };
