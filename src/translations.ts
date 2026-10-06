export type Language = 'en' | 'te';

export interface Translations {
  // Common & Header
  appName: string;
  appSubtitle: string;
  tagline: string;
  version: string;
  language: string;
  selectLanguage: string;
  english: string;
  telugu: string;
  currentLocation: string;
  logout: string;
  farmerProfile: string;
  close: string;
  saveChanges: string;

  // Tabs
  tabHome: string;
  tabCrops: string;
  tabWeather: string;
  tabMarket: string;
  tabEquipment: string;
  tabAiDoctor: string;
  tabSchemes: string;
  tabPesticides: string;
  tabBookings: string;
  tabMl: string;
  tabVoiceAgent: string;

  // Login Screen
  farmerLogIn: string;
  registerNewCard: string;
  aadhaarMethod: string;
  mobileMethod: string;
  farmerAadhaarLabel: string;
  regMobileLabel: string;
  otpSentBanner: string;
  enterOtpInstruction: string;
  verificationPinLabel: string;
  verifyAndLogIn: string;
  requestAuthGateway: string;
  accessingGateway: string;
  farmerFullName: string;
  mobilePhoneIndia: string;
  aadhaarNumber: string;
  landAcres: string;
  stateRegistry: string;
  districtArea: string;
  mobileVerificationRequired: string;
  verifyAndCompleteReg: string;
  requestRegOtp: string;
  credentialError: string;
  sandboxKey: string;
  securityVerified: string;
  welcomeBack: string;
  initializingSession: string;

  // Dashboard / Home
  soilType: string;
  landSizeAcres: string;
  recommendedCrops: string;
  calculateYield: string;
  marketPriceToday: string;
  quickActions: string;
  recentAlerts: string;
  weatherOverview: string;
  pacsMemberCard: string;

  // Profile & Settings Modal
  profileAndSettings: string;
  profileTab: string;
  settingsTab: string;
  languagePreference: string;
  languageDescription: string;
  themePreference: string;
  lightMode: string;
  darkMode: string;
  languageChangedToast: string;
  settingsSaved: string;

  // Battery & Power Optimization
  batteryOptimizer: string;
  powerMode: string;
  autoPowerSaver: string;
  batterySaverMode: string;
  highPerformance: string;
  batteryLevelLabel: string;
  chargingStatus: string;
  dischargingStatus: string;
  estimatedBatteryHours: string;
  batterySaverActiveBanner: string;
}

export const TRANSLATIONS: Record<Language, Translations> = {
  en: {
    appName: "AgriConnect",
    appSubtitle: "Digital Agriculture Hub",
    tagline: "Your Trusted Digital Partner for Modern Agriculture.",
    version: "v2.4 PRO",
    language: "App Language",
    selectLanguage: "Language",
    english: "English",
    telugu: "తెలుగు",
    currentLocation: "Current Location",
    logout: "Logout",
    farmerProfile: "Farmer Profile",
    close: "Close",
    saveChanges: "Save Changes",

    tabHome: "Portal Dashboard",
    tabCrops: "My Crop Fields",
    tabWeather: "Weather & Advisories",
    tabBookings: "PACS Bookings",
    tabMarket: "Direct Marketplace",
    tabEquipment: "Machinery Rental",
    tabAiDoctor: "AI Plant Doctor",
    tabSchemes: "Grants & Subsidies",
    tabPesticides: "Fertilizer Guide",
    tabMl: "ML Intelligence Hub",
    tabVoiceAgent: "Gemini Voice Doubt Agent",

    farmerLogIn: "FARMER LOG IN",
    registerNewCard: "REGISTER NEW CARD",
    aadhaarMethod: "Aadhaar",
    mobileMethod: "Mobile",
    farmerAadhaarLabel: "Farmer Aadhaar Number",
    regMobileLabel: "Registered Mobile Number (India)",
    otpSentBanner: "Security OTP Sent!",
    enterOtpInstruction: "Enter the 6-digit confirmation code.",
    verificationPinLabel: "6-Digit Verification PIN/OTP",
    verifyAndLogIn: "Verify Code & Log In",
    requestAuthGateway: "Request Authentication Gateway",
    accessingGateway: "Accessing Secure Gateway...",
    farmerFullName: "Farmer Full Name",
    mobilePhoneIndia: "Mobile Phone (India)",
    aadhaarNumber: "Aadhaar Number",
    landAcres: "Land (Acres)",
    stateRegistry: "State Registry",
    districtArea: "District Area",
    mobileVerificationRequired: "Mobile Verification Required",
    verifyAndCompleteReg: "Verify Code & Complete Registration",
    requestRegOtp: "Request Registration OTP",
    credentialError: "Credential Error:",
    sandboxKey: "Sandbox Verification Key",
    securityVerified: "Security Credentials Verified",
    welcomeBack: "Welcome back,",
    initializingSession: "INITIALIZING SECURE PACS SESSION...",

    soilType: "Soil Type",
    landSizeAcres: "Land Extent (Acres)",
    recommendedCrops: "Recommended Crop Varieties",
    calculateYield: "Estimate Yield & Income",
    marketPriceToday: "Today's Mandi Market Rates",
    quickActions: "Quick Services",
    recentAlerts: "Weather & Pest Alerts",
    weatherOverview: "Live Weather Overview",
    pacsMemberCard: "National Farmer Identity Card",

    profileAndSettings: "Profile & Settings",
    profileTab: "Farmer Profile",
    settingsTab: "App Settings",
    languagePreference: "Language Preference",
    languageDescription: "Select your primary language. The app updates instantly and saves your preference.",
    themePreference: "Color Theme",
    lightMode: "Light Mode",
    darkMode: "Dark Mode",
    languageChangedToast: "Language changed successfully!",
    settingsSaved: "Settings saved successfully.",

    batteryOptimizer: "Battery Saver & Field Durability",
    powerMode: "Power Mode",
    autoPowerSaver: "Auto Eco (Conserves under 25%)",
    batterySaverMode: "Battery Saver (Max Field Life)",
    highPerformance: "Standard Performance",
    batteryLevelLabel: "Phone Battery Level",
    chargingStatus: "Charging",
    dischargingStatus: "On Battery Power",
    estimatedBatteryHours: "Est. Field Duration Remaining",
    batterySaverActiveBanner: "⚡ Battery Saver Active — Animations & background network polling optimized for long field durability"
  },
  te: {
    appName: "అగ్రి కనెక్ట్",
    appSubtitle: "డిజిటల్ వ్యవసాయ కేంద్రం",
    tagline: "ఆధునిక వ్యవసాయానికి మీ నమ్మకమైన డిజిటల్ భాగస్వామి.",
    version: "v2.4 ప్రొ",
    language: "యాప్ భాష",
    selectLanguage: "భాష",
    english: "English",
    telugu: "తెలుగు",
    currentLocation: "ప్రస్తుత ప్రాంతం",
    logout: "లాగ్ అవుట్",
    farmerProfile: "రైతు వివరాలు",
    close: "మూసివేయి",
    saveChanges: "సేవ్ చేయి",

    tabHome: "డాష్‌బోర్డ్",
    tabCrops: "పంట పొలాలు",
    tabWeather: "వాతావరణ సమాచారం",
    tabBookings: "PACS బుకింగ్‌లు",
    tabMarket: "రైతు మార్కెట్",
    tabEquipment: "యంత్రాల అద్దె",
    tabAiDoctor: "ఏఐ పంట డాక్టర్",
    tabSchemes: "ప్రభుత్వ పథకాలు",
    tabPesticides: "ఎరువుల మార్గదర్శి",
    tabMl: "మషీన్ లెర్నింగ్ (ML)",
    tabVoiceAgent: "జెమినీ వాయిస్ ఏజెంట్",

    farmerLogIn: "రైతు లాగిన్",
    registerNewCard: "కొత్త కార్డ్ నమోదు",
    aadhaarMethod: "ఆధార్",
    mobileMethod: "మొబైల్",
    farmerAadhaarLabel: "రైతు ఆధార్ సంఖ్య",
    regMobileLabel: "నమోదిత మొబైల్ సంఖ్య",
    otpSentBanner: "భద్రతా ఓటీపీ పంపబడింది!",
    enterOtpInstruction: "6 అంకెల ధృవీకరణ కోడ్‌ను నమోదు చేయండి.",
    verificationPinLabel: "6-అంకెల ధృవీకరణ పిన్/ఓటీపీ",
    verifyAndLogIn: "ధృవీకరించి లాగిన్ అవ్వండి",
    requestAuthGateway: "ఓటీపీ పంపమని అభ్యర్థించండి",
    accessingGateway: "భద్రతా గేట్‌వే ప్రాసెస్ అవుతోంది...",
    farmerFullName: "రైతు పూర్తి పేరు",
    mobilePhoneIndia: "మొబైల్ ఫోన్ (భారతదేశం)",
    aadhaarNumber: "ఆధార్ సంఖ్య",
    landAcres: "భూమి (ఎకరాలు)",
    stateRegistry: "రాష్ట్ర వివరాలు",
    districtArea: "జిల్లా ప్రాంతం",
    mobileVerificationRequired: "మొబైల్ ధృవీకరణ అవసరం",
    verifyAndCompleteReg: "కోడ్ ధృవీకరించి నమోదు పూర్తి చేయండి",
    requestRegOtp: "నమోదు ఓటీపీ అభ్యర్థించండి",
    credentialError: "రుజువు లోపం:",
    sandboxKey: "పరిశీలన కోడ్ (Sandbox Key)",
    securityVerified: "భద్రతా వివరాలు ధృవీకరించబడ్డాయి",
    welcomeBack: "స్వాగతం,",
    initializingSession: "భద్రతా సెషన్ ప్రారంభించబడుతోంది...",

    soilType: "నేల రకం",
    landSizeAcres: "భూవిస్తీర్ణం (ఎకరాలు)",
    recommendedCrops: "సిఫార్సు చేసిన పంట రకాలు",
    calculateYield: "దిగుబడి & ఆదాయం అంచనా",
    marketPriceToday: "నేటి మార్కెట్ ధరలు",
    quickActions: "త్వరిత సేవలు",
    recentAlerts: "వాతావరణం & పురుగుల హెచ్చరికలు",
    weatherOverview: "వాతావరణ సమగ్ర సమాచారం",
    pacsMemberCard: "జాతీయ రైతు గుర్తింపు కార్డ్",

    profileAndSettings: "రైతు వివరాలు & సెట్టింగ్‌లు",
    profileTab: "రైతు ప్రొఫైల్",
    settingsTab: "యాప్ సెట్టింగ్‌లు",
    languagePreference: "భాషా ఎంపిక",
    languageDescription: "మీకు ఇష్టమైన ప్రధాన భాషను ఎంచుకోండి. అప్లికేషన్ తక్షణమే మారడం జరుగుతుంది.",
    themePreference: "రంగుల థీమ్ (Theme)",
    lightMode: "లైట్ మోడ్",
    darkMode: "డార్క్ మోడ్",
    languageChangedToast: "భాష విజయవంతంగా మార్చబడింది!",
    settingsSaved: "సెట్టింగ్‌లు సేవ్ చేయబడ్డాయి.",

    batteryOptimizer: "బ్యాటరీ ఆదా & ఫీల్డ్ మన్నిక",
    powerMode: "పవర్ మోడ్ (Power Mode)",
    autoPowerSaver: "ఆటో ఎకో మోడ్ (25% కింద ఆటోమేటిక్)",
    batterySaverMode: "బ్యాటరీ సేవర్ (గరిష్ట బ్యాటరీ మన్నిక)",
    highPerformance: "స్టాండర్డ్ పర్ఫార్మెన్స్",
    batteryLevelLabel: "ఫోన్ బ్యాటరీ శాతం",
    chargingStatus: "ఛార్జింగ్ అవుతోంది",
    dischargingStatus: "బ్యాటరీపై నడుస్తోంది",
    estimatedBatteryHours: "అంచనా మిగిలిన పని సమయం",
    batterySaverActiveBanner: "⚡ బ్యాటరీ సేవర్ మోడ్ యాక్టివ్ — పొలంలో ఫోన్ బ్యాటరీ ఎక్కువ సమయం రావడానికి యానిమేషన్లు మరియు నెట్‌వర్క్ వాడకం తగ్గించబడింది"
  }
};
