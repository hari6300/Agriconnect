import React, { useState, useEffect } from "react";
import { EquipmentListing } from "../types";
import { Wrench, Calendar, Phone, Plus, MapPin, Search, CheckCircle, Clock, Check } from "lucide-react";
import { motion } from "motion/react";

interface EquipmentRentalProps {
  onNotify: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function EquipmentRental({ onNotify }: EquipmentRentalProps) {
  const [equipment, setEquipment] = useState<EquipmentListing[]>([]);
  const [filteredEquipment, setFilteredEquipment] = useState<EquipmentListing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);

  // New Equipment Form State
  const [newEq, setNewEq] = useState<Partial<EquipmentListing>>({
    ownerName: "",
    ownerContact: "",
    equipmentName: "",
    category: "Tractor",
    pricePerDay: 0,
    availability: "Available",
    description: "",
    condition: "Good",
    location: ""
  });

  const fetchEquipment = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/equipment");
      if (res.ok) {
        const data = await res.json();
        setEquipment(data);
        setFilteredEquipment(data);
      }
    } catch (e) {
      onNotify("Failed to fetch equipment catalogue.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchEquipment();
  }, []);

  useEffect(() => {
    if (searchQuery.trim() === "") {
      setFilteredEquipment(equipment);
    } else {
      const query = searchQuery.toLowerCase();
      setFilteredEquipment(
        equipment.filter(
          item =>
            item.equipmentName.toLowerCase().includes(query) ||
            item.description.toLowerCase().includes(query) ||
            item.location.toLowerCase().includes(query)
        )
      );
    }
  }, [searchQuery, equipment]);

  const handleRegisterEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEq.ownerName || !newEq.ownerContact || !newEq.equipmentName || !newEq.pricePerDay || !newEq.location) {
      onNotify("Please fill out all required fields.", "error");
      return;
    }

    const cleanContact = newEq.ownerContact.replace(/\D/g, "");
    if (cleanContact.length !== 10) {
      onNotify("Please enter a valid 10-digit Indian mobile number.", "error");
      return;
    }
    if (!/^[6-9]/.test(cleanContact)) {
      onNotify("Indian mobile numbers must start with 6, 7, 8, or 9.", "error");
      return;
    }

    try {
      const res = await fetch("/api/equipment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...newEq, ownerContact: `+91 ${cleanContact.slice(0, 5)} ${cleanContact.slice(5)}` })
      });
      if (res.ok) {
        onNotify(`Successfully registered ${newEq.equipmentName} for rent!`, "success");
        setNewEq({
          ownerName: "",
          ownerContact: "",
          equipmentName: "",
          category: "Tractor",
          pricePerDay: 0,
          availability: "Available",
          description: "",
          condition: "Good",
          location: ""
        });
        setShowAddForm(false);
        fetchEquipment();
      }
    } catch (e) {
      onNotify("Failed to register equipment.", "error");
    }
  };

  const handleRentEquipment = async (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === "Available" ? "Rented" : "Available";
    try {
      const res = await fetch(`/api/equipment/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ availability: nextStatus })
      });
      if (res.ok) {
        onNotify(
          nextStatus === "Rented"
            ? "Booking requested! The owner will contact you shortly."
            : "Equipment returned successfully.",
          "success"
        );
        fetchEquipment();
      }
    } catch (e) {
      onNotify("Failed to update booking.", "error");
    }
  };

  const getAvailabilityBadge = (status: EquipmentListing['availability']) => {
    switch (status) {
      case 'Available':
        return 'bg-green-50 text-green-700 border-green-100';
      case 'Rented':
        return 'bg-amber-50 text-amber-700 border-amber-100';
      case 'Maintenance':
        return 'bg-rose-50 text-rose-700 border-rose-100';
    }
  };

  return (
    <div className="space-y-6">
      {/* Title block */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-zinc-50 p-4 border border-zinc-200/60 rounded-2xl">
        <div>
          <h2 className="text-base font-bold text-zinc-800 flex items-center space-x-2">
            <Wrench className="w-5 h-5 text-emerald-600" />
            <span>Farm Machinery Sharing</span>
          </h2>
          <p className="text-xs text-zinc-500">Rent nearby tractors, tillers, and harvesters. Monopolize idle equipment for extra cash flow.</p>
        </div>
        <button
          onClick={() => setShowAddForm(!showAddForm)}
          className="flex items-center space-x-2 bg-emerald-600 hover:bg-emerald-700 transition text-white px-4 py-2 rounded-xl text-sm font-medium shadow-sm cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{showAddForm ? "Show Listings" : "Register Machinery"}</span>
        </button>
      </div>

      {/* Register machinery form */}
      {showAddForm && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-zinc-50/50 border border-zinc-200 rounded-2xl p-6"
        >
          <h3 className="text-sm font-bold text-zinc-800 mb-4 flex items-center space-x-2">
            <Wrench className="w-4 h-4 text-emerald-600" />
            <span>Equipment Details</span>
          </h3>
          <form onSubmit={handleRegisterEquipment} className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Owner Name *</label>
              <input
                type="text"
                required
                placeholder="e.g., Gurcharan Singh"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newEq.ownerName}
                onChange={e => setNewEq({ ...newEq, ownerName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Contact Phone (India - 10 Digits) *</label>
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
                  value={newEq.ownerContact}
                  onChange={e => setNewEq({ ...newEq, ownerContact: e.target.value.replace(/\D/g, "").slice(0, 10) })}
                />
              </div>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Machinery Model *</label>
              <input
                type="text"
                required
                placeholder="e.g., John Deere 5050D"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newEq.equipmentName}
                onChange={e => setNewEq({ ...newEq, equipmentName: e.target.value })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Category</label>
              <select
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600 text-zinc-700"
                value={newEq.category}
                onChange={e => setNewEq({ ...newEq, category: e.target.value as any })}
              >
                <option value="Tractor">Tractor</option>
                <option value="Tiller">Power Tiller</option>
                <option value="Harvester">Combined Harvester</option>
                <option value="Seeder">Seeder / Drill</option>
                <option value="Irrigation">Irrigation Kit</option>
                <option value="Sprayer">Power Sprayer</option>
                <option value="Other">Other Implements</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Rental Cost per Day (₹) *</label>
              <input
                type="number"
                required
                min="1"
                placeholder="e.g., 1200"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newEq.pricePerDay || ""}
                onChange={e => setNewEq({ ...newEq, pricePerDay: Number(e.target.value) })}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Current Condition</label>
              <select
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600 text-zinc-700"
                value={newEq.condition}
                onChange={e => setNewEq({ ...newEq, condition: e.target.value as any })}
              >
                <option value="New">Brand New</option>
                <option value="Excellent">Excellent</option>
                <option value="Good">Good / Working</option>
                <option value="Fair">Fair / Usable</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-zinc-700 mb-1">Location *</label>
              <input
                type="text"
                required
                placeholder="e.g., Karnal, Haryana"
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newEq.location}
                onChange={e => setNewEq({ ...newEq, location: e.target.value })}
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-zinc-700 mb-1">Equipment Description</label>
              <input
                type="text"
                placeholder="e.g., Fuel tank full, rotavator attachments included at no extra cost..."
                className="w-full bg-white border border-zinc-200 rounded-xl px-3 py-2 text-sm focus:outline-emerald-600"
                value={newEq.description}
                onChange={e => setNewEq({ ...newEq, description: e.target.value })}
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
                List Machinery
              </button>
            </div>
          </form>
        </motion.div>
      )}

      {/* Search Machinery */}
      <div className="relative w-full max-w-md">
        <Search className="w-4 h-4 text-zinc-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search tractors, harvesters, or locations..."
          className="w-full bg-white border border-zinc-200 rounded-xl pl-9 pr-3 py-2 text-xs focus:outline-emerald-600"
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
        />
      </div>

      {/* Grid listing */}
      {isLoading ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600"></div>
        </div>
      ) : filteredEquipment.length === 0 ? (
        <div className="text-center py-12 bg-white border border-zinc-200 rounded-2xl">
          <Wrench className="w-10 h-10 text-zinc-300 mx-auto mb-2" />
          <h4 className="text-sm font-semibold text-zinc-600">No machinery matching criteria</h4>
          <p className="text-xs text-zinc-400 mt-1">Try another search keyword.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredEquipment.map((eq) => (
            <div key={eq.id} className="bg-white border border-zinc-200 rounded-2xl p-5 hover:shadow-md transition flex flex-col justify-between">
              <div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] uppercase font-mono bg-zinc-100 text-zinc-600 px-2 py-0.5 rounded-md">
                    {eq.category}
                  </span>
                  <span className={`text-xs px-2.5 py-0.5 rounded-full border ${getAvailabilityBadge(eq.availability)}`}>
                    {eq.availability}
                  </span>
                </div>

                <h4 className="text-sm font-bold text-zinc-800 mt-3">{eq.equipmentName}</h4>
                <p className="text-xs text-zinc-500 line-clamp-2 mt-1.5 leading-relaxed">{eq.description}</p>

                <div className="grid grid-cols-2 gap-2 mt-4 pt-3 border-t border-zinc-100 text-xs text-zinc-500">
                  <div>
                    <span className="text-[10px] block text-zinc-400">Rental Rate</span>
                    <strong className="text-emerald-700 text-sm">₹{eq.pricePerDay}</strong> / day
                  </div>
                  <div>
                    <span className="text-[10px] block text-zinc-400">Condition</span>
                    <strong className="text-zinc-700 text-sm">{eq.condition}</strong>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-zinc-50 space-y-2 text-xs text-zinc-400">
                  <div className="flex items-center space-x-1.5">
                    <MapPin className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Location: <strong className="text-zinc-600">{eq.location}</strong></span>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <Phone className="w-3.5 h-3.5 text-zinc-300" />
                    <span>Owner: <strong className="text-zinc-600">{eq.ownerName}</strong></span>
                  </div>
                </div>
              </div>

              {/* Booking CTAs */}
              <div className="mt-5 pt-3 border-t border-zinc-100 flex items-center gap-2">
                <a
                  href={`tel:${eq.ownerContact}`}
                  className="flex-1 bg-zinc-100 hover:bg-zinc-200 text-zinc-700 text-center text-xs font-semibold py-2.5 rounded-xl transition flex items-center justify-center space-x-1"
                >
                  <Phone className="w-3 h-3" />
                  <span>Call Owner</span>
                </a>
                <button
                  onClick={() => handleRentEquipment(eq.id, eq.availability)}
                  disabled={eq.availability === "Maintenance"}
                  className={`flex-1 text-center text-xs font-semibold py-2.5 rounded-xl transition cursor-pointer ${
                    eq.availability === "Rented"
                      ? "bg-amber-100 text-amber-800 hover:bg-amber-200"
                      : eq.availability === "Maintenance"
                      ? "bg-zinc-100 text-zinc-400 cursor-not-allowed"
                      : "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm"
                  }`}
                >
                  {eq.availability === "Rented" ? "Release Lease" : "Rent Equipment"}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
