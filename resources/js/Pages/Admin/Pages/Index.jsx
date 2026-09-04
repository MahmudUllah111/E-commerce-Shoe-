import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Index({ pages }){
    const { flash } = usePage().props;
    const [creating,setCreating]=useState(false);
    const [form,setForm]=useState({title:'',slug:'',content:''});

    const handleCreate=(e)=>{
        e.preventDefault();
        if(!form.title || !form.slug){ toast.error('Title and slug required'); return; }
        router.post(route('admin.pages.store'), form, {
            preserveScroll:true,
            onSuccess:()=> { toast.success('Page created'); setCreating(false); setForm({title:'',slug:'',content:''}); },
            onError:(errs)=> toast.error(Object.values(errs)[0]||'Failed')
        });
    };
    const handleDelete=(id)=>{
        if(!confirm('Delete this page?')) return;
        router.delete(route('admin.pages.destroy', id), { preserveScroll:true, onSuccess:()=> toast.success('Deleted') });
    };
    return (
        <AdminLayout header="CMS — Static Pages">
            {flash?.success && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-bold">{flash.success}</div>}
            <div className="flex justify-between items-center mb-4">
                <p className="text-sm text-gray-600 font-semibold">Manage About / FAQ / Policy and other static pages shown in storefront footer.</p>
                <button onClick={()=>setCreating(!creating)} className="px-4 py-2 bg-slate-900 text-white rounded-full text-sm font-black">{creating?'Close':'＋ New Page'}</button>
            </div>
            {creating && (
                <form onSubmit={handleCreate} className="bg-white border border-gray-200 rounded-xl p-5 mb-6 space-y-3">
                    <div className="grid md:grid-cols-2 gap-3">
                        <div><label className="text-xs font-black uppercase text-gray-500">Title *</label><input value={form.title} onChange={e=>setForm({...form,title:e.target.value})} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm font-semibold" placeholder="About Us" /></div>
                        <div><label className="text-xs font-black uppercase text-gray-500">Slug *</label><input value={form.slug} onChange={e=>setForm({...form,slug:e.target.value})} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm font-mono" placeholder="about" /></div>
                    </div>
                    <div><label className="text-xs font-black uppercase text-gray-500">Content (HTML allowed)</label><textarea value={form.content} onChange={e=>setForm({...form,content:e.target.value})} rows={4} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm" placeholder="<h1>Title</h1><p>...</p>" /></div>
                    <button type="submit" className="px-6 py-2.5 bg-rose-600 text-white rounded-full font-black text-sm">Create Page</button>
                </form>
            )}
            {pages.length===0 ? (
                <div className="bg-white border border-dashed rounded-xl p-10 text-center text-sm font-semibold text-gray-500">No pages yet — seed defaults or create one.</div>
            ) : (
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead className="bg-gray-50 border-b text-gray-500 font-black">
                                <tr><th className="px-4 py-3 text-left">Title</th><th className="px-4 py-3 text-left">Slug</th><th className="px-4 py-3 text-left">Updated</th><th className="px-4 py-3 text-right">Actions</th></tr>
                            </thead>
                            <tbody>
                                {pages.map(p=> (
                                    <tr key={p.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-bold">{p.title}</td>
                                        <td className="px-4 py-3 font-mono text-xs text-gray-600">/pages/{p.slug}</td>
                                        <td className="px-4 py-3 text-xs font-semibold text-gray-500">{new Date(p.updated_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 text-right space-x-2">
                                            <Link href={route('admin.pages.edit', p.id)} className="inline-flex px-3 py-1 border rounded-full text-xs font-black hover:bg-slate-900 hover:text-white">Edit</Link>
                                            <a href={`/pages/${p.slug}`} target="_blank" className="inline-flex px-3 py-1 border rounded-full text-xs font-bold hover:bg-gray-100">View</a>
                                            <button onClick={()=>handleDelete(p.id)} className="inline-flex px-3 py-1 border border-rose-200 text-rose-600 rounded-full text-xs font-bold hover:bg-rose-50">Delete</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}
        </AdminLayout>
    );
}
