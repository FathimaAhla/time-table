import { Head, router, useForm } from '@inertiajs/react';
import { School } from 'lucide-react';
import { useState } from 'react';
import SchoolClassController from '@/actions/App/Http/Controllers/SchoolClassController';
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
import type { Classroom, Grade, SchoolClass, Teacher } from '@/types/timetable';
import { index as classesIndex } from '@/routes/classes';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Classes', href: classesIndex() },
];

const NONE = 'none';

type ClassForm = {
    grade_id: string;
    name: string;
    capacity: string;
    classroom_id: string;
    class_teacher_id: string;
    class_teacher_first_period: boolean;
    status: SchoolClass['status'];
};

const emptyForm: ClassForm = {
    grade_id: '',
    name: '',
    capacity: '',
    classroom_id: NONE,
    class_teacher_id: NONE,
    class_teacher_first_period: true,
    status: 'active',
};

function className(schoolClass: SchoolClass): string {
    return `${schoolClass.grade?.name ?? ''}${schoolClass.name}`;
}

export default function ClassesIndex({
    classes,
    grades,
    teachers,
    classrooms,
}: {
    classes: SchoolClass[];
    grades: Grade[];
    teachers: Teacher[];
    classrooms: Classroom[];
}) {
    const [search, setSearch] = useState('');
    const [gradeFilter, setGradeFilter] = useState('all');
    const [modalOpen, setModalOpen] = useState(false);
    const [editing, setEditing] = useState<SchoolClass | null>(null);
    const [deleting, setDeleting] = useState<SchoolClass | null>(null);
    const form = useForm<ClassForm>(emptyForm);

    const rows = classes.filter(
        (c) =>
            (gradeFilter === 'all' || String(c.grade_id) === gradeFilter) &&
            matchesSearch(
                search,
                className(c),
                c.class_teacher?.full_name,
                c.classroom?.name,
            ),
    );

    const takenClassroomIds = new Set(
        classes
            .filter((c) => c.id !== editing?.id && c.classroom_id)
            .map((c) => c.classroom_id),
    );
    const selectedRoom = classrooms.find(
        (room) => String(room.id) === form.data.classroom_id,
    );
    const overCapacity =
        selectedRoom &&
        form.data.capacity !== '' &&
        Number(form.data.capacity) > selectedRoom.capacity;
    const selectedGrade = grades.find(
        (g) => String(g.id) === form.data.grade_id,
    );

    function openCreate() {
        setEditing(null);
        form.setData({
            ...emptyForm,
            grade_id: gradeFilter !== 'all' ? gradeFilter : '',
        });
        form.clearErrors();
        setModalOpen(true);
    }

    function openEdit(schoolClass: SchoolClass) {
        setEditing(schoolClass);
        form.clearErrors();
        form.setData({
            grade_id: String(schoolClass.grade_id),
            name: schoolClass.name,
            capacity: schoolClass.capacity ? String(schoolClass.capacity) : '',
            classroom_id: schoolClass.classroom_id
                ? String(schoolClass.classroom_id)
                : NONE,
            class_teacher_id: schoolClass.class_teacher_id
                ? String(schoolClass.class_teacher_id)
                : NONE,
            class_teacher_first_period: schoolClass.class_teacher_first_period,
            status: schoolClass.status,
        });
        setModalOpen(true);
    }

    function submit() {
        form.transform((data) => ({
            ...data,
            name: data.name.trim().toUpperCase(),
            capacity: data.capacity || null,
            classroom_id: data.classroom_id === NONE ? null : data.classroom_id,
            class_teacher_id:
                data.class_teacher_id === NONE ? null : data.class_teacher_id,
        }));

        const options = {
            preserveScroll: true,
            onSuccess: () => setModalOpen(false),
        };

        if (editing) {
            form.put(SchoolClassController.update.url(editing.id), options);

            return;
        }

        form.post(SchoolClassController.store().url, options);
    }

    return (
        <div className="flex flex-1 flex-col gap-5 p-4 md:p-6">
            <Head title="Classes" />
            <PageHeader
                title="Classes"
                description="Each grade is split into lettered classes, e.g. Grade 1 → 1A, 1B, 1C. Give every class its classroom and class teacher."
                createLabel="New Class"
                onCreate={openCreate}
            />
            <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Search classes, teachers or rooms..."
            >
                <Select value={gradeFilter} onValueChange={setGradeFilter}>
                    <SelectTrigger className="w-full md:w-44">
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All grades</SelectItem>
                        {grades.map((g) => (
                            <SelectItem key={g.id} value={String(g.id)}>
                                Grade {g.name}
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
                        <th>Grade</th>
                        <th>Classroom</th>
                        <th>Students</th>
                        <th>Class Teacher</th>
                        <th>Status</th>
                        <th className="w-12" />
                    </tr>
                }
            >
                {rows.map((c, index) => (
                    <tr key={c.id}>
                        <td className="text-muted-foreground">{index + 1}</td>
                        <td>
                            <span className="inline-flex min-w-10 justify-center rounded-md bg-primary/10 px-2 py-1 font-semibold text-primary">
                                {className(c)}
                            </span>
                        </td>
                        <td>Grade {c.grade?.name}</td>
                        <td>
                            {c.classroom ? (
                                <div>
                                    <div className="font-medium">
                                        {c.classroom.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {c.classroom.building
                                            ? `${c.classroom.building} · `
                                            : ''}
                                        seats {c.classroom.capacity}
                                    </div>
                                </div>
                            ) : (
                                <span className="text-muted-foreground">
                                    Not assigned
                                </span>
                            )}
                        </td>
                        <td>{c.capacity ?? '—'}</td>
                        <td>
                            {c.class_teacher ? (
                                <div>
                                    <div className="font-medium">
                                        {c.class_teacher.full_name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {c.class_teacher_first_period
                                            ? 'Takes the first period'
                                            : 'First period not reserved'}
                                    </div>
                                </div>
                            ) : (
                                <span className="text-muted-foreground">—</span>
                            )}
                        </td>
                        <td>
                            <StatusBadge status={c.status} />
                        </td>
                        <td className="text-right">
                            <RowActions
                                onEdit={() => openEdit(c)}
                                onDelete={() => setDeleting(c)}
                            />
                        </td>
                    </tr>
                ))}
                {rows.length === 0 && (
                    <EmptyRow
                        colSpan={8}
                        icon={<School className="size-6" />}
                        title="No classes found"
                        hint="Try a different filter or add a class to a grade."
                        createLabel="New Class"
                        onCreate={openCreate}
                    />
                )}
            </DataTable>

            <FormModal
                open={modalOpen}
                onOpenChange={setModalOpen}
                title={
                    editing
                        ? `Edit Class ${className(editing)}`
                        : 'Create Class'
                }
                description="Pick the grade and a section letter. Grade 1 + A makes class 1A."
                submitLabel={editing ? 'Update Class' : 'Create Class'}
                processing={form.processing}
                onSubmit={submit}
                className="sm:max-w-lg"
            >
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField label="Grade" error={form.errors.grade_id}>
                        <Select
                            value={form.data.grade_id}
                            onValueChange={(value) =>
                                form.setData('grade_id', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select grade" />
                            </SelectTrigger>
                            <SelectContent>
                                {grades.map((g) => (
                                    <SelectItem key={g.id} value={String(g.id)}>
                                        Grade {g.name}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField
                        label="Section"
                        error={form.errors.name}
                        hint={
                            selectedGrade && form.data.name
                                ? `Class ${selectedGrade.name}${form.data.name.toUpperCase()}`
                                : 'e.g. A, B, C'
                        }
                    >
                        <Input
                            value={form.data.name}
                            onChange={(e) =>
                                form.setData('name', e.target.value)
                            }
                            placeholder="A"
                            maxLength={5}
                            required
                        />
                    </FormField>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                    <FormField
                        label="Classroom"
                        error={form.errors.classroom_id}
                    >
                        <Select
                            value={form.data.classroom_id}
                            onValueChange={(value) =>
                                form.setData('classroom_id', value)
                            }
                        >
                            <SelectTrigger>
                                <SelectValue placeholder="Select room" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NONE}>
                                    Not assigned
                                </SelectItem>
                                {classrooms.map((room) => (
                                    <SelectItem
                                        key={room.id}
                                        value={String(room.id)}
                                        disabled={takenClassroomIds.has(
                                            room.id,
                                        )}
                                    >
                                        {room.name} · {room.capacity} seats
                                        {takenClassroomIds.has(room.id)
                                            ? ' (in use)'
                                            : ''}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                    </FormField>
                    <FormField
                        label="Students"
                        error={form.errors.capacity}
                        hint={
                            overCapacity
                                ? `More than the ${selectedRoom?.capacity} seats in ${selectedRoom?.name}.`
                                : undefined
                        }
                    >
                        <Input
                            type="number"
                            min={1}
                            value={form.data.capacity}
                            onChange={(e) =>
                                form.setData('capacity', e.target.value)
                            }
                            placeholder="e.g. 35"
                            className={
                                overCapacity ? 'border-amber-500' : undefined
                            }
                        />
                    </FormField>
                </div>

                <FormField
                    label="Class teacher"
                    error={form.errors.class_teacher_id}
                >
                    <Select
                        value={form.data.class_teacher_id}
                        onValueChange={(value) =>
                            form.setData('class_teacher_id', value)
                        }
                    >
                        <SelectTrigger>
                            <SelectValue placeholder="None" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NONE}>None</SelectItem>
                            {teachers.map((t) => (
                                <SelectItem key={t.id} value={String(t.id)}>
                                    {t.full_name}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </FormField>

                {form.data.class_teacher_id !== NONE && (
                    <div className="flex items-center justify-between gap-4 rounded-lg border p-3">
                        <span>
                            <span className="block text-sm font-medium">
                                Class teacher takes the first period
                            </span>
                            <span className="block text-xs text-muted-foreground">
                                Every school day starts with the class teacher's
                                own subject for this class. Turn off to schedule
                                the first period like any other.
                            </span>
                        </span>
                        <button
                            type="button"
                            role="switch"
                            aria-checked={form.data.class_teacher_first_period}
                            aria-label="Class teacher takes the first period"
                            onClick={() =>
                                form.setData(
                                    'class_teacher_first_period',
                                    !form.data.class_teacher_first_period,
                                )
                            }
                            className={
                                'relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus-visible:ring-2 focus-visible:ring-ring focus-visible:outline-none ' +
                                (form.data.class_teacher_first_period
                                    ? 'bg-primary'
                                    : 'bg-input')
                            }
                        >
                            <span
                                className={
                                    'inline-block size-5 rounded-full bg-white shadow transition-transform ' +
                                    (form.data.class_teacher_first_period
                                        ? 'translate-x-5.5'
                                        : 'translate-x-0.5')
                                }
                            />
                        </button>
                    </div>
                )}

                {editing && (
                    <FormField label="Status" error={form.errors.status}>
                        <Select
                            value={form.data.status}
                            onValueChange={(value) =>
                                form.setData(
                                    'status',
                                    value as SchoolClass['status'],
                                )
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
                title="Delete Class"
                message={`Delete class ${deleting ? className(deleting) : ''}? Its timetable will no longer be shown.`}
                onConfirm={() =>
                    deleting &&
                    router.delete(
                        SchoolClassController.destroy.url(deleting.id),
                        { preserveScroll: true },
                    )
                }
            />
        </div>
    );
}

ClassesIndex.layout = { breadcrumbs };
