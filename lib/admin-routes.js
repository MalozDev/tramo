import mongoose from 'mongoose';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { connectToDatabase } from '@/lib/db';
import { jsonError, requireAdmin } from '@/lib/admin-api';
import { Project, Service, TeamMember } from '@/models/content';

const orderField = z.coerce.number().int().min(0).max(10000).optional();
// '#' is allowed so a placeholder link can be saved before the real URL exists
const linkField = z.string().url().or(z.literal('')).or(z.literal('#')).optional();

const teamSchema = z.object({
  name: z.string().trim().min(1).max(120),
  role: z.string().trim().min(1).max(120),
  bio: z.string().max(2000).optional(),
  photoUrl: z.string().max(2000).optional(),
  linkedinUrl: linkField,
  facebookUrl: linkField,
  githubUrl: linkField,
  whatsappUrl: z.string().trim().max(500).optional(),
  displayOrder: orderField,
  published: z.boolean().optional(),
});

const serviceSchema = z.object({
  code: z.string().trim().min(1).max(60),
  title: z.string().trim().min(1).max(160),
  description: z.string().max(2000).optional(),
  icon: z.string().max(60).optional(),
  displayOrder: orderField,
});

const projectSchema = z.object({
  title: z.string().trim().min(1).max(200),
  tag: z.string().trim().min(1).max(60),
  client: z.string().max(200).optional(),
  description: z.string().max(4000).optional(),
  problem: z.string().max(6000).optional(),
  solution: z.string().max(6000).optional(),
  technologies: z.array(z.string().max(80)).max(24).optional(),
  tramoRole: z.string().max(2000).optional(),
  results: z.string().max(4000).optional(),
  coverImageUrl: z.string().max(2000).optional(),
  displayOrder: orderField,
  published: z.boolean().optional(),
});

const registry = {
  services: {
    model: Service,
    label: 'service',
    plural: 'services',
    schema: serviceSchema,
    sort: { displayOrder: 1, createdAt: 1 },
    validationError: 'Enter a code and a title for the service.',
  },
  projects: {
    model: Project,
    label: 'project',
    plural: 'projects',
    schema: projectSchema,
    sort: { displayOrder: 1, createdAt: 1 },
    validationError: 'Enter a title and a tag for the project.',
  },
  team: {
    model: TeamMember,
    label: 'team member',
    plural: 'team members',
    schema: teamSchema,
    sort: { displayOrder: 1, createdAt: 1 },
    validationError: 'Enter a name and role, and check the other fields.',
  },
};

function definition(resource) {
  const entry = registry[resource];
  if (!entry) throw new Error(`Unknown admin resource: ${resource}`);
  return entry;
}

/** GET (list) + POST (create) handlers for /api/admin/[resource] */
export function adminCollectionRoutes(resource) {
  const { model, label, plural, schema, sort, validationError } = definition(resource);

  async function GET() {
    const { response } = await requireAdmin();
    if (response) return response;
    try {
      await connectToDatabase();
      const data = await model.find().sort(sort).lean();
      return NextResponse.json({ data });
    } catch (error) {
      console.error(`Admin ${plural} query failed:`, error);
      return jsonError(`Unable to load ${plural}.`, 503);
    }
  }

  async function POST(request) {
    const { response } = await requireAdmin();
    if (response) return response;
    const parsed = schema.safeParse((await request.json().catch(() => null)) ?? {});
    if (!parsed.success) return jsonError(validationError);
    try {
      await connectToDatabase();
      const data = await model.create(parsed.data);
      return NextResponse.json({ data }, { status: 201 });
    } catch (error) {
      console.error(`Admin ${plural} create failed:`, error);
      return jsonError(`Unable to create ${label}.`, 503);
    }
  }

  return { GET, POST };
}

/** PATCH (update) + DELETE handlers for /api/admin/[resource]/[id] */
export function adminItemRoutes(resource) {
  const { model, label, schema, validationError } = definition(resource);

  async function loadId(params) {
    const { id } = await params;
    return mongoose.isValidObjectId(id) ? id : null;
  }

  async function PATCH(request, { params }) {
    const { response } = await requireAdmin();
    if (response) return response;
    const id = await loadId(params);
    if (!id) return jsonError(`${label} not found.`, 404);
    const parsed = schema.partial().safeParse(await request.json().catch(() => null));
    if (!parsed.success) return jsonError(validationError);
    try {
      await connectToDatabase();
      const data = await model.findByIdAndUpdate(id, parsed.data, { new: true, runValidators: true }).lean();
      return data ? NextResponse.json({ data }) : jsonError(`${label} not found.`, 404);
    } catch (error) {
      console.error(`Admin ${label} update failed:`, error);
      return jsonError(`Unable to update ${label}.`, 503);
    }
  }

  async function DELETE(_request, { params }) {
    const { response } = await requireAdmin();
    if (response) return response;
    const id = await loadId(params);
    if (!id) return jsonError(`${label} not found.`, 404);
    try {
      await connectToDatabase();
      const data = await model.findByIdAndDelete(id).lean();
      return data ? NextResponse.json({ ok: true }) : jsonError(`${label} not found.`, 404);
    } catch (error) {
      console.error(`Admin ${label} delete failed:`, error);
      return jsonError(`Unable to delete ${label}.`, 503);
    }
  }

  return { PATCH, DELETE };
}
