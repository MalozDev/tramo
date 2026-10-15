'use client';

import { useEffect, useState } from 'react';
import { FacebookIcon, GitHubIcon, LinkedInIcon, MailIcon, PhoneIcon, WhatsAppIcon } from './icons';
import { whatsappHref } from '@/lib/social-links';

const SECTIONS = [
  { href: '#services', label: 'Services' },
  { href: '#work', label: 'Our work' },
  { href: '#team', label: 'Team' },
  { href: '#contact', label: 'Contact' },
];

export default function SiteHeader({
  linkedinUrl = '',
  facebookUrl = '',
  githubUrl = '',
  whatsappUrl = '',
  contactEmail = '',
  contactPhone = '',
}) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    function onKeyDown(event) {
      if (event.key === 'Escape') setOpen(false);
    }
    function onResize() {
      if (window.innerWidth >= 768) setOpen(false);
    }
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('resize', onResize);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);
    };
  }, []);

  useEffect(() => {
    if (!open) {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
      return undefined;
    }
    // lock scrolling without the page jumping when the scrollbar disappears
    const scrollbar = window.innerWidth - document.documentElement.clientWidth;
    document.body.style.overflow = 'hidden';
    if (scrollbar > 0) document.body.style.paddingRight = `${scrollbar}px`;
    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [open]);

  const whatsapp = whatsappHref(whatsappUrl) || whatsappHref(contactPhone);
  const tel = contactPhone ? `tel:${contactPhone.replace(/\s/g, '')}` : '';
  const mail = contactEmail ? `mailto:${contactEmail}` : '';

  const networks = [
    { href: whatsapp || '#', label: 'WhatsApp', Icon: WhatsAppIcon },
    { href: githubUrl || '#', label: 'GitHub', Icon: GitHubIcon },
    { href: linkedinUrl || '#', label: 'LinkedIn', Icon: LinkedInIcon },
    { href: facebookUrl || '#', label: 'Facebook', Icon: FacebookIcon },
    { href: tel || '#', label: 'Call us', Icon: PhoneIcon },
    { href: mail || '#', label: 'Email us', Icon: MailIcon },
  ];

  return (
    <header className="relative z-50 border-b border-line bg-paper">
      {/* ------------------------------------------------ header row:
          menu left · brand centered · quotation right — every screen size */}
      <div className="relative flex h-20 max-md:h-16 items-center justify-between gap-3 px-[7.1%] max-md:px-[5%]">
        {/* left: menu */}
        <div className="flex min-w-0 items-center justify-self-start">
          <button
            type="button"
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
            onClick={() => setOpen((current) => !current)}
            className="grid h-10 w-10 -ml-2 place-items-center md:hidden"
          >
            <span className="relative block h-[14px] w-6">
              <span
                className={`absolute left-0 top-0 h-[2px] w-6 bg-ink transition-transform duration-300 ease-out ${
                  open ? 'translate-y-[6px] rotate-45' : ''
                }`}
              />
              <span
                className={`absolute left-0 top-[6px] h-[2px] w-6 bg-ink transition-opacity duration-200 ${
                  open ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute left-0 top-[12px] h-[2px] w-6 bg-ink transition-transform duration-300 ease-out ${
                  open ? '-translate-y-[6px] -rotate-45' : ''
                }`}
              />
            </span>
          </button>

          <nav
            aria-label="Main navigation"
            className="hidden min-w-0 items-center gap-5 text-[12px] whitespace-nowrap text-muted md:flex lg:gap-8 lg:text-[13px]"
          >
            {SECTIONS.map((section) => (
              <a key={section.href} href={section.href} className="transition-colors hover:text-ink">
                {section.label}
              </a>
            ))}
          </nav>
        </div>

        {/* center: name pinned to the middle */}
        <a
          href="#top"
          aria-label="TRAMO home"
          className="absolute left-[calc(50%_-_25px)] top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center gap-1 whitespace-nowrap min-[360px]:gap-1.5"
        >
          <span className="font-display text-[11px] font-extrabold min-[360px]:text-[13px] min-[400px]:text-[15px]"><span className="text-accent">T</span><span className="text-ink">R</span><span className="text-accent-dark">A</span><span className="text-muted">M</span><span className="text-ink">O</span></span>
          <span className="font-mono text-[7px] font-medium text-muted min-[360px]:text-[8px] min-[400px]:text-[9px]">
            TECHNOLOGIES
          </span>
        </a>

        {/* right: quotation — styled as a button */}
        <a
          href="#contact"
          className="ml-auto whitespace-nowrap rounded-sm border border-accent px-1 py-1 text-[11px] font-semibold text-ink transition-colors hover:bg-accent hover:text-paper min-[360px]:px-2 min-[360px]:py-1.5 min-[400px]:text-[12px] sm:px-3 sm:py-2 sm:text-[13px]"
        >
          Send quotation
          <span className="ml-2 hidden text-accent sm:inline" aria-hidden="true">↗</span>
        </a>
      </div>

      {/* ------------------------------------------------ backdrop */}
      <div
        aria-hidden="true"
        onMouseDown={() => setOpen(false)}
        className={`fixed inset-0 z-40 bg-ink/55 transition-opacity duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] md:hidden ${
          open ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      />

      {/* ------------------------------------------------ menu: slides in from the left */}
      <nav
        id="site-menu"
        aria-label="Site menu"
        className={`fixed inset-0 z-50 flex w-full flex-col overflow-y-auto bg-paper pt-[env(safe-area-inset-top)] transition-[translate,transform,visibility] duration-[420ms] ease-[cubic-bezier(0.32,0.72,0,1)] will-change-[translate,transform] md:hidden ${
          open ? 'visible translate-x-0' : 'invisible -translate-x-full'
        }`}
      >
        <div className="flex h-16 shrink-0 items-center justify-between border-b border-line px-[7%]">
          <span className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="font-display text-[15px] font-extrabold"><span className="text-accent">T</span><span className="text-ink">R</span><span className="text-accent-dark">A</span><span className="text-muted">M</span><span className="text-ink">O</span></span>
            <span className="font-mono text-[9px] font-medium text-muted">TECHNOLOGIES</span>
          </span>
          <button
            type="button"
            aria-label="Close menu"
            onClick={() => setOpen(false)}
            className="grid h-9 w-9 place-items-center text-2xl leading-none text-muted hover:text-ink"
          >
            ×
          </button>
        </div>

        <ul className="grid px-[7%] pt-3">
          {SECTIONS.map((section, index) => (
            <li key={section.href} className="border-b border-line last:border-b-0">
              <a
                href={section.href}
                onClick={() => setOpen(false)}
                style={{ transitionDelay: open ? `${70 + index * 45}ms` : '0ms' }}
                className={`flex min-h-[68px] items-center justify-between gap-3 py-3 transition-[opacity,translate,transform,color] duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:text-accent ${
                  open ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'
                }`}
              >
                <span className="font-display text-[24px] font-semibold text-ink">{section.label}</span>
                <span className="font-mono text-[11px] text-muted" aria-hidden="true">↗</span>
              </a>
            </li>
          ))}
        </ul>

        <div className="mt-auto flex flex-col gap-5 px-[7%] pb-[max(28px,env(safe-area-inset-bottom))] pt-8">
            <a
            href="#contact"
            onClick={() => setOpen(false)}
            style={{ transitionDelay: open ? '260ms' : '0ms' }}
            className={`inline-flex min-h-[52px] items-center justify-center border border-ink bg-ink px-5 text-[13px] font-semibold text-paper transition-[opacity,translate,transform] duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)] hover:border-accent-dark hover:bg-accent-dark ${
              open ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'
            }`}
          >
              Send quotation
          </a>

          {networks.length > 0 && (
            <div
              className={`flex flex-wrap items-center gap-2 transition-[opacity,translate,transform] duration-[380ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
                open ? 'translate-x-0 opacity-100' : '-translate-x-3 opacity-0'
              }`}
              style={{ transitionDelay: open ? '320ms' : '0ms' }}
            >
              {networks.map(({ href, label, Icon }) => (
                <a
                  key={label}
                  href={href}
                  target={href.startsWith('mailto:') || href.startsWith('tel:') ? undefined : '_blank'}
                  rel="noreferrer"
                  aria-label={label}
                  title={label}
                  className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white text-ink transition-colors hover:border-ink hover:bg-ink hover:text-paper"
                >
                  <Icon className="h-[14px] w-[14px]" />
                </a>
              ))}
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
