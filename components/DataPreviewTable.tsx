type DataPreviewTableProps = {
  columns: string[];
  rows: Record<string, any>[];
};

export function DataPreviewTable({ columns, rows }: DataPreviewTableProps) {
  if (!columns.length || !rows.length) {
    return (
      <p className="text-xs text-slate-500">
        No data to show yet. Upload a CSV and run an analysis.
      </p>
    );
  }

  const displayColumns = columns.slice(0, 10);

  return (
    <div className="mt-3 max-h-64 overflow-auto rounded-lg border border-slate-800 bg-slate-950/60 text-xs">
      <table className="min-w-full border-collapse">
        <thead className="bg-slate-900/80">
          <tr>
            {displayColumns.map((col) => (
              <th
                key={col}
                className="sticky top-0 border-b border-slate-800 px-2 py-1 text-left font-medium text-slate-200"
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, idx) => (
            <tr
              key={idx}
              className={idx % 2 === 0 ? "bg-slate-950" : "bg-slate-950/70"}
            >
              {displayColumns.map((col) => (
                <td
                  key={col}
                  className="border-b border-slate-900 px-2 py-1 text-slate-300"
                >
                  {String(row[col] ?? "")}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {columns.length > 10 && (
        <p className="mt-2 text-xs text-slate-500">
          Showing first 10 columns. Total columns: {columns.length}
        </p>
      )}
    </div>
  );
}

