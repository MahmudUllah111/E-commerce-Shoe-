import AdminLayout from '@/Layouts/AdminLayout';
import { useForm, router } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Index({ slides }) {
    const [editing, setEditing] = useState(null);
    const createForm = useForm({
        title: '', subtitle: '', badge: '', discount_badge: '', cta_text: 'Shop Now', cta_link: '/products',
        bg_image: '', shoe_image: '', bg_upload: null, shoe_upload: null, sort_order: slides.length, is_active: true,
    });
    const editForm = useForm({
        title: '', subtitle: '', badge: '', discount_badge: '', cta_text: '', cta_link: '',
        bg_image: '', shoe_image: '', bg_upload: null, shoe_upload: null, sort_order: 0, is_active: true,
    });

    const startEdit = (s) => {
        setEditing(s.id);
        editForm.setData({
            title: s.title, subtitle: s.subtitle || '', badge: s.badge || '', discount_badge: s.discount_badge || '',
            cta_text: s.cta_text, cta_link: s.cta_link, bg_image: s.bg_image || '', shoe_image: s.shoe_image || '',
            sort_order: s.sort_order, is_active: !!s.is_active,
        });
    };

    const submitCreate = (e) => {
        e.preventDefault();
        createForm.post(route('admin.hero.store'), {
            forceFormData: true,
            onSuccess: () => { toast.success('Hero slide created'); createForm.reset(); },
            onError: () => toast.error('Failed'),
        });
    };
    const submitEdit = (e) => {
        e.preventDefault();
        editForm.post(route('admin.hero.update', editing), {
            forceFormData: true,
            onSuccess: () => { toast.success('Updated'); setEditing(null); },
            onError: (errs) => toast.error(typeof errs === 'object' && Object.values(errs)[0] ? Object.values(errs)[0] : 'Failed'),
        });
    };
    const del = (id) => {
        if (!confirm('Delete this slide?')) return;
        router.delete(route('admin.hero.destroy', id), { onSuccess: () => toast.success('Deleted') });
    };

    return (
        <AdminLayout header="Hero Banner — Auto-rotating, Admin Manageable">
            <div className="max-w-5xl mx-auto space-y-6">
                <div className="bg-white border rounded-xl p-6">
                    <h3 className="font-black mb-4">Add New Slide</h3>
                    <form onSubmit={submitCreate} className="grid md:grid-cols-2 gap-4">
                        <input value={createForm.data.title} onChange={e=>createForm.setData('title', e.target.value)} placeholder="Title *" required className="px-3 py-2 border rounded-lg text-sm font-bold" />
                        <input value={createForm.data.cta_text} onChange={e=>createForm.setData('cta_text', e.target.value)} placeholder="CTA Text" className="px-3 py-2 border rounded-lg text-sm" />
                        <input value={createForm.data.badge} onChange={e=>createForm.setData('badge', e.target.value)} placeholder="Badge (SUPER SALE)" className="px-3 py-2 border rounded-lg text-sm" />
                        <input value={createForm.data.discount_badge} onChange={e=>createForm.setData('discount_badge', e.target.value)} placeholder="Discount Badge" className="px-3 py-2 border rounded-lg text-sm" />
                        <input value={createForm.data.cta_link} onChange={e=>createForm.setData('cta_link', e.target.value)} placeholder="CTA Link /products?category=sneakers" className="px-3 py-2 border rounded-lg text-sm" />
                        <input value={createForm.data.subtitle} onChange={e=>createForm.setData('subtitle', e.target.value)} placeholder="Subtitle" className="px-3 py-2 border rounded-lg text-sm md:col-span-2" />
                        <input value={createForm.data.bg_image} onChange={e=>createForm.setData('bg_image', e.target.value)} placeholder="BG Image URL" className="px-3 py-2 border rounded-lg text-sm" />
                        <input value={createForm.data.shoe_image} onChange={e=>createForm.setData('shoe_image', e.target.value)} placeholder="Shoe Image URL" className="px-3 py-2 border rounded-lg text-sm" />
                        <div className="flex gap-2">
                            <label className="text-xs font-bold flex items-center gap-1"><input type="file" onChange={e=>createForm.setData('bg_upload', e.target.files[0])} className="text-xs" /> BG Upload</label>
                            <label className="text-xs font-bold flex items-center gap-1"><input type="file" onChange={e=>createForm.setData('shoe_upload', e.target.files[0])} className="text-xs" /> Shoe Upload</label>
                        </div>
                        <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={createForm.data.is_active} onChange={e=>createForm.setData('is_active', e.target.checked)} /> Active</label>
                        <button disabled={createForm.processing} className="md:col-span-2 py-2.5 bg-slate-900 text-white rounded-lg font-black">Create Slide</button>
                    </form>
                </div>

                <div className="bg-white border rounded-xl p-6">
                    <h3 className="font-black mb-4">Existing Slides ({slides.length}) — drag to reorder, auto-rotates every 3.5s on storefront</h3>
                    <div className="space-y-4">
                        {slides.map(s=>(
                            <div key={s.id} className="border rounded-xl p-4 flex gap-4">
                                <img src={s.shoe_image} alt={s.title} className="w-24 h-24 object-contain bg-gray-50 rounded border" />
                                <div className="flex-1">
                                    {editing===s.id ? (
                                        <form onSubmit={submitEdit} className="grid md:grid-cols-2 gap-2">
                                            <input value={editForm.data.title} onChange={e=>editForm.setData('title', e.target.value)} className="px-2 py-1 border rounded text-sm font-bold" />
                                            <input value={editForm.data.cta_text} onChange={e=>editForm.setData('cta_text', e.target.value)} className="px-2 py-1 border rounded text-sm" />
                                            <input value={editForm.data.badge} onChange={e=>editForm.setData('badge', e.target.value)} className="px-2 py-1 border rounded text-sm" />
                                            <input value={editForm.data.discount_badge} onChange={e=>editForm.setData('discount_badge', e.target.value)} className="px-2 py-1 border rounded text-sm" />
                                            <input value={editForm.data.cta_link} onChange={e=>editForm.setData('cta_link', e.target.value)} className="px-2 py-1 border rounded text-sm" />
                                            <input value={editForm.data.subtitle} onChange={e=>editForm.setData('subtitle', e.target.value)} className="px-2 py-1 border rounded text-sm md:col-span-2" />
                                            <input value={editForm.data.bg_image} onChange={e=>editForm.setData('bg_image', e.target.value)} placeholder="BG URL" className="px-2 py-1 border rounded text-xs" />
                                            <input value={editForm.data.shoe_image} onChange={e=>editForm.setData('shoe_image', e.target.value)} placeholder="Shoe URL" className="px-2 py-1 border rounded text-xs" />
                                            <div className="flex gap-2 md:col-span-2">
                                                <label className="text-xs font-bold flex items-center gap-1"><input type="file" onChange={e=>editForm.setData('bg_upload', e.target.files[0])} className="text-xs" /> Replace BG</label>
                                                <label className="text-xs font-bold flex items-center gap-1"><input type="file" onChange={e=>editForm.setData('shoe_upload', e.target.files[0])} className="text-xs" /> Replace Shoe</label>
                                            </div>
                                            <label className="flex items-center gap-1 text-xs font-bold"><input type="checkbox" checked={editForm.data.is_active} onChange={e=>editForm.setData('is_active', e.target.checked)} /> Active</label>
                                            <div className="flex gap-2 md:col-span-2">
                                                <button type="submit" disabled={editForm.processing} className="px-4 py-1.5 bg-slate-900 text-white rounded-full text-xs font-black">Save</button>
                                                <button type="button" onClick={()=>setEditing(null)} className="px-4 py-1.5 bg-white border rounded-full text-xs font-bold">Cancel</button>
                                            </div>
                                        </form>
                                    ) : (
                                        <>
                                            <div className="font-black">{s.title} {s.is_active? <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-1">ACTIVE</span> : <span className="text-[10px] bg-gray-100 px-1.5 py-0.5 rounded">INACTIVE</span>}</div>
                                            <div className="text-xs text-gray-600">{s.subtitle}</div>
                                            <div className="text-xs mt-1"><span className="bg-rose-600 text-white px-1.5 py-0.5 rounded text-[10px] font-black">{s.badge}</span> <span className="border border-amber-300 px-1.5 py-0.5 rounded text-[10px] font-black">{s.discount_badge}</span></div>
                                            <div className="text-xs mt-1 font-mono">CTA: {s.cta_text} → {s.cta_link} • Order #{s.sort_order}</div>
                                        </>
                                    )}
                                </div>
                                {editing!==s.id && (
                                    <div className="flex flex-col gap-1">
                                        <button onClick={()=>startEdit(s)} className="px-3 py-1 bg-white border rounded-full text-xs font-bold">Edit</button>
                                        <button onClick={()=>del(s.id)} className="px-3 py-1 bg-red-50 border border-red-200 text-red-600 rounded-full text-xs font-black">Delete</button>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
}
