import { randomUUID } from 'node:crypto';
import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { jsonError, requireAdmin } from '@/lib/admin-api';
import { Media } from '@/models/media';

const MAX_MEDIA_BYTES = 8 * 1024 * 1024;

const ALLOWED_TYPES = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'image/gif': '.gif',
  'image/avif': '.avif',
};

/** POST /api/admin/media — multipart image upload. Admin only, 8MB cap. */
export async function POST(request) {
  const { response } = await requireAdmin();
  if (response) return response;

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!file || typeof file === 'string') return jsonError('Choose an image to upload.');

  const extension = ALLOWED_TYPES[file.type];
  if (!extension) return jsonError('Use a JPEG, PNG, WebP, GIF, or AVIF image.');
  if (file.size > MAX_MEDIA_BYTES) return jsonError('Images must be 8MB or smaller.', 413);
  if (file.size === 0) return jsonError('That file is empty.');

  try {
    const bytes = Buffer.from(await file.arrayBuffer());
    await connectToDatabase();
    const filename = `${Date.now()}-${randomUUID().slice(0, 8)}${extension}`;
    await Media.create({
      filename,
      originalName: String(file.name || '').slice(0, 200),
      contentType: file.type,
      size: bytes.length,
      data: bytes,
    });
    return NextResponse.json(
      { data: { url: `/api/media/${filename}`, filename, contentType: file.type, size: bytes.length } },
      { status: 201 },
    );
  } catch (error) {
    console.error('Media upload failed:', error);
    return jsonError('Unable to store that image.', 503);
  }
}
