import type { Auth, Institute } from '@/types/auth';

declare module 'react' {
    interface InputHTMLAttributes<T> {
        passwordrules?: string;
    }
}

declare module '@inertiajs/core' {
    export interface InertiaConfig {
        sharedPageProps: {
            name: string;
            auth: Auth;
            sidebarOpen: boolean;
            currentInstitute: Institute | null;
            isSuperAdmin: boolean;
            canManage: boolean;
            isTeacher: boolean;
            switchableInstitutes: Institute[] | null;
            [key: string]: unknown;
        };
    }
}
