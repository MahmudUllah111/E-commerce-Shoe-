import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';

export default function Index({ orders, filters = {}, statuses }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [status, setStatus] = useState(filters.status || 'all');
    const [dateFrom, setDateFrom] = useState(filters.date_from || '');
    const [dateTo, setDateTo] = useState(filters.date_to || '');

    useEffect(()=>{
        if (search === (filters.search||'')) return;
        const t=setTimeout(()=> router.get(route('admin.orders.index'), {...filters, search, page:1}, {preserveState:true, replace:true}),400);
        return ()=>clearTimeout(t);
    },[search]);

    const applyFilters = (over={}) => {
        router.get(route('admin.orders.index'), { search: search || undefined, status: status!=='all'?status:undefined, date_from: dateFrom||undefined, date_to: dateTo||undefined, ...over, page:1 }, {preserveState:true, replace:true});
    };

    const rows = orders.data || [];

    return (
        <AdminLayout header="Order Management">
            {flash?.success && <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.success}</div>}
            {flash?.error && <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.error}</div>}

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                <div className="flex flex-col lg:flex-row gap-3 lg:items-end">
                    <div className="flex-1 relative">
                        <div className="text-xs font-bold uppercase text-gray-500 mb-1">Search</div>
                        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Order #, customer name, email, phone..." className="w-full pl-9 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                        <svg className="absolute left-3 bottom-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase text-gray-500 mb-1">Status</div>
                        <select value={status} onChange={e=>{setStatus(e.target.value); router.get(route('admin.orders.index'), {...filters, status: e.target.value!=='all'?e.target.value:undefined, search: search||undefined, date_from: dateFrom||undefined, date_to: dateTo||undefined, page:1}, {preserveState:true, replace:true});}} className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold min-w-[160px] focus:border-rose-500 outline-none">
                            <option value="all">All Statuses</option>
                            {(statuses||['pending','processing','shipped','delivered','cancelled','refunded']).map(s=> <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase text-gray-500 mb-1">From</div>
                        <input type="date" value={dateFrom} onChange={e=>setDateFrom(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 outline-none" />
                    </div>
                    <div>
                        <div className="text-xs font-bold uppercase text-gray-500 mb-1">To</div>
                        <input type="date" value={dateTo} onChange={e=>setDateTo(e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 outline-none" />
                    </div>
                    <button onClick={()=>applyFilters()} className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-black">Filter</button>
                    <button onClick={()=>{setSearch(''); setStatus('all'); setDateFrom(''); setDateTo(''); router.get(route('admin.orders.index'), {}, {preserveState:false});}} className="px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-bold">Clear</button>
                </div>
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b text-[11px] tracking-widest font-black text-gray-500 uppercase">
                                <th className="px-4 py-3">Order #</th>
                                <th className="px-4 py-3">Customer</th>
                                <th className="px-4 py-3">Date</th>
                                <th className="px-4 py-3">Total</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Payment</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length===0 ? (
                                <tr><td colSpan={7} className="px-4 py-12 text-center text-gray-400 font-semibold">No orders found.</td></tr>
                            ) : rows.map(o=> (
                                <tr key={o.id} className="border-b border-gray-100 hover:bg-gray-50/70">
                                    <td className="px-4 py-3 font-mono font-black text-slate-900">{o.order_number}</td>
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-slate-900">{o.customer_name}</div>
                                        <div className="text-xs text-gray-500 font-semibold">{o.customer_email}</div>
                                    </td>
                                    <td className="px-4 py-3 font-semibold text-gray-700">{new Date(o.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3 font-black">${Number(o.total_amount ?? o.total ?? 0).toFixed(2)}</td>
                                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase border ${o.status==='delivered'?'bg-green-100 text-green-700 border-green-200': o.status==='shipped'?'bg-blue-100 text-blue-700 border-blue-200': o.status==='cancelled'?'bg-red-100 text-red-700 border-red-200': o.status==='refunded'?'bg-slate-800 text-white': o.status==='processing'?'bg-amber-100 text-amber-700 border-amber-200':'bg-gray-100 text-gray-700 border-gray-200'}`}>{o.status}</span></td>
                                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-bold ${o.payment_status==='paid'?'bg-green-50 text-green-700 border border-green-200':'bg-amber-50 text-amber-700 border border-amber-200'}`}>{o.payment_status}</span></td>
                                    <td className="px-4 py-3 text-right"><Link href={route('admin.orders.show', o.id)} className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-black">View</Link></td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {orders.links && (
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-t">
                        <div className="text-xs font-bold text-gray-500">Showing {orders.from??0} to {orders.to??0} of {orders.total} orders</div>
                        <div className="flex flex-wrap gap-1.5">
                            {orders.links.map((link,i)=> link.url ? (
                                <Link key={i} href={link.url} dangerouslySetInnerHTML={{__html:link.label}} className={`px-3 py-1.5 rounded-md text-xs font-black border ${link.active ? 'bg-slate-900 text-white border-slate-900':'bg-white border-gray-200 hover:bg-slate-900 hover:text-white'}`} />
                            ): <span key={i} dangerouslySetInnerHTML={{__html:link.label}} className="px-3 py-1.5 rounded-md text-xs font-bold bg-gray-100 text-gray-400 border border-gray-200" /> )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
