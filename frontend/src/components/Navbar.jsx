import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useShop } from '../context/ShopContext';
import { ShoppingBag, Heart, Search, User, LogOut, ShieldAlert } from 'lucide-react';

export default function Navbar() {
  const { cart, wishlist, currentUser, logoutUser } = useShop();
  const [searchTerm, setSearchTerm] = useState('');
  const [showUserDropdown, setShowUserDropdown] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchTerm.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchTerm.trim())}`);
      setSearchTerm('');
    }
  };

  const handleLogout = () => {
    logoutUser();
    setShowUserDropdown(false);
    navigate('/');
  };

  const totalCartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const isLinkActive = (path, searchParam = null, searchVal = null) => {
    const currentParams = new URLSearchParams(location.search);
    if (searchParam) {
      return location.pathname === path && currentParams.get(searchParam) === searchVal;
    }
    if (path === '/products') {
      return location.pathname === '/products' && !location.search;
    }
    return location.pathname === path && !location.search;
  };

  const getLinkStyle = (isActive) => ({
    textDecoration: 'none',
    fontWeight: 700,
    fontSize: '0.9rem',
    padding: '0.35rem 0.75rem',
    borderRadius: '6px',
    transition: 'all 0.15s ease',
    background: isActive ? '#fee2e2' : 'transparent',
    color: isActive ? '#e11d48' : '#4b5563',
  });

  return (
    <header style={{ position: 'sticky', top: 0, zIndex: 50, background: '#fff', borderBottom: '1px solid #e5e7eb' }}>
      {/* Top Banner */}
      <div style={{ background: '#0f172a', color: '#e2e8f0', fontSize: '0.78rem', padding: '0.45rem 1rem', textAlign: 'center', fontWeight: 600 }}>
        Free shipping on all orders over $100 • Use code <strong style={{ color: '#facc15' }}>WELCOME10</strong> for 10% off
      </div>

      {/* Main Bar */}
      <div style={{ maxWidth: '1280px', margin: '0 auto', padding: '0.85rem 1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '1.5rem' }}>
        {/* Brand Logo */}
        <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '6px' }}>
          <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#e11d48', letterSpacing: '-0.5px' }}>TRUSTED</span>
          <span style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', letterSpacing: '-0.5px' }}>MART</span>
        </Link>

        {/* Dynamic Category Nav */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
          <Link to="/" style={getLinkStyle(isLinkActive('/'))}>Home</Link>
          <Link to="/products" style={getLinkStyle(isLinkActive('/products'))}>All Products</Link>
          <Link to="/products?category=sneakers" style={getLinkStyle(isLinkActive('/products', 'category', 'sneakers'))}>Sneakers</Link>
          <Link to="/products?category=sports" style={getLinkStyle(isLinkActive('/products', 'category', 'sports'))}>Sports</Link>
          <Link to="/products?gender=Men" style={getLinkStyle(isLinkActive('/products', 'gender', 'Men'))}>Men</Link>
          <Link to="/products?gender=Women" style={getLinkStyle(isLinkActive('/products', 'gender', 'Women'))}>Women</Link>
          <Link to="/products?gender=Kids" style={getLinkStyle(isLinkActive('/products', 'gender', 'Kids'))}>Kids</Link>
          <Link to="/track-order" style={getLinkStyle(isLinkActive('/track-order'))}>Track Order</Link>
        </nav>

        {/* Search */}
        <form onSubmit={handleSearch} style={{ position: 'relative', flex: '0 1 260px' }}>
          <input
            type="text"
            placeholder="Search shoes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              width: '100%',
              padding: '0.45rem 2.2rem 0.45rem 0.85rem',
              borderRadius: '9999px',
              border: '1px solid #d1d5db',
              fontSize: '0.85rem',
              outline: 'none',
              background: '#f9fafb'
            }}
          />
          <button type="submit" aria-label="Search" style={{ position: 'absolute', right: '10px', top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center' }}>
            <Search size={15} color="#6b7280" />
          </button>
        </form>

        {/* User Account / Wishlist / Cart */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ position: 'relative' }}>
            {currentUser ? (
              <button
                type="button"
                onClick={() => setShowUserDropdown(!showUserDropdown)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700, fontSize: '0.85rem', color: '#111827' }}
              >
                <div style={{ width: '30px', height: '30px', borderRadius: '50%', background: '#e11d48', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem', fontWeight: 800 }}>
                  {currentUser.name ? currentUser.name.charAt(0).toUpperCase() : 'U'}
                </div>
                <span>{currentUser.name ? currentUser.name.split(' ')[0] : 'User'}</span>
              </button>
            ) : (
              <Link to="/login" style={{ textDecoration: 'none', color: '#111827', display: 'flex', alignItems: 'center', gap: '4px', fontSize: '0.85rem', fontWeight: 700 }}>
                <User size={18} /> Sign In
              </Link>
            )}

            {showUserDropdown && currentUser && (
              <div
                style={{
                  position: 'absolute',
                  right: 0,
                  top: '130%',
                  background: '#fff',
                  boxShadow: '0 10px 25px rgba(0,0,0,0.12)',
                  borderRadius: '10px',
                  border: '1px solid #e5e7eb',
                  width: '190px',
                  padding: '0.5rem 0',
                  zIndex: 60
                }}
              >
                <Link
                  to="/profile"
                  onClick={() => setShowUserDropdown(false)}
                  style={{ display: 'block', padding: '0.65rem 1.1rem', color: '#111827', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 600 }}
                >
                  My Profile & Orders
                </Link>

                {currentUser.role === 'admin' && (
                  <Link
                    to="/admin"
                    onClick={() => setShowUserDropdown(false)}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '0.65rem 1.1rem', color: '#e11d48', textDecoration: 'none', fontSize: '0.85rem', fontWeight: 700 }}
                  >
                    <ShieldAlert size={14} /> Admin Hub
                  </Link>
                )}

                <button
                  type="button"
                  onClick={handleLogout}
                  style={{
                    width: '100%',
                    textAlign: 'left',
                    padding: '0.65rem 1.1rem',
                    background: 'none',
                    border: 'none',
                    borderTop: '1px solid #f3f4f6',
                    cursor: 'pointer',
                    color: '#e11d48',
                    fontSize: '0.85rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <LogOut size={14} /> Logout
                </button>
              </div>
            )}
          </div>

          <Link to="/wishlist" aria-label="Wishlist" style={{ position: 'relative', color: '#111827', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <Heart size={20} />
            {wishlist.length > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: '#e11d48', color: '#fff', fontSize: '0.65rem', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {wishlist.length}
              </span>
            )}
          </Link>

          <Link to="/cart" aria-label="Cart" style={{ position: 'relative', color: '#111827', textDecoration: 'none', display: 'flex', alignItems: 'center' }}>
            <ShoppingBag size={20} />
            {totalCartCount > 0 && (
              <span style={{ position: 'absolute', top: '-6px', right: '-8px', background: '#e11d48', color: '#fff', fontSize: '0.65rem', fontWeight: 800, width: '16px', height: '16px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                {totalCartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}