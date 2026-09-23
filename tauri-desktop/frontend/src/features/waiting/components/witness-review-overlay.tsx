import type { UseMutationResult } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { ResponsiveOverlay } from "../../../components/responsive-overlay";
import type { WitnessReview } from "../api/native-review-api";

type WitnessMutation = UseMutationResult<WitnessReview, Error, void, unknown>;

export function WitnessReviewOverlay({
  open,
  onOpenChange,
  mutation,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  mutation: WitnessMutation;
}) {
  const error = mutation.isError
    ? "Witness review result could not be confirmed. Check the entry's current state before retrying."
    : mutation.isSuccess && !mutation.data.ready
      ? (mutation.data.message ?? "Witness review was not confirmed.")
      : null;
  const redactionSummary = mutation.data?.ready
    ? Object.entries(mutation.data.summary.redactions)
        .map(([label, count]) => `${label} ${count}`)
        .join(" · ") || "No redactions reported"
    : null;
  return (
    <ResponsiveOverlay
      open={open}
      onOpenChange={onOpenChange}
      title="Request witness review"
      description="This sends an explicit raw-session review request to the pinned witness. It does not approve or publish the entry."
      footer={
        <div className="flex justify-end gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={() => onOpenChange(false)}
          >
            Cancel
          </Button>
          <Button
            type="button"
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending}
          >
            {mutation.isPending ? "Reviewing…" : "Confirm witness review"}
          </Button>
        </div>
      }
    >
      <div className="grid gap-3 text-[12px] text-muted-foreground">
        <p className="m-0">
          The witness receives only this explicit review request. Ordinary
          preview and approval paths do not call it.
        </p>
        {error && (
          <p className="m-0 rounded-[9px] border border-destructive/30 bg-destructive/10 px-3.5 py-3 text-destructive">
            {error}
          </p>
        )}
        {mutation.isSuccess && mutation.data.ready && (
          <div className="grid gap-2 text-primary">
            <p className="m-0">
              Reviewed envelope:{" "}
              {mutation.data.summary.would_send_bytes.toLocaleString()} bytes ·{" "}
              {mutation.data.summary.event_count.toLocaleString()} events
            </p>
            {redactionSummary && <p className="m-0">{redactionSummary}</p>}
            <p className="m-0">
              Residual risk: {mutation.data.summary.residual_risk}
            </p>
          </div>
        )}
      </div>
    </ResponsiveOverlay>
  );
}
