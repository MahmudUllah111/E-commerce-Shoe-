import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Link } from '@inertiajs/react';
import { ProductCardSkeleton } from '@/Components/Skeleton';
import { useState, useEffect } from 'react';

function formatCurrency(n){ return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n||0)); }

function Card({ p }){
    const img = p.images?.[0]?.image_url || p.images?.[0]?.url || 'https://via.placeholder.com/300?text=No+Image';
    return (
        <Link href={`/product/${p.slug||p.id}`} className="group border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-lg transition text-left" aria-label={`View ${p.name}`}>
            <div className="h-56 bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
                <img src={img} alt={p.name} className="max-h-full object-contain group-hover:scale-105 transition duration-300" loading="lazy" />
                {p.is_new && <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black px-2 py-1 rounded-full">NEW</span>}
                {p.is_on_sale && <span className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-black px-2 py-1 rounded-full">SALE</span>}
            </div>
            <div className="p-4">
                <div className="text-xs font-bold text-gray-500 uppercase tracking-wide">{p.brand?.name}</div>
                <div className="font-bold text-sm mt-1 line-clamp-2 leading-tight">{p.name}</div>
                <div className="flex items-center gap-2 mt-2">
                    <span className="font-black">{formatCurrency(p.price || p.base_price)}</span>
                    {p.original_price && Number(p.original_price)>Number(p.price) && <span className="text-xs text-gray-400 line-through font-semibold">{formatCurrency(p.original_price)}</span>}
                </div>
                <div className="flex items-center gap-1 mt-1 text-amber-400 text-xs">★ {Number(p.rating||0).toFixed(1)} <span className="text-gray-500 font-semibold">({p.reviews_count||0})</span></div>
            </div>
        </Link>
    );
}

function SkeletonGrid(){
    return <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{Array.from({length:6}).map((_,i)=> <ProductCardSkeleton key={i} />)}</div>;
}

export default function Home({ featured, bestSellers, newArrivals, heroSlides = [] }) {
    const has = (arr)=> Array.isArray(arr) && arr.length>0;
    const loading = !featured && !bestSellers;
    const fallbackSlides = [
        {id:1,title:'Summer 2026 Collection',subtitle:'Engineered street-ready cushioning and high-traction silhouettes.',badge:'SUPER SALE',discount_badge:'ENJOY UP TO 30% OFF',cta_text:'Shop Sale',cta_link:'/products?category=sneakers',bg_image:'https://images.unsplash.com/photo-1556906781-9a412961c28c?w=1600&auto=format&fit=crop&q=80',shoe_image:'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&auto=format&fit=crop&q=80'},
        {id:2,title:'Performance & Athletics',subtitle:'Lightweight breathable mesh engineered for marathon endurance and daily training.',badge:'URBAN ESSENTIALS',discount_badge:'FLAT 15% OFF',cta_text:'Explore Running',cta_link:'/products?category=running',bg_image:'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=1600&auto=format&fit=crop&q=80',shoe_image:'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=900&auto=format&fit=crop&q=80'},
        {id:3,title:'Crafted For Modern Comfort',subtitle:'Premium materials and cloud-soft insoles. Use promo code WELCOME10 for 10% off.',badge:'NEW ARRIVALS',discount_badge:'FREE NATIONWIDE DELIVERY',cta_text:'Discover All',cta_link:'/products',bg_image:'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1600&auto=format&fit=crop&q=80',shoe_image:'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=900&auto=format&fit=crop&q=80'},
    ];
    const slides = heroSlides && heroSlides.length ? heroSlides : fallbackSlides;
    const [current,setCurrent]=useState(0);
    useEffect(()=>{
        if(slides.length<=1) return;
        const t=setInterval(()=> setCurrent(c=> (c+1)%slides.length), 4000);
        return ()=> clearInterval(t);
    },[slides.length]);
    const s = slides[current] || fallbackSlides[0];
    return (
        <StorefrontLayout>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-4 sm:pt-6">
                <section className="relative overflow-hidden bg-slate-900 text-white rounded-3xl md:rounded-[2.5rem] shadow-2xl transition-all duration-700 ease-out" aria-label="Hero" style={{backgroundImage: s.bg_image ? `linear-gradient(90deg, rgba(15,23,42,0.92) 0%, rgba(15,23,42,0.6) 50%, rgba(15,23,42,0.3) 100%), url(${s.bg_image})` : undefined, backgroundSize:'cover', backgroundPosition:'center'}}>
                    <div className="px-6 sm:px-10 py-12 md:py-16 grid md:grid-cols-2 gap-10 items-center min-h-[440px]">
                        <div>
                            <div className="flex flex-wrap gap-2 mb-3">
                                {s.badge && <span className="bg-rose-600 text-xs font-black px-3 py-1 rounded-full tracking-wide shadow-sm">{s.badge}</span>}
                                {s.discount_badge && <span className="border border-amber-300 text-amber-300 text-xs font-black px-3 py-1 rounded-full tracking-wide backdrop-blur-sm">{s.discount_badge}</span>}
                            </div>
                            <h1 className="text-4xl md:text-5xl font-black leading-none tracking-tight">{s.title}</h1>
                            <p className="text-slate-200 mt-4 text-sm md:text-base leading-relaxed max-w-xl">{s.subtitle}</p>
                            <div className="flex flex-wrap gap-3 mt-6">
                                <Link href={s.cta_link || '/products'} className="inline-flex px-6 py-3 bg-white text-slate-900 rounded-full font-black hover:bg-gray-100 transition-all shadow-md hover:shadow-lg">{s.cta_text || 'Shop Now'} →</Link>
                                <Link href="/products" className="inline-flex px-6 py-3 border border-white/30 text-white rounded-full font-bold hover:bg-white/10 backdrop-blur-sm transition-all">All Products</Link>
                            </div>
                            <div className="flex items-center gap-6 mt-8 text-xs font-bold text-slate-300">
                                <span>✓ Free returns 30 days</span><span>✓ 4.8★ 12k reviews</span><span>✓ 100% Genuine</span>
                            </div>
                        </div>
                        <div className="relative flex items-center justify-center">
                            <img src={s.shoe_image || 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=900&q=80'} alt={s.title} className="max-h-80 md:max-h-96 object-contain drop-shadow-2xl rotate-[-8deg] hover:rotate-0 transition duration-700" />
                            <div className="absolute -bottom-4 right-6 md:right-10 bg-white text-slate-900 rounded-2xl px-4 py-3 shadow-xl hidden sm:block border border-gray-100">
                                <div className="text-xs font-black text-rose-600">FROM {formatCurrency(69)}</div>
                                <div className="text-sm font-black">Free shipping $100+</div>
                            </div>
                        </div>
                    </div>
                    {/* Dots + controls */}
                    {slides.length>1 && (
                        <>
                            <button onClick={()=> setCurrent(c=> (c-1+slides.length)%slides.length)} aria-label="Previous slide" className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur border border-white/20 flex items-center justify-center text-white text-lg font-bold transition">‹</button>
                            <button onClick={()=> setCurrent(c=> (c+1)%slides.length)} aria-label="Next slide" className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white/10 hover:bg-white/30 backdrop-blur border border-white/20 flex items-center justify-center text-white text-lg font-bold transition">›</button>
                            <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2">
                                {slides.map((_,i)=>(
                                    <button key={i} onClick={()=>setCurrent(i)} aria-label={`Go to slide ${i+1}`} className={`h-2 rounded-full transition-all duration-300 ${i===current ? 'bg-white w-7' : 'bg-white/40 hover:bg-white/70 w-2'}`}></button>
                                ))}
                            </div>
                        </>
                    )}
                </section>
            </div>

            <section className="max-w-7xl mx-auto px-6 py-10" aria-labelledby="best-sellers-title">
                <div className="flex items-center justify-between mb-4">
                    <h2 id="best-sellers-title" className="text-2xl font-black">Best Sellers</h2>
                    <Link href="/products?sort=rating" className="text-sm font-black text-rose-600 hover:text-rose-700">View all →</Link>
                </div>
                {loading ? <SkeletonGrid /> : !has(bestSellers) ? (
                    <div className="border border-dashed rounded-xl p-10 text-center text-sm font-semibold text-gray-500">No best sellers yet — check back soon.</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                        {(bestSellers||[]).map(p=> <Card key={p.id} p={p} />)}
                    </div>
                )}
            </section>

            <section className="max-w-7xl mx-auto px-6 py-6" aria-labelledby="featured-title">
                <div className="flex items-center justify-between mb-4">
                    <h2 id="featured-title" className="text-2xl font-black">Featured</h2>
                    <Link href="/products" className="text-sm font-black text-slate-900 hover:text-rose-600">Shop all →</Link>
                </div>
                {!has(featured) ? (
                    <div className="border border-dashed rounded-xl p-10 text-center text-sm font-semibold text-gray-500">No featured products</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {featured.map(p=> <Card key={p.id} p={p} />)}
                    </div>
                )}
            </section>

            <section className="max-w-7xl mx-auto px-6 py-6" aria-labelledby="new-arrivals-title">
                <div className="flex items-center justify-between mb-4">
                    <h2 id="new-arrivals-title" className="text-2xl font-black">New Arrivals</h2>
                    <Link href="/products?sort=newest" className="text-sm font-black text-slate-900 hover:text-rose-600">See newest →</Link>
                </div>
                {!has(newArrivals) ? (
                    <div className="border border-dashed rounded-xl p-10 text-center text-sm font-semibold text-gray-500">Fresh drops coming soon</div>
                ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                        {newArrivals.map(p=> <Card key={p.id} p={p} />)}
                    </div>
                )}
            </section>

            <section className="max-w-7xl mx-auto px-6 py-10">
                <div className="bg-slate-900 rounded-2xl px-6 py-8 md:px-10 flex flex-col md:flex-row items-center justify-between gap-6 text-white">
                    <div>
                        <h3 className="text-xl font-black">Why TrustedMart?</h3>
                        <p className="text-slate-300 text-sm mt-1 font-semibold">Clean, modern, product-photography-forward — built for every foot.</p>
                    </div>
                    <div className="flex gap-6 text-sm font-bold">
                        <span>🚚 Free shipping</span><span>↩ 30-day returns</span><span>★ Rated 4.8/5</span>
                    </div>
                </div>
            </section>
        </StorefrontLayout>
    );
}
