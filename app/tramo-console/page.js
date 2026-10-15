import { connectToDatabase } from '@/lib/db';
import { Enquiry, Project, Service, SiteSettings, TeamMember, AdminUser } from '@/models/content';
import { getSession } from '@/lib/auth';
import AdminLogin from '@/components/admin/login';
import AdminPanel from '@/components/admin/panel';

export const dynamic = 'force-dynamic';

export const metadata = {
  title: 'TRAMO Panel',
  robots: { index: false, follow: false },
};

async function loadContent() {
  try {
    await connectToDatabase();
    const [services, projects, team, settings, enquiries, users] = await Promise.all([
      Service.find().sort({ displayOrder: 1, createdAt: 1 }).lean(),
      Project.find().sort({ displayOrder: 1, createdAt: 1 }).lean(),
      TeamMember.find().sort({ displayOrder: 1, createdAt: 1 }).lean(),
      SiteSettings.findOne().lean(),
      Enquiry.find().sort({ createdAt: -1 }).limit(200).lean(),
      AdminUser.find().select('email name active createdAt').sort({ createdAt: 1 }).lean(),
    ]);
    return { services, projects, team, settings: settings || {}, enquiries, users, databaseReady: true };
  } catch (error) {
    console.error('Admin panel content query failed:', error);
    return { services: [], projects: [], team: [], settings: {}, enquiries: [], users: [], databaseReady: false };
  }
}

export default async function AdminPanelPage() {
  const session = await getSession();
  if (!session) return <AdminLogin />;

  const content = await loadContent();

  return (
    <AdminPanel
      email={session.email}
      databaseReady={content.databaseReady}
      initialServices={JSON.parse(JSON.stringify(content.services))}
      initialProjects={JSON.parse(JSON.stringify(content.projects))}
      initialTeam={JSON.parse(JSON.stringify(content.team))}
      initialEnquiries={JSON.parse(JSON.stringify(content.enquiries))}
      initialSettings={JSON.parse(JSON.stringify(content.settings))}
      initialUsers={JSON.parse(JSON.stringify(content.users))}
    />
  );
}
