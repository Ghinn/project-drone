'use client';

import { useRef, useEffect } from 'react';
// 1. TAMBAHKAN IMPORT Center DARI DREI
import { useGLTF, Center } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface DroneModelProps {
  targetRotation?: { x: number; y: number; z: number };
}

export function DroneModel({ targetRotation = { x: 0, y: 0, z: 0 } }: DroneModelProps) {
  const { scene } = useGLTF('/models/3d-models-drone.glb');
  const droneRef = useRef<THREE.Group>(null);

  useEffect(() => {
    if (scene) {
      const box = new THREE.Box3().setFromObject(scene);
      const size = box.getSize(new THREE.Vector3());
      // Anda bisa mengklik tanda ▶ pada Vector3 di console Anda nanti untuk melihat ukurannya
      console.log("[DEBUG R3F] Dimensi asli model:", size);
    }
  }, [scene]);

  useFrame((_state, delta) => {
    if (droneRef.current) {
      const lerpFactor = 5 * delta;
      droneRef.current.rotation.x = THREE.MathUtils.lerp(droneRef.current.rotation.x, targetRotation.x, lerpFactor);
      droneRef.current.rotation.y = THREE.MathUtils.lerp(droneRef.current.rotation.y, targetRotation.y, lerpFactor);
      droneRef.current.rotation.z = THREE.MathUtils.lerp(droneRef.current.rotation.z, targetRotation.z, lerpFactor);
    }
  });

  return (
    // 2. BUNGKUS PRIMITIVE DENGAN <Center>
    <Center>
      <primitive 
        object={scene} 
        ref={droneRef}
        // 3. UBAH SKALA KEMBALI KE 1 (Atau coba 10 jika masih tidak terlihat)
        scale={7.5} 
      />
    </Center>
  );
}

useGLTF.preload('/models/3d-models-drone.glb');