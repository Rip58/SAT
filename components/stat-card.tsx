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
}: StatCardProps) {
    return (
        <div className="rounded-lg border border-border bg-secondary p-6 h-full flex flex-col justify-between">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-muted-foreground">{title}</p>
                    <p className="mt-2 text-3xl font-bold">{value}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>
                </div>
                <div className={`rounded-full bg-accent p-3 ${iconColor}`}>
                    <Icon className="h-6 w-6" />
                </div>
            </div>
        </div>
    )
}
