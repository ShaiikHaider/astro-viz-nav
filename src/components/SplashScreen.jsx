import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const RealisticEarth = () => {
  const earthRef = useRef();
  const atmosphereRef = useRef();
  const outerGlowRef = useRef();
  const time = useRef(0);

  useFrame((state, delta) => {
    time.current += delta;
    
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.005;
    }

    if (atmosphereRef.current) {
      const pulse = 1 + Math.sin(time.current * 2) * 0.05;
      atmosphereRef.current.scale.setScalar(pulse);
    }

    if (outerGlowRef.current) {
      const glowPulse = 1 + Math.sin(time.current * 1.5) * 0.1;
      outerGlowRef.current.scale.setScalar(glowPulse);
      outerGlowRef.current.material.opacity = 0.3 + Math.sin(time.current * 2) * 0.1;
    }
  });

  return (
    <group>
      {/* Core Earth with realistic colors */}
      <mesh ref={earthRef}>
        <sphereGeometry args={[1, 64, 64]} />
        <meshPhongMaterial
          color="#1e88e5"
          emissive="#0d47a1"
          emissiveIntensity={0.8}
          shininess={100}
          specular="#ffffff"
        />
      </mesh>

      {/* Continents overlay */}
      <mesh>
        <sphereGeometry args={[1.01, 64, 64]} />
        <meshPhongMaterial
          color="#2e7d32"
          emissive="#1b5e20"
          emissiveIntensity={0.5}
          transparent
          opacity={0.8}
          shininess={50}
        />
      </mesh>

      {/* Inner atmosphere glow */}
      <mesh ref={atmosphereRef} scale={1.15}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#64b5f6"
          transparent
          opacity={0.4}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Middle glow layer */}
      <mesh scale={1.25}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#42a5f5"
          transparent
          opacity={0.25}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Outer pulsing glow */}
      <mesh ref={outerGlowRef} scale={1.4}>
        <sphereGeometry args={[1, 32, 32]} />
        <meshBasicMaterial
          color="#2196f3"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Extreme outer halo */}
      <mesh scale={1.6}>
        <sphereGeometry args={[1, 16, 16]} />
        <meshBasicMaterial
          color="#90caf9"
          transparent
          opacity={0.1}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Bright point lights for realistic lighting */}
      <pointLight position={[3, 0, 0]} intensity={3} color="#ffffff" distance={8} />
      <pointLight position={[-1, 2, 2]} intensity={1.5} color="#64b5f6" distance={6} />
      <pointLight position={[-1, -2, 2]} intensity={1.5} color="#42a5f5" distance={6} />
    </group>
  );
};

const OrbitRing = () => {
  const ringRef = useRef();

  useFrame(() => {
    if (ringRef.current) {
      ringRef.current.rotation.z += 0.01;
    }
  });

  return (
    <mesh ref={ringRef} rotation={[Math.PI / 2.5, 0, 0]}>
      <torusGeometry args={[1.8, 0.01, 16, 100]} />
      <meshBasicMaterial
        color="#00d9ff"
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
      />
    </mesh>
  );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[5, 3, 5]} intensity={2} />
      <RealisticEarth />
      <OrbitRing />
    </>
  );
};

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    // Start fade out after 4 seconds, complete at 5 seconds
    const timer = setTimeout(() => {
      setFadeOut(true);
    }, 4000);

    const completeTimer = setTimeout(() => {
      onComplete();
    }, 5000);

    return () => {
      clearTimeout(timer);
      clearTimeout(completeTimer);
    };
  }, [onComplete]);

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <div className="w-64 h-64 mb-8">
          <Canvas
            camera={{ position: [0, 0, 4], fov: 50 }}
            style={{ width: '100%', height: '100%' }}
          >
            <Scene />
          </Canvas>
        </div>
        
        <div className="text-center pointer-events-none">
          <h1 
            className="text-5xl md:text-6xl font-bold mb-3 animate-pulse"
            style={{
              background: 'linear-gradient(135deg, #64b5f6, #42a5f5, #2196f3)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              filter: 'drop-shadow(0 0 40px rgba(33, 150, 243, 0.9))',
            }}
          >
            AstroViz
          </h1>
          <div className="flex items-center justify-center gap-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" 
                 style={{ filter: 'drop-shadow(0 0 8px rgba(100, 181, 246, 1))' }} />
            <p 
              className="text-lg text-blue-300 tracking-wider"
              style={{
                filter: 'drop-shadow(0 0 15px rgba(100, 181, 246, 0.8))',
              }}
            >
              INITIALIZING SYSTEMS
            </p>
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" 
                 style={{ filter: 'drop-shadow(0 0 8px rgba(100, 181, 246, 1))' }} />
          </div>
        </div>
      </div>
    </div>
  );
};

export default SplashScreen;
