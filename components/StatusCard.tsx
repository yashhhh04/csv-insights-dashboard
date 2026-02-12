type Status = {
  ok: boolean;
  message: string;
  model?: string;
};

type StatusCardProps = {
  label: string;
  status: Status | null;
};

export function StatusCard({ label, status }: StatusCardProps) {
  const badgeClass = status
    ? status.ok
      ? "badge-ok"
      : "badge-error"
    : "badge-warn";

  const badgeText = status
    ? status.ok
      ? "OK"
      : "Error"
    : "Not checked";

  return (
    <div className="card">
      <div className="card-header">
        <h2 className="card-title">{label}</h2>
        <span className={badgeClass}>{badgeText}</span>
      </div>
      <p className="card-subtitle">
        {status ? status.message : "Run a health check to see the latest state."}
      </p>
      {status?.model && (
        <p className="mt-2 text-xs text-slate-400">
          Model: <span className="font-mono">{status.model}</span>
        </p>
      )}
    </div>
  );
}

