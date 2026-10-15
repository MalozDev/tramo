'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import MediaInput from './media-input';

function formatDate(value) {
  if (!value) return '—';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '—';
  return date.toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' });
}

const STATUS_OPTIONS = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'converted', label: 'Converted' },
  { value: 'closed', label: 'Closed' },
];

const RESOURCES = {
  services: {
    title: 'Services',
    eyebrow: 'Public website',
    hint: 'The service cards shown in the services section of the landing page.',
    endpoint: '/api/admin/services',
    singular: 'service',
    visibility: false,
    columns: [
      { label: 'Title', get: (item) => item.title, primary: true },
      { label: 'Code', get: (item) => item.code },
      { label: 'Order', get: (item) => item.displayOrder ?? 0 },
    ],
    fields: [
      { name: 'code', label: 'Code', required: true, maxLength: 60, hint: 'Short label used in the design, e.g. SOFTWARE.' },
      { name: 'title', label: 'Title', required: true, maxLength: 160 },
      { name: 'description', label: 'Description', type: 'textarea', maxLength: 2000 },
      { name: 'icon', label: 'Icon key', maxLength: 60 },
      { name: 'displayOrder', label: 'Display order', type: 'number' },
    ],
  },
  projects: {
    title: 'Projects',
    eyebrow: 'Public website',
    hint: 'Case studies shown in the “Selected work” section of the landing page.',
    endpoint: '/api/admin/projects',
    singular: 'project',
    visibility: true,
    columns: [
      { label: 'Title', get: (item) => item.title, primary: true },
      { label: 'Tag', get: (item) => item.tag },
      { label: 'Visibility', get: (item) => (item.published ? 'Published' : 'Draft') },
    ],
    fields: [
      { name: 'title', label: 'Title', required: true, maxLength: 200 },
      { name: 'tag', label: 'Tag', required: true, maxLength: 60, hint: 'Section label, e.g. SOFTWARE.' },
      { name: 'client', label: 'Client / sector', maxLength: 200 },
      { name: 'description', label: 'Summary', type: 'textarea', maxLength: 4000 },
      { name: 'problem', label: 'Problem', type: 'textarea', maxLength: 6000 },
      { name: 'solution', label: 'Solution', type: 'textarea', maxLength: 6000 },
      { name: 'technologies', label: 'Technologies', type: 'tags', hint: 'Comma separated, e.g. React, Node.js, PostgreSQL.' },
      { name: 'tramoRole', label: 'TRAMO role', type: 'textarea', maxLength: 2000 },
      { name: 'results', label: 'Results', type: 'textarea', maxLength: 4000 },
      { name: 'coverImageUrl', label: 'Cover photo', type: 'media', hint: 'Displayed in the Selected work section of the landing page.' },
      { name: 'displayOrder', label: 'Display order', type: 'number' },
      { name: 'published', label: 'Published on website', type: 'checkbox', default: true },
    ],
  },
  team: {
    title: 'Team',
    eyebrow: 'Public website',
    hint: 'Profiles shown in the team section of the landing page.',
    endpoint: '/api/admin/team',
    singular: 'team member',
    visibility: true,
    columns: [
      { label: 'Name', get: (item) => item.name, primary: true },
      { label: 'Role', get: (item) => item.role },
      { label: 'Visibility', get: (item) => (item.published ? 'Published' : 'Draft') },
    ],
    fields: [
      { name: 'name', label: 'Name', required: true, maxLength: 120 },
      { name: 'role', label: 'Role', required: true, maxLength: 120 },
      { name: 'bio', label: 'Bio', type: 'textarea', maxLength: 2000 },
      { name: 'photoUrl', label: 'Photo', type: 'media', hint: 'Square (1:1) portrait shown in the team section — the full image is displayed uncropped.' },
      { name: 'linkedinUrl', label: 'LinkedIn URL', maxLength: 500, hint: 'Full URL, or # as a placeholder.' },
      { name: 'facebookUrl', label: 'Facebook URL', maxLength: 500, hint: 'Full URL, or # as a placeholder.' },
      { name: 'githubUrl', label: 'GitHub URL', maxLength: 500, hint: 'Full URL, or # as a placeholder.' },
      { name: 'whatsappUrl', label: 'WhatsApp', maxLength: 500, hint: 'Phone number (e.g. +260 97…) or a full wa.me link.' },
      { name: 'displayOrder', label: 'Display order', type: 'number' },
      { name: 'published', label: 'Published on website', type: 'checkbox', default: true },
    ],
  },
  enquiries: {
    title: 'Enquiries',
    eyebrow: 'Inbox',
    hint: 'Messages sent through the contact form on the landing page, newest first.',
    endpoint: '/api/admin/enquiries',
    singular: 'enquiry',
    readOnly: true,
    detail: true,
    columns: [
      { label: 'From', get: (item) => item.name, primary: true },
      { label: 'Received', get: (item) => formatDate(item.createdAt) },
      { label: 'Status', get: (item) => (item.status === 'new' ? '● New' : item.status || 'new') },
    ],
    fields: [],
  },
  contact: {
    title: 'Contact',
    eyebrow: 'Public website',
    hint: 'Contact details shown in the contact section and footer of the landing page.',
    isSettings: true,
  },
  users: {
    title: 'Admin users',
    eyebrow: 'Access',
    hint: 'Accounts that can sign in to this console. Passwords are stored hashed and are never shown.',
    endpoint: '/api/admin/users',
    singular: 'admin user',
    visibility: false,
    columns: [
      { label: 'Email', get: (item) => item.email, primary: true },
      { label: 'Name', get: (item) => item.name || '—' },
      { label: 'Status', get: (item) => (item.active === false ? 'Disabled' : 'Active') },
    ],
    fields: [
      { name: 'email', label: 'Email', type: 'email', required: true, maxLength: 254 },
      { name: 'name', label: 'Name', maxLength: 120 },
      {
        name: 'password',
        label: 'Password',
        type: 'password',
        required: true,
        maxLength: 200,
        hint: 'At least 8 characters. Leave it empty when editing to keep the current password.',
      },
      { name: 'active', label: 'Can sign in', type: 'checkbox', default: true },
    ],
  },
};

const btnPrimary =
  'inline-flex min-h-[42px] items-center justify-center border border-ink bg-ink px-4 text-[12px] font-semibold text-paper transition-colors hover:border-accent-dark hover:bg-accent-dark disabled:cursor-wait disabled:opacity-60';
const btnSecondary =
  'inline-flex min-h-[42px] items-center justify-center border border-ink bg-transparent px-4 text-[12px] font-semibold text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-wait disabled:opacity-60';
const fieldClass =
  'w-full min-w-0 rounded-sm border border-line bg-white px-3 py-2.5 text-[13px] text-ink outline-none transition-colors focus:border-accent';
const labelClass = 'grid gap-1.5 text-[11px] text-muted';

function toValues(fields, item) {
  const values = {};
  for (const field of fields) {
    const stored = item ? item[field.name] : undefined;
    if (field.type === 'tags') values[field.name] = Array.isArray(stored) ? stored.join(', ') : '';
    else if (field.type === 'checkbox') values[field.name] = stored ?? field.default ?? false;
    else values[field.name] = stored ?? '';
  }
  return values;
}

function buildPayload(fields, values, fallbackOrder) {
  const payload = {};
  for (const field of fields) {
    const value = values[field.name];
    if (field.type === 'checkbox') {
      payload[field.name] = Boolean(value);
      continue;
    }
    if (field.type === 'tags') {
      payload[field.name] = String(value || '')
        .split(',')
        .map((entry) => entry.trim())
        .filter(Boolean);
      continue;
    }
    if (field.type === 'number') {
      const parsed = Number(value);
      payload[field.name] = Number.isFinite(parsed) && value !== '' ? parsed : fallbackOrder;
      continue;
    }
    payload[field.name] = typeof value === 'string' ? value.trim() : value;
  }
  return payload;
}

function EditDialog({ definition, item, pending, error, onCancel, onSave }) {
  const [values, setValues] = useState(() => toValues(definition.fields, item));

  function update(name, value) {
    setValues((current) => ({ ...current, [name]: value }));
  }

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 grid place-items-start justify-center overflow-y-auto bg-ink/65 p-5 py-10"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onCancel();
      }}
    >
      <form
        className="grid w-[min(100%,580px)] gap-4 border border-line bg-paper p-6"
        onSubmit={(event) => {
          event.preventDefault();
          onSave(values);
        }}
      >
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">
            {item ? `Edit ${definition.singular}` : `Add ${definition.singular}`}
          </h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onCancel}
            className="grid h-8 w-8 place-items-center text-2xl leading-none text-muted hover:text-ink"
          >
            ×
          </button>
        </div>

        {definition.fields.map((field) => {
          if (field.type === 'checkbox') {
            return (
              <label key={field.name} className="flex items-center gap-2.5 text-[12px] text-ink">
                <input
                  type="checkbox"
                  checked={Boolean(values[field.name])}
                  onChange={(event) => update(field.name, event.target.checked)}
                  className="h-4 w-4 accent-[#d75132]"
                />
                {field.label}
              </label>
            );
          }
          if (field.type === 'media') {
            return (
              <div className={labelClass} key={field.name}>
                <MediaInput
                  label={field.label}
                  hint={field.hint}
                  value={values[field.name]}
                  onChange={(next) => update(field.name, next)}
                />
              </div>
            );
          }
          return (
            <label className={labelClass} key={field.name}>
              {field.label}
              {field.type === 'textarea' ? (
                <textarea
                  rows={4}
                  maxLength={field.maxLength}
                  value={values[field.name]}
                  onChange={(event) => update(field.name, event.target.value)}
                  className={`${fieldClass} resize-y`}
                />
              ) : (
                <input
                  type={
                    field.type === 'number'
                      ? 'number'
                      : field.type === 'password'
                        ? 'password'
                        : field.type === 'email'
                          ? 'email'
                          : 'text'
                  }
                  min={field.type === 'number' ? 0 : undefined}
                  required={field.required && (field.type !== 'password' || !item)}
                  autoComplete={field.type === 'password' ? 'new-password' : undefined}
                  maxLength={field.maxLength}
                  value={values[field.name]}
                  onChange={(event) => update(field.name, event.target.value)}
                  className={fieldClass}
                />
              )}
              {field.hint && <span className="text-[10px] text-muted">{field.hint}</span>}
            </label>
          );
        })}

        {error && (
          <p role="alert" className="m-0 text-[12px] text-[#b3261e]">
            {error}
          </p>
        )}

        <div className="mt-1 flex gap-2.5">
          <button type="submit" disabled={pending} className={btnPrimary}>
            {pending ? 'Saving…' : 'Save'}
          </button>
          <button type="button" disabled={pending} onClick={onCancel} className={btnSecondary}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  );
}

function EnquiryDialog({ item, pending, error, onCancel, onSaveStatus, onDelete }) {
  const [status, setStatus] = useState(item.status || 'new');
  const details = [
    ['Email', item.email || '—'],
    ['Phone', item.phone || '—'],
    ['Company', item.company || '—'],
    ['Received', formatDate(item.createdAt)],
    ...(Array.isArray(item.servicesNeeded) && item.servicesNeeded.length
      ? [['Interested in', item.servicesNeeded.join(', ')]]
      : []),
  ];

  return (
    <div
      role="presentation"
      className="fixed inset-0 z-50 grid place-items-start justify-center overflow-y-auto bg-ink/65 p-5 py-10"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !pending) onCancel();
      }}
    >
      <div className="grid w-[min(100%,580px)] gap-4 border border-line bg-paper p-6">
        <div className="flex items-center justify-between">
          <h2 className="font-display text-xl font-semibold">{item.name}</h2>
          <button
            type="button"
            aria-label="Close dialog"
            onClick={onCancel}
            className="grid h-8 w-8 place-items-center text-2xl leading-none text-muted hover:text-ink"
          >
            ×
          </button>
        </div>

        <dl className="grid gap-2 m-0">
          {details.map(([label, value]) => (
            <div className="flex gap-3 text-[12px]" key={label}>
              <dt className="w-24 shrink-0 text-muted">{label}</dt>
              <dd className="m-0 break-all text-ink">{value}</dd>
            </div>
          ))}
        </dl>

        <div className="border-t border-line pt-4">
          <p className="mb-1.5 font-mono text-[10px] uppercase text-muted">Message</p>
          <p className="m-0 whitespace-pre-wrap text-[13px] leading-[1.7] text-ink">
            {item.message?.trim() || 'No message was included.'}
          </p>
        </div>

        <label className={labelClass}>
          Status
          <select
            value={status}
            onChange={(event) => setStatus(event.target.value)}
            className={fieldClass}
          >
            {STATUS_OPTIONS.map((option) => (
              <option value={option.value} key={option.value}>
                {option.label}
              </option>
            ))}
          </select>
        </label>

        {error && (
          <p role="alert" className="m-0 text-[12px] text-[#b3261e]">
            {error}
          </p>
        )}

        <div className="mt-1 flex flex-wrap gap-2.5">
          <button type="button" disabled={pending} onClick={() => onSaveStatus(status)} className={btnPrimary}>
            {pending ? 'Saving…' : 'Save status'}
          </button>
          <button type="button" disabled={pending} onClick={onDelete} className={btnSecondary}>
            Delete enquiry
          </button>
        </div>
      </div>
    </div>
  );
}

function ContactEditor({ initialSettings }) {
  const [values, setValues] = useState(() => ({
    contactEmail: '',
    contactPhone: '',
    address: '',
    linkedinUrl: '',
    facebookUrl: '',
    githubUrl: '',
    whatsappUrl: '',
    ...initialSettings,
  }));
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  function update(name, value) {
    setSaved(false);
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function submit(event) {
    event.preventDefault();
    setSaving(true);
    setError('');
    setSaved(false);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contactEmail: values.contactEmail.trim(),
          contactPhone: values.contactPhone.trim(),
          address: values.address.trim(),
          linkedinUrl: (values.linkedinUrl || '').trim(),
          facebookUrl: (values.facebookUrl || '').trim(),
          githubUrl: (values.githubUrl || '').trim(),
          whatsappUrl: (values.whatsappUrl || '').trim(),
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Unable to save contact details.');
        return;
      }
      setSaved(true);
    } catch {
      setError('Unable to reach the server. Try again.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <form className="grid max-w-[560px] gap-4" onSubmit={submit}>
      <label className={labelClass}>
        Contact email
        <input
          type="email"
          required
          maxLength={254}
          value={values.contactEmail}
          onChange={(event) => update('contactEmail', event.target.value)}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Phone
        <input
          type="tel"
          maxLength={80}
          value={values.contactPhone || ''}
          onChange={(event) => update('contactPhone', event.target.value)}
          className={fieldClass}
        />
      </label>
      <label className={labelClass}>
        Address
        <textarea
          rows={3}
          maxLength={300}
          value={values.address || ''}
          onChange={(event) => update('address', event.target.value)}
          className={`${fieldClass} resize-y`}
        />
      </label>
      <div className="grid gap-4 sm:grid-cols-2">
        <label className={labelClass}>
          LinkedIn URL
          <input
            type="text"
            placeholder="https:// — or #"
            value={values.linkedinUrl || ''}
            onChange={(event) => update('linkedinUrl', event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          Facebook URL
          <input
            type="text"
            placeholder="https:// — or #"
            value={values.facebookUrl || ''}
            onChange={(event) => update('facebookUrl', event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          GitHub URL
          <input
            type="text"
            placeholder="https:// — or #"
            value={values.githubUrl || ''}
            onChange={(event) => update('githubUrl', event.target.value)}
            className={fieldClass}
          />
        </label>
        <label className={labelClass}>
          WhatsApp (company)
          <input
            type="text"
            placeholder="+260 972 336 313 or https://wa.me/…"
            value={values.whatsappUrl || ''}
            onChange={(event) => update('whatsappUrl', event.target.value)}
            className={fieldClass}
          />
          <span className="text-[10px] text-muted">Leave empty to use the contact phone number above.</span>
        </label>
        <p className="m-0 text-[10px] text-muted sm:col-span-2">
          Save # as a placeholder if the profile link does not exist yet — the icon still shows on the site.
        </p>
      </div>
      {error && (
        <p role="alert" className="m-0 text-[12px] text-[#b3261e]">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="m-0 text-[12px] text-[#276647]">
          Saved. The landing page picks this up on refresh.
        </p>
      )}
      <div className="mt-1 flex gap-2.5">
        <button type="submit" disabled={saving} className={btnPrimary}>
          {saving ? 'Saving…' : 'Save contact details'}
        </button>
      </div>
    </form>
  );
}

export default function AdminPanel({
  email,
  databaseReady,
  initialServices,
  initialProjects,
  initialTeam,
  initialEnquiries,
  initialSettings,
  initialUsers = [],
}) {
  const router = useRouter();
  const [tab, setTab] = useState('services');
  const [data, setData] = useState({
    services: initialServices,
    projects: initialProjects,
    team: initialTeam,
    enquiries: initialEnquiries,
    users: initialUsers,
  });
  const [dialog, setDialog] = useState(null);
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  const definition = RESOURCES[tab];
  const items = data[tab];
  const isSettings = Boolean(definition.isSettings);

  async function save(item, values) {
    setPending(true);
    setError('');
    try {
      const response = await fetch(item ? `${definition.endpoint}/${item._id}` : definition.endpoint, {
        method: item ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(definition.fields, values, items.length)),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Unable to save changes.');
        return false;
      }
      setData((current) => ({
        ...current,
        [tab]: item
          ? current[tab].map((entry) => (entry._id === item._id ? result.data : entry))
          : [...current[tab], result.data],
      }));
      return true;
    } catch {
      setError('Unable to reach the server. Try again.');
      return false;
    } finally {
      setPending(false);
    }
  }

  async function remove(item) {
    const label = definition.columns[0].get(item);
    if (!window.confirm(`Remove "${label}"? This cannot be undone.`)) return false;
    setPending(true);
    setError('');
    try {
      const response = await fetch(`${definition.endpoint}/${item._id}`, { method: 'DELETE' });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Unable to remove this entry.');
        return false;
      }
      setData((current) => ({ ...current, [tab]: current[tab].filter((entry) => entry._id !== item._id) }));
      return true;
    } catch {
      setError('Unable to reach the server. Try again.');
      return false;
    } finally {
      setPending(false);
    }
  }

  async function saveStatus(item, status) {
    setPending(true);
    setError('');
    try {
      const response = await fetch(`${definition.endpoint}/${item._id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Unable to update the status.');
        return false;
      }
      setData((current) => ({
        ...current,
        [tab]: current[tab].map((entry) => (entry._id === item._id ? result.data : entry)),
      }));
      return true;
    } catch {
      setError('Unable to reach the server. Try again.');
      return false;
    } finally {
      setPending(false);
    }
  }

  async function signOut() {
    await fetch('/api/auth/logout', { method: 'POST' });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-paper-dim md:grid md:grid-cols-[240px_1fr]">
      <aside className="flex flex-col gap-5 bg-ink px-5 py-5 text-paper md:sticky md:top-0 md:h-screen md:gap-8 md:py-6">
        <span className="flex items-center gap-1.5 font-display text-[15px] font-extrabold">
          TRAMO<span className="font-mono text-[9px] font-medium text-[#a6b5ae]">ADMIN</span>
        </span>
        <p className="font-mono text-[9px] font-medium uppercase text-blush">Content</p>
        <nav aria-label="Panel navigation" className="flex flex-wrap gap-1.5 md:grid md:gap-1">
          {Object.entries(RESOURCES).map(([key, resource]) => (
            <button
              key={key}
              type="button"
              aria-current={tab === key ? 'page' : undefined}
              onClick={() => {
                setTab(key);
                setError('');
              }}
              className={`rounded-sm px-3 py-1.5 text-left text-[12px] transition-colors ${
                tab === key ? 'bg-ink-soft text-white' : 'text-[#d0d7d3] hover:bg-ink-soft hover:text-white'
              }`}
            >
              {resource.title}
              {data[key] && (
                <span className="ml-2 text-[10px] text-[#8fa19a]">{data[key].length}</span>
              )}
            </button>
          ))}
        </nav>
        <div className="flex items-center justify-between gap-3 md:mt-auto md:grid md:gap-3">
          <span className="break-all text-[10px] text-[#aab9b2]">{email}</span>
          <button
            type="button"
            onClick={signOut}
            className="text-left text-[12px] font-semibold text-white hover:underline"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="p-6 md:p-14">
        <div className="mx-auto max-w-[1080px]">
          <div className="mb-9 flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="mb-2 font-mono text-[10px] font-medium uppercase text-accent-dark">{definition.eyebrow}</p>
              <h1 className="font-display text-4xl font-semibold">{definition.title}</h1>
              <p className="mt-2.5 max-w-xl text-[13px] text-muted">{definition.hint}</p>
            </div>
            {!isSettings && !definition.readOnly && (
              <button
                type="button"
                onClick={() => {
                  setError('');
                  setDialog({ item: null });
                }}
                className={btnPrimary}
              >
                Add {definition.singular} <span className="ml-2" aria-hidden="true">+</span>
              </button>
            )}
          </div>

          {!databaseReady && (
            <p className="mb-5 border-l-[3px] border-accent bg-[#f8e9e3] px-4 py-3 text-[12px] text-[#76321f]">
              MongoDB is not connected. Set MONGODB_URI in .env and restart the app.
            </p>
          )}
          {error && !dialog && (
            <p role="alert" className="mb-5 text-[12px] text-[#b3261e]">
              {error}
            </p>
          )}

          {isSettings ? (
            <ContactEditor initialSettings={initialSettings} />
          ) : items.length === 0 ? (
            <p className="border border-dashed border-line px-5 py-12 text-center text-[13px] text-muted">
              No {definition.title.toLowerCase()} added yet.
            </p>
          ) : (
            <div role="table" aria-label={definition.title} className="border-t border-line">
              <div
                role="row"
                className="hidden grid-cols-[1.2fr_1fr_.7fr_.6fr] gap-4 border-b border-line py-3 font-mono text-[10px] uppercase text-ink md:grid"
              >
                {definition.columns.map((column) => (
                  <span role="columnheader" key={column.label}>
                    {column.label}
                  </span>
                ))}
                <span role="columnheader">Actions</span>
              </div>

              {items.map((item) => (
                <div
                  role="row"
                  key={item._id}
                  className="grid gap-2 border-b border-line py-4 md:grid-cols-[1.2fr_1fr_.7fr_.6fr] md:items-center md:gap-4 md:py-3"
                >
                  {definition.columns.map((column, index) => (
                    <span
                      role="cell"
                      key={column.label}
                      className={`text-[12px] ${
                        index === 0 ? 'font-semibold text-ink' : 'text-muted'
                      }`}
                    >
                      {column.get(item)}
                    </span>
                  ))}
                  <span role="cell" className="flex gap-4 md:justify-start">
                    {definition.detail ? (
                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setDialog({ item, detail: true });
                        }}
                        className="text-[12px] font-semibold text-accent-dark hover:underline"
                      >
                        View
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setError('');
                          setDialog({ item });
                        }}
                        className="text-[12px] font-semibold text-accent-dark hover:underline"
                      >
                        Edit
                      </button>
                    )}
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => remove(item)}
                      className="text-[12px] font-semibold text-[#b3261e] hover:underline disabled:opacity-50"
                    >
                      Delete
                    </button>
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </main>

      {dialog &&
        (dialog.detail ? (
          <EnquiryDialog
            item={dialog.item}
            pending={pending}
            error={error}
            onCancel={() => {
              setDialog(null);
              setError('');
            }}
            onSaveStatus={async (status) => {
              const saved = await saveStatus(dialog.item, status);
              if (saved) setDialog(null);
            }}
            onDelete={async () => {
              const removed = await remove(dialog.item);
              if (removed) setDialog(null);
            }}
          />
        ) : (
          <EditDialog
            definition={definition}
            item={dialog.item}
            pending={pending}
            error={error}
            onCancel={() => {
              setDialog(null);
              setError('');
            }}
            onSave={async (values) => {
              const saved = await save(dialog.item, values);
              if (saved) setDialog(null);
            }}
          />
        ))}
    </div>
  );
}
