import { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Stars } from '@react-three/drei';
import * as THREE from 'three';

// Earth component
const Earth = () => {
  const meshRef = useRef();
  
  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.1;
    }
  });

  return (
    <mesh ref={meshRef} position={[3, -1, -8]}>
      <sphereGeometry args={[1.5, 32, 32]} />
      <meshStandardMaterial 
        color="#4a90e2" 
        emissive="#1a4d7a"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
};

// Moving asteroids
const MovingAsteroids = () => {
  const count = 30;
  const asteroidsRef = useRef();
  
  const asteroids = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 40;
      const y = (Math.random() - 0.5) * 40;
      const z = -Math.random() * 50 - 10;
      const speed = Math.random() * 0.5 + 0.2;
      const size = Math.random() * 0.3 + 0.1;
      const rotationSpeed = (Math.random() - 0.5) * 0.02;
      
      temp.push({
        position: [x, y, z],
        speed,
        size,
        rotationSpeed,
        rotation: [Math.random() * Math.PI, Math.random() * Math.PI, Math.random() * Math.PI]
      });
    }
    return temp;
  }, []);

  useFrame((state, delta) => {
    if (asteroidsRef.current) {
      asteroidsRef.current.children.forEach((child, i) => {
        // Move asteroid toward camera (simulate coming to Earth)
        child.position.z += asteroids[i].speed * delta * 10;
        
        // Reset position when asteroid passes camera
        if (child.position.z > 5) {
          child.position.z = -60;
          child.position.x = (Math.random() - 0.5) * 40;
          child.position.y = (Math.random() - 0.5) * 40;
        }
        
        // Rotate asteroids
        child.rotation.x += asteroids[i].rotationSpeed;
        child.rotation.y += asteroids[i].rotationSpeed * 0.7;
      });
    }
  });

  return (
    <group ref={asteroidsRef}>
      {asteroids.map((asteroid, i) => (
        <mesh
          key={i}
          position={asteroid.position}
          rotation={asteroid.rotation}
        >
          <icosahedronGeometry args={[asteroid.size, 1]} />
          <meshStandardMaterial 
            color="#888888" 
            roughness={0.8} 
            metalness={0.2}
          />
        </mesh>
      ))}
    </group>
  );
};

// Animated particles/dust
const SpaceDust = () => {
  const pointsRef = useRef();
  const count = 1000;
  
  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count);
    
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
      positions[i * 3 + 2] = -Math.random() * 60 - 10;
      velocities[i] = Math.random() * 0.3 + 0.1;
    }
    
    return { positions, velocities };
  }, []);

  useFrame((state, delta) => {
    if (pointsRef.current) {
      const positions = pointsRef.current.geometry.attributes.position.array;
      
      for (let i = 0; i < count; i++) {
        positions[i * 3 + 2] += particles.velocities[i] * delta * 5;
        
        if (positions[i * 3 + 2] > 5) {
          positions[i * 3 + 2] = -70;
          positions[i * 3] = (Math.random() - 0.5) * 50;
          positions[i * 3 + 1] = (Math.random() - 0.5) * 50;
        }
      }
      
      pointsRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial 
        size={0.05} 
        color="#ffffff" 
        transparent 
        opacity={0.6}
        sizeAttenuation 
      />
    </points>
  );
};

const AnimatedSpaceBackground = () => {
  return (
    <div className="absolute inset-0 z-0">
      <Canvas camera={{ position: [0, 0, 5], fov: 75 }}>
        <ambientLight intensity={0.2} />
        <pointLight position={[10, 10, 10]} intensity={1} color="#ffffff" />
        <pointLight position={[-10, -10, 5]} intensity={0.5} color="#4a90e2" />
        
        <Stars radius={300} depth={50} count={5000} factor={4} fade speed={1} />
        <Earth />
        <MovingAsteroids />
        <SpaceDust />
      </Canvas>
      
      {/* Shiny overlay effect */}
      <div className="absolute inset-0 bg-gradient-to-br from-primary/20 via-transparent to-secondary/20 animate-pulse pointer-events-none" />
    </div>
  );
};

export default AnimatedSpaceBackground;
