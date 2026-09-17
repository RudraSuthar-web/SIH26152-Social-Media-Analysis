import React from 'react';
import { AnalyticsProvider, useAnalytics } from './context/AnalyticsContext';
import { Layout } from './components/layout/Layout';
import { ErrorBoundary } from './components/common/ErrorBoundary';
import { OverviewPage } from './pages/OverviewPage';
import { SentimentPage } from './pages/SentimentPage';
import { DemographicsPage } from './pages/DemographicsPage';
import { TrendsPage } from './pages/TrendsPage';
import { NetworkPage } from './pages/NetworkPage';
import { PropagationPage } from './pages/PropagationPage';
import { EvaluationPage } from './pages/EvaluationPage';
import { DataQualityPage } from './pages/DataQualityPage';

const AppContent: React.FC = () => {
  const { activeTab } = useAnalytics();

  const renderActiveTab = () => {
    switch (activeTab) {
      case 'sentiment':
        return <SentimentPage />;
      case 'demographics':
        return <DemographicsPage />;
      case 'trends':
        return <TrendsPage />;
      case 'network':
        return <NetworkPage />;
      case 'propagation':
        return <PropagationPage />;
      case 'evaluation':
        return <EvaluationPage />;
      case 'quality':
        return <DataQualityPage />;
      case 'overview':
      default:
        return <OverviewPage />;
    }
  };

  return (
    <Layout>
      <ErrorBoundary>
        {renderActiveTab()}
      </ErrorBoundary>
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <AnalyticsProvider>
      <AppContent />
    </AnalyticsProvider>
  );
};

export default App;
