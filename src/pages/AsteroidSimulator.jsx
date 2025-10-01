import { useState, useEffect, Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import { OrbitControls, Stars, Sphere } from '@react-three/drei';
import { MapContainer, TileLayer, Circle, Popup } from 'react-leaflet';
import { motion } from 'framer-motion';
import { Rocket, Target, Zap, Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import useAsteroidStore from '../store/asteroidStore';
import { browseAsteroids, extractAsteroidData, getFallbackAsteroids } from '../utils/nasaApi';
import { calculateImpactEnergy, energyToTNT, calculateCraterSize, calculateSeismicMagnitude } from '../utils/impactCalculations';
import 'leaflet/dist/leaflet.css';

// 3D Earth Component
const Earth = () => {
  return (
    <Sphere args={[2, 64, 64]}>
      <meshStandardMaterial color="#0077be" roughness={0.5} metalness={0.2} />
    </Sphere>
  );
};

// 3D Asteroid
const Asteroid = ({ position, size }) => {
  return (
    <mesh position={position}>
      <icosahedronGeometry args={[size, 1]} />
      <meshStandardMaterial color="#888" roughness={0.8} />
    </mesh>
  );
};

// Trajectory Line
const TrajectoryLine = ({ start, end }) => {
  const points = [];
  for (let i = 0; i <= 50; i++) {
    const t = i / 50;
    points.push([
      start[0] + (end[0] - start[0]) * t,
      start[1] + (end[1] - start[1]) * t,
      start[2] + (end[2] - start[2]) * t
    ]);
  }
  
  return (
    <line>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={points.length}
          array={new Float32Array(points.flat())}
          itemSize={3}
        />
      </bufferGeometry>
      <lineBasicMaterial color="#ff0000" linewidth={2} />
    </line>
  );
};

const AsteroidSimulator = () => {
  const {
    diameter,
    velocity,
    angle,
    mass,
    deflectionMethod,
    deltaV,
    updateParameter,
    setDeflection,
    selectedAsteroid
  } = useAsteroidStore();

  const [asteroidList, setAsteroidList] = useState([]);
  const [impactResults, setImpactResults] = useState(null);
  const [missionStatus, setMissionStatus] = useState('pending');
  const [impactLocation, setImpactLocation] = useState([20, -40]); // Default lat/lng

  useEffect(() => {
    // Load asteroid data
    const loadAsteroids = async () => {
      try {
        const data = await browseAsteroids(0);
        setAsteroidList(data || getFallbackAsteroids());
      } catch (error) {
        setAsteroidList(getFallbackAsteroids());
      }
    };
    loadAsteroids();
  }, []);

  useEffect(() => {
    // Calculate impact when parameters change
    calculateImpact();
  }, [diameter, velocity, angle, mass, deltaV]);

  const calculateImpact = () => {
    const energy = calculateImpactEnergy(mass, velocity - deltaV);
    const tnt = energyToTNT(energy);
    const craterSize = calculateCraterSize(energy, angle);
    const seismic = calculateSeismicMagnitude(energy);

    const deflected = deltaV >= velocity * 0.1; // 10% velocity change deflects

    setImpactResults({
      energy: energy.toExponential(2),
      tnt: tnt.toFixed(2),
      craterSize: craterSize.toFixed(2),
      seismicMagnitude: seismic.toFixed(2),
      deflected
    });

    setMissionStatus(deflected ? 'success' : 'impact');
  };

  const handleAsteroidSelect = (asteroidData) => {
    const extracted = extractAsteroidData(asteroidData);
    updateParameter('diameter', extracted.diameter);
    updateParameter('velocity', extracted.velocity);
    updateParameter('mass', extracted.mass);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              Asteroid Impact Simulator
            </h1>
            <p className="text-xl text-muted-foreground">
              Model trajectories, predict impacts, and test defense strategies
            </p>
          </motion.div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* 3D Visualization - Center/Left */}
            <div className="lg:col-span-2 space-y-6">
              {/* 3D Orbit View */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="bg-card border border-border rounded-xl p-4 h-[500px]"
              >
                <h3 className="text-lg font-semibold mb-2">3D Orbit Visualization</h3>
                <div className="w-full h-full">
                  <Canvas camera={{ position: [8, 5, 8], fov: 60 }}>
                    <ambientLight intensity={0.5} />
                    <pointLight position={[10, 10, 10]} intensity={1} />
                    <Stars radius={300} depth={50} count={3000} factor={4} />
                    <Earth />
                    <Asteroid position={[5, 0, 0]} size={diameter * 0.5} />
                    <TrajectoryLine start={[10, 2, 0]} end={[2.5, 0.5, 0]} />
                    <OrbitControls enableZoom enablePan autoRotate autoRotateSpeed={0.3} />
                  </Canvas>
                </div>
              </motion.div>

              {/* Impact Map */}
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-xl p-4 h-[400px]"
              >
                <h3 className="text-lg font-semibold mb-2">Impact Location & Effects</h3>
                <div className="w-full h-full rounded-lg overflow-hidden">
                  <MapContainer
                    center={impactLocation}
                    zoom={5}
                    style={{ height: '100%', width: '100%' }}
                  >
                    <TileLayer
                      url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                      attribution='&copy; OpenStreetMap contributors'
                    />
                    <Circle
                      center={impactLocation}
                      radius={impactResults ? parseFloat(impactResults.craterSize) * 1000 : 10000}
                      pathOptions={{ color: 'red', fillColor: 'red', fillOpacity: 0.4 }}
                    >
                      <Popup>
                        <div className="text-sm">
                          <p className="font-bold">Impact Zone</p>
                          <p>Crater: {impactResults?.craterSize} km</p>
                          <p>Magnitude: {impactResults?.seismicMagnitude}</p>
                        </div>
                      </Popup>
                    </Circle>
                  </MapContainer>
                </div>
              </motion.div>
            </div>

            {/* Control Panel - Right Sidebar */}
            <div className="space-y-6">
              {/* Asteroid Selection */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-primary" />
                  Select Asteroid
                </h3>
                <select
                  className="w-full p-2 rounded-lg bg-background border border-border text-sm"
                  onChange={(e) => {
                    const asteroid = asteroidList[e.target.value];
                    if (asteroid) handleAsteroidSelect(asteroid);
                  }}
                >
                  <option>Choose from NASA data...</option>
                  {asteroidList.slice(0, 20).map((asteroid, idx) => (
                    <option key={asteroid.id} value={idx}>
                      {asteroid.name}
                    </option>
                  ))}
                </select>
              </motion.div>

              {/* Parameters */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                <h3 className="text-lg font-semibold mb-4">Parameters</h3>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm text-muted-foreground">Diameter (km)</label>
                    <input
                      type="range"
                      min="0.1"
                      max="10"
                      step="0.1"
                      value={diameter}
                      onChange={(e) => updateParameter('diameter', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-sm font-mono">{diameter.toFixed(1)} km</span>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Velocity (km/s)</label>
                    <input
                      type="range"
                      min="5"
                      max="50"
                      step="1"
                      value={velocity}
                      onChange={(e) => updateParameter('velocity', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-sm font-mono">{velocity} km/s</span>
                  </div>

                  <div>
                    <label className="text-sm text-muted-foreground">Impact Angle (°)</label>
                    <input
                      type="range"
                      min="15"
                      max="90"
                      step="5"
                      value={angle}
                      onChange={(e) => updateParameter('angle', parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-sm font-mono">{angle}°</span>
                  </div>
                </div>
              </motion.div>

              {/* Defense Strategy */}
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="bg-card border border-border rounded-xl p-4"
              >
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-secondary" />
                  Planetary Defense
                </h3>
                <div className="space-y-4">
                  <select
                    className="w-full p-2 rounded-lg bg-background border border-border text-sm"
                    value={deflectionMethod}
                    onChange={(e) => setDeflection(e.target.value, deltaV)}
                  >
                    <option value="kinetic">Kinetic Impactor 🚀</option>
                    <option value="ion">Ion Thruster 🔋</option>
                    <option value="nuclear">Nuclear Blast ☢️</option>
                    <option value="gravity">Gravity Tractor 🛸</option>
                  </select>

                  <div>
                    <label className="text-sm text-muted-foreground">Delta-V (km/s)</label>
                    <input
                      type="range"
                      min="0"
                      max="5"
                      step="0.1"
                      value={deltaV}
                      onChange={(e) => setDeflection(deflectionMethod, parseFloat(e.target.value))}
                      className="w-full"
                    />
                    <span className="text-sm font-mono">{deltaV.toFixed(1)} km/s</span>
                  </div>
                </div>
              </motion.div>

              {/* Results */}
              {impactResults && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className={`rounded-xl p-4 border-2 ${
                    missionStatus === 'success'
                      ? 'bg-green-500/10 border-green-500'
                      : 'bg-destructive/10 border-destructive'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-4">
                    {missionStatus === 'success' ? (
                      <>
                        <CheckCircle className="w-6 h-6 text-green-500" />
                        <h3 className="font-bold text-green-500">Earth Saved! 🌍</h3>
                      </>
                    ) : (
                      <>
                        <AlertTriangle className="w-6 h-6 text-destructive" />
                        <h3 className="font-bold text-destructive">Impact Imminent</h3>
                      </>
                    )}
                  </div>
                  <div className="space-y-2 text-sm">
                    <p><strong>Energy:</strong> {impactResults.energy} J</p>
                    <p><strong>TNT Equivalent:</strong> {impactResults.tnt} MT</p>
                    <p><strong>Crater Size:</strong> {impactResults.craterSize} km</p>
                    <p><strong>Seismic Magnitude:</strong> {impactResults.seismicMagnitude}</p>
                  </div>
                </motion.div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
};

export default AsteroidSimulator;
