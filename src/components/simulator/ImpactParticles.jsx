import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ImpactParticles = ({ position, active }) => {
  const particlesRef = useRef();
  const timeRef = useRef(0);

  const particleCount = 1000;
  
  const { positions, velocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = [];
    
    for (let i = 0; i < particleCount; i++) {
      // Start at impact point
      pos[i * 3] = position[0];
      pos[i * 3 + 1] = position[1];
      pos[i * 3 + 2] = position[2];
      
      // Random velocities (explosion pattern)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.05 + Math.random() * 0.15;
      
      vel.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.abs(Math.cos(phi) * speed),
        z: Math.sin(phi) * Math.sin(theta) * speed,
      });
    }
    
    return { positions: pos, velocities: vel };
  }, [position, active]);

  useFrame((state, delta) => {
    if (!active || !particlesRef.current) return;
    
    timeRef.current += delta;
    const positionAttribute = particlesRef.current.geometry.getAttribute('position');
    
    for (let i = 0; i < particleCount; i++) {
      const vel = velocities[i];
      
      positionAttribute.setX(i, positionAttribute.getX(i) + vel.x);
      positionAttribute.setY(i, positionAttribute.getY(i) + vel.y - 0.001); // Gravity
      positionAttribute.setZ(i, positionAttribute.getZ(i) + vel.z);
    }
    
    positionAttribute.needsUpdate = true;
    
    // Reset after 3 seconds
    if (timeRef.current > 3) {
      timeRef.current = 0;
    }
  });

  if (!active) return null;

  return (
    <points ref={particlesRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={particleCount}
          array={positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.08}
        color="#ff4400"
        transparent
        opacity={0.8}
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
};

export default ImpactParticles;
