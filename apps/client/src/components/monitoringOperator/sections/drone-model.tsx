'use client';

import { useRef, useEffect, Suspense } from 'react';
import { useGLTF, Center, Environment, ContactShadows, OrbitControls } from '@react-three/drei';
import { useFrame, Canvas } from '@react-three/fiber';
import * as THREE from 'three';

interface DroneModelProps {
  roll: number;
  pitch: number;
  yaw: number;
}

// 1. Komponen Utama untuk Merender Objek 3D
function DroneModel({ roll, pitch, yaw }: DroneModelProps) {
  // Pastikan path ke model .glb sudah benar
  const { scene } = useGLTF('/models/3d-models-drone.glb');
  const droneRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      console.log("[DEBUG R3F] Dimensi asli model:", size);
    }
  }, [scene]);

  // Animasi per frame yang disinkronisasi dengan delta time
  useFrame((_state, delta) => {
    if (droneRef.current) {
      const lerpFactor = 5 * delta; // Kecepatan smoothing/interpolasi

      // MAPPING KOORDINAT (Sesuaikan minus/plus tergantung orientasi bawaan file .glb Anda)
      // Umumnya: Pitch = X, Yaw = Y, Roll = Z
      const targetX = pitch; 
      const targetY = -yaw;   // Sumbu Y dibalik agar putaran kompas sinkron
      const targetZ = -roll;  // Sumbu Z dibalik agar kemiringan sinkron

      droneRef.current.rotation.x = THREE.MathUtils.lerp(droneRef.current.rotation.x, targetX, lerpFactor);
      droneRef.current.rotation.y = THREE.MathUtils.lerp(droneRef.current.rotation.y, targetY, lerpFactor);
      droneRef.current.rotation.z = THREE.MathUtils.lerp(droneRef.current.rotation.z, targetZ, lerpFactor);
    }
  });

  return (
    <Center>
      <primitive 
        object={scene} 
        ref={droneRef}
        scale={7.5} 
      />
    </Center>
  );
}

// Preload agar model langsung tersedia dari cache browser
// useGLTF.preload('/models/3d-models-drone.glb');

// 2. Komponen Wrapper Canvas (Ini yang akan di-import ke Dashboard)
export default function Drone3DViewer({ roll = 0, pitch = 0, yaw = 0 }: DroneModelProps) {
  return (
    <Canvas 
      camera={{ position: [0, 2.5, 6], fov: 45 }} 
      className="w-full h-full"
    >
      {/* Pencahayaan Lingkungan */}
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 10]} intensity={1} castShadow />
      <Environment preset="city" /> 

      {/* Eksekusi Model dengan efek Loading/Suspense */}
      <Suspense fallback={null}>
        <DroneModel roll={roll} pitch={pitch} yaw={yaw} />
        
        {/* Bayangan di bawah drone untuk kesan realistis */}
        <ContactShadows 
          position={[0, -1.5, 0]} 
          opacity={0.5} 
          scale={15} 
          blur={2} 
          far={4} 
        />
      </Suspense>

      {/* Mengizinkan pengguna memutar kamera, tapi mematikan zoom & pan agar UI tidak tergeser */}
      <OrbitControls enableZoom={false} enablePan={false} />
    </Canvas>
  );
}