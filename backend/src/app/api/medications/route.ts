import { NextRequest, NextResponse } from 'next/server'
import jwt from 'jsonwebtoken'
import { prisma } from '@/lib/prisma'

function getUserFromToken(request: NextRequest) {
  const authHeader = request.headers.get('authorization')
  
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new Error('Token não fornecido')
  }

  const token = authHeader.substring(7)
  const decoded = jwt.verify(token, process.env.JWT_SECRET!) as {
    userId: string
  }

  return decoded.userId
}

// Mapeia dias da semana para o formato do banco
const dayMapping: Record<string, string> = {
  'dom': 'sunday',
  'seg': 'monday',
  'ter': 'tuesday',
  'qua': 'wednesday',
  'qui': 'thursday',
  'sex': 'friday',
  'sab': 'saturday',
}

// Gera cores aleatórias para medicamentos
const colors = [
  '#6366F1', '#8B5CF6', '#EC4899', '#10B981', 
  '#F59E0B', '#EF4444', '#3B82F6', '#14B8A6'
]

function getRandomColor(): string {
  return colors[Math.floor(Math.random() * colors.length)]
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserFromToken(request)

    const medications = await prisma.medication.findMany({
      where: { userId },
      include: {
        reminders: true,
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({
      success: true,
      medications,
    })
  } catch (error) {
    console.error('Erro ao buscar medicamentos:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar medicamentos' },
      { status: 401 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const userId = getUserFromToken(request)
    const body = await request.json()

    const { 
      name, 
      dosage, 
      frequency, 
      frequencyValue,
      times, 
      days,
      duration,
      durationDays,
      notes 
    } = body

    // Validações básicas
    if (!name || !dosage || !frequency || !times || times.length === 0) {
      return NextResponse.json(
        { error: 'Campos obrigatórios faltando' },
        { status: 400 }
      )
    }

    // Calcula data de início e fim
    const startDate = new Date()
    let endDate = null
    
    if (duration === 'days' && durationDays > 0) {
      endDate = new Date()
      endDate.setDate(endDate.getDate() + durationDays)
    }

    // Determina a string de frequência para armazenar
    let frequencyStr = ''
    if (frequency === 'hours') {
      frequencyStr = `${frequencyValue}h`
    } else if (frequency === 'times_day') {
      frequencyStr = `${times.length}x ao dia`
    } else if (frequency === 'specific_days') {
      frequencyStr = 'Dias específicos'
    }

    // Cria o medicamento
    const medication = await prisma.medication.create({
      data: {
        userId,
        name,
        dosage,
        frequency: frequencyStr,
        startDate,
        endDate,
        instructions: notes || null,
        color: getRandomColor(),
        active: true,
      },
    })

    // Determina quais dias criar lembretes
    let reminderDays: string[] = []
    
    if (frequency === 'specific_days' && days && days.length > 0) {
      // Mapeia os dias para o formato do banco
      reminderDays = days.map((day: string) => dayMapping[day] || day)
    } else {
      // Para frequência em horas ou vezes ao dia, cria para todos os dias
      reminderDays = [
        'sunday', 'monday', 'tuesday', 'wednesday', 
        'thursday', 'friday', 'saturday'
      ]
    }

    // Cria os lembretes
    const reminderPromises = times.map((time: string) => {
      return prisma.reminder.create({
        data: {
          userId,
          medicationId: medication.id,
          time,
          days: reminderDays,
          enabled: true,
        },
      })
    })

    await Promise.all(reminderPromises)

    // Busca o medicamento completo com os lembretes
    const completeMedication = await prisma.medication.findUnique({
      where: { id: medication.id },
      include: {
        reminders: true,
      },
    })

    return NextResponse.json({
      success: true,
      message: 'Medicamento cadastrado com sucesso!',
      medication: completeMedication,
    })
  } catch (error) {
    console.error('Erro ao criar medicamento:', error)
    return NextResponse.json(
      { error: 'Erro ao criar medicamento' },
      { status: 500 }
    )
  }
}