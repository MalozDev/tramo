import { adminCollectionRoutes } from '@/lib/admin-routes';

const routes = adminCollectionRoutes('projects');

export const GET = routes.GET;
export const POST = routes.POST;
