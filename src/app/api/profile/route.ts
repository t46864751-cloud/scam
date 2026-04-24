import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

export async function PUT(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.userId) {
      return NextResponse.json({ error: 'Не авторизован' }, { status: 401 })
    }

    const body = await request.json()
    const { image } = body

    if (image !== undefined) {
      // Validate URL format if not empty
      if (image && !image.match(/^https?:\/\/.+/)) {
        return NextResponse.json({ error: 'Неверная ссылка на изображение' }, { status: 400 })
      }

      await db.user.update({
        where: { id: session.user.userId },
        data: { image: image || '' },
      })
    }

    return NextResponse.json({ message: 'Профиль обновлён' })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}
