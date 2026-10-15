import mongoose from 'mongoose';
import { connectToDatabase } from '../lib/db.js';
import { Project, Service, SiteSettings } from '../models/content.js';

const services = [
  ['SOFTWARE', 'Custom software development', 'Web, mobile, and desktop platforms built for how your team actually works.', 'software'],
  ['SYSTEMS', 'System engineering', 'Server infrastructure, virtualisation, and cloud environments, architected and maintained.', 'systems'],
  ['NETWORKS', 'Network engineering', 'Enterprise routing, wireless, structured cabling, and 24/7 monitoring.', 'networks'],
  ['DATA CENTRE', 'Data centre & server builds', 'Secure, scalable server rooms. Your data stays in Zambia, under your control.', 'datacentre'],
  ['DIGITIZATION', 'Business process digitization', 'Turn manual workflows and paper trails into efficient digital systems.', 'digitization'],
  ['WEB & E-SOLUTIONS', 'Digital presence', 'Corporate sites, e-commerce, mobile money integration, and booking systems.', 'web'],
].map(([code, title, description, icon], index) => ({ code, title, description, icon, displayOrder: index + 1 }));

const projects = [
  {
    title: 'WANGU EV Mobility Platform', tag: 'SOFTWARE', client: 'EV Mobility · Confidential',
    description: 'Ride-hailing and logistics platform connecting passengers with EV drivers, with OCPP-compliant charging telemetry.',
    problem: 'EV drivers and riders in the target market had no dedicated platform accounting for charging logistics alongside standard ride-hailing.',
    solution: 'A ride-hailing and logistics platform built around EV-specific needs, including real-time charging status and route planning around charge points.',
    technologies: ['React Native', 'Node.js', 'OCPP Protocol', 'PostgreSQL'],
    tramoRole: 'Full platform design and development, including OCPP-compliant charging telemetry integration.',
    results: 'Delivered a working platform connecting riders and EV drivers with charging-aware logistics. Details confidential at client’s request.', displayOrder: 1,
  },
  {
    title: 'Fleet Management System', tag: 'SYSTEMS', client: 'Logistics Sector · Confidential',
    description: 'Real-time GPS tracking, driver behaviour monitoring, and automated reporting dashboards.',
    problem: 'The client had no centralised way to track vehicle locations, driver behaviour, or generate consistent operational reports.',
    solution: 'A fleet management system combining live GPS tracking with driver behaviour monitoring and automated, scheduled reporting.',
    technologies: ['React', 'Node.js', 'MapBox', 'PostgreSQL'],
    tramoRole: 'System design, backend architecture, and dashboard development.',
    results: 'Gave the client real-time visibility into its fleet and removed manual reporting overhead. Details confidential at client’s request.', displayOrder: 2,
  },
  {
    title: 'KU Market', tag: 'E-SOLUTIONS', client: 'SMEs · Online Marketplace',
    description: 'Multi-vendor marketplace and inventory system with full ZRA tax compliance for Zambian SMEs.',
    problem: 'Zambian SMEs lacked an accessible multi-vendor marketplace that also handled ZRA tax compliance correctly out of the box.',
    solution: 'A marketplace and inventory platform built around Zambian SME needs, with ZRA-compliant tax handling from the start.',
    technologies: ['Next.js', 'Node.js', 'PostgreSQL', 'ZRA API'],
    tramoRole: 'End-to-end platform design, development, and ZRA compliance integration.',
    results: 'Gave participating SMEs a compliant, ready-to-use online sales channel.', displayOrder: 3,
  },
  {
    title: 'Meister Pay', tag: 'SOFTWARE', client: 'E-commerce & Business Platforms',
    description: 'Unified payment gateway API integrating mobile money and bank transfers into merchant platforms.',
    problem: 'Merchants needed a single integration point instead of juggling separate mobile money and bank transfer APIs.',
    solution: 'A unified payment gateway API that merchant platforms can integrate once to accept mobile money and bank transfers.',
    technologies: ['Node.js', 'REST API', 'Mobile Money APIs', 'Banking APIs'],
    tramoRole: 'API design, development, and integration testing across payment providers.',
    results: 'Simplified payment integration for merchant platforms into a single, consistent API.', displayOrder: 4,
  },
].map((project) => ({ ...project, published: true }));

async function seed() {
  try {
    await connectToDatabase();
    if (await Service.countDocuments() === 0) await Service.insertMany(services);
    if (await Project.countDocuments() === 0) await Project.insertMany(projects);
    if (await SiteSettings.countDocuments() === 0) await SiteSettings.create({});
    console.info('MongoDB seed complete. Existing content was left unchanged.');
  } finally {
    await mongoose.disconnect();
  }
}

seed().catch((error) => {
  console.error('MongoDB seed failed:', error.message);
  process.exitCode = 1;
});