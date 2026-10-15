import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { Media } from '@/models/media';

const SAFE_FILENAME = /^[A-Za-z0-9._-]{3,120}$/;

/** GET /api/media/[filename] — public image serving for the landing page. */
export async function GET(_request, { params }) {
  const { filename } = await params;
  if (!SAFE_FILENAME.test(filename)) return new NextResponse('Not found', { status: 404 });

  try {
    await connectToDatabase();
    // Hydrate through Mongoose: `.lean()`/the raw driver hand back a BSON Binary,
    // and Buffer.from(Binary) silently produces a zero-length body.
    const doc = await Media.findOne({ filename });
    if (!doc?.data) return new NextResponse('Not found', { status: 404 });

    const data = Buffer.isBuffer(doc.data) ? doc.data : Buffer.from(doc.data.buffer || []);
    if (!data.length) return new NextResponse('Image unavailable', { status: 500 });

    return new NextResponse(data, {
      headers: {
        'Content-Type': doc.contentType,
        'Content-Length': String(data.length),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    });
  } catch (error) {
    console.error('Media read failed:', error);
    return new NextResponse('Image unavailable', { status: 503 });
  }
}
