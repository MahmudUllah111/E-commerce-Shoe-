import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Link } from '@inertiajs/react';

export default function Show({ page }){
    return (
        <StorefrontLayout>
            <div className="max-w-3xl mx-auto px-6 py-10">
                <nav aria-label="Breadcrumb" className="text-xs font-bold text-gray-500 mb-4">
                    <Link href="/" className="hover:text-slate-900">Home</Link> <span className="mx-1">/</span> <span className="text-slate-900">{page.title}</span>
                </nav>
                <h1 className="text-3xl font-black tracking-tight">{page.title}</h1>
                <div className="mt-6 prose prose-sm max-w-none prose-headings:font-black prose-a:text-rose-600" dangerouslySetInnerHTML={{__html: page.content || '<p>Content coming soon.</p>'}} />
                <div className="mt-8">
                    <Link href="/products" className="inline-flex px-6 py-3 bg-slate-900 text-white rounded-full font-black text-sm">Continue Shopping →</Link>
                </div>
            </div>
        </StorefrontLayout>
    );
}
