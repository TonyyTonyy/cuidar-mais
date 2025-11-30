import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params;
    const userId = getUserFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verificar se tem conexão ativa com o familiar
    const connection = await prisma.familyConnection.findFirst({
      where: {
        OR: [
          { requesterId: userId, requestedId: familyId, status: 'accepted' },
          { requesterId: familyId, requestedId: userId, status: 'accepted' }
        ]
      }
    });

    if (!connection) {
      return NextResponse.json({ error: 'No connection found' }, { status: 403 });
    }

    // Buscar medicamentos do familiar
    const medications = await prisma.medication.findMany({
      where: {
        userId: familyId,
        active: true
      },
      include: {
        reminders: {
          where: { enabled: true }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    return NextResponse.json(medications);
  } catch (error) {
    console.error('Error fetching family medications:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}