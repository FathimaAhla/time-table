import { Link, usePage } from '@inertiajs/react';
import {
    BookOpen,
    CalendarDays,
    Building2,
    CalendarClock,
    DoorOpen,
    GraduationCap,
    LayoutGrid,
    ListChecks,
    School,
    Users,
} from 'lucide-react';
import AppLogo from '@/components/app-logo';
import { NavMain } from '@/components/nav-main';
import { NavUser } from '@/components/nav-user';
import {
    Sidebar,
    SidebarContent,
    SidebarFooter,
    SidebarHeader,
    SidebarMenu,
    SidebarMenuButton,
    SidebarMenuItem,
} from '@/components/ui/sidebar';
import { dashboard } from '@/routes';
import { index as gradesIndex } from '@/routes/grades';
import { index as classesIndex } from '@/routes/classes';
import { index as classroomsIndex } from '@/routes/classrooms';
import { index as subjectsIndex } from '@/routes/subjects';
import { index as teachersIndex } from '@/routes/teachers';
import { index as assignmentsIndex } from '@/routes/assignments';
import { index as timeSlotsIndex } from '@/routes/time-slots';
import { index as timetableIndex, mine as myTimetable, teachers as allTeacherTimetables } from '@/routes/timetable';
import { index as institutesIndex } from '@/routes/institutes';
import { index as usersIndex } from '@/routes/users';
import type { NavItem } from '@/types';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: dashboard(),
        icon: LayoutGrid,
    },
    {
        title: 'Grades',
        href: gradesIndex(),
        icon: GraduationCap,
    },
    {
        title: 'Classes',
        href: classesIndex(),
        icon: School,
    },
    {
        title: 'Classrooms',
        href: classroomsIndex(),
        icon: DoorOpen,
    },
    {
        title: 'Subjects',
        href: subjectsIndex(),
        icon: BookOpen,
    },
    {
        title: 'Teachers',
        href: teachersIndex(),
        icon: Users,
    },
    {
        title: 'Subject Allocation',
        href: assignmentsIndex(),
        icon: ListChecks,
    },
    {
        title: 'School Day',
        href: timeSlotsIndex(),
        icon: CalendarClock,
    },
    {
        title: 'Timetable',
        href: timetableIndex(),
        icon: LayoutGrid,
    },
];

export function AppSidebar() {
    const { isSuperAdmin, isTeacher } = usePage().props;

    const navItems: NavItem[] = [
        ...(isTeacher ? [{ title: 'My Timetable', href: myTimetable(), icon: CalendarDays }] : []),
        ...mainNavItems,
        { title: 'Teacher Timetables', href: allTeacherTimetables(), icon: Users },
        ...(isSuperAdmin ? [{ title: 'Institutes', href: institutesIndex(), icon: Building2 }, { title: 'Users & Logins', href: usersIndex(), icon: Users }] : []),
    ];

    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href={dashboard()} prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={navItems} />
            </SidebarContent>

            <SidebarFooter>
                <NavUser />
            </SidebarFooter>
        </Sidebar>
    );
}
