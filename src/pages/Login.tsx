import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function Login() {
  const { login, isAuthenticated } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  if (isAuthenticated) return <Navigate to="/dashboard" replace />;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    
    await new Promise(r => setTimeout(r, 500));
    const success = login(email, password);
    
    if (!success) {
      setError('Email atau password salah');
    }
    setLoading(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md animate-fade-in">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="flex items-center justify-center w-16 h-16 rounded-2xl bg-primary mb-4">
            <GraduationCap className="w-8 h-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold text-foreground">SPP Manager</h1>
          <p className="text-sm text-muted-foreground mt-1">Sistem Pembayaran SPP Sekolah</p>
        </div>

        <Card className="glass-card">
          <CardHeader className="pb-4">
            <h2 className="text-lg font-semibold text-center">Masuk ke Akun</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="nama@sekolah.id"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="password">Password</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Masukkan password"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              <Button type="submit" className="w-full" disabled={loading}>
                {loading ? 'Memproses...' : 'Masuk'}
              </Button>
            </form>

            {/* Demo credentials */}
            <div className="mt-6 p-3 rounded-lg bg-muted">
              <p className="text-xs font-semibold text-muted-foreground mb-2">Demo Akun:</p>
              <div className="space-y-1 text-xs text-muted-foreground">
                <p><span className="font-medium">Admin:</span> admin@spp.id / admin123</p>
                <p><span className="font-medium">Bendahara:</span> bendahara@spp.id / bendahara123</p>
                <p><span className="font-medium">Wali Murid:</span> wali@spp.id / wali123</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
