import React, { useState, useEffect } from "react";
import { Crop } from "../types";
import { Sprout, Calendar, Droplets, Trash2, Plus, Info, Check, PlusCircle, Scale, Trees } from "lucide-react";
import { motion } from "motion/react";

interface CropManagerProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

const GROWTH_STAGES = ['Planted', 'Sprouting', 'Vegetative', 'Flowering', 'Harvest Ready', 'Harvested'] as const;

export default function CropManager({ onNotify }: CropManagerProps) {
  const [crops, setCrops] = useState<Crop[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddForm, setShowAddForm] = useState(false);

  // New crop form state
  const [newCrop, setNewCrop] = useState<Partial<Crop>>({
    name: "",
    variety: "",
    plantingDate: new Date().toISOString().split("T")[0],
    expectedHarvestDate: "",
    stage: "Planted",
    waterStatus: "Optimal",
    waterIntervalDays: 7,
    notes: "",
    areaAcres: 1,
    expectedYieldKg: 100
  });

  const fetchCrops = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/crops");
      if (res.ok) {
        const data = await res.json();
        setCrops(data);
      }
    } catch (e) {
      onNotify("Failed to fetch crops list.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchCrops();
  }, []);

  const handleWaterCrop = async (id: string) => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const res = await fetch(`/api/crops/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lastWatered: today,
          waterStatus: "Optimal"
        })
      });
      if (res.ok) {
        onNotify("Crop irrigation updated successfully!", "success");
        fetchCrops();
      }
    } catch (e) {
      onNotify("Failed to irrigate crop.", "error");
    }
  };

  const handleUpdateStage = async (id: string, stage: Crop['stage']) => {
    try {
      const res = await fetch(`/api/crops/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage })
      });
      if (res.ok) {
        onNotify(`Crop stage updated to ${stage}!`, "success");
        fetchCrops();
      }
    } catch (e) {
      onNotify("Failed to update growth stage.", "error");
    }
  };

  const handleCreateCrop = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCrop.name || !newCrop.variety) {
      onNotify("Please fill out the crop name and variety.", "error");
      return;
    }

    // Auto-calculate expected harvest date if not provided (default 90 days)
    let harvestDate = newCrop.expectedHarvestDate;
    if (!harvestDate && newCrop.plantingDate) {
      const pDate = new Date(newCrop.plantingDate);
      pDate.setDate(pDate.getDate() + 90);
      harvestDate = pDate.toISOString().split("T")[0];
    }

    try {
      const res = await fetch("/api/crops", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...newCrop,
          expectedHarvestDate: harvestDate,
          waterStatus: "Optimal",
          lastWatered: newCrop.plantingDate
        })
      });
      if (res.ok) {
        onNotify(`${newCrop.name} planted successfully!`, "success");
        setNewCrop({
          name: "",
          variety: "",
          plantingDate: new Date().toISOString().split("T")[0],
          expectedHarvestDate: "",
          stage: "Planted",
          waterStatus: "Optimal",
          waterIntervalDays: 7,
          notes: "",
          areaAcres: 1,
          expectedYieldKg: 100
        });
        setShowAddForm(false);
        fetchCrops();
      }
    } catch (e) {
      onNotify("Failed to record new crop planting.", "error");
    }
  };

  const handleDeleteCrop = async (id: string) => {
    if (!confirm("Are you sure you want to remove this crop from tracking?")) return;
    try {
      const res = await fetch(`/api/crops/${id}`, { method: "DELETE" });
      if (res.ok) {
        onNotify("Crop deleted from logs.", "info");
        fetchCrops();
      }
    } catch (e) {
      onNotify("Failed to delete crop.", "error");
    }
  };

  const getStageColor = (stage: Crop['stage']) => {
    switch (stage) {
      case 'Planted': return 'bg-zinc-100 text-zinc-800 border-zinc-200';
      case 'Sprouting': return 'bg-emerald-50 text-emerald-800 border-emerald-100';
      case 'Vegetative': return 'bg-teal-50 text-teal-800 border-teal-100';
      case 'Flowering': return 'bg-amber-50 text-amber-800 border-amber-100';
      case 'Harvest Ready': return 'bg-green-100 text-green-900 border-green-200 font-bold';
      case 'Harvested': return 'bg-indigo-50 text-indigo-800 border-indigo-100';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const getWaterBadgeColor = (status: Crop['waterStatus']) => {
    switch (status) {
      case 'Optimal': return 'bg-sky-50 text-sky-700 border-sky-100';
      case 'Needs Water': return 'bg-rose-50 text-rose-700 border-rose-100 animate-pulse';
      case 'Drowning': return 'bg-blue-100 text-blue-800 border-blue-200';
    }
  };

  // Calculate metrics
  const totalAcres = crops.reduce((acc, curr) => acc + Number(curr.areaAcres || 0), 0);
  const totalYield = crops.reduce((acc, curr) => acc + Number(curr.expectedYieldKg || 0), 0);
  const dryCrops = crops.filter(c => c.waterStatus === 'Needs Water').length;

  return (
    <div className="space-y-6">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-emerald-50 text-emerald-600">
            <Trees className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Total Area Under Cultivation</p>
            <h4 className="text-2xl font-semibold text-zinc-800 font-sans mt-0.5">{totalAcres.toFixed(1)} Acres</h4>
          </div>
        </div>

        <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-amber-50 text-amber-600">
            <Scale className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Estimated Project Yield</p>
            <h4 className="text-2xl font-semibold text-zinc-800 font-sans mt-0.5">{(totalYield / 1000).toFixed(2)} Metric Tons</h4>
          </div>
        </div>

        <div className="bg-white border border-emerald-100 rounded-2xl p-5 shadow-sm flex items-center space-x-4">
          <div className="p-3 rounded-xl bg-sky-50 text-sky-600">
            <Droplets className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-mono text-zinc-500 uppercase tracking-wider">Crops Requiring Water</p>
            <h4 className="text-2xl font-semibold text-zinc-800 font-sans mt-0.5">
              {dryCrops > 0 ? `${dryCrops} Needs Action` : "All Optimal"}
            </h4>
          </div>
        </div>
      </div>

      {/* Title Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50 p-4 rounded-2xl border border-zinc-200/60">
        <div>
          <h2 className="text-lg font-semibold text-zinc-800 font-sans">Active Fields & Crop Cycles</h2>
          <p className="text-xs text-zinc-500">Track growing stages, watering schedules, and expected yields.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 transition text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm cursor-pointer"
        >
          <PlusCircle className="w-4 h-4" />
          <span>{showAddForm ? "Hide Planner" : "Plant New Crop"}</span>
        </button>
      </div>

      {/* Planting Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-6"
        >
          <h3 className="text-sm font-semibold text-emerald-900 mb-4 flex items-center space-x-2">
            <Sprout className="w-4 h-4 text-emerald-600" />
            <span>Enter Cultivation Details</span>
          </h3>
          <form onSubmit={handleCreateCrop} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Crop Name *</label>
              <input
                type="text"
                required
                placeholder="e.g., Wheat, Potato, Maize"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newCrop.name}
                onChange={e => setNewCrop({ ...newCrop, name: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Variety *</label>
              <input
                type="text"
                required
                placeholder="e.g., Basmati, Roma, PBW-343"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newCrop.variety}
                onChange={e => setNewCrop({ ...newCrop, variety: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Area Cultivated (Acres)</label>
              <input
                type="number"
                step="0.1"
                min="0.1"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newCrop.areaAcres}
                onChange={e => setNewCrop({ ...newCrop, areaAcres: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Sowing/Planting Date</label>
              <input
                type="date"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newCrop.plantingDate}
                onChange={e => setNewCrop({ ...newCrop, plantingDate: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Watering Cycle (Every X Days)</label>
              <input
                type="number"
                min="1"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newCrop.waterIntervalDays}
                onChange={e => setNewCrop({ ...newCrop, waterIntervalDays: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Expected Yield (kg)</label>
              <input
                type="number"
                min="10"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newCrop.expectedYieldKg}
                onChange={e => setNewCrop({ ...newCrop, expectedYieldKg: Number(e.target.value) })}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-zinc-700 mb-1">Notes / Fertilisers Applied</label>
              <textarea
                placeholder="Specify any soil conditioning or scheduled pesticide details..."
                rows={2}
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newCrop.notes}
                onChange={e => setNewCrop({ ...newCrop, notes: e.target.value })}
              />
            </div>
            <div className="md:col-span-3 flex justify-end space-x-2 pt-2">
              <button
                type="button"
                onClick={() => setShowAddForm(false)}
                className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 px-4 py-2 rounded-xl text-sm transition"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-sm font-medium transition"
              >
                Save to Fields
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Loading state */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : crops.length === 0 ? (
        <div className="bg-white border border-zinc-200 text-center py-16 rounded-2xl">
          <Sprout className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
          <h4 className="text-sm font-semibold text-zinc-700">No crops active</h4>
          <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
            Sow your first crop, and track irrigation, watering cycles, and expected harvests directly in your logs.
          </p>
          <button
            onClick={() => setShowAddForm(true)}
            className="mt-4 bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
          >
            Sow Crop Now
          </button>
        </div>
      ) : (
        /* Crop Cards Grid */
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {crops.map((crop) => (
            <div key={crop.id} className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition flex flex-col justify-between">
              <div>
                {/* Header info */}
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-bold text-zinc-800 flex items-center space-x-2">
                      <span>{crop.name}</span>
                      <span className="text-xs font-normal text-zinc-500">({crop.variety})</span>
                    </h3>
                    <div className="flex items-center space-x-3 mt-1.5">
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getStageColor(crop.stage)}`}>
                        🌱 {crop.stage}
                      </span>
                      <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getWaterBadgeColor(crop.waterStatus)} flex items-center space-x-1`}>
                        <Droplets className="w-3 h-3" />
                        <span>{crop.waterStatus}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    onClick={() => handleDeleteCrop(crop.id)}
                    className="p-1.5 rounded-lg text-zinc-400 hover:text-rose-600 hover:bg-rose-50 transition cursor-pointer"
                    title="Delete record"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Growth Stage Progress */}
                <div className="mt-5">
                  <div className="flex justify-between text-[11px] text-zinc-400 font-mono mb-1">
                    <span>Sown: {crop.plantingDate}</span>
                    <span>Proj. Harvest: {crop.expectedHarvestDate}</span>
                  </div>
                  <div className="w-full bg-zinc-100 rounded-full h-2 overflow-hidden flex">
                    {GROWTH_STAGES.map((stg, i) => {
                      const currentIndex = GROWTH_STAGES.indexOf(crop.stage);
                      const isCompletedOrCurrent = i <= currentIndex;
                      return (
                        <div
                          key={stg}
                          className={`h-full flex-1 border-r border-white/40 last:border-0 ${
                            isCompletedOrCurrent
                              ? crop.stage === "Harvest Ready"
                                ? "bg-amber-500"
                                : "bg-emerald-600"
                              : "bg-zinc-200"
                          }`}
                        />
                      );
                    })}
                  </div>
                  {/* Select Stage */}
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs font-medium text-zinc-500">Update Stage:</span>
                    <select
                      className="text-xs border border-zinc-200 rounded-lg bg-zinc-50 px-2 py-1 focus:outline-emerald-600 text-zinc-700"
                      value={crop.stage}
                      onChange={(e) => handleUpdateStage(crop.id, e.target.value as Crop['stage'])}
                    >
                      {GROWTH_STAGES.map(stg => (
                        <option key={stg} value={stg}>{stg}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Details list */}
                <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-zinc-100 text-xs text-zinc-600">
                  <div className="flex items-center space-x-2">
                    <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Area: <strong className="text-zinc-800">{crop.areaAcres} Acres</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Scale className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Est. Yield: <strong className="text-zinc-800">{crop.expectedYieldKg} kg</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Droplets className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Cycle: <strong className="text-zinc-800">Every {crop.waterIntervalDays} days</strong></span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Check className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Irrigated: <strong className="text-zinc-800">{crop.lastWatered}</strong></span>
                  </div>
                </div>

                {crop.notes && (
                  <div className="mt-3 bg-zinc-50 p-2.5 rounded-xl border border-zinc-100 flex items-start space-x-2 text-[11px] text-zinc-500">
                    <Info className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                    <span>{crop.notes}</span>
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center justify-end space-x-2">
                <button
                  onClick={() => handleWaterCrop(crop.id)}
                  className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold px-4 py-2 rounded-xl transition flex items-center space-x-1 cursor-pointer"
                >
                  <Droplets className="w-3.5 h-3.5" />
                  <span>Irrigate Fields</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
