"use client"
import { createContext, useContext, useState, ReactNode, useCallback, Dispatch, SetStateAction } from 'react';

type Location = { lat: number; lng: number } | null;

type AppContextType = {
  isSosModalOpen: boolean;
  setIsSosModalOpen: Dispatch<SetStateAction<boolean>>;
  loc: Location;
  setLoc: Dispatch<SetStateAction<Location>>;
  // Although named 'loadNearby', this can be a generic data refresh trigger.
  // A component can register its own data-fetching function to be called by this.
  loadNearby: () => Promise<void>;
  registerLoadNearby: (fn: () => Promise<void>) => void;
};

const AppContext = createContext<AppContextType | undefined>(undefined);

export const AppProvider = ({ children }: { children: ReactNode }) => {
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
    <AppContext.Provider value={{ isSosModalOpen, setIsSosModalOpen, loc, setLoc, loadNearby, registerLoadNearby }}>
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};