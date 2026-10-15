'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';

const inputClass =
  'w-full rounded-sm border border-line bg-white px-3 py-2.5 text-[13px] text-ink outline-none transition-colors focus:border-accent';

export default function AdminLogin() {
  const router = useRouter();
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);
  const [setupAvailable, setSetupAvailable] = useState(false);
  const [setupEmail, setSetupEmail] = useState('');
  const [showSetup, setShowSetup] = useState(false);

  useEffect(() => {
    let active = true;
    fetch('/api/auth/setup')
      .then((response) => (response.ok ? response.json() : null))
      .then((result) => {
        if (active && result?.setupAvailable) {
          setSetupAvailable(true);
          setSetupEmail(result.email || '');
        }
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  async function submit(event, endpoint) {
    event.preventDefault();
    setPending(true);
    setError('');
    const formData = new FormData(event.currentTarget);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(Object.fromEntries(formData)),
      });
      const result = await response.json();
      if (!response.ok) {
        setError(result.error || 'Unable to sign in.');
        return;
      }
      router.refresh();
    } catch {
      setError('Unable to reach the server. Try again.');
    } finally {
      setPending(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-[linear-gradient(135deg,#f4f2ec_60%,#e4e7d9_60%)] p-6">
      <form
        className="grid w-[min(100%,420px)] gap-4 border border-line bg-paper p-9 max-md:p-7"
        onSubmit={(event) => submit(event, showSetup ? '/api/auth/setup' : '/api/auth/login')}
      >
        <span className="mb-8 flex items-center gap-2 font-display text-lg font-extrabold">
          TRAMO<span className="font-mono text-[9px] font-medium text-muted">ADMIN</span>
        </span>
        <p className="font-mono text-[10px] font-medium uppercase text-accent-dark">Private workspace</p>
        <h1 className="-mt-2 font-display text-[32px] font-semibold">{showSetup ? 'Create admin.' : 'Welcome back.'}</h1>

        {showSetup && (
          <>
            <label className="grid gap-1.5 text-[12px] text-muted">
              Name
              <input name="name" type="text" autoComplete="name" maxLength={120} className={inputClass} />
            </label>
            <label className="grid gap-1.5 text-[12px] text-muted">
              Admin email
              <input
                name="email"
                type="email"
                autoComplete="username"
                defaultValue={setupEmail}
                required
                className={inputClass}
              />
            </label>
            <label className="grid gap-1.5 text-[12px] text-muted">
              Setup token
              <input name="setupToken" type="password" autoComplete="off" required className={inputClass} />
            </label>
            <label className="grid gap-1.5 text-[12px] text-muted">
              Password
              <input
                name="password"
                type="password"
                autoComplete="new-password"
                minLength={12}
                required
                className={inputClass}
              />
            </label>
          </>
        )}

        {!showSetup && (
          <>
            <label className="grid gap-1.5 text-[12px] text-muted">
              Email address
              <input id="email" name="email" type="email" autoComplete="username" required className={inputClass} />
            </label>
            <label className="grid gap-1.5 text-[12px] text-muted">
              Password
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                className={inputClass}
              />
            </label>
          </>
        )}

        {error && (
          <p role="alert" className="m-0 text-[12px] text-[#b3261e]">
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={pending}
          className="mt-1 min-h-[42px] w-full border border-ink bg-ink px-4 text-[12px] font-semibold text-paper transition-colors hover:border-accent-dark hover:bg-accent-dark disabled:cursor-wait disabled:opacity-60"
        >
          {pending ? (showSetup ? 'Creating account…' : 'Signing in…') : showSetup ? 'Create admin account' : 'Sign in'}
        </button>
        {setupAvailable && (
          <button
            type="button"
            onClick={() => {
              setShowSetup(!showSetup);
              setError('');
            }}
            className="justify-self-center border-0 bg-transparent p-1 text-[12px] text-muted underline underline-offset-4 hover:text-ink"
          >
            {showSetup ? 'Back to sign in' : 'Set up first admin'}
          </button>
        )}
      </form>
    </main>
  );
}
