export function exportToCSV(
  filename: string,
  rows: Record<string, any>[]
) {
  if (!rows || !rows.length) return;

  const headers = Object.keys(rows[0]);

  const csvContent = [
    headers.join(","),
    ...rows.map(row =>
      headers.map(h => `"${row[h] ?? ""}"`).join(",")
    ),
  ].join("\n");

  const blob = new Blob([csvContent], {
    type: "text/csv;charset=utf-8;",
  });

  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
