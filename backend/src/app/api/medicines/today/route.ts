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

function getMinutesUntil(timeStr: string): number {
  const [hours, minutes] = timeStr.split(':').map(Number)
  const now = new Date()
  const target = new Date()
  target.setHours(hours, minutes, 0, 0)
  
  const diff = target.getTime() - now.getTime()
  return Math.floor(diff / 60000)
}

function getDayOfWeek(): string {
  const days = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
  return days[new Date().getDay()]
}

export async function GET(request: NextRequest) {
  try {
    const userId = getUserFromToken(request)
    
    const today = new Date()
    today.setHours(0, 0, 0, 0)
    
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    
    const currentDay = getDayOfWeek()

    // Busca medicamentos ativos do usuário
    const medications = await prisma.medication.findMany({
      where: {
        userId,
        active: true,
        startDate: { lte: new Date() },
        OR: [
          { endDate: null },
          { endDate: { gte: today } }
        ]
      },
      include: {
        reminders: {
          where: {
            enabled: true,
            days: { has: currentDay }
          },
          orderBy: { time: 'asc' }
        }
      }
    })

    // Busca logs de hoje
    const logs = await prisma.medicationLog.findMany({
      where: {
        userId,
        takenAt: {
          gte: today,
          lt: tomorrow
        }
      }
    })

    // Monta lista de medicamentos de hoje com status
    const todayMedicines = medications.flatMap(med => {
      return med.reminders.map(reminder => {
        const logKey = `${med.id}-${reminder.time}`
        const takenLog = logs.find(
          log => log.medicationId === med.id && log.scheduledTime === reminder.time
        )
        
        const minutesUntil = getMinutesUntil(reminder.time)
        let status = 'pending'
        
        if (takenLog) {
          status = 'taken'
        } else if (minutesUntil < -30) {
          status = 'overdue'
        }

        return {
          id: `${med.id}-${reminder.time}`,
          medicationId: med.id,
          reminderId: reminder.id,
          name: med.name,
          dosage: med.dosage,
          time: reminder.time,
          nextIn: minutesUntil,
          notes: med.instructions || 'Tomar conforme prescrito',
          status,
          color: med.color
        }
      })
    })

    return NextResponse.json({
      success: true,
      medicines: todayMedicines
    })
  } catch (error) {
    console.error('Erro ao buscar medicamentos de hoje:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar medicamentos' },
      { status: 401 }
    )
  }
}