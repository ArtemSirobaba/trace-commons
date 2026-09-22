import { useState } from "react";
import { Button } from "../../../components/ui/button";
import { CertificateDetailOverlay } from "./certificate-detail-overlay";
import { useCertificateDetail } from "../hooks/use-certificate-detail";
import type { WaitingEntry } from "../types";

export function CertificateDetailTrigger({ entry }: { entry: WaitingEntry }) {
  const [open, setOpen] = useState(false);
  const detail = useCertificateDetail(entry.entry_id, open);
  return (
    <>
      <Button
        className="w-fit border-0 bg-transparent p-0 text-[11px] font-bold text-primary"
        type="button"
        onClick={() => setOpen(true)}
      >
        View certificate details
      </Button>
      <CertificateDetailOverlay
        entry={entry}
        open={open}
        onOpenChange={setOpen}
        state={detail.state}
        detail={detail.data}
        error={detail.error}
      />
    </>
  );
}
