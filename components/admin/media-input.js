'use client';

import { useRef, useState } from 'react';
import Image from 'next/image';

const ACCEPT = 'image/jpeg,image/png,image/webp,image/gif,image/avif';
const uploadButtonClass =
  'inline-flex min-h-[38px] items-center justify-center border border-ink bg-transparent px-4 text-[12px] font-semibold text-ink transition-colors hover:bg-ink hover:text-paper disabled:cursor-wait disabled:opacity-60';

function adminUrlOf(value) {
  return value?.startsWith('/api/media/') ? value.replace('/api/media/', '/api/admin/media/') : null;
}

export default function MediaInput({ label, value, onChange, hint }) {
  const inputRef = useRef(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function upload(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      const body = new FormData();
      body.append('file', file);
      const response = await fetch('/api/admin/media', { method: 'POST', body });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Upload failed.');
        return;
      }
      const previous = adminUrlOf(value);
      if (previous) fetch(previous, { method: 'DELETE' }).catch(() => {});
      onChange(result.data.url);
    } catch {
      setError('Unable to reach the server. Try again.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  async function clear() {
    const stored = adminUrlOf(value);
    setBusy(true);
    if (stored) {
      try {
        await fetch(stored, { method: 'DELETE' });
      } catch {
        // The field still clears locally; a failed delete only leaves an orphan blob.
      }
    }
    setBusy(false);
    onChange('');
  }

  return (
    <div className="grid gap-2">
      <span className="text-[11px] text-muted">{label}</span>

      {value ? (
        <div className="flex items-start gap-3">
          <Image
            src={value}
            alt=""
            width={112}
            height={80}
            unoptimized
            className="h-20 w-28 shrink-0 rounded-sm border border-line bg-white object-cover"
          />
          <div className="grid gap-2">
            <button type="button" className={uploadButtonClass} disabled={busy} onClick={() => inputRef.current?.click()}>
              {busy ? 'Working…' : 'Replace image'}
            </button>
            <button
              type="button"
              disabled={busy}
              onClick={clear}
              className="text-left text-[12px] font-semibold text-[#b3261e] hover:underline disabled:opacity-50"
            >
              Remove image
            </button>
          </div>
        </div>
      ) : (
        <button type="button" className={uploadButtonClass} disabled={busy} onClick={() => inputRef.current?.click()}>
          {busy ? 'Uploading…' : 'Upload image'}
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={ACCEPT}
        onChange={upload}
        tabIndex={-1}
        className="sr-only"
        aria-label={label}
      />
      {hint && <span className="text-[10px] text-muted">{hint}</span>}
      {error && (
        <p role="alert" className="m-0 text-[11px] text-[#b3261e]">
          {error}
        </p>
      )}
    </div>
  );
}
