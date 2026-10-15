import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { jsonError, requireAdmin } from '@/lib/admin-api';
import { Media } from '@/models/media';

const SAFE_FILENAME = /^[A-Za-z0-9._-]{3,120}$/;

/** DELETE /api/admin/media/[filename] — remove an uploaded image. Admin only. */
export async function DELETE(_request, { params }) {
  const { response } = await requireAdmin();
  if (response) return response;

  const { filename } = await params;
  if (!SAFE_FILENAME.test(filename)) return jsonError('Image not found.', 404);

  try {
    await connectToDatabase();
    const result = await Media.deleteOne({ filename });
    return result.deletedCount
      ? NextResponse.json({ ok: true })
      : jsonError('Image not found.', 404);
  } catch (error) {
    console.error('Media delete failed:', error);
    return jsonError('Unable to remove that image.', 503);
  }
}
