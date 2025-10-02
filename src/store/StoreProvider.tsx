"use client";

import { useEffect, useState } from 'react';
import { useCalendarStore, useOperatorsStore, useUsersStore } from './index';

interface StoreProviderProps {
  children: React.ReactNode;
}

export function StoreProvider({ children }: StoreProviderProps) {
  const [isHydrated, setIsHydrated] = useState(false);

  useEffect(() => {
    // Simple hydration check - just wait for client side
    setIsHydrated(true);
  }, []);

  if (!isHydrated) {
    // Show loading or return null to prevent hydration mismatch
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse text-gray-500">در حال بارگذاری...</div>
      </div>
    );
  }

  return <>{children}</>;
}
