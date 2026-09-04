import AdminLayout from '@/Layouts/AdminLayout';
import { router, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Index({ attributes, categories }){
    const { flash } = usePage().props;
    const [expanded,setExpanded]=useState(null);
    const [newAttr,setNewAttr]=useState({name:'', slug:''});
    const [editingAttr,setEditingAttr]=useState(null);

    const createAttr=(e)=>{
        e.preventDefault();
        if(!newAttr.name){ toast.error('Name required'); return; }
        router.post(route('admin.attributes.store'), newAttr, {
            preserveScroll:true,
            onSuccess:()=>{ toast.success('Attribute created'); setNewAttr({name:'',slug:''}); },
            onError:(errs)=> toast.error(Object.values(errs)[0]||'Failed')
        });
    };
    const saveEdit=(attr)=>{
        router.patch(route('admin.attributes.update', attr.id), {name: editingAttr.name, slug: editingAttr.slug}, {
            preserveScroll:true,
            onSuccess:()=>{ toast.success('Updated'); setEditingAttr(null); },
            onError:(errs)=> toast.error(Object.values(errs)[0]||'Failed')
        });
    };
    const delAttr=(id)=>{
        if(!confirm('Delete attribute and all its values?')) return;
        router.delete(route('admin.attributes.destroy', id), {preserveScroll:true, onSuccess:()=> toast.success('Deleted')});
    };

    return (
        <AdminLayout header="Attributes — Size / Color etc.">
            {flash?.success && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-bold">{flash.success}</div>}

            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-6">
                <h3 className="font-black text-sm mb-3">Create Attribute</h3>
                <form onSubmit={createAttr} className="flex flex-wrap gap-2">
                    <input value={newAttr.name} onChange={e=>setNewAttr({...newAttr,name:e.target.value})} placeholder="Name e.g. Size" className="flex-1 min-w-[160px] px-3 py-2.5 border rounded-lg text-sm font-bold" />
                    <input value={newAttr.slug} onChange={e=>setNewAttr({...newAttr,slug:e.target.value})} placeholder="slug (auto)" className="w-40 px-3 py-2.5 border rounded-lg text-sm font-mono" />
                    <button className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-black text-sm">Add</button>
                </form>
            </div>

            <div className="space-y-4">
                {attributes.length===0 ? (
                    <div className="bg-white border border-dashed rounded-xl p-10 text-center text-sm font-semibold text-gray-500">No attributes yet — create Size, Color etc.</div>
                ) : attributes.map(attr=> (
                    <div key={attr.id} className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="flex items-center justify-between px-5 py-4 hover:bg-gray-50">
                            <div className="flex items-center gap-3">
                                <button onClick={()=>setExpanded(expanded===attr.id?null:attr.id)} className="w-8 h-8 rounded-full border bg-white flex items-center justify-center font-black text-sm">{expanded===attr.id?'−':'+'}</button>
                                {editingAttr?.id===attr.id ? (
                                    <div className="flex gap-2">
                                        <input value={editingAttr.name} onChange={e=>setEditingAttr({...editingAttr,name:e.target.value})} className="px-3 py-1.5 border rounded-lg text-sm font-bold" />
                                        <input value={editingAttr.slug} onChange={e=>setEditingAttr({...editingAttr,slug:e.target.value})} className="px-3 py-1.5 border rounded-lg text-sm font-mono" />
                                        <button onClick={()=>saveEdit(attr)} className="px-4 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-black">Save</button>
                                        <button onClick={()=>setEditingAttr(null)} className="px-4 py-1.5 border rounded-full text-xs font-bold">Cancel</button>
                                    </div>
                                ) : (
                                    <>
                                        <span className="font-black">{attr.name}</span>
                                        <span className="text-xs font-mono bg-gray-100 border px-2 py-0.5 rounded-full">{attr.slug}</span>
                                        <span className="text-xs font-bold text-gray-500">{attr.values?.length||0} values</span>
                                        <button onClick={()=>setEditingAttr({id:attr.id,name:attr.name,slug:attr.slug})} className="text-xs font-bold text-slate-600 hover:text-slate-900 ml-2">Edit</button>
                                    </>
                                )}
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-gray-500 hidden md:inline">{attr.categories?.length||0} categories linked</span>
                                <button onClick={()=>delAttr(attr.id)} className="px-3 py-1 border border-rose-200 text-rose-600 rounded-full text-xs font-bold hover:bg-rose-50">Delete</button>
                            </div>
                        </div>
                        {expanded===attr.id && (
                            <div className="border-t bg-gray-50/60 p-5 space-y-6">
                                <ValueManager attribute={attr} />
                                <CategoryMatrix attribute={attr} categories={categories} />
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </AdminLayout>
    );
}

function ValueManager({ attribute }){
    const [val,setVal]=useState('');
    const [editing,setEditing]=useState(null);
    const [editVal,setEditVal]=useState('');

    const add=()=>{
        if(!val.trim()){ toast.error('Value required'); return; }
        router.post(route('admin.attributes.values.store', attribute.id), {value: val.trim()}, {
            preserveScroll:true,
            onSuccess:()=>{ toast.success('Value added'); setVal(''); },
            onError:(errs)=> toast.error(Object.values(errs)[0]||'Failed')
        });
    };
    const save=(v)=>{
        router.patch(route('admin.attributes.values.update', v.id), {value: editVal}, {
            preserveScroll:true,
            onSuccess:()=>{ toast.success('Updated'); setEditing(null); },
        });
    };
    const del=(id)=>{
        if(!confirm('Delete value?')) return;
        router.delete(route('admin.attributes.values.destroy', id), {preserveScroll:true, onSuccess:()=> toast.success('Deleted')});
    };
    const move=(id, dir)=>{
        const values=[...attribute.values];
        const idx=values.findIndex(v=>v.id===id);
        if(idx<0) return;
        const newIdx= dir==='up' ? idx-1 : idx+1;
        if(newIdx<0 || newIdx>=values.length) return;
        [values[idx], values[newIdx]]=[values[newIdx], values[idx]];
        const order=values.map(v=>v.id);
        router.post(route('admin.attributes.values.reorder', attribute.id), {order}, {preserveScroll:true, onSuccess:()=> toast.success('Reordered')});
    };

    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h4 className="font-black text-sm mb-3">Values — {attribute.name} <span className="text-xs font-bold text-gray-500">add / edit / delete / reorder</span></h4>
            <div className="flex gap-2 mb-3">
                <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={e=>e.key==='Enter' && add()} placeholder={`Add ${attribute.name} value e.g. ${attribute.slug==='size'?'9':'Black'}`} className="flex-1 px-3 py-2.5 border rounded-lg text-sm font-semibold" />
                <button onClick={add} className="px-5 py-2.5 bg-slate-900 text-white rounded-full font-black text-sm">Add</button>
            </div>
            {attribute.values?.length===0 ? (
                <div className="text-sm text-gray-500 font-semibold py-4 text-center border border-dashed rounded-xl">No values yet</div>
            ) : (
                <div className="space-y-1">
                    {attribute.values.map(v=> (
                        <div key={v.id} className="flex items-center justify-between px-3 py-2 border border-gray-100 rounded-lg bg-white hover:bg-gray-50">
                            {editing===v.id ? (
                                <div className="flex gap-2 flex-1">
                                    <input value={editVal} onChange={e=>setEditVal(e.target.value)} className="flex-1 px-3 py-1.5 border rounded-lg text-sm font-bold" autoFocus />
                                    <button onClick={()=>save(v)} className="px-4 py-1.5 bg-emerald-600 text-white rounded-full text-xs font-black">Save</button>
                                    <button onClick={()=>setEditing(null)} className="px-4 py-1.5 border rounded-full text-xs font-bold">Cancel</button>
                                </div>
                            ) : (
                                <>
                                    <span className="font-bold text-sm">{v.value} <span className="text-xs text-gray-500 font-mono">#{v.display_order}</span></span>
                                    <div className="flex items-center gap-1">
                                        <button onClick={()=>move(v.id,'up')} className="w-7 h-7 border rounded-full text-xs font-black hover:bg-gray-100" title="Move up">↑</button>
                                        <button onClick={()=>move(v.id,'down')} className="w-7 h-7 border rounded-full text-xs font-black hover:bg-gray-100" title="Move down">↓</button>
                                        <button onClick={()=>{setEditing(v.id); setEditVal(v.value);}} className="px-3 py-1 border rounded-full text-xs font-bold hover:bg-slate-900 hover:text-white">Edit</button>
                                        <button onClick={()=>del(v.id)} className="px-3 py-1 border border-rose-200 text-rose-600 rounded-full text-xs font-bold hover:bg-rose-50">Delete</button>
                                    </div>
                                </>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

function CategoryMatrix({ attribute, categories }){
    const assigned = new Set((attribute.categories||[]).map(c=>c.id));
    const [selected,setSelected]=useState(()=> new Set(assigned));
    const toggle=(id)=>{
        const next=new Set(selected);
        if(next.has(id)) next.delete(id); else next.add(id);
        setSelected(next);
    };
    const save=()=>{
        const ids=[...selected];
        router.post(route('admin.attributes.categories.sync', attribute.id), {category_ids: ids}, {
            preserveScroll:true,
            onSuccess:()=> toast.success('Categories updated'),
        });
    };
    const isDirty = JSON.stringify([...selected].sort()) !== JSON.stringify([...assigned].sort());
    return (
        <div className="bg-white border border-gray-200 rounded-xl p-4">
            <h4 className="font-black text-sm mb-1">Assign to Categories — checkbox matrix</h4>
            <p className="text-xs font-semibold text-gray-500 mb-3">Check which categories use this attribute (e.g. Size for Sneakers, Sports…)</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                {categories.map(c=> (
                    <label key={c.id} className={`flex items-center gap-2 px-3 py-2 border rounded-lg cursor-pointer ${selected.has(c.id)?'bg-slate-900 text-white border-slate-900':'bg-white hover:bg-gray-50'}`}>
                        <input type="checkbox" checked={selected.has(c.id)} onChange={()=>toggle(c.id)} className="w-4 h-4 rounded" />
                        <span className="text-sm font-bold">{c.name}</span>
                        <span className="text-[11px] font-mono opacity-70">{c.slug}</span>
                    </label>
                ))}
            </div>
            <button onClick={save} disabled={!isDirty} className={`mt-3 px-6 py-2.5 rounded-full font-black text-sm ${isDirty?'bg-rose-600 text-white':'bg-gray-200 text-gray-500 cursor-not-allowed'}`}>Save matrix</button>
        </div>
    );
}
