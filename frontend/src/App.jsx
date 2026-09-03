import React, { useState, useEffect, useRef } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation, Navigate, useNavigate } from 'react-router-dom';
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
import { getProducts, getBrands } from './services/api';
import { ChevronLeft, ChevronRight, ArrowRight, Tag, CreditCard, ShieldCheck, X, ShoppingBag, Star, SlidersHorizontal, ArrowUpDown } from 'lucide-react';

function AdminProtectedRoute({ children }) {
  const { currentUser } = useShop();
  if (!currentUser || currentUser.role !== 'admin') {
    return <Navigate to="/admin/login" replace />;
  }
  return children;
}

// Hero Carousel for Landing Page
function HeroCarousel() {
  const slides = [
    {
      saleBadge: 'SUPER SALE',
      discountBadge: 'ENJOY UP TO 30% OFF',
      title: 'Summer 2026 Collection',
      subtitle: 'Engineered street-ready cushioning and high-traction performance silhouettes.',
      ctaText: 'Shop Sale',
      ctaLink: '/products?category=sneakers',
      bgImg: 'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&auto=format&fit=crop&q=80',
      shoeImg: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80',
    },
    {
      saleBadge: 'URBAN ESSENTIALS',
      discountBadge: 'FLAT 15% OFF',
      title: 'Performance & Athletics',
      subtitle: 'Lightweight breathable mesh for maximum comfort all day long.',
      ctaText: 'Explore Sports',
      ctaLink: '/products?category=sports',
      bgImg: 'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=1600&auto=format&fit=crop&q=80',
      shoeImg: 'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&auto=format&fit=crop&q=80',
    },
    {
      saleBadge: 'NEW ARRIVALS',
      discountBadge: 'FREE EXPRESS SHIPPING',
      title: 'Crafted For Modern Comfort',
      subtitle: 'Use promo code WELCOME10 at checkout on orders over $100.',
      ctaText: 'Discover All',
      ctaLink: '/products',
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
    </div>
  );
}

// Category Cards
function CategoryShowcase() {
  const categories = [
    { title: "MEN'S COLLECTION", link: '/products?gender=Men', img: 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=600&auto=format&fit=crop&q=80' },
    { title: "WOMEN'S COLLECTION", link: '/products?gender=Women', img: 'https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=600&auto=format&fit=crop&q=80' },
    { title: "KIDS' COLLECTION", link: '/products?gender=Kids', img: 'https://images.unsplash.com/photo-1514989940723-e8e51635b782?w=600&auto=format&fit=crop&q=80' },
    { title: "SNEAKER STUDIO", link: '/products?category=sneakers', img: 'https://images.unsplash.com/photo-1552346154-21d32810aba3?w=600&auto=format&fit=crop&q=80' },
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

// Promo Voucher Strip
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

// Kizora-Style Product Card
function KizoraProductCard({ shoe }) {
  const { addToCart } = useShop();
  const navigate = useNavigate();

  const imgSource = shoe.images?.[0]?.startsWith('http')
    ? shoe.images[0]
    : 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600';

  const handleQuickAdd = (e) => {
    e.preventDefault();
    e.stopPropagation();
    const availableVariant = shoe.variants?.find((v) => v.stock_quantity > 0) || shoe.variants?.[0];
    if (availableVariant) {
      addToCart(shoe, availableVariant, 1);
    } else {
      navigate(`/product/${shoe.id}`);
    }
  };

  const sku = `SHOE-${String(shoe.id).padStart(3, '0')}`;

  return (
    <div
      style={{
        background: '#fff',
        borderRadius: '16px',
        border: '1px solid #eef0f2',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 4px 14px rgba(0,0,0,0.03)',
        transition: 'transform 0.15s, box-shadow 0.15s',
      }}
    >
      <Link to={`/product/${shoe.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
        <div style={{ height: '230px', background: '#fafafa', position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          {shoe.is_new === 1 && (
            <span style={{ position: 'absolute', top: '12px', left: '12px', background: '#0f172a', color: '#fff', fontSize: '0.65rem', fontWeight: 800, padding: '0.2rem 0.6rem', borderRadius: '4px', letterSpacing: '0.5px' }}>
              NEW
            </span>
          )}
          <img
            src={imgSource}
            alt={shoe.name}
            style={{ maxHeight: '85%', maxWidth: '85%', objectFit: 'contain' }}
            onError={(e) => {
              e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=600';
            }}
          />
        </div>

        <div style={{ padding: '1.25rem' }}>
          {/* Rating & Category Tag */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.45rem' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.8rem', color: '#f59e0b', fontWeight: 700 }}>
              <Star size={13} fill="#f59e0b" />
              <span>{shoe.rating}</span>
              <span style={{ color: '#94a3b8', fontWeight: 500 }}>({shoe.reviews_count || 12})</span>
            </div>
            <span style={{ background: '#f1f5f9', color: '#475569', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
              {shoe.category_name || 'Sneakers'}
            </span>
          </div>

          {/* Title */}
          <h3 style={{ fontSize: '1rem', fontWeight: 800, color: '#0f172a', margin: '0 0 0.2rem', lineHeight: 1.35 }}>
            {shoe.name}
          </h3>

          {/* SKU */}
          <div style={{ fontSize: '0.72rem', color: '#94a3b8', fontWeight: 600, marginBottom: '1rem' }}>
            SKU: {sku}
          </div>

          {/* Price & Add to Cart Button */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 'auto' }}>
            <div>
              <span style={{ fontSize: '1.2rem', fontWeight: 900, color: '#0f172a' }}>
                ${Number(shoe.price).toFixed(2)}
              </span>
              {shoe.original_price && (
                <span style={{ fontSize: '0.8rem', textDecoration: 'line-through', color: '#94a3b8', marginLeft: '6px' }}>
                  ${Number(shoe.original_price).toFixed(2)}
                </span>
              )}
            </div>

            <button
              onClick={handleQuickAdd}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '6px',
                background: '#0f172a',
                color: '#fff',
                border: 'none',
                padding: '0.55rem 1rem',
                borderRadius: '8px',
                fontWeight: 700,
                fontSize: '0.8rem',
                cursor: 'pointer',
              }}
            >
              <ShoppingBag size={14} /> Add to Cart
            </button>
          </div>
        </div>
      </Link>
    </div>
  );
}

// Horizontal Carousel for Home Page
function ProductCarouselSection({ title, subtitle, products }) {
  const scrollRef = useRef(null);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -310 : 310;
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
            <KizoraProductCard shoe={shoe} />
          </div>
        ))}
      </div>
    </section>
  );
}

// 1. CLEAN HOMEPAGE (Route: '/')
function HomePage() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getProducts()
      .then((res) => {
        setProducts(res.data || []);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load shoes:', err);
        setLoading(false);
      });
  }, []);

  const bestSellers = [...products].sort((a, b) => b.rating - a.rating);
  const newArrivals = [...products].filter((p) => p.is_new === 1 || p.id % 2 === 0);

  return (
    <div>
      <HeroCarousel />
      <CategoryShowcase />
      <PromoVoucherStrip />

      {loading ? (
        <div style={{ padding: '4rem', textAlign: 'center', color: '#6b7280' }}>Loading products...</div>
      ) : (
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
    </div>
  );
}

// 2. KIZORA-STYLE ALL PRODUCTS & CATEGORIES PAGE (Route: '/products')
function ProductsPage() {
  const [products, setProducts] = useState([]);
  const [brands, setBrands] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 6; // 6 products per page = 2 rows of 3 columns

  const location = useLocation();
  const navigate = useNavigate();

  const params = new URLSearchParams(location.search);
  const categoryFilter = params.get('category') || 'all';
  const genderFilter = params.get('gender') || 'all';
  const brandFilter = params.get('brand') || 'all';
  const searchFilter = params.get('search') || '';
  const sortOption = params.get('sort') || 'newest';

  const [priceMin, setPriceMin] = useState(params.get('min_price') || '');
  const [priceMax, setPriceMax] = useState(params.get('max_price') || '');
  const [inStockOnly, setInStockOnly] = useState(params.get('in_stock') === 'true');

  useEffect(() => {
    getBrands().then((res) => setBrands(res || [])).catch(() => {});
  }, []);

  useEffect(() => {
    setLoading(true);
    setCurrentPage(1);

    const filterParams = {
      category: categoryFilter !== 'all' ? categoryFilter : undefined,
      gender: genderFilter !== 'all' ? genderFilter : undefined,
      brand: brandFilter !== 'all' ? brandFilter : undefined,
      search: searchFilter || undefined,
      sort: sortOption,
    };

    getProducts(filterParams)
      .then((res) => {
        let items = res.data || [];

        if (priceMin) {
          items = items.filter((p) => Number(p.price) >= Number(priceMin));
        }
        if (priceMax) {
          items = items.filter((p) => Number(p.price) <= Number(priceMax));
        }
        if (inStockOnly) {
          items = items.filter((p) => p.variants && p.variants.some((v) => v.stock_quantity > 0));
        }

        setProducts(items);
        setLoading(false);
      })
      .catch((err) => {
        console.error('Failed to load products:', err);
        setLoading(false);
      });
  }, [location.search, categoryFilter, genderFilter, brandFilter, searchFilter, sortOption, priceMin, priceMax, inStockOnly]);

  const updateParam = (key, value) => {
    const next = new URLSearchParams(location.search);
    if (value && value !== 'all') {
      next.set(key, value);
    } else {
      next.delete(key);
    }
    navigate(`/products?${next.toString()}`);
  };

  // Pagination calculation
  const totalPages = Math.ceil(products.length / itemsPerPage);
  const indexOfLastProduct = currentPage * itemsPerPage;
  const indexOfFirstProduct = indexOfLastProduct - itemsPerPage;
  const currentProducts = products.slice(indexOfFirstProduct, indexOfLastProduct);

  const paginate = (pageNumber) => {
    setCurrentPage(pageNumber);
    window.scrollTo({ top: 120, behavior: 'smooth' });
  };

  const categoriesList = [
    { label: 'All products', value: 'all', count: products.length },
    { label: 'Sneakers', value: 'sneakers' },
    { label: 'Sports', value: 'sports' },
    { label: 'Men', value: 'Men', isGender: true },
    { label: 'Women', value: 'Women', isGender: true },
    { label: 'Kids', value: 'Kids', isGender: true },
  ];

  return (
    <div style={{ maxWidth: '1280px', margin: '2rem auto 5rem', padding: '0 1.5rem' }}>
      {/* Kizora Catalog Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>All Products</h1>
          <p style={{ margin: '6px 0 0 0', color: '#64748b', fontSize: '0.9rem' }}>
            {products.length} products
          </p>
        </div>

        {/* Sort by Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600 }}>Sort</span>
          <div style={{ border: '1px solid #e2e8f0', borderRadius: '8px', padding: '0.4rem 0.8rem', background: '#fff' }}>
            <select
              value={sortOption}
              onChange={(e) => updateParam('sort', e.target.value)}
              style={{ border: 'none', background: 'transparent', fontWeight: 700, fontSize: '0.85rem', color: '#0f172a', outline: 'none', cursor: 'pointer' }}
            >
              <option value="newest">Newest</option>
              <option value="price_low">Price: Low to High</option>
              <option value="price_high">Price: High to Low</option>
              <option value="rating">Highest Rated</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Layout: Left Kizora Sidebar + 3-Column Product Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: '250px 1fr', gap: '2.5rem', alignItems: 'start' }}>
        {/* Left Kizora Sidebar */}
        <aside style={{ background: '#fff', border: '1px solid #f1f5f9', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 10px rgba(0,0,0,0.02)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem' }}>
            <SlidersHorizontal size={18} color="#0f172a" />
            <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 800 }}>Filters</h3>
          </div>

          {/* Categories List */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.8rem' }}>
              CATEGORIES
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {categoriesList.map((cat) => {
                const isActive = cat.isGender ? genderFilter === cat.value : categoryFilter === cat.value;
                return (
                  <button
                    key={cat.value}
                    onClick={() => {
                      if (cat.isGender) {
                        updateParam('gender', cat.value);
                      } else {
                        updateParam('category', cat.value);
                      }
                    }}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '0.65rem 0.9rem',
                      borderRadius: '8px',
                      border: 'none',
                      background: isActive ? '#0f172a' : 'transparent',
                      color: isActive ? '#fff' : '#475569',
                      fontWeight: isActive ? 700 : 500,
                      fontSize: '0.85rem',
                      textAlign: 'left',
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                  >
                    {cat.value === 'all' && (
                      <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: isActive ? '#fff' : '#94a3b8' }} />
                    )}
                    {cat.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Brand Filter */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.8rem' }}>
              BRAND
            </div>
            <select
              value={brandFilter}
              onChange={(e) => updateParam('brand', e.target.value)}
              style={{ width: '100%', padding: '0.55rem', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}
            >
              <option value="all">All Brands</option>
              {brands.map((b) => (
                <option key={b.id} value={b.slug}>{b.name}</option>
              ))}
            </select>
          </div>

          {/* Price Range Filter */}
          <div style={{ marginBottom: '2rem' }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.8rem' }}>
              PRICE ($)
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '0.6rem' }}>
              <input
                type="number"
                placeholder="$ Min"
                value={priceMin}
                onChange={(e) => setPriceMin(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
              />
              <input
                type="number"
                placeholder="$ Max"
                value={priceMax}
                onChange={(e) => setPriceMax(e.target.value)}
                style={{ width: '100%', padding: '0.5rem', borderRadius: '6px', border: '1px solid #e2e8f0', fontSize: '0.85rem' }}
              />
            </div>
          </div>

          {/* Availability */}
          <div>
            <div style={{ fontSize: '0.75rem', fontWeight: 800, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '0.8rem' }}>
              AVAILABILITY
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', fontSize: '0.85rem', fontWeight: 600, color: '#334155' }}>
              <input
                type="checkbox"
                checked={inStockOnly}
                onChange={(e) => setInStockOnly(e.target.checked)}
                style={{ width: '16px', height: '16px' }}
              />
              In stock only
            </label>
          </div>
        </aside>

        {/* Right Section: 3-Column Product Grid & Numbered Pagination */}
        <main>
          {loading ? (
            <div style={{ padding: '5rem', textAlign: 'center', color: '#6b7280' }}>Loading products...</div>
          ) : products.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '5rem 2rem', background: '#f8fafc', borderRadius: '16px', border: '1px dashed #cbd5e1' }}>
              <h3 style={{ fontSize: '1.3rem', fontWeight: 800, marginBottom: '0.5rem' }}>No shoes matched your filters</h3>
              <p style={{ color: '#6b7280', marginBottom: '1.5rem' }}>Try choosing another category or clearing your search filters.</p>
              <button
                onClick={() => navigate('/products')}
                style={{ padding: '0.75rem 1.6rem', background: '#0f172a', color: '#fff', borderRadius: '8px', border: 'none', fontWeight: 700, cursor: 'pointer' }}
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            <>
              {/* 3 Columns Grid exactly as shown in screenshot */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '1.8rem' }}>
                {currentProducts.map((shoe) => (
                  <KizoraProductCard key={shoe.id} shoe={shoe} />
                ))}
              </div>

              {/* Kizora-Style Numbered Pagination Bar */}
              {totalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '6px', marginTop: '3.5rem', flexWrap: 'wrap' }}>
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                      color: currentPage === 1 ? '#cbd5e1' : '#475569',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                    }}
                  >
                    « Previous
                  </button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                    <button
                      key={number}
                      onClick={() => paginate(number)}
                      style={{
                        width: '36px',
                        height: '36px',
                        borderRadius: '8px',
                        border: '1px solid #e2e8f0',
                        background: currentPage === number ? '#0f172a' : '#fff',
                        color: currentPage === number ? '#fff' : '#475569',
                        fontSize: '0.85rem',
                        fontWeight: 700,
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      {number}
                    </button>
                  ))}

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    style={{
                      padding: '0.45rem 0.9rem',
                      borderRadius: '8px',
                      border: '1px solid #e2e8f0',
                      background: '#fff',
                      color: currentPage === totalPages ? '#cbd5e1' : '#475569',
                      fontSize: '0.85rem',
                      fontWeight: 600,
                      cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                    }}
                  >
                    Next »
                  </button>
                </div>
              )}
            </>
          )}
        </main>
      </div>
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
            <Route path="/" element={<HomePage />} />
            <Route path="/products" element={<ProductsPage />} />
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