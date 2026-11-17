export type Grade = {
    id: number;
    name: string;
    level_order: number;
    status: 'active' | 'inactive';
    classes_count?: number;
};

export type SchoolClass = {
    id: number;
    grade_id: number;
    name: string;
    capacity: number | null;
    classroom_id: number | null;
    class_teacher_id: number | null;
    class_teacher_first_period: boolean;
    status: 'active' | 'inactive';
    grade?: Grade;
    class_teacher?: Teacher | null;
    classroom?: Classroom | null;
};

export type Classroom = {
    id: number;
    name: string;
    building: string | null;
    capacity: number;
    status: 'active' | 'inactive';
    school_class?: SchoolClass | null;
};

export type Subject = {
    id: number;
    name: string;
    code: string;
    type: 'core' | 'elective';
    color_hex: string | null;
    status: 'active' | 'inactive';
};

export type Teacher = {
    id: number;
    employee_no: string;
    full_name: string;
    phone: string | null;
    email: string | null;
    qualification: string | null;
    max_periods_per_day: number;
    max_periods_per_week: number;
    status: 'active' | 'inactive';
    subjects?: Subject[];
};

export type Term = {
    id: number;
    academic_year_id: number;
    name: string;
    start_date: string;
    end_date: string;
    is_current: boolean;
};

export type TeacherAssignment = {
    id: number;
    term_id: number;
    school_class_id: number;
    subject_id: number;
    teacher_id: number;
    weekly_periods: number;
    status: 'active' | 'inactive';
    sync_status: 'synced' | 'pending' | 'orphaned';
    school_class?: SchoolClass;
    subject?: Subject;
    teacher?: Teacher;
};

export type WeekDay = {
    id: number;
    name: string;
    short_code: string;
    sort_order: number;
    is_school_day: boolean;
};

export type TimeSlot = {
    id: number;
    name: string | null;
    start_time: string;
    end_time: string;
    sort_order: number;
    slot_type: 'period' | 'fixed';
    fixed_activity_name: string | null;
    applies_to_all_grades: boolean;
};

export type Timetable = {
    id: number;
    term_id: number;
    school_class_id: number;
    status: 'draft' | 'published';
    is_out_of_sync: boolean;
    generated_at: string | null;
    published_at: string | null;
    last_synced_at: string | null;
};

export type TimetableSession = {
    id: number;
    timetable_id: number;
    week_day_id: number;
    time_slot_id: number;
    teacher_assignment_id: number | null;
    subject_id: number | null;
    teacher_id: number | null;
    room: string | null;
    is_locked: boolean;
    subject?: Subject | null;
    teacher?: Teacher | null;
    timetable?: Timetable & { school_class?: SchoolClass };
};
