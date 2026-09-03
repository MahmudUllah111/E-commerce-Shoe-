import { useState, useEffect } from 'react';
import AdminLayout from '@/Layouts/AdminLayout';
import { router, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

export default function Index({ queries, filters = {} }) {
    const { flash } = usePage().props;
    const [search, setSearch] = useState(filters.search || '');
    const [activeQuery, setActiveQuery] = useState(null);

    useEffect(() => {
        if (search === (filters.search || '')) return;
        const t = setTimeout(() => {
            router.get(route('admin.queries.index'), { ...filters, search, page: 1 }, { preserveState: true, replace: true });
        }, 400);
        return () => clearTimeout(t);
    }, [search]);

    const handleFilter = (status) => {
        router.get(route('admin.queries.index'), { ...filters, status: status === 'all' ? undefined : status, page: 1 }, { preserveState: true, replace: true });
    };

    const updateStatus = (id, status) => {
        router.patch(route('admin.queries.status', id), { status }, {
            preserveScroll: true,
            onSuccess: () => toast.success(`Marked as ${status}`),
        });
    };

    const deleteQuery = (id) => {
        if (!confirm('Are you sure you want to delete this inquiry?')) return;
        router.delete(route('admin.queries.destroy', id), {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Inquiry deleted');
                if (activeQuery?.id === id) setActiveQuery(null);
            },
        });
    };

    const rows = queries.data || [];

    return (
        <AdminLayout header="Customer Inquiries & Queries">
            {flash?.success && <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.success}</div>}
            
            {/* Header & Filter */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 mb-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
                <div className="relative flex-1 w-full sm:max-w-md">
                    <input
                        type="text"
                        value={search}
                        onChange={e => setSearch(e.target.value)}
                        placeholder="Search by name, email, subject..."
                        className="w-full pl-3 pr-4 py-2 border border-gray-300 rounded-lg text-sm font-medium focus:ring-1 focus:ring-slate-900 outline-none"
                    />
                </div>
                <div className="flex items-center gap-2 w-full sm:w-auto">
                    {['all', 'unread', 'read', 'replied'].map(st => (
                        <button
                            key={st}
                            onClick={() => handleFilter(st)}
                            className={`px-3 py-1.5 rounded-full text-xs font-bold capitalize border ${(!filters.status && st === 'all') || filters.status === st ? 'bg-slate-900 text-white border-slate-900' : 'bg-white text-gray-600 hover:bg-gray-50 border-gray-200'}`}
                        >
                            {st}
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid lg:grid-cols-[1fr_400px] gap-6">
                {/* Inquiries Table */}
                <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead>
                                <tr className="bg-gray-50 border-b text-[11px] tracking-widest font-black text-gray-500 uppercase">
                                    <th className="px-4 py-3">Customer</th>
                                    <th className="px-4 py-3">Subject</th>
                                    <th className="px-4 py-3">Status</th>
                                    <th className="px-4 py-3">Date</th>
                                    <th className="px-4 py-3 text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {rows.length === 0 ? (
                                    <tr><td colSpan={5} className="px-4 py-12 text-center text-gray-400 font-semibold">No inquiries found.</td></tr>
                                ) : rows.map(q => (
                                    <tr 
                                        key={q.id} 
                                        onClick={() => setActiveQuery(q)}
                                        className={`border-b border-gray-100 hover:bg-gray-50/70 transition cursor-pointer ${activeQuery?.id === q.id ? 'bg-rose-50/40' : ''}`}
                                    >
                                        <td className="px-4 py-3">
                                            <div className="font-black text-slate-900">{q.name}</div>
                                            <div className="text-xs text-gray-500 font-medium">{q.email}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div className="font-bold text-gray-800 line-clamp-1">{q.subject || 'General Inquiry'}</div>
                                            <div className="text-xs text-gray-500 line-clamp-1">{q.message}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${q.status === 'unread' ? 'bg-amber-100 text-amber-800' : q.status === 'replied' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                                {q.status}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-xs text-gray-500 font-medium">
                                            {new Date(q.created_at).toLocaleDateString()}
                                        </td>
                                        <td className="px-4 py-3 text-right" onClick={e => e.stopPropagation()}>
                                            <div className="flex justify-end gap-1.5">
                                                {q.status !== 'read' && (
                                                    <button onClick={() => updateStatus(q.id, 'read')} className="px-2.5 py-1 text-xs font-bold border rounded bg-white hover:bg-gray-50">Mark Read</button>
                                                )}
                                                {q.status !== 'replied' && (
                                                    <button onClick={() => updateStatus(q.id, 'replied')} className="px-2.5 py-1 text-xs font-bold border border-blue-200 text-blue-700 rounded bg-blue-50 hover:bg-blue-100">Mark Replied</button>
                                                )}
                                                <button onClick={() => deleteQuery(q.id)} className="px-2.5 py-1 text-xs font-bold text-rose-600 hover:bg-rose-50 rounded">Delete</button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>

                    {queries.links && (
                        <div className="p-3 border-t bg-gray-50 flex justify-center gap-1">
                            {queries.links.map((l, i) => (
                                <button
                                    key={i}
                                    disabled={!l.url}
                                    onClick={() => router.get(l.url, {}, { preserveState: true })}
                                    dangerouslySetInnerHTML={{ __html: l.label }}
                                    className={`px-3 py-1 text-xs rounded border ${l.active ? 'bg-slate-900 text-white font-bold' : 'bg-white hover:bg-gray-100'}`}
                                />
                            ))}
                        </div>
                    )}
                </div>

                {/* Query Detail Pane */}
                <div className="bg-white border border-gray-200 rounded-xl p-6 h-fit sticky top-24">
                    {activeQuery ? (
                        <div className="space-y-4">
                            <div className="flex justify-between items-start">
                                <div>
                                    <h3 className="font-black text-lg text-slate-900">{activeQuery.subject || 'General Inquiry'}</h3>
                                    <div className="text-xs text-gray-500 font-semibold mt-0.5">From: {activeQuery.name} ({activeQuery.email})</div>
                                </div>
                                <span className={`inline-flex px-2.5 py-1 rounded-full text-[10px] font-black uppercase ${activeQuery.status === 'unread' ? 'bg-amber-100 text-amber-800' : activeQuery.status === 'replied' ? 'bg-blue-100 text-blue-800' : 'bg-emerald-100 text-emerald-800'}`}>
                                    {activeQuery.status}
                                </span>
                            </div>

                            <div className="bg-gray-50 border rounded-xl p-4 text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                                {activeQuery.message}
                            </div>

                            <div className="text-xs text-gray-500">
                                Received on: {new Date(activeQuery.created_at).toLocaleString()}
                            </div>

                            <div className="pt-3 border-t flex flex-wrap gap-2">
                                <a 
                                    href={`mailto:${activeQuery.email}?subject=Re: ${encodeURIComponent(activeQuery.subject || 'Your inquiry at TrustedMart')}`}
                                    onClick={() => updateStatus(activeQuery.id, 'replied')}
                                    className="flex-1 text-center py-2.5 bg-slate-900 text-white rounded-full font-bold text-xs hover:bg-black"
                                >
                                    Reply via Email →
                                </a>
                                {activeQuery.status === 'unread' && (
                                    <button onClick={() => updateStatus(activeQuery.id, 'read')} className="px-4 py-2 border rounded-full font-bold text-xs hover:bg-gray-50">
                                        Mark Read
                                    </button>
                                )}
                            </div>
                        </div>
                    ) : (
                        <div className="py-16 text-center text-gray-400">
                            <div className="text-3xl mb-2">✉️</div>
                            <div className="font-bold text-sm">Select an inquiry to view details</div>
                            <div className="text-xs mt-1">Directly view customer questions and reply</div>
                        </div>
                    )}
                </div>
            </div>
        </AdminLayout>
    );
}
