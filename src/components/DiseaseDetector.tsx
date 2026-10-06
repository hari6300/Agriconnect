import React, { useState } from "react";
import { PlantDiagnosis } from "../types";
import { Sparkles, Upload, FileText, CheckCircle, ShieldAlert, BookOpen, AlertTriangle, Key, Cpu, Leaf, Plus } from "lucide-react";
import { motion } from "motion/react";

interface DiseaseDetectorProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

// Preset samples with nice descriptive icons for farmers to test the system instantly
const PRESET_PLANTS = [
  { id: "tomato-early-blight", name: "Tomato", issue: "Early Blight spots", label: "🍅 Tomato Leaf (Infected)" },
  { id: "rice-blast", name: "Rice (Paddy)", issue: "Diamond lesions", label: "🌾 Rice Leaf (Infected)" },
  { id: "wheat-rust", name: "Wheat", issue: "Yellow linear stripes", label: "🌾 Wheat Leaf (Infected)" },
  { id: "corn-healthy", name: "Maize (Corn)", issue: "Healthy plant", label: "🌽 Maize Leaf (Healthy)" },
];

export default function DiseaseDetector({ onNotify }: DiseaseDetectorProps) {
  const [imageBase64, setImageBase64] = useState<string | null>(null);
  const [symptomsDescription, setSymptomsDescription] = useState("");
  const [selectedPresetId, setSelectedPresetId] = useState<string>("");
  const [isDiagnosing, setIsDiagnosing] = useState(false);
  const [diagnosis, setDiagnosis] = useState<PlantDiagnosis | null>(null);
  const [engineSource, setEngineSource] = useState("");
  const [engineNotice, setEngineNotice] = useState("");

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      onNotify("Image size must be smaller than 5MB.", "error");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setImageBase64(reader.result as string);
      setSelectedPresetId(""); // Clear preset if a custom image is uploaded
      onNotify("Custom plant leaf image selected successfully.", "success");
    };
    reader.onerror = () => {
      onNotify("Failed to read image file.", "error");
    };
    reader.readAsDataURL(file);
  };

  const handleSelectPreset = (id: string) => {
    setSelectedPresetId(id);
    setImageBase64(null); // Clear custom image
  };

  const handleRunDiagnosis = async () => {
    if (!selectedPresetId && !imageBase64 && !symptomsDescription.trim()) {
      onNotify("Please select a preset sample, upload an image, or describe symptoms.", "error");
      return;
    }

    setIsDiagnosing(true);
    setDiagnosis(null);
    setEngineNotice("");
    setEngineSource("");

    try {
      const res = await fetch("/api/disease-detect", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          imageBase64: imageBase64,
          sampleId: selectedPresetId || null,
          symptomsDescription: symptomsDescription
        })
      });

      if (res.ok) {
        const data = await res.json();
        setDiagnosis(data.diagnosis);
        setEngineSource(data.source);
        if (data.notice) {
          setEngineNotice(data.notice);
        }
        onNotify("Diagnosis complete!", "success");
      } else {
        onNotify("Diagnosis failed. Try again.", "error");
      }
    } catch (e) {
      onNotify("Server connectivity issue.", "error");
    } finally {
      setIsDiagnosing(false);
    }
  };

  const handleClear = () => {
    setImageBase64(null);
    setSymptomsDescription("");
    setSelectedPresetId("");
    setDiagnosis(null);
  };

  return (
    <div className="space-y-6">
      {/* Informative Header Banner */}
      <div className="bg-gradient-to-r from-emerald-800 to-teal-800 text-white p-5 rounded-2xl shadow-sm">
        <div className="flex items-center space-x-2">
          <Sparkles className="w-5 h-5 text-amber-300 animate-pulse" />
          <h3 className="text-sm font-bold font-sans">AgriConnect AI Plant Pathologist</h3>
        </div>
        <p className="text-xs text-emerald-100 mt-1.5 leading-relaxed">
          Diagnose crop infections, viral leaf spots, or blights instantly. Select a verified sample to test the diagnostic system, or upload your own leaf photos to query our server-side Gemini 3.5 Flash model.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Input panel */}
        <div className="lg:col-span-1 bg-white border border-zinc-200 rounded-2xl p-5 space-y-5">
          <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest">Input Leaf Data</h3>

          {/* Preset Selector */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2">Test with Preset Samples:</label>
            <div className="grid grid-cols-2 gap-2">
              {PRESET_PLANTS.map(p => (
                <button
                  key={p.id}
                  type="button"
                  onClick={() => handleSelectPreset(p.id)}
                  className={`text-left text-xs p-2.5 rounded-xl border transition cursor-pointer ${
                    selectedPresetId === p.id
                      ? "bg-emerald-50 text-emerald-800 border-emerald-500 font-medium"
                      : "bg-zinc-50 text-zinc-600 border-zinc-200 hover:bg-zinc-100"
                  }`}
                >
                  <span className="block truncate">{p.label}</span>
                  <span className="text-[10px] text-zinc-400 block truncate mt-0.5">{p.issue}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="relative flex py-1 items-center">
            <div className="flex-grow border-t border-zinc-200"></div>
            <span className="flex-shrink mx-3 text-[10px] text-zinc-400 font-mono font-bold uppercase">Or custom upload</span>
            <div className="flex-grow border-t border-zinc-200"></div>
          </div>

          {/* Upload panel */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-2">Upload Crop Photo:</label>
            <div className="border-2 border-dashed border-zinc-200 rounded-2xl p-5 hover:border-emerald-500 transition text-center relative group">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {imageBase64 ? (
                <div className="space-y-2">
                  <img
                    src={imageBase64}
                    alt="Uploaded leaf"
                    className="max-h-28 mx-auto rounded-xl object-cover border border-zinc-200"
                  />
                  <span className="text-[10px] text-emerald-700 font-semibold block">Custom photo selected</span>
                </div>
              ) : (
                <div className="space-y-1">
                  <Upload className="w-8 h-8 text-zinc-300 mx-auto group-hover:text-emerald-500 transition" />
                  <span className="text-xs text-zinc-500 font-medium block">Click or Drag Image</span>
                  <span className="text-[10px] text-zinc-400 block">JPEG, PNG up to 5MB</span>
                </div>
              )}
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold text-zinc-700 mb-1.5">Describe Plant Symptoms (Optional):</label>
            <textarea
              placeholder="e.g., Yellowing tips, concentric dark rings on lower leaves, dry brown spots..."
              rows={3}
              className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600 text-zinc-700"
              value={symptomsDescription}
              onChange={e => {
                setSymptomsDescription(e.target.value);
                if (selectedPresetId) setSelectedPresetId(""); // Clear preset if custom description is added
              }}
            />
          </div>

          {/* Diagnosis Trigger Buttons */}
          <div className="flex space-x-2 pt-2">
            <button
              type="button"
              onClick={handleClear}
              className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-600 font-semibold py-2 rounded-xl text-xs transition"
            >
              Clear
            </button>
            <button
              type="button"
              onClick={handleRunDiagnosis}
              disabled={isDiagnosing}
              className="flex-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold py-2 rounded-xl text-xs transition flex items-center justify-center space-x-1 shadow-sm cursor-pointer disabled:opacity-50"
            >
              <Cpu className="w-3.5 h-3.5 animate-spin" style={{ animationDuration: isDiagnosing ? "2s" : "0s" }} />
              <span>{isDiagnosing ? "Scanning Leaf..." : "Run Diagnosis"}</span>
            </button>
          </div>
        </div>

        {/* Diagnosis Result panel */}
        <div className="lg:col-span-2 bg-white border border-zinc-200 rounded-2xl p-5 min-h-[400px] flex flex-col justify-between">
          {isDiagnosing ? (
            <div className="flex flex-col items-center justify-center flex-grow py-16">
              <div className="relative">
                <Leaf className="w-12 h-12 text-emerald-600 animate-spin" style={{ animationDuration: "3s" }} />
                <Sparkles className="w-4 h-4 text-amber-400 absolute -top-1 -right-1 animate-ping" />
              </div>
              <h4 className="text-sm font-semibold text-zinc-700 mt-4">Analyzing plant pathology...</h4>
              <p className="text-[11px] text-zinc-400 max-w-xs text-center mt-1">
                Matching visual symptoms, compiling remedies, and generating treatment guides.
              </p>
            </div>
          ) : diagnosis ? (
            /* Analysis Display Panel */
            <div className="space-y-6">
              {/* Header result */}
              <div className="flex justify-between items-start gap-4 pb-4 border-b border-zinc-100">
                <div>
                  <span className="text-[10px] font-mono uppercase bg-emerald-50 text-emerald-700 px-2.5 py-0.5 rounded-md border border-emerald-100">
                    Host Plant: {diagnosis.plantName}
                  </span>
                  <h3 className="text-base font-extrabold text-zinc-800 mt-1.5">{diagnosis.diseaseName}</h3>
                  <div className="flex items-center space-x-2 mt-2">
                    <span className="text-xs text-zinc-400">Diagnostic confidence:</span>
                    <strong className="text-xs text-emerald-700 font-mono">{diagnosis.confidence}%</strong>
                    <div className="w-20 bg-zinc-100 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-emerald-600 h-full" style={{ width: `${diagnosis.confidence}%` }}></div>
                    </div>
                  </div>
                </div>

                {/* Engine indicator */}
                <div className="text-right shrink-0">
                  <span className="text-[10px] font-mono text-zinc-400 block">{diagnosis.diagnosedAt}</span>
                  <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50/50 px-2 py-0.5 rounded-full border border-emerald-100 block mt-1">
                    🧬 {engineSource}
                  </span>
                </div>
              </div>

              {/* Notice Banner */}
              {engineNotice && (
                <div className="bg-amber-50 border border-amber-200 text-[11px] text-amber-900 rounded-xl p-3 flex items-start space-x-2 leading-relaxed">
                  <Key className="w-3.5 h-3.5 text-amber-600 shrink-0 mt-0.5" />
                  <span>{engineNotice}</span>
                </div>
              )}

              {/* Diagnosis details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Symptoms & Causes */}
                <div className="space-y-4">
                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                    <h4 className="text-xs font-bold text-zinc-800 mb-2 flex items-center space-x-1.5">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>Observed Symptoms</span>
                    </h4>
                    <ul className="space-y-1.5">
                      {diagnosis.symptoms.map((sym, i) => (
                        <li key={i} className="text-xs text-zinc-600 flex items-start space-x-1.5">
                          <span className="text-emerald-600 mt-0.5">•</span>
                          <span>{sym}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-zinc-50 p-4 rounded-xl border border-zinc-100">
                    <h4 className="text-xs font-bold text-zinc-800 mb-2 flex items-center space-x-1.5">
                      <AlertTriangle className="w-3.5 h-3.5 text-zinc-500" />
                      <span>Pathogen / Environmental Causes</span>
                    </h4>
                    <ul className="space-y-1.5">
                      {diagnosis.causes.map((cau, i) => (
                        <li key={i} className="text-xs text-zinc-600 flex items-start space-x-1.5">
                          <span className="text-zinc-400 mt-0.5">•</span>
                          <span>{cau}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Treatment / Remedies */}
                <div className="space-y-4">
                  <div className="border border-zinc-200 rounded-xl overflow-hidden">
                    <div className="bg-emerald-50 p-2.5 border-b border-zinc-200">
                      <h4 className="text-xs font-bold text-emerald-950 flex items-center space-x-1.5">
                        <Leaf className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Organic Care & Control</span>
                      </h4>
                    </div>
                    <div className="p-3.5 space-y-2">
                      {diagnosis.remedies.organic.map((org, i) => (
                        <p key={i} className="text-xs text-zinc-600 leading-relaxed">• {org}</p>
                      ))}
                    </div>
                  </div>

                  {diagnosis.remedies.chemical && diagnosis.remedies.chemical.length > 0 && (
                    <div className="border border-zinc-200 rounded-xl overflow-hidden">
                      <div className="bg-rose-50/50 p-2.5 border-b border-zinc-200">
                        <h4 className="text-xs font-bold text-rose-950 flex items-center space-x-1.5">
                          <ShieldAlert className="w-3.5 h-3.5 text-rose-600" />
                          <span>Chemical Treatment (Strictly as Directed)</span>
                        </h4>
                      </div>
                      <div className="p-3.5 space-y-2">
                        {diagnosis.remedies.chemical.map((chem, i) => (
                          <p key={i} className="text-xs text-zinc-600 leading-relaxed">• {chem}</p>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className="border border-zinc-200 rounded-xl overflow-hidden">
                    <div className="bg-zinc-100 p-2.5 border-b border-zinc-200">
                      <h4 className="text-xs font-bold text-zinc-800 flex items-center space-x-1.5">
                        <BookOpen className="w-3.5 h-3.5 text-zinc-500" />
                        <span>Long-term Preventive Strategies</span>
                      </h4>
                    </div>
                    <div className="p-3.5 space-y-2">
                      {diagnosis.remedies.preventive.map((prev, i) => (
                        <p key={i} className="text-xs text-zinc-600 leading-relaxed">• {prev}</p>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Standby panel */
            <div className="flex flex-col items-center justify-center flex-grow py-16 text-center">
              <Leaf className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-zinc-600">No Leaf Selected</h4>
              <p className="text-xs text-zinc-400 max-w-sm mt-1">
                Select one of the quick test presets or select your custom crop foliage photo from your camera roll, then trigger diagnosis to test AI crop path detection.
              </p>
            </div>
          )}

          {/* Footnotes */}
          <div className="text-[10px] text-zinc-400 mt-6 pt-3 border-t border-zinc-100 leading-relaxed">
            * Note: These recommendations are for informational purposes. Double-check symptoms with local agricultural university extensions before heavy chemical applications.
          </div>
        </div>
      </div>
    </div>
  );
}
