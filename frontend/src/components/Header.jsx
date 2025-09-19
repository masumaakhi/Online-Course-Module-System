//src/components/Header.jsx
import React, { useRef, useState } from "react";

// Drop this component anywhere in your React app.
// Requires Tailwind CSS. Looks best on a dark page background.
export default function Header() {
  return (
    <section className="relative isolate px-10 mx-auto max-w-full   lg:pt-12 lg:pb-28 text-white">
      {/* Rounded container with subtle border + glow */}
      <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 sm:p-12">
        {/* background accents */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-indigo-500/20 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />

        <div className="grid items-center gap-12 lg:grid-cols-2">
          {/* Left copy */}
          <div>
            <h1 className="text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl lg:text-6xl">
              <span className="block">Learn, Build,</span>
              <span className="block">Get Certified</span>
            </h1>

            <p className="mt-6 max-w-xl text-slate-300 text-lg leading-relaxed">
              Live batches, hands‑on projects, and career‑ready certificates — all in one immersive platform.
            </p>

            <div className="mt-10 flex flex-wrap items-center gap-4">
              <a
                href="#join"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold shadow-lg ring-1 ring-white/10 transition-transform hover:scale-[1.02] focus:outline-none focus-visible:ring-2 focus-visible:ring-sky-400 bg-gradient-to-tr from-sky-500 to-indigo-500"
              >
                Join Now
              </a>
              <a
                href="#courses"
                className="inline-flex items-center justify-center rounded-xl px-6 py-3 text-base font-semibold text-slate-200 shadow-inner ring-1 ring-white/15 transition hover:bg-white/5"
              >
                Browse Courses
              </a>
            </div>
          </div>

          {/* Right: floating skill tiles (gradient + tilted layout) */}
          <div className="relative mx-auto w-full max-w-md h-[22rem]">
            {/* glow behind tiles */}
            <div className="pointer-events-none absolute -inset-10 -z-10 rounded-[2rem] bg-[radial-gradient(60%_60%_at_70%_30%,rgba(56,189,248,0.18),rgba(99,102,241,0.18)_50%,transparent_70%)]" />

            {/* Staggered + tilted absolute layout */}
            <TiltBadge
              label="MERN"
              gradient="from-sky-400 via-blue-500 to-indigo-600"
              posClass="absolute left-0 top-2 -rotate-6 shadow-lg"
            />
            <TiltBadge
              label="UI/UX"
              gradient="from-cyan-400 via-sky-500 to-indigo-500"
              posClass="absolute right-[9px] top-[5rem] rotate-6"
            />
            <TiltBadge
              label="AI"
              gradient="from-fuchsia-400 via-purple-500 to-indigo-600"
              posClass="absolute left-[15rem] bottom-[17rem] -rotate-12"
            />
            <TiltBadge
              label="SQL"
              gradient="from-teal-400 via-emerald-500 to-cyan-500"
              posClass="absolute left-[15rem] bottom-[11rem] -rotate-3"
            />
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * Small 3D-tilt card for the skill badges
 */
function TiltBadge({ label, className = "", gradient = "from-slate-500 to-slate-800", posClass = "" }) {
  const ref = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0, hover: false });

  function onMove(e) {
    const el = ref.current;
    if (!el) return;
    const rect = el.getBoundingClientRect();
    const x = (e.clientX - rect.left) / rect.width; // 0 → 1
    const y = (e.clientY - rect.top) / rect.height; // 0 → 1
    const rotateY = (x - 0.5) * 16; // deg
    const rotateX = (0.5 - y) * 16; // deg
    setTilt({ x: rotateX, y: rotateY, hover: true });
  }

  function onLeave() {
    setTilt({ x: 0, y: 0, hover: false });
  }

  return (
    <div className={`relative ${posClass}`}>
      <div
        ref={ref}
        onMouseMove={onMove}
        onMouseLeave={onLeave}
        className={`group relative h-32 w-44 sm:w-48 select-none rounded-3xl bg-gradient-to-br ${gradient} px-7 py-6 text-center text-white shadow-[0_25px_80px_-35px_rgba(0,0,0,0.9)] ring-1 ring-white/15 backdrop-blur transition-transform duration-200 will-change-transform ${className}`}
        style={{
          transform: `perspective(800px) rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        {/* beveled edge + inner light */}
        <div className="pointer-events-none absolute inset-0 rounded-3xl bg-gradient-to-br from-white/10 to-transparent" />
        <div
          className={`pointer-events-none absolute inset-0 rounded-3xl bg-[radial-gradient(40%_40%_at_50%_15%,rgba(255,255,255,0.25),transparent_60%)] transition-opacity ${tilt.hover ? "opacity-100" : "opacity-0"}`}
        />

        <div className="relative grid h-full place-content-center">
          <span className="text-3xl font-extrabold tracking-widest drop-shadow-sm">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------
  Suggested tests (create as HeroBanner.test.jsx)
  These are examples using React Testing Library
---------------------------------------------
import { render, screen } from '@testing-library/react'
import HeroBanner from './HeroBanner'

test('renders main headline', () => {
  render(<HeroBanner />)
  expect(screen.getByText(/Learn, Build,/i)).toBeInTheDocument()
  expect(screen.getByText(/Get Certified/i)).toBeInTheDocument()
})

test('renders CTAs', () => {
  render(<HeroBanner />)
  expect(screen.getByRole('link', { name: /Join Now/i })).toBeInTheDocument()
  expect(screen.getByRole('link', { name: /Browse Courses/i })).toBeInTheDocument()
})

test('renders all skill badges', () => {
  render(<HeroBanner />)
  ;['MERN','UI/UX','AI','SQL'].forEach(txt => {
    expect(screen.getByText(txt)).toBeInTheDocument()
  })
})
*/
