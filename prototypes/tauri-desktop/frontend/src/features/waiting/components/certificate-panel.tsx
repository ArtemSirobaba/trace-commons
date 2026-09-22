import type { WaitingEntry } from "../types";
import { CertificateDetailTrigger } from "./certificate-detail-trigger";

export function CertificatePanel({ entries }: { entries: WaitingEntry[] }) {
  const certified = entries.filter((entry) => entry.holds_certificate === true);
  if (entries.length === 0) return null;
  return (
    <section className="mb-4 grid gap-2.5 rounded-xl border border-chart-4/30 bg-chart-4/10 p-[22px_26px]">
      <div>
        <span className="mb-3 block font-mono text-[10px] font-extrabold leading-none tracking-[.16em] text-primary">
          WITNESS CERTIFICATE
        </span>
        <h2>
          {certified.length > 0
            ? `${certified.length} session${certified.length === 1 ? "" : "s"} has reviewed evidence`
            : "No witness certificate is currently held"}
        </h2>
      </div>
      {certified.length > 0 ? (
        <p>
          These sessions carry a witness certificate over reviewed bytes. This
          does not mean raw content is public or that upload has happened.
        </p>
      ) : (
        <p>Nothing here yet. Witness review adds a certificate to a session.</p>
      )}
      <div className="mt-1 grid gap-3 border-t border-chart-4/20 pt-3">
        {certified.map((entry) => (
          <div key={entry.entry_id} className="grid gap-1">
            <strong>{entry.project_label}</strong>
            <span>
              {entry.source} · {entry.entry_id}
            </span>
            <CertificateDetailTrigger entry={entry} />
          </div>
        ))}
      </div>
    </section>
  );
}
