import { Link, usePage, router } from '@inertiajs/react';
import { ShoppingBag, Heart, Search, User, ShieldAlert, Truck } from 'lucide-react';
import { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';

export default function StorefrontLayout({ children }) {
    const { auth, cartCount, wishlistCount, flash } = usePage().props;
    const user = auth?.user;
    const [searchTerm, setSearchTerm] = useState('');
    const [showDropdown, setShowDropdown] = useState(false);
    const [email,setEmail]=useState('');
    const dropdownRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (e) => {
            if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
                setShowDropdown(false);
            }
        };
        if (showDropdown) {
            document.addEventListener('mousedown', handleClickOutside);
        }
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, [showDropdown]);

    const handleNewsletter=(e)=>{
        e.preventDefault();
        const v=email.trim();
        if(!v || !v.includes('@')){ toast.error('Enter a valid email'); return; }
        router.post(route('newsletter.subscribe'), {email: v}, {
            preserveScroll:true,
            onSuccess:()=> { toast.success('Subscribed!'); setEmail(''); },
            onError:(errs)=> toast.error(Object.values(errs)[0]||'Failed'),
        });
    };

    return (
        <div className="min-h-screen flex flex-col bg-white">
            <div className="bg-slate-900 text-slate-200 text-xs py-2 font-semibold tracking-wide">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-center sm:text-left">
                    <div className="hidden sm:block w-32" aria-hidden="true"></div>
                    <div className="flex-1 text-center">
                        Free shipping on orders over $100 • Use code <span className="text-yellow-300 font-bold">WELCOME10</span> for 10% off
                    </div>
                    <div className="flex items-center justify-center sm:justify-end gap-3 text-xs font-bold sm:w-auto">
                        <Link href="/track-order" className="hover:text-white flex items-center gap-1 text-rose-400">
                            📦 Track Order
                        </Link>
                    </div>
                </div>
            </div>
            <header className="sticky top-0 z-50 bg-white border-b border-gray-200 backdrop-blur">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 py-3 flex items-center justify-between gap-4">
                    <Link href="/" className="flex items-center gap-1 shrink-0" aria-label="TrustedMart home">
                        <span className="text-lg sm:text-xl font-black text-rose-600 tracking-tighter">TRUSTED</span>
                        <span className="text-lg sm:text-xl font-black text-slate-900 tracking-tighter">MART</span>
                    </Link>
                    <nav className="hidden lg:flex items-center gap-1">
                        <Link href="/" className="px-3 py-1.5 rounded-full text-sm font-bold text-slate-600 hover:bg-rose-50">Home</Link>
                        <Link href="/products" className="px-3 py-1.5 rounded-full text-sm font-bold text-slate-600 hover:bg-rose-50">All Products</Link>
                        {/* Bata-style mega menu for MEN/WOMEN/KIDS */}
                        {[
                            {label:'MEN', gender:'Men', categories:['Sneakers','Sports','Formals','Casuals']},
                            {label:'WOMEN', gender:'Women', categories:['Sneakers','Sports','Formals','Casuals']},
                            {label:'KIDS', gender:'Kids', categories:['Sneakers','Sports','Casuals']},
                        ].map(item=>(
                            <div key={item.label} className="relative group">
                                <Link href={`/products?gender=${item.gender}`} className="px-3 py-1.5 rounded-full text-sm font-black tracking-wide text-slate-900 hover:bg-slate-900 hover:text-white flex items-center gap-1 transition">
                                    {item.label} <span className="text-[10px] opacity-60">▼</span>
                                </Link>
                                <div className="absolute left-1/2 -translate-x-1/2 top-full pt-2 w-[720px] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-50 pointer-events-none group-hover:pointer-events-auto">
                                    <div className="bg-white border border-gray-200 rounded-2xl shadow-2xl p-6 grid grid-cols-5 gap-6">
                                        <div>
                                            <div className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-3">ALL SHOES</div>
                                            <div className="space-y-1.5 text-sm font-semibold">
                                                <Link href={`/products?gender=${item.gender}`} className="block text-rose-600 hover:text-rose-700 font-bold">All {item.label}</Link>
                                                {item.categories.map(c=> <Link key={c} href={`/products?category=${c.toLowerCase()}&gender=${item.gender}`} className="block text-gray-700 hover:text-slate-900 hover:underline">{c}</Link>)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-3">BRANDS</div>
                                            <div className="space-y-1.5 text-sm font-semibold">
                                                {['Nike','Adidas','Puma','Bata','Apex'].map(b=> <Link key={b} href={`/products?brand=${b.toLowerCase()}&gender=${item.gender}`} className="block text-gray-700 hover:text-slate-900 hover:underline">{b}</Link>)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-3">BY COLOR</div>
                                            <div className="space-y-1.5 text-sm font-semibold">
                                                {['Black','White','Red','Blue','Brown','Beige'].map(col=> <Link key={col} href={`/products?gender=${item.gender}&color=${col.toLowerCase()}`} className="block text-gray-700 hover:text-slate-900 flex items-center gap-2 hover:underline"><span className="w-3 h-3 rounded-full border" style={{background: col==='Black'?'#111': col==='White'?'#fff': col==='Red'?'#dc2626': col==='Blue'?'#2563eb': col==='Brown'?'#7c2d12':'#d6c7b8'}}></span>{col}</Link>)}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-3">BY PRICE</div>
                                            <div className="space-y-1.5 text-sm font-semibold">
                                                {[
                                                    {label: 'Under $50', min: '', max: '50'},
                                                    {label: '$50 - $100', min: '50', max: '100'},
                                                    {label: '$100 - $150', min: '100', max: '150'},
                                                    {label: '$150 - $200', min: '150', max: '200'},
                                                    {label: 'Above $200', min: '200', max: ''},
                                                ].map(p=> (
                                                    <Link key={p.label} href={`/products?gender=${item.gender}${p.min ? `&min_price=${p.min}` : ''}${p.max ? `&max_price=${p.max}` : ''}`} className="block text-gray-700 hover:text-slate-900 hover:underline">{p.label}</Link>
                                                ))}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-[11px] font-black tracking-widest text-gray-400 uppercase mb-3">BY SIZE</div>
                                            <div className="space-y-1.5 text-sm font-semibold">
                                                {[5,6,7,8,9,10,11].map(s=> <Link key={s} href={`/products?gender=${item.gender}&size=${s}`} className="block text-gray-700 hover:text-slate-900 flex items-center gap-1 hover:underline">👟 US {s}</Link>)}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))}
                        <Link href="/products?category=sneakers" className="px-3 py-1.5 rounded-full text-sm font-bold text-slate-600 hover:bg-rose-50">Sneakers</Link>
                        <Link href="/products?category=sports" className="px-3 py-1.5 rounded-full text-sm font-bold text-slate-600 hover:bg-rose-50">Sports</Link>
                        <Link href="/contact" className="px-3 py-1.5 rounded-full text-sm font-bold text-slate-600 hover:bg-rose-50">Contact Us</Link>
                    </nav>
                    <form onSubmit={(e)=>{e.preventDefault(); if(searchTerm.trim()) router.get('/products', {search: searchTerm.trim()});}} className="relative flex-1 max-w-xs hidden sm:flex">
                        <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search shoes..." aria-label="Search shoes" className="w-full rounded-full border border-gray-300 bg-gray-50 px-3 py-1.5 pr-8 text-sm outline-none focus:border-rose-300 focus:bg-white" />
                        <button type="submit" aria-label="Search" className="absolute right-2 top-1/2 -translate-y-1/2"><Search size={14} className="text-gray-500"/></button>
                    </form>
                    <div className="flex items-center gap-3 sm:gap-4">
                        {user ? (
                            <div className="relative" ref={dropdownRef}>
                                <button onClick={()=>setShowDropdown(!showDropdown)} aria-haspopup="menu" aria-expanded={showDropdown} className="flex items-center gap-2 font-bold text-sm">
                                    <span className="w-7 h-7 rounded-full bg-rose-600 text-white flex items-center justify-center text-xs" aria-hidden>{user.name[0].toUpperCase()}</span>
                                    <span className="hidden sm:inline">{user.name.split(' ')[0]}</span>
                                </button>
                                {showDropdown && (
                                    <div className="absolute right-0 mt-2 w-48 bg-white shadow-xl border border-gray-200 rounded-xl py-1 z-50" role="menu">
                                        <div className="px-4 py-2 border-b">
                                            <div className="text-xs font-bold text-gray-400 uppercase tracking-wider">Account</div>
                                            <div className="text-sm font-black text-slate-900 truncate">{user.name}</div>
                                            <div className="text-xs text-gray-500 truncate">{user.email}</div>
                                        </div>
                                        <Link href="/account" onClick={()=>setShowDropdown(false)} className="block px-4 py-2 text-sm font-semibold hover:bg-gray-50" role="menuitem">Dashboard</Link>
                                        <Link href="/account/profile" onClick={()=>setShowDropdown(false)} className="block px-4 py-2 text-sm font-semibold hover:bg-gray-50" role="menuitem">Profile & Settings</Link>
                                        <Link href="/account/orders" onClick={()=>setShowDropdown(false)} className="block px-4 py-2 text-sm font-semibold hover:bg-gray-50" role="menuitem">My Orders</Link>
                                        {(user.role==='admin' || auth.user?.roles?.includes?.('Super Admin') || auth.user?.roles?.includes?.('Manager')) && <Link href="/admin" onClick={()=>setShowDropdown(false)} className="flex items-center gap-1 px-4 py-2 text-sm font-bold text-rose-600 hover:bg-gray-50" role="menuitem"><ShieldAlert size={14}/> Admin Hub</Link>}
                                        <Link href={route('logout')} method="post" as="button" onClick={()=>setShowDropdown(false)} className="w-full text-left px-4 py-2 text-sm font-bold text-rose-600 border-t hover:bg-rose-50" role="menuitem">Logout</Link>
                                    </div>
                                )}
                            </div>
                        ) : (
                            <div className="flex items-center gap-2 text-sm font-bold">
                                <Link href={route('login')} className="flex items-center gap-1 text-sm font-bold hover:text-rose-600"><User size={18}/> <span className="hidden sm:inline">Sign In</span></Link>
                                <span className="text-gray-300 hidden sm:inline">/</span>
                                <Link href="/register" className="hidden sm:inline-block px-3 py-1 bg-slate-900 hover:bg-black text-white rounded-full text-xs font-black transition">Create Account</Link>
                            </div>
                        )}
                        <Link href="/wishlist" aria-label={`Wishlist ${wishlistCount||0} items`} className="relative hover:text-rose-600">{wishlistCount > 0 && <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{wishlistCount}</span>}<Heart size={20}/></Link>
                        <Link href="/cart" aria-label={`Cart ${cartCount||0} items`} className="relative hover:text-rose-600"><ShoppingBag size={20}/>{cartCount>0 && <span className="absolute -top-1 -right-2 bg-rose-600 text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">{cartCount}</span>}</Link>
                    </div>
                </div>
                <div className="sm:hidden px-4 pb-3">
                    <form onSubmit={(e)=>{e.preventDefault(); if(searchTerm.trim()) router.get('/products', {search: searchTerm.trim()});}} className="relative">
                        <input value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} placeholder="Search shoes..." aria-label="Search shoes mobile" className="w-full rounded-full border border-gray-300 bg-gray-50 px-3 py-2 pr-8 text-sm outline-none" />
                        <button type="submit" aria-label="Search" className="absolute right-3 top-1/2 -translate-y-1/2"><Search size={14} className="text-gray-500"/></button>
                    </form>
                </div>
            </header>
            {flash?.success && <div className="max-w-7xl mx-auto px-6 mt-4"><div className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-bold" role="status">{flash.success}</div></div>}
            {flash?.error && <div className="max-w-7xl mx-auto px-6 mt-4"><div className="bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm font-bold" role="alert">{flash.error}</div></div>}
            <main className="flex-1">{children}</main>
            <footer className="bg-slate-900 text-slate-300 mt-10" role="contentinfo">
                <div className="max-w-7xl mx-auto px-6 py-10 grid grid-cols-1 md:grid-cols-4 gap-8">
                    <div>
                        <div className="flex items-center gap-1">
                            <span className="text-lg font-black text-rose-500 tracking-tighter">TRUSTED</span>
                            <span className="text-lg font-black text-white tracking-tighter">MART</span>
                        </div>
                        <p className="text-sm text-slate-400 mt-3 leading-relaxed font-medium">Clean, modern, product-photography-forward footwear retail. Craftsmanship, comfort, performance.</p>
                        <div className="mt-4 text-xs font-bold text-slate-400">© 2026 TrustedMart — All rights reserved.</div>
                    </div>
                    <div>
                        <h4 className="text-xs font-black tracking-widest uppercase text-white mb-3">Shop</h4>
                        <div className="space-y-2 text-sm font-semibold">
                            <Link href="/products" className="block hover:text-white">All Products</Link>
                            <Link href="/products?category=sneakers" className="block hover:text-white">Sneakers</Link>
                            <Link href="/products?category=sports" className="block hover:text-white">Sports</Link>
                            <Link href="/products?category=formals" className="block hover:text-white">Formals</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-black tracking-widest uppercase text-white mb-3">Help & Info</h4>
                        <div className="space-y-2 text-sm font-semibold">
                            <Link href="/contact" className="block text-rose-400 font-bold hover:text-white">Contact Us</Link>
                            <Link href="/track-order" className="block text-rose-400 font-bold hover:text-white">Track Order</Link>
                            <Link href="/pages/about" className="block hover:text-white">About Us</Link>
                            <Link href="/pages/faq" className="block hover:text-white">FAQ</Link>
                            <Link href="/pages/return-policy" className="block hover:text-white">Return Policy</Link>
                            <Link href="/pages/terms" className="block hover:text-white">Terms & Conditions</Link>
                            <Link href="/pages/privacy" className="block hover:text-white">Privacy Policy</Link>
                        </div>
                    </div>
                    <div>
                        <h4 className="text-xs font-black tracking-widest uppercase text-white mb-3">Newsletter</h4>
                        <p className="text-sm text-slate-400 font-medium">Get 10% off your first order</p>
                        <form onSubmit={handleNewsletter} className="mt-3 flex gap-2" aria-label="Newsletter signup">
                            <input value={email} onChange={e=>setEmail(e.target.value)} type="email" placeholder="you@email.com" aria-label="Email address" required className="flex-1 px-3 py-2.5 rounded-full bg-white text-slate-900 text-sm font-semibold outline-none placeholder:text-gray-400" />
                            <button type="submit" className="px-5 py-2.5 bg-rose-600 text-white rounded-full text-sm font-black hover:bg-rose-700">Join</button>
                        </form>
                        <p className="text-[11px] text-slate-500 mt-2 font-semibold">By joining you agree to our Privacy Policy</p>
                    </div>
                </div>
                <div className="border-t border-slate-800">
                    <div className="max-w-7xl mx-auto px-6 py-4 flex flex-col sm:flex-row justify-between gap-2 text-xs font-bold text-slate-500">
                        <span>Crafted for 375 / 768 / 1280 responsive • Accessible markup</span>
                        <span>Currency: USD • <span className="text-slate-300">Intl.NumberFormat</span></span>
                    </div>
                </div>
            </footer>
        </div>
    );
}
