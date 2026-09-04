import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Link, usePage } from '@inertiajs/react';
import { ShieldCheck, Truck, RotateCcw, HelpCircle, FileText, Lock, ArrowRight, MessageSquare } from 'lucide-react';

export default function Show({ page }) {
    const { url } = usePage();

    const staticTabs = [
        { label: 'About Us', href: '/pages/about', slug: 'about' },
        { label: 'FAQ', href: '/pages/faq', slug: 'faq' },
        { label: 'Return Policy', href: '/pages/return-policy', slug: 'return-policy' },
        { label: 'Terms & Conditions', href: '/pages/terms', slug: 'terms' },
        { label: 'Privacy Policy', href: '/pages/privacy', slug: 'privacy' },
        { label: 'Contact Us', href: '/contact', slug: 'contact' },
    ];

    const currentSlug = page.slug || url.split('/').pop();

    return (
        <StorefrontLayout>
            {/* Top Hero Banner with Navigation */}
            <div className="bg-slate-900 text-white py-12 px-6 border-b border-slate-800">
                <div className="max-w-4xl mx-auto text-center">
                    <span className="text-xs font-black uppercase tracking-widest text-rose-500">
                        Customer Guide & Store Policies
                    </span>
                    <h1 className="text-3xl sm:text-4xl font-black mt-2 tracking-tight">
                        {page.title}
                    </h1>
                    <p className="text-sm text-slate-400 mt-2 max-w-xl mx-auto font-medium">
                        Everything you need to know regarding authentic footwear, sizing, restock drops, warranties, and store guidelines.
                    </p>

                    {/* Navigation Pills */}
                    <div className="mt-8 flex flex-wrap justify-center gap-2">
                        {staticTabs.map(tab => {
                            const active = currentSlug === tab.slug || url === tab.href;
                            return (
                                <Link
                                    key={tab.slug}
                                    href={tab.href}
                                    className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${
                                        active
                                            ? 'bg-rose-600 text-white shadow-lg shadow-rose-600/30'
                                            : 'bg-slate-800 text-slate-300 hover:bg-slate-700 hover:text-white border border-slate-700/60'
                                    }`}
                                >
                                    {tab.label}
                                </Link>
                            );
                        })}
                    </div>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="max-w-4xl mx-auto px-6 py-12">
                <nav aria-label="Breadcrumb" className="text-xs font-bold text-gray-400 mb-6 flex items-center gap-2">
                    <Link href="/" className="hover:text-slate-900 transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-slate-600">Policies</span>
                    <span>/</span>
                    <span className="text-slate-900 font-extrabold">{page.title}</span>
                </nav>

                {/* Rich Formatted Content */}
                <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-10 shadow-sm">
                    <div
                        className="prose prose-slate max-w-none prose-headings:font-black prose-headings:tracking-tight prose-h2:text-2xl prose-h2:mt-8 prose-h2:mb-4 prose-h3:text-lg prose-h3:mt-6 prose-p:text-gray-600 prose-p:leading-relaxed prose-li:text-gray-600 prose-a:text-rose-600 prose-a:font-bold prose-strong:text-slate-900"
                        dangerouslySetInnerHTML={{ __html: page.content || '<p>Content coming soon.</p>' }}
                    />
                </div>

                {/* Assistance Card */}
                <div className="mt-10 bg-slate-50 border border-slate-200/80 rounded-3xl p-8 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                        <h4 className="text-lg font-black text-slate-900">Need personal assistance?</h4>
                        <p className="text-sm text-gray-500 mt-1 font-medium">Our customer support specialists are ready to help with orders, sizing, and inquiries.</p>
                    </div>
                    <div className="flex gap-3 shrink-0">
                        <Link
                            href="/contact"
                            className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-full font-black text-xs transition-all shadow-sm flex items-center gap-1.5"
                        >
                            <MessageSquare size={14} /> Contact Support
                        </Link>
                        <Link
                            href="/products"
                            className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white rounded-full font-black text-xs transition-all flex items-center gap-1.5"
                        >
                            Shop Collection <ArrowRight size={14} />
                        </Link>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
