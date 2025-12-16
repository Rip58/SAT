import { z } from 'zod'

// Repair validation schema
export const repairSchema = z.object({
    customerPhone: z.string().min(1, 'El teléfono es obligatorio'),
    customerEmail: z.string().email('Email inválido').min(1, 'El email es obligatorio'),
    customerName: z.string().optional(),
    customerSurname: z.string().optional(),
    hasWhatsApp: z.boolean().default(false),
    brand: z.string().optional(),
    model: z.string().optional(),
    serialNumber: z.string().optional(),
    assignedTechnicianId: z.string().optional(),
    invoiceNumber: z.string().optional(),
    issueDescription: z.string().optional(),
    technicalDiagnosis: z.string().optional(),
    repairResult: z.string().optional(),
    status: z.enum(['PENDING', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED']).default('PENDING'),
    entryDate: z.string().optional(),
    exitDate: z.string().optional().nullable(),
    imageUrls: z.array(z.string()).default([]),
})

export type RepairInput = z.infer<typeof repairSchema>

// Technician validation schema
export const technicianSchema = z.object({
    name: z.string().min(1, 'El nombre es obligatorio'),
    isActive: z.boolean().default(true),
})

export type TechnicianInput = z.infer<typeof technicianSchema>

// Settings validation schema
export const settingsSchema = z.object({
    passwordHash: z.string().optional(),
    companyName: z.string().default('Gestor de SAT'),
    companyAddress: z.string().optional(),
    companyPhone: z.string().optional(),
    companyEmail: z.string().optional(),
})

export type SettingsInput = z.infer<typeof settingsSchema>
