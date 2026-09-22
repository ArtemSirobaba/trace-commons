import { daemonCall } from "../../../lib/tauri/core-api";
import type { CertificateDetail } from "../types";

function record(value: unknown): Record<string, unknown> {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    throw new Error("Invalid certificate detail");
  }
  return value as Record<string, unknown>;
}

function stringField(value: Record<string, unknown>, key: string): string {
  if (typeof value[key] !== "string")
    throw new Error(`Invalid certificate field: ${key}`);
  return value[key] as string;
}

function receiptField(value: unknown) {
  if (value === null || value === undefined) return null;
  const receipt = record(value);
  const reason = receipt.reason;
  if (reason !== null && reason !== undefined && typeof reason !== "string") {
    throw new Error("Invalid certificate field: inference_receipt");
  }
  return {
    state: stringField(receipt, "state"),
    reason: (reason as string | null | undefined) ?? null,
  };
}

export function parseCertificateDetail(value: unknown): CertificateDetail {
  const detail = record(value);
  const issuedAt = detail.issued_at;
  const expiresAt = detail.expires_at;
  if (
    detail.state !== "held" ||
    detail.verification !== "verified_at_review" ||
    detail.expiry_state !== "not_issued" ||
    typeof issuedAt !== "number" ||
    expiresAt !== null ||
    typeof detail.signature_present !== "boolean" ||
    typeof detail.admission_evidence_present !== "boolean"
  ) {
    throw new Error("Invalid certificate detail");
  }
  return {
    state: "held",
    verification: "verified_at_review",
    redacted_sha256: stringField(detail, "redacted_sha256"),
    residual_risk_verdict: stringField(detail, "residual_risk_verdict"),
    redaction_policy_version: stringField(detail, "redaction_policy_version"),
    witness_measurement: stringField(detail, "witness_measurement"),
    issued_at: issuedAt,
    expires_at: null,
    expiry_state: "not_issued",
    signer: stringField(detail, "signer"),
    signature_present: detail.signature_present,
    admission_evidence_present: detail.admission_evidence_present,
    inference_receipt: receiptField(detail.inference_receipt),
  };
}

export async function getCertificateDetail(
  entryId: string,
): Promise<CertificateDetail> {
  return parseCertificateDetail(
    await daemonCall<unknown>("certificate_detail", { entry_id: entryId }),
  );
}
