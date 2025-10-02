import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';

const AsteroidLogo = ({ isHovered, isClicked }) => {
  const asteroidRef = useRef();
  const glowRef = useRef();
  const tailRef = useRef();
  const trailPositions = useRef([]);
  const sparkles = useRef([]);
  const shootingStarRef = useRef();
  const time = useRef(0);

  // Create irregular asteroid geometry
  const geometry = useMemo(() => {
    const geo = new THREE.IcosahedronGeometry(0.8, 2);
    const positionAttribute = geo.getAttribute('position');
    
    for (let i = 0; i < positionAttribute.count; i++) {
      const x = positionAttribute.getX(i);
      const y = positionAttribute.getY(i);
      const z = positionAttribute.getZ(i);
      const scale = 0.7 + Math.random() * 0.5;
      positionAttribute.setXYZ(i, x * scale, y * scale, z * scale);
    }
    
    geo.computeVertexNormals();
    return geo;
  }, []);

  // Create tail particles
  const tailParticles = useMemo(() => {
    const particles = [];
    for (let i = 0; i < 30; i++) {
      particles.push({
        position: [-i * 0.15, Math.sin(i * 0.3) * 0.1, 0],
        scale: Math.max(0.1, 1 - i * 0.03),
        opacity: Math.max(0.1, 1 - i * 0.035)
      });
    }
    return particles;
  }, []);

  // Spark particles for click effect
  const [clickSparkles, setClickSparkles] = useState([]);

  useFrame((state, delta) => {
    time.current += delta;

    if (asteroidRef.current) {
      // Slow rotation
      asteroidRef.current.rotation.x += 0.005;
      asteroidRef.current.rotation.y += 0.008;
      
      // Orbital motion
      asteroidRef.current.position.x = Math.sin(time.current * 0.5) * 0.1;
      asteroidRef.current.position.y = Math.cos(time.current * 0.5) * 0.05;

      // Hover effect
      const targetScale = isHovered ? 1.15 : 1;
      asteroidRef.current.scale.lerp(
        new THREE.Vector3(targetScale, targetScale, targetScale),
        0.1
      );
    }

    // Glow pulse
    if (glowRef.current) {
      const glowIntensity = isHovered ? 0.4 : 0.25;
      glowRef.current.material.opacity = glowIntensity + Math.sin(time.current * 2) * 0.1;
    }

    // Tail wave animation
    if (tailRef.current) {
      tailRef.current.children.forEach((particle, i) => {
        particle.position.y = Math.sin(time.current * 2 + i * 0.3) * 0.15;
      });
    }

    // Click sparkles
    if (clickSparkles.length > 0) {
      setClickSparkles(prev => 
        prev.map(sparkle => ({
          ...sparkle,
          life: sparkle.life - delta
        })).filter(s => s.life > 0)
      );
    }

    // Shooting star effect (every 12 seconds)
    if (shootingStarRef.current) {
      const shootingStarCycle = (time.current % 12) / 12;
      if (shootingStarCycle < 0.1) {
        shootingStarRef.current.visible = true;
        shootingStarRef.current.position.x = -3 + shootingStarCycle * 60;
        shootingStarRef.current.position.y = 2 - shootingStarCycle * 4;
        shootingStarRef.current.material.opacity = Math.sin(shootingStarCycle * Math.PI * 10) * 0.8;
      } else {
        shootingStarRef.current.visible = false;
      }
    }
  });

  // Trigger sparkles on click
  if (isClicked && clickSparkles.length === 0) {
    const newSparkles = [];
    for (let i = 0; i < 12; i++) {
      const angle = (i / 12) * Math.PI * 2;
      newSparkles.push({
        id: i,
        x: Math.cos(angle) * 2,
        y: Math.sin(angle) * 2,
        life: 0.5
      });
    }
    setClickSparkles(newSparkles);
  }

  return (
    <group>
      {/* Asteroid */}
      <mesh ref={asteroidRef} geometry={geometry}>
        <meshStandardMaterial
          color="#4a4a4a"
          roughness={0.95}
          metalness={0.05}
        />
      </mesh>

      {/* Outer glow halo */}
      <mesh ref={glowRef} scale={1.6}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial
          color="#64B5F6"
          transparent
          opacity={0.25}
          side={THREE.BackSide}
        />
      </mesh>

      {/* Inner glow */}
      <mesh scale={1.3}>
        <sphereGeometry args={[0.8, 32, 32]} />
        <meshBasicMaterial
          color="#00d9ff"
          transparent
          opacity={0.15}
        />
      </mesh>

      {/* Comet tail */}
      <group ref={tailRef}>
        {tailParticles.map((particle, i) => (
          <mesh key={i} position={particle.position} scale={particle.scale}>
            <sphereGeometry args={[0.15, 16, 16]} />
            <meshBasicMaterial
              color="#64B5F6"
              transparent
              opacity={particle.opacity * (isHovered ? 1.2 : 1)}
            />
          </mesh>
        ))}
      </group>

      {/* Click sparkles */}
      {clickSparkles.map(sparkle => (
        <mesh key={sparkle.id} position={[sparkle.x, sparkle.y, 0]}>
          <sphereGeometry args={[0.08, 8, 8]} />
          <meshBasicMaterial
            color="#00d9ff"
            transparent
            opacity={sparkle.life * 2}
          />
        </mesh>
      ))}

      {/* Shooting star streak */}
      <mesh ref={shootingStarRef} visible={false}>
        <planeGeometry args={[0.5, 0.05]} />
        <meshBasicMaterial
          color="#64B5F6"
          transparent
          opacity={0}
        />
      </mesh>

      {/* Ambient light */}
      <pointLight position={[0, 0, 2]} intensity={0.5} color="#64B5F6" />
    </group>
  );
};

const Logo3D = () => {
  const [isHovered, setIsHovered] = useState(false);
  const [isClicked, setIsClicked] = useState(false);

  const handleClick = () => {
    setIsClicked(true);
    setTimeout(() => setIsClicked(false), 100);
  };

  return (
    <div 
      className="relative w-14 h-14 cursor-pointer"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={handleClick}
      style={{
        background: 'radial-gradient(circle, rgba(100, 181, 246, 0.1) 0%, transparent 70%)'
      }}
    >
      <Canvas
        camera={{ position: [0, 0, 5], fov: 50 }}
        style={{ background: 'transparent' }}
      >
        <ambientLight intensity={0.3} />
        <directionalLight position={[2, 2, 5]} intensity={0.5} />
        <AsteroidLogo isHovered={isHovered} isClicked={isClicked} />
      </Canvas>
    </div>
  );
};

export default Logo3D;
