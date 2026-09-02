import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { subscribeStockNotification } from '../services/api';
import { Heart, Trash2, ShoppingBag, Bell, Check, AlertCircle } from 'lucide-react';

export default function WishlistPage() {
  const { wishlist, toggleWishlist, addToCart } = useShop();
  const [selectedVariants, setSelectedVariants] = useState({});
  const [notifyEmails, setNotifyEmails] = useState({});
  const [notifiedItems, setNotifiedItems] = useState({});
  const [submitting, setSubmitting] = useState({});
  const [addedItems, setAddedItems] = useState({});

  if (wishlist.length === 0) {
    return (
      <div className="container" style={{ padding: '5rem 1.5rem', textAlign: 'center', maxWidth: '600px', margin: '0 auto' }}>
        <div style={{ width: '70px', height: '70px', background: '#fee2e2', color: '#dc2626', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 1.5rem' }}>
          <Heart size={36} />
        </div>
        <h2 style={{ fontSize: '1.8rem', fontWeight: 800, marginBottom: '0.5rem' }}>Your Wishlist is Empty</h2>
        <p style={{ color: '#6b7280', marginBottom: '2rem' }}>
          Explore our collection and click the heart icon on any shoe to save your favorite styles.
        </p>
        <Link
          to="/"
          style={{
            display: 'inline-flex',
            padding: '0.85rem 2rem',
            borderRadius: '9999px',
            background: '#111827',
            color: '#fff',
            fontWeight: 700,
            textDecoration: 'none'
          }}
        >
          Explore Shoes
        </Link>
      </div>
    );
  }

  const handleSelectVariant = (productId, variant) => {
    setSelectedVariants((prev) => ({ ...prev, [productId]: variant }));
  };

  const handleAddToCart = (shoe) => {
    const activeVariant = selectedVariants[shoe.id] || shoe.variants?.find((v) => v.stock_quantity > 0);
    if (!activeVariant || activeVariant.stock_quantity === 0) return;

    addToCart(shoe, activeVariant, 1);
    setAddedItems((prev) => ({ ...prev, [shoe.id]: true }));
    setTimeout(() => {
      setAddedItems((prev) => ({ ...prev, [shoe.id]: false }));
    }, 2000);
  };

  const handleNotifySubmit = async (e, shoe) => {
    e.preventDefault();
    const email = notifyEmails[shoe.id];
    const activeVariant = selectedVariants[shoe.id] || shoe.variants?.find((v) => v.stock_quantity === 0) || shoe.variants?.[0];

    if (!email || !email.trim() || !activeVariant) return;

    setSubmitting((prev) => ({ ...prev, [shoe.id]: true }));

    try {
      await subscribeStockNotification({
        email: email.trim(),
        product_id: shoe.id,
        variant_id: activeVariant.id,
      });

      setNotifiedItems((prev) => ({ ...prev, [shoe.id]: true }));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save alert.');
    } finally {
      setSubmitting((prev) => ({ ...prev, [shoe.id]: false }));
    }
  };

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Saved Wishlist</h1>
          <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>Keep track of your favorite styles and stock status.</p>
        </div>
        <span style={{ fontWeight: 700, color: '#111827' }}>
          {wishlist.length} {wishlist.length === 1 ? 'Item' : 'Items'}
        </span>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '2rem' }}>
        {wishlist.map((shoe) => {
          const totalStock = shoe.variants?.reduce((sum, v) => sum + (v.stock_quantity || 0), 0) ?? 0;
          const isEntirelyOutOfStock = totalStock === 0;

          const currentVariant = selectedVariants[shoe.id] || shoe.variants?.find((v) => v.stock_quantity === 0) || shoe.variants?.[0];
          const isSelectedVariantOutOfStock = isEntirelyOutOfStock || (currentVariant && currentVariant.stock_quantity === 0);
          const isSubscribed = notifiedItems[shoe.id];

          return (
            <div
              key={shoe.id}
              style={{
                border: '1px solid #e5e7eb',
                borderRadius: '16px',
                overflow: 'hidden',
                background: '#fff',
                display: 'flex',
                flexDirection: 'column',
                position: 'relative',
                boxShadow: '0 2px 8px rgba(0,0,0,0.04)'
              }}
            >
              <button
                onClick={() => toggleWishlist(shoe)}
                title="Remove from wishlist"
                style={{
                  position: 'absolute',
                  top: '12px',
                  right: '12px',
                  zIndex: 10,
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '50%',
                  width: '34px',
                  height: '34px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: '#dc2626',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.06)'
                }}
              >
                <Trash2 size={16} />
              </button>

              <div style={{ height: '220px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
                <img
                  src={`/products/${shoe.images?.[0] || '1.jpg'}`}
                  alt={shoe.name}
                  style={{ maxHeight: '80%', maxWidth: '80%', objectFit: 'contain' }}
                  onError={(e) => {
                    e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60';
                  }}
                />
              </div>

              <div style={{ padding: '1.4rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.4rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase' }}>
                      {shoe.brand_name || 'Brand'} • {shoe.gender}
                    </span>
                    <span
                      style={{
                        fontSize: '0.75rem',
                        fontWeight: 700,
                        padding: '0.2rem 0.6rem',
                        borderRadius: '9999px',
                        background: isSelectedVariantOutOfStock ? '#fee2e2' : '#dcfce7',
                        color: isSelectedVariantOutOfStock ? '#dc2626' : '#16a34a'
                      }}
                    >
                      {isSelectedVariantOutOfStock ? 'Out of Stock' : 'In Stock'}
                    </span>
                  </div>

                  <h3 style={{ fontSize: '1.15rem', fontWeight: 700, margin: '0 0 0.5rem 0' }}>{shoe.name}</h3>
                  <div style={{ fontWeight: 800, fontSize: '1.25rem', color: '#111827', marginBottom: '1rem' }}>
                    ${Number(shoe.price).toFixed(2)}
                  </div>

                  <div style={{ marginBottom: '1.2rem' }}>
                    <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: 600, color: '#4b5563', marginBottom: '0.4rem' }}>
                      Choose Size:
                    </label>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                      {shoe.variants?.map((v) => {
                        const isSelected = currentVariant?.id === v.id;
                        const outOfStock = v.stock_quantity === 0;

                        return (
                          <button
                            key={v.id}
                            onClick={() => handleSelectVariant(shoe.id, v)}
                            style={{
                              padding: '0.35rem 0.65rem',
                              borderRadius: '6px',
                              border: isSelected ? '2px solid #111827' : '1px solid #d1d5db',
                              background: isSelected ? '#111827' : '#fff',
                              color: isSelected ? '#fff' : outOfStock ? '#9ca3af' : '#111827',
                              fontWeight: 600,
                              fontSize: '0.8rem',
                              cursor: 'pointer',
                              opacity: outOfStock ? 0.6 : 1,
                              textDecoration: outOfStock ? 'line-through' : 'none'
                            }}
                          >
                            US {v.size_value}
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div>
                  {isSelectedVariantOutOfStock ? (
                    <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '10px', padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '0.5rem', color: '#991b1b', marginBottom: '0.7rem' }}>
                        <AlertCircle size={18} style={{ flexShrink: 0, marginTop: '2px' }} />
                        <span style={{ fontSize: '0.85rem', fontWeight: 600, lineHeight: 1.4 }}>
                          This size (US {currentVariant?.size_value}) is currently out of stock. We will email you the moment it arrives in stock.
                        </span>
                      </div>

                      {isSubscribed ? (
                        <div style={{ background: '#dcfce7', color: '#16a34a', padding: '0.65rem', borderRadius: '6px', fontSize: '0.85rem', fontWeight: 700, textAlign: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
                          <Check size={16} /> Notification set! We will email you.
                        </div>
                      ) : (
                        <form onSubmit={(e) => handleNotifySubmit(e, shoe)} style={{ display: 'flex', gap: '0.4rem' }}>
                          <input
                            type="email"
                            required
                            placeholder="Enter your email"
                            value={notifyEmails[shoe.id] || ''}
                            onChange={(e) => setNotifyEmails({ ...notifyEmails, [shoe.id]: e.target.value })}
                            style={{
                              flex: 1,
                              padding: '0.55rem 0.8rem',
                              borderRadius: '6px',
                              border: '1px solid #d1d5db',
                              fontSize: '0.85rem',
                              outline: 'none'
                            }}
                          />
                          <button
                            type="submit"
                            disabled={submitting[shoe.id]}
                            style={{
                              background: '#dc2626',
                              color: '#fff',
                              border: 'none',
                              borderRadius: '6px',
                              padding: '0.55rem 1rem',
                              fontSize: '0.85rem',
                              fontWeight: 700,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px'
                            }}
                          >
                            <Bell size={14} /> {submitting[shoe.id] ? 'Saving...' : 'Notify'}
                          </button>
                        </form>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => handleAddToCart(shoe)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        gap: '0.5rem',
                        width: '100%',
                        padding: '0.85rem 1.2rem',
                        background: '#111827',
                        color: '#fff',
                        borderRadius: '9999px',
                        fontWeight: 700,
                        fontSize: '0.95rem',
                        border: 'none',
                        cursor: 'pointer'
                      }}
                    >
                      <ShoppingBag size={18} />
                      <span>{addedItems[shoe.id] ? 'Added to Bag!' : `Add Size ${currentVariant?.size_value} to Bag`}</span>
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}