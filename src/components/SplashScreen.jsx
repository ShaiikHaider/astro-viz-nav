import { useRef, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere } from '@react-three/drei';
import * as THREE from 'three';

const Earth = () => {
  const earthRef = useRef();
  
  useFrame(() => {
    if (earthRef.current) {
      earthRef.current.rotation.y += 0.002;
    }
  });

  return (
    <group ref={earthRef}>
      <Sphere args={[1.5, 64, 64]} position={[0, 0, 0]}>
        <meshStandardMaterial
          color="#2563eb"
          emissive="#1e40af"
          emissiveIntensity={0.3}
          metalness={0.4}
          roughness={0.7}
        />
      </Sphere>
      {/* Atmosphere glow */}
      <Sphere args={[1.7, 64, 64]} position={[0, 0, 0]}>
        <meshBasicMaterial
          color="#60a5fa"
          transparent
          opacity={0.2}
          side={THREE.BackSide}
        />
      </Sphere>
    </group>
  );
};

const Asteroid = ({ onCollision }) => {
  const asteroidRef = useRef();
  const [collided, setCollided] = useState(false);
  
  useFrame(() => {
    if (asteroidRef.current && !collided) {
      // Move asteroid towards Earth
      asteroidRef.current.position.z += 0.08;
      asteroidRef.current.position.x -= 0.02;
      asteroidRef.current.rotation.x += 0.05;
      asteroidRef.current.rotation.y += 0.03;
      
      // Check collision
      if (asteroidRef.current.position.z > -0.5) {
        setCollided(true);
        onCollision();
      }
    }
  });

  return (
    <group ref={asteroidRef} position={[-8, 2, -25]}>
      <mesh>
        <dodecahedronGeometry args={[0.8, 0]} />
        <meshStandardMaterial
          color="#78716c"
          emissive="#ef4444"
          emissiveIntensity={collided ? 2 : 0.2}
          metalness={0.6}
          roughness={0.4}
        />
      </mesh>
      {/* Asteroid trail glow */}
      <Sphere args={[1.2, 16, 16]}>
        <meshBasicMaterial
          color="#ef4444"
          transparent
          opacity={0.3}
        />
      </Sphere>
    </group>
  );
};

const ImpactFlash = ({ show }) => {
  if (!show) return null;
  
  return (
    <Sphere args={[3, 32, 32]} position={[0, 0, 0]}>
      <meshBasicMaterial
        color="#ffffff"
        transparent
        opacity={0.9}
      />
    </Sphere>
  );
};

const Scene = ({ onComplete }) => {
  const [showImpact, setShowImpact] = useState(false);

  const handleCollision = () => {
    setShowImpact(true);
    setTimeout(() => {
      onComplete();
    }, 800);
  };

  return (
    <>
      <ambientLight intensity={0.3} />
      <pointLight position={[10, 10, 10]} intensity={1} />
      <pointLight position={[-10, -10, -10]} intensity={0.5} color="#c084fc" />
      <directionalLight position={[5, 5, 5]} intensity={0.8} />
      
      <Earth />
      <Asteroid onCollision={handleCollision} />
      <ImpactFlash show={showImpact} />
      
      {/* Stars background */}
      <mesh>
        <sphereGeometry args={[50, 32, 32]} />
        <meshBasicMaterial color="#000000" side={THREE.BackSide} />
      </mesh>
    </>
  );
};

const SplashScreen = ({ onComplete }) => {
  const [fadeOut, setFadeOut] = useState(false);

  const handleAnimationComplete = () => {
    setFadeOut(true);
    setTimeout(onComplete, 1000);
  };

  return (
    <div 
      className={`fixed inset-0 z-50 bg-black transition-opacity duration-1000 ${
        fadeOut ? 'opacity-0' : 'opacity-100'
      }`}
    >
      <Canvas
        camera={{ position: [0, 0, 8], fov: 60 }}
        style={{ width: '100%', height: '100%' }}
      >
        <Scene onComplete={handleAnimationComplete} />
      </Canvas>
      
      <div className="absolute bottom-10 left-0 right-0 text-center">
        <h1 className="text-4xl md:text-6xl font-bold text-white mb-4 animate-pulse">
          AstroViz
        </h1>
        <p className="text-lg text-gray-300">Loading the cosmos...</p>
      </div>
    </div>
  );
};

export default SplashScreen;
