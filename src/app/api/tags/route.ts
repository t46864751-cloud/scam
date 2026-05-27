import { NextResponse } from 'next/server'
import { db } from '@/lib/db'

// GET /api/tags — returns all unique visible (non-hidden) tag texts with counts
export async function GET() {
  try {
    const tags = await db.userTag.groupBy({
      by: ['text'],
      where: { hidden: false },
      _count: { id: true },
      _min: { color: true },
      _min: { textColor: true },
      orderBy: { _count: { id: 'desc' } },
    })

    // Get one representative color/textColor per tag
    const tagDetails = await db.userTag.findMany({
      where: { hidden: false },
      select: { text: true, color: true, textColor: true },
      distinct: ['text'],
    })

    const colorMap: Record<string, { color: string; textColor: string }> = {}
    for (const t of tagDetails) {
      if (!colorMap[t.text]) {
        colorMap[t.text] = { color: t.color, textColor: t.textColor }
      }
    }

    const result = tags.map((t) => ({
      text: t.text,
      count: t._count.id,
      color: colorMap[t.text]?.color || '#3b82f6',
      textColor: colorMap[t.text]?.textColor || '#ffffff',
    }))

    return NextResponse.json({ tags: result })
  } catch (error) {
    console.error('Tags fetch error:', error)
    return NextResponse.json({ tags: [] })
  }
}
