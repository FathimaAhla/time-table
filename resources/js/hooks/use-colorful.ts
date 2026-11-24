import { useSyncExternalStore } from 'react';

const KEY = 'timetable-colorful';
const listeners = new Set<() => void>();

function subscribe(callback: () => void) {
    listeners.add(callback);

    return () => listeners.delete(callback);
}

function read(): boolean {
    return typeof window !== 'undefined' && localStorage.getItem(KEY) === '1';
}

/** Remembered "colorful timetable" choice. Off by default (normal look). */
export function useColorful(): [boolean, (value: boolean) => void] {
    const colorful = useSyncExternalStore(subscribe, read, () => false);

    const set = (value: boolean) => {
        localStorage.setItem(KEY, value ? '1' : '0');
        listeners.forEach((listener) => listener());
    };

    return [colorful, set];
}
