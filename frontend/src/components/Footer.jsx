import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { CheckCircle2, ShieldCheck, Truck, RotateCcw, Headphones } from 'lucide-react';

export default function Footer() {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleNewsletter = (e) => {
    e.preventDefault();
    if (!email) return;
    setSubscribed(true);
    setEmail('');
    setTimeout(() => setSubscribed(false), 5000);
  };

  return (
    <footer style={{ background: '#0f172a', color: '#94a3b8', marginTop: 'auto', borderTop: '1px solid #1e293b' }}>
      <div style={{ borderBottom: '1px solid #1e293b', padding: '2.5rem 1.5rem' }}>
        <div style={{ maxWidth: '1240px', margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Truck size={32} color="#38bdf8" />
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>Free Fast Shipping</h4>
              <p style={{ margin: 0, fontSize: '0.8rem' }}>On all orders over $100</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <RotateCcw size={32} color="#38bdf8" />
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>30-Day Easy Returns</h4>
              <p style={{ margin: 0, fontSize: '0.8rem' }}>Hassle-free refunds & swaps</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <ShieldCheck size={32} color="#38bdf8" />
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>100% Genuine Footwear</h4>
              <p style={{ margin: 0, fontSize: '0.8rem' }}>Direct from verified makers</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <Headphones size={32} color="#38bdf8" />
            <div>
              <h4 style={{ color: '#fff', fontSize: '0.95rem', fontWeight: 700, margin: 0 }}>24/7 Dedicated Support</h4>
              <p style={{ margin: 0, fontSize: '0.8rem' }}>Contact us anytime</p>
            </div>
          </div>
        </div>
      </div>

      <div style={{ maxWidth: '1240px', margin: '0 auto', padding: '3.5rem 1.5rem', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '2.5rem' }}>
        <div>
          <h3 style={{ color: '#fff', fontSize: '1.25rem', fontWeight: 900, letterSpacing: '-0.5px', marginBottom: '1rem' }}>
            TRUSTED<span style={{ color: '#ff3838' }}>MART</span>
          </h3>
          <p style={{ fontSize: '0.85rem', lineHeight: 1.6, marginBottom: '1.2rem' }}>
            Premium athletic performance & urban lifestyle footwear. Built with real-time stock sync and automated alerts.
          </p>
          <span style={{ fontSize: '0.8rem', color: '#64748b' }}>Dhaka, Bangladesh</span>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase' }}>Shop Collections</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
            <li><Link to="/?category=sneakers" style={{ color: 'inherit', textDecoration: 'none' }}>Lifestyle Sneakers</Link></li>
            <li><Link to="/?category=sports" style={{ color: 'inherit', textDecoration: 'none' }}>Running & Gym</Link></li>
            <li><Link to="/?gender=Men" style={{ color: 'inherit', textDecoration: 'none' }}>Men's Footwear</Link></li>
            <li><Link to="/?gender=Women" style={{ color: 'inherit', textDecoration: 'none' }}>Women's Footwear</Link></li>
            <li><Link to="/?gender=Kids" style={{ color: 'inherit', textDecoration: 'none' }}>Kids' Collection</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '1rem', textTransform: 'uppercase' }}>Customer Care</h4>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.85rem' }}>
            <li><Link to="/about" style={{ color: 'inherit', textDecoration: 'none' }}>About Us</Link></li>
            <li><Link to="/faq" style={{ color: 'inherit', textDecoration: 'none' }}>FAQs</Link></li>
            <li><Link to="/contact" style={{ color: 'inherit', textDecoration: 'none' }}>Contact Us</Link></li>
            <li><Link to="/returns" style={{ color: 'inherit', textDecoration: 'none' }}>Return & Exchange Policy</Link></li>
            <li><Link to="/track-order" style={{ color: 'inherit', textDecoration: 'none' }}>Track Your Order</Link></li>
          </ul>
        </div>

        <div>
          <h4 style={{ color: '#fff', fontSize: '0.9rem', fontWeight: 700, marginBottom: '0.6rem', textTransform: 'uppercase' }}>Join Our Newsletter</h4>
          <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>Subscribe for restock drops and special discount codes.</p>
          {subscribed ? (
            <div style={{ background: '#14532d', color: '#86efac', padding: '0.75rem', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
              <CheckCircle2 size={16} /> Subscribed! Use code <strong>WELCOME10</strong>.
            </div>
          ) : (
            <form onSubmit={handleNewsletter} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <input
                type="email"
                required
                placeholder="Enter your email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{ padding: '0.65rem 0.8rem', borderRadius: '6px', border: '1px solid #334155', background: '#1e293b', color: '#fff', fontSize: '0.85rem', outline: 'none' }}
              />
              <button
                type="submit"
                style={{ padding: '0.65rem', borderRadius: '6px', background: '#ff3838', color: '#fff', fontWeight: 700, border: 'none', cursor: 'pointer', fontSize: '0.85rem' }}
              >
                Subscribe Now
              </button>
            </form>
          )}
        </div>
      </div>

      <div style={{ borderTop: '1px solid #1e293b', padding: '1.5rem', textAlign: 'center', fontSize: '0.75rem', color: '#64748b' }}>
        © 2026 TrustedMart Footwear. All rights reserved.
      </div>
    </footer>
  );
}