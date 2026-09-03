import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { useState, useEffect } from 'react';
import toast from 'react-hot-toast';

export default function Index({ customers, filters={} }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [blocked, setBlocked] = useState(filters.blocked || 'all');

    useEffect(()=>{
        if(search === (filters.search||'')) return;
        const t=setTimeout(()=> router.get(route('admin.customers.index'), {...filters, search, blocked: blocked!=='all'?blocked:undefined, page:1}, {preserveState:true, replace:true}),400);
        return ()=>clearTimeout(t);
    },[search]);

    const toggleBlock = (id, isBlocked)=>{
        router.post(route('admin.customers.toggleBlock', id), {}, { preserveScroll:true, onSuccess:()=> toast.success(isBlocked?'Unblocked':'Blocked')});
    };

    const rows = customers.data || [];
    return (
        <AdminLayout header="Customer Management (3.6)">
            {flash?.success && <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.success}</div>}

            <div className="bg-white border rounded-xl p-4 mb-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search name, email, phone..." className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:bg-white focus:border-rose-500 outline-none" />
                    <select value={blocked} onChange={e=>{setBlocked(e.target.value); router.get(route('admin.customers.index'), {search: search||undefined, blocked: e.target.value!=='all'?e.target.value:undefined, page:1}, {preserveState:true});}} className="px-3 py-2.5 bg-white border rounded-lg text-sm font-semibold">
                        <option value="all">All customers</option>
                        <option value="active">Active</option>
                        <option value="blocked">Blocked</option>
                    </select>
                </div>
                <div className="text-xs text-gray-500 mt-2 font-semibold">Showing {customers.from??0} to {customers.to??0} of {customers.total} customers • Includes order count + total spent</div>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead><tr className="bg-gray-50 border-b text-[11px] tracking-widest font-black text-gray-500 uppercase">
                            <th className="px-4 py-3">Customer</th><th className="px-4 py-3">Orders</th><th className="px-4 py-3">Total Spent</th><th className="px-4 py-3">Joined</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
                        </tr></thead>
                        <tbody>
                            {rows.length===0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 font-semibold">No customers found.</td></tr> :
                            rows.map(c=>(
                                <tr key={c.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-slate-900">{c.name}</div>
                                        <div className="text-xs text-gray-500 font-semibold">{c.email} {c.phone? `• ${c.phone}`:''}</div>
                                    </td>
                                    <td className="px-4 py-3 font-black">{c.orders_count}</td>
                                    <td className="px-4 py-3 font-black">${Number(c.total_spent||0).toFixed(2)}</td>
                                    <td className="px-4 py-3 font-semibold text-gray-600">{new Date(c.created_at).toLocaleDateString()}</td>
                                    <td className="px-4 py-3">{c.is_blocked ? <span className="px-2 py-1 rounded-full text-[11px] font-black bg-red-100 text-red-700 border border-red-200">BLOCKED</span> : <span className="px-2 py-1 rounded-full text-[11px] font-black bg-green-100 text-green-700 border border-green-200">ACTIVE</span>}</td>
                                    <td className="px-4 py-3 text-right flex justify-end gap-2">
                                        <Link href={route('admin.customers.show', c.id)} className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-black">View</Link>
                                        <button onClick={()=>toggleBlock(c.id, c.is_blocked)} className={`px-3 py-1.5 rounded-md text-xs font-bold border ${c.is_blocked?'bg-white border-gray-200':'bg-amber-50 text-amber-700 border-amber-200'}`}>{c.is_blocked?'Unblock':'Block'}</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {customers.links && <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-t">
                    <div className="text-xs font-bold text-gray-500">Total {customers.total} customers</div>
                    <div className="flex gap-1.5 flex-wrap">{customers.links.map((link,i)=> link.url ? <Link key={i} href={link.url} dangerouslySetInnerHTML={{__html:link.label}} className={`px-3 py-1.5 rounded-md text-xs font-black border ${link.active?'bg-slate-900 text-white':'bg-white hover:bg-slate-900 hover:text-white'}`} /> : <span key={i} dangerouslySetInnerHTML={{__html:link.label}} className="px-3 py-1.5 rounded-md text-xs font-bold bg-gray-100 text-gray-400 border" /> )}</div>
                </div>}
            </div>
        </AdminLayout>
    );
}
