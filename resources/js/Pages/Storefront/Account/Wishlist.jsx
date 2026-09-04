import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Link, usePage, router } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { useState } from 'react';
import { Trash2, Bell, X, ShoppingBag, ArrowRight } from 'lucide-react';

function AccountNav(){
    const url = usePage().url;
    const items = [
        {label:'Dashboard', href:'/account'},
        {label:'Profile', href:'/account/profile'},
        {label:'Addresses', href:'/account/addresses'},
        {label:'Orders', href:'/account/orders'},
        {label:'Wishlist', href:'/account/wishlist'},
    ];
    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {items.map(i => {
                const active = url===i.href || (i.href!=='/account' && url.startsWith(i.href));
                return (
                    <Link
                        key={i.href}
                        href={i.href}
                        className={`px-4 py-2 rounded-full text-sm font-bold border transition-all ${active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white hover:bg-gray-50 border-gray-200 text-slate-700'}`}
                    >
                        {i.label}
                    </Link>
                );
            })}
        </div>
    );
}

export default function Wishlist({ items=[] }){
    const { auth } = usePage().props;
    const user = auth?.user;
    const [requesting, setRequesting] = useState({});
    const [formReady, setFormReady] = useState({});
    const [submitting, setSubmitting] = useState({});

    const remove = (productId)=> {
        router.delete(route('wishlist.destroy', productId), {
            preserveScroll: true,
            onSuccess: () => toast.success('Removed from wishlist'),
            onError: () => toast.error('Failed to remove')
        });
    };

    const submitRequest = (product, e) => {
        if (e) e.preventDefault();
        const form = requesting[product.id];
        if (!form) return;
        if (!form.email || !form.email.trim()) {
            toast.error('Please enter your email address');
            return;
        }

        setSubmitting(prev => ({ ...prev, [product.id]: true }));
        router.post(route('wishlist.request'), {
            product_id: product.id,
            product_variant_id: form.variant_id || null,
            preferred_size: form.size || '',
            preferred_color: form.color || '',
            email: form.email.trim(),
        }, {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Restock alert saved! We will email you once available.');
                setFormReady(prev => ({ ...prev, [product.id]: false }));
                setSubmitting(prev => ({ ...prev, [product.id]: false }));
            },
            onError: (errs) => {
                setSubmitting(prev => ({ ...prev, [product.id]: false }));
                toast.error(Object.values(errs)[0] || 'Failed to save alert');
            },
        });
    };

    const startRequest = (product) => {
        const variants = product.variants || [];
        const firstVariant = variants.find(v => v.stock_quantity === 0) || variants[0];
        setRequesting(prev => ({
            ...prev,
            [product.id]: {
                variant_id: firstVariant?.id || '',
                size: firstVariant?.size_value || '',
                color: firstVariant?.color_name || '',
                email: prev[product.id]?.email || user?.email || '',
            }
        }));
        setFormReady(prev => ({ ...prev, [product.id]: true }));
    };

    const cancelRequest = (productId) => {
        setFormReady(prev => ({ ...prev, [productId]: false }));
    };

    return (
        <StorefrontLayout>
            <div className="max-w-6xl mx-auto px-4 sm:px-6 py-8">
                <div className="flex flex-col sm:flex-row sm:items-baseline justify-between gap-2 border-b border-gray-200 pb-5">
                    <div>
                        <h1 className="text-3xl font-black text-slate-900 tracking-tight">Account Wishlist</h1>
                        <p className="text-sm text-gray-500 font-semibold mt-1">Saved styles • Restock notifications & easy ordering</p>
                    </div>
                    <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1.5 rounded-full self-start sm:self-auto">
                        {items.length} {items.length === 1 ? 'Item' : 'Items'}
                    </span>
                </div>

                <div className="mt-6"><AccountNav/></div>

                {items.length === 0 ? (
                    <div className="bg-white border border-gray-200 rounded-2xl p-12 text-center max-w-lg mx-auto shadow-sm">
                        <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                            <ShoppingBag size={28} />
                        </div>
                        <h3 className="text-lg font-bold text-slate-900">Your wishlist is empty</h3>
                        <p className="text-sm text-gray-500 mt-1 mb-6">Save pairs you love to track their availability or purchase anytime.</p>
                        <Link href="/products" className="inline-flex items-center gap-2 px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-black transition-all">
                            Browse Collection <ArrowRight size={16} />
                        </Link>
                    </div>
                ) : (
                    <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map(w => {
                            const p = w.product;
                            if(!p) return null;
                            const img = p.images?.[0]?.image_url || p.images?.[0]?.url || 'https://via.placeholder.com/400';
                            const req = requesting[p.id];
                            const showForm = formReady[p.id];
                            const variants = p.variants || [];
                            const totalStock = variants.reduce((sum, v) => sum + (v.stock_quantity || 0), 0);
                            const isOutOfStock = variants.length > 0 && totalStock === 0;
                            const sizes = [...new Set(variants.map(v => v.size_value))].sort((a,b)=> Number(a)-Number(b));
                            const colors = [...new Map(variants.map(v => [v.color_name, v])).values()];

                            return (
                                <div key={w.id} className="group bg-white border border-gray-200/90 rounded-2xl overflow-hidden flex flex-col shadow-sm hover:shadow-md transition-all duration-200">
                                    {/* Thumbnail Header */}
                                    <div className="relative bg-gradient-to-b from-gray-50 to-gray-100/60 h-56 flex items-center justify-center p-6 shrink-0 overflow-hidden">
                                        <span className={`absolute top-3.5 left-3.5 text-[10px] font-black uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm ${isOutOfStock ? 'bg-rose-500 text-white' : 'bg-emerald-600 text-white'}`}>
                                            {isOutOfStock ? 'Out of Stock' : 'In Stock'}
                                        </span>

                                        <button
                                            onClick={() => remove(p.id)}
                                            title="Remove from wishlist"
                                            className="absolute top-3.5 right-3.5 w-8 h-8 rounded-full bg-white/95 backdrop-blur-sm border border-gray-200 flex items-center justify-center text-gray-400 hover:text-rose-600 hover:border-rose-200 shadow-sm transition-all"
                                        >
                                            <Trash2 size={15} />
                                        </button>

                                        <img
                                            src={img}
                                            alt={p.name}
                                            className="max-h-40 max-w-[85%] object-contain group-hover:scale-105 transition-transform duration-300 drop-shadow-sm"
                                            onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60'; }}
                                        />
                                    </div>

                                    {/* Details */}
                                    <div className="p-5 flex-1 flex flex-col justify-between">
                                        <div>
                                            <div className="text-[11px] font-black text-gray-400 uppercase tracking-wider">
                                                {p.brand?.name || 'TrustedMart'}
                                            </div>
                                            <Link href={`/product/${p.slug || p.id}`} className="font-bold text-sm text-slate-900 line-clamp-2 hover:text-rose-600 transition-colors mt-1">
                                                {p.name}
                                            </Link>
                                            <div className="font-black text-lg mt-2 text-slate-900">
                                                ${Number(p.price || p.base_price || 0).toFixed(2)}
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-4 pt-3 border-t border-gray-100">
                                            {!showForm ? (
                                                <div className="flex gap-2">
                                                    <Link
                                                        href={`/product/${p.slug || p.id}`}
                                                        className="flex-1 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-black text-center hover:bg-black transition-all shadow-sm flex items-center justify-center gap-1.5"
                                                    >
                                                        <ShoppingBag size={14} /> View Shoe
                                                    </Link>
                                                    <button
                                                        onClick={() => startRequest(p)}
                                                        title="Request restock alert"
                                                        className="px-3.5 py-2.5 bg-rose-50 border border-rose-200 text-rose-700 rounded-xl text-xs font-bold hover:bg-rose-100 flex items-center justify-center gap-1.5 transition-all"
                                                    >
                                                        <Bell size={14} /> Notify
                                                    </button>
                                                </div>
                                            ) : (
                                                <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-3 shadow-inner">
                                                    <div className="flex items-center justify-between">
                                                        <div className="flex items-center gap-1.5 text-xs font-black text-slate-800 uppercase tracking-wider">
                                                            <Bell size={14} className="text-rose-600" />
                                                            Restock Alert
                                                        </div>
                                                        <button
                                                            type="button"
                                                            onClick={() => cancelRequest(p.id)}
                                                            className="text-gray-400 hover:text-gray-600 p-0.5"
                                                        >
                                                            <X size={15} />
                                                        </button>
                                                    </div>

                                                    <div className="grid grid-cols-2 gap-2">
                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Size</label>
                                                            <select
                                                                value={req?.size || ''}
                                                                onChange={e => {
                                                                    const size = e.target.value;
                                                                    setRequesting(prev => {
                                                                        const cur = prev[p.id] || {};
                                                                        const variant = variants.find(v => v.size_value === size && (cur.color ? v.color_name === cur.color : true));
                                                                        return { ...prev, [p.id]: { ...cur, size, variant_id: variant?.id || cur.variant_id } };
                                                                    });
                                                                }}
                                                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:border-rose-500 outline-none"
                                                            >
                                                                <option value="">Any Size</option>
                                                                {sizes.map(s => <option key={s} value={s}>US {s}</option>)}
                                                            </select>
                                                        </div>

                                                        <div>
                                                            <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Color</label>
                                                            <select
                                                                value={req?.color || ''}
                                                                onChange={e => {
                                                                    const color = e.target.value;
                                                                    setRequesting(prev => {
                                                                        const cur = prev[p.id] || {};
                                                                        const variant = variants.find(v => v.color_name === color && (cur.size ? v.size_value === cur.size : true));
                                                                        return { ...prev, [p.id]: { ...cur, color, variant_id: variant?.id || cur.variant_id } };
                                                                    });
                                                                }}
                                                                className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:border-rose-500 outline-none"
                                                            >
                                                                <option value="">Any Color</option>
                                                                {colors.map(c => <option key={c.color_name} value={c.color_name}>{c.color_name}</option>)}
                                                            </select>
                                                        </div>
                                                    </div>

                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Email Address</label>
                                                        <input
                                                            type="email"
                                                            value={req?.email || ''}
                                                            onChange={e => {
                                                                const email = e.target.value;
                                                                setRequesting(prev => ({ ...prev, [p.id]: { ...(prev[p.id] || {}), email } }));
                                                            }}
                                                            placeholder="you@example.com"
                                                            required
                                                            className="w-full px-2.5 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-semibold focus:border-rose-500 outline-none"
                                                        />
                                                    </div>

                                                    <div className="flex gap-2 pt-1">
                                                        <button
                                                            type="button"
                                                            onClick={(e) => submitRequest(p, e)}
                                                            disabled={submitting[p.id]}
                                                            className="flex-1 py-2 bg-rose-600 text-white rounded-lg text-xs font-black hover:bg-rose-700 transition-all disabled:opacity-50"
                                                        >
                                                            {submitting[p.id] ? 'Saving...' : 'Save Alert'}
                                                        </button>
                                                        <button
                                                            type="button"
                                                            onClick={() => cancelRequest(p.id)}
                                                            className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-100 transition-all"
                                                        >
                                                            Cancel
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
