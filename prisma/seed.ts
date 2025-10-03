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
        password: '$2a$10$tukAhugCP9l6wEWqqakZIu.khunv00hhPjsZt1JQ0djlaFqxdv0Nm',
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
        password: '$2a$10$tukAhugCP9l6wEWqqakZIu.khunv00hhPjsZt1JQ0djlaFqxdv0Nm',
        },
    })

    // Seed coin packages
    console.log('🪙 Seeding coin packages...')
    
    const coinPackages = [
        {
            name: "Pack 20 coins",
            amount: 20,
            price: 20,
            bonus: 0,
            is_popular: false,
            description: "แพ็คเกจเริ่มต้นสำหรับผู้ใช้ใหม่"
        },
        {
            name: "Pack 50 coins",
            amount: 50,
            price: 50,
            bonus: 5,
            original_price: 55,
            is_popular: false,
            description: "คุ้มค่าพิเศษ ได้โบนัสเพิ่ม"
        },
        {
            name: "Pack 100 coins",
            amount: 100,
            price: 100,
            bonus: 10,
            original_price: 110,
            is_popular: true,
            description: "แพ็คเกจยอดนิยม ได้โบนัสสูงสุด"
        },
        {
            name: "Pack 300 coins",
            amount: 300,
            price: 300,
            bonus: 30,
            original_price: 330,
            is_popular: false,
            description: "แพ็คเกจพรีเมียม สำหรับนักอ่านตัวจริง"
        },
        {
            name: "Pack 500 coins",
            amount: 500,
            price: 500,
            bonus: 50,
            original_price: 550,
            is_popular: false,
            description: "แพ็คเกจใหญ่ โบนัสเท่าตัว"
        },
        {
            name: "Pack 1000 coins",
            amount: 1000,
            price: 1000,
            bonus: 100,
            original_price: 1100,
            is_popular: false,
            description: "แพ็คเกจขนาดใหญ่ โบนัสมหาศาล"
        },
        {
            name: "Pack 2000 coins",
            amount: 2000,
            price: 2000,
            bonus: 200,
            original_price: 2200,
            is_popular: false,
            description: "แพ็คเกจสุดพรีเมียม"
        },
        {
            name: "Pack 5000 coins",
            amount: 5000,
            price: 5000,
            bonus: 500,
            original_price: 5500,
            is_popular: false,
            description: "แพ็คเกจสูงสุด สำหรับคอหนังสือตัวจริง"
        }
    ];

    for (const pkg of coinPackages) {
        // Check if package with this name already exists
        const existingPackage = await prisma.coinPackage.findFirst({
            where: { name: pkg.name }
        });

        if (existingPackage) {
            // Update existing package
            await prisma.coinPackage.update({
                where: { package_id: existingPackage.package_id },
                data: pkg,
            });
            console.log(`✅ Updated package: ${pkg.name}`);
        } else {
            // Create new package
            await prisma.coinPackage.create({
                data: pkg,
            });
            console.log(`✅ Created package: ${pkg.name}`);
        }
    }

    // Seed ads (exactly 10 records)
    console.log('📣 Seeding ads...')

    // Remove existing ads to ensure exactly 10 seeded records
    await (prisma as any).ads.deleteMany({})

    const adsData = Array.from({ length: 10 }).map((_, i) => ({
        name_as: `Ad sample ${i + 1}`,
        user_id: adminUser.id,
        path_img: `/ads/ad_${i + 1}.png`,
        link: `https://example.com/ad-${i + 1}`,
        status: i === 0 ? true : false, // make first ad active as example
    }))

    for (const ad of adsData) {
        await (prisma as any).ads.create({ data: ad })
        console.log(`✅ Created ad: ${ad.name_as}`)
    }

    console.log('Seed completed successfully!')
    console.log('Admin user created:', adminUser.email)
    console.log('Regular user created:', regularUser.email)
    console.log('🎉 Coin packages seeded successfully!')
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