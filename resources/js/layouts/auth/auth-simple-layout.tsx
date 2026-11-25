import { Link } from '@inertiajs/react';
import { CalendarDays, Check } from 'lucide-react';
import { home } from '@/routes';
import type { AuthLayoutProps } from '@/types';

const points = [
    'Free for every school',
    'Clash-free timetable in one click',
    'Export to PDF or image',
];

export default function AuthSimpleLayout({
    children,
    title,
    description,
}: AuthLayoutProps) {
    return (
        <div className="grid min-h-svh bg-background lg:grid-cols-2">
            {/* Hook panel */}
            <div className="relative hidden overflow-hidden bg-indigo-700 p-12 text-white lg:flex lg:flex-col lg:justify-between">
                <div className="pointer-events-none absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.07)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.07)_1px,transparent_1px)] bg-[size:36px_36px] [mask-image:linear-gradient(to_bottom,black,transparent_85%)]" />
                <div className="pointer-events-none absolute -top-16 -right-16 size-72 animate-float rounded-full bg-sky-400/20 blur-3xl" />
                <div className="pointer-events-none absolute bottom-0 left-0 size-72 animate-float rounded-full bg-fuchsia-400/15 blur-3xl [animation-delay:2.5s]" />

                <Link
                    href={home()}
                    className="relative z-10 flex items-center gap-2 font-semibold"
                >
                    <span className="rounded-lg bg-white p-2 text-indigo-700">
                        <CalendarDays className="size-5" />
                    </span>
                    School Timetable
                </Link>

                <div className="relative z-10">
                    <h2 className="text-4xl leading-tight font-bold">
                        Stop spending your holidays on the timetable.
                    </h2>
                    <ul className="mt-8 space-y-3">
                        {points.map((point, index) => (
                            <li
                                key={point}
                                style={{
                                    animationDelay: `${150 + index * 120}ms`,
                                }}
                                className="flex items-center gap-3 text-indigo-100 opacity-0 animate-cell-in"
                            >
                                <span className="rounded-full bg-white/20 p-1 transition-transform duration-300 hover:scale-110">
                                    <Check className="size-3.5" />
                                </span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative z-10 text-sm text-indigo-200">
                    Powered by HalaSoft
                </p>
            </div>

            {/* Form, no card */}
            <div className="flex flex-col items-center justify-center p-6 sm:p-12">
                <div className="w-full max-w-sm">
                    <Link
                        href={home()}
                        className="mb-8 flex items-center gap-2 font-semibold lg:hidden"
                    >
                        <span className="rounded-lg bg-indigo-600 p-2 text-white">
                            <CalendarDays className="size-5" />
                        </span>
                        School Timetable
                    </Link>
                    <div className="mb-8 space-y-1">
                        <h1 className="text-2xl font-semibold">{title}</h1>
                        <p className="text-sm text-muted-foreground">
                            {description}
                        </p>
                    </div>
                    {children}
                </div>
            </div>
        </div>
    );
}
