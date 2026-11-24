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
                <Link
                    href={home()}
                    className="relative flex items-center gap-2 font-semibold"
                >
                    <span className="rounded-lg bg-white p-2 text-indigo-700">
                        <CalendarDays className="size-5" />
                    </span>
                    School Timetable
                </Link>

                <div className="relative">
                    <h2 className="text-4xl leading-tight font-bold">
                        Stop spending your holidays on the timetable.
                    </h2>
                    <ul className="mt-8 space-y-3">
                        {points.map((point) => (
                            <li
                                key={point}
                                className="flex items-center gap-3 text-indigo-100"
                            >
                                <span className="rounded-full bg-white/20 p-1">
                                    <Check className="size-3.5" />
                                </span>
                                {point}
                            </li>
                        ))}
                    </ul>
                </div>

                <p className="relative text-sm text-indigo-200">
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
