import { NextRequest, NextResponse } from 'next/server';
import { getUserFromToken } from '@/lib/getUserFromToken';
import { prisma } from '@/lib/prisma';

export async function DELETE(
    req: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id } = await params;
        const userId = getUserFromToken(req);
        if (!userId) {
            return NextResponse.json({ error: 'User not found' }, { status: 404 });
        }

        await prisma.familyConnection.delete({
            where: {
                id: id
            }
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error('Error deleting connection:', error);
        return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
    }
}