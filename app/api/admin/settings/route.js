import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import { jsonError, requireAdmin } from '@/lib/admin-api';
import { SiteSettings } from '@/models/content';

const socialUrl = z
  .string()
  .trim()
  .url('Enter a full URL, including https:// — or # as a placeholder.')
  .or(z.literal(''))
  .or(z.literal('#'))
  .optional();

const settingsSchema = z.object({
  contactEmail: z.string().trim().email('Enter a valid email address.').max(254),
  contactPhone: z.string().trim().max(80),
  address: z.string().trim().max(300),
  linkedinUrl: socialUrl,
  facebookUrl: socialUrl,
  githubUrl: socialUrl,
  whatsappUrl: z.string().trim().max(500).optional(),
});

/** GET /api/admin/settings — current contact details. Admin only. */
export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    await connectToDatabase();
    const data = (await SiteSettings.findOne().lean()) || {};
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Admin settings query failed:', error);
    return jsonError('Unable to load contact details.', 503);
  }
}

/** PATCH /api/admin/settings — update (or create) the contact details. Admin only. */
export async function PATCH(request) {
  const { response } = await requireAdmin();
  if (response) return response;
  const parsed = settingsSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) {
    const first = parsed.error.issues[0];
    return jsonError(first?.message || 'Check the contact details and try again.');
  }
  try {
    await connectToDatabase();
    const data = await SiteSettings.findOneAndUpdate({}, parsed.data, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
      runValidators: true,
    }).lean();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Admin settings update failed:', error);
    return jsonError('Unable to save contact details.', 503);
  }
}
