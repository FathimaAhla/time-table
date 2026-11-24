import { usePage } from '@inertiajs/react';
import { MoreHorizontal, Pencil, Plus, Search, Trash2 } from 'lucide-react';
import type { ReactNode } from 'react';
import { Button } from '@/components/ui/button';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';

/**
 * Whether the signed-in user may create / edit / delete (admins only).
 */
export function useCanManage(): boolean {
    return Boolean(usePage().props.canManage);
}

export function PageHeader({
    title,
    description,
    createLabel,
    onCreate,
    actions,
}: {
    title: string;
    description?: string;
    createLabel?: string;
    onCreate?: () => void;
    actions?: ReactNode;
}) {
    const canManage = useCanManage();

    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
            <div>
                <h1 className="text-2xl font-semibold tracking-tight">
                    {title}
                </h1>
                {description && (
                    <p className="mt-1 text-sm text-muted-foreground">
                        {description}
                    </p>
                )}
            </div>
            <div className="flex items-center gap-2">
                {actions}
                {canManage && onCreate && (
                    <Button size="sm" onClick={onCreate}>
                        <Plus className="size-4" />
                        {createLabel ?? 'New'}
                    </Button>
                )}
            </div>
        </div>
    );
}

export function SearchBar({
    value,
    onChange,
    placeholder,
    children,
}: {
    value: string;
    onChange: (value: string) => void;
    placeholder?: string;
    children?: ReactNode;
}) {
    return (
        <div className="flex flex-col gap-3 md:flex-row md:items-center">
            <div className="relative w-full md:w-80">
                <Search className="pointer-events-none absolute top-1/2 left-2.5 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                    type="search"
                    value={value}
                    onChange={(e) => onChange(e.target.value)}
                    placeholder={placeholder ?? 'Search...'}
                    className="pl-8"
                />
            </div>
            {children}
        </div>
    );
}

export function DataTable({
    head,
    children,
}: {
    head: ReactNode;
    children: ReactNode;
}) {
    return (
        <div className="relative w-full overflow-x-auto rounded-xl border bg-card">
            <table className="w-full caption-bottom text-sm">
                {/* The last column (row actions) stays pinned to the right edge so it is always reachable on phones. */}
                <thead className="border-b bg-muted/40 [&_th]:h-10 [&_th]:px-3 [&_th]:text-left [&_th]:font-medium [&_th]:whitespace-nowrap [&_th]:text-muted-foreground [&_th:last-child]:sticky [&_th:last-child]:right-0 [&_th:last-child]:bg-muted">
                    {head}
                </thead>
                <tbody className="[&_td]:p-3 [&_td]:align-middle [&_td:last-child]:sticky [&_td:last-child]:right-0 [&_td:last-child]:bg-card [&_td:last-child]:shadow-[-8px_0_8px_-8px_rgba(0,0,0,0.25)] [&_tr]:border-b [&_tr]:transition-colors [&_tr:hover]:bg-muted/40 [&_tr:last-child]:border-0">
                    {children}
                </tbody>
            </table>
        </div>
    );
}

export function EmptyRow({
    colSpan,
    icon,
    title,
    hint,
    createLabel,
    onCreate,
}: {
    colSpan: number;
    icon: ReactNode;
    title: string;
    hint?: string;
    createLabel?: string;
    onCreate?: () => void;
}) {
    const canManage = useCanManage();

    return (
        <tr className="hover:bg-transparent!">
            <td colSpan={colSpan} className="py-12! text-center">
                <div className="flex flex-col items-center">
                    <div className="mb-3 flex size-14 items-center justify-center rounded-full bg-muted text-muted-foreground">
                        {icon}
                    </div>
                    <h3 className="text-base font-medium">{title}</h3>
                    {hint && (
                        <p className="mt-1 text-sm text-muted-foreground">
                            {hint}
                        </p>
                    )}
                    {canManage && onCreate && (
                        <Button size="sm" className="mt-4" onClick={onCreate}>
                            <Plus className="size-4" />
                            {createLabel ?? 'New'}
                        </Button>
                    )}
                </div>
            </td>
        </tr>
    );
}

export function RowActions({
    onEdit,
    onDelete,
    children,
}: {
    onEdit?: () => void;
    onDelete?: () => void;
    children?: ReactNode;
}) {
    const canManage = useCanManage();

    if (!canManage && !children) {
        return null;
    }

    return (
        <DropdownMenu modal={false}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="size-8"
                    aria-label="Row actions"
                >
                    <MoreHorizontal className="size-4" />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {children}
                {children && canManage && <DropdownMenuSeparator />}
                {canManage && onEdit && (
                    <DropdownMenuItem onSelect={onEdit}>
                        <Pencil className="size-4" />
                        Edit
                    </DropdownMenuItem>
                )}
                {canManage && onDelete && (
                    <DropdownMenuItem
                        onSelect={onDelete}
                        className="text-destructive focus:bg-destructive/10 focus:text-destructive [&_svg]:!text-destructive"
                    >
                        <Trash2 className="size-4" />
                        Delete
                    </DropdownMenuItem>
                )}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

export function FormModal({
    open,
    onOpenChange,
    title,
    description,
    submitLabel,
    processing,
    onSubmit,
    children,
    className,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    description?: string;
    submitLabel: string;
    processing?: boolean;
    onSubmit: () => void;
    children: ReactNode;
    className?: string;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className={cn('sm:max-w-md', className)}>
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        onSubmit();
                    }}
                    className="grid gap-5"
                >
                    <DialogHeader>
                        <DialogTitle>{title}</DialogTitle>
                        {description && (
                            <DialogDescription>{description}</DialogDescription>
                        )}
                    </DialogHeader>
                    <div className="grid gap-4">{children}</div>
                    <DialogFooter>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => onOpenChange(false)}
                        >
                            Cancel
                        </Button>
                        <Button type="submit" disabled={processing}>
                            {submitLabel}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    );
}

export function ConfirmDeleteModal({
    open,
    onOpenChange,
    title,
    message,
    onConfirm,
}: {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    title: string;
    message: string;
    onConfirm: () => void;
}) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
            <DialogContent className="sm:max-w-sm">
                <DialogHeader>
                    <DialogTitle>{title}</DialogTitle>
                    <DialogDescription>{message}</DialogDescription>
                </DialogHeader>
                <DialogFooter>
                    <Button
                        variant="outline"
                        onClick={() => onOpenChange(false)}
                    >
                        Cancel
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={() => {
                            onConfirm();
                            onOpenChange(false);
                        }}
                    >
                        Delete
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}

export function StatusBadge({ status }: { status: 'active' | 'inactive' }) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                status === 'active'
                    ? 'bg-emerald-50 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300'
                    : 'bg-muted text-muted-foreground',
            )}
        >
            <span
                className={cn(
                    'size-1.5 rounded-full',
                    status === 'active'
                        ? 'bg-emerald-500'
                        : 'bg-muted-foreground/60',
                )}
            />
            {status}
        </span>
    );
}

export function FormField({
    label,
    error,
    children,
    hint,
}: {
    label: string;
    error?: string;
    hint?: string;
    children: ReactNode;
}) {
    return (
        <div className="grid gap-1.5 [&_[data-slot=select-trigger]]:w-full">
            <label className="text-sm font-medium">{label}</label>
            {children}
            {hint && !error && (
                <p className="text-xs text-muted-foreground">{hint}</p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
        </div>
    );
}

/**
 * Case-insensitive match of a search term against any of the given values.
 */
export function matchesSearch(
    search: string,
    ...values: Array<string | number | null | undefined>
): boolean {
    const term = search.trim().toLowerCase();

    return (
        term === '' ||
        values.some((value) =>
            String(value ?? '')
                .toLowerCase()
                .includes(term),
        )
    );
}
