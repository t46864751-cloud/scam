import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  const role = (session.user as { role?: string }).role
  if (role !== 'admin') return null
  return session.user
}

// GET: search sponsors / top sponsors
export async function GET(req: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const search = searchParams.get('search')?.trim() || ''
    const page = Math.max(1, parseInt(searchParams.get('page') || '1'))
    const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')))
    const skip = (page - 1) * limit

    const where: any = {}
    if (search) {
      where.username = { contains: search, mode: 'insensitive' }
    }

    // If searching, show all matched users with their sponsor info
    // If not searching, show top sponsors by donated
    const orderBy = search ? { createdAt: 'desc' as const } : { donated: 'desc' as const }
    const finalWhere = search ? where : { OR: [{ donated: { gt: 0 } }, { isSponsor: true }] }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where: finalWhere,
        orderBy,
        skip,
        take: limit,
        select: {
          id: true,
          username: true,
          image: true,
          role: true,
          exp: true,
          isSponsor: true,
          donated: true,
          createdAt: true,
        },
      }),
      db.user.count({ where: finalWhere }),
    ])

    return NextResponse.json({
      results: users,
      total,
      page,
      totalPages: Math.ceil(total / limit),
    })
  } catch (e) {
    console.error('Sponsors GET error', e)
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}

// POST: update sponsor status and donated amount
export async function POST(req: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })

    const { userId, isSponsor, donated } = await req.json()

    if (!userId || typeof userId !== 'string') {
      return NextResponse.json({ error: 'Укажите userId' }, { status: 400 })
    }

    const updateData: any = {}
    if (typeof isSponsor === 'boolean') {
      updateData.isSponsor = isSponsor
    }
    if (donated !== undefined) {
      const num = Number(donated)
      if (!Number.isFinite(num) || num < 0 || !Number.isInteger(num)) {
        return NextResponse.json({ error: 'donated должен быть целым числом >= 0' }, { status: 400 })
      }
      updateData.donated = num
      // Если сумма >0 — автоматом делаем спонсором, если не указано явно
      if (num > 0 && typeof isSponsor !== 'boolean') {
        updateData.isSponsor = true
      }
    }

    if (Object.keys(updateData).length === 0) {
      return NextResponse.json({ error: 'Нечего обновлять' }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id: userId },
      data: updateData,
      select: { id: true, username: true, isSponsor: true, donated: true },
    })

    return NextResponse.json({ message: 'Обновлено', user })
  } catch (e) {
    console.error('Sponsors POST error', e)
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}

// DELETE: remove sponsor status and reset donated to 0
export async function DELETE(req: NextRequest) {
  try {
    const admin = await checkAdmin()
    if (!admin) return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })

    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId') || searchParams.get('id')

    if (!userId) {
      return NextResponse.json({ error: 'Укажите userId' }, { status: 400 })
    }

    const user = await db.user.update({
      where: { id: userId },
      data: { isSponsor: false, donated: 0 },
      select: { id: true, username: true, isSponsor: true, donated: true },
    })

    return NextResponse.json({ message: 'Спонсор удален', user })
  } catch (e) {
    console.error('Sponsors DELETE error', e)
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}
