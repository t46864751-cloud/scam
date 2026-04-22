import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'

function getVoterId(req: NextRequest, userId?: string): string {
  if (userId) return `user:${userId}`
  const forwarded = req.headers.get('x-forwarded-for')
  const ip = forwarded ? forwarded.split(',')[0].trim() : req.headers.get('x-real-ip') || 'unknown'
  return `ip:${ip}`
}

async function getUserId(): Promise<string | undefined> {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) return undefined
    return (session.user as { userId?: string; id?: string }).userId || (session.user as { id?: string }).id || undefined
  } catch {
    return undefined
  }
}

// POST: vote like/dislike — account if logged in, IP if guest
export async function POST(req: NextRequest) {
  try {
    const userId = await getUserId()
    const { scammerId, voteType } = await req.json()

    if (!scammerId || typeof scammerId !== 'string') {
      return NextResponse.json({ error: 'Укажите scammerId' }, { status: 400 })
    }
    if (voteType !== 'like' && voteType !== 'dislike') {
      return NextResponse.json({ error: 'Неверный тип голоса' }, { status: 400 })
    }

    const voterId = getVoterId(req, userId)

    const scammer = await db.scammer.findUnique({ where: { id: scammerId } })
    if (!scammer) {
      return NextResponse.json({ error: 'Скамер не найден' }, { status: 404 })
    }

    const existingVote = await db.vote.findUnique({
      where: { scammerId_voterId: { scammerId, voterId } },
    })

    if (existingVote) {
      if (existingVote.voteType === voteType) {
        // Toggle off
        await db.vote.delete({ where: { id: existingVote.id } })
        await db.scammer.update({
          where: { id: scammerId },
          data: voteType === 'like'
            ? { likeCount: { decrement: 1 } }
            : { dislikeCount: { decrement: 1 } },
        })
        return NextResponse.json({ voted: false, voteType: null, likeCount: Math.max(0, scammer.likeCount - 1), dislikeCount: Math.max(0, scammer.dislikeCount) })
      } else {
        // Switch vote
        await db.vote.update({ where: { id: existingVote.id }, data: { voteType } })
        await db.scammer.update({
          where: { id: scammerId },
          data: voteType === 'like'
            ? { likeCount: { increment: 1 }, dislikeCount: { decrement: 1 } }
            : { dislikeCount: { increment: 1 }, likeCount: { decrement: 1 } },
        })
        const updated = await db.scammer.findUnique({ where: { id: scammerId } })
        return NextResponse.json({ voted: true, voteType, likeCount: updated?.likeCount || 0, dislikeCount: updated?.dislikeCount || 0 })
      }
    }

    // New vote
    await db.vote.create({ data: { scammerId, voteType, voterId } })
    await db.scammer.update({
      where: { id: scammerId },
      data: voteType === 'like' ? { likeCount: { increment: 1 } } : { dislikeCount: { increment: 1 } },
    })
    const updated = await db.scammer.findUnique({ where: { id: scammerId } })
    return NextResponse.json({ voted: true, voteType, likeCount: updated?.likeCount || 0, dislikeCount: updated?.dislikeCount || 0 })
  } catch (error) {
    console.error('Vote error:', error)
    return NextResponse.json({ error: 'Ошибка голосования' }, { status: 500 })
  }
}

// GET: check current vote status
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const scammerId = searchParams.get('scammerId')
    if (!scammerId) {
      return NextResponse.json({ error: 'Укажите scammerId' }, { status: 400 })
    }

    const userId = await getUserId()
    const voterId = getVoterId(req, userId)

    const vote = await db.vote.findUnique({
      where: { scammerId_voterId: { scammerId, voterId } },
    })

    const scammer = await db.scammer.findUnique({
      where: { id: scammerId },
      select: { likeCount: true, dislikeCount: true },
    })

    return NextResponse.json({
      voteType: vote?.voteType || null,
      likeCount: scammer?.likeCount ?? 0,
      dislikeCount: scammer?.dislikeCount ?? 0,
    })
  } catch (error) {
    console.error('Vote check error:', error)
    return NextResponse.json({ error: 'Ошибка' }, { status: 500 })
  }
}
