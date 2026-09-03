import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Link } from '@inertiajs/react';

export default function Error({ status }){
    const code = status || 404;
    const titles = {
        404: 'Page not found',
        403: 'Forbidden',
        500: 'Server error',
        503: 'Service unavailable',
    };
    const messages = {
        404: 'The page you are looking for doesn’t exist or has been moved.',
        403: 'You don’t have permission to view this page.',
        500: 'Something went wrong on our end. Please try again later.',
        503: 'We’re temporarily down for maintenance.',
    };
    return (
        <StorefrontLayout>
            <div className="max-w-3xl mx-auto px-6 py-16 text-center">
                <div className="text-7xl font-black text-slate-900">{code}</div>
                <h1 className="text-2xl font-black mt-4">{titles[code]||'Error'}</h1>
                <p className="text-sm font-semibold text-gray-500 mt-2">{messages[code]||'An unexpected error occurred.'}</p>
                <div className="mt-8 flex justify-center gap-3">
                    <Link href="/" className="px-6 py-3 bg-slate-900 text-white rounded-full font-black text-sm">Back to Home</Link>
                    <Link href="/products" className="px-6 py-3 border rounded-full font-bold text-sm hover:bg-gray-50">Browse Products</Link>
                </div>
                <div className="mt-8 text-xs font-bold text-gray-400">If you believe this is a mistake, contact support at mahmudsets@gmail.com</div>
            </div>
        </StorefrontLayout>
    );
}
