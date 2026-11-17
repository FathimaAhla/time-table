<?php

namespace Database\Seeders;

use App\Models\AcademicYear;
use App\Models\Classroom;
use App\Models\Grade;
use App\Models\Institute;
use App\Models\SchoolClass;
use App\Models\Subject;
use App\Models\Teacher;
use App\Models\TeacherAssignment;
use App\Models\Term;
use Illuminate\Database\Seeder;

class TimetableSeeder extends Seeder
{
    public function __construct(protected Institute $institute) {}

    public function run(): void
    {
        $institute = $this->institute;

        InstituteDefaultsSeeder::seedFor($institute);

        // Academic year + current term
        $year = AcademicYear::firstOrCreate(
            ['institute_id' => $institute->id, 'name' => '2026/2027'],
            ['start_date' => '2026-09-01', 'end_date' => '2027-06-30', 'is_current' => true]
        );
        $term = Term::firstOrCreate(
            ['institute_id' => $institute->id, 'academic_year_id' => $year->id, 'name' => 'Term 1'],
            ['start_date' => '2026-09-01', 'end_date' => '2026-12-20', 'is_current' => true]
        );

        // Grades are numbered (1, 2, 3 ...); classes are lettered sections, so Grade 10 + A = "10A".
        $grade10 = Grade::firstOrCreate(['institute_id' => $institute->id, 'name' => '10'], ['level_order' => 10]);
        $grade11 = Grade::firstOrCreate(['institute_id' => $institute->id, 'name' => '11'], ['level_order' => 11]);

        $roomNumber = 101;
        foreach ([[$grade10, ['A', 'B', 'C', 'D']], [$grade11, ['A', 'B']]] as [$grade, $sections]) {
            foreach ($sections as $section) {
                $classroom = Classroom::firstOrCreate(
                    ['institute_id' => $institute->id, 'name' => 'Room '.$roomNumber++],
                    ['building' => 'Main Block', 'capacity' => 40]
                );
                SchoolClass::firstOrCreate(
                    ['institute_id' => $institute->id, 'grade_id' => $grade->id, 'name' => $section],
                    ['classroom_id' => $classroom->id, 'capacity' => 35]
                );
            }
        }

        // Subjects
        $subjects = [
            ['name' => 'Mathematics', 'code' => 'MATH'],
            ['name' => 'Science', 'code' => 'SCI'],
            ['name' => 'English', 'code' => 'ENG'],
            ['name' => 'History', 'code' => 'HIST'],
            ['name' => 'ICT', 'code' => 'ICT'],
        ];
        foreach ($subjects as $s) {
            Subject::firstOrCreate(
                ['institute_id' => $institute->id, 'code' => $s['code']],
                ['name' => $s['name'], 'type' => 'core']
            );
        }

        // A couple of demo teachers
        $teacherNames = [
            ['employee_no' => 'T-1001', 'full_name' => 'Mrs. Amara Perera', 'subjects' => ['MATH', 'ICT']],
            ['employee_no' => 'T-1002', 'full_name' => 'Mr. Nimal Fernando', 'subjects' => ['SCI']],
            ['employee_no' => 'T-1003', 'full_name' => 'Ms. Dilani Silva', 'subjects' => ['ENG', 'HIST']],
        ];

        foreach ($teacherNames as $t) {
            $teacher = Teacher::firstOrCreate(
                ['institute_id' => $institute->id, 'employee_no' => $t['employee_no']],
                ['full_name' => $t['full_name']]
            );
            $subjectIds = Subject::where('institute_id', $institute->id)->whereIn('code', $t['subjects'])->pluck('id');
            $teacher->subjects()->sync($subjectIds);
        }

        // Demo teacher assignments for class 10A
        $classA = SchoolClass::where('institute_id', $institute->id)->where('grade_id', $grade10->id)->where('name', 'A')->first();
        $math = Subject::where('institute_id', $institute->id)->where('code', 'MATH')->first();
        $sci = Subject::where('institute_id', $institute->id)->where('code', 'SCI')->first();
        $eng = Subject::where('institute_id', $institute->id)->where('code', 'ENG')->first();
        $amara = Teacher::where('institute_id', $institute->id)->where('employee_no', 'T-1001')->first();
        $nimal = Teacher::where('institute_id', $institute->id)->where('employee_no', 'T-1002')->first();
        $dilani = Teacher::where('institute_id', $institute->id)->where('employee_no', 'T-1003')->first();

        if ($classA && $math && $amara) {
            TeacherAssignment::firstOrCreate(
                ['institute_id' => $institute->id, 'term_id' => $term->id, 'school_class_id' => $classA->id, 'subject_id' => $math->id],
                ['teacher_id' => $amara->id, 'weekly_periods' => 5, 'status' => 'active']
            );
        }
        if ($classA && $sci && $nimal) {
            TeacherAssignment::firstOrCreate(
                ['institute_id' => $institute->id, 'term_id' => $term->id, 'school_class_id' => $classA->id, 'subject_id' => $sci->id],
                ['teacher_id' => $nimal->id, 'weekly_periods' => 4, 'status' => 'active']
            );
        }
        if ($classA && $eng && $dilani) {
            TeacherAssignment::firstOrCreate(
                ['institute_id' => $institute->id, 'term_id' => $term->id, 'school_class_id' => $classA->id, 'subject_id' => $eng->id],
                ['teacher_id' => $dilani->id, 'weekly_periods' => 4, 'status' => 'active']
            );
        }
    }
}
