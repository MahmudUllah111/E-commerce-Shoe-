import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router, usePage } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

function formatCurrency(n){ return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n||0)); }

export default function Index({ settings, users, roles }){
    const { flash, auth } = usePage().props;
    const [tab,setTab]=useState('store');

    // Store form
    const storeForm = useForm({
        store_name: settings.store_name||'',
        contact_email: settings.contact_email||'',
        contact_phone: settings.contact_phone||'',
        store_address: settings.address||'',
        tax_rate: settings.tax_settings?.rate!=null ? (settings.tax_settings.rate*100).toFixed(2) : (Number(settings.tax_rate)*100 ? (Number(settings.tax_rate)*100).toFixed(2) : '0'),
        tax_inclusive: settings.tax_settings?.inclusive ? true : (settings.tax_inclusive==='1'),
        shipping_zones_json: JSON.stringify(settings.shipping_zones||[], null, 2),
        logo: null,
    });
    const [logoPreview,setLogoPreview]=useState(settings.store_logo||null);

    const submitStore=(e)=>{
        e.preventDefault();
        try { JSON.parse(storeForm.data.shipping_zones_json); } catch { toast.error('Shipping zones must be valid JSON'); return; }
        storeForm.post(route('admin.settings.update'), {
            forceFormData: true,
            preserveScroll:true,
            onSuccess:()=> toast.success('Settings saved'),
            onError:(errs)=> toast.error(Object.values(errs)[0]||'Failed'),
        });
    };

    // User form
    const [showUserForm,setShowUserForm]=useState(false);
    const [editingUser,setEditingUser]=useState(null);
    const userForm = useForm({ name:'', email:'', password:'', role: roles[0]?.name||'Staff', phone:'' });
    const editForm = useForm({ name:'', email:'', password:'', role:'', roles:[], phone:'', is_blocked:false });

    const openCreate=()=>{
        setEditingUser(null);
        userForm.reset();
        userForm.setData('role', roles[0]?.name||'Staff');
        setShowUserForm(true);
    };
    const openEdit=(u)=>{
        setEditingUser(u);
        editForm.setData({
            name: u.name,
            email: u.email,
            password: '',
            role: u.roles?.[0]||u.role||'Staff',
            roles: u.roles||[],
            phone: u.phone||'',
            is_blocked: !!u.is_blocked,
        });
        setShowUserForm(true);
    };
    const createUser=(e)=>{
        e.preventDefault();
        userForm.post(route('admin.settings.users.store'), {
            preserveScroll:true,
            onSuccess:()=> { toast.success('User created'); setShowUserForm(false); userForm.reset(); },
            onError:(errs)=> toast.error(Object.values(errs)[0]||'Failed'),
        });
    };
    const updateUser=(e)=>{
        e.preventDefault();
        const payload = { ...editForm.data };
        if(!payload.password) delete payload.password;
        // map role vs roles
        editForm.put(route('admin.settings.users.update', editingUser.id), {
            preserveScroll:true,
            onSuccess:()=> { toast.success('User updated'); setShowUserForm(false); },
            onError:(errs)=> toast.error(Object.values(errs)[0]||'Failed'),
        });
    };
    const deleteUser=(id)=>{
        if(!confirm('Delete this user?')) return;
        router.delete(route('admin.settings.users.destroy', id), { preserveScroll:true, onSuccess:()=> toast.success('Deleted')});
    };

    return (
        <AdminLayout header="Store Settings">
            {flash?.success && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-bold">{flash.success}</div>}
            {flash?.error && <div className="mb-4 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm font-bold">{flash.error}</div>}

            <div className="inline-flex rounded-full border bg-white p-1 mb-6" role="tablist">
                {[
                    {id:'store', label:'Store Info'},
                    {id:'shipping', label:'Shipping Zones'},
                    {id:'tax', label:'Tax'},
                    {id:'users', label:'Admin Users'},
                ].map(t=> (
                    <button key={t.id} onClick={()=>setTab(t.id)} role="tab" aria-selected={tab===t.id} className={`px-4 py-1.5 rounded-full text-sm font-black ${tab===t.id?'bg-slate-900 text-white':'text-gray-600 hover:bg-gray-50'}`}>{t.label}</button>
                ))}
            </div>

            {/* Store Info Tab */}
            {tab==='store' && (
                <form onSubmit={submitStore} className="bg-white border border-gray-200 rounded-xl p-6 space-y-5">
                    <h3 className="font-black">Store Information</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black uppercase text-gray-500">Store Name *</label>
                            <input value={storeForm.data.store_name} onChange={e=>storeForm.setData('store_name', e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm font-bold" />
                            {storeForm.errors.store_name && <div className="text-xs text-rose-600">{storeForm.errors.store_name}</div>}
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-gray-500">Logo Upload</label>
                            <input type="file" accept="image/*" onChange={e=>{ const f=e.target.files[0]; storeForm.setData('logo', f); if(f) setLogoPreview(URL.createObjectURL(f)); }} className="mt-1 w-full text-sm" />
                            {logoPreview && <img src={logoPreview} alt="logo preview" className="mt-2 h-12 object-contain border rounded bg-gray-50 p-1" />}
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-gray-500">Contact Email *</label>
                            <input type="email" value={storeForm.data.contact_email} onChange={e=>storeForm.setData('contact_email', e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm font-semibold" />
                            {storeForm.errors.contact_email && <div className="text-xs text-rose-600">{storeForm.errors.contact_email}</div>}
                        </div>
                        <div>
                            <label className="text-xs font-black uppercase text-gray-500">Contact Phone</label>
                            <input value={storeForm.data.contact_phone} onChange={e=>storeForm.setData('contact_phone', e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm font-semibold" placeholder="+880..." />
                        </div>
                        <div className="md:col-span-2">
                            <label className="text-xs font-black uppercase text-gray-500">Store Address</label>
                            <input value={storeForm.data.store_address} onChange={e=>storeForm.setData('store_address', e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm" placeholder="Road, City, Country" />
                        </div>
                    </div>
                    <button disabled={storeForm.processing} className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-black text-sm disabled:opacity-60">Save Store Info</button>
                </form>
            )}

            {tab==='shipping' && (
                <form onSubmit={submitStore} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                    <h3 className="font-black">Shipping Zones — flat/tiered rates JSON</h3>
                    <p className="text-xs font-semibold text-gray-500">Edit as JSON array. Example: [&#123;&quot;zone&quot;:&quot;Inside Dhaka&quot;,&quot;rate&quot;:5&#125;, &#123;&quot;zone&quot;:&quot;Outside Dhaka&quot;,&quot;rate&quot;:15&#125;]</p>
                    <textarea value={storeForm.data.shipping_zones_json} onChange={e=>storeForm.setData('shipping_zones_json', e.target.value)} rows={8} className="w-full font-mono text-xs px-3 py-3 border rounded-xl bg-slate-900 text-emerald-200" />
                    {storeForm.errors.shipping_zones_json && <div className="text-xs text-rose-600">{storeForm.errors.shipping_zones_json}</div>}
                    <div className="flex gap-2">
                        <button disabled={storeForm.processing} className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-black text-sm">Save Shipping</button>
                        <button type="button" onClick={()=>{ try{ const parsed=JSON.parse(storeForm.data.shipping_zones_json); toast.success(`${parsed.length} zones valid`);} catch(e){ toast.error('Invalid JSON: '+e.message);} }} className="px-6 py-2.5 border rounded-full font-bold text-sm">Validate JSON</button>
                    </div>
                    <div className="border-t pt-4">
                        <div className="text-xs font-black uppercase text-gray-500 mb-2">Preview</div>
                        <div className="space-y-2">
                            {(settings.shipping_zones||[]).map((z,i)=> <div key={i} className="flex justify-between text-sm border rounded-lg px-3 py-2 bg-gray-50"><span className="font-bold">{z.zone||z.name}</span><span className="font-black">{formatCurrency(z.rate||z.cost||0)} <span className="text-xs font-semibold text-gray-500">({z.type||'flat'})</span></span></div>)}
                        </div>
                    </div>
                </form>
            )}

            {tab==='tax' && (
                <form onSubmit={submitStore} className="bg-white border border-gray-200 rounded-xl p-6 space-y-4">
                    <h3 className="font-black">Tax Settings</h3>
                    <div className="grid md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs font-black uppercase text-gray-500">Tax Rate (%)</label>
                            <input type="number" step="0.01" min="0" max="100" value={storeForm.data.tax_rate} onChange={e=>storeForm.setData('tax_rate', e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm font-bold" placeholder="8 for 8%" />
                            <div className="text-[11px] text-gray-500 font-semibold mt-1">Enter percent (e.g. 8 = 8%, 0 = no tax). Stored as inclusive flag below.</div>
                        </div>
                        <div className="flex items-center gap-3 pt-6">
                            <label className="inline-flex items-center gap-2 cursor-pointer">
                                <input type="checkbox" checked={!!storeForm.data.tax_inclusive} onChange={e=>storeForm.setData('tax_inclusive', e.target.checked)} className="w-4 h-4 rounded" />
                                <span className="text-sm font-black">Tax Inclusive</span>
                            </label>
                            <span className="text-xs font-semibold text-gray-500">If checked, prices include tax</span>
                        </div>
                    </div>
                    <button disabled={storeForm.processing} className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-black text-sm">Save Tax</button>
                </form>
            )}

            {tab==='users' && (
                <div className="space-y-4">
                    <div className="flex justify-between items-center">
                        <h3 className="font-black">Admin Users & Roles <span className="text-xs font-bold text-gray-500">via Spatie • roles: {roles.map(r=>r.name).join(', ')}</span></h3>
                        <button onClick={openCreate} className="px-4 py-2 bg-rose-600 text-white rounded-full text-sm font-black">＋ Invite Admin</button>
                    </div>
                    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead className="bg-gray-50 border-b text-gray-500 font-black"><tr><th className="px-4 py-3 text-left">Name</th><th className="px-4 py-3 text-left">Email</th><th className="px-4 py-3 text-left">Roles</th><th className="px-4 py-3 text-left">Status</th><th className="px-4 py-3 text-right">Actions</th></tr></thead>
                                <tbody>
                                    {users.map(u=> (
                                        <tr key={u.id} className="border-b hover:bg-gray-50">
                                            <td className="px-4 py-3 font-bold">{u.name} {auth.user?.id===u.id && <span className="text-[11px] bg-slate-900 text-white px-1.5 py-0.5 rounded-full">you</span>}</td>
                                            <td className="px-4 py-3 font-mono text-xs">{u.email}</td>
                                            <td className="px-4 py-3"><div className="flex flex-wrap gap-1">{(u.roles||[]).map(r=> <span key={r} className="px-2 py-0.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-full text-[11px] font-black">{r}</span>)}{(!u.roles||u.roles.length===0) && <span className="text-xs text-gray-500">{u.role}</span>}</div></td>
                                            <td className="px-4 py-3">{u.is_blocked ? <span className="px-2 py-1 bg-rose-100 text-rose-700 rounded-full text-xs font-black">Blocked</span> : <span className="px-2 py-1 bg-emerald-100 text-emerald-700 rounded-full text-xs font-black">Active</span>}</td>
                                            <td className="px-4 py-3 text-right space-x-2">
                                                <button onClick={()=>openEdit(u)} className="px-3 py-1 border rounded-full text-xs font-bold hover:bg-slate-900 hover:text-white">Edit</button>
                                                <button onClick={()=>deleteUser(u.id)} className="px-3 py-1 border border-rose-200 text-rose-600 rounded-full text-xs font-bold hover:bg-rose-50">Delete</button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {showUserForm && (
                        <div className="fixed inset-0 bg-black/40 flex items-center justify-center p-4 z-50" onClick={()=>setShowUserForm(false)}>
                            <div onClick={e=>e.stopPropagation()} className="bg-white rounded-2xl p-6 w-full max-w-md shadow-xl">
                                <h4 className="font-black text-lg">{editingUser? 'Edit User' : 'Invite Admin User'}</h4>
                                <form onSubmit={editingUser? updateUser : createUser} className="mt-4 space-y-3">
                                    <div><label className="text-xs font-black uppercase text-gray-500">Name *</label><input value={editingUser ? editForm.data.name : userForm.data.name} onChange={e=> editingUser ? editForm.setData('name', e.target.value) : userForm.setData('name', e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm font-semibold" required /></div>
                                    <div><label className="text-xs font-black uppercase text-gray-500">Email *</label><input type="email" value={editingUser ? editForm.data.email : userForm.data.email} onChange={e=> editingUser ? editForm.setData('email', e.target.value) : userForm.setData('email', e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm" required /></div>
                                    <div><label className="text-xs font-black uppercase text-gray-500">Password {editingUser && '(leave blank to keep)'}</label><input type="password" value={editingUser ? editForm.data.password : userForm.data.password} onChange={e=> editingUser ? editForm.setData('password', e.target.value) : userForm.setData('password', e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm" required={!editingUser} /></div>
                                    <div><label className="text-xs font-black uppercase text-gray-500">Role *</label>
                                        <select value={editingUser ? editForm.data.role : userForm.data.role} onChange={e=> editingUser ? editForm.setData('role', e.target.value) : userForm.setData('role', e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm font-bold">
                                            {roles.map(r=> <option key={r.id} value={r.name}>{r.name}</option>)}
                                        </select>
                                    </div>
                                    <div><label className="text-xs font-black uppercase text-gray-500">Phone</label><input value={editingUser ? editForm.data.phone : userForm.data.phone} onChange={e=> editingUser ? editForm.setData('phone', e.target.value) : userForm.setData('phone', e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm" /></div>
                                    {editingUser && (
                                        <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={!!editForm.data.is_blocked} onChange={e=>editForm.setData('is_blocked', e.target.checked)} /> Blocked</label>
                                    )}
                                    <div className="flex gap-2 pt-2">
                                        <button type="submit" disabled={editingUser? editForm.processing : userForm.processing} className="flex-1 py-2.5 bg-slate-900 text-white rounded-full font-black text-sm disabled:opacity-60">{editingUser?'Update':'Create'}</button>
                                        <button type="button" onClick={()=>setShowUserForm(false)} className="px-6 py-2.5 border rounded-full font-bold text-sm">Cancel</button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </AdminLayout>
    );
}
