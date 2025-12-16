import { type ClassValue, clsx } from 'clsx'

export function cn(...inputs: ClassValue[]) {
    return clsx(inputs)
}

/**
 * Generate operation number in format REP-YYYY-XXX
 * @param lastNumber - The last operation number used
 * @returns New operation number
 */
export function generateOperationNumber(lastNumber?: string): string {
    const year = new Date().getFullYear()

    if (!lastNumber) {
        return `REP-${year}-001`
    }

    // Extract the number from the last operation number
    const parts = lastNumber.split('-')
    const lastYear = parseInt(parts[1])
    const lastNum = parseInt(parts[2])

    // If it's a new year, reset to 001
    if (lastYear < year) {
        return `REP-${year}-001`
    }

    // Otherwise, increment
    const newNum = (lastNum + 1).toString().padStart(3, '0')
    return `REP-${year}-${newNum}`
}

/**
 * Format date to Spanish locale
 */
/**
 * Format date to Spanish locale safely
 */
export function formatDate(date: Date | string): string {
    try {
        if (!date) return '-'
        const d = typeof date === 'string' ? new Date(date) : date
        // Check for invalid date
        if (isNaN(d.getTime())) return '-'

        return d.toLocaleDateString('es-ES', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        })
    } catch (error) {
        return '-'
    }
}

/**
 * Get status label in Spanish
 */
export function getStatusLabel(status: string): string {
    const labels: Record<string, string> = {
        PENDING: 'Pendiente',
        IN_PROGRESS: 'En Progreso',
        COMPLETED: 'Completada',
        CANCELLED: 'Cancelada'
    }
    return labels[status] || status
}

/**
 * Get status color for badges
 */
export function getStatusColor(status: string): string {
    const colors: Record<string, string> = {
        PENDING: 'bg-gray-500/20 text-gray-300 border-gray-500/30',
        IN_PROGRESS: 'bg-yellow-500/20 text-yellow-300 border-yellow-500/30',
        COMPLETED: 'bg-blue-500/20 text-blue-300 border-blue-500/30',
        CANCELLED: 'bg-red-500/20 text-red-300 border-red-500/30'
    }
    return colors[status] || colors.PENDING
}
