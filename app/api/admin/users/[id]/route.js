import bcrypt from 'bcryptjs';
import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import { jsonError, requireAdmin } from '@/lib/admin-api';
import { AdminUser } from '@/models/content';

const SAFE_FIELDS = 'email name active createdAt updatedAt';

const updateSchema = z.object({
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(254).optional(),
  password: z.string().min(8, 'Use at least 8 characters.').max(200).optional(),
  name: z.string().trim().max(120).optional(),
  active: z.boolean().optional(),
});

/** PATCH /api/admin/users/[id] — rename, reset password or disable. Admin only. */
export async function PATCH(request, { params }) {
  const { response, session } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return jsonError('Admin account not found.', 404);

  const body = await request.json().catch(() => null);
  const payload = { ...(body && typeof body === 'object' ? body : {}) };
  if (!payload.password) delete payload.password;
  if (payload.email) payload.email = String(payload.email).trim().toLowerCase();

  const parsed = updateSchema.safeParse(payload);
  if (!parsed.success) {
    return jsonError(parsed.error.issues[0]?.message || 'Check the account details and try again.');
  }
  if (Object.keys(parsed.data).length === 0) return jsonError('Nothing to update.');

  try {
    await connectToDatabase();
    const current = await AdminUser.findById(id).lean();
    if (!current) return jsonError('Admin account not found.', 404);
    if (parsed.data.email && parsed.data.email !== current.email) {
      const clash = await AdminUser.findOne({ email: parsed.data.email, _id: { $ne: id } }).lean();
      if (clash) return jsonError('An admin account with that email already exists.');
    }
    if (parsed.data.active === false && current.email === session.email) {
      return jsonError('You cannot disable the account you are signed in with.');
    }

    const updates = { ...parsed.data };
    if (updates.password) updates.passwordHash = await bcrypt.hash(updates.password, 10);
    delete updates.password;

    const data = await AdminUser.findByIdAndUpdate(id, updates, { new: true, runValidators: true })
      .select(SAFE_FIELDS)
      .lean();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Admin user update failed:', error);
    return jsonError('Unable to update the admin account.', 503);
  }
}

/** DELETE /api/admin/users/[id] — remove a console account. Admin only. */
export async function DELETE(_request, { params }) {
  const { response, session } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return jsonError('Admin account not found.', 404);
  try {
    await connectToDatabase();
    const data = await AdminUser.findById(id).select(SAFE_FIELDS).lean();
    if (!data) return jsonError('Admin account not found.', 404);
    if (data.email === session.email) return jsonError('You cannot delete the account you are signed in with.');
    await AdminUser.deleteOne({ _id: id });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Admin user delete failed:', error);
    return jsonError('Unable to delete the admin account.', 503);
  }
}
