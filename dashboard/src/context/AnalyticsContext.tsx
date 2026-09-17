import React, { createContext, useContext, useState, ReactNode } from 'react';
import { TimeRangeOption, PlatformType } from '../types';

interface AnalyticsContextType {
  timeRange: TimeRangeOption;
  setTimeRange: (range: TimeRangeOption) => void;
  selectedPlatform: PlatformType;
  setSelectedPlatform: (platform: PlatformType) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  lastUpdated: Date;
  refreshData: () => void;
}

const AnalyticsContext = createContext<AnalyticsContextType | undefined>(undefined);

export const AnalyticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [timeRange, setTimeRange] = useState<TimeRangeOption>('24h');
  const [selectedPlatform, setSelectedPlatform] = useState<PlatformType>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

  const refreshData = () => {
    setLastUpdated(new Date());
  };

  return (
    <AnalyticsContext.Provider
      value={{
        timeRange,
        setTimeRange,
        selectedPlatform,
        setSelectedPlatform,
        searchQuery,
        setSearchQuery,
        activeTab,
        setActiveTab,
        lastUpdated,
        refreshData
      }}
    >
      {children}
    </AnalyticsContext.Provider>
  );
};

export const useAnalytics = () => {
  const context = useContext(AnalyticsContext);
  if (!context) {
    throw new Error('useAnalytics must be used within an AnalyticsProvider');
  }
  return context;
};
