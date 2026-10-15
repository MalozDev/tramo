'use client';

import { useEffect, useState } from 'react';

const LEAD = 'Technology that moves ';
const HIGHLIGHT = 'business forward.';
const FULL = LEAD + HIGHLIGHT;
const TYPE_SPEED = 55;
const ERASE_SPEED = 35;
const HOLD_DURATION = 1800;
const RESET_PAUSE = 500;

/** Repeats the hero headline with a paced typewriter animation.
 *  - an invisible copy reserves the exact space, so nothing shifts while typing
 *  - a screen-reader copy keeps the full sentence available immediately
 *  - people who prefer reduced motion get the finished headline at once */
export default function TypingHeadline() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const reduced =
      typeof window.matchMedia === 'function' &&
      window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (reduced) {
      const show = window.setTimeout(() => setCount(FULL.length), 0);
      return () => window.clearTimeout(show);
    }
    let index = 0;
    let direction = 1;
    let timer;

    function advance() {
      index += direction;
      setCount(index);

      if (direction > 0 && index === FULL.length) {
        direction = -1;
        timer = window.setTimeout(advance, HOLD_DURATION);
        return;
      }

      if (direction < 0 && index === 0) {
        direction = 1;
        timer = window.setTimeout(advance, RESET_PAUSE);
        return;
      }

      timer = window.setTimeout(advance, direction > 0 ? TYPE_SPEED : ERASE_SPEED);
    }

    timer = window.setTimeout(advance, TYPE_SPEED);
    return () => window.clearTimeout(timer);
  }, []);

  const typed = FULL.slice(0, count);
  const typing = count < FULL.length;

  return (
    <span className="relative block">
      <span className="sr-only">{FULL}</span>
      <span className="invisible block" aria-hidden="true">
        {FULL}
      </span>
      <span className="absolute inset-0 block" aria-hidden="true">
        {typed.slice(0, LEAD.length)}
        <span className="text-accent">{typed.slice(LEAD.length)}</span>
        <span
          className={`ml-1 inline-block h-[0.62em] w-[4px] translate-y-[1px] bg-accent align-baseline ${
            typing ? 'animate-pulse' : 'opacity-0 transition-opacity duration-500'
          }`}
        />
      </span>
    </span>
  );
}
