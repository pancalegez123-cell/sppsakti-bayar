import { useAuth } from '@/contexts/AuthContext';
import { mockDashboardStats, mockPayments, mockStudents } from '@/data/mockData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, CreditCard, AlertTriangle, TrendingUp } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const stats = mockDashboardStats;

const statCards = [
  { label: 'Total Siswa', value: stats.totalStudents, icon: Users, color: 'text-primary' },
  { label: 'Pembayaran Bulan Ini', value: stats.totalPaymentsThisMonth, icon: CreditCard, color: 'text-info' },
  { label: 'Belum Lunas', value: stats.unpaidStudents, icon: AlertTriangle, color: 'text-warning' },
  { label: 'Total Pendapatan', value: `Rp ${stats.totalRevenue.toLocaleString('id-ID')}`, icon: TrendingUp, color: 'text-primary' },
];

const chartData = [
  { month: 'Jan', amount: 1750000 },
  { month: 'Feb', amount: 700000 },
  { month: 'Mar', amount: 0 },
  { month: 'Apr', amount: 0 },
  { month: 'Mei', amount: 0 },
  { month: 'Jun', amount: 0 },
];

export default function Dashboard() {
  const { user } = useAuth();

  return (
    <div className="space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Selamat datang, {user?.name}! Berikut ringkasan pembayaran SPP.
        </p>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map(stat => (
          <Card key={stat.label} className="glass-card">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-2">
                <stat.icon className={`w-5 h-5 ${stat.color}`} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        {/* Chart */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Pendapatan Bulanan (2025)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" className="opacity-30" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(v) => `${(v / 1000000).toFixed(1)}jt`} />
                  <Tooltip
                    formatter={(value: number) => [`Rp ${value.toLocaleString('id-ID')}`, 'Pendapatan']}
                    contentStyle={{ borderRadius: '8px', border: '1px solid hsl(var(--border))' }}
                  />
                  <Bar dataKey="amount" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Recent Payments */}
        <Card className="glass-card">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-semibold">Pembayaran Terakhir</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {mockPayments.slice(0, 5).map(payment => (
                <div key={payment.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{payment.studentName}</p>
                    <p className="text-xs text-muted-foreground">{payment.month} {payment.year} · {payment.method === 'cash' ? 'Tunai' : 'Transfer'}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-semibold text-foreground">Rp {payment.amount.toLocaleString('id-ID')}</p>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      payment.status === 'lunas'
                        ? 'bg-accent text-accent-foreground'
                        : 'bg-warning/10 text-warning'
                    }`}>
                      {payment.status === 'lunas' ? 'Lunas' : 'Belum Lunas'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
