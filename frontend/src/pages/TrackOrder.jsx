import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { getOrderDetails } from '../services/api';
import { Package, Search, Clock, CheckCircle2, Truck } from 'lucide-react';

export default function TrackOrder() {
  const location = useLocation();
  const queryOrder = new URLSearchParams(location.search).get('orderNumber') || '';
  const [orderNumber, setOrderNumber] = useState(queryOrder);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchOrder = async (code) => {
    if (!code.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getOrderDetails(code.trim());
      setOrder(data);
    } catch (err) {
      setOrder(null);
      setError('No order found with this tracking number. Check and try again.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (queryOrder) {
      fetchOrder(queryOrder);
    }
  }, [queryOrder]);

  const handleSubmit = (e) => {
    e.preventDefault();
    fetchOrder(orderNumber);
  };

  return (
    <div className="container" style={{ padding: '3rem 1.5rem', maxWidth: '800px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2rem', fontWeight: 800, marginBottom: '0.5rem' }}>Track Your Order</h1>
      <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
        Enter your order tracking number (e.g. ORD-6A97C45841AF8) to see live progress.
      </p>

      <form onSubmit={handleSubmit} style={{ display: 'flex', gap: '0.8rem', marginBottom: '2.5rem' }}>
        <input
          type="text"
          placeholder="e.g. ORD-6A97C45841AF8"
          value={orderNumber}
          onChange={(e) => setOrderNumber(e.target.value)}
          required
          style={{
            flex: 1,
            padding: '0.85rem 1.2rem',
            borderRadius: '10px',
            border: '1px solid #d1d5db',
            fontSize: '1rem',
            outline: 'none',
            textTransform: 'uppercase'
          }}
        />
        <button
          type="submit"
          disabled={loading}
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            padding: '0.85rem 1.8rem',
            borderRadius: '10px',
            background: '#111827',
            color: '#fff',
            fontWeight: 700,
            border: 'none',
            cursor: 'pointer'
          }}
        >
          <Search size={18} />
          {loading ? 'Searching...' : 'Track'}
        </button>
      </form>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      {order && (
        <div style={{ background: '#ffffff', border: '1px solid #e5e7eb', borderRadius: '16px', padding: '2rem', boxShadow: '0 4px 12px rgba(0,0,0,0.05)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.2rem', marginBottom: '1.5rem' }}>
            <div>
              <span style={{ fontSize: '0.85rem', color: '#6b7280', textTransform: 'uppercase', fontWeight: 700 }}>Order ID</span>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, margin: '0.2rem 0' }}>{order.order_number}</h2>
              <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>Placed on {new Date(order.created_at).toLocaleDateString()}</span>
            </div>
            <div style={{ background: '#dcfce7', color: '#16a34a', padding: '0.4rem 1rem', borderRadius: '9999px', fontWeight: 700, fontSize: '0.85rem', textTransform: 'uppercase', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock size={16} /> {order.status}
            </div>
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '1rem' }}>Items Ordered</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {order.items?.map((item) => (
                <div key={item.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', border: '1px solid #f3f4f6', padding: '0.8rem', borderRadius: '8px' }}>
                  <img
                    src={`/products/${item.image || '1.jpg'}`}
                    alt={item.product_name}
                    style={{ width: '60px', height: '60px', objectFit: 'contain', background: '#f9fafb', borderRadius: '6px' }}
                    onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'; }}
                  />
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{item.product_name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#6b7280' }}>
                      Size: US {item.size} • Qty: {item.quantity}
                    </div>
                  </div>
                  <div style={{ fontWeight: 800 }}>${(Number(item.unit_price) * item.quantity).toFixed(2)}</div>
                </div>
              ))}
            </div>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.2rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', fontSize: '0.9rem' }}>
            <div>
              <strong style={{ display: 'block', marginBottom: '0.3rem', color: '#111827' }}>Delivery Address</strong>
              <p style={{ color: '#4b5563', margin: 0 }}>{order.shipping_address}</p>
              <p style={{ color: '#4b5563', marginTop: '0.3rem' }}>Receiver: {order.customer_name} ({order.customer_phone})</p>
            </div>
            <div>
              <strong style={{ display: 'block', marginBottom: '0.3rem', color: '#111827' }}>Payment Summary</strong>
              <p style={{ color: '#4b5563', margin: 0 }}>Method: {order.payment_method}</p>
              <p style={{ color: '#111827', fontWeight: 800, fontSize: '1.1rem', marginTop: '0.4rem' }}>
                Total: ${Number(order.total_amount).toFixed(2)}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}