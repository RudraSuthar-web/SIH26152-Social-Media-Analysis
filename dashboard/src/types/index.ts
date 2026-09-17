export type DataSourceType = 'live' | 'synthetic' | 'degraded' | 'replay' | 'offline';

export type PlatformType = 'x' | 'telegram' | 'instagram' | 'facebook' | 'reddit' | 'youtube' | 'all';

export type TimeRangeOption = '15m' | '1h' | '24h' | '7d' | 'custom';

export type SentimentLabel = 'positive' | 'negative' | 'neutral';

export interface ApiMeta {
  request_id: string;
  timestamp: string;
  data_source: DataSourceType;
  window?: { since: string; until: string };
  model_version?: string;
  processing_version?: string;
}

export interface ApiResponse<T> {
  data: T;
  meta: ApiMeta;
  error?: { code: string; message: string };
}

export interface EmotionBreakdown {
  anger: number;
  anxiety: number;
  excitement: number;
  supportive: number;
  opposing: number;
  sarcasm: number;
  uncertainty: number;
}

export interface CanonicalEvent {
  event_id: string;
  platform: PlatformType;
  source_event_id: string;
  source_user_id: string; // Pseudonymized internal hash
  text: string;
  language: string;
  detected_language_confidence?: number;
  translated_text?: string;
  event_timestamp: string;
  ingested_at: string;
  processed_at?: string;
  conversation_id?: string;
  parent_event_id?: string;
  reply_to_user_id?: string;
  forwarded_from?: string;
  mentions: string[];
  hashtags: string[];
  urls: string[];
  engagement: {
    likes: number;
    shares: number;
    replies: number;
    views?: number;
  };
  sentiment?: SentimentLabel;
  sentiment_confidence?: number;
  emotions?: EmotionBreakdown;
  sarcasm_uncertain?: boolean;
  model_info?: {
    name: string;
    version: string;
  };
  data_source: DataSourceType;
}

export interface SentimentTimePoint {
  timestamp: string;
  positive: number;
  negative: number;
  neutral: number;
  sarcasm_flagged: number;
  total: number;
}

export interface DemographicAggregate {
  window: string;
  topic: string;
  sample_size: number;
  confidence_label: 'estimated' | 'inferred' | 'uncertain';
  age_brackets: {
    '13-17': number;
    '18-25': number;
    '26-35': number;
    '36-50': number;
    '50+': number;
  };
  age_confidence_intervals?: Record<string, [number, number]>;
  languages: Record<string, number>;
  geography: Record<string, number>;
  interests: Record<string, number>;
  methodology_notes: string[];
}

export interface TrendMetrics {
  volume_score: number;
  growth_rate: number;
  velocity: number;
  decay: number;
}

export interface TrendTopic {
  topic_id: string;
  topic_label: string;
  keywords: string[];
  hashtags: string[];
  volume: number;
  unique_users: number;
  growth_rate: number;
  velocity: number;
  momentum: number;
  trend_score: number;
  platforms: PlatformType[];
  languages: string[];
  coordinated_pattern: boolean;
  components: TrendMetrics;
  sparkline: number[];
}

export interface NetworkNode {
  node_id: string; // Pseudonymized internal ID only
  platform: PlatformType;
  source_user_id: string; // Hashed identifier
  avatar_color: string;
  pagerank: number;
  betweenness: number;
  degree: number;
  community_id: string;
  post_count: number;
}

export interface NetworkEdge {
  id: string;
  source_node_id: string;
  target_node_id: string;
  edge_type: 'mention' | 'reply' | 'repost' | 'forward' | 'quote' | 'topic_similarity';
  provenance: 'observed' | 'inferred';
  weight: number;
  event_id?: string;
}

export interface CommunityCluster {
  community_id: string;
  node_count: number;
  modularity: number;
  dominant_topics: string[];
  color: string;
}

export interface CascadeNode {
  id: string;
  event_id: string;
  node_id: string;
  platform: PlatformType;
  timestamp: string;
  depth: number;
  provenance: 'observed' | 'inferred';
  children?: CascadeNode[];
}

export interface ModelEvaluationData {
  model_name: string;
  version: string;
  macro_f1: number;
  precision: number;
  recall: number;
  latency_p95_ms: number;
  latency_p99_ms: number;
  drift_detected: boolean;
  languages_eval: Record<string, { f1: number; samples: number }>;
}

export interface AdapterHealth {
  platform: PlatformType;
  enabled: boolean;
  healthy: boolean;
  status: 'healthy' | 'degraded' | 'down';
  lag_seconds: number;
  rate_limit_usage_pct: number;
  events_ingested_24h: number;
  last_success_at: string;
  error_count: number;
}

export interface ModelHealth {
  model_name: string;
  version: string;
  p95_latency_ms: number;
  p99_latency_ms: number;
  error_rate_pct: number;
  total_inferences: number;
  status: 'optimal' | 'degraded' | 'offline';
}

export interface DeadLetterEntry {
  id: string;
  platform: PlatformType;
  error_code: string;
  error_message: string;
  received_at: string;
  retry_count: number;
  raw_payload_snippet: string;
}

export interface OverviewMetrics {
  total_events_24h: number;
  events_trend_pct: number;
  active_accounts_24h: number;
  trending_topics_count: number;
  sentiment_distribution: {
    positive: number;
    negative: number;
    neutral: number;
  };
  adapter_health: Record<string, 'healthy' | 'degraded' | 'down'>;
}
