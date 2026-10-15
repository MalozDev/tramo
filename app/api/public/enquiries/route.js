import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import { Enquiry } from '@/models/content';

const enquirySchema = z.object({
  name: z.string().trim().min(1).max(120),
  email: z.string().trim().email().max(254).or(z.literal('')).optional(),
  phone: z.string().trim().max(80).optional(),
  company: z.string().trim().max(160).optional(),
  servicesNeeded: z.array(z.string().max(100)).max(12).optional(),
  message: z.string().trim().max(5000).optional(),
  website: z.string().max(0).optional(),
});

export async function POST(request) {
  const parsed = enquirySchema.safeParse(await request.json().catch(() => null));
  if (!parsed.success) return NextResponse.json({ error: 'Check the form fields and try again.' }, { status: 400 });
  if (parsed.data.website) return NextResponse.json({ ok: true });
  try {
    await connectToDatabase();
    const { website: _website, ...enquiry } = parsed.data;
    await Enquiry.create(enquiry);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error('Enquiry submission failed:', error);
    return NextResponse.json({ error: 'Unable to send your message right now.' }, { status: 503 });
  }
}