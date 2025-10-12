import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verifica o JWT
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      email: string
    }

    // Busca o usuário
    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
      select: {
        id: true,
        email: true,
        name: true,
        picture: true,
        streak: true,
        lastActiveDate: true,
        createdAt: true,
      },
    })

    if (!user) {
      return NextResponse.json(
        { error: 'Usuário não encontrado' },
        { status: 404 }
      )
    }

    // Atualiza a sequência (streak) baseado na última atividade
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    let updatedStreak = user.streak || 0
    
    if (user.lastActiveDate) {
      const lastActive = new Date(user.lastActiveDate)
      lastActive.setHours(0, 0, 0, 0)
      
      const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
      
      if (daysDiff === 0) {
        // Mesmo dia, mantém o streak
        updatedStreak = user.streak || 0
      } else if (daysDiff === 1) {
        // Dia consecutivo, incrementa o streak
        updatedStreak = (user.streak || 0) + 1
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            streak: updatedStreak,
            lastActiveDate: new Date()
          }
        })
      } else {
        // Perdeu a sequência
        updatedStreak = 0
        await prisma.user.update({
          where: { id: user.id },
          data: { 
            streak: 0,
            lastActiveDate: new Date()
          }
        })
      }
    }

    // Gera um avatar emoji se não tiver foto
    const avatar = user.picture ? null : getRandomAvatar(user.name)

    return NextResponse.json({
      success: true,
      user: {
        ...user,
        streak: updatedStreak,
        avatar: avatar,
      },
    })
  } catch (error) {
    console.error('Erro ao buscar usuário:', error)
    return NextResponse.json(
      { error: 'Token inválido ou expirado' },
      { status: 401 }
    )
  }
}

function getRandomAvatar(name: string): string {
  const avatars = ['👨', '👩', '🧑', '👴', '👵', '👨‍⚕️', '👩‍⚕️', '🧓']
  const index = name.length % avatars.length
  return avatars[index]
}