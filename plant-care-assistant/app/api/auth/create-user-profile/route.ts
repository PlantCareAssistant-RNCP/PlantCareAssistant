import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'
import logger from "@utils/logger"

const prisma = new PrismaClient()

export async function POST(req: Request) {
  const { id, username } = await req.json()

  try {
    await prisma.userProfile.create({
      data: {
        id, // must match Supabase Auth user ID
        username,
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Create UserProfile failed:', error)
    return NextResponse.json({ error: 'UserProfile creation failed' }, { status: 500 })
  }
}