"use client"
import { createContext, useContext, useState, ReactNode, useCallback, Dispatch, SetStateAction } from 'react';

type Location = { lat: number; lng: number } | null;

type DashboardContextType = {
  isSosModalOpen: boolean;
  setIsSosModalOpen: Dispatch<SetStateAction<boolean>>;
  loc: Location;
  setLoc: Dispatch<SetStateAction<Location>>;
  loadNearby: () => Promise<void>;
  registerLoadNearby: (fn: () => Promise<void>) => void;
};

const DashboardContext = createContext<DashboardContextType | undefined>(undefined);

export const DashboardProvider = ({ children }: { children: ReactNode }) => {
  const [isSosModalOpen, setIsSosModalOpen] = useState(false);
  const [loc, setLoc] = useState<Location>(null);
  const [loadNearbyCallback, setLoadNearbyCallback] = useState<() => Promise<void>>(() => async () => {});

  const registerLoadNearby = useCallback((fn: () => Promise<void>) => {
    setLoadNearbyCallback(() => fn);
  }, []);

  const loadNearby = useCallback(async () => {
    await loadNearbyCallback();
  }, [loadNearbyCallback]);

  return (
    <DashboardContext.Provider value={{ isSosModalOpen, setIsSosModalOpen, loc, setLoc, loadNearby, registerLoadNearby }}>
      {children}
    </DashboardContext.Provider>
  );
};

export const useDashboard = (): DashboardContextType => {
  const context = useContext(DashboardContext);
  if (context === undefined) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};