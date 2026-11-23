import { Head, router, useForm } from '@inertiajs/react';
import { BookOpen } from 'lucide-react';
import { useState } from 'react';
import SubjectController from '@/actions/App/Http/Controllers/SubjectController';
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
import type { Subject } from '@/types/timetable';
import { index as subjectsIndex } from '@/routes/subjects';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Subjects', href: subjectsIndex() }];

type SubjectForm = {
    name: string;
    code: string;
    type: Subject['type'];
    color_hex: string;
    status: Subject['status'];
};

const emptyForm: SubjectForm = { name: '', code: '', type: 'core', color_hex: '#6366f1', status: 'active' };

export default function SubjectsIndex({ subjects }: { subjects: Subject[] }) {
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Subject | null>(null);
    const [deleting, setDeleting] = useState<Subject | null>(null);
    const form = useForm<SubjectForm>(emptyForm);

    const rows = subjects.filter((s) => matchesSearch(search, s.name, s.code, s.type));

    function openCreate() {
        setEditing(null);
        form.setData(emptyForm);
        form.clearErrors();
        setModalOpen(true);
    }

    function openEdit(subject: Subject) {
        setEditing(subject);
        form.clearErrors();
        form.setData({
            name: subject.name,
            code: subject.code,
            type: subject.type,
            color_hex: subject.color_hex ?? '#6366f1',
            status: subject.status,
        });
        setModalOpen(true);
    }

    function submit() {
        const options = { preserveScroll: true, onSuccess: () => setModalOpen(false) };

        if (editing) {
            form.put(SubjectController.update.url(editing.id), options);

            return;
        }

        form.post(SubjectController.store().url, options);
    }

    return (
        <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
            <Head title="Subjects" />
            <PageHeader
                title="Subjects"
                description="Every subject taught in the school."
                createLabel="New Subject"
                onCreate={openCreate}
            />
            <SearchBar value={search} onChange={setSearch} placeholder="Search subjects..." />

            <DataTable
                head={
                    <tr>
                        <th className="w-16">No</th>
                        <th>Subject</th>
                        <th>Code</th>
                        <th>Type</th>
                        <th>Status</th>
                        <th className="w-12" />
                    </tr>
                }
            >
                {rows.map((s, index) => (
                    <tr key={s.id}>
                        <td className="text-muted-foreground">{index + 1}</td>
                        <td>
                            <div className="flex items-center gap-2 font-medium">
                                <span className="size-2.5 rounded-full" style={{ backgroundColor: s.color_hex ?? 'var(--muted-foreground)' }} />
                                {s.name}
                            </div>
                        </td>
                        <td className="font-mono text-xs">{s.code}</td>
                        <td className="capitalize">{s.type}</td>
                        <td>
                            <StatusBadge status={s.status} />
                        </td>
                        <td className="text-right">
                            <RowActions onEdit={() => openEdit(s)} onDelete={() => setDeleting(s)} />
                        </td>
                    </tr>
                ))}
                {rows.length === 0 && (
                    <EmptyRow
                        colSpan={6}
                        icon={<BookOpen className="size-6" />}
                        title="No subjects found"
                        hint="Try a different search or add a subject."
                        createLabel="New Subject"
                        onCreate={openCreate}
                    />
                )}
            </DataTable>

            <FormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={editing ? 'Edit Subject' : 'Create Subject'}
                submitLabel={editing ? 'Update Subject' : 'Create Subject'}
                processing={form.processing}
                onSubmit={submit}
            >
                <FormField label="Subject name" error={form.errors.name}>
                    <Input value={form.data.name} onChange={(e) => form.setData('name', e.target.value)} placeholder="e.g. Mathematics" autoFocus required />
                </FormField>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Code" error={form.errors.code}>
                        <Input
                            value={form.data.code}
                            onChange={(e) => form.setData('code', e.target.value.toUpperCase())}
                            placeholder="e.g. MATH"
                            required
                        />
                    </FormField>
                    <FormField label="Type" error={form.errors.type}>
                        <Select value={form.data.type} onValueChange={(value) => form.setData('type', value as Subject['type'])}>
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="core">Core</SelectItem>
                                <SelectItem value="elective">Elective</SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <FormField label="Colour" error={form.errors.color_hex}>
                        <Input
                            type="color"
                            value={form.data.color_hex}
                            onChange={(e) => form.setData('color_hex', e.target.value)}
                            className="h-9 p-1"
                        />
                    </FormField>
                    {editing && (
                        <FormField label="Status" error={form.errors.status}>
                            <Select value={form.data.status} onValueChange={(value) => form.setData('status', value as Subject['status'])}>
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
            </FormModal>

            <ConfirmDeleteModal
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete Subject"
                message={`Delete ${deleting?.name}? Teacher assignments for it will stop being scheduled.`}
                onConfirm={() => deleting && router.delete(SubjectController.destroy.url(deleting.id), { preserveScroll: true })}
            />
        </div>
    );
}

SubjectsIndex.layout = { breadcrumbs };
