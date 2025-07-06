import { prisma } from '@/lib/prisma'

async function main() {
    console.log('🌱 Starting seed...')

    const adminUser = await prisma.user.upsert({
        where: { email: 'apex@gmail.com' },
        update: {},
        create: {
        name: 'apex',
        email: 'apex@gmail.com',
        role: 'admin',
        
        },
    })

    const regularUser = await prisma.user.upsert({
        where: { email: 'user_001@gmail.com' },
        update: {},
        create: {
        name: 'user_001',
        email: 'user_001@gmail.com',
        role: 'user',
        
        },
    })

    await prisma.wallet.upsert({
        where: { user_id: adminUser.id },
        update: {},
        create: {
        user_id: adminUser.id,
        balance: 0, 
        },
    })

    await prisma.wallet.upsert({
        where: { user_id: regularUser.id },
        update: {},
        create: {
        user_id: regularUser.id,
        balance: 0,
        },
    })

    await prisma.account.upsert({
        where: { 
        provider_providerAccountId: {
            provider: 'local',
            providerAccountId: adminUser.id
        }
        },
        update: {},
        create: {
        userId: adminUser.id,
        type: 'credentials',
        provider: 'local',
        providerAccountId: adminUser.id,
        email: adminUser.email,
        },
    })

    await prisma.account.upsert({
        where: { 
        provider_providerAccountId: {
            provider: 'local',
            providerAccountId: regularUser.id
        }
        },
        update: {},
        create: {
        userId: regularUser.id,
        type: 'credentials',
        provider: 'local',
        providerAccountId: regularUser.id,
        email: regularUser.email,
        },
    })

    console.log('Seed completed successfully!')
    console.log('Admin user created:', adminUser.email)
    console.log('Regular user created:', regularUser.email)
    }

    main()
    .then(async () => {
        await prisma.$disconnect()
    })
    .catch(async (e) => {
        console.error('❌ Seed failed:', e)
        await prisma.$disconnect()
        process.exit(1)
    })