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

    // Verificar conexão
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

    const { searchParams } = new URL(req.url);
    const days = parseInt(searchParams.get('days') || '7');

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    // Buscar estatísticas
    const logs = await prisma.medicationLog.findMany({
      where: {
        userId: familyId,
        takenAt: {
          gte: startDate
        }
      }
    });

    const totalDoses = logs.length;
    const dosesTomadas = logs.filter((l: any) => l.status === 'taken').length;
    const dosesAtrasadas = logs.filter((l: any) => l.status === 'late').length;
    const dosesPuladas = logs.filter((l: any) => l.status === 'skipped').length;
    const taxaAdesao = totalDoses > 0 ? Math.round((dosesTomadas / totalDoses) * 100) : 0;

    // Medicamentos mais usados
    const medicationCounts = logs.reduce((acc: Record<string, number>, log: any) => {
      acc[log.medicationId] = (acc[log.medicationId] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const medicationIds = Object.keys(medicationCounts);
    const medications = await prisma.medication.findMany({
      where: {
        id: { in: medicationIds }
      },
      select: {
        id: true,
        name: true,
        dosage: true
      }
    });

    const medicamentosMaisUsados = medications.map((med: any) => ({
      id: med.id,
      nome: med.name,
      doses: medicationCounts[med.id],
      tipo: med.dosage
    })).sort((a: any, b: any) => b.doses - a.doses).slice(0, 5);

    // Adesão por horário
    const logsByTime: Record<string, { total: number, taken: number }> = logs.reduce((acc: Record<string, { total: number, taken: number }>, log: any) => {
      const hour = log.scheduledTime.split(':')[0] + ':00';
      if (!acc[hour]) {
        acc[hour] = { total: 0, taken: 0 };
      }
      acc[hour].total++;
      if (log.status === 'taken') {
        acc[hour].taken++;
      }
      return acc;
    }, {} as Record<string, { total: number, taken: number }>);

    const horariosCriticos = Object.entries(logsByTime).map(([horario, data]) => ({
      horario,
      adesao: Math.round((data.taken / data.total) * 100),
      doses: data.total
    })).sort((a, b) => a.horario.localeCompare(b.horario));

    return NextResponse.json({
      totalDoses,
      dosesTomadas,
      dosesAtrasadas,
      dosesPuladas,
      taxaAdesao,
      medicamentosMaisUsados,
      horariosCriticos
    });
  } catch (error) {
    console.error('Error fetching family stats:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}