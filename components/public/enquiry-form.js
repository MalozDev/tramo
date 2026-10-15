'use client';

import { useEffect, useRef, useState } from 'react';

const inputClass =
  'w-full min-w-0 rounded-sm border border-line bg-white px-3.5 py-3 text-[13px] text-ink outline-none transition-[border-color,box-shadow] placeholder:text-[#9aa5a1] focus:border-accent focus:shadow-[0_0_0_3px_rgba(215,81,50,0.14)]';
const labelClass = 'grid gap-1.5';

function FieldLabel({ children, required }) {
  return (
    <span className="text-[11px] font-medium uppercase tracking-[0.08em] text-muted">
      {children}
      {required && <span className="text-accent"> *</span>}
    </span>
  );
}

export default function EnquiryForm() {
  const [status, setStatus] = useState('idle');
  const [message, setMessage] = useState('');
  const [popupOpen, setPopupOpen] = useState(false);
  const doneButton = useRef(null);

  useEffect(() => {
    if (!popupOpen) return undefined;
    function onKeyDown(event) {
      if (event.key === 'Escape') setPopupOpen(false);
    }
    document.body.style.overflow = 'hidden';
    window.addEventListener('keydown', onKeyDown);
    doneButton.current?.focus();
    return () => {
      document.body.style.overflow = '';
      window.removeEventListener('keydown', onKeyDown);
    };
  }, [popupOpen]);

  async function submit(event) {
    event.preventDefault();
    setStatus('sending');
    setMessage('');
    const form = event.currentTarget;
    const payload = Object.fromEntries(new FormData(form).entries());
    const response = await fetch('/api/public/enquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const result = await response.json();
    if (!response.ok) {
      setStatus('error');
      setMessage(result.error || 'We could not send your message. Please try again.');
      return;
    }
    form.reset();
    setStatus('success');
    setPopupOpen(true);
  }

  function startOver() {
    setPopupOpen(false);
    setStatus('idle');
    setMessage('');
  }

  if (status === 'success') {
    return (
      <>
        <div className="rounded-sm border border-[#b9cdbf] bg-white/80 p-8 text-center">
        <span className="mx-auto mb-4 grid h-11 w-11 place-items-center rounded-full bg-[#e2eee6] text-[#276647]">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m4 12.5 5 5L20 6.5" />
          </svg>
        </span>
        <p className="font-display text-lg font-semibold text-ink">Your message is on its way.</p>
        <p className="mx-auto mt-2 max-w-xs text-[12px] leading-[1.7] text-muted">
          We&apos;ll come back to you with feedback in less than 24 hours.
        </p>
        <button
          type="button"
          onClick={startOver}
          className="mt-6 inline-flex min-h-[42px] items-center justify-center border border-ink px-5 text-[12px] font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
        >
          Send another message
        </button>
        </div>
        <QuotePopup
          open={popupOpen}
          onClose={() => setPopupOpen(false)}
          onRestart={startOver}
          doneButton={doneButton}
        />
      </>
    );
  }

  return (
    <>
    <form className="rounded-sm border border-line bg-white/55 p-6 sm:p-8" onSubmit={submit}>
      <p className="mb-6 font-mono text-[10px] font-medium uppercase text-accent-dark">Request a quotation</p>

      <div className="grid gap-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            <FieldLabel required>Your name</FieldLabel>
            <input name="name" autoComplete="name" required maxLength={120} placeholder="Jane Banda" className={inputClass} />
          </label>
          <label className={labelClass}>
            <FieldLabel>Email address</FieldLabel>
            <input name="email" type="email" autoComplete="email" maxLength={254} placeholder="jane@company.co.zm" className={inputClass} />
          </label>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <label className={labelClass}>
            <FieldLabel>Phone</FieldLabel>
            <input name="phone" type="tel" autoComplete="tel" maxLength={80} placeholder="+260 …" className={inputClass} />
          </label>
          <label className={labelClass}>
            <FieldLabel>Company</FieldLabel>
            <input name="company" autoComplete="organization" maxLength={160} placeholder="Company name" className={inputClass} />
          </label>
        </div>

        <label className={labelClass}>
          <FieldLabel required>What are you looking to build?</FieldLabel>
          <textarea
            name="message"
            rows={5}
            maxLength={5000}
            placeholder="A short description of the system, network, or software you need — and any timeline."
            className={`${inputClass} resize-y`}
          />
        </label>

        <label aria-hidden="true" className="absolute -left-[10000px] h-px w-px overflow-hidden">
          Website
          <input name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {message && (
        <p role="alert" className="mt-4 text-[12px] text-[#b3261e]">
          {message}
        </p>
      )}

      <button
        type="submit"
        disabled={status === 'sending'}
        className="mt-6 inline-flex min-h-[46px] w-full items-center justify-center gap-2.5 border border-ink bg-ink px-6 text-[12px] font-semibold text-paper transition-colors hover:border-accent-dark hover:bg-accent-dark disabled:cursor-wait disabled:opacity-60 sm:w-auto"
      >
        {status === 'sending' ? 'Sending…' : 'Send enquiry'}
        <span aria-hidden="true">↗</span>
      </button>
      </form>
      <QuotePopup
        open={popupOpen}
        onClose={() => setPopupOpen(false)}
        onRestart={startOver}
        doneButton={doneButton}
      />
      </>
  );
}

function QuotePopup({ open, onClose, onRestart, doneButton }) {
  if (!open) return null;

  return (
    <div
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onClose();
      }}
      className="fixed inset-0 z-50 grid place-items-center bg-ink/65 p-5"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="quote-popup-title"
        aria-describedby="quote-popup-copy"
        className="w-[min(100%,470px)] border border-line bg-paper p-7 text-left shadow-[0_28px_70px_rgba(20,36,38,0.32)] sm:p-8"
      >
        <span className="grid h-11 w-11 place-items-center rounded-full bg-ink text-accent">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="m4 12.5 5 5L20 6.5" />
          </svg>
        </span>

        <p className="mt-5 font-mono text-[10px] font-medium uppercase text-accent-dark">Quotation request received</p>
        <h2 id="quote-popup-title" className="mt-2 font-display text-[26px] font-semibold leading-[1.15] text-ink">
          Thanks — we&apos;ve got it.
        </h2>
        <p id="quote-popup-copy" className="mt-3 text-[13px] leading-[1.75] text-muted">
          Your request is with our team. <strong className="font-semibold text-ink">You&apos;ll get feedback in less than 24 hours</strong>{' '}
          — we&apos;ll reply by email, phone, or WhatsApp using the details you sent.
        </p>

        <div className="mt-5 flex items-center gap-3 border-t border-line pt-4">
          <span className="font-mono text-[10px] font-medium uppercase text-muted">Need it sooner?</span>
          <a
            href="#contact"
            onClick={onClose}
            className="text-[12px] font-bold text-accent-dark underline underline-offset-4"
          >
            Call or WhatsApp us
          </a>
        </div>

        <div className="mt-6 flex flex-col gap-2.5 sm:flex-row">
          <button
            ref={doneButton}
            type="button"
            onClick={onClose}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center border border-ink bg-ink px-5 text-[12px] font-semibold text-paper transition-colors hover:border-accent-dark hover:bg-accent-dark"
          >
            Done
          </button>
          <button
            type="button"
            onClick={onRestart}
            className="inline-flex min-h-[44px] flex-1 items-center justify-center border border-ink px-5 text-[12px] font-semibold text-ink transition-colors hover:bg-ink hover:text-paper"
          >
            Send another request
          </button>
        </div>
      </div>
    </div>
  );
}
