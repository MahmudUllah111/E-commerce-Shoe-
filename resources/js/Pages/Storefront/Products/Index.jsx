import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { ProductCardSkeleton, Skeleton } from '@/Components/Skeleton';
import toast from 'react-hot-toast';

function formatCurrency(n){ return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n||0)); }

function QuickViewModal({ product, onClose }){
    if(!product) return null;
    const [size,setSize]=useState(product.variants?.[0]||null);
    const [qty,setQty]=useState(1);
    const add=()=>{
        if(!size){ toast.error('Select a size'); return; }
        router.post('/cart/add', {product_id: product.id, variant_id: size.id, quantity: qty}, {
            preserveScroll:true,
            onSuccess:()=> { toast.success('Added to bag'); onClose(); },
            onError:(errs)=> toast.error(Object.values(errs)[0]||'Failed')
        });
    };
    const img = product.images?.[0]?.image_url || product.images?.[0]?.url || 'https://via.placeholder.com/300';
    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40" role="dialog" aria-modal="true" aria-label={`Quick view ${product.name}`} onClick={onClose}>
            <div onClick={e=>e.stopPropagation()} className="bg-white rounded-2xl max-w-2xl w-full overflow-hidden shadow-2xl">
                <div className="grid md:grid-cols-2 gap-0">
                    <div className="bg-gray-50 p-6 flex items-center justify-center relative">
                        <img src={img} alt={product.name} className="max-h-64 object-contain" />
                        {(product.is_on_sale || product.discount_price) && <span className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-black px-2 py-1 rounded-full">SALE</span>}
                    </div>
                    <div className="p-6">
                        <div className="text-xs font-bold text-gray-500 uppercase">{product.brand?.name} • {product.gender}</div>
                        <h3 className="text-xl font-black mt-1">{product.name}</h3>
                        <div className="text-lg font-black mt-2">{formatCurrency(product.price || product.base_price)}</div>
                        <div className="mt-4">
                            <div className="text-xs font-black uppercase text-gray-500 mb-2">Size (US)</div>
                            <div className="flex flex-wrap gap-1.5">
                                {product.variants?.map(v=> (
                                    <button key={v.id} onClick={()=>setSize(v)} className={`px-3 py-1.5 rounded-full border text-xs font-black ${size?.id===v.id?'bg-slate-900 text-white border-slate-900':'bg-white hover:bg-gray-50'} ${v.stock_quantity===0?'opacity-40 line-through':''}`}>US {v.size_value}</button>
                                ))}
                            </div>
                            <div className="text-xs mt-2 font-semibold">{size?.stock_quantity===0 ? <span className="text-rose-600">Out of stock</span> : size?.stock_quantity<=3 ? <span className="text-amber-600">Only {size.stock_quantity} left</span> : <span className="text-emerald-600">In stock</span>}</div>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                            <div className="flex items-center gap-2 border rounded-full px-2 py-1">
                                <button onClick={()=>setQty(q=>Math.max(1,q-1))} className="w-7 h-7 rounded-full hover:bg-gray-100 font-black">−</button>
                                <span className="w-6 text-center font-black text-sm">{qty}</span>
                                <button onClick={()=>setQty(q=>q+1)} className="w-7 h-7 rounded-full hover:bg-gray-100 font-black">+</button>
                            </div>
                            <button onClick={add} disabled={size?.stock_quantity===0} className="flex-1 py-2.5 bg-slate-900 text-white rounded-full font-black text-sm disabled:bg-gray-300">Add to Bag</button>
                        </div>
                        <Link href={`/product/${product.slug||product.id}`} className="mt-3 inline-flex text-xs font-black text-rose-600 hover:text-rose-700">View full details →</Link>
                        <button onClick={onClose} className="mt-2 block text-xs font-bold text-gray-500 hover:text-slate-900">Close</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default function Index({ products = {}, filters = {}, brands = [], categories = [], priceStats = {min:0, max:500}, categoryCounts = {} }) {
    const data = products?.data || (Array.isArray(products) ? products : []);
    const [quick,setQuick]=useState(null);
    const [loading,setLoading]=useState(false);
    const [priceMin,setPriceMin]=useState(filters?.min_price || '');
    const [priceMax,setPriceMax]=useState(filters?.max_price || '');
    const [inStockOnly,setInStockOnly]=useState(filters?.in_stock==='1');
    const [onSaleOnly,setOnSaleOnly]=useState(filters.on_sale==='1');
    const handleSort=(val)=>{
        setLoading(true);
        router.get('/products', {...filters, sort: val}, {preserveState:true, onFinish:()=>setLoading(false)});
    };
    const handleCategory=(slug)=>{
        setLoading(true);
        const next={...filters, category: slug};
        if(slug==='all') delete next.category;
        router.get('/products', next, {preserveState:true, onFinish:()=>setLoading(false)});
    };
    const applyPrice=()=>{
        setLoading(true);
        router.get('/products', {...filters, min_price: priceMin || undefined, max_price: priceMax || undefined}, {preserveState:true, onFinish:()=>setLoading(false)});
    };
    const toggleInStock=()=>{
        const v=!inStockOnly;
        setInStockOnly(v);
        setLoading(true);
        router.get('/products', {...filters, in_stock: v?'1':undefined}, {preserveState:true, onFinish:()=>setLoading(false)});
    };
    const toggleOnSale=()=>{
        const v=!onSaleOnly;
        setOnSaleOnly(v);
        setLoading(true);
        router.get('/products', {...filters, on_sale: v?'1':undefined}, {preserveState:true, onFinish:()=>setLoading(false)});
    };
    const clearAll=()=>{
        setLoading(true);
        router.get('/products', {}, {preserveState:true, onFinish:()=>setLoading(false)});
    };
    return (
        <StorefrontLayout>
            <div className="max-w-7xl mx-auto px-6 py-4">
                {(filters.category || filters.gender || filters.brand || filters.search || filters.min_price || filters.max_price || filters.in_stock || filters.on_sale) && (
                    <div className="flex flex-wrap items-center gap-2 text-sm mb-4">
                        {filters.category && <span className="px-3 py-1 bg-slate-900 text-white rounded-full font-bold text-xs flex items-center gap-1">Category: {filters.category} <button onClick={()=>handleCategory('all')} className="ml-1 hover:text-rose-300">✕</button></span>}
                        {filters.gender && <span className="px-3 py-1 bg-slate-900 text-white rounded-full font-bold text-xs flex items-center gap-1">Gender: {filters.gender}</span>}
                        {filters.search && <span className="px-3 py-1 bg-slate-900 text-white rounded-full font-bold text-xs flex items-center gap-1">Search: {filters.search}</span>}
                        <button onClick={clearAll} className="text-xs font-bold text-rose-600 hover:text-rose-700 underline">Clear all filters</button>
                    </div>
                )}
            </div>
            <div className="max-w-7xl mx-auto px-6 pb-8">
                <div className="flex flex-col sm:flex-row justify-between gap-3 items-start sm:items-center mb-6">
                    <h1 className="text-3xl font-black">All Products <span className="text-sm font-bold text-gray-500">({products.total ?? data.length})</span></h1>
                    <div className="flex items-center gap-2">
                        <label htmlFor="sort" className="text-xs font-black uppercase text-gray-500">Sort</label>
                        <select id="sort" onChange={e=> handleSort(e.target.value)} value={filters.sort||'newest'} className="border border-gray-300 rounded-full px-3 py-2 text-sm font-bold bg-white">
                            <option value="newest">Newest</option>
                            <option value="price_low">Price Low-High</option>
                            <option value="price_high">Price High-Low</option>
                            <option value="rating">Highest Rated</option>
                        </select>
                    </div>
                </div>
                <div className="grid md:grid-cols-[280px_1fr] gap-6">
                    <aside className="bg-white border border-gray-200 rounded-xl p-4 h-fit sticky top-20 space-y-6" aria-label="Filters">
                        <div className="flex justify-between items-center">
                            <div className="flex items-center gap-2 font-black"><span className="text-lg">⚙</span> Filters</div>
                            <button onClick={clearAll} className="text-xs font-bold text-red-600 hover:text-red-700">Clear all</button>
                        </div>

                        {/* Categories - Kizora style with counts & nested */}
                        <div>
                            <div className="text-xs font-black uppercase text-gray-700 mb-2">Categories</div>
                            <div className="space-y-1">
                                <button onClick={()=>handleCategory('all')} className={`flex justify-between w-full text-left px-3 py-2 rounded-lg text-sm font-bold ${!filters.category || filters.category==='all' ?'bg-slate-900 text-white':'text-gray-700 hover:bg-gray-50'}`}>
                                    <span className="flex items-center gap-2">▦ All products</span>
                                    <span className="text-xs font-bold opacity-60">{products.total ?? 20}</span>
                                </button>
                                {categories?.map(c=> {
                                    const count = categoryCounts?.[c.slug] ?? categoryCounts?.[c.id] ?? '';
                                    return (
                                        <button key={c.id} onClick={()=>handleCategory(c.slug)} className={`flex justify-between w-full text-left px-3 py-2 rounded-lg text-sm font-bold ${filters.category===c.slug?'bg-slate-900 text-white':'text-gray-700 hover:bg-gray-50'}`}>
                                            <span>{c.name}</span>
                                            <span className="text-xs opacity-60">{count}</span>
                                        </button>
                                    );
                                })}
                                {/* Gender as categories for Men/Women/Kids */}
                                <div className="pt-2 mt-2 border-t">
                                    <div className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-1">By Gender</div>
                                    {['Men','Women','Kids'].map(g=>(
                                        <button key={g} onClick={()=>{ setLoading(true); router.get('/products', {...filters, gender: g}, {preserveState:true, onFinish:()=>setLoading(false)}); }} className={`flex justify-between w-full text-left px-3 py-1.5 rounded-lg text-sm font-semibold ${filters.gender===g?'bg-rose-50 text-rose-700 border border-rose-200':'text-gray-600 hover:bg-gray-50'}`}>{g} <span className="text-xs">›</span></button>
                                    ))}
                                </div>
                            </div>
                        </div>

                        {/* Price */}
                        <div>
                            <div className="text-xs font-black uppercase text-gray-700 mb-2">Price ($)</div>
                            <div className="flex items-center gap-2">
                                <div className="flex items-center gap-1 flex-1">
                                    <span className="text-xs font-bold text-gray-500">$</span>
                                    <input type="number" value={priceMin} onChange={e=>setPriceMin(e.target.value)} placeholder="50" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm font-bold" />
                                </div>
                                <span className="text-gray-400">–</span>
                                <div className="flex items-center gap-1 flex-1">
                                    <span className="text-xs font-bold text-gray-500">$</span>
                                    <input type="number" value={priceMax} onChange={e=>setPriceMax(e.target.value)} placeholder="250" className="w-full px-2 py-1.5 border border-gray-200 rounded-lg text-sm font-bold" />
                                </div>
                            </div>
                            <button onClick={applyPrice} className="mt-2 w-full py-1.5 bg-slate-900 text-white rounded-lg text-xs font-bold hover:bg-black">Apply Price</button>
                            {priceStats && <div className="text-[11px] text-gray-500 mt-1">Range ${priceStats.min} – ${priceStats.max}</div>}
                        </div>

                        {/* Availability */}
                        <div>
                            <div className="text-xs font-black uppercase text-gray-700 mb-2">Availability</div>
                            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer">
                                <input type="checkbox" checked={inStockOnly} onChange={toggleInStock} className="rounded border-gray-300 text-slate-900 focus:ring-slate-900" />
                                In stock only
                            </label>
                            <label className="flex items-center gap-2 text-sm font-semibold cursor-pointer mt-1">
                                <input type="checkbox" checked={onSaleOnly} onChange={toggleOnSale} className="rounded border-gray-300 text-slate-900 focus:ring-slate-900" />
                                On sale
                            </label>
                        </div>

                        {/* Features / Brands / Attributes */}
                        <div>
                            <div className="text-xs font-black uppercase text-gray-700 mb-2">Features</div>
                            <div className="flex flex-wrap gap-1.5">
                                {brands?.map(b=> (
                                    <button key={b.id} onClick={()=>{ setLoading(true); router.get('/products', {...filters, brand: b.slug}, {preserveState:true, onFinish:()=>setLoading(false)}); }} className={`px-3 py-1.5 border rounded-full text-xs font-bold ${filters.brand===b.slug?'bg-slate-900 text-white border-slate-900':'bg-white hover:bg-gray-50'}`}>{b.name}</button>
                                ))}
                            </div>
                        </div>

                        {loading && <div className="space-y-2"><Skeleton className="h-6"/><Skeleton className="h-6"/><Skeleton className="h-6"/></div>}
                    </aside>
                    <div>
                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {Array.from({length:6}).map((_,i)=> <ProductCardSkeleton key={i} />)}
                            </div>
                        ) : data.length===0 ? (
                            <div className="border border-dashed rounded-xl p-10 text-center">
                                <div className="text-2xl mb-2">🔍</div>
                                <h3 className="font-black">No products found</h3>
                                <p className="text-sm text-gray-500 font-semibold mt-1">Try adjusting filters or search</p>
                                <Link href="/products" className="inline-flex mt-4 px-5 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm">Clear filters</Link>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                                {data.map(p=> {
                                    const primaryImg = p.images?.find(i => i.is_primary);
                                    const img = primaryImg?.image_url || primaryImg?.url || p.images?.[0]?.image_url || p.images?.[0]?.url || 'https://via.placeholder.com/300?text=Shoe';
                                    return (
                                        <div key={p.id} className="group border border-gray-200 rounded-xl overflow-hidden bg-white hover:shadow-md transition flex flex-col">
                                            <Link href={`/product/${p.slug||p.id}`} className="h-56 bg-gray-50 flex items-center justify-center p-4 relative overflow-hidden">
                                                <img src={img} alt={p.name} className="max-h-full object-contain group-hover:scale-105 transition duration-300" loading="lazy" />
                                                {p.is_new && <span className="absolute top-3 left-3 bg-emerald-600 text-white text-[10px] font-black px-2 py-1 rounded-full">NEW</span>}
                                                {(p.is_on_sale || p.discount_price) && <span className="absolute top-3 right-3 bg-rose-600 text-white text-[10px] font-black px-2 py-1 rounded-full">SALE</span>}
                                            </Link>
                                            <div className="p-4 flex-1 flex flex-col">
                                                <Link href={`/product/${p.slug||p.id}`} className="font-bold text-sm line-clamp-2 hover:text-rose-600">{p.name}</Link>
                                                <div className="text-xs text-gray-500 font-semibold">{p.brand?.name} • {p.category?.name}</div>
                                                <div className="font-black mt-1">{formatCurrency(p.price||p.base_price)}</div>
                                                <div className="mt-3 flex gap-2">
                                                    <Link href={`/product/${p.slug||p.id}`} className="flex-1 text-center py-2 border rounded-full text-xs font-black hover:bg-slate-900 hover:text-white">View</Link>
                                                    <button onClick={()=>setQuick(p)} className="flex-1 py-2 bg-gray-100 rounded-full text-xs font-black hover:bg-gray-200">Quick View</button>
                                                </div>
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                        {products.links && !loading && (
                            <nav aria-label="Pagination" className="flex gap-1 justify-center mt-6 flex-wrap">
                                {products.links.map((l,i)=> (
                                    <Link key={i} href={l.url||'#'} dangerouslySetInnerHTML={{__html:l.label}} className={`px-3 py-1.5 border rounded-full text-sm font-bold ${l.active?'bg-slate-900 text-white border-slate-900':'bg-white hover:bg-gray-50'} ${!l.url?'opacity-40 pointer-events-none':''}`} />
                                ))}
                            </nav>
                        )}
                    </div>
                </div>
            </div>
            {quick && <QuickViewModal product={quick} onClose={()=>setQuick(null)} />}
        </StorefrontLayout>
    );
}
