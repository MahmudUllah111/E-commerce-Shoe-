import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import { Link, router, useForm, usePage } from '@inertiajs/react';

export default function Index({ brands, filters={}}){
    const { flash } = usePage().props;
    const [search, setSearch]=useState(filters.search||'');
    const [showForm, setShowForm]=useState(false);
    const [editing, setEditing]=useState(null);
    const [deleteTarget, setDeleteTarget]=useState(null);
    const [selected, setSelected]=useState([]);
    const form=useForm({ name:'', slug:'', is_active:true, logo:null });

    useEffect(()=>{
        const t=setTimeout(()=> {
            if(search !== (filters.search||'')) router.get(route('admin.brands.index'), { ...filters, search, page:1 }, { preserveState:true, replace:true });
        },400);
        return ()=> clearTimeout(t);
    },[search]);

    const openCreate=()=> { form.reset(); form.setData({ name:'', slug:'', is_active:true, logo:null}); setEditing(null); setShowForm(true); };
    const openEdit=(b)=> {
        setEditing(b);
        form.setData({ name:b.name, slug:b.slug, is_active:!!b.is_active, logo:null });
        setShowForm(true);
    };
    const submit=(e)=>{
        e.preventDefault();
        const opts={ forceFormData:true, onSuccess:()=> { setShowForm(false); setEditing(null);} };
        if(editing){
            form.transform(d=> ({...d, _method:'PUT'}));
            form.post(route('admin.brands.update', editing.id), opts);
        } else {
            form.post(route('admin.brands.store'), opts);
        }
    };
    const handleDelete=(b)=> router.delete(route('admin.brands.destroy', b.id), { onSuccess:()=> setDeleteTarget(null) });
    const handleBulk=(action)=>{
        if(!selected.length) return;
        router.post(route('admin.brands.bulk'), { ids:selected, action }, { onSuccess:()=> setSelected([]) });
    };
    const toggle=(id)=> setSelected(prev=> prev.includes(id) ? prev.filter(x=>x!==id): [...prev,id]);
    const allIds=(brands.data||[]).map(b=>b.id);
    const allSelected = allIds.length>0 && selected.length===allIds.length;

    return (
        <AdminLayout header="Brand Management">
            {flash?.success && <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.success}</div>}
            {flash?.error && <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.error}</div>}

            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                    <div className="relative flex-1 max-w-sm">
                        <input value={search} onChange={e=> setSearch(e.target.value)} placeholder="Search brands..." className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                        <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                    </div>
                    <button onClick={openCreate} className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-lg text-sm font-black transition">+ Add Brand</button>
                </div>
                {selected.length>0 && (
                    <div className="mt-3 flex items-center gap-2 bg-rose-50 border border-rose-200 rounded-lg px-4 py-2">
                        <span className="text-sm font-bold text-rose-700">{selected.length} selected</span>
                        <button onClick={()=> handleBulk('activate')} className="px-3 py-1 bg-white border border-gray-200 rounded-md text-xs font-black">Activate</button>
                        <button onClick={()=> handleBulk('deactivate')} className="px-3 py-1 bg-white border border-gray-200 rounded-md text-xs font-black">Deactivate</button>
                        <button onClick={()=> handleBulk('delete')} className="px-3 py-1 bg-red-600 text-white rounded-md text-xs font-black">Delete</button>
                        <button onClick={()=> setSelected([])} className="text-xs font-bold text-gray-600">Clear</button>
                    </div>
                )}
            </div>

            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-gray-50 border-b text-[11px] tracking-widest font-black text-gray-500 uppercase">
                            <tr>
                                <th className="px-4 py-3 w-10"><input type="checkbox" checked={allSelected} onChange={()=> setSelected(prev=> prev.length===allIds.length ? [] : allIds)} className="rounded border-gray-300 text-rose-600" /></th>
                                <th className="px-4 py-3">Brand</th>
                                <th className="px-4 py-3">Slug</th>
                                <th className="px-4 py-3">Products</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {(brands.data||[]).length===0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 font-semibold">No brands.</td></tr> :
                            brands.data.map(b=> (
                                <tr key={b.id} className="border-b border-gray-100 hover:bg-gray-50">
                                    <td className="px-4 py-3"><input type="checkbox" checked={selected.includes(b.id)} onChange={()=> toggle(b.id)} className="rounded border-gray-300 text-rose-600" /></td>
                                    <td className="px-4 py-3">
                                        <div className="flex items-center gap-3">
                                            {b.logo ? <img src={b.logo} className="w-10 h-10 object-contain bg-gray-50 rounded-lg border border-gray-100" /> : <div className="w-10 h-10 rounded-lg bg-gray-50 border flex items-center justify-center text-xs font-black text-gray-400">{b.name[0]}</div>}
                                            <span className="font-black text-slate-900">{b.name}</span>
                                        </div>
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs font-bold text-gray-600">/{b.slug}</td>
                                    <td className="px-4 py-3 font-bold">{b.products_count}</td>
                                    <td className="px-4 py-3"><span className={`px-2.5 py-1 rounded-full text-[11px] font-black uppercase ${b.is_active?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}`}>{b.is_active?'Active':'Inactive'}</span></td>
                                    <td className="px-4 py-3">
                                        <div className="flex justify-end gap-2">
                                            <button onClick={()=> openEdit(b)} className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-black hover:bg-slate-900 hover:text-white transition">Edit</button>
                                            <button onClick={()=> setDeleteTarget(b)} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-md text-xs font-black hover:bg-red-600 hover:text-white transition">Delete</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {brands.links && (
                    <div className="flex justify-between items-center px-4 py-3 bg-gray-50 border-t">
                        <div className="text-xs font-bold text-gray-500">{brands.total} brands</div>
                        <div className="flex gap-1">{brands.links.map((l,i)=> l.url ? <Link key={i} href={l.url} dangerouslySetInnerHTML={{__html:l.label}} className={`px-3 py-1.5 rounded-md text-xs font-black border ${l.active?'bg-slate-900 text-white border-slate-900':'bg-white border-gray-200 hover:bg-slate-900 hover:text-white'}`} /> : <span key={i} dangerouslySetInnerHTML={{__html:l.label}} className="px-3 py-1.5 rounded-md text-xs font-bold bg-gray-100 text-gray-400 border" />)}</div>
                    </div>
                )}
            </div>

            <Modal show={showForm} onClose={()=> setShowForm(false)} maxWidth="lg">
                <form onSubmit={submit} className="p-6 space-y-4">
                    <h3 className="text-lg font-black">{editing ? 'Edit Brand' : 'Add Brand'}</h3>
                    <div>
                        <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Name *</label>
                        <input value={form.data.name} onChange={e=> form.setData('name', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                        {form.errors.name && <p className="text-xs text-red-600 font-semibold mt-1">{form.errors.name}</p>}
                    </div>
                    <div>
                        <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Slug (auto if blank)</label>
                        <input value={form.data.slug} onChange={e=> form.setData('slug', e.target.value)} className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono font-semibold focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                    </div>
                    <div>
                        <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Logo</label>
                        <input type="file" accept="image/*" onChange={e=> form.setData('logo', e.target.files[0])} className="w-full text-sm" />
                        {form.errors.logo && <p className="text-xs text-red-600 font-semibold mt-1">{form.errors.logo}</p>}
                        {editing?.logo && <img src={editing.logo} className="mt-2 w-16 h-16 object-contain border rounded-lg bg-gray-50" />}
                    </div>
                    <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.data.is_active} onChange={e=> form.setData('is_active', e.target.checked)} className="rounded border-gray-300 text-rose-600" /> Active</label>
                    <div className="flex justify-end gap-3 pt-2">
                        <button type="button" onClick={()=> setShowForm(false)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold">Cancel</button>
                        <button disabled={form.processing} className="px-6 py-2 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-sm font-black disabled:opacity-50">{form.processing ? 'Saving…' : editing ? 'Update' : 'Create'}</button>
                    </div>
                </form>
            </Modal>

            <Modal show={!!deleteTarget} onClose={()=> setDeleteTarget(null)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-black">Delete brand?</h3>
                    <p className="text-sm text-gray-600 mt-2"><span className="font-bold text-slate-900">{deleteTarget?.name}</span> will be deleted. Cannot delete if products exist — deactivate instead.</p>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={()=> setDeleteTarget(null)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold">Cancel</button>
                        <button onClick={()=> handleDelete(deleteTarget)} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-black">Delete</button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
