import type { QueryClient } from "@tanstack/react-query";
import { useQueryClient } from "@tanstack/react-query";
import { useEffect } from "react";
import { listenTauri } from "./core-api";
import { coreKeys } from "./query-keys";

const daemonEventNames = [
  "snapshot",
  "queue_changed",
  "status_changed",
  "digest_due",
  "resync_required",
  "preview_ready",
] as const;

type DaemonEventName = (typeof daemonEventNames)[number];

function isDaemonEventName(value: string): value is DaemonEventName {
  return daemonEventNames.some((event) => event === value);
}

function parseDaemonEvent(value: unknown): DaemonEventName | null {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return null;
  }
  const event = (value as Record<string, unknown>).event;
  return typeof event === "string" && isDaemonEventName(event) ? event : null;
}

function invalidateForDaemonEvent(
  queryClient: QueryClient,
  scope: string,
  event: DaemonEventName,
) {
  const accountScope = ["account", scope] as const;
  const waitingScope = [...accountScope, "waiting"] as const;

  switch (event) {
    case "queue_changed":
      void queryClient.invalidateQueries({ queryKey: waitingScope });
      void queryClient.invalidateQueries({ queryKey: coreKeys.status });
      return;
    case "preview_ready":
      void queryClient.invalidateQueries({ queryKey: waitingScope });
      return;
    case "status_changed":
    case "snapshot":
    case "resync_required":
      void queryClient.invalidateQueries({ queryKey: accountScope });
      void queryClient.invalidateQueries({ queryKey: coreKeys.status });
      return;
    case "digest_due":
      return;
  }
}

export function useDaemonEvents(scope: string) {
  const queryClient = useQueryClient();
  useEffect(() => {
    let cancelled = false;
    let cleanup: (() => void) | null = null;
    const subscribe = async () => {
      cleanup = await listenTauri<unknown>("daemon-event", (payload) => {
        if (cancelled) return;
        const event = parseDaemonEvent(payload);
        if (event) invalidateForDaemonEvent(queryClient, scope, event);
      });
      if (cancelled) cleanup();
    };
    void subscribe();
    return () => {
      cancelled = true;
      cleanup?.();
    };
  }, [queryClient, scope]);
}
