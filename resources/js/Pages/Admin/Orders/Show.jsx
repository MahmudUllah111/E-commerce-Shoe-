import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, usePage, useForm } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Show({ order, stock_logs = [] }) {
    const { flash } = usePage().props;
    const [status, setStatus] = useState(order.status);
    const [sendEmail, setSendEmail] = useState(true);
    const [note, setNote] = useState('');
    const [showRefund, setShowRefund] = useState(false);
    const [refundReason, setRefundReason] = useState('');
    const [restock, setRestock] = useState(true);
    const [saving, setSaving] = useState(false);

    const updateStatus = () => {
        if (saving) return;
        setSaving(true);
        router.patch(route('admin.orders.status', order.id), { status, send_email: sendEmail, internal_note: note }, {
            preserveScroll:true,
            onSuccess:()=> { toast.success('Status updated'); setNote(''); },
            onError:(e)=> toast.error(Object.values(e)[0]||'Failed'),
            onFinish:()=> setSaving(false),
        });
    };

    const doRefund = () => {
        router.post(route('admin.orders.refund', order.id), { reason: refundReason, restock }, {
            preserveScroll:true,
            onSuccess:()=> { toast.success('Order refunded'); setShowRefund(false); },
            onError:(e)=> toast.error(Object.values(e)[0]||'Refund failed'),
        });
    };

    return (
        <AdminLayout header={`Order ${order.order_number}`}>
            {flash?.success && <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.success}</div>}
            {flash?.error && <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.error}</div>}

            <div className="grid lg:grid-cols-[1fr_380px] gap-6">
                <div className="space-y-6">
                    {/* Customer + Shipping */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6 grid sm:grid-cols-2 gap-6">
                        <div>
                            <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Customer</div>
                            <div className="font-black mt-1">{order.customer_name}</div>
                            <div className="text-sm text-gray-600 font-semibold">{order.customer_email}</div>
                            <div className="text-sm text-gray-600 font-semibold">{order.customer_phone}</div>
                            {order.user && <div className="text-xs text-gray-500 mt-1">User ID: {order.user.id}</div>}
                        </div>
                        <div>
                            <div className="text-xs font-bold uppercase tracking-widest text-gray-500">Shipping</div>
                            <div className="text-sm font-semibold mt-1">{order.shipping_address}</div>
                            <div className="text-sm mt-1"><span className="font-bold">Method:</span> {order.shipping_method}</div>
                            <div className="text-xs text-gray-500 mt-1">Placed: {new Date(order.created_at).toLocaleString()}</div>
                        </div>
                    </div>

                    {/* Items */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="font-black">Items • {order.items?.length} types • {order.items?.reduce((s,i)=>s+Number(i.quantity),0)} units</h3>
                        <div className="mt-4 divide-y border-t">
                            {order.items?.map(it=> {
                                const thumb = it.product?.images?.find(x=>x.is_primary)?.image_url || it.product?.images?.[0]?.image_url || it.product?.images?.[0]?.url || 'https://via.placeholder.com/120';
                                return (
                                    <div key={it.id} className="flex gap-4 py-4">
                                        <img src={thumb} alt={it.product_name_snapshot} className="w-20 h-20 object-contain bg-gray-50 rounded-lg border" />
                                        <div className="flex-1 min-w-0">
                                            <div className="font-bold text-sm">{it.product_name_snapshot || it.product?.name} <span className="text-xs font-mono text-gray-500">SKU {it.productVariant?.sku || it.product?.sku || '-'}</span></div>
                                            <div className="text-sm text-gray-600 font-semibold mt-1">Size <span className="text-slate-900 font-black">{it.size}</span> • Color {it.color} {it.productVariant?.color_hex && <span className="inline-block w-3 h-3 rounded-full border align-middle ml-1" style={{background: it.productVariant.color_hex}} />} • Qty {it.quantity}</div>
                                            <div className="text-xs text-gray-500 font-semibold">Variant stock now: {it.productVariant?.stock_quantity ?? '—'}</div>
                                        </div>
                                        <div className="text-right">
                                            <div className="text-sm font-black">${Number(it.unit_price ?? it.price_snapshot).toFixed(2)} × {it.quantity}</div>
                                            <div className="text-sm font-black text-rose-600">${Number((it.unit_price ?? it.price_snapshot) * it.quantity).toFixed(2)}</div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="mt-4 bg-gray-50 border border-gray-200 rounded-xl p-4 space-y-2 text-sm">
                            <div className="flex justify-between"><span className="text-gray-600 font-semibold">Subtotal</span><span className="font-bold">${Number(order.subtotal).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600 font-semibold">Discount {order.coupon_code && `(${order.coupon_code})`}</span><span className="font-bold">- ${Number(order.discount_amount||0).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600 font-semibold">Shipping</span><span className="font-bold">${Number(order.shipping_cost).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600 font-semibold">Tax</span><span className="font-bold">${Number(order.tax ?? order.tax_amount ?? 0).toFixed(2)}</span></div>
                            <div className="flex justify-between text-base font-black border-t pt-2"><span>Total</span><span className="text-rose-600">${Number(order.total_amount ?? order.total).toFixed(2)}</span></div>
                            <div className="text-xs font-semibold text-gray-500">Payment: {order.payment_method} • <span className={`px-2 py-0.5 rounded text-xs font-black ${order.payment_status==='paid'?'bg-green-100 text-green-700':'bg-amber-100 text-amber-700'}`}>{order.payment_status}</span></div>
                        </div>
                    </div>

                    {/* Stock logs */}
                    {stock_logs.length>0 && (
                        <div className="bg-white border border-gray-200 rounded-xl p-6">
                            <h3 className="font-black text-sm">Stock Logs (recent)</h3>
                            <div className="mt-3 overflow-x-auto">
                                <table className="w-full text-xs">
                                    <thead><tr className="text-gray-500 font-bold uppercase text-[11px]"><th className="text-left py-1">Variant</th><th className="text-center py-1">Change</th><th className="text-left py-1">Reason</th><th className="text-left py-1">When</th></tr></thead>
                                    <tbody>
                                        {stock_logs.map(l=> (
                                            <tr key={l.id} className="border-t"><td className="py-1 font-mono">{l.product_variant_id}</td><td className={`py-1 text-center font-black ${l.change_amount<0?'text-red-600':'text-green-600'}`}>{l.change_amount >0? '+':''}{l.change_amount}</td><td className="py-1">{l.reason}</td><td className="py-1 text-gray-500">{new Date(l.created_at).toLocaleDateString()}</td></tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}
                </div>

                {/* Actions Sidebar */}
                <div className="space-y-4">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="font-black text-sm">Update Status</h3>
                        <select value={status} onChange={e=>setStatus(e.target.value)} className="mt-3 w-full px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold focus:border-slate-900 outline-none">
                            {['pending','processing','shipped','delivered','cancelled','refunded'].map(s=> <option key={s} value={s}>{s}</option>)}
                        </select>
                        <label className="flex items-center gap-2 mt-3 text-sm font-semibold">
                            <input type="checkbox" checked={sendEmail} onChange={e=>setSendEmail(e.target.checked)} /> Send email to customer
                        </label>
                        <div className="mt-3">
                            <label className="text-xs font-bold uppercase text-gray-500">Internal Note</label>
                            <textarea value={note} onChange={e=>setNote(e.target.value)} rows={3} placeholder="Add note for team (not visible to customer)" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm focus:border-slate-900 outline-none" />
                        </div>
                        <button onClick={updateStatus} disabled={saving} className="mt-4 w-full py-2.5 bg-slate-900 text-white rounded-lg font-black hover:bg-black disabled:opacity-60">{saving ? 'Saving...' : 'Save Status'}</button>
                        <Link href={route('admin.orders.index')} className="mt-2 block text-center text-sm font-bold text-gray-600 hover:text-slate-900">← Back to Orders</Link>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="font-black text-sm">Documents</h3>
                        <div className="mt-3 grid grid-cols-2 gap-2">
                            <a href={route('admin.orders.invoice', order.id)} className="text-center px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:border-slate-900 hover:bg-slate-900 hover:text-white">Invoice PDF</a>
                            <a href={route('admin.orders.packing', order.id)} className="text-center px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:border-slate-900 hover:bg-slate-900 hover:text-white">Packing Slip</a>
                        </div>
                        <div className="text-xs text-gray-500 font-semibold mt-2">Via barryvdh/laravel-dompdf • A4 printable</div>
                    </div>

                    <div className="bg-white border border-red-200 rounded-xl p-6">
                        <h3 className="font-black text-sm text-red-700">Refund</h3>
                        {!showRefund ? (
                            <button onClick={()=>setShowRefund(true)} disabled={order.status==='refunded'} className="mt-3 w-full py-2.5 bg-white border border-red-200 text-red-600 rounded-lg font-black hover:bg-red-600 hover:text-white disabled:opacity-40">{order.status==='refunded' ? 'Already Refunded' : 'Refund Order'}</button>
                        ) : (
                            <div className="mt-3 space-y-3">
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">Reason</label>
                                    <textarea value={refundReason} onChange={e=>setRefundReason(e.target.value)} rows={2} className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" placeholder="Customer request..." />
                                </div>
                                <label className="flex items-center gap-2 text-sm font-semibold"><input type="checkbox" checked={restock} onChange={e=>setRestock(e.target.checked)} /> Restock items</label>
                                <div className="flex gap-2">
                                    <button onClick={doRefund} className="flex-1 py-2.5 bg-red-600 text-white rounded-lg font-black">Confirm Refund</button>
                                    <button onClick={()=>setShowRefund(false)} className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg font-bold">Cancel</button>
                                </div>
                            </div>
                        )}
                        <p className="text-xs text-gray-500 mt-2 font-semibold">Refund sets status refunded, payment refunded, optionally restocks and logs stock, sends email.</p>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
