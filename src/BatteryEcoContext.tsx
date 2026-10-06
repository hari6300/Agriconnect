import React, { createContext, useContext, useState, useEffect } from 'react';

export interface BatteryStatus {
  isSupported: boolean;
  level: number; // 0 to 1
  charging: boolean;
  chargingTime: number;
  dischargingTime: number;
}

export type EcoPowerMode = 'auto' | 'battery_saver' | 'high_performance';

interface BatteryEcoContextType {
  batteryStatus: BatteryStatus;
  powerMode: EcoPowerMode;
  setPowerMode: (mode: EcoPowerMode) => void;
  isLowPowerActive: boolean;
  reduceAnimations: boolean;
  backgroundSyncInterval: number; // in milliseconds
  estimatedRemainingHours: number | null;
}

const BatteryEcoContext = createContext<BatteryEcoContextType | undefined>(undefined);

export const BatteryEcoProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [batteryStatus, setBatteryStatus] = useState<BatteryStatus>({
    isSupported: false,
    level: 1,
    charging: true,
    chargingTime: 0,
    dischargingTime: Infinity
  });

  const [powerMode, setPowerModeState] = useState<EcoPowerMode>(() => {
    const saved = localStorage.getItem('agriconnect_power_mode');
    return (saved as EcoPowerMode) || 'auto';
  });

  const setPowerMode = (mode: EcoPowerMode) => {
    setPowerModeState(mode);
    localStorage.setItem('agriconnect_power_mode', mode);
  };

  // Battery Status API listener (navigator.getBattery)
  useEffect(() => {
    let batteryObj: any = null;

    const updateBatteryInfo = (b: any) => {
      setBatteryStatus({
        isSupported: true,
        level: b.level ?? 1,
        charging: b.charging ?? false,
        chargingTime: b.chargingTime ?? 0,
        dischargingTime: b.dischargingTime ?? Infinity
      });
    };

    if (typeof navigator !== 'undefined' && 'getBattery' in navigator) {
      (navigator as any).getBattery().then((battery: any) => {
        batteryObj = battery;
        updateBatteryInfo(battery);

        battery.addEventListener('levelchange', () => updateBatteryInfo(battery));
        battery.addEventListener('chargingchange', () => updateBatteryInfo(battery));
        battery.addEventListener('chargingtimechange', () => updateBatteryInfo(battery));
        battery.addEventListener('dischargingtimechange', () => updateBatteryInfo(battery));
      }).catch(() => {
        // Fallback for browsers without Battery API
        setBatteryStatus(prev => ({ ...prev, isSupported: false }));
      });
    }

    return () => {
      if (batteryObj) {
        try {
          batteryObj.removeEventListener('levelchange', () => {});
          batteryObj.removeEventListener('chargingchange', () => {});
        } catch (e) {}
      }
    };
  }, []);

  // Determine if Low Power (Battery Saver) optimizations should be engaged
  const isAutoLowBattery = batteryStatus.isSupported && !batteryStatus.charging && batteryStatus.level <= 0.25;
  const isLowPowerActive = powerMode === 'battery_saver' || (powerMode === 'auto' && isAutoLowBattery);

  // Animations & Render throttle state
  const reduceAnimations = isLowPowerActive;

  // Background Sync interval (30s normal, 180s in battery saver)
  const backgroundSyncInterval = isLowPowerActive ? 180000 : 45000;

  // Estimated remaining phone battery life based on discharge rate
  let estimatedRemainingHours: number | null = null;
  if (batteryStatus.isSupported) {
    if (batteryStatus.charging) {
      estimatedRemainingHours = null;
    } else if (Number.isFinite(batteryStatus.dischargingTime) && batteryStatus.dischargingTime > 0) {
      estimatedRemainingHours = Math.round((batteryStatus.dischargingTime / 3600) * 10) / 10;
    } else {
      // Conservative estimate based on percentage (e.g. 100% ~ 14h of typical agricultural field use)
      const baseHours = isLowPowerActive ? 18 : 12;
      estimatedRemainingHours = Math.round((batteryStatus.level * baseHours) * 10) / 10;
    }
  }

  // Apply battery optimization body class for global CSS optimizations
  useEffect(() => {
    const root = document.documentElement;
    if (isLowPowerActive) {
      root.classList.add('battery-saver-active');
    } else {
      root.classList.remove('battery-saver-active');
    }
  }, [isLowPowerActive]);

  return (
    <BatteryEcoContext.Provider
      value={{
        batteryStatus,
        powerMode,
        setPowerMode,
        isLowPowerActive,
        reduceAnimations,
        backgroundSyncInterval,
        estimatedRemainingHours
      }}
    >
      {children}
    </BatteryEcoContext.Provider>
  );
};

export const useBatteryEco = (): BatteryEcoContextType => {
  const context = useContext(BatteryEcoContext);
  if (!context) {
    throw new Error('useBatteryEco must be used within a BatteryEcoProvider');
  }
  return context;
};
