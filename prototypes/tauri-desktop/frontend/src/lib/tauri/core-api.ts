import { invoke, isTauri } from "@tauri-apps/api/core";
import { listen } from "@tauri-apps/api/event";
import type { CoreStatus } from "./types";

function tauriInvoke<T>(command: string, args: Record<string, unknown> = {}) {
  if (!isTauri()) throw new Error("Rust core is available only inside Tauri");
  return invoke<T>(command, args).catch((error: unknown) => {
    throw normalizeInvokeError(error);
  });
}

function normalizeInvokeError(error: unknown): Error {
  if (error instanceof Error) return error;
  if (typeof error === "string" && error.trim() !== "") {
    return new Error(error);
  }
  if (isRecord(error) && typeof error.message === "string") {
    return new Error(error.message);
  }
  return new Error("Rust command failed");
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function parseCoreStatus(value: unknown): CoreStatus {
  if (!isRecord(value) || !isRecord(value.daemon)) {
    throw new Error("Rust core returned an invalid status payload");
  }
  const daemon = value.daemon;
  const healthValue = daemon.health;
  if (!isRecord(healthValue)) {
    throw new Error("Rust core returned an invalid status payload");
  }
  const health = healthValue;
  if (
    typeof value.prototype !== "boolean" ||
    typeof value.state_dir !== "string" ||
    typeof daemon.schema_version !== "string" ||
    typeof daemon.logged_in !== "boolean" ||
    (daemon.tenant_id !== null && typeof daemon.tenant_id !== "string") ||
    !Array.isArray(daemon.consent_scopes) ||
    !daemon.consent_scopes.every((scope) => typeof scope === "string") ||
    typeof daemon.paused !== "boolean" ||
    typeof daemon.queue_depth !== "number" ||
    (health.last_error_label !== null &&
      typeof health.last_error_label !== "string") ||
    (health.since !== null && typeof health.since !== "string")
  ) {
    throw new Error("Rust core returned an invalid status payload");
  }
  return value as unknown as CoreStatus;
}

export async function getCoreStatus(): Promise<CoreStatus> {
  if (!isTauri()) {
    return {
      prototype: true,
      state_dir: "browser-preview",
      daemon: {
        schema_version: "browser-preview",
        logged_in: false,
        tenant_id: null,
        consent_scopes: [],
        paused: false,
        queue_depth: 0,
        health: { last_error_label: null, since: null },
      },
    };
  }
  return parseCoreStatus(await tauriInvoke<unknown>("core_status"));
}

export function isTauriRuntime() {
  return isTauri();
}

export async function daemonCall<T>(
  method: string,
  params: Record<string, unknown> = {},
): Promise<T> {
  return tauriInvoke<T>("daemon_call", { method, params });
}

export function invokeTauri<T>(
  command: string,
  args: Record<string, unknown> = {},
) {
  return tauriInvoke<T>(command, args);
}

export async function listenTauri<T>(
  event: string,
  handler: (payload: T) => void,
): Promise<() => void> {
  if (!isTauri()) return () => {};
  return listen<T>(event, ({ payload }) => handler(payload));
}
