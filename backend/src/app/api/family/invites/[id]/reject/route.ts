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

        // Rejeitar convite (deletar)
        await prisma.familyConnection.delete({
            where: { id: params.id }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error rejecting invite:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}