import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import jwt from 'jsonwebtoken'

export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization')
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token não fornecido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)

    // Verifica o token
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
      userId: string
      email: string
    }

    // Opcional: Atualiza última atividade do usuário
    await prisma.user.update({
      where: { id: decoded.userId },
      data: {
        lastActiveDate: new Date(),
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Logout realizado com sucesso',
    })
  } catch (error) {
    console.error('Erro no logout:', error)
    
    // Se o token for inválido, ainda considera como sucesso
    // pois o objetivo é remover o token do cliente
    return NextResponse.json({
      success: true,
      message: 'Logout realizado',
    })
  }
}