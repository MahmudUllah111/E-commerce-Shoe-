import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

export default function Show({ customer, orders, addresses=[] }){
    const { flash } = usePage().props;
    const toggle = ()=> router.post(route('admin.customers.toggleBlock', customer.id), {}, { preserveScroll:true, onSuccess:()=> toast.success(customer.is_blocked?'Unblocked':'Blocked')});
    return (
        <AdminLayout header={`Customer: ${customer.name}`}>
            {flash?.success && <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.success}</div>}
            <Link href={route('admin.customers.index')} className="text-sm font-bold hover:text-rose-600">← Back to customers</Link>

            <div className="mt-4 grid lg:grid-cols-3 gap-6">
                <div className="bg-white border rounded-xl p-6">
                    <h3 className="font-black">Profile</h3>
                    <div className="mt-3 space-y-2 text-sm">
                        <div><span className="font-bold text-gray-500">Name:</span> <span className="font-semibold">{customer.name}</span></div>
                        <div><span className="font-bold text-gray-500">Email:</span> <span className="font-semibold">{customer.email}</span></div>
                        <div><span className="font-bold text-gray-500">Phone:</span> <span className="font-semibold">{customer.phone || '—'}</span></div>
                        <div><span className="font-bold text-gray-500">Role:</span> <span className="font-semibold">{customer.role}</span></div>
                        <div><span className="font-bold text-gray-500">Joined:</span> <span className="font-semibold">{new Date(customer.created_at).toLocaleString()}</span></div>
                        <div><span className="font-bold text-gray-500">Orders:</span> <span className="font-black">{customer.orders_count}</span> • Spent <span className="font-black">${Number(customer.total_spent||0).toFixed(2)}</span></div>
                        <div className="pt-2">{customer.is_blocked ? <span className="px-2 py-1 rounded-full text-xs font-black bg-red-100 text-red-700 border border-red-200">BLOCKED</span> : <span className="px-2 py-1 rounded-full text-xs font-black bg-green-100 text-green-700 border">ACTIVE</span>}</div>
                    </div>
                    <button onClick={toggle} className={`mt-4 w-full py-2 rounded-full font-black text-sm ${customer.is_blocked?'bg-white border':'bg-amber-500 text-white'}`}>{customer.is_blocked?'Unblock Customer':'Block Customer'}</button>
                </div>

                <div className="lg:col-span-2 space-y-6">
                    <div className="bg-white border rounded-xl p-6">
                        <h3 className="font-black">Addresses ({addresses.length})</h3>
                        {addresses.length===0 ? <p className="text-sm text-gray-500 mt-2">No addresses.</p> :
                        <div className="mt-3 grid sm:grid-cols-2 gap-3">
                            {addresses.map(a=>(
                                <div key={a.id} className="p-3 bg-gray-50 border rounded-lg text-sm">
                                    <div className="font-bold">{a.label || 'Address'} {a.is_default && <span className="text-[10px] bg-green-100 text-green-700 px-1 py-0.5 rounded ml-1">DEFAULT</span>}</div>
                                    <div className="text-gray-600 font-medium">{a.street}, {a.city} {a.zip} • {a.country}</div>
                                </div>
                            ))}
                        </div>}
                    </div>

                    <div className="bg-white border rounded-xl p-6">
                        <h3 className="font-black">Order History</h3>
                        {(orders?.data || []).length===0 ? <p className="text-sm text-gray-500 mt-2">No orders.</p> :
                        <div className="mt-3 divide-y">
                            {(orders.data||[]).map(o=>(
                                <div key={o.id} className="flex justify-between items-center py-3">
                                    <div><div className="font-mono font-black text-sm">{o.order_number}</div><div className="text-xs text-gray-500 font-semibold">{new Date(o.created_at).toLocaleDateString()} • {o.status}</div></div>
                                    <div className="text-right"><div className="font-black">${Number(o.total_amount ?? o.total ?? 0).toFixed(2)}</div><Link href={route('admin.orders.show', o.id)} className="text-xs font-bold text-rose-600">View →</Link></div>
                                </div>
                            ))}
                        </div>}
                        {orders?.links && <div className="flex gap-1.5 flex-wrap mt-4">{orders.links.map((l,i)=> l.url ? <Link key={i} href={l.url} dangerouslySetInnerHTML={{__html:l.label}} className={`px-2 py-1 rounded text-xs font-black border ${l.active?'bg-slate-900 text-white':'bg-white'}`} /> : <span key={i} dangerouslySetInnerHTML={{__html:l.label}} className="px-2 py-1 rounded text-xs bg-gray-100 border" /> )}</div>}
                    </div>
                </div>
            </div>
        </AdminLayout>
    )
}
