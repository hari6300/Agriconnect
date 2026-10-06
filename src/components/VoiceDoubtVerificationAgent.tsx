import React, { useState, useEffect, useRef } from "react";
import { 
  Mic, 
  MicOff, 
  Volume2, 
  VolumeX, 
  Sparkles, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert, 
  ShieldCheck, 
  RotateCcw, 
  HelpCircle, 
  Send, 
  Zap, 
  Layers, 
  Clock, 
  Check, 
  X, 
  Languages, 
  ArrowRight,
  Bookmark,
  Share2,
  ThumbsUp,
  Cpu,
  BrainCircuit,
  Lightbulb,
  Radio,
  Play,
  Pause,
  TrendingUp,
  Coins,
  FlaskConical,
  Leaf,
  CloudSunRain,
  Dna,
  Copy,
  CheckCheck,
  BarChart2,
  Sprout
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";
import { VoiceDoubtVerificationResult, VoiceDoubtPreset, FarmerUser, VerificationVerdict } from "../types";

interface VoiceDoubtVerificationAgentProps {
  currentUser?: FarmerUser | null;
  theme?: 'light' | 'dark';
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
  activeCropContext?: string;
  isFloatingModal?: boolean;
  onCloseFloating?: () => void;
}

const CROPS_LIST = [
  { id: "paddy", name: "Paddy (Rice)", icon: "🌾" },
  { id: "cotton", name: "Cotton", icon: "🌱" },
  { id: "chilli", name: "Chilli / Mirchi", icon: "🌶️" },
  { id: "maize", name: "Maize (Corn)", icon: "🌽" },
  { id: "groundnut", name: "Groundnut", icon: "🥜" },
  { id: "soybean", name: "Soybean", icon: "🫘" },
  { id: "tomato", name: "Tomato / Veg", icon: "🍅" },
  { id: "sugarcane", name: "Sugarcane", icon: "🎋" }
];

const GROWTH_STAGES = [
  "Seedling / Nursery",
  "Vegetative Growth",
  "Active Tillering",
  "Flowering / Budding",
  "Fruit / Boll Formation",
  "Grain Filling / Maturity"
];

const PRESET_DOUBTS: VoiceDoubtPreset[] = [
  {
    id: "zinc-dap-mix",
    title: "Zinc Sulphate + DAP Mix",
    query: "Can I mix Zinc Sulphate directly with DAP in the same spray tank?",
    category: "Fertilizers & Chemicals",
    icon: "🧪",
    lang: "en"
  },
  {
    id: "urea-dap-mix",
    title: "Urea + DAP Mixing",
    query: "Can I mix Urea and DAP together before broadcasting?",
    category: "Fertilizers & Chemicals",
    icon: "🌾",
    lang: "en"
  },
  {
    id: "rain-spray-timing",
    title: "Spraying Before Rain",
    query: "Rain is forecasted in 4 hours, is it safe to spray fungicide today?",
    category: "Irrigation & Weather",
    icon: "🌧️",
    lang: "en"
  },
  {
    id: "flowering-insecticide",
    title: "Flowering Insecticide",
    query: "Can I spray systemic insecticide during active crop flowering?",
    category: "Crop Disease",
    icon: "🐝",
    lang: "en"
  },
  {
    id: "cotton-yellow-leaves",
    title: "Cotton Leaf Reddening / Yellowing",
    query: "Why are my cotton leaves turning yellow and red at margins, and how to treat it?",
    category: "Crop Disease",
    icon: "🌿",
    lang: "en"
  },
  {
    id: "chilli-black-thrips",
    title: "Chilli Black Thrips",
    query: "My chilli flower petals and young leaves are curling upwards with black spots, what is the fastest treatment?",
    category: "Crop Disease",
    icon: "🌶️",
    lang: "en"
  },
  {
    id: "pm-kisan-eligibility",
    title: "PM-Kisan Eligibility",
    query: "Am I eligible for PM-Kisan 2000 rupees installment with 3 acres land?",
    category: "Govt Schemes",
    icon: "📜",
    lang: "en"
  },
  {
    id: "te-zinc-dap",
    title: "జింక్ సల్ఫేట్ మరియు DAP కలపవచ్చా?",
    query: "జింక్ సల్ఫేట్ మరియు డీఏపీ (DAP) ఒకే ట్యాంకులో కలిపి పిచికారీ చేయవచ్చా?",
    category: "Fertilizers & Chemicals",
    icon: "🧪",
    lang: "te"
  },
  {
    id: "te-urea-spray",
    title: "యూరియా మరియు DAP కలపవచ్చా?",
    query: "పొలంలో చల్లే ముందు యూరియా మరియు డీఏపీ కలిపి నిల్వ ఉంచవచ్చా?",
    category: "Fertilizers & Chemicals",
    icon: "🌾",
    lang: "te"
  },
  {
    id: "te-rain-spray",
    title: "వర్షం పడే ముందు మందు కొట్టవచ్చా?",
    query: "నాలుగు గంటల్లో వర్షం పడే సూచన ఉంది, ఇప్పుడు పురుగు మందు పిచికారీ చేయవచ్చా?",
    category: "Irrigation & Weather",
    icon: "🌧️",
    lang: "te"
  },
  {
    id: "te-cotton-red",
    title: "పత్తిలో ఆకులు ఎర్రబడటం నివారణ",
    query: "పత్తి చేనులో ఆకులు ఎర్రగా మారి రాలిపోతున్నాయి, మెగ్నీషియం లోపమా? ఏమి పిచికారీ చేయాలి?",
    category: "Crop Disease",
    icon: "🌿",
    lang: "te"
  },
  {
    id: "hi-zinc-dap",
    title: "जिंक और DAP का मिश्रण",
    query: "क्या जिंक सल्फेट और DAP को एक साथ टैंक में मिलाकर छिड़क सकते हैं?",
    category: "Fertilizers & Chemicals",
    icon: "🧪",
    lang: "hi"
  },
  {
    id: "hi-rain-spray",
    title: "बारिश से पहले छिड़काव",
    query: "क्या बारिश से 3-4 घंटे पहले फफूंदनाशक का छिड़काव करना सुरक्षित है?",
    category: "Irrigation & Weather",
    icon: "🌧️",
    lang: "hi"
  }
];

export default function VoiceDoubtVerificationAgent({
  currentUser,
  theme = 'dark',
  onNotify,
  activeCropContext = "Paddy, Cotton, Chilli, Maize",
  isFloatingModal = false,
  onCloseFloating
}: VoiceDoubtVerificationAgentProps) {
  // Voice Agent State
  const [queryText, setQueryText] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState<'en' | 'te' | 'hi'>("en");
  const [selectedCrop, setSelectedCrop] = useState<string>("Paddy (Rice)");
  const [selectedStage, setSelectedStage] = useState<string>("Vegetative Growth");
  const [agentState, setAgentState] = useState<'idle' | 'listening' | 'thinking' | 'speaking'>('idle');
  const [thinkingStep, setThinkingStep] = useState<string>("");
  const [currentResult, setCurrentResult] = useState<VoiceDoubtVerificationResult | null>(null);
  const [history, setHistory] = useState<VoiceDoubtVerificationResult[]>([]);
  const [autoSpeak, setAutoSpeak] = useState(true);
  const [isAudioMuted, setIsAudioMuted] = useState(false);
  const [activeVoiceTone, setActiveVoiceTone] = useState<'Zephyr' | 'Kore' | 'Puck'>('Zephyr');
  const [audioSpeed, setAudioSpeed] = useState<number>(1.0);
  const [isSpeechSupported, setIsSpeechSupported] = useState(true);
  const [isCopied, setIsCopied] = useState(false);

  // Audio & Speech Recognition Refs
  const recognitionRef = useRef<any>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const activeAudioSourceRef = useRef<AudioBufferSourceNode | null>(null);
  const speechSynthUtteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const resultCardRef = useRef<HTMLDivElement | null>(null);

  // Check Web Speech Recognition support on mount
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setIsSpeechSupported(false);
    }
  }, []);

  // Stop audio on unmount
  useEffect(() => {
    return () => {
      stopAudioPlayback();
      if (recognitionRef.current) {
        try { recognitionRef.current.stop(); } catch (e) {}
      }
    };
  }, []);

  // Start Speech Recognition with language-specific locale
  const startListening = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      onNotify("Speech recognition is not supported in this browser. You can type your doubt.", "info");
      return;
    }

    stopAudioPlayback();

    try {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = selectedLanguage === 'te' ? 'te-IN' : selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';

      recognition.onstart = () => {
        setAgentState('listening');
        onNotify(
          selectedLanguage === 'te' 
            ? "వినడం జరుగుతోంది... మీ వ్యవసాయ సందేహాన్ని స్పష్టంగా మాట్లాడండి." 
            : selectedLanguage === 'hi' 
            ? "सुन रहे हैं... अपनी कृषि संबंधी शंका स्पष्ट रूप से बोलें।" 
            : "Listening actively... Speak your farming doubt clearly.", 
          "info"
        );
      };

      recognition.onresult = (event: any) => {
        let transcript = "";
        for (let i = 0; i < event.results.length; i++) {
          transcript += event.results[i][0].transcript;
        }
        setQueryText(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn("Speech recognition error:", event.error);
        if (event.error !== 'no-speech') {
          onNotify(`Voice input note: ${event.error}`, "info");
        }
        setAgentState('idle');
      };

      recognition.onend = () => {
        if (agentState === 'listening') {
          if (queryText.trim().length > 3) {
            handleVerifyDoubt(queryText);
          } else {
            setAgentState('idle');
          }
        }
      };

      recognitionRef.current = recognition;
      recognition.start();
    } catch (e: any) {
      console.warn("Failed to start speech recognition:", e);
      setAgentState('idle');
      onNotify("Could not access microphone.", "error");
    }
  };

  const stopListening = () => {
    if (recognitionRef.current) {
      try {
        recognitionRef.current.stop();
      } catch (e) {}
    }
    setAgentState('idle');
  };

  // Convert raw 16-bit PCM base64 string to audio buffer & play at 24kHz
  const playPCM24kAudio = async (base64Audio: string) => {
    try {
      if (!audioContextRef.current) {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)({ sampleRate: 24000 });
      }
      const ctx = audioContextRef.current;
      if (ctx.state === 'suspended') {
        await ctx.resume();
      }

      // Stop any existing playback
      if (activeAudioSourceRef.current) {
        try { activeAudioSourceRef.current.stop(); } catch (e) {}
      }

      const binaryStr = atob(base64Audio);
      const len = binaryStr.length;
      const buffer = new ArrayBuffer(len);
      const view = new DataView(buffer);
      for (let i = 0; i < len; i++) {
        view.setUint8(i, binaryStr.charCodeAt(i));
      }

      // Convert 16-bit PCM to Float32
      const numSamples = Math.floor(len / 2);
      const audioBuffer = ctx.createBuffer(1, numSamples, 24000);
      const channelData = audioBuffer.getChannelData(0);

      for (let i = 0; i < numSamples; i++) {
        const int16 = view.getInt16(i * 2, true); // Little endian
        channelData[i] = int16 / 32768.0;
      }

      const source = ctx.createBufferSource();
      source.buffer = audioBuffer;
      source.playbackRate.value = audioSpeed;
      source.connect(ctx.destination);

      source.onended = () => {
        setAgentState('idle');
      };

      activeAudioSourceRef.current = source;
      setAgentState('speaking');
      source.start();
    } catch (e) {
      console.warn("PCM audio playback failed, falling back to Web Speech Synthesis:", e);
      speakWithWebSpeech(currentResult?.spokenResponse || queryText);
    }
  };

  // Web Speech Synthesis Fallback
  const speakWithWebSpeech = (text: string) => {
    if (!('speechSynthesis' in window) || isAudioMuted) return;

    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = selectedLanguage === 'te' ? 'te-IN' : selectedLanguage === 'hi' ? 'hi-IN' : 'en-IN';
    utterance.rate = audioSpeed;
    utterance.pitch = 1.0;

    const voices = window.speechSynthesis.getVoices();
    const matchingVoice = voices.find(v => 
      selectedLanguage === 'te' ? v.lang.includes('te') : selectedLanguage === 'hi' ? v.lang.includes('hi') : (v.lang.includes('en-IN') || v.name.includes('India'))
    );
    if (matchingVoice) {
      utterance.voice = matchingVoice;
    }

    utterance.onstart = () => {
      setAgentState('speaking');
    };

    utterance.onend = () => {
      setAgentState('idle');
    };

    utterance.onerror = () => {
      setAgentState('idle');
    };

    speechSynthUtteranceRef.current = utterance;
    window.speechSynthesis.speak(utterance);
  };

  // Stop Audio Playback
  const stopAudioPlayback = () => {
    if (activeAudioSourceRef.current) {
      try { activeAudioSourceRef.current.stop(); } catch (e) {}
      activeAudioSourceRef.current = null;
    }
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setAgentState('idle');
  };

  // Play Spoken Audio for Result
  const handlePlayVoiceResponse = async (result: VoiceDoubtVerificationResult) => {
    if (isAudioMuted) return;

    if (agentState === 'speaking') {
      stopAudioPlayback();
      return;
    }

    // If we already have base64 audio from Gemini TTS
    if (result.audioBase64) {
      await playPCM24kAudio(result.audioBase64);
      return;
    }

    // Try fetching from Gemini TTS
    try {
      setAgentState('thinking');
      setThinkingStep("Synthesizing clear agronomist voice...");
      const res = await fetch("/api/ai-voice/speech-generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          text: result.spokenResponse,
          voiceName: activeVoiceTone
        })
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          result.audioBase64 = data.audioBase64;
          await playPCM24kAudio(data.audioBase64);
          return;
        }
      }
    } catch (e) {
      console.warn("TTS fetch failed:", e);
    }

    // Fallback to browser Web Speech API
    speakWithWebSpeech(result.spokenResponse);
  };

  // Verify Doubt with Gemini API + Predictive Analytics Engine
  const handleVerifyDoubt = async (textToVerify?: string) => {
    const query = (textToVerify || queryText).trim();
    if (!query) {
      onNotify("Please speak or type a doubt question first.", "info");
      return;
    }

    stopAudioPlayback();
    setAgentState('thinking');
    setThinkingStep("Analyzing doubt with Gemini 3.7 Flash...");

    const combinedContext = `${selectedCrop} (${selectedStage}), Region: ${currentUser?.district || 'Telangana/AP/India'}`;

    const stepTimer1 = setTimeout(() => setThinkingStep("Cross-referencing agronomic research & chemical matrix..."), 600);
    const stepTimer2 = setTimeout(() => setThinkingStep("Simulating yield protection & cost-saving metrics..."), 1200);

    try {
      const res = await fetch("/api/ai-voice/verify-doubt", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          query: query,
          language: selectedLanguage,
          cropContext: combinedContext,
          userContext: {
            name: currentUser?.name,
            district: currentUser?.district,
            state: currentUser?.state
          }
        })
      });

      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);

      if (res.ok) {
        const data: VoiceDoubtVerificationResult = await res.json();
        setCurrentResult(data);
        setHistory(prev => [data, ...prev.filter(item => item.id !== data.id)].slice(0, 10));
        onNotify(`Doubt Verified: ${data.verdict.replace(/_/g, ' ')} (${data.confidence}%)`, "success");

        // Scroll to result card
        setTimeout(() => {
          resultCardRef.current?.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 150);

        // Auto speak response if enabled
        if (autoSpeak && !isAudioMuted) {
          handlePlayVoiceResponse(data);
        } else {
          setAgentState('idle');
        }
      } else {
        onNotify("Verification service encountered an issue. Please try again.", "error");
        setAgentState('idle');
      }
    } catch (e) {
      clearTimeout(stepTimer1);
      clearTimeout(stepTimer2);
      onNotify("Server connectivity issue during verification.", "error");
      setAgentState('idle');
    }
  };

  const getVerdictBadge = (verdict: VerificationVerdict) => {
    switch (verdict) {
      case 'VERIFIED_SAFE':
        return {
          label: "VERIFIED SAFE & COMPLIANT",
          color: "bg-emerald-500/20 text-emerald-400 border-emerald-500/40",
          icon: ShieldCheck,
          accent: "text-emerald-400"
        };
      case 'RECOMMENDED_PRACTICE':
        return {
          label: "RECOMMENDED BEST PRACTICE",
          color: "bg-teal-500/20 text-teal-300 border-teal-500/40",
          icon: CheckCircle2,
          accent: "text-teal-400"
        };
      case 'CAUTION_REQUIRED':
        return {
          label: "CAUTION ADVISED / CONDITIONAL",
          color: "bg-amber-500/20 text-amber-300 border-amber-500/40",
          icon: AlertTriangle,
          accent: "text-amber-400"
        };
      case 'HIGH_RISK_WARNING':
        return {
          label: "HIGH RISK / PROHIBITED PRACTICE",
          color: "bg-rose-500/20 text-rose-300 border-rose-500/40",
          icon: ShieldAlert,
          accent: "text-rose-400"
        };
      case 'FACT_CHECKED_ACCURATE':
      default:
        return {
          label: "FACT-CHECKED ACCURATE",
          color: "bg-sky-500/20 text-sky-300 border-sky-500/40",
          icon: Sparkles,
          accent: "text-sky-400"
        };
    }
  };

  const getCompatibilityBadge = (compat?: string) => {
    switch (compat) {
      case 'SAFE_COMPATIBLE':
        return { label: "Safe Tank-Mix", color: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30" };
      case 'RISK_PRECIPITATION':
        return { label: "Precipitation / Clogging Risk", color: "bg-amber-500/20 text-amber-300 border-amber-500/30" };
      case 'BURNING_HAZARD':
        return { label: "Phytotoxicity / Leaf Burning Hazard", color: "bg-rose-500/20 text-rose-300 border-rose-500/30" };
      case 'REDUCED_EFFICACY':
        return { label: "Reduced Chemical Efficacy", color: "bg-orange-500/20 text-orange-300 border-orange-500/30" };
      default:
        return { label: "Standard Formulation Check", color: "bg-slate-800 text-slate-300 border-slate-700" };
    }
  };

  const handleCopyPrescription = () => {
    if (!currentResult) return;
    const textToCopy = `*Krishi Doubt Verification Prescription*\n` +
      `Question: ${currentResult.query}\n` +
      `Verdict: ${currentResult.verdict.replace(/_/g, ' ')} (${currentResult.confidence}% Scientific Match)\n\n` +
      `*Expert Summary:*\n${currentResult.spokenResponse}\n\n` +
      (currentResult.predictedYieldImpact ? `*Predicted Yield Impact:* ${currentResult.predictedYieldImpact}\n` : '') +
      (currentResult.costSavingEstimate ? `*Cost Savings Estimate:* ${currentResult.costSavingEstimate}\n` : '') +
      (currentResult.optimalApplicationWindow ? `*Optimal Window:* ${currentResult.optimalApplicationWindow}\n` : '') +
      `\n*Recommended Do's:*\n${currentResult.keyDirectives.dos.map(d => `- ${d}`).join('\n')}\n\n` +
      `*Critical Don'ts:*\n${currentResult.keyDirectives.donts.map(d => `- ${d}`).join('\n')}\n\n` +
      `Timeline: ${currentResult.actionTimeline}\nSource: AgriConnect Krishi Engine (${currentResult.sourceEngine})`;

    navigator.clipboard.writeText(textToCopy);
    setIsCopied(true);
    onNotify("Agronomic prescription copied to clipboard!", "success");
    setTimeout(() => setIsCopied(false), 2500);
  };

  return (
    <div className={`space-y-6 ${isFloatingModal ? 'p-1' : ''}`}>
      {/* HEADER HERO BANNER */}
      <div className={`rounded-3xl border p-6 relative overflow-hidden transition-all shadow-xl ${
        theme === 'dark' 
          ? 'bg-gradient-to-br from-slate-900 via-emerald-950/40 to-slate-950 border-slate-800 text-white' 
          : 'bg-gradient-to-br from-emerald-900 via-teal-900 to-slate-900 border-emerald-800 text-white'
      }`}>
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-teal-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2 flex-wrap">
              <span className="flex items-center gap-1 text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                <Sparkles className="w-3 h-3 text-amber-300 animate-pulse" />
                Gemini 3.7 Flash Voice Intelligence
              </span>
              <span className="text-[10px] font-mono text-teal-300 bg-teal-950/80 px-2.5 py-0.5 rounded-full border border-teal-700/60">
                Predictive Agronomy & Risk Matrix
              </span>
            </div>
            <h2 className="text-xl md:text-2xl font-black font-display tracking-tight text-white flex items-center gap-2.5">
              <span>Krishi Voice Doubt Verification Agent</span>
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              Ask any farming doubt by voice in English, Telugu, or Hindi. Fact-check pesticide tank-mixes, rain windows, fertilizer compatibility, and receive instant scientific yield & cost predictions.
            </p>
          </div>

          {/* Quick Language & Audio Controls */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center bg-slate-950/80 border border-slate-800 rounded-xl p-1">
              <button
                onClick={() => { setSelectedLanguage('en'); onNotify("Voice input set to English", "info"); }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  selectedLanguage === 'en' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                English
              </button>
              <button
                onClick={() => { setSelectedLanguage('te'); onNotify("వాయిస్ ఇన్‌పుట్ తెలుగుకు మార్చబడింది", "info"); }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  selectedLanguage === 'te' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                తెలుగు
              </button>
              <button
                onClick={() => { setSelectedLanguage('hi'); onNotify("आवाज इनपुट हिंदी में सेट किया गया", "info"); }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition ${
                  selectedLanguage === 'hi' ? 'bg-emerald-500 text-slate-950 shadow-xs' : 'text-slate-400 hover:text-white'
                }`}
              >
                हिन्दी
              </button>
            </div>

            <button
              onClick={() => {
                const nextMuted = !isAudioMuted;
                setIsAudioMuted(nextMuted);
                if (nextMuted) stopAudioPlayback();
                onNotify(nextMuted ? "Voice speech muted" : "Voice speech enabled", "info");
              }}
              title={isAudioMuted ? "Unmute Gemini Voice" : "Mute Gemini Voice"}
              className={`p-2.5 rounded-xl border transition cursor-pointer ${
                isAudioMuted 
                  ? 'bg-rose-950/50 border-rose-800/80 text-rose-400' 
                  : 'bg-slate-900/80 border-slate-700 text-emerald-400 hover:bg-slate-800'
              }`}
            >
              {isAudioMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
            </button>

            {isFloatingModal && onCloseFloating && (
              <button
                onClick={onCloseFloating}
                className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white border border-slate-700 transition"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* CROP & GROWTH STAGE SELECTORS FOR MAXIMUM PREDICTION ACCURACY */}
        <div className="mt-5 pt-4 border-t border-white/10 grid grid-cols-1 md:grid-cols-2 gap-3 relative z-10">
          <div>
            <span className="text-[10px] font-mono font-bold text-emerald-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Sprout className="w-3.5 h-3.5" />
              Target Crop Context:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {CROPS_LIST.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCrop(crop.name)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition font-medium cursor-pointer ${
                    selectedCrop.startsWith(crop.name.split(" ")[0])
                      ? 'bg-emerald-500 text-slate-950 border-emerald-400 font-bold shadow-xs'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-emerald-500/50'
                  }`}
                >
                  <span className="mr-1">{crop.icon}</span>
                  {crop.name}
                </button>
              ))}
            </div>
          </div>

          <div>
            <span className="text-[10px] font-mono font-bold text-teal-300 uppercase tracking-wider block mb-1.5 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5" />
              Crop Growth Stage:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {GROWTH_STAGES.map((stage) => (
                <button
                  key={stage}
                  onClick={() => setSelectedStage(stage)}
                  className={`text-xs px-2.5 py-1 rounded-lg border transition font-medium cursor-pointer ${
                    selectedStage === stage
                      ? 'bg-teal-500 text-slate-950 border-teal-400 font-bold shadow-xs'
                      : 'bg-slate-950/60 text-slate-300 border-slate-800 hover:border-teal-500/50'
                  }`}
                >
                  {stage}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* INTERACTIVE VOICE ORB & INPUT STUDIO */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* LEFT COLUMN: Holographic Voice Orb & Live Mic Controls */}
        <div className={`lg:col-span-5 rounded-3xl border p-6 flex flex-col items-center justify-between text-center relative overflow-hidden transition-all shadow-lg ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          {/* Subtle Ambient Grid Background */}
          <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10 pointer-events-none" />

          <div className="w-full flex justify-between items-center text-xs font-mono mb-4 text-slate-400">
            <span className="flex items-center gap-1.5">
              <Radio className={`w-3.5 h-3.5 ${agentState === 'listening' ? 'text-rose-500 animate-ping' : agentState === 'speaking' ? 'text-emerald-400 animate-pulse' : 'text-slate-500'}`} />
              <span className="uppercase font-bold tracking-wider">
                {agentState === 'listening' ? "RECORDING VOICE..." : agentState === 'thinking' ? "GEMINI VERIFYING..." : agentState === 'speaking' ? "GEMINI SPEAKING..." : "READY TO LISTEN"}
              </span>
            </span>

            <span className="text-[10px] bg-slate-800/80 text-emerald-400 px-2 py-0.5 rounded border border-slate-700 font-bold">
              {selectedLanguage === 'te' ? 'TE (తెలుగు)' : selectedLanguage === 'hi' ? 'HI (हिन्दी)' : 'EN (India)'}
            </span>
          </div>

          {/* DYNAMIC GEMINI VOICE ORB */}
          <div className="my-6 relative flex items-center justify-center">
            {/* Outer Expanding Waves when Listening / Speaking */}
            <AnimatePresence>
              {(agentState === 'listening' || agentState === 'speaking') && (
                <>
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.8 }}
                    animate={{ scale: 1.8, opacity: 0 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut" }}
                    className={`absolute w-36 h-36 rounded-full ${
                      agentState === 'listening' ? 'bg-rose-500/30' : 'bg-emerald-400/30'
                    }`}
                  />
                  <motion.div
                    initial={{ scale: 0.8, opacity: 0.6 }}
                    animate={{ scale: 2.2, opacity: 0 }}
                    transition={{ duration: 1.6, repeat: Infinity, ease: "easeOut", delay: 0.4 }}
                    className={`absolute w-36 h-36 rounded-full ${
                      agentState === 'listening' ? 'bg-rose-500/20' : 'bg-teal-400/20'
                    }`}
                  />
                </>
              )}
            </AnimatePresence>

            {/* Glowing Main Orb */}
            <motion.button
              onClick={() => {
                if (agentState === 'listening') {
                  stopListening();
                } else if (agentState === 'speaking') {
                  stopAudioPlayback();
                } else {
                  startListening();
                }
              }}
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.95 }}
              className={`w-36 h-36 rounded-full cursor-pointer relative z-10 flex flex-col items-center justify-center transition-all duration-500 shadow-2xl border-4 ${
                agentState === 'listening'
                  ? 'bg-gradient-to-tr from-rose-600 via-pink-500 to-amber-500 border-rose-300 shadow-rose-500/40 animate-pulse'
                  : agentState === 'thinking'
                  ? 'bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 border-teal-300 shadow-teal-500/40 animate-spin-slow'
                  : agentState === 'speaking'
                  ? 'bg-gradient-to-tr from-emerald-500 via-teal-400 to-emerald-600 border-emerald-200 shadow-emerald-500/50'
                  : 'bg-gradient-to-tr from-slate-900 via-emerald-950 to-slate-900 border-emerald-500/40 hover:border-emerald-400 shadow-emerald-950/50'
              }`}
            >
              {agentState === 'listening' ? (
                <div className="flex flex-col items-center text-white">
                  <Mic className="w-10 h-10 animate-bounce" />
                  <span className="text-[10px] font-black tracking-widest uppercase mt-1">TAP TO STOP</span>
                </div>
              ) : agentState === 'thinking' ? (
                <div className="flex flex-col items-center text-white">
                  <BrainCircuit className="w-10 h-10 animate-pulse" />
                  <span className="text-[9px] font-black tracking-widest uppercase mt-1">VERIFYING</span>
                </div>
              ) : agentState === 'speaking' ? (
                <div className="flex flex-col items-center text-white">
                  <Volume2 className="w-10 h-10 animate-pulse" />
                  <span className="text-[10px] font-black tracking-widest uppercase mt-1">PAUSE</span>
                </div>
              ) : (
                <div className="flex flex-col items-center text-emerald-400 group-hover:text-emerald-300">
                  <Mic className="w-10 h-10" />
                  <span className="text-[10px] font-black tracking-widest uppercase mt-1 text-slate-200">TAP TO SPEAK</span>
                </div>
              )}
            </motion.button>
          </div>

          {/* Visual Waveform Bar indicator */}
          {(agentState === 'listening' || agentState === 'speaking') && (
            <div className="flex items-center justify-center gap-1.5 h-6 my-1">
              {[40, 70, 90, 60, 100, 75, 45, 85, 95, 55, 65, 80].map((h, i) => (
                <motion.div
                  key={i}
                  animate={{ height: [`${h * 0.2}%`, `${h}%`, `${h * 0.3}%`] }}
                  transition={{ duration: 0.6 + (i % 3) * 0.2, repeat: Infinity, ease: "easeInOut" }}
                  className={`w-1 rounded-full ${
                    agentState === 'listening' ? 'bg-rose-400' : 'bg-emerald-400'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Status Message Strip */}
          <div className="h-10 flex items-center justify-center">
            {agentState === 'thinking' ? (
              <motion.p 
                initial={{ opacity: 0, y: 4 }} 
                animate={{ opacity: 1, y: 0 }}
                className="text-xs font-mono font-bold text-teal-400 flex items-center gap-1.5"
              >
                <span className="w-2 h-2 rounded-full bg-teal-400 animate-ping inline-block" />
                <span>{thinkingStep || "Verifying with Gemini AI..."}</span>
              </motion.p>
            ) : agentState === 'listening' ? (
              <p className="text-xs font-mono font-bold text-rose-400 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-rose-400 animate-ping inline-block" />
                <span>Listening actively... Speak clearly</span>
              </p>
            ) : agentState === 'speaking' ? (
              <div className="flex items-center gap-2 text-xs font-mono text-emerald-400">
                <span className="flex gap-0.5">
                  <span className="w-1 h-3 bg-emerald-400 animate-pulse" />
                  <span className="w-1 h-4 bg-emerald-400 animate-pulse delay-75" />
                  <span className="w-1 h-2 bg-emerald-400 animate-pulse delay-150" />
                  <span className="w-1 h-5 bg-emerald-400 animate-pulse delay-100" />
                </span>
                <span>Speaking verified agronomic guidance...</span>
              </div>
            ) : (
              <p className="text-xs text-slate-400">
                Press the microphone orb to ask a question hands-free.
              </p>
            )}
          </div>

          {/* Quick Voice Settings & Auto-Speak Switch */}
          <div className="w-full pt-4 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={autoSpeak}
                onChange={(e) => setAutoSpeak(e.target.checked)}
                className="accent-emerald-500 rounded cursor-pointer"
              />
              <span>Auto-Speak Answers</span>
            </label>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-mono">Speed:</span>
              <button
                onClick={() => setAudioSpeed(s => s === 1.0 ? 1.25 : s === 1.25 ? 0.9 : 1.0)}
                className="text-[10px] font-mono font-bold bg-slate-800 text-emerald-400 px-2 py-0.5 rounded border border-slate-700 hover:bg-slate-700"
              >
                {audioSpeed}x
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: Interactive Text Input & Verification Workspace */}
        <div className="lg:col-span-7 space-y-5">
          {/* Direct Query Input Box */}
          <div className={`rounded-3xl border p-5 shadow-lg transition-all ${
            theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
          }`}>
            <div className="flex justify-between items-center mb-3">
              <label className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
                <HelpCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Ask or Edit Voice Doubt Query</span>
              </label>

              {queryText && (
                <button
                  onClick={() => setQueryText("")}
                  className="text-[10px] text-slate-400 hover:text-rose-400 transition cursor-pointer"
                >
                  Clear Text
                </button>
              )}
            </div>

            <div className="relative">
              <textarea
                rows={3}
                value={queryText}
                onChange={(e) => setQueryText(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleVerifyDoubt();
                  }
                }}
                placeholder={
                  selectedLanguage === 'te' 
                    ? "మీ వ్యవసాయ సందేహాన్ని ఇక్కడ టైప్ చేయండి లేదా మాట్లాడండి (ఉదా: జింక్, డీఏపీ ఒకేసారి పిచికారీ చేయవచ్చా?)..."
                    : selectedLanguage === 'hi'
                    ? "अपनी कृषि शंका यहाँ टाइप करें या बोलें (उदा: क्या जिंक और DAP एक साथ मिला सकते हैं?)..."
                    : "Type or speak your farming doubt (e.g. Can I mix Zinc Sulphate with DAP? Is it safe to spray before rain?)..."
                }
                className={`w-full text-sm rounded-2xl p-4 pr-12 border resize-none focus:outline-none transition ${
                  theme === 'dark' 
                    ? 'bg-slate-950 border-slate-800 text-white focus:border-emerald-500 placeholder-slate-500' 
                    : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-emerald-600 placeholder-slate-400'
                }`}
              />

              <button
                onClick={() => handleVerifyDoubt()}
                disabled={!queryText.trim() || agentState === 'thinking'}
                className="absolute right-3 bottom-3 p-2.5 rounded-xl bg-emerald-500 text-slate-950 font-bold hover:bg-emerald-400 disabled:opacity-40 disabled:cursor-not-allowed transition shadow-md cursor-pointer"
                title="Verify Doubt with Gemini AI"
              >
                <Send className="w-4 h-4" />
              </button>
            </div>

            {/* Quick Voice Question Presets */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <span className="text-[10px] font-mono font-bold text-slate-400 uppercase tracking-wider block mb-2">
                ⚡ Frequent Agronomic Doubts (Tap to Verify):
              </span>
              <div className="flex flex-wrap gap-2">
                {PRESET_DOUBTS.filter(p => p.lang === selectedLanguage || (selectedLanguage === 'en' && p.lang === 'en')).map((preset) => (
                  <button
                    key={preset.id}
                    onClick={() => {
                      setQueryText(preset.query);
                      handleVerifyDoubt(preset.query);
                    }}
                    className={`text-xs px-3 py-1.5 rounded-xl border flex items-center gap-1.5 transition cursor-pointer ${
                      theme === 'dark'
                        ? 'bg-slate-950 border-slate-800 text-slate-300 hover:border-emerald-500/60 hover:text-emerald-300'
                        : 'bg-slate-100 border-slate-200 text-slate-700 hover:border-emerald-600 hover:text-emerald-700'
                    }`}
                  >
                    <span>{preset.icon}</span>
                    <span className="font-semibold">{preset.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* VERIFIED RESULT CARD */}
          <AnimatePresence>
            {currentResult && (
              <motion.div
                ref={resultCardRef}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-3xl border p-6 shadow-xl space-y-5 transition-all ${
                  theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
                }`}
              >
                {/* Result Top Badge Strip */}
                <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                  <div className="flex items-center gap-2.5 flex-wrap">
                    {(() => {
                      const badge = getVerdictBadge(currentResult.verdict);
                      const IconComponent = badge.icon;
                      return (
                        <span className={`px-3 py-1 rounded-full text-xs font-black font-mono border flex items-center gap-1.5 shadow-xs ${badge.color}`}>
                          <IconComponent className="w-4 h-4" />
                          <span>{badge.label}</span>
                        </span>
                      );
                    })()}
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-md border border-emerald-800/60 font-bold">
                      {currentResult.confidence}% Scientific Match
                    </span>
                    {currentResult.chemicalCompatibility && (
                      <span className={`text-[10px] font-mono font-bold px-2 py-0.5 rounded-md border ${getCompatibilityBadge(currentResult.chemicalCompatibility).color}`}>
                        {getCompatibilityBadge(currentResult.chemicalCompatibility).label}
                      </span>
                    )}
                  </div>

                  {/* Audio & Export Controls */}
                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleCopyPrescription}
                      title="Copy agronomic prescription"
                      className={`p-2 rounded-xl border transition cursor-pointer text-xs font-bold flex items-center gap-1 ${
                        isCopied 
                          ? 'bg-emerald-500 text-slate-950 border-emerald-400' 
                          : theme === 'dark' ? 'bg-slate-800 border-slate-700 text-slate-300 hover:text-white' : 'bg-slate-100 border-slate-300 text-slate-700'
                      }`}
                    >
                      {isCopied ? <CheckCheck className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      <span className="text-[11px]">{isCopied ? "Copied" : "Copy"}</span>
                    </button>

                    <button
                      onClick={() => handlePlayVoiceResponse(currentResult)}
                      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl font-bold text-xs transition cursor-pointer shadow-xs ${
                        agentState === 'speaking'
                          ? 'bg-rose-500 text-white animate-pulse'
                          : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                      }`}
                    >
                      {agentState === 'speaking' ? (
                        <>
                          <Pause className="w-3.5 h-3.5" />
                          <span>Stop Voice</span>
                        </>
                      ) : (
                        <>
                          <Volume2 className="w-3.5 h-3.5" />
                          <span>Listen (Gemini Voice)</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>

                {/* Question Quote */}
                <div className={`p-3.5 rounded-2xl border text-xs font-medium italic ${
                  theme === 'dark' ? 'bg-slate-950/80 border-slate-800 text-slate-300' : 'bg-slate-50 border-slate-200 text-slate-600'
                }`}>
                  <span className="font-bold text-emerald-400 not-italic">Farmer Question: </span>
                  "{currentResult.query}"
                </div>

                {/* Spoken Voice Script Card */}
                <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-950/50 via-teal-950/40 to-slate-950 border border-emerald-800/60">
                  <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-widest mb-1.5">
                    <Volume2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Gemini Spoken Guidance</span>
                  </div>
                  <p className="text-sm font-semibold text-emerald-100 leading-relaxed">
                    {currentResult.spokenResponse}
                  </p>
                </div>

                {/* PREDICTIVE AGRONOMIC METRIC CARDS */}
                {(currentResult.predictedYieldImpact || currentResult.costSavingEstimate || currentResult.optimalApplicationWindow) && (
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    {/* Yield Prediction Impact */}
                    {currentResult.predictedYieldImpact && (
                      <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
                        theme === 'dark' ? 'bg-emerald-950/25 border-emerald-800/40' : 'bg-emerald-50 border-emerald-200'
                      }`}>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-emerald-400 uppercase tracking-wider mb-1">
                          <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                          <span>Yield Impact Prediction</span>
                        </div>
                        <p className={`text-xs font-semibold leading-snug ${theme === 'dark' ? 'text-emerald-200' : 'text-emerald-950'}`}>
                          {currentResult.predictedYieldImpact}
                        </p>
                      </div>
                    )}

                    {/* Cost Saving Potential */}
                    {currentResult.costSavingEstimate && (
                      <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
                        theme === 'dark' ? 'bg-teal-950/25 border-teal-800/40' : 'bg-teal-50 border-teal-200'
                      }`}>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-teal-400 uppercase tracking-wider mb-1">
                          <Coins className="w-3.5 h-3.5 text-teal-400" />
                          <span>Cost Saving Potential</span>
                        </div>
                        <p className={`text-xs font-semibold leading-snug ${theme === 'dark' ? 'text-teal-200' : 'text-teal-950'}`}>
                          {currentResult.costSavingEstimate}
                        </p>
                      </div>
                    )}

                    {/* Optimal Window & Weather dependency */}
                    {currentResult.optimalApplicationWindow && (
                      <div className={`p-3.5 rounded-2xl border flex flex-col justify-between ${
                        theme === 'dark' ? 'bg-sky-950/25 border-sky-800/40' : 'bg-sky-50 border-sky-200'
                      }`}>
                        <div className="flex items-center gap-1.5 text-[10px] font-mono font-bold text-sky-400 uppercase tracking-wider mb-1">
                          <CloudSunRain className="w-3.5 h-3.5 text-sky-400" />
                          <span>Optimal Spray Window</span>
                        </div>
                        <p className={`text-xs font-semibold leading-snug ${theme === 'dark' ? 'text-sky-200' : 'text-sky-950'}`}>
                          {currentResult.optimalApplicationWindow}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* BIOLOGICAL MECHANISM / SCIENCE CARD */}
                {currentResult.biologicalMechanism && (
                  <div className={`p-4 rounded-2xl border ${
                    theme === 'dark' ? 'bg-slate-950/70 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}>
                    <h5 className="text-[11px] font-mono font-bold text-amber-400 flex items-center gap-1.5 mb-1.5 uppercase tracking-wider">
                      <Dna className="w-3.5 h-3.5 text-amber-400" />
                      <span>Agronomic & Biochemical Mechanism</span>
                    </h5>
                    <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                      {currentResult.biologicalMechanism}
                    </p>
                  </div>
                )}

                {/* In-Depth Agronomic Explanation */}
                <div>
                  <h4 className="text-xs font-bold font-mono text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-1.5">
                    <Lightbulb className="w-3.5 h-3.5 text-amber-400" />
                    <span>Scientific Guidance & Field Directives</span>
                  </h4>
                  <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                    {currentResult.detailedExplanation}
                  </p>
                </div>

                {/* Do's & Don'ts Checklist */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1">
                  <div className={`p-4 rounded-2xl border ${
                    theme === 'dark' ? 'bg-emerald-950/20 border-emerald-800/50' : 'bg-emerald-50 border-emerald-200'
                  }`}>
                    <h5 className="text-xs font-extrabold text-emerald-400 flex items-center gap-1.5 mb-2 font-mono uppercase">
                      <Check className="w-4 h-4 text-emerald-500" />
                      <span>Recommended Practices (Do's)</span>
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {currentResult.keyDirectives.dos.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-emerald-400 font-bold">•</span>
                          <span className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className={`p-4 rounded-2xl border ${
                    theme === 'dark' ? 'bg-rose-950/20 border-rose-800/50' : 'bg-rose-50 border-rose-200'
                  }`}>
                    <h5 className="text-xs font-extrabold text-rose-400 flex items-center gap-1.5 mb-2 font-mono uppercase">
                      <X className="w-4 h-4 text-rose-500" />
                      <span>Critical Don'ts / Prohibitions</span>
                    </h5>
                    <ul className="space-y-1.5 text-xs text-slate-300">
                      {currentResult.keyDirectives.donts.map((item, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <span className="text-rose-400 font-bold">•</span>
                          <span className={theme === 'dark' ? 'text-slate-200' : 'text-slate-800'}>{item}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* ORGANIC ALTERNATIVE BIO-SOLUTION CARD (IF APPLICABLE) */}
                {currentResult.alternativeOrganicSolution && (
                  <div className={`p-4 rounded-2xl border ${
                    theme === 'dark' ? 'bg-emerald-950/15 border-emerald-800/40' : 'bg-emerald-50/80 border-emerald-200'
                  }`}>
                    <h5 className="text-[11px] font-mono font-bold text-emerald-400 flex items-center gap-1.5 mb-1 uppercase tracking-wider">
                      <Leaf className="w-3.5 h-3.5 text-emerald-400" />
                      <span>Eco-Friendly Organic / Bio Alternative</span>
                    </h5>
                    <p className={`text-xs leading-relaxed ${theme === 'dark' ? 'text-slate-300' : 'text-slate-700'}`}>
                      {currentResult.alternativeOrganicSolution}
                    </p>
                  </div>
                )}

                {/* Footer Metadata */}
                <div className="pt-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[10px] font-mono text-slate-400 gap-2">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-teal-400" />
                    <span>Action Window: <strong className="text-slate-200">{currentResult.actionTimeline}</strong></span>
                  </span>

                  {currentResult.weatherDependencyFactor && (
                    <span className="text-sky-300">
                      Weather: {currentResult.weatherDependencyFactor}
                    </span>
                  )}

                  <span className="text-emerald-400/80 font-bold">
                    Engine: {currentResult.sourceEngine}
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* SESSION VERIFICATION HISTORY */}
      {history.length > 0 && (
        <div className={`rounded-3xl border p-6 shadow-xl space-y-4 ${
          theme === 'dark' ? 'bg-slate-900 border-slate-800 text-white' : 'bg-white border-slate-200 text-slate-900'
        }`}>
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <h3 className="text-xs font-bold font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <RotateCcw className="w-3.5 h-3.5 text-emerald-400" />
              <span>Recent Voice Doubt Verifications ({history.length})</span>
            </h3>
            <button
              onClick={() => { setHistory([]); onNotify("History cleared", "info"); }}
              className="text-[10px] text-slate-400 hover:text-rose-400 transition cursor-pointer"
            >
              Clear Log
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {history.map((item) => {
              const badge = getVerdictBadge(item.verdict);
              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setCurrentResult(item);
                    if (autoSpeak && !isAudioMuted) {
                      handlePlayVoiceResponse(item);
                    }
                  }}
                  className={`p-3.5 rounded-2xl border transition cursor-pointer hover:border-emerald-500/50 flex flex-col justify-between gap-2 ${
                    currentResult?.id === item.id 
                      ? 'bg-emerald-950/30 border-emerald-500/60' 
                      : theme === 'dark' ? 'bg-slate-950/60 border-slate-800' : 'bg-slate-50 border-slate-200'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2">
                    <span className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded-full border ${badge.color}`}>
                      {badge.label}
                    </span>
                    <span className="text-[10px] font-mono text-slate-400">
                      {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                    </span>
                  </div>

                  <p className="text-xs font-semibold text-slate-200 line-clamp-2">
                    "{item.query}"
                  </p>

                  <div className="flex items-center justify-between text-[10px] font-mono text-emerald-400 pt-1">
                    <span>{item.category}</span>
                    <span className="flex items-center gap-1 font-bold hover:underline">
                      <Play className="w-2.5 h-2.5" /> Replay Voice
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
