import fs from 'fs/promises'
import path from 'path'
import { Repair, Technician } from '@prisma/client'

// Types for our local DB
// Types for our local DB
interface LocalData {
    repairs: Repair[]
    technicians: Technician[]
    settings?: {
        serviceConditions: string
        securityPin?: string
    }
}

const DB_PATH = path.join(process.cwd(), 'data', 'db.json')
const UPLOADS_DIR = path.join(process.cwd(), 'public', 'uploads')

// Initial data
const INITIAL_DATA: LocalData = {
    repairs: [],
    technicians: [
        {
            id: 'tech-1',
            name: 'Juan Pérez',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 'tech-2',
            name: 'María García',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        },
        {
            id: 'tech-3',
            name: 'Carlos López',
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
        }
    ],
    settings: {
        securityPin: '0000', // Default PIN
        serviceConditions: `CONDICIONES DEL SERVICIO

Responsabilidad limitada: Nuestro servicio técnico no se hace responsable por pérdidas de datos, configuraciones personalizadas o software instalado en los equipos. Se recomienda realizar una copia de seguridad antes de cualquier intervención.

Autorización de intervención: El cliente autoriza a los técnicos a realizar diagnósticos, reparaciones, formateos o instalaciones necesarias según el caso. En caso de que se requieran repuestos, se informará previamente al cliente para su aprobación.

Garantía de servicio: La garantía cubre exclusivamente la reparación o repuesto realizado y no se extiende a otros componentes o fallos ajenos. El plazo de garantía será informado al cliente al momento de retirar el equipo.

Equipos no retirados: Los equipos que no sean retirados en un plazo de 90 días desde la fecha de finalización del servicio, podrán ser considerados en abandono. Nos reservamos el derecho de disponer de ellos para cubrir los costes de diagnóstico o almacenaje.

Datos personales: Toda la información contenida en los dispositivos será tratada con confidencialidad. No accedemos deliberadamente a archivos personales salvo autorización expresa del cliente y solo cuando sea necesario para el diagnóstico o solución del problema.`
    }
}

export class LocalDB {
    private async ensureDbExists() {
        try {
            await fs.access(DB_PATH)
        } catch {
            const dir = path.dirname(DB_PATH)
            await fs.mkdir(dir, { recursive: true })
            await this.write(INITIAL_DATA)
        }
    }

    private async read(): Promise<LocalData> {
        await this.ensureDbExists()
        const data = await fs.readFile(DB_PATH, 'utf-8')
        return JSON.parse(data, (key, value) => {
            // Revive dates
            if (key === 'createdAt' || key === 'updatedAt' || key === 'entryDate' || key === 'exitDate') {
                return value ? new Date(value) : null
            }
            return value
        })
    }

    private async write(data: LocalData) {
        await fs.writeFile(DB_PATH, JSON.stringify(data, null, 2))
    }

    // Repairs
    async getRepairs() {
        const data = await this.read()
        return data.repairs
    }

    async getRepairById(id: string) {
        const data = await this.read()
        return data.repairs.find(r => r.id === id)
    }

    async createRepair(repair: Omit<Repair, 'id' | 'createdAt' | 'updatedAt'>) {
        const data = await this.read()
        const newRepair: Repair = {
            ...repair,
            id: 'rep-' + Date.now(),
            createdAt: new Date(),
            updatedAt: new Date(),
            // Ensure optional fields are handled if missing (though Omit should cover type)
            exitDate: repair.exitDate || null,
        }
        data.repairs.unshift(newRepair) // Add to beginning
        await this.write(data)
        return newRepair
    }

    async updateRepair(id: string, updates: Partial<Repair>) {
        const data = await this.read()
        const index = data.repairs.findIndex(r => r.id === id)
        if (index === -1) throw new Error('Repair not found')

        const updatedRepair = {
            ...data.repairs[index],
            ...updates,
            updatedAt: new Date()
        }
        data.repairs[index] = updatedRepair
        await this.write(data)
        return updatedRepair
    }

    async deleteRepair(id: string) {
        const data = await this.read()
        const index = data.repairs.findIndex(r => r.id === id)
        if (index === -1) throw new Error('Repair not found')

        data.repairs.splice(index, 1)
        await this.write(data)
    }

    // Technicians
    async getTechnicians() {
        const data = await this.read()
        return data.technicians
    }

    async createTechnician(name: string) {
        const data = await this.read()
        const newTechnician: Technician = {
            id: 'tech-' + Date.now(),
            name,
            isActive: true, // Default to active
            createdAt: new Date(),
            updatedAt: new Date()
        }
        data.technicians.push(newTechnician)
        await this.write(data)
        return newTechnician
    }

    async deleteTechnician(id: string) {
        const data = await this.read()
        const index = data.technicians.findIndex(t => t.id === id)
        if (index === -1) throw new Error('Technician not found')

        data.technicians.splice(index, 1)
        await this.write(data)
    }

    // Settings
    async getSettings() {
        const data = await this.read()
        if (!data.settings) {
            // Lazy migration for existing DBs
            data.settings = INITIAL_DATA.settings
            await this.write(data)
        }
        return data.settings
    }

    async updateSettings(settings: { serviceConditions?: string; securityPin?: string }) {
        const data = await this.read()
        // Initialize settings if they don't exist
        if (!data.settings) {
            data.settings = INITIAL_DATA.settings
        }

        const currentSettings = data.settings!

        data.settings = {
            ...currentSettings,
            serviceConditions: settings.serviceConditions ?? currentSettings.serviceConditions,
            securityPin: settings.securityPin ?? currentSettings.securityPin
        }
        await this.write(data)
        return data.settings
    }

    // Stats
    async getStats() {
        const data = await this.read()
        return {
            total: data.repairs.length,
            pending: data.repairs.filter(r => r.status === 'PENDING').length,
            inProgress: data.repairs.filter(r => r.status === 'IN_PROGRESS').length,
            completed: data.repairs.filter(r => r.status === 'COMPLETED').length
        }
    }
}

export const localDb = new LocalDB()
