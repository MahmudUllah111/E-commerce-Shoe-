import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { useForm, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';
import { Mail, Phone, MapPin, Clock, Send } from 'lucide-react';

export default function Contact() {
    const { auth, flash } = usePage().props;
    const user = auth?.user;

    const form = useForm({
        name: user?.name || '',
        email: user?.email || '',
        subject: '',
        message: '',
    });

    const submit = (e) => {
        e.preventDefault();
        form.post('/contact', {
            preserveScroll: true,
            onSuccess: () => {
                toast.success('Your message has been sent to our team!');
                form.reset('subject', 'message');
            },
            onError: (errs) => {
                toast.error(Object.values(errs)[0] || 'Failed to send message. Please try again.');
            },
        });
    };

    return (
        <StorefrontLayout>
            <div className="max-w-7xl mx-auto px-6 py-12">
                <div className="text-center max-w-2xl mx-auto">
                    <span className="text-xs font-black tracking-widest text-rose-600 uppercase bg-rose-50 px-3 py-1 rounded-full">Contact Support</span>
                    <h1 className="text-3xl sm:text-4xl font-black text-slate-900 mt-3">We’d Love to Hear From You</h1>
                    <p className="text-sm text-gray-600 font-medium mt-2 leading-relaxed">
                        Have a question about shoe sizing, your delivery status, or custom orders? Reach out and our team will get back to you promptly.
                    </p>
                </div>

                <div className="max-w-5xl mx-auto mt-10 grid md:grid-cols-[360px_1fr] gap-8">
                    {/* Contact Info Card */}
                    <div className="bg-slate-900 text-white rounded-3xl p-8 flex flex-col justify-between">
                        <div>
                            <h3 className="text-xl font-black">TrustedMart Headquarters</h3>
                            <p className="text-xs text-slate-400 mt-1 font-medium leading-relaxed">
                                Feel free to email us or visit our storefront showroom during standard hours.
                            </p>

                            <div className="mt-8 space-y-6">
                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                        <Mail size={18} className="text-rose-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Email Admin</div>
                                        <a href="mailto:mahmudsets@gmail.com" className="text-sm font-bold hover:underline text-white">mahmudsets@gmail.com</a>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                        <Phone size={18} className="text-rose-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Direct Hotline</div>
                                        <div className="text-sm font-bold text-white">+880 1700-000000</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                        <MapPin size={18} className="text-rose-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Showroom & Warehouse</div>
                                        <div className="text-sm font-bold text-white">Road 11, Banani, Dhaka - 1213, Bangladesh</div>
                                    </div>
                                </div>

                                <div className="flex items-start gap-4">
                                    <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center shrink-0">
                                        <Clock size={18} className="text-rose-400" />
                                    </div>
                                    <div>
                                        <div className="text-xs font-black text-slate-400 uppercase tracking-wider">Business Hours</div>
                                        <div className="text-sm font-bold text-white">Sat – Thu: 9:00 AM – 9:00 PM</div>
                                        <div className="text-xs text-slate-400">Friday: Closed</div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-slate-800 text-xs text-slate-400">
                            Fast response guaranteed within 24 hours.
                        </div>
                    </div>

                    {/* Inquiry Form */}
                    <div className="bg-white border border-gray-200 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-xl font-black text-slate-900">Send Us an Inquiry</h3>
                        <p className="text-xs text-gray-500 font-medium mt-1">
                            Fill out the form below. Your query is logged in our support desk and sent straight to our admin inbox.
                        </p>

                        <form onSubmit={submit} className="mt-6 space-y-4">
                            <div className="grid sm:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Your Name *</label>
                                    <input
                                        type="text"
                                        value={form.data.name}
                                        onChange={e => form.setData('name', e.target.value)}
                                        required
                                        placeholder="e.g. John Doe"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                                    />
                                    {form.errors.name && <div className="text-xs text-rose-600 font-bold mt-1">{form.errors.name}</div>}
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Email Address *</label>
                                    <input
                                        type="email"
                                        value={form.data.email}
                                        onChange={e => form.setData('email', e.target.value)}
                                        required
                                        placeholder="you@email.com"
                                        className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                                    />
                                    {form.errors.email && <div className="text-xs text-rose-600 font-bold mt-1">{form.errors.email}</div>}
                                </div>
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Subject *</label>
                                <input
                                    type="text"
                                    value={form.data.subject}
                                    onChange={e => form.setData('subject', e.target.value)}
                                    required
                                    placeholder="e.g. Shoe Size Availability / Order Question"
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none"
                                />
                                {form.errors.subject && <div className="text-xs text-rose-600 font-bold mt-1">{form.errors.subject}</div>}
                            </div>

                            <div>
                                <label className="text-xs font-bold uppercase text-gray-600 block mb-1">Message *</label>
                                <textarea
                                    rows={5}
                                    value={form.data.message}
                                    onChange={e => form.setData('message', e.target.value)}
                                    required
                                    placeholder="Write your question, feedback or order details here..."
                                    className="w-full px-4 py-2.5 rounded-xl border border-gray-300 text-sm font-semibold focus:border-slate-900 focus:ring-1 focus:ring-slate-900 outline-none resize-y"
                                />
                                {form.errors.message && <div className="text-xs text-rose-600 font-bold mt-1">{form.errors.message}</div>}
                            </div>

                            <button
                                type="submit"
                                disabled={form.processing}
                                className="w-full py-3.5 bg-slate-900 text-white rounded-full font-black text-sm flex items-center justify-center gap-2 hover:bg-black transition disabled:opacity-50"
                            >
                                <Send size={16} /> {form.processing ? 'Sending Inquiry...' : 'Submit Inquiry'}
                            </button>
                        </form>
                    </div>
                </div>
            </div>
        </StorefrontLayout>
    );
}
