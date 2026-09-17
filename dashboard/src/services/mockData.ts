import {
  CanonicalEvent,
  SentimentTimePoint,
  DemographicAggregate,
  TrendTopic,
  NetworkNode,
  NetworkEdge,
  CommunityCluster,
  AdapterHealth,
  ModelHealth,
  DeadLetterEntry,
  OverviewMetrics,
  CascadeNode,
  ModelEvaluationData,
  ApiResponse,
  EmotionBreakdown
} from '../types';

// Standard Envelope Wrapper Helper
const createEnvelope = <T>(data: T, dataSource: 'live' | 'synthetic' | 'replay' = 'synthetic', modelVersion?: string): ApiResponse<T> => ({
  data,
  meta: {
    request_id: `req-${Math.random().toString(36).substring(2, 9)}`,
    timestamp: new Date().toISOString(),
    data_source: dataSource,
    window: {
      since: new Date(Date.now() - 86400000).toISOString(),
      until: new Date().toISOString()
    },
    model_version: modelVersion || 'v3.1'
  }
});

// SOUL.md §21 Overview Metrics (No vanity metrics)
export const mockOverviewData: ApiResponse<OverviewMetrics> = createEnvelope({
  total_events_24h: 148290,
  events_trend_pct: 12.3,
  active_accounts_24h: 18450,
  trending_topics_count: 12,
  sentiment_distribution: { positive: 0.62, neutral: 0.26, negative: 0.12 },
  adapter_health: {
    x: 'healthy',
    telegram: 'healthy'
  }
});

export const mockAdapterHealthData: ApiResponse<AdapterHealth[]> = createEnvelope([
  {
    platform: 'x',
    enabled: true,
    healthy: true,
    status: 'healthy',
    lag_seconds: 0.8,
    rate_limit_usage_pct: 34,
    events_ingested_24h: 89400,
    last_success_at: new Date().toISOString(),
    error_count: 2
  },
  {
    platform: 'telegram',
    enabled: true,
    healthy: true,
    status: 'healthy',
    lag_seconds: 1.2,
    rate_limit_usage_pct: 18,
    events_ingested_24h: 42100,
    last_success_at: new Date().toISOString(),
    error_count: 0
  }
]);

export const mockModelHealthData: ApiResponse<ModelHealth[]> = createEnvelope([
  {
    model_name: 'cardiffnlp/twitter-xlm-roberta-base-sentiment',
    version: 'v3.1 (ONNX)',
    p95_latency_ms: 18.4,
    p99_latency_ms: 32.1,
    error_rate_pct: 0.02,
    total_inferences: 148290,
    status: 'optimal'
  },
  {
    model_name: 'fasttext-lid-176',
    version: 'v1.0.2',
    p95_latency_ms: 1.2,
    p99_latency_ms: 2.5,
    error_rate_pct: 0.0,
    total_inferences: 148290,
    status: 'optimal'
  }
]);

export const mockDeadLetterData: ApiResponse<DeadLetterEntry[]> = createEnvelope([
  {
    id: 'dlq-9921',
    platform: 'x',
    error_code: 'RATE_LIMIT_EXCEEDED_429',
    error_message: 'X API v2 rate limit bucket empty for search/recent',
    received_at: new Date(Date.now() - 3600000).toISOString(),
    retry_count: 3,
    raw_payload_snippet: '{"id": "189201...", "text": "Cyber threat query..."}'
  },
  {
    id: 'dlq-9918',
    platform: 'telegram',
    error_code: 'MALFORMED_UTF8_ENCODING',
    error_message: 'Surrogate pair mismatch in emoji sequence at pos 42',
    received_at: new Date(Date.now() - 7200000).toISOString(),
    retry_count: 1,
    raw_payload_snippet: '{"msg_id": 9821, "text": "Threat update \uD83D..."}'
  }
]);

export const mockEventsData: ApiResponse<CanonicalEvent[]> = createEnvelope([
  {
    event_id: 'evt-890a-11ee',
    platform: 'x',
    source_event_id: '1892019482910',
    source_user_id: 'usr_sec_hash_89a',
    text: 'Critical update on cyber defense frameworks: NTRO initiative for social media analytics brings real-time visibility into narrative propagation! #CyberSecurity #NTRO',
    language: 'en',
    detected_language_confidence: 0.99,
    event_timestamp: new Date(Date.now() - 300000).toISOString(),
    ingested_at: new Date(Date.now() - 295000).toISOString(),
    conversation_id: 'conv-101',
    mentions: ['@NTRO_India'],
    hashtags: ['#CyberSecurity', '#NTRO', '#SIH2026'],
    urls: ['https://sih.gov.in/ps/26152'],
    engagement: { likes: 342, shares: 128, replies: 24 },
    sentiment: 'positive',
    sentiment_confidence: 0.92,
    emotions: { anger: 0.02, anxiety: 0.05, excitement: 0.88, supportive: 0.94, opposing: 0.03, sarcasm: 0.01, uncertainty: 0.04 },
    sarcasm_uncertain: false,
    model_info: { name: 'xlm-roberta-base-sentiment', version: 'v3.1' },
    data_source: 'live'
  },
  {
    event_id: 'evt-890b-11ee',
    platform: 'telegram',
    source_event_id: 'msg_98201',
    source_user_id: 'usr_tg_hash_42c',
    text: 'NTRO National Cyber Security Hackathon alert: automated verification rules ensure 0 fake intelligence in dashboard metrics. High precision required! #SIH2026',
    language: 'en',
    detected_language_confidence: 0.96,
    event_timestamp: new Date(Date.now() - 600000).toISOString(),
    ingested_at: new Date(Date.now() - 590000).toISOString(),
    conversation_id: 'conv-102',
    forwarded_from: 'channel_intel_99',
    mentions: [],
    hashtags: ['#SIH2026', '#NTROCyber'],
    urls: [],
    engagement: { likes: 512, shares: 204, replies: 45, views: 8900 },
    sentiment: 'positive',
    sentiment_confidence: 0.86,
    emotions: { anger: 0.01, anxiety: 0.12, excitement: 0.76, supportive: 0.85, opposing: 0.05, sarcasm: 0.02, uncertainty: 0.08 },
    data_source: 'live'
  },
  {
    event_id: 'evt-890c-11ee',
    platform: 'x',
    source_event_id: '1892019483012',
    source_user_id: 'usr_dev_hash_11b',
    text: 'નવા નેશનલ સાયબર ગ્રીડ અને સોશિયલ મીડિયા એનાલિટિક્સ ફ્રેમવર્ક વિશે ચર્ચા શરૂ થઈ ગઈ છે. AI મોડેલ ખૂબ સચોટ છે! (Gujarati-English code-switched feed)',
    language: 'gu',
    detected_language_confidence: 0.94,
    translated_text: 'Discussion has started regarding the new national cyber grid and social media analytics framework. The AI model is very accurate!',
    event_timestamp: new Date(Date.now() - 900000).toISOString(),
    ingested_at: new Date(Date.now() - 890000).toISOString(),
    mentions: ['@NTRO_India'],
    hashtags: ['#NationalCyberGrid', '#TechDev'],
    urls: [],
    engagement: { likes: 189, shares: 67, replies: 12 },
    sentiment: 'positive',
    sentiment_confidence: 0.89,
    emotions: { anger: 0.01, anxiety: 0.08, excitement: 0.82, supportive: 0.90, opposing: 0.02, sarcasm: 0.01, uncertainty: 0.06 },
    data_source: 'live'
  },
  {
    event_id: 'evt-890d-11ee',
    platform: 'x',
    source_event_id: '1892019484100',
    source_user_id: 'usr_critic_hash_99d',
    text: 'Wow, another system update... sure, because this will totally fix server latency instantly 🙄 #SarcasmCheck',
    language: 'en',
    detected_language_confidence: 0.98,
    event_timestamp: new Date(Date.now() - 1200000).toISOString(),
    ingested_at: new Date(Date.now() - 1190000).toISOString(),
    mentions: [],
    hashtags: ['#SarcasmCheck'],
    urls: [],
    engagement: { likes: 45, shares: 14, replies: 32 },
    sentiment: 'negative',
    sentiment_confidence: 0.54,
    emotions: { anger: 0.35, anxiety: 0.40, excitement: 0.05, supportive: 0.10, opposing: 0.65, sarcasm: 0.78, uncertainty: 0.62 },
    sarcasm_uncertain: true,
    data_source: 'live'
  }
]);

export const mockEmotionAggregateData: ApiResponse<EmotionBreakdown> = createEnvelope({
  supportive: 0.84,
  excitement: 0.72,
  opposing: 0.22,
  anxiety: 0.18,
  anger: 0.08,
  sarcasm: 0.35,
  uncertainty: 0.12
});

export const mockSentimentTimelineData: ApiResponse<SentimentTimePoint[]> = createEnvelope([
  { timestamp: '00:00', positive: 450, negative: 120, neutral: 300, sarcasm_flagged: 18, total: 870 },
  { timestamp: '04:00', positive: 380, negative: 140, neutral: 280, sarcasm_flagged: 22, total: 800 },
  { timestamp: '08:00', positive: 890, negative: 210, neutral: 520, sarcasm_flagged: 45, total: 1620 },
  { timestamp: '12:00', positive: 1450, negative: 380, neutral: 890, sarcasm_flagged: 89, total: 2720 },
  { timestamp: '16:00', positive: 1890, negative: 420, neutral: 980, sarcasm_flagged: 104, total: 3290 },
  { timestamp: '20:00', positive: 1620, negative: 310, neutral: 740, sarcasm_flagged: 62, total: 2670 }
]);

export const mockTrendsData: ApiResponse<TrendTopic[]> = createEnvelope([
  {
    topic_id: 't-101',
    topic_label: 'NTRO AI Analytics Framework',
    keywords: ['NTRO', 'Social Media Analytics', 'AI Framework', 'SIH 2026'],
    hashtags: ['#NTROAnalytics', '#SIH2026', '#AIThreatIntel'],
    volume: 24890,
    unique_users: 14200,
    growth_rate: 3.42,
    velocity: 0.85,
    momentum: 2.89,
    trend_score: 94.6,
    platforms: ['x', 'telegram'],
    languages: ['en', 'hi', 'gu'],
    coordinated_pattern: false,
    components: { volume_score: 10.12, growth_rate: 3.42, velocity: 0.85, decay: 0.95 },
    sparkline: [12, 28, 45, 89, 145, 290, 480, 890, 1450, 2489]
  },
  {
    topic_id: 't-102',
    topic_label: 'Multilingual Sentiment & Sarcasm AI',
    keywords: ['Sentiment Analysis', 'Hinglish', 'Gujarati NLP', 'Sarcasm Detection'],
    hashtags: ['#NLPIndia', '#AIResearch', '#SentimentAI'],
    volume: 18450,
    unique_users: 9800,
    growth_rate: 1.85,
    velocity: 0.42,
    momentum: 1.54,
    trend_score: 82.3,
    platforms: ['x', 'telegram'],
    languages: ['en', 'hi', 'gu', 'hinglish'],
    coordinated_pattern: false,
    components: { volume_score: 9.82, growth_rate: 1.85, velocity: 0.42, decay: 0.91 },
    sparkline: [10, 18, 32, 54, 89, 120, 240, 450, 890, 1845]
  },
  {
    topic_id: 't-103',
    topic_label: 'Leiden Community Network Topology',
    keywords: ['Network Topology', 'PageRank', 'Graph Theory', 'Leiden Cluster'],
    hashtags: ['#NetworkAnalysis', '#GraphAnalytics'],
    volume: 12400,
    unique_users: 6200,
    growth_rate: 1.12,
    velocity: 0.28,
    momentum: 0.95,
    trend_score: 71.8,
    platforms: ['x'],
    languages: ['en'],
    coordinated_pattern: false,
    components: { volume_score: 9.42, growth_rate: 1.12, velocity: 0.28, decay: 0.88 },
    sparkline: [8, 14, 22, 40, 65, 110, 180, 310, 620, 1240]
  },
  {
    topic_id: 't-104',
    topic_label: 'Coordinated Repost Burst Alert #CyberSec',
    keywords: ['Burst Repost', 'Coordinated Push', 'Hashtag Flood'],
    hashtags: ['#CyberSecAlert'],
    volume: 8900,
    unique_users: 1200,
    growth_rate: 8.90,
    velocity: 2.40,
    momentum: 6.80,
    trend_score: 88.9,
    platforms: ['x', 'telegram'],
    languages: ['en'],
    coordinated_pattern: true, // FLAG: High burst velocity + low unique user ratio
    components: { volume_score: 9.09, growth_rate: 8.90, velocity: 2.40, decay: 0.98 },
    sparkline: [2, 3, 2, 4, 5, 8, 12, 450, 4200, 8900]
  }
]);

export const mockDemographicsData: ApiResponse<DemographicAggregate> = createEnvelope({
  window: 'Last 24 Hours',
  topic: 'All Monitored Cyber Vectors',
  sample_size: 148290,
  confidence_label: 'estimated',
  age_brackets: {
    '13-17': 0.08,
    '18-25': 0.38,
    '26-35': 0.36,
    '36-50': 0.14,
    '50+': 0.04
  },
  age_confidence_intervals: {
    '13-17': [0.06, 0.10],
    '18-25': [0.35, 0.41],
    '26-35': [0.33, 0.39],
    '36-50': [0.12, 0.16],
    '50+': [0.03, 0.05]
  },
  languages: {
    'English (en)': 0.52,
    'Hindi (hi)': 0.26,
    'Gujarati (gu)': 0.14,
    'Hinglish / Mixed': 0.08
  },
  geography: {
    'Western Cyber Region': 0.42,
    'NCR / Delhi': 0.24,
    'Maharashtra / Mumbai': 0.18,
    'Karnataka / South': 0.10,
    'Other International': 0.06
  },
  interests: {
    'Cyber Security & Defense': 0.45,
    'Technology & AI': 0.28,
    'Govt Initiatives & Policy': 0.15,
    'Public Governance': 0.12
  },
  methodology_notes: [
    'Bio keyword classification using fine-tuned fasttext models',
    'Posting hours distribution mapped to timezones',
    'Hashtag co-occurrence clustering'
  ]
});

// Pseudonymized Network Nodes (Strictly no handles or real names)
export const mockNetworkGraphData: ApiResponse<{ nodes: NetworkNode[]; edges: NetworkEdge[]; communities: CommunityCluster[] }> = createEnvelope({
  nodes: [
    { node_id: 'node_sec_89a', platform: 'x', source_user_id: 'hash_usr_89a', avatar_color: '#38bdf8', pagerank: 0.084, betweenness: 0.142, degree: 148, community_id: 'comm-alpha', post_count: 340 },
    { node_id: 'node_intel_42c', platform: 'x', source_user_id: 'hash_usr_42c', avatar_color: '#10b981', pagerank: 0.076, betweenness: 0.128, degree: 132, community_id: 'comm-alpha', post_count: 280 },
    { node_id: 'node_tg_99d', platform: 'telegram', source_user_id: 'hash_usr_99d', avatar_color: '#a855f7', pagerank: 0.062, betweenness: 0.095, degree: 98, community_id: 'comm-beta', post_count: 410 },
    { node_id: 'node_ai_11b', platform: 'x', source_user_id: 'hash_usr_11b', avatar_color: '#3b82f6', pagerank: 0.058, betweenness: 0.088, degree: 86, community_id: 'comm-alpha', post_count: 195 },
    { node_id: 'node_rd_55e', platform: 'x', source_user_id: 'hash_usr_55e', avatar_color: '#f59e0b', pagerank: 0.045, betweenness: 0.064, degree: 74, community_id: 'comm-gamma', post_count: 120 },
    { node_id: 'node_analyst_33f', platform: 'x', source_user_id: 'hash_usr_33f', avatar_color: '#f43f5e', pagerank: 0.039, betweenness: 0.052, degree: 62, community_id: 'comm-beta', post_count: 145 }
  ],
  edges: [
    { id: 'e-1', source_node_id: 'node_sec_89a', target_node_id: 'node_intel_42c', edge_type: 'repost', provenance: 'observed', weight: 45 },
    { id: 'e-2', source_node_id: 'node_sec_89a', target_node_id: 'node_ai_11b', edge_type: 'quote', provenance: 'observed', weight: 32 },
    { id: 'e-3', source_node_id: 'node_intel_42c', target_node_id: 'node_tg_99d', edge_type: 'forward', provenance: 'observed', weight: 28 },
    { id: 'e-4', source_node_id: 'node_tg_99d', target_node_id: 'node_analyst_33f', edge_type: 'mention', provenance: 'observed', weight: 19 },
    { id: 'e-5', source_node_id: 'node_ai_11b', target_node_id: 'node_rd_55e', edge_type: 'topic_similarity', provenance: 'inferred', weight: 0.88 },
    { id: 'e-6', source_node_id: 'node_rd_55e', target_node_id: 'node_analyst_33f', edge_type: 'reply', provenance: 'observed', weight: 14 }
  ],
  communities: [
    { community_id: 'comm-alpha', node_count: 420, modularity: 0.48, dominant_topics: ['NTRO Analytics', 'Cyber Framework', 'SIH 2026'], color: '#38bdf8' },
    { community_id: 'comm-beta', node_count: 310, modularity: 0.39, dominant_topics: ['National Cyber Cell', 'Realtime Alerts', 'Telegram Intel'], color: '#a855f7' },
    { community_id: 'comm-gamma', node_count: 185, modularity: 0.32, dominant_topics: ['Graph Theory', 'PageRank', 'Language Detection'], color: '#f59e0b' }
  ]
});

// Cascade Tree for Propagation View
export const mockPropagationData: ApiResponse<CascadeNode> = createEnvelope({
  id: 'casc-root',
  event_id: 'evt-890a-11ee',
  node_id: 'node_sec_89a',
  platform: 'x',
  timestamp: new Date(Date.now() - 3600000).toISOString(),
  depth: 0,
  provenance: 'observed',
  children: [
    {
      id: 'casc-sub-1',
      event_id: 'evt-890b-11ee',
      node_id: 'node_intel_42c',
      platform: 'x',
      timestamp: new Date(Date.now() - 2700000).toISOString(),
      depth: 1,
      provenance: 'observed',
      children: [
        {
          id: 'casc-sub-1-1',
          event_id: 'evt-890c-11ee',
          node_id: 'node_tg_99d',
          platform: 'telegram',
          timestamp: new Date(Date.now() - 1800000).toISOString(),
          depth: 2,
          provenance: 'observed'
        }
      ]
    },
    {
      id: 'casc-sub-2',
      event_id: 'evt-890d-11ee',
      node_id: 'node_ai_11b',
      platform: 'x',
      timestamp: new Date(Date.now() - 2100000).toISOString(),
      depth: 1,
      provenance: 'inferred'
    }
  ]
});

// Model Evaluation Data
export const mockEvaluationData: ApiResponse<ModelEvaluationData[]> = createEnvelope([
  {
    model_name: 'cardiffnlp/twitter-xlm-roberta-base-sentiment',
    version: 'v3.1 (ONNX)',
    macro_f1: 0.842,
    precision: 0.865,
    recall: 0.821,
    latency_p95_ms: 18.4,
    latency_p99_ms: 32.1,
    drift_detected: false,
    languages_eval: {
      en: { f1: 0.89, samples: 4500 },
      hi: { f1: 0.82, samples: 3100 },
      gu: { f1: 0.79, samples: 1800 },
      hinglish: { f1: 0.76, samples: 1200 }
    }
  }
]);
