import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { prisma } from '@/lib/prisma';


export async function GET(
  req: NextRequest,
  { params }: { params: { familyId: string } }
) {
  try {
    const userId = await getUserFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verificar conexão
    const connection = await prisma.familyConnection.findFirst({
      where: {
        OR: [
          { requesterId: userId, requestedId: params.familyId, status: 'accepted' },
          { requesterId: params.familyId, requestedId: userId, status: 'accepted' }
        ]
      }
    });

    if (!connection) {
      return NextResponse.json({ error: 'No connection found' }, { status: 403 });
    }

    // Parâmetros de filtro
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');
    const status = searchParams.get('status'); // taken, skipped, late, null (todos)

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Buscar logs
    const logs = await prisma.medicationLog.findMany({
      where: {
        userId: params.familyId,
        takenAt: {
          gte: startDate
        },
        ...(status ? { status } : {})
      },
      include: {
        medication: {
          select: {
            id: true,
            name: true,
            dosage: true,
            color: true
          }
        }
      },
      orderBy: {
        takenAt: 'desc'
      }
    });

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching family logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}