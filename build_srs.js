const {
    Document,
    Packer,
    Paragraph,
    TextRun,
    HeadingLevel,
    Table,
    TableRow,
    TableCell,
    WidthType,
    ShadingType,
    AlignmentType,
    BorderStyle,
    Header,
    Footer,
    PageNumber,
    LevelFormat,
    PageOrientation,
} = require('docx');

const FONT = 'Times New Roman';

function h1(text, num) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_1,
        children: [new TextRun({ text: (num ? num + ' ' : '') + text })],
    });
}
function h2(text, num) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_2,
        children: [new TextRun({ text: (num ? num + ' ' : '') + text })],
    });
}
function h3(text, num) {
    return new Paragraph({
        heading: HeadingLevel.HEADING_3,
        children: [new TextRun({ text: (num ? num + ' ' : '') + text })],
    });
}
function p(text) {
    return new Paragraph({
        children: [new TextRun({ text })],
        spacing: { after: 160 },
    });
}
function bullet(text) {
    return new Paragraph({
        children: [new TextRun({ text })],
        bullet: { level: 0 },
        spacing: { after: 80 },
    });
}
function numbered(text) {
    return new Paragraph({
        children: [new TextRun({ text })],
        numbering: { reference: 'num-list', level: 0 },
        spacing: { after: 80 },
    });
}

function cell(text, opts = {}) {
    return new TableCell({
        width: { size: opts.width || 2000, type: WidthType.DXA },
        shading: opts.header
            ? { type: ShadingType.CLEAR, fill: 'D9D9D9' }
            : undefined,
        children: [
            new Paragraph({
                children: [new TextRun({ text, bold: !!opts.header })],
            }),
        ],
    });
}

function table(headerRow, rows, widths) {
    return new Table({
        width: { size: 9500, type: WidthType.DXA },
        columnWidths: widths,
        rows: [
            new TableRow({
                tableHeader: true,
                children: headerRow.map((t, i) =>
                    cell(t, { header: true, width: widths[i] }),
                ),
            }),
            ...rows.map(
                (r) =>
                    new TableRow({
                        children: r.map((t, i) =>
                            cell(t, { width: widths[i] }),
                        ),
                    }),
            ),
        ],
    });
}

const doc = new Document({
    numbering: {
        config: [
            {
                reference: 'num-list',
                levels: [
                    {
                        level: 0,
                        format: LevelFormat.DECIMAL,
                        text: '%1.',
                        alignment: AlignmentType.START,
                    },
                ],
            },
        ],
    },
    styles: {
        default: {
            document: { run: { font: FONT, size: 24 } },
        },
        paragraphStyles: [
            {
                id: 'title',
                name: 'Title',
                basedOn: 'Normal',
                next: 'Normal',
                run: { font: FONT, size: 56, bold: true },
                paragraph: {
                    alignment: AlignmentType.CENTER,
                    spacing: { before: 0, after: 240 },
                },
            },
            {
                id: 'Heading1',
                name: 'Heading 1',
                basedOn: 'Normal',
                next: 'Normal',
                run: { font: FONT, size: 32, bold: true },
                paragraph: {
                    spacing: { before: 360, after: 180 },
                    keepNext: true,
                },
            },
            {
                id: 'Heading2',
                name: 'Heading 2',
                basedOn: 'Normal',
                next: 'Normal',
                run: { font: FONT, size: 28, bold: true },
                paragraph: {
                    spacing: { before: 280, after: 140 },
                    keepNext: true,
                },
            },
            {
                id: 'Heading3',
                name: 'Heading 3',
                basedOn: 'Normal',
                next: 'Normal',
                run: { font: FONT, size: 26, bold: true, italics: true },
                paragraph: {
                    spacing: { before: 220, after: 120 },
                    keepNext: true,
                },
            },
        ],
    },
    sections: [
        {
            properties: {
                page: { size: { width: 12240, height: 15840 } },
            },
            headers: {
                default: new Header({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.RIGHT,
                            children: [
                                new TextRun({
                                    text: 'School Timetable Management System — SRS',
                                    size: 18,
                                    italics: true,
                                }),
                            ],
                        }),
                    ],
                }),
            },
            footers: {
                default: new Footer({
                    children: [
                        new Paragraph({
                            alignment: AlignmentType.CENTER,
                            children: [
                                new TextRun({
                                    children: [PageNumber.CURRENT],
                                    size: 20,
                                }),
                            ],
                        }),
                    ],
                }),
            },
            children: [
                new Paragraph({
                    style: 'title',
                    children: [
                        new TextRun({
                            text: 'SOFTWARE REQUIREMENTS SPECIFICATION (SRS)',
                        }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 100 },
                    children: [
                        new TextRun({
                            text: 'School Timetable Management System',
                            size: 32,
                            bold: true,
                        }),
                    ],
                }),
                new Paragraph({
                    alignment: AlignmentType.CENTER,
                    spacing: { after: 400 },
                    children: [
                        new TextRun({
                            text: 'Version 1.0',
                            size: 24,
                            italics: true,
                        }),
                    ],
                }),

                h1('Introduction', '1.'),
                h2('Purpose', '1.1'),
                p(
                    'This document specifies the software requirements for a web-based School Timetable Management System (STMS), developed using the Laravel PHP framework. The system allows a school to manage its academic structure (grades, classes, subjects), teacher-subject-class assignments, and to automatically generate, manually adjust (via drag-and-drop), view, filter, and export class and teacher timetables in PDF, PNG, and JPG formats.',
                ),
                h2('Scope', '1.2'),
                p(
                    'The system covers grades 1 through 13 (or any configurable range), with each grade containing one or more named classes/sections (e.g., Grade 10 — A, B, C, D). It manages subjects, teachers, and the mapping of which teacher teaches which subject to which class. It provides an automatic timetable generation engine constrained by teacher availability and workload, a drag-and-drop manual editor with conflict validation across all classes, configurable time slots (including fixed non-teaching slots such as Morning Assembly, Breakfast Break, Tea Break, and Lunch Break), a master timetable view with filters, a per-teacher timetable view, and export of any timetable to PDF, PNG, and JPG.',
                ),
                h2('Definitions, Acronyms and Abbreviations', '1.3'),
                table(
                    ['Term', 'Definition'],
                    [
                        ['SRS', 'Software Requirements Specification'],
                        ['STMS', 'School Timetable Management System'],
                        [
                            'Grade',
                            'An academic year level, e.g., Grade 1 to Grade 13',
                        ],
                        [
                            'Class / Section',
                            'A named division within a grade, e.g., Grade 10-A',
                        ],
                        [
                            'Time Slot',
                            'A fixed time range in the daily schedule, e.g., 07:30–08:00',
                        ],
                        [
                            'Fixed Slot',
                            'A time slot reserved for a non-teaching activity shared by all classes (assembly, break, lunch)',
                        ],
                        [
                            'Teacher Assignment',
                            'The mapping of one teacher to one subject for one class',
                        ],
                        [
                            'Timetable Session',
                            'A single scheduled cell: a day, time slot, class, subject, and teacher',
                        ],
                        [
                            'Admin',
                            'User role responsible for configuring data and generating/editing timetables',
                        ],
                    ],
                    [2200, 7300],
                ),
                h2('References', '1.4'),
                bullet(
                    'IEEE Std 830-1998 — Recommended Practice for Software Requirements Specifications',
                ),
                bullet('Laravel Framework Documentation (laravel.com/docs)'),
                h2('Overview', '1.5'),
                p(
                    'Section 2 gives an overall description of the system and its users. Section 3 specifies detailed functional and non-functional requirements. Section 4 describes the proposed Laravel database design. Section 5 covers external interface requirements, and Section 6 lists assumptions, constraints, and future enhancements.',
                ),

                h1('Overall Description', '2.'),
                h2('Product Perspective', '2.1'),
                p(
                    'STMS is a standalone web application built on Laravel (MVC architecture) with a relational database (MySQL/MariaDB) and a JavaScript-driven front end (for the drag-and-drop timetable grid). It is used internally by school administrative staff and teaching staff; it is not integrated with any external examination or government system in this version.',
                ),
                h2('Product Functions (Summary)', '2.2'),
                numbered(
                    'Manage academic structure: Grades, Classes/Sections, Subjects.',
                ),
                numbered('Manage teachers and their qualified subjects.'),
                numbered(
                    'Assign a teacher to teach a subject to a specific class (Teacher–Subject–Class mapping), per academic term.',
                ),
                numbered(
                    'Define working days and time slots, including fixed non-teaching slots (assembly, breaks, lunch).',
                ),
                numbered(
                    'Automatically generate a conflict-free weekly timetable for all classes.',
                ),
                numbered(
                    'Manually adjust any class timetable via drag-and-drop, with real-time conflict validation against all other classes and teachers.',
                ),
                numbered(
                    'View and filter the master timetable (all classes) by grade, class, teacher, or subject.',
                ),
                numbered(
                    'View a consolidated timetable for a single teacher across all classes they teach.',
                ),
                numbered(
                    'Export any class or teacher timetable as PDF, PNG, or JPG.',
                ),
                h2('User Classes and Characteristics', '2.3'),
                table(
                    ['Role', 'Description'],
                    [
                        [
                            'Super Admin',
                            'Full access: system configuration, user/role management, all academic data',
                        ],
                        [
                            'Admin / Academic Coordinator',
                            'Manages grades, classes, subjects, teacher assignments, time slots; generates and edits timetables',
                        ],
                        [
                            'Teacher',
                            'Read-only access to their own consolidated timetable; can export it',
                        ],
                        [
                            'Student / Parent (optional)',
                            'Read-only access to their class timetable',
                        ],
                    ],
                    [3200, 6300],
                ),
                h2('Operating Environment', '2.4'),
                bullet('Server: PHP 8.2+, Laravel 10/11, MySQL or MariaDB'),
                bullet(
                    'Client: Modern desktop or tablet web browser (Chrome, Edge, Firefox, Safari) with JavaScript enabled',
                ),
                h2('Design and Implementation Constraints', '2.5'),
                bullet(
                    'Must be built on the Laravel framework as explicitly required.',
                ),
                bullet(
                    'Timetable generation and drag-and-drop editing must each independently enforce the no-double-booking constraint for teachers and classes.',
                ),
                bullet(
                    'Exports must preserve the visual layout of the on-screen timetable grid.',
                ),
                h2('Assumptions and Dependencies', '2.6'),
                bullet(
                    'Each school year is divided into terms, and timetables are generated per term.',
                ),
                bullet(
                    'A class follows one timetable per term; mid-term structural changes require re-generation or manual edits.',
                ),
                bullet(
                    'PDF export depends on a PDF rendering library (e.g., barryvdh/laravel-dompdf); PNG/JPG export depends on an HTML-to-image renderer (e.g., spatie/browsershot).',
                ),

                h1('Specific Requirements', '3.'),
                h2('Functional Requirements', '3.1'),

                h3('FR1 — Academic Structure Management', ''),
                table(
                    ['ID', 'Requirement'],
                    [
                        [
                            'FR1.1',
                            'The system shall allow the Admin to create, edit, and deactivate Grades (e.g., Grade 1 to Grade 13), each with a name and sort order.',
                        ],
                        [
                            'FR1.2',
                            'The system shall allow the Admin to create, edit, and deactivate Classes/Sections under a Grade, each with a custom name (e.g., A, B, Blue, Gold), capacity, and optional class teacher.',
                        ],
                        [
                            'FR1.3',
                            'The system shall allow the Admin to create, edit, and deactivate Subjects, each with a name, code, and type (core/elective).',
                        ],
                        [
                            'FR1.4',
                            'The system shall allow the Admin to define which subjects are offered to which grade, with a default weekly period count per subject.',
                        ],
                    ],
                    [1300, 8200],
                ),
                new Paragraph({ children: [new TextRun({ text: '' })] }),
                h3('FR2 — Teacher Management', ''),
                table(
                    ['ID', 'Requirement'],
                    [
                        [
                            'FR2.1',
                            'The system shall allow the Admin to create and maintain teacher profiles, including name, contact details, qualifications, and maximum periods per day/week.',
                        ],
                        [
                            'FR2.2',
                            'The system shall allow the Admin to record which subjects each teacher is qualified to teach.',
                        ],
                        [
                            'FR2.3',
                            'The system shall allow the Admin to assign a teacher to teach a specific subject to a specific class, for a given term, with a required weekly period count (Teacher–Subject–Class mapping).',
                        ],
                        [
                            'FR2.4',
                            'The system shall prevent assigning more than one primary teacher to the same subject for the same class within the same term.',
                        ],
                        [
                            'FR2.5',
                            "The system shall display a teacher's current total assigned weekly periods while making a new assignment, to support workload balancing.",
                        ],
                    ],
                    [1300, 8200],
                ),
                new Paragraph({ children: [new TextRun({ text: '' })] }),
                h3('FR3 — Time Structure Management', ''),
                table(
                    ['ID', 'Requirement'],
                    [
                        [
                            'FR3.1',
                            "The system shall allow the Admin to define the school's working days (e.g., Monday to Friday or Monday to Saturday).",
                        ],
                        [
                            'FR3.2',
                            'The system shall allow the Admin to define Time Slots with a start time, end time, and sequence order (e.g., 07:30–08:00, 08:00–08:40).',
                        ],
                        [
                            'FR3.3',
                            'The system shall allow each Time Slot to be marked as either a Teaching Period or a Fixed Slot.',
                        ],
                        [
                            'FR3.4',
                            'For a Fixed Slot, the system shall allow the Admin to define a shared activity label (e.g., Morning Assembly, Breakfast Break, Tea Break, Lunch Break) that is displayed identically across every class timetable at that time.',
                        ],
                        [
                            'FR3.5',
                            'The system shall allow a Fixed Slot or Time Slot to apply to all grades or to a specific subset of grades (e.g., different lunch times for primary and secondary).',
                        ],
                    ],
                    [1300, 8200],
                ),
                new Paragraph({ children: [new TextRun({ text: '' })] }),
                h3('FR4 — Automatic Timetable Generation', ''),
                table(
                    ['ID', 'Requirement'],
                    [
                        [
                            'FR4.1',
                            'The system shall automatically generate a draft weekly timetable for all classes simultaneously, based on all active Teacher–Subject–Class mappings for the selected term.',
                        ],
                        [
                            'FR4.2',
                            'The system shall ensure that no teacher is scheduled in two different classes at the same day and time slot.',
                        ],
                        [
                            'FR4.3',
                            'The system shall ensure that no class has two different subjects scheduled at the same day and time slot.',
                        ],
                        [
                            'FR4.4',
                            'The system shall not schedule a teacher beyond their configured maximum periods per day or per week.',
                        ],
                        [
                            'FR4.5',
                            "The system shall attempt to distribute a subject's weekly periods evenly across the available days rather than clustering them on one day.",
                        ],
                        [
                            'FR4.6',
                            'If generation cannot place all required periods, the system shall report the unplaced periods/mappings as conflicts rather than failing silently.',
                        ],
                    ],
                    [1300, 8200],
                ),
                new Paragraph({ children: [new TextRun({ text: '' })] }),
                h3('FR5 — Manual Drag-and-Drop Adjustment', ''),
                table(
                    ['ID', 'Requirement'],
                    [
                        [
                            'FR5.1',
                            'The system shall allow the Admin to drag a scheduled period from one day/time cell to another empty or occupied cell within the same class grid.',
                        ],
                        [
                            'FR5.2',
                            'The system shall support swapping two periods by dragging one onto another.',
                        ],
                        [
                            'FR5.3',
                            'On every drop action, the system shall validate the result against teacher-clash, class-clash, and maximum-load constraints across all classes, and shall reject or revert an invalid move with a clear message.',
                        ],
                        [
                            'FR5.4',
                            "The system shall not automatically move a teacher's other classes when one period is moved; it shall only block moves that would create a scheduling clash for that teacher.",
                        ],
                        [
                            'FR5.5',
                            'Fixed Slots shall not be draggable or editable from the class timetable view.',
                        ],
                        [
                            'FR5.6',
                            'The system shall record every manual change (who made it, when, and what changed) in an audit log.',
                        ],
                    ],
                    [1300, 8200],
                ),
                new Paragraph({ children: [new TextRun({ text: '' })] }),
                h3('FR6 — Timetable Viewing and Filtering', ''),
                table(
                    ['ID', 'Requirement'],
                    [
                        [
                            'FR6.1',
                            'The system shall provide a Master Timetable page displaying all classes, filterable by grade, class, teacher, and subject.',
                        ],
                        [
                            'FR6.2',
                            'The system shall provide a single-class timetable view showing the full weekly grid for one selected class.',
                        ],
                        [
                            'FR6.3',
                            'The system shall provide a Teacher Timetable page showing the consolidated weekly schedule of one teacher across every class they are assigned to teach.',
                        ],
                        [
                            'FR6.4',
                            'Both class and teacher timetable views shall visually distinguish free/idle periods from scheduled periods.',
                        ],
                    ],
                    [1300, 8200],
                ),
                new Paragraph({ children: [new TextRun({ text: '' })] }),
                h3('FR7 — Export', ''),
                table(
                    ['ID', 'Requirement'],
                    [
                        [
                            'FR7.1',
                            'The system shall allow any class or teacher timetable view to be exported as a PDF file.',
                        ],
                        [
                            'FR7.2',
                            'The system shall allow any class or teacher timetable view to be exported as a PNG image.',
                        ],
                        [
                            'FR7.3',
                            'The system shall allow any class or teacher timetable view to be exported as a JPG image.',
                        ],
                        [
                            'FR7.4',
                            'Every export shall include a header with the school name, the class or teacher name, the academic year/term, and the generation date.',
                        ],
                    ],
                    [1300, 8200],
                ),
                new Paragraph({ children: [new TextRun({ text: '' })] }),
                h3('FR8 — Access Control', ''),
                table(
                    ['ID', 'Requirement'],
                    [
                        [
                            'FR8.1',
                            'The system shall support role-based access control with at least the roles Super Admin, Admin, and Teacher.',
                        ],
                        [
                            'FR8.2',
                            'Only Super Admin and Admin roles shall be permitted to generate, edit, or publish timetables.',
                        ],
                        [
                            'FR8.3',
                            'Teachers shall only be permitted to view and export their own consolidated timetable.',
                        ],
                    ],
                    [1300, 8200],
                ),

                h3(
                    'FR9 — Incremental Update and Re-generation After Data Changes',
                    '',
                ),
                table(
                    ['ID', 'Requirement'],
                    [
                        [
                            'FR9.1',
                            'When the Admin adds a new Teacher, Class, Subject, or Teacher–Subject–Class assignment after a timetable has already been generated/published, the system shall not silently invalidate the existing timetable; it shall mark the affected timetable as "out of sync".',
                        ],
                        [
                            'FR9.2',
                            "The system shall display a clear indicator of how many new/changed assignments are not yet reflected in the current timetable, on both the master view and the affected class's view.",
                        ],
                        [
                            'FR9.3',
                            'The system shall provide a Partial Sync action that places only the new/changed Teacher–Subject–Class mappings into free, non-conflicting slots of the existing timetable, leaving previously generated or manually edited cells untouched; where a mapping replaces an existing one for the same subject/class, the new teacher shall take the same day/time slot where possible.',
                        ],
                        [
                            'FR9.4',
                            "The system shall provide a Full Re-generate action that rebuilds a class's (or all classes') timetable from scratch using all current active assignments, after warning the Admin that unlocked manual edits will be discarded and requiring explicit confirmation.",
                        ],
                        [
                            'FR9.5',
                            'Where a new or changed assignment cannot be placed because all remaining slots are occupied, the system shall offer an Exchange/Swap action allowing the Admin to resolve the conflict by swapping it with another valid existing slot, subject to the same clash-validation rules as manual drag-and-drop.',
                        ],
                        [
                            'FR9.6',
                            'The system shall allow the Admin to lock any manually adjusted cell so that Partial Sync and Full Re-generate never modify it.',
                        ],
                        [
                            'FR9.7',
                            'Deactivating or removing a Teacher, Class, Subject, or assignment that has existing scheduled sessions shall flag those sessions as needing review rather than deleting them outright.',
                        ],
                        [
                            'FR9.8',
                            'Every sync, re-generation, or exchange action shall be recorded in the audit log in the same manner as manual drag-and-drop edits.',
                        ],
                    ],
                    [1300, 8200],
                ),
                new Paragraph({ children: [new TextRun({ text: '' })] }),

                h2('Non-Functional Requirements', '3.2'),
                table(
                    ['ID', 'Category', 'Requirement'],
                    [
                        [
                            'NFR1',
                            'Usability',
                            'The drag-and-drop interface shall provide immediate visual feedback and highlight conflicts at the moment of drop.',
                        ],
                        [
                            'NFR2',
                            'Performance',
                            'Automatic timetable generation for an entire school (30+ classes) shall complete within a few seconds under normal load.',
                        ],
                        [
                            'NFR3',
                            'Scalability',
                            'The system shall support multiple academic years and terms without loss of access to historical timetables.',
                        ],
                        [
                            'NFR4',
                            'Reliability',
                            'Exported PDF/PNG/JPG files shall render a layout consistent with the on-screen timetable.',
                        ],
                        [
                            'NFR5',
                            'Auditability',
                            'All manual timetable edits shall be timestamped and attributed to the user who made them.',
                        ],
                        [
                            'NFR6',
                            'Security',
                            'Access to configuration and generation features shall be restricted by role-based permissions.',
                        ],
                        [
                            'NFR7',
                            'Maintainability',
                            "The system shall be built following Laravel's standard MVC structure to support future maintenance and extension.",
                        ],
                    ],
                    [1000, 1700, 6800],
                ),

                h1('Database Design (Laravel Schema Overview)', '4.'),
                p(
                    'The following tables summarize the proposed relational schema. Full column-level detail is provided in the accompanying database design reference.',
                ),
                table(
                    ['Table', 'Purpose'],
                    [
                        [
                            'academic_years',
                            'Defines school years (e.g., 2026/2027)',
                        ],
                        ['terms', 'Defines terms within an academic year'],
                        [
                            'grades',
                            'Grade levels (1–13 or custom), with sort order',
                        ],
                        [
                            'classes',
                            'Named class/section under a grade (e.g., 10-A)',
                        ],
                        ['subjects', 'Master list of subjects'],
                        [
                            'grade_subject',
                            'Subjects offered per grade, with default weekly periods',
                        ],
                        ['teachers', 'Teacher profiles and workload limits'],
                        [
                            'teacher_subject',
                            'Subjects each teacher is qualified to teach',
                        ],
                        [
                            'teacher_assignments',
                            'Core mapping: Teacher → Subject → Class, per term, with weekly periods',
                        ],
                        ['week_days', 'Working days of the week'],
                        [
                            'time_slots',
                            'Time ranges per period, with type (period/fixed) and fixed activity label',
                        ],
                        [
                            'time_slot_grade',
                            'Links a time slot to specific grades when it is not universal',
                        ],
                        [
                            'timetables',
                            'One generated/working timetable per class per term',
                        ],
                        [
                            'timetable_sessions',
                            'Individual scheduled cells (day, slot, class, subject, teacher)',
                        ],
                        [
                            'timetable_change_logs',
                            'Audit trail of manual drag-and-drop edits',
                        ],
                        [
                            'users / roles / permissions',
                            'Authentication and role-based access control',
                        ],
                    ],
                    [2700, 6800],
                ),
                p(
                    'Key integrity rule for conflict prevention: a unique constraint on (timetable_id, week_day_id, time_slot_id) in timetable_sessions ensures one entry per class cell, while an index on (teacher_id, week_day_id, time_slot_id) enables fast detection of teacher double-booking across all classes before any generation or drag-and-drop change is committed.',
                ),
                p(
                    "To support FR9, teacher_assignments carries a sync_status column ('synced', 'pending', 'orphaned') and timetables carries an is_out_of_sync flag. Adding, editing, or deactivating an assignment updates these fields via a model observer rather than mutating timetable_sessions directly, so a Partial Sync, Full Re-generate, or Exchange action can later reconcile the saved timetable with the latest academic data without silently overwriting prior work.",
                ),

                h1('External Interface Requirements', '5.'),
                h2('User Interfaces', '5.1'),
                bullet(
                    'Academic structure management screens (Grades, Classes, Subjects)',
                ),
                bullet(
                    'Teacher management and Teacher–Subject–Class assignment screen',
                ),
                bullet('Time slot configuration screen'),
                bullet(
                    'Drag-and-drop timetable grid (per class and master view)',
                ),
                bullet('Teacher timetable view'),
                bullet('Export dialog (PDF / PNG / JPG)'),
                h2('Software Interfaces', '5.2'),
                bullet('Laravel (PHP) backend with MySQL/MariaDB database'),
                bullet(
                    'PDF generation library (e.g., barryvdh/laravel-dompdf)',
                ),
                bullet(
                    'HTML-to-image rendering for PNG/JPG export (e.g., spatie/browsershot)',
                ),
                bullet('JavaScript drag-and-drop library on the front end'),

                h1('Assumptions, Constraints and Future Enhancements', '6.'),
                h2('Assumptions', '6.1'),
                bullet(
                    'The school operates on a term-based academic calendar.',
                ),
                bullet(
                    'Each class follows a single weekly timetable cycle (no alternating week patterns in version 1.0).',
                ),
                h2('Constraints', '6.2'),
                bullet(
                    'The system must be implemented using the Laravel framework.',
                ),
                bullet(
                    'Timetable conflict rules (teacher clash, class clash, workload limits) are mandatory and non-configurable in version 1.0.',
                ),
                h2('Future Enhancements', '6.3'),
                bullet('Room/lab allocation and clash checking.'),
                bullet('Alternating/rotating weekly timetable patterns.'),
                bullet('Student and parent portal access to class timetables.'),
                bullet(
                    'Automatic substitute-teacher suggestion when a teacher is absent.',
                ),
            ],
        },
    ],
});

Packer.toBuffer(doc).then((buf) => {
    require('fs').writeFileSync('SRS_School_Timetable_System.docx', buf);
    console.log('done');
});
