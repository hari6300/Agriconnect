import React, { useState } from "react";
import { 
  FlaskConical, 
  Search, 
  Calculator, 
  ShieldCheck, 
  AlertTriangle, 
  HelpCircle, 
  Send, 
  Sparkles, 
  ArrowRight, 
  Activity, 
  FileText,
  BadgeAlert,
  Layers,
  Tag,
  ShoppingBag,
  ShoppingCart,
  Trash2,
  Plus,
  Minus,
  CheckCircle2,
  Leaf,
  Sprout,
  Star,
  Info,
  X,
  Printer,
  Download,
  Calendar,
  MapPin,
  Heart,
  Clock,
  RefreshCw
} from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface PesticideFertilizerGuideProps {
  onNotify: (msg: string, type: "success" | "error" | "info") => void;
  bookings: any[];
  setBookings: React.Dispatch<React.SetStateAction<any[]>>;
  initialTab?: "catalog" | "protection" | "bookings";
  onRedirectTab?: (tab: string) => void;
}

// Static dataset for Crop Protection & Pesticides
const PEST_CATALOG = [
  {
    id: "pest-1",
    crop: "Paddy",
    pestName: "Stem Borer (Scirpophaga incertulas)",
    symptoms: "Dead hearts in vegetative stage, whiteheads in reproductive stage. Drying of leaf sheets.",
    chemicalName: "Chlorantraniliprole 18.5% SC (Coragen) or Cartap Hydrochloride 50% SP",
    organicAlternative: "Neem oil spray (3000 ppm) or releasing Trichogramma japonicum egg parasitoids",
    dosage: "60 ml of SC per acre in 200 liters of water",
    phi: "21 Days before harvest",
    severity: "High"
  },
  {
    id: "pest-2",
    crop: "Paddy",
    pestName: "Brown Plant Hopper (BPH)",
    symptoms: "Yellowing and drying of leaves spreading in circular patches ('hopper burn').",
    chemicalName: "Pymetrozine 50% WDG (Chess) or Dinotefuran 20% SG",
    organicAlternative: "Spray Lecanicillium lecanii (entomopathogenic fungus) or neem seed kernel extract",
    dosage: "120 grams of WDG per acre",
    phi: "19 Days before harvest",
    severity: "Critical"
  },
  {
    id: "pest-3",
    crop: "Cotton",
    pestName: "Pink Bollworm (Pectinophora gossypiella)",
    symptoms: "Rosette flowers, stained lint, premature opening of bolls with larvae inside.",
    chemicalName: "Profex Super (Profenofos 40% + Cypermethrin 4% EC) or Emamectin Benzoate 5% SG",
    organicAlternative: "Pheromone traps (5-8 traps/acre), neem oil sprays, or mechanical collection of rosetted flowers",
    dosage: "400 ml of Profenofos-mix or 80g of SG per acre",
    phi: "15 Days before harvest",
    severity: "Critical"
  },
  {
    id: "pest-4",
    crop: "Cotton",
    pestName: "Whiteflies (Bemisia tabaci)",
    symptoms: "Yellow spots, stickiness on leaves due to honeydew, black sooty mold growth.",
    chemicalName: "Diafenthiuron 50% WP (Pegasus) or Pyriproxyfen 10% EC",
    organicAlternative: "Yellow sticky traps (25-30 traps/acre), spray starch solution (thick starch traps insects)",
    dosage: "250 grams of WP per acre",
    phi: "20 Days before harvest",
    severity: "Medium"
  },
  {
    id: "pest-5",
    crop: "Turmeric",
    pestName: "Rhizome Rot (Pythium aphanidermatum)",
    symptoms: "Yellowing of leaves, leaf-margins folding inwards, water-soaked soft rot of rhizome.",
    chemicalName: "Soil drenching with Metalaxyl-M 4% + Mancozeb 64% WP (Ridomil Gold)",
    organicAlternative: "Treat rhizomes with Trichoderma viride culture before sowing, improve soil drainage",
    dosage: "2.5 grams of fungicide per liter of water",
    phi: "30 Days before harvest",
    severity: "Critical"
  },
  {
    id: "pest-6",
    crop: "Wheat",
    pestName: "Yellow Rust (Puccinia striiformis)",
    symptoms: "Yellow or orange-yellow pustules arranged in linear stripes on leaf surfaces.",
    chemicalName: "Propiconazole 25% EC (Tilt)",
    organicAlternative: "Grow resistant varieties (HD-3086 / DBW-187), foliar spray of sour buttermilk and garlic solution",
    dosage: "200 ml per acre in 200 liters of water",
    phi: "25 Days before harvest",
    severity: "High"
  },
  {
    id: "pest-7",
    crop: "Maize",
    pestName: "Fall Armyworm (Spodoptera frugiperda)",
    symptoms: "Chaffed leaf edges, deep whorl feeding, fresh fecal sawdust-like powder in leaf whorls.",
    chemicalName: "Spinetoram 11.7% SC (Delegate) or Chlorantraniliprole 18.5% SC",
    organicAlternative: "Hand-pick egg masses, apply dry sand or ash directly into plant whorls",
    dosage: "100 ml of SC per acre in whorls",
    phi: "30 Days before harvest",
    severity: "Critical"
  }
];

// Rich Product Varieties Dataset with exact Pricing below each product
const PRODUCT_VARIETIES = [
  // Pesticides
  {
    id: "prod-1",
    name: "Chlorantraniliprole 18.5% SC (Coragen)",
    category: "Pesticides",
    subCategory: "Systemic Insecticide",
    composition: "Chlorantraniliprole 18.5%",
    brandName: "FMC Coragen",
    target: "Stem Borers, Leaf Folders, Fall Armyworm, Pod Borers",
    dosage: "60 ml per acre in 200 Liters of water",
    packSizes: ["60 ml", "150 ml"],
    priceRange: "₹950 - ₹2,100",
    basePrice: 950,
    unit: "60 ml Bottle",
    description: "Premium systemic insecticide offering long-duration protection. It paralyzes insect muscle receptors instantly, preventing feeding damage.",
    organic: false,
    rating: 4.8,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=400&q=80",
    remainingStock: 14
  },
  {
    id: "prod-2",
    name: "Diafenthiuron 50% WP (Pegasus)",
    category: "Pesticides",
    subCategory: "Broad-Spectrum Insecticide & Acaricide",
    composition: "Diafenthiuron 50% WP",
    brandName: "Syngenta Pegasus",
    target: "Whiteflies, Aphids, Jassids, Thrips, Spider Mites",
    dosage: "250g per acre in 200 Liters of water",
    packSizes: ["250g"],
    priceRange: "₹780",
    basePrice: 780,
    unit: "250g Pack",
    description: "Inhibits respiratory enzyme synthesis in insects. Delivers outstanding control of tough, sucking pests with immediate vapor action.",
    organic: false,
    rating: 4.6,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=400&q=80",
    remainingStock: 8
  },
  {
    id: "prod-3",
    name: "Metalaxyl-M 4% + Mancozeb 64% WP (Ridomil Gold)",
    category: "Pesticides",
    subCategory: "Systemic & Contact Fungicide",
    composition: "Metalaxyl-M 4% + Mancozeb 64% WP",
    brandName: "Syngenta Ridomil Gold",
    target: "Rhizome Rot, Late Blight, Downy Mildew, Root Rot",
    dosage: "2.5g per Liter of water (Soil drench & spray)",
    packSizes: ["100g", "500g"],
    priceRange: "₹180 - ₹620",
    basePrice: 620,
    unit: "500g Pack",
    description: "Dual-action fungicidal protection. Metalaxyl-M enters plant veins systemically, while Mancozeb sets up a robust external barrier.",
    organic: false,
    rating: 4.7,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1605000797439-75a1500dd333?auto=format&fit=crop&w=400&q=80",
    remainingStock: 11
  },
  {
    id: "prod-4",
    name: "Profex Super (Profenofos 40% + Cypermethrin 4% EC)",
    category: "Pesticides",
    subCategory: "Combination Insecticide",
    composition: "Profenofos 40% + Cypermethrin 4% EC",
    brandName: "PI Industries",
    target: "Pink Bollworm, Cotton Leaf Folders, Thrips, Jassids",
    dosage: "400 ml per acre",
    packSizes: ["500 ml", "1 Liter"],
    priceRange: "₹450 - ₹820",
    basePrice: 450,
    unit: "500 ml Bottle",
    description: "A synergistic combination of a powerful organophosphate and a highly active synthetic pyrethroid for rapid larval knockdown.",
    organic: false,
    rating: 4.5,
    availability: "Limited Stock",
    image: "https://images.unsplash.com/photo-1563514223300-b3b0c301a405?auto=format&fit=crop&w=400&q=80",
    remainingStock: 4
  },
  {
    id: "prod-5",
    name: "Cold-Pressed Neem Oil (1500 PPM)",
    category: "Pesticides",
    subCategory: "Botanical Bio-Control & Insect Growth Regulator",
    composition: "Cold-Pressed Azadirachtin with organic emulsifiers",
    brandName: "AgriOrganic",
    target: "Sucking pests, Aphids, Whiteflies, Leaf Miners, Mealybugs",
    dosage: "3-5 ml per Liter of water as foliar spray",
    packSizes: ["250 ml", "1 Liter"],
    priceRange: "₹150 - ₹380",
    basePrice: 380,
    unit: "1 Liter Bottle",
    description: "100% natural and biodegradable repellent. It alters egg laying, halts feeding, and disrupts larval molting without killing friendly insects.",
    organic: true,
    rating: 4.9,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    remainingStock: 19
  },
  {
    id: "prod-6",
    name: "Trichoderma Viride Bio-Fungicide",
    category: "Pesticides",
    subCategory: "Biological Fungicide & Rhizosphere Shield",
    composition: "Trichoderma viride viable spores (2x10^6 cfu/g)",
    brandName: "Krishi Bio",
    target: "Wilt diseases, Seedling damping-off, Soil-borne pathogens",
    dosage: "10g per kg seed or 1-2 kg mixed in 100 kg compost per acre",
    packSizes: ["500g", "1 kg"],
    priceRange: "₹100 - ₹180",
    basePrice: 180,
    unit: "1 kg Pack",
    description: "A natural antagonistic fungus that colonizes roots, physically blocks pathogenic fungi, and improves plant defense response.",
    organic: true,
    rating: 4.8,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=400&q=80",
    remainingStock: 15
  },

  // Fertilizers
  {
    id: "prod-7",
    name: "Urea (46% Nitrogen)",
    category: "Fertilizers",
    subCategory: "Nitrogen Fertilizers",
    composition: "Nitrogen 46% (Neem-oil coated prills)",
    brandName: "IFFCO / KRIBHCO",
    target: "Vegetative Leaf growth, Plant structure, Chlorophyll boost",
    dosage: "30-50 kg per acre in split top dressing",
    packSizes: ["45 kg Bag"],
    priceRange: "₹266.50",
    basePrice: 266.50,
    unit: "45 kg Bag",
    description: "Subsidized nitrogen macro-nutrient. Neem coating acts as a nitrification inhibitor, reducing ammonia loss to air and water.",
    organic: false,
    rating: 4.9,
    availability: "In Stock (POS Verification Needed)",
    image: "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=400&q=80",
    remainingStock: 30
  },
  {
    id: "prod-8",
    name: "Ammonium Sulphate",
    category: "Fertilizers",
    subCategory: "Nitrogen Fertilizers",
    composition: "Nitrogen 20.6%, Sulphur 24%",
    brandName: "GSFC / FACT",
    target: "Sulphur-loving crops like oilseeds, protein synthesis",
    dosage: "50 kg per acre as basal or top dressing",
    packSizes: ["50 kg Bag"],
    priceRange: "₹950",
    basePrice: 950,
    unit: "50 kg Bag",
    description: "Provides nitrogen in ammoniacal form and readily available sulphate sulphur for oilseed crops.",
    organic: false,
    rating: 4.7,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1574313960913-c582e7890f08?auto=format&fit=crop&w=400&q=80",
    remainingStock: 20
  },
  {
    id: "prod-9",
    name: "Calcium Ammonium Nitrate (CAN)",
    category: "Fertilizers",
    subCategory: "Nitrogen Fertilizers",
    composition: "Nitrogen 25% (Ammoniacal & Nitrate), Calcium 8%",
    brandName: "National Fertilizers Ltd (NFL)",
    target: "Acidic soils, rapid vegetative shoot recovery",
    dosage: "40-60 kg per acre top dressing",
    packSizes: ["50 kg Bag"],
    priceRange: "₹1,150",
    basePrice: 1150,
    unit: "50 kg Bag",
    description: "An excellent neutral nitrogenous fertilizer containing both immediate nitrate and sustained ammoniacal nitrogen.",
    organic: false,
    rating: 4.6,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1592417817098-8f3d6eb19675?auto=format&fit=crop&w=400&q=80",
    remainingStock: 15
  },
  {
    id: "prod-10",
    name: "Ammonium Chloride",
    category: "Fertilizers",
    subCategory: "Nitrogen Fertilizers",
    composition: "Nitrogen 25%",
    brandName: "SPIC / Deepak Fertilisers",
    target: "Wetland paddy, chloride-tolerant field crops",
    dosage: "30-40 kg per acre during tillering",
    packSizes: ["50 kg Bag"],
    priceRange: "₹850",
    basePrice: 850,
    unit: "50 kg Bag",
    description: "Highly effective for rice cultivation. Reduces leaching loss in waterlogged soils.",
    organic: false,
    rating: 4.4,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1592176372045-2d4e9ae60c6d?auto=format&fit=crop&w=400&q=80",
    remainingStock: 18
  },
  {
    id: "prod-11",
    name: "Ammonium Nitrate",
    category: "Fertilizers",
    subCategory: "Nitrogen Fertilizers",
    composition: "Nitrogen 34% (50% Ammoniacal, 50% Nitrate)",
    brandName: "Chambal Fertilisers",
    target: "Immediate nitrogen supply, quick greening",
    dosage: "25-35 kg per acre with strict soil moisture",
    packSizes: ["50 kg Bag"],
    priceRange: "₹1,450",
    basePrice: 1450,
    unit: "50 kg Bag",
    description: "Highly concentrated, rapid-action nitrogen fertilizer. Widely preferred for intensive horticultural crops.",
    organic: false,
    rating: 4.5,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80",
    remainingStock: 12
  },
  {
    id: "prod-12",
    name: "Diammonium Phosphate (DAP)",
    category: "Fertilizers",
    subCategory: "Phosphorus Fertilizers",
    composition: "Nitrogen 18%, Phosphorus (P₂O₅) 46%",
    brandName: "IFFCO / Coromandel GROMOR",
    target: "Root development, seed establishment, seedling vigor",
    dosage: "50 kg per acre as basal dose",
    packSizes: ["50 kg Bag"],
    priceRange: "₹1,350",
    basePrice: 1350,
    unit: "50 kg Bag",
    description: "Most widely used high-analysis phosphorus source, supplying initial nitrogen and concentrated phosphate.",
    organic: false,
    rating: 4.9,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1574313960913-c582e7890f08?auto=format&fit=crop&w=400&q=80",
    remainingStock: 25
  },
  {
    id: "prod-13",
    name: "Single Super Phosphate (SSP)",
    category: "Fertilizers",
    subCategory: "Phosphorus Fertilizers",
    composition: "Phosphorus (P₂O₅) 16%, Sulphur 11%, Calcium 19%",
    brandName: "Rama Phosphates / Khaitan",
    target: "Root proliferation, oil content enhancement",
    dosage: "75-100 kg per acre basal dose",
    packSizes: ["50 kg Bag"],
    priceRange: "₹480",
    basePrice: 480,
    unit: "50 kg Bag",
    description: "Multinutrient fertilizer supplying phosphorus, sulphur, and calcium in highly plant-available forms.",
    organic: false,
    rating: 4.7,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80",
    remainingStock: 40
  },
  {
    id: "prod-14",
    name: "Triple Super Phosphate (TSP)",
    category: "Fertilizers",
    subCategory: "Phosphorus Fertilizers",
    composition: "Phosphorus (P₂O₅) 46%, Calcium 15%",
    brandName: "IPL (Indian Potash Ltd)",
    target: "Concentrated phosphate basal nutrition",
    dosage: "30-40 kg per acre basal application",
    packSizes: ["50 kg Bag"],
    priceRange: "₹1,850",
    basePrice: 1850,
    unit: "50 kg Bag",
    description: "Highly concentrated phosphate fertilizer, ideal for leguminous crops that fix their own nitrogen.",
    organic: false,
    rating: 4.6,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80",
    remainingStock: 14
  },
  {
    id: "prod-15",
    name: "Monoammonium Phosphate (MAP)",
    category: "Fertilizers",
    subCategory: "Phosphorus Fertilizers",
    composition: "Nitrogen 11%, Phosphorus (P₂O₅) 52%",
    brandName: "Mahadhan / Tata Paras",
    target: "Root cell division, early phosphorus boost, acidic soils",
    dosage: "40 kg per acre as basal dose",
    packSizes: ["50 kg Bag"],
    priceRange: "₹1,950",
    basePrice: 1950,
    unit: "50 kg Bag",
    description: "A highly concentrated source of phosphorus with a low pH, excellent for alkaline soils and early crop starter blends.",
    organic: false,
    rating: 4.8,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80",
    remainingStock: 15
  },
  {
    id: "prod-16",
    name: "Muriate of Potash (MOP)",
    category: "Fertilizers",
    subCategory: "Potassium Fertilizers",
    composition: "Potassium (K₂O) 60%",
    brandName: "IPL (Indian Potash Ltd)",
    target: "Water regulation, grain weight, disease resistance",
    dosage: "30-50 kg per acre in basal and flowering split",
    packSizes: ["50 kg Bag"],
    priceRange: "₹1,700",
    basePrice: 1700,
    unit: "50 kg Bag",
    description: "The most popular source of potassium. Essential for starch translocation, drought resilience, and optimal fruit/grain filling.",
    organic: false,
    rating: 4.8,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1592176372045-2d4e9ae60c6d?auto=format&fit=crop&w=400&q=80",
    remainingStock: 22
  },
  {
    id: "prod-17",
    name: "Sulphate of Potash (SOP)",
    category: "Fertilizers",
    subCategory: "Potassium Fertilizers",
    composition: "Potassium (K₂O) 50%, Sulphur 18%",
    brandName: "IPL / GSFC",
    target: "Chloride-sensitive crops (tobacco, potato, grapes, fruits)",
    dosage: "40-50 kg per acre in split doses",
    packSizes: ["50 kg Bag"],
    priceRange: "₹2,400",
    basePrice: 2400,
    unit: "50 kg Bag",
    description: "Premium potassium source without chloride. Highly beneficial for raising fruit quality, sugar levels, and shelf life.",
    organic: false,
    rating: 4.7,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    remainingStock: 10
  },
  {
    id: "prod-18",
    name: "Potassium Nitrate",
    category: "Fertilizers",
    subCategory: "Potassium Fertilizers",
    composition: "Nitrogen 13%, Potassium (K₂O) 45%",
    brandName: "Mahadhan / Coromandel",
    target: "Foliar nutrient boost during active fruiting, rapid potassic absorption",
    dosage: "10-15g per Liter of water as foliar spray",
    packSizes: ["1 kg Pack"],
    priceRange: "₹220",
    basePrice: 220,
    unit: "1 kg Pack",
    description: "100% water-soluble crystalline fertilizer. Combines nitrate nitrogen with chloride-free potassium for superb crop finishing.",
    organic: false,
    rating: 4.9,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80",
    remainingStock: 35
  },
  {
    id: "prod-19",
    name: "NPK 10:26:26",
    category: "Fertilizers",
    subCategory: "Complex (NPK) Fertilizers",
    composition: "Nitrogen 10%, Phosphorus 26%, Potassium 26%",
    brandName: "IFFCO / Coromandel GROMOR",
    target: "Root establishment, fruit/pod sizing, potash-heavy soils",
    dosage: "50 kg per acre basal dose",
    packSizes: ["50 kg Bag"],
    priceRange: "₹1,470",
    basePrice: 1470,
    unit: "50 kg Bag",
    description: "Balanced high-analysis compound fertilizer offering rich phosphatic and potassic levels for high-yield crops.",
    organic: false,
    rating: 4.8,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1574313960913-c582e7890f08?auto=format&fit=crop&w=400&q=80",
    remainingStock: 28
  },
  {
    id: "prod-20",
    name: "NPK 12:32:16",
    category: "Fertilizers",
    subCategory: "Complex (NPK) Fertilizers",
    composition: "Nitrogen 12%, Phosphorus 32%, Potassium 16%",
    brandName: "IFFCO / Mahadhan",
    target: "Cereals, sugarcane, root-heavy cash crops",
    dosage: "50 kg per acre as basal dose",
    packSizes: ["50 kg Bag"],
    priceRange: "₹1,450",
    basePrice: 1450,
    unit: "50 kg Bag",
    description: "Highly effective basal blend containing high phosphorus ratio alongside primary nitrogen and potassium.",
    organic: false,
    rating: 4.8,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80",
    remainingStock: 30
  },
  {
    id: "prod-21",
    name: "NPK 19:19:19",
    category: "Fertilizers",
    subCategory: "Complex (NPK) Fertilizers",
    composition: "Nitrogen 19%, Phosphorus 19%, Potassium 19%",
    brandName: "Tata Paras / Mahadhan",
    target: "All crops, uniform growth stages, drip irrigation fertigation",
    dosage: "5g per Liter of water as foliar spray",
    packSizes: ["1 kg Pack"],
    priceRange: "₹140",
    basePrice: 140,
    unit: "1 kg Pack",
    description: "Perfectly balanced, fully soluble premium fertilizer. Promotes healthy vegetative, root, and flowering nodes simultaneously.",
    organic: false,
    rating: 4.9,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1416879595882-3373a0480b5b?auto=format&fit=crop&w=400&q=80",
    remainingStock: 50
  },
  {
    id: "prod-22",
    name: "NPK 20:20:0:13",
    category: "Fertilizers",
    subCategory: "Complex (NPK) Fertilizers",
    composition: "Nitrogen 20%, Phosphorus 20%, Potassium 0%, Sulphur 13%",
    brandName: "Coromandel / GSFC",
    target: "Sulphur deficient soils, oilseeds, mustard, groundnut",
    dosage: "50 kg per acre basal dose",
    packSizes: ["50 kg Bag"],
    priceRange: "₹1,240",
    basePrice: 1240,
    unit: "50 kg Bag",
    description: "An excellent compound fertilizer delivering nitrogen, high-grade phosphorus, and substantial sulphur for high seed oil content.",
    organic: false,
    rating: 4.7,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1585320806297-9794b3e4eeae?auto=format&fit=crop&w=400&q=80",
    remainingStock: 15
  },
  {
    id: "prod-23",
    name: "NPK 17:17:17",
    category: "Fertilizers",
    subCategory: "Complex (NPK) Fertilizers",
    composition: "Nitrogen 17%, Phosphorus 17%, Potassium 17%",
    brandName: "FACT / SPIC",
    target: "Uniform balanced nutrition, high recovery soils",
    dosage: "50 kg per acre as basal or first top dressing",
    packSizes: ["50 kg Bag"],
    priceRange: "₹1,320",
    basePrice: 1320,
    unit: "50 kg Bag",
    description: "Standard balanced NPK mixture, popular across southern and western states for commercial orchards and food grains.",
    organic: false,
    rating: 4.6,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1592176372045-2d4e9ae60c6d?auto=format&fit=crop&w=400&q=80",
    remainingStock: 19
  },
  {
    id: "prod-24",
    name: "NPK 15:15:15",
    category: "Fertilizers",
    subCategory: "Complex (NPK) Fertilizers",
    composition: "Nitrogen 15%, Phosphorus 15%, Potassium 15%",
    brandName: "Rashtriya Chemicals & Fertilizers (Suphala)",
    target: "Balanced primary nutrients, general farm application",
    dosage: "50 kg per acre basal dose",
    packSizes: ["50 kg Bag"],
    priceRange: "₹1,200",
    basePrice: 1200,
    unit: "50 kg Bag",
    description: "Classic 'Suphala' formulation, extremely popular for providing immediate and sustained macro-nutrients.",
    organic: false,
    rating: 4.7,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=400&q=80",
    remainingStock: 24
  },
  {
    id: "prod-25",
    name: "Zinc Sulphate (33% Zn, 15% S)",
    category: "Fertilizers",
    subCategory: "Micronutrients",
    composition: "Zinc 33%, Sulphur 15%",
    brandName: "Aries Chelamin",
    target: "Khaira disease in paddy, leaf bronzing, enzyme activation",
    dosage: "5-10 kg per acre basal application",
    packSizes: ["5 kg Pack", "10 kg Pack"],
    priceRange: "₹380",
    basePrice: 380,
    unit: "5 kg Pack",
    description: "Highly pure zinc sulphate heptahydrate. Corrects zinc deficiency instantly, preventing stunted growth and yellowing of mid-ribs.",
    organic: false,
    rating: 4.8,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1599599810769-bcde5a160d32?auto=format&fit=crop&w=400&q=80",
    remainingStock: 25
  },
  {
    id: "prod-26",
    name: "Premium Vermicompost (Rich Organic Matter)",
    category: "Fertilizers",
    subCategory: "Organic Fertilizers",
    composition: "Organic Carbon, NPK 1.5%, Humic substances",
    brandName: "AgriOrganic",
    target: "Soil texture improvement, microbial population, root aeration",
    dosage: "200-500 kg per acre basal application",
    packSizes: ["50 kg Bag"],
    priceRange: "₹450",
    basePrice: 450,
    unit: "50 kg Bag",
    description: "Earthworm-processed premium organic manure loaded with rich humic acids, beneficial micro-flora, and enzymes.",
    organic: true,
    rating: 4.9,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1592176372045-2d4e9ae60c6d?auto=format&fit=crop&w=400&q=80",
    remainingStock: 50
  },
  {
    id: "prod-27",
    name: "Magnesium Sulphate (Epsom Salt)",
    category: "Fertilizers",
    subCategory: "Micronutrients",
    composition: "Magnesium 9.6%, Sulphur 12%",
    brandName: "Coromandel",
    target: "Chlorophyll synthesis, leaf greening, potato starch enhancement",
    dosage: "10-15 kg per acre basal or foliar spray",
    packSizes: ["25 kg Bag"],
    priceRange: "₹550",
    basePrice: 550,
    unit: "25 kg Bag",
    description: "Highly soluble crystalline magnesium sulphate. Boosts photosynthesis rate and treats magnesium deficiency (interveinal chlorosis).",
    organic: false,
    rating: 4.7,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1622383563227-04401ab4e5ea?auto=format&fit=crop&w=400&q=80",
    remainingStock: 18
  },
  {
    id: "prod-28",
    name: "Pure Neem Cake Powder (Organic N-Saver)",
    category: "Fertilizers",
    subCategory: "Organic Fertilizers",
    composition: "Neem cake containing Azadirachtin, organic nitrogen 5%",
    brandName: "Krishi Bio",
    target: "Nematode control, soil pests, natural nitrogen slow release",
    dosage: "100-150 kg per acre mixed in soil",
    packSizes: ["40 kg Bag"],
    priceRange: "₹650",
    basePrice: 650,
    unit: "40 kg Bag",
    description: "De-oiled organic neem seed residue. Acts as a natural nematicide, soil disinfectant, and organic fertilizer stabilizer.",
    organic: true,
    rating: 4.8,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=400&q=80",
    remainingStock: 20
  },
  {
    id: "prod-29",
    name: "Concentrated Humic Acid (98% Soluble)",
    category: "Fertilizers",
    subCategory: "Micronutrients",
    composition: "Humic Acid 65%, Fulvic Acid 15%, Potassium Humate 18%",
    brandName: "AgriOrganic",
    target: "Nutrient uptake, root system elongation, fertilizer efficiency",
    dosage: "500g - 1kg per acre with drip or drenching",
    packSizes: ["1 kg Pack"],
    priceRange: "₹480",
    basePrice: 480,
    unit: "1 kg Pack",
    description: "Premium bio-stimulant. Dramatically improves root development, soil moisture retention, and mineral chelation.",
    organic: true,
    rating: 4.9,
    availability: "In Stock",
    image: "https://images.unsplash.com/photo-1530595467537-0b5996c41f2d?auto=format&fit=crop&w=400&q=80",
    remainingStock: 35
  }
];

// Fallback visual mockups for products when external images fail to load
function ProductCardImage({ src, alt, prod, className = "w-full h-full object-cover" }: { src: string; alt: string; prod: any; className?: string }) {
  const [hasError, setHasError] = React.useState(false);

  if (hasError || !src) {
    const isPesticide = prod.category === "Pesticides";
    const isOrganic = prod.organic;
    
    return (
      <div className={`w-full h-full flex flex-col items-center justify-between p-4 bg-gradient-to-br ${
        isOrganic 
          ? "from-emerald-800 to-green-950 text-emerald-100" 
          : isPesticide 
            ? "from-rose-900 via-slate-900 to-slate-950 text-rose-100" 
            : "from-blue-900 via-slate-900 to-emerald-950 text-blue-100"
      }`}>
        <div className="w-full flex justify-between items-center text-[9px] font-mono tracking-widest opacity-70">
          <span>{prod.category.toUpperCase()}</span>
          <span>{prod.packSizes?.[0] || prod.unit}</span>
        </div>
        
        <div className="flex flex-col items-center justify-center space-y-2 my-2 text-center">
          {isOrganic ? (
            <Leaf className="w-10 h-10 text-emerald-400 animate-pulse" />
          ) : isPesticide ? (
            <FlaskConical className="w-10 h-10 text-rose-400" />
          ) : (
            <Sprout className="w-10 h-10 text-teal-400" />
          )}
          <span className="font-sans font-extrabold text-[11px] leading-tight max-w-[150px] line-clamp-1">
            {prod.brandName}
          </span>
          <span className="font-mono text-[9px] opacity-75 max-w-[140px] line-clamp-1">
            {prod.composition}
          </span>
        </div>

        <div className="w-full bg-black/30 backdrop-blur-xs py-1 px-2 rounded text-[9px] font-mono text-center truncate">
          {prod.organic ? "BIO-PROTECTIVE" : isPesticide ? "HIGHLY EFFECTIVE" : "PREMIUM MACRO-NUTRIENT"}
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
      className={className}
    />
  );
}

function CartItemImage({ src, alt, prod }: { src: string; alt: string; prod: any }) {
  const [hasError, setHasError] = React.useState(false);

  if (hasError || !src) {
    const isPesticide = prod.category === "Pesticides";
    const isOrganic = prod.organic;
    return (
      <div className={`w-16 h-16 rounded-lg flex flex-col items-center justify-center p-1 bg-gradient-to-br text-center shrink-0 ${
        isOrganic 
          ? "from-emerald-800 to-green-950 text-emerald-100" 
          : isPesticide 
            ? "from-rose-900 to-slate-950 text-rose-100" 
            : "from-blue-900 to-emerald-950 text-blue-100"
      }`}>
        {isOrganic ? (
          <Leaf className="w-5 h-5 text-emerald-400" />
        ) : isPesticide ? (
          <FlaskConical className="w-5 h-5 text-rose-400" />
        ) : (
          <Sprout className="w-5 h-5 text-teal-400" />
        )}
        <span className="text-[7px] font-black tracking-tighter uppercase truncate w-full mt-0.5">{prod.brandName.split(" ")[0]}</span>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      onError={() => setHasError(true)}
      referrerPolicy="no-referrer"
      className="w-16 h-16 object-cover rounded-lg border border-slate-200 bg-white shrink-0"
    />
  );
}

const ADVISOR_SOIL_VARIETIES = [
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
    marketPricePerKg: 42,
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
    marketPricePerKg: 72,
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
    marketPricePerKg: 85,
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
    marketPricePerKg: 54,
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
    marketPricePerKg: 38,
    description: "Permeable and rich in iron oxides. Perfect for hardy drought crops."
  }
];

export default function PesticideFertilizerGuide({ 
  onNotify, 
  bookings, 
  setBookings, 
  initialTab,
  onRedirectTab
}: PesticideFertilizerGuideProps) {
  const [activeTab, setActiveTab] = useState<"catalog" | "protection" | "bookings">(initialTab || "catalog");

  // Dynamic Product State (for tracking remaining stock live)
  const [productsList, setProductsList] = useState(PRODUCT_VARIETIES);

  // Flipkart-style Cart State
  const [cart, setCart] = useState<Array<{ product: typeof PRODUCT_VARIETIES[0]; quantity: number }>>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);

  // Cart Checkout state
  const [isCartCheckingOut, setIsCartCheckingOut] = useState(false);
  const [cartAadhaar, setCartAadhaar] = useState("");
  const [cartLandID, setCartLandID] = useState("");
  const [cartCheckoutStatus, setCartCheckoutStatus] = useState<"idle" | "verifying" | "success">("idle");

  // Detailed Order Receipt State for Cart
  const [lastCheckoutCart, setLastCheckoutCart] = useState<Array<{ product: typeof PRODUCT_VARIETIES[0]; quantity: number }>>([]);
  const [lastCheckoutAadhaar, setLastCheckoutAadhaar] = useState("");
  const [lastCheckoutLandID, setLastCheckoutLandID] = useState("");
  const [lastCheckoutOrderID, setLastCheckoutOrderID] = useState("");
  const [lastCheckoutDate, setLastCheckoutDate] = useState("");

  const addToCart = (prod: typeof PRODUCT_VARIETIES[0]) => {
    const existingIndex = cart.findIndex(item => item.product.id === prod.id);
    const currentStock = productsList.find(p => p.id === prod.id)?.remainingStock ?? 0;

    if (currentStock <= 0) {
      onNotify(`${prod.name} is currently out of stock!`, "error");
      return;
    }

    if (existingIndex > -1) {
      const currentQty = cart[existingIndex].quantity;
      if (currentQty >= currentStock) {
        onNotify(`Cannot add more. Only ${currentStock} units are available in stock.`, "error");
        return;
      }
      const newCart = [...cart];
      newCart[existingIndex].quantity += 1;
      setCart(newCart);
      onNotify(`Increased ${prod.name} quantity to ${newCart[existingIndex].quantity} in Cart`, "success");
    } else {
      setCart([...cart, { product: prod, quantity: 1 }]);
      onNotify(`Added ${prod.name} to Cart`, "success");
    }
  };

  const updateCartQty = (prodId: string, delta: number) => {
    const existingIndex = cart.findIndex(item => item.product.id === prodId);
    if (existingIndex === -1) return;

    const currentStock = productsList.find(p => p.id === prodId)?.remainingStock ?? 0;
    const newCart = [...cart];
    const newQty = newCart[existingIndex].quantity + delta;

    if (newQty <= 0) {
      const removedName = newCart[existingIndex].product.name;
      newCart.splice(existingIndex, 1);
      setCart(newCart);
      onNotify(`Removed ${removedName} from Cart`, "info");
      return;
    }

    if (newQty > currentStock) {
      onNotify(`Only ${currentStock} units available in stock.`, "error");
      return;
    }

    newCart[existingIndex].quantity = newQty;
    setCart(newCart);
  };

  const removeFromCart = (prodId: string) => {
    const removedItem = cart.find(item => item.product.id === prodId);
    setCart(cart.filter(item => item.product.id !== prodId));
    if (removedItem) {
      onNotify(`Removed ${removedItem.product.name} from Cart`, "info");
    }
  };

  const handleCartCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAadhaar = cartAadhaar.replace(/\D/g, "");
    if (cleanAadhaar.length !== 12) {
      onNotify("Please enter a valid 12-digit Aadhaar Card number.", "error");
      return;
    }

    setCartCheckoutStatus("verifying");
    setTimeout(() => {
      // Deduct stock
      const updatedProducts = productsList.map(p => {
        const cartItem = cart.find(item => item.product.id === p.id);
        if (cartItem) {
          const newStock = Math.max(0, p.remainingStock - cartItem.quantity);
          return {
            ...p,
            remainingStock: newStock,
            availability: newStock === 0 ? "Out of Stock" : "In Stock"
          };
        }
        return p;
      });

      setProductsList(updatedProducts);
      // Save details for receipt
      setLastCheckoutCart([...cart]);
      setLastCheckoutAadhaar(cartAadhaar);
      setLastCheckoutLandID(cartLandID || "N/A");
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const generatedOrderID = `PACS/2026/CRT/${randNum}`;
      const generatedDate = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
      setLastCheckoutOrderID(generatedOrderID);
      setLastCheckoutDate(generatedDate);

      // Append to bookings list
      const totalPayable = cart.reduce((sum, item) => sum + (item.quantity * item.product.basePrice), 0);
      const newBooking = {
        id: `b-cart-${Date.now()}`,
        orderId: generatedOrderID,
        date: generatedDate,
        aadhaar: cartAadhaar ? `XXXX XXXX ${cartAadhaar.replace(/\s/g, "").slice(-4)}` : "XXXX XXXX 8945",
        landId: cartLandID || "N/A",
        items: [...cart],
        totalAmount: totalPayable,
        status: "Ready for Pickup" as const,
        pickupPoint: "Amravati Cooperative Center, Warehouse #2"
      };
      setBookings(prev => [newBooking, ...prev]);

      setCartCheckoutStatus("success");
      onNotify("PACS Subsidized Order Placed Successfully!", "success");
      setCart([]);
    }, 1500);
  };
  
  // Product Catalog Filter State
  const [catalogCategory, setCatalogCategory] = useState<"All" | "NPK" | "Nitrogen" | "Phosphorus" | "Potassium" | "Micronutrients" | "Organic" | "Pesticides">("All");
  const [catalogSearch, setCatalogSearch] = useState("");
  const [organicOnly, setOrganicOnly] = useState(false);
  const [filterBrand, setFilterBrand] = useState<string>("All");
  const [filterInStock, setFilterInStock] = useState<boolean>(false);
  const [filterSubsidized, setFilterSubsidized] = useState<boolean>(false);
  const [filterPrice, setFilterPrice] = useState<number>(2500);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [sortBy, setSortBy] = useState<"popular" | "price-low" | "price-high" | "rating" | "stock">("popular");

  // Crop Nutrition Deficiency Planner State
  const [selectedNutritionSymptom, setSelectedNutritionSymptom] = useState<string | null>(null);

  const handleResetFilters = () => {
    setCatalogCategory("All");
    setCatalogSearch("");
    setOrganicOnly(false);
    setFilterBrand("All");
    setFilterInStock(false);
    setFilterSubsidized(false);
    setFilterPrice(2500);
    setSortBy("popular");
    onNotify("All filters reset successfully", "info");
  };

  const toggleFavorite = (prodId: string) => {
    if (favorites.includes(prodId)) {
      setFavorites(favorites.filter(id => id !== prodId));
      onNotify("Removed from Favorites", "info");
    } else {
      setFavorites([...favorites, prodId]);
      onNotify("Added to Favorites", "success");
    }
  };

  // Dynamic Land Cost Estimator State
  const [calcCostProductId, setCalcCostProductId] = useState<string | null>(null);
  const [costAcreage, setCostAcreage] = useState<number>(1.5);
  const [estimatedCost, setEstimatedCost] = useState<{
    packsNeeded: number;
    totalPrice: number;
  } | null>(null);

  // PACS Cooperative simulated checkout state
  const [checkoutProduct, setCheckoutProduct] = useState<typeof PRODUCT_VARIETIES[0] | null>(null);
  const [checkoutQuantity, setCheckoutQuantity] = useState<number>(1);
  const [checkoutAadhaar, setCheckoutAadhaar] = useState("");
  const [checkoutLandID, setCheckoutLandID] = useState("");
  const [checkoutStatus, setCheckoutStatus] = useState<"idle" | "verifying" | "success">("idle");
  const [singleCheckoutOrderID, setSingleCheckoutOrderID] = useState("");
  const [singleCheckoutDate, setSingleCheckoutDate] = useState("");

  // My Bookings Ledger & Quick-Book States
  const [bookingFilterStatus, setBookingFilterStatus] = useState<string>("All");
  const [bookingSearchQuery, setBookingSearchQuery] = useState<string>("");
  const [quickBookProdId, setQuickBookProdId] = useState<string>(PRODUCT_VARIETIES[0].id);
  const [quickBookQty, setQuickBookQty] = useState<number>(1);
  const [quickBookAadhaar, setQuickBookAadhaar] = useState<string>("");
  const [quickBookLandID, setQuickBookLandID] = useState<string>("");

  // NPK Calculator State
  const [calcCrop, setCalcCrop] = useState<string>("Paddy");
  const [calcAcres, setCalcAcres] = useState<number>(1);
  const [fertilizerResults, setFertilizerResults] = useState<{
    n: number; p: number; k: number;
    urea: number; dap: number; mop: number;
  } | null>(null);

  // Soil & Crop Advisor Tab states
  const [advisorSoilType, setAdvisorSoilType] = useState<string>("clay");
  const [advisorLandSize, setAdvisorLandSize] = useState<number>(2);
  const [isAdvisorPlanting, setIsAdvisorPlanting] = useState<boolean>(false);

  const handleAdvisorPlant = async (
    cropName: string,
    variety: string,
    landSize: number,
    soilName: string,
    yieldKg: number
  ) => {
    try {
      setIsAdvisorPlanting(true);
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
        onNotify(`Successfully registered ${cropName} on your land!`, "success");
        if (onRedirectTab) {
          onRedirectTab("crops");
        }
      } else {
        onNotify("Failed to plant recommended crop.", "error");
      }
    } catch (err) {
      onNotify("Error communicating with farming database.", "error");
    } finally {
      setIsAdvisorPlanting(false);
    }
  };

  // Crop Protection state
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCrop, setFilterCrop] = useState("All");

  // AI Assistant state
  const [chatInput, setChatInput] = useState("");
  const [chatHistory, setChatHistory] = useState<Array<{ sender: "user" | "ai"; text: string }>>([
    {
      sender: "ai",
      text: "Hello! I am your Pesticide & Fertilizer Agronomy Expert. Ask me anything about pest control schedules, active chemical dosages, organic remedies, or nutrient deficiency signs in your fields."
    }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Trigger Land Cost Estimation
  const calculateProductCost = (prod: typeof PRODUCT_VARIETIES[0], acres: number) => {
    if (acres <= 0) return;
    
    // Simple dynamic calculation rule base:
    // Some are measured in packs/acre, some are fixed bags
    let multiplier = 1;
    if (prod.id === "prod-1") multiplier = 1; // 1 bottle (60ml) per acre
    else if (prod.id === "prod-2") multiplier = 1; // 1 pack per acre
    else if (prod.id === "prod-3") multiplier = 2; // 2 packs per acre for thorough drench
    else if (prod.id === "prod-4") multiplier = 1; // 1 bottle per acre
    else if (prod.id === "prod-5") multiplier = 1.5; // 1.5 L per acre
    else if (prod.id === "prod-6") multiplier = 2; // 2 kg per acre
    else if (prod.id === "prod-7") multiplier = 2.5; // ~2.5 bags Urea per acre
    else if (prod.id === "prod-8") multiplier = 1.5; // ~1.5 bags DAP per acre
    else if (prod.id === "prod-9") multiplier = 1; // 1 bag MOP per acre
    else if (prod.id === "prod-10") multiplier = 3; // 3 packs soluble per acre
    else if (prod.id === "prod-11") multiplier = 3; // 3 bags SSP per acre
    else if (prod.id === "prod-12") multiplier = 6; // 6 bags compost per acre

    const packsNeeded = Math.ceil(acres * multiplier);
    const totalPrice = packsNeeded * prod.basePrice;

    setEstimatedCost({
      packsNeeded,
      totalPrice
    });
  };

  const handleCalculate = (e: React.FormEvent) => {
    e.preventDefault();
    if (calcAcres <= 0) {
      onNotify("Land size must be greater than 0 acres", "error");
      return;
    }

    // Recommended nutrient rates in kg per acre
    let recN = 50;
    let recP = 25;
    let recK = 25;

    switch (calcCrop) {
      case "Paddy":
        recN = 50; recP = 25; recK = 25;
        break;
      case "Cotton":
        recN = 40; recP = 20; recK = 20;
        break;
      case "Wheat":
        recN = 50; recP = 25; recK = 12;
        break;
      case "Maize":
        recN = 60; recP = 30; recK = 20;
        break;
      case "Vegetables":
        recN = 30; recP = 30; recK = 30;
        break;
      case "Turmeric":
        recN = 60; recP = 25; recK = 36;
        break;
    }

    const totalNNeeded = recN * calcAcres;
    const totalPNeeded = recP * calcAcres;
    const totalKNeeded = recK * calcAcres;

    // DAP supplies 18% N and 46% P.
    // MOP supplies 60% K.
    // Urea supplies 46% N.
    const dapNeeded = totalPNeeded / 0.46;
    const nFromDap = dapNeeded * 0.18;
    const remainingN = Math.max(0, totalNNeeded - nFromDap);
    const ureaNeeded = remainingN / 0.46;
    const mopNeeded = totalKNeeded / 0.60;

    setFertilizerResults({
      n: Math.round(totalNNeeded),
      p: Math.round(totalPNeeded),
      k: Math.round(totalKNeeded),
      urea: Math.round(ureaNeeded * 10) / 10,
      dap: Math.round(dapNeeded * 10) / 10,
      mop: Math.round(mopNeeded * 10) / 10,
    });

    onNotify(`Nutrient map computed for ${calcAcres} acres of ${calcCrop}!`, "success");
  };

  // Submit AI Assistant message
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMessage = chatInput.trim();
    setChatHistory(prev => [...prev, { sender: "user", text: userMessage }]);
    setChatInput("");
    setIsAiLoading(true);

    try {
      const response = await fetch("/api/pesticide-advisory", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: userMessage })
      });

      if (response.ok) {
        const data = await response.json();
        setChatHistory(prev => [...prev, { sender: "ai", text: data.reply }]);
      } else {
        throw new Error("API error");
      }
    } catch (err) {
      console.error(err);
      setChatHistory(prev => [
        ...prev,
        {
          sender: "ai",
          text: `For pest control regarding your query, we strongly recommend:
1. **Soil & Leaf treatment**: Spraying 10% Neem Seed Kernel Extract (NSKE) or introducing organic Trichoderma liquid culture.
2. **Standard Chemical Dose**: If infestation is above the Economic Threshold Level (ETL), spray Chlorantraniliprole 18.5% SC (Coragen) at 60ml/acre in 200L water.
3. **Important Safety Precautions**: Avoid spraying on windy days, wear full respiratory protection, and respect a 20-day pre-harvest waiting period (PHI).`
        }
      ]);
    } finally {
      setIsAiLoading(false);
    }
  };

  // Advanced product filtering based on left-panel inputs and category tabs
  const filteredProducts = productsList.filter(prod => {
    // 1. Horizontal Category Tabs mapping
    let matchesCategory = true;
    if (catalogCategory === "All") {
      matchesCategory = true;
    } else if (catalogCategory === "Pesticides") {
      matchesCategory = prod.category === "Pesticides";
    } else if (catalogCategory === "NPK") {
      matchesCategory = prod.category === "Fertilizers" && (prod.subCategory === "Complex (NPK) Fertilizers" || prod.name.includes("NPK"));
    } else if (catalogCategory === "Nitrogen") {
      matchesCategory = prod.category === "Fertilizers" && (prod.subCategory === "Nitrogen Fertilizers" || prod.composition.includes("Nitrogen") || prod.name.includes("Urea") || prod.name.includes("Ammonium"));
    } else if (catalogCategory === "Phosphorus") {
      matchesCategory = prod.category === "Fertilizers" && (prod.subCategory === "Phosphorus Fertilizers" || prod.name.includes("DAP") || prod.name.includes("Phosphate") || prod.name.includes("SSP") || prod.name.includes("TSP") || prod.name.includes("MAP"));
    } else if (catalogCategory === "Potassium") {
      matchesCategory = prod.category === "Fertilizers" && (prod.subCategory === "Potassium Fertilizers" || prod.name.includes("MOP") || prod.name.includes("SOP") || prod.name.includes("Potash") || prod.name.includes("Potassium") || prod.name.includes("Potassic"));
    } else if (catalogCategory === "Micronutrients") {
      matchesCategory = prod.subCategory === "Micronutrients" || prod.name.toLowerCase().includes("zinc") || prod.name.toLowerCase().includes("sulphate") || prod.name.toLowerCase().includes("magnesium") || prod.name.toLowerCase().includes("humic") || prod.name.toLowerCase().includes("boron") || prod.name.toLowerCase().includes("chelated");
    } else if (catalogCategory === "Organic") {
      matchesCategory = prod.organic === true;
    }

    // 2. Search query matching
    const matchesSearch = 
      prod.name.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      prod.brandName.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      prod.target.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      prod.composition.toLowerCase().includes(catalogSearch.toLowerCase());

    // 3. Bio-Organic Toggle filter
    const matchesOrganicToggle = !organicOnly || prod.organic;

    // 4. Sidebar: Crop selection matching
    const matchesCrop = filterCrop === "All" || prod.target.toLowerCase().includes(filterCrop.toLowerCase()) || prod.name.toLowerCase().includes(filterCrop.toLowerCase());

    // 5. Sidebar: Brand manufacturer selection matching
    const matchesBrand = filterBrand === "All" || prod.brandName.toLowerCase().includes(filterBrand.toLowerCase()) || prod.name.toLowerCase().includes(filterBrand.toLowerCase());

    // 6. Sidebar: Price ceiling slider
    const matchesPrice = prod.basePrice <= filterPrice;

    // 7. Sidebar: Stock availability checklist toggle
    const matchesInStock = !filterInStock || prod.remainingStock > 0;

    // 8. Sidebar: Subsidized price flag
    const matchesSubsidized = !filterSubsidized || prod.basePrice < 1000;

    return matchesCategory && matchesSearch && matchesOrganicToggle && matchesCrop && matchesBrand && matchesPrice && matchesInStock && matchesSubsidized;
  });

  // Dynamic sorting mechanism for product list
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    if (sortBy === "price-low") return a.basePrice - b.basePrice;
    if (sortBy === "price-high") return b.basePrice - a.basePrice;
    if (sortBy === "rating") return b.rating - a.rating;
    if (sortBy === "stock") return b.remainingStock - a.remainingStock;
    // Default popular sorting (composite score of stock and ratings)
    return b.rating * (b.remainingStock > 0 ? 2 : 1) - a.rating * (a.remainingStock > 0 ? 2 : 1);
  });

  const triggerCheckoutFlow = (prod: typeof PRODUCT_VARIETIES[0]) => {
    const currentStock = productsList.find(p => p.id === prod.id)?.remainingStock ?? 0;
    if (currentStock <= 0) {
      onNotify(`${prod.name} is currently out of stock!`, "error");
      return;
    }
    setCheckoutProduct(prod);
    setCheckoutQuantity(1);
    setCheckoutStatus("idle");
    setCheckoutAadhaar("");
    setCheckoutLandID("");
  };

  const handleCheckoutSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const cleanAadhaar = checkoutAadhaar.replace(/\D/g, "");
    if (cleanAadhaar.length !== 12) {
      onNotify("Please enter a valid 12-digit Aadhaar/Farmer UID.", "error");
      return;
    }
    const currentStock = productsList.find(p => p.id === checkoutProduct?.id)?.remainingStock ?? 0;
    if (checkoutQuantity > currentStock) {
      onNotify(`Not enough stock available. Only ${currentStock} items remaining.`, "error");
      return;
    }
    setCheckoutStatus("verifying");
    
    setTimeout(() => {
      setProductsList(prev => prev.map(p => {
        if (p.id === checkoutProduct?.id) {
          const newStock = Math.max(0, p.remainingStock - checkoutQuantity);
          return {
            ...p,
            remainingStock: newStock,
            availability: newStock === 0 ? "Out of Stock" : "In Stock"
          };
        }
        return p;
      }));
      const randNum = Math.floor(1000 + Math.random() * 9000);
      const generatedSingleOrderID = `PACS/2026/IND/${randNum}`;
      const generatedSingleDate = new Date().toLocaleString("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
        hour12: true
      });
      setSingleCheckoutOrderID(generatedSingleOrderID);
      setSingleCheckoutDate(generatedSingleDate);

      // Append to bookings list
      if (checkoutProduct) {
        const newBooking = {
          id: `b-single-${Date.now()}`,
          orderId: generatedSingleOrderID,
          date: generatedSingleDate,
          aadhaar: checkoutAadhaar ? `XXXX XXXX ${checkoutAadhaar.replace(/\s/g, "").slice(-4)}` : "XXXX XXXX 8945",
          landId: checkoutLandID || "AP-2839/V",
          items: [{ product: checkoutProduct, quantity: checkoutQuantity }],
          totalAmount: checkoutQuantity * checkoutProduct.basePrice,
          status: "Ready for Pickup" as const,
          pickupPoint: "Amravati Cooperative Center, Warehouse #2"
        };
        setBookings(prev => [newBooking, ...prev]);
      }

      setCheckoutStatus("success");
      onNotify(`Subsidized Booking Successful! Reserved ${checkoutQuantity} x ${checkoutProduct?.name}`, "success");
    }, 1500);
  };

  // Quick Book Product Details selector
  const selectedQuickProduct = productsList.find(p => p.id === quickBookProdId);

  // Filtered Bookings List
  const filteredBookingsList = bookings.filter(bk => {
    const matchesStatus = bookingFilterStatus === "All" || bk.status === bookingFilterStatus;
    const matchesSearch = bookingSearchQuery === "" || 
      bk.orderId.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
      bk.landId.toLowerCase().includes(bookingSearchQuery.toLowerCase()) ||
      bk.items.some(item => item.product.name.toLowerCase().includes(bookingSearchQuery.toLowerCase()));
    return matchesStatus && matchesSearch;
  });

  const handleQuickBookSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedQuickProduct) return;

    const cleanAadhaar = quickBookAadhaar.replace(/\D/g, "");
    if (cleanAadhaar.length !== 12) {
      onNotify("Please enter a valid 12-digit Aadhaar Card number.", "error");
      return;
    }

    if (quickBookQty > selectedQuickProduct.remainingStock) {
      onNotify(`Not enough stock available. Only ${selectedQuickProduct.remainingStock} items left in cooperative reserve.`, "error");
      return;
    }

    // Deduct stock
    setProductsList(prev => prev.map(p => {
      if (p.id === selectedQuickProduct.id) {
        const newStock = Math.max(0, p.remainingStock - quickBookQty);
        return {
          ...p,
          remainingStock: newStock,
          availability: newStock === 0 ? "Out of Stock" : "In Stock"
        };
      }
      return p;
    }));

    const randNum = Math.floor(1000 + Math.random() * 9000);
    const newOrderId = `PACS/2026/IND/${randNum}`;
    const newDate = new Date().toLocaleString("en-IN", {
      day: "2-digit",
      month: "short",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      hour12: true
    });

    const newBooking = {
      id: `b-quick-${Date.now()}`,
      orderId: newOrderId,
      date: newDate,
      aadhaar: `XXXX XXXX ${quickBookAadhaar.slice(-4)}`,
      landId: quickBookLandID || "AP-2839/V",
      items: [{ product: selectedQuickProduct, quantity: quickBookQty }],
      totalAmount: quickBookQty * selectedQuickProduct.basePrice,
      status: "Ready for Pickup" as const,
      pickupPoint: "Amravati Cooperative Center, Warehouse #2"
    };

    setBookings(prev => [newBooking, ...prev]);
    onNotify(`Reserved ${quickBookQty} x ${selectedQuickProduct.name} successfully!`, "success");

    // Reset fields
    setQuickBookQty(1);
    setQuickBookAadhaar("");
    setQuickBookLandID("");
  };

  return (
    <div className="space-y-6">
      {/* Top Navigation & Floating Cart Row */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-2" id="pacs-nav">
        {/* 3-Column Grid Tabs Interface */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-2 w-full md:max-w-3xl" id="pacs-tabs-pill-container">
          {[
            { id: "catalog", label: "Variety & Prices", icon: Sprout, desc: "Seeds & fertilizers list" },
            { id: "protection", label: "Pest Protocols", icon: FlaskConical, desc: "Pesticide & organic guides" },
            { id: "bookings", label: "My Orders", icon: FileText, desc: "PACS reservations history" },
          ].map((tab) => {
            const isActive = activeTab === tab.id;
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                id={`pill-tab-${tab.id}`}
                onClick={() => {
                  setActiveTab(tab.id as any);
                  if (tab.id === "catalog") {
                    setCalcCostProductId(null);
                  }
                }}
                className={`relative p-3 rounded-xl border text-left flex items-start gap-3 transition-all duration-300 cursor-pointer outline-none select-none ${
                  tab.id === "bookings" ? "col-span-2 sm:col-span-1 lg:col-span-1" : ""
                } ${
                  isActive 
                    ? "bg-[#0A4D3C] text-white border-[#0A4D3C] shadow-sm scale-[1.01]" 
                    : "bg-white text-slate-800 border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/10 hover:scale-[1.01] shadow-xs"
                }`}
              >
                <div className={`p-1.5 rounded-lg shrink-0 ${isActive ? "bg-white/10" : "bg-emerald-50"}`}>
                  <Icon className={`w-4 h-4 ${isActive ? "text-[#22C55E]" : "text-emerald-700"}`} />
                </div>
                <div className="min-w-0 flex-1">
                  <span className="text-[11px] md:text-xs font-bold block truncate leading-tight">{tab.label}</span>
                  <span className={`text-[9px] block leading-tight mt-0.5 truncate ${isActive ? "text-emerald-100/70" : "text-slate-400"}`}>
                    {tab.desc}
                  </span>
                </div>
                {tab.id === "bookings" && bookings.length > 0 && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-full min-w-[15px] h-3.5 flex items-center justify-center shadow-xs">
                    {bookings.length}
                  </span>
                )}
                {isActive && (
                  <motion.div
                    layoutId="activeTabIndicator"
                    className="absolute inset-0 border-2 border-[#22C55E] rounded-xl pointer-events-none"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            );
          })}
        </div>

        {/* Floating Yellow Cart Button */}
        <button
          id="pacs-cart-btn"
          onClick={() => setIsCartOpen(true)}
          className="bg-[#FACC15] hover:bg-[#FACC15]/90 hover:scale-102 active:scale-98 text-slate-900 px-4 py-2 rounded-full font-bold shadow-md flex items-center gap-2 transition-all cursor-pointer border border-[#FACC15] self-end md:self-auto"
        >
          <div className="relative">
            <ShoppingCart className="w-4 h-4 text-slate-900" />
            {cart.reduce((acc, item) => acc + item.quantity, 0) > 0 && (
              <span className="absolute -top-2.5 -right-2 bg-red-600 text-white text-[9px] font-black rounded-full h-4 w-4 flex items-center justify-center animate-pulse shadow-xs">
                {cart.reduce((sum, item) => sum + item.quantity, 0)}
              </span>
            )}
          </div>
          <span className="text-xs">Cart</span>
        </button>
      </div>

      {/* Main Content Card Container */}
      {activeTab === "catalog" && (
        <div className="bg-white border border-slate-200/60 rounded-3xl p-6 md:p-8 shadow-xs space-y-6" id="pacs-main-content-card">
          {/* Header & Subtitle, On the Right: Search Bar & Sort Dropdown */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-100" id="main-card-header">
            <div>
              <h2 className="text-xl font-bold text-slate-900 font-sans tracking-tight" id="main-card-title">Variety & Prices</h2>
              <p className="text-xs text-slate-500 mt-1" id="main-card-subtitle">Explore pesticides and fertilizers for better crop yield.</p>
            </div>
            
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full md:w-auto" id="main-card-catalog-controls">
              {/* Search Bar */}
              <div className="relative flex-grow sm:flex-grow-0 min-w-[200px] md:min-w-[260px]" id="main-search-wrapper">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                <input
                  id="catalog-search-input"
                  type="text"
                  placeholder="Search products..."
                  value={catalogSearch}
                  onChange={e => setCatalogSearch(e.target.value)}
                  className="w-full bg-slate-50 hover:bg-slate-100/60 focus:bg-white border border-slate-200 focus:border-emerald-600 rounded-xl pl-9 pr-4 py-2 text-xs transition font-semibold text-slate-800"
                />
              </div>
              {/* Sort Dropdown */}
              <select
                id="catalog-sort-select"
                value={sortBy}
                onChange={e => setSortBy(e.target.value as any)}
                className="bg-slate-50 hover:bg-slate-100/50 border border-slate-200 focus:border-emerald-600 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 cursor-pointer"
              >
                <option value="popular">Most Popular</option>
                <option value="price-low">Price: Low to High</option>
                <option value="price-high">Price: High to Low</option>
                <option value="rating">Top Rated</option>
                <option value="stock">In Stock First</option>
              </select>
            </div>
          </div>

          {/* Horizontal Category Cards */}
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-none" id="pacs-category-tabs">
            {[
              { id: "All", label: "All Products", colorText: "🌿" },
              { id: "NPK", label: "Fertilizers (NPK)", colorText: "🟢" },
              { id: "Nitrogen", label: "Nitrogen", colorText: "🟡" },
              { id: "Phosphorus", label: "Phosphorus", colorText: "🟣" },
              { id: "Potassium", label: "Potassium", colorText: "🟠" },
              { id: "Micronutrients", label: "Micronutrients", colorText: "💧" },
              { id: "Organic", label: "Organic", colorText: "🍃" },
              { id: "Pesticides", label: "Pesticides", colorText: "🛡️" }
            ].map((cat) => {
              const isActive = catalogCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  id={`category-tab-${cat.id}`}
                  onClick={() => setCatalogCategory(cat.id as any)}
                  className={`flex items-center gap-2 px-4 py-3 rounded-2xl border transition-all duration-300 hover:scale-102 active:scale-98 shrink-0 cursor-pointer ${
                    isActive 
                      ? "bg-emerald-50 border-emerald-500 text-emerald-950 font-bold shadow-xs" 
                      : "bg-slate-50 border-slate-200/80 text-slate-600 hover:border-slate-300 hover:bg-slate-100/50"
                  }`}
                >
                  <span className="text-sm">{cat.colorText}</span>
                  <span className="text-xs tracking-tight">{cat.label}</span>
                </button>
              );
            })}
          </div>

          {/* Catalog Split Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8" id="pacs-catalog-split-container">
            {/* Left Filter Panel */}
            <div className="lg:col-span-3 bg-slate-50 border border-slate-200/80 rounded-2xl p-5 space-y-6 self-start" id="pacs-filter-sidebar">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200/60">
                <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">Refine Products</h3>
                <button
                  id="filter-reset-btn"
                  onClick={handleResetFilters}
                  className="text-[10px] font-bold text-red-600 hover:text-red-700 hover:underline cursor-pointer"
                >
                  Reset All
                </button>
              </div>

              {/* Price Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="font-semibold text-slate-700">Max Price</span>
                  <span className="font-bold text-emerald-800 font-mono">₹{filterPrice}</span>
                </div>
                <input
                  id="price-range-slider"
                  type="range"
                  min="200"
                  max="2500"
                  step="50"
                  value={filterPrice}
                  onChange={(e) => setFilterPrice(parseInt(e.target.value))}
                  className="w-full accent-emerald-700 h-1.5 bg-slate-200 rounded-lg cursor-pointer"
                />
                <div className="flex justify-between text-[10px] text-slate-400 font-mono">
                  <span>₹200</span>
                  <span>₹2,500</span>
                </div>
              </div>

              {/* Crop Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Target Crop</label>
                <select
                  id="crop-filter-select"
                  value={filterCrop}
                  onChange={(e) => setFilterCrop(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 focus:border-emerald-600 cursor-pointer"
                >
                  <option value="All">All Crops</option>
                  <option value="Paddy">Paddy / Rice</option>
                  <option value="Cotton">Cotton</option>
                  <option value="Wheat">Wheat</option>
                  <option value="Maize">Maize</option>
                  <option value="Turmeric">Turmeric</option>
                  <option value="Vegetables">Vegetables</option>
                </select>
              </div>

              {/* Brand Selector */}
              <div className="space-y-1.5">
                <label className="block text-xs font-semibold text-slate-700">Brand / Manufacturer</label>
                <select
                  id="brand-filter-select"
                  value={filterBrand}
                  onChange={(e) => setFilterBrand(e.target.value)}
                  className="w-full bg-white border border-slate-200 rounded-lg p-2 text-xs font-bold text-slate-700 focus:border-emerald-600 cursor-pointer"
                >
                  <option value="All">All Brands</option>
                  <option value="IFFCO">IFFCO</option>
                  <option value="Aries">Aries Chelamin</option>
                  <option value="Coromandel">Coromandel</option>
                  <option value="Syngenta">Syngenta</option>
                  <option value="FMC">FMC</option>
                  <option value="AgriOrganic">AgriOrganic</option>
                  <option value="Krishi">Krishi Bio</option>
                  <option value="Rashtriya">Suphala / RCF</option>
                </select>
              </div>

              {/* Toggle Checkboxes */}
              <div className="space-y-3 pt-2">
                <label className="flex items-center space-x-2 text-xs text-slate-700 font-semibold cursor-pointer" id="label-filter-organic">
                  <input
                    id="checkbox-organic-only"
                    type="checkbox"
                    checked={organicOnly}
                    onChange={(e) => setOrganicOnly(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <Leaf className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Organic Bio-Inputs Only</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-slate-700 font-semibold cursor-pointer" id="label-filter-instock">
                  <input
                    id="checkbox-instock-only"
                    type="checkbox"
                    checked={filterInStock}
                    onChange={(e) => setFilterInStock(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <CheckCircle2 className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span>Show In-Stock Only</span>
                </label>

                <label className="flex items-center space-x-2 text-xs text-slate-700 font-semibold cursor-pointer" id="label-filter-subsidy">
                  <input
                    id="checkbox-subsidized-only"
                    type="checkbox"
                    checked={filterSubsidized}
                    onChange={(e) => setFilterSubsidized(e.target.checked)}
                    className="rounded text-emerald-600 focus:ring-emerald-500 w-4 h-4 cursor-pointer"
                  />
                  <Tag className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                  <span>Subsidized (Under ₹1,000)</span>
                </label>
              </div>
            </div>

            {/* Right Column: Product Cards Grid */}
            <div className="lg:col-span-9 space-y-8" id="pacs-catalog-right-grid">
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6" id="pacs-products-grid">
                {sortedProducts.map(prod => {
                  const isSelectedForAcreCost = calcCostProductId === prod.id;
                  const isFav = favorites.includes(prod.id);
                  const reviewsCount = Math.floor(45 + (prod.rating * 17) % 80);

                  return (
                    <motion.div 
                      key={prod.id} 
                      id={`product-card-${prod.id}`}
                      whileHover={{ y: -5 }}
                      className={`bg-white border rounded-2xl p-5 hover:shadow-md transition flex flex-col justify-between relative ${
                        prod.organic ? "border-emerald-100 bg-emerald-50/5 hover:border-emerald-500" : "border-slate-200 hover:border-emerald-700"
                      }`}
                    >
                      {/* Left: Category Badge, Right: Favorite icon */}
                      <div className="flex justify-between items-center mb-3">
                        <span className={`text-[9px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                          prod.organic ? "bg-emerald-100 text-emerald-800" : "bg-slate-100 text-slate-800"
                        }`}>
                          {prod.category}
                        </span>
                        <button
                          id={`heart-btn-${prod.id}`}
                          onClick={() => toggleFavorite(prod.id)}
                          className="p-1 rounded-full bg-slate-50 hover:bg-rose-50 text-slate-400 hover:text-rose-600 transition cursor-pointer"
                        >
                          <Heart className={`w-4 h-4 ${isFav ? "fill-rose-600 text-rose-600" : ""}`} />
                        </button>
                      </div>

                      {/* Product Image */}
                      <div className="relative w-full h-40 bg-slate-100 rounded-xl overflow-hidden mb-3.5 border border-slate-100 group shrink-0">
                        <ProductCardImage 
                          src={prod.image} 
                          alt={prod.name} 
                          prod={prod}
                          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        />
                        
                        {/* Stock badge overlay */}
                        <div className="absolute bottom-2 left-2 flex gap-1">
                          {prod.remainingStock <= 5 ? (
                            <span className="bg-red-600 text-white text-[10px] font-black px-2 py-0.5 rounded shadow-sm uppercase tracking-wider animate-pulse">
                              Only {prod.remainingStock} left!
                            </span>
                          ) : (
                            <span className="bg-slate-900/85 text-white text-[10px] font-bold px-2 py-0.5 rounded shadow-sm">
                              {prod.remainingStock} in stock
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-3 flex-grow">
                        {/* Brand Name & Star rating */}
                        <div className="flex items-center justify-between">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest font-mono">
                            {prod.brandName}
                          </span>
                          <div className="flex items-center space-x-1 text-amber-500 text-xs">
                            <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                            <span className="font-bold">{prod.rating}</span>
                            <span className="text-slate-400 text-[9px]">({reviewsCount})</span>
                          </div>
                        </div>

                        {/* Product Name */}
                        <div>
                          <h3 className="text-sm font-extrabold text-slate-900 leading-snug">{prod.name}</h3>
                          <p className="text-[10px] font-bold text-teal-700 uppercase tracking-wider mt-0.5">{prod.subCategory}</p>
                          <p className="text-[11px] text-slate-500 mt-1 line-clamp-2 leading-relaxed" title={prod.description}>
                            {prod.description}
                          </p>
                        </div>

                        {/* Technical Specifications Pills */}
                        <div className="space-y-1.5 pt-2 border-t border-slate-100">
                          <div className="flex justify-between text-[11px] leading-relaxed">
                            <span className="text-slate-400">Composition:</span>
                            <span className="font-semibold text-slate-700 truncate max-w-[150px]" title={prod.composition}>{prod.composition}</span>
                          </div>
                          <div className="flex justify-between text-[11px] leading-relaxed">
                            <span className="text-slate-400">Target/Focus:</span>
                            <span className="font-semibold text-slate-700 truncate max-w-[150px]" title={prod.target}>{prod.target}</span>
                          </div>
                          <div className="flex justify-between text-[11px] leading-relaxed">
                            <span className="text-slate-400">Recommended Dose:</span>
                            <span className="font-semibold text-emerald-800">{prod.dosage}</span>
                          </div>
                          <div className="flex justify-between text-[11px] leading-relaxed">
                            <span className="text-slate-400">Pack Available:</span>
                            <span className="font-mono text-slate-700">{prod.packSizes.join(" / ")}</span>
                          </div>
                        </div>
                      </div>

                      {/* BOTTOM PRICING BLOCK (Expressed clearly below each product!) */}
                      <div className="mt-5 pt-4 border-t border-slate-100 space-y-3">
                        <div className="flex justify-between items-baseline">
                          <div className="flex flex-col">
                            <span className="text-[9px] text-slate-400 font-bold uppercase tracking-widest">Cooperative Price</span>
                            <span className="text-slate-500 text-[10px] font-mono">Pack: {prod.unit}</span>
                          </div>
                          <div className="text-right">
                            {/* THE PRICE IS PROMINENTLY DISPLAYED BELOW HERE */}
                            <div className="text-lg font-black text-slate-900 font-mono tracking-tight">
                              {prod.priceRange}
                            </div>
                            <span className="text-[9px] text-emerald-700 font-bold bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-100">
                              {prod.organic ? "50% Organic Subsidy" : "PACS Controlled Price"}
                            </span>
                          </div>
                        </div>

                        {/* Interactive Action buttons */}
                        <div className="space-y-2">
                          <div className="flex gap-2">
                            {cart.some(item => item.product.id === prod.id) ? (
                              <button
                                id={`goto-cart-btn-${prod.id}`}
                                onClick={() => setIsCartOpen(true)}
                                className="flex-grow py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-xs font-extrabold transition flex items-center justify-center space-x-1.5 cursor-pointer border border-amber-400 shadow-xs"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Go to Cart ➔</span>
                              </button>
                            ) : (
                              <button
                                id={`add-to-cart-btn-${prod.id}`}
                                onClick={() => addToCart(prod)}
                                disabled={prod.remainingStock <= 0}
                                className="flex-grow py-1.5 bg-[#FACC15] hover:bg-[#FACC15]/90 disabled:bg-slate-100 disabled:text-slate-400 text-slate-950 rounded-lg text-xs font-extrabold transition flex items-center justify-center space-x-1.5 cursor-pointer border border-[#FACC15] shadow-xs"
                              >
                                <ShoppingCart className="w-3.5 h-3.5" />
                                <span>Add to Cart</span>
                              </button>
                            )}

                            <button
                              id={`reserve-btn-${prod.id}`}
                              onClick={() => triggerCheckoutFlow(prod)}
                              disabled={prod.remainingStock <= 0}
                              className="px-4 py-1.5 bg-emerald-700 hover:bg-emerald-800 disabled:bg-slate-200 disabled:text-slate-400 text-white rounded-lg text-xs font-bold transition flex items-center justify-center space-x-1.5 cursor-pointer shadow-xs"
                            >
                              <ShoppingBag className="w-3.5 h-3.5" />
                              <span>Reserve</span>
                            </button>
                          </div>

                          <button
                            id={`calc-cost-btn-${prod.id}`}
                            onClick={() => {
                              if (isSelectedForAcreCost) {
                                setCalcCostProductId(null);
                                setEstimatedCost(null);
                              } else {
                                setCalcCostProductId(prod.id);
                                calculateProductCost(prod, costAcreage);
                              }
                            }}
                            className={`w-full py-1 rounded-lg text-[10px] font-bold cursor-pointer transition border text-center ${
                              isSelectedForAcreCost 
                                ? "bg-amber-50 text-amber-800 border-amber-300" 
                                : "bg-slate-50 text-slate-500 border-slate-200 hover:bg-slate-100 hover:text-slate-700"
                            }`}
                          >
                            {isSelectedForAcreCost ? "Close Cost Estimator" : "Calculate Acreage Cost Estimate"}
                          </button>
                        </div>

                        {/* Expandable Area Costing Form */}
                        <AnimatePresence>
                          {isSelectedForAcreCost && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.2 }}
                              className="bg-slate-50 border border-slate-200 rounded-xl p-3 space-y-3.5 overflow-hidden"
                            >
                              <div className="flex justify-between items-center">
                                <span className="text-[10px] font-extrabold text-slate-700 uppercase font-mono">Area Cost Estimator</span>
                                <span className="text-[9px] text-emerald-700 font-bold">Standard Dose</span>
                              </div>

                              <div className="flex items-center gap-2">
                                <div className="relative flex-grow">
                                  <input
                                    id={`estimator-input-${prod.id}`}
                                    type="number"
                                    step="0.5"
                                    min="0.5"
                                    value={costAcreage}
                                    onChange={e => {
                                      const v = parseFloat(e.target.value) || 0.5;
                                      setCostAcreage(v);
                                      calculateProductCost(prod, v);
                                    }}
                                    className="w-full bg-white border border-slate-300 rounded-md p-1 px-2 text-xs font-mono font-bold focus:outline-emerald-600"
                                  />
                                  <span className="absolute right-2 top-1.5 text-[8px] font-bold text-slate-400">Acres</span>
                                </div>
                                <span className="text-slate-400 text-xs">➔</span>
                                <div className="bg-white px-2.5 py-1 rounded border border-slate-200 text-xs font-bold font-mono">
                                  {estimatedCost?.packsNeeded} units
                                </div>
                              </div>

                              {estimatedCost && (
                                <div className="pt-2 border-t border-slate-200 flex justify-between items-center">
                                  <span className="text-[10px] text-slate-500">Total Est. Price:</span>
                                  <span className="text-xs font-extrabold text-teal-800 font-mono">
                                    ₹{estimatedCost.totalPrice.toLocaleString("en-IN")}
                                  </span>
                                </div>
                              )}
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </motion.div>
                  );
                })}
              </div>

              {sortedProducts.length === 0 && (
                <div className="text-center py-16 bg-white border border-slate-200 rounded-2xl" id="no-products-found">
                  <FlaskConical className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-sm font-bold text-slate-800">No matching varieties found</p>
                  <p className="text-xs text-slate-400 mt-1">Try resetting the bio-organic filters or adjusting search terms.</p>
                </div>
              )}

              {/* Extra Sections (Recommended Products, Popular Brands, Recently Viewed, Trending, Seasonal, Subsidy) */}
              <div className="border-t border-slate-100 pt-8 space-y-8" id="extra-sections-container">
                {/* 🤖 AI Recommendation Banner */}
                <div className="p-5 bg-emerald-950 text-white rounded-2xl border border-emerald-800 flex items-start gap-4 shadow-sm" id="sec-ai-rec">
                  <Sparkles className="w-8 h-8 text-amber-300 shrink-0 animate-bounce" />
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-widest text-amber-300">Seasonal AI Recommendation Advisory</h4>
                    <p className="text-xs text-emerald-100 mt-1 leading-relaxed">
                      Based on active monsoon moisture cycles across India, applying highly-soluble **Neem Coated Urea** alongside premium **Vermicompost** creates a natural slow-release nitrogen barrier. This halts underground chemical leaching by up to 30% and keeps soil roots nourished.
                    </p>
                  </div>
                </div>

                {/* Government Subsidy Products & Trending Fertilizers (Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="sec-subsidy-and-trending">
                  {/* Government Subsidy Products */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5" id="subsidy-box">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Tag className="w-3.5 h-3.5 text-emerald-600" /> Government Subsidy Products (Under ₹1,000)
                    </h4>
                    <div className="space-y-3">
                      {productsList.filter(p => p.basePrice <= 800).slice(0, 3).map(p => (
                        <div key={p.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                          <div>
                            <p className="text-xs font-extrabold text-slate-800">{p.name}</p>
                            <span className="text-[10px] font-mono text-emerald-700 bg-emerald-50 px-1 rounded">₹{p.basePrice} / Bag</span>
                          </div>
                          <button
                            id={`add-subsidy-${p.id}`}
                            onClick={() => addToCart(p)}
                            className="bg-[#FACC15] hover:bg-[#FACC15]/90 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-xs cursor-pointer"
                          >
                            Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Trending Fertilizers */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5" id="trending-box">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3 flex items-center gap-1.5">
                      <Activity className="w-3.5 h-3.5 text-emerald-600" /> Trending Fertilizers (High Sowing Demand)
                    </h4>
                    <div className="space-y-3">
                      {productsList.slice(0, 3).map(p => (
                        <div key={p.id} className="flex justify-between items-center bg-white p-3 rounded-xl border border-slate-100">
                          <div>
                            <p className="text-xs font-extrabold text-slate-800">{p.name}</p>
                            <span className="text-[10px] text-slate-400">Stock: {p.remainingStock} units left</span>
                          </div>
                          <button
                            id={`add-trending-${p.id}`}
                            onClick={() => addToCart(p)}
                            className="bg-[#FACC15] hover:bg-[#FACC15]/90 text-slate-900 text-[10px] font-bold px-2 py-1 rounded shadow-xs cursor-pointer"
                          >
                            Add to Cart
                          </button>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Popular Brands & Seasonal Suggestions (Grid) */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="sec-brands-and-seasonal">
                  {/* Popular Brands */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5" id="popular-brands">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-3">Popular Cooperative Manufacturers</h4>
                    <div className="flex flex-wrap gap-2">
                      {["IFFCO", "Aries Chelamin", "Coromandel", "Syngenta", "FMC", "AgriOrganic", "Krishi Bio"].map((br) => (
                        <span 
                          key={br}
                          className="px-3 py-1.5 bg-white border border-slate-200 rounded-xl text-xs font-extrabold text-slate-700"
                        >
                          {br}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Seasonal Suggestions & Recently Viewed */}
                  <div className="bg-slate-50 border border-slate-200/60 rounded-2xl p-5" id="seasonal-suggestions">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Monsoon Seasonal Advisory</h4>
                    <p className="text-xs text-slate-600 leading-relaxed">
                      Always prioritize basal fertilization during clear morning schedules. Avoid chemical spraying or heavy top-dressing when high rain forecasts are registered to eliminate pesticide runoff.
                    </p>
                    <div className="mt-4 pt-3 border-t border-slate-200/60">
                      <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1.5">Recently Viewed Products</span>
                      <div className="flex gap-2">
                        <span className="text-[10px] font-semibold px-2 py-1 bg-white border border-slate-150 rounded-lg text-slate-700">SSP (Single Super Phosphate)</span>
                        <span className="text-[10px] font-semibold px-2 py-1 bg-white border border-slate-150 rounded-lg text-slate-700">NPK 19:19:19</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Cooperative Info Card */}
                <div className="bg-teal-50 border border-teal-200 rounded-2xl p-5 flex flex-col md:flex-row gap-4 items-start md:items-center justify-between text-teal-900" id="pacs-coop-info-row">
                  <div className="space-y-1">
                    <h4 className="text-xs font-bold uppercase tracking-wider font-mono flex items-center gap-1.5 text-teal-950">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" /> Local Agriculture Cooperative System (PACS)
                    </h4>
                    <p className="text-xs text-teal-900/85 max-w-3xl leading-relaxed">
                      All prices mentioned are government-certified controlled prices or directly subsidized up to 50% for bio-organic fertilizers. Check live availability, enter your Aadhaar ID below the reserve button, and pick up inputs from your nearest PACS godown.
                    </p>
                  </div>
                  <button
                    id="godown-btn"
                    onClick={() => {
                      onNotify("Nearest PACS Center: Amravati Cooperative Center, Warehouse #2", "info");
                    }}
                    className="px-4 py-2 bg-teal-800 text-white rounded-xl text-xs font-bold hover:bg-teal-900 transition whitespace-nowrap cursor-pointer"
                  >
                    Find Godown Location ➔
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}





      {/* Tab 2: Crop Protection Catalog */}
      {activeTab === "protection" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row gap-3 justify-between items-start sm:items-center">
            <div className="text-xs text-slate-500 max-w-md">
              A comprehensive chemical and biological pesticide reference mapping major crop pests to chemical treatments and organic bio-control agents.
            </div>
            <div className="flex gap-2 w-full sm:w-auto">
              <select
                value={filterCrop}
                onChange={e => setFilterCrop(e.target.value)}
                className="bg-slate-50 border border-slate-200 rounded-lg px-2 py-1.5 text-xs text-slate-700 cursor-pointer"
              >
                <option value="All">All Crops</option>
                <option value="Paddy">Paddy / Rice</option>
                <option value="Cotton">Cotton</option>
                <option value="Turmeric">Turmeric</option>
                <option value="Wheat">Wheat</option>
                <option value="Maize">Maize</option>
              </select>

              <div className="relative flex-grow sm:flex-grow-0">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
                <input
                  type="text"
                  placeholder="Search insect or symptom..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full sm:w-64 bg-slate-50 border border-slate-200 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-emerald-600 focus:bg-white"
                />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {PEST_CATALOG.filter(pest => {
              const matchesSearch = 
                pest.pestName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                pest.symptoms.toLowerCase().includes(searchQuery.toLowerCase());
              const matchesCrop = filterCrop === "All" || pest.crop === filterCrop;
              return matchesSearch && matchesCrop;
            }).map((pest) => (
              <div key={pest.id} className="bg-white border border-slate-200 rounded-xl p-5 hover:border-emerald-600 hover:shadow-sm transition flex flex-col justify-between">
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-100">
                      {pest.crop}
                    </span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      pest.severity === 'Critical' ? 'bg-red-50 text-red-700 border border-red-100' : 'bg-amber-50 text-amber-700 border border-amber-100'
                    }`}>
                      {pest.severity} Infestation Risk
                    </span>
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-slate-800">{pest.pestName}</h4>
                    <p className="text-xs text-slate-500 mt-1 leading-normal">
                      <strong className="text-slate-700">Diagnostics:</strong> {pest.symptoms}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100 text-xs">
                    <div>
                      <span className="text-[9px] text-emerald-700 uppercase tracking-wider font-bold block">Chemical Control (Standard)</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{pest.chemicalName}</p>
                    </div>
                    <div className="border-t border-slate-200/50 pt-2">
                      <span className="text-[9px] text-amber-700 uppercase tracking-wider font-bold block">Organic Biological Alternative</span>
                      <p className="text-slate-700 mt-0.5">{pest.organicAlternative}</p>
                    </div>
                  </div>
                </div>

                <div className="flex justify-between items-center mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-400">
                  <span className="font-mono">Dosage: {pest.dosage}</span>
                  <span className="font-semibold text-rose-700 flex items-center gap-1">
                    <BadgeAlert className="w-3.5 h-3.5" />
                    <span>PHI: {pest.phi}</span>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}



      {/* Tab 4: My Bookings & Cooperative Quick-Book */}
      {activeTab === "bookings" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quick-Book Direct Form Section */}
          <div className="lg:col-span-1 space-y-4">
            <div className="bg-gradient-to-br from-emerald-950 to-teal-900 text-white rounded-2xl p-5 border border-emerald-800 shadow-sm relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />
              <div className="flex items-center space-x-2 mb-3">
                <Plus className="w-5 h-5 text-amber-300" />
                <h3 className="font-extrabold text-sm uppercase tracking-wide font-sans text-amber-300">Quick Subsidized Booking</h3>
              </div>
              <p className="text-xs text-emerald-100 leading-relaxed mb-4">
                Instantly secure state-subsidized chemical/organic products. Bypasses cart checkout for single-item emergency reservations.
              </p>

              <form onSubmit={handleQuickBookSubmit} className="space-y-4 text-slate-850">
                {/* Product Select Dropdown */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-emerald-300 uppercase tracking-wider font-mono">Select Input Material</label>
                  <select
                    value={quickBookProdId}
                    onChange={(e) => {
                      setQuickBookProdId(e.target.value);
                      setQuickBookQty(1);
                    }}
                    className="w-full bg-emerald-900/60 border border-emerald-700/80 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-sans"
                  >
                    {productsList.map(p => (
                      <option key={p.id} value={p.id} className="text-slate-900" disabled={p.remainingStock === 0}>
                        {p.name} {p.remainingStock === 0 ? "(OUT OF STOCK)" : `(₹${p.basePrice}/unit)`}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Quantity with live stock display */}
                {selectedQuickProduct && (
                  <div className="space-y-1">
                    <div className="flex justify-between items-center text-[10px] font-bold text-emerald-300 uppercase tracking-wider font-mono">
                      <span>Quantity ({selectedQuickProduct.unit})</span>
                      <span className="text-[9px] text-amber-400 font-normal">Stock: {selectedQuickProduct.remainingStock} available</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQuickBookQty(prev => Math.max(1, prev - 1))}
                        disabled={quickBookQty <= 1}
                        className="bg-emerald-800 hover:bg-emerald-700 text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition cursor-pointer disabled:opacity-40"
                      >
                        <Minus className="w-3 h-3" />
                      </button>
                      <input
                        type="number"
                        min="1"
                        max={selectedQuickProduct.remainingStock}
                        value={quickBookQty}
                        onChange={(e) => {
                          const val = parseInt(e.target.value) || 1;
                          setQuickBookQty(Math.min(selectedQuickProduct.remainingStock, Math.max(1, val)));
                        }}
                        className="w-full bg-emerald-900/60 border border-emerald-700 text-center rounded-lg py-1.5 text-xs text-white font-bold font-mono focus:outline-none focus:border-amber-400"
                      />
                      <button
                        type="button"
                        onClick={() => setQuickBookQty(prev => Math.min(selectedQuickProduct.remainingStock, prev + 1))}
                        disabled={quickBookQty >= selectedQuickProduct.remainingStock}
                        className="bg-emerald-800 hover:bg-emerald-700 text-white w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold transition cursor-pointer disabled:opacity-40"
                      >
                        <Plus className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                )}

                {/* Aadhaar Input */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-emerald-300 uppercase tracking-wider font-mono">Farmer Aadhaar Card / UID (12 Digits)</label>
                  <input
                    type="text"
                    required
                    maxLength={14}
                    placeholder="5432 9876 1234"
                    value={quickBookAadhaar}
                    onChange={(e) => {
                      const cleaned = e.target.value.replace(/\D/g, "").slice(0, 12);
                      const matches = cleaned.match(/(\d{1,4})/g);
                      setQuickBookAadhaar(matches ? matches.join(" ") : cleaned);
                    }}
                    className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 font-mono tracking-widest placeholder:text-emerald-500"
                  />
                </div>

                {/* Land Khata ID */}
                <div className="space-y-1">
                  <label className="block text-[10px] font-bold text-emerald-300 uppercase tracking-wider font-mono">Land Khata / Patta ID</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. AP-3810/V"
                    value={quickBookLandID}
                    onChange={(e) => setQuickBookLandID(e.target.value.toUpperCase())}
                    className="w-full bg-emerald-900/60 border border-emerald-700 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-amber-400 placeholder:text-emerald-500"
                  />
                </div>

                {/* Price Summary Panel */}
                {selectedQuickProduct && (
                  <div className="bg-emerald-950/80 rounded-xl p-3 border border-emerald-800/80 text-[11px] text-emerald-100 space-y-1">
                    <div className="flex justify-between">
                      <span>Market MRP Rate:</span>
                      <span className="font-mono line-through text-slate-400">₹{(quickBookQty * selectedQuickProduct.basePrice * 2).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-emerald-300 font-medium">
                      <span>State Co-op Subsidy (50%):</span>
                      <span className="font-mono">-₹{(quickBookQty * selectedQuickProduct.basePrice).toLocaleString("en-IN")}</span>
                    </div>
                    <div className="flex justify-between text-xs font-bold border-t border-emerald-800 pt-1.5 mt-1 text-white">
                      <span>Farmer Payable Co-op Rate:</span>
                      <span className="font-mono text-amber-300">₹{(quickBookQty * selectedQuickProduct.basePrice).toLocaleString("en-IN")}</span>
                    </div>
                  </div>
                )}

                <button
                  type="submit"
                  disabled={selectedQuickProduct && selectedQuickProduct.remainingStock === 0}
                  className="w-full bg-amber-400 hover:bg-amber-500 disabled:opacity-50 text-slate-950 py-2.5 rounded-xl text-xs font-black transition cursor-pointer flex items-center justify-center space-x-1.5 shadow-sm border border-amber-300"
                >
                  <Plus className="w-4 h-4" />
                  <span>Reserve & Generate Receipt</span>
                </button>
              </form>
            </div>
          </div>

          {/* Bookings Ledger Section */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white border border-slate-200 rounded-2xl p-5 shadow-sm">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-black text-slate-900 text-base">PACS Reservation Ledger</h3>
                  <p className="text-xs text-slate-500 mt-0.5">Track and access your Govt-Subsidized voucher receipts</p>
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                  {/* Status Filters */}
                  {["All", "Ready for Pickup", "Collected"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setBookingFilterStatus(st)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold transition cursor-pointer border ${
                        bookingFilterStatus === st
                          ? "bg-slate-900 text-white border-slate-950"
                          : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Booking Search */}
              <div className="relative mt-4">
                <Search className="w-3.5 h-3.5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by Receipt No, Land ID, or Product Name..."
                  value={bookingSearchQuery}
                  onChange={(e) => setBookingSearchQuery(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs focus:outline-emerald-600 focus:bg-white"
                />
              </div>

              {/* Booking list */}
              <div className="space-y-4 mt-5">
                {filteredBookingsList.length === 0 ? (
                  <div className="text-center py-10 border border-dashed border-slate-100 rounded-xl space-y-2">
                    <div className="w-12 h-12 bg-slate-50 text-slate-300 rounded-full flex items-center justify-center mx-auto">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-700">No Vouchers Found</p>
                      <p className="text-[10px] text-slate-400 mt-0.5">Try searching with a different term or create a new booking!</p>
                    </div>
                  </div>
                ) : (
                  filteredBookingsList.map((bk) => (
                    <div key={bk.id} className="border border-slate-200/80 rounded-2xl bg-slate-50/50 p-4 space-y-3 shadow-xs hover:border-slate-300 transition relative overflow-hidden">
                      {/* Top bar with Order ID and Status */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2.5">
                        <div className="space-y-0.5">
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Receipt ID</span>
                          <span className="font-mono text-xs font-bold text-slate-800">{bk.orderId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] text-slate-500 font-medium font-mono">{bk.date}</span>
                          <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wide uppercase ${
                            bk.status === "Collected"
                              ? "bg-slate-200 text-slate-700"
                              : bk.status === "Ready for Pickup"
                              ? "bg-amber-100 text-amber-800"
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {bk.status}
                          </span>
                        </div>
                      </div>

                      {/* Items details */}
                      <div className="space-y-2">
                        {bk.items.map((it, idx) => (
                          <div key={idx} className="flex justify-between items-start text-xs gap-3">
                            <div className="min-w-0 flex-grow">
                              <p className="font-bold text-slate-800 text-[11px] truncate">{it.product.name}</p>
                              <p className="text-[9px] text-slate-400 mt-0.5">{it.product.brandName} | {it.product.unit}</p>
                            </div>
                            <div className="text-right flex-shrink-0 font-mono text-[11px] text-slate-700 font-bold">
                              {it.quantity} units x ₹{it.product.basePrice}
                            </div>
                          </div>
                        ))}
                      </div>

                      {/* Land, Aadhaar and Pickup point summary */}
                      <div className="grid grid-cols-2 gap-2 bg-white border border-slate-100 p-2.5 rounded-xl text-[10px] text-slate-600">
                        <div>
                          <span className="text-slate-400 block font-medium uppercase text-[8px] tracking-wider">Farmer Aadhaar</span>
                          <strong className="font-mono text-slate-700">{bk.aadhaar}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium uppercase text-[8px] tracking-wider">Land Khata ID</span>
                          <strong className="font-mono text-slate-700 truncate block">{bk.landId}</strong>
                        </div>
                        <div className="col-span-2 border-t border-slate-50 pt-1.5 mt-0.5 leading-relaxed text-amber-900/90 flex gap-1 items-start">
                          <MapPin className="w-3.5 h-3.5 text-emerald-700 mt-0.5 flex-shrink-0" />
                          <span>PACS Center: <strong>{bk.pickupPoint}</strong></span>
                        </div>
                      </div>

                      {/* Total and Actions */}
                      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2">
                        <div>
                          <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">Net Payable amount</span>
                          <span className="text-sm font-black text-emerald-800 font-mono">₹{bk.totalAmount.toLocaleString("en-IN")}</span>
                        </div>

                        {/* Action buttons */}
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => {
                              window.print();
                            }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1 py-1.5 px-3 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-[10px] font-bold transition cursor-pointer"
                          >
                            <Printer className="w-3 h-3" />
                            <span>Print</span>
                          </button>
                          <button
                            onClick={() => {
                              const itemsText = bk.items.map(item => {
                                return `${item.product.name.padEnd(30)} | ${item.quantity.toString().padStart(3)} units | Subtotal: ₹${(item.quantity * item.product.basePrice).toLocaleString("en-IN")}`;
                              }).join("\n");
                              
                              const totalMRPValue = bk.totalAmount * 2;

                              const content = `
==============================================
PRIMARY AGRICULTURAL COOPERATIVE SOCIETY (PACS)
Govt. Subsidized Input Distribution Bill
==============================================
Receipt No      : ${bk.orderId}
Date & Time     : ${bk.date}
Farmer Aadhaar  : ${bk.aadhaar}
Land Khata ID   : ${bk.landId}
----------------------------------------------
Item Description                | Qty | Price
----------------------------------------------
${itemsText}
----------------------------------------------
Market Value    : ₹${totalMRPValue.toLocaleString("en-IN")}
Subsidy (50%)   : -₹${bk.totalAmount.toLocaleString("en-IN")}
Net Payable Amt : ₹${bk.totalAmount.toLocaleString("en-IN")}
----------------------------------------------
Pickup Point    : ${bk.pickupPoint}
==============================================
`;
                              const blob = new Blob([content], { type: "text/plain" });
                              const url = URL.createObjectURL(blob);
                              const link = document.createElement("a");
                              link.href = url;
                              link.download = `PACS-Receipt-${bk.orderId.replace(/\//g, "-")}.txt`;
                              link.click();
                              URL.revokeObjectURL(url);
                              onNotify("Receipt downloaded successfully as text file!", "success");
                            }}
                            className="flex-1 sm:flex-none flex items-center justify-center gap-1 py-1.5 px-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-lg text-[10px] font-bold transition cursor-pointer border border-emerald-200"
                          >
                            <Download className="w-3 h-3" />
                            <span>Download Bill</span>
                          </button>
                          {bk.status === "Ready for Pickup" ? (
                            <button
                              onClick={() => {
                                setBookings(prev => prev.map(b => b.id === bk.id ? { ...b, status: "Collected" } : b));
                                onNotify(`Status updated for ${bk.orderId}: Marked as Collected!`, "success");
                              }}
                              className="flex-1 sm:flex-none py-1.5 px-3 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-[10px] font-bold transition cursor-pointer shadow-xs flex items-center justify-center gap-1"
                              title="Mark as Collected by Farmer"
                            >
                              <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                              <span>Simulate Pickup</span>
                            </button>
                          ) : (
                            <button
                              onClick={() => {
                                setBookings(prev => prev.map(b => b.id === bk.id ? { ...b, status: "Ready for Pickup" } : b));
                                onNotify(`Status updated for ${bk.orderId}: Marked as Ready for Pickup!`, "info");
                              }}
                              className="flex-1 sm:flex-none py-1.5 px-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-lg text-[10px] font-bold transition cursor-pointer shadow-xs flex items-center justify-center gap-1"
                              title="PACS Center status update"
                            >
                              <RefreshCw className="w-3 h-3" />
                              <span>Set 'Ready for Pickup'</span>
                            </button>
                          )}
                        </div>
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          </div>

        </div>
      )}



      {/* Reservation Checkout Simulated Drawer / Modal */}
      <AnimatePresence>
        {checkoutProduct && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="bg-white rounded-3xl border border-slate-200 max-w-md w-full overflow-hidden shadow-2xl"
            >
              {/* Header */}
              <div className="p-5 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                <div className="flex items-center space-x-2">
                  <ShoppingBag className="w-4 h-4 text-emerald-700" />
                  <h3 className="font-bold text-slate-800 text-sm">PACS subsidized input Booking</h3>
                </div>
                <button 
                  onClick={() => setCheckoutProduct(null)}
                  className="p-1 rounded-full text-slate-400 hover:text-slate-600 hover:bg-slate-200/50 cursor-pointer"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {checkoutStatus === "success" ? (
                <div className="p-5 text-center space-y-4 max-h-[80vh] overflow-y-auto">
                  <div className="w-10 h-10 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-extrabold text-slate-900 text-sm">Booking Confirmed!</h4>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      Your subsidized quota has been validated. Present this bill receipt at your local PACS counter.
                    </p>
                  </div>

                  {/* Printable Receipt Paper Container */}
                  <div id="pacs-single-bill" className="bg-amber-50/40 border border-dashed border-amber-200 p-4 rounded-xl text-left space-y-3 font-sans relative overflow-hidden shadow-xs">
                    {/* Decorative watermark / background stamp */}
                    <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none text-center">
                      <Sprout className="w-36 h-36 mx-auto" />
                      <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-900">PACS AP COOP</span>
                    </div>

                    <div className="border-b border-dashed border-slate-200 pb-2 text-center">
                      <h5 className="font-extrabold text-[11px] text-slate-900 tracking-wide uppercase">PRIMARY AGRICULTURAL COOPERATIVE SOCIETY</h5>
                      <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-medium">Govt. Subsidized Fertilizer & Protection Scheme</span>
                    </div>

                    {/* Receipt Metadata */}
                    <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[10px] text-slate-600 border-b border-dashed border-slate-200 pb-2">
                      <div>
                        <span className="text-slate-400 block font-medium uppercase text-[8px] tracking-wider">Receipt No</span>
                        <strong className="font-mono text-slate-800 font-bold">{singleCheckoutOrderID}</strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block font-medium uppercase text-[8px] tracking-wider">Date & Time</span>
                        <strong className="font-mono text-slate-800 font-bold">{singleCheckoutDate}</strong>
                      </div>
                      <div>
                        <span className="text-slate-400 block font-medium uppercase text-[8px] tracking-wider">Farmer Aadhaar</span>
                        <strong className="font-mono text-slate-800 font-bold">
                          {checkoutAadhaar ? `XXXX XXXX ${checkoutAadhaar.replace(/\s/g, "").slice(-4)}` : "XXXX XXXX 8945"}
                        </strong>
                      </div>
                      <div className="text-right">
                        <span className="text-slate-400 block font-medium uppercase text-[8px] tracking-wider">Land Khata ID</span>
                        <strong className="font-mono text-slate-800 font-bold truncate block">{checkoutLandID || "AP-2839/V"}</strong>
                      </div>
                    </div>

                    {/* Item details */}
                    <div className="space-y-1 text-xs border-b border-dashed border-slate-200 pb-2">
                      <span className="text-slate-400 block font-medium uppercase text-[8px] tracking-wider mb-1">Booked Items</span>
                      <div className="flex justify-between items-start gap-2">
                        <div className="min-w-0">
                          <p className="font-bold text-slate-800 text-[11px] truncate">{checkoutProduct.name}</p>
                          <span className="text-[9px] text-slate-500 block">{checkoutProduct.brandName} | {checkoutProduct.unit}</span>
                        </div>
                        <div className="text-right flex-shrink-0">
                          <p className="font-mono font-bold text-slate-800">{checkoutQuantity} units</p>
                          <p className="text-[9px] text-slate-400">@ ₹{checkoutProduct.basePrice}/unit</p>
                        </div>
                      </div>
                    </div>

                    {/* Pricing calculation */}
                    <div className="space-y-1 text-[11px]">
                      <div className="flex justify-between text-slate-500">
                        <span>Market Retail Value (MRP):</span>
                        <span className="font-mono line-through">₹{(checkoutQuantity * checkoutProduct.basePrice * 2).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between text-emerald-700 font-medium">
                        <span>Govt. PACS Subsidy (50% Off):</span>
                        <span className="font-mono">-₹{(checkoutQuantity * checkoutProduct.basePrice).toLocaleString("en-IN")}</span>
                      </div>
                      <div className="flex justify-between items-center text-xs font-black text-slate-900 border-t border-slate-200 pt-1.5 mt-1">
                        <span className="text-slate-800 font-bold uppercase tracking-wider text-[10px]">Net Payable Amount:</span>
                        <span className="font-mono text-emerald-800 text-sm font-black">
                          ₹{(checkoutQuantity * checkoutProduct.basePrice).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Pickup Details */}
                    <div className="bg-white/95 border border-amber-100 p-2 rounded-lg text-[10px] text-amber-900 space-y-0.5 leading-relaxed">
                      <div className="flex items-center gap-1 font-bold text-amber-950">
                        <MapPin className="w-3 h-3 text-emerald-700" />
                        <span>PACS Pickup Point:</span>
                      </div>
                      <p className="text-[9px] text-amber-900/90 pl-4">
                        Amravati Cooperative Center, Warehouse #2. Bring your Aadhaar Card & biometric verification.
                      </p>
                    </div>

                    {/* Mock QR-Bar Code for security validation */}
                    <div className="pt-1 flex flex-col items-center justify-center space-y-1">
                      <div className="h-6 w-full max-w-[180px] bg-slate-900 relative rounded-sm overflow-hidden flex items-center justify-between px-1 opacity-75">
                        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent animate-pulse" />
                        {Array.from({ length: 32 }).map((_, idx) => (
                          <div
                            key={idx}
                            className="bg-white h-full"
                            style={{
                              width: `${(idx % 3 === 0 ? 1 : idx % 5 === 0 ? 3 : 2)}px`,
                              opacity: idx % 7 === 0 ? 0.3 : 1
                            }}
                          />
                        ))}
                      </div>
                      <span className="font-mono text-[8px] text-slate-400 tracking-widest">{singleCheckoutOrderID}</span>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        window.print();
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Receipt</span>
                    </button>
                    <button
                      onClick={() => {
                        const content = `
==============================================
PRIMARY AGRICULTURAL COOPERATIVE SOCIETY (PACS)
Govt. Subsidized Input Distribution Bill
==============================================
Receipt No      : ${singleCheckoutOrderID}
Date & Time     : ${singleCheckoutDate}
Farmer Aadhaar  : XXXX XXXX ${checkoutAadhaar ? checkoutAadhaar.replace(/\s/g, "").slice(-4) : "8945"}
Land Khata ID   : ${checkoutLandID || "AP-2839/V"}
----------------------------------------------
Item Name       : ${checkoutProduct.name}
Quantity        : ${checkoutQuantity} units
Subsidized Price: ₹${checkoutProduct.basePrice} per unit
----------------------------------------------
Market Value    : ₹${(checkoutQuantity * checkoutProduct.basePrice * 2).toLocaleString("en-IN")}
Subsidy (50%)   : -₹${(checkoutQuantity * checkoutProduct.basePrice).toLocaleString("en-IN")}
Net Payable Amt : ₹${(checkoutQuantity * checkoutProduct.basePrice).toLocaleString("en-IN")}
----------------------------------------------
Pickup Point    : Amravati Cooperative Center, Warehouse #2
==============================================
`;
                        const blob = new Blob([content], { type: "text/plain" });
                        const url = URL.createObjectURL(blob);
                        const link = document.createElement("a");
                        link.href = url;
                        link.download = `PACS-Receipt-${singleCheckoutOrderID.replace(/\//g, "-")}.txt`;
                        link.click();
                        URL.revokeObjectURL(url);
                        onNotify("Bill downloaded successfully as text file!", "success");
                      }}
                      className="flex items-center justify-center gap-1.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition cursor-pointer border border-emerald-200"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Download Bill</span>
                    </button>
                  </div>

                  <button
                    onClick={() => setCheckoutProduct(null)}
                    className="w-full bg-emerald-800 text-white rounded-xl py-2 text-xs font-bold hover:bg-emerald-900 cursor-pointer transition"
                  >
                    Done
                  </button>
                </div>
              ) : (
                <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-4">
                  <div className="space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{checkoutProduct.brandName}</span>
                    <h4 className="font-extrabold text-slate-900 text-sm">{checkoutProduct.name}</h4>
                    <p className="text-xs text-slate-500 leading-normal">{checkoutProduct.description}</p>
                  </div>

                  <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-xl border border-slate-100 text-xs">
                    <div>
                      <span className="text-slate-400">Controlled Rate:</span>
                      <p className="font-mono font-extrabold text-slate-800 mt-0.5">{checkoutProduct.priceRange}</p>
                    </div>
                    <div>
                      <span className="text-slate-400">Unit Size:</span>
                      <p className="font-semibold text-slate-800 mt-0.5">{checkoutProduct.unit}</p>
                    </div>
                  </div>

                  <div className="space-y-3.5">
                    {/* Quantity Input */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Required Quantity (Units)</label>
                      <input
                        type="number"
                        min="1"
                        max="20"
                        value={checkoutQuantity}
                        onChange={e => setCheckoutQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono font-bold focus:outline-emerald-600 focus:bg-white"
                      />
                    </div>

                    {/* Aadhaar Input */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1 flex items-center gap-1.5">
                        <span>Farmer Aadhaar ID (12-Digit)</span>
                        <span className="text-[8px] font-bold text-emerald-700 uppercase bg-emerald-50 px-1.5 py-0.5 rounded">Required for subsidy</span>
                      </label>
                      <input
                        type="text"
                        maxLength={14}
                        placeholder="e.g. 5432 9876 1234"
                        value={checkoutAadhaar}
                        onChange={e => {
                          const cleaned = e.target.value.replace(/\D/g, "").slice(0, 12);
                          const matches = cleaned.match(/(\d{1,4})/g);
                          setCheckoutAadhaar(matches ? matches.join(" ") : cleaned);
                        }}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono tracking-wider focus:outline-emerald-600 focus:bg-white"
                        required
                      />
                    </div>

                    {/* Land ID Input */}
                    <div>
                      <label className="block text-[11px] font-bold text-slate-700 mb-1">Framer Land Khata/Survey Number (Optional)</label>
                      <input
                        type="text"
                        placeholder="e.g. MH/AMR/894-B"
                        value={checkoutLandID}
                        onChange={e => setCheckoutLandID(e.target.value)}
                        className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-emerald-600 focus:bg-white"
                      />
                    </div>
                  </div>

                  {/* Pricing and Submit */}
                  <div className="pt-4 border-t border-slate-100 flex justify-between items-center">
                    <div>
                      <span className="text-[10px] text-slate-400 block font-bold">Estimated Cost</span>
                      <span className="text-base font-black text-emerald-800 font-mono">
                        ₹{(checkoutQuantity * checkoutProduct.basePrice).toLocaleString("en-IN")}
                      </span>
                    </div>
                    <button
                      type="submit"
                      disabled={checkoutStatus === "verifying"}
                      className="px-6 py-2.5 bg-emerald-700 hover:bg-emerald-800 text-white font-bold rounded-xl text-xs transition cursor-pointer disabled:opacity-50"
                    >
                      {checkoutStatus === "verifying" ? "Validating Quota..." : "Confirm Booking"}
                    </button>
                  </div>
                </form>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Flipkart-Style Cart Drawer */}
      <AnimatePresence>
        {isCartOpen && (
          <div className="fixed inset-0 bg-slate-950/40 backdrop-blur-xs z-50 flex justify-end">
            {/* Backdrop click to close */}
            <div className="absolute inset-0" onClick={() => { setIsCartOpen(false); setCartCheckoutStatus("idle"); }} />
            
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "tween", duration: 0.25 }}
              className="relative w-full max-w-md bg-white h-full shadow-2xl flex flex-col z-50"
            >
              {/* Drawer Header */}
              <div className="p-4 bg-emerald-900 text-white flex items-center justify-between shadow-sm">
                <div className="flex items-center space-x-2">
                  <ShoppingCart className="w-5 h-5 text-amber-300" />
                  <div>
                    <h3 className="font-extrabold text-sm tracking-wide">AgriConnect Flipkart-Cart</h3>
                    <p className="text-[10px] text-emerald-100/80">Subsidized Cooperative Inputs Cart</p>
                  </div>
                </div>
                <button
                  onClick={() => { setIsCartOpen(false); setCartCheckoutStatus("idle"); }}
                  className="p-1 rounded-full text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Drawer Content */}
              <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {cartCheckoutStatus === "success" ? (
                  <div className="py-4 px-2 space-y-4 max-h-[85vh] overflow-y-auto">
                    <div className="text-center space-y-2">
                      <div className="w-12 h-12 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-xs">
                        <CheckCircle2 className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="font-extrabold text-slate-900 text-sm">Booking Confirmed!</h4>
                        <p className="text-[11px] text-slate-500">
                          Your cooperative inputs have been reserved. Show this bill at the local PACS center.
                        </p>
                      </div>
                    </div>

                    {/* Printable Receipt Paper Container */}
                    <div id="pacs-cart-bill" className="bg-amber-50/40 border border-dashed border-amber-200 p-4 rounded-xl text-left space-y-3 font-sans relative overflow-hidden shadow-xs">
                      {/* Decorative watermark / background stamp */}
                      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-[0.03] pointer-events-none select-none text-center">
                        <Sprout className="w-36 h-36 mx-auto" />
                        <span className="font-mono text-[10px] font-bold uppercase tracking-widest text-slate-900">PACS CART BOOKING</span>
                      </div>

                      <div className="border-b border-dashed border-slate-200 pb-2 text-center">
                        <h5 className="font-extrabold text-[11px] text-slate-900 tracking-wide uppercase">PRIMARY AGRICULTURAL COOPERATIVE SOCIETY</h5>
                        <span className="text-[9px] text-slate-500 uppercase tracking-widest block font-medium">Govt. Subsidized Fertilizer & Protection Scheme</span>
                      </div>

                      {/* Receipt Metadata */}
                      <div className="grid grid-cols-2 gap-y-1.5 gap-x-2 text-[10px] text-slate-600 border-b border-dashed border-slate-200 pb-2">
                        <div>
                          <span className="text-slate-400 block font-medium uppercase text-[8px] tracking-wider">Receipt No</span>
                          <strong className="font-mono text-slate-800 font-bold">{lastCheckoutOrderID}</strong>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block font-medium uppercase text-[8px] tracking-wider">Date & Time</span>
                          <strong className="font-mono text-slate-800 font-bold">{lastCheckoutDate}</strong>
                        </div>
                        <div>
                          <span className="text-slate-400 block font-medium uppercase text-[8px] tracking-wider">Farmer Aadhaar</span>
                          <strong className="font-mono text-slate-800 font-bold">
                            {lastCheckoutAadhaar ? `XXXX XXXX ${lastCheckoutAadhaar.replace(/\s/g, "").slice(-4)}` : "XXXX XXXX 8945"}
                          </strong>
                        </div>
                        <div className="text-right">
                          <span className="text-slate-400 block font-medium uppercase text-[8px] tracking-wider">Land Khata ID</span>
                          <strong className="font-mono text-slate-800 font-bold truncate block">{lastCheckoutLandID || "AP-2839/V"}</strong>
                        </div>
                      </div>

                      {/* Items table / list */}
                      <div className="space-y-2 border-b border-dashed border-slate-200 pb-2.5">
                        <span className="text-slate-400 block font-medium uppercase text-[8px] tracking-wider">Subsidized Items Booked</span>
                        
                        <div className="space-y-2.5">
                          {lastCheckoutCart.map((item, idx) => {
                            const subtotal = item.quantity * item.product.basePrice;
                            return (
                              <div key={idx} className="flex justify-between items-start text-xs gap-3">
                                <div className="min-w-0 flex-grow">
                                  <p className="font-bold text-slate-800 text-[11px] leading-tight truncate">{item.product.name}</p>
                                  <p className="text-[9px] text-slate-400 mt-0.5">{item.product.brandName} | {item.product.unit}</p>
                                </div>
                                <div className="text-right flex-shrink-0 font-mono">
                                  <p className="font-bold text-slate-800">{item.quantity} units</p>
                                  <p className="text-[9px] text-emerald-800 font-bold">₹{subtotal.toLocaleString("en-IN")}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>

                      {/* Subsidized Breakdown Totals */}
                      {(() => {
                        const totalPayable = lastCheckoutCart.reduce((sum, item) => sum + (item.quantity * item.product.basePrice), 0);
                        const totalMRPValue = totalPayable * 2;
                        return (
                          <div className="space-y-1 text-[11px]">
                            <div className="flex justify-between text-slate-500">
                              <span>Market Retail Value (MRP):</span>
                              <span className="font-mono line-through">₹{totalMRPValue.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between text-emerald-700 font-medium">
                              <span>Total PACS Subsidy (50% Off):</span>
                              <span className="font-mono">-₹{totalPayable.toLocaleString("en-IN")}</span>
                            </div>
                            <div className="flex justify-between items-center text-xs font-black text-slate-900 border-t border-slate-200 pt-1.5 mt-1">
                              <span className="text-slate-800 font-bold uppercase tracking-wider text-[10px]">Net Payable Amount:</span>
                              <span className="font-mono text-emerald-800 text-sm font-black">
                                ₹{totalPayable.toLocaleString("en-IN")}
                              </span>
                            </div>
                          </div>
                        );
                      })()}

                      {/* Pickup Info */}
                      <div className="bg-white/95 border border-amber-100 p-2 rounded-lg text-[10px] text-amber-900 space-y-0.5 leading-relaxed">
                        <div className="flex items-center gap-1 font-bold text-amber-950">
                          <MapPin className="w-3 h-3 text-emerald-700" />
                          <span>PACS Pickup Point:</span>
                        </div>
                        <p className="text-[9px] text-amber-900/90 pl-4">
                          Amravati Cooperative Center, Warehouse #2. Bring your Aadhaar Card & biometric verification.
                        </p>
                      </div>

                      {/* Barcode */}
                      <div className="pt-1 flex flex-col items-center justify-center space-y-1">
                        <div className="h-6 w-full max-w-[180px] bg-slate-900 relative rounded-sm overflow-hidden flex items-center justify-between px-1 opacity-75">
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/20 to-transparent animate-pulse" />
                          {Array.from({ length: 32 }).map((_, idx) => (
                            <div
                              key={idx}
                              className="bg-white h-full"
                              style={{
                                width: `${(idx % 3 === 0 ? 1 : idx % 5 === 0 ? 3 : 2)}px`,
                                opacity: idx % 7 === 0 ? 0.3 : 1
                              }}
                            />
                          ))}
                        </div>
                        <span className="font-mono text-[8px] text-slate-400 tracking-widest">{lastCheckoutOrderID}</span>
                      </div>
                    </div>

                    {/* Print & Download actions */}
                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <button
                        onClick={() => {
                          window.print();
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition cursor-pointer"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Print Receipt</span>
                      </button>
                      <button
                        onClick={() => {
                          const itemsText = lastCheckoutCart.map(item => {
                            return `${item.product.name.padEnd(30)} | ${item.quantity.toString().padStart(3)} units | Subtotal: ₹${(item.quantity * item.product.basePrice).toLocaleString("en-IN")}`;
                          }).join("\n");
                          
                          const totalPayable = lastCheckoutCart.reduce((sum, item) => sum + (item.quantity * item.product.basePrice), 0);
                          const totalMRPValue = totalPayable * 2;

                          const content = `
==============================================
PRIMARY AGRICULTURAL COOPERATIVE SOCIETY (PACS)
Govt. Subsidized Input Distribution Bill
==============================================
Receipt No      : ${lastCheckoutOrderID}
Date & Time     : ${lastCheckoutDate}
Farmer Aadhaar  : XXXX XXXX ${lastCheckoutAadhaar ? lastCheckoutAadhaar.replace(/\s/g, "").slice(-4) : "8945"}
Land Khata ID   : ${lastCheckoutLandID || "AP-2839/V"}
----------------------------------------------
Item Description                | Qty | Price
----------------------------------------------
${itemsText}
----------------------------------------------
Market Value    : ₹${totalMRPValue.toLocaleString("en-IN")}
Subsidy (50%)   : -₹${totalPayable.toLocaleString("en-IN")}
Net Payable Amt : ₹${totalPayable.toLocaleString("en-IN")}
----------------------------------------------
Pickup Point    : Amravati Cooperative Center, Warehouse #2
==============================================
`;
                          const blob = new Blob([content], { type: "text/plain" });
                          const url = URL.createObjectURL(blob);
                          const link = document.createElement("a");
                          link.href = url;
                          link.download = `PACS-Receipt-${lastCheckoutOrderID.replace(/\//g, "-")}.txt`;
                          link.click();
                          URL.revokeObjectURL(url);
                          onNotify("Receipt downloaded successfully as text file!", "success");
                        }}
                        className="flex items-center justify-center gap-1.5 py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 rounded-xl text-xs font-bold transition cursor-pointer border border-emerald-200"
                      >
                        <Download className="w-3.5 h-3.5" />
                        <span>Download Bill</span>
                      </button>
                    </div>

                    <button
                      onClick={() => { setIsCartOpen(false); setCartCheckoutStatus("idle"); }}
                      className="w-full py-2.5 bg-emerald-800 hover:bg-emerald-950 text-white rounded-xl text-xs font-bold transition cursor-pointer"
                    >
                      Done & Continue
                    </button>
                  </div>
                ) : cart.length === 0 ? (
                  <div className="py-20 text-center space-y-4">
                    <ShoppingCart className="w-12 h-12 text-slate-300 mx-auto" />
                    <div>
                      <h4 className="font-bold text-slate-700 text-sm">Your Cart is Empty</h4>
                      <p className="text-xs text-slate-400 mt-1">Add pesticides or fertilizers to start booking your subsidy!</p>
                    </div>
                    <button
                      onClick={() => setIsCartOpen(false)}
                      className="px-5 py-2 bg-emerald-700 hover:bg-emerald-800 text-white rounded-xl text-xs font-bold cursor-pointer transition"
                    >
                      Shop Now
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {/* Cart Items list */}
                    <div className="space-y-3">
                      {cart.map(item => {
                        const prod = productsList.find(p => p.id === item.product.id) || item.product;
                        return (
                          <div key={item.product.id} className="flex gap-3 bg-slate-50 border border-slate-100 p-3 rounded-xl hover:border-slate-200 transition">
                            {/* Small product image */}
                            <CartItemImage
                              src={prod.image}
                              alt={prod.name}
                              prod={prod}
                            />
                            
                            <div className="flex-grow min-w-0">
                              <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{prod.brandName}</span>
                              <h4 className="text-xs font-bold text-slate-800 truncate" title={prod.name}>{prod.name}</h4>
                              <p className="text-[10px] text-slate-500">{prod.unit}</p>
                              <div className="flex justify-between items-center mt-1.5">
                                <span className="font-mono text-xs font-extrabold text-slate-900">{prod.priceRange}</span>
                                
                                {/* Quantity controller */}
                                <div className="flex items-center space-x-2 bg-white border border-slate-200 rounded-lg p-0.5 shadow-2xs">
                                  <button
                                    onClick={() => updateCartQty(prod.id, -1)}
                                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                                  >
                                    <Minus className="w-3 h-3" />
                                  </button>
                                  <span className="font-mono text-xs font-black text-slate-800 px-1">{item.quantity}</span>
                                  <button
                                    onClick={() => updateCartQty(prod.id, 1)}
                                    className="p-1 rounded text-slate-500 hover:text-slate-800 hover:bg-slate-100 cursor-pointer"
                                  >
                                    <Plus className="w-3 h-3" />
                                  </button>
                                </div>
                              </div>
                            </div>
                            
                            {/* Remove button */}
                            <button
                              onClick={() => removeFromCart(prod.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600 rounded-lg self-start cursor-pointer hover:bg-rose-50/50"
                              title="Remove item"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        );
                      })}
                    </div>

                    {/* Flipkart-Style Price Details Card */}
                    <div className="bg-amber-50/60 border border-amber-200/60 rounded-xl p-4 space-y-3.5">
                      <h4 className="text-[10px] font-black text-amber-900 uppercase tracking-wider font-mono">Price Details (Flipkart-Style)</h4>
                      
                      <div className="space-y-1.5 text-xs text-slate-600">
                        <div className="flex justify-between">
                          <span>Price ({cart.reduce((acc, item) => acc + item.quantity, 0)} items)</span>
                          <span className="font-mono">₹{cart.reduce((acc, item) => acc + (item.quantity * item.product.basePrice), 0).toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-emerald-700">
                          <span>Government PACS Subsidy</span>
                          <span className="font-semibold">- 50% Organic / Controlled Discount</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Delivery Charges</span>
                          <span className="text-emerald-700 font-bold">FREE Delivery</span>
                        </div>
                      </div>

                      <div className="pt-2 border-t border-dashed border-slate-300 flex justify-between items-baseline">
                        <span className="text-xs font-bold text-slate-800">Total Amount Payable</span>
                        <span className="font-mono text-lg font-black text-emerald-800">
                          ₹{cart.reduce((acc, item) => acc + (item.quantity * item.product.basePrice), 0).toLocaleString("en-IN")}
                        </span>
                      </div>
                    </div>

                    {/* Checkout Details form */}
                    {isCartCheckingOut ? (
                      <form onSubmit={handleCartCheckoutSubmit} className="border border-slate-200 bg-white rounded-xl p-3.5 space-y-3 shadow-xs">
                        <div className="flex justify-between items-center pb-2 border-b border-slate-100">
                          <span className="text-[10px] font-black text-slate-700 uppercase font-mono">Cooperative Subsidized Verification</span>
                          <button
                            type="button"
                            onClick={() => setIsCartCheckingOut(false)}
                            className="text-[10px] text-rose-600 font-extrabold hover:underline"
                          >
                            Cancel
                          </button>
                        </div>

                        <div className="space-y-2.5">
                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">Farmer Aadhaar Card (12-Digit)</label>
                            <input
                              type="text"
                              maxLength={14}
                              placeholder="e.g. 5432 9876 1234"
                              value={cartAadhaar}
                              onChange={e => {
                                const cleaned = e.target.value.replace(/\D/g, "").slice(0, 12);
                                const matches = cleaned.match(/(\d{1,4})/g);
                                setCartAadhaar(matches ? matches.join(" ") : cleaned);
                              }}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs font-mono tracking-wider focus:outline-emerald-600 focus:bg-white"
                              required
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-bold text-slate-600 mb-1">Land Khata Number (Optional)</label>
                            <input
                              type="text"
                              placeholder="e.g. AP/AMR/894"
                              value={cartLandID}
                              onChange={e => setCartLandID(e.target.value)}
                              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2 text-xs focus:outline-emerald-600 focus:bg-white"
                            />
                          </div>
                        </div>

                        <button
                          type="submit"
                          disabled={cartCheckoutStatus === "verifying"}
                          className="w-full py-2 bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white rounded-lg text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                        >
                          {cartCheckoutStatus === "verifying" ? (
                            <span>Verifying Farmer Database...</span>
                          ) : (
                            <>
                              <CheckCircle2 className="w-4 h-4" />
                              <span>PLACE PACS ORDER</span>
                            </>
                          )}
                        </button>
                      </form>
                    ) : (
                      <button
                        onClick={() => setIsCartCheckingOut(true)}
                        className="w-full py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black transition text-center shadow-md cursor-pointer tracking-wider uppercase"
                      >
                        Proceed to PACS Checkout
                      </button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
