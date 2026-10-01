"use client";

import React, { useState, useEffect, useMemo } from 'react';
import Map, { Marker } from 'react-map-gl/maplibre';
import * as maplibregl from 'maplibre-gl';
import DeckGL from '@deck.gl/react';
import { PathLayer, LineLayer } from '@deck.gl/layers';
import type { MapViewState } from '@deck.gl/core';
import 'maplibre-gl/dist/maplibre-gl.css';
import MapWaypoint from './drone-map';

if (typeof window !== 'undefined') {
  maplibregl.setWorkerUrl('/maplibre-gl-worker.mjs');
}

type MapWaypoint = any;

type DroneMapClientProps = {
  mode: 'live' | 'waypoints';
  dronePosition: { lat: number; lng: number; yaw?: number };
  operatorPosition: { lat: number; lng: number };
  waypoints: MapWaypoint[];
  onWaypointClick?: (wp: MapWaypoint) => void;
};

export default function DroneMapClient({
  mode,
  dronePosition,
  operatorPosition,
  waypoints,
  onWaypointClick
}: DroneMapClientProps) {
  const [pathHistory, setPathHistory] = useState<[number, number][]>([]);
  const [isZoomedOut, setIsZoomedOut] = useState(false);
  const isHomeSet = operatorPosition.lat !== dronePosition.lat || operatorPosition.lng !== dronePosition.lng;
  
  const [viewState, setViewState] = useState<MapViewState>({
    longitude: dronePosition?.lng || operatorPosition.lng,
    latitude: dronePosition?.lat || operatorPosition.lat,
    zoom: 17,
    pitch: 0,
    bearing: 0,
  });

  useEffect(() => {
    if (dronePosition && mode === 'live') {
      const newPos: [number, number] = [dronePosition.lng, dronePosition.lat];
      
      setPathHistory(prev => {
        if (prev.length > 0) {
          const lastPos = prev[prev.length - 1];
          if (lastPos[0] === newPos[0] && lastPos[1] === newPos[1]) {
            return prev; 
          }
        }

        const history = [...prev, newPos];
        return history.length > 150 ? history.slice(history.length - 150) : history;
      });
      
      setViewState(prev => ({
        ...prev,
        longitude: newPos[0],
        latitude: newPos[1],
        transitionDuration: 500,
      }));
    }
  }, [dronePosition.lat, dronePosition.lng, mode]);

  const layers = useMemo(() => {
    const dronePosArr = [dronePosition.lng, dronePosition.lat];
    const homePosArr = [operatorPosition.lng, operatorPosition.lat];

    return [
      new PathLayer({
        id: 'flight-path',
        data: [{ path: pathHistory }],
        getPath: d => d.path,
        getColor: [56, 189, 248, 255],
        widthMinPixels: 2.5,
        jointRounded: true,
      }),
      new LineLayer({
        id: 'direct-home-path',
        data: [{ source: dronePosArr, target: homePosArr }],
        getSourcePosition: d => d.source,
        getTargetPosition: d => d.target,
        getColor: [248, 113, 113, 200],
        getWidth: 1.5,
      })
    ];
  }, [dronePosition.lat, dronePosition.lng, operatorPosition, pathHistory]);

  return (
    <div style={{ position: 'relative', width: '100%', height: '100%' }}>
      <DeckGL
        layers={layers}
        viewState={viewState}
        onViewStateChange={({ viewState: newViewState }) => {
          setViewState(newViewState);
          if (newViewState.zoom < 15.5 && !isZoomedOut) setIsZoomedOut(true);
          if (newViewState.zoom >= 15.5 && isZoomedOut) setIsZoomedOut(false);
        }}
        controller={{ doubleClickZoom: false, touchRotate: true }}
      >
        <Map
          mapLib={maplibregl}
          mapStyle="https://basemaps.cartocdn.com/gl/voyager-gl-style/style.json"
          reuseMaps
          attributionControl={false}
        >
          <Marker longitude={operatorPosition.lng} latitude={operatorPosition.lat} anchor="center">
            <div style={{
              backgroundColor: '#EAB308', color: 'black', fontWeight: 900,
              border: '2px solid white', borderRadius: '50%',
              width: '24px', height: '24px',
              display: 'flex', justifyContent: 'center', alignItems: 'center',
              boxShadow: isHomeSet
                ? '0 0 10px rgba(234,179,8,0.8)'
                : '0 2px 5px rgba(0,0,0,0.4)',
              fontSize: '12px', fontFamily: 'sans-serif',
              transition: 'box-shadow 0.3s ease'
            }}>H</div>
          </Marker>

          <Marker longitude={dronePosition.lng} latitude={dronePosition.lat} anchor="center">
            <div style={{
              transform: `rotate(${dronePosition.yaw ?? 0}deg)`,
              transition: 'transform 0.3s ease-out',
              filter: 'drop-shadow(0px 2px 4px rgba(0,0,0,0.5))'
            }}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M12 2L3 21l9-4 9 4L12 2z" fill="#38BDF8"/>
              </svg>
            </div>
          </Marker>
        </Map>
      </DeckGL>

      {/* Kompas */}
      <div className="absolute top-2 left-2 flex flex-col pointer-events-none">
        <div 
          onClick={() => setViewState(prev => ({ ...prev, bearing: 0, pitch: 0, transitionDuration: 500 }))}
          className="w-7 h-7 bg-white/80 backdrop-blur-md rounded border border-gray-200 shadow-sm flex flex-col items-center justify-center cursor-pointer pointer-events-auto hover:bg-white active:scale-95 transition-all"
          title="Reset Perspektif ke Utara (North-Up)"
        >
          <span className="text-[9px] font-extrabold text-gray-600 leading-none -mb-0.5 z-10">N</span>
          <svg 
            width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"
            style={{ 
              transform: `rotate(${-viewState.bearing}deg)`, 
              transition: 'transform 0.1s ease-out' 
            }}
          >
            <polygon points="12 2 19 21 12 17 5 21 12 2" fill="#e5e5e5"></polygon>
          </svg>
        </div>
      </div>

      {/* Tombol Smart Zoom Toggle */}
      <div className="absolute top-2 right-2 flex flex-col gap-1.5 pointer-events-none">
        <div 
          onClick={() => {
            const targetZoom = isZoomedOut ? 17 : 14.5;
            setViewState(prev => ({ ...prev, zoom: targetZoom, transitionDuration: 300 }));
            setIsZoomedOut(!isZoomedOut);
          }}
          className="w-7 h-7 bg-white/80 backdrop-blur-md rounded border border-gray-200 shadow-sm flex items-center justify-center font-bold text-gray-500 text-xl leading-none pb-0.5 cursor-pointer pointer-events-auto hover:bg-white active:scale-95 transition-transform"
          title={isZoomedOut ? "Zoom In" : "Zoom Out"}
        >
          {isZoomedOut ? '+' : '-'}
        </div>
      </div>
      
      {/* Tombol Return to Home */}
      <div className="absolute bottom-2 right-2 flex flex-col gap-1.5 pointer-events-none">
        <div 
            onClick={() => setViewState(prev => ({ ...prev, longitude: operatorPosition.lng, latitude: operatorPosition.lat, transitionDuration: 1000 }))}
            className="w-7 h-7 bg-white/80 backdrop-blur-md rounded-full border border-gray-200 shadow-sm flex items-center justify-center cursor-pointer pointer-events-auto hover:bg-white active:scale-95 transition-transform"
            title="Return to Home"
            >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#666" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 19 21 12 17 5 21 12 2"></polygon>
          </svg>
        </div>
      </div>
    </div>
  );
}