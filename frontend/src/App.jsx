import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ProductDetail from './pages/ProductDetail';
import CartPage from './pages/CartPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccess from './pages/OrderSuccess';
import TrackOrder from './pages/TrackOrder';
import WishlistPage from './pages/WishlistPage';
import ProfilePage from './pages/ProfilePage';
import { AboutPage, FAQPage, ContactPage, ReturnsPage } from './pages/StaticPages';
import AdminDashboard from './pages/AdminDashboard';
import CustomerLogin from './pages/CustomerLogin';
import CustomerRegister from './pages/CustomerRegister';
import AdminLogin from './pages/AdminLogin';
import { ShopProvider, useShop } from './context/ShopContext';
import { getProducts } from './services/api';
import { ChevronLeft, ChevronRight, ArrowRight, Tag, CreditCard, ShieldCheck, X } from 'lucide-react';

function AdminProtectedRoute({ children }) {
  const { currentUser } = useShop();
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

// Edge-to-Edge Cinematic Hero Slider
function HeroCarousel() {
  const slides = [
    {
      saleBadge: 'SUPER SALE',
      discountBadge: 'ENJOY UP TO 30% OFF',
      title: 'Summer 2026 Collection',
      subtitle: 'Engineered street-ready cushioning and high-traction performance silhouettes.',
      ctaText: 'Shop Sale',
      ctaLink: '/?category=sneakers',
      bgImg: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&auto=format&fit=crop&q=80',
      shoeImg: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80',
    },
    {
      saleBadge: 'URBAN ESSENTIALS',
      discountBadge: 'FLAT 15% OFF',
      title: 'Performance & Athletics',
      subtitle: 'Lightweight breathable mesh for maximum comfort all day long.',
      ctaText: 'Explore Sports',
      ctaLink: '/?category=sports',
      bgImg: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=1600&auto=format&fit=crop&q=80',
      shoeImg: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&auto=format&fit=crop&q=80',
    },
    {
      saleBadge: 'NEW ARRIVALS',
      discountBadge: 'FREE EXPRESS SHIPPING',
      title: 'Crafted For Modern Comfort',
      subtitle: 'Use promo code WELCOME10 at checkout on orders over $100.',
      ctaText: 'Discover All',
      ctaLink: '/',
      bgImg: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',
      shoeImg: 'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=900&auto=format&fit=crop&q=80',
    }
  ];

  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrent((prev) => (prev + 1) % slides.length);
    }, 7000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevSlide = () => setCurrent((prev) => (prev - 1 + slides.length) % slides.length);
  const nextSlide = () => setCurrent((prev) => (prev + 1) % slides.length);
  const active = slides[current];

  return (
    <div style={{ position: 'relative', width: '100%', minHeight: '520px', overflow: 'hidden', background: '#111' }}>
      <div
        style={{
          position: 'absolute',
          inset: 0,
          backgroundImage: `linear-gradient(90deg, rgba(0,0,0,0.85) 0%, rgba(0,0,0,0.5) 50%, rgba(0,0,0,0.3) 100%), url(${active.bgImg})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
          transition: 'all 0.7s ease',
        }}
      />

      <div
        style={{
          position: 'relative',
          zIndex: 2,
          maxWidth: '1280px',
          margin: '0 auto',
          padding: '4.5rem 2rem',
          minHeight: '520px',
          display: 'grid',
          gridTemplateColumns: '1.2fr 1fr',
          alignItems: 'center',
          gap: '3rem',
        }}
      >
        <div style={{ color: '#fff' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginBottom: '1.2rem', flexWrap: 'wrap' }}>
            <span style={{ background: '#e11d48', color: '#fff', fontSize: '0.85rem', fontWeight: 900, padding: '0.4rem 1rem', borderRadius: '4px', letterSpacing: '1px' }}>
              {active.saleBadge}
            </span>
            <span style={{ border: '2px solid #facc15', color: '#facc15', fontSize: '0.85rem', fontWeight: 900, padding: '0.35rem 0.9rem', borderRadius: '4px', letterSpacing: '0.5px' }}>
              {active.discountBadge}
            </span>
          </div>

          <h1 style={{ fontSize: '3.4rem', fontWeight: 900, lineHeight: 1.1, marginBottom: '1.2rem', letterSpacing: '-1px' }}>
            {active.title}
          </h1>

          <p style={{ color: '#e2e8f0', fontSize: '1.1rem', lineHeight: 1.6, maxWidth: '540px', marginBottom: '2.2rem' }}>
            {active.subtitle}
          </p>

          <Link
            to={active.ctaLink}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '10px',
              padding: '1rem 2.2rem',
              borderRadius: '4px',
              background: '#fff',
              color: '#0f172a',
              fontWeight: 800,
              fontSize: '1rem',
              textDecoration: 'none',
              boxShadow: '0 10px 25px rgba(0,0,0,0.3)',
              textTransform: 'uppercase',
              letterSpacing: '0.5px'
            }}
          >
            {active.ctaText} <ArrowRight size={18} />
          </Link>
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', position: 'relative' }}>
          <img
            src={active.shoeImg}
            alt="Hero Shoe"
            style={{
              maxHeight: '360px',
              maxWidth: '100%',
              objectFit: 'contain',
              filter: 'drop-shadow(0 30px 35px rgba(0,0,0,0.65))',
              transform: 'rotate(-10deg) scale(1.08)',
              transition: 'all 0.6s ease'
            }}
          />
        </div>
      </div>

      <button
        onClick={prevSlide}
        aria-label="Previous Slide"
        style={{
          position: 'absolute',
          left: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        <ChevronLeft size={26} />
      </button>

      <button
        onClick={nextSlide}
        aria-label="Next Slide"
        style={{
          position: 'absolute',
          right: '20px',
          top: '50%',
          transform: 'translateY(-50%)',
          background: 'rgba(0,0,0,0.5)',
          border: '1px solid rgba(255,255,255,0.2)',
          color: '#fff',
          width: '48px',
          height: '48px',
          borderRadius: '50%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          cursor: 'pointer',
          zIndex: 10,
        }}
      >
        <ChevronRight size={26} />
      </button>

      <div style={{ position: 'absolute', bottom: '24px', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: '8px', zIndex: 10 }}>
        {slides.map((_, idx) => (
          <button
            key={idx}
            onClick={() => setCurrent(idx)}
            aria-label={`Slide ${idx + 1}`}
            style={{
              width: current === idx ? '32px' : '10px',
              height: '8px',
              borderRadius: '9999px',
              background: current === idx ? '#e11d48' : 'rgba(255,255,255,0.4)',
              border: 'none',
              cursor: 'pointer',
              transition: 'all 0.3s ease',
            }}
          />
        ))}
      </div>
    </div>
  );
}

function CategoryShowcase() {
  const categories = [
    { title: "MEN'S COLLECTION", link: '/?gender=Men', img: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80' },
    { title: "WOMEN'S COLLECTION", link: '/?gender=Women', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80' },
    { title: "KIDS' COLLECTION", link: '/?gender=Kids', img: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&auto=format&fit=crop&q=80' },
    { title: "SNEAKER STUDIO", link: '/?category=sneakers', img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80' },
  ];

  return (
    <section style={{ maxWidth: '1280px', margin: '2.5rem auto 3.5rem', padding: '0 1.5rem' }}>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.2rem' }}>
        {categories.map((c, i) => (
          <Link
            key={i}
            to={c.link}
            style={{
              position: 'relative',
              borderRadius: '8px',
              overflow: 'hidden',
              height: '240px',
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'flex-end',
              boxShadow: '0 4px 12px rgba(0,0,0,0.06)'
            }}
          >
            <img
              src={c.img}
              alt={c.title}
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(180deg, transparent 40%, rgba(0,0,0,0.75) 100%)' }} />
            <div style={{ position: 'relative', zIndex: 2, padding: '1.2rem', width: '100%', color: '#fff' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 900, letterSpacing: '0.5px', margin: 0 }}>{c.title}</h3>
              <span style={{ fontSize: '0.8rem', color: '#e2e8f0', display: 'inline-flex', alignItems: 'center', gap: '4px', marginTop: '4px' }}>
                Shop Now <ArrowRight size={12} />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

function PromoVoucherStrip() {
  return (
    <div style={{ maxWidth: '1280px', margin: '0 auto 3.5rem', padding: '0 1.5rem' }}>
      <div style={{ background: 'linear-gradient(90deg, #111827 0%, #1f2937 100%)', borderRadius: '12px', padding: '1.8rem 2.5rem', color: '#fff', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem', border: '1px solid #374151' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.2rem' }}>
          <div style={{ width: '56px', height: '56px', background: '#e11d48', borderRadius: '10px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <Tag size={28} />
          </div>
          <div>
            <div style={{ fontSize: '0.8rem', fontWeight: 800, color: '#facc15', textTransform: 'uppercase' }}>LIMITED VOUCHER</div>
            <h3 style={{ fontSize: '1.4rem', fontWeight: 900, margin: '2px 0' }}>FLAT 10% OFF YOUR FIRST ORDER</h3>
            <p style={{ margin: 0, fontSize: '0.85rem', color: '#9ca3af' }}>Use code <strong style={{ color: '#fff' }}>WELCOME10</strong> at checkout. Valid across all models.</p>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '2rem', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db', fontSize: '0.85rem' }}>
            <CreditCard size={20} color="#38bdf8" /> Easy Cash On Delivery / Card
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#d1d5db', fontSize: '0.85rem' }}>
            <ShieldCheck size={20} color="#38bdf8" /> 100% Genuine Footwear
          </div>
        </div>
      </div>
    </div>
  );
}

function ProductCard({ shoe }) {
  const imgSource = shoe.images?.[0]?.startsWith('http')
    ? shoe.images[0]
    : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600';

  return (
    <Link
      to={`/product/${shoe.id}`}
      style={{
        border: '1px solid #e5e7eb',
        borderRadius: '12px',
        overflow: 'hidden',
        background: '#fff',
        display: 'flex',
        flexDirection: 'column',
        textDecoration: 'none',
        color: 'inherit',
        boxShadow: '0 2px 8px rgba(0,0,0,0.04)',
      }}
    >
      <div style={{ height: '230px', background: '#f8f9fa', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        {shoe.is_new === 1 && (
          <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#111827', color: '#fff', fontSize: '0.7rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '4px' }}>
            NEW
          </span>
        )}
        <img
          src={imgSource}
          alt={shoe.name}
          style={{ maxHeight: '82%', maxWidth: '85%', objectFit: 'contain' }}
          onError={(e) => {
            e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600';
          }}
        />
      </div>

      <div style={{ padding: '1.2rem', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
        <div>
          <div style={{ fontSize: '0.75rem', fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            {shoe.brand_name} • {shoe.gender}
          </div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '0.35rem 0 0.6rem 0' }}>{shoe.name}</h3>
        </div>

        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '0.4rem' }}>
            <div>
              <span style={{ fontWeight: 800, fontSize: '1.15rem', color: '#111827' }}>${Number(shoe.price).toFixed(2)}</span>
              {shoe.original_price && (
                <span style={{ marginLeft: '0.5rem', textDecoration: 'line-through', color: '#9ca3af', fontSize: '0.85rem' }}>
                  ${Number(shoe.original_price).toFixed(2)}
                </span>
              )}
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, color: '#f59e0b' }}>★ {shoe.rating}</span>
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px', marginTop: '0.9rem' }}>
            {shoe.variants?.map((v) => (
              <span
                key={v.id}
                style={{
                  fontSize: '0.75rem',
                  padding: '2px 6px',
                  borderRadius: '4px',
                  border: '1px solid #e5e7eb',
                  opacity: v.stock_quantity === 0 ? 0.4 : 1,
                  textDecoration: v.stock_quantity === 0 ? 'line-through' : 'none',
                  fontWeight: 600,
                }}
              >
                {v.size_value}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Link>
  );
}

function ProductCarouselSection({ title, subtitle, products }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -300 : 300;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section style={{ maxWidth: '1280px', margin: '0 auto 4rem', padding: '0 1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', borderBottom: '2px solid #f3f4f6', paddingBottom: '0.8rem' }}>
        <div>
          <h2 style={{ fontSize: '1.6rem', fontWeight: 900, letterSpacing: '-0.5px', margin: 0 }}>{title}</h2>
          {subtitle && <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '4px 0 0 0' }}>{subtitle}</p>}
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={() => scroll('left')}
            aria-label="Scroll Left"
            style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => scroll('right')}
            aria-label="Scroll Right"
            style={{ width: '38px', height: '38px', borderRadius: '50%', border: '1px solid #e5e7eb', background: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}
          >
            <ChevronRight size={20} />
          </button>
        </div>
      </div>

      <div
        ref={scrollRef}
        style={{
          display: 'flex',
          gap: '1.5rem',
          overflowX: 'auto',
          scrollSnapType: 'x mandatory',
          scrollbarWidth: 'none',
          paddingBottom: '1rem',
        }}
      >
        {products.map((shoe) => (
          <div key={shoe.id} style={{ flex: '0 0 280px', scrollSnapAlign: 'start' }}>
            <ProductCard shoe={shoe} />
          </div>
        ))}
      </div>
    </section>
  );
}

function Home() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const location = useLocation();

  const params = new URLSearchParams(location.search);
  const categoryFilter = params.get('category');
  const genderFilter = params.get('gender');
  const searchFilter = params.get('search');
  const isFiltering = Boolean(categoryFilter || genderFilter || searchFilter);

  useEffect(() => {
    setLoading(true);
    const filterParams = {
      category: categoryFilter || undefined,
      gender: genderFilter || undefined,
      search: searchFilter || undefined,
    };

    getProducts(filterParams)
      .then((res) => {
        setProducts(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load shoes:', err);
        setLoading(false);
      });
  }, [location.search, categoryFilter, genderFilter, searchFilter]);

  const bestSellers = [...products].sort((a, b) => b.rating - a.rating);
  const newArrivals = [...products].filter((p) => p.is_new === 1 || p.id % 2 === 0);

  const getFilterLabel = () => {
    if (categoryFilter) return `Category: ${categoryFilter.toUpperCase()}`;
    if (genderFilter) return `${genderFilter.toUpperCase()}'S FOOTWEAR`;
    if (searchFilter) return `Search results for "${searchFilter}"`;
    return 'FOOTWEAR COLLECTION';
  };

  return (
    <div>
      {/* Show banners and category tiles ONLY on default home view */}
      {!isFiltering && (
        <>
          <HeroCarousel />
          <CategoryShowcase />
          <PromoVoucherStrip />
        </>
      )}

      {/* Filter Mode Header Banner */}
      {isFiltering && (
        <div style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0', padding: '2rem 1.5rem', marginBottom: '2.5rem' }}>
          <div style={{ maxWidth: '1280px', margin: '0 auto', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span style={{ fontSize: '0.8rem', fontWeight: 800, color: '#e11d48', letterSpacing: '1px' }}>FILTERED VIEW</span>
              <h1 style={{ fontSize: '2rem', fontWeight: 900, margin: '0.2rem 0', color: '#0f172a' }}>{getFilterLabel()}</h1>
              <p style={{ margin: 0, color: '#64748b', fontSize: '0.9rem' }}>Showing genuine footwear matching your selection</p>
            </div>
            <Link
              to="/"
              style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', background: '#fff', border: '1px solid #cbd5e1', padding: '0.6rem 1.2rem', borderRadius: '8px', color: '#0f172a', fontWeight: 700, textDecoration: 'none', fontSize: '0.85rem' }}
            >
              <X size={16} /> Clear Filter
            </Link>
          </div>
        </div>
      )}

      {loading ? (
        <div style={{ padding: '5rem', textAlign: 'center', color: '#6b7280' }}>Loading matching footwear...</div>
      ) : products.length === 0 ? (
        <div style={{ maxWidth: '600px', margin: '5rem auto', textAlign: 'center', padding: '2rem' }}>
          <h3 style={{ fontSize: '1.4rem', fontWeight: 800, marginBottom: '0.5rem' }}>No shoes found in this section</h3>
          <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Try choosing another category or browsing our full collection.</p>
          <Link to="/" style={{ padding: '0.8rem 1.5rem', background: '#111827', color: '#fff', borderRadius: '8px', textDecoration: 'none', fontWeight: 700 }}>
            View All Shoes
          </Link>
        </div>
      ) : (
        <>
          {/* On main home, show horizontal sliders */}
          {!isFiltering && (
            <>
              <ProductCarouselSection
                title="BEST SELLERS"
                subtitle="Top customer rated footwear"
                products={bestSellers}
              />

              <ProductCarouselSection
                title="JUST LANDED"
                subtitle="Fresh drops and latest 2026 styles"
                products={newArrivals.length > 0 ? newArrivals : products}
              />
            </>
          )}

          {/* Full Grid of matching products */}
          <section style={{ maxWidth: '1280px', margin: '0 auto 5rem', padding: '0 1.5rem' }}>
            <div style={{ borderTop: isFiltering ? 'none' : '2px solid #f3f4f6', paddingTop: isFiltering ? '0' : '2.5rem', marginBottom: '1.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <h2 style={{ fontSize: '1.6rem', fontWeight: 900, margin: 0 }}>
                  {isFiltering ? 'ALL RESULTS' : 'EXPLORE FULL COLLECTION'}
                </h2>
                <p style={{ color: '#6b7280', fontSize: '0.85rem', margin: '4px 0 0 0' }}>All genuine shoes synced with MySQL database</p>
              </div>
              <span style={{ fontSize: '0.85rem', fontWeight: 700, background: '#f3f4f6', padding: '0.4rem 0.9rem', borderRadius: '4px' }}>
                {products.length} Products Found
              </span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: '1.8rem' }}>
              {products.map((shoe) => (
                <ProductCard key={shoe.id} shoe={shoe} />
              ))}
            </div>
          </section>
        </>
      )}
    </div>
  );
}

export default function App() {
  return (
    <ShopProvider>
      <Router>
        <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
          <Navbar />
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<CartPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
            <Route path="/order-success" element={<OrderSuccess />} />
            <Route path="/track-order" element={<TrackOrder />} />
            <Route path="/wishlist" element={<WishlistPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/faq" element={<FAQPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/returns" element={<ReturnsPage />} />
            <Route path="/login" element={<CustomerLogin />} />
            <Route path="/register" element={<CustomerRegister />} />
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route
              path="/admin"
              element={
                <AdminProtectedRoute>
                  <AdminDashboard />
                </AdminProtectedRoute>
              }
            />
          </Routes>
          <Footer />
        </div>
      </Router>
    </ShopProvider>
  );
}