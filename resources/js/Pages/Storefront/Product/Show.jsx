import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { useState, useMemo } from 'react';
import { Link, router, usePage, useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';

function getStockStatus(variant) {
    if (!variant) return { text: 'Select a variant', cls: 'text-gray-500', dot: 'bg-gray-400' };
    if (variant.stock_quantity === 0) return { text: `Out of stock in US ${variant.size_value}`, cls: 'text-red-600 font-bold', dot: 'bg-red-600' };
    if (variant.stock_quantity <= 3) return { text: `Only ${variant.stock_quantity} left in ${variant.color_name}`, cls: 'text-amber-600 font-bold', dot: 'bg-amber-500' };
    return { text: `In Stock — ${variant.stock_quantity} units available`, cls: 'text-emerald-600 font-bold', dot: 'bg-emerald-500' };
}

function VariantSizeCircle({ sizeValue, inStock, selected, onClick, disabled }) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={`Size US ${sizeValue}${disabled ? ' out of stock' : ''}`}
            title={`US ${sizeValue}${disabled ? ' — out of stock' : ''}`}
            className={`
                relative w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-black transition
                ${selected ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'bg-white text-slate-900 border-gray-300 hover:border-slate-900'}
                ${disabled ? 'opacity-50 cursor-not-allowed line-through decoration-2 decoration-red-500' : 'cursor-pointer'}
            `}
        >
            {sizeValue}
        </button>
    );
}

function VariantColorSwatch({ colorName, colorHex, inStock, selected, onClick, disabled }) {
    const hex = colorHex || '#111111';
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled}
            aria-label={`${colorName}${disabled ? ' out of stock' : ''}`}
            title={`${colorName}${disabled ? ' — out of stock' : ''}`}
            className={`
                relative w-10 h-10 rounded-full border-2 flex items-center justify-center transition
                ${selected ? 'border-slate-900 shadow-md scale-110' : 'border-gray-300 hover:border-slate-900'}
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
            `}
        >
            <span
                className="w-6 h-6 rounded-full border border-gray-200 inline-block"
                style={{ backgroundColor: hex }}
            />
            {disabled && (
                <span className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="w-full h-0.5 bg-red-500 rotate-45" />
                </span>
            )}
        </button>
    );
}

export default function Show({ product, reviewsMeta, canReview, related=[] }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const avg = reviewsMeta?.average || 0;
    const count = reviewsMeta?.count || 0;
    const breakdown = reviewsMeta?.breakdown || {};
    const primaryImg = product?.images?.find(i => i.is_primary);
    const initialThumb = primaryImg?.image_url || primaryImg?.url || product?.images?.[0]?.image_url || product?.images?.[0]?.url || 'https://via.placeholder.com/600?text=Shoe';
    const [activeImage, setActiveImage] = useState(initialThumb);
    const [qty, setQty] = useState(1);
    const [wishLoading, setWishLoading] = useState(false);

    // Image zoom state
    const [zoomStyle, setZoomStyle] = useState({});
    const [lightboxOpen, setLightboxOpen] = useState(false);
    const [isHovering, setIsHovering] = useState(false);

    // Variant selection
    const variants = product?.variants || [];
    const [selectedVariant, setSelectedVariant] = useState(() => {
        const first = variants.find(v => v.stock_quantity > 0) || variants[0] || null;
        return first;
    });

    const allSizes = useMemo(() => {
        const sizes = [...new Set(variants.map(v => v.size_value))];
        return sizes.sort((a, b) => Number(a) - Number(b));
    }, [variants]);

    const allColors = useMemo(() => {
        const seen = new Set();
        const colors = [];
        for (const v of variants) {
            if (!seen.has(v.color_name)) {
                seen.add(v.color_name);
                colors.push(v);
            }
        }
        return colors;
    }, [variants]);

    const selectedSize = selectedVariant?.size_value || null;
    const selectedColor = selectedVariant?.color_name || null;

    const sizeAvailability = useMemo(() => {
        const map = {};
        for (const size of allSizes) {
            const hasAnyInStock = variants.some(v => v.size_value === size && v.stock_quantity > 0);
            const availableForColor = selectedColor
                ? variants.some(v => v.size_value === size && v.color_name === selectedColor && v.stock_quantity > 0)
                : hasAnyInStock;
            map[size] = { availableForColor, hasAnyInStock };
        }
        return map;
    }, [allSizes, variants, selectedColor]);

    const colorAvailability = useMemo(() => {
        const map = {};
        for (const c of allColors) {
            const hasAnyInStock = variants.some(v => v.color_name === c.color_name && v.stock_quantity > 0);
            const availableForSize = selectedSize
                ? variants.some(v => v.color_name === c.color_name && v.size_value === selectedSize && v.stock_quantity > 0)
                : hasAnyInStock;
            map[c.color_name] = { availableForSize, hasAnyInStock, hex: c.color_hex };
        }
        return map;
    }, [allColors, variants, selectedSize]);

    const selectSize = (sizeValue) => {
        const candidates = variants.filter(v => v.size_value === sizeValue);
        let target = null;
        if (selectedColor) {
            target = candidates.find(v => v.color_name === selectedColor && v.stock_quantity > 0) || candidates[0];
        } else {
            target = candidates.find(v => v.stock_quantity > 0) || candidates[0];
        }
        setSelectedVariant(target);
    };

    const selectColor = (colorName) => {
        const candidates = variants.filter(v => v.color_name === colorName);
        let target = null;
        if (selectedSize) {
            target = candidates.find(v => v.size_value === selectedSize && v.stock_quantity > 0) || candidates[0];
        } else {
            target = candidates.find(v => v.stock_quantity > 0) || candidates[0];
        }
        setSelectedVariant(target);
        setQty(1);
    };

    const stockStatus = getStockStatus(selectedVariant);
    const isOos = selectedVariant?.stock_quantity === 0;
    const displayPrice = Number(selectedVariant?.price || product?.price || product?.base_price || 0);

    const toggleWishlist = () => {
        if (!user) { toast.error('Please sign in to use wishlist'); return; }
        setWishLoading(true);
        router.post(route('wishlist.toggle'), { product_id: product.id }, {
            preserveScroll: true,
            onSuccess: () => { toast.success('Wishlist updated'); router.reload({ only: ['wishlistCount'] }); },
            onError: () => toast.error('Failed'),
            onFinish: () => setWishLoading(false)
        });
    };

    const addToBag = () => {
        if (!selectedVariant) { toast.error('Select a size and color'); return; }
        if (isOos) { toast.error('This variant is out of stock'); return; }
        router.post('/cart/add', {product_id: product.id, variant_id: selectedVariant.id, quantity: qty}, {
            preserveScroll:true,
            onSuccess:()=> toast.success('Added to bag'),
            onError:(errs)=> toast.error(Object.values(errs)[0]||'Failed')
        });
    };

    const reviewForm = useForm({ rating:5, comment:'' });
    const submitReview = (e)=>{
        e.preventDefault();
        reviewForm.post(route('products.reviews.store', product.id), {
            preserveScroll:true,
            onSuccess:()=> { toast.success('Review submitted — pending approval'); reviewForm.reset(); },
            onError:(errs)=> toast.error(Object.values(errs)[0] || 'Failed to submit')
        });
    };

    // Zoom handlers
    const handleMouseMove = (e) => {
        if (!isHovering) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        setZoomStyle({
            transformOrigin: `${x}% ${y}%`,
            transform: 'scale(2.5)',
        });
    };

    const handleMouseEnter = () => setIsHovering(true);
    const handleMouseLeave = () => { setIsHovering(false); setZoomStyle({}); };

    return (
        <StorefrontLayout>
            <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">
                {/* Image Gallery + Zoom */}
                <div>
                    <div
                        className="relative bg-gray-50 rounded-2xl overflow-hidden cursor-zoom-in select-none"
                        style={{ aspectRatio: '1 / 1' }}
                        onMouseMove={handleMouseMove}
                        onMouseEnter={handleMouseEnter}
                        onMouseLeave={handleMouseLeave}
                        onClick={() => setLightboxOpen(true)}
                    >
                        <img
                            src={activeImage}
                            alt={product.name}
                            className="w-full h-full object-contain transition-transform duration-150 ease-out"
                            style={zoomStyle}
                            draggable={false}
                        />
                        {isHovering && (
                            <div className="absolute bottom-3 right-3 bg-black/60 text-white text-[10px] font-bold px-2 py-1 rounded-full pointer-events-none">
                                Hover to zoom
                            </div>
                        )}
                    </div>
                    <div className="flex gap-2 overflow-x-auto mt-3 pb-1">
                        {product.images?.map((img, idx)=>{
                            const src = img.image_url || img.url;
                            return (
                                <button
                                    key={idx}
                                    type="button"
                                    onClick={()=> setActiveImage(src)}
                                    className={`w-20 h-20 rounded-xl border p-1 bg-white flex items-center justify-center transition ${activeImage===src ? 'border-slate-900 ring-2 ring-slate-900/10' : 'border-gray-200 hover:border-gray-400'}`}
                                >
                                    <img src={src} alt="" className="max-h-full object-contain" />
                                </button>
                            );
                        })}
                    </div>

                    {/* Mobile Lightbox */}
                    {lightboxOpen && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/90" onClick={()=> setLightboxOpen(false)}>
                            <button onClick={()=> setLightboxOpen(false)} className="absolute top-4 right-4 text-white text-2xl font-black z-50">✕</button>
                            <img src={activeImage} alt={product.name} className="max-w-[90vw] max-h-[85vh] object-contain" onClick={e=> e.stopPropagation()} />
                        </div>
                    )}
                </div>

                {/* Product Info + Variants */}
                <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">{product.brand?.name} • {product.gender}</div>
                    <h1 className="text-3xl font-black mt-1 text-slate-900">{product.name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex text-amber-400">{ [1,2,3,4,5].map(i=> <span key={i} className={i<=Math.round(avg)?'':'text-gray-200'}>★</span> )}</div>
                        <span className="text-sm font-bold text-gray-600">{avg ? `${avg} (${count} reviews)` : 'No reviews yet'}</span>
                        <a href="#reviews" className="text-xs font-bold text-rose-600 underline">See reviews</a>
                        {product.is_on_sale && <span className="text-[10px] bg-rose-600 text-white font-black px-2 py-1 rounded-full">SALE</span>}
                    </div>
                    <div className="text-2xl font-black mt-3 text-slate-900">${displayPrice.toFixed(2)}</div>

                    <div className="mt-6 space-y-5">
                        {/* Size selector */}
                        <div>
                            <div className="text-sm font-bold mb-2">Size</div>
                            <div className="flex flex-wrap gap-2">
                                {allSizes.map(sz => {
                                    const avail = sizeAvailability[sz];
                                    const isSelected = selectedSize === sz;
                                    const disabled = !avail?.availableForColor;
                                    return (
                                        <VariantSizeCircle
                                            key={sz}
                                            sizeValue={sz}
                                            inStock={avail?.hasAnyInStock}
                                            selected={isSelected}
                                            disabled={disabled}
                                            onClick={() => !disabled && selectSize(sz)}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* Color selector */}
                        <div>
                            <div className="text-sm font-bold mb-2">Color</div>
                            <div className="flex flex-wrap gap-3">
                                {allColors.map(c => {
                                    const avail = colorAvailability[c.color_name];
                                    const isSelected = selectedColor === c.color_name;
                                    const disabled = !avail?.availableForSize;
                                    return (
                                        <VariantColorSwatch
                                            key={c.color_name}
                                            colorName={c.color_name}
                                            colorHex={c.color_hex}
                                            inStock={avail?.hasAnyInStock}
                                            selected={isSelected}
                                            disabled={disabled}
                                            onClick={() => !disabled && selectColor(c.color_name)}
                                        />
                                    );
                                })}
                            </div>
                        </div>

                        {/* Stock status */}
                        <div className={`text-sm mt-1 font-semibold ${stockStatus.cls}`}>
                            <span className={`inline-block w-2 h-2 rounded-full mr-1 ${stockStatus.dot}`}></span>
                            {stockStatus.text}
                        </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                        {isOos ? (
                            <button
                                onClick={toggleWishlist}
                                disabled={wishLoading}
                                className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full font-black text-sm flex items-center justify-center gap-2 transition shadow-sm disabled:opacity-50"
                            >
                                ♡ Save to Wishlist
                            </button>
                        ) : (
                            <div className="flex flex-1 items-center gap-2">
                                <div className="flex items-center border border-gray-300 rounded-full overflow-hidden">
                                    <button onClick={()=> setQty(q=> Math.max(1, q-1))} disabled={qty<=1} className="px-3 py-2.5 font-black text-sm disabled:opacity-40 hover:bg-gray-50">−</button>
                                    <span className="w-8 text-center font-black text-sm">{qty}</span>
                                    <button onClick={()=> setQty(q=> Math.min(selectedVariant?.stock_quantity ?? q+1, q+1))} disabled={qty >= (selectedVariant?.stock_quantity ?? 1)} className="px-3 py-2.5 font-black text-sm disabled:opacity-40 hover:bg-gray-50">+</button>
                                </div>
                                <button
                                    onClick={addToBag}
                                    className="flex-1 py-4 bg-slate-900 hover:bg-black text-white rounded-full font-bold transition shadow-sm"
                                >
                                    Add to Cart
                                </button>
                            </div>
                        )}
                        <button
                            onClick={toggleWishlist}
                            disabled={wishLoading}
                            className="px-6 py-4 border border-gray-300 rounded-full font-bold text-sm hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            ♡ Wishlist
                        </button>
                    </div>

                    {flash?.success && <div className="mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg text-sm font-semibold">{flash.success}</div>}
                    {flash?.error && <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-semibold">{flash.error}</div>}
                    <p className="text-sm text-gray-600 mt-6 leading-relaxed">{product.description}</p>
                    {product.material && <p className="text-xs text-gray-500 mt-2"><span className="font-bold">Material:</span> {product.material}</p>}
                    {product.care_instructions && <p className="text-xs text-gray-500 mt-1"><span className="font-bold">Care:</span> {product.care_instructions}</p>}
                </div>
            </div>

            {/* Reviews Section */}
            <div id="reviews" className="max-w-7xl mx-auto px-6 py-10 border-t">
                <h2 className="text-2xl font-black">Customer Reviews</h2>
                <div className="mt-6 grid md:grid-cols-[280px_1fr] gap-8">
                    <div className="bg-white border rounded-xl p-6 h-fit">
                        <div className="text-center">
                            <div className="text-5xl font-black">{avg || '—'}</div>
                            <div className="flex justify-center text-amber-400 mt-1">{[1,2,3,4,5].map(i=> <span key={i} className={i<=Math.round(avg)?'':'text-gray-200'}>★</span>)}</div>
                            <div className="text-sm font-semibold text-gray-500 mt-1">Based on {count} reviews</div>
                        </div>
                        <div className="mt-6 space-y-2">
                            {[5,4,3,2,1].map(star=>{
                                const c = breakdown[star] || 0;
                                const pct = count ? Math.round((c/count)*100) : 0;
                                return (
                                    <div key={star} className="flex items-center gap-2 text-xs font-bold">
                                        <span className="w-6">{star}★</span>
                                        <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-amber-400" style={{width: `${pct}%`}} /></div>
                                        <span className="w-10 text-gray-500">{c} ({pct}%)</span>
                                    </div>
                                )
                            })}
                        </div>
                    </div>

                    <div>
                        {user ? (
                            canReview ? (
                                <form onSubmit={submitReview} className="bg-white border rounded-xl p-6 mb-6">
                                    <h3 className="font-black">Write a review</h3>
                                    <p className="text-xs text-gray-500 font-semibold">Verified purchaser only — your review will be pending approval</p>
                                    <div className="mt-3">
                                        <label className="text-xs font-bold uppercase text-gray-500">Rating *</label>
                                        <div className="flex gap-1 mt-1">
                                            {[1,2,3,4,5].map(n=>(
                                                <button key={n} type="button" onClick={()=>reviewForm.setData('rating', n)} className={`w-9 h-9 rounded-full border font-black ${reviewForm.data.rating===n?'bg-slate-900 text-white border-slate-900':'bg-white'}`}>{n}</button>
                                            ))}
                                        </div>
                                        {reviewForm.errors.rating && <div className="text-xs text-red-600 mt-1">{reviewForm.errors.rating}</div>}
                                    </div>
                                    <div className="mt-3">
                                        <label className="text-xs font-bold uppercase text-gray-500">Comment *</label>
                                        <textarea value={reviewForm.data.comment} onChange={e=>reviewForm.setData('comment', e.target.value)} rows={4} placeholder="Share your experience..." className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-medium focus:border-rose-500 outline-none" />
                                        {reviewForm.errors.comment && <div className="text-xs text-red-600 mt-1">{reviewForm.errors.comment}</div>}
                                    </div>
                                    <button disabled={reviewForm.processing} className="mt-3 px-6 py-2.5 bg-slate-900 text-white rounded-full font-black text-sm disabled:opacity-60">Submit Review</button>
                                </form>
                            ) : <div className="bg-gray-50 border rounded-xl p-4 mb-6 text-sm font-semibold text-gray-600">You must purchase this product to write a review. {(product.reviews||[]).some(r=>String(r.user_id)===String(user.id)) ? 'You have already reviewed this product.' : ''}</div>
                        ) : <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-6 text-sm font-semibold text-amber-800"><Link href={route('login')} className="font-black underline">Sign in</Link> and purchase to write a review.</div>}

                        {(product.reviews||[]).length===0 ? <div className="bg-white border rounded-xl p-8 text-center text-sm font-semibold text-gray-500">No reviews yet — be the first!</div> :
                        <div className="space-y-4">
                            {(product.reviews||[]).map(r=>(
                                <div key={r.id} className="bg-white border rounded-xl p-5">
                                    <div className="flex justify-between">
                                        <div className="font-bold text-sm">{r.user?.name || r.author_name || r.user_name}</div>
                                        <div className="flex text-amber-400 text-sm">{[1,2,3,4,5].map(i=> <span key={i} className={i<=r.rating?'':'text-gray-200'}>★</span>)}</div>
                                    </div>
                                    <div className="text-xs text-gray-500 font-semibold">{new Date(r.created_at).toLocaleDateString()}</div>
                                    <p className="text-sm text-gray-700 mt-2 leading-relaxed">{r.comment}</p>
                                    {r.admin_reply && <div className="mt-3 bg-slate-50 border border-slate-200 rounded-lg p-3"><div className="text-xs font-black uppercase text-slate-600">Reply from TrustedMart</div><p className="text-sm text-slate-700 mt-1">{r.admin_reply}</p>{r.admin_reply_at && <div className="text-[11px] text-gray-500 mt-1">{new Date(r.admin_reply_at).toLocaleDateString()}</div>}</div>}
                                </div>
                            ))}
                        </div>}
                    </div>
                </div>

                {related?.length>0 && (
                    <div className="mt-12">
                        <h3 className="font-black text-lg">You may also like</h3>
                        <div className="mt-4 flex gap-4 overflow-x-auto pb-2">
                            {related.map(p=>(
                                <Link key={p.id} href={`/product/${p.slug || p.id}`} className="min-w-[180px] bg-white border rounded-xl overflow-hidden hover:shadow-md">
                                    <div className="bg-gray-50 p-4 flex items-center justify-center h-40"><img src={p.images?.[0]?.image_url || p.images?.[0]?.url || 'https://via.placeholder.com/300'} className="max-h-32 object-contain" /></div>
                                    <div className="p-3"><div className="text-xs font-bold text-gray-500 truncate">{p.brand?.name}</div><div className="text-sm font-bold line-clamp-2">{p.name}</div><div className="font-black text-sm mt-1">${Number(p.price||p.base_price||0).toFixed(2)}</div></div>
                                </Link>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
