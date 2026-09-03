import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { useState } from 'react';
import { Link, router, usePage, useForm } from '@inertiajs/react';
import toast from 'react-hot-toast';

export default function Show({ product, reviewsMeta, canReview, related=[] }) {
    const { auth, flash } = usePage().props;
    const user = auth?.user;
    const [size, setSize] = useState(product?.variants?.[0] || null);
    const [qty, setQty] = useState(1);
    const [wishLoading, setWishLoading] = useState(false);
    const avg = reviewsMeta?.average || 0;
    const count = reviewsMeta?.count || 0;
    const breakdown = reviewsMeta?.breakdown || {};
    const primaryImg = product?.images?.find(i => i.is_primary);
    const initialThumb = primaryImg?.image_url || primaryImg?.url || product?.images?.[0]?.image_url || product?.images?.[0]?.url || 'https://via.placeholder.com/600?text=Shoe';
    const [activeImage, setActiveImage] = useState(initialThumb);
    const [showNotifyModal, setShowNotifyModal] = useState(false);

    const handleWishlistOrNotify = () => {
        if (size?.stock_quantity === 0) {
            setShowNotifyModal(true);
        } else {
            toggleWishlist();
        }
    };

    const toggleWishlist = () => {
        if (!user) { toast.error('Please sign in to use wishlist'); return; }
        setWishLoading(true);
        router.post(route('wishlist.toggle'), { product_id: product.id }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Wishlist updated'),
            onError: () => toast.error('Failed'),
            onFinish: () => setWishLoading(false)
        });
    };

    const notifyForm = useForm({
        email: user?.email || '',
        product_id: product.id,
        variant_id: size?.id || product.variants?.[0]?.id,
    });

    const handleVariantChange = (v) => {
        setSize(v);
        notifyForm.setData('variant_id', v.id);
    };

    const submitNotify = (e) => {
        e.preventDefault();
        if (!notifyForm.data.email || !notifyForm.data.email.includes('@')) {
            toast.error('Enter a valid email address');
            return;
        }
        if (user) {
            router.post(route('wishlist.toggle'), { product_id: product.id }, { preserveScroll: true });
        }
        notifyForm.post(route('stock.notify'), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Shoe added to wishlist! You will receive an email as soon as it is restocked.');
                setShowNotifyModal(false);
            },
            onError: (errs) => toast.error(Object.values(errs)[0] || 'Failed to submit notification request'),
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

    const addToBag = ()=>{
        if(!size){ toast.error('Select a size'); return; }
        router.post('/cart/add', {product_id: product.id, variant_id: size?.id, quantity: qty}, {
            preserveScroll:true,
            onSuccess:()=> toast.success('Added to bag'),
            onError:(errs)=> toast.error(Object.values(errs)[0]||'Failed')
        });
    };

    return (
        <StorefrontLayout>
            <div className="max-w-7xl mx-auto px-6 py-10 grid md:grid-cols-2 gap-10">
                <div className="bg-gray-50 rounded-2xl p-8 flex flex-col items-center justify-center relative">
                    <img 
                        src={activeImage} 
                        alt={product.name} 
                        className="max-h-96 object-contain transition duration-300 drop-shadow-md" 
                    />
                </div>
                <div>
                    <div className="text-xs font-bold text-gray-500 uppercase">{product.brand?.name} • {product.gender}</div>
                    <h1 className="text-3xl font-black mt-1 text-slate-900">{product.name}</h1>
                    <div className="flex items-center gap-2 mt-2">
                        <div className="flex text-amber-400">{ [1,2,3,4,5].map(i=> <span key={i} className={i<=Math.round(avg)?'':'text-gray-200'}>★</span>)}</div>
                        <span className="text-sm font-bold text-gray-600">{avg ? `${avg} (${count} reviews)` : 'No reviews yet'}</span>
                        <a href="#reviews" className="text-xs font-bold text-rose-600 underline">See reviews</a>
                    </div>
                    <div className="text-2xl font-black mt-3 text-slate-900">${Number(product.price || product.base_price || 0).toFixed(2)}</div>
                    
                    <div className="mt-6 space-y-4">
                        {/* Gallery with interactive thumbnails */}
                        <div className="flex gap-2 overflow-x-auto pb-1">
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

                        <div>
                            <div className="text-sm font-bold mb-2">Choose Variant (Size • Color)</div>
                            <div className="flex flex-wrap gap-2">{product.variants?.map(v=> (
                                <button key={v.id} onClick={()=>handleVariantChange(v)} className={`px-3 py-2 rounded-lg border font-bold text-sm flex items-center gap-2 ${size?.id===v.id?'bg-slate-900 text-white border-slate-900':'bg-white hover:border-gray-400'} ${v.stock_quantity===0?'opacity-60 border-dashed':''}`}>
                                    <span className="w-3 h-3 rounded-full border" style={{background: v.color_hex || '#111'}} title={v.color_name}></span>
                                    US {v.size_value} • {v.color_name}
                                    {v.price && <span className="text-xs font-normal opacity-70">${Number(v.price).toFixed(2)}</span>}
                                    {v.stock_quantity === 0 && <span className="text-[10px] bg-red-100 text-red-700 px-1 rounded font-bold">OOS</span>}
                                </button>
                            ))}</div>
                            <div className="text-sm mt-2 font-semibold">
                                {size ? (
                                    size.stock_quantity === 0 ? (
                                        <span className="text-red-600 font-bold">● Out of stock in US {size.size_value}</span>
                                    ) : size.stock_quantity <= 3 ? (
                                        <span className="text-amber-600 font-bold">● Only {size.stock_quantity} left in {size.color_name}</span>
                                    ) : (
                                        <span className="text-emerald-600 font-bold">● In Stock — {size.stock_quantity} units available</span>
                                    )
                                ) : (
                                    <span className="text-gray-500 font-semibold">● Standard sizing</span>
                                )}
                                {size?.price && <span className="ml-2 text-slate-700">Variant price: ${Number(size.price).toFixed(2)}</span>}
                            </div>
                        </div>
                    </div>

                    <div className="flex gap-2 mt-6">
                        {size && size.stock_quantity === 0 ? (
                            <button 
                                onClick={() => setShowNotifyModal(true)} 
                                className="flex-1 py-4 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-full font-black text-sm flex items-center justify-center gap-2 transition shadow-sm"
                            >
                                🔔 Notify Me When Back In Stock
                            </button>
                        ) : (
                            <button 
                                onClick={addToBag} 
                                className="flex-1 py-4 bg-slate-900 hover:bg-black text-white rounded-full font-bold transition shadow-sm"
                            >
                                Add to Bag — ${Number(size?.price || product.price || product.base_price || 0).toFixed(2)}
                            </button>
                        )}
                        <button 
                            onClick={handleWishlistOrNotify} 
                            disabled={wishLoading} 
                            className="px-6 py-4 border border-gray-300 rounded-full font-bold text-sm hover:bg-gray-50 transition disabled:opacity-50"
                        >
                            ♡ Wishlist
                        </button>
                    </div>

                    {/* Clean Restock Notification Modal */}
                    {showNotifyModal && (
                        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" role="dialog" aria-modal="true">
                            <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl relative" onClick={e => e.stopPropagation()}>
                                <button onClick={() => setShowNotifyModal(false)} className="absolute right-4 top-4 text-gray-400 hover:text-slate-900 text-lg font-black">✕</button>
                                
                                <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-800 flex items-center justify-center text-xl font-bold mb-3">
                                    🔔
                                </div>
                                <h3 className="text-xl font-black text-slate-900">Restock Notification</h3>
                                <p className="text-xs text-gray-600 font-medium mt-1 leading-relaxed">
                                    <span className="font-bold text-slate-900">{product.name}</span> in size <span className="font-bold text-slate-900">US {size?.size_value} ({size?.color_name})</span> is currently sold out.
                                    We will save it to your wishlist and send a genuine notification email as soon as inventory is restocked.
                                </p>

                                <form onSubmit={submitNotify} className="mt-4 space-y-3">
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500 block mb-1">Your Email Address</label>
                                        <input
                                            type="email"
                                            value={notifyForm.data.email}
                                            onChange={e => notifyForm.setData('email', e.target.value)}
                                            required
                                            placeholder="e.g. mahmudshuharto500@gmail.com"
                                            className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold outline-none focus:border-slate-900"
                                        />
                                        {notifyForm.errors.email && <div className="text-xs text-red-600 mt-1 font-bold">{notifyForm.errors.email}</div>}
                                    </div>

                                    <button
                                        type="submit"
                                        disabled={notifyForm.processing}
                                        className="w-full py-3 bg-slate-900 hover:bg-black text-white rounded-full font-black text-sm transition disabled:opacity-50"
                                    >
                                        {notifyForm.processing ? 'Registering...' : 'Save to Wishlist & Notify Me'}
                                    </button>
                                </form>
                            </div>
                        </div>
                    )}
                    {flash?.success && <div className="mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-2 rounded-lg text-sm font-semibold">{flash.success}</div>}
                    {flash?.error && <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-2 rounded-lg text-sm font-semibold">{flash.error}</div>}
                    <p className="text-sm text-gray-600 mt-6 leading-relaxed">{product.description}</p>
                    {product.material && <p className="text-xs text-gray-500 mt-2"><span className="font-bold">Material:</span> {product.material}</p>}
                    {product.care_instructions && <p className="text-xs text-gray-500 mt-1"><span className="font-bold">Care:</span> {product.care_instructions}</p>}
                </div>
            </div>

            {/* Reviews Section (4.3) */}
            <div id="reviews" className="max-w-7xl mx-auto px-6 py-10 border-t">
                <h2 className="text-2xl font-black">Customer Reviews</h2>
                <div className="mt-6 grid md:grid-cols-[280px_1fr] gap-8">
                    {/* Average + breakdown */}
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

                    {/* List + form */}
                    <div>
                        {/* Write review */}
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

                        {/* Reviews list */}
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

                {/* Related carousel */}
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
