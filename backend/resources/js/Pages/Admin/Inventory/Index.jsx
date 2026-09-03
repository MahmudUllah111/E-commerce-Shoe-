import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, usePage } from '@inertiajs/react';
import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { ChevronDown, ChevronRight, Bell, AlertTriangle, CheckCircle, Package } from 'lucide-react';

export default function Index({ products = {}, filters = {}, logs = [] }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [lowOnly, setLowOnly] = useState(!!filters.low_stock);
    const [expandedRows, setExpandedRows] = useState({});
    const [editingStock, setEditingStock] = useState({});
    const [editingThreshold, setEditingThreshold] = useState({});

    const apply = () => router.get(route('admin.inventory.index'), {
        search: search || undefined,
        low_stock: lowOnly ? 1 : undefined,
        page: 1
    }, { preserveState: true });

    const toggleRow = (id) => {
        setExpandedRows(prev => ({ ...prev, [id]: !prev[id] }));
    };

    const expandAll = () => {
        const all = {};
        (products.data || []).forEach(p => { all[p.id] = true; });
        setExpandedRows(all);
    };

    const collapseAll = () => {
        setExpandedRows({});
    };

    const saveStock = (variant) => {
        const val = editingStock[variant.id];
        if (val === undefined || val === '') return;
        router.patch(route('admin.inventory.stock', variant.id), {
            stock_quantity: parseInt(val),
            reason: 'inline edit'
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Stock updated'),
            onError: (e) => toast.error(Object.values(e)[0] || 'Failed')
        });
    };

    const saveThreshold = (variant) => {
        const val = editingThreshold[variant.id];
        if (val === undefined || val === '') return;
        router.patch(route('admin.inventory.threshold', variant.id), {
            low_stock_threshold: parseInt(val)
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success('Threshold updated'),
            onError: (e) => toast.error(Object.values(e)[0] || 'Failed')
        });
    };

    const adjust = (variant, delta) => {
        router.post(route('admin.inventory.adjust', variant.id), {
            change_amount: delta,
            reason: delta > 0 ? 'restock' : 'sale adjustment'
        }, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Adjusted ${delta > 0 ? '+' : ''}${delta}`)
        });
    };

    const rows = products?.data || [];

    return (
        <AdminLayout header="Inventory Management — Products & Variant Stocks">
            {flash?.success && <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.success}</div>}
            {flash?.error && <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.error}</div>}

            {/* Filter & Search Bar */}
            <div className="bg-white border rounded-xl p-4 mb-4 shadow-sm">
                <div className="flex flex-col md:flex-row gap-3 items-center justify-between">
                    <div className="flex flex-1 gap-2 w-full">
                        <input
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            onKeyDown={e => e.key === 'Enter' && apply()}
                            placeholder="Search shoe name, brand, SKU..."
                            className="flex-1 px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium focus:bg-white focus:border-rose-500 outline-none"
                        />
                        <label className="flex items-center gap-2 text-sm font-bold px-3 py-2.5 bg-white border rounded-lg cursor-pointer select-none">
                            <input
                                type="checkbox"
                                checked={lowOnly}
                                onChange={e => setLowOnly(e.target.checked)}
                                className="rounded text-rose-600 focus:ring-rose-500"
                            />
                            Low stock only
                        </label>
                        <button onClick={apply} className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-lg text-sm font-black transition">
                            Filter
                        </button>
                    </div>
                    <div className="flex gap-2 shrink-0">
                        <button onClick={expandAll} className="px-3 py-2 border rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50">
                            Expand All
                        </button>
                        <button onClick={collapseAll} className="px-3 py-2 border rounded-lg text-xs font-bold text-gray-600 hover:bg-gray-50">
                            Collapse All
                        </button>
                        <Link href={route('admin.inventory.logs')} className="px-4 py-2 bg-white border rounded-lg text-xs font-bold hover:bg-gray-50">
                            History →
                        </Link>
                    </div>
                </div>
                <div className="text-xs text-gray-500 font-semibold mt-2">
                    Each shoe model is displayed in 1 clean row. Click anywhere on the row to view and manage its size & color variants.
                </div>
            </div>

            {/* Products Table (1 Row per Shoe) */}
            <div className="bg-white border rounded-xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="bg-gray-50 border-b text-[11px] tracking-widest font-black text-gray-500 uppercase">
                                <th className="w-8 px-4 py-3"></th>
                                <th className="px-4 py-3">Shoe Model</th>
                                <th className="px-4 py-3">Master SKU</th>
                                <th className="px-4 py-3">Variants</th>
                                <th className="px-4 py-3">Total Stock</th>
                                <th className="px-4 py-3">Stock Health</th>
                                <th className="px-4 py-3 text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {rows.length === 0 ? (
                                <tr>
                                    <td colSpan={7} className="px-4 py-12 text-center text-gray-400 font-semibold">
                                        No shoe products match your search or filter.
                                    </td>
                                </tr>
                            ) : (
                                rows.map(p => {
                                    const isExpanded = !!expandedRows[p.id];
                                    const img = p.images?.[0]?.image_url || p.images?.[0]?.url || 'https://via.placeholder.com/60?text=Shoe';
                                    const variants = p.variants || [];
                                    const isLow = p.low_stock_count > 0;
                                    const isOut = p.out_of_stock_count > 0;

                                    return (
                                        <React.Fragment key={p.id}>
                                            <tr
                                                onClick={() => toggleRow(p.id)}
                                                className={`cursor-pointer transition hover:bg-gray-50 select-none ${isExpanded ? 'bg-slate-50' : ''}`}
                                            >
                                                <td className="px-4 py-3 text-gray-400 text-center">
                                                    {isExpanded ? <ChevronDown size={18} className="text-slate-800" /> : <ChevronRight size={18} />}
                                                </td>
                                                <td className="px-4 py-3">
                                                    <div className="flex items-center gap-3">
                                                        <img src={img} alt={p.name} className="w-12 h-12 object-contain bg-white rounded-lg border p-1 shrink-0" />
                                                        <div>
                                                            <div className="font-bold text-slate-900 text-sm">{p.name}</div>
                                                            <div className="text-xs text-gray-500 font-semibold">
                                                                {p.brand?.name || 'Brand'} • {p.category?.name || 'Category'} • {p.gender || 'Unisex'}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </td>
                                                <td className="px-4 py-3 font-mono text-xs font-bold text-gray-700">
                                                    {p.sku || `PROD-${p.id}`}
                                                </td>
                                                <td className="px-4 py-3 text-xs font-bold text-gray-600">
                                                    <span className="bg-gray-100 px-2.5 py-1 rounded-full">{variants.length} sizes/colors</span>
                                                </td>
                                                <td className="px-4 py-3">
                                                    <span className="font-black text-sm text-slate-900">{p.total_stock}</span> units
                                                </td>
                                                <td className="px-4 py-3">
                                                    {isOut ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-rose-100 text-rose-800 border border-rose-200">
                                                            <AlertTriangle size={12} /> {p.out_of_stock_count} Out of Stock
                                                        </span>
                                                    ) : isLow ? (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-amber-100 text-amber-800 border border-amber-200">
                                                            <AlertTriangle size={12} /> {p.low_stock_count} Low Stock
                                                        </span>
                                                    ) : (
                                                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-black bg-emerald-100 text-emerald-800 border border-emerald-200">
                                                            <CheckCircle size={12} /> Healthy ({p.total_stock})
                                                        </span>
                                                    )}
                                                    {p.pending_notifications > 0 && (
                                                        <span className="ml-2 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-100 text-purple-700">
                                                            <Bell size={10} /> {p.pending_notifications} waiting
                                                        </span>
                                                    )}
                                                </td>
                                                <td className="px-4 py-3 text-right">
                                                    <button
                                                        onClick={(e) => { e.stopPropagation(); toggleRow(p.id); }}
                                                        className="px-3 py-1.5 border rounded-lg text-xs font-bold text-slate-700 hover:bg-white"
                                                    >
                                                        {isExpanded ? 'Hide Variants' : 'Manage Variants'}
                                                    </button>
                                                </td>
                                            </tr>

                                            {/* Sub-table: Size & Color Variants */}
                                            {isExpanded && (
                                                <tr className="bg-slate-50">
                                                    <td colSpan={7} className="px-6 py-4">
                                                        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-inner p-4">
                                                            <div className="flex items-center justify-between pb-3 border-b mb-3">
                                                                <h4 className="text-xs font-black uppercase text-gray-700 tracking-wider flex items-center gap-1.5">
                                                                    <Package size={14} className="text-rose-600" /> Size & Color Variants for {p.name}
                                                                </h4>
                                                                <Link
                                                                    href={route('admin.products.edit', p.id)}
                                                                    className="text-xs font-bold text-rose-600 hover:underline"
                                                                >
                                                                    Edit Product & All Details →
                                                                </Link>
                                                            </div>

                                                            <table className="w-full text-left text-xs">
                                                                <thead>
                                                                    <tr className="text-gray-400 font-bold uppercase tracking-wider border-b text-[10px]">
                                                                        <th className="py-2">SKU</th>
                                                                        <th className="py-2">Size</th>
                                                                        <th className="py-2">Color</th>
                                                                        <th className="py-2">Current Stock</th>
                                                                        <th className="py-2">Low Stock Threshold</th>
                                                                        <th className="py-2">Status</th>
                                                                        <th className="py-2 text-right">Quick Restock</th>
                                                                    </tr>
                                                                </thead>
                                                                <tbody className="divide-y divide-gray-100">
                                                                    {variants.map(v => {
                                                                        const vLow = v.stock_quantity <= v.low_stock_threshold;
                                                                        const vOut = v.stock_quantity === 0;

                                                                        return (
                                                                            <tr key={v.id} className={`hover:bg-gray-50/80 ${vOut ? 'bg-rose-50/30' : vLow ? 'bg-amber-50/30' : ''}`}>
                                                                                <td className="py-2.5 font-mono font-bold text-gray-800">{v.sku}</td>
                                                                                <td className="py-2.5 font-bold text-slate-900">US {v.size_value}</td>
                                                                                <td className="py-2.5">
                                                                                    <div className="flex items-center gap-1.5 font-semibold text-gray-700">
                                                                                        <span className="w-3.5 h-3.5 rounded-full border shadow-sm" style={{ background: v.color_hex || '#000' }} />
                                                                                        <span>{v.color_name}</span>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="py-2.5">
                                                                                    <div className="flex items-center gap-1.5">
                                                                                        <input
                                                                                            type="number"
                                                                                            value={editingStock[v.id] ?? v.stock_quantity}
                                                                                            onChange={e => setEditingStock(s => ({ ...s, [v.id]: e.target.value }))}
                                                                                            className="w-16 px-2 py-1 border rounded text-xs font-bold"
                                                                                        />
                                                                                        <button
                                                                                            onClick={() => saveStock(v)}
                                                                                            className="px-2 py-1 bg-slate-900 hover:bg-black text-white rounded text-[11px] font-bold"
                                                                                        >
                                                                                            Save
                                                                                        </button>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="py-2.5">
                                                                                    <div className="flex items-center gap-1.5">
                                                                                        <input
                                                                                            type="number"
                                                                                            value={editingThreshold[v.id] ?? v.low_stock_threshold}
                                                                                            onChange={e => setEditingThreshold(s => ({ ...s, [v.id]: e.target.value }))}
                                                                                            className="w-14 px-2 py-1 border rounded text-xs font-bold"
                                                                                        />
                                                                                        <button
                                                                                            onClick={() => saveThreshold(v)}
                                                                                            className="px-2 py-1 bg-gray-100 hover:bg-gray-200 text-gray-800 rounded text-[11px] font-bold border"
                                                                                        >
                                                                                            Save
                                                                                        </button>
                                                                                    </div>
                                                                                </td>
                                                                                <td className="py-2.5">
                                                                                    {vOut ? (
                                                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-rose-100 text-rose-700 border border-rose-200">OUT</span>
                                                                                    ) : vLow ? (
                                                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-100 text-amber-700 border border-amber-200">LOW</span>
                                                                                    ) : (
                                                                                        <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-emerald-100 text-emerald-700 border border-emerald-200">OK</span>
                                                                                    )}
                                                                                </td>
                                                                                <td className="py-2.5 text-right">
                                                                                    <div className="flex items-center justify-end gap-1">
                                                                                        <button
                                                                                            onClick={() => adjust(v, 1)}
                                                                                            className="w-6 h-6 rounded bg-white hover:bg-gray-100 border text-[11px] font-black"
                                                                                            title="Add 1"
                                                                                        >
                                                                                            +1
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => adjust(v, -1)}
                                                                                            className="w-6 h-6 rounded bg-white hover:bg-gray-100 border text-[11px] font-black"
                                                                                            title="Subtract 1"
                                                                                        >
                                                                                            -1
                                                                                        </button>
                                                                                        <button
                                                                                            onClick={() => adjust(v, 10)}
                                                                                            className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 text-[11px] font-bold"
                                                                                            title="Restock 10"
                                                                                        >
                                                                                            +10
                                                                                        </button>
                                                                                    </div>
                                                                                </td>
                                                                            </tr>
                                                                        );
                                                                    })}
                                                                </tbody>
                                                            </table>
                                                        </div>
                                                    </td>
                                                </tr>
                                            )}
                                        </React.Fragment>
                                    );
                                })
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {products?.links && (
                    <div className="flex gap-1.5 flex-wrap px-4 py-3 bg-gray-50 border-t items-center justify-between">
                        <div className="text-xs text-gray-500 font-semibold">
                            Showing {products.from || 0} to {products.to || 0} of {products.total || 0} shoes
                        </div>
                        <div className="flex gap-1">
                            {products.links.map((l, i) =>
                                l.url ? (
                                    <Link
                                        key={i}
                                        href={l.url}
                                        dangerouslySetInnerHTML={{ __html: l.label }}
                                        className={`px-3 py-1.5 rounded-md text-xs font-black border ${l.active ? 'bg-slate-900 text-white' : 'bg-white hover:bg-slate-900 hover:text-white'}`}
                                    />
                                ) : (
                                    <span
                                        key={i}
                                        dangerouslySetInnerHTML={{ __html: l.label }}
                                        className="px-3 py-1.5 rounded-md text-xs font-bold bg-gray-100 text-gray-400 border"
                                    />
                                )
                            )}
                        </div>
                    </div>
                )}
            </div>
        </AdminLayout>
    );
}
