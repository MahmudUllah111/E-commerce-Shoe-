import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import Modal from '@/Components/Modal';
import { Link, router, usePage } from '@inertiajs/react';

export default function Index({ products, filters = {}, categories = [], brands = [] }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [selected, setSelected] = useState([]);
    const [showDelete, setShowDelete] = useState(null);
    const [showBulk, setShowBulk] = useState(false);
    const [bulkAction, setBulkAction] = useState('delete');

    useEffect(() => {
        if (search === (filters.search || '')) return;
        const t = setTimeout(() => {
            router.get(route('admin.products.index'), { ...filters, search, page: 1 }, { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const applyFilter = (key, value) => {
        router.get(route('admin.products.index'), { ...filters, [key]: value, page: 1 }, { preserveState: true, replace: true });
    };

    const toggleSelect = (id) => {
        setSelected(prev => prev.includes(id) ? prev.filter(x=>x!==id) : [...prev, id]);
    };
    const toggleAll = () => {
        const ids = (products.data||[]).map(p=>p.id);
        setSelected(prev => prev.length === ids.length ? [] : ids);
    };

    const handleBulk = () => {
        if (!selected.length) return;
        router.post(route('admin.products.bulk'), { ids: selected, action: bulkAction }, {
            onSuccess: () => { setSelected([]); setShowBulk(false); }
        });
    };

    const handleDelete = (id) => {
        router.delete(route('admin.products.destroy', id), {
            onSuccess: () => setShowDelete(null),
            preserveScroll: true,
        });
    };

    const rows = products.data || [];
    const allSelected = rows.length>0 && selected.length===rows.length;

    return (
        <AdminLayout header="Product Management">
            {flash?.success && <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.success}</div>}
            {flash?.error && <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.error}</div>}

            {/* Filters Bar */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4">
                <div className="flex flex-col lg:flex-row gap-3 lg:items-center lg:justify-between">
                    <div className="flex flex-col sm:flex-row gap-3 flex-1">
                        <div className="relative flex-1 max-w-md">
                            <input
                                type="text"
                                value={search}
                                onChange={e=> setSearch(e.target.value)}
                                placeholder="Search name, SKU, slug..."
                                className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium placeholder:text-gray-400 focus:bg-white focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none transition"
                            />
                            <svg className="absolute left-3 top-3 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
                        </div>
                        <select value={filters.category_id||''} onChange={e=> applyFilter('category_id', e.target.value||undefined)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold min-w-[160px] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none">
                            <option value="">All Categories</option>
                            {categories.map(c=> <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                        <select value={filters.brand_id||''} onChange={e=> applyFilter('brand_id', e.target.value||undefined)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold min-w-[150px] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none">
                            <option value="">All Brands</option>
                            {brands.map(b=> <option key={b.id} value={b.id}>{b.name}</option>)}
                        </select>
                        <select value={filters.status||'all'} onChange={e=> applyFilter('status', e.target.value)} className="px-3 py-2.5 bg-white border border-gray-200 rounded-lg text-sm font-semibold min-w-[140px] focus:border-rose-500 focus:ring-2 focus:ring-rose-500/20 outline-none">
                            <option value="all">All Status</option>
                            <option value="active">Active</option>
                            <option value="draft">Draft</option>
                            <option value="out_of_stock">Out of Stock</option>
                        </select>
                    </div>
                    <Link href={route('admin.products.create')} className="inline-flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-lg text-sm font-black transition">
                        <span className="text-lg leading-none">+</span> Add Product
                    </Link>
                </div>

                {/* Bulk action bar */}
                {selected.length>0 && (
                    <div className="mt-4 flex flex-wrap items-center gap-3 bg-rose-50 border border-rose-200 rounded-lg px-4 py-3">
                        <span className="text-sm font-bold text-rose-700">{selected.length} selected</span>
                        <select value={bulkAction} onChange={e=> setBulkAction(e.target.value)} className="px-3 py-1.5 bg-white border border-rose-200 rounded-md text-sm font-semibold">
                            <option value="delete">Move to Trash</option>
                            <option value="active">Set Active</option>
                            <option value="draft">Set Draft</option>
                            <option value="out_of_stock">Set Out of Stock</option>
                        </select>
                        <button onClick={handleBulk} className="px-4 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-md text-sm font-bold transition">Apply</button>
                        <button onClick={()=> setSelected([])} className="text-sm font-semibold text-gray-600 hover:text-rose-600">Clear</button>
                    </div>
                )}
            </div>

            {/* Table */}
            <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b text-[11px] tracking-widest font-black text-gray-500 uppercase">
                                <th className="px-4 py-3 w-10">
                                    <input type="checkbox" checked={allSelected} onChange={toggleAll} className="rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
                                </th>
                                <th className="px-4 py-3">Product</th>
                                <th className="px-4 py-3">Category</th>
                                <th className="px-4 py-3">SKU</th>
                                <th className="px-4 py-3">Price</th>
                                <th className="px-4 py-3">Status</th>
                                <th className="px-4 py-3">Stock</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {rows.length===0 ? (
                                <tr><td colSpan={8} className="px-4 py-12 text-center text-gray-400 font-semibold">No products found.</td></tr>
                            ) : rows.map(r=> {
                                const thumb = r.images?.find(i=> i.is_primary)?.image_url || r.images?.[0]?.image_url || r.images?.[0]?.url || 'https://via.placeholder.com/80?text=No+Image';
                                const totalStock = r.variants?.reduce((s,v)=> s + Number(v.stock_quantity||0), 0) ?? '-';
                                const displayPrice = r.base_price ?? r.price;
                                return (
                                    <tr key={r.id} className="border-b border-gray-100 hover:bg-gray-50/70 transition">
                                        <td className="px-4 py-3">
                                            <input type="checkbox" checked={selected.includes(r.id)} onChange={()=> toggleSelect(r.id)} className="rounded border-gray-300 text-rose-600 focus:ring-rose-500" />
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center gap-3">
                                                <img src={thumb} alt={r.name} className="w-11 h-11 object-cover bg-gray-50 rounded-lg border border-gray-100" />
                                                <div>
                                                    <div className="font-black text-slate-900 leading-tight">{r.name}</div>
                                                    <div className="text-xs text-gray-500 font-mono">{r.slug}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-4 py-3 font-semibold text-gray-700">{r.category?.name || '-'}</td>
                                        <td className="px-4 py-3 font-mono text-xs font-bold text-gray-600">{r.sku || '-'}</td>
                                        <td className="px-4 py-3">
                                            <div className="font-black">${Number(displayPrice||0).toFixed(2)}</div>
                                            {r.discount_price && <div className="text-xs text-rose-600 font-bold line-through decoration-rose-300">${Number(r.discount_price).toFixed(2)} discount</div>}
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2.5 py-1 rounded-full text-[11px] font-black tracking-wide uppercase ${r.status==='active'?'bg-green-100 text-green-700 border border-green-200': r.status==='draft'?'bg-amber-100 text-amber-700 border border-amber-200':'bg-red-100 text-red-700 border border-red-200'}`}>{r.status}</span>
                                        </td>
                                        <td className="px-4 py-3 font-bold">{r.variants?.length ? totalStock : <span className="text-gray-400">—</span>}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex justify-end gap-2">
                                                <Link href={route('admin.products.edit', r.id)} className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs font-black hover:border-slate-900 hover:bg-slate-900 hover:text-white transition">Edit</Link>
                                                <button onClick={()=> setShowDelete(r)} className="px-3 py-1.5 bg-white border border-red-200 text-red-600 rounded-md text-xs font-black hover:bg-red-600 hover:text-white transition">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {products.links && (
                    <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 bg-gray-50 border-t">
                        <div className="text-xs font-bold text-gray-500">
                            Showing {products.from ?? 0} to {products.to ?? 0} of {products.total} products
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                            {products.links.map((link, i)=> (
                                link.url ? (
                                    <Link
                                        key={i}
                                        href={link.url}
                                        dangerouslySetInnerHTML={{__html: link.label}}
                                        className={`px-3 py-1.5 rounded-md text-xs font-black border ${link.active ? 'bg-slate-900 text-white border-slate-900' : 'bg-white border-gray-200 hover:border-slate-900 hover:bg-slate-900 hover:text-white transition'}`}
                                    />
                                ) : (
                                    <span key={i} dangerouslySetInnerHTML={{__html: link.label}} className="px-3 py-1.5 rounded-md text-xs font-bold bg-gray-100 text-gray-400 border border-gray-200" />
                                )
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Delete Modal */}
            <Modal show={!!showDelete} onClose={()=> setShowDelete(null)} maxWidth="md">
                <div className="p-6">
                    <h3 className="text-lg font-black text-slate-900">Move to trash?</h3>
                    <p className="text-sm text-gray-600 mt-2">Product <span className="font-bold text-slate-900">{showDelete?.name}</span> will be soft-deleted and can be restored from database. Variants and images remain but hidden.</p>
                    <div className="flex justify-end gap-3 mt-6">
                        <button onClick={()=> setShowDelete(null)} className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-bold hover:bg-gray-50">Cancel</button>
                        <button onClick={()=> handleDelete(showDelete.id)} className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-black">Move to Trash</button>
                    </div>
                </div>
            </Modal>
        </AdminLayout>
    );
}
