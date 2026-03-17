'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Dashboard() {
  const router = useRouter();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data')
      .then(r => { if (r.status === 401) { router.push('/'); return null; } return r.json(); })
      .then(d => { if (d) setData(d); setLoading(false); })
      .catch(() => { router.push('/'); });
  }, []);

  const logout = async () => {
    await fetch('/api/auth', { method: 'DELETE' });
    router.push('/');
  };

  if (loading) return <div style={{padding:40,textAlign:'center'}}>Chargement...</div>;
  if (!data) return null;

  return (
    <div style={{padding:20,fontFamily:'sans-serif',maxWidth:500,margin:'0 auto'}}>
      <h1>MairieHub fonctionne !</h1>
      <p>Connecté en tant que : <b>{data.role}</b></p>
      <p>Commissions : {(data.commissions||[]).length}</p>
      <p>Réunions : {(data.reunions||[]).length}</p>
      <p>Actions : {(data.actions||[]).length}</p>
      <button onClick={logout} style={{marginTop:20,padding:'10px 20px',cursor:'pointer'}}>Déconnexion</button>
    </div>
  );
}
