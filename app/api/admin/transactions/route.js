import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET - ดึงข้อมูล transactions สำหรับ admin
export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url)
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '10')
    const search = searchParams.get('search') || ''
    const type = searchParams.get('type') || ''
    const status = searchParams.get('status') || ''
    const startDate = searchParams.get('startDate') || ''
    const endDate = searchParams.get('endDate') || ''

    const skip = (page - 1) * limit

    // สร้าง where condition
    const whereCondition = {
      ...(search && {
        OR: [
          {
            wallet: {
              user: {
                name: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          },
          {
            wallet: {
              user: {
                email: {
                  contains: search,
                  mode: 'insensitive'
                }
              }
            }
          },
          {
            notes: {
              contains: search,
              mode: 'insensitive'
            }
          }
        ]
      }),
      ...(type && { type }),
      ...(status && { payment_status: status }),
      ...(startDate && endDate && {
        created_at: {
          gte: new Date(startDate),
          lte: new Date(endDate + 'T23:59:59.999Z')
        }
      })
    }

    // ดึงข้อมูล transactions
    const transactions = await prisma.transaction.findMany({
      where: whereCondition,
      include: {
        wallet: {
          include: {
            user: {
              select: {
                name: true,
                email: true
              }
            }
          }
        },
        coinPackage: {
          select: {
            name: true,
            amount: true,
            price: true
          }
        },
        story: {
          select: {
            title: true
          }
        },
        chapter: {
          select: {
            title: true
          }
        }
      },
      orderBy: {
        created_at: 'desc'
      },
      skip,
      take: limit
    })

    // นับจำนวนทั้งหมด
    const total = await prisma.transaction.count({
      where: whereCondition
    })

    // คำนวณสถิติ
    const stats = await prisma.transaction.groupBy({
      by: ['type'],
      _sum: {
        amount: true
      },
      _count: {
        transaction_id: true
      },
      where: whereCondition
    })

    const totalAmount = await prisma.transaction.aggregate({
      _sum: {
        amount: true
      },
      where: {
        ...whereCondition,
        type: 'TOPUP',
        payment_status: 'SUCCESS'
      }
    })

    const totalPages = Math.ceil(total / limit)

    return NextResponse.json({
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages
      },
      stats: {
        byType: stats,
        totalRevenue: totalAmount._sum.amount || 0
      }
    })

  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'เกิดข้อผิดพลาดในการดึงข้อมูล' },
      { status: 500 }
    )
  }
}
