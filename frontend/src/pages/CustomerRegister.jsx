import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { registerUser } from '../services/api';

export default function CustomerRegister() {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    phone: '',
    address: '',
    city: '',
    postal_code: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const { login } = useShop();
  const navigate = useNavigate();

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await registerUser(form);
      if (res.success) {
        login(res.user);
        navigate('/');
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed. Email might already exist.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '520px', margin: '0 auto' }}>
      <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '2.5rem', boxShadow: '0 4px 15px rgba(0,0,0,0.04)' }}>
        <h1 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.4rem', textAlign: 'center' }}>Create Account</h1>
        <p style={{ color: '#6b7280', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.8rem' }}>
          Save your address once to enjoy permanent 1-click checkout.
        </p>

        {error && (
          <div style={{ background: '#fee2e2', color: '#dc2626', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.2rem', fontWeight: 600 }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.2rem' }}>Full Name *</label>
            <input required type="text" name="name" value={form.name} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.2rem' }}>Email *</label>
              <input required type="email" name="email" value={form.email} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.2rem' }}>Password *</label>
              <input required minLength={6} type="password" name="password" value={form.password} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.2rem' }}>Phone Number</label>
            <input type="tel" name="phone" placeholder="+1..." value={form.phone} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.2rem' }}>Street Address</label>
            <input type="text" name="address" placeholder="e.g. Sector 10, Road 4" value={form.address} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '0.8rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.2rem' }}>City</label>
              <input type="text" name="city" value={form.city} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.2rem' }}>Postal Code</label>
              <input type="text" name="postal_code" value={form.postal_code} onChange={handleChange} style={{ width: '100%', padding: '0.65rem 0.8rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.85rem',
              borderRadius: '9999px',
              background: '#111827',
              color: '#fff',
              fontWeight: 700,
              fontSize: '0.95rem',
              border: 'none',
              cursor: 'pointer',
              marginTop: '0.8rem',
            }}
          >
            {loading ? 'Creating Account...' : 'Register & Save Details'}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem', color: '#6b7280' }}>
          Already have an account?{' '}
          <Link to="/login" style={{ fontWeight: 700, color: '#111827' }}>
            Sign In
          </Link>
        </div>
      </div>
    </div>
  );
}