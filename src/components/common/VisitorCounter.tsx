"use client";

import { useEffect, useState } from "react";

type State = {
  today: number;
  total: number;
  configured: boolean;
  loading: boolean;
};

export default function VisitorCounter() {
  const [state, setState] = useState<State>({
    today: 0,
    total: 0,
    configured: false,
    loading: true,
  });

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/visits", { method: "POST" });
        if (!res.ok) {
          if (!cancelled) {
            setState({ today: 0, total: 0, configured: false, loading: false });
          }
          return;
        }
        const data = await res.json();
        if (cancelled) return;
        setState({
          today: Number(data.today) || 0,
          total: Number(data.total) || 0,
          configured: Boolean(data.configured),
          loading: false,
        });
      } catch {
        if (!cancelled) {
          setState({ today: 0, total: 0, configured: false, loading: false });
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  if (state.loading || !state.configured) return null;

  return (
    <span className="text-zinc-600">
      오늘 {state.today.toLocaleString()}명 · 누적{" "}
      {state.total.toLocaleString()}명
    </span>
  );
}
