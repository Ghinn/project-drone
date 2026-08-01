"use client";
import { useState, useEffect } from 'react';

// ─── Color tokens ──────────────────────────────────────
const C = {
  green:       '#84994F',
  greenLight:  '#C1D343',
  greenBright: '#A7D82E',
  red:         '#990000',
  orange:      '#FF6600',
  amber:       '#FCB53B',
  brick:       '#A72703',
};

// ─── Unsplash images ───────────────────────────────────
const IMG = {
  hero:  'https://images.unsplash.com/photo-1697350978674-4b40261b0dc3?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1920',
  drone: 'https://images.unsplash.com/photo-1506947411487-a56738267384?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
  field: 'https://images.unsplash.com/photo-1521480259767-07c6e39fe142?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200',
};

// ─── Navbar ────────────────────────────────────────────
function Navbar({ onGoToDashboard, darkMode, toggleDark, scrolled }) {
  const [open, setOpen] = useState(false);
  const bg = scrolled
    ? (darkMode ? 'rgba(18,18,18,0.97)' : 'rgba(255,255,255,0.97)')
    : 'transparent';
  const border = scrolled
    ? (darkMode ? '1px solid #2a2a2a' : '1px solid #e5e7eb')
    : '1px solid transparent';
  const text = scrolled
    ? (darkMode ? '#e5e7eb' : '#1a1a1a')
    : '#fff';

  return (
    <header
      className="fixed top-0 left-0 right-0 z-50 transition-all duration-300"
      style={{ background: bg, borderBottom: border, backdropFilter: scrolled ? 'blur(12px)' : 'none' }}
    >
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        <a href="#" className="flex items-center gap-2.5">
          <span
            className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold"
            style={{ background: C.green, color: '#fff' }}
          >PS</span>
          <span className="font-bold text-base tracking-tight" style={{ color: text }}>
            Drone
          </span>
        </a>
        <nav className="hidden md:flex items-center gap-8">
          {['About', 'Research', 'Features', 'Partners', 'Contact'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
              className="text-sm font-medium transition-opacity hover:opacity-60"
              style={{ color: text }}>
              {l}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleDark}
            className="hidden md:flex w-8 h-8 items-center justify-center rounded transition-opacity hover:opacity-60"
            style={{ color: text }}
            aria-label="Toggle dark mode"
          >
            {darkMode ? (
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" strokeWidth="2"/><path strokeWidth="2" strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
            ) : (
              <svg width="16" height="16" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
            )}
          </button>
          <button
            onClick={onGoToDashboard}
            className="hidden md:inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded transition-opacity hover:opacity-85"
            style={{ background: C.green, color: '#fff' }}
          >
            Open Dashboard
          </button>
          <button className="md:hidden p-2" style={{ color: text }} onClick={() => setOpen(o => !o)}>
            <svg width="20" height="20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeWidth="2" d={open ? 'M6 18L18 6M6 6l12 12' : 'M4 6h16M4 12h16M4 18h16'}/>
            </svg>
          </button>
        </div>
      </div>
      {open && (
        <div className="md:hidden px-6 pb-5 pt-2 flex flex-col gap-4"
          style={{ background: darkMode ? '#121212' : '#fff', borderTop: `1px solid ${darkMode ? '#2a2a2a' : '#e5e7eb'}` }}>
          {['About', 'Research', 'Features', 'Partners', 'Contact'].map(l => (
            <a key={l} href={`#${l.toLowerCase()}`}
              className="text-sm font-medium"
              style={{ color: darkMode ? '#e5e7eb' : '#1a1a1a' }}
              onClick={() => setOpen(false)}>
              {l}
            </a>
          ))}
          <button onClick={onGoToDashboard}
            className="w-full py-2.5 text-sm font-semibold rounded"
            style={{ background: C.green, color: '#fff' }}>
            Open Dashboard
          </button>
        </div>
      )}
    </header>
  );
}

// ─── Hero ──────────────────────────────────────────────
function Hero({ onGoToDashboard, dark }) {
  return (
    <section className="relative min-h-screen flex items-center" style={{ background: '#0d1a06' }}>
      <div className="absolute inset-0">
        <img src={IMG.hero} alt="Aerial plantation" className="w-full h-full object-cover" style={{ opacity: 0.35 }} />
      </div>
      <div className="relative max-w-6xl mx-auto px-6 py-32 w-full">
        <div className="max-w-2xl">
          <span className="inline-block text-xs font-semibold tracking-widest uppercase mb-6 px-3 py-1 rounded-sm"
            style={{color: C.greenLight}}>
            AgriTech Research · IoT &amp; AI
          </span>
          <h1 className="font-bold leading-tight mb-6" style={{ fontSize: 'clamp(2.4rem, 5vw, 4rem)', color: '#fff', lineHeight: 1.08 }}>
            Early Disease Detection<br />for Palm Oil<br /><span style={{ color: C.greenLight }}>Plantations</span>
          </h1>
          <p className="text-lg leading-relaxed mb-10 font-light" style={{ color: '#c8d4b8', maxWidth: 520 }}>
            Drone combines multispectral UAV imaging and onboard AI inference to identify Ganoderma-driven Basal Stem Rot at early stages — before visible symptoms appear.
          </p>
          <div className="flex flex-wrap gap-4">
            <button onClick={onGoToDashboard} className="inline-flex items-center gap-2.5 px-7 py-3.5 text-sm font-semibold rounded transition-opacity hover:opacity-85" style={{ background: C.green, color: '#fff' }}>
              Enter Dashboard
              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7"/>
              </svg>
            </button>
            <a href="#about" className="inline-flex items-center gap-2 px-7 py-3.5 text-sm font-semibold rounded transition-opacity hover:opacity-70" style={{ color: '#fff', border: '1.5px solid rgba(255,255,255,0.35)' }}>
              Learn More
            </a>
          </div>
        </div>
        <div className="mt-20 grid grid-cols-2 md:grid-cols-4 gap-px" style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 32 }}>
          {[
            { v: '94.7%', l: 'Classification accuracy' },
            { v: '±12 ha', l: 'Coverage per sortie' },
            { v: '5-band', l: 'Multispectral sensor' },
            { v: '< 80 ms', l: 'Inference latency' },
          ].map(m => (
            <div key={m.l} className="pr-8">
              <div className="text-2xl font-bold mb-1" style={{ color: C.greenLight }}>{m.v}</div>
              <div className="text-xs font-medium" style={{ color: '#8a9e78' }}>{m.l}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

// ─── About ─────────────────────────────────────────────
function About({ dark }) {
  const bg = dark ? '#121212' : '#fff';
  const t1 = dark ? '#f3f4f6' : '#111827';
  const t2 = dark ? '#9ca3af' : '#4b5563';
  const pill = dark ? '#1e2a0e' : '#f0f5e3';
  const pillT = dark ? C.greenLight : C.green;

  return (
    <section id="about" className="py-28" style={{ background: bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-start">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: C.green }}>Research Background</p>
            <h2 className="font-bold mb-6 leading-tight" style={{ fontSize: 'clamp(1.8rem,3vw,2.8rem)', color: t1 }}>Digital agriculture for<br />sustainable oil palm</h2>
            <p className="text-base leading-relaxed mb-5" style={{ color: t2 }}>
              Basal Stem Rot (BSR), caused by <em>Ganoderma boninense</em>, is responsible for the loss of millions of oil palm trees annually across Southeast Asia. Conventional field scouting is too slow and too costly to catch the disease before it becomes systemic.
            </p>
            <p className="text-base leading-relaxed mb-8" style={{ color: t2 }}>
              Drone replaces reactive scouting with proactive, data-driven monitoring. The system mounts a compact multispectral camera on a custom UAV platform, captures canopy-level imagery on a regular flight schedule, and runs an edge-AI classifier onboard — delivering geolocation-tagged treatment recommendations within minutes.
            </p>
            <div className="flex flex-wrap gap-2">
              {['Ganoderma Detection', 'Edge AI / YOLOv8', 'Multispectral NDVI', 'UAV Autonomy', 'RTK-GPS Tagging', 'RC Spraying'].map(tag => (
                <span key={tag} className="px-3 py-1 rounded-sm text-xs font-medium" style={{ background: pill, color: pillT }}>{tag}</span>
              ))}
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4 pt-2">
            {[
              { icon: '🌿', label: 'Hectares surveyed', value: '2,400+', note: 'Field trial total' },
              { icon: '🎯', label: 'Model F1-score', value: '0.947', note: 'Validation dataset' },
              { icon: '⏱', label: 'Flight endurance', value: '28 min', note: 'Per battery cycle' },
              { icon: '📡', label: 'GPS accuracy', value: '±0.8 m', note: 'With RTK module' },
            ].map(s => (
              <div key={s.label} className="p-6 rounded-sm" style={{ background: dark ? '#1a1a1a' : '#f9fafb', border: `1px solid ${dark ? '#2a2a2a' : '#e5e7eb'}` }}>
                <div className="text-xl mb-4">{s.icon}</div>
                <div className="font-bold text-2xl mb-0.5" style={{ color: t1 }}>{s.value}</div>
                <div className="text-xs font-semibold mb-0.5" style={{ color: t1 }}>{s.label}</div>
                <div className="text-xs" style={{ color: t2 }}>{s.note}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Drone info section ─────────────────────────────────
function DroneInfo({ dark }) {
  const bg = dark ? '#0f0f0f' : '#f9fafb';
  const t1 = dark ? '#f3f4f6' : '#111827';
  const t2 = dark ? '#9ca3af' : '#4b5563';
  const cardBorder = dark ? '#2a2a2a' : '#e5e7eb';

  return (
    <section id="research" className="py-28" style={{ background: bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
          <div className="relative rounded-sm overflow-hidden" style={{ aspectRatio: '4/3' }}>
            <img src={IMG.drone} alt="Research drone" className="w-full h-full object-cover" />
            <div className="absolute bottom-0 left-0 right-0 p-5" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.75))' }}>
              <p className="text-xs text-white font-medium">Drone UAV Platform · Multispectral &amp; RC Spray Module</p>
            </div>
          </div>
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: C.green }}>Platform Overview</p>
            <h2 className="font-bold mb-6 leading-tight" style={{ fontSize: 'clamp(1.6rem,2.5vw,2.4rem)', color: t1 }}>A purpose-built UAV<br />for plantation monitoring</h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: t2 }}>
              The Drone drone integrates a 5-band multispectral sensor, an onboard NVIDIA Jetson Nano for real-time inference, RTK-GPS for sub-metre positioning, and a 2-litre spray tank actuated by RC command for precision fungicide application.
            </p>
            <div className="space-y-3">
              {[
                { spec: 'Sensor', value: '5-band multispectral (NIR, RedEdge, NDVI, RGB)' },
                { spec: 'AI module', value: 'NVIDIA Jetson Nano · YOLOv8-S' },
                { spec: 'Positioning', value: 'RTK-GPS · ±0.8 m horizontal' },
                { spec: 'Endurance', value: '28 min · 5,200 mAh LiPo 6S' },
                { spec: 'Spray tank', value: '2 L · RC-triggered nozzle array' },
                { spec: 'Comm. link', value: '5.8 GHz video + 915 MHz telemetry' },
              ].map(row => (
                <div key={row.spec} className="flex gap-4 py-3" style={{ borderBottom: `1px solid ${cardBorder}` }}>
                  <span className="text-xs font-semibold w-28 shrink-0 pt-0.5" style={{ color: C.green }}>{row.spec}</span>
                  <span className="text-xs leading-relaxed" style={{ color: t2 }}>{row.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Features ──────────────────────────────────────────
function Features({ dark }) {
  const bg = dark ? '#121212' : '#fff';
  const t1 = dark ? '#f3f4f6' : '#111827';
  const t2 = dark ? '#9ca3af' : '#6b7280';
  const cardBg = dark ? '#1a1a1a' : '#f9fafb';
  const cardBorder = dark ? '#2a2a2a' : '#e5e7eb';

  const features = [
    { num: '01', title: 'AI Multispectral Classification', body: 'A YOLOv8-Small model trained on 8,000 annotated palm canopy frames classifies disease severity into four stages — Healthy, Mild, Moderate, and Severe — across five spectral bands in under 80 ms per inference cycle.' },
    { num: '02', title: 'Real-Time Video Monitoring', body: 'Live H.264 video with AI detection annotations is streamed over a 5.8 GHz downlink to the ground station web dashboard. Operators can intervene remotely and trigger precision spraying via RC command.' },
    { num: '03', title: 'Precision GPS Mapping', body: 'Each detection event is geo-tagged with RTK-GPS coordinates accurate to ±0.8 m. Post-flight, disease clusters are rendered as a plantation overlay that agronomists can export for field treatment planning.' },
  ];

  return (
    <section id="features" className="py-28" style={{ background: bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="max-w-xl mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: C.green }}>System Capabilities</p>
          <h2 className="font-bold leading-tight" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: t1 }}>End-to-end detection<br />in a single flight</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {features.map(f => (
            <div key={f.num} className="p-8 rounded-sm" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <span className="block text-xs font-bold tracking-widest mb-6" style={{ color: C.greenLight }}>{f.num}</span>
              <h3 className="font-semibold text-base mb-3" style={{ color: t1 }}>{f.title}</h3>
              <p className="text-sm leading-relaxed" style={{ color: t2 }}>{f.body}</p>
            </div>
          ))}
        </div>
        <div className="mt-6 p-8 rounded-sm flex flex-col md:flex-row gap-8 items-start" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
          <div className="md:w-1/3">
            <span className="block text-xs font-bold tracking-widest mb-4" style={{ color: C.amber }}>04</span>
            <h3 className="font-semibold text-base mb-3" style={{ color: t1 }}>RC-Triggered Precision Spraying</h3>
          </div>
          <div className="md:w-2/3">
            <p className="text-sm leading-relaxed" style={{ color: t2 }}>
              When the AI flags a disease cluster, the ground operator can activate the onboard spray tank via RC command. A servo-actuated nozzle array releases fungicide directly above infected palms, reducing chemical consumption by up to 60% compared to conventional broadcast application. The spray event timestamp and GPS coordinate are logged to the dashboard for traceability.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Field photo break ─────────────────────────────────
function PhotoBreak() {
  return (
    <div className="relative h-72 md:h-96 overflow-hidden" style={{ background: '#0d1a06' }}>
      <img src={IMG.field} alt="Plantation canopy" className="w-full h-full object-cover" style={{ opacity: 0.45 }} />
      <div className="absolute inset-0 flex items-center justify-center">
        <p className="text-xl md:text-3xl font-bold text-white text-center px-6" style={{ maxWidth: 640 }}>
          "Detecting disease weeks before<br />symptoms become visible."
        </p>
      </div>
    </div>
  );
}

// ─── Partners ──────────────────────────────────────────
function Partners({ dark }) {
  const bg = dark ? '#0f0f0f' : '#f9fafb';
  const t1 = dark ? '#f3f4f6' : '#111827';
  const t2 = dark ? '#6b7280' : '#9ca3af';
  const cardBg = dark ? '#1a1a1a' : '#fff';
  const cardBorder = dark ? '#2a2a2a' : '#e5e7eb';

  const partners = [
    { abbr: 'ITB', name: 'Institut Teknologi Bandung', dept: 'Dept. of Electrical Engineering' },
    { abbr: 'IPB', name: 'IPB University', dept: 'Faculty of Agriculture' },
    { abbr: 'POLTEK', name: 'State Polytechnic', dept: 'Dept. of Mechatronics' },
    { abbr: 'BRIN', name: 'National R&D Agency', dept: 'Agro-Industry Research Center' },
  ];

  return (
    <section id="partners" className="py-28" style={{ background: bg }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="mb-14">
          <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: C.green }}>Institutional Partners</p>
          <h2 className="font-bold leading-tight" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: t1 }}>Research collaboration</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {partners.map(p => (
            <div key={p.abbr} className="p-6 rounded-sm" style={{ background: cardBg, border: `1px solid ${cardBorder}` }}>
              <div className="w-12 h-12 rounded-sm flex items-center justify-center font-bold text-sm mb-4" style={{ background: `${C.green}18`, color: C.green }}>
                {p.abbr}
              </div>
              <p className="text-sm font-semibold mb-1" style={{ color: t1 }}>{p.name}</p>
              <p className="text-xs" style={{ color: t2 }}>{p.dept}</p>
            </div>
          ))}
        </div>
        <p className="mt-6 text-xs" style={{ color: t2 }}>* Partner names shown are placeholders for research documentation.</p>
      </div>
    </section>
  );
}

// ─── Contact ───────────────────────────────────────────
function Contact({ onGoToDashboard, dark }) {
  const bg = dark ? '#121212' : '#fff';
  const t1 = dark ? '#f3f4f6' : '#111827';
  const t2 = dark ? '#9ca3af' : '#6b7280';
  const inputBg = dark ? '#1a1a1a' : '#f9fafb';
  const inputBorder = dark ? '#2a2a2a' : '#d1d5db';

  return (
    <section id="contact" className="py-28" style={{ background: bg, borderTop: `1px solid ${dark ? '#1e1e1e' : '#e5e7eb'}` }}>
      <div className="max-w-6xl mx-auto px-6">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-20">
          <div>
            <p className="text-xs font-semibold tracking-widest uppercase mb-4" style={{ color: C.green }}>Get in Touch</p>
            <h2 className="font-bold leading-tight mb-6" style={{ fontSize: 'clamp(1.8rem,3vw,2.6rem)', color: t1 }}>Collaborate with<br />the Drone team</h2>
            <p className="text-sm leading-relaxed mb-8" style={{ color: t2 }}>
              We welcome inquiries from researchers, agronomists, plantation managers, and technology partners interested in joint field trials, data sharing, or publication collaboration.
            </p>
            <div className="space-y-3">
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: t1 }}>Email</p>
                <a href="mailto:Drone@research.ac.id" className="text-sm hover:underline" style={{ color: C.green }}>Drone@research.ac.id</a>
              </div>
              <div>
                <p className="text-xs font-semibold mb-0.5" style={{ color: t1 }}>Location</p>
                <p className="text-sm" style={{ color: t2 }}>Department of Electrical Engineering, Indonesia</p>
              </div>
            </div>
            <button onClick={onGoToDashboard} className="mt-8 inline-flex items-center gap-2.5 px-6 py-3 text-sm font-semibold rounded-sm transition-opacity hover:opacity-85" style={{ background: C.green, color: '#fff' }}>
              Access Dashboard →
            </button>
          </div>
          <div>
            <div className="space-y-4">
              {[
                { id: 'name', label: 'Full Name', type: 'text', placeholder: 'Dr. Jane Smith' },
                { id: 'email', label: 'Institutional Email', type: 'email', placeholder: 'j.smith@university.ac.id' },
                { id: 'org', label: 'Organisation', type: 'text', placeholder: 'University / Research Institute' },
              ].map(f => (
                <div key={f.id}>
                  <label htmlFor={f.id} className="block text-xs font-semibold mb-1.5" style={{ color: t1 }}>{f.label}</label>
                  <input id={f.id} type={f.type} placeholder={f.placeholder} className="w-full px-4 py-2.5 text-sm rounded-sm outline-none transition-all" style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: t1 }} />
                </div>
              ))}
              <div>
                <label htmlFor="msg" className="block text-xs font-semibold mb-1.5" style={{ color: t1 }}>Message</label>
                <textarea id="msg" rows={4} placeholder="Describe your collaboration interest..." className="w-full px-4 py-2.5 text-sm rounded-sm outline-none resize-none" style={{ background: inputBg, border: `1px solid ${inputBorder}`, color: t1 }} />
              </div>
              <button className="w-full py-3 text-sm font-semibold rounded-sm transition-opacity hover:opacity-85" style={{ background: C.green, color: '#fff' }}>
                Send Message
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

// ─── Footer ────────────────────────────────────────────
function Footer({ dark }) {
  const bg = dark ? '#0a0a0a' : '#111827';
  return (
    <footer className="py-10" style={{ background: bg }}>
      <div className="max-w-6xl mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2.5">
          <span className="w-6 h-6 rounded flex items-center justify-center text-xs font-bold" style={{ background: C.green, color: '#fff' }}>PS</span>
          <span className="text-sm font-semibold text-white">Drone</span>
          <span className="text-xs" style={{ color: '#6b7280' }}>Research Project</span>
        </div>
        <p className="text-xs" style={{ color: '#6b7280' }}>© 2026 Drone · Academic Research Use Only · All data is simulated</p>
        <div className="flex gap-5">
          {['Privacy', 'Terms', 'Contact'].map(l => (
            <a key={l} href="#" className="text-xs transition-opacity hover:opacity-60" style={{ color: '#6b7280' }}>{l}</a>
          ))}
        </div>
    </div>
      </footer>
  );
}

// ─── Root export ───────────────────────────────────────
export default function LandingPage({ onGoToDashboard, darkMode, toggleDark }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <Navbar onGoToDashboard={onGoToDashboard} darkMode={darkMode} toggleDark={toggleDark} scrolled={scrolled} />
      <Hero onGoToDashboard={onGoToDashboard} dark={darkMode} />
      <About dark={darkMode} />
      <DroneInfo dark={darkMode} />
      <Features dark={darkMode} />
      <PhotoBreak />
      <Partners dark={darkMode} />
      <Contact onGoToDashboard={onGoToDashboard} dark={darkMode} />
      <Footer dark={darkMode} />
    </div>
  );
}