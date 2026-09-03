import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Link } from '@inertiajs/react';

export default function OrderSuccess({ order }) {
    if (!order) return <StorefrontLayout><div className="max-w-3xl mx-auto py-16 text-center">Order not found</div></StorefrontLayout>;
    return (
        <StorefrontLayout>
            <div className="max-w-4xl mx-auto px-6 py-10">
                <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center">
                    <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto text-3xl">✓</div>
                    <h1 className="text-3xl font-black mt-4">Order Confirmed!</h1>
                    <p className="text-gray-600 mt-2 font-semibold">Thank you for shopping with TrustedMart</p>
                    <div className="mt-4 inline-flex flex-col items-center bg-gray-50 border border-gray-200 rounded-xl px-6 py-3">
                        <div className="text-xs font-bold tracking-widest text-gray-500 uppercase">Order Number</div>
                        <div className="text-xl font-black tracking-wide">{order.order_number}</div>
                        <div className="text-xs text-gray-500 font-semibold mt-1">Placed on {new Date(order.created_at).toLocaleString()}</div>
                    </div>
                    <div className="mt-4 flex justify-center gap-2">
                        <span className={`px-3 py-1.5 rounded-full text-xs font-black uppercase ${order.status==='pending'?'bg-amber-100 text-amber-700': order.status==='processing'?'bg-blue-100 text-blue-700':'bg-green-100 text-green-700'}`}>{order.status}</span>
                        <span className="px-3 py-1.5 rounded-full text-xs font-black uppercase bg-slate-900 text-white">{order.shipping_method}</span>
                    </div>
                </div>

                <div className="mt-6 bg-white border border-gray-200 rounded-2xl p-6">
                    <h3 className="font-black">Order Details</h3>
                    <div className="mt-3 grid sm:grid-cols-2 gap-4 text-sm">
                        <div>
                            <div className="text-xs font-bold uppercase text-gray-500">Customer</div>
                            <div className="font-bold">{order.customer_name}</div>
                            <div className="text-gray-600 font-semibold">{order.customer_email} • {order.customer_phone}</div>
                        </div>
                        <div>
                            <div className="text-xs font-bold uppercase text-gray-500">Shipping Address</div>
                            <div className="font-semibold text-gray-800">{order.shipping_address}</div>
                        </div>
                    </div>

                    <div className="mt-6 divide-y border-t">
                        {order.items?.map(it=> (
                            <div key={it.id} className="flex gap-4 py-4">
                                <img src={it.product?.images?.[0]?.image_url || it.product?.images?.[0]?.url || 'https://via.placeholder.com/80'} alt={it.product_name_snapshot} className="w-16 h-16 object-contain bg-gray-50 rounded border" />
                                <div className="flex-1">
                                    <div className="font-bold text-sm">{it.product_name_snapshot || it.product?.name}</div>
                                    <div className="text-xs text-gray-500 font-semibold">Size {it.size} • {it.color} × {it.quantity}</div>
                                </div>
                                <div className="text-sm font-black">${Number(it.unit_price || it.price_snapshot).toFixed(2)} <span className="text-gray-500 font-semibold">× {it.quantity}</span> = ${Number((it.unit_price || it.price_snapshot)*it.quantity).toFixed(2)}</div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-sm">
                        <div className="flex justify-between"><span className="text-gray-600 font-semibold">Subtotal</span><span className="font-bold">${Number(order.subtotal).toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600 font-semibold">Discount {order.coupon_code && `(${order.coupon_code})`}</span><span className="font-bold">- ${Number(order.discount_amount||0).toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600 font-semibold">Shipping</span><span className="font-bold">${Number(order.shipping_cost).toFixed(2)}</span></div>
                        <div className="flex justify-between"><span className="text-gray-600 font-semibold">Tax</span><span className="font-bold">${Number(order.tax ?? order.tax_amount ?? 0).toFixed(2)}</span></div>
                        <div className="flex justify-between text-base font-black border-t pt-2"><span>Total</span><span className="text-rose-600">${Number(order.total_amount ?? order.total).toFixed(2)}</span></div>
                        <div className="text-xs text-gray-500 font-semibold">Payment: {order.payment_method} • {order.payment_status}</div>
                    </div>

                    {/* Documents Download Box */}
                    <div className="mt-6 bg-slate-50 border border-slate-200 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
                        <div className="text-left">
                            <div className="font-bold text-sm text-slate-900">Official Order Documents</div>
                            <div className="text-xs text-gray-500 font-medium">A copy has been sent to {order.customer_email}. You can also download them here.</div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                            <a href={`/orders/${order.order_number}/invoice`} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-slate-800 hover:bg-gray-100 flex items-center gap-1.5 shadow-sm transition">
                                📄 Invoice PDF
                            </a>
                            <a href={`/orders/${order.order_number}/packing-slip`} className="px-4 py-2 bg-white border border-gray-300 rounded-lg text-xs font-bold text-slate-800 hover:bg-gray-100 flex items-center gap-1.5 shadow-sm transition">
                                📦 Packing Slip
                            </a>
                        </div>
                    </div>

                    <div className="mt-6 flex flex-wrap gap-3 justify-center">
                        <Link href="/products" className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-bold">Continue Shopping</Link>
                        <Link href={route('orders.track', order.order_number)} className="px-6 py-2.5 bg-white border border-gray-200 rounded-full font-bold">Track Order</Link>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
