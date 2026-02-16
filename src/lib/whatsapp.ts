import { Payment } from '@/types/spp';

export function generateWhatsAppUrl(phone: string, message: string): string {
  // Normalize phone number
  let normalized = phone.replace(/[^0-9]/g, '');
  if (normalized.startsWith('0')) {
    normalized = '62' + normalized.slice(1);
  }
  if (!normalized.startsWith('62')) {
    normalized = '62' + normalized;
  }
  return `https://wa.me/${normalized}?text=${encodeURIComponent(message)}`;
}

export function createPaymentMessage(payment: Payment, studentClass?: string): string {
  return `🎓 *SPP Manager - Konfirmasi Pembayaran*

Nama Siswa: *${payment.studentName}*
${studentClass ? `Kelas: *${studentClass}*\n` : ''}Bulan: *${payment.month} ${payment.year}*
Jumlah: *Rp ${payment.amount.toLocaleString('id-ID')}*
Metode: *${payment.method === 'cash' ? 'Tunai' : 'Transfer'}*
Tanggal: *${payment.paymentDate}*
Status: *${payment.status === 'lunas' ? '✅ LUNAS' : '⚠️ BELUM LUNAS'}*
${payment.notes ? `Catatan: ${payment.notes}\n` : ''}
Terima kasih atas pembayarannya. 🙏`;
}

export function sendWhatsAppNotifications(
  payment: Payment,
  recipients: { name: string; phone: string }[],
  studentClass?: string
) {
  const message = createPaymentMessage(payment, studentClass);
  recipients.forEach(r => {
    if (r.phone) {
      window.open(generateWhatsAppUrl(r.phone, message), '_blank');
    }
  });
}
