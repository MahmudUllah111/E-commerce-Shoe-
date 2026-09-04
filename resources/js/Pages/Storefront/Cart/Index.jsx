import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Index({ cart, summary, coupon_code }) {
    const { flash } = usePage().props;
    const items = cart?.items || [];
    const isEmpty = items.length === 0;

    const [coupon, setCoupon] = useState(coupon_code || '');
    const couponForm = useForm({ code: coupon_code || '' });

    const handleQty = (item, delta) => {
        const newQty = item.quantity + delta;
        if (newQty < 1) return;
        router.patch(route('cart.update'), { item_id: item.id, quantity: newQty }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Cart updated'),
            onError: (e) => toast.error(Object.values(e)[0] || 'Update failed'),
        });
    };

    const handleRemove = (id) => {
        router.delete(route('cart.destroy', id), {
            preserveScroll: true,
            onSuccess: () => toast.success('Item removed'),
        });
    };

    const applyCoupon = (e) => {
        e.preventDefault();
        if (!coupon.trim()) return;
        router.post(route('cart.coupon.apply'), { code: coupon.trim() }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Coupon applied'),
            onError: (e) => toast.error(Object.values(e)[0] || 'Invalid coupon'),
        });
    };

    const removeCoupon = () => {
        router.delete(route('cart.coupon.remove'), {
            preserveScroll: true,
            onSuccess: () => toast.success('Coupon removed'),
        });
    };

    return (
        <StorefrontLayout>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-black">Your Cart <span className="text-gray-500 font-bold text-lg">({cart?.count || 0})</span></h1>

                {flash?.success && <div className="mt-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.success}</div>}
                {flash?.error && <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.error}</div>}

                {isEmpty ? (
                    <div className="mt-10 bg-white border border-gray-200 rounded-2xl py-16 text-center">
                        <div className="text-5xl mb-4">🛒</div>
                        <h2 className="text-xl font-black">Your cart is empty</h2>
                        <p className="text-gray-500 mt-2">Add some shoes to get started</p>
                        <Link href="/products" className="inline-flex mt-6 px-6 py-3 bg-slate-900 text-white rounded-full font-bold">Continue Shopping →</Link>
                    </div>
                ) : (
                    <div className="mt-6 grid lg:grid-cols-[1fr_380px] gap-8">
                        {/* Items */}
                        <div className="space-y-4">
                            {items.map(item => (
                                <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-4 flex gap-4">
                                    <img src={item.product?.image} alt={item.product?.name} className="w-24 h-24 object-contain bg-gray-50 rounded-lg border" />
                                    <div className="flex-1 min-w-0">
                                        <Link href={`/product/${item.product?.slug || item.product?.id}`} className="font-bold text-slate-900 hover:text-rose-600 line-clamp-1">{item.product?.name}</Link>
                                        <div className="text-sm text-gray-500 font-semibold mt-1">
                                            Size: <span className="text-slate-900">{item.variant?.size_value}</span> • Color: <span className="inline-flex items-center gap-1"><span className="w-3 h-3 rounded-full border inline-block" style={{background: item.variant?.color_hex || '#000'}} />{item.variant?.color_name}</span>
                                        </div>
                                        <div className="flex items-center justify-between mt-3">
                                            <div className="flex items-center gap-2">
                                                <button onClick={()=>handleQty(item, -1)} disabled={item.quantity<=1} className="w-8 h-8 rounded-full border bg-white font-black disabled:opacity-40">−</button>
                                                <span className="w-8 text-center font-black text-sm">{item.quantity}</span>
                                                <button onClick={()=>handleQty(item, 1)} disabled={item.variant?.stock_quantity !== null && item.quantity >= item.variant.stock_quantity} className="w-8 h-8 rounded-full border bg-white font-black disabled:opacity-40">+</button>
                                                <span className="text-xs text-gray-500 ml-2 font-semibold">{item.variant?.stock_quantity<=3 ? `Only ${item.variant?.stock_quantity} left` : ''}</span>
                                            </div>
                                            <button onClick={()=>handleRemove(item.id)} className="text-sm font-bold text-rose-600 hover:text-rose-700">Remove</button>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black">${Number(item.unit_price).toFixed(2)}</div>
                                        <div className="text-xs font-bold text-gray-500">x {item.quantity}</div>
                                        <div className="font-black text-rose-600 mt-1">${Number(item.line_total).toFixed(2)}</div>
                                    </div>
                                </div>
                            ))}

                            {/* Coupon */}
                            <div className="bg-white border border-gray-200 rounded-xl p-4">
                                <div className="font-bold text-sm mb-2">Coupon Code</div>
                                {coupon_code ? (
                                    <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-lg px-3 py-2">
                                        <span className="font-black text-green-700 text-sm">{coupon_code} • -${Number(summary?.discount || 0).toFixed(2)}</span>
                                        <button onClick={removeCoupon} className="text-sm font-bold text-rose-600">Remove</button>
                                    </div>
                                ) : (
                                    <form onSubmit={applyCoupon} className="flex gap-2">
                                        <input value={coupon} onChange={e=>setCoupon(e.target.value)} placeholder="Enter code (e.g. WELCOME10)" className="flex-1 px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                                        <button type="submit" className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-black">Apply</button>
                                    </form>
                                )}
                                <div className="text-xs text-gray-500 mt-2">Free shipping over $100 • Use code <span className="font-bold text-slate-900">WELCOME10</span></div>
                            </div>
                        </div>

                        {/* Summary */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6 h-fit sticky top-20">
                            <h3 className="font-black text-lg">Order Summary</h3>
                            <div className="mt-4 space-y-3 text-sm">
                                <div className="flex justify-between"><span className="text-gray-600 font-semibold">Subtotal</span><span className="font-bold">${Number(summary?.subtotal || 0).toFixed(2)}</span></div>
                                {Number(summary?.discount || 0) > 0 && (
                                    <div className="flex justify-between text-green-700"><span className="font-semibold">Discount {summary?.coupon?.code ? `(${summary.coupon.code})` : ''}</span><span className="font-bold">- ${Number(summary.discount).toFixed(2)}</span></div>
                                )}
                                <div className="flex justify-between"><span className="text-gray-600 font-semibold">Shipping • {summary?.shipping_method?.name || summary?.selected_method?.name || 'Standard'}</span><span className="font-bold">${Number(summary?.shipping_cost || 0).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600 font-semibold">Tax ({Math.round((summary?.tax_rate||0)*100)}%)</span><span className="font-bold">${Number(summary?.tax || 0).toFixed(2)}</span></div>
                                <div className="border-t pt-3 flex justify-between text-base"><span className="font-black">Total</span><span className="font-black text-rose-600">${Number(summary?.total || 0).toFixed(2)}</span></div>
                            </div>
                            <Link href={route('checkout.index')} className={`mt-6 w-full inline-flex justify-center items-center py-3.5 rounded-full font-black text-white ${isEmpty ? 'bg-gray-300 cursor-not-allowed pointer-events-none' : 'bg-slate-900 hover:bg-black'}`}>
                                Proceed to Checkout →
                            </Link>
                            <Link href="/products" className="mt-3 w-full inline-flex justify-center py-3 rounded-full border border-gray-200 font-bold text-sm hover:bg-gray-50">Continue Shopping</Link>
                            <p className="text-xs text-gray-500 text-center mt-3">Secure mock payment • No card charged</p>
                        </div>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
