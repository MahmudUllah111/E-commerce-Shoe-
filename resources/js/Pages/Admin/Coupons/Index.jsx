import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Index({ coupons, filters={} }){
    const { flash } = usePage().props;
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const [search, setSearch] = useState(filters.search || '');

    const form = useForm({
        code:'', type:'percentage', value:'', min_order_value:'', usage_limit:'', starts_at:'', expires_at:'', is_active:true
    });

    const startCreate=()=>{ setEditing(null); form.reset(); form.setData({code:'', type:'percentage', value:'', min_order_value:'', usage_limit:'', starts_at:'', expires_at:'', is_active:true}); setShowForm(true); };
    const startEdit=(c)=>{
        setEditing(c);
        form.setData({
            code:c.code||'',
            type: c.type || c.discount_type || 'percentage',
            value: c.value ?? c.discount_value ?? '',
            min_order_value: c.min_order_value ?? c.min_order_amount ?? '',
            usage_limit: c.usage_limit ?? '',
            starts_at: c.starts_at? c.starts_at.slice(0,16):'',
            expires_at: c.expires_at ? c.expires_at.slice(0,16) : c.valid_until ? c.valid_until.slice(0,16) : '',
            is_active: !!c.is_active
        });
        setShowForm(true);
    };

    const submit=(e)=>{
        e.preventDefault();
        if(editing){
            form.patch(route('admin.coupons.update', editing.id), { preserveScroll:true, onSuccess:()=>{toast.success('Coupon updated'); setShowForm(false);}, onError:(err)=> toast.error(Object.values(err)[0]||'Failed')});
        } else {
            form.post(route('admin.coupons.store'), { preserveScroll:true, onSuccess:()=>{toast.success('Coupon created'); setShowForm(false);}, onError:(err)=> toast.error(Object.values(err)[0]||'Failed')});
        }
    };
    const toggle=(c)=> router.post(route('admin.coupons.toggle', c.id), {}, { preserveScroll:true, onSuccess:()=> toast.success(c.is_active?'Deactivated':'Activated')});
    const destroy=(c)=>{ if(!confirm('Delete coupon '+c.code+'?')) return; router.delete(route('admin.coupons.destroy', c.id), { preserveScroll:true, onSuccess:()=> toast.success('Deleted')}); };
    const searchSubmit = (e)=>{ e.preventDefault(); router.get(route('admin.coupons.index'), {...filters, search: search||undefined, page:1}, {preserveState:true}); };

    const rows = coupons.data || [];
    return (
        <AdminLayout header="Coupon Management (3.8)">
            {flash?.success && <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.success}</div>}
            {flash?.error && <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.error}</div>}

            <div className="flex flex-wrap justify-between gap-3 mb-4">
                <form onSubmit={searchSubmit} className="flex gap-2">
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search code..." className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-medium w-64 focus:border-rose-500 outline-none" />
                    <button className="px-4 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-black">Search</button>
                </form>
                <button onClick={startCreate} className="px-5 py-2.5 bg-slate-900 text-white rounded-full font-black text-sm">+ New Coupon</button>
            </div>

            {showForm && (
                <form onSubmit={submit} className="bg-white border rounded-xl p-6 mb-6 space-y-4">
                    <h3 className="font-black">{editing?'Edit Coupon':'Create Coupon (code, type percentage/fixed, value, min_order_value, usage_limit, dates, is_active)'}</h3>
                    <div className="grid sm:grid-cols-3 gap-4">
                        <div><label className="text-xs font-bold uppercase text-gray-500">Code *</label><input value={form.data.code} onChange={e=>form.setData('code', e.target.value.toUpperCase())} placeholder="WELCOME10" className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-bold uppercase" />{form.errors.code && <div className="text-xs text-red-600">{form.errors.code}</div>}</div>
                        <div><label className="text-xs font-bold uppercase text-gray-500">Type *</label><select value={form.data.type} onChange={e=>form.setData('type', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold"><option value="percentage">Percentage</option><option value="fixed">Fixed</option></select>{form.errors.type && <div className="text-xs text-red-600">{form.errors.type}</div>}</div>
                        <div><label className="text-xs font-bold uppercase text-gray-500">Value * {form.data.type==='percentage'?'%':'$'}</label><input type="number" step="0.01" value={form.data.value} onChange={e=>form.setData('value', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold" />{form.errors.value && <div className="text-xs text-red-600">{form.errors.value}</div>}</div>
                        <div><label className="text-xs font-bold uppercase text-gray-500">Min Order Value</label><input type="number" step="0.01" value={form.data.min_order_value} onChange={e=>form.setData('min_order_value', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold" /></div>
                        <div><label className="text-xs font-bold uppercase text-gray-500">Usage Limit</label><input type="number" value={form.data.usage_limit} onChange={e=>form.setData('usage_limit', e.target.value)} placeholder="null = unlimited" className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold" /></div>
                        <div className="flex items-center gap-2 pt-6"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.data.is_active} onChange={e=>form.setData('is_active', e.target.checked)} /> Active</label></div>
                        <div><label className="text-xs font-bold uppercase text-gray-500">Starts At</label><input type="datetime-local" value={form.data.starts_at} onChange={e=>form.setData('starts_at', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" /></div>
                        <div><label className="text-xs font-bold uppercase text-gray-500">Expires At</label><input type="datetime-local" value={form.data.expires_at} onChange={e=>form.setData('expires_at', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm" /></div>
                    </div>
                    <div className="flex gap-2"><button disabled={form.processing} className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-black text-sm disabled:opacity-60">{editing?'Update':'Create'}</button><button type="button" onClick={()=>setShowForm(false)} className="px-6 py-2.5 bg-white border rounded-full font-bold text-sm">Cancel</button></div>
                </form>
            )}

            <div className="bg-white border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead><tr className="bg-gray-50 border-b text-[11px] tracking-widest font-black text-gray-500 uppercase">
                            <th className="px-4 py-3">Code</th><th className="px-4 py-3">Type</th><th className="px-4 py-3">Value</th><th className="px-4 py-3">Min</th><th className="px-4 py-3">Usage</th><th className="px-4 py-3">Dates</th><th className="px-4 py-3">Active</th><th className="px-4 py-3 text-right">Actions</th>
                        </tr></thead>
                        <tbody>
                            {rows.length===0 ? <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 font-semibold">No coupons.</td></tr> :
                            rows.map(c=>(
                                <tr key={c.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-mono font-black">{c.code}</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded text-xs font-bold border ${ (c.type||c.discount_type)==='percentage'?'bg-blue-50 text-blue-700 border-blue-200':'bg-amber-50 text-amber-700 border-amber-200'}`}>{c.type || c.discount_type}</span></td>
                                    <td className="px-4 py-3 font-black">{ (c.type||c.discount_type)==='percentage' ? `${Number(c.value ?? c.discount_value).toFixed(0)}%` : `$${Number(c.value ?? c.discount_value).toFixed(2)}` }</td>
                                    <td className="px-4 py-3 font-semibold">${Number(c.min_order_value ?? c.min_order_amount ?? 0).toFixed(2)}</td>
                                    <td className="px-4 py-3 font-semibold">{c.times_used ?? 0}{c.usage_limit ? ` / ${c.usage_limit}` : ' / ∞'} {c.usage_limit && c.times_used>=c.usage_limit && <span className="text-red-600">• limit reached</span>}</td>
                                    <td className="px-4 py-3 text-xs font-semibold text-gray-600">{c.starts_at? new Date(c.starts_at).toLocaleDateString(): '—'} → {c.expires_at? new Date(c.expires_at).toLocaleDateString() : c.valid_until? new Date(c.valid_until).toLocaleDateString() : '∞'}</td>
                                    <td className="px-4 py-3"><button onClick={()=>toggle(c)} className={`px-2 py-1 rounded-full text-[11px] font-black border ${c.is_active?'bg-green-100 text-green-700 border-green-200':'bg-gray-100 text-gray-500 border-gray-200'}`}>{c.is_active?'ACTIVE':'INACTIVE'}</button></td>
                                    <td className="px-4 py-3 text-right flex justify-end gap-1.5">
                                        <button onClick={()=>startEdit(c)} className="px-3 py-1.5 bg-white border rounded-md text-xs font-bold">Edit</button>
                                        <button onClick={()=>destroy(c)} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-md text-xs font-bold">Delete</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {coupons.links && <div className="flex gap-1.5 flex-wrap px-4 py-3 bg-gray-50 border-t">{coupons.links.map((l,i)=> l.url ? <Link key={i} href={l.url} dangerouslySetInnerHTML={{__html:l.label}} className={`px-3 py-1.5 rounded-md text-xs font-black border ${l.active?'bg-slate-900 text-white':'bg-white hover:bg-slate-900 hover:text-white'}`} /> : <span key={i} dangerouslySetInnerHTML={{__html:l.label}} className="px-3 py-1.5 rounded-md text-xs font-bold bg-gray-100 text-gray-400 border" /> )}</div>}
            </div>
        </AdminLayout>
    )
}
