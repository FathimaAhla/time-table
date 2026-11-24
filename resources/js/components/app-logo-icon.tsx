import type { SVGAttributes } from 'react';

/**
 * School Timetable mark: a calendar page with a timetable grid.
 * Uses currentColor so it works on light and dark backgrounds.
 */
export default function AppLogoIcon(props: SVGAttributes<SVGElement>) {
    return (
        <svg
            {...props}
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
        >
            <rect x="6.5" y="1" width="2" height="4" rx="1" />
            <rect x="15.5" y="1" width="2" height="4" rx="1" />
            <path
                fillRule="evenodd"
                clipRule="evenodd"
                d="M5 3.5h14A3 3 0 0 1 22 6.5v13a3 3 0 0 1-3 3H5a3 3 0 0 1-3-3v-13a3 3 0 0 1 3-3Zm-1 6v10a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-10H4Z"
            />
            <rect x="5.5" y="11" width="3.5" height="3" rx="0.75" />
            <rect x="10.25" y="11" width="3.5" height="3" rx="0.75" />
            <rect x="15" y="11" width="3.5" height="3" rx="0.75" />
            <rect x="5.5" y="15.5" width="3.5" height="3" rx="0.75" />
            <rect x="10.25" y="15.5" width="3.5" height="3" rx="0.75" />
        </svg>
    );
}
