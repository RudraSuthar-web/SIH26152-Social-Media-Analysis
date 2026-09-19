import {
  OverviewMetrics,
  AdapterHealth,
  ModelHealth,
  CanonicalEvent,
  SentimentTimePoint,
  TrendTopic,
  DemographicAggregate,
  NetworkNode,
  NetworkEdge,
  CommunityCluster,
  DeadLetterEntry,
  CascadeNode,
  ModelEvaluationData,
  PlatformType,
  TimeRangeOption,
  ApiResponse,
  EmotionBreakdown
} from '../types';

import {
  mockOverviewData,
  mockAdapterHealthData,
  mockModelHealthData,
  mockEventsData,
  mockEmotionAggregateData,
  mockSentimentTimelineData,
  mockTrendsData,
  mockDemographicsData,
  mockNetworkGraphData,
  mockPropagationData,
  mockEvaluationData,
  mockDeadLetterData
} from './mockData';

// API Client for PS 26152 NTRO / SIH 2026 Social Media Analytics Backend

const BASE_URL = '/api/v1';

function generateRequestId(): string {
  return `req-${Math.random().toString(36).substring(2, 9)}`;
}

async function fetchEnvelope<T>(url: string, fallbackData: ApiResponse<T>): Promise<ApiResponse<T>> {
  const requestId = generateRequestId();
  try {
    const res = await fetch(`${BASE_URL}${url}`, {
      headers: {
        'Accept': 'application/json',
        'x-request-id': requestId
      }
    });
    if (!res.ok) throw new Error(`API status ${res.status}`);
    const json = await res.json();
    return json;
  } catch (err) {
    // API server unavailable fallback (development synthetic envelope)
    return fallbackData;
  }
}

export const apiService = {
  getOverview: (): Promise<ApiResponse<OverviewMetrics>> =>
    fetchEnvelope('/metrics/overview', mockOverviewData),

  getAdapterHealth: (): Promise<ApiResponse<AdapterHealth[]>> =>
    fetchEnvelope('/admin/ingestion/status', mockAdapterHealthData),

  getModelHealth: (): Promise<ApiResponse<ModelHealth[]>> =>
    fetchEnvelope('/admin/models/status', mockModelHealthData),

  getDeadLetters: (): Promise<ApiResponse<DeadLetterEntry[]>> =>
    fetchEnvelope('/admin/ingestion/dead-letters', mockDeadLetterData),

  getCanonicalEvents: (platform: PlatformType = 'all'): Promise<ApiResponse<CanonicalEvent[]>> => {
    const url = platform === 'all' ? '/events' : `/events?platform=${platform}`;
    const fallback = platform === 'all'
      ? mockEventsData
      : { ...mockEventsData, data: mockEventsData.data.filter(e => e.platform === platform) };
    return fetchEnvelope(url, fallback);
  },

  getEmotionAggregate: (): Promise<ApiResponse<EmotionBreakdown>> =>
    fetchEnvelope('/sentiment/emotions', mockEmotionAggregateData),

  getSentimentTimeline: (range: TimeRangeOption = '24h'): Promise<ApiResponse<SentimentTimePoint[]>> =>
    fetchEnvelope(`/sentiment/timeline?range=${range}`, mockSentimentTimelineData),

  getTrends: (): Promise<ApiResponse<TrendTopic[]>> =>
    fetchEnvelope('/trends', mockTrendsData),

  getDemographics: (): Promise<ApiResponse<DemographicAggregate>> =>
    fetchEnvelope('/demographics', mockDemographicsData),

  getNetworkGraph: (): Promise<ApiResponse<{ nodes: NetworkNode[]; edges: NetworkEdge[]; communities: CommunityCluster[] }>> =>
    fetchEnvelope('/network/graph', mockNetworkGraphData),

  getPropagationCascade: (topicId?: string): Promise<ApiResponse<CascadeNode>> =>
    fetchEnvelope(`/network/propagation?topic_id=${topicId || 't-101'}`, mockPropagationData),

  getModelEvaluation: (): Promise<ApiResponse<ModelEvaluationData[]>> =>
    fetchEnvelope('/models/evaluation', mockEvaluationData)
};
