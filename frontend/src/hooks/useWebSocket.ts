import { useEffect, useRef, useCallback, useState } from "react";

const MAX_RETRIES = 10;
const MAX_DELAY_MS = 30_000;

export function useWebSocket<T = unknown>(
  path: string,
  onMessage?: (data: T) => void,
) {
  const wsRef = useRef<WebSocket | null>(null);
  const onMessageRef = useRef(onMessage);
  onMessageRef.current = onMessage;
  const [connected, setConnected] = useState(false);
  const retriesRef = useRef(0);
  const closedByUserRef = useRef(false);

  const connect = useCallback(() => {
    closedByUserRef.current = false;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const host = window.location.host;
    const ws = new WebSocket(`${protocol}//${host}/${path}`);

    ws.onopen = () => {
      setConnected(true);
      retriesRef.current = 0;
    };
    ws.onclose = () => {
      setConnected(false);
      if (!closedByUserRef.current && retriesRef.current < MAX_RETRIES) {
        const delay = Math.min(1000 * 2 ** retriesRef.current, MAX_DELAY_MS);
        retriesRef.current++;
        setTimeout(connect, delay);
      }
    };
    ws.onmessage = (event) => {
      const data = JSON.parse(event.data) as T;
      onMessageRef.current?.(data);
    };
    wsRef.current = ws;
  }, [path]);

  useEffect(() => {
    connect();
    return () => {
      closedByUserRef.current = true;
      wsRef.current?.close();
    };
  }, [connect]);

  const send = useCallback((data: unknown) => {
    wsRef.current?.send(JSON.stringify(data));
  }, []);

  return { connected, send };
}
