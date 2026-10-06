import React, { useState, useEffect, useRef, useCallback } from "react";
import {
  Sprout,
  CloudSun,
  ShoppingBag,
  Wrench,
  Sparkles,
  Landmark,
  LayoutDashboard,
  Bell,
  Menu,
  X,
  User,
  HeartHandshake,
  Check,
  ChevronRight,
  Info,
  FlaskConical,
  MapPin,
  Navigation,
  FileText,
  Calendar,
  LogOut,
  Sun,
  Moon,
  CloudRain,
  AlertTriangle,
  Settings,
  ShieldAlert,
  RefreshCw,
  UserCheck,
  Save,
  Languages,
  BrainCircuit,
  Clock,
  Mic,
  Volume2,
  Radio,
  Battery,
  BatteryCharging,
  BatteryMedium,
  BatteryWarning,
  Zap,
  Leaf
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

// Import modular sub-components
import CropManager from "./components/CropManager";
import WeatherBoard from "./components/WeatherBoard";
import Marketplace from "./components/Marketplace";
import EquipmentRental from "./components/EquipmentRental";
import DiseaseDetector from "./components/DiseaseDetector";
import GovernmentSchemes from "./components/GovernmentSchemes";
import PesticideFertilizerGuide from "./components/PesticideFertilizerGuide";
import MachineLearningStudio from "./components/MachineLearningStudio";
import VoiceDoubtVerificationAgent from "./components/VoiceDoubtVerificationAgent";
import LoginScreen from "./components/LoginScreen";
import { FarmerUser } from "./types";
import agriconnectLogo from "./assets/images/agriconnect_logo_v2_1784827547802.jpg";
import { useLanguage, LanguageSelector } from "./LanguageContext";
import { useBatteryEco } from "./BatteryEcoContext";

type Tab = 'home' | 'voice' | 'crops' | 'weather' | 'market' | 'equipment' | 'ai' | 'schemes' | 'pesticides' | 'bookings' | 'ml';

const SOIL_VARIETIES = [
  {
    id: "clay",
    name: "Clayey Soil",
    bestCrop: "Rice (Basmati Paddy)",
    variety: "Basmati 370",
    seedCostPerAc: 2200,
    fertilizerCostPerAc: 3800,
    laborCostPerAc: 4500,
    irrigationCostPerAc: 1500,
    yieldKgPerAc: 2800,
    description: "Retains water extremely well. Excellent for flood-tolerant paddy roots."
  },
  {
    id: "sandy",
    name: "Sandy Soil",
    bestCrop: "Groundnut (Peanut)",
    variety: "Kadiri-6 Bold",
    seedCostPerAc: 3400,
    fertilizerCostPerAc: 2200,
    laborCostPerAc: 3200,
    irrigationCostPerAc: 1000,
    yieldKgPerAc: 1400,
    description: "Highly porous and aerated. Ideal for root and pod penetration."
  },
  {
    id: "loamy",
    name: "Rich Loamy Soil",
    bestCrop: "Cotton (Bt Hybrid)",
    variety: "Bunny Bt Gold",
    seedCostPerAc: 1900,
    fertilizerCostPerAc: 4500,
    laborCostPerAc: 4800,
    irrigationCostPerAc: 2200,
    yieldKgPerAc: 1100,
    description: "Balanced sand, silt, and clay. Retains perfect organic nutrients."
  },
  {
    id: "black",
    name: "Black Regur Soil",
    bestCrop: "Soybean",
    variety: "JS-335 Quality",
    seedCostPerAc: 2500,
    fertilizerCostPerAc: 3400,
    laborCostPerAc: 3100,
    irrigationCostPerAc: 1200,
    yieldKgPerAc: 950,
    description: "Rich in calcium and moisture. High clay content holds nutrients tightly."
  },
  {
    id: "red",
    name: "Red Laterite Soil",
    bestCrop: "Finger Millet (Ragi)",
    variety: "GPU-28 Elite",
    seedCostPerAc: 850,
    fertilizerCostPerAc: 1600,
    laborCostPerAc: 2200,
    irrigationCostPerAc: 800,
    yieldKgPerAc: 1600,
    description: "Permeable and rich in iron oxides. Perfect for hardy drought crops."
  }
];

const INDIAN_STATES = [
  {
    id: "Telangana",
    districts: [
      "Adilabad",
      "Bhadradri Kothagudem",
      "Hanumakonda",
      "Hyderabad",
      "Jagtial",
      "Jangaon",
      "Jayashankar Bhupalpally",
      "Jogulamba Gadwal",
      "Kamareddy",
      "Karimnagar",
      "Khammam",
      "Kumuram Bheem Asifabad",
      "Mahabubabad",
      "Mahabubnagar",
      "Mancherial",
      "Medak",
      "Medchal-Malkajgiri",
      "Mulugu",
      "Nagarkurnool",
      "Nalgonda",
      "Narayanpet",
      "Nirmal",
      "Nizamabad",
      "Peddapalli",
      "Rajanna Sircilla",
      "Rangareddy",
      "Sangareddy",
      "Siddipet",
      "Suryapet",
      "Vikarabad",
      "Wanaparthy",
      "Warangal",
      "Yadadri Bhuvanagiri"
    ]
  },
  { id: "Maharashtra", districts: ["Amravati", "Nagpur", "Nanded", "Wardha", "Yavatmal"] },
  { id: "Andhra Pradesh", districts: ["Guntur", "Krishna", "Kurnool", "Anantapur"] },
  { id: "Punjab", districts: ["Ludhiana", "Patiala", "Amritsar", "Bathinda"] },
  { id: "Haryana", districts: ["Karnal", "Sirsa", "Hisar", "Rohtak"] }
];

export default function App() {
  const { language, setLanguage, t } = useLanguage();
  const {
    batteryStatus,
    powerMode,
    setPowerMode,
    isLowPowerActive,
    estimatedRemainingHours
  } = useBatteryEco();
  const [currentUser, setCurrentUser] = useState<FarmerUser | null>(() => {

    const stored = localStorage.getItem("agriconnect_farmer");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return null;
      }
    }
    return null;
  });

  const [activeTab, setActiveTab] = useState<Tab>('home');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [toast, setToast] = useState<{ 
    message: string; 
    type: 'success' | 'error' | 'info';
    actionLabel?: string;
    onAction?: () => void;
  } | null>(null);

  const triggerToast = (
    message: string, 
    type: 'success' | 'error' | 'info',
    actionLabel?: string,
    onAction?: () => void
  ) => {
    setToast({ message, type, actionLabel, onAction });
  };

  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    return (localStorage.getItem("agriconnect_theme") as 'light' | 'dark') || 'dark';
  });

  const toggleTheme = () => {
    setTheme(prev => {
      const next = prev === 'dark' ? 'light' : 'dark';
      localStorage.setItem("agriconnect_theme", next);
      return next;
    });
  };

  // Profile Modal & Settings state
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false);
  const [isVoiceModalOpen, setIsVoiceModalOpen] = useState(false);
  const [profileModalTab, setProfileModalTab] = useState<'profile' | 'settings'>('profile');

  // Profile update states
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileName, setProfileName] = useState("");
  const [profilePhone, setProfilePhone] = useState("");
  const [profileAadhaar, setProfileAadhaar] = useState("");
  const [profilePacs, setProfilePacs] = useState("");
  const [profileLandSize, setProfileLandSize] = useState("");
  const [profileState, setProfileState] = useState("");
  const [profileDistrict, setProfileDistrict] = useState("");

  // Crop recommendation interactive sidebar states
  const [sidebarSoilType, setSidebarSoilType] = useState<string>("clay");
  const [sidebarLandSize, setSidebarLandSize] = useState<number>(2);
  const [isPlantingRecommended, setIsPlantingRecommended] = useState<boolean>(false);

  // Sync user details to local states
  useEffect(() => {
    if (currentUser) {
      setSidebarLandSize(currentUser.landSize);
      setLocationName(`${currentUser.district}, ${currentUser.state}`);
      // Refresh default weather based on new district name!
      fetchWeatherForDistrict(currentUser.district);

      setProfileName(currentUser.name);
      setProfilePhone(currentUser.phone);
      setProfileAadhaar(currentUser.aadhaar);
      setProfilePacs(currentUser.pacsId);
      setProfileLandSize(currentUser.landSize.toString());
      setProfileState(currentUser.state);
      setProfileDistrict(currentUser.district);

      // Restore preferred language if set on farmer
      if (currentUser.preferredLanguage && (currentUser.preferredLanguage === 'te' || currentUser.preferredLanguage === 'en')) {
        setLanguage(currentUser.preferredLanguage);
      }
    }
  }, [currentUser]);

  const [pendingFarmer, setPendingFarmer] = useState<FarmerUser | null>(null);
  const [locationPermissionDenied, setLocationPermissionDenied] = useState<boolean>(false);
  const [showSettingsGuide, setShowSettingsGuide] = useState<boolean>(false);

  // Automatically detect user location and open Dashboard if permission is already granted
  const autoDetectAndEnterDashboard = (farmer: FarmerUser) => {
    setIsLocating(true);
    if (!navigator.geolocation) {
      setCoords({ lat: 17.3850, lon: 78.4867 });
      setCurrentUser(farmer);
      setPendingFarmer(null);
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCoords({ lat, lon });
        setIsLocating(false);
        setCurrentUser(farmer);
        setPendingFarmer(null);
        triggerToast("📍 Location detected! Opening AgriConnect Dashboard...", "success");

        try {
          const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            setCurrentWeather(data);
            if (data.locationName) setLocationName(data.locationName);
          }
        } catch (e) {
          // ignore
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === 1) {
          setLocationPermissionDenied(true);
          setPendingFarmer(farmer);
        } else {
          setCoords({ lat: 17.3850, lon: 78.4867 });
          setCurrentUser(farmer);
          setPendingFarmer(null);
        }
      },
      { enableHighAccuracy: false, timeout: 3000, maximumAge: 300000 }
    );
  };

  // Request location permission from the Location Access Window page
  const requestLocationPermissionAndEnter = (farmerTarget?: FarmerUser) => {
    const target = farmerTarget || pendingFarmer;
    if (!target) return;

    setIsLocating(true);
    setLocationPermissionDenied(false);

    if (!navigator.geolocation) {
      triggerToast("Geolocation not supported. Entering dashboard with district location.", "info");
      setCoords({ lat: 17.3850, lon: 78.4867 });
      setCurrentUser(target);
      setPendingFarmer(null);
      setIsLocating(false);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCoords({ lat, lon });
        setIsLocating(false);
        setCurrentUser(target);
        setPendingFarmer(null);
        triggerToast("📍 Location granted! Welcome to AgriConnect Dashboard.", "success");

        try {
          const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            setCurrentWeather(data);
            if (data.locationName) setLocationName(data.locationName);
          }
        } catch (e) {
          // ignore
        }
      },
      (error) => {
        setIsLocating(false);
        if (error.code === 1) {
          // User denied location permission
          setLocationPermissionDenied(true);
          triggerToast("Location permission denied. Please check browser settings or open guide below.", "error");
        } else {
          // Timeout or signal unavailable -> enter with fallback district location
          triggerToast("GPS signal delayed. Opening dashboard with district location.", "info");
          setCoords({ lat: 17.3850, lon: 78.4867 });
          setCurrentUser(target);
          setPendingFarmer(null);
        }
      },
      { enableHighAccuracy: false, timeout: 3500, maximumAge: 300000 }
    );
  };

  const handleLoginSuccess = useCallback(async (farmer: FarmerUser) => {
    const savedLang = localStorage.getItem('agriconnect_lang') as 'en' | 'te';
    const effectiveLang = farmer.preferredLanguage || (savedLang === 'te' || savedLang === 'en' ? savedLang : language);
    const updatedFarmer = { ...farmer, preferredLanguage: effectiveLang };

    localStorage.setItem("agriconnect_farmer", JSON.stringify(updatedFarmer));
    localStorage.setItem("agriconnect_lang", effectiveLang);
    setLanguage(effectiveLang);

    // Directly open the AgriConnect Dashboard
    setCurrentUser(updatedFarmer);
    setActiveTab("home");
    setPendingFarmer(null);
    triggerToast(`Welcome to AgriConnect, ${updatedFarmer.name}!`, "success");

    // Seamlessly pre-populate regional location & weather immediately
    const fallbackDistrict = updatedFarmer.district || "Amravati";
    const fallbackState = updatedFarmer.state || "Maharashtra";
    setLocationName(`${fallbackDistrict}, ${fallbackState}`);
    fetchWeatherForDistrict(fallbackDistrict);

    // Attempt GPS detection asynchronously in background without blocking dashboard entry
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          setCoords({ lat, lon });
          try {
            const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
            if (res.ok) {
              const data = await res.json();
              setCurrentWeather(data);
              if (data.locationName) setLocationName(data.locationName);
            }
          } catch (e) {
            // ignore
          }
        },
        () => {
          // Keep regional weather fallback
        },
        { enableHighAccuracy: false, timeout: 3000, maximumAge: 300000 }
      );
    }
  }, [language]);

  const handleLogout = () => {
    localStorage.removeItem("agriconnect_farmer");
    setCurrentUser(null);
    triggerToast("Successfully logged out from NIC Gateway.", "info");
  };

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) return;

    if (!profileName.trim()) {
      triggerToast("Name is required.", "error");
      return;
    }
    const cleanPhone = profilePhone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      triggerToast("Valid 10-digit Indian mobile number is required.", "error");
      return;
    }
    if (!/^[6-9]/.test(cleanPhone)) {
      triggerToast("Indian mobile number must start with 6, 7, 8, or 9.", "error");
      return;
    }
    if (profileAadhaar.replace(/\s+/g, "").length !== 12) {
      triggerToast("12-digit Aadhaar number is required.", "error");
      return;
    }
    if (!profilePacs.trim()) {
      triggerToast("PACS membership ID is required.", "error");
      return;
    }

    try {
      const res = await fetch("/api/auth/update", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          oldAadhaar: currentUser.aadhaar,
          aadhaar: profileAadhaar,
          phone: profilePhone,
          name: profileName,
          pacsId: profilePacs,
          landSize: parseFloat(profileLandSize) || 1.0,
          state: profileState,
          district: profileDistrict
        })
      });

      const data = await res.json();
      if (res.ok && data.farmer) {
        localStorage.setItem("agriconnect_farmer", JSON.stringify(data.farmer));
        setCurrentUser(data.farmer);
        setIsEditingProfile(false);
        triggerToast("Farmer Registry details successfully updated and saved to secure server!", "success");
      } else {
        triggerToast(data.error || "Failed to update profile registry details.", "error");
      }
    } catch (e) {
      triggerToast("Communication failure with National Agriculture database.", "error");
    }
  };

  const fetchWeatherForDistrict = async (district: string) => {
    try {
      const res = await fetch(`/api/weather?region=${encodeURIComponent(district)}`);
      if (res.ok) {
        const data = await res.json();
        setCurrentWeather(data);
      }
    } catch (e) {
      console.warn("Could not fetch weather for district", district);
    }
  };

  const handlePlantRecommended = async (cropName: string, variety: string, landSize: number, soilName: string, yieldKg: number) => {
    try {
      setIsPlantingRecommended(true);
      const pDate = new Date().toISOString().split("T")[0];
      const hDate = new Date();
      hDate.setDate(hDate.getDate() + 90);
      const expectedHarvestDate = hDate.toISOString().split("T")[0];

      const response = await fetch("/api/crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: cropName,
          variety: variety,
          plantingDate: pDate,
          expectedHarvestDate: expectedHarvestDate,
          stage: "Planted",
          waterStatus: "Optimal",
          lastWatered: pDate,
          waterIntervalDays: 7,
          notes: `Cultivated based on AI-backed recommendation for ${soilName} variety.`,
          areaAcres: landSize,
          expectedYieldKg: yieldKg * landSize
        })
      });

      if (response.ok) {
        triggerToast(`Successfully registered ${cropName} on your land!`, "success");
        // Trigger dashboard data reload
        fetchDashboardStats();
        // Redirect to crops tab to see the new crop
        setActiveTab("crops");
      } else {
        triggerToast("Failed to plant recommended crop.", "error");
      }
    } catch (err) {
      triggerToast("Error communicating with farming database.", "error");
    } finally {
      setIsPlantingRecommended(false);
    }
  };

  // PACS Subsidized bookings list
  const [bookings, setBookings] = useState<any[]>([
    {
      id: "b-1",
      orderId: "PACS/2026/IND/3821",
      date: "28 Jun 2026, 10:14 AM",
      aadhaar: "XXXX XXXX 5432",
      landId: "AP-3810/V",
      items: [
        {
          product: {
            id: "prod-1",
            name: "Chlorantraniliprole 18.5% SC (Coragen)",
            brandName: "FMC Coragen",
            basePrice: 950,
            unit: "60 ml Bottle"
          },
          quantity: 2
        }
      ],
      totalAmount: 1900,
      status: "Ready for Pickup",
      pickupPoint: "Amravati Cooperative Center, Warehouse #2"
    },
    {
      id: "b-2",
      orderId: "PACS/2026/CRT/9012",
      date: "30 Jun 2026, 04:30 PM",
      aadhaar: "XXXX XXXX 5432",
      landId: "AP-3810/V",
      items: [
        {
          product: {
            id: "prod-7",
            name: "NPK 19:19:19 Soluble Fertilizer",
            brandName: "IFFCO NPK",
            basePrice: 160,
            unit: "1 kg Packet"
          },
          quantity: 4
        }
      ],
      totalAmount: 640,
      status: "Collected",
      pickupPoint: "Amravati Cooperative Center, Warehouse #2"
    }
  ]);

  // Notification badge tracking for PACS Bookings status changes
  const [unreadBookingCount, setUnreadBookingCount] = useState<number>(0);
  const [showNotificationMenu, setShowNotificationMenu] = useState<boolean>(false);
  const prevBookingsRef = useRef<Record<string, string>>({});
  const isFirstRender = useRef<boolean>(true);

  useEffect(() => {
    const currentMap: Record<string, string> = {};
    let changed = 0;

    bookings.forEach((b: any) => {
      currentMap[b.id] = b.status;
      const prevStatus = prevBookingsRef.current[b.id];
      if (!isFirstRender.current && prevStatus && prevStatus !== b.status) {
        changed++;
      }
    });

    if (isFirstRender.current) {
      isFirstRender.current = false;
    } else if (changed > 0 && activeTab !== 'bookings') {
      setUnreadBookingCount(prev => prev + changed);
    }

    prevBookingsRef.current = currentMap;
  }, [bookings, activeTab]);

  useEffect(() => {
    if (activeTab === 'bookings') {
      setUnreadBookingCount(0);
    }
  }, [activeTab]);

  const simulatePACSStatusChange = () => {
    if (bookings.length === 0) return;
    setBookings(prev => {
      if (prev.length === 0) return prev;
      const updated = [...prev];
      const target = { ...updated[0] };
      const oldStatus = target.status;
      const nextStatus = oldStatus === "Ready for Pickup" ? "Collected" : "Ready for Pickup";
      target.status = nextStatus;
      updated[0] = target;

      triggerToast(`PACS Order ${target.orderId} status changed: "${oldStatus}" ➔ "${nextStatus}"`, "info");
      return updated;
    });
  };

  // Quick stats loaded for Home Dashboard preview
  const [totalCropsCount, setTotalCropsCount] = useState(0);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [totalMachineryCount, setTotalMachineryCount] = useState(0);
  const [telanganaOverviewPrices, setTelanganaOverviewPrices] = useState<any[]>([]);

  // Live Location and Weather States
  const [locationName, setLocationName] = useState("Amravati, Maharashtra");
  const [coords, setCoords] = useState<{lat: number, lon: number} | null>(null);
  const [currentWeather, setCurrentWeather] = useState<any>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [rainSimActive, setRainSimActive] = useState(true);
  const [liveWeatherClock, setLiveWeatherClock] = useState<Date>(new Date());

  useEffect(() => {
    if (!currentUser) return;
    const timer = setInterval(() => setLiveWeatherClock(new Date()), 1000);
    return () => clearInterval(timer);
  }, [currentUser]);

  const requestLiveLocation = () => {
    if (!navigator.geolocation) {
      triggerToast("Geolocation is not supported by your browser.", "error");
      return;
    }

    setIsLocating(true);
    triggerToast("Requesting live browser GPS location...", "info");

    // Fast GPS request with 2.5s timeout for instant response
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        setCoords({ lat, lon });
        
        try {
          const res = await fetch(`/api/weather?lat=${lat}&lon=${lon}`);
          if (res.ok) {
            const data = await res.json();
            setCurrentWeather(data);
            if (data.locationName) {
              setLocationName(data.locationName);
            }
            triggerToast(`Location successfully synced to ${data.locationName || "GPS coordinates"}`, "success");
          } else {
            triggerToast("Location acquired, but weather resolution failed.", "error");
          }
        } catch (e) {
          triggerToast("Error loading weather for GPS coordinates.", "error");
        } finally {
          setIsLocating(false);
        }
      },
      async (error) => {
        setIsLocating(false);
        // Regional fallback coordinates (Central Fields region)
        const fallbackLat = 17.3850;
        const fallbackLon = 78.4867;
        setCoords({ lat: fallbackLat, lon: fallbackLon });
        try {
          const res = await fetch(`/api/weather?lat=${fallbackLat}&lon=${fallbackLon}`);
          if (res.ok) {
            const data = await res.json();
            setCurrentWeather(data);
            if (data.locationName) {
              setLocationName(data.locationName);
            }
          }
        } catch (e) {
          // ignore fallback fetch error
        }
        if (error.code === 1) {
          triggerToast("GPS permission denied in browser. Loaded regional weather forecast.", "info");
        } else {
          triggerToast("GPS signal delayed. Loaded regional weather forecast.", "info");
        }
      },
      { enableHighAccuracy: false, timeout: 2500, maximumAge: 300000 }
    );
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Fetch counts to display live previews on the Home Dashboard
  const fetchDashboardStats = async () => {
    try {
      const cRes = await fetch("/api/crops");
      const mRes = await fetch("/api/marketplace");
      const eRes = await fetch("/api/equipment");
      const tRes = await fetch("/api/telangana-prices");

      if (cRes.ok && mRes.ok && eRes.ok) {
        const crops = await cRes.json();
        const market = await mRes.json();
        const equip = await eRes.json();

        setTotalCropsCount(crops.length);
        setTotalProductsCount(market.length);
        setTotalMachineryCount(equip.length);
      }

      if (tRes.ok) {
        const tPrices = await tRes.json();
setTelanganaOverviewPrices(tPrices.data || []);
      }
    } catch (e) {
      console.warn("Could not load fresh counts for home dashboard overview");
    }
  };

  useEffect(() => {
    fetchDashboardStats();
    
    const fetchDefaultWeather = async () => {
      try {
        const res = await fetch("/api/weather");
        if (res.ok) {
          const data = await res.json();
          setCurrentWeather(data);
          if (data.locationName) {
            setLocationName(data.locationName);
          }
        }
      } catch (e) {
        console.warn("Could not fetch default weather", e);
      }
    };
    fetchDefaultWeather();

    // Refresh stats periodically
    const interval = setInterval(fetchDashboardStats, 10000);
    return () => clearInterval(interval);
  }, []);

  // Automatically update weather conditions every 5 minutes
  useEffect(() => {
    const refreshWeatherConditions = async () => {
      try {
        const url = coords ? `/api/weather?lat=${coords.lat}&lon=${coords.lon}` : "/api/weather";
        const res = await fetch(url);
        if (res.ok) {
          const data = await res.json();
          setCurrentWeather(data);
          if (data.locationName) {
            setLocationName(data.locationName);
          }
        }
      } catch (e) {
        console.warn("Could not auto-refresh weather conditions", e);
      }
    };

    const weatherTimer = setInterval(refreshWeatherConditions, 5 * 60 * 1000);
    return () => clearInterval(weatherTimer);
  }, [coords]);

  const navItems = [
    { id: 'home' as Tab, label: t.tabHome, icon: LayoutDashboard },
    { id: 'ml' as Tab, label: t.tabMl || "ML Intelligence", icon: BrainCircuit, highlight: true },
    { id: 'crops' as Tab, label: t.tabCrops, icon: Sprout },
    { id: 'weather' as Tab, label: t.tabWeather, icon: CloudSun },
    { id: 'bookings' as Tab, label: t.tabBookings, icon: FileText },
    { id: 'market' as Tab, label: t.tabMarket, icon: ShoppingBag },
    { id: 'equipment' as Tab, label: t.tabEquipment, icon: Wrench },
    { id: 'ai' as Tab, label: t.tabAiDoctor, icon: Sparkles, highlight: true },
    { id: 'schemes' as Tab, label: t.tabSchemes, icon: Landmark },
  ];

  const getToastStyle = (type: string) => {
    switch (type) {
      case 'success': return 'bg-emerald-800 text-white border-emerald-700 shadow-emerald-900/10';
      case 'error': return 'bg-rose-900 text-white border-rose-800 shadow-rose-900/10';
      default: return 'bg-zinc-900 text-white border-zinc-800 shadow-zinc-950/20';
    }
  };

  const getInitials = (nameStr: string) => {
    return nameStr.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
  };

  if (!currentUser) {
    return (
      <div className={`min-h-screen flex flex-col font-sans transition-colors duration-300 ${theme === "dark" ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-800"}`}>
        <AnimatePresence>
          {toast && (
            <motion.div
              initial={{ opacity: 0, y: -20, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className={`fixed top-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl border text-xs font-semibold shadow-xl ${getToastStyle(toast.type)}`}
            >
              <div className="bg-white/20 p-1 rounded-lg shrink-0">
                <Check className="w-3.5 h-3.5 text-white" />
              </div>
              <span>{toast.message}</span>
              {toast.actionLabel && toast.onAction && (
                <button
                  onClick={() => {
                    toast.onAction?.();
                    setToast(null);
                  }}
                  className="ml-2 px-3 py-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-[11px] rounded-lg shadow-sm transition cursor-pointer shrink-0"
                >
                  {toast.actionLabel}
                </button>
              )}
            </motion.div>
          )}
        </AnimatePresence>
        <LoginScreen 
          onLoginSuccess={handleLoginSuccess} 
          onNotify={triggerToast} 
          theme={theme} 
          onToggleTheme={toggleTheme} 
        />

        {/* LOCATION PERMISSION WINDOW PAGE (WHEN NOT GRANTED) */}
        {pendingFarmer && (
          <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-xl flex items-center justify-center p-4 sm:p-6">
            <motion.div 
              initial={{ opacity: 0, scale: 0.92, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              className="bg-slate-900 border border-emerald-500/30 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl relative overflow-hidden text-center"
            >
              <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              <div className="absolute bottom-0 left-0 w-40 h-40 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

              {!locationPermissionDenied ? (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-emerald-950/80 border border-emerald-500/40 flex items-center justify-center text-emerald-400 mx-auto mb-4 shadow-xl">
                    <MapPin className="w-8 h-8 animate-bounce" />
                  </div>

                  <h3 className="text-2xl font-black text-white font-display tracking-tight">
                    Location Access Required
                  </h3>
                  
                  <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                    Welcome, <strong className="text-emerald-400">{pendingFarmer.name}</strong>! AgriConnect requires location permission to detect your live farm coordinates, localized weather forecasts, and agricultural advisories for <strong className="text-white">{pendingFarmer.district}, {pendingFarmer.state}</strong>.
                  </p>

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => requestLocationPermissionAndEnter()}
                      disabled={isLocating}
                      className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition transform active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      <Navigation className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? "Detecting Location..." : "📍 Allow Location Access & Open Dashboard"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setCoords({ lat: 17.3850, lon: 78.4867 });
                        setCurrentUser(pendingFarmer);
                        setPendingFarmer(null);
                        triggerToast("Entered dashboard with regional location.", "info");
                      }}
                      className="w-full py-2.5 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      Skip & Use District Default Location ({pendingFarmer.district})
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div className="w-16 h-16 rounded-2xl bg-rose-950/80 border border-rose-500/40 flex items-center justify-center text-rose-400 mx-auto mb-4 shadow-xl">
                    <ShieldAlert className="w-8 h-8 animate-pulse" />
                  </div>

                  <h3 className="text-2xl font-black text-white font-display tracking-tight">
                    Location Permission Required
                  </h3>

                  <p className="text-xs sm:text-sm text-slate-300 mt-3 leading-relaxed">
                    Location access was denied or blocked in your browser settings. To receive live weather and crop advisories for <strong className="text-white">{pendingFarmer.district}</strong>, please enable location access.
                  </p>

                  {showSettingsGuide && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="mt-4 p-4 bg-slate-950/90 border border-rose-500/30 rounded-2xl text-left text-xs text-slate-300 space-y-2"
                    >
                      <p className="font-bold text-rose-400 flex items-center space-x-1">
                        <Settings className="w-3.5 h-3.5" />
                        <span>How to enable location in browser settings:</span>
                      </p>
                      <ol className="list-decimal list-inside space-y-1 text-slate-300 pl-1">
                        <li>Click the <strong>Lock 🔒 / Tune 🎛️ icon</strong> next to the URL address bar at the top of your browser.</li>
                        <li>Find <strong>Location</strong> setting and change it to <strong>Allow</strong>.</li>
                        <li>Click <strong>"Try Again"</strong> below to refresh location permission.</li>
                      </ol>
                    </motion.div>
                  )}

                  <div className="mt-6 space-y-3">
                    <button
                      onClick={() => requestLocationPermissionAndEnter()}
                      disabled={isLocating}
                      className="w-full py-3.5 px-5 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-sm rounded-2xl shadow-xl transition transform active:scale-95 flex items-center justify-center space-x-2 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className={`w-4 h-4 ${isLocating ? 'animate-spin' : ''}`} />
                      <span>{isLocating ? "Checking Location..." : "🔄 Try Again / Request Location"}</span>
                    </button>

                    <button
                      onClick={() => setShowSettingsGuide(!showSettingsGuide)}
                      className="w-full py-2.5 px-4 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs rounded-xl transition flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Settings className="w-3.5 h-3.5" />
                      <span>{showSettingsGuide ? "Hide Settings Guide" : "⚙️ Open Browser Settings Guide"}</span>
                    </button>

                    <button
                      onClick={() => {
                        setCoords({ lat: 17.3850, lon: 78.4867 });
                        setCurrentUser(pendingFarmer);
                        setPendingFarmer(null);
                        triggerToast("Entered dashboard using regional district location.", "info");
                      }}
                      className="w-full py-2 text-xs font-semibold text-slate-400 hover:text-white transition cursor-pointer"
                    >
                      Continue with Regional Location ({pendingFarmer.district})
                    </button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`min-h-screen flex flex-col font-sans selection:bg-emerald-100 selection:text-emerald-950 transition-colors duration-300 ${
      theme === "dark" ? "bg-slate-950 text-white" : "bg-slate-50 text-slate-800"
    }`}>
      
      {/* GLOBAL TOAST NOTIFICATION */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            className={`fixed top-4 right-4 z-50 flex items-center space-x-3 px-4 py-3 rounded-xl border text-xs font-semibold shadow-xl ${getToastStyle(toast.type)}`}
          >
            <div className="bg-white/20 p-1 rounded-lg shrink-0">
              <Check className="w-3.5 h-3.5 text-white" />
            </div>
            <span>{toast.message}</span>
            {toast.actionLabel && toast.onAction && (
              <button
                onClick={() => {
                  toast.onAction?.();
                  setToast(null);
                }}
                className="ml-2 px-3 py-1 bg-emerald-400 hover:bg-emerald-300 text-slate-950 font-bold text-[11px] rounded-lg shadow-sm transition cursor-pointer shrink-0"
              >
                {toast.actionLabel}
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* HEADER BAR */}
      <header className={`sticky top-0 z-30 shrink-0 border-b px-4 sm:px-6 py-3 shadow-sm transition-colors duration-300 ${
        theme === "dark" 
          ? "bg-slate-900 border-slate-850 text-white" 
          : "bg-emerald-800 text-white border-emerald-900"
      }`}>
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-2">
          <div className="flex items-center space-x-3 sm:space-x-4">
            {/* Logo */}
            <div className="w-10 h-10 rounded-full bg-white border border-emerald-400/80 flex items-center justify-center shrink-0 shadow-md overflow-hidden">
              <img 
                src={agriconnectLogo} 
                alt="AgriConnect Logo" 
                className="w-full h-full object-cover scale-[1.03] rounded-full" 
                referrerPolicy="no-referrer" 
              />
            </div>
            <div>
              <h1 className="text-sm font-bold text-white tracking-tight font-display flex items-center space-x-2">
                <span>{t.appName}</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded border ${
                  theme === "dark" 
                    ? "text-emerald-400 bg-slate-950/60 border-slate-800" 
                    : "text-emerald-200 bg-emerald-900/60 border-emerald-700"
                }`}>{t.version}</span>
              </h1>
              <p className={`text-[9px] font-medium ${
                theme === "dark" ? "text-slate-400" : "text-emerald-200/80"
              }`}>{t.appSubtitle}</p>
            </div>
          </div>

          {/* Quick Info / Location bar */}
          <div className="hidden md:flex items-center space-x-6 text-xs font-medium">
            <div className="flex items-center gap-3">
              <button
                onClick={requestLiveLocation}
                disabled={isLocating}
                className={`flex items-center justify-center p-1.5 rounded-lg border text-white transition cursor-pointer ${
                  isLocating 
                    ? "bg-amber-600 border-amber-500 animate-pulse" 
                    : theme === "dark"
                      ? "bg-slate-800 hover:bg-slate-700 border-slate-700"
                      : "bg-emerald-700/80 hover:bg-emerald-600 border-emerald-600"
                }`}
                title="Detect Live Location via GPS"
              >
                <Navigation className={`w-3.5 h-3.5 ${isLocating ? "animate-spin text-white" : "text-emerald-100 hover:text-white"}`} />
              </button>
              <div className="flex flex-col items-end">
                <span className={`text-[9px] uppercase tracking-widest font-semibold flex items-center gap-1 ${
                  theme === "dark" ? "text-emerald-400" : "text-emerald-200"
                }`}>
                  <MapPin className="w-2.5 h-2.5 text-emerald-300" /> {t.currentLocation}
                </span>
                <span className="text-xs font-medium text-white">{locationName}</span>
              </div>
            </div>
            <div className={`h-8 w-[1px] ${theme === "dark" ? "bg-slate-800" : "bg-emerald-700"}`}></div>
            <div className="flex items-center space-x-3">
              <button
                onClick={() => {
                  setProfileModalTab('profile');
                  setIsProfileModalOpen(true);
                }}
                className={`flex items-center space-x-2 border rounded-full pl-2 pr-3 py-1 text-white transition hover:scale-102 cursor-pointer ${
                  theme === "dark" ? "bg-slate-800/80 border-slate-750 hover:bg-slate-700" : "bg-white/10 border-white/20 hover:bg-white/20"
                }`}
                title="Profile → Settings → Language"
              >
                <div className="w-5 h-5 rounded-full bg-emerald-400 border border-white/40 flex items-center justify-center text-[9px] font-bold text-emerald-900">
                  {getInitials(currentUser.name)}
                </div>
                <span className={`text-xs font-semibold ${
                  theme === "dark" ? "text-slate-200" : "text-emerald-50"
                }`}>{currentUser.name}</span>
                <Settings className="w-3 h-3 text-emerald-200/80" />
              </button>
              
              {/* PACS Status Notification Bell */}
              <div className="relative">
                <button
                  onClick={() => setShowNotificationMenu(!showNotificationMenu)}
                  className={`relative p-1.5 rounded-lg border transition duration-300 cursor-pointer flex items-center justify-center ${
                    unreadBookingCount > 0
                      ? "bg-rose-500/20 border-rose-500 text-rose-300 animate-pulse"
                      : theme === "dark"
                        ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-slate-200"
                        : "bg-emerald-900/40 border-emerald-700 hover:bg-emerald-700/85 text-white"
                  }`}
                  title="PACS Status Notifications"
                >
                  <Bell className="w-3.5 h-3.5" />
                  {unreadBookingCount > 0 && (
                    <span className="absolute -top-1 -right-1 bg-rose-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center shadow-xs">
                      {unreadBookingCount}
                    </span>
                  )}
                </button>

                {showNotificationMenu && (
                  <div className={`absolute right-0 mt-2 w-72 rounded-2xl border p-3.5 shadow-xl z-50 text-xs ${
                    theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-800"
                  }`}>
                    <div className="flex justify-between items-center pb-2 border-b border-slate-200/50 mb-2.5">
                      <span className="font-extrabold uppercase text-[10px] tracking-wider text-slate-400 font-mono">PACS Status Alerts</span>
                      <button onClick={() => setShowNotificationMenu(false)} className="text-slate-400 hover:text-slate-200">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    <div className="space-y-2 mb-3">
                      {unreadBookingCount > 0 ? (
                        <div className="p-2.5 bg-rose-500/10 border border-rose-500/20 rounded-xl text-rose-300 text-[11px] leading-snug">
                          <strong>{unreadBookingCount} PACS booking status update(s)!</strong> Click 'PACS Bookings' in the navigation menu to review.
                        </div>
                      ) : (
                        <p className="text-[11px] text-slate-400 italic">All PACS voucher status updates are up to date.</p>
                      )}
                    </div>
                    <button
                      onClick={() => {
                        simulatePACSStatusChange();
                      }}
                      className="w-full py-1.5 px-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-[10px] font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Simulate PACS Status Update</span>
                    </button>
                  </div>
                )}
              </div>

              {/* Battery Optimizer Quick Toggle / Status Pill */}
              <button
                onClick={() => {
                  const nextMode = isLowPowerActive ? 'high_performance' : 'battery_saver';
                  setPowerMode(nextMode);
                  triggerToast(
                    nextMode === 'battery_saver'
                      ? "🔋 Battery Saver enabled! Animations throttled for maximum field durability."
                      : "⚡ Standard Performance restored.",
                    "info"
                  );
                }}
                className={`hidden lg:flex items-center gap-1.5 px-2.5 py-1 rounded-full border text-[10px] font-mono font-bold transition cursor-pointer ${
                  isLowPowerActive
                    ? 'bg-amber-500/20 border-amber-500/50 text-amber-300 shadow-xs ring-1 ring-amber-500/30'
                    : batteryStatus.charging
                      ? 'bg-emerald-950/60 border-emerald-700/60 text-emerald-300'
                      : theme === 'dark'
                        ? 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-700'
                        : 'bg-emerald-900/40 border-emerald-700 text-emerald-100 hover:bg-emerald-800'
                }`}
                title={`Battery Saver Mode: ${isLowPowerActive ? 'ACTIVE (Click to toggle)' : 'INACTIVE (Click to save battery)'} | ${Math.round(batteryStatus.level * 100)}%`}
              >
                {batteryStatus.charging ? (
                  <BatteryCharging className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                ) : isLowPowerActive ? (
                  <Zap className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                ) : batteryStatus.level <= 0.25 ? (
                  <BatteryWarning className="w-3.5 h-3.5 text-rose-400" />
                ) : (
                  <Battery className="w-3.5 h-3.5 text-emerald-400" />
                )}
                <span>
                  {isLowPowerActive ? 'BATTERY SAVER' : `${Math.round(batteryStatus.level * 100)}%`}
                </span>
                {estimatedRemainingHours !== null && (
                  <span className="opacity-75 text-[9px]">({estimatedRemainingHours}h)</span>
                )}
              </button>

              {/* Premium Header Theme Switcher (Circular) */}
              <button
                onClick={toggleTheme}
                className={`w-8 h-8 rounded-full border transition duration-300 cursor-pointer flex items-center justify-center shrink-0 ${
                  theme === "dark"
                    ? "bg-slate-800 border-slate-700 hover:bg-slate-700 text-amber-400 shadow-sm hover:scale-105"
                    : "bg-emerald-900/40 border-emerald-700 hover:bg-emerald-700/85 text-white shadow-sm hover:scale-105"
                }`}
                title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
              >
                {theme === "dark" ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-emerald-100" />}
              </button>

              <button
                onClick={handleLogout}
                className={`w-8 h-8 rounded-full border transition text-white cursor-pointer flex items-center justify-center shrink-0 ${
                  theme === "dark"
                    ? "bg-slate-800 hover:bg-rose-950 border-slate-700 hover:border-rose-900"
                    : "bg-emerald-900/40 hover:bg-rose-900 border-emerald-700 hover:border-rose-800"
                }`}
                title="Log Out from NIC Portal"
              >
                <LogOut className="w-3.5 h-3.5 text-rose-300 hover:text-white" />
              </button>
            </div>
          </div>

          {/* Mobile menu and mobile theme controls */}
          <div className="md:hidden flex items-center gap-2">
            <button
              onClick={toggleTheme}
              className={`w-8 h-8 rounded-full border transition cursor-pointer flex items-center justify-center ${
                theme === "dark" ? "bg-slate-800 border-slate-700 text-amber-400" : "bg-emerald-800/60 border-emerald-700 text-white"
              }`}
              title="Toggle Theme"
            >
              {theme === "dark" ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
            </button>
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2 rounded-xl text-emerald-100 hover:bg-emerald-700/50 transition cursor-pointer"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </header>

      {/* PORTAL BODY CONTAINER */}
      <div className="flex-grow flex max-w-7xl w-full mx-auto relative">
        
        {/* DESKTOP NAVIGATION SIDEBAR */}
        <aside className={`hidden md:flex w-56 border-r flex-col shrink-0 justify-between transition-colors duration-300 ${
          theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200"
        }`}>
          <div className="py-4 flex-grow">
            <div className={`pb-3 mb-2 border-b transition-colors duration-300 ${theme === "dark" ? "border-slate-800" : "border-slate-100"}`}>
              <span className={`text-[9px] font-mono uppercase tracking-widest block px-6 ${theme === "dark" ? "text-slate-500" : "text-slate-400"}`}>Main Navigation</span>
            </div>
            <nav className="space-y-1">
              {navItems.map((item) => {
                const IconComp = item.icon;
                const isActive = activeTab === item.id;
                const hasUnread = item.id === 'bookings' && unreadBookingCount > 0;

                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setActiveTab(item.id);
                      setIsMobileMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-6 py-2.5 text-xs transition cursor-pointer ${
                      isActive
                        ? theme === "dark"
                          ? "bg-emerald-950/45 text-emerald-400 border-r-4 border-emerald-500 font-bold"
                          : "bg-emerald-50 text-emerald-700 border-r-4 border-emerald-600 font-bold"
                        : theme === "dark"
                          ? "text-slate-400 hover:bg-slate-800/40 hover:text-white font-medium"
                          : "text-slate-500 hover:bg-slate-50 hover:text-slate-900 font-medium"
                    }`}
                  >
                    <div className="flex items-center space-x-2.5">
                      <div className="relative">
                        <IconComp className={`w-4 h-4 ${isActive ? 'text-emerald-500' : 'text-slate-400'}`} />
                        {hasUnread && (
                          <span className="absolute -top-1 -right-1 flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                          </span>
                        )}
                      </div>
                      <span>{item.label.toUpperCase()}</span>
                    </div>
                    {hasUnread && (
                      <span className="text-[9px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-xs animate-bounce font-mono">
                        {unreadBookingCount} NEW
                      </span>
                    )}
                    {!hasUnread && item.highlight && !isActive && (
                      <span className="text-[8px] uppercase tracking-wider font-extrabold bg-blue-100 text-blue-600 px-1.5 py-0.5 rounded">
                        PRO
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>

          {/* SIDEBAR ACCOUNT STATUS CONTAINER */}
          <div className={`p-4 border-t transition-colors duration-300 ${theme === "dark" ? "border-slate-800" : "border-slate-200"}`}>
            <div className={`p-3 rounded-lg border transition-colors duration-300 ${
              theme === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-emerald-50 border-emerald-100"
            }`}>
              <h4 className={`text-[9px] font-bold uppercase tracking-wider mb-1 ${theme === "dark" ? "text-emerald-400" : "text-emerald-800"}`}>Account Status</h4>
              <p className={`text-[10px] leading-tight ${theme === "dark" ? "text-slate-400" : "text-emerald-600"}`}>Verification Level 3 Complete</p>
              <p className={`text-[9px] mt-1 truncate font-mono ${theme === "dark" ? "text-slate-500" : "text-emerald-500/80"}`}>{currentUser.pacsId}</p>

              <button
                onClick={() => {
                  setProfileModalTab('settings');
                  setIsProfileModalOpen(true);
                }}
                className={`mt-2.5 w-full flex items-center justify-center gap-1.5 py-1.5 px-2 rounded-lg border text-[10px] font-bold transition cursor-pointer ${
                  theme === "dark" 
                    ? "bg-slate-900 border-slate-750 text-slate-300 hover:bg-slate-800 hover:text-white"
                    : "bg-white border-emerald-200 text-emerald-800 hover:bg-emerald-100/60"
                }`}
              >
                <Settings className="w-3 h-3 text-emerald-500" />
                <span>{t.profileAndSettings || "Profile & Settings"}</span>
              </button>
            </div>
          </div>
        </aside>

        {/* MOBILE SLIDE-OUT DRAWER */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25 }}
              className={`fixed inset-y-0 left-0 w-64 z-40 border-r p-5 space-y-4 shadow-xl md:hidden transition-colors duration-300 ${
                theme === "dark" ? "bg-slate-900 border-slate-800 text-white" : "bg-white border-slate-200"
              }`}
            >
              <div className={`flex justify-between items-center pb-3 border-b transition-colors duration-300 ${
                theme === "dark" ? "border-slate-850" : "border-slate-100"
              }`}>
                <span className={`text-xs font-bold font-sans ${theme === "dark" ? "text-slate-200" : "text-slate-800"}`}>Menu</span>
                <button onClick={() => setIsMobileMenuOpen(false)} className="text-slate-400 p-1">
                  <X className="w-4 h-4" />
                </button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => {
                  const IconComp = item.icon;
                  const isActive = activeTab === item.id;
                  const hasUnread = item.id === 'bookings' && unreadBookingCount > 0;

                  return (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition cursor-pointer ${
                        isActive
                          ? "bg-emerald-600 text-white shadow-sm font-bold"
                          : theme === "dark"
                            ? "text-slate-300 hover:bg-slate-800 hover:text-white"
                            : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"
                      }`}
                    >
                      <div className="flex items-center space-x-2.5">
                        <div className="relative">
                          <IconComp className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                          {hasUnread && (
                            <span className="absolute -top-1 -right-1 flex h-2 w-2">
                              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                              <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                            </span>
                          )}
                        </div>
                        <span>{item.label}</span>
                      </div>
                      {hasUnread && (
                        <span className="text-[9px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-full shadow-xs font-mono">
                          {unreadBookingCount} NEW
                        </span>
                      )}
                    </button>
                  );
                })}
              </nav>

              <div className={`pt-4 border-t space-y-3 text-xs transition-colors duration-300 ${
                theme === "dark" ? "border-slate-800" : "border-slate-100"
              }`}>
                <div>
                  <span className={`text-[10px] font-mono block uppercase tracking-widest ${
                    theme === "dark" ? "text-slate-500" : "text-slate-400"
                  }`}>Active Farmer ID</span>
                  <p className={`text-[10px] truncate p-2 rounded-xl border font-mono mt-1 ${
                    theme === "dark" ? "bg-slate-950/60 border-slate-800 text-slate-300" : "bg-slate-50 border-slate-250 text-slate-500"
                  }`}>{currentUser.pacsId}</p>
                </div>
                <button
                  onClick={handleLogout}
                  className={`w-full flex items-center justify-center gap-2 py-2 border rounded-xl font-bold transition text-xs select-none cursor-pointer ${
                    theme === "dark"
                      ? "border-rose-900/50 text-rose-400 bg-rose-950/30 hover:bg-rose-950/50"
                      : "border-rose-200 text-rose-700 bg-rose-50 hover:bg-rose-100"
                  }`}
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>{t.logout.toUpperCase()}</span>
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* MAIN VIEWPORT CONTENT PANEL */}
        <main className="flex-grow p-4 md:p-6 overflow-y-auto max-w-full">
          {/* Battery Saver Mode Active Header Ribbon */}
          {isLowPowerActive && (
            <div className="mb-4 px-3.5 py-2 rounded-xl bg-amber-500/15 border border-amber-500/30 text-amber-300 text-xs font-mono flex items-center justify-between shadow-xs">
              <div className="flex items-center gap-2">
                <Zap className="w-4 h-4 text-amber-400 shrink-0" />
                <span className="text-[11px] leading-tight">
                  {t.batterySaverActiveBanner || "⚡ Battery Saver Active — Animations & background network polling optimized for long field durability"}
                </span>
              </div>
              <button
                onClick={() => setPowerMode('high_performance')}
                className="text-[10px] underline hover:text-white font-bold ml-2 shrink-0 cursor-pointer"
              >
                Disable
              </button>
            </div>
          )}

          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.15 }}
            >
              
              {/* TAB 1: PORTAL DASHBOARD (HOME) */}
              {activeTab === 'home' && (
                <div className="grid grid-cols-12 gap-4">
                  
                  {/* NATIONAL AGRICULTURAL REGISTRY CARD */}
                  <div className={`col-span-12 rounded-3xl border shadow-sm overflow-hidden transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`} id="national-farmer-registry-card">
                    <div className="bg-gradient-to-r from-emerald-800 to-teal-900 px-6 py-4 text-white flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
                          <span className="text-[9px] font-mono tracking-widest text-emerald-200 uppercase font-black">NIC secure agriculture node</span>
                        </div>
                        <h2 className="text-base font-black tracking-tight font-display text-white mt-0.5">Government Certified Farmer Registry</h2>
                        <p className="text-[10px] text-emerald-100/90 font-medium font-mono">PACS Cooperative Member Card: {currentUser.pacsId}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-mono text-emerald-300 font-bold bg-emerald-950/40 px-2.5 py-1 rounded border border-emerald-700/60">
                          Active State Node: {currentUser.state.toUpperCase()}
                        </span>
                      </div>
                    </div>

                    <div className="p-6">
                      {!isEditingProfile ? (
                        <div className="flex flex-col gap-6" id="profile-display-layout">
                          {/* Widescreen Interactive ID Debit Card graphic */}
                          <div className="w-full bg-gradient-to-br from-slate-900 via-emerald-950 to-neutral-950 text-white rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-xl border border-emerald-500/20 flex flex-col justify-between min-h-[260px]" id="farmer-smartcard-graphic">
                            {/* Decorative holographic / ambient elements */}
                            <div className="absolute top-0 right-0 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
                            <div className="absolute -bottom-10 -left-10 w-48 h-48 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />
                            
                            {/* Card Top: Bank name and Card Type */}
                            <div className="flex justify-between items-start relative z-10 border-b border-white/10 pb-4">
                              <div className="flex items-center gap-2.5">
                                <div className="w-8 h-8 rounded-full bg-white border border-emerald-400/80 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
                                  <img 
                                    src={agriconnectLogo} 
                                    alt="AgriConnect Logo" 
                                    className="w-full h-full object-cover scale-[1.03] rounded-full" 
                                    referrerPolicy="no-referrer" 
                                  />
                                </div>
                                <div>
                                  <h4 className="text-xs sm:text-sm font-black tracking-wider uppercase font-display leading-none">AgriConnect Bank</h4>
                                  <span className="text-[7px] sm:text-[8px] text-emerald-400 font-mono tracking-widest uppercase block mt-1">National Agricultural Debit & Identity Card</span>
                                </div>
                              </div>
                              <span className="text-[8px] sm:text-[9px] font-mono tracking-widest text-emerald-300 font-black bg-emerald-950/80 px-2.5 py-1 rounded border border-emerald-800/40 shadow-xs">
                                PLATINUM
                              </span>
                            </div>

                            {/* Card Middle: Primary Farmer Info & Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 my-6 relative z-10 items-center">
                              {/* Left Side: Farmer Name display */}
                              <div className="md:col-span-4 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 pb-4 md:pb-0 md:pr-6">
                                <span className="text-[9px] font-mono text-emerald-400 uppercase tracking-widest block mb-1">Farmer Name</span>
                                <h3 className="text-xl sm:text-2xl font-black font-display tracking-tight text-white uppercase leading-snug">
                                  {currentUser.name}
                                </h3>
                              </div>

                              {/* Five Specific Details fields on the Card */}
                              <div className="md:col-span-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
                                <div>
                                  <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest block">Aadhaar Identity</span>
                                  <p className="text-xs font-bold font-mono tracking-wider mt-1 text-emerald-100">
                                    {currentUser.aadhaar}
                                  </p>
                                </div>

                                <div>
                                  <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest block">Mobile Number</span>
                                  <p className="text-xs font-bold font-mono tracking-wider mt-1 text-emerald-100">
                                    +91 {currentUser.phone}
                                  </p>
                                </div>

                                <div>
                                  <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest block">PACS Card ID</span>
                                  <p className="text-xs font-bold font-mono tracking-wider mt-1 text-emerald-100">
                                    {currentUser.pacsId}
                                  </p>
                                </div>

                                <div>
                                  <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest block">Land Holding Size</span>
                                  <p className="text-xs font-extrabold text-emerald-400 mt-1">
                                    {currentUser.landSize} Certified Acres
                                  </p>
                                </div>

                                <div>
                                  <span className="text-[8px] font-mono text-emerald-400 uppercase tracking-widest block">Cooperative Area</span>
                                  <p className="text-xs font-bold mt-1 text-slate-300">
                                    {currentUser.district}, {currentUser.state}
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Card Bottom: Action Button aligned nicely */}
                            <div className="flex flex-col sm:flex-row justify-end items-center gap-4 border-t border-white/5 pt-4 relative z-10">
                              <button
                                onClick={() => setIsEditingProfile(true)}
                                className="w-full sm:w-auto bg-emerald-500 hover:bg-emerald-400 text-emerald-950 font-black px-5 py-2 rounded-xl text-xs flex items-center justify-center gap-1.5 transition cursor-pointer select-none shadow-md"
                              >
                                <span>Modify Registry Details</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ) : (
                        <form onSubmit={handleUpdateProfile} className="space-y-4" id="profile-edit-layout">
                          <div className="p-4 bg-amber-50 border border-amber-200 rounded-xl text-xs text-amber-900 leading-normal mb-2 flex gap-2">
                            <Info className="w-4 h-4 text-amber-600 shrink-0" />
                            <div>
                              <strong>Security Notice:</strong> Modifying details updates your credentials. Your next login will require using the updated values. New PACS Card configurations will sync with local cooperative registries.
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
                            <div className="md:col-span-4 space-y-1.5">
                              <label className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Farmer Full Name</label>
                              <input
                                type="text"
                                value={profileName}
                                onChange={(e) => setProfileName(e.target.value)}
                                className={`w-full transition-colors duration-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                                  theme === 'dark' 
                                    ? 'bg-slate-950 border-slate-800 text-white focus:bg-slate-900' 
                                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                                }`}
                                required
                              />
                            </div>

                            <div className="md:col-span-4 space-y-1.5">
                              <label className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Aadhaar Number (12 Digits)</label>
                              <input
                                type="text"
                                maxLength={14}
                                placeholder="5432 9876 1234"
                                value={profileAadhaar}
                                onChange={(e) => {
                                  const cleaned = e.target.value.replace(/\D/g, "").slice(0, 12);
                                  const matches = cleaned.match(/(\d{1,4})/g);
                                  setProfileAadhaar(matches ? matches.join(" ") : cleaned);
                                }}
                                className={`w-full transition-colors duration-300 rounded-xl px-3 py-2 text-xs font-bold font-mono tracking-wider focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                                  theme === 'dark' 
                                    ? 'bg-slate-950 border-slate-800 text-white focus:bg-slate-900' 
                                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                                }`}
                                required
                              />
                            </div>

                            <div className="md:col-span-4 space-y-1.5">
                              <label className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Mobile Number (India - 10 Digits)</label>
                              <div className="flex items-center gap-1.5">
                                <span className={`px-2.5 py-2 border rounded-xl text-xs font-mono font-bold flex items-center gap-1 shrink-0 ${
                                  theme === 'dark' ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-100 border-slate-200 text-emerald-700'
                                }`}>
                                  <span>🇮🇳</span>
                                  <span>+91</span>
                                </span>
                                <input
                                  type="tel"
                                  value={profilePhone}
                                  maxLength={10}
                                  placeholder="9876543210"
                                  onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                  className={`w-full transition-colors duration-300 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                                    theme === 'dark' 
                                      ? 'bg-slate-950 border-slate-800 text-white focus:bg-slate-900' 
                                      : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                                  }`}
                                  required
                                />
                              </div>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div className="space-y-1.5">
                              <label className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>PACS Card ID</label>
                              <input
                                type="text"
                                value={profilePacs}
                                onChange={(e) => setProfilePacs(e.target.value)}
                                className={`w-full transition-colors duration-300 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                                  theme === 'dark' 
                                    ? 'bg-slate-950 border-slate-800 text-white focus:bg-slate-900' 
                                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                                }`}
                                required
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>Land Holding (Acres)</label>
                              <input
                                type="number"
                                step="0.1"
                                min="0.1"
                                value={profileLandSize}
                                onChange={(e) => setProfileLandSize(e.target.value)}
                                className={`w-full transition-colors duration-300 rounded-xl px-3 py-2 text-xs font-bold font-mono focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                                  theme === 'dark' 
                                    ? 'bg-slate-950 border-slate-800 text-white focus:bg-slate-900' 
                                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                                }`}
                                required
                              />
                            </div>

                            <div className="space-y-1.5">
                              <label className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>State Registry</label>
                              <select
                                value={profileState}
                                onChange={(e) => {
                                  const sState = e.target.value;
                                  setProfileState(sState);
                                  const matched = INDIAN_STATES.find(s => s.id === sState);
                                  if (matched && matched.districts.length > 0) {
                                    setProfileDistrict(matched.districts[0]);
                                  }
                                }}
                                className={`w-full transition-colors duration-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                                  theme === 'dark' 
                                    ? 'bg-slate-950 border-slate-800 text-white focus:bg-slate-900' 
                                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                                }`}
                              >
                                {INDIAN_STATES.map(s => (
                                  <option key={s.id} value={s.id} className={theme === 'dark' ? 'bg-slate-900 text-white' : ''}>{s.id}</option>
                                ))}
                              </select>
                            </div>

                            <div className="space-y-1.5">
                              <label className={`text-[10px] font-bold uppercase tracking-wider block font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>District Area</label>
                              <select
                                value={profileDistrict}
                                onChange={(e) => setProfileDistrict(e.target.value)}
                                className={`w-full transition-colors duration-300 rounded-xl px-3 py-2 text-xs font-bold focus:outline-none focus:ring-2 focus:ring-emerald-600 ${
                                  theme === 'dark' 
                                    ? 'bg-slate-950 border-slate-800 text-white focus:bg-slate-900' 
                                    : 'bg-slate-50 border-slate-200 text-slate-800 focus:bg-white'
                                }`}
                              >
                                {INDIAN_STATES.find(s => s.id === profileState)?.districts.map(d => (
                                  <option key={d} value={d} className={theme === 'dark' ? 'bg-slate-900 text-white' : ''}>{d}</option>
                                )) || <option value="">Select District</option>}
                              </select>
                            </div>
                          </div>

                          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => {
                                setIsEditingProfile(false);
                                // reset values to currentUser
                                setProfileName(currentUser.name);
                                setProfilePhone(currentUser.phone);
                                setProfileAadhaar(currentUser.aadhaar);
                                setProfilePacs(currentUser.pacsId);
                                setProfileLandSize(currentUser.landSize.toString());
                                setProfileState(currentUser.state);
                                setProfileDistrict(currentUser.district);
                              }}
                              className="px-4 py-2 border border-slate-200 hover:bg-slate-50 rounded-xl font-bold text-slate-500 text-xs transition cursor-pointer select-none"
                            >
                              Cancel
                            </button>
                            <button
                              type="submit"
                              className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl font-bold text-xs transition cursor-pointer select-none shadow-xs"
                            >
                              Save to Central Database
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                  
                  {/* Weather & Conditions Card with Rain Alert Detection */}
                  {(() => {
                    const isRainDetected = rainSimActive || (currentWeather ? (
                      (currentWeather.condition && currentWeather.condition.toLowerCase().includes('rain')) || 
                      (currentWeather.rainChance && currentWeather.rainChance >= 40)
                    ) : false);

                    return (
                      <div className={`col-span-12 lg:col-span-4 rounded-2xl border p-4 flex flex-col justify-between min-h-[210px] transition-all duration-500 relative overflow-hidden ${
                        isRainDetected
                          ? theme === 'dark' 
                            ? 'bg-gradient-to-br from-slate-900 via-sky-950/40 to-slate-900 border-sky-500/80 text-white shadow-[0_0_30px_rgba(14,165,233,0.3)] ring-2 ring-sky-500/40' 
                            : 'bg-gradient-to-br from-sky-50/90 via-sky-100/60 to-white border-sky-400 text-slate-800 shadow-[0_4px_25px_rgba(14,165,233,0.2)] ring-2 ring-sky-400/50'
                          : theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                      }`}>
                        
                        {/* Subtle pulsing background glow layer when Rain is detected */}
                        {isRainDetected && (
                          <div className="absolute inset-0 bg-sky-500/5 animate-pulse pointer-events-none z-0" />
                        )}

                        <div className="relative z-10 space-y-3">
                          {/* Card Top Header */}
                          <div className="flex justify-between items-start gap-2">
                            <div>
                              <div className="flex items-center gap-1.5">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping inline-block" />
                                <h3 className={`text-[10px] font-bold uppercase tracking-widest font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                  Live Weather Forecast
                                </h3>
                              </div>
                              <p className="text-[10px] font-bold text-emerald-500 flex items-center gap-1 mt-0.5">
                                <MapPin className="w-3 h-3 shrink-0" />
                                <span>{locationName}</span>
                              </p>
                            </div>

                            <div className="flex flex-col items-end gap-1">
                              {isRainDetected ? (
                                <span className="text-[9px] bg-sky-500/20 text-sky-400 border border-sky-500/50 px-2.5 py-0.5 rounded-full font-black font-mono animate-pulse flex items-center gap-1 shadow-xs shrink-0">
                                  <CloudRain className="w-3.5 h-3.5 text-sky-400 animate-bounce" />
                                  <span>RAIN ALERT</span>
                                </span>
                              ) : (
                                <span className="text-[9px] bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-400 border border-amber-300 dark:border-amber-800 px-2 py-0.5 rounded-full font-bold font-mono shrink-0">
                                  CLEAR SKY
                                </span>
                              )}

                              {/* Live Clock & Date Badge */}
                              <span className="text-[9px] font-mono text-emerald-500 font-semibold flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" />
                                <span>{liveWeatherClock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</span>
                              </span>
                            </div>
                          </div>

                          {/* Live Date Strip */}
                          <div className={`flex items-center justify-between text-[10px] font-mono px-2 py-1 rounded-lg border ${
                            theme === 'dark' ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                          }`}>
                            <span className="flex items-center gap-1">
                              <Calendar className="w-3 h-3 text-emerald-500" />
                              <strong className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>
                                {liveWeatherClock.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })}
                              </strong>
                            </span>
                            <span className="text-[9px] text-slate-400">
                              Synced: {currentWeather?.lastUpdated || liveWeatherClock.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>

                          {/* Weather Warning Banner when Rain Alert is detected */}
                          {isRainDetected && (
                            <div className={`p-3 rounded-xl border flex items-start gap-2.5 my-1 animate-pulse shadow-md transition-all duration-300 ${
                              theme === "dark" 
                                ? "bg-sky-950/95 border-sky-400/80 text-sky-100 shadow-[0_0_20px_rgba(14,165,233,0.35)]" 
                                : "bg-white/95 border-sky-400 text-sky-950 shadow-md"
                            }`}>
                              <div className="p-1.5 rounded-lg bg-sky-500/25 text-sky-400 shrink-0 mt-0.5">
                                <AlertTriangle className="w-4 h-4 text-amber-400 animate-bounce" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center justify-between gap-1">
                                  <span className="text-[10px] font-black uppercase font-mono tracking-wider text-sky-400 dark:text-sky-300 flex items-center gap-1">
                                    <span>⚠️ WEATHER WARNING BANNER</span>
                                  </span>
                                  <span className="text-[9px] font-mono font-black text-sky-400 dark:text-sky-300 bg-sky-900/60 dark:bg-sky-900/80 px-1.5 py-0.5 rounded border border-sky-500/30">
                                    {currentWeather?.rainChance || 80}% Precip
                                  </span>
                                </div>
                                <p className="text-[11px] font-medium leading-tight mt-1 opacity-95">
                                  Rain alert detected for <strong className="font-extrabold underline text-sky-500 dark:text-sky-300">{locationName}</strong>. Protect harvested grains & clear field drainage channels immediately!
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Primary Temp & Condition Row */}
                          <div className="flex items-center justify-between gap-2 py-1">
                            <div className="flex items-center gap-3">
                              {isRainDetected ? (
                                <CloudRain className="w-10 h-10 text-sky-400 animate-pulse shrink-0" />
                              ) : (
                                <Sun className="w-10 h-10 text-amber-400 animate-pulse shrink-0" />
                              )}
                              <div>
                                <div className={`text-3xl font-extrabold tracking-tight font-display ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>
                                  {currentWeather?.temperature ?? 28}°C
                                </div>
                                <span className={`text-xs font-bold block ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>
                                  {currentWeather?.condition ?? (isRainDetected ? "Rainy & Thunderstorms" : "Sunny with Light Breeze")}
                                </span>
                              </div>
                            </div>

                            <div className="text-right">
                              <span className={`text-[10px] font-mono block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Humidity: <strong>{currentWeather?.humidity ?? 78}%</strong>
                              </span>
                              <span className={`text-[10px] font-mono block ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
                                Wind: <strong>{currentWeather?.windSpeed ?? 18}km/h</strong>
                              </span>
                            </div>
                          </div>
                        </div>

                        {/* Card Bottom Controls & Location Sync */}
                        <div className={`grid grid-cols-2 gap-2 pt-2 mt-2 border-t relative z-10 ${theme === 'dark' ? 'border-slate-800' : 'border-slate-200'}`}>
                          <button
                            onClick={requestLiveLocation}
                            disabled={isLocating}
                            className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer select-none ${
                              isLocating 
                                ? 'bg-amber-100 text-amber-800 border-amber-300 animate-pulse' 
                                : theme === 'dark' 
                                  ? 'bg-slate-800 hover:bg-slate-700 text-emerald-400 border-slate-700' 
                                  : 'bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-emerald-200'
                            }`}
                            title="Sync live location using GPS"
                          >
                            <MapPin className="w-3 h-3 shrink-0" />
                            <span>{isLocating ? "Syncing GPS..." : "Detect GPS Weather"}</span>
                          </button>

                          <button
                            onClick={() => {
                              setRainSimActive(!rainSimActive);
                              triggerToast(`Rain Alert simulation switched ${!rainSimActive ? 'ON' : 'OFF'}`, "info");
                            }}
                            className={`px-2 py-1 rounded-lg border text-[10px] font-bold flex items-center justify-center gap-1 transition cursor-pointer select-none ${
                              rainSimActive
                                ? 'bg-sky-500/20 text-sky-400 border-sky-500/50 hover:bg-sky-500/30'
                                : 'bg-slate-200 dark:bg-slate-800 text-slate-600 dark:text-slate-300 border-slate-300 dark:border-slate-700'
                            }`}
                            title="Toggle Rain Alert simulation state for testing"
                          >
                            <CloudRain className="w-3 h-3 shrink-0" />
                            <span>Rain Alert: {rainSimActive ? "ACTIVE" : "OFF"}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })()}

                  {/* Crop Summary Card */}
                  <div className={`col-span-12 lg:col-span-5 rounded-xl border p-4 flex flex-col justify-between transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <div>
                      <div className="flex justify-between items-center mb-3">
                        <h3 className={`text-[10px] font-bold uppercase tracking-widest font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-400'}`}>Active Crops</h3>
                        <button 
                          onClick={() => setActiveTab("crops")}
                          className="text-[10px] font-extrabold text-emerald-500 hover:underline cursor-pointer"
                        >
                          VIEW FIELD MAP ➔
                        </button>
                      </div>
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base border shrink-0 ${
                            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-emerald-50 border-emerald-100 text-emerald-700'
                          }`}>🌾</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <span className={`text-xs font-bold truncate ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Sona Masuri Wheat</span>
                              <span className={`text-[10px] font-bold font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>84% Grown</span>
                            </div>
                            <div className={`w-full h-1.5 rounded-full mt-1 overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                              <div className="bg-emerald-500 h-full w-[84%] rounded-full"></div>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          <div className={`w-9 h-9 rounded-lg flex items-center justify-center text-base border shrink-0 ${
                            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-amber-400' : 'bg-amber-50 border-amber-100 text-amber-700'
                          }`}>🌽</div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-center">
                              <span className={`text-xs font-bold truncate ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Hybrid Maize</span>
                              <span className={`text-[10px] font-bold font-mono ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>22% Grown</span>
                            </div>
                            <div className={`w-full h-1.5 rounded-full mt-1 overflow-hidden ${theme === 'dark' ? 'bg-slate-950' : 'bg-slate-100'}`}>
                              <div className="bg-amber-500 h-full w-[22%] rounded-full"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className={`pt-2 border-t text-[11px] flex justify-between items-center ${theme === 'dark' ? 'border-slate-800 text-slate-400' : 'border-slate-100 text-slate-400'}`}>
                      <span>Total active: <strong>{totalCropsCount} cycles</strong></span>
                      <span className="font-mono text-[9px]">UPDATED RECENTLY</span>
                    </div>
                  </div>

                  {/* Market Prices Ticker - Telangana Live Crop Variety Index */}
                  <div className={`col-span-12 lg:col-span-3 rounded-xl p-4 shadow-sm flex flex-col justify-between min-h-[200px] transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-slate-900 border border-slate-800 text-white' : 'bg-slate-800 text-white'
                  }`}>
                    <div>
                      <div className="flex justify-between items-center mb-2.5">
                        <h3 className="text-[9px] font-bold text-emerald-400 uppercase tracking-widest font-mono">Telangana Live Prices</h3>
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                      </div>
                      <div className="space-y-2.5">
                        {telanganaOverviewPrices.length > 0 ? (
                          telanganaOverviewPrices.slice(0, 4).map((price) => {
                            const isUp = price.trend === 'Up';
                            const isDown = price.trend === 'Down';
                            const trendSym = isUp ? '▲' : isDown ? '▼' : '●';
                            const trendColor = isUp ? 'text-emerald-400' : isDown ? 'text-rose-400' : 'text-slate-400';

                            return (
                              <div key={price.id} className={`flex justify-between items-start text-xs pb-1.5 last:border-0 last:pb-0 ${
                                theme === 'dark' ? 'border-b border-slate-850' : 'border-b border-slate-700/50'
                              }`}>
                                <div className="flex flex-col max-w-[65%]">
                                  <span className={`font-bold truncate leading-tight ${theme === 'dark' ? 'text-slate-100' : 'text-slate-200'}`}>{price.variety}</span>
                                  <span className={`text-[9px] truncate mt-0.5 ${theme === 'dark' ? 'text-slate-500' : 'text-slate-400'}`}>{price.cropName} • {price.marketName}</span>
                                </div>
                                <span className={`font-mono font-bold text-[11px] shrink-0 text-right ${trendColor}`}>
                                  ₹{price.modelPrice} <span className="text-[9px]">{trendSym}</span>
                                </span>
                              </div>
                            );
                          })
                        ) : (
                          // High-quality loading fallback
                          <>
                            <div className="flex justify-between items-center text-xs animate-pulse">
                              <span className="text-slate-400">Loading Sona Masuri Paddy...</span>
                              <span className="font-mono text-slate-400">₹2,320</span>
                            </div>
                            <div className="flex justify-between items-center text-xs animate-pulse">
                              <span className="text-slate-400">Loading Bunny Cotton...</span>
                              <span className="font-mono text-slate-400">₹7,250</span>
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    <button 
                      onClick={() => setActiveTab("market")}
                      className={`w-full mt-3 transition text-[10px] py-1 rounded font-bold uppercase tracking-wider cursor-pointer text-center ${
                        theme === 'dark' ? 'bg-slate-950 hover:bg-slate-850 text-emerald-400 border border-slate-850' : 'bg-slate-700/60 hover:bg-slate-700 text-emerald-400'
                      }`}
                    >
                      Telangana Index Center ➔
                    </button>
                  </div>

                  {/* AI Disease Detection Module */}
                  <div className={`col-span-12 lg:col-span-7 rounded-xl border shadow-sm overflow-hidden flex flex-col justify-between transition-colors duration-300 ${
                    theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                  }`}>
                    <div className={`p-4 border-b flex justify-between items-center transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-slate-950/40 border-slate-800' : 'bg-slate-50/50 border-slate-100'
                    }`}>
                      <h3 className="text-sm font-bold flex items-center gap-2">
                        <span className="w-2 h-2 bg-blue-500 rounded-full animate-ping"></span>
                        <span className={theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}>AI Diagnosis Lab</span>
                      </h3>
                      <span className="text-[9px] text-slate-400 font-mono">SCAN ID: #AI-4492-X</span>
                    </div>
                    
                    <div className={`flex-1 flex flex-col md:flex-row gap-4 p-4 transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-slate-950/20' : 'bg-slate-50/20'
                    }`}>
                      {/* Left: upload drag zone placeholder */}
                      <div 
                        onClick={() => setActiveTab("ai")}
                        className={`flex-1 rounded-lg border-2 border-dashed transition flex flex-col items-center justify-center text-center p-4 cursor-pointer ${
                          theme === 'dark' ? 'border-slate-800 bg-slate-950 hover:border-emerald-500' : 'border-slate-200 bg-white hover:border-emerald-500'
                        }`}
                      >
                        <div className="w-10 h-10 bg-blue-50 rounded-full flex items-center justify-center mb-2">
                          <Sparkles className="w-5 h-5 text-blue-600" />
                        </div>
                        <p className={`text-xs font-bold font-display ${theme === 'dark' ? 'text-slate-200' : 'text-slate-700'}`}>Upload Leaf Image</p>
                        <p className="text-[10px] text-slate-400 mt-1">Drag & drop or browse from gallery</p>
                      </div>
                      
                      {/* Right: mock diagnostic helper status */}
                      <div className="flex-1 flex flex-col justify-between gap-3">
                        <div className={`p-3 border rounded-lg transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-rose-950/20 border-rose-900/40 text-rose-300' : 'bg-rose-50 border-rose-100 text-rose-800'
                        }`}>
                          <div className="flex items-center justify-between mb-1">
                            <span className={`text-[10px] font-bold uppercase ${theme === 'dark' ? 'text-rose-400' : 'text-rose-700'}`}>Result</span>
                            <span className="px-1.5 py-0.5 bg-rose-200 text-rose-800 text-[8px] rounded font-bold">92% MATCH</span>
                          </div>
                          <p className={`text-sm font-bold ${theme === 'dark' ? 'text-white' : 'text-slate-800'}`}>Potato Early Blight</p>
                          <p className="text-xs mt-1 leading-snug text-rose-300">
                            Treatment: Copper-based fungicides. Remove infected lower leaves immediately.
                          </p>
                        </div>
                        
                        <div className={`p-2.5 border rounded-lg transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-slate-950/30 border-slate-800' : 'bg-white border-slate-200'
                        }`}>
                          <h4 className="text-[10px] font-bold text-slate-400 uppercase mb-2">Recent Scans</h4>
                          <div className="space-y-2 text-[11px]">
                            <div className="flex justify-between">
                              <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>Rice Blast</span> 
                              <span className="text-emerald-500 font-bold font-mono">SAFE</span>
                            </div>
                            <div className="flex justify-between">
                              <span className={theme === 'dark' ? 'text-slate-300' : 'text-slate-600'}>Cotton Root Rot</span> 
                              <span className="text-amber-500 font-bold font-mono">LOW</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className={`p-3 flex justify-between items-center px-5 transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-slate-950 text-slate-300' : 'bg-slate-800 text-white'
                    }`}>
                      <div className="flex gap-4">
                        <div className="text-center">
                          <p className="text-[9px] text-slate-400 uppercase">Total Scans</p>
                          <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-white'}`}>128</p>
                        </div>
                        <div className="text-center">
                          <p className="text-[9px] text-slate-400 uppercase">Accuracy</p>
                          <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-white'}`}>98.4%</p>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab("ai")}
                        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-widest cursor-pointer"
                      >
                        Start New Analysis
                      </button>
                    </div>
                  </div>

                  {/* Equipment & Schemes Column */}
                  <div className="col-span-12 lg:col-span-5 flex flex-col gap-4">
                    {/* Equipment Rental Card */}
                    <div className={`rounded-xl border shadow-sm p-4 transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-800'
                    }`}>
                      <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 font-mono">Equipment Rentals</h3>
                      <div className="space-y-3">
                        <div className={`flex items-center justify-between p-2 rounded border transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-slate-950/40 border-slate-800/80 text-slate-200' : 'bg-slate-50 border-slate-100 text-slate-800'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className="text-lg">🚜</div>
                            <div>
                              <p className="text-xs font-bold">John Deere 5050D</p>
                              <p className="text-[10px] text-slate-400">Due: Oct 14th</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-amber-500 bg-amber-500/10 px-2 py-0.5 rounded">ACTIVE</span>
                        </div>
                        <div className={`flex items-center justify-between p-2 rounded border opacity-60 transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-slate-950/20 border-slate-800/50 text-slate-400' : 'bg-slate-50 border-slate-100 text-slate-800'
                        }`}>
                          <div className="flex items-center gap-3">
                            <div className="text-lg">🌾</div>
                            <div>
                              <p className="text-xs font-bold">Power Tiller MTX</p>
                              <p className="text-[10px] text-slate-500">Returned: Sep 28th</p>
                            </div>
                          </div>
                          <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded">COMPLETED</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setActiveTab("equipment")}
                        className={`w-full mt-4 border py-2 rounded-lg text-xs font-bold transition cursor-pointer text-center ${
                          theme === 'dark' ? 'border-emerald-700 text-emerald-400 hover:bg-emerald-950/30' : 'border-emerald-600 text-emerald-600 hover:bg-emerald-50'
                        }`}
                      >
                        RENT NEW GEAR
                      </button>
                    </div>
                    
                    {/* Government Schemes */}
                    <div className={`rounded-xl border shadow-sm p-4 transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-amber-950/15 border-amber-900/30 text-amber-200' : 'bg-amber-50 border-amber-200 text-amber-900'
                    }`}>
                      <h3 className={`text-xs font-bold uppercase tracking-widest mb-3 font-mono ${theme === 'dark' ? 'text-amber-400' : 'text-amber-800'}`}>Government Schemes</h3>
                      <div className="space-y-2.5">
                        <div className={`p-2 rounded border transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-slate-950/50 border-amber-900/20' : 'bg-white border-amber-200'
                        }`}>
                          <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>PM Kisan Samman Nidhi</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-emerald-500 font-bold uppercase">Eligible</span>
                            <span className="text-[10px] text-slate-400 font-mono">₹2,000 PENDING</span>
                          </div>
                        </div>
                        <div className={`p-2 rounded border transition-colors duration-300 ${
                          theme === 'dark' ? 'bg-slate-950/50 border-amber-900/20' : 'bg-white border-amber-200'
                        }`}>
                          <p className={`text-xs font-bold ${theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}`}>Crop Insurance (Fasal Bima)</p>
                          <div className="flex justify-between items-center mt-1">
                            <span className="text-[10px] text-blue-500 font-bold uppercase">Active Policy</span>
                            <span className="text-[10px] text-slate-400 font-mono">EXP: JUNE 2024</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* VOICE DOUBT VERIFICATION PROMO BANNER ON HOME DASHBOARD */}
                  <div className={`col-span-12 rounded-3xl border p-5 shadow-lg relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-4 ${
                    theme === 'dark' 
                      ? 'bg-gradient-to-r from-emerald-950/80 via-slate-900 to-teal-950/80 border-emerald-500/30 text-white' 
                      : 'bg-gradient-to-r from-emerald-900 via-teal-950 to-slate-900 border-emerald-700 text-white'
                  }`}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-emerald-500/20 border border-emerald-400/40 flex items-center justify-center text-emerald-400 shrink-0">
                        <Mic className="w-6 h-6 animate-pulse" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[9px] font-mono font-bold bg-emerald-400/20 text-emerald-300 border border-emerald-400/30 px-2 py-0.5 rounded-full uppercase">
                            ✨ New Gemini 3.7 Voice Agent
                          </span>
                          <span className="text-[9px] font-mono text-slate-300">English • తెలుగు • हिन्दी</span>
                        </div>
                        <h3 className="text-sm md:text-base font-black font-display tracking-tight text-white mt-1">
                          Have a farming doubt? Ask by Voice to Verify Instantly
                        </h3>
                        <p className="text-xs text-slate-300 max-w-xl">
                          Fact-check pesticide combinations, spray timings before rain, NPK mixes, and crop diseases with scientific confidence.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        onClick={() => setActiveTab('voice')}
                        className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs transition shadow-md flex items-center gap-2 cursor-pointer"
                      >
                        <Mic className="w-3.5 h-3.5" />
                        <span>Launch Voice Agent</span>
                      </button>
                    </div>
                  </div>

                </div>
              )}

              {/* TAB: GEMINI VOICE DOUBT VERIFICATION AGENT */}
              {activeTab === 'voice' && (
                <VoiceDoubtVerificationAgent
                  currentUser={currentUser}
                  theme={theme}
                  onNotify={triggerToast}
                  activeCropContext="Paddy, Cotton, Chilli, Maize, Groundnut"
                />
              )}

              {/* TAB 2: MY CROP FIELDS */}
              {activeTab === 'crops' && (
                <CropManager onNotify={triggerToast} />
              )}

              {/* TAB 3: WEATHER & ADVISORIES */}
              {activeTab === 'weather' && (
                <WeatherBoard onNotify={triggerToast} initialCoords={coords} />
              )}

              {/* TAB 8: PESTICIDES & FERTILIZERS */}
              {activeTab === 'pesticides' && (
                <PesticideFertilizerGuide 
                  onNotify={triggerToast} 
                  bookings={bookings}
                  setBookings={setBookings}
                />
              )}

              {/* TAB: MY PACS BOOKINGS */}
              {activeTab === 'bookings' && (
                <PesticideFertilizerGuide 
                  onNotify={triggerToast} 
                  bookings={bookings}
                  setBookings={setBookings}
                  initialTab="bookings"
                />
              )}

              {/* TAB 4: DIRECT MARKETPLACE */}
              {activeTab === 'market' && (
                <Marketplace onNotify={triggerToast} />
              )}

              {/* TAB 5: MACHINERY RENTAL */}
              {activeTab === 'equipment' && (
                <EquipmentRental onNotify={triggerToast} />
              )}

              {/* TAB 6: AI PLANT DOCTOR */}
              {activeTab === 'ai' && (
                <DiseaseDetector onNotify={triggerToast} />
              )}

              {/* TAB 7: GRANTS & SUBSIDIES */}
              {activeTab === 'schemes' && (
                <GovernmentSchemes onNotify={triggerToast} />
              )}

              {/* TAB 9: MACHINE LEARNING INTELLIGENCE STUDIO */}
              {activeTab === 'ml' && (
                <MachineLearningStudio
                  currentUser={currentUser}
                  theme={theme}
                  onTriggerToast={triggerToast}
                />
              )}

            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* PROFILE & SETTINGS MODAL */}
      <AnimatePresence>
        {isProfileModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/75 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 12 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 12 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className={`w-full max-w-xl rounded-3xl border shadow-2xl overflow-hidden transition-colors duration-300 ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800 text-slate-100' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              {/* Modal Header */}
              <div className={`p-5 border-b flex items-center justify-between transition-colors duration-300 ${
                theme === 'dark' ? 'border-slate-800 bg-slate-950/60' : 'border-slate-150 bg-slate-50'
              }`}>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-600/20 border border-emerald-500/30 flex items-center justify-center text-emerald-500 shrink-0">
                    <UserCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-extrabold font-display">{t.profileAndSettings || "Profile & Settings"}</h3>
                    <p className="text-[11px] text-slate-400 font-mono">{currentUser.name} • <span className="text-emerald-500">{currentUser.pacsId}</span></p>
                  </div>
                </div>
                <button
                  onClick={() => setIsProfileModalOpen(false)}
                  className={`p-2 rounded-xl transition cursor-pointer ${
                    theme === 'dark' ? 'hover:bg-slate-800 text-slate-400 hover:text-white' : 'hover:bg-slate-200 text-slate-500 hover:text-slate-900'
                  }`}
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Navigation Tabs (Profile vs Settings) */}
              <div className={`flex border-b px-5 transition-colors duration-300 ${
                theme === 'dark' ? 'border-slate-800 bg-slate-900/90' : 'border-slate-200/80 bg-white'
              }`}>
                <button
                  onClick={() => setProfileModalTab('profile')}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                    profileModalTab === 'profile'
                      ? 'border-emerald-500 text-emerald-500'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <User className="w-4 h-4" />
                  <span>{t.profileTab || "Farmer Profile"}</span>
                </button>

                <button
                  onClick={() => setProfileModalTab('settings')}
                  className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition cursor-pointer ${
                    profileModalTab === 'settings'
                      ? 'border-emerald-500 text-emerald-500'
                      : 'border-transparent text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <Settings className="w-4 h-4" />
                  <span>{t.settingsTab || "App Settings"}</span>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 max-h-[75vh] overflow-y-auto space-y-6">
                {profileModalTab === 'profile' && (
                  <div className="space-y-4">
                    <form onSubmit={(e) => {
                      handleUpdateProfile(e);
                      setIsProfileModalOpen(false);
                    }} className="space-y-4">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono mb-1">
                            Farmer Full Name
                          </label>
                          <input
                            type="text"
                            value={profileName}
                            onChange={(e) => setProfileName(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${
                              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono mb-1">
                            Mobile Phone (India - 10 Digits)
                          </label>
                          <div className="flex items-center gap-2">
                            <span className={`px-3 py-2.5 border rounded-xl text-xs font-mono font-bold flex items-center gap-1 shrink-0 ${
                              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-100 border-slate-200 text-emerald-700'
                            }`}>
                              <span>🇮🇳</span>
                              <span>+91</span>
                            </span>
                            <input
                              type="tel"
                              value={profilePhone}
                              maxLength={10}
                              placeholder="9876543210"
                              onChange={(e) => setProfilePhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                              className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold font-mono transition ${
                                theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                              }`}
                            />
                          </div>
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono mb-1">
                            Aadhaar Number (12 Digits)
                          </label>
                          <input
                            type="text"
                            maxLength={14}
                            placeholder="5432 9876 1234"
                            value={profileAadhaar}
                            onChange={(e) => {
                              const cleaned = e.target.value.replace(/\D/g, "").slice(0, 12);
                              const matches = cleaned.match(/(\d{1,4})/g);
                              setProfileAadhaar(matches ? matches.join(" ") : cleaned);
                            }}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold font-mono tracking-wider transition ${
                              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono mb-1">
                            PACS Membership ID
                          </label>
                          <input
                            type="text"
                            value={profilePacs}
                            onChange={(e) => setProfilePacs(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-mono font-bold transition ${
                              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-emerald-400' : 'bg-slate-50 border-slate-200 text-emerald-700'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono mb-1">
                            Land Size (Acres)
                          </label>
                          <input
                            type="number"
                            step="0.1"
                            value={profileLandSize}
                            onChange={(e) => setProfileLandSize(e.target.value)}
                            className={`w-full px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${
                              theme === 'dark' ? 'bg-slate-950 border-slate-800 text-white' : 'bg-slate-50 border-slate-200 text-slate-900'
                            }`}
                          />
                        </div>

                        <div>
                          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest block font-mono mb-1">
                            State & District
                          </label>
                          <div className={`px-3.5 py-2.5 rounded-xl border text-xs font-semibold transition ${
                            theme === 'dark' ? 'bg-slate-950 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-700'
                          }`}>
                            {profileDistrict}, {profileState}
                          </div>
                        </div>
                      </div>

                      <div className="pt-2 flex justify-end gap-3">
                        <button
                          type="button"
                          onClick={() => setIsProfileModalOpen(false)}
                          className={`px-4 py-2 rounded-xl text-xs font-bold transition cursor-pointer ${
                            theme === 'dark' ? 'bg-slate-800 hover:bg-slate-700 text-slate-300' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          Close
                        </button>
                        <button
                          type="submit"
                          className="px-5 py-2 rounded-xl text-xs font-bold bg-emerald-600 hover:bg-emerald-500 text-white transition shadow-md cursor-pointer flex items-center gap-1.5"
                        >
                          <Save className="w-3.5 h-3.5" />
                          <span>Save Profile</span>
                        </button>
                      </div>
                    </form>
                  </div>
                )}

                {profileModalTab === 'settings' && (
                  <div className="space-y-6">
                    {/* Language Settings Section */}
                    <div className={`p-4.5 rounded-2xl border transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                    }`}>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        <Languages className="w-4 h-4 text-emerald-500" />
                        <h4 className="text-xs font-black uppercase tracking-wider font-mono text-emerald-500">
                          {t.languagePreference || "Language Preference"}
                        </h4>
                      </div>
                      <p className="text-[11px] text-slate-400 mb-4 leading-relaxed">
                        {t.languageDescription || "Select your preferred language. Updates immediately across all screens and saves to your account."}
                      </p>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <button
                          type="button"
                          onClick={() => {
                            setLanguage('en');
                            if (currentUser) {
                              const updatedFarmer = { ...currentUser, preferredLanguage: 'en' as const };
                              setCurrentUser(updatedFarmer);
                              localStorage.setItem('agriconnect_farmer', JSON.stringify(updatedFarmer));
                            }
                            localStorage.setItem('agriconnect_lang', 'en');
                            triggerToast(t.languageChangedToast || "Language changed to English!", "success");
                          }}
                          className={`p-4 rounded-2xl border text-left transition duration-200 flex items-center justify-between cursor-pointer ${
                            language === 'en'
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-2 ring-emerald-500/30 font-bold'
                              : theme === 'dark'
                                ? 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300'
                                : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🇬🇧</span>
                            <div>
                              <p className="text-xs font-black">English</p>
                              <p className="text-[10px] text-slate-400 font-mono">Default / Global</p>
                            </div>
                          </div>
                          {language === 'en' && (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            setLanguage('te');
                            if (currentUser) {
                              const updatedFarmer = { ...currentUser, preferredLanguage: 'te' as const };
                              setCurrentUser(updatedFarmer);
                              localStorage.setItem('agriconnect_farmer', JSON.stringify(updatedFarmer));
                            }
                            localStorage.setItem('agriconnect_lang', 'te');
                            triggerToast("భాష విజయవంతంగా మార్చబడింది!", "success");
                          }}
                          className={`p-4 rounded-2xl border text-left transition duration-200 flex items-center justify-between cursor-pointer ${
                            language === 'te'
                              ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-2 ring-emerald-500/30 font-bold'
                              : theme === 'dark'
                                ? 'border-slate-800 bg-slate-900/80 hover:bg-slate-800 text-slate-300'
                                : 'border-slate-200 bg-white hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <span className="text-2xl">🇮🇳</span>
                            <div>
                              <p className="text-xs font-black font-sans">తెలుగు (Telugu)</p>
                              <p className="text-[10px] text-slate-400 font-mono">భారతీయ ప్రాంతీయ భాష</p>
                            </div>
                          </div>
                          {language === 'te' && (
                            <div className="w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center text-slate-950">
                              <Check className="w-3.5 h-3.5 stroke-[3]" />
                            </div>
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Theme Settings Section */}
                    <div className={`p-4.5 rounded-2xl border transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                    }`}>
                      <div className="flex items-center gap-2.5 mb-1.5">
                        {theme === 'dark' ? <Moon className="w-4 h-4 text-amber-400" /> : <Sun className="w-4 h-4 text-emerald-500" />}
                        <h4 className="text-xs font-black uppercase tracking-wider font-mono text-emerald-500">
                          {t.themePreference || "Color Theme"}
                        </h4>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <button
                          type="button"
                          onClick={() => {
                            if (theme !== 'light') toggleTheme();
                          }}
                          className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 justify-center transition cursor-pointer ${
                            theme === 'light'
                              ? 'border-emerald-500 bg-emerald-50 text-emerald-800 font-black shadow-xs'
                              : 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                          }`}
                        >
                          <Sun className="w-4 h-4 text-amber-500" />
                          <span>{t.lightMode || "Light Mode"}</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => {
                            if (theme !== 'dark') toggleTheme();
                          }}
                          className={`p-3 rounded-xl border text-xs font-bold flex items-center gap-2 justify-center transition cursor-pointer ${
                            theme === 'dark'
                              ? 'border-emerald-500 bg-slate-950 text-emerald-400 font-black shadow-xs'
                              : 'border-slate-200 bg-white text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          <Moon className="w-4 h-4 text-amber-400" />
                          <span>{t.darkMode || "Dark Mode"}</span>
                        </button>
                      </div>
                    </div>

                    {/* Battery & Power Durability Section */}
                    <div className={`p-4.5 rounded-2xl border transition-colors duration-300 ${
                      theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200/80'
                    }`}>
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2.5">
                          <BatteryMedium className="w-4 h-4 text-emerald-500" />
                          <h4 className="text-xs font-black uppercase tracking-wider font-mono text-emerald-500">
                            {t.batteryOptimizer || "Battery Saver & Field Durability"}
                          </h4>
                        </div>
                        <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-full border ${
                          isLowPowerActive 
                            ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' 
                            : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                        }`}>
                          {isLowPowerActive ? 'SAVER ACTIVE' : `${Math.round(batteryStatus.level * 100)}%`}
                        </span>
                      </div>

                      {/* Phone Battery Diagnostics Banner */}
                      <div className={`p-3 rounded-xl border mb-4 flex items-center justify-between ${
                        theme === 'dark' ? 'bg-slate-900/90 border-slate-800' : 'bg-white border-slate-200'
                      }`}>
                        <div className="flex items-center gap-3">
                          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400">
                            {batteryStatus.charging ? (
                              <BatteryCharging className="w-5 h-5 animate-pulse" />
                            ) : batteryStatus.level <= 0.25 ? (
                              <BatteryWarning className="w-5 h-5 text-rose-400" />
                            ) : (
                              <Battery className="w-5 h-5 text-emerald-400" />
                            )}
                          </div>
                          <div>
                            <p className="text-xs font-bold font-mono">
                              {Math.round(batteryStatus.level * 100)}% ({batteryStatus.charging ? (t.chargingStatus || "Charging") : (t.dischargingStatus || "On Battery")})
                            </p>
                            <p className="text-[10px] text-slate-400">
                              {estimatedRemainingHours !== null 
                                ? `${t.estimatedBatteryHours || "Est. Duration Remaining"}: ~${estimatedRemainingHours} hours`
                                : "Continuous Power Connected"}
                            </p>
                          </div>
                        </div>

                        {/* Power Level Progress Bar */}
                        <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden border border-slate-700">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${
                              batteryStatus.level > 0.5 ? 'bg-emerald-500' : batteryStatus.level > 0.2 ? 'bg-amber-500' : 'bg-rose-500'
                            }`}
                            style={{ width: `${Math.round(batteryStatus.level * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Power Mode Selector */}
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase text-slate-400 block font-bold">
                          {t.powerMode || "Power Mode Selection"}
                        </label>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setPowerMode('auto');
                              triggerToast("Power Mode set to Auto Eco", "info");
                            }}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-start transition cursor-pointer ${
                              powerMode === 'auto'
                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40'
                                : theme === 'dark'
                                  ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                              Auto Eco
                            </span>
                            <span className="text-[9px] text-slate-400 mt-0.5 font-normal">Auto under 25%</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPowerMode('battery_saver');
                              triggerToast("Battery Saver enabled for maximum field durability", "success");
                            }}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-start transition cursor-pointer ${
                              powerMode === 'battery_saver'
                                ? 'border-amber-500 bg-amber-500/15 text-amber-300 ring-1 ring-amber-500/40 font-black'
                                : theme === 'dark'
                                  ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Zap className="w-3.5 h-3.5 text-amber-400" />
                              Battery Saver
                            </span>
                            <span className="text-[9px] text-slate-400 mt-0.5 font-normal">Max Field Life</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setPowerMode('high_performance');
                              triggerToast("Standard Performance enabled", "info");
                            }}
                            className={`p-2.5 rounded-xl border text-xs font-bold flex flex-col items-start transition cursor-pointer ${
                              powerMode === 'high_performance'
                                ? 'border-emerald-500 bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/40'
                                : theme === 'dark'
                                  ? 'border-slate-800 bg-slate-900 text-slate-400 hover:text-white'
                                  : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                            }`}
                          >
                            <span className="flex items-center gap-1.5">
                              <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
                              Standard
                            </span>
                            <span className="text-[9px] text-slate-400 mt-0.5 font-normal">All Visual FX</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FLOATING GEMINI VOICE DOUBT ASSISTANT LAUNCHER (COMPACT ROUND MIC WITH BREATHING GLOW) */}
      <div className="fixed bottom-6 right-6 z-40">
        <motion.button
          onClick={() => {
            if (activeTab === 'voice') {
              triggerToast("You are currently in the Voice Doubt Verification Agent studio.", "info");
            } else {
              setIsVoiceModalOpen(true);
            }
          }}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.92 }}
          animate={{
            boxShadow: [
              "0 10px 25px -5px rgba(16, 185, 129, 0.4), 0 0 15px 2px rgba(52, 211, 153, 0.3)",
              "0 20px 35px -5px rgba(16, 185, 129, 0.75), 0 0 28px 6px rgba(52, 211, 153, 0.6)",
              "0 10px 25px -5px rgba(16, 185, 129, 0.4), 0 0 15px 2px rgba(52, 211, 153, 0.3)"
            ]
          }}
          transition={{
            duration: 2.8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="w-13 h-13 sm:w-14 sm:h-14 rounded-full bg-gradient-to-tr from-emerald-600 via-emerald-500 to-teal-400 text-slate-950 flex items-center justify-center border-2 border-emerald-300/90 hover:border-white transition-all cursor-pointer group relative"
          title="Ask Voice Doubt (Gemini AI)"
          aria-label="Ask Voice Doubt"
        >
          <motion.div
            animate={{
              opacity: [0.7, 1, 0.7],
              scale: [0.94, 1.06, 0.94],
              filter: [
                "drop-shadow(0 0 1px rgba(0,0,0,0.4))",
                "drop-shadow(0 0 8px rgba(255,255,255,0.9))",
                "drop-shadow(0 0 1px rgba(0,0,0,0.4))"
              ]
            }}
            transition={{
              duration: 2.8,
              repeat: Infinity,
              ease: "easeInOut"
            }}
            className="flex items-center justify-center"
          >
            <Mic className="w-6 h-6 text-slate-950" />
          </motion.div>
        </motion.button>
      </div>

      {/* FLOATING GEMINI VOICE DOUBT MODAL */}
      <AnimatePresence>
        {isVoiceModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-slate-950/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className={`w-full max-w-4xl max-h-[92vh] overflow-y-auto rounded-3xl border shadow-2xl p-4 sm:p-6 relative transition-colors ${
                theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
              }`}
            >
              <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                  <h3 className="text-sm font-black font-display tracking-tight text-emerald-400">
                    Gemini AI Voice Doubt Verification
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => {
                      setIsVoiceModalOpen(false);
                      setActiveTab('voice');
                    }}
                    className="text-xs font-mono font-bold text-emerald-400 hover:underline px-2.5 py-1 rounded-lg bg-emerald-950/50 border border-emerald-800/60 transition cursor-pointer"
                  >
                    Open Full Studio ➔
                  </button>
                  <button
                    onClick={() => setIsVoiceModalOpen(false)}
                    className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white transition cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              <VoiceDoubtVerificationAgent
                currentUser={currentUser}
                theme={theme}
                onNotify={triggerToast}
                activeCropContext="Paddy, Cotton, Chilli, Maize, Groundnut"
                isFloatingModal={true}
                onCloseFloating={() => setIsVoiceModalOpen(false)}
              />
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* FOOTER */}
      <footer className={`border-t py-6 px-4 shrink-0 text-center text-xs transition-colors duration-300 ${
        theme === 'dark' 
          ? 'bg-slate-900 border-slate-850 text-slate-500' 
          : 'bg-white border-slate-200 text-slate-400 font-medium'
      }`}>
        <div className="max-w-7xl mx-auto space-y-1">
          <p>© 2026 AgriConnect. Certified organic, empowering local farming communities.</p>
          <p className="text-[10px] font-mono transition-colors duration-300 text-slate-500">
            Full-Stack Node/TypeScript App • Active in sandbox preview mode
          </p>
        </div>
      </footer>

    </div>
  );
}
