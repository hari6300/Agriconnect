import React, { useState, useEffect } from "react";
import { MarketListing, TelanganaCropPrice } from "../types";
import { ShoppingBag, Tag, Search, Plus, Trash2, MapPin, Phone, Filter, Scale, Check, DollarSign, TrendingUp, TrendingDown, RefreshCw, BrainCircuit, Sparkles, ArrowUpRight, BarChart3, Layers, CheckCircle2 } from "lucide-react";
import { motion } from "motion/react";

interface MarketplaceProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

// Typical reference MSP (Minimum Support Price) or Fair Market Rates for guidance
const GOVERNMENT_BASELINE_PRICES = [
  { item: "Basmati Paddy", rate: "₹3,200 - ₹3,600", unit: "per Quintal", trend: "Stable" },
  { item: "Durum Wheat", rate: "₹2,275 - ₹2,400", unit: "per Quintal", trend: "Upward" },
  { item: "Red Onions", rate: "₹22 - ₹28", unit: "per kg", trend: "Slight Drop" },
  { item: "Turmeric Ground", rate: "₹160 - ₹195", unit: "per kg", trend: "High Demand" },
  { item: "Chana (Bengal Gram)", rate: "₹5,440 - ₹5,800", unit: "per Quintal", trend: "Upward" },
];

export default function Marketplace({ onNotify }: MarketplaceProps) {
  const [listings, setListings] = useState<MarketListing[]>([]);
  const [filteredListings, setFilteredListings] = useState<MarketListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // Telangana & Price Forecast states
  const [telanganaPrices, setTelanganaPrices] = useState<TelanganaCropPrice[]>([]);
  const [telanganaSearch, setTelanganaSearch] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("All");
  const [activePriceTab, setActivePriceTab] = useState<'telangana' | 'forecast' | 'msp'>('telangana');
  const [isRefreshingPrices, setIsRefreshingPrices] = useState(false);

  const [priceSource, setPriceSource] = useState<
  "data.gov.in" | "cache" | "fallback" | "unknown"
>("unknown");

const [priceLastUpdated, setPriceLastUpdated] = useState<string | null>(null);

  // ML Market Price Forecast Regression States
  const [forecastCrop, setForecastCrop] = useState("Paddy (Sona Masuri)");
  const [forecastMarket, setForecastMarket] = useState("Suryapet Mandi");
  const [forecastDays, setForecastDays] = useState(14);
  const [priceForecastResult, setPriceForecastResult] = useState<any>(null);
  const [isPredictingPrice, setIsPredictingPrice] = useState(false);

  const handleRunPriceForecast = async (showNotification = true) => {
    setIsPredictingPrice(true);
    try {
      const res = await fetch("/api/ml/price-forecast", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cropName: forecastCrop,
          marketName: forecastMarket,
          forecastDays
        })
      });
      const data = await res.json();
      setPriceForecastResult(data.forecast);
      if (showNotification) {
        onNotify("Time-series ML commodity price forecast calculated!", "success");
      }
    } catch (e) {
      if (showNotification) {
        onNotify("Failed to calculate price forecast.", "error");
      }
    } finally {
      setIsPredictingPrice(false);
    }
  };

  // Remove auto-execution on tab switch so price forecast only runs on user click

  // New Listing Form State
  const [newListing, setNewListing] = useState<Partial<MarketListing>>({
    sellerName: "",
    sellerContact: "",
    productName: "",
    category: "Grains",
    price: 0,
    unit: "kg",
    quantity: 0,
    description: "",
    location: ""
  });

  const fetchListings = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/marketplace");
      if (res.ok) {
        const data = await res.json();
        setListings(data);
        setFilteredListings(data);
      }
    } catch (e) {
      onNotify("Failed to fetch marketplace listings.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchTelanganaPrices = async (
  silent = false,
  district = selectedDistrict
) => {
  if (!silent) setIsRefreshingPrices(true);

  try {
    const params = new URLSearchParams();

    if (district && district !== "All") {
      params.set("district", district);
    }

    const query = params.toString();

    const res = await fetch(
      `/api/telangana-prices${query ? `?${query}` : ""}`
    );

    if (res.ok) {
      const data = await res.json();

      setTelanganaPrices(data.data || []);
      setPriceSource(data.source || "unknown");
      setPriceLastUpdated(data.lastUpdated || null);
    } else {
      setTelanganaPrices([]);
      setPriceSource("unknown");
      setPriceLastUpdated(null);
    }
  } catch (e) {
    console.error("Failed to fetch Telangana market prices", e);
    setTelanganaPrices([]);
    setPriceSource("unknown");
    setPriceLastUpdated(null);
  } finally {
    if (!silent) setIsRefreshingPrices(false);
  }
};
  useEffect(() => {
  fetchListings();
}, []);

useEffect(() => {
  fetchTelanganaPrices();
}, [selectedDistrict]);

  // Filter listings based on search & category
  useEffect(() => {
    let result = listings;
    if (selectedCategory !== "All") {
      result = result.filter(item => item.category === selectedCategory);
    }
    if (searchQuery.trim() !== "") {
      const query = searchQuery.toLowerCase();
      result = result.filter(item =>
        item.productName.toLowerCase().includes(query) ||
        item.description.toLowerCase().includes(query) ||
        item.location.toLowerCase().includes(query)
      );
    }
    setFilteredListings(result);
  }, [selectedCategory, searchQuery, listings]);

  const handleCreateListing = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newListing.sellerName || !newListing.sellerContact || !newListing.productName || !newListing.price || !newListing.quantity) {
      onNotify("Please complete all required fields.", "error");
      return;
    }

    const cleanContact = (newListing.sellerContact || "").replace(/\D/g, "");
    if (cleanContact.length !== 10) {
      onNotify("Please enter a valid 10-digit Indian mobile number.", "error");
      return;
    }
    if (!/^[6-9]/.test(cleanContact)) {
      onNotify("Indian mobile numbers must start with 6, 7, 8, or 9.", "error");
      return;
    }

    try {
      const res = await fetch("/api/marketplace", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newListing, sellerContact: `+91 ${cleanContact.slice(0, 5)} ${cleanContact.slice(5)}` })
      });
      if (res.ok) {
        onNotify("Produce listed successfully in the market!", "success");
        setNewListing({
          sellerName: "",
          sellerContact: "",
          productName: "",
          category: "Grains",
          price: 0,
          unit: "kg",
          quantity: 0,
          description: "",
          location: ""
        });
        setShowAddForm(false);
        fetchListings();
      }
    } catch (e) {
      onNotify("Failed to post market listing.", "error");
    }
  };

  const handleDeleteListing = async (id: string) => {
    if (!confirm("Remove your produce listing?")) return;
    try {
      const res = await fetch(`/api/marketplace/${id}`, { method: "DELETE" });
      if (res.ok) {
        onNotify("Produce listing removed from market.", "info");
        fetchListings();
      }
    } catch (e) {
      onNotify("Failed to remove listing.", "error");
    }
  };

  const categories = ["All", "Grains", "Vegetables", "Fruits", "Pulses", "Spices", "Others"];

  return (
    <div className="space-y-6">
      {/* Agricultural Price Intelligence containing Telangana Live Crop Variety Index */}
      <div className="bg-white border border-slate-200 rounded-2xl shadow-sm overflow-hidden">
        {/* Tab Selection Bar */}
        <div className="bg-slate-50 border-b border-slate-150 p-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex items-center space-x-2 text-slate-800">
            <Scale className="w-5 h-5 text-emerald-600" />
            <div>
              <h3 className="text-sm font-bold text-slate-800">Agricultural Price Intelligence</h3>
            </div>
          </div>
          <div className="flex bg-slate-200/60 p-1 rounded-xl self-stretch sm:self-auto">
            <button
              onClick={() => setActivePriceTab('telangana')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                activePriceTab === 'telangana'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span>Telangana Latest Mandi Prices</span>
            </button>
            <button
              onClick={() => setActivePriceTab('forecast')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                activePriceTab === 'forecast'
                  ? 'bg-emerald-600 text-white shadow-sm font-bold'
                  : 'text-slate-600 hover:text-emerald-800 bg-emerald-50/80 border border-emerald-200'
              }`}
            >
              <TrendingUp className="w-3.5 h-3.5 text-amber-300" />
              <span>ML Price Forecast</span>
            </button>
            <button
              onClick={() => setActivePriceTab('msp')}
              className={`flex-1 sm:flex-none px-3.5 py-1.5 rounded-lg text-xs font-semibold transition cursor-pointer flex items-center justify-center space-x-1.5 ${
                activePriceTab === 'msp'
                  ? 'bg-white text-emerald-800 shadow-sm'
                  : 'text-slate-500 hover:text-slate-800'
              }`}
            >
              <span>National MSP Support</span>
            </button>
          </div>
        </div>

        {/* Tab 1: Telangana Live Index */}
        {activePriceTab === 'telangana' && (
          <div className="p-5 space-y-4">
            <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
              <div className="text-xs text-slate-500 max-w-md">
  <div>
    Latest mandi prices across markets in Telangana. Select a district
    to view available markets and their prices.
  </div>

  <div className="mt-2 flex items-center gap-2 flex-wrap">
    {priceSource === "data.gov.in" && (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
        Government Data — Latest
      </span>
    )}

    {priceSource === "cache" && (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200 font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
        Cached Government Data
      </span>
    )}

    {priceSource === "fallback" && (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 border border-slate-200 font-semibold">
        <span className="w-1.5 h-1.5 rounded-full bg-slate-400" />
        Demo Fallback Data
      </span>
    )}

    {priceLastUpdated && (
      <span className="text-[11px] text-slate-400">
        Updated: {new Date(priceLastUpdated).toLocaleString("en-IN")}
      </span>
    )}
  </div>
</div></div>
              <div className="flex items-center gap-2 w-full sm:w-auto flex-wrap">
  {/* District Filter */}
  <select
    value={selectedDistrict}
    onChange={(e) => {
      setSelectedDistrict(e.target.value);
      setTelanganaSearch("");
    }}
    className="bg-white border border-slate-200 rounded-lg px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-500"
  >
    <option value="All">All Districts</option>

    {Array.from(
      new Set(
        telanganaPrices
          .map((item) => item.district)
          .filter(Boolean)
      )
    )
      .sort()
      .map((district) => (
        <option key={district} value={district}>
          {district}
        </option>
      ))}
  </select>

  {/* Search */}
  <div className="relative flex-grow sm:flex-grow-0">
    <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />

    <input
      type="text"
      placeholder="Search market or variety..."
      value={telanganaSearch}
      onChange={(e) => setTelanganaSearch(e.target.value)}
      className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-emerald-600 focus:bg-white"
    />
  </div>

  {/* Refresh */}
  <button
    onClick={() => fetchTelanganaPrices()}
    disabled={isRefreshingPrices}
    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-lg transition disabled:opacity-50 cursor-pointer shrink-0"
    title="Refresh prices"
  >
    <RefreshCw
      className={`w-3.5 h-3.5 ${
        isRefreshingPrices
          ? "animate-spin text-emerald-600"
          : ""
      }`}
    />
  </button>
</div>
<div className="flex items-center justify-between mb-3">
  <div className="text-xs font-semibold text-slate-500">
    {telanganaPrices.length}{" "}
    {telanganaPrices.length === 1 ? "market record" : "market records"}
    {selectedDistrict !== "All" && (
      <>
        {" "}in <span className="text-emerald-700">{selectedDistrict}</span>
      </>
    )}
  </div>

  {selectedDistrict !== "All" && (
    <button
      onClick={() => setSelectedDistrict("All")}
      className="text-[11px] font-semibold text-emerald-700 hover:text-emerald-800"
    >
      Show all districts
    </button>
  )}
</div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {telanganaPrices
                .filter(item => {
                  if (!telanganaSearch.trim()) return true;
                  const query = telanganaSearch.toLowerCase();
                  return (
                    item.cropName.toLowerCase().includes(query) ||
                    item.variety.toLowerCase().includes(query) ||
                    item.marketName.toLowerCase().includes(query) ||
                    item.district.toLowerCase().includes(query)
                  );
                })
                .map((price) => {
                  const isUp = price.trend === 'Up';
                  const isDown = price.trend === 'Down';
                  const trendColor = isUp ? 'text-emerald-600 bg-emerald-50' : isDown ? 'text-rose-600 bg-rose-50' : 'text-slate-500 bg-slate-50';
                  
                  return (
                    <motion.div
                      key={price.id}
                      layout
                      className="border border-slate-200 rounded-xl p-4 bg-slate-50/20 hover:border-emerald-500 hover:bg-white transition flex flex-col justify-between"
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100 uppercase">
                            {price.cropName}
                          </span>
                          <span className="text-[9px] font-mono text-slate-400">
                            FAQ Grade: {price.grade}
                          </span>
                        </div>
                        <div>
                          <h4 className="text-xs font-bold text-slate-800 leading-tight">
                            {price.variety}
                          </h4>
                          <p className="text-[10px] text-slate-500 flex items-center mt-1">
                            <MapPin className="w-2.5 h-2.5 mr-1 text-slate-400" />
                            {price.marketName}, {price.district}
                          </p>
                        </div>
                      </div>

                      <div className="pt-3 border-t border-slate-100/80 mt-3 space-y-1.5">
                        <div className="flex justify-between items-end">
                          <div>
                            <span className="text-[9px] text-slate-400 block uppercase font-mono">Modal Price</span>
                            <span className="text-base font-extrabold text-slate-800">
                              ₹{Number(price.modelPrice || 0).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[9px] text-slate-400">/quintal</span>
                          </div>
                          <span className={`flex items-center gap-1 text-[10px] font-bold px-1.5 py-0.5 rounded ${trendColor}`}>
                            {isUp && <TrendingUp className="w-3 h-3" />}
                            {isDown && <TrendingDown className="w-3 h-3" />}
                            <span>{price.trend}</span>
                          </span>
                        </div>

                        <div className="flex justify-between text-[10px] text-slate-500 bg-white border border-slate-100 rounded-lg p-1.5">
                          <div>
                            <span className="text-[8px] text-slate-400 uppercase font-mono block">Range</span>
                            <span className="font-bold font-mono text-slate-700">₹{Number(price.minPrice || 0).toLocaleString('en-IN')} - ₹{Number(price.maxPrice || 0).toLocaleString('en-IN')}</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[8px] text-slate-400 uppercase font-mono block">Arrivals</span>
                            <span className="font-bold font-mono text-slate-700">{Number(price.arrivalsQuintals || 0).toLocaleString('en-IN')} qtl</span>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              {telanganaPrices.filter(item => {
                if (!telanganaSearch.trim()) return true;
                const query = telanganaSearch.toLowerCase();
                return (
                  item.cropName.toLowerCase().includes(query) ||
                  item.variety.toLowerCase().includes(query) ||
                  item.marketName.toLowerCase().includes(query) ||
                  item.district.toLowerCase().includes(query)
                );
              }).length === 0 && (
                <div className="col-span-full py-8 text-center text-xs text-slate-400">
                  No crop varieties matched your search. Try "Paddy", "Cotton", "Warangal", or "Nizamabad".
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: ML Market Price Forecast (Time-Series Regression Model) */}
        {activePriceTab === 'forecast' && (
          <div className="p-5 space-y-6">
            <div className="bg-slate-900 text-white p-5 rounded-2xl border border-emerald-500/30 shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 -mt-10 -mr-10 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
              
              <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    <BrainCircuit className="w-3 h-3 text-emerald-400 animate-pulse" />
                    <span>TIME-SERIES ML REGRESSION ENGINE</span>
                  </div>
                  <h3 className="text-lg font-bold mt-1 text-white">Direct Marketplace Price Forecast & Comparison</h3>
                  <p className="text-xs text-slate-300">
                    Compare real-time spot rates, national support prices, and direct farmer listings with predictive Machine Learning price trends.
                  </p>
                </div>
              </div>

              {/* Controls */}
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 mt-4 pt-4 border-t border-slate-800">
                <div className="md:col-span-4 space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Commodity Variety</label>
                  <select
                    value={forecastCrop}
                    onChange={(e) => setForecastCrop(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-emerald-500"
                  >
                    <option value="Paddy (Sona Masuri)">Paddy - Sona Masuri (వరి బియ్యం)</option>
                    <option value="Cotton (Bunny Bt)">Cotton - Bt Hybrid (పత్తి)</option>
                    <option value="Turmeric (Nizamabad Local)">Turmeric - Nizamabad Grade (పసుపు)</option>
                    <option value="Red Gram (Pigeon Pea)">Red Gram / Pigeon Pea (కందులు)</option>
                    <option value="Chillies (Teja Premium)">Red Chilli - Teja Variety (మిర్చి)</option>
                    <option value="Maize (Deccan Hybrid)">Maize - Hybrid (మొక్కజొన్న)</option>
                  </select>
                </div>

                <div className="md:col-span-4 space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Primary Mandi Market</label>
                  <select
                    value={forecastMarket}
                    onChange={(e) => setForecastMarket(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-white focus:outline-emerald-500"
                  >
                    <option value="Suryapet Mandi">Suryapet Market Yard</option>
                    <option value="Warangal Laxmipuram">Warangal (Laxmipuram)</option>
                    <option value="Khammam Mandi">Khammam Market</option>
                    <option value="Nizamabad Yard">Nizamabad Turmeric Market</option>
                    <option value="Amravati Mandi">Amravati Yard (MH)</option>
                  </select>
                </div>

                <div className="md:col-span-2 space-y-1">
                  <label className="text-[10px] font-mono font-bold uppercase text-slate-400">Horizon</label>
                  <div className="flex gap-1">
                    {[7, 14, 30].map((d) => (
                      <button
                        key={d}
                        type="button"
                        onClick={() => setForecastDays(d)}
                        className={`flex-1 py-2 text-xs font-bold font-mono rounded-lg transition cursor-pointer ${
                          forecastDays === d ? "bg-emerald-500 text-slate-950" : "bg-slate-800 text-slate-300 hover:bg-slate-700"
                        }`}
                      >
                        {d}d
                      </button>
                    ))}
                  </div>
                </div>

                <div className="md:col-span-2 flex items-end">
                  <button
                    onClick={() => handleRunPriceForecast(true)}
                    disabled={isPredictingPrice}
                    className="w-full py-2 px-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold text-xs rounded-xl flex items-center justify-center gap-1.5 transition cursor-pointer disabled:opacity-50"
                  >
                    {isPredictingPrice ? (
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <>
                        <TrendingUp className="w-3.5 h-3.5" />
                        <span>PREDICT</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Price Forecast Results */}
            {priceForecastResult ? (
              <div className="space-y-5">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* ML Signal Card */}
                  <div className="bg-emerald-950/20 border border-emerald-500/30 p-4 rounded-2xl flex flex-col justify-between">
                    <div>
                      <span className="text-[10px] font-mono font-bold text-emerald-600 uppercase bg-emerald-100 px-2 py-0.5 rounded-full">
                        ML Trade Signal
                      </span>
                      <h4 className="text-lg font-black text-slate-900 mt-2">{priceForecastResult.recommendation}</h4>
                      <p className="text-xs text-slate-500 mt-1">
                        Confidence: <strong className="text-emerald-700 font-mono">{priceForecastResult.confidenceScore}%</strong>
                      </p>
                    </div>
                    <div className="mt-3 pt-3 border-t border-emerald-200/60 flex justify-between items-center text-xs">
                      <span className="text-slate-500">Predicted Horizon</span>
                      <span className="font-bold text-slate-800 font-mono">{forecastDays} Days Ahead</span>
                    </div>
                  </div>

                  {/* Current vs Projected Rate */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Price Movement</span>
                    <div className="mt-1 flex items-baseline justify-between">
                      <div>
                        <span className="text-[10px] text-slate-400 block">Current Spot</span>
                        <span className="text-sm font-bold text-slate-600 font-mono">₹{priceForecastResult.currentPrice?.toLocaleString()}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-emerald-600 font-bold block">ML Projected ({forecastDays}d)</span>
                        <span className="text-xl font-black text-emerald-800 font-mono">₹{priceForecastResult.forecastedPrice?.toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="mt-3 pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs">
                      <span className="text-slate-500">Expected Change</span>
                      <span className="font-extrabold text-emerald-600 flex items-center gap-0.5 font-mono">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +{priceForecastResult.percentageChange}%
                      </span>
                    </div>
                  </div>

                  {/* Range & Drivers */}
                  <div className="bg-slate-50 border border-slate-200 p-4 rounded-2xl flex flex-col justify-between">
                    <span className="text-[10px] font-mono uppercase text-slate-400">Market Drivers</span>
                    <ul className="text-xs space-y-1 text-slate-700 mt-1">
                      {priceForecastResult.marketDrivers?.slice(0, 2).map((d: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
                          <span className="truncate">{d}</span>
                        </li>
                      ))}
                    </ul>
                    <div className="mt-2 pt-2 border-t border-slate-200/80 text-[11px] text-slate-500 font-mono flex justify-between">
                      <span>Forecast Range</span>
                      <span className="font-bold text-slate-800">₹{priceForecastResult.trajectoryData?.[0]?.lowerBound} - ₹{priceForecastResult.trajectoryData?.[priceForecastResult.trajectoryData.length - 1]?.upperBound}</span>
                    </div>
                  </div>
                </div>

                {/* Day-by-Day Trajectory Table */}
                <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white">
                  <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                      <BarChart3 className="w-4 h-4 text-emerald-600" />
                      <span>{forecastDays}-Day Projected Market Price Curve</span>
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Values in ₹ per Quintal</span>
                  </div>
                  <div className="p-3 grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
                    {priceForecastResult.trajectoryData?.map((pt: any, idx: number) => (
                      <div key={idx} className="bg-slate-50 border border-slate-200/80 p-2.5 rounded-xl text-center">
                        <span className="text-[10px] font-bold text-slate-500 block">{pt.day}</span>
                        <span className="text-sm font-extrabold text-emerald-800 font-mono block mt-0.5">₹{pt.price?.toLocaleString()}</span>
                        <span className="text-[8px] text-slate-400 font-mono block mt-0.5">₹{pt.lowerBound} - ₹{pt.upperBound}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-10 rounded-2xl border border-slate-200 bg-slate-50 text-center flex flex-col items-center justify-center space-y-3">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 border border-emerald-200 flex items-center justify-center text-emerald-700">
                  <TrendingUp className="w-7 h-7" />
                </div>
                <div className="max-w-md space-y-1">
                  <h4 className="font-extrabold text-sm text-slate-800">Time-Series Commodity Price Regression</h4>
                  <p className="text-xs text-slate-500">
                    Select commodity variety, primary mandi market, and time horizon above, then click <strong className="text-emerald-700">PREDICT</strong> to compute projected market rates.
                  </p>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Tab 3: National MSP Support */}
        {activePriceTab === 'msp' && (
          <div className="p-5">
            <p className="text-xs text-slate-500 mb-4 leading-relaxed">
              Minimum Support Prices (MSP) recommended by the Commission for Agricultural Costs and Prices (CACP) and approved by the Cabinet Committee on Economic Affairs (CCEA).
            </p>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
              {GOVERNMENT_BASELINE_PRICES.map((b, i) => (
                <div key={i} className="bg-slate-50/55 border border-slate-200/60 p-3 rounded-xl hover:shadow-sm hover:border-emerald-500 hover:bg-white transition">
                  <span className="text-xs font-semibold text-slate-700 block truncate">{b.item}</span>
                  <div className="flex items-baseline justify-between mt-1">
                    <span className="text-sm font-extrabold text-emerald-700">{b.rate}</span>
                    <span className="text-[10px] text-slate-400">/{b.unit === "per kg" ? "kg" : "qtl"}</span>
                  </div>
                  <span className={`text-[10px] font-mono mt-1 block ${b.trend === 'Upward' ? 'text-green-600' : b.trend === 'High Demand' ? 'text-emerald-600' : 'text-slate-500'}`}>
                    ● {b.trend}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Main Title & Posting Button */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-emerald-50/50 p-4 border border-emerald-100 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-emerald-950 flex items-center space-x-2">
            <ShoppingBag className="w-5 h-5 text-emerald-700" />
            <span>Direct Agri-Marketplace</span>
          </h2>
          <p className="text-xs text-emerald-800/80">List crops directly to buyers. No intermediaries, no hidden fees.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 transition text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "View Listings" : "List Your Crop"}</span>
        </button>
      </div>

      {/* Post Produce Form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6"
        >
          <h3 className="text-sm font-bold text-zinc-800 mb-4 flex items-center space-x-2">
            <Tag className="w-4 h-4 text-emerald-600" />
            <span>Produce Information</span>
          </h3>
          <form onSubmit={handleCreateListing} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Your Name *</label>
              <input
                type="text"
                required
                placeholder="e.g., Savitri Devi"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newListing.sellerName}
                onChange={e => setNewListing({ ...newListing, sellerName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Mobile Contact (India - 10 Digits) *</label>
              <div className="flex items-center gap-1.5">
                <span className="px-2.5 py-2 bg-zinc-100 border border-zinc-200 rounded-xl text-xs font-mono font-bold text-zinc-700 flex items-center gap-1 shrink-0">
                  <span>🇮🇳</span>
                  <span>+91</span>
                </span>
                <input
                  type="tel"
                  required
                  maxLength={10}
                  placeholder="9876543210"
                  className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm font-mono focus:outline-emerald-600"
                  value={newListing.sellerContact}
                  onChange={e => setNewListing({ ...newListing, sellerContact: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Product Title *</label>
              <input
                type="text"
                required
                placeholder="e.g., Sun-Dried Turmeric Pods"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newListing.productName}
                onChange={e => setNewListing({ ...newListing, productName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Category</label>
              <select
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600 text-zinc-700"
                value={newListing.category}
                onChange={e => setNewListing({ ...newListing, category: e.target.value as any })}
              >
                {categories.filter(c => c !== "All").map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Price per Unit (₹) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g., 2500"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newListing.price || ""}
                onChange={e => setNewListing({ ...newListing, price: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Unit of Measure</label>
              <select
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600 text-zinc-700"
                value={newListing.unit}
                onChange={e => setNewListing({ ...newListing, unit: e.target.value as any })}
              >
                <option value="kg">kg</option>
                <option value="quintal">quintal</option>
                <option value="ton">ton</option>
                <option value="box">box</option>
                <option value="dozen">dozen</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Total Stock Available *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g., 200"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newListing.quantity || ""}
                onChange={e => setNewListing({ ...newListing, quantity: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Market Location / State *</label>
              <input
                type="text"
                required
                placeholder="e.g., Nizamabad, Telangana"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newListing.location}
                onChange={e => setNewListing({ ...newListing, location: e.target.value })}
              />
            </div>
            <div className="md:col-span-3">
              <label className="block text-xs font-medium text-zinc-700 mb-1">Product Description</label>
              <textarea
                placeholder="e.g., High-quality ground organic produce, stored in airtight bags. Moisture level checked."
                rows={2}
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newListing.description}
                onChange={e => setNewListing({ ...newListing, description: e.target.value })}
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
                Publish Listing
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center space-x-2 overflow-x-auto pb-1 scrollbar-hide">
          <Filter className="w-4 h-4 text-zinc-400 shrink-0" />
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-xl border transition shrink-0 cursor-pointer ${
                selectedCategory === cat
                  ? "bg-emerald-600 text-white border-emerald-600"
                  : "bg-white text-zinc-600 border-zinc-200 hover:bg-zinc-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search crop or location..."
            className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-emerald-600"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Grid List */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredListings.length === 0 ? (
        <div className="text-center py-12 bg-white border border-zinc-200 rounded-2xl">
          <ShoppingBag className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-zinc-600">No products matching filters</h4>
          <p className="text-xs text-zinc-400 mt-1">Try resetting the categories or search parameters.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredListings.map((item) => (
            <div key={item.id} className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-start">
                  <span className="text-[10px] uppercase font-mono bg-zinc-100 text-zinc-700 px-2 py-0.5 rounded-md">
                    {item.category}
                  </span>
                  <button
                    onClick={() => handleDeleteListing(item.id)}
                    className="text-zinc-400 hover:text-rose-600 p-1 rounded-lg transition"
                    title="Remove item"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <h4 className="text-sm font-bold text-zinc-800 mt-2.5">{item.productName}</h4>
                <p className="text-xs text-zinc-500 line-clamp-2 mt-1.5 leading-relaxed">{item.description}</p>

                {/* Listing specifics */}
                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-100 text-xs">
                  <div>
                    <span className="text-[10px] block text-zinc-400">Rate per {item.unit}</span>
                    <strong className="text-emerald-700 text-sm">₹{item.price}</strong>
                  </div>
                  <div>
                    <span className="text-[10px] block text-zinc-400">Stock Offered</span>
                    <strong className="text-zinc-700 text-sm">{item.quantity} {item.unit}s</strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-50 space-y-2 text-xs text-zinc-500">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Location: <strong>{item.location}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-400" />
                    <span>Seller: <strong className="text-zinc-700">{item.sellerName}</strong></span>
                  </div>
                </div>
              </div>

              {/* Contact Button */}
              <div className="mt-5 pt-3 border-t border-zinc-100">
                <a
                  href={`tel:${item.sellerContact}`}
                  className="w-full bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold py-2 rounded-xl transition flex items-center justify-center space-x-2"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>Call: {item.sellerContact}</span>
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
