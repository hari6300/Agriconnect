import { useState, useEffect, useRef } from "react";
import { WeatherAdvisory, HourlyForecastItem, DailyForecastItem } from "../types";
import { 
  CloudRain, 
  Sun, 
  Wind, 
  Droplets, 
  Thermometer, 
  AlertTriangle, 
  Volume2, 
  VolumeX, 
  HelpCircle, 
  ArrowRight, 
  ShieldCheck, 
  MapPin, 
  Clock, 
  Calendar, 
  CloudLightning, 
  Navigation, 
  RefreshCw,
  CloudSun,
  AlertCircle,
  Zap,
  BatteryMedium
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { useBatteryEco } from "../BatteryEcoContext";

interface WeatherBoardProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
  initialCoords?: { lat: number; lon: number } | null;
}

export default function WeatherBoard({ onNotify, initialCoords }: WeatherBoardProps) {
  const { isLowPowerActive } = useBatteryEco();
  const [advisory, setAdvisory] = useState<WeatherAdvisory | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [region, setRegion] = useState("Central Fields (Reg-4)");
  const [gpsCoords, setGpsCoords] = useState<{ lat: number; lon: number; accuracy?: number } | null>(initialCoords || null);
  const [isGPSActive, setIsGPSActive] = useState(!!initialCoords);
  const [gpsWatchId, setGpsWatchId] = useState<number | null>(null);

  // Live real-time clock & telemetry state
  const [liveTime, setLiveTime] = useState<Date>(new Date());
  const [lastSyncedTime, setLastSyncedTime] = useState<Date>(new Date());

  // Update clock every second in standard mode, or throttle to 30s when in Battery Saver mode to save CPU wakes
  useEffect(() => {
    const intervalTime = isLowPowerActive ? 30000 : 1000;
    const clockTimer = setInterval(() => {
      setLiveTime(new Date());
    }, intervalTime);
    return () => clearInterval(clockTimer);
  }, [isLowPowerActive]);


  // Danger Siren state
  const [isSirenPlaying, setIsSirenPlaying] = useState(false);
  const [isSirenMuted, setIsSirenMuted] = useState(false);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const osc1Ref = useRef<OscillatorNode | null>(null);
  const osc2Ref = useRef<OscillatorNode | null>(null);
  const gainNodeRef = useRef<GainNode | null>(null);
  const sirenIntervalRef = useRef<any>(null);

  // Web Audio API Danger Siren synthesizer
  const startSirenSound = () => {
    if (isSirenMuted) return;
    try {
      if (audioCtxRef.current && audioCtxRef.current.state === "running") return;
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return;

      const ctx = new AudioContextClass();
      audioCtxRef.current = ctx;

      const osc1 = ctx.createOscillator();
      const osc2 = ctx.createOscillator();
      const gain = ctx.createGain();

      osc1.type = 'sawtooth';
      osc2.type = 'sine';

      let freq = 600;
      let direction = 1;
      osc1.frequency.setValueAtTime(freq, ctx.currentTime);
      osc2.frequency.setValueAtTime(freq * 1.5, ctx.currentTime);

      gain.gain.setValueAtTime(0.18, ctx.currentTime);

      osc1.connect(gain);
      osc2.connect(gain);
      gain.connect(ctx.destination);

      osc1.start();
      osc2.start();

      osc1Ref.current = osc1;
      osc2Ref.current = osc2;
      gainNodeRef.current = gain;

      sirenIntervalRef.current = setInterval(() => {
        if (!audioCtxRef.current || !osc1Ref.current || !osc2Ref.current) return;
        if (freq >= 1200) direction = -1;
        if (freq <= 600) direction = 1;
        freq += direction * 40;
        
        const now = audioCtxRef.current.currentTime;
        osc1Ref.current.frequency.setTargetAtTime(freq, now, 0.04);
        osc2Ref.current.frequency.setTargetAtTime(freq * 1.2, now, 0.04);
      }, 50);

      setIsSirenPlaying(true);
    } catch (e) {
      console.warn("Could not start Web Audio danger siren automatically:", e);
    }
  };

  const stopSirenSound = () => {
    if (sirenIntervalRef.current) {
      clearInterval(sirenIntervalRef.current);
      sirenIntervalRef.current = null;
    }
    if (gainNodeRef.current && audioCtxRef.current) {
      try {
        gainNodeRef.current.gain.setTargetAtTime(0, audioCtxRef.current.currentTime, 0.08);
        setTimeout(() => {
          osc1Ref.current?.stop();
          osc2Ref.current?.stop();
          audioCtxRef.current?.close();
          audioCtxRef.current = null;
          osc1Ref.current = null;
          osc2Ref.current = null;
          gainNodeRef.current = null;
        }, 120);
      } catch (e) {}
    }
    setIsSirenPlaying(false);
  };

  // Helper to check if weather condition warrants danger siren
  const isSevereRainOrThunderstorm = (cond?: string, rainChance?: number) => {
    if (!cond) return false;
    const c = cond.toLowerCase();
    const severeCondition = c.includes("rain") || c.includes("thunderstorm") || c.includes("storm") || c.includes("heavy") || c.includes("downpour");
    return severeCondition || (rainChance !== undefined && rainChance >= 70);
  };

  // Trigger or stop siren based on weather condition
  useEffect(() => {
    if (advisory && isSevereRainOrThunderstorm(advisory.condition, advisory.rainChance)) {
      if (!isSirenMuted) {
        startSirenSound();
      }
    } else {
      stopSirenSound();
    }

    return () => {
      stopSirenSound();
    };
  }, [advisory, isSirenMuted]);

  const toggleMuteSiren = () => {
    if (isSirenMuted) {
      setIsSirenMuted(false);
      if (advisory && isSevereRainOrThunderstorm(advisory.condition, advisory.rainChance)) {
        startSirenSound();
      }
      onNotify("Danger siren audio unmuted.", "info");
    } else {
      setIsSirenMuted(true);
      stopSirenSound();
      onNotify("Danger siren audio muted.", "info");
    }
  };

  const fetchWeather = async (customCoords?: { lat: number; lon: number }, silent = false) => {
    if (!silent) setIsLoading(true);
    try {
      let url = "/api/weather";
      if (customCoords) {
        url += `?lat=${customCoords.lat}&lon=${customCoords.lon}`;
      } else if (region) {
        url += `?region=${encodeURIComponent(region)}`;
      }

      const res = await fetch(url);
      if (res.ok) {
        const data: WeatherAdvisory = await res.json();
        setAdvisory(data);
        setLastSyncedTime(new Date());

        if (customCoords && !silent) {
          onNotify(`Live GPS location synced: ${data.locationName || 'GPS Node'} (${customCoords.lat.toFixed(2)}°, ${customCoords.lon.toFixed(2)}°)`, "success");
        }

        // Notify farmer if severe rain or thunderstorm is detected!
        if (isSevereRainOrThunderstorm(data.condition, data.rainChance)) {
          onNotify(`🚨 SEVERE WEATHER ALERT: ${data.condition} (${data.rainChance}% rain chance) at ${data.locationName || 'your live position'}! Danger siren activated.`, "error");
        }
      }
    } catch (e) {
      if (!silent) onNotify("Failed to fetch weather forecast.", "error");
    } finally {
      if (!silent) setIsLoading(false);
    }
  };

  // Live GPS tracking trigger (fast acquisition + background watch)
  const handleGPSAcquisition = () => {
    if (!navigator.geolocation) {
      onNotify("Geolocation is not supported by your browser.", "error");
      return;
    }

    if (isGPSActive) {
      // Turn off live GPS tracking
      if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId);
        setGpsWatchId(null);
      }
      setIsGPSActive(false);
      setGpsCoords(null);
      onNotify("Stopped live GPS tracking.", "info");
      return;
    }

    setIsGPSActive(true);
    onNotify("Syncing Live GPS coordinates...", "info");

    // Instant attempt with fast timeout (2.5s) to avoid UI delays
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const coords = {
          lat: position.coords.latitude,
          lon: position.coords.longitude,
          accuracy: Math.round(position.coords.accuracy)
        };
        setGpsCoords(coords);
        fetchWeather(coords, false);

        // Start background watchPosition for ongoing tracking
        const watchId = navigator.geolocation.watchPosition(
          (pos) => {
            const updatedCoords = {
              lat: pos.coords.latitude,
              lon: pos.coords.longitude,
              accuracy: Math.round(pos.coords.accuracy)
            };
            setGpsCoords(updatedCoords);
          },
          null,
          { enableHighAccuracy: false, timeout: 6000, maximumAge: 300000 }
        );
        setGpsWatchId(watchId);
      },
      (error) => {
        setIsGPSActive(false);
        let errorMsg = "GPS signal slow or unavailable. Showing regional weather forecast.";
        if (error.code === 1) {
          errorMsg = "Location permission denied. Showing regional weather forecast.";
        }
        onNotify(errorMsg, "info");
        fetchWeather(undefined, false);
      },
      { enableHighAccuracy: false, timeout: 2500, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    // Automatically load weather conditions & 1-week forecast immediately upon opening
    if (initialCoords) {
      setGpsCoords(initialCoords);
      setIsGPSActive(true);
      fetchWeather(initialCoords, false);
    } else {
      fetchWeather(undefined, false);
    }

    // Automatically update weather conditions every 5 minutes (300,000 ms)
    const weatherAutoUpdateTimer = setInterval(() => {
      fetchWeather(gpsCoords || initialCoords || undefined, true);
    }, 5 * 60 * 1000);

    return () => {
      clearInterval(weatherAutoUpdateTimer);
      if (gpsWatchId !== null) {
        navigator.geolocation.clearWatch(gpsWatchId);
      }
    };
  }, [initialCoords, region]);

  const getWeatherIcon = (condition: string, className = "w-8 h-8") => {
    switch (condition) {
      case 'Rainy':
      case 'Heavy Rain':
        return <CloudRain className={`${className} text-sky-400 animate-bounce`} />;
      case 'Thunderstorm':
        return <CloudLightning className={`${className} text-amber-400 animate-pulse`} />;
      case 'Sunny':
        return <Sun className={`${className} text-amber-500 animate-spin-slow`} />;
      case 'Partly Cloudy':
        return <CloudSun className={`${className} text-sky-300`} />;
      default:
        return <Sun className={`${className} text-amber-400`} />;
    }
  };

  const isDangerActive = advisory && isSevereRainOrThunderstorm(advisory.condition, advisory.rainChance);

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      
      {/* 🚨 DANGER SIREN SEVERE WEATHER ALERT BANNER */}
      <AnimatePresence>
        {isDangerActive && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20 }}
            className="bg-gradient-to-r from-rose-950 via-red-900 to-rose-950 text-white p-4 sm:p-5 rounded-2xl border-2 border-rose-500 shadow-xl relative overflow-hidden flex flex-col sm:flex-row items-center justify-between gap-4"
          >
            {/* Animated background pulse */}
            <div className="absolute inset-0 bg-rose-600/20 animate-pulse pointer-events-none" />

            <div className="flex items-center gap-3.5 relative z-10">
              <div className="w-12 h-12 rounded-full bg-rose-600 border-2 border-rose-300 flex items-center justify-center shrink-0 shadow-lg animate-bounce">
                <AlertTriangle className="w-6 h-6 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded bg-rose-500 text-white text-[9px] font-black uppercase tracking-widest animate-pulse">
                    🚨 DANGER SIREN ACTIVE
                  </span>
                  <span className="text-[10px] font-mono text-rose-200">Live GPS Alert</span>
                </div>
                <h3 className="text-base sm:text-lg font-black tracking-tight text-white mt-1">
                  Severe Weather Alert: {advisory?.condition || "Rainstorm"} ({advisory?.rainChance}% Precipitation)
                </h3>
                <p className="text-xs text-rose-100/90 leading-snug mt-0.5">
                  Torrential rainfall or thunderstorm detected at <span className="font-bold underline">{advisory?.locationName || "your live GPS coordinates"}</span>. Protect unharvested crops and secure electrical pump sets immediately.
                </p>
              </div>
            </div>

            {/* Siren Control Controls */}
            <div className="flex items-center gap-2 shrink-0 relative z-10 w-full sm:w-auto justify-end">
              <button
                onClick={toggleMuteSiren}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black shadow-md transition cursor-pointer ${
                  isSirenMuted
                    ? "bg-slate-800 text-slate-200 hover:bg-slate-700 border border-slate-600"
                    : "bg-amber-400 text-slate-950 hover:bg-amber-300 border border-amber-300 animate-pulse"
                }`}
              >
                {isSirenMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
                <span>{isSirenMuted ? "UNMUTE SIREN" : "SILENCE SIREN"}</span>
              </button>

              <button
                onClick={() => {
                  if (isSirenPlaying) stopSirenSound();
                  else startSirenSound();
                }}
                className="p-2.5 bg-rose-900/80 hover:bg-rose-800 rounded-xl border border-rose-600 text-rose-100 text-xs font-bold transition cursor-pointer"
                title="Test Siren Audio"
              >
                <RefreshCw className="w-4 h-4" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* REGION CONTROL & LIVE GPS SCOUTING HEADER WITH LIVE CLOCK & DATE */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl text-white shadow-sm overflow-hidden">
        {/* Real-time Clock & Telemetry Bar */}
        <div className="bg-slate-950/80 border-b border-slate-800 px-4 py-2.5 flex flex-wrap items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-2 bg-emerald-950/60 border border-emerald-800/80 px-2.5 py-1 rounded-lg">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping inline-block" />
              <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider">
                LIVE CLOCK & METEOROLOGY
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
              <Calendar className="w-3.5 h-3.5 text-emerald-400" />
              <span className="font-semibold text-white">
                {liveTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>

            <div className="flex items-center gap-2 text-slate-300 font-mono text-[11px]">
              <Clock className="w-3.5 h-3.5 text-teal-400" />
              <span className="font-bold text-emerald-400 bg-slate-900 px-2 py-0.5 rounded border border-slate-700">
                {liveTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3 text-[10px] font-mono text-slate-400">
            <span className="flex items-center gap-1.5">
              <RefreshCw className="w-3 h-3 text-emerald-500 animate-spin-slow" />
              <span>Last Synced: <strong className="text-slate-200">{lastSyncedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true })}</strong></span>
            </span>
            <span className="hidden sm:inline text-slate-600">|</span>
            <span className="hidden sm:inline text-emerald-400/80 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-900/50">
              Auto-Sync: Active (5m)
            </span>
          </div>
        </div>

        {/* Region & GPS Scouting Controls */}
        <div className="p-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center space-x-2">
              <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
              <span className="text-xs sm:text-sm font-bold text-slate-200">Active Location:</span>
              <select
                disabled={isGPSActive}
                className="text-xs font-semibold border border-slate-700 rounded-xl bg-slate-950 px-3 py-1.5 text-emerald-300 focus:outline-emerald-500 disabled:opacity-50 cursor-pointer"
                value={isGPSActive ? "GPS" : region}
                onChange={(e) => {
                  setRegion(e.target.value);
                  onNotify(`Switched scouting region to ${e.target.value}`, "info");
                }}
              >
                {isGPSActive && <option value="GPS">📍 Live GPS Coordinates</option>}
                <option value="Central Fields (Reg-4)">Central Plains (Loam Soil Zone)</option>
                <option value="Northern Foothills (Reg-1)">Northern Foothills (Wet-humid Zone)</option>
                <option value="Deccan Drylands (Reg-7)">Deccan Drylands (Semi-arid Zone)</option>
                <option value="Eastern Delta (Reg-3)">Coastal Delta (Clay Alluvial Zone)</option>
              </select>
            </div>

            <button
              onClick={handleGPSAcquisition}
              className={`flex items-center space-x-2 px-3.5 py-1.5 text-xs rounded-xl border font-black cursor-pointer transition shadow-xs ${
                isGPSActive 
                  ? "bg-emerald-500 text-slate-950 border-emerald-400 animate-pulse" 
                  : "bg-emerald-950/60 text-emerald-300 border-emerald-700/60 hover:bg-emerald-900"
              }`}
            >
              <Navigation className={`w-3.5 h-3.5 ${isGPSActive ? "animate-spin" : ""}`} />
              <span>{isGPSActive ? "📡 GPS TRACKING ACTIVE" : "📍 START LIVE GPS TRACKING"}</span>
            </button>

            {gpsCoords && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                Lat: {gpsCoords.lat.toFixed(4)}° | Lon: {gpsCoords.lon.toFixed(4)}° {gpsCoords.accuracy ? `(±${gpsCoords.accuracy}m)` : ''}
              </span>
            )}
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => fetchWeather(gpsCoords || undefined)}
              className="flex items-center gap-1.5 text-xs font-bold text-emerald-400 hover:text-emerald-300 transition cursor-pointer bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Sync Live Radar ⟳</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center py-20 flex-col gap-3">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-500"></div>
          <p className="text-xs font-mono text-slate-400">Syncing live satellite & Doppler weather radar...</p>
        </div>
      ) : advisory ? (
        <div className="space-y-6">
          
          {/* TOP GRID: MAIN CURRENT WEATHER CARD + HOURLY FORECAST TIMELINE */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* CURRENT WEATHER OVERVIEW CARD */}
            <div className="lg:col-span-4 bg-gradient-to-br from-slate-900 via-emerald-950 to-slate-950 text-white rounded-3xl p-6 shadow-xl border border-emerald-500/20 flex flex-col justify-between relative overflow-hidden">
              <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div>
                <div className="flex justify-between items-start">
                  <div>
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                      <span className="text-[9px] font-mono tracking-widest text-emerald-400 uppercase font-black">
                        Live Meteorological Telemetry
                      </span>
                    </div>
                    <h2 className="text-lg font-black font-display text-white mt-0.5">
                      {advisory.locationName || "Local Agricultural Zone"}
                    </h2>
                  </div>
                  {advisory.source && (
                    <span className="text-[8px] font-mono text-emerald-300 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                      {advisory.source}
                    </span>
                  )}
                </div>

                {/* Live Time & Date Badge */}
                <div className="mt-3 flex flex-wrap items-center gap-2 text-[10px] font-mono bg-slate-950/80 p-2 rounded-xl border border-emerald-900/60">
                  <div className="flex items-center gap-1 text-emerald-300">
                    <Calendar className="w-3 h-3 text-emerald-400 shrink-0" />
                    <span>{liveTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric", year: "numeric" })}</span>
                  </div>
                  <span className="text-slate-600">•</span>
                  <div className="flex items-center gap-1 text-emerald-400 font-bold">
                    <Clock className="w-3 h-3 text-teal-400 shrink-0" />
                    <span>{liveTime.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: true })}</span>
                  </div>
                </div>

                <div className="flex items-center space-x-5 mt-5">
                  <div className="p-3 rounded-2xl bg-white/5 border border-white/10 shadow-inner">
                    {getWeatherIcon(advisory.condition, "w-14 h-14")}
                  </div>
                  <div>
                    <h3 className="text-4xl font-black font-sans tracking-tight text-white">{advisory.temperature}°C</h3>
                    <p className="text-xs font-semibold text-emerald-200 mt-1">
                      {advisory.condition} — Humidity {advisory.humidity}%
                    </p>
                  </div>
                </div>
              </div>

              {/* Minor Weather Metrics */}
              <div className="grid grid-cols-2 gap-3 mt-5 pt-4 border-t border-white/10 text-xs">
                <div className="flex items-center space-x-2.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <CloudRain className="w-4 h-4 text-sky-400 shrink-0" />
                  <div>
                    <span className="block text-[9px] font-mono uppercase text-slate-400">Rain Probability</span>
                    <strong className="text-sm font-bold text-white">{advisory.rainChance}%</strong>
                  </div>
                </div>
                <div className="flex items-center space-x-2.5 bg-white/5 p-2.5 rounded-xl border border-white/5">
                  <Wind className="w-4 h-4 text-teal-300 shrink-0" />
                  <div>
                    <span className="block text-[9px] font-mono uppercase text-slate-400">Wind Velocity</span>
                    <strong className="text-sm font-bold text-white">{advisory.windSpeed} km/h</strong>
                  </div>
                </div>
              </div>

              {/* Soil Hydration Agronomist Note & Last Synced Timestamp */}
              <div className="mt-4 space-y-2">
                <div className="bg-emerald-950/80 rounded-xl p-3 border border-emerald-800/60 text-[11px] leading-relaxed text-emerald-100">
                  <AlertCircle className="w-3.5 h-3.5 text-amber-400 inline shrink-0 mr-1.5 align-text-bottom" />
                  <span>
                    <strong>Agronomist Note:</strong> Soil hydration will evaporate {advisory.condition === "Sunny" ? "rapidly under high solar exposure. Keep drip irrigation active." : "slowly under humid canopy. Ensure field drains remain unblocked."}
                  </span>
                </div>
                <div className="flex justify-between items-center text-[9px] font-mono text-slate-400 px-1">
                  <span>📡 Radar Synced: <strong className="text-emerald-400">{advisory.lastUpdated || lastSyncedTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })}</strong></span>
                  <span className="text-emerald-300/70">Continuous Live Stream</span>
                </div>
              </div>
            </div>

            {/* HOURLY FORECAST (DISPLAYED IN PLACE OF DYNAMIC ADVISORY STATEMENT) */}
            <div className="lg:col-span-8 bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2.5">
                    <div className="w-8 h-8 rounded-xl bg-emerald-950 border border-emerald-700/60 flex items-center justify-center text-emerald-400">
                      <Clock className="w-4 h-4" />
                    </div>
                    <div>
                      <h3 className="text-sm font-black tracking-wide text-white uppercase font-display">Hourly Weather Forecast</h3>
                      <p className="text-[10px] text-slate-400 font-mono">
                        24-Hour Micro-Climate Timeline • Live Cycle from {liveTime.toLocaleTimeString("en-US", { hour: '2-digit', minute: '2-digit', hour12: true })}
                      </p>
                    </div>
                  </div>
                  <span className="text-[9px] font-mono text-emerald-400 font-bold bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span>8 HOURLY SLOTS</span>
                  </span>
                </div>

                {/* Horizontal Scrollable Hourly Cards */}
                <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 mt-2">
                  {advisory.hourlyForecast?.map((item: HourlyForecastItem, idx: number) => (
                    <div 
                      key={idx}
                      className={`p-3 rounded-2xl border text-center flex flex-col items-center justify-between transition-all duration-200 hover:scale-[1.03] ${
                        item.condition === 'Rainy' || item.condition === 'Thunderstorm' || item.condition === 'Heavy Rain'
                          ? "bg-gradient-to-b from-sky-950/80 to-slate-950 border-sky-800/60"
                          : "bg-slate-950/60 border-slate-800 hover:border-emerald-500/50"
                      }`}
                    >
                      <span className="text-[10px] font-mono font-bold text-slate-300 block mb-2">{item.time}</span>
                      
                      <div className="my-1">
                        {getWeatherIcon(item.condition, "w-7 h-7")}
                      </div>

                      <span className="text-sm font-black text-white mt-1">{item.temp}°C</span>

                      <div className="mt-2 w-full pt-2 border-t border-slate-800/80 space-y-1">
                        <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full block text-center ${
                          item.rainChance > 50 
                            ? "bg-sky-500/20 text-sky-300 border border-sky-500/30" 
                            : "bg-emerald-500/10 text-emerald-400"
                        }`}>
                          ☔ {item.rainChance}%
                        </span>
                        <span className="text-[8px] font-mono text-slate-400 block">
                          💨 {item.windSpeed} km/h
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Dynamic Advisory Statement banner at bottom of hourly view */}
              <div className="mt-5 p-3.5 rounded-2xl bg-emerald-950/40 border border-emerald-800/60 text-xs text-emerald-200 flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <strong className="text-emerald-300 font-bold block mb-0.5">Micro-Climate Advisory Summary:</strong>
                  <p className="text-[11px] leading-relaxed text-slate-300">"{advisory.summary}"</p>
                </div>
              </div>
            </div>
          </div>

          {/* 1-WEEK (7-DAY) WEATHER FORECAST SECTION */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl">
            <div className="flex items-center justify-between mb-5 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-teal-950 border border-teal-700/60 flex items-center justify-center text-teal-400">
                  <Calendar className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-black tracking-wide text-white uppercase font-display">1-Week Weather Forecast</h3>
                  <p className="text-[10px] text-slate-400 font-mono">7-Day Meteorological Trends & Agronomical Field Guidance</p>
                </div>
              </div>
              <span className="text-[10px] font-mono text-teal-300 font-bold bg-teal-950/60 px-3 py-1 rounded-lg border border-teal-800/60">
                PROSPECTIVE WEEKLY OUTLOOK
              </span>
            </div>

            {/* 7-Day Grid Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3.5">
              {advisory.weeklyForecast?.map((dayItem: DailyForecastItem, index: number) => {
                const isRainy = dayItem.rainChance >= 60;

                return (
                  <div
                    key={index}
                    className={`p-4 rounded-2xl border flex flex-col justify-between transition-all duration-200 ${
                      index === 0
                        ? "bg-gradient-to-b from-emerald-950 to-slate-950 border-emerald-500/50 shadow-md ring-1 ring-emerald-500/30"
                        : isRainy
                        ? "bg-slate-950 border-sky-800/50 hover:border-sky-500"
                        : "bg-slate-950/70 border-slate-800 hover:border-slate-700"
                    }`}
                  >
                    <div>
                      {/* Day and Date Header */}
                      <div className="flex justify-between items-center mb-2">
                        <span className={`text-xs font-black uppercase ${index === 0 ? "text-emerald-400" : "text-slate-200"}`}>
                          {dayItem.day}
                        </span>
                        <span className="text-[9px] font-mono text-slate-400">{dayItem.date}</span>
                      </div>

                      {/* Icon & Temp */}
                      <div className="flex items-center justify-between my-3">
                        {getWeatherIcon(dayItem.condition, "w-8 h-8")}
                        <div className="text-right">
                          <span className="text-base font-black text-white">{dayItem.maxTemp}°</span>
                          <span className="text-xs font-bold text-slate-400 ml-1">/ {dayItem.minTemp}°C</span>
                        </div>
                      </div>

                      <p className="text-[10px] font-bold text-slate-300 mb-2 truncate" title={dayItem.condition}>
                        {dayItem.condition}
                      </p>

                      {/* Metrics Badges */}
                      <div className="space-y-1.5 pt-2 border-t border-slate-800/80 text-[10px]">
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Rain Chance</span>
                          <span className={`font-bold font-mono px-1.5 py-0.2 rounded ${isRainy ? "bg-sky-500/20 text-sky-300" : "text-emerald-400"}`}>
                            {dayItem.rainChance}%
                          </span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Humidity</span>
                          <span className="font-mono text-slate-300">{dayItem.humidity}%</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-400">Wind</span>
                          <span className="font-mono text-slate-300">{dayItem.windSpeed} km/h</span>
                        </div>
                      </div>
                    </div>

                    {/* Short Agronomical Note */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/80 text-[9px] text-slate-400 leading-snug line-clamp-2">
                      💡 {dayItem.summary}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* CROP-SPECIFIC DIRECTIVES PANEL */}
          <div className="bg-slate-900 border border-slate-800 text-white rounded-3xl p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                <h3 className="text-sm font-bold text-white uppercase tracking-wider font-display">Crop-Specific Directives & Agronomic Actions</h3>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-lg border border-emerald-800/60">
                Active for {liveTime.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {advisory.cropAdvisories.map((cropAdv, idx) => (
                <div key={idx} className="flex flex-col justify-between p-4 rounded-2xl bg-slate-950 border border-slate-800 hover:border-emerald-500/40 transition">
                  <div className="flex items-start space-x-3">
                    <span className="text-xl">🌾</span>
                    <div>
                      <strong className="text-xs font-bold text-white block">{cropAdv.cropName}</strong>
                      <span className="text-xs text-slate-300 leading-relaxed mt-1 block">{cropAdv.advice}</span>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800 flex justify-end">
                    {cropAdv.actionRequired ? (
                      <span className="bg-amber-500/20 text-amber-300 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-500/30">
                        Action Recommended
                      </span>
                    ) : (
                      <span className="bg-slate-800 text-slate-400 text-[10px] px-2.5 py-0.5 rounded-full">
                        Monitor Only
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center space-x-1">
                <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>Need customized crop protection advice for your land?</span>
              </span>
              <span className="text-emerald-400 font-bold hover:underline cursor-pointer flex items-center space-x-1">
                <span>Scout plant health</span>
                <ArrowRight className="w-3 h-3" />
              </span>
            </div>
          </div>

        </div>
      ) : (
        <div className="text-center py-12 text-slate-400 text-xs">Failed to fetch weather telemetry.</div>
      )}
    </div>
  );
}
