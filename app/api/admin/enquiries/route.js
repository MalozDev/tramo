import { NextResponse } from 'next/server';
import { connectToDatabase } from '@/lib/db';
import { jsonError, requireAdmin } from '@/lib/admin-api';
import { Enquiry } from '@/models/content';

/** GET /api/admin/enquiries — inbox listing, newest first. Admin only. */
export async function GET() {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    await connectToDatabase();
    const data = await Enquiry.find().sort({ createdAt: -1 }).limit(200).lean();
    return NextResponse.json({ data });
  } catch (error) {
    console.error('Admin enquiries query failed:', error);
    return jsonError('Unable to load enquiries.', 503);
  }
}
