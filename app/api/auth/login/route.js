import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import { AdminUser } from '@/models/content';
import { createSession } from '@/lib/auth';

const loginSchema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(200) });

/** The .env admin still works so a fresh install can always get in. */
async function envAdminMatches(email, password) {
  const adminEmail = process.env.ADMIN_EMAIL?.toLowerCase();
  const passwordHash = process.env.ADMIN_PASSWORD_HASH;
  if (!adminEmail || !passwordHash || email !== adminEmail) return false;
  return await bcrypt.compare(password, passwordHash);
}

async function dbAdminMatches(email, password) {
  await connectToDatabase();
  const user = await AdminUser.findOne({ email }).lean();
  if (!user || user.active === false) return false;
  return bcrypt.compare(password, user.passwordHash);
}

export async function POST(request) {
  const parsed = loginSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Enter a valid email and password.' }, { status: 400 });
  const { email, password } = parsed.data;
  const normalized = email.toLowerCase();

  let ok = false;
  try {
    ok = await envAdminMatches(normalized, password);
    if (!ok) ok = await dbAdminMatches(normalized, password);
  } catch (error) {
    console.error('Admin sign-in failed:', error);
    return NextResponse.json({ error: 'Unable to sign in right now. Try again.' }, { status: 503 });
  }

  if (!ok) {
    return NextResponse.json({ error: 'Email or password is incorrect.' }, { status: 401 });
  }
  await createSession(normalized);
  return NextResponse.json({ ok: true });
}
