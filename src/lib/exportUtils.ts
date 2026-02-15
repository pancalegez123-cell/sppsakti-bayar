import { toast } from 'sonner';

interface ExportData {
  headers: string[];
  rows: (string | number)[][];
  title: string;
}

export function exportToCSV(data: ExportData) {
  const csv = [data.headers, ...data.rows].map(r => r.map(c => `"${c}"`).join(',')).join('\n');
  const bom = '\uFEFF';
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' });
  downloadBlob(blob, `${data.title}.csv`);
  toast.success('File CSV berhasil diunduh');
}

export function exportToExcel(data: ExportData) {
  // Generate a simple HTML table that Excel can open
  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:x="urn:schemas-microsoft-com:office:excel">
<head><meta charset="utf-8"><!--[if gte mso 9]><xml><x:ExcelWorkbook><x:ExcelWorksheets><x:ExcelWorksheet>
<x:Name>${data.title}</x:Name><x:WorksheetOptions><x:DisplayGridlines/></x:WorksheetOptions>
</x:ExcelWorksheet></x:ExcelWorksheets></x:ExcelWorkbook></xml><![endif]--></head><body>
<table border="1"><thead><tr>${data.headers.map(h => `<th style="background:#16a34a;color:white;font-weight:bold;padding:8px">${h}</th>`).join('')}</tr></thead><tbody>`;
  data.rows.forEach(row => {
    html += `<tr>${row.map(c => `<td style="padding:6px">${c}</td>`).join('')}</tr>`;
  });
  html += '</tbody></table></body></html>';
  const blob = new Blob([html], { type: 'application/vnd.ms-excel;charset=utf-8;' });
  downloadBlob(blob, `${data.title}.xls`);
  toast.success('File Excel berhasil diunduh');
}

export function exportToPDF(data: ExportData) {
  const printWindow = window.open('', '_blank');
  if (!printWindow) { toast.error('Popup diblokir browser'); return; }
  
  printWindow.document.write(`<html><head><title>${data.title}</title>
<style>
  body { font-family: 'Segoe UI', sans-serif; padding: 30px; }
  h1 { color: #16a34a; font-size: 20px; margin-bottom: 4px; }
  p.sub { color: #666; font-size: 12px; margin-bottom: 20px; }
  table { width: 100%; border-collapse: collapse; font-size: 13px; }
  th { background: #16a34a; color: white; padding: 8px 10px; text-align: left; }
  td { padding: 6px 10px; border-bottom: 1px solid #e5e7eb; }
  tr:nth-child(even) { background: #f9fafb; }
  .footer { margin-top: 30px; text-align: center; font-size: 11px; color: #999; }
  @media print { body { padding: 10px; } }
</style></head><body>
<h1>🎓 ${data.title}</h1>
<p class="sub">Dicetak: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
<table><thead><tr>${data.headers.map(h => `<th>${h}</th>`).join('')}</tr></thead><tbody>
${data.rows.map(row => `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`).join('')}
</tbody></table>
<div class="footer">SPP Manager - Laporan Pembayaran</div>
<script>window.print();</script></body></html>`);
}

export function exportToWord(data: ExportData) {
  let html = `<html xmlns:o="urn:schemas-microsoft-com:office:office" xmlns:w="urn:schemas-microsoft-com:office:word">
<head><meta charset="utf-8"></head><body>
<h2 style="color:#16a34a">${data.title}</h2>
<p style="color:#666;font-size:12px">Tanggal: ${new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}</p>
<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;width:100%;font-size:13px">
<thead><tr>${data.headers.map(h => `<th style="background:#16a34a;color:white">${h}</th>`).join('')}</tr></thead><tbody>`;
  data.rows.forEach(row => {
    html += `<tr>${row.map(c => `<td>${c}</td>`).join('')}</tr>`;
  });
  html += '</tbody></table></body></html>';
  const blob = new Blob([html], { type: 'application/msword;charset=utf-8;' });
  downloadBlob(blob, `${data.title}.doc`);
  toast.success('File Word berhasil diunduh');
}

function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
