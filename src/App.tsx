import { useState, useEffect, useRef, useCallback } from "react";

interface PlanetData {
  name: string;
  color: string;
  radius: number; // visual radius in px
  orbitRadius: number; // visual orbit radius in px
  realDiameter: string; // km
  realDistance: string; // million km from sun
  orbitalPeriod: string; // Earth days/years
  description: string;
  speed: number; // relative orbital speed
  angle: number; // current angle in radians
  emoji: string;
}

const PLANETS_DATA: Omit<PlanetData, "angle">[] = [
  {
    name: "Mercury",
    color: "#b5b5b5",
    radius: 4,
    orbitRadius: 60,
    realDiameter: "4,879 km",
    realDistance: "57.9 million km",
    orbitalPeriod: "88 days",
    description: "The smallest planet and closest to the Sun. It has no atmosphere and extreme temperature variations.",
    speed: 4.15,
    emoji: "☿"
  },
  {
    name: "Venus",
    color: "#e8cda0",
    radius: 7,
    orbitRadius: 95,
    realDiameter: "12,104 km",
    realDistance: "108.2 million km",
    orbitalPeriod: "225 days",
    description: "The hottest planet with a thick toxic atmosphere. It rotates backwards compared to most planets.",
    speed: 1.62,
    emoji: "♀"
  },
  {
    name: "Earth",
    color: "#4da6ff",
    radius: 7,
    orbitRadius: 135,
    realDiameter: "12,756 km",
    realDistance: "149.6 million km",
    orbitalPeriod: "365.25 days",
    description: "Our home planet! The only known planet with liquid water on its surface and life.",
    speed: 1.0,
    emoji: "🌍"
  },
  {
    name: "Mars",
    color: "#e85d4a",
    radius: 5,
    orbitRadius: 175,
    realDiameter: "6,792 km",
    realDistance: "227.9 million km",
    orbitalPeriod: "687 days",
    description: "The Red Planet. Has the largest volcano (Olympus Mons) and canyon in the solar system.",
    speed: 0.53,
    emoji: "♂"
  },
  {
    name: "Jupiter",
    color: "#d4a574",
    radius: 16,
    orbitRadius: 240,
    realDiameter: "142,984 km",
    realDistance: "778.6 million km",
    orbitalPeriod: "11.86 years",
    description: "The largest planet. Its Great Red Spot is a storm larger than Earth that has raged for centuries.",
    speed: 0.084,
    emoji: "♃"
  },
  {
    name: "Saturn",
    color: "#f0d68a",
    radius: 13,
    orbitRadius: 310,
    realDiameter: "120,536 km",
    realDistance: "1,433.5 million km",
    orbitalPeriod: "29.46 years",
    description: "Famous for its beautiful rings made of ice and rock. It's the least dense planet — it could float in water!",
    speed: 0.034,
    emoji: "♄"
  },
  {
    name: "Uranus",
    color: "#7ec8e3",
    radius: 10,
    orbitRadius: 375,
    realDiameter: "51,118 km",
    realDistance: "2,872.5 million km",
    orbitalPeriod: "84.01 years",
    description: "An ice giant that rotates on its side. It has a blue-green color due to methane in its atmosphere.",
    speed: 0.012,
    emoji: "♅"
  },
  {
    name: "Neptune",
    color: "#4b70dd",
    radius: 9,
    orbitRadius: 430,
    realDiameter: "49,528 km",
    realDistance: "4,495.1 million km",
    orbitalPeriod: "164.8 years",
    description: "The windiest planet with speeds up to 2,100 km/h. It's the farthest planet from the Sun.",
    speed: 0.006,
    emoji: "♆"
  }
];

export default function App() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animationRef = useRef<number>(0);
  const planetsRef = useRef<PlanetData[]>(
    PLANETS_DATA.map((p, i) => ({ ...p, angle: (i * Math.PI) / 4 }))
  );
  const [selectedPlanet, setSelectedPlanet] = useState<PlanetData | null>(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [speed, setSpeed] = useState(1);
  const [hoveredPlanet, setHoveredPlanet] = useState<string | null>(null);
  const lastTimeRef = useRef<number>(0);
  const isPlayingRef = useRef(isPlaying);
  const speedRef = useRef(speed);

  useEffect(() => {
    isPlayingRef.current = isPlaying;
  }, [isPlaying]);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const getCenter = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return { cx: 400, cy: 400 };
    return { cx: canvas.width / 2, cy: canvas.height / 2 };
  }, []);

  const drawSolarSystem = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const { cx, cy } = getCenter();

    // Clear canvas
    ctx.fillStyle = "#0a0a1a";
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw stars background
    drawStars(ctx, canvas.width, canvas.height);

    // Draw orbit paths
    planetsRef.current.forEach((planet) => {
      ctx.beginPath();
      ctx.arc(cx, cy, planet.orbitRadius, 0, Math.PI * 2);
      ctx.strokeStyle = "rgba(255, 255, 255, 0.1)";
      ctx.lineWidth = 1;
      ctx.stroke();
    });

    // Draw Sun
    const sunGradient = ctx.createRadialGradient(cx, cy, 0, cx, cy, 30);
    sunGradient.addColorStop(0, "#fff7a0");
    sunGradient.addColorStop(0.3, "#ffdd00");
    sunGradient.addColorStop(0.7, "#ff8c00");
    sunGradient.addColorStop(1, "#ff4500");
    ctx.beginPath();
    ctx.arc(cx, cy, 30, 0, Math.PI * 2);
    ctx.fillStyle = sunGradient;
    ctx.fill();

    // Sun glow
    const glowGradient = ctx.createRadialGradient(cx, cy, 25, cx, cy, 55);
    glowGradient.addColorStop(0, "rgba(255, 200, 0, 0.3)");
    glowGradient.addColorStop(1, "rgba(255, 100, 0, 0)");
    ctx.beginPath();
    ctx.arc(cx, cy, 55, 0, Math.PI * 2);
    ctx.fillStyle = glowGradient;
    ctx.fill();

    // Draw planets
    planetsRef.current.forEach((planet) => {
      const x = cx + planet.orbitRadius * Math.cos(planet.angle);
      const y = cy + planet.orbitRadius * Math.sin(planet.angle);

      // Planet glow
      const planetGlow = ctx.createRadialGradient(x, y, planet.radius * 0.5, x, y, planet.radius * 2);
      planetGlow.addColorStop(0, planet.color + "40");
      planetGlow.addColorStop(1, "transparent");
      ctx.beginPath();
      ctx.arc(x, y, planet.radius * 2, 0, Math.PI * 2);
      ctx.fillStyle = planetGlow;
      ctx.fill();

      // Planet body
      const planetGradient = ctx.createRadialGradient(
        x - planet.radius * 0.3,
        y - planet.radius * 0.3,
        0,
        x,
        y,
        planet.radius
      );
      planetGradient.addColorStop(0, lightenColor(planet.color, 40));
      planetGradient.addColorStop(1, planet.color);
      ctx.beginPath();
      ctx.arc(x, y, planet.radius, 0, Math.PI * 2);
      ctx.fillStyle = planetGradient;
      ctx.fill();

      // Saturn's rings
      if (planet.name === "Saturn") {
        ctx.beginPath();
        ctx.ellipse(x, y, planet.radius * 2, planet.radius * 0.5, Math.PI / 6, 0, Math.PI * 2);
        ctx.strokeStyle = "#f0d68a88";
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Highlight selected planet
      if (selectedPlanet && selectedPlanet.name === planet.name) {
        ctx.beginPath();
        ctx.arc(x, y, planet.radius + 4, 0, Math.PI * 2);
        ctx.strokeStyle = "#ffffff";
        ctx.lineWidth = 2;
        ctx.setLineDash([4, 4]);
        ctx.stroke();
        ctx.setLineDash([]);
      }

      // Hover effect
      if (hoveredPlanet === planet.name) {
        ctx.beginPath();
        ctx.arc(x, y, planet.radius + 3, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255, 255, 255, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Planet name label
        ctx.font = "12px Arial";
        ctx.fillStyle = "#ffffff";
        ctx.textAlign = "center";
        ctx.fillText(planet.name, x, y - planet.radius - 8);
      }
    });
  }, [getCenter, selectedPlanet, hoveredPlanet]);

  // Stars cache
  const starsRef = useRef<{ x: number; y: number; size: number; brightness: number }[]>([]);

  const drawStars = (ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (starsRef.current.length === 0) {
      for (let i = 0; i < 200; i++) {
        starsRef.current.push({
          x: Math.random() * width,
          y: Math.random() * height,
          size: Math.random() * 1.5 + 0.5,
          brightness: Math.random() * 0.5 + 0.5,
        });
      }
    }
    starsRef.current.forEach((star) => {
      ctx.beginPath();
      ctx.arc(star.x, star.y, star.size, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 255, 255, ${star.brightness})`;
      ctx.fill();
    });
  };

  const lightenColor = (color: string, amount: number): string => {
    const hex = color.replace("#", "");
    const r = Math.min(255, parseInt(hex.substring(0, 2), 16) + amount);
    const g = Math.min(255, parseInt(hex.substring(2, 4), 16) + amount);
    const b = Math.min(255, parseInt(hex.substring(4, 6), 16) + amount);
    return `rgb(${r}, ${g}, ${b})`;
  };

  const animate = useCallback((timestamp: number) => {
    if (!lastTimeRef.current) lastTimeRef.current = timestamp;
    const deltaTime = timestamp - lastTimeRef.current;
    lastTimeRef.current = timestamp;

    if (isPlayingRef.current) {
      planetsRef.current.forEach((planet) => {
        planet.angle += planet.speed * speedRef.current * deltaTime * 0.0005;
      });
    }

    drawSolarSystem();
    animationRef.current = requestAnimationFrame(animate);
  }, [drawSolarSystem]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = () => {
      const container = canvas.parentElement;
      if (container) {
        canvas.width = container.clientWidth;
        canvas.height = container.clientHeight;
        starsRef.current = []; // Reset stars on resize
      }
    };

    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resizeCanvas);
      cancelAnimationFrame(animationRef.current);
    };
  }, [animate]);

  const handleCanvasClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { cx, cy } = getCenter();

    let clicked: PlanetData | null = null;

    planetsRef.current.forEach((planet) => {
      const px = cx + planet.orbitRadius * Math.cos(planet.angle);
      const py = cy + planet.orbitRadius * Math.sin(planet.angle);
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);

      if (dist <= planet.radius + 5) {
        clicked = { ...planet };
      }
    });

    setSelectedPlanet(clicked);
  };

  const handleCanvasMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const { cx, cy } = getCenter();

    let hovered: string | null = null;

    planetsRef.current.forEach((planet) => {
      const px = cx + planet.orbitRadius * Math.cos(planet.angle);
      const py = cy + planet.orbitRadius * Math.sin(planet.angle);
      const dist = Math.sqrt((x - px) ** 2 + (y - py) ** 2);

      if (dist <= planet.radius + 5) {
        hovered = planet.name;
      }
    });

    setHoveredPlanet(hovered);
    canvas.style.cursor = hovered ? "pointer" : "default";
  };

  const speedOptions = [0.25, 0.5, 1, 2, 5, 10];

  return (
    <div className="w-full h-screen bg-[#0a0a1a] flex flex-col overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gradient-to-r from-[#0d0d2b] to-[#1a1a3e] border-b border-white/10">
        <h1 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
          <span className="text-3xl">☀️</span>
          <span className="bg-gradient-to-r from-yellow-300 to-orange-400 bg-clip-text text-transparent">
            Solar System Explorer
          </span>
        </h1>
        <p className="hidden md:block text-sm text-gray-400">
          Click on any planet to learn more
        </p>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col md:flex-row relative">
        {/* Canvas area */}
        <div className="flex-1 relative">
          <canvas
            ref={canvasRef}
            onClick={handleCanvasClick}
            onMouseMove={handleCanvasMouseMove}
            className="w-full h-full"
          />

          {/* Controls overlay */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-3 bg-black/60 backdrop-blur-md rounded-full px-5 py-3 border border-white/10">
            {/* Play/Pause */}
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="w-10 h-10 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 transition-colors text-white"
              title={isPlaying ? "Pause" : "Play"}
            >
              {isPlaying ? (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <rect x="6" y="4" width="4" height="16" />
                  <rect x="14" y="4" width="4" height="16" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                  <polygon points="5,3 19,12 5,21" />
                </svg>
              )}
            </button>

            {/* Speed controls */}
            <div className="flex items-center gap-2">
              <span className="text-xs text-gray-400">Speed:</span>
              <div className="flex gap-1">
                {speedOptions.map((s) => (
                  <button
                    key={s}
                    onClick={() => setSpeed(s)}
                    className={`px-2 py-1 rounded text-xs font-medium transition-all ${
                      speed === s
                        ? "bg-blue-500 text-white"
                        : "bg-white/10 text-gray-300 hover:bg-white/20"
                    }`}
                  >
                    {s}x
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Info Panel */}
        {selectedPlanet && (
          <div className="w-full md:w-80 bg-gradient-to-b from-[#111133] to-[#0d0d2b] border-t md:border-t-0 md:border-l border-white/10 p-5 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-2xl font-bold text-white">{selectedPlanet.name}</h2>
              <button
                onClick={() => setSelectedPlanet(null)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors"
              >
                ✕
              </button>
            </div>

            {/* Planet visual */}
            <div className="flex justify-center mb-6">
              <div
                className="rounded-full shadow-lg animate-pulse"
                style={{
                  width: `${Math.max(60, selectedPlanet.radius * 5)}px`,
                  height: `${Math.max(60, selectedPlanet.radius * 5)}px`,
                  background: `radial-gradient(circle at 35% 35%, ${lightenColor(selectedPlanet.color, 60)}, ${selectedPlanet.color})`,
                  boxShadow: `0 0 30px ${selectedPlanet.color}40, 0 0 60px ${selectedPlanet.color}20`,
                }}
              />
            </div>

            {/* Info cards */}
            <div className="space-y-3">
              <InfoCard
                icon="📏"
                label="Diameter"
                value={selectedPlanet.realDiameter}
              />
              <InfoCard
                icon="🌞"
                label="Distance from Sun"
                value={selectedPlanet.realDistance}
              />
              <InfoCard
                icon="🔄"
                label="Orbital Period"
                value={selectedPlanet.orbitalPeriod}
              />
            </div>

            {/* Description */}
            <div className="mt-5 p-4 bg-white/5 rounded-xl border border-white/10">
              <p className="text-sm text-gray-300 leading-relaxed">
                {selectedPlanet.description}
              </p>
            </div>

            {/* Fun fact */}
            <div className="mt-4 p-3 bg-yellow-500/10 rounded-xl border border-yellow-500/20">
              <p className="text-xs text-yellow-300/80 font-medium">
                💡 Relative orbit speed: {selectedPlanet.speed.toFixed(3)}x Earth's speed
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Planet quick-select bar */}
      <div className="flex items-center justify-center gap-2 px-4 py-2 bg-[#0d0d2b] border-t border-white/10 overflow-x-auto">
        {PLANETS_DATA.map((planet) => (
          <button
            key={planet.name}
            onClick={() => {
              const p = planetsRef.current.find((pp) => pp.name === planet.name);
              if (p) setSelectedPlanet({ ...p });
            }}
            className={`flex flex-col items-center gap-1 px-3 py-1.5 rounded-lg transition-all hover:bg-white/10 ${
              selectedPlanet?.name === planet.name ? "bg-white/15 ring-1 ring-white/30" : ""
            }`}
          >
            <div
              className="rounded-full"
              style={{
                width: `${Math.max(12, planet.radius * 1.5)}px`,
                height: `${Math.max(12, planet.radius * 1.5)}px`,
                background: planet.color,
                boxShadow: `0 0 6px ${planet.color}80`,
              }}
            />
            <span className="text-[10px] text-gray-400 whitespace-nowrap">{planet.name}</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function InfoCard({ icon, label, value }: { icon: string; label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 p-3 bg-white/5 rounded-xl border border-white/5">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-xs text-gray-500 uppercase tracking-wide">{label}</p>
        <p className="text-sm font-semibold text-white">{value}</p>
      </div>
    </div>
  );
}
