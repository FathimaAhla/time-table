import { Head, router } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import type { BreadcrumbItem } from '@/types';
import type { Institute } from '@/types/auth';
import { index as institutesIndex, switchMethod } from '@/routes/institutes';

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Institutes', href: institutesIndex() },
];

type Row = Institute & { users_count: number };

export default function InstitutesIndex({
    institutes,
    viewingInstituteId,
}: {
    institutes: Row[];
    viewingInstituteId: number | null;
}) {
    function view(institute: Row) {
        router.post(switchMethod().url, { institute_id: institute.id });
    }

    function clear() {
        router.post(switchMethod().url, { institute_id: null });
    }

    return (
        <div className="flex flex-1 flex-col gap-6 p-4">
            <Head title="Institutes" />
            <div>
                <h1 className="text-xl font-semibold">Institutes</h1>
                <p className="text-sm text-muted-foreground">
                    Every school, tuition and institute registered on the
                    system. Pick one to view its data across every page.
                </p>
            </div>

            {viewingInstituteId && (
                <div className="flex items-center justify-between rounded-lg border bg-muted/40 p-3 text-sm">
                    <span>
                        You are currently viewing one institute&apos;s data.
                    </span>
                    <Button variant="outline" size="sm" onClick={clear}>
                        View all institutes
                    </Button>
                </div>
            )}

            <div className="overflow-hidden rounded-lg border">
                <table className="w-full text-sm">
                    <thead className="bg-muted/50 text-left">
                        <tr>
                            <th className="p-3">Name</th>
                            <th className="p-3">Type</th>
                            <th className="p-3">Users</th>
                            <th className="p-3" />
                        </tr>
                    </thead>
                    <tbody>
                        {institutes.map((institute) => (
                            <tr key={institute.id} className="border-t">
                                <td className="p-3 font-medium">
                                    <div className="flex items-center gap-2">
                                        <Building2 className="size-4 text-muted-foreground" />
                                        {institute.name}
                                        {viewingInstituteId ===
                                            institute.id && (
                                            <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">
                                                Viewing
                                            </span>
                                        )}
                                    </div>
                                </td>
                                <td className="p-3 capitalize">
                                    {institute.type}
                                </td>
                                <td className="p-3">{institute.users_count}</td>
                                <td className="p-3 text-right">
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        onClick={() => view(institute)}
                                    >
                                        View data
                                    </Button>
                                </td>
                            </tr>
                        ))}
                        {institutes.length === 0 && (
                            <tr>
                                <td
                                    colSpan={4}
                                    className="p-6 text-center text-muted-foreground"
                                >
                                    No institutes have registered yet.
                                </td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>
        </div>
    );
}

InstitutesIndex.layout = {
    breadcrumbs,
};
