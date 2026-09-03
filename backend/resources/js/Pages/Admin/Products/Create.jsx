import { useState, useEffect, useRef } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm } from '@inertiajs/react';

function slugify(str) {
    return str.toLowerCase().trim().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
}

export default function Create({ categories = [], allCategories = [], brands = [] }) {
    const [slugTouched, setSlugTouched] = useState(false);
    const [imagePreviews, setImagePreviews] = useState([]);
    const [dragIndex, setDragIndex] = useState(null);
    const fileRef = useRef(null);

    // variant builder state
    const [sizeInput, setSizeInput] = useState('7, 8, 9, 10');
    const [colorInput, setColorInput] = useState('Black:#000000, White:#FFFFFF');
    const [variantRows, setVariantRows] = useState([]);

    const { data, setData, post, processing, errors, progress } = useForm({
        name: '',
        slug: '',
        description: '',
        material: '',
        care_instructions: '',
        category_id: '',
        brand_id: '',
        gender: 'Unisex',
        base_price: '',
        discount_price: '',
        sku: '',
        status: 'active',
        is_new: false,
        is_featured: false,
        images: [],
        primary_index: 0,
        variants: [],
    });

    useEffect(() => {
        if (!slugTouched && data.name) setData('slug', slugify(data.name));
    }, [data.name]);

    const handleImageChange = (e) => {
        const files = Array.from(e.target.files || []);
        const newPreviews = files.map(f => ({ file: f, url: URL.createObjectURL(f), name: f.name }));
        setImagePreviews(prev => [...prev, ...newPreviews]);
        setData('images', [...data.images, ...files]);
    };

    const removePreview = (idx) => {
        setImagePreviews(prev => prev.filter((_,i)=> i!==idx));
        setData('images', data.images.filter((_,i)=> i!==idx));
        if (data.primary_index >= imagePreviews.length-1) setData('primary_index', 0);
    };

    const onDragStart = (idx) => setDragIndex(idx);
    const onDragOver = (e, idx) => { e.preventDefault(); };
    const onDrop = (e, idx) => {
        e.preventDefault();
        if (dragIndex === null || dragIndex===idx) return;
        const newPreviews = [...imagePreviews];
        const [moved] = newPreviews.splice(dragIndex, 1);
        newPreviews.splice(idx, 0, moved);
        setImagePreviews(newPreviews);
        const newFiles = [...data.images];
        const [mf] = newFiles.splice(dragIndex, 1);
        newFiles.splice(idx, 0, mf);
        setData('images', newFiles);
        // adjust primary_index
        if (data.primary_index===dragIndex) setData('primary_index', idx);
        else if (data.primary_index>dragIndex && data.primary_index<=idx) setData('primary_index', data.primary_index-1);
        else if (data.primary_index<dragIndex && data.primary_index>=idx) setData('primary_index', data.primary_index+1);
        setDragIndex(null);
    };

    const parseColors = () => {
        return colorInput.split(',').map(s=> s.trim()).filter(Boolean).map(entry=> {
            const [name, hex] = entry.split(':').map(x=> x.trim());
            return { name: name || entry, hex: hex || '#000000' };
        });
    };

    const generateVariants = () => {
        const sizes = sizeInput.split(',').map(s=> s.trim()).filter(Boolean);
        const colors = parseColors();
        if (sizes.length===0) return;
        const combos = [];
        sizes.forEach(size=>{
            if (colors.length===0) {
                combos.push({ size_value: size, color_name: 'Default', color_hex: '#000000', stock_quantity: 10, price: '', sku: '' });
            } else {
                colors.forEach(c=> {
                    combos.push({ size_value: size, color_name: c.name, color_hex: c.hex, stock_quantity: 10, price: '', sku: '' });
                });
            }
        });
        setVariantRows(combos);
        setData('variants', combos);
    };

    const updateVariant = (idx, field, value) => {
        const copy = [...variantRows];
        copy[idx][field] = value;
        setVariantRows(copy);
        setData('variants', copy);
    };
    const removeVariant = (idx) => {
        const copy = variantRows.filter((_,i)=> i!==idx);
        setVariantRows(copy);
        setData('variants', copy);
    };

    const submit = (e) => {
        e.preventDefault();
        const formData = new FormData();
        Object.entries(data).forEach(([k,v])=>{
            if (k==='images') {
                v.forEach(f=> formData.append('images[]', f));
            } else if (k==='variants') {
                v.forEach((row,i)=>{
                    Object.entries(row).forEach(([fk,fv])=> formData.append(`variants[${i}][${fk}]`, fv ?? ''));
                });
            } else if (k==='primary_index') {
                formData.append('primary_index', v);
            } else if (typeof v==='boolean') {
                formData.append(k, v ? '1' : '0');
            } else if (v!=='' && v!==null && v!==undefined) {
                formData.append(k, v);
            }
        });
        post(route('admin.products.store'), { forceFormData: true });
    };

    const searchableBrands = brands;
    const flatCategories = allCategories.length ? allCategories : categories;

    return (
        <AdminLayout header="Add Product">
            <div className="max-w-5xl mx-auto">
                <div className="mb-4">
                    <Link href={route('admin.products.index')} className="text-sm font-bold text-gray-600 hover:text-rose-600">← Back to Products</Link>
                </div>

                <form onSubmit={submit} className="space-y-6">
                    {/* Basic Info */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="font-black text-slate-900 mb-4">Basic Information</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Product Name *</label>
                                <input value={data.name} onChange={e=> setData('name', e.target.value)} placeholder="e.g. Air Runner X" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                                {errors.name && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.name}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Slug (auto from name, editable)</label>
                                <div className="flex gap-2">
                                    <input value={data.slug} onChange={e=> { setSlugTouched(true); setData('slug', e.target.value);}} placeholder="air-runner-x" className="flex-1 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-mono font-semibold focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                                    <button type="button" onClick={()=> { setSlugTouched(false); setData('slug', slugify(data.name));}} className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-black hover:bg-slate-900 hover:text-white transition">Regenerate</button>
                                </div>
                                {errors.slug && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.slug}</p>}
                            </div>
                            <div className="md:col-span-2">
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Description (rich text)</label>
                                <textarea value={data.description} onChange={e=> setData('description', e.target.value)} rows={5} placeholder="Detailed product description. Supports plain text / HTML for rich text." className="w-full px-4 py-3 bg-white border border-gray-200 rounded-lg text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                                {errors.description && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.description}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Material</label>
                                <input value={data.material} onChange={e=> setData('material', e.target.value)} placeholder="e.g. Genuine Leather" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Care Instructions</label>
                                <input value={data.care_instructions} onChange={e=> setData('care_instructions', e.target.value)} placeholder="Wipe with dry cloth" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                            </div>
                        </div>
                    </div>

                    {/* Category / Brand / Pricing */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="font-black text-slate-900 mb-4">Catalog & Pricing</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Category *</label>
                                <select value={data.category_id} onChange={e=> setData('category_id', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none">
                                    <option value="">Select category</option>
                                    {flatCategories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
                                </select>
                                {errors.category_id && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.category_id}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Brand *</label>
                                <select value={data.brand_id} onChange={e=> setData('brand_id', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none">
                                    <option value="">Select brand</option>
                                    {searchableBrands.map(b=> <option key={b.id} value={b.id}>{b.name}</option>)}
                                </select>
                                {errors.brand_id && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.brand_id}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Gender</label>
                                <select value={data.gender} onChange={e=> setData('gender', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none">
                                    <option>Unisex</option><option>Men</option><option>Women</option><option>Kids</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Status *</label>
                                <select value={data.status} onChange={e=> setData('status', e.target.value)} className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none">
                                    <option value="active">Active</option><option value="draft">Draft</option><option value="out_of_stock">Out of Stock</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Base Price *</label>
                                <input type="number" step="0.01" value={data.base_price} onChange={e=> setData('base_price', e.target.value)} placeholder="99.99" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                                {errors.base_price && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.base_price}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Discount Price (optional)</label>
                                <input type="number" step="0.01" value={data.discount_price} onChange={e=> setData('discount_price', e.target.value)} placeholder="79.99" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                                {errors.discount_price && <p className="text-xs text-red-600 mt-1 font-semibold">{errors.discount_price}</p>}
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">SKU</label>
                                <input value={data.sku} onChange={e=> setData('sku', e.target.value)} placeholder="Auto if blank" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-mono font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                            </div>
                            <div className="flex items-center gap-6 pt-6">
                                <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={data.is_new} onChange={e=> setData('is_new', e.target.checked)} className="rounded border-gray-300 text-rose-600 focus:ring-rose-500" /> New</label>
                                <label className="flex items-center gap-2 text-sm font-bold"><input type="checkbox" checked={data.is_featured} onChange={e=> setData('is_featured', e.target.checked)} className="rounded border-gray-300 text-rose-600 focus:ring-rose-500" /> Featured</label>
                            </div>
                        </div>
                    </div>

                    {/* Images */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="font-black text-slate-900 mb-1">Product Images</h3>
                        <p className="text-xs text-gray-500 font-semibold mb-4">Upload up to 10 images • Drag to reorder • Click ★ to set primary. Images resized to 800×800 on server via Intervention.</p>
                        <input ref={fileRef} type="file" multiple accept="image/*" onChange={handleImageChange} className="hidden" />
                        <button type="button" onClick={()=> fileRef.current?.click()} className="w-full py-8 border-2 border-dashed border-gray-200 rounded-xl bg-gray-50 hover:bg-white hover:border-rose-300 transition text-center">
                            <div className="text-2xl mb-1">＋</div>
                            <div className="text-sm font-black text-slate-900">Click to upload or drag & drop</div>
                            <div className="text-xs text-gray-500 font-semibold">JPEG, PNG, WEBP up to 5MB each</div>
                        </button>
                        {imagePreviews.length>0 && (
                            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4">
                                {imagePreviews.map((p,i)=> (
                                    <div
                                        key={i}
                                        draggable
                                        onDragStart={()=> onDragStart(i)}
                                        onDragOver={(e)=> onDragOver(e,i)}
                                        onDrop={(e)=> onDrop(e,i)}
                                        className={`relative group border-2 rounded-xl overflow-hidden bg-gray-50 ${data.primary_index===i ? 'border-rose-500' : 'border-gray-200'}`}
                                    >
                                        <img src={p.url} alt={p.name} className="w-full h-32 object-cover" />
                                        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition" />
                                        <div className="absolute top-2 left-2 flex gap-1">
                                            <span className="px-1.5 py-0.5 bg-white/90 rounded text-[10px] font-black">#{i+1}</span>
                                            {data.primary_index===i && <span className="px-1.5 py-0.5 bg-rose-600 text-white rounded text-[10px] font-black">PRIMARY</span>}
                                        </div>
                                        <div className="absolute bottom-1 left-1 right-1 flex gap-1">
                                            <button type="button" onClick={()=> setData('primary_index', i)} className={`flex-1 py-1 rounded-md text-[11px] font-black ${data.primary_index===i ? 'bg-rose-600 text-white' : 'bg-white/90 text-slate-900 hover:bg-slate-900 hover:text-white'}`}>★ Primary</button>
                                            <button type="button" onClick={()=> removePreview(i)} className="px-2 py-1 bg-white/90 rounded-md text-[11px] font-black text-red-600 hover:bg-red-600 hover:text-white">✕</button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        {errors.images && <p className="text-xs text-red-600 mt-2 font-semibold">{errors.images}</p>}
                        {progress && <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden"><div className="h-full bg-rose-600 transition-all" style={{width: `${progress.percentage}%`}} /></div>}
                    </div>

                    {/* Variant Builder */}
                    <div className="bg-white border border-gray-200 rounded-xl p-6">
                        <h3 className="font-black text-slate-900 mb-1">Variant Builder</h3>
                        <p className="text-xs text-gray-500 font-semibold mb-4">Define sizes & colors, generate combinations. Then set stock & price override per variant.</p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Sizes (comma separated)</label>
                                <input value={sizeInput} onChange={e=> setSizeInput(e.target.value)} placeholder="7, 8, 9, 10" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                            </div>
                            <div>
                                <label className="block text-xs font-black tracking-widest uppercase text-gray-500 mb-1">Colors (Name:Hex, comma separated)</label>
                                <input value={colorInput} onChange={e=> setColorInput(e.target.value)} placeholder="Black:#000000, White:#FFFFFF" className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-mono font-semibold focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none" />
                            </div>
                        </div>
                        <button type="button" onClick={generateVariants} className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-lg text-sm font-black transition">Generate Combinations</button>

                        {variantRows.length>0 && (
                            <div className="mt-4 overflow-x-auto border border-gray-200 rounded-xl">
                                <table className="w-full text-left text-sm">
                                    <thead className="bg-gray-50 border-b text-[11px] font-black tracking-widest text-gray-500 uppercase">
                                        <tr><th className="px-3 py-2">Size</th><th className="px-3 py-2">Color</th><th className="px-3 py-2">Hex</th><th className="px-3 py-2">Stock</th><th className="px-3 py-2">Price Override</th><th className="px-3 py-2">SKU</th><th className="px-3 py-2"></th></tr>
                                    </thead>
                                    <tbody>
                                        {variantRows.map((v,i)=> (
                                            <tr key={i} className="border-b last:border-0 hover:bg-gray-50">
                                                <td className="px-3 py-2"><input value={v.size_value} onChange={e=> updateVariant(i,'size_value', e.target.value)} className="w-20 px-2 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-semibold" /></td>
                                                <td className="px-3 py-2"><input value={v.color_name} onChange={e=> updateVariant(i,'color_name', e.target.value)} className="w-24 px-2 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-semibold" /></td>
                                                <td className="px-3 py-2">
                                                    <div className="flex items-center gap-2">
                                                        <input type="color" value={v.color_hex} onChange={e=> updateVariant(i,'color_hex', e.target.value)} className="w-8 h-8 p-0 border border-gray-200 rounded-md" />
                                                        <input value={v.color_hex} onChange={e=> updateVariant(i,'color_hex', e.target.value)} className="w-20 px-2 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-mono" />
                                                    </div>
                                                </td>
                                                <td className="px-3 py-2"><input type="number" min="0" value={v.stock_quantity} onChange={e=> updateVariant(i,'stock_quantity', e.target.value)} className="w-20 px-2 py-1.5 bg-white border border-gray-200 rounded-md text-sm font-bold" /></td>
                                                <td className="px-3 py-2"><input type="number" step="0.01" value={v.price} onChange={e=> updateVariant(i,'price', e.target.value)} placeholder="—" className="w-24 px-2 py-1.5 bg-white border border-gray-200 rounded-md text-sm" /></td>
                                                <td className="px-3 py-2"><input value={v.sku} onChange={e=> updateVariant(i,'sku', e.target.value)} placeholder="auto" className="w-24 px-2 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-mono" /></td>
                                                <td className="px-3 py-2"><button type="button" onClick={()=> removeVariant(i)} className="text-red-600 hover:text-red-700 text-xs font-black">✕</button></td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>

                    <div className="flex justify-end gap-3">
                        <Link href={route('admin.products.index')} className="px-6 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-black hover:bg-gray-50">Cancel</Link>
                        <button disabled={processing} className="px-8 py-2.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-50 text-white rounded-lg text-sm font-black transition">{processing ? 'Saving…' : 'Create Product'}</button>
                    </div>
                </form>
            </div>
        </AdminLayout>
    );
}
