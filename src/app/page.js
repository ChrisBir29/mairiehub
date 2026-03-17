'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pin }),
      });
      const data = await res.json();
      if (data.success) {
        router.push('/dashboard');
        router.refresh();
      } else {
        setError('Code PIN incorrect');
        setPin('');
      }
    } catch {
      setError('Erreur de connexion');
    }
    setLoading(false);
  };

  const handleDigit = (d) => {
    if (pin.length < 6) setPin(p => p + d);
  };
  const handleDelete = () => setPin(p => p.slice(0, -1));

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', background: 'linear-gradient(135deg, #1B3A5C 0%, #0F2340 50%, #1B3A5C 100%)',
      fontFamily: "'Inter', sans-serif", padding: 24,
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap');
        @keyframes fadeIn { from { opacity:0; transform:translateY(16px) } to { opacity:1; transform:translateY(0) } }
        .fade { animation: fadeIn 0.5s ease both }
        .fade2 { animation: fadeIn 0.5s ease 0.15s both }
        .fade3 { animation: fadeIn 0.5s ease 0.3s both }
        .pin-btn { width:72px; height:72px; border-radius:50%; border:2px solid rgba(255,255,255,0.15); background:rgba(255,255,255,0.06); color:#fff; font-size:24px; font-weight:600; cursor:pointer; transition:all 0.15s; display:flex; align-items:center; justify-content:center; font-family:inherit; }
        .pin-btn:hover { background:rgba(255,255,255,0.15); border-color:rgba(255,255,255,0.3); }
        .pin-btn:active { transform:scale(0.92); background:rgba(255,255,255,0.2); }
        .shake { animation: shake 0.4s ease; }
        @keyframes shake { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
      `}</style>

      <div className="fade" style={{ fontSize: 56, marginBottom: 8 }}>🏛️</div>
      <h1 className="fade" style={{ color: '#fff', fontSize: 28, fontWeight: 800, margin: '0 0 4px', letterSpacing: '-0.5px' }}>MairieHub</h1>
      <p className="fade2" style={{ color: '#94a3b8', fontSize: 14, margin: '0 0 32px' }}>Commune de Morvillars</p>

      {/* PIN Dots */}
      <div className={`fade2 ${error ? 'shake' : ''}`} style={{ display: 'flex', gap: 12, marginBottom: 24 }}>
        {[0,1,2,3].map(i => (
          <div key={i} style={{
            width: 16, height: 16, borderRadius: 99,
            background: i < pin.length ? '#D4A03C' : 'transparent',
            border: `2px solid ${i < pin.length ? '#D4A03C' : 'rgba(255,255,255,0.25)'}`,
            transition: 'all 0.2s',
          }} />
        ))}
      </div>

      {error && <p style={{ color: '#ef4444', fontSize: 13, marginBottom: 16 }}>{error}</p>}

      {/* Numpad */}
      <form onSubmit={handleSubmit}>
        <div className="fade3" style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 16 }}>
          {[1,2,3,4,5,6,7,8,9].map(d => (
            <button key={d} type="button" className="pin-btn" onClick={() => handleDigit(String(d))}>{d}</button>
          ))}
          <button type="button" className="pin-btn" onClick={handleDelete} style={{ fontSize: 18 }}>←</button>
          <button type="button" className="pin-btn" onClick={() => handleDigit('0')}>0</button>
          <button type="submit" className="pin-btn" disabled={pin.length < 4 || loading}
            style={{ background: pin.length >= 4 ? '#D4A03C' : 'rgba(255,255,255,0.06)', border: pin.length >= 4 ? '2px solid #D4A03C' : '2px solid rgba(255,255,255,0.15)', opacity: pin.length >= 4 ? 1 : 0.5 }}>
            {loading ? '...' : '→'}
          </button>
        </div>
      </form>

      <p className="fade3" style={{ color: '#64748b', fontSize: 11, marginTop: 16 }}>
        Saisissez votre code PIN
      </p>
    </div>
  );
}
