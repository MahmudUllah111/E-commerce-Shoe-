import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Link, usePage } from '@inertiajs/react';

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

export default function Orders({ orders }){
    const rows = orders?.data || [];
    return (
        <StorefrontLayout>
            <div className="max-w-4xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-black">Order History</h1>
                <p className="text-sm text-gray-500 font-semibold mt-1">All your orders • Click to view timeline</p>
                <div className="mt-6"><AccountNav/></div>

                {rows.length===0 ? <div className="bg-white border rounded-xl p-12 text-center"><p className="font-bold">No orders yet</p><Link href="/products" className="mt-4 inline-block px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-sm">Shop now</Link></div> :
                <div className="bg-white border rounded-xl overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left text-sm">
                            <thead><tr className="bg-gray-50 border-b text-[11px] tracking-widest font-black text-gray-500 uppercase"><th className="px-4 py-3">Order #</th><th className="px-4 py-3">Date</th><th className="px-4 py-3">Total</th><th className="px-4 py-3">Status</th><th className="px-4 py-3 text-right">Action</th></tr></thead>
                            <tbody>
                                {rows.map(o=>(
                                    <tr key={o.id} className="border-b hover:bg-gray-50">
                                        <td className="px-4 py-3 font-mono font-black">{o.order_number}</td>
                                        <td className="px-4 py-3 font-semibold">{new Date(o.created_at).toLocaleDateString()}</td>
                                        <td className="px-4 py-3 font-black">${Number(o.total_amount ?? o.total ?? 0).toFixed(2)}</td>
                                        <td className="px-4 py-3"><span className={`px-2 py-1 rounded-full text-[11px] font-black uppercase border ${o.status==='delivered'?'bg-green-100 text-green-700 border-green-200': o.status==='cancelled'?'bg-red-100 text-red-700':'bg-amber-100 text-amber-700'}`}>{o.status}</span></td>
                                        <td className="px-4 py-3 text-right"><Link href={route('account.orders.show', o.id)} className="px-3 py-1.5 bg-slate-900 text-white rounded-md text-xs font-black">View Detail</Link></td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    {orders.links && <div className="flex flex-wrap gap-1.5 px-4 py-3 bg-gray-50 border-t">
                        {orders.links.map((link,i)=> link.url ? <Link key={i} href={link.url} dangerouslySetInnerHTML={{__html:link.label}} className={`px-3 py-1.5 rounded-md text-xs font-black border ${link.active?'bg-slate-900 text-white':'bg-white hover:bg-slate-900 hover:text-white'}`} /> : <span key={i} dangerouslySetInnerHTML={{__html:link.label}} className="px-3 py-1.5 rounded-md text-xs font-bold bg-gray-100 text-gray-400 border" /> )}
                    </div>}
                </div>}
            </div>
        </StorefrontLayout>
    )
}
