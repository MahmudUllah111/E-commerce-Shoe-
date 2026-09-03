import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Link, router, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

export default function Index({ items = [] }){
    const { auth } = usePage().props;
    const user = auth?.user;
    const remove = (productId)=> {
        if(!user){ toast.error('Please sign in'); return; }
        router.delete(route('wishlist.destroy', productId), { preserveScroll:true, onSuccess:()=> toast.success('Removed')});
    };
    const addToCart = (product)=>{
        const variant = product.variants?.[0];
        if(!variant){ toast.error('No variant'); return; }
        router.post(route('cart.add'), { product_id: product.id, variant_id: variant.id, quantity:1 }, { preserveScroll:true, onSuccess:()=> toast.success('Added to cart'), onError:(e)=> toast.error(Object.values(e)[0]||'Failed')});
    };
    return (
        <StorefrontLayout>
            <div className="max-w-6xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-black">Wishlist</h1>
                <p className="text-sm text-gray-500 font-semibold mt-1">{user ? 'Your saved favourites' : 'Sign in to save favourites'}</p>
                {!user && <div className="mt-6 bg-amber-50 border border-amber-200 rounded-xl p-4 text-sm font-semibold text-amber-800">Please <Link href={route('login')} className="font-black text-slate-900 underline">sign in</Link> to use wishlist. Guest wishlist is not persisted.</div>}
                {items.length===0 ? <div className="mt-6 bg-white border rounded-xl p-12 text-center"><p className="font-bold text-gray-600">No items yet</p><Link href="/products" className="mt-4 inline-block px-6 py-2 bg-slate-900 text-white rounded-full font-bold text-sm">Browse products</Link></div> :
                <div className="mt-6 grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {items.map(w=>{
                        const p = w.product;
                        if(!p) return null;
                        const img = p.images?.[0]?.image_url || p.images?.[0]?.url || 'https://via.placeholder.com/300';
                        return (
                            <div key={w.id} className="bg-white border rounded-xl overflow-hidden flex flex-col">
                                <Link href={`/product/${p.slug || p.id}`} className="bg-gray-50 p-6 flex items-center justify-center h-52"><img src={img} className="max-h-40 object-contain" /></Link>
                                <div className="p-4 flex-1 flex flex-col">
                                    <div className="text-xs font-bold text-gray-500 uppercase">{p.brand?.name}</div>
                                    <Link href={`/product/${p.slug || p.id}`} className="font-bold text-sm line-clamp-2 hover:text-rose-600">{p.name}</Link>
                                    <div className="font-black mt-1">${Number(p.price || p.base_price ||0).toFixed(2)}</div>
                                    <div className="flex gap-2 mt-3">
                                        <button onClick={()=>addToCart(p)} className="flex-1 py-2 bg-slate-900 text-white rounded-full text-xs font-black">Add to Cart</button>
                                        <button onClick={()=>remove(p.id)} className="px-4 py-2 bg-white border rounded-full text-xs font-bold text-rose-600">Remove</button>
                                    </div>
                                </div>
                            </div>
                        )
                    })}
                </div>}
                <div className="mt-6 flex gap-2">
                    <Link href="/account/wishlist" className="text-sm font-bold text-rose-600">Go to Account Wishlist →</Link>
                </div>
            </div>
        </StorefrontLayout>
    )
}
