import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { validateCoupon } from '../services/api';
import { Trash2, Plus, Minus, ArrowRight } from 'lucide-react';

export default function CartPage() {
  const { cart, updateQuantity, removeFromCart, cartSubtotal } = useShop();
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [appliedCoupon, setAppliedCoupon] = useState('');
  const [couponMsg, setCouponMsg] = useState(null);
  const [isValidating, setIsValidating] = useState(false);

  const handleApplyCoupon = async (e) => {
    e.preventDefault();
    if (!couponCode.trim()) return;

    setIsValidating(true);
    setCouponMsg(null);

    try {
      const res = await validateCoupon(couponCode.trim().toUpperCase(), cartSubtotal);
      if (res.valid) {
        setDiscount(res.discount);
        setAppliedCoupon(couponCode.trim().toUpperCase());
        setCouponMsg({ type: 'success', text: `Coupon applied: -$${res.discount}` });
      }
    } catch (err) {
      setDiscount(0);
      setAppliedCoupon('');
      setCouponMsg({
        type: 'error',
        text: err.response?.data?.message || 'Invalid or expired coupon code',
      });
    } finally {
      setIsValidating(false);
    }
  };

  const shipping = cartSubtotal > 100 || cartSubtotal === 0 ? 0 : 15;
  const total = Math.max(0, cartSubtotal - discount + shipping);

  if (cart.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center' }}>
        <h2>Your Bag is Empty</h2>
        <p style={{ color: 'var(--text-muted)', margin: '1rem 0 2rem' }}>Discover our latest sneakers and footwear releases.</p>
        <Link to="/" className="btn btn-primary">Start Shopping</Link>
      </div>
    );
  }

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <h1 style={{ fontSize: '2.2rem', fontWeight: 800, marginBottom: '2rem' }}>Shopping Bag</h1>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '2.5rem', alignItems: 'start' }}>
        {/* Cart Items List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
          {cart.map((item) => (
            <div
              key={item.variant.id}
              style={{
                display: 'flex',
                gap: '1.2rem',
                padding: '1.2rem',
                border: '1px solid #e5e7eb',
                borderRadius: '12px',
                alignItems: 'center',
                background: '#fff',
              }}
            >
              <img
                src={`/products/${item.product.images?.[0] || '1.jpg'}`}
                alt={item.product.name}
                style={{ width: '90px', height: '90px', objectFit: 'contain', background: '#f8f9fa', borderRadius: '8px', padding: '6px' }}
                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=150'; }}
              />

              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 700, margin: 0 }}>{item.product.name}</h3>
                <div style={{ fontSize: '0.85rem', color: '#6b7280', margin: '0.3rem 0 0.6rem' }}>
                  Size: US {item.variant.size_value} • Color: {item.variant.color_name}
                </div>
                <div style={{ fontWeight: 800, fontSize: '1.05rem' }}>${Number(item.product.price).toFixed(2)}</div>
              </div>

              {/* Quantity Controls */}
              <div style={{ display: 'flex', alignItems: 'center', border: '1px solid #d1d5db', borderRadius: '9999px', padding: '0.2rem 0.6rem', gap: '0.6rem' }}>
                <button onClick={() => updateQuantity(item.variant.id, -1)} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#111' }}><Minus size={14} /></button>
                <span style={{ fontSize: '0.9rem', fontWeight: 700, minWidth: '18px', textAlign: 'center' }}>{item.quantity}</span>
                <button onClick={() => updateQuantity(item.variant.id, 1)} disabled={item.quantity >= item.variant.stock_quantity} style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#111' }}><Plus size={14} /></button>
              </div>

              <button onClick={() => removeFromCart(item.variant.id)} title="Remove item" style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: '0.4rem', marginLeft: '0.5rem' }}>
                <Trash2 size={18} />
              </button>
            </div>
          ))}
        </div>

        {/* Order Summary Card */}
        <div style={{ background: '#f9fafb', padding: '2rem', borderRadius: '16px', border: '1px solid #e5e7eb' }}>
          <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.5rem', color: '#111827' }}>Order Summary</h2>

          {/* Promo code form */}
          <form onSubmit={handleApplyCoupon} style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.2rem' }}>
            <input
              type="text"
              placeholder="Coupon (e.g. WELCOME10)"
              value={couponCode}
              onChange={(e) => setCouponCode(e.target.value)}
              style={{ flex: 1, padding: '0.65rem 0.9rem', borderRadius: '8px', border: '1px solid #d1d5db', textTransform: 'uppercase', fontSize: '0.9rem', outline: 'none' }}
            />
            <button
              type="submit"
              disabled={isValidating}
              style={{
                background: '#111827',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                padding: '0.65rem 1.2rem',
                fontWeight: 600,
                fontSize: '0.9rem',
                cursor: 'pointer'
              }}
            >
              {isValidating ? '...' : 'Apply'}
            </button>
          </form>

          {couponMsg && (
            <div style={{ fontSize: '0.85rem', marginBottom: '1.2rem', color: couponMsg.type === 'success' ? '#16a34a' : '#dc2626', fontWeight: 600 }}>
              {couponMsg.text}
            </div>
          )}

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem', fontSize: '0.95rem', color: '#374151' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 600 }}>${cartSubtotal.toFixed(2)}</span>
            </div>

            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: '#16a34a', fontWeight: 600 }}>
                <span>Discount</span>
                <span>-${discount.toFixed(2)}</span>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Estimated Shipping</span>
              <span style={{ fontWeight: 600 }}>{shipping === 0 ? 'FREE' : `$${shipping.toFixed(2)}`}</span>
            </div>

            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1rem', marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', fontSize: '1.3rem', fontWeight: 800, color: '#111827' }}>
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>
          </div>

          {/* Styled Checkout Button */}
          <Link
            to={`/checkout${appliedCoupon ? `?coupon=${appliedCoupon}` : ''}`}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '0.6rem',
              width: '100%',
              marginTop: '1.8rem',
              padding: '1rem 1.5rem',
              background: '#111827',
              color: '#ffffff',
              borderRadius: '9999px',
              fontWeight: 700,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
              transition: 'all 0.2s ease',
              boxSizing: 'border-box'
            }}
            onMouseOver={(e) => { e.currentTarget.style.background = '#262626'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
            onMouseOut={(e) => { e.currentTarget.style.background = '#111827'; e.currentTarget.style.transform = 'translateY(0)'; }}
          >
            <span>Proceed to Checkout</span>
            <ArrowRight size={18} />
          </Link>
        </div>
      </div>
    </div>
  );
}