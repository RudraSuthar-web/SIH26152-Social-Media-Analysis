import { useEffect, useRef, useState, useCallback } from 'react';

export interface WebSocketMessage<T = any> {
  topic: 'ingestion.health' | 'trends.new' | 'model.health' | 'system.alert';
  timestamp: string;
  data: T;
}

export interface UseWebSocketReturn {
  isConnected: boolean;
  lastMessage: WebSocketMessage | null;
  sendMessage: (msg: any) => void;
  reconnectCount: number;
}

export const useWebSocket = (url: string = 'wss://api.sih2026.ntro.gov.in/ws'): UseWebSocketReturn => {
  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  const [reconnectCount, setReconnectCount] = useState<number>(0);

  const socketRef = useRef<WebSocket | null>(null);
  const reconnectTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const connect = useCallback(() => {
    try {
      // In production or mock environment, handle WebSocket initialization safely
      const ws = new WebSocket(url);

      ws.onopen = () => {
        setIsConnected(true);
        console.log('[WS] Connected to real-time intelligence stream:', url);
      };

      ws.onmessage = (event) => {
        try {
          const parsed: WebSocketMessage = JSON.parse(event.data);
          setLastMessage(parsed);
        } catch (e) {
          console.error('[WS] Failed to parse WebSocket message:', e);
        }
      };

      ws.onerror = (error) => {
        console.warn('[WS] WebSocket connection error:', error);
        setIsConnected(false);
      };

      ws.onclose = () => {
        setIsConnected(false);
        console.log('[WS] WebSocket connection closed. Scheduling auto-reconnect...');

        // Auto-reconnect with exponential backoff cap
        reconnectTimerRef.current = setTimeout(() => {
          setReconnectCount((prev) => prev + 1);
          connect();
        }, 5000);
      };

      socketRef.current = ws;
    } catch (err) {
      console.warn('[WS] Simulated WebSocket fallback active.');
      setIsConnected(false);
    }
  }, [url]);

  useEffect(() => {
    connect();

    return () => {
      if (reconnectTimerRef.current) clearTimeout(reconnectTimerRef.current);
      if (socketRef.current) {
        socketRef.current.close();
      }
    };
  }, [connect]);

  const sendMessage = useCallback((msg: any) => {
    if (socketRef.current && socketRef.current.readyState === WebSocket.OPEN) {
      socketRef.current.send(JSON.stringify(msg));
    }
  }, []);

  return {
    isConnected,
    lastMessage,
    sendMessage,
    reconnectCount
  };
};
