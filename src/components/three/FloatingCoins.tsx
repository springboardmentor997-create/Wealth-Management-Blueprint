import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, MeshDistortMaterial } from '@react-three/drei';
import * as THREE from 'three';

const Coin = ({ position, scale, speed }: { position: [number, number, number]; scale: number; speed: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += 0.01 * speed;
      meshRef.current.rotation.x = Math.sin(state.clock.elapsedTime * 0.5) * 0.1;
    }
  });

  return (
    <Float speed={speed} rotationIntensity={0.5} floatIntensity={1}>
      <mesh ref={meshRef} position={position} scale={scale}>
        <cylinderGeometry args={[1, 1, 0.2, 32]} />
        <MeshDistortMaterial
          color="#D4AF37"
          emissive="#8B6914"
          emissiveIntensity={0.3}
          metalness={0.9}
          roughness={0.1}
          distort={0.1}
          speed={2}
        />
      </mesh>
    </Float>
  );
};

const ChartBar = ({ position, height, delay }: { position: [number, number, number]; height: number; delay: number }) => {
  const meshRef = useRef<THREE.Mesh>(null);

  useFrame((state) => {
    if (meshRef.current) {
      const scale = 0.5 + Math.sin(state.clock.elapsedTime * 2 + delay) * 0.2;
      meshRef.current.scale.y = scale * height;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[0.3, 1, 0.3]} />
      <meshStandardMaterial
        color="#14B8A6"
        emissive="#0D9488"
        emissiveIntensity={0.2}
        metalness={0.5}
        roughness={0.3}
      />
    </mesh>
  );
};

const Scene = () => {
  const coins = useMemo(
    () => [
      { position: [-3, 1, -2] as [number, number, number], scale: 0.8, speed: 1.5 },
      { position: [3, 0.5, -1] as [number, number, number], scale: 0.6, speed: 2 },
      { position: [-2, -1, -3] as [number, number, number], scale: 0.5, speed: 1.8 },
      { position: [2.5, 1.5, -2.5] as [number, number, number], scale: 0.7, speed: 1.2 },
      { position: [0, 2, -4] as [number, number, number], scale: 0.9, speed: 1.6 },
    ],
    []
  );

  const bars = useMemo(
    () => [
      { position: [-1.5, -0.5, 0] as [number, number, number], height: 1.2, delay: 0 },
      { position: [-0.75, -0.5, 0] as [number, number, number], height: 1.8, delay: 0.5 },
      { position: [0, -0.5, 0] as [number, number, number], height: 1.4, delay: 1 },
      { position: [0.75, -0.5, 0] as [number, number, number], height: 2.2, delay: 1.5 },
      { position: [1.5, -0.5, 0] as [number, number, number], height: 1.6, delay: 2 },
    ],
    []
  );

  return (
    <>
      <ambientLight intensity={0.4} />
      <pointLight position={[10, 10, 10]} intensity={1} color="#D4AF37" />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#14B8A6" />
      <spotLight
        position={[0, 10, 0]}
        angle={0.3}
        penumbra={1}
        intensity={0.5}
        color="#FBBF24"
      />

      {coins.map((coin, index) => (
        <Coin key={`coin-${index}`} {...coin} />
      ))}

      <group position={[0, -1, 1]}>
        {bars.map((bar, index) => (
          <ChartBar key={`bar-${index}`} {...bar} />
        ))}
      </group>
    </>
  );
};

const FloatingCoins = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas
        camera={{ position: [0, 0, 8], fov: 45 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: 'transparent' }}
      >
        <Scene />
      </Canvas>
    </div>
  );
};

export default FloatingCoins;
