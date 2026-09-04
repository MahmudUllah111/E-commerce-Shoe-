import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { useState } from 'react';
import { router, Link } from '@inertiajs/react';
import { Package, Search, Truck, CheckCircle2, Clock, MapPin } from 'lucide-react';

export default function TrackOrder({ order = null, query = '', notFound = false }) {
    const [orderNumber, setOrderNumber] = useState(query || (order?.order_number || ''));
    const [loading, setLoading] = useState(false);

    const handleSearch = (e) => {
        e.preventDefault();
        if (!orderNumber.trim()) return;
        setLoading(true);
        router.get('/track-order', { order: orderNumber.trim() }, {
            preserveState: true,
            onFinish: () => setLoading(false),
        });
    };

    const statusSteps = [
        { key: 'pending', label: 'Order Placed', desc: 'Received & awaiting review' },
        { key: 'processing', label: 'Processing', desc: 'Item packed at warehouse' },
        { key: 'shipped', label: 'On The Way', desc: 'Handed over to courier' },
        { key: 'delivered', label: 'Delivered', desc: 'Package arrived at destination' },
    ];

    const currentIdx = order ? (
        order.status === 'delivered' ? 3 :
        order.status === 'shipped' ? 2 :
        order.status === 'processing' ? 1 : 0
    ) : -1;

    return (
        <StorefrontLayout>
            <div className="max-w-4xl mx-auto px-6 py-12">
                <div className="text-center max-w-xl mx-auto">
                    <div className="w-12 h-12 bg-rose-50 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
                        <Truck size={24} />
                    </div>
                    <h1 className="text-3xl font-black text-slate-900">Track Your Footwear Delivery</h1>
                    <p className="text-sm text-gray-500 font-medium mt-1">
                        Enter your unique order number (e.g. <span className="font-mono font-bold text-slate-800">ORD-6A97C458</span>) to see live progress.
                    </p>

                    {/* Search Bar */}
                    <form onSubmit={handleSearch} className="mt-6 flex gap-2 max-w-lg mx-auto">
                        <div className="relative flex-1">
                            <input
                                type="text"
                                value={orderNumber}
                                onChange={e => setOrderNumber(e.target.value)}
                                placeholder="Enter order number (e.g. ORD-2026-XXXX)"
                                required
                                className="w-full pl-4 pr-10 py-3 rounded-full border border-gray-300 text-sm font-bold uppercase tracking-wider outline-none focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
                            />
                            <Search size={18} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                        </div>
                        <button
                            type="submit"
                            disabled={loading}
                            className="px-6 py-3 bg-slate-900 text-white rounded-full font-black text-sm hover:bg-black transition disabled:opacity-50"
                        >
                            {loading ? 'Searching...' : 'Track'}
                        </button>
                    </form>
                </div>

                {notFound && (
                    <div className="mt-8 bg-red-50 border border-red-200 text-red-800 rounded-2xl p-6 text-center">
                        <div className="text-2xl mb-1">🔍</div>
                        <div className="font-black text-base">No order found with number: "{query}"</div>
                        <p className="text-xs text-red-600 font-medium mt-1">Please double-check your order confirmation email or invoice for the exact order ID.</p>
                    </div>
                )}

                {order && (
                    <div className="mt-10 space-y-6">
                        {/* Order Header Card */}
                        <div className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 shadow-sm">
                            <div className="flex flex-wrap items-center justify-between gap-4 border-b pb-6">
                                <div>
                                    <div className="text-xs font-black tracking-widest text-gray-400 uppercase">Tracking Order</div>
                                    <h2 className="text-2xl font-black font-mono text-slate-900 mt-0.5">{order.order_number}</h2>
                                    <div className="text-xs text-gray-500 font-semibold mt-1">
                                        Ordered on {new Date(order.created_at).toLocaleDateString(undefined, { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                                    </div>
                                </div>
                                <div className="text-right">
                                    <span className={`inline-flex px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-wider ${
                                        order.status === 'delivered' ? 'bg-emerald-100 text-emerald-800' :
                                        order.status === 'shipped' ? 'bg-blue-100 text-blue-800' :
                                        order.status === 'processing' ? 'bg-indigo-100 text-indigo-800' :
                                        order.status === 'cancelled' ? 'bg-rose-100 text-rose-800' :
                                        'bg-amber-100 text-amber-800'
                                    }`}>
                                        {order.status}
                                    </span>
                                    <div className="text-xs font-bold text-gray-500 mt-1">Payment: {order.payment_status?.toUpperCase() || 'PAID'}</div>
                                    <div className="mt-2 flex gap-1.5 justify-end">
                                        <a href={`/orders/${order.order_number}/invoice`} className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-[11px] font-bold text-slate-800 hover:bg-gray-100 shadow-sm transition">
                                            📄 Invoice
                                        </a>
                                        <a href={`/orders/${order.order_number}/packing-slip`} className="px-2.5 py-1 bg-white border border-gray-300 rounded-lg text-[11px] font-bold text-slate-800 hover:bg-gray-100 shadow-sm transition">
                                            📦 Packing Slip
                                        </a>
                                    </div>
                                </div>
                            </div>

                            {/* Tracking Progress Timeline */}
                            <div className="mt-8">
                                <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase mb-6">Delivery Progress</h3>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 relative">
                                    {statusSteps.map((step, idx) => {
                                        const isDone = idx <= currentIdx;
                                        const isCurrent = idx === currentIdx;
                                        return (
                                            <div key={step.key} className="flex flex-col items-center text-center">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-black text-sm transition ${
                                                    isDone ? 'bg-slate-900 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'
                                                } ${isCurrent ? 'ring-4 ring-rose-500/20' : ''}`}>
                                                    {isDone ? '✓' : idx + 1}
                                                </div>
                                                <div className={`text-xs font-black mt-2 uppercase ${isCurrent ? 'text-rose-600' : isDone ? 'text-slate-900' : 'text-gray-400'}`}>
                                                    {step.label}
                                                </div>
                                                <div className="text-[11px] text-gray-500 font-medium mt-0.5 max-w-[130px]">
                                                    {step.desc}
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            </div>

                            {/* Destination & Summary */}
                            <div className="mt-8 pt-6 border-t grid sm:grid-cols-2 gap-6 text-sm">
                                <div className="bg-gray-50 rounded-2xl p-4">
                                    <div className="flex items-center gap-2 font-black text-slate-900 mb-1">
                                        <MapPin size={16} className="text-rose-600" /> Shipping Destination
                                    </div>
                                    <div className="text-xs font-bold text-gray-800">{order.customer_name}</div>
                                    <div className="text-xs text-gray-600 font-medium mt-0.5">{order.shipping_address}</div>
                                    <div className="text-xs text-gray-500 font-semibold mt-1">Method: {order.shipping_method}</div>
                                </div>

                                <div className="bg-gray-50 rounded-2xl p-4 flex flex-col justify-between">
                                    <div>
                                        <div className="font-black text-slate-900 mb-1">Order Financials</div>
                                        <div className="flex justify-between text-xs text-gray-600 font-semibold">
                                            <span>Subtotal</span>
                                            <span>${Number(order.subtotal || 0).toFixed(2)}</span>
                                        </div>
                                        <div className="flex justify-between text-xs text-gray-600 font-semibold">
                                            <span>Shipping</span>
                                            <span>${Number(order.shipping_cost || 0).toFixed(2)}</span>
                                        </div>
                                    </div>
                                    <div className="flex justify-between text-sm font-black border-t pt-2 mt-2">
                                        <span>Total Amount</span>
                                        <span className="text-rose-600">${Number(order.total_amount ?? order.total ?? 0).toFixed(2)}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Items List */}
                            <div className="mt-8 pt-6 border-t">
                                <h3 className="text-xs font-black tracking-widest text-gray-400 uppercase mb-4">Items in Package ({order.items?.length || 0})</h3>
                                <div className="divide-y">
                                    {(order.items || []).map(it => (
                                        <div key={it.id} className="py-3 flex items-center justify-between gap-4">
                                            <div className="flex items-center gap-3">
                                                <img 
                                                    src={it.product?.images?.[0]?.image_url || it.product?.images?.[0]?.url || 'https://via.placeholder.com/60'} 
                                                    alt={it.product_name_snapshot || it.product?.name}
                                                    className="w-12 h-12 object-contain bg-gray-50 rounded-lg border p-1"
                                                />
                                                <div>
                                                    <div className="font-bold text-sm text-slate-900">{it.product_name_snapshot || it.product?.name}</div>
                                                    <div className="text-xs text-gray-500 font-semibold">Size {it.size || it.product_variant?.size_value} • {it.color || it.product_variant?.color_name} • Qty {it.quantity}</div>
                                                </div>
                                            </div>
                                            <div className="text-sm font-black">${Number(it.unit_price || it.price_snapshot).toFixed(2)}</div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </StorefrontLayout>
    );
}
