import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { prisma } from '@/lib/prisma';

// GET - Listar familiares conectados
export async function GET(req: NextRequest) {
    try {
        const userId = getUserFromToken(req);

        if (!userId) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        // Buscar conexões onde o usuário é o requester OU requested e status é accepted
        const connections = await prisma.familyConnection.findMany({
            where: {
                OR: [
                    { requesterId: userId, status: 'accepted' },
                    { requestedId: userId, status: 'accepted' }
                ]
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
                },
                requested: {
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

        // Formatar os dados para retornar o familiar (não o próprio usuário)
        const familiares = connections.map((conn: any) => {
            const isFamiliar = conn.requestedId !== userId;
            const familiar = isFamiliar ? conn.requested : conn.requester;

            return {
                id: conn.id,
                familiarId: familiar.id,
                nome: familiar.name,
                email: familiar.email,
                picture: familiar.picture,
                age: familiar.age,
                parentesco: conn.relationship || 'Não especificado',
                status: 'ativo',
                permissoes: conn.permissions,
                contato: familiar.email,
                createdAt: conn.createdAt
            };
        });

        return NextResponse.json(familiares);
    } catch (error) {
        console.error('Error fetching family:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// POST - Enviar convite para familiar
export async function POST(req: NextRequest) {
    try {
        const userId = getUserFromToken(req);

        if (!userId) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        const { email, relationship, permissions } = await req.json();

        // Buscar usuário pelo email
        const requestedUser = await prisma.user.findUnique({
            where: { email }
        });

        if (!requestedUser) {
            return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
        }

        if (requestedUser.id === userId) {
            return NextResponse.json({ error: 'Não é possível adicionar a si mesmo' }, { status: 400 });
        }

        // Verificar se já existe conexão
        const existingConnection = await prisma.familyConnection.findFirst({
            where: {
                OR: [
                    { requesterId: userId, requestedId: requestedUser.id },
                    { requesterId: requestedUser.id, requestedId: userId }
                ]
            }
        });

        if (existingConnection) {
            return NextResponse.json({ error: 'Conexão já existe' }, { status: 400 });
        }

        // Criar nova conexão
        const connection = await prisma.familyConnection.create({
            data: {
                requesterId: userId,
                requestedId: requestedUser.id,
                relationship,
                permissions: permissions || 'view',
                status: 'pending'
            },
            include: {
                requested: {
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
            familiarId: connection.requested.id,
            nome: connection.requested.name,
            email: connection.requested.email,
            picture: connection.requested.picture,
            age: connection.requested.age,
            parentesco: connection.relationship || 'Não especificado',
            status: 'pendente',
            permissoes: connection.permissions,
            contato: connection.requested.email,
            createdAt: connection.createdAt
        }, { status: 201 });
    } catch (error) {
        console.error('Error creating connection:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}

// PATCH - Atualizar permissões
export async function PATCH(
    req: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const userId = getUserFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { permissions, relationship } = await req.json();

        const connection = await prisma.familyConnection.update({
            where: { id: params.id },
            data: {
                permissions,
                relationship
            }
        });

        return NextResponse.json(connection);
    } catch (error) {
        console.error('Error updating connection:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}