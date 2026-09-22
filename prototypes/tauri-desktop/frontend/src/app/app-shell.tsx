import { useLocation } from "react-router-dom";
import { AppNavbar } from "../components/app-navbar";
import { SidebarInset, SidebarProvider } from "../components/ui/sidebar";
import { useOnboardingCompletion } from "../features/onboarding/public";
import { usePublicProfile } from "../features/profile/public";
import { useCoreStatus } from "../lib/tauri/use-core-status";
import { useDaemonEvents } from "../lib/tauri/use-daemon-events";
import { AppRoutes } from "./app-routes";
import { useAccountQueryLifecycle } from "./hooks/use-account-query-lifecycle";
import { useDesktopEvents } from "./hooks/use-desktop-events";
import { QuitConfirmation } from "./quit-confirmation";
import { routeIdFromPath } from "./routes";

export function AppShell() {
  const { pathname } = useLocation();
  const route = routeIdFromPath(pathname);
  const core = useCoreStatus();
  useDaemonEvents(core.scope);
  useAccountQueryLifecycle(core.scope);
  const publicProfile = usePublicProfile();
  const tenantId = core.data?.daemon.tenant_id ?? null;
  const onboarding = useOnboardingCompletion(tenantId);
  const desktop = useDesktopEvents();
  const requiresOnboarding =
    (core.data?.daemon.logged_in === false ||
      (core.data?.daemon.logged_in === true && !onboarding.isComplete)) &&
    route !== null &&
    route !== "insights" &&
    route !== "mission-drafts";

  return (
    <SidebarProvider>
      <AppNavbar
        queueCount={core.data?.daemon.queue_depth ?? 0}
        profile={publicProfile.data}
        profileState={publicProfile.state}
      />
      <SidebarInset>
        <main className="min-w-0 flex-1">
          {desktop.error && (
            <p
              className="mx-6 mt-4 rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
              role="alert"
            >
              {desktop.error}
            </p>
          )}
          <AppRoutes
            requiresOnboarding={requiresOnboarding}
            core={core}
            publicProfile={publicProfile}
            initialInvite={desktop.initialInvite}
            onOnboardingComplete={onboarding.complete}
          />
        </main>
      </SidebarInset>
      <QuitConfirmation
        open={desktop.quitRequested}
        onOpenChange={desktop.setQuitRequested}
      />
    </SidebarProvider>
  );
}
