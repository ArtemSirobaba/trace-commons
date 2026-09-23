# Tauri desktop architecture

Tauri reuses the existing permissively licensed contributor core. Swift, WinUI,
and GTK shells remain unchanged; no legacy app is removed by this work.

## Frontend and Rust boundary

- `frontend/src/lib/tauri/core-api.ts` uses official Tauri 2 `invoke` and
  `listen` APIs. No `window.__TAURI__` bridge, browser HTTP fallback, or direct
  frontend daemon access.
- Feature adapters validate `unknown` command results. Rust validates inputs,
  owns native access and domain operations, and returns typed JSON/errors.
- `daemon_call` stays read-only and allowlisted; mutations use named commands.
  Rust emits approved event names; app-level handlers invalidate feature query
  keys, and queries refetch through their feature adapters.
- Handler registration, generated build permissions, and the main-window
  capability manifest must stay aligned. CSP permits local assets and Tauri
  IPC; development adds fixed Vite/HMR origins.

## React state and lifecycle

- Eager routes; feature-owned adapters, query keys, forms, workflow hooks, and
  public entries. TanStack Query owns daemon state; components own ephemeral UI.
- Effects synchronize external subscriptions and authoritative native/server
  state only. Derived display values stay in render.
- Desktop listeners subscribe before consuming a cold-start deep link. A
  credential callback refreshes Private AI status, then opens Private AI.
- Event bridge starts after daemon startup or source-root selection. Unix
  attachments reconnect after transport loss. No-root startup keeps account-
  free routes available. Quit confirmation and macOS Reopen are wired.

## Remaining parity gates

- macOS and Tauri both register `tracecommons://`; choose callback ownership
  before distributing both.
- Certificate display stays within native parity: held-session list and shared
  copy only; no Tauri-only certificate detail surface.
- Existing-daemon attachment supports Unix sockets on macOS/Linux. Windows
  named-pipe attachment remains unsupported.
- Tauri tray still lacks legacy health, budget, and armed-project summaries;
  pause-until-tomorrow-morning behavior also remains unmatched.
- Native smoke remains open for notifications, login items, tray, keychain,
  file grants, deep links, and package behavior on each OS.
- Signed packaging, notarization, clean-machine upgrade, provider callbacks,
  wallet completion, and witness availability need live acceptance.
- Bundle identifier stays `ai.tracecommons.tauri.prototype` to preserve local
  app-data identity; decide migration before release.

## Checks

From repository root:

```bash
pnpm --dir tauri-desktop/frontend build
pnpm --dir tauri-desktop/frontend build-storybook
cargo fmt --manifest-path tauri-desktop/src-tauri/Cargo.toml -- --check
cargo check --locked --manifest-path tauri-desktop/src-tauri/Cargo.toml
cargo test --locked --manifest-path tauri-desktop/src-tauri/Cargo.toml
```

`.github/workflows/tauri-desktop.yml` runs frontend and Storybook builds plus
Rust format/check/test across macOS, Linux, and Windows. CI does not establish
GUI, OS-permission, signed-package, or provider acceptance.
