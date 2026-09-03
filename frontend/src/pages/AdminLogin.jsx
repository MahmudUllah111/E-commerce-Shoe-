import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ShieldCheck } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('admin@trustedmart.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { loginUser } = useShop();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const res = await fetch('http://127.0.0.1:8000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Accept': 'application/json',
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password.trim(),
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.message || 'Invalid administrator credentials');
      }

      if (data && data.user) {
        if (data.user.role !== 'admin') {
          setError('Access denied: this account does not have administrator privileges.');
          return;
        }

        loginUser(data.user, data.token);
        navigate('/admin');
      } else {
        throw new Error('Unexpected response format from server');
      }
    } catch (err) {
      console.error('Admin login error:', err);
      setError(err.message || 'Unable to connect to administration server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: '580px', width: '100%', margin: '4rem auto 6rem', padding: '3rem 2.8rem', background: '#fff', borderRadius: '20px', border: '1px solid #e5e7eb', boxShadow: '0 10px 30px rgba(0,0,0,0.06)', boxSizing: 'border-box' }}>
      <div style={{ textAlign: 'center', marginBottom: '2.2rem' }}>
        <div style={{ width: '52px', height: '52px', borderRadius: '14px', background: '#eff6ff', color: '#2563eb', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
          <ShieldCheck size={30} />
        </div>
        <h1 style={{ fontSize: '2rem', fontWeight: 900, color: '#0f172a', margin: 0, letterSpacing: '-0.5px' }}>Staff Portal</h1>
        <p style={{ color: '#64748b', fontSize: '0.95rem', marginTop: '0.5rem' }}>Sign in with administrator credentials to manage inventory & orders.</p>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem 1rem', borderRadius: '8px', fontSize: '0.85rem', fontWeight: 600, marginBottom: '1.5rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Admin ID / Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>

        <div>
          <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: '#334155', marginBottom: '0.4rem' }}>Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ width: '100%', padding: '0.75rem 1rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem', outline: 'none' }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            marginTop: '0.5rem',
            padding: '0.85rem',
            borderRadius: '8px',
            border: 'none',
            background: '#2563eb',
            color: '#fff',
            fontWeight: 800,
            fontSize: '0.95rem',
            cursor: loading ? 'not-allowed' : 'pointer',
            opacity: loading ? 0.7 : 1,
          }}
        >
          {loading ? 'Authenticating...' : '🔒 Enter Admin Panel'}
        </button>
      </form>
    </div>
  );
}