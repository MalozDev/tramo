import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import { jsonError, requireAdmin } from '@/lib/admin-api';
import { Enquiry } from '@/models/content';

const updateSchema = z.object({
  status: z.enum(['new', 'contacted', 'converted', 'closed']),
});

/** PATCH /api/admin/enquiries/[id] — move an enquiry through the pipeline. Admin only. */
export async function PATCH(request, { params }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return jsonError('Enquiry not found.', 404);
  const parsed = updateSchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return jsonError('Choose a valid status.');
  try {
    await connectToDatabase();
    const data = await Enquiry.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true }).lean();
    return data ? NextResponse.json({ data }) : jsonError('Enquiry not found.', 404);
  } catch (error) {
    console.error('Admin enquiry update failed:', error);
    return jsonError('Unable to update that enquiry.', 503);
  }
}

/** DELETE /api/admin/enquiries/[id] — remove an enquiry. Admin only. */
export async function DELETE(_request, { params }) {
  const { response } = await requireAdmin();
  if (response) return response;
  const { id } = await params;
  if (!mongoose.isValidObjectId(id)) return jsonError('Enquiry not found.', 404);
  try {
    await connectToDatabase();
    const data = await Enquiry.findByIdAndDelete(id).lean();
    return data ? NextResponse.json({ ok: true }) : jsonError('Enquiry not found.', 404);
  } catch (error) {
    console.error('Admin enquiry delete failed:', error);
    return jsonError('Unable to delete that enquiry.', 503);
  }
}
