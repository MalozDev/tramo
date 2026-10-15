import Image from 'next/image';
import { connectToDatabase } from '@/lib/db';
import { Project, Service, SiteSettings, TeamMember } from '@/models/content';
import EnquiryForm from '@/components/public/enquiry-form';
import TypingHeadline from '@/components/public/typing-headline';
import SiteHeader from '@/components/public/site-header';
import {
  FacebookIcon,
  GitHubIcon,
  LinkedInIcon,
  MailIcon,
  PhoneIcon,
  PinIcon,
  WhatsAppIcon,
} from '@/components/public/icons';
import { whatsappHref } from '@/lib/social-links';

export const dynamic = 'force-dynamic';

const serviceFallbacks = [
  { code: 'SOFTWARE', title: 'Custom software development', description: 'Web, mobile, and desktop platforms built around how your team works.' },
  { code: 'SYSTEMS', title: 'Systems engineering', description: 'Server infrastructure, virtualisation, and cloud environments.' },
  { code: 'NETWORKS', title: 'Network engineering', description: 'Enterprise routing, wireless, structured cabling, and monitoring.' },
  { code: 'DATA CENTRE', title: 'Data centre & server builds', description: 'Secure, scalable infrastructure with your data kept in Zambia.' },
  { code: 'DIGITIZATION', title: 'Business process digitization', description: 'Turn manual workflows into efficient digital systems.' },
  { code: 'WEB & E-SOLUTIONS', title: 'Digital presence', description: 'Corporate sites, commerce, mobile money, and booking systems.' },
];

const defaultSettings = {
  contactEmail: 'tramotechnologies@gmail.com',
  contactPhone: '+260 972 336 313',
  address: 'University of Zambia, Great East Road Campus, Lusaka',
  linkedinUrl: '',
  facebookUrl: '',
  githubUrl: '',
  whatsappUrl: '',
};

async function getPublicContent() {
  try {
    await connectToDatabase();
    const [services, projects, team, settings] = await Promise.all([
      Service.find().sort({ displayOrder: 1 }).lean(),
      Project.find({ published: true }).sort({ displayOrder: 1 }).lean(),
      TeamMember.find({ published: true }).sort({ displayOrder: 1 }).lean(),
      SiteSettings.findOne().lean(),
    ]);
    return { services, projects, team, settings: { ...defaultSettings, ...(settings || {}) }, connected: true };
  } catch (error) {
    console.error('Public homepage content query failed:', error);
    return { services: [], projects: [], team: [], settings: defaultSettings, connected: false };
  }
}

function initials(name) {
  return name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
}

function Eyebrow({ children, tone = 'accent' }) {
  const color = tone === 'light' ? 'text-blush' : 'text-accent-dark';
  return <p className={`mb-5 font-mono text-[10px] font-medium uppercase ${color}`}>{children}</p>;
}

function SectionHeading({ label, title, copy, tone = 'dark', id }) {
  const titleColor = tone === 'light' ? 'text-paper' : 'text-ink';
  const copyColor = tone === 'light' ? 'text-mist' : 'text-muted';
  return (
    <div className="mb-12 max-w-3xl">
      <Eyebrow tone={tone === 'light' ? 'light' : 'accent'}>{label}</Eyebrow>
      <h2 className={`font-display text-[clamp(32px,4.4vw,56px)] font-semibold leading-[1.12] ${titleColor}`} id={id}>
        {title}
      </h2>
      {copy && <p className={`mt-5 max-w-xl text-[15px] leading-[1.75] ${copyColor}`}>{copy}</p>}
    </div>
  );
}

export default async function HomePage() {
  const { services: storedServices, projects, team, settings, connected } = await getPublicContent();
  const services = storedServices.length ? storedServices : serviceFallbacks;
  const whatsappUrl = whatsappHref(settings.whatsappUrl) || whatsappHref(settings.contactPhone);

  return (
    <main className="mx-auto max-w-[1600px]">
      <SiteHeader
        linkedinUrl={settings.linkedinUrl}
        facebookUrl={settings.facebookUrl}
        githubUrl={settings.githubUrl}
        whatsappUrl={whatsappUrl}
        contactEmail={settings.contactEmail}
        contactPhone={settings.contactPhone}
      />

      <section
        id="top"
        className="relative mt-[5px] flex min-h-[610px] items-center overflow-hidden bg-[linear-gradient(110deg,#f4f2ec_0%,#f4f2ec_58%,#e4e7d9_58%,#e4e7d9_100%)] px-[7.1%] pt-[32px] pb-[104px] max-md:min-h-[690px] max-md:flex-col max-md:items-start max-md:bg-[linear-gradient(165deg,#f4f2ec_0%,#f4f2ec_57%,#e4e7d9_57%,#e4e7d9_100%)] max-md:pb-[60px] max-md:pt-[24px]"
      >
        <div className="relative z-10 w-[min(670px,70%)] max-md:w-full">
          <Eyebrow>Lusaka, Zambia · Built for what&apos;s next</Eyebrow>
          <h1 className="max-w-[760px] font-display text-[clamp(48px,6.5vw,88px)] font-bold leading-[1.02]">
            <TypingHeadline />
          </h1>
          <p className="my-[26px] max-w-[440px] text-[16px] leading-[1.7] text-muted">
            We design and build the digital systems, software, and infrastructure that help ambitious teams do more.
          </p>
          <a href="#services" className="inline-flex items-center border-b border-ink pb-2.5 text-[13px] font-bold">
            Explore what we do <span className="ml-2.5 text-accent" aria-hidden="true">↓</span>
          </a>
        </div>

        <div
          aria-hidden="true"
          className="absolute right-[8%] top-[20%] grid aspect-square w-[min(30vw,390px)] place-items-center rounded-full border border-[#b9c1af] text-[#89967c] max-md:bottom-[66px] max-md:right-[9%] max-md:top-auto max-md:w-[180px]"
        >
          <span className="-translate-y-2.5 font-display text-[230px] leading-[0.8] max-md:text-[110px]">T</span>
          <span className="absolute bottom-[25px] font-mono text-[10px] font-medium">01 / 26</span>
        </div>

        <p className="absolute bottom-[34px] left-[7.1%] font-mono text-[9px] font-medium text-muted max-md:bottom-[30px] max-md:left-[7%]">
          <span className="text-accent">01</span> / Technology, thoughtfully applied
        </p>
      </section>

      <section id="services" className="px-[14%] py-[100px] max-md:px-[8%] max-md:py-[72px]">
        <SectionHeading label="What we do" title="From a first idea to the infrastructure behind it." />
        <div className="grid grid-cols-1 border-t border-line sm:grid-cols-2 md:grid-cols-3">
          {services.map((service, index) => {
            const column = index % 3;
            return (
              <article
                key={service._id || service.code}
                className={`min-h-[190px] border-b border-line py-6 pr-4 sm:pr-6 ${
                  column !== 2 ? 'md:border-r md:border-line' : ''
                } ${column !== 0 ? 'md:pl-7' : ''} ${index % 2 === 1 ? 'sm:border-l sm:border-line sm:pl-4' : ''}`}
              >
                <span className="font-mono text-[10px] font-medium text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 className="mb-2.5 mt-6 font-display text-[19px] font-semibold">{service.title}</h3>
                <p className="max-w-[350px] text-[13px] leading-[1.7] text-muted">{service.description}</p>
              </article>
            );
          })}
        </div>
      </section>

      <section id="work" className="bg-ink px-[14%] py-[100px] text-paper max-md:px-[8%] max-md:py-[72px]">
        <SectionHeading
          tone="light"
          label="Selected work"
          title="Local insight. Serious engineering."
          copy="We partner with organisations across Zambia to make complex technology useful, reliable, and ready to grow."
        />
        <div className="border-t border-line-dark">
          {projects.length ? (
            projects.map((project, index) => (
              <article
                key={project._id}
                className="grid grid-cols-[30px_1fr_18px] items-start gap-3 border-b border-line-dark py-7 md:grid-cols-[52px_1fr_24px] md:gap-5"
              >
                <span className="font-mono text-[10px] font-medium text-accent">
                  {String(index + 1).padStart(2, '0')}
                </span>
                <div>
                  {project.coverImageUrl ? (
                    <Image
                      src={project.coverImageUrl}
                      alt={project.title}
                      width={480}
                      height={270}
                      unoptimized
                      className="mb-4 h-auto w-full max-w-[440px] rounded-sm object-contain"
                    />
                  ) : null}
                  <p className="font-mono text-[10px] font-medium uppercase text-blush">{project.tag}</p>
                  <h3 className="my-2 font-display text-[23px] font-semibold">{project.title}</h3>
                  <p className="max-w-[560px] text-[13px] leading-[1.7] text-mist">{project.description}</p>
                </div>
                <span className="text-lg text-blush" aria-hidden="true">↗</span>
              </article>
            ))
          ) : (
            <p className="py-6 text-[14px] text-mist">
              {connected
                ? 'Project stories are being prepared.'
                : 'Project stories will return once the content database is connected.'}
            </p>
          )}
        </div>
      </section>

      <section id="team" className="px-[14%] py-[100px] max-md:px-[8%] max-md:py-[72px]">
        <SectionHeading label="The people behind the work" title="Meet the team." />
        {team.length ? (
          <div className="grid grid-cols-1 gap-9 sm:grid-cols-2 sm:gap-8 lg:gap-10">
            {team.map((member) => {
              const memberNetworks = [
                { href: member.facebookUrl || '#', label: 'Facebook', Icon: FacebookIcon },
                { href: member.githubUrl || '#', label: 'GitHub', Icon: GitHubIcon },
                { href: member.linkedinUrl || '#', label: 'LinkedIn', Icon: LinkedInIcon },
                { href: whatsappHref(member.whatsappUrl) || '#', label: 'WhatsApp', Icon: WhatsAppIcon },
              ];

              return (
                <article key={member._id} className="border-t border-line pt-5">
                  <div className="relative aspect-square w-full overflow-hidden bg-sage">
                    {member.photoUrl ? (
                      <Image
                        src={member.photoUrl}
                        alt={member.name}
                        fill
                        sizes="(min-width: 640px) 50vw, 100vw"
                        unoptimized
                        className="h-full w-full object-contain"
                      />
                    ) : (
                      <span className="absolute inset-0 grid place-items-center font-display text-6xl font-semibold text-ink">
                        {initials(member.name)}
                      </span>
                    )}
                  </div>

                  <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
                    <div className="min-w-0 flex-1">
                      <h3 className="truncate font-display text-[19px] font-semibold">{member.name}</h3>
                      <p className="truncate font-mono text-[10px] font-medium uppercase text-accent-dark">{member.role}</p>
                    </div>
                    {memberNetworks.length > 0 && (
                      <div className="flex shrink-0 items-center gap-2">
                        {memberNetworks.map(({ href, label, Icon }) => (
                          <a
                            key={label}
                            href={href}
                            target={href === '#' ? undefined : '_blank'}
                            rel="noreferrer"
                            aria-label={`${member.name} on ${label}`}
                            title={label}
                            className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                          >
                            <Icon className="h-[14px] w-[14px]" />
                          </a>
                        ))}
                      </div>
                    )}
                  </div>

                  {member.bio && <p className="mt-3 text-[13px] leading-[1.7] text-muted">{member.bio}</p>}
                </article>
              );
            })}
          </div>
        ) : (
          <p className="text-[14px] text-muted">Our team profiles will appear here soon.</p>
        )}
      </section>

      <section
        id="contact"
        className="grid gap-9 bg-sage px-[14%] py-[92px] md:grid-cols-2 md:gap-[10%] max-md:px-[8%] max-md:py-[72px]"
      >
        <div>
          <Eyebrow>Have a challenge in mind?</Eyebrow>
          <h2 className="max-w-[720px] font-display text-[clamp(32px,4.4vw,56px)] font-semibold leading-[1.12]">
            Let&apos;s make it work.
          </h2>
          <p className="mt-5 max-w-[390px] text-[15px] leading-[1.7] text-muted">
            Tell us what you need. We&apos;ll get back to you and work out the right next step together.
          </p>
          <div className="mt-6 grid gap-3 text-[13px]">
            <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-3 font-bold text-ink">
              <MailIcon className="h-4 w-4 text-accent" />
              {settings.contactEmail}
            </a>
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 text-muted transition-colors hover:text-ink"
              >
                <WhatsAppIcon className="h-4 w-4 text-accent" />
                WhatsApp {settings.contactPhone}
              </a>
            )}
            <a href={`tel:${settings.contactPhone.replace(/\s/g, '')}`} className="flex items-center gap-3 text-muted transition-colors hover:text-ink">
              <PhoneIcon className="h-4 w-4 text-accent" />
              {settings.contactPhone}
            </a>
            <p className="flex items-start gap-3 text-muted">
              <PinIcon className="mt-0.5 h-4 w-4 shrink-0 text-accent" />
              <span className="max-w-[390px] leading-[1.7]">{settings.address}</span>
            </p>
          </div>
        </div>
        <EnquiryForm />
      </section>

      <footer className="flex items-center justify-between gap-7 border-t border-line px-[7.1%] py-6 max-md:flex-col max-md:items-start max-md:px-[8%]">
        <a href="#top" className="flex items-center gap-1.5 font-display text-[15px] font-extrabold">
          <span className="flex items-center">
            <span
              aria-hidden="true"
              className="grid h-6 w-6 shrink-0 place-items-center rounded-[3px] bg-ink font-display text-[13px] font-extrabold leading-none text-accent"
            >
              T
            </span>
            RAMO
          </span>
          <span className="font-mono text-[9px] font-medium text-muted">TECHNOLOGIES</span>
        </a>
        <div className="flex flex-wrap items-center gap-3">
            {whatsappUrl && (
              <a
                href={whatsappUrl}
                target="_blank"
                rel="noreferrer"
                aria-label="WhatsApp"
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
              >
                <WhatsAppIcon className="h-[15px] w-[15px]" />
              </a>
            )}
            {settings.contactPhone && (
              <a
                href={`tel:${settings.contactPhone.replace(/\s/g, '')}`}
                aria-label="Call"
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
              >
                <PhoneIcon className="h-[14px] w-[14px]" />
              </a>
            )}
            {(
              [
                { href: settings.facebookUrl || '#', label: 'Facebook', Icon: FacebookIcon },
                { href: settings.githubUrl || '#', label: 'GitHub', Icon: GitHubIcon },
                { href: settings.linkedinUrl || '#', label: 'LinkedIn', Icon: LinkedInIcon },
              ]
            ).map(({ href, label, Icon }) => (
              <a
                key={label}
                href={href}
                target={href === '#' ? undefined : '_blank'}
                rel="noreferrer"
                aria-label={label}
                title={label}
                className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
              >
                <Icon className="h-[15px] w-[15px]" />
              </a>
            ))}
            <a
              href={`mailto:${settings.contactEmail}`}
              aria-label="Email"
              className="grid h-9 w-9 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
            >
              <MailIcon className="h-[14px] w-[14px]" />
            </a>
            <p className="ml-2 text-[11px] text-muted">
              © {new Date().getFullYear()} TRAMO Technologies · Lusaka, Zambia
            </p>
        </div>
      </footer>
    </main>
  );
}
