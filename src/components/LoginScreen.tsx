import React, { useState, useEffect, useRef } from "react";
import { 
  Sprout, 
  Shield, 
  Phone, 
  CreditCard, 
  Lock, 
  ArrowRight, 
  MapPin, 
  UserCheck, 
  Check, 
  AlertCircle, 
  Fingerprint,
  Info,
  X,
  Copy,
  Tractor,
  Cloud,
  Eye,
  EyeOff,
  Compass,
  Sun,
  Moon,
  Wind,
  Sparkles,
  Mail
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { FarmerUser } from "../types";
import agriconnectLogo from "../assets/images/agriconnect_logo_v2_1784827547802.jpg";
import { useLanguage, LanguageSelector } from "../LanguageContext";

interface LoginScreenProps {
  onLoginSuccess: (farmer: FarmerUser) => void;
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  theme?: "dark" | "light";
  onToggleTheme?: () => void;
}

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

export default function LoginScreen({ onLoginSuccess, onNotify, theme = "dark", onToggleTheme }: LoginScreenProps) {
  const { language, t } = useLanguage();
  const [activeTab, setActiveTab] = useState<"aadhaar" | "phone">("aadhaar");
  const [isRegistering, setIsRegistering] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  // Login inputs
  const [aadhaarInput, setAadhaarInput] = useState("");
  const [phoneInput, setPhoneInput] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [simulatedOtp, setSimulatedOtp] = useState("");
  const [errorMsg, setErrorMsg] = useState("");

  // Registration inputs
  const [regName, setRegName] = useState("");
  const [regPhone, setRegPhone] = useState("");
  const [regAadhaar, setRegAadhaar] = useState("");
  const [regLandSize, setRegLandSize] = useState("2.0");
  const [regLandUnit, setRegLandUnit] = useState<'acres' | 'guntas'>('acres');
  const [regState, setRegState] = useState("Telangana");
  const [regDistrict, setRegDistrict] = useState("Suryapet");

  // Registration OTP states
  const [regOtpSent, setRegOtpSent] = useState(false);
  const [regOtpValue, setRegOtpValue] = useState("");
  const [regSimulatedOtp, setRegSimulatedOtp] = useState("");

  // Local Toast notification for displaying fake OTP directly on login page
  const [localToast, setLocalToast] = useState<{ message: string; type: 'success' | 'info' | 'error'; otp?: string } | null>(null);

  // Focus states for green glowing borders and floating labels
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // Toggle for password/OTP visibility
  const [showPassword, setShowPassword] = useState(false);

  // Success animation states
  const [isSuccessAnimating, setIsSuccessAnimating] = useState(false);
  const [successFarmer, setSuccessFarmer] = useState<FarmerUser | null>(null);

  useEffect(() => {
    if (localToast) {
      const timer = setTimeout(() => {
        setLocalToast(null);
      }, 15000); // 15 seconds display for extra readability and copy ease
      return () => clearTimeout(timer);
    }
  }, [localToast]);

  // Ref to guarantee stable callback access without resetting transition timer
  const onLoginSuccessRef = useRef(onLoginSuccess);
  useEffect(() => {
    onLoginSuccessRef.current = onLoginSuccess;
  }, [onLoginSuccess]);

  // Handle successful login/registration delay and smooth transition to dashboard
  useEffect(() => {
    if (isSuccessAnimating && successFarmer) {
      const timer = setTimeout(() => {
        onLoginSuccessRef.current({
          ...successFarmer,
          preferredLanguage: successFarmer.preferredLanguage || (language as 'en' | 'te')
        });
      }, 1200);
      return () => clearTimeout(timer);
    }
  }, [isSuccessAnimating, successFarmer, language]);

  // Format Aadhaar Number nicely as XXXX XXXX XXXX
  const formatAadhaar = (val: string) => {
    const cleaned = val.replace(/\D/g, "").slice(0, 12);
    const matches = cleaned.match(/(\d{1,4})/g);
    return matches ? matches.join(" ") : cleaned;
  };

  const handleAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAadhaarInput(formatAadhaar(e.target.value));
  };

  const handleRegAadhaarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setRegAadhaar(formatAadhaar(e.target.value));
  };

  // Switch state's districts automatically
  useEffect(() => {
    const matchedState = INDIAN_STATES.find(s => s.id === regState);
    if (matchedState && matchedState.districts.length > 0) {
      setRegDistrict(matchedState.districts[0]);
    }
  }, [regState]);

  // Submit Login
  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    let credential = "";
    if (activeTab === "aadhaar") {
      credential = aadhaarInput.trim();
      if (credential.replace(/\s+/g, "").length !== 12) {
        setErrorMsg("Please enter a valid 12-digit Aadhaar number.");
        return;
      }
    } else {
      const cleanPhone = phoneInput.replace(/\D/g, "");
      if (cleanPhone.length !== 10) {
        setErrorMsg("Please enter a valid 10-digit Indian mobile number.");
        return;
      }
      if (!/^[6-9]/.test(cleanPhone)) {
        setErrorMsg("Indian mobile numbers must start with 6, 7, 8, or 9.");
        return;
      }
      credential = cleanPhone;
    }

    // Real OTP request step for Aadhaar & Mobile
    if ((activeTab === "aadhaar" || activeTab === "phone") && !otpSent) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/send-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ loginType: activeTab, credential })
        });
        const data = await response.json();
        
        if (response.ok && data.success) {
          setOtpSent(true);
          if (data.simulated) {
            setSimulatedOtp(data.otp);
            setLocalToast({
              message: "Sandbox Security Gateway: Use the generated fake OTP verification code below to log in securely.",
              type: "info",
              otp: data.otp
            });
            onNotify(`Sandbox Code Generated: ${data.otp}`, "info");
          } else {
            setSimulatedOtp("");
            onNotify(data.message || "OTP code sent to your registered mobile number!", "success");
          }
        } else {
          setErrorMsg(data.error || "Failed to generate security verification code.");
        }
      } catch (err) {
        setErrorMsg("Failed to communicate with authentication gateway.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Submit verification code to backend
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          loginType: activeTab, 
          credential,
          otp: (activeTab === "aadhaar" || activeTab === "phone") ? otpValue.trim() : undefined
        })
      });
      const data = await response.json();

      if (response.ok && data.farmer) {
        onNotify(`Welcome back, ${data.farmer.name}!`, "success");
        setSuccessFarmer(data.farmer);
        setIsSuccessAnimating(true);
      } else {
        setErrorMsg(data.error || "Farmer credentials not registered. Go to registration tab.");
        if (activeTab === "aadhaar" || activeTab === "phone") {
          setOtpSent(false); // Reset OTP step to retry
          setOtpValue("");
          setSimulatedOtp("");
        }
      }
    } catch (err) {
      setErrorMsg("Server communication error. Please check backend connection.");
    } finally {
      setIsLoading(false);
    }
  };

  // Submit Registration
  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");

    if (!regName.trim()) {
      setErrorMsg("Please enter your full name.");
      return;
    }
    const cleanRegPhone = regPhone.replace(/\D/g, "");
    if (cleanRegPhone.length !== 10) {
      setErrorMsg("Please enter a valid 10-digit Indian mobile number.");
      return;
    }
    if (!/^[6-9]/.test(cleanRegPhone)) {
      setErrorMsg("Indian mobile numbers must start with 6, 7, 8, or 9.");
      return;
    }
    if (regAadhaar.replace(/\s+/g, "").length !== 12) {
      setErrorMsg("Please enter your 12-digit Aadhaar number.");
      return;
    }

    // Step 1: Send registration verification OTP if not sent yet
    if (!regOtpSent) {
      setIsLoading(true);
      try {
        const response = await fetch("/api/auth/send-register-otp", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ phone: cleanRegPhone, aadhaar: regAadhaar.trim() })
        });
        const data = await response.json();

        if (response.ok && data.success) {
          setRegOtpSent(true);
          if (data.simulated) {
            setRegSimulatedOtp(data.otp);
            setLocalToast({
              message: "Registration Verification: Please use the generated fake OTP code below to verify your mobile number and complete your registration.",
              type: "info",
              otp: data.otp
            });
            onNotify(`Registration Code Generated: ${data.otp}`, "info");
          } else {
            setRegSimulatedOtp("");
            onNotify(data.message || "Verification code sent to your mobile number!", "success");
          }
        } else {
          setErrorMsg(data.error || "Failed to generate registration verification code.");
        }
      } catch (err) {
        setErrorMsg("Failed to communicate with registration gateway.");
      } finally {
        setIsLoading(false);
      }
      return;
    }

    // Step 2: Validate OTP and register
    if (!regOtpValue.trim()) {
      setErrorMsg("Please enter the verification code.");
      return;
    }

    setIsLoading(true);
    try {
      const generatedPacsId = `PACS-${regState.slice(0, 3).toUpperCase()}-${Math.floor(1000 + Math.random() * 9000)}`;
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          aadhaar: regAadhaar.trim(),
          phone: cleanRegPhone,
          name: regName.trim(),
          pacsId: generatedPacsId,
          landSize: regLandUnit === 'guntas'
            ? Number(((parseFloat(regLandSize) || 40) / 40).toFixed(2))
            : Number((parseFloat(regLandSize) || 1.0).toFixed(2)),
          state: regState,
          district: regDistrict,
          otp: regOtpValue.trim()
        })
      });
      const data = await response.json();

      if (response.ok && data.farmer) {
        setLocalToast({
          message: `Congratulations ${data.farmer.name}! Your PACS Digital Card has been verified and registered.`,
          type: "success"
        });
        onNotify("Farmer profile successfully registered!", "success");
        setSuccessFarmer(data.farmer);
        setIsSuccessAnimating(true);
      } else {
        setErrorMsg(data.error || "Registration failed.");
      }
    } catch (err) {
      setErrorMsg("Server error during registration.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className={`min-h-screen flex flex-col items-center justify-center p-4 sm:p-8 relative overflow-hidden transition-colors duration-300 ${
      theme === "dark" ? "bg-slate-950 text-slate-100" : "bg-stone-100 text-slate-800"
    }`} id="farmer-login-page">
      
      {/* Top Left Language Selector on Login Page */}
      <div className="fixed top-4 left-4 sm:top-6 sm:left-6 z-50">
        <LanguageSelector theme={theme} />
      </div>

      {/* Top Right Circular Theme Toggle Button */}
      {onToggleTheme && (
        <button
          type="button"
          onClick={onToggleTheme}
          className={`fixed top-4 right-4 sm:top-6 sm:right-6 z-50 w-11 h-11 rounded-full border shadow-xl transition-all duration-300 flex items-center justify-center cursor-pointer ${
            theme === "dark"
              ? "bg-slate-900/90 border-slate-700 text-amber-400 hover:bg-slate-800 hover:scale-110 active:scale-95"
              : "bg-white/95 border-slate-300 text-indigo-700 hover:bg-stone-50 hover:scale-110 active:scale-95 shadow-slate-200"
          }`}
          title={`Switch to ${theme === "dark" ? "Light" : "Dark"} Mode`}
        >
          {theme === "dark" ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-indigo-600" />}
        </button>
      )}
      
      {/* Theme-based Ambient Atmospheric Backgrounds */}
      {theme === "dark" ? (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(4,47,31,0.2)_0%,rgba(2,6,23,1)_85%)] pointer-events-none z-0" />
          <div className="absolute top-12 left-12 w-[500px] h-[500px] rounded-full bg-emerald-500/5 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-12 right-12 w-[500px] h-[500px] rounded-full bg-teal-500/5 blur-[120px] pointer-events-none" />
        </>
      ) : (
        <>
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(16,185,129,0.06)_0%,rgba(245,244,240,1)_85%)] pointer-events-none z-0" />
          <div className="absolute top-12 left-12 w-[500px] h-[500px] rounded-full bg-amber-500/10 blur-[120px] pointer-events-none" />
          <div className="absolute bottom-12 right-12 w-[500px] h-[500px] rounded-full bg-emerald-500/10 blur-[120px] pointer-events-none" />
        </>
      )}

      {/* Main Centered Login Pane */}
      <div className="w-full max-w-md flex flex-col justify-center items-center relative z-10" id="login-right-pane">
      
      {/* Local Toast notification specifically designed to display simulated/fake OTPs prominently */}
      <AnimatePresence>
        {localToast && (
          <motion.div
            initial={{ opacity: 0, y: -40, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            className={`fixed top-6 left-4 right-4 sm:left-auto sm:right-6 sm:w-96 z-50 overflow-hidden backdrop-blur-xl border rounded-2xl shadow-2xl p-4 flex flex-col gap-3 ${
              theme === "dark" 
                ? "bg-slate-900/95 border-emerald-500/30 text-white" 
                : "bg-white/95 border-emerald-600/30 text-slate-800 shadow-[0_20px_40px_rgba(0,0,0,0.12)]"
            }`}
          >
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-2">
                <div className={`p-1.5 border rounded-xl ${theme === "dark" ? "bg-emerald-950 border-emerald-800/60" : "bg-emerald-50 border-emerald-200"}`}>
                  <Fingerprint className="w-5 h-5 text-emerald-500 animate-pulse" />
                </div>
                <div>
                  <h4 className="text-xs font-black uppercase tracking-wider font-mono">AgriConnect OTP Registry</h4>
                  <p className="text-[9px] text-emerald-500 font-bold font-mono">SECURITY GATEWAY VERIFICATION</p>
                </div>
              </div>
              <button 
                onClick={() => setLocalToast(null)} 
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            
            <p className="text-[11px] leading-normal font-sans text-slate-500 dark:text-slate-300">
              {localToast.message}
            </p>

            {localToast.otp && (
              <div className={`border rounded-xl p-3 flex items-center justify-between gap-3 ${theme === "dark" ? "bg-slate-950/80 border-slate-800" : "bg-slate-50 border-slate-200"}`}>
                <div className="space-y-0.5">
                  <span className="text-[8px] font-mono font-bold text-slate-500 uppercase tracking-wider block">Your Sandbox OTP</span>
                  <span className="text-xl font-extrabold font-mono tracking-widest text-emerald-600">{localToast.otp}</span>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(localToast.otp || "");
                    onNotify("Sandbox OTP copied to clipboard!", "success");
                  }}
                  className="bg-emerald-600 hover:bg-emerald-700 rounded-xl px-2.5 py-1.5 text-[10px] font-bold text-white transition flex items-center gap-1.5 cursor-pointer select-none"
                >
                  <Copy className="w-3 h-3" />
                  <span>COPY CODE</span>
                </button>
              </div>
            )}

            <div className="flex items-center justify-between text-[9px] text-slate-400 border-t pt-2 font-mono border-slate-200 dark:border-slate-800">
              <span>Expires in: 5:00 min</span>
              <span className="text-emerald-600 font-black">● SECURE GATEWAY</span>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Centered Login Card */}

      <div 
        className={`backdrop-blur-xl w-full max-w-md rounded-3xl border overflow-hidden relative z-10 transition-all duration-350 ${
          theme === "dark" 
            ? "bg-slate-900/35 border-slate-800/80 shadow-[0_20px_50px_rgba(0,0,0,0.55)]" 
            : "bg-white/95 border-slate-200 shadow-[0_15px_35px_rgba(0,0,0,0.06)]"
        }`} 
        id="auth-box-container"
      >
        {/* Glassmorphic Card Success Overlay */}
        <AnimatePresence>
          {isSuccessAnimating && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-slate-950/90 backdrop-blur-md z-40 flex flex-col items-center justify-center p-6 text-center"
            >
              <div className="space-y-6">
                {/* Circular Success Checkmark Animation */}
                <motion.div
                  initial={{ scale: 0.4, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ type: "spring", stiffness: 120, damping: 14 }}
                  className="w-24 h-24 rounded-full border-4 border-emerald-500 flex items-center justify-center relative bg-emerald-950/40 mx-auto shadow-[0_0_30px_rgba(16,185,129,0.3)]"
                >
                  {/* Glowing outer rings */}
                  <motion.div
                    animate={{ scale: [1, 1.4, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 1.8, repeat: Infinity, ease: "easeOut" }}
                    className="absolute -inset-2 rounded-full border border-emerald-400/30"
                  />
                  <motion.div
                    animate={{ scale: [1, 1.25, 1], opacity: [0.6, 0, 0.6] }}
                    transition={{ duration: 1.4, repeat: Infinity, ease: "easeOut" }}
                    className="absolute -inset-4 rounded-full border border-emerald-500/10"
                  />
                  
                  {/* Actual vector checkmark drawing */}
                  <svg
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="4"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    className="w-11 h-11 text-emerald-400"
                  >
                    <motion.path
                      d="M5 13l4 4L19 7"
                      initial={{ pathLength: 0 }}
                      animate={{ pathLength: 1 }}
                      transition={{ duration: 0.5, ease: "easeInOut", delay: 0.25 }}
                    />
                  </svg>
                </motion.div>

                <div className="space-y-2">
                  <motion.h3
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.4 }}
                    className="text-lg font-black text-white font-display"
                  >
                    {isRegistering ? "Registration Successful!" : "Security Credentials Verified"}
                  </motion.h3>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.6 }}
                    className="text-xs text-slate-300 font-mono"
                  >
                    Welcome, <span className="text-emerald-400 font-bold">{successFarmer?.name}</span>
                  </motion.p>
                  <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-[10px] text-emerald-400 font-mono font-bold tracking-[0.15em] animate-pulse uppercase mt-2"
                  >
                    {isRegistering 
                      ? `PACS DIGITAL CARD ISSUED: ${successFarmer?.pacsId || "ACTIVE"}` 
                      : "INITIALIZING SECURE PACS SESSION..."}
                  </motion.p>
                  <motion.div
                    initial={{ opacity: 0, y: 4 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="pt-2"
                  >
                    <button
                      type="button"
                      onClick={() => {
                        if (successFarmer) {
                          onLoginSuccessRef.current({
                            ...successFarmer,
                            preferredLanguage: successFarmer.preferredLanguage || (language as 'en' | 'te')
                          });
                        }
                      }}
                      className="px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-xl text-xs flex items-center justify-center gap-1.5 mx-auto transition cursor-pointer shadow-lg active:scale-95"
                    >
                      <span>Open Dashboard</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  </motion.div>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        {/* Visual Header Banner representing local agriculture trust */}
        <div className={`p-6 text-center relative border-b transition-colors duration-350 ${
          theme === "dark" 
            ? "bg-gradient-to-br from-emerald-950 via-emerald-900 to-neutral-950 text-white border-slate-800" 
            : "bg-gradient-to-br from-emerald-800 via-emerald-700 to-teal-800 text-white border-slate-200"
        }`}>
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(16,185,129,0.1),transparent)] pointer-events-none" />
          
          <motion.div 
            initial={{ scale: 0.8, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
            className="w-44 h-44 sm:w-48 sm:h-48 rounded-full flex items-center justify-center mx-auto shadow-2xl mb-3 border-2 border-emerald-400/80 bg-white overflow-hidden shrink-0"
          >
            <img 
              src={agriconnectLogo} 
              alt="AgriConnect Logo" 
              className="w-full h-full object-cover scale-[1.03] rounded-full" 
              referrerPolicy="no-referrer"
            />
          </motion.div>
          
          <p className="text-sm font-bold tracking-tight text-emerald-100/90 mt-2 max-w-xs mx-auto leading-snug font-sans">
            {t.tagline}
          </p>
        </div>

        {/* Tab Selector */}
        <div className={`flex border-b transition-colors duration-350 ${
          theme === "dark" ? "border-slate-800" : "border-slate-200"
        }`} id="auth-screen-tabs">
          <button
            type="button"
            onClick={() => {
              setIsRegistering(false);
              setErrorMsg("");
              setOtpSent(false);
              setSimulatedOtp("");
            }}
            className={`flex-1 py-3.5 text-center text-xs font-black transition cursor-pointer select-none border-b-2 ${
              !isRegistering 
                ? theme === "dark"
                  ? "border-emerald-500 text-emerald-400 bg-emerald-950/20" 
                  : "border-emerald-600 text-emerald-800 bg-emerald-50/50"
                : theme === "dark"
                  ? "border-transparent text-slate-500 hover:text-slate-400"
                  : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {t.farmerLogIn}
          </button>
          <button
            type="button"
            onClick={() => {
              setIsRegistering(true);
              setErrorMsg("");
              setOtpSent(false);
              setSimulatedOtp("");
            }}
            className={`flex-1 py-3.5 text-center text-xs font-black transition cursor-pointer select-none border-b-2 ${
              isRegistering 
                ? theme === "dark"
                  ? "border-emerald-500 text-emerald-400 bg-emerald-950/20" 
                  : "border-emerald-600 text-emerald-800 bg-emerald-50/50"
                : theme === "dark"
                  ? "border-transparent text-slate-500 hover:text-slate-400"
                  : "border-transparent text-slate-400 hover:text-slate-600"
            }`}
          >
            {t.registerNewCard}
          </button>
        </div>

        <div className="p-6 sm:p-8">
          
          {errorMsg && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-5 p-3.5 bg-rose-950/40 border border-rose-900/50 rounded-xl flex items-start gap-2.5 text-rose-200 text-xs shadow-inner" 
              id="auth-error-banner"
            >
              <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
              <div>
                <strong className="font-bold">Credential Error:</strong>
                <p className="mt-0.5 text-rose-300 leading-relaxed">{errorMsg}</p>
              </div>
            </motion.div>
          )}

          <AnimatePresence mode="wait">
            {!isRegistering ? (
              <motion.div
                key="login-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
                className="space-y-5"
              >
                {/* Method pills inside log in */}
                {!otpSent && (
                  <div className={`grid grid-cols-2 gap-2 p-1 border rounded-xl transition-colors duration-300 ${
                    theme === "dark" ? "bg-slate-950 border-slate-800" : "bg-slate-100 border-slate-200"
                  }`} id="login-method-pills">
                    {[
                      { id: "aadhaar", label: t.aadhaarMethod, icon: Fingerprint },
                      { id: "phone", label: t.mobileMethod, icon: Phone }
                    ].map(tab => {
                      const isSelected = activeTab === tab.id;
                      const IconComp = tab.icon;
                      return (
                        <button
                          key={tab.id}
                          type="button"
                          onClick={() => {
                            setActiveTab(tab.id as any);
                            setErrorMsg("");
                          }}
                          className={`py-2 px-1.5 rounded-lg flex items-center justify-center gap-1 text-[11px] font-bold transition select-none cursor-pointer ${
                            isSelected 
                              ? theme === "dark"
                                ? "bg-slate-800 text-white shadow-md border border-slate-700" 
                                : "bg-white text-slate-800 shadow-sm border border-slate-250"
                              : theme === "dark"
                                ? "text-slate-500 hover:text-slate-300"
                                : "text-slate-500 hover:text-slate-700"
                          }`}
                        >
                          <IconComp className={`w-3.5 h-3.5 ${isSelected ? "text-emerald-500" : "text-slate-400"}`} />
                          <span>{tab.label}</span>
                        </button>
                      );
                    })}
                  </div>
                )}

                <form onSubmit={handleLoginSubmit} className="space-y-4">
                  {/* Dynamic inputs */}
                  {!otpSent ? (
                    <div className="space-y-4">
                      {activeTab === "aadhaar" && (
                        <div className="space-y-1">
                          <label htmlFor="login-aadhaar" className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest block">
                            {t.farmerAadhaarLabel}
                          </label>
                          <div className="relative">
                            <input
                              type="text"
                              id="login-aadhaar"
                              maxLength={14}
                              value={aadhaarInput}
                              onChange={handleAadhaarChange}
                              onFocus={() => setFocusedField("aadhaar")}
                              onBlur={() => setFocusedField(null)}
                              placeholder="5432 9876 1234"
                              className={`w-full border rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold font-mono tracking-widest transition-all duration-300 focus:outline-none ${
                                theme === "dark" 
                                  ? "bg-slate-950/50 text-white placeholder-slate-600" 
                                  : "bg-stone-50/50 text-slate-800 placeholder-slate-400"
                              } ${
                                focusedField === "aadhaar"
                                  ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/20"
                                  : theme === "dark" ? "border-slate-800 hover:border-slate-700" : "border-slate-300 hover:border-slate-400"
                              }`}
                              required
                            />
                            <Fingerprint className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                              focusedField === "aadhaar" ? "text-emerald-500" : "text-slate-400"
                            }`} />
                          </div>
                        </div>
                      )}

                      {activeTab === "phone" && (
                        <div className="space-y-1">
                          <label className="text-[10px] font-bold text-slate-400 font-mono uppercase tracking-widest block">
                            {t.regMobileLabel}
                          </label>
                          <div className="flex items-center gap-2">
                            <div className={`px-3 py-3.5 border rounded-2xl font-mono font-black text-xs flex items-center gap-1.5 shrink-0 transition-colors duration-300 ${
                              theme === "dark" 
                                ? "bg-slate-950/80 border-slate-800 text-emerald-400" 
                                : "bg-stone-100 border-slate-300 text-emerald-700"
                            }`}>
                              <span className="text-base leading-none">🇮🇳</span>
                              <span>+91</span>
                            </div>
                            <div className="relative flex-1">
                              <input
                                type="tel"
                                id="login-phone"
                                value={phoneInput}
                                onChange={(e) => setPhoneInput(e.target.value.replace(/\D/g, "").slice(0, 10))}
                                onFocus={() => setFocusedField("phone")}
                                onBlur={() => setFocusedField(null)}
                                maxLength={10}
                                placeholder="98765 43210"
                                className={`w-full border rounded-2xl pl-10 pr-4 py-3.5 text-sm font-bold font-mono tracking-wider transition-all duration-300 focus:outline-none ${
                                  theme === "dark" 
                                    ? "bg-slate-950/50 text-white placeholder-slate-600" 
                                    : "bg-stone-50/50 text-slate-800 placeholder-slate-400"
                                } ${
                                  focusedField === "phone"
                                    ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/20"
                                    : theme === "dark" ? "border-slate-800 hover:border-slate-700" : "border-slate-300 hover:border-slate-400"
                                }`}
                                required
                              />
                              <Phone className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                                focusedField === "phone" ? "text-emerald-500" : "text-slate-400"
                              }`} />
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      className={`space-y-3 p-4 border rounded-2xl ${
                        theme === "dark" ? "bg-emerald-950/20 border-emerald-900/30" : "bg-emerald-50/60 border-emerald-200"
                      }`}
                    >
                      <div className="flex gap-2 text-emerald-600 text-[11px] leading-relaxed dark:text-emerald-400">
                        <Lock className="w-4 h-4 shrink-0 mt-0.5" />
                        <div>
                          <strong className="font-bold">{t.otpSentBanner}</strong>
                          <p className={theme === "dark" ? "text-slate-300 mt-0.5" : "text-slate-600 mt-0.5"}>
                            {t.enterOtpInstruction}
                          </p>
                        </div>
                      </div>

                      {simulatedOtp && (
                        <motion.div 
                          initial={{ opacity: 0, scale: 0.95 }}
                          animate={{ opacity: 1, scale: 1 }}
                          className={`p-3 border rounded-xl text-xs flex flex-col gap-1 ${
                            theme === "dark" ? "bg-amber-950/30 border-amber-900/40 text-amber-200" : "bg-amber-50 border-amber-200 text-amber-800"
                          }`}
                        >
                          <div className="flex items-center gap-1.5 font-bold text-amber-500">
                            <Info className="w-3.5 h-3.5" />
                            <span>{t.sandboxKey}</span>
                          </div>
                          <p className="text-[11px]">
                            Enter: <strong className={`font-mono px-2 py-0.5 rounded font-black tracking-widest select-all ${theme === "dark" ? "text-white bg-amber-950" : "text-amber-950 bg-amber-100"}`}>{simulatedOtp}</strong> (or use demo bypass code <strong className="font-bold">123456</strong>).
                          </p>
                        </motion.div>
                      )}
                      
                      <div className="relative mt-2">
                        <input
                          type={showPassword ? "text" : "password"}
                          id="login-otp"
                          maxLength={6}
                          value={otpValue}
                          onChange={(e) => setOtpValue(e.target.value.replace(/\D/g, ""))}
                          onFocus={() => setFocusedField("otp")}
                          onBlur={() => setFocusedField(null)}
                          className={`w-full border rounded-2xl pl-10 pr-12 py-3.5 text-center text-sm font-extrabold font-mono tracking-[0.7em] transition-all duration-300 focus:outline-none ${
                            theme === "dark" ? "bg-slate-950/60 text-white" : "bg-stone-50 text-slate-800"
                          } ${
                            focusedField === "otp"
                              ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/20"
                              : theme === "dark" ? "border-slate-800" : "border-slate-300"
                          }`}
                          required
                        />
                        <label
                          htmlFor="login-otp"
                          className={`absolute left-10 pointer-events-none transition-all duration-300 font-mono text-[10px] font-bold tracking-widest uppercase ${
                            focusedField === "otp" || otpValue.length > 0
                              ? `-translate-y-2.5 top-2.5 text-[8px] text-emerald-500 font-semibold px-1.5 ${theme === "dark" ? "bg-slate-900" : "bg-white"}`
                              : "top-1/2 -translate-y-1/2 text-slate-400"
                          }`}
                        >
                          {t.verificationPinLabel}
                        </label>
                        <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                          focusedField === "otp" ? "text-emerald-500" : "text-slate-400"
                        }`} />

                        {/* Interactive Eye icon with pupil eye-tracking mock effect */}
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className={`absolute right-3.5 top-1/2 -translate-y-1/2 p-1 rounded-lg text-slate-400 hover:text-emerald-500 transition-colors ${
                            theme === "dark" ? "hover:bg-slate-800" : "hover:bg-slate-100"
                          }`}
                        >
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-5 h-5">
                            {showPassword ? (
                              <>
                                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <motion.circle 
                                  cx="12" 
                                  cy="12" 
                                  r="3" 
                                  strokeWidth="2"
                                  animate={{ 
                                    x: otpValue.length > 0 ? (otpValue.length % 3 - 1) * 2 : 0,
                                    y: otpValue.length > 0 ? -0.5 : 0
                                  }} 
                                  transition={{ type: "spring", stiffness: 150 }}
                                />
                              </>
                            ) : (
                              <>
                                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                                <line x1="1" y1="1" x2="23" y2="23" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                              </>
                            )}
                          </svg>
                        </button>
                      </div>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer select-none"
                  >
                    {isLoading ? (
                      <span className="animate-pulse">{t.accessingGateway}</span>
                    ) : (
                      <>
                        <span>{otpSent ? t.verifyAndLogIn : t.requestAuthGateway}</span>
                        <ArrowRight className="w-4 h-4 text-slate-950 animate-bounce" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            ) : (
              <motion.div
                key="register-view"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                <form onSubmit={handleRegisterSubmit} className="space-y-3">
                  {/* Farmer Full Name */}
                  <div className="space-y-1">
                    <label htmlFor="reg-name" className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                      {t.farmerFullName}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id="reg-name"
                        value={regName}
                        onChange={(e) => setRegName(e.target.value)}
                        onFocus={() => setFocusedField("regName")}
                        onBlur={() => setFocusedField(null)}
                        placeholder="e.g. Ramesh Kumar"
                        className={`w-full border rounded-2xl pl-10 pr-4 py-3 text-xs font-bold transition-all duration-300 focus:outline-none ${
                          theme === "dark" 
                            ? "bg-slate-950/50 text-white placeholder-slate-600" 
                            : "bg-stone-50/50 text-slate-800 placeholder-slate-400"
                        } ${
                          focusedField === "regName"
                            ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/20"
                            : theme === "dark" ? "border-slate-800 hover:border-slate-700" : "border-slate-300 hover:border-slate-400"
                        }`}
                        required
                      />
                      <UserCheck className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors duration-300 ${
                        focusedField === "regName" ? "text-emerald-500" : "text-slate-400"
                      }`} />
                    </div>
                  </div>

                  {/* Mobile Phone (India) */}
                  <div className="space-y-1">
                    <label htmlFor="reg-phone" className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                      {t.mobilePhoneIndia}
                    </label>
                    <div className="flex items-center gap-1.5">
                      <div className={`px-2.5 py-3 border rounded-2xl font-mono font-black text-xs flex items-center gap-1 shrink-0 ${
                        theme === "dark" 
                          ? "bg-slate-950/80 border-slate-800 text-emerald-400" 
                          : "bg-stone-100 border-slate-300 text-emerald-700"
                      }`}>
                        <span className="text-xs">🇮🇳</span>
                        <span>+91</span>
                      </div>
                      <div className="relative flex-1">
                        <input
                          type="tel"
                          id="reg-phone"
                          value={regPhone}
                          onChange={(e) => setRegPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                          onFocus={() => setFocusedField("regPhone")}
                          onBlur={() => setFocusedField(null)}
                          maxLength={10}
                          placeholder="9876543210"
                          className={`w-full border rounded-2xl pl-8 pr-2 py-3 text-xs font-bold font-mono tracking-wider transition-all duration-300 focus:outline-none ${
                            theme === "dark" 
                              ? "bg-slate-950/50 text-white placeholder-slate-600" 
                              : "bg-stone-50/50 text-slate-800 placeholder-slate-400"
                          } ${
                            focusedField === "regPhone"
                              ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/20"
                              : theme === "dark" ? "border-slate-800 hover:border-slate-700" : "border-slate-300 hover:border-slate-400"
                          }`}
                          required
                        />
                        <Phone className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors duration-300 ${
                          focusedField === "regPhone" ? "text-emerald-500" : "text-slate-400"
                        }`} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-12 gap-2.5">
                    {/* Aadhaar Number */}
                    <div className="col-span-7 space-y-1">
                      <label htmlFor="reg-aadhaar" className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono">
                        {t.aadhaarNumber} (12 Digits)
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          id="reg-aadhaar"
                          maxLength={14}
                          value={regAadhaar}
                          onChange={handleRegAadhaarChange}
                          onFocus={() => setFocusedField("regAadhaar")}
                          onBlur={() => setFocusedField(null)}
                          placeholder="5432 9876 1234"
                          className={`w-full border rounded-2xl pl-9 pr-2 py-3 text-xs font-bold font-mono tracking-wider transition-all duration-300 focus:outline-none ${
                            theme === "dark" 
                              ? "bg-slate-950/50 text-white placeholder-slate-600" 
                              : "bg-stone-50/50 text-slate-800 placeholder-slate-400"
                          } ${
                            focusedField === "regAadhaar"
                              ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/20"
                              : theme === "dark" ? "border-slate-800 hover:border-slate-700" : "border-slate-300 hover:border-slate-400"
                          }`}
                          required
                        />
                        <Fingerprint className={`absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors duration-300 ${
                          focusedField === "regAadhaar" ? "text-emerald-500" : "text-slate-400"
                        }`} />
                      </div>
                    </div>

                    {/* Land Holding with 40 Guntas = 1 Acre conversion */}
                    <div className="col-span-5 space-y-1">
                      <div className="flex items-center justify-between">
                        <label htmlFor="reg-land" className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block font-mono truncate">
                          {regLandUnit === 'acres' ? t.landAcres : (language === 'te' ? 'భూమి (గుంటలు)' : 'Land (Guntas)')}
                        </label>
                        <button
                          type="button"
                          onClick={() => {
                            if (regLandUnit === 'acres') {
                              setRegLandUnit('guntas');
                              setRegLandSize(String(Math.round((parseFloat(regLandSize) || 2) * 40)));
                            } else {
                              setRegLandUnit('acres');
                              setRegLandSize(String(((parseFloat(regLandSize) || 80) / 40).toFixed(1)));
                            }
                          }}
                          className={`text-[8px] font-bold font-mono px-1.5 py-0.5 rounded border transition cursor-pointer shrink-0 ${
                            theme === 'dark' ? 'bg-slate-800 border-slate-700 text-emerald-400' : 'bg-emerald-100 border-emerald-300 text-emerald-800'
                          }`}
                        >
                          {regLandUnit === 'acres' ? 'GUNTAS' : 'ACRES'}
                        </button>
                      </div>
                      <div className="relative">
                        <input
                          type="number"
                          step="0.1"
                          min="0.1"
                          id="reg-land"
                          value={regLandSize}
                          onChange={(e) => setRegLandSize(e.target.value)}
                          onFocus={() => setFocusedField("regLand")}
                          onBlur={() => setFocusedField(null)}
                          placeholder="2.0"
                          className={`w-full border rounded-2xl pl-8 pr-2 py-3 text-xs font-bold font-mono transition-all duration-300 focus:outline-none ${
                            theme === "dark" 
                              ? "bg-slate-950/50 text-white placeholder-slate-600" 
                              : "bg-stone-50/50 text-slate-800 placeholder-slate-400"
                          } ${
                            focusedField === "regLand"
                              ? "border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.25)] ring-2 ring-emerald-500/20"
                              : theme === "dark" ? "border-slate-800 hover:border-slate-700" : "border-slate-300 hover:border-slate-400"
                          }`}
                          required
                        />
                        <Sprout className={`absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 transition-colors duration-300 ${
                          focusedField === "regLand" ? "text-emerald-500" : "text-slate-400"
                        }`} />
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">
                        {t.stateRegistry}
                      </label>
                      <select
                        value={regState}
                        onChange={(e) => setRegState(e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors duration-300 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-stone-50 border-slate-300 text-slate-800"
                        }`}
                      >
                        {INDIAN_STATES.map(s => (
                          <option key={s.id} value={s.id} className={theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-800"}>{s.id}</option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest block font-mono">
                        {t.districtArea}
                      </label>
                      <select
                        value={regDistrict}
                        onChange={(e) => setRegDistrict(e.target.value)}
                        className={`w-full border rounded-xl px-3 py-2 text-xs font-bold focus:ring-1 focus:ring-emerald-500 focus:outline-none transition-colors duration-300 ${
                          theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-stone-50 border-slate-300 text-slate-800"
                        }`}
                      >
                        {INDIAN_STATES.find(s => s.id === regState)?.districts.map(d => (
                          <option key={d} value={d} className={theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-800"}>{d}</option>
                        )) || <option value="" className={theme === "dark" ? "bg-slate-900 text-white" : "bg-white text-slate-800"}>Select District</option>}
                      </select>
                    </div>
                  </div>

                  {regOtpSent && (
                    <motion.div
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      className="space-y-2 border-t pt-3 mt-3 border-slate-200 dark:border-slate-800/40"
                    >
                      <div className={`border rounded-xl p-2.5 flex items-start gap-2 ${
                        theme === "dark" ? "bg-emerald-950/40 border-emerald-800/20" : "bg-emerald-50 border-emerald-200"
                      }`}>
                        <Shield className="w-4 h-4 text-emerald-500 shrink-0 mt-0.5 animate-pulse" />
                        <div>
                          <p className="text-[10px] font-black text-emerald-600 dark:text-emerald-200 leading-tight">{t.mobileVerificationRequired}</p>
                          <p className="text-[9px] text-slate-550 dark:text-slate-400 leading-tight mt-0.5 font-mono">Please check the generated fake OTP toast message above and enter the code below.</p>
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-[9px] font-bold text-slate-500 uppercase tracking-wider block font-mono">
                          {t.verificationPinLabel}
                        </label>
                        <input
                          type="text"
                          maxLength={6}
                          value={regOtpValue}
                          onChange={(e) => setRegOtpValue(e.target.value.replace(/\D/g, ""))}
                          placeholder="123456"
                          className={`w-full border rounded-xl px-3 py-2.5 text-center text-sm font-extrabold font-mono tracking-[0.5em] focus:ring-2 focus:ring-emerald-500 focus:outline-none ${
                            theme === "dark" ? "bg-slate-950 border-slate-800 text-white" : "bg-stone-50 border-slate-300 text-slate-800"
                          }`}
                          required
                        />
                      </div>
                    </motion.div>
                  )}

                  <button
                    type="submit"
                    disabled={isLoading}
                    className="w-full bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black py-3 px-4 rounded-xl text-xs uppercase tracking-wider transition-all duration-300 flex items-center justify-center gap-2 shadow-lg cursor-pointer select-none"
                  >
                    {isLoading ? (
                      <span className="animate-pulse">Processing...</span>
                    ) : (
                      <>
                        <span>{regOtpSent ? t.verifyAndCompleteReg : t.requestRegOtp}</span>
                        <ArrowRight className="w-4 h-4 text-slate-950" />
                      </>
                    )}
                  </button>
                </form>
              </motion.div>
            )}
          </AnimatePresence>

        </div>
      </div>

      <div className="w-full max-w-md text-center mt-4">
        <p className="text-[10px] text-slate-500/90 leading-relaxed font-mono">
          AgriConnect Portal v2.4 (Active Sandbox)
        </p>
      </div>

      </div> {/* Close login-right-pane */}
    </div>
  );
}
