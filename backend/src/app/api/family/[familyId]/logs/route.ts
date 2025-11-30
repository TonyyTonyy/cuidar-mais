import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { prisma } from '@/lib/prisma';


export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ familyId: string }> }
) {
  try {
    const { familyId } = await params;
    const userId = await getUserFromToken(req);
    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    console.log('User ID:', userId, 'Family ID:', familyId);

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

    // Parâmetros de filtro
    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');
    const status = searchParams.get('status'); // taken, skipped, late, null (todos)

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);
    console.log('startDate ISO:', startDate.toISOString(), 'status filter:', status);

    // Buscar logs
    const logs = await prisma.medicationLog.findMany({
      where: {
        userId: familyId,
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
    console.log('logs length:', logs.length);

    return NextResponse.json(logs);
  } catch (error) {
    console.error('Error fetching family logs:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}