import { PrismaClient } from '@prisma/client'

const prismaClientSingleton = () => {
    // Debug: Log if DATABASE_URL exists (don't log value)
    console.log('🔌 Initializing Prisma Client...')
    console.log('🔑 Env Keys available:', Object.keys(process.env))
    console.log('❓ DATABASE_URL present:', !!process.env.DATABASE_URL)

    return new PrismaClient()
}

declare global {
    var prismaGlobal: undefined | ReturnType<typeof prismaClientSingleton>
}

const prisma = globalThis.prismaGlobal ?? prismaClientSingleton()

export default prisma

if (process.env.NODE_ENV !== 'production') globalThis.prismaGlobal = prisma
