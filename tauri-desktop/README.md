# Trace Commons Tauri Desktop

Cross-platform Tauri app backed by the existing Rust contributor core. Swift,
WinUI, and GTK applications remain unchanged. Tauri source/build success does
not establish native OS or release parity; current gates live in
[ARCHITECTURE.md](./ARCHITECTURE.md).

## Run from repository root

```bash
./tauri-desktop/scripts/dev.sh
./tauri-desktop/scripts/build.sh
./tauri-desktop/scripts/build.sh --release
./tauri-desktop/scripts/start.sh
./tauri-desktop/scripts/start.sh --no-build
```

The development script runs Vite on port 1420 with Tauri reload. Build scripts
install frontend dependencies from the frozen lockfile. Local state stays in
Tauri's per-user app-data directory. Desktop launch does not require PostgreSQL
or Docker.

Bundle identifier remains `ai.tracecommons.tauri.prototype` during this move to
preserve existing local app-data identity. Change it only with an explicit
state-migration and release-identity decision.
