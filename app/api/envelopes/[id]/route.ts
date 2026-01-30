import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const adminKey = process.env.ADMIN_KEY;
  const headerKey = req.headers.get('x-admin-key');

  if (!adminKey || headerKey !== adminKey) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  const { id: rawId } = await params;
  const id = Number(rawId);
  if (!Number.isFinite(id)) {
    return new NextResponse('Invalid envelope id', { status: 400 });
  }

  const body = await req.json().catch(() => ({}));
  const available = typeof body.available === 'boolean' ? body.available : null;

  if (available === null) {
    return new NextResponse('Missing available boolean', { status: 400 });
  }

  const updated = await prisma.envelope.update({
    where: { id },
    data: { available },
  });

  return NextResponse.json(updated);
}
