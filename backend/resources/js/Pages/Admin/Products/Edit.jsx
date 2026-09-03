import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm, router } from '@inertiajs/react';
import toast from 'react-hot-toast';

function slugify(str){ return str.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }

export default function Edit({ product, categories=[], allCategories=[], brands=[] }){
    const [slugTouched, setSlugTouched] = useState(true);
    const [existingImages, setExistingImages] = useState(
        (product.images||[]).sort((a,b)=> (a.display_order??0)-(b.display_order??0)).map((img,idx)=> ({ ...img, original_order: idx }))
    );
    const [newPreviews, setNewPreviews] = useState([]);
    const [primaryId, setPrimaryId] = useState((product.images||[]).find(i=>i.is_primary)?.id || null);
    const [newPrimaryIndex, setNewPrimaryIndex] = useState(null);
    const fileRef = useRef(null);

    // variant state: initialize from product variants
    const initialVariants = (product.variants||[]).map(v=> ({
        id: v.id, sku: v.sku||'', size_value: v.size_value, color_name: v.color_name, color_hex: v.color_hex, stock_quantity: v.stock_quantity, price: v.price||'', is_active: v.is_active
    }));
    const [sizeInput, setSizeInput] = useState('');
    const [colorInput, setColorInput] = useState('');
    const [variantRows, setVariantRows] = useState(initialVariants);
    const [removeImageIds, setRemoveImageIds] = useState([]);
    const [removeVariantIds, setRemoveVariantIds] = useState([]);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const { data, setData, processing, errors, progress } = useForm({
        name: product.name||'',
        slug: product.slug||'',
        description: product.description||'',
        material: product.material|| product.materials||'',
        care_instructions: product.care_instructions||'',
        category_id: String(product.category_id||''),
        brand_id: String(product.brand_id||''),
        gender: product.gender||'Unisex',
        base_price: product.base_price ?? product.price ?? '',
        discount_price: product.discount_price ?? product.original_price ?? '',
        sku: product.sku||'',
        status: product.status||'active',
        is_new: !!product.is_new,
        is_featured: !!product.is_featured,
        images: [],
        primary_image_id: primaryId,
        primary_index: 0,
        remove_image_ids: [],
        variants: initialVariants,
        remove_variant_ids: [],
    });

    useEffect(()=> { setData('primary_image_id', primaryId); },[primaryId]);
    useEffect(()=> { setData('remove_image_ids', removeImageIds); },[removeImageIds]);
    useEffect(()=> { setData('remove_variant_ids', removeVariantIds); },[removeVariantIds]);
    useEffect(()=> { setData('variants', variantRows); },[variantRows]);

    const handleNewImages = (e)=>{
        const files = Array.from(e.target.files||[]);
        const previews = files.map(f=> ({ file:f, url: URL.createObjectURL(f), name:f.name }));
        setNewPreviews(prev=> [...prev, ...previews]);
        setData('images', [...data.images, ...files]);
    };
    const removeNewPreview = (idx)=>{
        setNewPreviews(prev=> prev.filter((_,i)=> i!==idx));
        setData('images', data.images.filter((_,i)=> i!==idx));
    };
    const removeExisting = (id)=>{
        setExistingImages(prev=> {
            const next = prev.filter(i=> i.id!==id);
            if (primaryId === id) {
                setPrimaryId(next.length > 0 ? next[0].id : null);
            }
            return next;
        });
        setRemoveImageIds(prev=> [...prev, id]);
    };
    const reorderExisting = (from, to)=>{
        const copy=[...existingImages];
        const [m]=copy.splice(from,1);
        copy.splice(to,0,m);
        // update display_order
        copy.forEach((img,idx)=> img.display_order = idx);
        setExistingImages(copy);
    };

    const [dragIdx, setDragIdx]=useState(null);
    const onDragStart=(i)=> setDragIdx(i);
    const onDrop=(e, targetIdx)=>{
        e.preventDefault();
        if(dragIdx===null||dragIdx===targetIdx) return;
        reorderExisting(dragIdx, targetIdx);
        setDragIdx(null);
    };

    const parseColors=()=>{
        if(!colorInput.trim()) return [];
        return colorInput.split(',').map(s=> s.trim()).filter(Boolean).map(entry=>{
            const [name,hex]=entry.split(':').map(x=> x.trim());
            return { name: name||entry, hex: hex||'#000000'};
        });
    };
    const generateVariants=()=>{
        const sizes = sizeInput.split(',').map(s=> s.trim()).filter(Boolean);
        const colors = parseColors();
        if(sizes.length===0) return;
        const combos=[];
        sizes.forEach(size=>{
            if(colors.length===0) combos.push({ size_value:size, color_name:'Default', color_hex:'#000000', stock_quantity:10, price:'', sku:'', is_active:true});
            else colors.forEach(c=> combos.push({ size_value:size, color_name:c.name, color_hex:c.hex, stock_quantity:10, price:'', sku:'', is_active:true}));
        });
        const merged=[...variantRows, ...combos];
        setVariantRows(merged);
        setSizeInput(''); setColorInput('');
    };
    const updateVariant=(idx,field,value)=>{
        const copy=[...variantRows]; copy[idx][field]=value; setVariantRows(copy);
    };
    const removeVariant=(idx)=>{
        const row=variantRows[idx];
        if(row.id) setRemoveVariantIds(prev=> [...prev, row.id]);
        setVariantRows(prev=> prev.filter((_,i)=> i!==idx));
    };

    const submit=(e)=>{
        e.preventDefault();
        // Use router.post with FormData for file upload + method spoof
        const formData=new FormData();
        const payload={
            ...data,
            name:data.name, slug:data.slug, description:data.description, material:data.material,
            care_instructions:data.care_instructions, category_id:data.category_id, brand_id:data.brand_id,
            gender:data.gender, base_price:data.base_price, discount_price:data.discount_price, sku:data.sku, status:data.status,
            is_new: data.is_new?1:0, is_featured: data.is_featured?1:0,
            primary_image_id: primaryId ? primaryId : '',
            primary_index: newPrimaryIndex ?? '',
            _method:'PUT'
        };
        // append existing image order
        existingImages.forEach((img, idx)=>{
            formData.append(`existing_images[${idx}][id]`, img.id);
            formData.append(`existing_images[${idx}][is_primary]`, primaryId===img.id ? '1' : '0');
            formData.append(`existing_images[${idx}][display_order]`, idx);
        });
        removeImageIds.forEach((id,i)=> formData.append(`remove_image_ids[${i}]`, id));
        // variants
        variantRows.forEach((row,i)=>{
            if(row.id) formData.append(`variants[${i}][id]`, row.id);
            formData.append(`variants[${i}][sku]`, row.sku||'');
            formData.append(`variants[${i}][size_value]`, row.size_value);
            formData.append(`variants[${i}][color_name]`, row.color_name||'Default');
            formData.append(`variants[${i}][color_hex]`, row.color_hex||'#000000');
            formData.append(`variants[${i}][stock_quantity]`, row.stock_quantity);
            formData.append(`variants[${i}][price]`, row.price||'');
            formData.append(`variants[${i}][is_active]`, row.is_active?1:0);
        });
        removeVariantIds.forEach((id,i)=> formData.append(`remove_variant_ids[${i}]`, id));

        Object.entries(payload).forEach(([k,v])=>{
            if(['existing_images','remove_image_ids','variants','remove_variant_ids'].includes(k)) return;
            if(k==='images') return;
            if(k==='discount_price') {
                if(v!=='' && v!==null && v!==undefined) formData.append(k, v);
                return;
            }
            if(v!=='' && v!==null && v!==undefined) formData.append(k, v);
        });
        data.images.forEach(f=> formData.append('images[]', f));
        if(newPrimaryIndex!==null) formData.append('primary_index', newPrimaryIndex);

        setIsSubmitting(true);
        const toastId = toast.loading('Updating product...');
        router.post(route('admin.products.update', product.id), formData, {
            forceFormData: true,
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Product updated successfully!', { id: toastId });
            },
            onError: (errs) => {
                const firstErr = Object.values(errs)[0] || 'Failed to update product. Check inputs.';
                toast.error(firstErr, { id: toastId });
            },
            onFinish: () => {
                setIsSubmitting(false);
            }
        });
    };

    const flatCategories = allCategories.length ? allCategories : categories;

    return (
        <AdminLayout header={`Edit: ${product.name}`}>
            <div className="max-w-5xl mx-auto">
                <div className="mb-4 flex justify-between">
                    <Link href={route('admin.products.index')} className="text-sm font-bold text-gray-600 hover:text-rose-600">← Back to Products</Link>
                    <span className="text-xs font-mono text-gray-500">ID #{product.id} • {product.slug}</span>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="font-black text-slate-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Product Name *</label>
                                <input value={data.name} onChange={e=> { setData('name', e.target.value); if(!slugTouched) setData('slug', slugify(e.target.value)); }} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                                {errors.name && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.name}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Slug (editable)</label>
                                <div className="flex gap-2">
                                    <input value={data.slug} onChange={e=> { setSlugTouched(true); setData('slug', e.target.value);}} className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono font-semibold focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                                    <button type="button" onClick={()=> setData('slug', slugify(data.name))} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-black hover:bg-slate-900 hover:text-white transition">Regenerate</button>
                                </div>
                                {errors.slug && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.slug}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Description</label>
                                <textarea value={data.description} onChange={e=> setData('description', e.target.value)} rows={5} className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Material</label>
                                <input value={data.material} onChange={e=> setData('material', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Care Instructions</label>
                                <input value={data.care_instructions} onChange={e=> setData('care_instructions', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="font-black text-slate-900 mb-4">Catalog & Pricing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Category *</label>
                                <select value={data.category_id} onChange={e=> setData('category_id', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none">
                                    <option value="">Select</option>
                                    {flatCategories.map(c=> <option key={c.id} value={String(c.id)}>{c.name}</option>)}
                                </select>
                                {errors.category_id && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.category_id}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Brand *</label>
                                <select value={data.brand_id} onChange={e=> setData('brand_id', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none">
                                    <option value="">Select</option>
                                    {brands.map(b=> <option key={b.id} value={String(b.id)}>{b.name}</option>)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Gender</label>
                                <select value={data.gender} onChange={e=> setData('gender', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none">
                                    <option>Unisex</option><option>Men</option><option>Women</option><option>Kids</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Status</label>
                                <select value={data.status} onChange={e=> setData('status', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none">
                                    <option value="active">Active</option><option value="draft">Draft</option><option value="out_of_stock">Out of Stock</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Base Price *</label>
                                <input type="number" step="0.01" value={data.base_price} onChange={e=> setData('base_price', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                                {errors.base_price && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.base_price}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Discount Price</label>
                                <input type="number" step="0.01" value={data.discount_price} onChange={e=> setData('discount_price', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                                {errors.discount_price && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.discount_price}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">SKU</label>
                                <input value={data.sku} onChange={e=> setData('sku', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-mono font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                                {errors.sku && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.sku}</p>}
                            </div>
                            <div className="flex items-center gap-6 pt-6">
                                <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={data.is_new} onChange={e=> setData('is_new', e.target.checked)} className="rounded border-gray-300 text-rose-600 focus:ring-rose-500" /> New</label>
                                <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={data.is_featured} onChange={e=> setData('is_featured', e.target.checked)} className="rounded border-gray-300 text-rose-600 focus:ring-rose-500" /> Featured</label>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="font-black text-slate-900 mb-1">Images</h3>
                        <p className="text-xs text-gray-500 font-semibold mb-4">Existing images — drag to reorder, ★ primary, ✕ remove. New uploads appended. Server resizes to 800×800.</p>
                        {existingImages.length>0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
                                {existingImages.map((img, idx)=> (
                                    <div key={img.id} draggable onDragStart={()=> onDragStart(idx)} onDragOver={(e)=> e.preventDefault()} onDrop={(e)=> onDrop(e, idx)} className={`relative border-2 rounded-xl overflow-hidden bg-gray-50 ${primaryId===img.id ? 'border-rose-500' : 'border-gray-200'}`}>
                                        <img src={img.image_url || img.url} className="w-full h-32 object-cover" />
                                        <div className="absolute top-2 left-2 flex gap-1">
                                            <span className="px-1.5 py-0.5 bg-white/90 rounded text-[10px] font-black">#{idx+1}</span>
                                            {primaryId===img.id && <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black">PRIMARY</span>}
                                        </div>
                                        <div className="absolute bottom-1 left-1 right-1 flex gap-1">
                                            <button type="button" onClick={()=> setPrimaryId(img.id)} className={`flex-1 py-1 rounded-md text-[11px] font-black ${primaryId===img.id ? 'bg-rose-600 text-white' : 'bg-white/90 text-slate-900 hover:bg-slate-900 hover:text-white'}`}>★</button>
                                            <button type="button" onClick={()=> removeExisting(img.id)} className="px-2 py-1 bg-white/90 rounded-md text-[11px] font-black text-red-600 hover:bg-red-600 hover:text-white">✕</button>
                                        </div>
                                        <div className="absolute top-2 right-2 text-[10px] font-bold bg-black/50 text-white px-1 rounded">drag</div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleNewImages} className="hidden" />
                        <button type="button" onClick={()=> fileRef.current?.click()} className="w-full py-6 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:border-rose-300 transition text-center">
                            <div className="text-sm font-black">+ Add more images</div>
                            <div className="text-xs text-gray-500">JPEG/PNG/WEBP, 5MB max each</div>
                        </button>
                        {newPreviews.length>0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-3">
                                {newPreviews.map((p,i)=> (
                                    <div key={i} className={`relative border-2 rounded-xl overflow-hidden bg-gray-50 ${newPrimaryIndex===i ? 'border-rose-500' : 'border-green-200'}`}>
                                        <img src={p.url} className="w-full h-32 object-cover" />
                                        <span className="absolute top-2 left-2 px-1.5 py-0.5 bg-green-600 text-white rounded text-[10px] font-black">NEW #{i+1}</span>
                                        <div className="absolute bottom-1 left-1 right-1 flex gap-1">
                                            <button type="button" onClick={()=> setNewPrimaryIndex(i)} className={`flex-1 py-1 rounded-md text-[11px] font-black ${newPrimaryIndex===i ? 'bg-rose-600 text-white' : 'bg-white/90'}`}>★ Primary</button>
                                            <button type="button" onClick={()=> removeNewPreview(i)} className="px-2 py-1 bg-white/90 rounded-md text-[11px] font-black text-red-600 hover:bg-red-600 hover:text-white">✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {progress && <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-rose-600 transition-all" style={{width:`${progress.percentage}%`}} /></div>}
                    </div>

                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="font-black text-slate-900 mb-1">Variants</h3>
                        <p className="text-xs text-gray-500 font-semibold mb-4">Edit stock & price override per variant. Add new combinations below.</p>
                        {variantRows.length>0 && (
                            <div className="overflow-x-auto border border-gray-200 rounded-xl mb-4">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 border-b text-[11px] font-black tracking-widest text-gray-500 uppercase">
                                        <tr><th className="px-3 py-2">Size</th><th className="px-3 py-2">Color</th><th className="px-3 py-2">Hex</th><th className="px-3 py-2">Stock</th><th className="px-3 py-2">Price</th><th className="px-3 py-2">SKU</th><th className="px-3 py-2"></th></tr>
                                    </thead>
                                    <tbody>
                                        {variantRows.map((v,i)=> (
                                            <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="px-3 py-2"><input value={v.size_value} onChange={e=> updateVariant(i,'size_value', e.target.value)} className="w-20 px-2 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-semibold" /></td>
                                                <td className="px-3 py-2"><input value={v.color_name} onChange={e=> updateVariant(i,'color_name', e.target.value)} className="w-24 px-2 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-semibold" /></td>
                                                <td className="px-3 py-2"><div className="flex items-center gap-2"><input type="color" value={v.color_hex||'#000000'} onChange={e=> updateVariant(i,'color_hex', e.target.value)} className="w-8 h-8 p-0 rounded-md" /><input value={v.color_hex} onChange={e=> updateVariant(i,'color_hex', e.target.value)} className="w-20 px-2 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-mono" /></div></td>
                                                <td className="px-3 py-2"><input type="number" min="0" value={v.stock_quantity} onChange={e=> updateVariant(i,'stock_quantity', e.target.value)} className="w-20 px-2 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-bold" /></td>
                                                <td className="px-3 py-2"><input type="number" step="0.01" value={v.price} onChange={e=> updateVariant(i,'price', e.target.value)} placeholder="—" className="w-24 px-2 py-1.5 bg-white border border-gray-200 rounded-md text-sm" /></td>
                                                <td className="px-3 py-2"><input value={v.sku} onChange={e=> updateVariant(i,'sku', e.target.value)} placeholder="auto" className="w-24 px-2 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-mono" /></td>
                                                <td className="px-3 py-2"><button type="button" onClick={()=> removeVariant(i)} className="text-red-600 hover:text-red-700 text-xs font-black">✕ Remove</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 items-end">
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">New sizes</label>
                                <input value={sizeInput} onChange={e=> setSizeInput(e.target.value)} placeholder="11, 12" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">New colors (Name:Hex)</label>
                                <input value={colorInput} onChange={e=> setColorInput(e.target.value)} placeholder="Red:#ff0000" className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-sm font-mono focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                            </div>
                            <button type="button" onClick={generateVariants} className="px-4 py-2.5 bg-slate-900 hover:bg-black text-white rounded-lg text-sm font-black transition">Add Combinations</button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link href={route('admin.products.index')} className="px-6 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-black hover:bg-gray-50">Cancel</Link>
                        <button disabled={isSubmitting} className="px-8 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-sm font-black transition">{isSubmitting ? 'Saving…' : 'Update Product'}</button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
