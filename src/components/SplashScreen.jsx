import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const GlowingAsteroid = () => {
  const asteroidRef = useRef();
  const glowRef = useRef();
  const time = useRef(0);

  useFrame((state, delta) => {
    time.current += delta;
    
    if (asteroidRef.current) {
      asteroidRef.current.rotation.x += 0.02;
      asteroidRef.current.rotation.y += 0.03;
      asteroidRef.current.rotation.z += 0.01;
    }

    if (glowRef.current) {
      const pulse = 1 + Math.sin(time.current * 3) * 0.3;
      glowRef.current.scale.setScalar(pulse);
      glowRef.current.material.opacity = 0.4 + Math.sin(time.current * 3) * 0.2;
    }
  });

  return (
    <group>
      {/* Core Asteroid */}
      <mesh ref={asteroidRef}>
        <dodecahedronGeometry args={[1.5, 1]} />
        <meshStandardMaterial
          color="#c084fc"
          emissive="#a855f7"
          emissiveIntensity={1.5}
          metalness={0.8}
          roughness={0.3}
        />
      </mesh>

      {/* Inner Glow */}
      <mesh scale={1.8}>
        <dodecahedronGeometry args={[1.5, 1]} />
        <meshBasicMaterial
          color="#c084fc"
          transparent
          opacity={0.4}
        />
      </mesh>

      {/* Outer Pulsing Glow */}
      <mesh ref={glowRef} scale={2.5}>
        <sphereGeometry args={[1.5, 32, 32]} />
        <meshBasicMaterial
          color="#a855f7"
          transparent
          opacity={0.3}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Rings */}
      <mesh rotation={[Math.PI / 4, 0, 0]}>
        <torusGeometry args={[2.5, 0.05, 16, 100]} />
        <meshBasicMaterial
          color="#00d9ff"
          transparent
          opacity={0.6}
        />
      </mesh>

      <mesh rotation={[0, Math.PI / 4, Math.PI / 4]}>
        <torusGeometry args={[3, 0.04, 16, 100]} />
        <meshBasicMaterial
          color="#ff006e"
          transparent
          opacity={0.5}
        />
      </mesh>

      {/* Point lights for extra glow */}
      <pointLight position={[0, 0, 0]} intensity={2} color="#c084fc" distance={10} />
      <pointLight position={[2, 2, 2]} intensity={1} color="#00d9ff" distance={8} />
      <pointLight position={[-2, -2, 2]} intensity={1} color="#ff006e" distance={8} />
    </group>
  );
};

const StarField = () => {
  const starsRef = useRef();
  
  const starPositions = new Float32Array(1000 * 3);
  for (let i = 0; i < 1000; i++) {
    starPositions[i * 3] = (Math.random() - 0.5) * 50;
    starPositions[i * 3 + 1] = (Math.random() - 0.5) * 50;
    starPositions[i * 3 + 2] = (Math.random() - 0.5) * 50;
  }

  useFrame(() => {
    if (starsRef.current) {
      starsRef.current.rotation.y += 0.0002;
    }
  });

  return (
    <points ref={starsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={1000}
          array={starPositions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.05}
        color="#ffffff"
        transparent
        opacity={0.8}
        sizeAttenuation
      />
    </points>
  );
};

const Scene = () => {
  return (
    <>
      <ambientLight intensity={0.2} />
      <GlowingAsteroid />
      <StarField />
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
      className={`fixed inset-0 z-50 bg-gradient-to-b from-black via-purple-950/20 to-black transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <Canvas
        camera={{ position: [0, 0, 6], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene />
      </Canvas>
      
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <h1 
          className="text-6xl md:text-8xl font-bold mb-4 animate-pulse"
          style={{
            background: 'linear-gradient(135deg, #c084fc, #00d9ff, #ff006e)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            filter: 'drop-shadow(0 0 30px rgba(192, 132, 252, 0.8))',
          }}
        >
          AstroViz
        </h1>
        <p 
          className="text-xl text-white animate-pulse"
          style={{
            filter: 'drop-shadow(0 0 10px rgba(255, 255, 255, 0.6))',
          }}
        >
          Exploring the Cosmos
        </p>
      </div>
    </div>
  );
};

export default SplashScreen;
