const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function main() {
    console.log('Seeding database...')

    // Create default technicians
    const tech1 = await prisma.technician.upsert({
        where: { id: 'tech-1' },
        update: {},
        create: {
            id: 'tech-1',
            name: 'Sergi',
            isActive: true,
        },
    })

    const tech2 = await prisma.technician.upsert({
        where: { id: 'tech-2' },
        update: {},
        create: {
            id: 'tech-2',
            name: 'Carlos',
            isActive: true,
        },
    })

    console.log('Created technicians:', { tech1, tech2 })

    // Create default settings
    const settings = await prisma.settings.upsert({
        where: { id: 'settings' },
        update: {},
        create: {
            id: 'settings',
            companyName: 'Gestor de SAT',
            companyAddress: '',
            companyPhone: '',
            companyEmail: '',
        },
    })

    console.log('Created settings:', settings)

    console.log('Seeding completed!')
}

main()
    .catch((e) => {
        console.error('Error seeding database:', e)
        process.exit(1)
    })
    .finally(async () => {
        await prisma.$disconnect()
    })
