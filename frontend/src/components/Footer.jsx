// import React from "react";
// export default function Footer() {
//   const year = new Date().getFullYear();
//   return (
//     <footer className="relative mx-auto max-w-[1440px] px-6 py-16 text-slate-200">
//       {" "}
//       <div className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 p-8 sm:p-12 shadow-[0_30px_100px_-40px_rgba(2,6,23,0.8)] backdrop-blur">
//         {" "}
//         {/* background accents */}{" "}
//         <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />{" "}
//         <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />{" "}
//         <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-white/10" />{" "}
//         {/* top grid */}{" "}
//         <div className="relative grid gap-10 lg:grid-cols-4">
//           {" "}
//           {/* Brand */}{" "}
//           <div className="lg:pr-10">
//             {" "}
//             <div className="flex items-center gap-4">
//               {" "}
//               <BrandLogo />{" "}
//               <span className="text-3xl font-extrabold tracking-tight text-white">
//                 SkillSync
//               </span>{" "}
//             </div>{" "}
//             <p className="mt-5 text-slate-300">Learn. Build. Get Certified.</p>{" "}
//             <a
//               href="mailto:support@skillsync.io"
//               className="mt-4 inline-block font-medium text-slate-200 hover:text-white"
//             >
//               {" "}
//               support@skillsync.io{" "}
//             </a>{" "}
//           </div>{" "}
//           {/* Divider */}{" "}
//           <div className="hidden lg:block lg:h-full lg:w-px lg:justify-self-center lg:bg-white/10" />{" "}
//           {/* Links */}{" "}
//           <div className="grid gap-10 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
//             {" "}
//             <NavGroup
//               title="Company"
//               items={[
//                 { label: "About Us", href: "#about" },
//                 { label: "Contact", href: "#contact" },
//               ]}
//             />{" "}
//             <NavGroup
//               title="Support"
//               items={[{ label: "FAQs", href: "#faqs" }]}
//             />{" "}
//             <div className="relative">
//               {" "}
//               {/* vertical divider on large */}{" "}
//               <div className="pointer-events-none absolute -left-6 top-0 hidden h-full w-px bg-white/10 lg:block" />{" "}
//               <h3 className="text-lg font-semibold text-white">Legal</h3>{" "}
//               <p className="mt-5 text-slate-300">Follow us</p>{" "}
//               <div className="mt-4 flex gap-3">
//                 {" "}
//                 <SocialButton
//                   label="Facebook"
//                   href="#"
//                   icon={IconFacebook}
//                 />{" "}
//                 <SocialButton label="YouTube" href="#" icon={IconYouTube} />{" "}
//                 <SocialButton label="Twitter" href="#" icon={IconTwitter} />{" "}
//               </div>{" "}
//             </div>{" "}
//           </div>{" "}
//         </div>{" "}
//         {/* bottom divider */}{" "}
//         <div className="relative my-10 h-px w-full bg-white/10" />{" "}
//         {/* bottom row */}{" "}
//         <div className="relative flex flex-col gap-6 sm:flex-row sm:items-center sm:justify-between">
//           {" "}
//           <div className="flex items-center gap-2 text-slate-300">
//             {" "}
//             <IconClock className="h-4 w-4" />{" "}
//             <span className="text-sm">© {year} SkillSync</span>{" "}
//           </div>{" "}
//           <nav
//             aria-label="secondary"
//             className="flex flex-wrap items-center gap-x-8 gap-y-3 text-sm text-slate-300"
//           >
//             {" "}
//             <a href="#cookies" className="transition hover:text-white">
//               Cookies
//             </a>{" "}
//             <a href="#sitemap" className="transition hover:text-white">
//               Sitemap
//             </a>{" "}
//           </nav>{" "}
//           <div className="flex items-center gap-2 text-sm text-slate-300">
//             {" "}
//             <IconGlobe className="h-4 w-4" />{" "}
//             <button className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1 ring-1 ring-white/10 transition hover:bg-white/10">
//               {" "}
//               EN{" "}
//               <svg
//                 xmlns="http://www.w3.org/2000/svg"
//                 viewBox="0 0 20 20"
//                 fill="currentColor"
//                 className="h-4 w-4 opacity-70"
//               >
//                 {" "}
//                 <path
//                   fillRule="evenodd"
//                   d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
//                   clipRule="evenodd"
//                 />{" "}
//               </svg>{" "}
//             </button>{" "}
//           </div>{" "}
//         </div>{" "}
//       </div>{" "}
//     </footer>
//   );
// }
// function BrandLogo() {
//   return (
//     <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-600 p-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_25px_80px_-35px_rgba(0,0,0,0.9)]">
//       {" "}
//       <div className="relative h-full w-full rounded-2xl bg-slate-950">
//         {" "}
//         <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(65%_80%_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />{" "}
//       </div>{" "}
//     </div>
//   );
// }
// function NavGroup({ title, items }) {
//   return (
//     <div>
//       {" "}
//       <h3 className="text-lg font-semibold text-white">{title}</h3>{" "}
//       <ul className="mt-5 space-y-3">
//         {" "}
//         {items.map((it) => (
//           <li key={it.label}>
//             {" "}
//             <a
//               href={it.href}
//               className="text-slate-300 transition hover:text-white"
//             >
//               {" "}
//               {it.label}{" "}
//             </a>{" "}
//           </li>
//         ))}{" "}
//       </ul>{" "}
//     </div>
//   );
// }
// function SocialButton({ label, href, icon: Icon }) {
//   return (
//     <a
//       aria-label={label}
//       href={href}
//       className="inline-flex items-center justify-center rounded-xl bg-slate-800/60 p-3 ring-1 ring-white/10 transition hover:bg-white/10"
//     >
//       {" "}
//       <Icon className="h-4 w-4" />{" "}
//     </a>
//   );
// }
// /* ------------------------- Icons (inline SVG) ------------------------- */ function IconFacebook({
//   className = "h-5 w-5",
// }) {
//   return (
//     <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
//       {" "}
//       <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.017 3.657 9.175 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.196 2.238.196v2.47h-1.261c-1.243 0-1.63.775-1.63 1.57v1.885h2.773l-.443 2.91h-2.33v7.03C18.343 21.235 22 17.077 22 12.06z" />{" "}
//     </svg>
//   );
// }
// function IconYouTube({ className = "h-5 w-5" }) {
//   return (
//     <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
//       {" "}
//       <path d="M23.5 7.21a3.2 3.2 0 00-2.25-2.27C19.1 4.5 12 4.5 12 4.5s-7.1 0-9.25.44A3.2 3.2 0 00.5 7.21 33.7 33.7 0 000 12a33.7 33.7 0 00.5 4.79 3.2 3.2 0 002.25 2.27C4.9 19.5 12 19.5 12 19.5s7.1 0 9.25-.44a3.2 3.2 0 002.25-2.27A33.7 33.7 0 0024 12a33.7 33.7 0 00-.5-4.79zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />{" "}
//     </svg>
//   );
// }
// function IconTwitter({ className = "h-5 w-5" }) {
//   return (
//     <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
//       {" "}
//       <path d="M21.54 7.2c.015.22.015.44.015.66 0 6.72-4.98 14.47-14.09 14.47-2.8 0-5.4-.83-7.58-2.26.39.047.765.062 1.17.062 2.32 0 4.45-.82 6.15-2.19a4.93 4.93 0 01-4.6-3.5c.3.047.6.078.915.078.435 0 .87-.062 1.275-.188a4.96 4.96 0 01-3.945-4.88v-.062c.66.38 1.44.61 2.265.645A4.97 4.97 0 012.1 5.7a14.06 14.06 0 0010.3 5.35 5.61 5.61 0 01-.12-1.13 4.94 4.94 0 018.55-3.39 9.7 9.7 0 003.13-1.26 4.97 4.97 0 01-2.17 2.76 9.87 9.87 0 002.86-.8 10.56 10.56 0 01-2.13 2.21z" />{" "}
//     </svg>
//   );
// }
// function IconGlobe({ className = "h-5 w-5" }) {
//   return (
//     <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
//       {" "}
//       <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm7.94 9h-3.11a15.5 15.5 0 00-1.04-5.03A8.03 8.03 0 0119.94 11zM12 4c.95 0 2.54 2.25 3.11 6H8.89C9.46 6.25 11.05 4 12 4zM6.21 6.97A15.5 15.5 0 005.17 11H2.06a8.03 8.03 0 014.15-4.03zM2.06 13h3.11c.2 1.75.67 3.5 1.51 5.03A8.03 8.03 0 012.06 13zm6.83 0h6.22c-.57 3.75-2.16 6-3.11 6s-2.54-2.25-3.11-6zm7.84 5.03A15.5 15.5 0 0016.83 13h3.11a8.03 8.03 0 01-4.15 5.03z" />{" "}
//     </svg>
//   );
// }
// function IconClock({ className = "h-5 w-5" }) {
//   return (
//     <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
//       {" "}
//       <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.75 5a.75.75 0 00-1.5 0v5.25c0 .2.08.39.22.53l3.75 3.75a.75.75 0 101.06-1.06l-3.53-3.53V7z" />{" "}
//     </svg>
//   );
// }

import React from "react";

export default function Footer() {
  const year = new Date().getFullYear();
  return (
    <footer className="relative mx-auto max-w-full px-10 py-16 text-slate-200">
      <div className="relative overflow-hidden rounded-[28px] border border-white/10 bg-gradient-to-b from-slate-900/70 to-slate-950/70 p-8 sm:p-12 shadow-[0_30px_100px_-40px_rgba(2,6,23,0.8)] backdrop-blur">
        {/* background accents */}
        <div className="pointer-events-none absolute -left-40 -top-40 h-80 w-80 rounded-full bg-sky-500/15 blur-3xl" />
        <div className="pointer-events-none absolute -right-24 top-0 h-72 w-72 rounded-full bg-indigo-500/15 blur-3xl" />
        <div className="pointer-events-none absolute inset-0 rounded-[28px] ring-1 ring-white/10" />

        {/* top grid */}
        <div className="relative grid gap-10 lg:grid-cols-4">
          {/* Brand */}
          <div className="lg:pr-10">
            <div className="flex items-center gap-4">
              <BrandLogo />
              <span className="text-3xl font-extrabold tracking-tight text-white">SkillSync</span>
            </div>
            <p className="mt-5 text-slate-300">Learn. Build. Get Certified.</p>
            <a
              href="mailto:support@skillsync.io"
              className="mt-4 inline-block font-medium text-slate-200 hover:text-white"
            >
              support@skillsync.io
            </a>
          </div>

          {/* Divider between brand and link groups */}
          <div className="hidden lg:block lg:h-full lg:w-px lg:justify-self-center lg:bg-white/10" />

          {/* Links */}
          <div className="grid gap-10 sm:grid-cols-2 lg:col-span-2 lg:grid-cols-3">
            <NavGroup
              title="Company"
              items={[
                { label: "About Us", href: "#about" },
                { label: "Contact", href: "#contact" },
              ]}
            />

            <NavGroup title="Support" items={[{ label: "FAQs", href: "#faqs" }]} />

            <div className="relative">
              {/* vertical divider on large before Legal */}
              <div className="pointer-events-none absolute -left-6 top-0 hidden h-full w-px bg-white/10 lg:block" />
              <h3 className="text-lg font-semibold text-white">Legal</h3>
              <p className="mt-5 text-slate-300">Follow us</p>
              <div className="mt-4 flex gap-3">
                <SocialButton label="Facebook" href="#" icon={IconFacebook} />
                <SocialButton label="YouTube" href="#" icon={IconYouTube} />
                <SocialButton label="Twitter" href="#" icon={IconTwitter} />
              </div>
            </div>
          </div>
        </div>

        {/* bottom divider (full width but inset visually like the reference) */}
        <div className="relative my-10 mx-2 h-px bg-white/10" />

        {/* bottom row */}
        <div className="relative grid gap-6 sm:grid-cols-[1fr_auto_auto] sm:items-center">
          <div className="flex items-center gap-2 text-slate-300">
            <IconClock className="h-4 w-4" />
            <span className="text-sm">© {year} SkillSync</span>
          </div>

          <nav aria-label="secondary" className="flex flex-wrap items-center justify-start gap-x-10 gap-y-3 text-sm text-slate-300">
            <a href="#cookies" className="transition hover:text-white">Cookies</a>
            <a href="#sitemap" className="transition hover:text-white">Sitemap</a>
          </nav>

          <div className="flex items-center justify-start gap-2 text-sm text-slate-300">
            <IconGlobe className="h-4 w-4" />
            <button className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1 ring-1 ring-white/10 transition hover:bg-white/10">
              EN
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-4 w-4 opacity-70">
                <path
                  fillRule="evenodd"
                  d="M5.23 7.21a.75.75 0 011.06.02L10 10.94l3.71-3.71a.75.75 0 011.08 1.04l-4.25 4.25a.75.75 0 01-1.06 0L5.21 8.27a.75.75 0 01.02-1.06z"
                  clipRule="evenodd"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </footer>
  );
}

function BrandLogo() {
  return (
    <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-sky-500 via-indigo-500 to-purple-600 p-[2px] shadow-[inset_0_1px_0_rgba(255,255,255,0.15),0_25px_80px_-35px_rgba(0,0,0,0.9)]">
      <div className="relative h-full w-full rounded-2xl bg-slate-950">
        <div className="pointer-events-none absolute inset-0 rounded-2xl bg-[radial-gradient(65%_80%_at_30%_20%,rgba(255,255,255,0.25),transparent_60%)]" />
      </div>
    </div>
  );
}

function NavGroup({ title, items }) {
  return (
    <div>
      <h3 className="text-lg font-semibold text-white">{title}</h3>
      <ul className="mt-5 space-y-3">
        {items.map((it) => (
          <li key={it.label}>
            <a href={it.href} className="text-slate-300 transition hover:text-white">
              {it.label}
            </a>
          </li>
        ))}
      </ul>
    </div>
  );
}

function SocialButton({ label, href, icon: Icon }) {
  return (
    <a
      aria-label={label}
      href={href}
      className="inline-flex items-center justify-center rounded-2xl bg-gradient-to-b from-slate-800/70 to-slate-900/70 p-[2px] ring-1 ring-white/10 transition hover:shadow-[0_12px_30px_-10px_rgba(56,189,248,0.35)]"
    >
      <span className="grid h-10 w-10 place-items-center rounded-2xl bg-slate-900/60">
        <Icon className="h-4 w-4" />
      </span>
    </a>
  );
}

/* ------------------------- Icons (inline SVG) ------------------------- */
function IconFacebook({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M22 12.06C22 6.505 17.523 2 12 2S2 6.505 2 12.06c0 5.017 3.657 9.175 8.438 9.94v-7.03H7.898v-2.91h2.54V9.845c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.196 2.238.196v2.47h-1.261c-1.243 0-1.63.775-1.63 1.57v1.885h2.773l-.443 2.91h-2.33v7.03C18.343 21.235 22 17.077 22 12.06z" />
    </svg>
  );
}

function IconYouTube({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M23.5 7.21a3.2 3.2 0 00-2.25-2.27C19.1 4.5 12 4.5 12 4.5s-7.1 0-9.25.44A3.2 3.2 0 00.5 7.21 33.7 33.7 0 000 12a33.7 33.7 0 00.5 4.79 3.2 3.2 0 002.25 2.27C4.9 19.5 12 19.5 12 19.5s7.1 0 9.25-.44a3.2 3.2 0 002.25-2.27A33.7 33.7 0 0024 12a33.7 33.7 0 00-.5-4.79zM9.75 15.02V8.98L15.5 12l-5.75 3.02z" />
    </svg>
  );
}

function IconTwitter({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M21.54 7.2c.015.22.015.44.015.66 0 6.72-4.98 14.47-14.09 14.47-2.8 0-5.4-.83-7.58-2.26.39.047.765.062 1.17.062 2.32 0 4.45-.82 6.15-2.19a4.93 4.93 0 01-4.6-3.5c.3.047.6.078.915.078.435 0 .87-.062 1.275-.188a4.96 4.96 0 01-3.945-4.88v-.062c.66.38 1.44.61 2.265.645A4.97 4.97 0 012.1 5.7a14.06 14.06 0 0010.3 5.35 5.61 5.61 0 01-.12-1.13 4.94 4.94 0 018.55-3.39 9.7 9.7 0 003.13-1.26 4.97 4.97 0 01-2.17 2.76 9.87 9.87 0 002.86-.8 10.56 10.56 0 01-2.13 2.21z" />
    </svg>
  );
}

function IconGlobe({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm7.94 9h-3.11a15.5 15.5 0 00-1.04-5.03A8.03 8.03 0 0119.94 11zM12 4c.95 0 2.54 2.25 3.11 6H8.89C9.46 6.25 11.05 4 12 4zM6.21 6.97A15.5 15.5 0 005.17 11H2.06a8.03 8.03 0 014.15-4.03zM2.06 13h3.11c.2 1.75.67 3.5 1.51 5.03A8.03 8.03 0 012.06 13zm6.83 0h6.22c-.57 3.75-2.16 6-3.11 6s-2.54-2.25-3.11-6zm7.84 5.03A15.5 15.5 0 0016.83 13h3.11a8.03 8.03 0 01-4.15 5.03z" />
    </svg>
  );
}

function IconClock({ className = "h-5 w-5" }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className}>
      <path d="M12 2a10 10 0 100 20 10 10 0 000-20zm.75 5a.75.75 0 00-1.5 0v5.25c0 .2.08.39.22.53l3.75 3.75a.75.75 0 101.06-1.06l-3.53-3.53V7z" />
    </svg>
  );
}
