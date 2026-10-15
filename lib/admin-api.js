import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth';

export async function requireAdmin() {
  const session = await getSession();
  if (!session) return { response: NextResponse.json({ error: 'Authentication required.' }, { status: 401 }) };
  return { session };
}

export function jsonError(error, status = 400) {
  return NextResponse.json({ error }, { status });
}