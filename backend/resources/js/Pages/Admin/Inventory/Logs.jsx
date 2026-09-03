import AdminLayout from '@/Layouts/AdminLayout';
import { Link } from '@inertiajs/react';
export default function Logs({ logs, filters={} }){
    const rows = logs.data || [];
    return (
        <AdminLayout header="Stock Logs History">
            <Link href={route('admin.inventory.index')} className="text-sm font-bold hover:text-rose-600">← Back to inventory</Link>
            <div className="mt-4 bg-white border rounded-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead><tr className="bg-gray-50 border-b text-[11px] tracking-widest font-black text-gray-500 uppercase"><th className="px-4 py-3">Time</th><th className="px-4 py-3">Product</th><th className="px-4 py-3">Variant</th><th className="px-4 py-3">Change</th><th className="px-4 py-3">Reason</th><th className="px-4 py-3">By</th></tr></thead>
                        <tbody>
                            {rows.length===0 ? <tr><td colSpan={6} className="px-4 py-12 text-center text-gray-400 font-semibold">No logs.</td></tr> :
                            rows.map(l=>(
                                <tr key={l.id} className="border-b hover:bg-gray-50">
                                    <td className="px-4 py-3 font-semibold text-xs">{new Date(l.created_at).toLocaleString()}</td>
                                    <td className="px-4 py-3 font-bold">{l.product_name}</td>
                                    <td className="px-4 py-3 font-mono text-xs">{l.sku} • US {l.size_value}</td>
                                    <td className={`px-4 py-3 font-black ${l.change_amount>0?'text-green-600':'text-red-600'}`}>{l.change_amount>0?`+${l.change_amount}`:l.change_amount}</td>
                                    <td className="px-4 py-3 text-xs font-medium text-gray-600">{l.reason}</td>
                                    <td className="px-4 py-3 text-xs font-semibold">{l.creator_name || `#${l.created_by}`}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                {logs.links && <div className="flex gap-1.5 flex-wrap px-4 py-3 bg-gray-50 border-t">{logs.links.map((l,i)=> l.url ? <Link key={i} href={l.url} dangerouslySetInnerHTML={{__html:l.label}} className={`px-3 py-1.5 rounded-md text-xs font-black border ${l.active?'bg-slate-900 text-white':'bg-white'}`} /> : <span key={i} dangerouslySetInnerHTML={{__html:l.label}} className="px-3 py-1.5 rounded-md text-xs bg-gray-100 border" /> )}</div>}
            </div>
        </AdminLayout>
    )
}
