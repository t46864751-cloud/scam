import { NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

async function checkAdmin() {
  const session = await getServerSession(authOptions)
  if (!session?.user) return null
  const userRole = (session.user as { role?: string }).role
  if (userRole !== 'admin') return null
  return session.user
}

export async function GET() {
  try {
    const user = await checkAdmin()
    if (!user) {
      return NextResponse.json({ error: 'Доступ запрещен' }, { status: 403 })
    }

    const [
      totalScammers,
      totalSubmissions,
      pendingSubmissions,
      totalUsers,
      totalSearches,
      scamCount,
      verifiedCount,
    ] = await Promise.all([
      db.scammer.count(),
      db.submission.count(),
      db.submission.count({ where: { status: 'pending' } }),
      db.user.count(),
      db.searchLog.count(),
      db.scammer.count({ where: { status: 'scam' } }),
      db.scammer.count({ where: { status: 'verified' } }),
    ])

    return NextResponse.json({
      totalScammers,
      totalSubmissions,
      pendingSubmissions,
      totalUsers,
      totalSearches,
      scamCount,
      verifiedCount,
    })
  } catch (error) {
    console.error('Panel stats error:', error)
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}
