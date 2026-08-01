"use client";
import { useState, useEffect } from 'react';

// ─── Tokens ────────────────────────────────────────────
const C = {
  green:       '#84994F',
  greenLight:  '#C1D343',
  greenBright: '#A7D82E',
  red:         '#990000',
  orange:      '#FF6600',
  amber:       '#FCB53B',
  brick:       '#A72703',
};

const FIELD_IMG = 'https://images.unsplash.com/photo-1508175688576-0c076b47b5b5?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&q=80&w=1200';

// ─── Nav items (no Spot Mapping) ───────────────────────
const NAV = [
  { id: 'dashboard',  label: 'Dashboard' },
  { id: 'camera',     label: 'Live Camera' },
  { id: 'ai-log',     label: 'AI Prediction Log' },
  { id: 'settings',   label: 'Settings' },
];

// ─── Sidebar ───────────────────────────────────────────
function Sidebar({ active, setActive, onBack, dark, collapsed, setCollapsed }) {
  const bg     = dark ? '#0d0d0d' : '#fff';
  const border = dark ? '#1e1e1e' : '#e5e7eb';
  const t1     = dark ? '#e5e7eb' : '#111827';
  const tmute  = dark ? '#6b7280' : '#9ca3af';

  return (
    <aside className="flex flex-col shrink-0 transition-all duration-300" style={{ width: collapsed ? 52 : 212, background: bg, borderRight: `1px solid ${border}` }}>
      <div className="flex items-center gap-3 px-3.5 h-14 shrink-0" style={{ borderBottom: `1px solid ${border}` }}>
        <span className="w-7 h-7 rounded flex items-center justify-center text-xs font-bold shrink-0" style={{ background: C.green, color: '#fff' }}>PS</span>
        {!collapsed && <span className="font-bold text-sm" style={{ color: t1 }}>Drone</span>}
      </div>
      <nav className="flex-1 py-4 flex flex-col gap-0.5 px-2">
        {NAV.map(n => {
          const active2 = active === n.id;
          return (
            <button key={n.id} onClick={() => setActive(n.id)} className="flex items-center gap-3 rounded-sm px-2.5 py-2.5 w-full text-left transition-colors text-sm" style={{ background: active2 ? (dark ? '#1a1a1a' : '#f3f4f6') : 'transparent', color: active2 ? t1 : tmute, fontWeight: active2 ? 600 : 400, borderLeft: active2 ? `2px solid ${C.greenLight}` : '2px solid transparent' }}>
              {!collapsed && n.label}
              {collapsed && (
                <span className="text-xs font-bold" style={{ color: active2 ? C.greenLight : tmute }}>
                  {n.label.slice(0, 2).toUpperCase()}
                </span>
              )}
            </button>
          )
        })}
      </nav>
      <div className="px-2 pb-3">
        <button onClick={onBack} className="flex items-center gap-2 px-2.5 py-2 w-full rounded-sm text-sm transition-opacity hover:opacity-70" style={{ color: tmute }}>
          <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24" className="shrink-0"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7"/></svg>
          {!collapsed && <span>Back to Home</span>}
        </button>
      </div>
      <button onClick={() => setCollapsed(!collapsed)} className="mx-2 mb-3 py-2 rounded-sm flex items-center justify-center transition-opacity hover:opacity-60" style={{ background: dark ? '#1a1a1a' : '#f3f4f6', color: tmute }}>
        <svg width="12" height="12" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={collapsed ? 'M9 5l7 7-7 7' : 'M15 19l-7-7 7-7'}/></svg>
      </button>
    </aside>
  );
}

// ─── Top header ────────────────────────────────────────
function TopBar({ active, dark, toggleDark, onBack }) {
  const bg     = dark ? '#0d0d0d' : '#fff';
  const border = dark ? '#1e1e1e' : '#e5e7eb';
  const t1     = dark ? '#e5e7eb' : '#111827';
  const tmute  = dark ? '#6b7280' : '#9ca3af';
  const label  = NAV.find(n => n.id === active)?.label ?? 'Dashboard';

  return (
    <header className="flex items-center justify-between px-6 h-14 shrink-0" style={{ background: bg, borderBottom: `1px solid ${border}` }}>
      <div className="flex items-center gap-2 text-sm">
        <span style={{ color: tmute }}>Drone</span>
        <span style={{ color: tmute }}>/</span>
        <span className="font-semibold" style={{ color: t1 }}>{label}</span>
      </div>
      <div className="flex items-center gap-3">
        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 rounded-sm text-xs font-medium" style={{ background: dark ? '#1a1a1a' : '#f3f4f6', color: tmute, border: `1px solid ${dark ? '#2a2a2a' : '#e5e7eb'}` }}>
          <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: C.greenLight }} />
          Drone active · Mission #37
        </div>
        <button onClick={toggleDark} className="w-8 h-8 flex items-center justify-center rounded-sm transition-opacity hover:opacity-60" style={{ background: dark ? '#1a1a1a' : '#f3f4f6', color: tmute }}>
          {dark ? (
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" strokeWidth="2"/><path strokeWidth="2" strokeLinecap="round" d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
          ) : (
            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeWidth="2" strokeLinecap="round" d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z"/></svg>
          )}
        </button>
        <div className="flex items-center gap-2.5 pl-3" style={{ borderLeft: `1px solid ${dark ? '#1e1e1e' : '#e5e7eb'}` }}>
          <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shrink-0" style={{ background: C.green, color: '#fff' }}>RA</div>
          <div className="hidden md:block">
            <p className="text-xs font-semibold leading-tight" style={{ color: t1 }}>Researcher</p>
            <p className="text-xs leading-tight" style={{ color: tmute }}>Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
}

// ─── Live video card ───────────────────────────────────
function LiveFeed({ dark }) {
  const [tick, setTick] = useState(new Date());
  useEffect(() => {
    const t = setInterval(() => setTick(new Date()), 1000);
    return () => clearInterval(t);
  }, []);

  const bg     = dark ? '#111' : '#fff';
  const border = dark ? '#1e1e1e' : '#e5e7eb';
  const t1     = dark ? '#e5e7eb' : '#111827';
  const tmute  = dark ? '#6b7280' : '#9ca3af';

  return (
    <div className="flex flex-col rounded-sm overflow-hidden h-full" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: `1px solid ${border}` }}>
        <div className="flex items-center gap-2.5">
          <span className="w-2 h-2 rounded-full shrink-0" style={{ background: C.greenLight }} />
          <span className="font-semibold text-sm" style={{ color: t1 }}>Live Multispectral Video Feed</span>
          <span className="text-xs px-2 py-0.5 rounded-sm font-mono" style={{ background: dark ? '#1a1a1a' : '#f3f4f6', color: tmute }}>NDVI</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-xs font-mono" style={{ color: tmute }}>{tick.toLocaleTimeString()}</span>
          <span className="text-xs px-2 py-0.5 rounded-sm font-mono font-bold" style={{ background: `${C.red}18`, color: C.red, border: `1px solid ${C.red}44` }}>● REC</span>
        </div>
      </div>
      <div className="relative flex-1 min-h-0 overflow-hidden">
        <img src={FIELD_IMG} alt="Aerial agricultural field" className="w-full h-full object-cover" />
        <div className="absolute top-3 left-3 w-5 h-5 border-t-2 border-l-2" style={{ borderColor: C.greenLight }} />
        <div className="absolute top-3 right-3 w-5 h-5 border-t-2 border-r-2" style={{ borderColor: C.greenLight }} />
        <div className="absolute bottom-3 left-3 w-5 h-5 border-b-2 border-l-2" style={{ borderColor: C.greenLight }} />
        <div className="absolute bottom-3 right-3 w-5 h-5 border-b-2 border-r-2" style={{ borderColor: C.greenLight }} />
        <div className="absolute bottom-4 left-4 px-2.5 py-1.5 rounded-sm text-xs font-mono" style={{ background: 'rgba(0,0,0,0.65)', color: '#d1fae5', backdropFilter: 'blur(4px)' }}>
          3°21'14.2"N 114°35'48.9"E · ALT 25.3 m
        </div>
      </div>
      <div className="flex items-center gap-5 px-5 py-2.5 shrink-0" style={{ borderTop: `1px solid ${border}` }}>
        {[
          { k: 'NDVI', v: '0.72', c: C.greenLight },
          { k: 'TEMP', v: '32.4°C', c: C.amber },
          { k: 'BAND', v: '5-CH', c: C.green },
          { k: 'RES', v: '1080p', c: tmute },
        ].map(i => (
          <div key={i.k} className="flex items-center gap-1.5">
            <span className="text-xs font-semibold" style={{ color: tmute }}>{i.k}</span>
            <span className="text-xs font-bold font-mono" style={{ color: i.c }}>{i.v}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── Alert list ────────────────────────────────────────
const ALERTS = [
  { id: 1, level: 'critical', title: 'Disease Detected', note: 'Manual Spraying Required via RC', loc: 'Block A-12, Row 8', conf: 94, cls: 'BSR Severe', time: '14:32:17' },
  { id: 2, level: 'warning', title: 'Suspected Infection', note: 'Follow-up scan recommended', loc: 'Block C-07, Row 3', conf: 71, cls: 'BSR Moderate', time: '14:30:44' },
  { id: 3, level: 'caution', title: 'Mild Discoloration', note: 'Monitor on next flight', loc: 'Block D-02, Row 15', conf: 55, cls: 'Early Stage', time: '14:28:05' },
  { id: 4, level: 'ok', title: 'Healthy Canopy', note: 'No action required', loc: 'Block B-05, Row 1', conf: 99, cls: 'Normal', time: '14:25:11' },
];

const LEVEL_STYLE = {
  critical: { dot: C.red,         badge: C.red,         badgeT: '#fff',  label: 'CRITICAL' },
  warning:  { dot: C.orange,      badge: C.orange,      badgeT: '#fff',  label: 'WARNING'  },
  caution:  { dot: C.amber,       badge: C.amber,       badgeT: '#1a1a1a', label: 'CAUTION' },
  ok:       { dot: C.greenLight,  badge: C.greenLight,  badgeT: '#1a1a1a', label: 'HEALTHY' },
};

function AlertPanel({ dark }) {
  const bg     = dark ? '#111' : '#fff';
  const border = dark ? '#1e1e1e' : '#e5e7eb';
  const t1     = dark ? '#e5e7eb' : '#111827';
  const t2     = dark ? '#9ca3af' : '#6b7280';
  const rowBorder = dark ? '#1e1e1e' : '#f3f4f6';

  return (
    <div className="flex flex-col rounded-sm overflow-hidden h-full" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex items-center justify-between px-5 py-3 shrink-0" style={{ borderBottom: `1px solid ${border}` }}>
        <span className="font-semibold text-sm" style={{ color: t1 }}>AI Detection &amp; Alerts</span>
        <span className="text-xs px-2 py-0.5 rounded-sm font-semibold" style={{ background: `${C.red}18`, color: C.red, border: `1px solid ${C.red}44` }}>1 CRITICAL</span>
      </div>
      <div className="flex-1 overflow-y-auto divide-y" style={{ borderColor: rowBorder }}>
        {ALERTS.map(a => {
          const lv = LEVEL_STYLE[a.level];
          const isCrit = a.level === 'critical';
          return (
            <div key={a.id} className="px-5 py-4" style={{ background: isCrit ? (dark ? `${C.red}0d` : `${C.red}08`) : 'transparent' }}>
              <div className="flex items-start justify-between gap-3 mb-1">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0 mt-0.5" style={{ background: lv.dot }} />
                  <span className="text-sm font-semibold" style={{ color: t1 }}>{a.title}</span>
                </div>
                <span className="text-xs font-mono shrink-0" style={{ color: t2 }}>{a.time}</span>
              </div>
              <p className="text-xs mb-2 pl-4" style={{ color: isCrit ? C.orange : t2, fontWeight: isCrit ? 500 : 400 }}>{a.note}</p>
              <div className="pl-4 flex items-center justify-between">
                <span className="text-xs" style={{ color: t2 }}>{a.loc}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono" style={{ color: t2 }}>{a.conf}%</span>
                  <span className="text-xs px-2 py-0.5 rounded-sm font-semibold" style={{ background: lv.badge, color: lv.badgeT, fontSize: 10 }}>{lv.label}</span>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  );
}

// ─── Telemetry card ────────────────────────────────────
function TelCard({ label, value, unit, pct, color, note, dark }) {
  const bg     = dark ? '#111' : '#fff';
  const border = dark ? '#1e1e1e' : '#e5e7eb';
  const t1     = dark ? '#e5e7eb' : '#111827';
  const t2     = dark ? '#6b7280' : '#9ca3af';

  return (
    <div className="rounded-sm p-5" style={{ background: bg, border: `1px solid ${border}` }}>
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold uppercase tracking-wide" style={{ color: t2 }}>{label}</span>
        {note && <span className="text-xs" style={{ color: t2 }}>{note}</span>}
      </div>
      <div className="flex items-baseline gap-1 mb-3">
        <span className="text-3xl font-bold" style={{ color: t1 }}>{value}</span>
        <span className="text-sm" style={{ color: t2 }}>{unit}</span>
      </div>
      {pct !== undefined && (
        <>
          <div className="w-full h-1.5 rounded-full" style={{ background: dark ? '#1e1e1e' : '#e5e7eb' }}>
            <div className="h-1.5 rounded-full transition-all duration-500" style={{ width: `${pct}%`, background: color }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs font-mono" style={{ color }}>{pct}%</span>
            <span className="text-xs font-mono" style={{ color: t2 }}>100%</span>
          </div>
        </>
      )}
    </div>
  );
}

function TelRow({ label, value, dark }) {
  const border = dark ? '#1e1e1e' : '#e5e7eb';
  const t1     = dark ? '#e5e7eb' : '#111827';
  const t2     = dark ? '#6b7280' : '#9ca3af';
  return (
    <div className="flex items-center justify-between py-2.5" style={{ borderBottom: `1px solid ${border}` }}>
      <span className="text-xs" style={{ color: t2 }}>{label}</span>
      <span className="text-xs font-semibold font-mono" style={{ color: t1 }}>{value}</span>
    </div>
  );
}

// ─── Main export ───────────────────────────────────────
export default function Dashboard({ onBack, darkMode, toggleDark }) {
  const [active, setActive] = useState('dashboard');
  const [collapsed, setCollapsed] = useState(false);
  const [battery, setBattery] = useState(85);
  const [spray]   = useState(62);

  useEffect(() => {
    const t = setInterval(() => setBattery(b => Math.max(10, +(b - 0.05).toFixed(1))), 2000);
    return () => clearInterval(t);
  }, []);

  const dark   = darkMode;
  const pageBg = dark ? '#0a0a0a' : '#f3f4f6';
  const battColor = battery > 50 ? C.greenLight : battery > 20 ? C.amber : C.red;

  return (
    <div className="flex h-screen overflow-hidden" style={{ background: pageBg, fontFamily: 'Montserrat, sans-serif' }}>
      <Sidebar active={active} setActive={setActive} onBack={onBack} dark={dark} collapsed={collapsed} setCollapsed={setCollapsed} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopBar active={active} dark={dark} toggleDark={toggleDark} onBack={onBack} />
        <main className="flex-1 overflow-auto p-5">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-5" style={{ minHeight: 0 }}>
            <div className="lg:col-span-2" style={{ minHeight: 380 }}>
              <LiveFeed dark={dark} />
            </div>
            <div style={{ minHeight: 380 }}>
              <AlertPanel dark={dark} />
            </div>
            <div className="lg:col-span-2 grid grid-cols-2 md:grid-cols-4 gap-5">
              <TelCard label="Drone Battery" value={battery.toFixed(0)} unit="%" pct={Math.round(battery)} color={battColor} note={battery < 20 ? 'LOW' : undefined} dark={dark} />
              <TelCard label="Spray Tank" value={spray} unit="%" pct={spray} color={C.green} dark={dark} />
              <TelCard label="Altitude" value="25.3" unit="m" color={C.greenLight} dark={dark} />
              <TelCard label="Ground Speed" value="4.2" unit="m/s" color={C.amber} dark={dark} />
            </div>
            <div>
              <div className="rounded-sm p-5 h-full" style={{ background: dark ? '#111' : '#fff', border: `1px solid ${dark ? '#1e1e1e' : '#e5e7eb'}` }}>
                <p className="text-xs font-semibold uppercase tracking-wide mb-3" style={{ color: dark ? '#6b7280' : '#9ca3af' }}>Mission Status</p>
                <TelRow label="Mission ID" value="#37" dark={dark} />
                <TelRow label="Flight time" value="18m 42s" dark={dark} />
                <TelRow label="Distance" value="2.4 km" dark={dark} />
                <TelRow label="Detections" value="3 events" dark={dark} />
                <TelRow label="Pilot" value="Auto (FPV)" dark={dark} />
                <TelRow label="Comm. link" value="5.8 GHz · Strong" dark={dark} />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}