import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Index({ reviews, filters={} }){
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search||'');
    const [status, setStatus] = useState(filters.status||'all');
    const [replyId, setReplyId] = useState(null);
    const replyForm = useForm({ admin_reply:'' });

    const apply = (over={})=> router.get(route('admin.reviews.index'), {search: search||undefined, status: status!=='all'?status:undefined, ...over, page:1}, {preserveState:true});

    const approve = (r)=> router.post(route('admin.reviews.approve', r.id), {}, { preserveScroll:true, onSuccess:()=> toast.success('Approved')});
    const reject = (r)=> router.post(route('admin.reviews.reject', r.id), {}, { preserveScroll:true, onSuccess:()=> toast.success('Rejected')});
    const destroy = (r)=> { if(!confirm('Delete review?')) return; router.delete(route('admin.reviews.destroy', r.id), { preserveScroll:true, onSuccess:()=> toast.success('Deleted')}); };
    const submitReply = (r)=>{ replyForm.post(route('admin.reviews.reply', r.id), { preserveScroll:true, onSuccess:()=>{toast.success('Reply saved'); setReplyId(null); replyForm.reset();}, onError:(e)=> toast.error(Object.values(e)[0]||'Failed')}); };

    const rows = reviews.data || [];
    return (
        <AdminLayout header="Reviews Management (3.9)">
            {flash?.success && <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.success}</div>}

            <div className="bg-white border rounded-xl p-4 mb-4">
                <div className="flex flex-col md:flex-row gap-3">
                    <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Search product, customer, comment..." className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:bg-white focus:border-rose-500 outline-none" />
                    <select value={status} onChange={e=>{setStatus(e.target.value); router.get(route('admin.reviews.index'), {search:search||undefined, status:e.target.value!=='all'?e.target.value:undefined, page:1}, {preserveState:true});}} className="px-3 py-2.5 bg-white border rounded-lg text-sm font-semibold">
                        <option value="all">All status</option>
                        <option value="pending">Pending</option>
                        <option value="approved">Approved</option>
                        <option value="rejected">Rejected</option>
                    </select>
                    <button onClick={()=>apply()} className="px-5 py-2.5 bg-slate-900 text-white rounded-lg text-sm font-black">Filter</button>
                </div>
            </div>

            <div className="bg-white border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead><tr className="bg-gray-50 border-b text-[11px] tracking-widest font-black text-gray-500 uppercase">
                            <th className="px-4 py-3">Product</th><th className="px-4 py-3">Customer</th><th className="px-4 py-3">Rating</th><th className="px-4 py-3">Excerpt</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Actions</th>
                        </tr></thead>
                        <tbody>
                            {rows.length===0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 font-semibold">No reviews.</td></tr> :
                            rows.map(r=>(
                                <tr key={r.id} className="border-b hover:bg-gray-50 align-top">
                                    <td className="px-4 py-3">
                                        <div className="font-bold text-slate-900 line-clamp-1">{r.product?.name || `Product #${r.product_id}`}</div>
                                        <Link href={`/product/${r.product?.slug || r.product_id}`} className="text-xs font-bold text-rose-600">View →</Link>
                                    </td>
                                    <td className="px-4 py-3">
                                        <div className="font-bold">{r.user?.name || r.author_name || r.user_name}</div>
                                        <div className="text-xs text-gray-500 font-semibold">{r.user?.email || ''}</div>
                                    </td>
                                    <td className="px-4 py-3"><span className="font-black">{r.rating}★</span></td>
                                    <td className="px-4 py-3 max-w-[260px]"><p className="line-clamp-2 text-gray-700 font-medium">{r.comment}</p>{r.admin_reply && <div className="mt-2 p-2 bg-slate-50 border rounded text-xs"><span className="font-black">Reply:</span> {r.admin_reply}</div>}</td>
                                    <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-[11px] font-black uppercase border ${r.status==='approved'?'bg-green-100 text-green-700 border-green-200': r.status==='pending'?'bg-amber-100 text-amber-700 border-amber-200':'bg-red-100 text-red-700 border-red-200'}`}>{r.status}</span></td>
                                    <td className="px-4 py-3 text-right">
                                        <div className="flex flex-col gap-1 items-end">
                                            <div className="flex gap-1">
                                                {r.status!=='approved' && <button onClick={()=>approve(r)} className="px-2 py-1 bg-green-600 text-white rounded text-xs font-bold">Approve</button>}
                                                {r.status!=='rejected' && <button onClick={()=>reject(r)} className="px-2 py-1 bg-amber-500 text-white rounded text-xs font-bold">Reject</button>}
                                                <button onClick={()=>destroy(r)} className="px-2 py-1 bg-red-50 text-red-600 border border-red-200 rounded text-xs font-bold">Delete</button>
                                            </div>
                                            {replyId===r.id ? (
                                                <div className="w-64">
                                                    <textarea value={replyForm.data.admin_reply} onChange={e=>replyForm.setData('admin_reply', e.target.value)} placeholder="Admin reply (shown publicly)" rows={2} className="w-full px-2 py-1.5 border rounded text-xs" />
                                                    <div className="flex gap-1 mt-1">
                                                        <button onClick={()=>submitReply(r)} disabled={replyForm.processing} className="px-2 py-1 bg-slate-900 text-white rounded text-xs font-bold">Save</button>
                                                        <button onClick={()=>setReplyId(null)} className="px-2 py-1 bg-white border rounded text-xs font-bold">Cancel</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <button onClick={()=>{setReplyId(r.id); replyForm.setData('admin_reply', r.admin_reply||'');}} className="text-xs font-bold text-slate-700 underline">{r.admin_reply ? 'Edit reply' : 'Reply'}</button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {reviews.links && <div className="flex gap-1.5 flex-wrap px-4 py-3 bg-gray-50 border-t">{reviews.links.map((l,i)=> l.url ? <Link key={i} href={l.url} dangerouslySetInnerHTML={{__html:l.label}} className={`px-3 py-1.5 rounded-md text-xs font-black border ${l.active?'bg-slate-900 text-white':'bg-white hover:bg-slate-900 hover:text-white'}`} /> : <span key={i} dangerouslySetInnerHTML={{__html:l.label}} className="px-3 py-1.5 rounded-md text-xs font-bold bg-gray-100 text-gray-400 border" /> )}</div>}
            </div>
        </AdminLayout>
    )
}
