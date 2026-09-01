"use client";
import { useEffect, useRef } from 'react';
import { DRONE_TOKENS } from '../layout/monitoringOperator-types';

const T = DRONE_TOKENS;

export type MapWaypoint = {
  lat: number;
  lng: number;
  label?: string;
  status?: 'ok' | 'caution' | 'warning' | 'critical';
  time?: string;
  id?: string;
};

type DroneMapProps = {
  /** Mode: 'live' = drone bergerak, 'waypoints' = tampilkan riwayat titik */
  mode: 'live' | 'waypoints';
  /** Posisi drone saat ini (live) */
  dronePosition?: { lat: number; lng: number };
  /** Daftar titik waypoint (riwayat/log) */
  waypoints?: MapWaypoint[];
  /** Tinggi map dalam px */
  height?: number;
  /** Callback saat waypoint diklik */
  onWaypointClick?: (wp: MapWaypoint) => void;
  /** Apakah drone aktif */
  droneOn?: boolean;
};

const STATUS_COLOR: Record<string, string> = {
  ok:       T.green,
  caution:  T.amber,
  warning:  T.orange,
  critical: T.red,
};

export default function DroneMap({
  mode,
  dronePosition,
  waypoints = [],
  height = 380,
  onWaypointClick,
  droneOn = true,
}: DroneMapProps) {
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const containerId = useRef(`drone-map-${Math.random().toString(36).slice(2)}`).current;
  const markersRef = useRef<import('leaflet').Marker[]>([]);
  const polylineRef = useRef<import('leaflet').Polyline | null>(null);
  const droneMarkerRef = useRef<import('leaflet').Marker | null>(null);

  // Default center: kebun sawit Kalimantan (mock)
  const DEFAULT_CENTER: [number, number] = [3.3556, 114.5977];
  const DEFAULT_ZOOM = 15;

  useEffect(() => {
    // Leaflet hanya bisa jalan di browser
    if (typeof window === 'undefined') return;

    let L: typeof import('leaflet');
    let mounted = true;

    const init = async () => {
      L = (await import('leaflet')).default;

      // Fix default icon path issue di Next.js
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      delete (L.Icon.Default.prototype as any)._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      if (!mounted) return;

      const container = document.getElementById(containerId);
      if (!container || mapRef.current) return;

      // Inisialisasi map
      const map = L.map(containerId, {
        center: dronePosition
          ? [dronePosition.lat, dronePosition.lng]
          : waypoints.length > 0
          ? [waypoints[0].lat, waypoints[0].lng]
          : DEFAULT_CENTER,
        zoom: DEFAULT_ZOOM,
        zoomControl: true,
        attributionControl: true,
      });

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      mapRef.current = map;

      // ── MODE LIVE: Drone marker ──
      if (mode === 'live') {
        const pos: [number, number] = dronePosition
          ? [dronePosition.lat, dronePosition.lng]
          : DEFAULT_CENTER;

        const droneIcon = L.divIcon({
          className: '',
          html: `
            <div style="
              width: 32px; height: 32px;
              background: ${T.green};
              border: 3px solid white;
              border-radius: 50%;
              display: flex; align-items: center; justify-content: center;
              font-size: 14px;
              box-shadow: 0 0 0 4px ${T.green}44, 0 2px 8px rgba(0,0,0,0.4);
            ">🚁</div>
          `,
          iconSize: [32, 32],
          iconAnchor: [16, 16],
        });

        droneMarkerRef.current = L.marker(pos, { icon: droneIcon })
          .addTo(map)
          .bindPopup(`<b>DP-DRONE-001</b><br/>Lat: ${pos[0].toFixed(5)}<br/>Lng: ${pos[1].toFixed(5)}`);
      }

      // ── WAYPOINTS: Riwayat titik (berjalan di semua mode jika waypoints tersedia) ──
      if (waypoints.length > 0) {
        const latlngs: [number, number][] = waypoints.map(wp => [wp.lat, wp.lng]);

        // Polyline jejak
        polylineRef.current = L.polyline(latlngs, {
          color: T.green,
          weight: 3,
          opacity: 0.7,
          dashArray: '8 4',
        }).addTo(map);

        // Markers per waypoint
        waypoints.forEach((wp, idx) => {
          const color = STATUS_COLOR[wp.status ?? 'ok'];
          const icon = L.divIcon({
            className: '',
            html: `
              <div style="
                width: 28px; height: 28px;
                background: ${color};
                border: 2.5px solid white;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-size: 11px; font-weight: bold; color: white;
                box-shadow: 0 2px 6px rgba(0,0,0,0.4);
              ">${idx + 1}</div>
            `,
            iconSize: [28, 28],
            iconAnchor: [14, 14],
          });

          const marker = L.marker([wp.lat, wp.lng], { icon })
            .addTo(map)
            .bindPopup(`
              <b>${wp.id ?? `Titik ${idx + 1}`}</b><br/>
              ${wp.label ?? ''}<br/>
              <span style="color:${color};font-weight:bold;">${wp.status?.toUpperCase() ?? ''}</span><br/>
              ${wp.time ? `🕐 ${wp.time}` : ''}
            `);

          if (onWaypointClick) {
            marker.on('click', () => onWaypointClick(wp));
          }

          markersRef.current.push(marker);
        });

        // Fit map ke bounds — hanya di waypoints-only mode agar live mode tidak re-center
        if (mode === 'waypoints' && latlngs.length > 1) {
          map.fitBounds(latlngs, { padding: [30, 30] });
        }
      }

    };

    init();

    return () => {
      mounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        markersRef.current = [];
        polylineRef.current = null;
        droneMarkerRef.current = null;
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update drone marker posisi saat live mode
  useEffect(() => {
    if (!mapRef.current || mode !== 'live' || !dronePosition || !droneMarkerRef.current) return;
    droneMarkerRef.current.setLatLng([dronePosition.lat, dronePosition.lng]);
    mapRef.current.panTo([dronePosition.lat, dronePosition.lng], { animate: true, duration: 1 });
  }, [dronePosition, mode]);

  return (
    <div className="relative w-full rounded-xl overflow-hidden" style={{ height }}>
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />

      {/* Map Container */}
      <div
        id={containerId}
        style={{ width: '100%', height: '100%', zIndex: 0 }}
      />



      {/* Mode badge */}
      <div className="absolute top-2 right-2 z-10">
        <span className="text-[10px] font-bold px-2 py-1 rounded-md"
          style={{
            background: mode === 'live' ? `${T.red}cc` : `${T.violet}cc`,
            color: '#fff',
            backdropFilter: 'blur(4px)',
          }}>
          {mode === 'live' ? '● LIVE GPS' : '📍 RIWAYAT GPS'}
        </span>
      </div>
    </div>
  );
}
