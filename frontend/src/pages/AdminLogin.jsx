import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { loginUser } from '../services/api';
import { ShieldCheck, Lock } from 'lucide-react';

export default function AdminLogin() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useShop();
  const navigate = useNavigate();

  const handleAdminSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await loginUser({ email, password });
      if (res.success) {
        if (res.user.role !== 'admin') {
          setError('Access Denied: You do not have administrator permissions.');
          return;
        }
        login(res.user);
        navigate('/admin');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid administrator credentials');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '4.5rem 1.5rem', maxWidth: '420px', margin: '0 auto' }}>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.06)' }}>
        <div style={{ width: '56px', height: '56px', background: '#eff6ff', color: '#2563eb', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.2rem' }}>
          <ShieldCheck size={30} />
        </div>

        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, textAlign: 'center', marginBottom: '0.4rem' }}>Staff Portal</h1>
        <p style={{ color: '#6b7280', fontSize: '0.85rem', textAlign: 'center', marginBottom: '1.8rem' }}>
          Sign in with administrator credentials to manage inventory & orders.
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.2rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleAdminSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Admin ID / Email</label>
            <input
              type="email"
              required
              placeholder="admin@trustedmart.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{ width: '100%', padding: '0.7rem 0.9rem', borderRadius: '8px', border: '1px solid #d1d5db', fontSize: '0.9rem' }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
              padding: '0.85rem',
              borderRadius: '9999px',
              background: '#2563eb',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer',
              marginTop: '0.5rem',
            }}
          >
            <Lock size={16} />
            {loading ? 'Authenticating...' : 'Enter Admin Panel'}
          </button>
        </form>
      </div>
    </div>
  );
}