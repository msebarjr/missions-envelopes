import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const envelopes = await prisma.envelope.findMany({
    orderBy: { id: 'asc' },
  });

  return NextResponse.json(envelopes);
}
