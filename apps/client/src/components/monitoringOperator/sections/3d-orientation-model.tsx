'use client';

import { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, ContactShadows, Html } from '@react-three/drei'; 
import { DroneModel } from './drone-model';

export default function Orientation3DSection() {
  const [rotation, setRotation] = useState({ x: 0, y: 0, z: 0 });

  useEffect(() => {
    console.log("[DEBUG R3F] 0. Canvas Wrapper di-render.");
  }, []);

  return (
    <div className="flex h-full w-full flex-col overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm">
      <div className="border-b border-gray-100 bg-gray-50/50 px-4 py-3">
        <h3 className="text-sm font-semibold text-gray-800">3D Models Orientation</h3>
        <p className="text-xs text-gray-500">Live Telemetry (Akselerometer & Gyroscope)</p>
      </div>
      
      <div className="relative h-[400px] w-full bg-[#f8f9fa] md:h-[500px]">
        <Canvas 
          camera={{ position: [8, 5, 10], fov: 45 }}
          onCreated={() => console.log("[DEBUG R3F] X. WebGL Context berhasil dibuat.")} // Debug Canvas
        >
          <ambientLight intensity={0.7} />
          <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
          {/* <Environment preset="city" /> */}

          <Suspense fallback={
            <Html center>
              <div className="font-semibold text-gray-500">Memuat Model 3D...</div>
            </Html>
          }>
            <DroneModel targetRotation={rotation} />
            <ContactShadows position={[0, -1.5, 0]} opacity={0.4} scale={8} blur={2.5} far={4} />
          </Suspense>

          <OrbitControls makeDefault enableZoom={true} maxPolarAngle={Math.PI / 2} />
        </Canvas>
      </div>
    </div>
  );
}