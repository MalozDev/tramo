import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import { jsonError, requireAdmin } from '@/lib/admin-api';
import { AdminUser } from '@/models/content';

const SAFE_FIELDS = 'email name active createdAt updatedAt';

const createSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(254),
  password: z.string().min(8, 'Use at least 8 characters.').max(200),
  name: z.string().trim().max(120).optional(),
  active: z.boolean().optional(),
});

/** GET /api/admin/users — console accounts. Admin only. */
export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    await connectToDatabase();
    const data = await AdminUser.find().select(SAFE_FIELDS).sort({ createdAt: 1 }).lean();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Admin users query failed:', error);
    return jsonError('Unable to load admin users.', 503);
  }
}

/** POST /api/admin/users — invite a new console account. Admin only. */
export async function POST(request) {
  const { response } = await requireAdmin();
  if (response) return response;
  const parsed = createSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Check the email and password and try again.');
  }
  try {
    await connectToDatabase();
    const existing = await AdminUser.findOne({ email: parsed.data.email }).lean();
    if (existing) return jsonError('An admin account with that email already exists.');
    const passwordHash = await bcrypt.hash(parsed.data.password, 10);
    const doc = await AdminUser.create({ ...parsed.data, passwordHash });
    return NextResponse.json(
      { data: { _id: String(doc._id), email: doc.email, name: doc.name, active: doc.active, createdAt: doc.createdAt } },
      { status: 201 },
    );
  } catch (error) {
    console.error('Admin user create failed:', error);
    return jsonError('Unable to create the admin account.', 503);
  }
}
