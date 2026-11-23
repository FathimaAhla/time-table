import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BellRing,
    Building2,
    CalendarDays,
    DoorOpen,
    Download,
    GraduationCap,
    Lock,
    MousePointerClick,
    ShieldCheck,
    Sparkles,
    Users,
    Wand2,
} from 'lucide-react';
import { dashboard, login, register } from '@/routes';

const features = [
    {
        icon: Wand2,
        title: 'One-click generation',
        text: 'Assign teachers to subjects and classes, then generate clash-free timetables for every class at once.',
    },
    {
        icon: Users,
        title: 'No double-booked teachers',
        text: 'Every teacher’s daily and weekly limits are respected, so nobody ends up in two rooms at once.',
    },
    {
        icon: MousePointerClick,
        title: 'Drag, drop, swap',
        text: 'Fine-tune any period by dragging it. Lock the ones that must never move before you regenerate.',
    },
    {
        icon: BellRing,
        title: 'Breaks built in',
        text: 'Assembly, interval and lunch are shared fixed slots that line up across every class automatically.',
    },
    {
        icon: Download,
        title: 'PDF, PNG & JPG export',
        text: 'Print or share class, teacher and master timetables as clean, ready-to-pin documents.',
    },
    {
        icon: DoorOpen,
        title: 'Classrooms & class teachers',
        text: 'Give every class (1A, 1B, 2A...) its own room and class teacher, who can open each day with their subject.',
    },
    {
        icon: Building2,
        title: 'Schools, tuition & institutes',
        text: 'Each institute keeps its own grades, teachers and timetables, fully separated from the others.',
    },
];

const steps = [
    { title: 'Set up your school', text: 'Grades, classes, subjects and bell times.' },
    { title: 'Assign teachers', text: 'Who teaches what, to which class, how often.' },
    { title: 'Generate & publish', text: 'Review, tweak with drag & drop, then export.' },
];

const previewDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const previewGrid = [
    ['bg-indigo-500', 'bg-emerald-500', 'bg-sky-500', 'bg-amber-500', 'bg-pink-500'],
    ['bg-emerald-500', 'bg-indigo-500', 'bg-violet-500', 'bg-sky-500', 'bg-indigo-500'],
    ['bg-sky-500', 'bg-amber-500', 'bg-indigo-500', 'bg-emerald-500', 'bg-red-500'],
    null,
    ['bg-violet-500', 'bg-sky-500', 'bg-emerald-500', 'bg-indigo-500', 'bg-amber-500'],
    ['bg-pink-500', 'bg-red-500', 'bg-amber-500', 'bg-violet-500', 'bg-emerald-500'],
];

export default function Welcome() {
    const { auth } = usePage().props;

    return (
        <>
            <Head title="Welcome">
                <meta name="description" content="Create clash-free school timetables in minutes. Drag, drop, generate and export." />
            </Head>
            <div className="min-h-screen bg-background text-foreground">
                <header className="sticky top-0 z-20 border-b bg-background/80 backdrop-blur">
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                        <span className="flex items-center gap-2 font-semibold">
                            <span className="rounded-lg bg-indigo-600 p-1.5 text-white">
                                <CalendarDays className="size-4" />
                            </span>
                            School Timetable
                        </span>
                        <nav className="flex items-center gap-2 text-sm">
                            {auth.user ? (
                                <Link href={dashboard()} className="rounded-md bg-indigo-600 px-4 py-1.5 font-medium text-white hover:bg-indigo-700">
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link href={login()} className="rounded-md px-3 py-1.5 hover:bg-muted">
                                        Log in
                                    </Link>
                                    <Link href={register()} className="rounded-md bg-indigo-600 px-4 py-1.5 font-medium text-white hover:bg-indigo-700">
                                        Register
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                <section className="relative overflow-hidden">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_60%)]" />
                    <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
                        <div className="transition-opacity duration-700 starting:opacity-0">
                            <span className="mb-4 inline-flex items-center gap-1.5 rounded-full border border-indigo-200 bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700 dark:border-indigo-900 dark:bg-indigo-950 dark:text-indigo-300">
                                <Sparkles className="size-3.5" /> Built for schools, by people who’ve made timetables by hand
                            </span>
                            <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                                School timetables,{' '}
                                <span className="bg-gradient-to-r from-indigo-600 to-sky-500 bg-clip-text text-transparent">done in minutes</span>, not weeks.
                            </h1>
                            <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                                Plan every class and every teacher from one place. Generate a clash-free week, adjust it with drag and drop, and download
                                it ready to print.
                            </p>
                            <div className="mt-8 flex flex-wrap gap-3">
                                {auth.user ? (
                                    <Link href={dashboard()} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700">
                                        Go to dashboard
                                        <ArrowRight className="size-4" />
                                    </Link>
                                ) : (
                                    <Link href={register()} className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-5 py-3 font-medium text-white shadow-lg shadow-indigo-600/20 transition hover:bg-indigo-700">
                                        Get started
                                        <ArrowRight className="size-4" />
                                    </Link>
                                )}
                            </div>
                        </div>

                        <div className="relative">
                            <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-500/20 to-sky-400/20 blur-2xl" />
                            <div className="relative rounded-2xl border bg-card p-4 shadow-xl">
                                <div className="mb-3 flex items-center justify-between">
                                    <div>
                                        <p className="text-sm font-semibold">Class 10A</p>
                                        <p className="text-xs text-muted-foreground">Term 1 · Published</p>
                                    </div>
                                    <span className="rounded-full bg-green-100 px-2 py-0.5 text-[11px] font-medium text-green-800 dark:bg-green-900/40 dark:text-green-300">
                                        0 clashes
                                    </span>
                                </div>
                                <div className="grid grid-cols-5 gap-1.5">
                                    {previewDays.map((day) => (
                                        <div key={day} className="pb-1 text-center text-[11px] font-medium text-muted-foreground">
                                            {day}
                                        </div>
                                    ))}
                                    {previewGrid.map((row, rowIndex) =>
                                        row === null ? (
                                            <div
                                                key={`break-${rowIndex}`}
                                                className="col-span-5 rounded-md bg-amber-100 py-1 text-center text-[11px] font-medium text-amber-800 dark:bg-amber-900/40 dark:text-amber-300"
                                            >
                                                Interval
                                            </div>
                                        ) : (
                                            row.map((color, columnIndex) => (
                                                <div
                                                    key={`${rowIndex}-${columnIndex}`}
                                                    className={`${color} h-8 rounded-md opacity-90 shadow-sm transition hover:scale-105 hover:opacity-100`}
                                                />
                                            ))
                                        ),
                                    )}
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="border-y bg-muted/30">
                    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 text-center md:grid-cols-4">
                        {[
                            { value: '0', label: 'teacher clashes' },
                            { value: '1 click', label: 'to generate every class' },
                            { value: '3', label: 'export formats' },
                            { value: '24/7', label: 'access for staff' },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">{stat.value}</p>
                                <p className="mt-1 text-sm text-muted-foreground">{stat.label}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 py-16">
                    <div className="mx-auto mb-10 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight">Everything a timetable coordinator needs</h2>
                        <p className="mt-3 text-muted-foreground">From the first grade you add to the printed sheet on the staffroom wall.</p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {features.map((feature) => (
                            <div key={feature.title} className="group rounded-xl border bg-card p-6 transition hover:-translate-y-1 hover:shadow-lg">
                                <span className="mb-4 inline-flex rounded-lg bg-indigo-50 p-2.5 text-indigo-600 transition group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950 dark:text-indigo-300">
                                    <feature.icon className="size-5" />
                                </span>
                                <h3 className="font-semibold">{feature.title}</h3>
                                <p className="mt-1.5 text-sm text-muted-foreground">{feature.text}</p>
                            </div>
                        ))}
                    </div>
                </section>

                <section className="bg-muted/30 py-16">
                    <div className="mx-auto max-w-6xl px-4">
                        <h2 className="mb-10 text-center text-3xl font-bold tracking-tight">Up and running in three steps</h2>
                        <ol className="grid gap-6 md:grid-cols-3">
                            {steps.map((step, index) => (
                                <li key={step.title} className="relative rounded-xl border bg-card p-6">
                                    <span className="absolute -top-4 left-6 flex size-8 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white">
                                        {index + 1}
                                    </span>
                                    <h3 className="mt-2 font-semibold">{step.title}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{step.text}</p>
                                </li>
                            ))}
                        </ol>
                    </div>
                </section>

                <section className="mx-auto max-w-6xl px-4 py-16">
                    <div className="grid gap-6 md:grid-cols-3">
                        {[
                            { icon: GraduationCap, title: 'For principals', text: 'See setup progress, timetable coverage and teacher workload at a glance.' },
                            { icon: Users, title: 'For teachers', text: 'Teachers see “My Timetable” when they log in, and all teacher timetables print as one PDF.' },
                            { icon: ShieldCheck, title: 'Safe changes', text: 'Changing an assignment flags affected timetables for review. Locked periods stay put.' },
                        ].map((item) => (
                            <div key={item.title} className="flex gap-4">
                                <item.icon className="mt-1 size-6 shrink-0 text-indigo-600 dark:text-indigo-400" />
                                <div>
                                    <h3 className="font-semibold">{item.title}</h3>
                                    <p className="mt-1 text-sm text-muted-foreground">{item.text}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>


                <section className="px-4 pb-16">
                    <div className="mx-auto max-w-6xl overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 p-10 text-center text-white shadow-xl">
                        <h2 className="text-2xl font-bold sm:text-3xl">Ready to make your first timetable?</h2>
                        <p className="mx-auto mt-3 max-w-xl text-indigo-50">
                            Register your school, add your subjects and teachers, generate every class timetable and download a PDF.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            {auth.user ? (
                                <Link href={dashboard()} className="rounded-lg bg-white px-5 py-3 font-medium text-indigo-700 hover:bg-indigo-50">
                                    Go to dashboard
                                </Link>
                            ) : (
                                <Link href={register()} className="inline-flex items-center gap-2 rounded-lg bg-white px-5 py-3 font-medium text-indigo-700 hover:bg-indigo-50">
                                    <Lock className="size-4" /> Create your account
                                </Link>
                            )}
                        </div>
                    </div>
                </section>

                <footer className="border-t py-6 text-center text-xs text-muted-foreground">
                    <p>© {new Date().getFullYear()} School Timetable Management System</p>
                    <p className="mt-1">
                        Powered by{' '}
                        <a
                            href="https://www.halasoft.cc/"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline underline-offset-2 hover:text-foreground"
                        >
                            HalaSoft
                        </a>
                    </p>
                </footer>
            </div>
        </>
    );
}
