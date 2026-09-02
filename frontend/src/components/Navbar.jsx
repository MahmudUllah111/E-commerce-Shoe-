import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ShoppingCart, Heart, Search, User, LogOut, ShieldCheck, ChevronDown, Package } from 'lucide-react';

export default function Navbar() {
  const { cartCount, wishlist, currentUser, logout } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserMenu, setShowUserMenu] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/?search=${encodeURIComponent(searchTerm.trim())}`);
    } else {
      navigate('/');
    }
  };

  return (
    <header style={{ borderBottom: '1px solid #e5e7eb', background: '#fff', position: 'sticky', top: 0, zIndex: 100 }}>
      {/* Top Banner */}
      <div style={{ background: '#111827', color: '#fff', fontSize: '0.75rem', padding: '0.4rem 0', textAlign: 'center', fontWeight: 600 }}>
        Free shipping on all orders over $100 • Use code <span style={{ color: '#facc15' }}>WELCOME10</span> for 10% off
      </div>

      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <span style={{ fontSize: '1.5rem', fontWeight: 900, color: '#111827', letterSpacing: '-0.5px' }}>
            TRUSTED<span style={{ color: '#e11d48' }}>MART</span>
          </span>
        </Link>

        {/* Categories Navigation */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.2rem', fontSize: '0.9rem', fontWeight: 700 }}>
          <Link to="/" style={{ textDecoration: 'none', color: '#374151' }}>Home</Link>
          <Link to="/?category=sneakers" style={{ textDecoration: 'none', color: '#374151' }}>Sneakers</Link>
          <Link to="/?category=sports" style={{ textDecoration: 'none', color: '#374151' }}>Sports</Link>
          <Link to="/?gender=Men" style={{ textDecoration: 'none', color: '#374151' }}>Men</Link>
          <Link to="/?gender=Women" style={{ textDecoration: 'none', color: '#374151' }}>Women</Link>
          <Link to="/?gender=Kids" style={{ textDecoration: 'none', color: '#374151' }}>Kids</Link>
          <Link to="/track-order" style={{ textDecoration: 'none', color: '#374151' }}>Track Order</Link>
        </nav>

        {/* Live Search Input */}
        <form onSubmit={handleSearch} style={{ display: 'flex', alignItems: 'center', background: '#f3f4f6', borderRadius: '9999px', padding: '0.4rem 0.8rem', width: '220px' }}>
          <input
            type="text"
            placeholder="Search shoes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{ border: 'none', background: 'transparent', outline: 'none', fontSize: '0.85rem', width: '100%', color: '#111827' }}
          />
          <button type="submit" style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', color: '#6b7280' }}>
            <Search size={16} />
          </button>
        </form>

        {/* User Account, Wishlist & Cart Actions */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          {/* User Profile Dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              style={{ display: 'flex', alignItems: 'center', gap: '4px', background: 'none', border: 'none', cursor: 'pointer', color: '#374151', fontSize: '0.85rem', fontWeight: 700 }}
            >
              <User size={20} />
              <span>{currentUser ? currentUser.name.split(' ')[0] : 'Sign In'}</span>
              <ChevronDown size={14} />
            </button>

            {showUserMenu && (
              <div
                onClick={() => setShowUserMenu(false)}
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '2.4rem',
                  background: '#fff',
                  border: '1px solid #e5e7eb',
                  borderRadius: '10px',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.1)',
                  minWidth: '210px',
                  padding: '0.5rem 0',
                  zIndex: 200,
                }}
              >
                {currentUser ? (
                  <>
                    <div style={{ padding: '0.6rem 1rem', borderBottom: '1px solid #f3f4f6' }}>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#111827' }}>{currentUser.name}</div>
                      <div style={{ fontSize: '0.75rem', color: '#6b7280' }}>{currentUser.email}</div>
                    </div>

                    <Link
                      to="/profile"
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: '#111827', textDecoration: 'none' }}
                    >
                      <Package size={16} /> My Account & Orders
                    </Link>

                    {currentUser.role === 'admin' && (
                      <Link
                        to="/admin"
                        style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: '#e11d48', textDecoration: 'none' }}
                      >
                        <ShieldCheck size={16} /> Admin Portal
                      </Link>
                    )}

                    <button
                      onClick={logout}
                      style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', padding: '0.6rem 1rem', border: 'none', background: 'none', color: '#ef4444', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', textAlign: 'left', borderTop: '1px solid #f3f4f6' }}
                    >
                      <LogOut size={16} /> Log Out
                    </button>
                  </>
                ) : (
                  <>
                    <Link
                      to="/login"
                      style={{ display: 'block', padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: '#111827', textDecoration: 'none' }}
                    >
                      Customer Sign In
                    </Link>
                    <Link
                      to="/register"
                      style={{ display: 'block', padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: '#111827', textDecoration: 'none' }}
                    >
                      Create Free Account
                    </Link>
                    <Link
                      to="/admin/login"
                      style={{ display: 'block', padding: '0.6rem 1rem', fontSize: '0.85rem', fontWeight: 600, color: '#6b7280', textDecoration: 'none', borderTop: '1px solid #f3f4f6' }}
                    >
                      Admin Staff Login
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          {/* Wishlist Icon */}
          <Link to="/wishlist" style={{ position: 'relative', color: '#374151', display: 'flex', alignItems: 'center' }}>
            <Heart size={21} />
            {wishlist.length > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: '#e11d48', color: '#fff', fontSize: '0.65rem', fontWeight: 800, width: '17px', height: '17px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {wishlist.length}
              </span>
            )}
          </Link>

          {/* Cart Icon */}
          <Link to="/cart" style={{ position: 'relative', color: '#374151', display: 'flex', alignItems: 'center' }}>
            <ShoppingCart size={21} />
            {cartCount > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: '#111827', color: '#fff', fontSize: '0.65rem', fontWeight: 800, width: '17px', height: '17px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}