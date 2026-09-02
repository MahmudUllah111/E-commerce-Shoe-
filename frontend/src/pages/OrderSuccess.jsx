import React from 'react';
import { useLocation, Link } from 'react-router-dom';
import { CheckCircle2, PackageSearch } from 'lucide-react';

export default function OrderSuccess() {
  const location = useLocation();
  const params = new URLSearchParams(location.search);
  const orderNumber = params.get('orderNumber') || 'N/A';
  const total = params.get('total') || '0.00';

  return (
    <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
      <div style={{ width: '70px', height: '70px', background: '#dcfce7', color: '#16a34a', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
        <CheckCircle2 size={40} />
      </div>

      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Order Confirmed!</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Thank you for your order. We have recorded your purchase and your package will be dispatched soon.
      </p>

      <div style={{ background: '#f9fafb', padding: '1.5rem', borderRadius: '12px', border: '1px solid #e5e7eb', textAlign: 'left', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
          <span style={{ color: '#6b7280' }}>Order Number:</span>
          <strong>{orderNumber}</strong>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.8rem' }}>
          <span style={{ color: '#6b7280' }}>Status:</span>
          <span style={{ color: '#16a34a', fontWeight: 700 }}>Processing</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#6b7280' }}>Total Amount:</span>
          <strong>${Number(total).toFixed(2)}</strong>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center' }}>
        <Link
          to={`/track-order?orderNumber=${orderNumber}`}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1.8rem',
            borderRadius: '9999px',
            background: '#111827',
            color: '#fff',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          <PackageSearch size={18} />
          Track Status
        </Link>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '0.85rem 1.8rem',
            borderRadius: '9999px',
            background: '#f3f4f6',
            color: '#111827',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          Continue Shopping
        </Link>
      </div>
    </div>
  );
}