import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/getUserFromToken'

export async function POST(request: NextRequest) {
  try {
    const userId = getUserFromToken(request)
    const body = await request.json()
    
    const { medicationId, scheduledTime } = body

    if (!medicationId || !scheduledTime) {
      return NextResponse.json(
        { error: 'medicationId e scheduledTime são obrigatórios' },
        { status: 400 }
      )
    }

    // Verifica se já foi registrado hoje
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const existingLog = await prisma.medicationLog.findFirst({
      where: {
        userId,
        medicationId,
        scheduledTime,
        takenAt: { gte: today }
      }
    })

    if (existingLog) {
      return NextResponse.json({
        success: true,
        message: 'Medicamento já foi registrado hoje',
        log: existingLog
      })
    }

    // Cria o log
    const log = await prisma.medicationLog.create({
      data: {
        userId,
        medicationId,
        scheduledTime,
        status: 'taken'
      }
    })

    // Atualiza a data de última atividade do usuário
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { lastActiveDate: true, streak: true }
    })

    const now = new Date()
    now.setHours(0, 0, 0, 0)

    let newStreak = user?.streak || 0

    if (user?.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate)
      lastActive.setHours(0, 0, 0, 0)
      
      const daysDiff = Math.floor((now.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 1) {
        newStreak = (user.streak || 0) + 1
      } else if (daysDiff > 1) {
        newStreak = 1
      }
    } else {
      newStreak = 1
    }

    await prisma.user.update({
      where: { id: userId },
      data: {
        lastActiveDate: new Date(),
        streak: newStreak
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Medicamento registrado com sucesso!',
      log,
      streak: newStreak
    })
  } catch (error) {
    console.error('Erro ao registrar medicamento:', error)
    return NextResponse.json(
      { error: 'Erro ao registrar medicamento' },
      { status: 500 }
    )
  }
}