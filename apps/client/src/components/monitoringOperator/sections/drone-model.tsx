'use client';

import { useRef, Suspense, useMemo } from 'react';
import { useGLTF, Environment, ContactShadows, OrbitControls, Html } from '@react-three/drei';
import { useFrame, Canvas } from '@react-three/fiber';
import * as THREE from 'three';
import { Loader2 } from 'lucide-react';

interface DroneModelProps {
  roll: number;
  pitch: number;
  yaw: number;
}

// Komponen Fallback untuk Loading 3D Model
function CanvasLoader() {
  return (
    <Html center>
      <div className="flex flex-col items-center gap-1.5 text-gray-400 dark:text-gray-500 text-xs">
        <Loader2 className="w-3 h-3 animate-spin" />
        <span className="text-[9px] font-bold tracking-wider">Memuat Model...</span>
      </div>
    </Html>
  );
}

function DroneModel({ roll, pitch, yaw }: DroneModelProps) {
  const { scene } = useGLTF('/models/3d-models-drone.glb');
  const groupRef = useRef<THREE.Group>(null);

  const negativeYAxis = useMemo(() => {
    return new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),    // Titik awal di tengah drone
      new THREE.Vector3(0, -6, 0)    // Titik akhir memanjang 6 unit ke bawah
    ]);
  }, []);

  useFrame((_state, delta) => {
    if (groupRef.current) {
      const lerpFactor = 5 * delta; 
      
      const targetX = pitch; 
      const targetY = -yaw;   
      const targetZ = -roll;  

      groupRef.current.rotation.x = THREE.MathUtils.lerp(groupRef.current.rotation.x, targetX, lerpFactor);
      groupRef.current.rotation.y = THREE.MathUtils.lerp(groupRef.current.rotation.y, targetY, lerpFactor);
      groupRef.current.rotation.z = THREE.MathUtils.lerp(groupRef.current.rotation.z, targetZ, lerpFactor);
    }
  });

  return (
    <group ref={groupRef}>
      <primitive 
        object={scene} 
        scale={8.5} 
        position={[0, -0.7, 0]} 
      />

      {/* Garis Sumbu (X=Merah, Y=Hijau, Z=Biru) */}
      {/* <axesHelper args={[6]} />

      <line geometry={negativeYAxis}>
        <lineBasicMaterial color="#00ff00" />
      </line> */}
      
    </group>
  );
}

// Preload agar model langsung tersedia dari cache browser
useGLTF.preload('/models/3d-models-drone.glb');

export default function Drone3DViewer({ roll = 0, pitch = 0, yaw = 0 }: DroneModelProps) {
  return (
    <Canvas 
      // X: -5 (Serong dari arah kiri depan)
      // Y: 3.5 (Melihat sedikit dari atas garis horizontal)
      // Z: 6.5 (Jarak kedalaman yang pas agar skala 7.5 memenuhi layar)
      camera={{ position: [7, 3.5, 6.5], fov: 45 }} 
      style={{ width: '100%', height: '100%', display: 'block' }}
      className="touch-none"
    >
      <ambientLight intensity={0.8} />
      <directionalLight position={[10, 10, 10]} intensity={1.5} castShadow />
      <Environment preset="city" /> 

      <Suspense fallback={<CanvasLoader />}>
        <DroneModel roll={roll} pitch={pitch} yaw={yaw} />
        
        <ContactShadows 
          position={[0, -2.5, 0]} 
          opacity={0.55} 
          scale={15} 
          blur={1.8} 
          far={4.5} 
        />
      </Suspense>

      <OrbitControls 
        enablePan={false} 
        enableZoom={true} 
        minDistance={8} 
        maxDistance={20} 
        target={[0, 0, 0]} 
        // Membatasi rotasi ke bawah dari bawah tanah (underground)
        maxPolarAngle={Math.PI / 2 - 0.05}
        makeDefault
      />
    </Canvas>
  );
}