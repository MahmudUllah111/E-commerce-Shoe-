import AdminLayout from '@/Layouts/AdminLayout';
import { router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

function formatCurrency(n){ return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n||0)); }

export default function Index({ summary, daily, bestSelling, filters, categories, products }){
    const [from,setFrom]=useState(filters.from);
    const [to,setTo]=useState(filters.to);
    const [cat,setCat]=useState(filters.category_id||'');
    const [prod,setProd]=useState(filters.product_id||'');

    const apply=()=>{
        router.get(route('admin.reports.index'), { from, to, category_id: cat||undefined, product_id: prod||undefined }, {preserveState:true});
    };
    const exportCsv=()=>{
        const params = new URLSearchParams({from, to});
        if(cat) params.set('category_id', cat);
        if(prod) params.set('product_id', prod);
        window.location.href = route('admin.reports.export') + '?' + params.toString();
        toast.success('Downloading CSV…');
    };

    return (
        <AdminLayout header="Reports — Sales">
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-3 items-end">
                    <div>
                        <label className="text-xs font-black uppercase text-gray-500">From</label>
                        <input type="date" value={from} onChange={e=>setFrom(e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm font-semibold" />
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase text-gray-500">To</label>
                        <input type="date" value={to} onChange={e=>setTo(e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm font-semibold" />
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase text-gray-500">Category</label>
                        <select value={cat} onChange={e=>setCat(e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm font-semibold">
                            <option value="">All categories</option>
                            {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase text-gray-500">Product</label>
                        <select value={prod} onChange={e=>setProd(e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm font-semibold">
                            <option value="">All products</option>
                            {products.map(p=> <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                    <div className="flex gap-2">
                        <button onClick={apply} className="flex-1 px-4 py-2.5 bg-slate-900 text-white rounded-full text-sm font-black">Apply</button>
                        <button onClick={exportCsv} className="px-4 py-2.5 border border-emerald-200 bg-emerald-50 text-emerald-700 rounded-full text-sm font-black hover:bg-emerald-100">Export CSV</button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="text-xs font-black uppercase text-gray-500">Total Sales</div>
                    <div className="text-2xl font-black mt-1">{formatCurrency(summary.total_sales)}</div>
                    <div className="text-xs font-semibold text-gray-500 mt-1">{summary.from} → {summary.to}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="text-xs font-black uppercase text-gray-500">Total Orders</div>
                    <div className="text-2xl font-black mt-1">{summary.total_orders}</div>
                    <div className="text-xs font-semibold text-gray-500 mt-1">Orders in selected range</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5">
                    <div className="text-xs font-black uppercase text-gray-500">Avg Order Value</div>
                    <div className="text-2xl font-black mt-1">{formatCurrency(summary.avg_order_value)}</div>
                    <div className="text-xs font-semibold text-gray-500 mt-1">Total sales ÷ orders</div>
                </div>
            </div>

            {daily.length>0 && (
                <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                    <h3 className="font-black text-sm mb-3">Daily Sales</h3>
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b font-black text-gray-500"><tr><th className="px-3 py-2 text-left">Date</th><th className="px-3 py-2 text-right">Sales</th><th className="px-3 py-2 text-right">Orders</th></tr></thead>
                            <tbody>
                                {daily.slice(0,30).map(d=> (
                                    <tr key={d.date} className="border-b hover:bg-gray-50"><td className="px-3 py-2 font-semibold">{d.date}</td><td className="px-3 py-2 text-right font-bold">{formatCurrency(d.sales)}</td><td className="px-3 py-2 text-right">{d.orders}</td></tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {daily.length>30 && <div className="text-xs text-gray-500 mt-2 font-semibold">Showing 30 of {daily.length} days</div>}
                </div>
            )}

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="px-5 py-4 border-b flex justify-between items-center">
                    <h3 className="font-black text-sm">Best-Selling Products</h3>
                    <span className="text-xs font-bold text-gray-500">Sorted by quantity sold</span>
                </div>
                {bestSelling.length===0 ? (
                    <div className="p-10 text-center text-sm font-semibold text-gray-500 border-dashed">No sales in this range • Try adjusting filters</div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b font-black text-gray-500">
                                <tr><th className="px-4 py-3 text-left">#</th><th className="px-4 py-3 text-left">Product</th><th className="px-4 py-3 text-left">Category</th><th className="px-4 py-3 text-right">Qty Sold</th><th className="px-4 py-3 text-right">Revenue</th><th className="px-4 py-3 text-right">Orders</th></tr>
                            </thead>
                            <tbody>
                                {bestSelling.map((r,i)=> (
                                    <tr key={r.product_id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-black text-gray-500">{i+1}</td>
                                        <td className="px-4 py-3"><div className="font-bold">{r.product_name}</div><div className="text-xs text-gray-500 font-mono">{r.product_slug}</div></td>
                                        <td className="px-4 py-3 font-semibold text-gray-700">{r.category_name||'—'}</td>
                                        <td className="px-4 py-3 text-right font-black">{r.total_qty}</td>
                                        <td className="px-4 py-3 text-right font-bold">{formatCurrency(r.total_revenue)}</td>
                                        <td className="px-4 py-3 text-right">{r.orders_count}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
