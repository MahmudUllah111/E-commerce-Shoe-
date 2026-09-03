import AuthenticatedLayout from '@/Layouts/AuthenticatedLayout';
import { Head, Link, usePage } from '@inertiajs/react';
import { ShieldCheck, ShoppingBag, Heart, User } from 'lucide-react';

export default function Dashboard() {
    const { auth } = usePage().props;
    const user = auth.user;
    const isAdmin = user?.role === 'admin' || user?.roles?.includes('Super Admin') || user?.roles?.includes('Manager');
    return (
        <AuthenticatedLayout
            header={
                <h2 className="text-xl font-semibold leading-tight text-gray-800 dark:text-gray-200">
                    Dashboard
                </h2>
            }
        >
            <Head title="Dashboard" />
            <div className="py-8">
                <div className="mx-auto max-w-7xl sm:px-6 lg:px-8 space-y-6">
                    {isAdmin && (
                        <div className="bg-rose-50 border border-rose-200 rounded-xl p-5 flex flex-col sm:flex-row justify-between gap-4">
                            <div>
                                <div className="flex items-center gap-2 text-rose-800 font-black"><ShieldCheck size={18}/> Admin Access Detected</div>
                                <p className="text-sm text-rose-700 mt-1">You have admin privileges. Manage the entire store from the admin panel.</p>
                            </div>
                            <Link href="/admin/dashboard" className="px-6 py-3 bg-slate-900 text-white rounded-full font-bold text-sm hover:bg-black text-center">Go to Admin Panel →</Link>
                        </div>
                    )}
                    <div className="overflow-hidden bg-white shadow-sm sm:rounded-lg dark:bg-gray-800">
                        <div className="p-6 text-gray-900 dark:text-gray-100">
                            <div className="text-lg font-bold">Welcome back, {user.name}!</div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">Your account dashboard — quick links below.</p>
                        </div>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <Link href="/account/orders" className="bg-white border rounded-xl p-5 hover:shadow flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center"><ShoppingBag size={18}/></div>
                            <div><div className="font-black">My Orders</div><div className="text-xs text-gray-500">View & track orders</div></div>
                        </Link>
                        <Link href="/wishlist" className="bg-white border rounded-xl p-5 hover:shadow flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center"><Heart size={18}/></div>
                            <div><div className="font-black">Wishlist</div><div className="text-xs text-gray-500">Saved items & restock alerts</div></div>
                        </Link>
                        <Link href="/account/profile" className="bg-white border rounded-xl p-5 hover:shadow flex items-center gap-3">
                            <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center"><User size={18}/></div>
                            <div><div className="font-black">Profile</div><div className="text-xs text-gray-500">Edit info & addresses</div></div>
                        </Link>
                    </div>
                    {!isAdmin && (
                        <div className="bg-gray-50 border rounded-xl p-6 text-sm text-gray-600">
                            <div className="font-bold text-gray-900">Need the admin panel?</div>
                            <p className="mt-1">Log in with <code className="bg-white px-1.5 py-0.5 rounded border">admin@trustedmart.com / admin123</code> and you’ll be redirected to <code className="bg-white px-1.5 py-0.5 rounded border">/admin/dashboard</code> with full sidebar controls.</p>
                        </div>
                    )}
                </div>
            </div>
        </AuthenticatedLayout>
    );
}
