import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getUserFromToken } from '@/lib/getUserFromToken';

// GET - Listar convites pendentes recebidos
export async function GET(req: NextRequest) {
  try {
  const userId = getUserFromToken(req);

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Buscar convites pendentes onde o usuário é o requested
    const invites = await prisma.familyConnection.findMany({
      where: {
        requestedId: userId,
        status: 'pending'
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
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    const formattedInvites = invites.map((invite: any) => ({
      id: invite.id,
      familiarId: invite.requester.id,
      nome: invite.requester.name,
      email: invite.requester.email,
      picture: invite.requester.picture,
      age: invite.requester.age,
      parentesco: invite.relationship || 'Não especificado',
      permissoes: invite.permissions,
      createdAt: invite.createdAt
    }));

    return NextResponse.json(formattedInvites);
  } catch (error) {
    console.error('Error fetching invites:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}