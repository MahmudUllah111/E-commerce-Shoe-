import ApplicationLogo from '@/Components/ApplicationLogo';
import { Link } from '@inertiajs/react';

export default function GuestLayout({ children }) {
    return (
        <div className="flex min-h-screen flex-col items-center bg-gray-50 pt-8 sm:justify-center sm:pt-0 dark:bg-gray-900 px-4">
            <div className="mb-4">
                <Link href="/" className="flex items-center gap-1.5" aria-label="TrustedMart home">
                    <span className="text-2xl sm:text-3xl font-black text-rose-600 tracking-tighter">TRUSTED</span>
                    <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white tracking-tighter">MART</span>
                </Link>
            </div>

            <div className="mt-2 w-full overflow-hidden bg-white p-6 sm:p-10 shadow-xl border border-gray-100 rounded-2xl sm:max-w-xl dark:bg-gray-800 dark:border-gray-700">
                {children}
            </div>
        </div>
    );
}
