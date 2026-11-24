import { router } from '@inertiajs/react';
import { useEffect } from 'react';
import { toast } from 'sonner';
import type { FlashToast } from '@/types/ui';

type SessionFlash = { success?: string | null; error?: string | null };

/**
 * Shows a toast for every flash message the server sends back
 * (both `Inertia::flash('toast', ...)` and `back()->with('success'|'error', ...)`)
 * and for the first validation error of a failed form submission.
 */
export function useFlashToast(): void {
    useEffect(() => {
        const removeFlashListener = router.on('flash', (event) => {
            const flash = (event as CustomEvent).detail?.flash;
            const data = flash?.toast as FlashToast | undefined;

            if (data) {
                toast[data.type](data.message);
            }
        });

        const removeSuccessListener = router.on('success', (event) => {
            const flash = (event as CustomEvent).detail?.page?.props?.flash as
                | SessionFlash
                | undefined;

            if (flash?.success) {
                toast.success(flash.success);
            }

            if (flash?.error) {
                toast.error(flash.error);
            }
        });

        const removeErrorListener = router.on('error', (event) => {
            const errors = (event as CustomEvent).detail?.errors as
                | Record<string, string>
                | undefined;
            const firstError = errors ? Object.values(errors)[0] : null;

            if (firstError) {
                toast.error(firstError);
            }
        });

        return () => {
            removeFlashListener();
            removeSuccessListener();
            removeErrorListener();
        };
    }, []);
}

export function FlashToaster(): null {
    useFlashToast();

    return null;
}
