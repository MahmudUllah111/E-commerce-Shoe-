import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Link } from '@inertiajs/react';

export default function OrderShow({ order, timeline=[] }){
    return (
        <StorefrontLayout>
            <div className="max-w-4xl mx-auto px-6 py-8">
                <Link href="/account/orders" className="text-sm font-bold hover:text-rose-600">← Back to orders</Link>
                <div className="mt-4 bg-white border rounded-xl p-6">
                    <div className="flex flex-wrap justify-between items-center gap-4">
                        <div><h1 className="text-2xl font-black font-mono">{order.order_number}</h1><div className="text-sm text-gray-500 font-semibold">{new Date(order.created_at).toLocaleString()} • {order.payment_method} • {order.payment_status}</div></div>
                        <div className="flex items-center gap-2 flex-wrap">
                            <a href={`/orders/${order.order_number}/invoice`} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-slate-800 hover:bg-gray-50 flex items-center gap-1 shadow-sm transition">
                                📄 Invoice PDF
                            </a>
                            <a href={`/orders/${order.order_number}/packing-slip`} className="px-3 py-1.5 bg-white border border-gray-300 rounded-lg text-xs font-bold text-slate-800 hover:bg-gray-50 flex items-center gap-1 shadow-sm transition">
                                📦 Packing Slip
                            </a>
                            <span className={`h-fit px-3 py-1 rounded-full text-xs font-black uppercase border ${order.status==='delivered'?'bg-green-100 text-green-700 border-green-200': order.status==='shipped'?'bg-blue-100 text-blue-700':'bg-gray-100'}`}>{order.status}</span>
                        </div>
                    </div>

                    {/* Status Timeline */}
                    <div className="mt-8">
                        <h3 className="font-black text-sm mb-4">Status Timeline</h3>
                        <div className="flex items-center gap-0 overflow-x-auto pb-2">
                            {timeline.map((t,i)=>(
                                <div key={i} className="flex items-center flex-1">
                                    <div className="flex flex-col items-center">
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-black border-2 ${t.done ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-400 border-gray-200'} ${t.active ? 'ring-4 ring-slate-900/20':''}`}>{t.done ? '✓' : i+1}</div>
                                        <div className={`text-[11px] font-black uppercase mt-1 ${t.active? 'text-slate-900': t.done? 'text-green-700':'text-gray-400'}`}>{t.label}</div>
                                        {t.date && <div className="text-[10px] text-gray-500 font-semibold">{new Date(t.date).toLocaleDateString()}</div>}
                                    </div>
                                    {i < timeline.length-1 && <div className={`flex-1 h-1 mx-2 rounded ${t.done ? 'bg-slate-900' : 'bg-gray-200'}`} />}
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-8 grid md:grid-cols-2 gap-6 text-sm">
                        <div className="bg-gray-50 border rounded-xl p-4">
                            <div className="font-black">Shipping Address</div>
                            <div className="mt-2 text-gray-700 font-medium">{order.shipping_address}</div>
                            <div className="mt-2 text-xs font-semibold text-gray-500">{order.shipping_method}</div>
                        </div>
                        <div className="bg-gray-50 border rounded-xl p-4">
                            <div className="font-black">Summary</div>
                            <div className="mt-2 space-y-1 font-semibold">
                                <div className="flex justify-between"><span className="text-gray-600">Subtotal</span><span>${Number(order.subtotal||0).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Shipping</span><span>${Number(order.shipping_cost||0).toFixed(2)}</span></div>
                                <div className="flex justify-between"><span className="text-gray-600">Tax</span><span>${Number(order.tax ?? order.tax_amount ?? 0).toFixed(2)}</span></div>
                                {Number(order.discount_amount||0)>0 && <div className="flex justify-between text-green-700"><span>Discount {order.coupon_code? `(${order.coupon_code})`:''}</span><span>- ${Number(order.discount_amount).toFixed(2)}</span></div>}
                                <div className="flex justify-between font-black border-t pt-2 text-base"><span>Total</span><span className="text-rose-600">${Number(order.total_amount ?? order.total ?? 0).toFixed(2)}</span></div>
                            </div>
                        </div>
                    </div>

                    <div className="mt-8">
                        <h3 className="font-black">Items ({order.items?.length || 0})</h3>
                        <div className="mt-3 divide-y border rounded-xl overflow-hidden">
                            {(order.items||[]).map(it=>(
                                <div key={it.id} className="flex gap-4 p-4 bg-white">
                                    <img src={it.product?.images?.[0]?.image_url || it.product?.images?.[0]?.url || 'https://via.placeholder.com/150'} className="w-16 h-16 object-contain bg-gray-50 border rounded-lg" />
                                    <div className="flex-1">
                                        <div className="font-bold text-sm">{it.product_name_snapshot || it.product?.name}</div>
                                        <div className="text-xs text-gray-500 font-semibold">Size {it.size} • {it.color} • Qty {it.quantity}</div>
                                    </div>
                                    <div className="font-black text-sm">${Number(it.unit_price).toFixed(2)} <span className="text-gray-500 font-semibold">×{it.quantity}</span></div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    )
}
