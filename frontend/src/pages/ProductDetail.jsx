import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { getProductById, submitProductReview } from '../services/api';
import { useShop } from '../context/ShopContext';
import { Star, ShoppingBag, Heart, ArrowLeft, AlertCircle, Ruler, MessageSquare, Send } from 'lucide-react';

export default function ProductDetail() {
  const { id } = useParams();
  const { addToCart, toggleWishlist, wishlist } = useShop();

  const [product, setProduct] = useState(null);
  const [selectedVariant, setSelectedVariant] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [added, setAdded] = useState(false);
  const [showSizeModal, setShowSizeModal] = useState(false);

  const [reviewForm, setReviewForm] = useState({ author_name: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewMsg, setReviewMsg] = useState(null);

  const fetchProduct = () => {
    setLoading(true);
    getProductById(id)
      .then((data) => {
        setProduct(data);
        if (data.variants && data.variants.length > 0) {
          const inStockVariant = data.variants.find((v) => v.stock_quantity > 0);
          setSelectedVariant(inStockVariant || data.variants[0]);
        }
        setLoading(false);
      })
      .catch((err) => {
        setError('Shoe not found.');
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const handleAddToCart = () => {
    if (!selectedVariant || selectedVariant.stock_quantity === 0) return;
    addToCart(product, selectedVariant, quantity);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    setSubmittingReview(true);
    try {
      await submitProductReview(product.id, reviewForm);
      setReviewMsg('Thank you! Your verified review has been published.');
      setReviewForm({ author_name: '', rating: 5, comment: '' });
      fetchProduct();
      setTimeout(() => setReviewMsg(null), 5000);
    } catch (err) {
      alert('Failed to submit review.');
    } finally {
      setSubmittingReview(false);
    }
  };

  if (loading) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>Loading shoe details...</div>;
  if (error || !product) return <div className="container" style={{ padding: '5rem', textAlign: 'center' }}>{error}</div>;

  const isWishlisted = wishlist.some((p) => p.id === product.id);
  const isOutOfStock = selectedVariant?.stock_quantity === 0;
  const isLowStock = selectedVariant?.stock_quantity > 0 && selectedVariant?.stock_quantity <= 3;
  const imgSrc = product.images?.[0]?.startsWith('http') ? product.images[0] : `/products/${product.images?.[0] || '1.jpg'}`;

  return (
    <div className="container" style={{ padding: '2.5rem 1.5rem', maxWidth: '1200px', margin: '0 auto' }}>
      <Link to="/" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: '#6b7280', textDecoration: 'none', marginBottom: '2rem', fontWeight: 600 }}>
        <ArrowLeft size={16} /> Back to Catalog
      </Link>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '3.5rem' }}>
        <div style={{ background: '#f8f9fa', borderRadius: '16px', padding: '2.5rem', display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '440px' }}>
          <img
            src={imgSrc}
            alt={product.name}
            style={{ maxWidth: '90%', maxHeight: '380px', objectFit: 'contain' }}
            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600'; }}
          />
        </div>

        <div>
          <div style={{ fontSize: '0.85rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', marginBottom: '0.4rem' }}>
            {product.brand_name} • {product.gender}
          </div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, marginBottom: '0.8rem', lineHeight: 1.2 }}>{product.name}</h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.8rem', marginBottom: '1.5rem' }}>
            <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#f59e0b', fontWeight: 700 }}>
              <Star size={18} fill="#f59e0b" /> {product.rating}
            </span>
            <span style={{ color: '#6b7280', fontSize: '0.9rem' }}>({product.reviews_count || 0} reviews)</span>
          </div>

          <div style={{ fontSize: '1.8rem', fontWeight: 800, color: '#111827', marginBottom: '1.5rem' }}>
            ${Number(product.price).toFixed(2)}
          </div>

          <div style={{ marginBottom: '1.8rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
              <label style={{ fontSize: '0.9rem', fontWeight: 700 }}>Choose Size (US):</label>
              <button
                type="button"
                onClick={() => setShowSizeModal(true)}
                style={{ background: 'none', border: 'none', color: '#2563eb', fontWeight: 600, fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                <Ruler size={14} /> Size Guide
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
              {product.variants?.map((v) => {
                const isSelected = selectedVariant?.id === v.id;
                const outOfStock = v.stock_quantity === 0;

                return (
                  <button
                    key={v.id}
                    onClick={() => setSelectedVariant(v)}
                    style={{
                      padding: '0.6rem 1rem',
                      borderRadius: '8px',
                      border: isSelected ? '2px solid #111827' : '1px solid #d1d5db',
                      background: isSelected ? '#111827' : '#fff',
                      color: isSelected ? '#fff' : outOfStock ? '#9ca3af' : '#111827',
                      fontWeight: 700,
                      cursor: 'pointer',
                      opacity: outOfStock ? 0.5 : 1,
                      textDecoration: outOfStock ? 'line-through' : 'none',
                    }}
                  >
                    US {v.size_value}
                  </button>
                );
              })}
            </div>

            <div style={{ marginTop: '0.8rem', fontSize: '0.85rem', fontWeight: 600 }}>
              {isOutOfStock ? (
                <span style={{ color: '#dc2626', display: 'flex', alignItems: 'center', gap: '4px' }}>
                  <AlertCircle size={14} /> Out of stock in this size. Add to wishlist for restock alerts!
                </span>
              ) : isLowStock ? (
                <span style={{ color: '#d97706' }}>Only {selectedVariant.stock_quantity} left in stock - order soon!</span>
              ) : (
                <span style={{ color: '#16a34a' }}>✓ In Stock ({selectedVariant?.stock_quantity} units available)</span>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem' }}>
            <button
              onClick={handleAddToCart}
              disabled={isOutOfStock}
              style={{
                flex: 1,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '0.6rem',
                padding: '1rem',
                background: isOutOfStock ? '#e5e7eb' : '#111827',
                color: isOutOfStock ? '#9ca3af' : '#fff',
                borderRadius: '9999px',
                fontWeight: 700,
                fontSize: '1rem',
                border: 'none',
                cursor: isOutOfStock ? 'not-allowed' : 'pointer',
              }}
            >
              <ShoppingBag size={18} />
              {added ? 'Added to Bag!' : isOutOfStock ? 'Out of Stock' : 'Add to Bag'}
            </button>

            <button
              onClick={() => toggleWishlist(product)}
              style={{
                padding: '1rem',
                borderRadius: '9999px',
                border: '1px solid #d1d5db',
                background: isWishlisted ? '#fee2e2' : '#fff',
                color: isWishlisted ? '#dc2626' : '#111827',
                cursor: 'pointer',
              }}
            >
              <Heart size={20} fill={isWishlisted ? '#dc2626' : 'none'} />
            </button>
          </div>

          <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '1.5rem' }}>
            <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '0.4rem' }}>Product Description</h3>
            <p style={{ color: '#4b5563', lineHeight: 1.6, fontSize: '0.9rem', marginBottom: '1rem' }}>{product.description}</p>
            <div style={{ fontSize: '0.85rem', color: '#6b7280' }}>
              <strong>Materials:</strong> {product.materials || 'Breathable mesh upper, rubber outsole'}
            </div>
          </div>
        </div>
      </div>

      <section style={{ marginTop: '4rem', borderTop: '1px solid #e5e7eb', paddingTop: '3rem' }}>
        <h2 style={{ fontSize: '1.6rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MessageSquare size={22} /> Customer Ratings & Reviews
        </h2>

        {reviewMsg && (
          <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', color: '#15803d', padding: '1rem', borderRadius: '8px', marginBottom: '1.5rem', fontWeight: 600 }}>
            {reviewMsg}
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '3rem', alignItems: 'start' }}>
          <form onSubmit={handleReviewSubmit} style={{ background: '#f9fafb', padding: '1.8rem', borderRadius: '12px', border: '1px solid #e5e7eb', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 700 }}>Leave a Customer Review</h3>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Your Name *</label>
              <input required type="text" placeholder="e.g. John Doe" value={reviewForm.author_name} onChange={(e) => setReviewForm({ ...reviewForm, author_name: e.target.value })} style={{ width: '100%', padding: '0.65rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Rating *</label>
              <select value={reviewForm.rating} onChange={(e) => setReviewForm({ ...reviewForm, rating: Number(e.target.value) })} style={{ width: '100%', padding: '0.65rem', border: '1px solid #d1d5db', borderRadius: '6px' }}>
                <option value={5}>⭐⭐⭐⭐⭐ (5 - Outstanding)</option>
                <option value={4}>⭐⭐⭐⭐ (4 - Very Good)</option>
                <option value={3}>⭐⭐⭐ (3 - Average)</option>
                <option value={2}>⭐⭐ (2 - Below Expectations)</option>
                <option value={1}>⭐ (1 - Poor)</option>
              </select>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, marginBottom: '0.3rem' }}>Your Comments *</label>
              <textarea required rows="3" placeholder="Share comfort, sizing fit, performance..." value={reviewForm.comment} onChange={(e) => setReviewForm({ ...reviewForm, comment: e.target.value })} style={{ width: '100%', padding: '0.65rem', border: '1px solid #d1d5db', borderRadius: '6px' }} />
            </div>

            <button type="submit" disabled={submittingReview} style={{ padding: '0.75rem', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}>
              <Send size={16} /> {submittingReview ? 'Submitting...' : 'Post Review'}
            </button>
          </form>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {product.reviews && product.reviews.length > 0 ? (
              product.reviews.map((rev) => (
                <div key={rev.id} style={{ border: '1px solid #e5e7eb', borderRadius: '10px', padding: '1.2rem', background: '#fff' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.4rem' }}>
                    <strong>{rev.author_name}</strong>
                    <span style={{ color: '#f59e0b', fontWeight: 700 }}>{'★'.repeat(rev.rating)}</span>
                  </div>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: '#4b5563', lineHeight: 1.5 }}>{rev.comment}</p>
                  <span style={{ fontSize: '0.75rem', color: '#9ca3af', marginTop: '0.5rem', display: 'block' }}>
                    {new Date(rev.created_at).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p style={{ color: '#6b7280', fontSize: '0.95rem' }}>No reviews yet. Be the first to share your experience!</p>
            )}
          </div>
        </div>
      </section>

      {showSizeModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1200 }}>
          <div style={{ background: '#fff', padding: '2rem', borderRadius: '16px', maxWidth: '500px', width: '90%' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '1rem' }}>Footwear Sizing Chart</h2>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem', textAlign: 'center', marginBottom: '1.5rem' }}>
              <thead>
                <tr style={{ background: '#f3f4f6' }}>
                  <th style={{ padding: '0.6rem', border: '1px solid #e5e7eb' }}>US Size</th>
                  <th style={{ padding: '0.6rem', border: '1px solid #e5e7eb' }}>UK Size</th>
                  <th style={{ padding: '0.6rem', border: '1px solid #e5e7eb' }}>EU Size</th>
                  <th style={{ padding: '0.6rem', border: '1px solid #e5e7eb' }}>CM</th>
                </tr>
              </thead>
              <tbody>
                <tr><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>7.0</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>6.0</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>40</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>25.0</td></tr>
                <tr><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>8.0</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>7.0</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>41</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>26.0</td></tr>
                <tr><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>8.5</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>7.5</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>42</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>26.5</td></tr>
                <tr><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>9.0</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>8.0</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>42.5</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>27.0</td></tr>
                <tr><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>9.5</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>8.5</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>43</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>27.5</td></tr>
                <tr><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>10.0</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>9.0</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>44</td><td style={{ padding: '0.5rem', border: '1px solid #e5e7eb' }}>28.0</td></tr>
              </tbody>
            </table>
            <button onClick={() => setShowSizeModal(false)} style={{ width: '100%', padding: '0.75rem', background: '#111827', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 700, cursor: 'pointer' }}>
              Close Size Guide
            </button>
          </div>
        </div>
      )}
    </div>
  );
}