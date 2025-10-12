import { NextRequest, NextResponse } from 'next/server'
import { OAuth2Client } from 'google-auth-library'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { idToken } = body

    if (!idToken) {
      return NextResponse.json(
        { error: 'Token do Google é obrigatório' },
        { status: 400 }
      )
    }

    // Verifica o token do Google
    const ticket = await client.verifyIdToken({
      idToken,
      audience: process.env.GOOGLE_CLIENT_ID,
    })

    const payload = ticket.getPayload()

    if (!payload || !payload.email || !payload.sub) {
      return NextResponse.json(
        { error: 'Token inválido' },
        { status: 401 }
      )
    }

    const today = new Date()
    today.setHours(0, 0, 0, 0)

    // Busca ou cria o usuário
    let user = await prisma.user.findUnique({
      where: { googleId: payload.sub },
    })

    if (!user) {
      // Cria novo usuário com streak inicial
      user = await prisma.user.create({
        data: {
          email: payload.email,
          name: payload.name || payload.email.split('@')[0],
          picture: payload.picture || null,
          googleId: payload.sub,
          streak: 0,
          lastActiveDate: new Date(),
        },
      })
    } else {
      // Atualiza informações do usuário e verifica streak
      let updatedStreak = user.streak || 0

      if (user.lastActiveDate) {
        const lastActive = new Date(user.lastActiveDate)
        lastActive.setHours(0, 0, 0, 0)
        
        const daysDiff = Math.floor((today.getTime() - lastActive.getTime()) / (1000 * 60 * 60 * 24))
        
        if (daysDiff > 1) {
          // Perdeu a sequência se passou mais de 1 dia
          updatedStreak = 0
        }
        // Se daysDiff === 0 ou 1, mantém o streak atual
      }

      user = await prisma.user.update({
        where: { id: user.id },
        data: {
          name: payload.name || user.name,
          picture: payload.picture || user.picture,
          streak: updatedStreak,
          lastActiveDate: new Date(),
        },
      })
    }

    // Gera JWT token
    const jwtToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
      },
      process.env.JWT_SECRET!,
      { expiresIn: '30d' }
    )

    return NextResponse.json({
      success: true,
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        picture: user.picture,
        streak: user.streak,
      },
    })
  } catch (error) {
    console.error('Erro no login do Google:', error)
    return NextResponse.json(
      { error: 'Erro ao processar login' },
      { status: 500 }
    )
  }
}