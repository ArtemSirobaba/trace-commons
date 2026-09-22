import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { isTauriRuntime, listenTauri } from "../../lib/tauri/core-api";
import { consumeDeepLink, openExternalUrl } from "../../lib/tauri/platform-api";
import { routePaths } from "../routes";

type RoutePath = (typeof routePaths)[keyof typeof routePaths];
type DesktopDeepLink = NonNullable<Awaited<ReturnType<typeof consumeDeepLink>>>;
type Navigate = ReturnType<typeof useNavigate>;

function isRoutePath(value: unknown): value is RoutePath {
  return (
    typeof value === "string" &&
    Object.values(routePaths).some((path) => path === value)
  );
}

async function handleDesktopLink(
  link: DesktopDeepLink,
  navigate: Navigate,
  setInvite: (invite: string) => void,
) {
  switch (link.kind) {
    case "enroll":
      setInvite(link.invite);
      navigate(routePaths.profile);
      return;
    case "credential":
      navigate(routePaths["private-ai"]);
      return;
    case "navigate":
      navigate(link.path);
      return;
    case "public_run":
      await openExternalUrl(link.url);
  }
}

async function registerTauriListener<T>(
  event: string,
  handler: (payload: T) => void,
  isCancelled: () => boolean,
  cleanups: Array<() => void>,
) {
  const unlisten = await listenTauri<T>(event, handler);
  if (isCancelled()) unlisten();
  else cleanups.push(unlisten);
}

export function useDesktopEvents() {
  const navigate = useNavigate();
  const [initialInvite, setInitialInvite] = useState<string | null>(null);
  const [quitRequested, setQuitRequested] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const cleanups: Array<() => void> = [];
    const consume = async () => {
      if (cancelled || !isTauriRuntime()) return;
      try {
        const link = await consumeDeepLink();
        if (cancelled || !link) return;
        setError(null);
        await handleDesktopLink(link, navigate, setInitialInvite);
      } catch {
        if (!cancelled) setError("A desktop link could not be opened.");
      }
    };
    const listen = async () => {
      const isCancelled = () => cancelled;
      await registerTauriListener<unknown>(
        "deep-link-received",
        () => void consume(),
        isCancelled,
        cleanups,
      );
      await registerTauriListener<unknown>(
        "navigate",
        (path) => {
          if (!cancelled && isRoutePath(path)) navigate(path);
        },
        isCancelled,
        cleanups,
      );
      await registerTauriListener<unknown>(
        "quit-requested",
        () => {
          if (!cancelled) setQuitRequested(true);
        },
        isCancelled,
        cleanups,
      );
      await consume();
    };

    void listen().catch(() => {
      if (!cancelled) setError("Desktop event listeners are unavailable.");
    });
    return () => {
      cancelled = true;
      for (const cleanup of cleanups) cleanup();
    };
  }, [navigate]);

  return { initialInvite, quitRequested, setQuitRequested, error };
}
