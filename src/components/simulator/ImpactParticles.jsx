import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const ImpactParticles = ({ position, active }) => {
  const fireballRef = useRef();
  const debrisRef = useRef();
  const shockwaveRef = useRef();
  const smokeRef = useRef();
  const timeRef = useRef(0);

  const particleCount = 2000; // Increased for more dramatic effect
  const debrisCount = 500;
  const smokeCount = 300;
  
  const { positions, velocities, colors, sizes } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = [];
    const cols = new Float32Array(particleCount * 3);
    const szs = new Float32Array(particleCount);
    
    for (let i = 0; i < particleCount; i++) {
      // Start at impact point
      pos[i * 3] = position[0];
      pos[i * 3 + 1] = position[1];
      pos[i * 3 + 2] = position[2];
      
      // Random velocities (explosion pattern)
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.08 + Math.random() * 0.25;
      
      vel.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.abs(Math.cos(phi) * speed) * 1.2,
        z: Math.sin(phi) * Math.sin(theta) * speed,
      });
      
      // Color gradient: orange to red to yellow
      const colorMix = Math.random();
      if (colorMix < 0.33) {
        cols[i * 3] = 1; // R
        cols[i * 3 + 1] = 0.3 + Math.random() * 0.3; // G
        cols[i * 3 + 2] = 0; // B
      } else if (colorMix < 0.66) {
        cols[i * 3] = 1;
        cols[i * 3 + 1] = 0.1 + Math.random() * 0.2;
        cols[i * 3 + 2] = 0;
      } else {
        cols[i * 3] = 1;
        cols[i * 3 + 1] = 0.8 + Math.random() * 0.2;
        cols[i * 3 + 2] = 0;
      }
      
      // Varying sizes
      szs[i] = 0.05 + Math.random() * 0.15;
    }
    
    return { positions: pos, velocities: vel, colors: cols, sizes: szs };
  }, [position, active]);

  const { debrisPositions, debrisVelocities } = useMemo(() => {
    const pos = new Float32Array(debrisCount * 3);
    const vel = [];
    
    for (let i = 0; i < debrisCount; i++) {
      pos[i * 3] = position[0];
      pos[i * 3 + 1] = position[1];
      pos[i * 3 + 2] = position[2];
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.03 + Math.random() * 0.12;
      
      vel.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.abs(Math.cos(phi) * speed) * 0.8,
        z: Math.sin(phi) * Math.sin(theta) * speed,
      });
    }
    
    return { debrisPositions: pos, debrisVelocities: vel };
  }, [position, active]);

  const { smokePositions, smokeVelocities } = useMemo(() => {
    const pos = new Float32Array(smokeCount * 3);
    const vel = [];
    
    for (let i = 0; i < smokeCount; i++) {
      pos[i * 3] = position[0];
      pos[i * 3 + 1] = position[1];
      pos[i * 3 + 2] = position[2];
      
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.random() * Math.PI;
      const speed = 0.02 + Math.random() * 0.08;
      
      vel.push({
        x: Math.sin(phi) * Math.cos(theta) * speed,
        y: Math.abs(Math.cos(phi) * speed) * 0.5,
        z: Math.sin(phi) * Math.sin(theta) * speed,
      });
    }
    
    return { smokePositions: pos, smokeVelocities: vel };
  }, [position, active]);

  useFrame((state, delta) => {
    if (!active) return;
    
    timeRef.current += delta;
    const progress = timeRef.current / 3;
    
    // Animate fireball particles
    if (fireballRef.current) {
      const positionAttribute = fireballRef.current.geometry.getAttribute('position');
      
      for (let i = 0; i < particleCount; i++) {
        const vel = velocities[i];
        
        positionAttribute.setX(i, positionAttribute.getX(i) + vel.x);
        positionAttribute.setY(i, positionAttribute.getY(i) + vel.y - 0.002); // Gravity
        positionAttribute.setZ(i, positionAttribute.getZ(i) + vel.z);
      }
      
      positionAttribute.needsUpdate = true;
      
      // Fade out over time
      fireballRef.current.material.opacity = Math.max(0, 1 - progress);
    }
    
    // Animate debris
    if (debrisRef.current) {
      const positionAttribute = debrisRef.current.geometry.getAttribute('position');
      
      for (let i = 0; i < debrisCount; i++) {
        const vel = debrisVelocities[i];
        
        positionAttribute.setX(i, positionAttribute.getX(i) + vel.x);
        positionAttribute.setY(i, positionAttribute.getY(i) + vel.y - 0.003); // More gravity
        positionAttribute.setZ(i, positionAttribute.getZ(i) + vel.z);
      }
      
      positionAttribute.needsUpdate = true;
      debrisRef.current.material.opacity = Math.max(0, 0.8 - progress);
    }
    
    // Animate smoke
    if (smokeRef.current) {
      const positionAttribute = smokeRef.current.geometry.getAttribute('position');
      
      for (let i = 0; i < smokeCount; i++) {
        const vel = smokeVelocities[i];
        
        positionAttribute.setX(i, positionAttribute.getX(i) + vel.x * 0.5);
        positionAttribute.setY(i, positionAttribute.getY(i) + vel.y - 0.0005);
        positionAttribute.setZ(i, positionAttribute.getZ(i) + vel.z * 0.5);
      }
      
      positionAttribute.needsUpdate = true;
      smokeRef.current.material.opacity = Math.max(0, 0.6 - progress * 0.8);
    }
    
    // Animate shockwave
    if (shockwaveRef.current) {
      const scale = 1 + progress * 8;
      shockwaveRef.current.scale.set(scale, scale, scale);
      shockwaveRef.current.material.opacity = Math.max(0, 0.6 - progress);
    }
    
    // Reset after 3 seconds
    if (timeRef.current > 3) {
      timeRef.current = 0;
    }
  });

  if (!active) return null;

  return (
    <group>
      {/* Fireball particles */}
      <points ref={fireballRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={positions}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-color"
            count={particleCount}
            array={colors}
            itemSize={3}
          />
          <bufferAttribute
            attach="attributes-size"
            count={particleCount}
            array={sizes}
            itemSize={1}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          vertexColors
          transparent
          opacity={1}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
          sizeAttenuation
        />
      </points>
      
      {/* Debris particles */}
      <points ref={debrisRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={debrisCount}
            array={debrisPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.06}
          color="#6b4423"
          transparent
          opacity={0.8}
          blending={THREE.NormalBlending}
        />
      </points>
      
      {/* Smoke particles */}
      <points ref={smokeRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={smokeCount}
            array={smokePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.2}
          color="#333333"
          transparent
          opacity={0.6}
          blending={THREE.NormalBlending}
        />
      </points>
      
      {/* Shockwave ring */}
      <mesh ref={shockwaveRef} position={position}>
        <ringGeometry args={[0.3, 0.5, 32]} />
        <meshBasicMaterial
          color="#ff6600"
          transparent
          opacity={0.6}
          side={THREE.DoubleSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Central flash */}
      <mesh position={position}>
        <sphereGeometry args={[0.3, 16, 16]} />
        <meshBasicMaterial
          color="#ffff00"
          transparent
          opacity={0.9}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  );
};

export default ImpactParticles;
