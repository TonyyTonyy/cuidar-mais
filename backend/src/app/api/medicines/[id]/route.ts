import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { getUserFromToken } from '@/lib/getUserFromToken'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserFromToken(request)
    const { id } = await params

    // Busca o medicamento com os lembretes
    const medication = await prisma.medication.findFirst({
      where: {
        id,
        userId
      },
      include: {
        reminders: {
          orderBy: { time: 'asc' }
        }
      }
    })

    if (!medication) {
      return NextResponse.json(
        { error: 'Medicamento não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      medication
    })
  } catch (error) {
    console.error('Erro ao buscar medicamento:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar medicamento' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserFromToken(request)
    const { id } = await params
    const body = await request.json()

    // Verifica se o medicamento existe e pertence ao usuário
    const medication = await prisma.medication.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!medication) {
      return NextResponse.json(
        { error: 'Medicamento não encontrado' },
        { status: 404 }
      )
    }

    // Atualiza o medicamento
    const updatedMedication = await prisma.medication.update({
      where: { id },
      data: {
        name: body.name,
        dosage: body.dosage,
        frequency: body.frequency,
        startDate: body.startDate ? new Date(body.startDate) : undefined,
        endDate: body.endDate ? new Date(body.endDate) : null,
        instructions: body.instructions,
        color: body.color,
        active: body.active !== undefined ? body.active : true,
        updatedAt: new Date()
      },
      include: {
        reminders: true
      }
    })

    // Se houver mudanças nos lembretes
    if (body.reminders && Array.isArray(body.reminders)) {
      // Remove lembretes antigos
      await prisma.reminder.deleteMany({
        where: { medicationId: id }
      })

      // Cria novos lembretes
      if (body.reminders.length > 0) {
        await prisma.reminder.createMany({
          data: body.reminders.map((reminder: any) => ({
            userId,
            medicationId: id,
            time: reminder.time,
            days: reminder.days || [],
            enabled: reminder.enabled !== undefined ? reminder.enabled : true
          }))
        })
      }
    }

    // Busca o medicamento atualizado com os lembretes
    const finalMedication = await prisma.medication.findUnique({
      where: { id },
      include: {
        reminders: true
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Medicamento atualizado com sucesso!',
      medication: finalMedication
    })
  } catch (error) {
    console.error('Erro ao atualizar medicamento:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar medicamento' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const userId = getUserFromToken(request)
    const { id } =  await params

    // Verifica se o medicamento existe e pertence ao usuário
    const medication = await prisma.medication.findFirst({
      where: {
        id,
        userId
      }
    })

    if (!medication) {
      return NextResponse.json(
        { error: 'Medicamento não encontrado' },
        { status: 404 }
      )
    }

    // Soft delete - apenas desativa
    await prisma.medication.update({
      where: { id },
      data: { active: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Medicamento desativado com sucesso!'
    })
  } catch (error) {
    console.error('Erro ao desativar medicamento:', error)
    return NextResponse.json(
      { error: 'Erro ao desativar medicamento' },
      { status: 500 }
    )
  }
}