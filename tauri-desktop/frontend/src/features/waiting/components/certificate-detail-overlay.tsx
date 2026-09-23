import { ResponsiveOverlay } from "../../../components/responsive-overlay";
import type { CertificateDetail, WaitingEntry } from "../types";

function issuedAt(value: number) {
  return new Date(value * 1000).toLocaleString();
}

export function CertificateDetailOverlay({
  entry,
  open,
  onOpenChange,
  state,
  detail,
  error,
}: {
  entry: WaitingEntry;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  state: "idle" | "loading" | "ready" | "error";
  detail: CertificateDetail | null;
  error: string | null;
}) {
  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={onOpenChange}
      title="Witness certificate"
      description={`${entry.project_label} · ${entry.source}`}
    >
      {state === "loading" && <p className="py-4 text-sm">Reading held certificate…</p>}
      {state === "error" && (
        <p className="py-4 text-sm text-destructive">
          {error ?? "Certificate detail unavailable."}
        </p>
      )}
      {detail && (
        <dl className="grid gap-3 py-2 text-sm">
          <div>
            <dt className="text-muted-foreground">Verification</dt>
            <dd>Verified at review; held bytes match review pin.</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Signer</dt>
            <dd className="break-all font-mono text-xs">{detail.signer}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Residual-risk verdict</dt>
            <dd>{detail.residual_risk_verdict}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Redaction policy</dt>
            <dd>{detail.redaction_policy_version}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Witness measurement</dt>
            <dd className="break-all font-mono text-xs">{detail.witness_measurement}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Issued</dt>
            <dd>{issuedAt(detail.issued_at)}</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Expiry</dt>
            <dd>Not issued by current certificate schema.</dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Inference receipt</dt>
            <dd>
              {detail.inference_receipt
                ? `${detail.inference_receipt.state}${detail.inference_receipt.reason ? ` · ${detail.inference_receipt.reason}` : ""}`
                : "Unknown for this review."}
            </dd>
          </div>
          <div>
            <dt className="text-muted-foreground">Admission evidence</dt>
            <dd>{detail.admission_evidence_present ? "Present" : "Not present"}</dd>
          </div>
        </dl>
      )}
    </ResponsiveOverlay>
  );
}
