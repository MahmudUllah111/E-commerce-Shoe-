import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Link, useForm, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

function AccountNav(){
    const url = usePage().url;
    const items = [
        {label:'Dashboard', href:'/account'},
        {label:'Profile', href:'/account/profile'},
        {label:'Addresses', href:'/account/addresses'},
        {label:'Orders', href:'/account/orders'},
        {label:'Wishlist', href:'/account/wishlist'},
    ];
    return (<div className="flex flex-wrap gap-2 mb-6">{items.map(i=>{const active = url===i.href || (i.href!=='/account' && url.startsWith(i.href)); return <Link key={i.href} href={i.href} className={`px-4 py-2 rounded-full text-sm font-bold border ${active?'bg-slate-900 text-white border-slate-900':'bg-white hover:bg-gray-50 border-gray-200'}`}>{i.label}</Link>})}</div>)
}

export default function Addresses({ addresses = [] }){
    const { flash } = usePage().props;
    const [showForm, setShowForm] = useState(false);
    const [editing, setEditing] = useState(null);
    const form = useForm({ label:'', street:'', city:'', state:'', zip:'', country:'Bangladesh', is_default:false });

    const startCreate = ()=>{ setEditing(null); form.reset(); form.setData({ label:'', street:'', city:'', state:'', zip:'', country:'Bangladesh', is_default:false}); setShowForm(true); };
    const startEdit = (a)=>{ setEditing(a); form.setData({ label:a.label||'', street:a.street||'', city:a.city||'', state:a.state||'', zip:a.zip||'', country:a.country||'Bangladesh', is_default: !!a.is_default }); setShowForm(true); };
    const submit = (e)=>{
        e.preventDefault();
        if(editing){
            form.patch(route('account.addresses.update', editing.id), { preserveScroll:true, onSuccess:()=>{toast.success('Address updated'); setShowForm(false); setEditing(null);}, onError:(err)=> toast.error(Object.values(err)[0]||'Failed')});
        } else {
            form.post(route('account.addresses.store'), { preserveScroll:true, onSuccess:()=>{toast.success('Address added'); setShowForm(false);}, onError:(err)=> toast.error(Object.values(err)[0]||'Failed')});
        }
    };
    const remove = (id)=>{ if(!confirm('Delete this address?')) return; router.delete(route('account.addresses.destroy', id), { preserveScroll:true, onSuccess:()=> toast.success('Removed')}); };
    const makeDefault = (id)=> router.post(route('account.addresses.default', id), {}, { preserveScroll:true, onSuccess:()=> toast.success('Default updated')});

    return (
        <StorefrontLayout>
            <div className="max-w-4xl mx-auto px-6 py-8">
                <div className="flex justify-between items-center">
                    <div><h1 className="text-3xl font-black">Addresses</h1><p className="text-sm text-gray-500 font-semibold mt-1">Address book CRUD • Set default</p></div>
                    <button onClick={startCreate} className="px-5 py-2.5 bg-slate-900 text-white rounded-full font-black text-sm">+ Add Address</button>
                </div>
                <div className="mt-6"><AccountNav/></div>
                {flash?.success && <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.success}</div>}
                {flash?.error && <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.error}</div>}

                {showForm && (
                    <form onSubmit={submit} className="bg-white border rounded-xl p-6 mb-6 space-y-4">
                        <h3 className="font-black">{editing ? 'Edit Address' : 'New Address'}</h3>
                        <div className="grid sm:grid-cols-2 gap-4">
                            <div><label className="text-xs font-bold uppercase text-gray-500">Label</label><input value={form.data.label} onChange={e=>form.setData('label', e.target.value)} placeholder="Home, Office" className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold" />{form.errors.label && <div className="text-xs text-red-600">{form.errors.label}</div>}</div>
                            <div className="flex items-end gap-2"><label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={form.data.is_default} onChange={e=>form.setData('is_default', e.target.checked)} /> Default</label></div>
                            <div className="sm:col-span-2"><label className="text-xs font-bold uppercase text-gray-500">Street *</label><input value={form.data.street} onChange={e=>form.setData('street', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold" />{form.errors.street && <div className="text-xs text-red-600">{form.errors.street}</div>}</div>
                            <div><label className="text-xs font-bold uppercase text-gray-500">City *</label><input value={form.data.city} onChange={e=>form.setData('city', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold" />{form.errors.city && <div className="text-xs text-red-600">{form.errors.city}</div>}</div>
                            <div><label className="text-xs font-bold uppercase text-gray-500">State</label><input value={form.data.state} onChange={e=>form.setData('state', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold" /></div>
                            <div><label className="text-xs font-bold uppercase text-gray-500">ZIP</label><input value={form.data.zip} onChange={e=>form.setData('zip', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold" /></div>
                            <div><label className="text-xs font-bold uppercase text-gray-500">Country</label><input value={form.data.country} onChange={e=>form.setData('country', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold" /></div>
                        </div>
                        <div className="flex gap-2"><button disabled={form.processing} className="px-6 py-2 bg-slate-900 text-white rounded-full font-black text-sm disabled:opacity-60">{editing?'Update':'Create'}</button><button type="button" onClick={()=>{setShowForm(false); setEditing(null);}} className="px-6 py-2 bg-white border rounded-full font-bold text-sm">Cancel</button></div>
                    </form>
                )}

                {addresses.length===0 ? <div className="bg-white border rounded-xl p-12 text-center text-sm font-semibold text-gray-500">No addresses yet. Add one to speed up checkout.</div> :
                <div className="grid md:grid-cols-2 gap-4">
                    {addresses.map(a=>(
                        <div key={a.id} className="bg-white border rounded-xl p-5">
                            <div className="flex justify-between"><span className="font-black text-sm">{a.label || 'Address'} {a.is_default && <span className="ml-2 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">DEFAULT</span>}</span><span className="text-xs text-gray-500 font-semibold">#{a.id}</span></div>
                            <div className="text-sm text-gray-700 mt-2 font-medium leading-relaxed">{a.street}<br/>{a.city}{a.state? ', '+a.state:''} {a.zip}<br/>{a.country}</div>
                            <div className="flex flex-wrap gap-2 mt-4">
                                {!a.is_default && <button onClick={()=>makeDefault(a.id)} className="px-3 py-1.5 bg-white border rounded-full text-xs font-bold hover:bg-slate-900 hover:text-white">Set Default</button>}
                                <button onClick={()=>startEdit(a)} className="px-3 py-1.5 bg-slate-900 text-white rounded-full text-xs font-bold">Edit</button>
                                <button onClick={()=>remove(a.id)} className="px-3 py-1.5 bg-red-50 text-red-600 border border-red-200 rounded-full text-xs font-bold">Delete</button>
                            </div>
                        </div>
                    ))}
                </div>}
            </div>
        </StorefrontLayout>
    )
}
