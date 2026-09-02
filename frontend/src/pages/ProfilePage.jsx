import React, { useState, useEffect } from 'react';
import { useShop } from '../context/ShopContext';
import { getUserOrders, updateUserProfile } from '../services/api';
import { useNavigate, Link } from 'react-router-dom';
import { User, Package, MapPin, CheckCircle, Clock, Truck, AlertCircle } from 'lucide-react';

export default function ProfilePage() {
  const { currentUser, login } = useShop();
  const navigate = useNavigate();

  const [orders, setOrders] = useState([]);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [activeTab, setActiveTab] = useState('orders');

  const [profileForm, setProfileForm] = useState({
    name: currentUser?.name || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    postal_code: currentUser?.postal_code || '',
  });
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  useEffect(() => {
    if (!currentUser) {
      navigate('/login');
      return;
    }

    getUserOrders(currentUser.email)
      .then((data) => {
        setOrders(data);
        setLoadingOrders(false);
      })
      .catch(() => setLoadingOrders(false));
  }, [currentUser, navigate]);

  if (!currentUser) return null;

  const handleProfileSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await updateUserProfile({ id: currentUser.id, ...profileForm });
      if (res.success) {
        login(res.user);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 4000);
      }
    } catch (err) {
      alert('Failed to update address details.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'delivered':
        return <span style={{ background: '#dcfce7', color: '#166534', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14} /> Delivered</span>;
      case 'shipped':
        return <span style={{ background: '#e0e7ff', color: '#3730a3', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Truck size={14} /> Shipped</span>;
      case 'cancelled':
        return <span style={{ background: '#fee2e2', color: '#991b1b', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><AlertCircle size={14} /> Cancelled</span>;
      default:
        return <span style={{ background: '#fef9c3', color: '#854d0e', padding: '0.3rem 0.8rem', borderRadius: '9999px', fontSize: '0.8rem', fontWeight: 700, display: 'inline-flex', alignItems: 'center', gap: '4px' }}><Clock size={14} /> Processing</span>;
    }
  };

  return (
    <div style={{ maxWidth: '1240px', margin: '3rem auto 5rem', padding: '0 1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', marginBottom: '2.5rem', borderBottom: '1px solid #e5e7eb', paddingBottom: '1.5rem' }}>
        <div style={{ width: '60px', height: '60px', background: '#111827', color: '#fff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem', fontWeight: 800 }}>
          {currentUser.name.charAt(0).toUpperCase()}
        </div>
        <div>
          <h1 style={{ fontSize: '1.8rem', fontWeight: 900, margin: 0 }}>{currentUser.name}</h1>
          <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>{currentUser.email}</span>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid #e5e7eb', marginBottom: '2rem' }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '0.8rem 1.5rem',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'orders' ? '3px solid #111827' : '3px solid transparent',
            color: activeTab === 'orders' ? '#111827' : '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <Package size={18} /> My Orders ({orders.length})
        </button>
        <button
          onClick={() => setActiveTab('address')}
          style={{
            padding: '0.8rem 1.5rem',
            border: 'none',
            background: 'none',
            fontWeight: 700,
            fontSize: '1rem',
            cursor: 'pointer',
            borderBottom: activeTab === 'address' ? '3px solid #111827' : '3px solid transparent',
            color: activeTab === 'address' ? '#111827' : '#6b7280',
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}
        >
          <MapPin size={18} /> Saved Shipping Address
        </button>
      </div>

      {activeTab === 'orders' ? (
        <div>
          {loadingOrders ? (
            <div style={{ padding: '3rem', textAlign: 'center', color: '#6b7280' }}>Loading orders...</div>
          ) : orders.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '4rem 1rem', background: '#f9fafb', borderRadius: '12px', border: '1px dashed #d1d5db' }}>
              <Package size={40} color="#9ca3af" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, marginBottom: '0.5rem' }}>No orders yet</h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Looks like you haven't bought your fresh pair of shoes yet.</p>
              <Link to="/" style={{ padding: '0.8rem 1.6rem', background: '#111827', color: '#fff', textDecoration: 'none', borderRadius: '8px', fontWeight: 700 }}>
                Start Shopping
              </Link>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
              {orders.map((ord) => (
                <div key={ord.id} style={{ border: '1px solid #e5e7eb', borderRadius: '12px', padding: '1.8rem', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #f3f4f6', paddingBottom: '1rem', marginBottom: '1.2rem', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ fontSize: '0.8rem', fontWeight: 700, color: '#6b7280' }}>ORDER PLACED</div>
                      <div style={{ fontWeight: 800, fontSize: '1.1rem' }}>{ord.order_number}</div>
                      <span style={{ fontSize: '0.85rem', color: '#9ca3af' }}>{new Date(ord.created_at).toLocaleDateString()}</span>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                      {getStatusBadge(ord.status)}
                      <Link to={`/track-order?ref=${ord.order_number}`} style={{ fontSize: '0.85rem', color: '#2563eb', fontWeight: 700, textDecoration: 'none' }}>
                        Track Package →
                      </Link>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    {ord.items?.map((item) => (
                      <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                          <img
                            src={item.image?.startsWith('http') ? item.image : `/products/${item.image || '1.jpg'}`}
                            alt={item.product_name}
                            style={{ width: '60px', height: '60px', objectFit: 'contain', background: '#f8f9fa', borderRadius: '8px' }}
                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=100'; }}
                          />
                          <div>
                            <div style={{ fontWeight: 800, fontSize: '0.95rem' }}>{item.product_name}</div>
                            <span style={{ fontSize: '0.8rem', color: '#6b7280' }}>Size: US {item.size} • Qty: {item.quantity}</span>
                          </div>
                        </div>
                        <div style={{ fontWeight: 800, fontSize: '1rem' }}>
                          ${(Number(item.unit_price) * item.quantity).toFixed(2)}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div style={{ borderTop: '1px solid #f3f4f6', marginTop: '1.2rem', paddingTop: '1rem', display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                    <span style={{ color: '#6b7280' }}>Shipped to: <strong>{ord.shipping_address}</strong></span>
                    <span>Total: <strong style={{ fontSize: '1.1rem', color: '#111' }}>${Number(ord.total_amount).toFixed(2)}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : (
        <div style={{ maxWidth: '600px', background: '#fff', border: '1px solid #e5e7eb', borderRadius: '12px', padding: '2rem' }}>
          <h2 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>Shipping Address Information</h2>
          <p style={{ color: '#6b7280', fontSize: '0.85rem', marginBottom: '1.5rem' }}>This information is automatically prefilled whenever you reach checkout.</p>

          {saveSuccess && (
            <div style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', padding: '0.75rem', borderRadius: '8px', fontSize: '0.85rem', marginBottom: '1.2rem', fontWeight: 700 }}>
              ✓ Shipping details updated successfully!
            </div>
          )}

          <form onSubmit={handleProfileSave} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Full Name</label>
              <input required type="text" value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} style={{ width: '100%', padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Contact Phone</label>
              <input type="tel" value={profileForm.phone} onChange={(e) => setProfileForm({ ...profileForm, phone: e.target.value })} style={{ width: '100%', padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Street Address</label>
              <input type="text" value={profileForm.address} onChange={(e) => setProfileForm({ ...profileForm, address: e.target.value })} style={{ width: '100%', padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>City</label>
                <input type="text" value={profileForm.city} onChange={(e) => setProfileForm({ ...profileForm, city: e.target.value })} style={{ width: '100%', padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              </div>
              <div>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Postal Code</label>
                <input type="text" value={profileForm.postal_code} onChange={(e) => setProfileForm({ ...profileForm, postal_code: e.target.value })} style={{ width: '100%', padding: '0.7rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
              </div>
            </div>

            <button type="submit" disabled={saving} style={{ padding: '0.85rem', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', marginTop: '0.5rem' }}>
              {saving ? 'Saving...' : 'Update Details'}
            </button>
          </form>
        </div>
      )}
    </div>
  );
}