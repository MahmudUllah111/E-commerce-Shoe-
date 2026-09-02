import React, { useState, useEffect } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { createOrder } from '../services/api';
import { ArrowLeft, Truck, CreditCard, UserCheck } from 'lucide-react';

export default function CheckoutPage() {
  const { cart, cartSubtotal, clearCart, currentUser } = useShop();
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);
  const couponParam = queryParams.get('coupon') || '';

  // Prefill using saved account details if available
  const [form, setForm] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: currentUser?.phone || '',
    address: currentUser?.address || '',
    city: currentUser?.city || '',
    postalCode: currentUser?.postal_code || '',
    paymentMethod: 'Cash on Delivery',
  });

  useEffect(() => {
    if (currentUser) {
      setForm((prev) => ({
        ...prev,
        name: currentUser.name || prev.name,
        email: currentUser.email || prev.email,
        phone: currentUser.phone || prev.phone,
        address: currentUser.address || prev.address,
        city: currentUser.city || prev.city,
        postalCode: currentUser.postal_code || prev.postalCode,
      }));
    }
  }, [currentUser]);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2>No items in your bag to checkout</h2>
        <Link to="/" className="btn btn-primary" style={{ marginTop: '1rem' }}>Return to Store</Link>
      </div>
    );
  }

  const shipping = cartSubtotal > 100 ? 0 : 15;
  const total = cartSubtotal + shipping;

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    const payload = {
      customer_name: form.name,
      customer_email: form.email,
      customer_phone: form.phone,
      shipping_address: `${form.address}, ${form.city}, Postal Code: ${form.postalCode}`,
      shipping_method: shipping === 0 ? 'Free Standard Shipping' : 'Standard Express',
      payment_method: form.paymentMethod,
      coupon_code: couponParam || null,
      items: cart.map((item) => ({
        product_id: item.product.id,
        variant_id: item.variant.id,
        quantity: item.quantity,
      })),
    };

    try {
      const res = await createOrder(payload);
      if (res.success) {
        clearCart();
        navigate(`/order-success?orderNumber=${res.order_number}&total=${res.total}`);
      }
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to place order. Please check stock and details.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <Link to="/cart" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#6b7280', marginBottom: '1.5rem', fontSize: '0.9rem', fontWeight: 600, textDecoration: 'none' }}>
        <ArrowLeft size={16} /> Back to Bag
      </Link>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Checkout</h1>
        {currentUser && (
          <div style={{ background: '#dcfce7', color: '#166534', padding: '0.4rem 0.9rem', borderRadius: '9999px', fontSize: '0.85rem', fontWeight: 700, display: 'flex', alignItems: 'center', gap: '6px' }}>
            <UserCheck size={16} /> Shipping info auto-filled from your profile
          </div>
        )}
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#dc2626', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>1. Shipping Details</h2>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Full Name *</label>
            <input required type="text" name="name" value={form.name} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Email *</label>
              <input required type="email" name="email" value={form.email} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Phone *</label>
              <input required type="tel" name="phone" value={form.phone} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Street Address *</label>
            <input required type="text" name="address" value={form.address} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>City *</label>
              <input required type="text" name="city" value={form.city} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.3rem' }}>Postal Code *</label>
              <input required type="text" name="postalCode" value={form.postalCode} onChange={handleChange} style={{ width: '100%', padding: '0.75rem', borderRadius: '8px', border: '1px solid #d1d5db' }} />
            </div>
          </div>

          <h2 style={{ fontSize: '1.25rem', fontWeight: 700, marginTop: '1rem' }}>2. Payment Method</h2>
          <div style={{ display: 'flex', gap: '1rem' }}>
            <label style={{ flex: 1, padding: '1rem', border: form.paymentMethod === 'Cash on Delivery' ? '2px solid #111827' : '1px solid #d1d5db', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="radio" name="paymentMethod" value="Cash on Delivery" checked={form.paymentMethod === 'Cash on Delivery'} onChange={handleChange} />
              <Truck size={18} /> Cash on Delivery
            </label>
            <label style={{ flex: 1, padding: '1rem', border: form.paymentMethod === 'Online' ? '2px solid #111827' : '1px solid #d1d5db', borderRadius: '10px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <input type="radio" name="paymentMethod" value="Online" checked={form.paymentMethod === 'Online'} onChange={handleChange} />
              <CreditCard size={18} /> Card / Online
            </label>
          </div>
        </div>

        {/* Order review side */}
        <div style={{ background: '#f9fafb', padding: '2rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>Review Items</h2>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
            {cart.map((item) => (
              <div key={item.variant.id} style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                <div>
                  <strong>{item.product.name}</strong> × {item.quantity}
                  <div style={{ color: '#6b7280', fontSize: '0.8rem' }}>Size: US {item.variant.size_value}</div>
                </div>
                <span>${(Number(item.product.price) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span>${cartSubtotal.toFixed(2)}</span>
            </div>
            {couponParam && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a' }}>
                <span>Coupon Applied</span>
                <span>{couponParam}</span>
              </div>
            )}
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Shipping</span>
              <span>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '0.8rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.2rem', fontWeight: 800 }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              marginTop: '1.5rem',
              padding: '1rem',
              background: '#111827',
              color: '#fff',
              border: 'none',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '1rem',
              cursor: 'pointer'
            }}
          >
            {loading ? 'Processing Order...' : `Place Order • $${total.toFixed(2)}`}
          </button>
        </div>
      </form>
    </div>
  );
}