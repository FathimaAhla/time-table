import { Head, Link, usePage } from '@inertiajs/react';
import {
    ArrowRight,
    BellRing,
    Building2,
    CalendarDays,
    CheckCircle2,
    ChevronDown,
    Clock,
    Download,
    Eraser,
    Gift,
    HeartHandshake,
    Lock,
    Megaphone,
    MousePointerClick,
    ShieldCheck,
    Smartphone,
    Sparkles,
    UserX,
    Users,
    Wand2,
    XCircle,
} from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import type {
    CSSProperties,
    PointerEvent as ReactPointerEvent,
    ReactNode,
} from 'react';
import { dashboard, login, register } from '@/routes';

/* ------------------------------------------------------------------ */
/* Content                                                             */
/* ------------------------------------------------------------------ */

const painPoints = [
    { icon: UserX, text: 'Two teachers booked into the same class at 9:00 am' },
    {
        icon: CalendarDays,
        text: 'A teacher goes on leave and the whole week falls apart',
    },
    { icon: Eraser, text: 'Weeks of pencil and eraser on a giant chart paper' },
    {
        icon: Megaphone,
        text: 'Teachers keep asking you “what’s my timetable?”',
    },
];

const comparison = [
    { before: '2–3 weeks of manual work', after: 'Ready in under an hour' },
    {
        before: 'Clashes found on the first day of term',
        after: 'Zero clashes, checked automatically',
    },
    {
        before: 'One copy on the staffroom wall',
        after: 'Every teacher sees their own timetable on their phone',
    },
    {
        before: 'Start over when something changes',
        after: 'Drag, drop or regenerate in seconds',
    },
];

const benefits = [
    {
        icon: Wand2,
        title: 'The whole school in one click',
        text: 'Assign teachers to subjects and classes, then generate clash-free timetables for every class at once.',
    },
    {
        icon: ShieldCheck,
        title: 'No more clash complaints',
        text: 'Daily and weekly teacher limits are respected, so nobody is ever in two rooms at once.',
    },
    {
        icon: Smartphone,
        title: 'Teachers stop asking you',
        text: 'Each teacher logs in and sees “My Timetable”, on a phone or a computer.',
    },
    {
        icon: MousePointerClick,
        title: 'Teacher on leave? Fixed in 2 minutes',
        text: 'Drag and swap any period. Lock the ones that must never move, then regenerate the rest.',
    },
    {
        icon: BellRing,
        title: 'Breaks line up everywhere',
        text: 'Assembly, interval and lunch are shared fixed slots across every class automatically.',
    },
    {
        icon: Download,
        title: 'Print-ready for the notice board',
        text: 'Download class, teacher and master timetables as PDF, PNG or JPG.',
    },
];

const steps = [
    {
        title: 'Set up your school',
        time: '10 min',
        text: 'Grades, classes, subjects and bell times.',
    },
    {
        title: 'Add your teachers',
        time: '15 min',
        text: 'Who teaches what, to which class, how often.',
    },
    {
        title: 'Generate & print',
        time: '1 click',
        text: 'Review, fine-tune with drag & drop, then export.',
    },
];

const faqs = [
    {
        q: 'Is it really free?',
        a: 'Yes. There is no trial period, no limit on teachers or classes, no ads and no payment details needed to sign up.',
    },
    {
        q: 'Is my school’s data safe?',
        a: 'Each school’s grades, teachers and timetables are kept fully separate. Only people you give an account to can see them.',
    },
    {
        q: 'Do I need to install anything?',
        a: 'No. It runs in the browser on any computer, tablet or phone. Just create an account and start.',
    },
    {
        q: 'Can tuition classes and institutes use it?',
        a: 'Yes. Schools, tuition centres and institutes all work the same way: classes, teachers, subjects and time slots.',
    },
];

const previewDays = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
const subjectColors: Record<string, string> = {
    Maths: 'bg-indigo-500',
    Science: 'bg-emerald-500',
    English: 'bg-sky-500',
    History: 'bg-amber-500',
    Art: 'bg-pink-500',
    ICT: 'bg-violet-500',
    PE: 'bg-red-500',
};
const previewGrid: (string[] | null)[] = [
    ['Maths', 'Science', 'English', 'History', 'Art'],
    ['Science', 'Maths', 'ICT', 'English', 'Maths'],
    ['English', 'History', 'Maths', 'Science', 'PE'],
    null,
    ['ICT', 'English', 'Science', 'Maths', 'History'],
    ['Art', 'PE', 'History', 'ICT', 'Science'],
];

/* ------------------------------------------------------------------ */
/* Motion helpers                                                      */
/* ------------------------------------------------------------------ */

function usePrefersReducedMotion() {
    const [reduced, setReduced] = useState(false);

    useEffect(() => {
        const query = window.matchMedia('(prefers-reduced-motion: reduce)');
        setReduced(query.matches);
        const onChange = () => setReduced(query.matches);
        query.addEventListener('change', onChange);

        return () => query.removeEventListener('change', onChange);
    }, []);

    return reduced;
}

/** Fades and slides its children in the first time they scroll into view. */
function Reveal({
    children,
    delay = 0,
    from = 'up',
    className = '',
}: {
    children: ReactNode;
    delay?: number;
    from?: 'up' | 'left' | 'right' | 'zoom';
    className?: string;
}) {
    const ref = useRef<HTMLDivElement>(null);
    const [visible, setVisible] = useState(false);

    useEffect(() => {
        const node = ref.current;

        if (!node) {
            return;
        }

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setVisible(true);
                    observer.disconnect();
                }
            },
            { threshold: 0.15, rootMargin: '0px 0px -40px 0px' },
        );
        observer.observe(node);

        return () => observer.disconnect();
    }, []);

    const hidden = {
        up: 'translate-y-8 opacity-0',
        left: '-translate-x-10 opacity-0',
        right: 'translate-x-10 opacity-0',
        zoom: 'scale-95 opacity-0',
    }[from];

    return (
        <div
            ref={ref}
            style={{ transitionDelay: `${delay}ms` }}
            className={`transition-all duration-700 ease-out motion-reduce:transition-none ${visible ? 'translate-x-0 translate-y-0 scale-100 opacity-100' : `${hidden} motion-reduce:translate-x-0 motion-reduce:translate-y-0 motion-reduce:scale-100 motion-reduce:opacity-100`} ${className}`}
        >
            {children}
        </div>
    );
}

/** Card with a soft glow that follows the mouse pointer. */
function SpotlightCard({
    children,
    className = '',
}: {
    children: ReactNode;
    className?: string;
}) {
    const onMove = (event: ReactPointerEvent<HTMLDivElement>) => {
        const rect = event.currentTarget.getBoundingClientRect();
        event.currentTarget.style.setProperty(
            '--x',
            `${event.clientX - rect.left}px`,
        );
        event.currentTarget.style.setProperty(
            '--y',
            `${event.clientY - rect.top}px`,
        );
    };

    return (
        <div
            onPointerMove={onMove}
            className={`group relative h-full overflow-hidden rounded-xl border bg-card transition duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-indigo-500/10`}
        >
            <div
                className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                style={{
                    background:
                        'radial-gradient(280px circle at var(--x) var(--y), rgba(99,102,241,0.15), transparent 70%)',
                }}
            />
            <div className={`relative ${className}`}>{children}</div>
        </div>
    );
}

/** Counts up to `to` once visible. */
function CountUp({ to, suffix = '' }: { to: number; suffix?: string }) {
    const ref = useRef<HTMLSpanElement>(null);
    const [value, setValue] = useState(0);

    useEffect(() => {
        const node = ref.current;

        if (!node) {
            return;
        }

        const observer = new IntersectionObserver(([entry]) => {
            if (!entry.isIntersecting) {
                return;
            }

            observer.disconnect();
            const start = performance.now();
            const duration = 1200;
            const tick = (now: number) => {
                const progress = Math.min((now - start) / duration, 1);
                setValue(Math.round(to * (1 - Math.pow(1 - progress, 3))));

                if (progress < 1) {
                    requestAnimationFrame(tick);
                }
            };
            requestAnimationFrame(tick);
        });
        observer.observe(node);

        return () => observer.disconnect();
    }, [to]);

    return (
        <span ref={ref}>
            {value}
            {suffix}
        </span>
    );
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Welcome() {
    const { auth } = usePage().props;
    const reducedMotion = usePrefersReducedMotion();
    const [tilt, setTilt] = useState({ x: 0, y: 0 });
    const [scrolled, setScrolled] = useState(false);
    const [scrollProgress, setScrollProgress] = useState(0);
    const [openFaq, setOpenFaq] = useState<number | null>(0);

    useEffect(() => {
        const onScroll = () => {
            const max =
                document.documentElement.scrollHeight - window.innerHeight;
            setScrolled(window.scrollY > 10);
            setScrollProgress(max > 0 ? window.scrollY / max : 0);
        };
        onScroll();
        window.addEventListener('scroll', onScroll, { passive: true });

        return () => window.removeEventListener('scroll', onScroll);
    }, []);

    const onHeroMove = (event: ReactPointerEvent<HTMLElement>) => {
        if (reducedMotion || event.pointerType !== 'mouse') {
            return;
        }

        const rect = event.currentTarget.getBoundingClientRect();
        setTilt({
            x: (event.clientX - rect.left) / rect.width - 0.5,
            y: (event.clientY - rect.top) / rect.height - 0.5,
        });
    };

    const primaryCta = auth.user ? (
        <Link
            href={dashboard()}
            className="group inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl"
        >
            Go to dashboard
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
    ) : (
        <Link
            href={register()}
            className="group inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-600/30 transition hover:-translate-y-0.5 hover:bg-indigo-700 hover:shadow-xl"
        >
            Create free school account
            <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
        </Link>
    );

    const layer = (depth: number): CSSProperties => ({
        transform: `translate3d(${tilt.x * depth}px, ${tilt.y * depth}px, 0)`,
        transition: 'transform 200ms ease-out',
    });

    return (
        <>
            <Head title="Free School Timetable Generator for Principals">
                <meta
                    name="description"
                    content="Free school timetable software for principals. Generate clash-free timetables for every class in minutes, adjust with drag and drop, and print."
                />
            </Head>

            <div className="min-h-screen overflow-x-hidden bg-background text-foreground">
                {/* Scroll progress bar */}
                <div
                    className="fixed inset-x-0 top-0 z-30 h-0.5 origin-left bg-gradient-to-r from-indigo-600 to-sky-500"
                    style={{ transform: `scaleX(${scrollProgress})` }}
                />

                <header
                    className={`sticky top-0 z-20 border-b transition-all duration-300 ${scrolled ? 'bg-background/80 shadow-sm backdrop-blur' : 'border-transparent bg-transparent'}`}
                >
                    <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
                        <span className="flex items-center gap-2 font-semibold">
                            <span className="rounded-lg bg-indigo-600 p-1.5 text-white">
                                <CalendarDays className="size-4" />
                            </span>
                            School Timetable
                            <span className="hidden rounded-full bg-green-100 px-2 py-0.5 text-[10px] font-bold tracking-wide text-green-700 uppercase sm:inline dark:bg-green-900/40 dark:text-green-300">
                                Free
                            </span>
                        </span>
                        <nav className="flex items-center gap-2 text-sm">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className="rounded-md bg-indigo-600 px-4 py-1.5 font-medium text-white hover:bg-indigo-700"
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className="rounded-md px-3 py-1.5 hover:bg-muted"
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className="rounded-md bg-indigo-600 px-4 py-1.5 font-medium text-white hover:bg-indigo-700"
                                    >
                                        Start free
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ---------------- Hero ---------------- */}
                <section
                    onPointerMove={onHeroMove}
                    onPointerLeave={() => setTilt({ x: 0, y: 0 })}
                    className="relative -mt-14 pt-14"
                >
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_top,rgba(99,102,241,0.18),transparent_60%)]" />
                    <div
                        className="pointer-events-none absolute -top-10 -left-20 size-72 rounded-full bg-indigo-400/20 blur-3xl"
                        style={layer(-40)}
                    />
                    <div
                        className="pointer-events-none absolute top-40 -right-10 size-80 rounded-full bg-sky-400/20 blur-3xl"
                        style={layer(50)}
                    />

                    <div className="relative mx-auto grid max-w-6xl items-center gap-12 px-4 py-16 lg:grid-cols-2 lg:py-24">
                        <div>
                            <Reveal>
                                <span className="mb-5 inline-flex items-center gap-1.5 rounded-full border border-green-200 bg-green-50 px-3 py-1 text-xs font-semibold text-green-700 dark:border-green-900 dark:bg-green-950 dark:text-green-300">
                                    <Gift className="size-3.5" /> 100% free for
                                    schools · No credit card · No hidden fees
                                </span>
                            </Reveal>
                            <Reveal delay={100}>
                                <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
                                    Stop spending your holidays on the{' '}
                                    <span className="animate-gradient bg-gradient-to-r from-indigo-600 via-sky-500 to-indigo-600 bg-[length:200%_auto] bg-clip-text text-transparent">
                                        timetable
                                    </span>
                                    .
                                </h1>
                            </Reveal>
                            <Reveal delay={200}>
                                <p className="mt-5 max-w-xl text-lg text-muted-foreground">
                                    Free timetable software for principals. Add
                                    your teachers and subjects, click{' '}
                                    <strong>Generate</strong>, and print a
                                    clash-free timetable for every class in
                                    minutes.
                                </p>
                            </Reveal>
                            <Reveal delay={300}>
                                <div className="mt-8 flex flex-wrap items-center gap-3">
                                    {primaryCta}
                                    <a
                                        href="#how-it-works"
                                        className="inline-flex items-center gap-1.5 rounded-lg border px-5 py-3 font-medium transition hover:bg-muted"
                                    >
                                        See how it works
                                        <ChevronDown className="size-4" />
                                    </a>
                                </div>
                            </Reveal>
                            <Reveal delay={400}>
                                <ul className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                                    {[
                                        'Free forever',
                                        'Set up in under 30 minutes',
                                        'Works on phone & computer',
                                    ].map((item) => (
                                        <li
                                            key={item}
                                            className="flex items-center gap-1.5"
                                        >
                                            <CheckCircle2 className="size-4 text-green-600" />{' '}
                                            {item}
                                        </li>
                                    ))}
                                </ul>
                            </Reveal>
                        </div>

                        {/* Preview with mouse parallax / 3D tilt */}
                        <Reveal
                            from="zoom"
                            delay={200}
                            className="[perspective:1200px]"
                        >
                            <div
                                className="relative"
                                style={{
                                    transform: `rotateY(${tilt.x * 10}deg) rotateX(${-tilt.y * 10}deg)`,
                                    transition: 'transform 200ms ease-out',
                                    transformStyle: 'preserve-3d',
                                }}
                            >
                                <div className="absolute -inset-4 rounded-3xl bg-gradient-to-tr from-indigo-500/25 to-sky-400/25 blur-2xl" />
                                <div className="relative rounded-2xl border bg-card p-4 shadow-2xl">
                                    <div className="mb-3 flex items-center justify-between">
                                        <div>
                                            <p className="text-sm font-semibold">
                                                Class 10A
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Term 1 · Published
                                            </p>
                                        </div>
                                        <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[11px] font-medium text-indigo-800 dark:bg-indigo-900/40 dark:text-indigo-300">
                                            Class teacher: Mrs. Silva
                                        </span>
                                    </div>
                                    <div className="grid grid-cols-5 gap-1.5">
                                        {previewDays.map((day) => (
                                            <div
                                                key={day}
                                                className="pb-1 text-center text-[11px] font-medium text-muted-foreground"
                                            >
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
                                                row.map(
                                                    (subject, columnIndex) => (
                                                        <div
                                                            key={`${rowIndex}-${columnIndex}`}
                                                            className={`${subjectColors[subject]} flex h-8 animate-cell-in items-center justify-center rounded-md text-[10px] font-medium text-white opacity-0 shadow-sm transition hover:z-10 hover:scale-110`}
                                                            style={{
                                                                animationDelay: `${400 + (rowIndex * 5 + columnIndex) * 35}ms`,
                                                            }}
                                                        >
                                                            {subject}
                                                        </div>
                                                    ),
                                                )
                                            ),
                                        )}
                                    </div>
                                </div>

                                {/* Floating chips that move more than the card (depth) */}
                                <div className="absolute -top-5 -right-3 animate-float rounded-xl border bg-card px-3 py-2 text-xs font-semibold shadow-lg sm:-right-6">
                                    <span className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                                        <CheckCircle2 className="size-4" /> 0
                                        clashes found
                                    </span>
                                </div>
                                <div className="absolute -bottom-5 -left-3 animate-float rounded-xl border bg-card px-3 py-2 text-xs font-semibold shadow-lg [animation-delay:1.5s] sm:-left-6">
                                    <span className="flex items-center gap-1.5">
                                        <Wand2 className="size-4 text-indigo-600" />{' '}
                                        Generated in 3 seconds
                                    </span>
                                </div>
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ---------------- Stats ---------------- */}
                <section className="border-y bg-muted/30">
                    <div className="mx-auto grid max-w-6xl grid-cols-2 gap-6 px-4 py-10 text-center md:grid-cols-4">
                        {[
                            {
                                value: <>Free</>,
                                label: 'forever, for every school',
                            },
                            {
                                value: <CountUp to={0} />,
                                label: 'teacher clashes',
                            },
                            {
                                value: <>1 click</>,
                                label: 'to generate every class',
                            },
                            {
                                value: <CountUp to={30} suffix=" min" />,
                                label: 'from sign-up to printout',
                            },
                        ].map((stat, index) => (
                            <Reveal key={stat.label} delay={index * 100}>
                                <p className="text-3xl font-bold text-indigo-600 dark:text-indigo-400">
                                    {stat.value}
                                </p>
                                <p className="mt-1 text-sm text-muted-foreground">
                                    {stat.label}
                                </p>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* ---------------- Problem ---------------- */}
                <section className="mx-auto max-w-6xl px-4 py-20">
                    <Reveal className="mx-auto mb-10 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Sound familiar?
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            Every principal has lived through at least one of
                            these.
                        </p>
                    </Reveal>
                    <div className="grid gap-4 sm:grid-cols-2">
                        {painPoints.map((pain, index) => (
                            <Reveal
                                key={pain.text}
                                from={index % 2 === 0 ? 'left' : 'right'}
                                delay={index * 100}
                            >
                                <SpotlightCard className="flex items-center gap-4 p-5">
                                    <span className="rounded-lg bg-red-50 p-2.5 text-red-600 dark:bg-red-950 dark:text-red-400">
                                        <pain.icon className="size-5" />
                                    </span>
                                    <p className="font-medium">{pain.text}</p>
                                </SpotlightCard>
                            </Reveal>
                        ))}
                    </div>
                    <Reveal delay={200}>
                        <p className="mt-10 text-center text-xl font-semibold">
                            School Timetable fixes all of this.{' '}
                            <span className="text-green-600 dark:text-green-400">
                                For free.
                            </span>
                        </p>
                    </Reveal>
                </section>

                {/* ---------------- Before / After ---------------- */}
                <section className="bg-muted/30 py-20">
                    <div className="mx-auto max-w-4xl px-4">
                        <Reveal className="mb-10 text-center">
                            <h2 className="text-3xl font-bold tracking-tight">
                                Before and after
                            </h2>
                        </Reveal>
                        <Reveal from="zoom">
                            <div className="overflow-hidden rounded-2xl border bg-card shadow-sm">
                                <div className="grid grid-cols-2 border-b text-sm font-semibold">
                                    <div className="flex items-center gap-2 px-5 py-3 text-muted-foreground">
                                        <Eraser className="size-4" /> By hand
                                    </div>
                                    <div className="flex items-center gap-2 bg-indigo-50 px-5 py-3 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300">
                                        <Sparkles className="size-4" /> With
                                        School Timetable
                                    </div>
                                </div>
                                {comparison.map((row, index) => (
                                    <Reveal
                                        key={row.before}
                                        delay={index * 120}
                                    >
                                        <div className="grid grid-cols-2 border-b text-sm last:border-b-0">
                                            <div className="flex items-start gap-2 px-5 py-4 text-muted-foreground">
                                                <XCircle className="mt-0.5 size-4 shrink-0 text-red-500" />{' '}
                                                {row.before}
                                            </div>
                                            <div className="flex items-start gap-2 bg-indigo-50/50 px-5 py-4 font-medium dark:bg-indigo-950/20">
                                                <CheckCircle2 className="mt-0.5 size-4 shrink-0 text-green-600" />{' '}
                                                {row.after}
                                            </div>
                                        </div>
                                    </Reveal>
                                ))}
                            </div>
                        </Reveal>
                    </div>
                </section>

                {/* ---------------- Benefits ---------------- */}
                <section className="mx-auto max-w-6xl px-4 py-20">
                    <Reveal className="mx-auto mb-10 max-w-2xl text-center">
                        <h2 className="text-3xl font-bold tracking-tight">
                            Made for the principal’s office
                        </h2>
                        <p className="mt-3 text-muted-foreground">
                            From the first grade you add to the printed sheet on
                            the staffroom wall.
                        </p>
                    </Reveal>
                    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                        {benefits.map((benefit, index) => (
                            <Reveal
                                key={benefit.title}
                                delay={(index % 3) * 100}
                            >
                                <SpotlightCard className="p-6">
                                    <span className="mb-4 inline-flex rounded-lg bg-indigo-50 p-2.5 text-indigo-600 transition duration-300 group-hover:scale-110 group-hover:rotate-6 group-hover:bg-indigo-600 group-hover:text-white dark:bg-indigo-950 dark:text-indigo-300">
                                        <benefit.icon className="size-5" />
                                    </span>
                                    <h3 className="font-semibold">
                                        {benefit.title}
                                    </h3>
                                    <p className="mt-1.5 text-sm text-muted-foreground">
                                        {benefit.text}
                                    </p>
                                </SpotlightCard>
                            </Reveal>
                        ))}
                    </div>
                </section>

                {/* ---------------- Steps ---------------- */}
                <section
                    id="how-it-works"
                    className="scroll-mt-16 bg-muted/30 py-20"
                >
                    <div className="mx-auto max-w-6xl px-4">
                        <Reveal className="mb-12 text-center">
                            <h2 className="text-3xl font-bold tracking-tight">
                                Up and running before lunch
                            </h2>
                            <p className="mt-3 text-muted-foreground">
                                Three steps. No training needed.
                            </p>
                        </Reveal>
                        <ol className="relative grid gap-8 md:grid-cols-3">
                            <div className="absolute top-0 right-[16%] left-[16%] hidden h-0.5 bg-gradient-to-r from-indigo-200 via-indigo-400 to-indigo-200 md:block dark:from-indigo-900 dark:via-indigo-700 dark:to-indigo-900" />
                            {steps.map((step, index) => (
                                <Reveal key={step.title} delay={index * 150}>
                                    <li className="relative h-full rounded-xl border bg-card p-6 pt-8 text-center transition hover:-translate-y-1 hover:shadow-lg">
                                        <span className="absolute -top-5 left-1/2 flex size-10 -translate-x-1/2 items-center justify-center rounded-full bg-indigo-600 text-sm font-bold text-white shadow-lg ring-4 ring-background">
                                            {index + 1}
                                        </span>
                                        <span className="mb-2 inline-flex items-center gap-1 rounded-full bg-green-50 px-2 py-0.5 text-xs font-semibold text-green-700 dark:bg-green-950 dark:text-green-300">
                                            <Clock className="size-3" />{' '}
                                            {step.time}
                                        </span>
                                        <h3 className="font-semibold">
                                            {step.title}
                                        </h3>
                                        <p className="mt-1 text-sm text-muted-foreground">
                                            {step.text}
                                        </p>
                                    </li>
                                </Reveal>
                            ))}
                        </ol>
                    </div>
                </section>

                {/* ---------------- Why free + FAQ ---------------- */}
                <section className="mx-auto grid max-w-6xl gap-10 px-4 py-20 lg:grid-cols-2">
                    <Reveal from="left">
                        <div className="h-full rounded-2xl border border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 p-8 dark:border-green-900 dark:from-green-950/40 dark:to-emerald-950/20">
                            <span className="inline-flex rounded-xl bg-green-600 p-3 text-white">
                                <HeartHandshake className="size-6" />
                            </span>
                            <h2 className="mt-5 text-3xl font-bold tracking-tight">
                                Free means free.
                            </h2>
                            <p className="mt-3 text-muted-foreground">
                                No trial that runs out. No limit on teachers or
                                classes. No ads. No payment details. We built
                                School Timetable to give principals and
                                coordinators their time back.
                            </p>
                            <ul className="mt-6 space-y-2.5 text-sm">
                                {[
                                    {
                                        icon: Users,
                                        text: 'Unlimited teachers, classes and subjects',
                                    },
                                    {
                                        icon: Lock,
                                        text: 'Your school’s data stays private to your school',
                                    },
                                    {
                                        icon: Building2,
                                        text: 'Works for schools, tuition centres and institutes',
                                    },
                                ].map((item) => (
                                    <li
                                        key={item.text}
                                        className="flex items-center gap-2.5"
                                    >
                                        <item.icon className="size-4 text-green-700 dark:text-green-400" />{' '}
                                        {item.text}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </Reveal>

                    <Reveal from="right">
                        <h2 className="mb-5 text-2xl font-bold tracking-tight">
                            Questions principals ask
                        </h2>
                        <div className="divide-y rounded-2xl border bg-card">
                            {faqs.map((faq, index) => {
                                const open = openFaq === index;

                                return (
                                    <div key={faq.q}>
                                        <button
                                            type="button"
                                            onClick={() =>
                                                setOpenFaq(open ? null : index)
                                            }
                                            aria-expanded={open}
                                            className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left font-medium transition hover:bg-muted/50"
                                        >
                                            {faq.q}
                                            <ChevronDown
                                                className={`size-4 shrink-0 transition-transform duration-300 ${open ? 'rotate-180' : ''}`}
                                            />
                                        </button>
                                        <div
                                            className={`grid transition-all duration-300 ease-out ${open ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0'}`}
                                        >
                                            <p className="overflow-hidden px-5 text-sm text-muted-foreground">
                                                <span className="block pb-4">
                                                    {faq.a}
                                                </span>
                                            </p>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </Reveal>
                </section>

                {/* ---------------- Final CTA ---------------- */}
                <section className="px-4 pb-20">
                    <Reveal from="zoom">
                        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-gradient-to-br from-indigo-600 to-sky-500 p-10 text-center text-white shadow-xl sm:p-14">
                            <div className="pointer-events-none absolute -top-16 -left-16 size-56 animate-float rounded-full bg-white/10 blur-2xl" />
                            <div className="pointer-events-none absolute -right-10 -bottom-20 size-64 animate-float rounded-full bg-white/10 blur-2xl [animation-delay:2s]" />
                            <h2 className="relative text-3xl font-bold sm:text-4xl">
                                Your next timetable is free. Start now.
                            </h2>
                            <p className="relative mx-auto mt-3 max-w-xl text-indigo-50">
                                Register your school, add your subjects and
                                teachers, generate every class timetable and
                                print it today.
                            </p>
                            <div className="relative mt-8 flex flex-col items-center gap-3">
                                <Link
                                    href={auth.user ? dashboard() : register()}
                                    className="group inline-flex items-center gap-2 rounded-lg bg-white px-6 py-3 font-semibold text-indigo-700 shadow-lg transition hover:-translate-y-0.5 hover:bg-indigo-50"
                                >
                                    {auth.user
                                        ? 'Go to dashboard'
                                        : 'Create free school account'}
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                                {!auth.user && (
                                    <p className="text-xs text-indigo-100">
                                        Takes 2 minutes · No payment details
                                        needed
                                    </p>
                                )}
                            </div>
                        </div>
                    </Reveal>
                </section>

                <footer className="border-t py-6 text-center text-xs text-muted-foreground">
                    <p>
                        © {new Date().getFullYear()} School Timetable Management
                        System · Free for every school
                    </p>
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
