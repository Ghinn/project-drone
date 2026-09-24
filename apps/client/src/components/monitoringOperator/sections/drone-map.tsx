"use client";

import React, { useEffect, useRef } from 'react';
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
  mode?: 'live' | 'waypoints';
  /** Posisi drone saat ini (live) */
  dronePosition?: { lat: number; lng: number };
  /** Daftar titik waypoint (riwayat/log) */
  waypoints?: MapWaypoint[];
  /** Tinggi map dalam px */
  height?: number | string;
  /** Callback saat waypoint diklik */
  onWaypointClick?: (wp: MapWaypoint) => void;
  /** Apakah drone aktif */
  droneOn?: boolean;
  latDisplay?: string;
  lngDisplay?: string;
  altDisplay?: string;
};

const STATUS_COLOR: Record<string, string> = {
  ok:       T.green,
  caution:  T.amber,
  warning:  T.orange,
  critical: T.red,
};
const CIKABAYAN_IPB_CENTER: [number, number] = [-6.5491118, 106.7160657];

export default function DroneMap({
  mode = 'live',
  dronePosition = { lat: -6.5491118, lng: 106.7160657 },
  waypoints = [],
  height = 240,
  onWaypointClick,
  droneOn = true,
  latDisplay,
  lngDisplay,
  altDisplay = '25.3 m',
}: DroneMapProps) {
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const containerId = useRef(`drone-map-${Math.random().toString(36).slice(2)}`).current;
  const droneMarkerRef = useRef<import('leaflet').Marker | null>(null);
  const polylineRef = useRef<import('leaflet').Polyline | null>(null);
  const pathHistoryRef = useRef<[number, number][]>([]);

  const currentLat = dronePosition?.lat ?? CIKABAYAN_IPB_CENTER[0];
  const currentLng = dronePosition?.lng ?? CIKABAYAN_IPB_CENTER[1];

  const formattedLat = latDisplay ?? `${currentLat.toFixed(4)}°`;
  const formattedLng = lngDisplay ?? `${currentLng.toFixed(4)}°`;

  useEffect(() => {
    if (typeof window === 'undefined') return;

    let L: typeof import('leaflet');
    let isMounted = true;

    const initMap = async () => {
      L = (await import('leaflet')).default;

      if (!isMounted) return;
      const container = document.getElementById(containerId);
      if (!container || mapRef.current) return;

      const initialCenter: [number, number] = [currentLat, currentLng];

      const map = L.map(containerId, {
        center: initialCenter,
        zoom: 18,
        zoomControl: false,
        attributionControl: false,
      });

      // OpenStreetMap tiles
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
      }).addTo(map);

      const droneHtml = `
        <div style="position: relative; width: 32px; height: 32px; display: flex; align-items: center; justify-content: center;">
          <div style="position: absolute; inset: -4px; border-radius: 50%; background: rgba(107, 142, 35, 0.35); animation: ping 2s cubic-bezier(0, 0, 0.2, 1) infinite;"></div>
          <img
            src="/assets/images/icon-drone.svg"
            alt="Drone Marker"
            style="
              width: 28px;
              height: 28px;
              border-radius: 50%;
              border: 2px solid white;
              box-shadow: 0 2px 6px rgba(0,0,0,0.35);
              object-fit: contain;
              display: block;
              position: relative;
              z-index: 1;
            "
          />
        </div>
      `;

      const droneIcon = L.divIcon({
        className: 'custom-drone-icon',
        html: droneHtml,
        iconSize: [32, 32],
        iconAnchor: [16, 16],
      });

      droneMarkerRef.current = L.marker(initialCenter, { icon: droneIcon }).addTo(map);

      // Path trail line
      pathHistoryRef.current = [initialCenter];
      polylineRef.current = L.polyline(pathHistoryRef.current, {
        color: '#5D7E2A',
        weight: 3,
        opacity: 0.85,
        dashArray: '5 5',
      }).addTo(map);

      if (waypoints.length > 0) {
        waypoints.forEach((wp, idx) => {
          const color = STATUS_COLOR[wp.status ?? 'ok'];
          const wpIcon = L.divIcon({
            className: '',
            html: `
              <div style="
                width: 22px; height: 22px;
                background: ${color};
                border: 2px solid white;
                border-radius: 50%;
                display: flex; align-items: center; justify-content: center;
                font-size: 10px; font-weight: bold; color: white;
                box-shadow: 0 1px 4px rgba(0,0,0,0.3);
              ">${idx + 1}</div>
            `,
            iconSize: [22, 22],
            iconAnchor: [11, 11],
          });

          const marker = L.marker([wp.lat, wp.lng], { icon: wpIcon }).addTo(map);
          if (wp.label) marker.bindPopup(`<b>${wp.label}</b>`);
          if (onWaypointClick) marker.on('click', () => onWaypointClick(wp));
        });
      }

      mapRef.current = map;
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
        droneMarkerRef.current = null;
        polylineRef.current = null;
      }
    };
  }, [containerId]);

  // Update drone marker posisi saat live mode
  useEffect(() => {
    if (!mapRef.current || !droneMarkerRef.current || !dronePosition) return;

    const newPos: [number, number] = [dronePosition.lat, dronePosition.lng];
    droneMarkerRef.current.setLatLng(newPos);
    mapRef.current.panTo(newPos, { animate: true, duration: 3.5 });

    // Path Terbang
    if (polylineRef.current) {
      pathHistoryRef.current = [...pathHistoryRef.current.slice(-30), newPos];
      polylineRef.current.setLatLngs(pathHistoryRef.current);
    }
  }, [dronePosition]);

  return (
    <div
      className="relative w-full overflow-hidden dark:bg-[#111] border border-gray-200 dark:border-[#222] flex flex-col justify-between select-none shadow-xs"
      style={{ height: typeof height === 'number' ? `${height}px` : height, minHeight: '190px' }}
    >
      {/* Leaflet CSS */}
      <link
        rel="stylesheet"
        href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css"
        crossOrigin=""
      />
      <div className='flex justify-between items-center px-2 py-0.5'>
        <div className="px-2.5 py-1">
          <h3 className="text-[11px] font-bold tracking-wider text-gray-700 dark:text-gray-300 uppercase">GPS MAP</h3>
        </div>
      </div>

      {/* Map Container */}
      <div
        id={containerId}
        className="w-full flex-1 z-0"
        style={{ minHeight: '150px' }}
      />
    </div>
  );
}
