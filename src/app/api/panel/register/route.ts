import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

const ADMIN_PASS = process.env.ADMIN_PASSWORD || 'gFgtqc'

export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const { password } = await req.json()

    const inputPass = String(password || '').trim()
    const adminPass = String(ADMIN_PASS || '').trim()

    if (!inputPass || inputPass !== adminPass) {
      return NextResponse.json({ error: 'Неверный пароль' }, { status: 403 })
    }

    // Get user ID from session - try both userId and id
    const sessionUser = session.user as { userId?: string; id?: string }
    const userId = sessionUser.userId || sessionUser.id

    if (!userId) {
      return NextResponse.json({ error: 'Ошибка сессии' }, { status: 400 })
    }

    // Update role in DB
    const updatedUser = await db.user.update({
      where: { id: userId },
      data: { role: 'admin' },
      select: { id: true, username: true, role: true },
    })

    return NextResponse.json({
      message: 'Доступ получен',
      role: updatedUser.role,
    })
  } catch (error) {
    console.error('Panel register error:', error)
    return NextResponse.json({ error: 'Ошибка сервера' }, { status: 500 })
  }
}
