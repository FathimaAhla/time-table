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
    Monitor,
    MousePointerClick,
    ShieldCheck,
    Smartphone,
    Sparkles,
    Tablet,
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
import {
    DesktopDevice,
    PhoneDevice,
    TabletDevice,
} from '@/components/welcome/device-showcase';
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

const heroChips = [
    {
        label: 'Maths',
        color: '#6366f1',
        position: 'top-32 left-[6%]',
        depth: -35,
        rotate: -8,
        delay: 0,
    },
    {
        label: 'Science',
        color: '#10b981',
        position: 'top-64 left-[12%]',
        depth: 25,
        rotate: 6,
        delay: 1.2,
    },
    {
        label: 'English',
        color: '#0ea5e9',
        position: 'top-28 right-[8%]',
        depth: 40,
        rotate: 7,
        delay: 0.6,
    },
    {
        label: 'History',
        color: '#f59e0b',
        position: 'top-72 right-[14%]',
        depth: -25,
        rotate: -5,
        delay: 1.8,
    },
    {
        label: 'Art',
        color: '#ec4899',
        position: 'top-[26rem] left-[4%]',
        depth: 45,
        rotate: 10,
        delay: 2.4,
    },
    {
        label: 'ICT',
        color: '#8b5cf6',
        position: 'top-[25rem] right-[5%]',
        depth: -40,
        rotate: -10,
        delay: 0.9,
    },
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
                    background: 'rgba(99,102,241,0.05)',
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
                    className="fixed inset-x-0 top-0 z-30 h-0.5 origin-left bg-indigo-600"
                    style={{ transform: `scaleX(${scrollProgress})` }}
                />

                <header
                    className={`sticky top-0 z-20 border-b transition-all duration-300 ${scrolled ? 'bg-background/85 text-foreground shadow-sm backdrop-blur' : 'border-transparent bg-transparent text-white'}`}
                >
                    <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
                        <span className="flex items-center gap-2 font-semibold">
                            <span
                                className={`rounded-lg p-1.5 ${scrolled ? 'bg-indigo-600 text-white' : 'bg-white text-indigo-700'}`}
                            >
                                <CalendarDays className="size-4" />
                            </span>
                            School Timetable
                            <span className="hidden rounded-full bg-green-400 px-2 py-0.5 text-[10px] font-bold tracking-wide text-green-950 uppercase sm:inline">
                                Free
                            </span>
                        </span>
                        <nav className="flex items-center gap-2 text-sm">
                            {auth.user ? (
                                <Link
                                    href={dashboard()}
                                    className={`rounded-md px-4 py-1.5 font-medium ${scrolled ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-indigo-700 hover:bg-indigo-50'}`}
                                >
                                    Dashboard
                                </Link>
                            ) : (
                                <>
                                    <Link
                                        href={login()}
                                        className={`rounded-md px-3 py-1.5 ${scrolled ? 'hover:bg-muted' : 'hover:bg-white/15'}`}
                                    >
                                        Log in
                                    </Link>
                                    <Link
                                        href={register()}
                                        className={`rounded-md px-4 py-1.5 font-medium ${scrolled ? 'bg-indigo-600 text-white hover:bg-indigo-700' : 'bg-white text-indigo-700 hover:bg-indigo-50'}`}
                                    >
                                        Start free
                                    </Link>
                                </>
                            )}
                        </nav>
                    </div>
                </header>

                {/* ---------------- Hero banner (full width, colourful) ---------------- */}
                <section
                    onPointerMove={onHeroMove}
                    onPointerLeave={() => setTilt({ x: 0, y: 0 })}
                    className="relative -mt-14 overflow-hidden bg-indigo-700 pt-14 pb-44 text-white sm:pb-60 lg:pb-80"
                >
                    {/* Floating subject chips in the timetable colours */}
                    {heroChips.map((chip) => (
                        <div
                            key={chip.label}
                            className={`pointer-events-none absolute hidden md:block ${chip.position}`}
                            style={layer(chip.depth)}
                        >
                            <span
                                className="inline-block animate-float rounded-lg px-3 py-1.5 text-xs font-semibold text-white shadow-lg ring-1 ring-white/30"
                                style={{
                                    backgroundColor: chip.color,
                                    rotate: `${chip.rotate}deg`,
                                    animationDelay: `${chip.delay}s`,
                                }}
                            >
                                {chip.label}
                            </span>
                        </div>
                    ))}

                    <div className="relative mx-auto max-w-4xl px-4 pt-14 text-center sm:pt-20">
                        <Reveal>
                            <span className="mb-6 inline-flex items-center gap-1.5 rounded-full border border-white/30 bg-white/15 px-4 py-1.5 text-xs font-semibold backdrop-blur sm:text-sm">
                                <Gift className="size-4 text-amber-300" /> 100%
                                free for schools · No credit card · No hidden
                                fees
                            </span>
                        </Reveal>
                        <Reveal delay={100}>
                            <h1 className="text-4xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl">
                                Stop spending your holidays on the{' '}
                                <span className="text-amber-300">
                                    timetable
                                </span>
                                .
                            </h1>
                        </Reveal>
                        <Reveal delay={200}>
                            <p className="mx-auto mt-6 max-w-2xl text-lg text-indigo-100 sm:text-xl">
                                Free timetable software for principals. Add your
                                teachers and subjects, click{' '}
                                <strong className="text-white">Generate</strong>
                                , and print a clash-free, colour-coded timetable
                                for every class in minutes.
                            </p>
                        </Reveal>
                        <Reveal delay={300}>
                            <div className="mt-9 flex flex-wrap items-center justify-center gap-3">
                                <Link
                                    href={auth.user ? dashboard() : register()}
                                    className="group inline-flex items-center gap-2 rounded-xl bg-white px-7 py-3.5 font-semibold text-indigo-700 shadow-xl shadow-indigo-900/30 transition hover:-translate-y-0.5 hover:bg-indigo-50"
                                >
                                    {auth.user
                                        ? 'Go to dashboard'
                                        : 'Create free school account'}
                                    <ArrowRight className="size-4 transition-transform group-hover:translate-x-1" />
                                </Link>
                                <a
                                    href="/"
                                    onClick={(e) => {
                                        e.preventDefault();
                                        document
                                            .getElementById('how-it-works')
                                            ?.scrollIntoView({
                                                behavior: 'smooth',
                                            });
                                    }}
                                    className="inline-flex items-center gap-1.5 rounded-xl border border-white/40 px-6 py-3.5 font-medium backdrop-blur transition hover:bg-white/15"
                                >
                                    See how it works
                                    <ChevronDown className="size-4" />
                                </a>
                            </div>
                        </Reveal>
                        <Reveal delay={400}>
                            <ul className="mt-7 flex flex-wrap justify-center gap-x-6 gap-y-2 text-sm text-indigo-100">
                                {[
                                    'Free forever',
                                    'Set up in under 30 minutes',
                                    'Works on phone, tablet & computer',
                                ].map((item) => (
                                    <li
                                        key={item}
                                        className="flex items-center gap-1.5"
                                    >
                                        <CheckCircle2 className="size-4 text-green-300" />{' '}
                                        {item}
                                    </li>
                                ))}
                            </ul>
                        </Reveal>
                    </div>
                </section>

                {/* ---------------- Devices: desktop, tablet, phone ---------------- */}
                <section
                    onPointerMove={onHeroMove}
                    onPointerLeave={() => setTilt({ x: 0, y: 0 })}
                    className="relative z-10 -mt-36 px-4 pb-8 sm:-mt-52 sm:pb-16 lg:-mt-72"
                >
                    <div className="relative mx-auto max-w-5xl [perspective:1600px]">
                        <Reveal from="zoom" delay={200}>
                            <div
                                style={{
                                    transform: `rotateY(${tilt.x * 6}deg) rotateX(${-tilt.y * 6}deg)`,
                                    transition: 'transform 250ms ease-out',
                                }}
                            >
                                <DesktopDevice />
                            </div>
                        </Reveal>

                        <div className="absolute -bottom-4 -left-14 hidden w-80 lg:block xl:-left-32">
                            <Reveal from="left" delay={600}>
                                <TabletDevice style={layer(30)} />
                            </Reveal>
                        </div>
                        <div className="absolute -right-8 -bottom-10 hidden w-44 lg:block xl:-right-24">
                            <Reveal from="right" delay={750}>
                                <PhoneDevice style={layer(45)} />
                            </Reveal>
                        </div>

                        {/* Floating status chips */}
                        <div
                            className="absolute -top-5 right-[12%] z-10 hidden sm:block"
                            style={layer(55)}
                        >
                            <Reveal from="zoom" delay={1000}>
                                <div className="animate-float rounded-xl border bg-card px-3 py-2 text-xs font-semibold shadow-xl">
                                    <span className="flex items-center gap-1.5 text-green-700 dark:text-green-400">
                                        <CheckCircle2 className="size-4" /> 0
                                        clashes found
                                    </span>
                                </div>
                            </Reveal>
                        </div>
                        <div
                            className="absolute -top-5 left-[12%] z-10 hidden sm:block"
                            style={layer(-45)}
                        >
                            <Reveal from="zoom" delay={1150}>
                                <div className="animate-float rounded-xl border bg-card px-3 py-2 text-xs font-semibold shadow-xl [animation-delay:1.5s]">
                                    <span className="flex items-center gap-1.5">
                                        <Wand2 className="size-4 text-violet-600" />{' '}
                                        Generated in 3 seconds
                                    </span>
                                </div>
                            </Reveal>
                        </div>
                    </div>

                    {/* Tablet + phone sit side by side under the desktop on smaller screens */}
                    <div className="mx-auto mt-10 grid max-w-xl grid-cols-1 items-end gap-6 sm:grid-cols-[1fr_0.45fr] sm:gap-4 lg:hidden">
                        <Reveal from="left" className="min-w-0">
                            <TabletDevice />
                        </Reveal>
                        <Reveal
                            from="right"
                            delay={150}
                            className="mx-auto w-48 min-w-0 sm:w-auto"
                        >
                            <PhoneDevice />
                        </Reveal>
                    </div>

                    <Reveal className="mx-auto mt-14 max-w-3xl text-center lg:mt-24">
                        <h2 className="text-2xl font-bold tracking-tight sm:text-3xl">
                            One timetable. Every screen.
                        </h2>
                        <p className="mt-2 text-muted-foreground">
                            Plan on the office computer, check on a tablet in
                            the staffroom, and every teacher sees it on their
                            phone.
                        </p>
                        <div className="mt-6 flex flex-wrap justify-center gap-3">
                            {[
                                {
                                    icon: Monitor,
                                    label: 'Desktop',
                                    color: 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950 dark:text-indigo-300',
                                },
                                {
                                    icon: Tablet,
                                    label: 'Tablet',
                                    color: 'bg-violet-100 text-violet-700 dark:bg-violet-950 dark:text-violet-300',
                                },
                                {
                                    icon: Smartphone,
                                    label: 'Phone',
                                    color: 'bg-fuchsia-100 text-fuchsia-700 dark:bg-fuchsia-950 dark:text-fuchsia-300',
                                },
                                {
                                    icon: Download,
                                    label: 'PDF · PNG · JPG',
                                    color: 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300',
                                },
                            ].map((item) => (
                                <span
                                    key={item.label}
                                    className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 text-sm font-medium ${item.color}`}
                                >
                                    <item.icon className="size-4" />{' '}
                                    {item.label}
                                </span>
                            ))}
                        </div>
                    </Reveal>
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
                            <div className="absolute top-0 right-[16%] left-[16%] hidden h-0.5 bg-indigo-200 md:block dark:bg-indigo-900" />
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
                        <div className="h-full rounded-2xl border border-green-200 bg-green-50 p-8 dark:border-green-900 dark:bg-green-950/30">
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
                        <div className="relative mx-auto max-w-6xl overflow-hidden rounded-2xl bg-indigo-600 p-10 text-center text-white shadow-xl sm:p-14">
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
