import { Link, usePage, router } from '@inertiajs/react';
import { useState } from 'react';
import { Menu, X, LogOut } from 'lucide-react';

const navGroups = [
    { title: 'Catalog', items: [{label:'Products', href:'/admin/products'}, {label:'Categories', href:'/admin/categories'}, {label:'Brands', href:'/admin/brands'}, {label:'Attributes', href:'/admin/attributes'}] },
    { title: 'Sales', items: [{label:'Orders', href:'/admin/orders'}, {label:'Inventory', href:'/admin/inventory'}, {label:'History', href:'/admin/inventory/logs'}, {label:'Coupons', href:'/admin/coupons'}] },
    { title: 'Customers', items: [{label:'Customers', href:'/admin/customers'}, {label:'Reviews', href:'/admin/reviews'}, {label:'Queries', href:'/admin/queries'}] },
    { title: 'Content', items: [{label:'Hero Banner', href:'/admin/hero'}, {label:'Pages', href:'/admin/pages'}, {label:'Reports', href:'/admin/reports'}] },
    { title: 'Settings', items: [{label:'Store Settings', href:'/admin/settings'}] },
];

export default function AdminLayout({ children, header }) {
    const { auth, flash } = usePage().props;
    const url = usePage().url;
    const [mobileOpen, setMobileOpen] = useState(false);

    const handleLogout = (e) => {
        e?.preventDefault?.();
        const logoutUrl = typeof route === 'function' ? route('logout') : '/logout';
        router.post(logoutUrl);
    };

    const isActiveRoute = (itemHref) => {
        if (url === itemHref) return true;
        if (itemHref === '/admin/inventory') {
            return url === '/admin/inventory' || (url.startsWith('/admin/inventory?') && !url.startsWith('/admin/inventory/logs'));
        }
        return url.startsWith(itemHref);
    };

    return (
        <div className="h-screen bg-gray-50 flex overflow-hidden">
            {/* Desktop sidebar: permanently fixed in position */}
            <aside className="w-64 bg-white border-r border-gray-200 hidden md:flex flex-col shrink-0 h-screen select-none">
                <div className="px-6 py-5 border-b shrink-0">
                    <Link href="/admin" className="font-black text-lg">TrustedMart <span className="text-rose-600">Admin</span></Link>
                    <div className="text-xs text-gray-500 mt-1 font-semibold truncate">{auth.user?.name} • {auth.user?.email}</div>
                </div>
                <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                    <Link href="/admin/dashboard" className={`block px-3 py-1.5 rounded-full text-sm font-black ${url === '/admin/dashboard' || url === '/admin' ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}>Dashboard</Link>
                    {navGroups.map(g => (
                        <div key={g.title}>
                            <div className="text-[11px] font-extrabold tracking-widest text-gray-400 uppercase mb-2 px-2">{g.title}</div>
                            <div className="space-y-1">
                                {g.items.map(i => {
                                    const active = isActiveRoute(i.href);
                                    return (
                                        <Link
                                            key={i.href}
                                            href={i.href}
                                            className={`block px-3 py-1.5 rounded-full text-sm font-bold transition ${active ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                        >
                                            {i.label}
                                        </Link>
                                    );
                                })}
                                {g.title === 'Settings' && (
                                    <button
                                        type="button"
                                        onClick={handleLogout}
                                        className="w-full flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold text-red-600 hover:bg-red-50 transition text-left cursor-pointer"
                                    >
                                        <LogOut size={16} /> Logout
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </nav>
                <div className="p-4 border-t shrink-0 space-y-2 bg-white">
                    <Link href="/" className="flex items-center gap-2 text-sm font-bold text-slate-600 hover:text-rose-600">
                        ← Back to Store
                    </Link>
                </div>
            </aside>

            {/* Mobile drawer */}
            {mobileOpen && (
                <div className="fixed inset-0 z-40 md:hidden">
                    <div className="absolute inset-0 bg-black/40" onClick={() => setMobileOpen(false)} aria-hidden="true" />
                    <aside className="absolute left-0 top-0 bottom-0 w-64 bg-white shadow-xl flex flex-col h-full">
                        <div className="px-6 py-5 border-b flex justify-between items-center shrink-0">
                            <div><div className="font-black">TrustedMart <span className="text-rose-600">Admin</span></div><div className="text-xs text-gray-500">{auth.user?.name}</div></div>
                            <button onClick={() => setMobileOpen(false)} aria-label="Close menu" className="p-2 rounded-full hover:bg-gray-100"><X size={18}/></button>
                        </div>
                        <nav className="flex-1 overflow-y-auto py-4 px-3 space-y-6">
                            <Link href="/admin/dashboard" onClick={() => setMobileOpen(false)} className={`block px-3 py-1.5 rounded-full text-sm font-black ${url === '/admin/dashboard' || url === '/admin' ? 'bg-slate-900 text-white' : 'text-gray-600'}`}>Dashboard</Link>
                            {navGroups.map(g => (
                                <div key={g.title}>
                                    <div className="text-[11px] font-extrabold tracking-widest text-gray-400 uppercase mb-2 px-2">{g.title}</div>
                                    <div className="space-y-1">
                                        {g.items.map(i => {
                                            const active = isActiveRoute(i.href);
                                            return (
                                                <Link
                                                    key={i.href}
                                                    href={i.href}
                                                    onClick={() => setMobileOpen(false)}
                                                    className={`block px-3 py-1.5 rounded-full text-sm font-bold ${active ? 'bg-slate-900 text-white' : 'text-gray-600 hover:bg-gray-100'}`}
                                                >
                                                    {i.label}
                                                </Link>
                                            );
                                        })}
                                        {g.title === 'Settings' && (
                                            <button
                                                type="button"
                                                onClick={() => { setMobileOpen(false); handleLogout(); }}
                                                className="w-full flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-bold text-red-600 hover:bg-red-50 text-left cursor-pointer"
                                            >
                                                <LogOut size={16} /> Logout
                                            </button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </nav>
                        <div className="p-4 border-t shrink-0 space-y-2 bg-white">
                            <Link href="/" onClick={()=> setMobileOpen(false)} className="block text-sm font-bold text-slate-600 hover:text-rose-600">← Back to Store</Link>
                        </div>
                    </aside>
                </div>
            )}

            {/* Scrollable content area: independent vertical scrolling for all admin pages */}
            <div className="flex-1 flex flex-col min-w-0 h-screen overflow-y-auto">
                <header className="bg-white border-b px-4 sm:px-6 py-3 sm:py-4 flex justify-between items-center gap-3 sticky top-0 z-30 shrink-0">
                    <div className="flex items-center gap-3">
                        <button onClick={() => setMobileOpen(true)} className="md:hidden p-2 rounded-full border hover:bg-gray-50" aria-label="Open menu"><Menu size={18}/></button>
                        <h1 className="font-extrabold text-base sm:text-lg truncate">{header}</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <span className="text-xs sm:text-sm text-gray-600 font-bold truncate max-w-[200px] sm:max-w-none bg-gray-100 border border-gray-200 px-3 py-1.5 rounded-full">
                            {auth.user?.email}
                        </span>
                    </div>
                </header>
                {flash?.success && <div className="mx-4 sm:mx-6 mt-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-bold shrink-0" role="status">{flash.success}</div>}
                {flash?.error && <div className="mx-4 sm:mx-6 mt-4 bg-rose-50 border border-rose-200 text-rose-800 px-4 py-3 rounded-xl text-sm font-bold shrink-0" role="alert">{flash.error}</div>}
                <main className="flex-1 p-4 sm:p-6">{children}</main>
            </div>
        </div>
    );
}
