import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import { AdminUser } from '@/models/content';
import { createSession } from '@/lib/auth';

const setupSchema = z.object({
  email: z.string().trim().toLowerCase().email().max(254),
  name: z.string().trim().max(120).optional(),
  password: z.string().min(12).max(200),
});

export async function GET() {
  return NextResponse.json({ email: process.env.ADMIN_EMAIL?.trim().toLowerCase() || '' });
}

export async function POST(request) {
  const parsed = setupSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return NextResponse.json({ error: 'Enter the configured admin email and a password of at least 12 characters.' }, { status: 400 });
  }

  const configuredEmail = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  if (!configuredEmail) {
    return NextResponse.json({ error: 'First-admin setup is not configured on the server.' }, { status: 503 });
  }
  if (parsed.data.email !== configuredEmail) {
    return NextResponse.json({ error: 'Use the configured admin email.' }, { status: 403 });
  }

  try {
    await connectToDatabase();
    if (await AdminUser.exists({})) {
      return NextResponse.json({ error: 'An admin account already exists. Sign in instead.' }, { status: 409 });
    }

    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const admin = await AdminUser.create({
      email: configuredEmail,
      name: parsed.data.name || '',
      passwordHash,
    });
    await createSession(admin.email);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    if (error?.code === 11000) {
      return NextResponse.json({ error: 'An admin account already exists. Sign in instead.' }, { status: 409 });
    }
    console.error('First-admin setup failed:', error);
    return NextResponse.json({ error: 'Unable to create the first admin account.' }, { status: 503 });
  }
}