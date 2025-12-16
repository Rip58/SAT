import { cn, getStatusColor, getStatusLabel } from '@/lib/utils'

interface StatusBadgeProps {
    status: string
    className?: string
}

export default function StatusBadge({ status, className }: StatusBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors',
                getStatusColor(status),
                className
            )}
        >
            {getStatusLabel(status)}
        </span>
    )
}
