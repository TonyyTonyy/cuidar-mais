import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/getUserFromToken';


export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const userId = getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Verificar se o convite pertence ao usuário
    const invite = await prisma.familyConnection.findUnique({
      where: { id: params.id }
    });

    if (!invite || invite.requestedId !== userId) {
      return NextResponse.json({ error: 'Invite not found' }, { status: 404 });
    }

    // Aceitar convite
    const connection = await prisma.familyConnection.update({
      where: { id: params.id },
      data: {
        status: 'accepted'
      },
      include: {
        requester: {
          select: {
            id: true,
            name: true,
            email: true,
            picture: true,
            age: true
          }
        }
      }
    });

    return NextResponse.json({
      id: connection.id,
      familiarId: connection.requester.id,
      nome: connection.requester.name,
      email: connection.requester.email,
      picture: connection.requester.picture,
      age: connection.requester.age,
      parentesco: connection.relationship || 'Não especificado',
      status: 'ativo',
      permissoes: connection.permissions,
      contato: connection.requester.email,
      createdAt: connection.createdAt
    });
  } catch (error) {
    console.error('Error accepting invite:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}