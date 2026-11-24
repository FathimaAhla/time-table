import { Head, router, useForm } from '@inertiajs/react';
import { GraduationCap } from 'lucide-react';
import { useState } from 'react';
import GradeController from '@/actions/App/Http/Controllers/GradeController';
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
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';
import type { Grade } from '@/types/timetable';
import { index as gradesIndex } from '@/routes/grades';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Grades', href: gradesIndex() },
];

type GradeForm = { name: string; level_order: string; status: Grade['status'] };

export default function GradesIndex({ grades }: { grades: Grade[] }) {
    const [search, setSearch] = useState('');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<Grade | null>(null);
    const [deleting, setDeleting] = useState<Grade | null>(null);
    const form = useForm<GradeForm>({
        name: '',
        level_order: '',
        status: 'active',
    });

    const rows = grades.filter((grade) =>
        matchesSearch(search, grade.name, `grade ${grade.name}`),
    );

    function openCreate() {
        setEditing(null);
        form.reset();
        form.clearErrors();
        setModalOpen(true);
    }

    function openEdit(grade: Grade) {
        setEditing(grade);
        form.clearErrors();
        form.setData({
            name: grade.name,
            level_order: String(grade.level_order),
            status: grade.status,
        });
        setModalOpen(true);
    }

    function submit() {
        const options = {
            preserveScroll: true,
            onSuccess: () => setModalOpen(false),
        };

        if (editing) {
            form.put(GradeController.update.url(editing.id), options);

            return;
        }

        form.post(GradeController.store().url, options);
    }

    return (
        <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
            <Head title="Grades" />
            <PageHeader
                title="Grades"
                description="School levels, numbered 1 to 13. Each grade has lettered classes (e.g. Grade 1 → 1A, 1B, 1C)."
                createLabel="New Grade"
                onCreate={openCreate}
            />
            <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search grades..."
            />

            <DataTable
                head={
                    <tr>
                        <th className="w-16">No</th>
                        <th>Grade</th>
                        <th>Classes</th>
                        <th>Status</th>
                        <th className="w-12" />
                    </tr>
                }
            >
                {rows.map((grade, index) => (
                    <tr key={grade.id}>
                        <td className="text-muted-foreground">{index + 1}</td>
                        <td className="font-medium">Grade {grade.name}</td>
                        <td>{grade.classes_count ?? 0}</td>
                        <td>
                            <StatusBadge status={grade.status} />
                        </td>
                        <td className="text-right">
                            <RowActions
                                onEdit={() => openEdit(grade)}
                                onDelete={() => setDeleting(grade)}
                            />
                        </td>
                    </tr>
                ))}
                {rows.length === 0 && (
                    <EmptyRow
                        colSpan={5}
                        icon={<GraduationCap className="size-6" />}
                        title="No grades found"
                        hint="Try a different search or add your first grade."
                        createLabel="New Grade"
                        onCreate={openCreate}
                    />
                )}
            </DataTable>

            <FormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={editing ? 'Edit Grade' : 'Create Grade'}
                description="Use the grade number only, e.g. 1, 2, 10."
                submitLabel={editing ? 'Update Grade' : 'Create Grade'}
                processing={form.processing}
                onSubmit={submit}
            >
                <FormField label="Grade" error={form.errors.name}>
                    <Input
                        value={form.data.name}
                        onChange={(e) => form.setData('name', e.target.value)}
                        placeholder="e.g. 1"
                        autoFocus
                        required
                    />
                </FormField>
                <FormField
                    label="Sort order"
                    error={form.errors.level_order}
                    hint="Leave empty to sort by the grade number."
                >
                    <Input
                        type="number"
                        value={form.data.level_order}
                        onChange={(e) =>
                            form.setData('level_order', e.target.value)
                        }
                        placeholder="e.g. 1"
                        required={Boolean(editing)}
                    />
                </FormField>
                {editing && (
                    <FormField label="Status" error={form.errors.status}>
                        <Select
                            value={form.data.status}
                            onValueChange={(value) =>
                                form.setData('status', value as Grade['status'])
                            }
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="active">Active</SelectItem>
                                <SelectItem value="inactive">
                                    Inactive
                                </SelectItem>
                            </SelectContent>
                        </Select>
                    </FormField>
                )}
            </FormModal>

            <ConfirmDeleteModal
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Delete Grade"
                message={`Delete Grade ${deleting?.name}? Its classes must be moved or removed first.`}
                onConfirm={() =>
                    deleting &&
                    router.delete(GradeController.destroy.url(deleting.id), {
                        preserveScroll: true,
                    })
                }
            />
        </div>
    );
}

GradesIndex.layout = { breadcrumbs };
