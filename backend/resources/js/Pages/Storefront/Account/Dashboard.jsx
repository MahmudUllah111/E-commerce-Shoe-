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
    return (
        <div className="flex flex-wrap gap-2 mb-6">
            {items.map(i=>{
                const active = url===i.href || (i.href!=='/account' && url.startsWith(i.href));
                return <Link key={i.href} href={i.href} className={`px-4 py-2 rounded-full text-sm font-bold border ${active?'bg-slate-900 text-white border-slate-900':'bg-white hover:bg-gray-50 border-gray-200'}`}>{i.label}</Link>
            })}
        </div>
    )
}

export default function Dashboard({ user, recentOrders=[], addresses=[], wishlist=[], stats={} }){
    const { flash } = usePage().props;
    return (
        <StorefrontLayout>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-black">My Account</h1>
                <p className="text-sm text-gray-500 font-semibold mt-1">Welcome back, {user?.name}</p>
                <div className="mt-6"><AccountNav/></div>

                {flash?.success && <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.success}</div>}
                {flash?.error && <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.error}</div>}

                <div className="grid md:grid-cols-4 gap-4 mb-8">
                    <div className="bg-white border rounded-xl p-5"><div className="text-xs font-bold text-gray-500 uppercase">Orders</div><div className="text-2xl font-black mt-1">{stats.orders_count ?? 0}</div><div className="text-xs text-gray-500 font-semibold">Total spent ${Number(stats.total_spent||0).toFixed(2)}</div></div>
                    <div className="bg-white border rounded-xl p-5"><div className="text-xs font-bold text-gray-500 uppercase">Wishlist</div><div className="text-2xl font-black mt-1">{stats.wishlist_count ?? 0}</div><Link href="/account/wishlist" className="text-xs font-bold text-rose-600">View wishlist →</Link></div>
                    <div className="bg-white border rounded-xl p-5"><div className="text-xs font-bold text-gray-500 uppercase">Addresses</div><div className="text-2xl font-black mt-1">{stats.addresses_count ?? 0}</div><Link href="/account/addresses" className="text-xs font-bold text-rose-600">Manage →</Link></div>
                    <div className="bg-white border rounded-xl p-5 flex flex-col justify-center"><div className="text-sm font-bold">{user?.email}</div><div className="text-xs text-gray-500 font-semibold">{user?.phone || 'No phone yet'}</div><Link href="/account/profile" className="mt-2 text-xs font-black bg-slate-900 text-white px-3 py-1.5 rounded-full w-fit">Edit Profile</Link></div>
                </div>

                <div className="grid lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 bg-white border rounded-xl p-6">
                        <div className="flex justify-between items-center"><h3 className="font-black">Recent Orders</h3><Link href="/account/orders" className="text-sm font-bold text-rose-600">View all →</Link></div>
                        {recentOrders.length===0 ? <p className="text-sm text-gray-500 mt-4 font-semibold">No orders yet. <Link href="/products" className="text-rose-600 font-bold">Start shopping</Link></p> :
                        <div className="mt-4 divide-y">
                            {recentOrders.map(o=>(
                                <div key={o.id} className="flex justify-between items-center py-3">
                                    <div>
                                        <div className="font-mono font-black text-sm">{o.order_number}</div>
                                        <div className="text-xs text-gray-500 font-semibold">{new Date(o.created_at).toLocaleDateString()} • {o.status}</div>
                                    </div>
                                    <div className="text-right">
                                        <div className="font-black text-sm">${Number(o.total_amount ?? o.total ?? 0).toFixed(2)}</div>
                                        <Link href={`/account/orders/${o.id}`} className="text-xs font-bold text-slate-900 border px-2 py-1 rounded-md hover:bg-slate-900 hover:text-white">View</Link>
                                    </div>
                                </div>
                            ))}
                        </div>}
                    </div>
                    <div className="space-y-4">
                        <div className="bg-white border rounded-xl p-6">
                            <h3 className="font-black">Addresses</h3>
                            {addresses.length===0 ? <p className="text-sm text-gray-500 mt-2">No saved addresses.</p> :
                            addresses.slice(0,2).map(a=>(
                                <div key={a.id} className="mt-3 p-3 bg-gray-50 rounded-lg border text-sm">
                                    <div className="font-bold">{a.label || 'Address'} {a.is_default && <span className="ml-1 text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded">DEFAULT</span>}</div>
                                    <div className="text-gray-600 font-medium">{a.street}, {a.city} {a.zip}</div>
                                </div>
                            ))}
                            <Link href="/account/addresses" className="mt-3 inline-block text-sm font-bold text-rose-600">Manage addresses →</Link>
                        </div>
                        <div className="bg-white border rounded-xl p-6">
                            <h3 className="font-black">Wishlist</h3>
                            {wishlist.length===0 ? <p className="text-sm text-gray-500 mt-2">No items saved.</p> :
                            <div className="mt-3 grid grid-cols-3 gap-2">
                                {wishlist.slice(0,3).map(w=>(
                                    <Link key={w.id} href={`/product/${w.product?.slug || w.product_id}`} className="border rounded-lg p-1 bg-gray-50">
                                        <img src={w.product?.images?.[0]?.image_url || w.product?.images?.[0]?.url || 'https://via.placeholder.com/150'} className="w-full h-20 object-contain" />
                                        <div className="text-[11px] font-bold line-clamp-1 mt-1">{w.product?.name}</div>
                                    </Link>
                                ))}
                            </div>}
                        </div>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    )
}
