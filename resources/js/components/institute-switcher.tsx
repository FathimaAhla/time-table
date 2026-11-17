import { router, usePage } from '@inertiajs/react';
import { Building2 } from 'lucide-react';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { switchMethod } from '@/routes/institutes';

/**
 * Lets a super admin pick which institute's data they are currently
 * viewing across the whole app (grades, teachers, timetable, etc.).
 */
export function InstituteSwitcher() {
    const { isSuperAdmin, switchableInstitutes, currentInstitute } =
        usePage().props;

    if (!isSuperAdmin || !switchableInstitutes) {
        return null;
    }

    return (
        <Select
            value={currentInstitute ? String(currentInstitute.id) : 'all'}
            onValueChange={(value) =>
                router.post(switchMethod().url, {
                    institute_id: value === 'all' ? null : value,
                })
            }
        >
            <SelectTrigger className="w-56" size="sm">
                <Building2 className="size-4 opacity-70" />
                <SelectValue placeholder="All institutes" />
            </SelectTrigger>
            <SelectContent>
                <SelectItem value="all">All institutes (overview)</SelectItem>
                {switchableInstitutes.map((institute) => (
                    <SelectItem key={institute.id} value={String(institute.id)}>
                        {institute.name}
                    </SelectItem>
                ))}
            </SelectContent>
        </Select>
    );
}
