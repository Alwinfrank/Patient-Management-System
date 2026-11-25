export function downloadCsv(filename: string, headers: string[], rows: Array<Array<string | number | null | undefined>>) {
  const cell = (value: string | number | null | undefined) => {
    const text = String(value ?? '');
    return `"${text.replace(/"/g, '""')}"`;
  };
  const contents = [headers, ...rows].map((row) => row.map(cell).join(',')).join('\r\n');
  const blob = new Blob([`\uFEFF${contents}`], { type: 'text/csv;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}

export function csvDateStamp() {
  return new Date().toISOString().slice(0, 10);
}
