import { useQuery } from "@tanstack/react-query";
import { useCoreStatus } from "../../../lib/tauri/use-core-status";
import { getCertificateDetail } from "../api/certificate-api";
import type { CertificateDetail } from "../types";
import { waitingKeys } from "../api/query-keys";

type CertificateDetailState = {
  state: "idle" | "loading" | "ready" | "error";
  data: CertificateDetail | null;
  error: string | null;
};

export function useCertificateDetail(
  entryId: string,
  open: boolean,
): CertificateDetailState {
  const core = useCoreStatus();
  const query = useQuery({
    queryKey: waitingKeys.certificateDetail(core.scope, entryId),
    queryFn: () => getCertificateDetail(entryId),
    enabled: open && core.isSuccess,
    staleTime: 60_000,
  });
  if (!open) return { state: "idle", data: null, error: null };
  if (!core.isSuccess) {
    return {
      state: core.isError ? "error" : "loading",
      data: null,
      error: core.isError ? "Certificate detail unavailable" : null,
    };
  }
  return {
    state: query.isPending ? "loading" : query.isError ? "error" : "ready",
    data: query.data ?? null,
    error: query.error
      ? query.error instanceof Error
        ? query.error.message
        : "Certificate detail unavailable"
      : null,
  };
}
