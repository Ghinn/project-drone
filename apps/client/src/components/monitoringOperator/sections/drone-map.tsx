"use client";

import React from 'react';
import dynamic from 'next/dynamic';

export type MapWaypoint = {
  lat: number;
  lng: number;
  label?: string;
  status?: 'ok' | 'caution' | 'warning' | 'critical';
  time?: string;
  id?: string;
};

type DroneMapProps = {
  mode?: 'live' | 'waypoints';
  dronePosition: { lat: number; lng: number; yaw?: number };
  operatorPosition?: { lat: number; lng: number };
  waypoints?: MapWaypoint[];
  height?: number | string;
  onWaypointClick?: (wp: MapWaypoint) => void;
  droneOn?: boolean;
  latDisplay?: string;
  lngDisplay?: string;
  altDisplay?: string;
};

// Import Logic 3D Client Tanpa SSR
const DroneMapClient = dynamic(() => import('./drone-map-client'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-full rounded-xl bg-gray-100 dark:bg-[#111] flex items-center justify-center min-h-[210px]">
      <span className="text-xs text-gray-400">Memuat peta GPS 3D...</span>
    </div>
  ),
});

export default function DroneMap({
  mode = 'live',
  dronePosition,
  operatorPosition = dronePosition,
  waypoints = [],
  height = 240,
  onWaypointClick,
  droneOn = true,
  latDisplay,
  lngDisplay,
  altDisplay,
}: DroneMapProps) {

  return (
    <div
      className="relative w-full overflow-hidden dark:bg-[#111] border border-gray-200 dark:border-[#222] flex flex-col justify-between select-none shadow-xs"
      style={{ height: typeof height === 'number' ? `${height}px` : height, minHeight: '190px' }}
    >
      <div className='flex justify-between items-center px-2 py-0.5 absolute top-0 left-0 w-full z-10'>
        <div className="px-2.5 py-1">
          <h3 className="text-[11px] font-bold tracking-wider text-gray-700 dark:text-gray-300 uppercase drop-shadow-sm">GPS MAP</h3>
        </div>
      </div>

      {/* Map Container MapLibre & DeckGL */}
      <div className="w-full h-full">
        <DroneMapClient 
          mode={mode}
          dronePosition={dronePosition}
          operatorPosition={operatorPosition}
          waypoints={waypoints}
          onWaypointClick={onWaypointClick}
        />
      </div>
    </div>
  );
}