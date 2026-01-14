import { LucideIcon } from 'lucide-react'

interface StatCardProps {
    title: string
    value: number
    subtitle: string
    icon: LucideIcon
    iconColor?: string
}

export default function StatCard({
    title,
    value,
    subtitle,
    icon: Icon,
    iconColor = 'text-primary',
    className
}: StatCardProps & { className?: string }) {
    return (
        <div className={`rounded-lg border border-border p-4 sm:p-6 h-full flex flex-col justify-between ${className || 'bg-secondary'}`}>
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="mt-2 text-2xl sm:text-3xl font-bold">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
                </div>
                <div className={`rounded-full bg-accent p-2 sm:p-3 ${iconColor}`}>
                    <Icon className="h-5 w-5 sm:h-6 sm:w-6" />
                </div>
            </div>
        </div>
    )
}
