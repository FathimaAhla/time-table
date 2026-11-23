import { Head } from '@inertiajs/react';
import type { BreadcrumbItem } from '@/types';
import { index as usersIndex } from '@/routes/users';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Users & Logins', href: usersIndex() },
];

type Row = {
    id: number;
    name: string;
    email: string;
    role: string;
    school: string | null;
    last_login_at: string | null;
    login_count: number;
    registered_at: string | null;
    online: boolean;
};

type Stats = {
    total: number;
    online: number;
    loggedInToday: number;
    neverLoggedIn: number;
};

const fmt = (iso: string | null) =>
    iso ? new Date(iso).toLocaleString() : 'Never';

export default function UsersIndex({
    users,
    stats,
}: {
    users: Row[];
    stats: Stats;
}) {
    const cards = [
        ['Registered users', stats.total],
        ['Online now (5 min)', stats.online],
        ['Logged in today', stats.loggedInToday],
        ['Never logged in', stats.neverLoggedIn],
    ] as const;

    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <Head title="Users & Logins" />
            <div>
                <h1 className="text-xl font-semibold">Users & Logins</h1>
                <p className="text-sm text-muted-foreground">
                    Everyone who registered, the school they own, and how often
                    they sign in.
                </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                {cards.map(([label, value]) => (
                    <div key={label} className="rounded-lg border p-4">
                        <div className="text-2xl font-semibold">{value}</div>
                        <div className="text-sm text-muted-foreground">
                            {label}
                        </div>
                    </div>
                ))}
            </div>

            <div className="overflow-x-auto rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="p-3">User</th>
                            <th className="p-3">School</th>
                            <th className="p-3">Role</th>
                            <th className="p-3">Logins</th>
                            <th className="p-3">Last login</th>
                            <th className="p-3">Registered</th>
                        </tr>
                    </thead>
                    <tbody>
                        {users.map((user) => (
                            <tr key={user.id} className="border-t">
                                <td className="p-3">
                                    <div className="flex items-center gap-2 font-medium">
                                        {user.online && (
                                            <span
                                                className="size-2 rounded-full bg-green-500"
                                                title="Online"
                                            />
                                        )}
                                        {user.name}
                                    </div>
                                    <div className="text-xs text-muted-foreground">
                                        {user.email}
                                    </div>
                                </td>
                                <td className="p-3">{user.school ?? '—'}</td>
                                <td className="p-3 capitalize">
                                    {user.role.replace('_', ' ')}
                                </td>
                                <td className="p-3">{user.login_count}</td>
                                <td className="p-3">
                                    {fmt(user.last_login_at)}
                                </td>
                                <td className="p-3">
                                    {fmt(user.registered_at)}
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

UsersIndex.layout = {
    breadcrumbs,
};
