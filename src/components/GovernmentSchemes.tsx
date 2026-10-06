import React, { useState, useEffect } from "react";
import { GovScheme, SchemeApplication } from "../types";
import { Landmark, Calendar, Search, ArrowRight, CheckCircle2, AlertCircle, FileText, User, HelpCircle, Check, Percent, CreditCard, Building, Fingerprint, ShieldCheck, Clock, Sparkles, ExternalLink, Globe } from "lucide-react";
import { motion } from "motion/react";

interface GovernmentSchemesProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function GovernmentSchemes({ onNotify }: GovernmentSchemesProps) {
  const [schemes, setSchemes] = useState<GovScheme[]>([]);
  const [applications, setApplications] = useState<SchemeApplication[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedScheme, setSelectedScheme] = useState<GovScheme | null>(null);

  // Eligibility Calculator inputs
  const [calcLandSize, setCalcLandSize] = useState<number>(1.5);
  const [calcFarmerType, setCalcFarmerType] = useState<'Small' | 'Marginal' | 'Large' | 'All'>('Small');
  const [calcEligibleList, setCalcEligibleList] = useState<Record<string, { eligible: boolean; reason: string }>>({});

  // Dynamic application form fields values
  const [appFarmerName, setAppFarmerName] = useState("");
  const [appPhone, setAppPhone] = useState("");
  const [appLandSize, setAppLandSize] = useState<number>(1.5);
  const [dynamicFieldsData, setDynamicFieldsData] = useState<Record<string, string>>({});

  // Active view: 'list' or 'applications'
  const [activeTab, setActiveTab] = useState<'schemes' | 'applications'>('schemes');

  const fetchSchemesAndApplications = async () => {
    setIsLoading(true);
    try {
      const schemesRes = await fetch("/api/schemes");
      const appsRes = await fetch("/api/schemes/applications");

      if (schemesRes.ok && appsRes.ok) {
        const schemesData = await schemesRes.json();
        const appsData = await appsRes.json();
        setSchemes(schemesData);
        setApplications(appsData);
      }
    } catch (e) {
      onNotify("Failed to fetch government schemes data.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSchemesAndApplications();
  }, []);

  // Recalculate eligibility whenever land size or farmer type changes
  useEffect(() => {
    const results: Record<string, { eligible: boolean; reason: string }> = {};

    schemes.forEach(scheme => {
      const { minLandSizeAcres, maxLandSizeAcres, farmerTypes } = scheme.eligibility;

      // 1. Check farmer type match
      const typeMatches = farmerTypes.includes("All") || farmerTypes.includes(calcFarmerType);

      if (!typeMatches) {
        results[scheme.id] = { eligible: false, reason: `Limited to ${farmerTypes.join(", ")} farmers.` };
        return;
      }

      // 2. Check min land size
      if (minLandSizeAcres !== undefined && calcLandSize < minLandSizeAcres) {
        results[scheme.id] = { eligible: false, reason: `Requires at least ${minLandSizeAcres} cultivated acres.` };
        return;
      }

      // 3. Check max land size
      if (maxLandSizeAcres !== undefined && calcLandSize > maxLandSizeAcres) {
        results[scheme.id] = { eligible: false, reason: `Maximum allowed land is ${maxLandSizeAcres} acres.` };
        return;
      }

      // 4. Eligible
      results[scheme.id] = { eligible: true, reason: "You meet all verified eligibility guidelines!" };
    });

    setCalcEligibleList(results);
  }, [calcLandSize, calcFarmerType, schemes]);

  // Set of scheme IDs that farmer has already applied for
  const appliedSchemeIds = new Set(applications.map(a => a.schemeId));
  const availableSchemes = schemes.filter(s => !appliedSchemeIds.has(s.id));

  // Function to handle direct Apply Online: records submission timestamp, removes from directory, and opens official website
  const handleApplyOnline = async (scheme: GovScheme) => {
    // Determine the official portal url
    const officialUrl = scheme.officialPortalUrl || "https://agricoop.nic.in/";
    const portalName = scheme.portalName || "Official Portal";

    // Take exact live submission timestamp
    const now = new Date();
    const liveSubmissionTime = now.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "medium",
      hour12: true
    });

    try {
      // Record application submission in backend
      const res = await fetch("/api/schemes/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeId: scheme.id,
          schemeName: scheme.name,
          farmerName: "Registered Farmer",
          phone: "+91 98765 43210",
          landSizeAcres: calcLandSize,
          status: "Pending",
          appliedAt: liveSubmissionTime,
          appliedTimestamp: now.toISOString(),
          portalUrl: officialUrl,
          portalName: portalName,
          formData: {
            portal: portalName,
            statusNote: `Redirected to ${portalName} for direct filing`
          }
        })
      });

      if (res.ok) {
        const submittedApp = await res.json();
        // Update applications and remove from incentives directory
        setApplications(prev => [submittedApp, ...prev.filter(a => a.id !== submittedApp.id)]);
        onNotify(`Application initiated for "${scheme.name}"! Opening ${portalName}...`, "success");
      }
    } catch (e) {
      console.error("Error logging scheme application:", e);
    }

    // Open official portal in new tab
    window.open(officialUrl, "_blank", "noopener,noreferrer");
  };

  const handleSubmitApplication = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedScheme) return;

    if (!appFarmerName || !appPhone) {
      onNotify("Please complete basic farmer contact details.", "error");
      return;
    }

    const cleanPhone = appPhone.replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      onNotify("Please enter a valid 10-digit Indian mobile number.", "error");
      return;
    }
    if (!/^[6-9]/.test(cleanPhone)) {
      onNotify("Indian mobile numbers must start with 6, 7, 8, or 9.", "error");
      return;
    }

    // Verify required dynamic form fields and validate specific formats
    for (const field of selectedScheme.formFields) {
      const val = dynamicFieldsData[field.name] || "";
      if (field.required && !val.trim()) {
        onNotify(`Please enter your ${field.label}.`, "error");
        return;
      }

      if (val.trim()) {
        const lowerName = field.name.toLowerCase();
        const lowerLabel = field.label.toLowerCase();

        // 1. Aadhaar Card Validation (12 Digits)
        if (lowerName.includes("aadhar") || lowerName.includes("aadhaar") || lowerLabel.includes("aadhaar")) {
          const cleanAadhaar = val.replace(/\D/g, "");
          if (cleanAadhaar.length !== 12) {
            onNotify("Aadhaar Card number must be exactly 12 digits.", "error");
            return;
          }
        }

        // 2. Bank Account Number Validation (9 to 18 Digits)
        if (lowerName.includes("account") || lowerName.includes("bankaccount") || lowerLabel.includes("account")) {
          const cleanAccount = val.replace(/\D/g, "");
          if (cleanAccount.length < 9 || cleanAccount.length > 18) {
            onNotify("Bank Account Number must be between 9 and 18 numeric digits.", "error");
            return;
          }
        }

        // 3. Bank IFSC Code Validation (11 Characters: 4 Letters, 0, 6 Alphanumeric)
        if (lowerName.includes("ifsc") || lowerLabel.includes("ifsc")) {
          const cleanIfsc = val.trim().toUpperCase();
          if (cleanIfsc.length !== 11) {
            onNotify("Bank IFSC Code must be exactly 11 characters.", "error");
            return;
          }
          if (!/^[A-Z]{4}0[A-Z0-9]{6}$/.test(cleanIfsc)) {
            onNotify("Invalid IFSC format. Example: SBIN0001234 (4 letters, 0, 6 alphanumeric).", "error");
            return;
          }
        }
      }
    }

    // Take the exact live timestamp at submission time
    const now = new Date();
    const liveSubmissionTime = now.toLocaleString("en-IN", {
      dateStyle: "medium",
      timeStyle: "medium",
      hour12: true
    });

    try {
      const res = await fetch("/api/schemes/apply", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          schemeId: selectedScheme.id,
          schemeName: selectedScheme.name,
          farmerName: appFarmerName,
          phone: `+91 ${cleanPhone}`,
          landSizeAcres: appLandSize,
          formData: dynamicFieldsData,
          appliedAt: liveSubmissionTime,
          appliedTimestamp: now.toISOString()
        })
      });

      if (res.ok) {
        const submittedApp = await res.json();
        onNotify(`Application for "${selectedScheme.name}" submitted successfully! It has been removed from Incentives Directory and moved to Your Applications.`, "success");
        // Update applications and remove scheme from directory
        setApplications(prev => [submittedApp, ...prev.filter(a => a.id !== submittedApp.id)]);
        // Reset form state
        setAppFarmerName("");
        setAppPhone("");
        setDynamicFieldsData({});
        setSelectedScheme(null);
        setActiveTab("applications");
        fetchSchemesAndApplications();
      }
    } catch (e) {
      onNotify("Failed to submit application.", "error");
    }
  };

  const getFilteredSchemes = () => {
    // Only unapplied schemes are shown in the Incentives Directory
    const unapplied = schemes.filter(s => !appliedSchemeIds.has(s.id));
    if (searchQuery.trim() === "") return unapplied;
    const query = searchQuery.toLowerCase();
    return unapplied.filter(
      s => s.name.toLowerCase().includes(query) ||
           s.department.toLowerCase().includes(query) ||
           s.description.toLowerCase().includes(query)
    );
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-zinc-200 pb-4 gap-4">
        <div>
          <h2 className="text-base font-bold text-zinc-800 flex items-center space-x-2">
            <Landmark className="w-5 h-5 text-emerald-600" />
            <span>Government Subsidies & Schemes</span>
          </h2>
          <p className="text-xs text-zinc-500">Apply directly for central and state incentives, machinery subsidies, and micro-irrigation grants.</p>
        </div>

        {/* View togglers */}
        <div className="flex bg-zinc-100 rounded-xl p-1 shrink-0 border border-zinc-200/50">
          <button
            onClick={() => { setActiveTab("schemes"); setSelectedScheme(null); }}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center space-x-1.5 ${activeTab === 'schemes' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-500'}`}
          >
            <span>Incentives Directory</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${activeTab === 'schemes' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'}`}>
              {availableSchemes.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab("applications")}
            className={`text-xs px-3 py-1.5 rounded-lg font-semibold transition cursor-pointer flex items-center space-x-1.5 ${activeTab === 'applications' ? 'bg-white text-zinc-800 shadow-sm' : 'text-zinc-500'}`}
          >
            <span>Your Applications</span>
            <span className={`text-[10px] px-1.5 py-0.2 rounded-full font-mono font-bold ${activeTab === 'applications' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-600'}`}>
              {applications.length}
            </span>
          </button>
        </div>
      </div>

      {activeTab === 'schemes' ? (
        <>
          {/* Eligibility Calculator & Selector */}
          <div className="bg-emerald-50/50 border border-emerald-100 rounded-2xl p-5 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-1 border-r border-emerald-100/50 pr-0 md:pr-6 space-y-4">
              <h3 className="text-xs font-bold font-mono text-emerald-950 uppercase tracking-wider flex items-center space-x-1.5">
                <Landmark className="w-4 h-4 text-emerald-700" />
                <span>Eligibility Checker</span>
              </h3>
              <div>
                <label className="block text-[11px] font-medium text-emerald-900 mb-1">Your Total Land Size (Acres):</label>
                <input
                  type="number"
                  step="0.1"
                  min="0"
                  className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs text-emerald-950 focus:outline-emerald-600"
                  value={calcLandSize}
                  onChange={e => setCalcLandSize(Number(e.target.value))}
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-emerald-900 mb-1">Your Farmer Category:</label>
                <select
                  className="w-full bg-white border border-emerald-200 rounded-xl px-3 py-2 text-xs text-emerald-950 focus:outline-emerald-600"
                  value={calcFarmerType}
                  onChange={e => setCalcFarmerType(e.target.value as any)}
                >
                  <option value="Marginal">Marginal (Land &lt; 2.5 Acres)</option>
                  <option value="Small">Small (Land 2.5 to 5.0 Acres)</option>
                  <option value="Large">Large (Land &gt; 5.0 Acres)</option>
                </select>
              </div>
              <p className="text-[10px] text-emerald-800/70 leading-relaxed bg-white/50 border border-emerald-100/50 p-2 rounded-lg">
                * Our calculator matches your profile specs against active scheme guidelines in real time.
              </p>
            </div>

            {/* Schemes Directory */}
            <div className="md:col-span-2 space-y-4">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest">Incentives Directory</h3>
                {/* Search */}
                <div className="relative w-full sm:w-60">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    placeholder="Search schemes or depart..."
                    className="w-full bg-white border border-zinc-200 rounded-xl pl-8 pr-3 py-1.5 text-xs focus:outline-emerald-600"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                </div>
              </div>

              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-emerald-600"></div>
                </div>
              ) : availableSchemes.length === 0 && schemes.length > 0 ? (
                <div className="text-center py-10 px-4 bg-emerald-50/60 border border-emerald-200/80 rounded-2xl space-y-3">
                  <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center mx-auto shadow-sm">
                    <CheckCircle2 className="w-6 h-6" />
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-emerald-950">All Available Incentive Schemes Claimed!</h4>
                    <p className="text-xs text-emerald-800/80 max-w-md mx-auto leading-relaxed mt-1">
                      You have submitted applications for all active subsidy schemes. Applied schemes are automatically removed from the directory and tracked in real time.
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab("applications")}
                    className="inline-flex items-center space-x-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold px-4 py-2 rounded-xl transition shadow-sm cursor-pointer"
                  >
                    <FileText className="w-3.5 h-3.5" />
                    <span>View Your Applications ({applications.length})</span>
                  </button>
                </div>
              ) : getFilteredSchemes().length === 0 ? (
                <div className="text-center py-10 bg-white border border-zinc-200 rounded-xl">
                  <Landmark className="w-8 h-8 text-zinc-300 mx-auto mb-2" />
                  <p className="text-xs text-zinc-400">No unapplied government schemes matched search parameters.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {getFilteredSchemes().map(scheme => {
                    const status = calcEligibleList[scheme.id] || { eligible: false, reason: "Evaluation pending" };
                    return (
                      <div key={scheme.id} className="bg-white border border-zinc-200 rounded-2xl p-4 hover:shadow-sm transition space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center space-x-2">
                              <span className="text-[10px] text-zinc-400 block font-mono">{scheme.department}</span>
                              {scheme.portalName && (
                                <span className="inline-flex items-center space-x-1 text-[10px] font-mono font-semibold px-2 py-0.5 rounded bg-blue-50 text-blue-700 border border-blue-100">
                                  <Globe className="w-3 h-3" />
                                  <span>{scheme.portalName}</span>
                                </span>
                              )}
                            </div>
                            <h4 className="text-sm font-bold text-zinc-800 mt-0.5">{scheme.name}</h4>
                          </div>
                          <div className="bg-emerald-50 text-emerald-800 px-3 py-1 rounded-xl border border-emerald-100 font-extrabold text-xs shrink-0 flex items-center space-x-1">
                            <Percent className="w-3 h-3" />
                            <span>{scheme.subsidyPercentage}% Grant</span>
                          </div>
                        </div>

                        <p className="text-xs text-zinc-500 leading-relaxed">{scheme.description}</p>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2.5 border-t border-zinc-50 text-xs">
                          <div>
                            <span className="text-[10px] text-zinc-400 block font-mono uppercase tracking-wider">Financial Benefit</span>
                            <strong className="text-emerald-700 font-semibold">{scheme.benefits}</strong>
                          </div>
                          <div>
                            <span className="text-[10px] text-zinc-400 block font-mono uppercase tracking-wider">Application Deadline</span>
                            <span className="text-zinc-600 font-semibold flex items-center space-x-1 mt-0.5">
                              <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                              <span>{scheme.deadline}</span>
                            </span>
                          </div>
                        </div>

                        {/* Eligibility evaluation result bar */}
                        <div className="pt-2.5 border-t border-zinc-50 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                          <div className="flex items-start space-x-2">
                            {status.eligible ? (
                              <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                            ) : (
                              <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
                            )}
                            <div className="text-xs">
                              <span className={`font-bold ${status.eligible ? 'text-green-700' : 'text-amber-800'}`}>
                                {status.eligible ? "Eligible" : "Not Eligible"}
                              </span>
                              <span className="text-zinc-400 mx-1.5">|</span>
                              <span className="text-zinc-500">{status.reason}</span>
                            </div>
                          </div>

                          {status.eligible && (
                            <div className="flex items-center space-x-2 self-end sm:self-auto">
                              <button
                                onClick={() => handleApplyOnline(scheme)}
                                className="bg-emerald-600 hover:bg-emerald-700 active:scale-95 text-white text-xs font-semibold px-3.5 py-1.5 rounded-xl transition flex items-center space-x-1.5 shadow-sm cursor-pointer whitespace-nowrap"
                                title={`Apply directly on official portal (${scheme.portalName || 'Government Portal'})`}
                              >
                                <span>Apply Online</span>
                                <ExternalLink className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Form Modal/Section */}
          {selectedScheme && (
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-50 border border-zinc-200 rounded-2xl p-6 shadow-sm"
            >
              <div className="flex justify-between items-start border-b border-zinc-200 pb-3 mb-4">
                <div>
                  <span className="text-[10px] font-mono text-zinc-400 block uppercase tracking-widest">Interactive Direct Application</span>
                  <h3 className="text-sm font-bold text-zinc-800 mt-1">{selectedScheme.name}</h3>
                </div>
                <button
                  onClick={() => setSelectedScheme(null)}
                  className="text-xs text-zinc-400 hover:text-zinc-600 cursor-pointer"
                >
                  ✕ Close Form
                </button>
              </div>

              <form onSubmit={handleSubmitApplication} className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Farmer identity details */}
                <div className="bg-white border border-zinc-200 p-4 rounded-xl space-y-3.5 md:col-span-2 grid grid-cols-1 md:grid-cols-3 gap-3">
                  <h4 className="text-xs font-bold text-zinc-800 md:col-span-3 flex items-center space-x-1.5 border-b border-zinc-100 pb-1.5">
                    <User className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Farmer Profile Information</span>
                  </h4>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Full Name of Farmer *</label>
                    <input
                      type="text"
                      required
                      placeholder="e.g., Savitri Devi"
                      className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600"
                      value={appFarmerName}
                      onChange={e => setAppFarmerName(e.target.value)}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Mobile Link Number (India - 10 Digits) *</label>
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
                        className="w-full bg-zinc-50 border border-zinc-200 rounded-xl px-3 py-2 text-xs font-mono focus:outline-emerald-600"
                        value={appPhone}
                        onChange={e => setAppPhone(e.target.value.replace(/\D/g, "").slice(0, 10))}
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-zinc-700 mb-1">Declared Land Size (Acres)</label>
                    <input
                      type="number"
                      step="0.1"
                      className="w-full bg-zinc-100 border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600 text-zinc-500 cursor-not-allowed"
                      value={appLandSize}
                      disabled
                    />
                  </div>
                </div>

                {/* Dynamic scheme criteria inputs */}
                <div className="md:col-span-2 grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {selectedScheme.formFields.map(field => {
                    const lowerName = field.name.toLowerCase();
                    const lowerLabel = field.label.toLowerCase();
                    const isAadhaar = lowerName.includes("aadhar") || lowerName.includes("aadhaar") || lowerLabel.includes("aadhaar");
                    const isAccount = lowerName.includes("account") || lowerName.includes("bankaccount") || lowerLabel.includes("account");
                    const isIfsc = lowerName.includes("ifsc") || lowerLabel.includes("ifsc");

                    return (
                      <div key={field.name} className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="block text-xs font-semibold text-zinc-700">
                            {field.label} {field.required ? "*" : "(Optional)"}
                          </label>
                          {isAadhaar && (
                            <span className="text-[9px] font-mono font-bold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                              12 Digits
                            </span>
                          )}
                          {isAccount && (
                            <span className="text-[9px] font-mono font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                              9-18 Digits
                            </span>
                          )}
                          {isIfsc && (
                            <span className="text-[9px] font-mono font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded border border-purple-200">
                              11 Chars (e.g. SBIN0001234)
                            </span>
                          )}
                        </div>

                        {field.type === 'select' ? (
                          <select
                            required={field.required}
                            className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600 text-zinc-700"
                            value={dynamicFieldsData[field.name] || ""}
                            onChange={e => setDynamicFieldsData({ ...dynamicFieldsData, [field.name]: e.target.value })}
                          >
                            <option value="">Select choice...</option>
                            {field.options?.map(opt => (
                              <option key={opt} value={opt}>{opt}</option>
                            ))}
                          </select>
                        ) : isAadhaar ? (
                          <div className="relative">
                            <input
                              type="text"
                              maxLength={14}
                              required={field.required}
                              placeholder="5432 9876 1234"
                              className="w-full bg-white border border-zinc-200 rounded-xl pl-8 pr-3 py-2 text-xs font-mono tracking-wider focus:outline-emerald-600"
                              value={dynamicFieldsData[field.name] || ""}
                              onChange={e => {
                                const cleaned = e.target.value.replace(/\D/g, "").slice(0, 12);
                                const matches = cleaned.match(/(\d{1,4})/g);
                                setDynamicFieldsData({ ...dynamicFieldsData, [field.name]: matches ? matches.join(" ") : cleaned });
                              }}
                            />
                            <Fingerprint className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          </div>
                        ) : isAccount ? (
                          <div className="relative">
                            <input
                              type="text"
                              maxLength={18}
                              required={field.required}
                              placeholder="e.g. 102938475612"
                              className="w-full bg-white border border-zinc-200 rounded-xl pl-8 pr-3 py-2 text-xs font-mono tracking-wider focus:outline-blue-600"
                              value={dynamicFieldsData[field.name] || ""}
                              onChange={e => {
                                const cleaned = e.target.value.replace(/\D/g, "").slice(0, 18);
                                setDynamicFieldsData({ ...dynamicFieldsData, [field.name]: cleaned });
                              }}
                            />
                            <CreditCard className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          </div>
                        ) : isIfsc ? (
                          <div className="relative">
                            <input
                              type="text"
                              maxLength={11}
                              required={field.required}
                              placeholder="e.g. SBIN0001234"
                              className="w-full bg-white border border-zinc-200 rounded-xl pl-8 pr-3 py-2 text-xs font-mono uppercase tracking-wider focus:outline-purple-600"
                              value={dynamicFieldsData[field.name] || ""}
                              onChange={e => {
                                const cleaned = e.target.value.replace(/[^a-zA-Z0-9]/g, "").toUpperCase().slice(0, 11);
                                setDynamicFieldsData({ ...dynamicFieldsData, [field.name]: cleaned });
                              }}
                            />
                            <Building className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
                          </div>
                        ) : (
                          <input
                            type={field.type === 'number' ? 'number' : 'text'}
                            required={field.required}
                            placeholder={`Enter ${field.label.toLowerCase()}...`}
                            className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-xs focus:outline-emerald-600"
                            value={dynamicFieldsData[field.name] || ""}
                            onChange={e => setDynamicFieldsData({ ...dynamicFieldsData, [field.name]: e.target.value })}
                          />
                        )}
                      </div>
                    );
                  })}
                </div>

                <div className="md:col-span-2 flex justify-end space-x-2 pt-4 border-t border-zinc-200">
                  <button
                    type="button"
                    onClick={() => setSelectedScheme(null)}
                    className="bg-zinc-200 hover:bg-zinc-300 text-zinc-700 px-4 py-2 rounded-xl text-xs transition"
                  >
                    Cancel Application
                  </button>
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-xl text-xs font-medium transition"
                  >
                    Submit Verified Claim
                  </button>
                </div>
              </form>
            </motion.div>
          )}
        </>
      ) : (
        /* Applications tracking log list */
        <div className="space-y-4">
          <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-widest">Application Tracking Queue</h3>
          {applications.length === 0 ? (
            <div className="text-center py-16 bg-white border border-zinc-200 rounded-2xl">
              <FileText className="w-12 h-12 text-zinc-300 mx-auto mb-3" />
              <h4 className="text-sm font-semibold text-zinc-700">No applications filed yet</h4>
              <p className="text-xs text-zinc-400 max-w-sm mx-auto mt-1">
                When you apply for eligible micro-irrigation, land incentives, or tractor subsidies, they will appear in this tracking log.
              </p>
              <button
                onClick={() => setActiveTab("schemes")}
                className="mt-4 bg-emerald-600 text-white text-xs font-medium px-4 py-2 rounded-lg hover:bg-emerald-700 transition"
              >
                View Subsidy Directory
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {applications.map(app => (
                <div key={app.id} className="bg-white border border-zinc-200 rounded-2xl p-5 shadow-sm space-y-3">
                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[9px] font-mono text-zinc-400 uppercase tracking-wide">ID: {app.id}</span>
                      <h4 className="text-xs font-bold text-zinc-800 mt-1">{app.schemeName || "Agricultural Subsidy Plan"}</h4>
                    </div>
                    <span className="bg-amber-50 text-amber-800 text-[10px] font-bold px-2.5 py-0.5 rounded-full border border-amber-100 flex items-center space-x-1 animate-pulse">
                      <span>● {app.status}</span>
                    </span>
                  </div>

                  <div className="text-xs text-zinc-600 space-y-1.5 bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <p className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Applicant:</span>
                      <strong className="text-zinc-800">{app.farmerName}</strong>
                    </p>
                    <p className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Mobile:</span>
                      <strong className="text-zinc-800 font-mono">{app.phone}</strong>
                    </p>
                    <p className="flex justify-between items-center text-xs">
                      <span className="text-zinc-500">Applied Area:</span>
                      <strong className="text-zinc-800">{app.landSizeAcres} Acres</strong>
                    </p>
                    <div className="pt-2 mt-1 border-t border-zinc-200/60 flex items-center justify-between text-[11px]">
                      <span className="text-zinc-500 flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                        <span className="font-medium">Live Submission Time:</span>
                      </span>
                      <strong className="text-emerald-800 font-mono bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/70">
                        {app.appliedAt}
                      </strong>
                    </div>
                  </div>

                  {/* Dynamic submitted values */}
                  <div className="pt-2 border-t border-zinc-100">
                    <span className="text-[10px] font-bold text-zinc-400 block font-mono">SUBMITTED FIELD VERIFICATIONS:</span>
                    <div className="flex flex-wrap gap-2 mt-1.5">
                      {Object.entries(app.formData || {}).map(([k, v]) => (
                        <span key={k} className="bg-zinc-100 text-zinc-600 text-[10px] px-2 py-0.5 rounded-md border border-zinc-200/50">
                          {k}: <strong>{String(v)}</strong>
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
