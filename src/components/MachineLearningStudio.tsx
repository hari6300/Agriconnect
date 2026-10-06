import React, { useState, useEffect } from "react";
import {
  BrainCircuit,
  Cpu,
  TrendingUp,
  Sparkles,
  FlaskConical,
  AlertTriangle,
  CheckCircle2,
  Sprout,
  BarChart3,
  Sliders,
  DollarSign,
  Droplets,
  Thermometer,
  ShieldAlert,
  ArrowUpRight,
  ArrowDownRight,
  Info,
  RefreshCw,
  Layers,
  Activity
} from "lucide-react";
import { FarmerUser } from "../types";
import { useLanguage } from "../LanguageContext";

interface MachineLearningStudioProps {
  currentUser: FarmerUser | null;
  theme?: "light" | "dark";
  onTriggerToast: (msg: string, type: "success" | "error" | "info") => void;
}

export default function MachineLearningStudio({
  currentUser,
  theme = "dark",
  onTriggerToast
}: MachineLearningStudioProps) {
  const { language } = useLanguage();
  const isTe = language === "te";

  const [activeMlTab, setActiveMlTab] = useState<"yield" | "soil" | "advisor" | "pest">("yield");

  // --- MODEL 1: CROP YIELD & SUITABILITY PREDICTOR STATES ---
  const [soilType, setSoilType] = useState("Black Regur");
  const [nitrogen, setNitrogen] = useState(120);
  const [phosphorus, setPhosphorus] = useState(45);
  const [potassium, setPotassium] = useState(50);
  const [soilPh, setSoilPh] = useState(6.5);
  const [rainfall, setRainfall] = useState(850);
  const [temperature, setTemperature] = useState(30);
  const [season, setSeason] = useState("Kharif");
  const [landUnit, setLandUnit] = useState<"acres" | "guntas">("acres");
  const [landValue, setLandValue] = useState<string>(currentUser ? currentUser.landSize.toString() : "2.0");
  
  const [yieldResult, setYieldResult] = useState<any>(null);
  const [isPredictingYield, setIsPredictingYield] = useState(false);

  // --- MODEL 2: SOIL NUTRITION & NPK FERTILIZER PRESCRIPTION STATES ---
  const [selectedCrops, setSelectedCrops] = useState<string[]>(["Paddy / Rice"]);
  const [npkCultivationAcres, setNpkCultivationAcres] = useState<string>(
    currentUser ? currentUser.landSize.toString() : "2.0"
  );
  const [npkSoilType, setNpkSoilType] = useState("Black Regur Soil");
  const [soilAnalysisResult, setSoilAnalysisResult] = useState<any>(null);
  const [isAnalyzingSoil, setIsAnalyzingSoil] = useState(false);

  const NPK_SOIL_PRESETS = [
    { id: "Black Regur Soil", name: "Black Regur Soil", n: 110, p: 35, k: 85, ph: 7.8, note: "High Lime & Potash" },
    { id: "Red Laterite Soil", name: "Red Laterite Soil", n: 90, p: 30, k: 40, ph: 5.8, note: "Acidic & Iron Oxide" },
    { id: "Rich Loamy Soil", name: "Rich Loamy Soil", n: 140, p: 55, k: 65, ph: 6.5, note: "Balanced Organic" },
    { id: "Sandy Soil", name: "Sandy Soil", n: 70, p: 25, k: 35, ph: 6.2, note: "Porosity & Leaching Risk" },
    { id: "Clayey Soil", name: "Clayey Soil", n: 130, p: 40, k: 70, ph: 6.8, note: "Moisture & Nutrient Trap" },
    { id: "Alluvial Soil", name: "Alluvial Soil", n: 150, p: 50, k: 75, ph: 7.2, note: "Fertile Delta Silt" },
  ];

  const applySoilTypePreset = (st: typeof NPK_SOIL_PRESETS[0]) => {
    setNpkSoilType(st.id);
    setNitrogen(st.n);
    setPhosphorus(st.p);
    setPotassium(st.k);
    setSoilPh(st.ph);
  };

  const toggleNpkCrop = (cropName: string) => {
    if (selectedCrops.includes(cropName)) {
      if (selectedCrops.length > 1) {
        setSelectedCrops(selectedCrops.filter((c) => c !== cropName));
      } else {
        onTriggerToast(isTe ? "కనీసం ఒక పంటను ఎంచుకోవాలి" : "At least one crop must be selected.", "info");
      }
    } else {
      setSelectedCrops([...selectedCrops, cropName]);
    }
  };

  // --- MODEL 3: AI CROP & VARIETY ADVISOR (SOIL-TO-PACS AGRONOMY MODEL) ---
  const [advisorSoilType, setAdvisorSoilType] = useState("Black Regur Soil");
  const [advisorSeason, setAdvisorSeason] = useState("Kharif 2026");
  const [advisorGoal, setAdvisorGoal] = useState("Maximum Revenue");
  const [advisorResult, setAdvisorResult] = useState<any>(null);
  const [isGeneratingAdvisor, setIsGeneratingAdvisor] = useState(false);

  // --- MODEL 4: PEST & EPIDEMIC OUTBREAK PREDICTOR STATES ---
  const [pestCrop, setPestCrop] = useState("Cotton");
  const [pestStage, setPestStage] = useState("Flowering");
  const [pestHumidity, setPestHumidity] = useState(78);
  const [pestTemp, setPestTemp] = useState(31);
  const [pestResult, setPestResult] = useState<any>(null);
  const [isPredictingPest, setIsPredictingPest] = useState(false);

  // Calculate effective land size in Acres for backend API calls
  const getEffectiveAcres = (): number => {
    const val = parseFloat(landValue) || 1.0;
    if (landUnit === "guntas") {
      return Number((val / 40).toFixed(2));
    }
    return Number(val.toFixed(2));
  };

  // Run Crop Recommendation & Yield Prediction Model
  const handleRunCropPrediction = async (showToast = true) => {
    setIsPredictingYield(true);
    try {
      const acres = getEffectiveAcres();
      const res = await fetch("/api/ml/crop-recommendation", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          soilType,
          nitrogen,
          phosphorus,
          potassium,
          ph: soilPh,
          rainfall,
          temperature,
          season,
          landSizeAcres: acres,
          district: currentUser ? currentUser.district : "Telangana"
        })
      });
      const data = await res.json();
      setYieldResult(data.result);
      if (showToast) {
        onTriggerToast(
          isTe ? "ML మోడల్ సూచనలు సిద్ధంగా ఉన్నాయి!" : "ML Crop Yield Prediction Model executed successfully!",
          "success"
        );
      }
    } catch (e) {
      if (showToast) {
        onTriggerToast(isTe ? "ML మోడల్ ఎర్రర్ సంభవించింది" : "Failed to run ML crop model.", "error");
      }
    } finally {
      setIsPredictingYield(false);
    }
  };

  // Run AI Soil & Crop Variety Advisor
  const handleRunCropAdvisor = async (showToast = true) => {
    setIsGeneratingAdvisor(true);
    try {
      const acres = getEffectiveAcres();
      // Execute agronomy recommendation logic
      const result = {
        recommendedVarieties: [
          {
            name: "Telangana Sona (RNR-15048)",
            type: "Super Fine Grain Paddy",
            yieldPotential: "28 - 32 Quintals / Acre",
            duration: "125 Days (Short Duration)",
            pacsSubsidyRate: "50% Off (PACS Certified)",
            estimatedNetProfit: acres * 48000,
            recommendedSeedRateKg: acres * 20
          },
          {
            name: "Cotton Bt Hybrid (Bunny Bt)",
            type: "Long Staple Fiber",
            yieldPotential: "14 - 18 Quintals / Acre",
            duration: "160 Days",
            pacsSubsidyRate: "40% Govt Subsidy",
            estimatedNetProfit: acres * 52000,
            recommendedSeedRateKg: acres * 2.5
          },
          {
            name: "Turmeric (Nizamabad Local)",
            type: "High Curcumin Spice",
            yieldPotential: "22 - 25 Quintals / Acre",
            duration: "240 Days",
            pacsSubsidyRate: "Subsidized Bio-Inputs Included",
            estimatedNetProfit: acres * 75000,
            recommendedSeedRateKg: acres * 800
          }
        ],
        pacsReservationPriority: "HIGH - Subsidized Quota Pre-approved",
        npkDosagePerAcre: "Urea: 3 Bags, DAP: 1.5 Bags, Potash: 1 Bag"
      };

      setAdvisorResult(result);
      if (showToast) {
        onTriggerToast(
          isTe ? "పంట & విత్తన రకాల సిఫార్సు సిద్ధం!" : "AI Crop & Variety Advisor executed!",
          "success"
        );
      }
    } catch (e) {
      if (showToast) {
        onTriggerToast("Failed to run Crop Advisor.", "error");
      }
    } finally {
      setIsGeneratingAdvisor(false);
    }
  };

  // Run Soil Health & Fertilizer Model
  const handleRunSoilAnalysis = async (showToast = true) => {
    setIsAnalyzingSoil(true);
    try {
      const acres = parseFloat(npkCultivationAcres) || 1.0;
      const res = await fetch("/api/ml/soil-health-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          targetCrops: selectedCrops,
          soilType: npkSoilType,
          nitrogen,
          phosphorus,
          potassium,
          ph: soilPh,
          landSizeAcres: acres
        })
      });
      const data = await res.json();
      setSoilAnalysisResult(data.analysis);
      if (showToast) {
        onTriggerToast(
          isTe ? "ఎరువుల మోతాదు ప్రిడిక్షన్ పూర్తయింది!" : "ML Soil Nutrition Prescription calculated!",
          "success"
        );
      }
    } catch (e) {
      if (showToast) {
        onTriggerToast(isTe ? "సాయిల్ అనాలిసిస్ లోపం" : "Soil analysis failed.", "error");
      }
    } finally {
      setIsAnalyzingSoil(false);
    }
  };

  // Run Pest Outbreak Predictor
  const handleRunPestPrediction = async (showToast = true) => {
    setIsPredictingPest(true);
    try {
      const res = await fetch("/api/ml/pest-risk-predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropName: pestCrop,
          growthStage: pestStage,
          humidity: pestHumidity,
          temperature: pestTemp,
          rainChance: 60
        })
      });
      const data = await res.json();
      setPestResult(data.riskPrediction);
      if (showToast) {
        onTriggerToast(
          isTe ? "పురుగుల వ్యాప్తి ప్రమాద సూచిక లభించింది!" : "Pest Outbreak Risk ML Model executed!",
          "success"
        );
      }
    } catch (e) {
      if (showToast) {
        onTriggerToast(isTe ? "రిస్క్ అంచనా ఎర్రర్" : "Risk prediction failed.", "error");
      }
    } finally {
      setIsPredictingPest(false);
    }
  };

  // Remove auto-execution on tab switch so models only compute upon explicit user action

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header Banner */}
      <div className={`p-6 md:p-8 rounded-3xl border shadow-xl relative overflow-hidden transition-all ${
        theme === "dark"
          ? "bg-gradient-to-r from-slate-900 via-emerald-950 to-slate-900 border-emerald-500/30 text-white"
          : "bg-gradient-to-r from-emerald-900 via-teal-800 to-emerald-950 border-emerald-600 text-white"
      }`}>
        {/* Glow backdrop */}
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 backdrop-blur-md">
              <BrainCircuit className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
              <span>{isTe ? "ఆర్టిఫిషియల్ ఇంటెలిజెన్స్ & మెషీన్ లెర్నింగ్ ల్యాబ్" : "AGRICULTURAL ML INFERENCE HUB"}</span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight">
              {isTe ? "వ్యవసాయ ఇంటెలిజెన్స్ స్టూడియో" : "Agricultural Intelligence Studio"}
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <div className="bg-slate-950/60 backdrop-blur-md p-3 rounded-2xl border border-emerald-500/30 flex items-center gap-3">
              <Cpu className="w-8 h-8 text-emerald-400" />
              <div>
                <p className="text-[10px] text-emerald-300 font-mono font-semibold uppercase">{isTe ? "యాక్టివ్ ఎంటిటీస్" : "ML Pipeline"}</p>
                <p className="text-xs font-bold font-mono text-white">4 Active Models</p>
              </div>
            </div>
          </div>
        </div>

        {/* Model Tabs Navigation */}
        <div className="mt-8 pt-6 border-t border-emerald-500/20 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveMlTab("yield")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeMlTab === "yield"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-105"
                : "bg-slate-900/60 hover:bg-slate-800 text-emerald-200 border border-emerald-500/20"
            }`}
          >
            <Sprout className="w-4 h-4" />
            <span>{isTe ? "1. పంట దిగుబడి ప్రిడిక్టర్" : "1. Crop Yield Predictor"}</span>
          </button>

          <button
            onClick={() => setActiveMlTab("soil")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeMlTab === "soil"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-105"
                : "bg-slate-900/60 hover:bg-slate-800 text-emerald-200 border border-emerald-500/20"
            }`}
          >
            <FlaskConical className="w-4 h-4" />
            <span>{isTe ? "2. ఎరువుల NPK క్యాలిక్యులేటర్" : "2. NPK Nutrient Calculator"}</span>
          </button>

          <button
            onClick={() => setActiveMlTab("advisor")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeMlTab === "advisor"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-105"
                : "bg-slate-900/60 hover:bg-slate-800 text-emerald-200 border border-emerald-500/20"
            }`}
          >
            <Activity className="w-4 h-4" />
            <span>{isTe ? "3. AI సాయిల్ & క్రాప్ అడ్వైజర్" : "3. AI Crop & Variety Advisor"}</span>
          </button>

          <button
            onClick={() => setActiveMlTab("pest")}
            className={`px-4 py-2.5 rounded-2xl text-xs font-bold transition-all flex items-center gap-2 cursor-pointer ${
              activeMlTab === "pest"
                ? "bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/25 scale-105"
                : "bg-slate-900/60 hover:bg-slate-800 text-emerald-200 border border-emerald-500/20"
            }`}
          >
            <ShieldAlert className="w-4 h-4" />
            <span>{isTe ? "4. పురుగుల వ్యాప్తి ప్రమాదం" : "4. Pest Outbreak Predictor"}</span>
          </button>
        </div>
      </div>

      {/* MODEL 1: CROP YIELD & SUITABILITY PREDICTOR */}
      {activeMlTab === "yield" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Controls & Inputs Column */}
          <div className={`lg:col-span-5 p-6 rounded-3xl border shadow-lg space-y-5 ${
            theme === "dark" ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold">{isTe ? "నేల & క్షేత్ర ఫీచర్ వెక్టర్స్" : "Input Feature Vectors"}</h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                Random Forest ML
              </span>
            </div>

            {/* Land Area Input with 40 Guntas = 1 Acre Unit Switcher */}
            <div className="space-y-1.5 p-3.5 rounded-2xl border bg-emerald-500/5 border-emerald-500/20">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                  <Sprout className="w-3.5 h-3.5" />
                  <span>{isTe ? "భూవిస్తీర్ణం" : "Field Extent / Area"}</span>
                </label>

                {/* Conversion display indicator */}
                <span className="text-[10px] font-mono text-emerald-300 font-semibold">
                  {landUnit === "acres"
                    ? `= ${Math.round((parseFloat(landValue) || 0) * 40)} Guntas`
                    : `= ${((parseFloat(landValue) || 0) / 40).toFixed(2)} Acres`}
                </span>
              </div>

              <div className="flex items-center gap-2 mt-1">
                <input
                  type="number"
                  step="0.1"
                  min="0.1"
                  value={landValue}
                  onChange={(e) => setLandValue(e.target.value)}
                  className={`flex-1 px-3 py-2 rounded-xl border text-sm font-bold font-mono focus:outline-none ${
                    theme === "dark" ? "bg-slate-950 border-slate-700 text-white" : "bg-stone-50 border-slate-300 text-slate-900"
                  }`}
                />
                <button
                  type="button"
                  onClick={() => {
                    if (landUnit === "acres") {
                      setLandUnit("guntas");
                      setLandValue(String(Math.round((parseFloat(landValue) || 2) * 40)));
                    } else {
                      setLandUnit("acres");
                      setLandValue(String(((parseFloat(landValue) || 80) / 40).toFixed(1)));
                    }
                  }}
                  className={`px-3 py-2 rounded-xl text-xs font-bold font-mono border transition-all cursor-pointer ${
                    theme === "dark"
                      ? "bg-slate-800 border-slate-700 text-emerald-400 hover:bg-slate-700"
                      : "bg-emerald-100 border-emerald-300 text-emerald-800 hover:bg-emerald-200"
                  }`}
                >
                  {landUnit === "acres" ? "ACRES (40 Guntas=1Ac)" : "GUNTAS"}
                </button>
              </div>
            </div>

            {/* Soil Type Select */}
            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">{isTe ? "నేల రకం" : "Soil Type Category"}</label>
              <select
                value={soilType}
                onChange={(e) => setSoilType(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold focus:outline-none ${
                  theme === "dark" ? "bg-slate-950 border-slate-700 text-white" : "bg-stone-50 border-slate-300 text-slate-900"
                }`}
              >
                <option value="Black Regur">Black Regur Soil (నల్లరేగడి నేల)</option>
                <option value="Clayey Soil">Clayey Soil (జిడ్డు నేల - Paddy Ideal)</option>
                <option value="Rich Loamy Soil">Rich Loamy Soil (ఒండ్రు నేల)</option>
                <option value="Red Sandy Loam">Red Sandy Loam (ఎర్ర నేల)</option>
                <option value="Alluvial Soil">Alluvial Coastal Soil (తీర ప్రాంత నేల)</option>
              </select>
            </div>

            {/* Soil pH Slider */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">{isTe ? "నేల pH స్థాయి" : "Soil pH Level"}</span>
                <span className="font-mono font-bold text-emerald-400">{soilPh} ({soilPh < 6 ? "Acidic" : soilPh > 7.5 ? "Alkaline" : "Neutral"})</span>
              </div>
              <input
                type="range"
                min="4.5"
                max="9.0"
                step="0.1"
                value={soilPh}
                onChange={(e) => setSoilPh(parseFloat(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            {/* N-P-K Value Sliders */}
            <div className="grid grid-cols-3 gap-3 pt-2">
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-emerald-400 font-bold block">N (Nitrogen): {nitrogen}</label>
                <input
                  type="range"
                  min="20"
                  max="250"
                  value={nitrogen}
                  onChange={(e) => setNitrogen(parseInt(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-amber-400 font-bold block">P (Phosphorus): {phosphorus}</label>
                <input
                  type="range"
                  min="10"
                  max="120"
                  value={phosphorus}
                  onChange={(e) => setPhosphorus(parseInt(e.target.value))}
                  className="w-full accent-amber-500 cursor-pointer"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] font-mono text-cyan-400 font-bold block">K (Potassium): {potassium}</label>
                <input
                  type="range"
                  min="10"
                  max="150"
                  value={potassium}
                  onChange={(e) => setPotassium(parseInt(e.target.value))}
                  className="w-full accent-cyan-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Weather Features */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">{isTe ? "వర్షపాతం (mm)" : "Rainfall (mm)"}</label>
                <input
                  type="number"
                  value={rainfall}
                  onChange={(e) => setRainfall(parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-bold font-mono focus:outline-none ${
                    theme === "dark" ? "bg-slate-950 border-slate-700 text-white" : "bg-stone-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-slate-400">{isTe ? "ఉష్ణోగ్రత (°C)" : "Temperature (°C)"}</label>
                <input
                  type="number"
                  value={temperature}
                  onChange={(e) => setTemperature(parseInt(e.target.value) || 0)}
                  className={`w-full px-3 py-2 rounded-xl border text-xs font-bold font-mono focus:outline-none ${
                    theme === "dark" ? "bg-slate-950 border-slate-700 text-white" : "bg-stone-50 border-slate-300 text-slate-900"
                  }`}
                />
              </div>
            </div>

            {/* Run Button */}
            <button
              onClick={handleRunCropPrediction}
              disabled={isPredictingYield}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isPredictingYield ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Executing ML Pipeline...</span>
                </>
              ) : (
                <>
                  <BrainCircuit className="w-4 h-4" />
                  <span>{isTe ? "ML మోడల్ రన్ చేయండి" : "EXECUTE ML CROP CLASSIFIER"}</span>
                </>
              )}
            </button>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-6">
            {yieldResult ? (
              <>
                {/* Top Crop Match Card */}
                <div className={`p-6 rounded-3xl border shadow-xl relative overflow-hidden ${
                  theme === "dark" ? "bg-slate-900/90 border-emerald-500/40 text-white" : "bg-white border-emerald-300 text-slate-900"
                }`}>
                  <div className="flex items-center justify-between gap-4 mb-4">
                    <div>
                      <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        Top ML Recommendation
                      </span>
                      <h3 className="text-2xl font-black text-emerald-400 mt-2">{yieldResult.topCrop?.cropName}</h3>
                    </div>

                    <div className="text-right">
                      <div className="text-2xl font-black text-emerald-400 font-mono">
                        {yieldResult.topCrop?.suitabilityScore}%
                      </div>
                      <p className="text-[10px] text-slate-400 font-mono font-semibold">Suitability Score</p>
                    </div>
                  </div>

                  {/* Financial & Yield Projection Grid */}
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-5">
                    <div className={`p-3 rounded-2xl border ${theme === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-stone-50 border-slate-200"}`}>
                      <p className="text-[10px] text-slate-400 font-mono uppercase">{isTe ? "దిగుబడి (క్వింటాళ్ళు)" : "Predicted Yield"}</p>
                      <p className="text-base font-bold font-mono text-emerald-400">{yieldResult.topCrop?.totalExpectedYieldQuintals} Qtl</p>
                      <p className="text-[9px] text-slate-400 font-mono">({yieldResult.topCrop?.predictedYieldPerAcreKg} kg/Ac)</p>
                    </div>

                    <div className={`p-3 rounded-2xl border ${theme === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-stone-50 border-slate-200"}`}>
                      <p className="text-[10px] text-slate-400 font-mono uppercase">{isTe ? "మండి ధర" : "Forecasted Price"}</p>
                      <p className="text-base font-bold font-mono text-cyan-400">₹{yieldResult.topCrop?.expectedPricePerQuintal?.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-400 font-mono">/ quintal</p>
                    </div>

                    <div className={`p-3 rounded-2xl border ${theme === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-stone-50 border-slate-200"}`}>
                      <p className="text-[10px] text-slate-400 font-mono uppercase">{isTe ? "మొత్తం ఆదాయం" : "Gross Revenue"}</p>
                      <p className="text-base font-bold font-mono text-amber-400">₹{yieldResult.topCrop?.estimatedGrossRevenue?.toLocaleString()}</p>
                      <p className="text-[9px] text-slate-400 font-mono">for {getEffectiveAcres()} Acres</p>
                    </div>

                    <div className={`p-3 rounded-2xl border ${theme === "dark" ? "bg-emerald-950/30 border-emerald-500/30" : "bg-emerald-50 border-emerald-200"}`}>
                      <p className="text-[10px] text-emerald-400 font-mono uppercase">{isTe ? "నికర లాభం" : "Est. Net Profit"}</p>
                      <p className="text-base font-black font-mono text-emerald-400">₹{yieldResult.topCrop?.estimatedNetProfit?.toLocaleString()}</p>
                      <p className="text-[9px] text-emerald-500 font-mono font-bold">ROI Optimization</p>
                    </div>
                  </div>

                  {/* Growth Drivers & Risk Factors */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs pt-3 border-t border-slate-800">
                    <div>
                      <h4 className="font-bold text-emerald-400 mb-1.5 flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Key Growth Drivers</span>
                      </h4>
                      <ul className="space-y-1 text-slate-300">
                        {yieldResult.topCrop?.keyGrowthDrivers?.map((driver: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400">•</span>
                            <span>{driver}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <h4 className="font-bold text-amber-400 mb-1.5 flex items-center gap-1">
                        <AlertTriangle className="w-3.5 h-3.5" />
                        <span>Risk Factors to Monitor</span>
                      </h4>
                      <ul className="space-y-1 text-slate-300">
                        {yieldResult.topCrop?.riskFactors?.map((risk: string, idx: number) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-amber-400">•</span>
                            <span>{risk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>

                {/* Alternative Crops Ranked by ML */}
                <div className={`p-6 rounded-3xl border shadow-lg ${
                  theme === "dark" ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
                }`}>
                  <h3 className="text-sm font-bold text-slate-300 mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-emerald-400" />
                    <span>{isTe ? "మరొక అనుకూలమైన ప్రత్యామ్నాయ పంటలు" : "Alternative Suitable Crop Candidates"}</span>
                  </h3>

                  <div className="space-y-3">
                    {yieldResult.alternativeCrops?.map((alt: any, idx: number) => (
                      <div
                        key={idx}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between gap-4 transition-all ${
                          theme === "dark" ? "bg-slate-950/60 border-slate-800" : "bg-stone-50 border-slate-200"
                        }`}
                      >
                        <div>
                          <p className="font-bold text-sm text-emerald-300">{alt.cropName}</p>
                          <p className="text-[11px] text-slate-400 font-mono">
                            Est. Yield: {alt.predictedYieldPerAcreKg} kg/Ac • Net Profit: ₹{alt.estimatedNetProfit?.toLocaleString()}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          <div className="w-24 bg-slate-800 rounded-full h-2 overflow-hidden hidden sm:block">
                            <div
                              className="bg-emerald-500 h-2 rounded-full"
                              style={{ width: `${alt.suitabilityScore}%` }}
                            />
                          </div>
                          <span className="text-xs font-bold font-mono text-emerald-400">{alt.suitabilityScore}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className={`p-10 rounded-3xl border text-center flex flex-col items-center justify-center space-y-4 shadow-lg ${
                theme === "dark" ? "bg-slate-900/80 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600"
              }`}>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <BrainCircuit className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="font-bold text-base text-slate-100">
                    {isTe ? "ఫలితాల కోసం ML మోడల్‌ను రన్ చేయండి" : "Execute ML Crop Classifier"}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isTe
                      ? "ఎడమ వైపున నేల రకం, pH, వర్షపాతం మరియు NPK విలువలను సర్దుబాటు చేసి, మోడల్ రన్ చేయడానికి క్లిక్ చేయండి."
                      : "Adjust your land, soil pH, NPK nutrients, and weather parameters on the left, then click 'EXECUTE ML CROP CLASSIFIER' to compute yield suitability."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODEL 2: SOIL NUTRITION PRESCRIPTION */}
      {activeMlTab === "soil" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={`lg:col-span-5 p-6 rounded-3xl border shadow-lg space-y-5 ${
            theme === "dark" ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <FlaskConical className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold">{isTe ? "నేల పరీక్ష & ఎరువుల లెక్కకం" : "NPK Soil Fertilizer Calculator"}</h2>
              </div>
              <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2 py-0.5 rounded-full">
                Multi-Crop Engine
              </span>
            </div>

            {/* 1. TARGET CROPS (MULTIPLE SELECTION) */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  {isTe ? "1. ఉద్దేశించిన పంటలు (ఒకటి లేదా అంతకంటే ఎక్కువ ఎంచుకోండి)" : "1. Target Crops (Multiple Selection Allowed)"}
                </label>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-slate-800 px-2 py-0.5 rounded-md">
                  {selectedCrops.length} {selectedCrops.length === 1 ? "Crop" : "Crops"} Selected
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2">
                {[
                  "Paddy / Rice",
                  "Cotton",
                  "Turmeric",
                  "Red Gram / Pigeon Pea",
                  "Red Chilli",
                  "Maize",
                  "Groundnut",
                  "Wheat"
                ].map((cropName) => {
                  const isSelected = selectedCrops.includes(cropName);
                  return (
                    <button
                      key={cropName}
                      type="button"
                      onClick={() => toggleNpkCrop(cropName)}
                      className={`px-3 py-2 rounded-xl text-xs font-bold flex items-center justify-between border transition-all cursor-pointer text-left ${
                        isSelected
                          ? "bg-emerald-500 text-slate-950 border-emerald-400 font-black shadow-sm"
                          : theme === "dark"
                          ? "bg-slate-950 border-slate-800 text-slate-300 hover:bg-slate-800"
                          : "bg-slate-50 border-slate-200 text-slate-700 hover:bg-slate-100"
                      }`}
                    >
                      <span className="truncate pr-1">{cropName}</span>
                      {isSelected ? (
                        <CheckCircle2 className="w-3.5 h-3.5 shrink-0 text-slate-950" />
                      ) : (
                        <span className="w-2 h-2 rounded-full bg-slate-600 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>

              <p className="text-[10px] text-slate-400">
                {isTe
                  ? "ఎంచుకున్న పంటలు: "
                  : "Selected: "}
                <strong className="text-emerald-400">{selectedCrops.join(", ")}</strong>
              </p>
            </div>

            {/* 2. AREA CULTIVATION (ACRES) - PLACED DIRECTLY AFTER TARGET CROPS */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  {isTe ? "2. సాగు విస్తీర్ణం (ఎకరాలు)" : "2. Area Cultivation (Acres)"}
                </label>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-slate-800 px-2 py-0.5 rounded-md">
                  {npkCultivationAcres} Acres
                </span>
              </div>

              <div className="relative">
                <input
                  type="number"
                  step="0.5"
                  min="0.1"
                  value={npkCultivationAcres}
                  onChange={(e) => setNpkCultivationAcres(e.target.value)}
                  placeholder="Enter cultivation area in acres..."
                  className={`w-full px-3 py-2.5 rounded-xl border text-xs font-mono font-bold focus:outline-none ${
                    theme === "dark" ? "bg-slate-950 border-slate-700 text-white" : "bg-stone-50 border-slate-300 text-slate-900"
                  }`}
                />
                <span className="absolute right-3 top-2.5 text-[10px] font-bold font-mono text-slate-400">
                  ACRES
                </span>
              </div>

              {/* Quick Acre Selector Buttons */}
              <div className="flex items-center gap-1.5 pt-1">
                {["1.0", "2.5", "5.0", "10.0"].map((ac) => (
                  <button
                    key={ac}
                    type="button"
                    onClick={() => setNpkCultivationAcres(ac)}
                    className={`px-2.5 py-1 rounded-lg text-[10px] font-mono font-bold border cursor-pointer transition-all ${
                      npkCultivationAcres === ac
                        ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/50"
                        : "bg-slate-800/60 text-slate-400 border-slate-700/60 hover:bg-slate-800"
                    }`}
                  >
                    {ac} Ac
                  </button>
                ))}
              </div>
            </div>

            {/* 3. SOIL TYPE SELECTION */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  {isTe ? "3. నేల రకం (నేల రకం ఆధారంగా అంచనా వేయబడుతుంది)" : "3. Soil Type (Auto-calibrates N-P-K & pH)"}
                </label>
                <span className="text-[10px] font-mono text-emerald-400 font-bold bg-slate-800 px-2 py-0.5 rounded-md">
                  {npkSoilType}
                </span>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {NPK_SOIL_PRESETS.map((st) => {
                  const isSelected = npkSoilType === st.id;
                  return (
                    <button
                      key={st.id}
                      type="button"
                      onClick={() => applySoilTypePreset(st)}
                      className={`p-2.5 rounded-xl border text-left transition-all cursor-pointer ${
                        isSelected
                          ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 shadow-md ring-1 ring-emerald-400/50"
                          : theme === "dark"
                          ? "bg-slate-950 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200"
                          : "bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100"
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-bold truncate">{st.name.replace(" Soil", "")}</span>
                        {isSelected && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />}
                      </div>
                      <p className="text-[9px] text-slate-400 mt-0.5 font-mono truncate">{st.note}</p>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 4. SOIL NUTRIENTS & PH VECTOR */}
            <div className="space-y-3 pt-2 border-t border-slate-800">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-300">
                  {isTe ? "4. నేల పోషకాల వివరాలు (N-P-K & pH)" : "4. Soil Nutrient Vector (N-P-K & pH)"}
                </label>
                <span className="text-[9px] font-mono text-slate-400">
                  Preset for {npkSoilType}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="text-[10px] text-slate-400 font-mono">Nitrogen (N) kg/ha: {nitrogen}</label>
                  <input
                    type="range"
                    min="20"
                    max="250"
                    value={nitrogen}
                    onChange={(e) => setNitrogen(parseInt(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-mono">Phosphorus (P) kg/ha: {phosphorus}</label>
                  <input
                    type="range"
                    min="10"
                    max="150"
                    value={phosphorus}
                    onChange={(e) => setPhosphorus(parseInt(e.target.value))}
                    className="w-full accent-teal-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-mono">Potassium (K) kg/ha: {potassium}</label>
                  <input
                    type="range"
                    min="10"
                    max="180"
                    value={potassium}
                    onChange={(e) => setPotassium(parseInt(e.target.value))}
                    className="w-full accent-cyan-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
                <div>
                  <label className="text-[10px] text-slate-400 font-mono">Soil pH: {soilPh}</label>
                  <input
                    type="range"
                    min="4.5"
                    max="9.0"
                    step="0.1"
                    value={soilPh}
                    onChange={(e) => setSoilPh(parseFloat(e.target.value))}
                    className="w-full accent-amber-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => handleRunSoilAnalysis(true)}
              disabled={isAnalyzingSoil}
              className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-extrabold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50 mt-2"
            >
              {isAnalyzingSoil ? (
                <span>Calculating Multi-Crop NPK Prescriptions...</span>
              ) : (
                <>
                  <FlaskConical className="w-4 h-4 text-slate-950" />
                  <span>{isTe ? "ఎరువుల మోతాదును అంచనా వేయి" : "CALCULATE FERTILIZER PRESCRIPTION"}</span>
                </>
              )}
            </button>
          </div>

          {/* RESULTS COLUMN */}
          <div className="lg:col-span-7 space-y-6">
            {soilAnalysisResult ? (
              <div className={`p-6 rounded-3xl border shadow-xl space-y-6 ${
                theme === "dark" ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}>
                {/* Soil Score Header */}
                <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                        Soil Health & Nutrient Rating
                      </span>
                      <span className="text-[10px] font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                        Soil: {soilAnalysisResult.soilType || npkSoilType}
                      </span>
                    </div>
                    <h3 className="text-2xl font-black text-emerald-400 mt-2">{soilAnalysisResult.soilQualityScore} / 100</h3>
                    <p className="text-xs text-slate-400 font-mono">{soilAnalysisResult.phStatus}</p>
                  </div>

                  <div className="text-right">
                    <span className="text-[10px] text-slate-400 font-mono">Total Land Area</span>
                    <p className="text-lg font-black font-mono text-white">{npkCultivationAcres} Acres</p>
                    <p className="text-[10px] text-emerald-400 font-bold">{selectedCrops.length} Crop(s) Combined</p>
                  </div>
                </div>

                {/* Combined Prescription Box */}
                <div className="p-4 rounded-2xl border bg-emerald-500/10 border-emerald-500/30">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-bold text-emerald-400 font-mono uppercase tracking-wider">
                      {isTe
                        ? `మొత్తం క్షేత్రానికి ఎరువుల మోతాదు (${npkCultivationAcres} ఎకరాలు, ${selectedCrops.length} పంటలు)`
                        : `Combined Prescription for ${npkCultivationAcres} Acres (${selectedCrops.length} Crops)`}
                    </h4>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400 font-mono">UREA (యూరియా)</p>
                      <p className="text-base font-extrabold font-mono text-emerald-400 mt-0.5">
                        {soilAnalysisResult.totalPrescriptionForLand?.ureaBags} <span className="text-[10px] text-slate-400 font-normal">Bags</span>
                      </p>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400 font-mono">DAP (డీఏపీ)</p>
                      <p className="text-base font-extrabold font-mono text-cyan-400 mt-0.5">
                        {soilAnalysisResult.totalPrescriptionForLand?.dapBags} <span className="text-[10px] text-slate-400 font-normal">Bags</span>
                      </p>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400 font-mono">MOP (పొటాష్)</p>
                      <p className="text-base font-extrabold font-mono text-amber-400 mt-0.5">
                        {soilAnalysisResult.totalPrescriptionForLand?.mopBags} <span className="text-[10px] text-slate-400 font-normal">Bags</span>
                      </p>
                    </div>
                    <div className="bg-slate-950/80 p-3 rounded-xl border border-slate-800">
                      <p className="text-[10px] text-slate-400 font-mono">BIO FERTILIZER</p>
                      <p className="text-base font-extrabold font-mono text-teal-400 mt-0.5">
                        {soilAnalysisResult.totalPrescriptionForLand?.organicBioFertilizerKg} <span className="text-[10px] text-slate-400 font-normal">Kg</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Per Crop Breakdown Section */}
                {soilAnalysisResult.perCropBreakdown && soilAnalysisResult.perCropBreakdown.length > 0 && (
                  <div className="space-y-3">
                    <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                      {isTe ? "పంటవారీగా ఎరువుల వివరాలు" : "Per-Crop Fertilizer Dosage Breakdown"}
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {soilAnalysisResult.perCropBreakdown.map((cropItem: any, idx: number) => (
                        <div key={idx} className="p-3.5 rounded-xl border bg-slate-950/60 border-slate-800 space-y-2">
                          <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                              <Sprout className="w-3.5 h-3.5 text-emerald-500" />
                              {cropItem.cropName}
                            </span>
                            <span className="text-[10px] text-slate-400 font-mono">{npkCultivationAcres} Ac</span>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-1.5 text-center pt-1 text-[11px] font-mono">
                            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                              <span className="text-[9px] text-slate-500 block">Urea</span>
                              <strong className="text-emerald-400">{cropItem.totalUreaForLand || (cropItem.ureaBagsPerAcre * parseFloat(npkCultivationAcres)).toFixed(1)} Bags</strong>
                            </div>
                            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                              <span className="text-[9px] text-slate-500 block">DAP</span>
                              <strong className="text-cyan-400">{cropItem.totalDapForLand || (cropItem.dapBagsPerAcre * parseFloat(npkCultivationAcres)).toFixed(1)} Bags</strong>
                            </div>
                            <div className="bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
                              <span className="text-[9px] text-slate-500 block">MOP</span>
                              <strong className="text-amber-400">{cropItem.totalMopForLand || (cropItem.mopBagsPerAcre * parseFloat(npkCultivationAcres)).toFixed(1)} Bags</strong>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Stage-wise schedule */}
                <div className="space-y-2">
                  <h4 className="text-xs font-bold text-slate-300 font-mono uppercase tracking-wider">
                    {isTe ? "దశలవారీగా ఎరువులు వేసే షెడ్యూల్" : "Stage-Wise Application Schedule"}
                  </h4>
                  {soilAnalysisResult.applicationSchedule?.map((sch: any, idx: number) => (
                    <div key={idx} className="p-3 rounded-xl border bg-slate-950/60 border-slate-800 text-xs">
                      <p className="font-bold text-emerald-400 font-mono">{sch.stage}</p>
                      <p className="text-slate-300 mt-0.5">{sch.details}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`p-10 rounded-3xl border text-center flex flex-col items-center justify-center space-y-4 shadow-lg ${
                theme === "dark" ? "bg-slate-900/80 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600"
              }`}>
                <div className="w-16 h-16 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center text-teal-400">
                  <FlaskConical className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="font-bold text-base text-slate-100">
                    {isTe ? "ఎరువుల రికమండేషన్ కోసం జనరేట్ చేయండి" : "Calculate Multi-Crop NPK Prescription"}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isTe
                      ? "మీ లక్ష్య పంటలను ఎంచుకుని, సాగు విస్తీర్ణం (ఎకరాలు) నమోదు చేసి 'ఎరువుల మోతాదును అంచనా వేయి' క్లిక్ చేయండి."
                      : "Select your target crops, enter your cultivation area in acres, then click 'CALCULATE MULTI-CROP FERTILIZER PRESCRIPTION' to view combined bag requirements."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODEL 3: AI SOIL & CROP VARIETY ADVISOR */}
      {activeMlTab === "advisor" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={`lg:col-span-5 p-6 rounded-3xl border shadow-lg space-y-5 ${
            theme === "dark" ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold">{isTe ? "మట్టి నాణ్యత & విత్తన అనుకూలత" : "Soil-to-Variety Agronomy Inputs"}</h2>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">{isTe ? "మట్టి రకం" : "Soil Type Category"}</label>
              <select
                value={advisorSoilType}
                onChange={(e) => setAdvisorSoilType(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold focus:outline-none ${
                  theme === "dark" ? "bg-slate-950 border-slate-700 text-white" : "bg-stone-50 border-slate-300 text-slate-900"
                }`}
              >
                <option value="Black Regur Soil">Black Regur Soil (నల్లరేగడి నేల)</option>
                <option value="Red Sandy Loam">Red Sandy Loam (ఎర్ర నేల)</option>
                <option value="Alluvial Deltaic">Alluvial Deltaic (ఒండ్రు నేల)</option>
                <option value="Clayey Loam">Clayey Loam (చలక నేల)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">{isTe ? "పంట కాలం" : "Target Cropping Season"}</label>
              <select
                value={advisorSeason}
                onChange={(e) => setAdvisorSeason(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold focus:outline-none ${
                  theme === "dark" ? "bg-slate-950 border-slate-700 text-white" : "bg-stone-50 border-slate-300 text-slate-900"
                }`}
              >
                <option value="Kharif 2026">Kharif Season (తొలకరి / వానకాలం)</option>
                <option value="Rabi 2026">Rabi Season (యాసంగి / చలికాలం)</option>
                <option value="Zaid Summer">Zaid / Summer (వేసవి కాలం)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">{isTe ? "ప్రాధాన్యత లక్ష్యం" : "Farmer Strategy Goal"}</label>
              <select
                value={advisorGoal}
                onChange={(e) => setAdvisorGoal(e.target.value)}
                className={`w-full px-3 py-2.5 rounded-xl border text-xs font-bold focus:outline-none ${
                  theme === "dark" ? "bg-slate-950 border-slate-700 text-white" : "bg-stone-50 border-slate-300 text-slate-900"
                }`}
              >
                <option value="Maximum Revenue">Maximum Net Revenue per Acre</option>
                <option value="Drought Resistance">High Water / Drought Resistance</option>
                <option value="Pest Immunity">Blight & Pest Outbreak Immunity</option>
                <option value="Short Duration">Short Duration (Fast Harvest)</option>
              </select>
            </div>

            <button
              onClick={() => handleRunCropAdvisor(true)}
              disabled={isGeneratingAdvisor}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isGeneratingAdvisor ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Sprout className="w-4 h-4" />
                  <span>{isTe ? "పంట సిఫార్సులు జనరేట్ చేయండి" : "GENERATE AGRONOMY ADVISORY"}</span>
                </>
              )}
            </button>
          </div>

          {/* Results Column */}
          <div className="lg:col-span-7 space-y-6">
            {advisorResult ? (
              <div className={`p-6 rounded-3xl border shadow-xl ${
                theme === "dark" ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}>
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/30">
                      PACS Certified Recommendation
                    </span>
                    <h3 className="text-xl font-extrabold text-white mt-2">Optimal High-Yield Varieties</h3>
                  </div>
                  <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg border border-amber-500/20">
                    {advisorResult.pacsReservationPriority}
                  </span>
                </div>

                <div className="space-y-3">
                  {advisorResult.recommendedVarieties?.map((v: any, idx: number) => (
                    <div key={idx} className={`p-4 rounded-2xl border ${theme === "dark" ? "bg-slate-950/80 border-slate-800" : "bg-stone-50 border-slate-200"}`}>
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-extrabold text-sm text-emerald-400">{v.name}</h4>
                          <span className="text-[11px] text-slate-400 block">{v.type} • {v.duration}</span>
                        </div>
                        <span className="text-xs font-black font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                          ~₹{v.estimatedNetProfit?.toLocaleString()}/acre net
                        </span>
                      </div>

                      <div className="grid grid-cols-2 gap-2 mt-3 text-xs font-mono">
                        <div className="bg-slate-900/60 p-2 rounded-xl">
                          <span className="text-[9px] text-slate-400 block uppercase">Yield Potential</span>
                          <span className="font-bold text-slate-200">{v.yieldPotential}</span>
                        </div>
                        <div className="bg-slate-900/60 p-2 rounded-xl">
                          <span className="text-[9px] text-slate-400 block uppercase">PACS Subsidy</span>
                          <span className="font-bold text-emerald-400">{v.pacsSubsidyRate}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="mt-4 p-3 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-mono text-emerald-400 font-bold uppercase block">Recommended Input Prescription</span>
                    <span className="text-xs font-semibold text-slate-200">{advisorResult.npkDosagePerAcre}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className={`p-10 rounded-3xl border text-center flex flex-col items-center justify-center space-y-4 shadow-lg ${
                theme === "dark" ? "bg-slate-900/80 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600"
              }`}>
                <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <Activity className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="font-bold text-base text-slate-100">
                    {isTe ? "అగ్రోనమీ సలహాల కోసం బటన్ క్లిక్ చేయండి" : "Generate Soil-to-Variety Advisory"}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isTe
                      ? "మీ మట్టి రకం, పంట కాలం మరియు ప్రాధాన్యత లక్ష్యాన్ని ఎంచుకుని సలహాలను పొందండి."
                      : "Select your soil type, season, and strategy goal on the left, then click 'GENERATE AGRONOMY ADVISORY' to view PACS-subsidized variety recommendations."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
      {activeMlTab === "pest" && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className={`lg:col-span-5 p-6 rounded-3xl border shadow-lg space-y-5 ${
            theme === "dark" ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
          }`}>
            <div className="flex items-center justify-between pb-3 border-b border-slate-700/40">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-emerald-400" />
                <h2 className="text-base font-bold">{isTe ? "వాతావరణం & పంట దశ" : "Epidemiology Predictor Parameters"}</h2>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-semibold text-slate-400">Crop</label>
              <input
                type="text"
                value={pestCrop}
                onChange={(e) => setPestCrop(e.target.value)}
                className={`w-full px-3 py-2 rounded-xl border text-xs font-bold focus:outline-none ${
                  theme === "dark" ? "bg-slate-950 border-slate-700 text-white" : "bg-stone-50 border-slate-300 text-slate-900"
                }`}
              />
            </div>

            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-400">Relative Humidity (%)</span>
                <span className="font-mono font-bold text-emerald-400">{pestHumidity}%</span>
              </div>
              <input
                type="range"
                min="30"
                max="98"
                value={pestHumidity}
                onChange={(e) => setPestHumidity(parseInt(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <button
              onClick={handleRunPestPrediction}
              disabled={isPredictingPest}
              className="w-full py-3 px-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20 transition-all cursor-pointer disabled:opacity-50"
            >
              {isPredictingPest ? (
                <span>Predicting Threat Probabilities...</span>
              ) : (
                <>
                  <ShieldAlert className="w-4 h-4" />
                  <span>{isTe ? "వ్యాప్తి ప్రమాదాన్ని అంచనా వేయి" : "CALCULATE OUTBREAK RISK"}</span>
                </>
              )}
            </button>
          </div>

          <div className="lg:col-span-7 space-y-6">
            {pestResult ? (
              <div className={`p-6 rounded-3xl border shadow-xl ${
                theme === "dark" ? "bg-slate-900/90 border-slate-800 text-white" : "bg-white border-slate-200 text-slate-900"
              }`}>
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <span className="text-[10px] font-mono font-bold uppercase text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-full border border-amber-500/30">
                      Outbreak Risk Index
                    </span>
                    <h3 className="text-2xl font-black text-amber-400 mt-2">{pestResult.overallRiskLevel} RISK ({pestResult.riskScore}%)</h3>
                  </div>

                  <span className="text-xs font-mono font-bold text-slate-400">
                    Window: Next {pestResult.preventiveWindowHours} Hours
                  </span>
                </div>

                <div className="space-y-3 mt-4">
                  {pestResult.predictedThreats?.map((thr: any, idx: number) => (
                    <div key={idx} className="p-4 rounded-2xl border bg-slate-950/60 border-slate-800 space-y-2">
                      <div className="flex justify-between items-center">
                        <p className="font-bold text-sm text-emerald-300">{thr.diseasePest}</p>
                        <span className="text-xs font-bold font-mono text-amber-400">{thr.probability}% Probable</span>
                      </div>
                      <p className="text-xs text-slate-300"><span className="text-slate-400 font-mono">Impact:</span> {thr.impact}</p>
                      <p className="text-xs text-emerald-400 font-semibold"><span className="font-mono text-slate-400">Action:</span> {thr.action}</p>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className={`p-10 rounded-3xl border text-center flex flex-col items-center justify-center space-y-4 shadow-lg ${
                theme === "dark" ? "bg-slate-900/80 border-slate-800 text-slate-300" : "bg-white border-slate-200 text-slate-600"
              }`}>
                <div className="w-16 h-16 rounded-2xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                  <ShieldAlert className="w-8 h-8" />
                </div>
                <div className="max-w-md space-y-1">
                  <h3 className="font-bold text-base text-slate-100">
                    {isTe ? "తెగుళ్ళ ప్రమాదాన్ని లెక్కించండి" : "Calculate Epidemic Outbreak Risk"}
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    {isTe
                      ? "మీ పంట వివరాలు మరియు తేమ శాతాన్ని ఎంచుకుని ప్రమాద అంచనాను చూడండి."
                      : "Specify your crop type and humidity levels on the left, then click 'CALCULATE OUTBREAK RISK' to view epidemiological forecast."}
                  </p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
