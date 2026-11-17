import { Head, router, useForm } from '@inertiajs/react';
import { ListChecks } from 'lucide-react';
import { useMemo, useState } from 'react';
import TeacherAssignmentController from '@/actions/App/Http/Controllers/TeacherAssignmentController';
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
} from '@/components/data-page';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import type { BreadcrumbItem } from '@/types';
import type { SchoolClass, Subject, Teacher, TeacherAssignment, Term } from '@/types/timetable';
import { index as assignmentsIndex } from '@/routes/assignments';

const breadcrumbs: BreadcrumbItem[] = [{ title: 'Subject Allocation', href: assignmentsIndex() }];

const syncBadge: Record<TeacherAssignment['sync_status'], { label: string; className: string }> = {
    synced: { label: 'On timetable', className: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
    pending: { label: 'Needs scheduling', className: 'bg-amber-50 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
    orphaned: { label: 'Removed', className: 'bg-red-50 text-red-700 dark:bg-red-900/30 dark:text-red-300' },
};

type AssignmentForm = { school_class_id: string; subject_id: string; teacher_id: string; weekly_periods: string };

const emptyForm: AssignmentForm = { school_class_id: '', subject_id: '', teacher_id: '', weekly_periods: '4' };

function classLabel(schoolClass?: SchoolClass): string {
    return schoolClass ? `${schoolClass.grade?.name ?? ''}${schoolClass.name}` : '';
}

export default function Assignments({
    term,
    assignments,
    classes,
    subjects,
    teachers,
}: {
    term: Term | null;
    assignments: TeacherAssignment[];
    classes: SchoolClass[];
    subjects: Subject[];
    teachers: Teacher[];
}) {
    const [search, setSearch] = useState('');
    const [classFilter, setClassFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<TeacherAssignment | null>(null);
    const [deleting, setDeleting] = useState<TeacherAssignment | null>(null);
    const form = useForm<AssignmentForm>(emptyForm);

    const qualifiedTeachers = useMemo(() => {
        if (!form.data.subject_id) {
            return teachers;
        }

        return teachers.filter((t) => t.subjects?.some((s) => s.id === Number(form.data.subject_id)));
    }, [form.data.subject_id, teachers]);

    const teacherLoad = useMemo(() => {
        const load = new Map<number, number>();
        assignments.forEach((a) => {
            if (a.status === 'active') {
                load.set(a.teacher_id, (load.get(a.teacher_id) ?? 0) + a.weekly_periods);
            }
        });

        return load;
    }, [assignments]);

    const rows = assignments.filter(
        (a) =>
            (classFilter === 'all' || String(a.school_class_id) === classFilter) &&
            matchesSearch(search, classLabel(a.school_class), a.subject?.name, a.teacher?.full_name),
    );

    function openCreate() {
        setEditing(null);
        form.setData({ ...emptyForm, school_class_id: classFilter !== 'all' ? classFilter : '' });
        form.clearErrors();
        setModalOpen(true);
    }

    function openEdit(assignment: TeacherAssignment) {
        setEditing(assignment);
        form.clearErrors();
        form.setData({
            school_class_id: String(assignment.school_class_id),
            subject_id: String(assignment.subject_id),
            teacher_id: String(assignment.teacher_id),
            weekly_periods: String(assignment.weekly_periods),
        });
        setModalOpen(true);
    }

    function submit() {
        const options = { preserveScroll: true, onSuccess: () => setModalOpen(false) };

        if (editing) {
            form.put(TeacherAssignmentController.update.url(editing.id), options);

            return;
        }

        form.transform((data) => ({ ...data, term_id: term?.id }));
        form.post(TeacherAssignmentController.store().url, options);
    }

    if (!term) {
        return (
            <div className="p-4 md:p-6">
                <Head title="Subject Allocation" />
                <p className="text-muted-foreground">No current school term is set up yet.</p>
            </div>
        );
    }

    return (
        <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
            <Head title="Subject Allocation" />
            <PageHeader
                title="Subject Allocation"
                description={`${term.name}: which teacher teaches which subject to each class, and how many periods a week.`}
                createLabel="Allocate Subject"
                onCreate={openCreate}
            />
            <SearchBar value={search} onChange={setSearch} placeholder="Search class, subject or teacher...">
                <Select value={classFilter} onValueChange={setClassFilter}>
                    <SelectTrigger className="w-full md:w-44">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All classes</SelectItem>
                        {classes.map((c) => (
                            <SelectItem key={c.id} value={String(c.id)}>
                                {classLabel(c)}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </SearchBar>

            <DataTable
                head={
                    <tr>
                        <th className="w-16">No</th>
                        <th>Class</th>
                        <th>Subject</th>
                        <th>Teacher</th>
                        <th>Periods / week</th>
                        <th>Timetable</th>
                        <th className="w-12" />
                    </tr>
                }
            >
                {rows.map((a, index) => (
                    <tr key={a.id}>
                        <td className="text-muted-foreground">{index + 1}</td>
                        <td>
                            <span className="inline-flex rounded-md bg-primary/10 px-2 py-1 text-xs font-semibold text-primary">
                                {classLabel(a.school_class)}
                            </span>
                        </td>
                        <td className="font-medium">{a.subject?.name}</td>
                        <td>{a.teacher?.full_name}</td>
                        <td>{a.weekly_periods}</td>
                        <td>
                            <span className={`rounded-full px-2 py-0.5 text-xs font-medium ${syncBadge[a.sync_status].className}`}>
                                {syncBadge[a.sync_status].label}
                            </span>
                        </td>
                        <td className="text-right">
                            <RowActions onEdit={() => openEdit(a)} onDelete={() => setDeleting(a)} />
                        </td>
                    </tr>
                ))}
                {rows.length === 0 && (
                    <EmptyRow
                        colSpan={7}
                        icon={<ListChecks className="size-6" />}
                        title="No subject allocations found"
                        hint="Allocate a subject and teacher to a class to start building its timetable."
                        createLabel="Allocate Subject"
                        onCreate={openCreate}
                    />
                )}
            </DataTable>

            <FormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={editing ? 'Edit Allocation' : 'Allocate Subject'}
                description="Only teachers qualified for the chosen subject are listed."
                submitLabel={editing ? 'Update Allocation' : 'Allocate'}
                processing={form.processing}
                onSubmit={submit}
            >
                <FormField label="Class" error={form.errors.school_class_id}>
                    <Select value={form.data.school_class_id} onValueChange={(value) => form.setData('school_class_id', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select class" />
                        </SelectTrigger>
                        <SelectContent>
                            {classes.map((c) => (
                                <SelectItem key={c.id} value={String(c.id)}>
                                    {classLabel(c)}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>
                <FormField label="Subject" error={form.errors.subject_id}>
                    <Select
                        value={form.data.subject_id}
                        onValueChange={(value) => form.setData((data) => ({ ...data, subject_id: value, teacher_id: '' }))}
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="Select subject" />
                        </SelectTrigger>
                        <SelectContent>
                            {subjects.map((s) => (
                                <SelectItem key={s.id} value={String(s.id)}>
                                    {s.name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>
                <FormField label="Teacher" error={form.errors.teacher_id}>
                    <Select value={form.data.teacher_id} onValueChange={(value) => form.setData('teacher_id', value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="Select teacher" />
                        </SelectTrigger>
                        <SelectContent>
                            {qualifiedTeachers.map((t) => (
                                <SelectItem key={t.id} value={String(t.id)}>
                                    {t.full_name} ({teacherLoad.get(t.id) ?? 0}/{t.max_periods_per_week} periods/wk)
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>
                <FormField label="Periods per week" error={form.errors.weekly_periods}>
                    <Input
                        type="number"
                        min={1}
                        max={20}
                        value={form.data.weekly_periods}
                        onChange={(e) => form.setData('weekly_periods', e.target.value)}
                    />
                </FormField>
            </FormModal>

            <ConfirmDeleteModal
                open={deleting !== null}
                onOpenChange={(open) => !open && setDeleting(null)}
                title="Remove Allocation"
                message={`Remove ${deleting?.subject?.name} for class ${classLabel(deleting?.school_class)}? The class timetable will be flagged for review.`}
                onConfirm={() => deleting && router.delete(TeacherAssignmentController.destroy.url(deleting.id), { preserveScroll: true })}
            />
        </div>
    );
}

Assignments.layout = { breadcrumbs };
