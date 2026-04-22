import { NextRequest, NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import { db } from '@/lib/db'
import { z } from 'zod'

const registerSchema = z.object({
  username: z.string().min(3).max(30),
  password: z.string().min(6).max(100),
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { username, password } = registerSchema.parse(body)

    const existing = await db.user.findUnique({
      where: { username },
    })

    if (existing) {
      return NextResponse.json(
        { error: 'Пользователь с таким именем уже существует' },
        { status: 409 }
      )
    }

    const hashedPassword = await bcrypt.hash(password, 12)

    const user = await db.user.create({
      data: {
        username,
        password: hashedPassword,
        role: 'user',
      },
    })

    return NextResponse.json(
      { message: 'Регистрация успешна', userId: user.id },
      { status: 201 }
    )
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Неверные данные', details: error.errors },
        { status: 400 }
      )
    }
    return NextResponse.json(
      { error: 'Ошибка сервера' },
      { status: 500 }
    )
  }
}
