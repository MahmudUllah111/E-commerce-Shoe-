import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import toast from 'react-hot-toast';

function AccountNav(){
    const url = usePage().url;
    const items = [
        {label:'Dashboard', href:'/account'},
        {label:'Profile', href:'/account/profile'},
        {label:'Addresses', href:'/account/addresses'},
        {label:'Orders', href:'/account/orders'},
        {label:'Wishlist', href:'/account/wishlist'},
    ];
    return (<div className="flex flex-wrap gap-2 mb-6">{items.map(i=>{const active = url===i.href || (i.href!=='/account' && url.startsWith(i.href)); return <Link key={i.href} href={i.href} className={`px-4 py-2 rounded-full text-sm font-bold border ${active?'bg-slate-900 text-white border-slate-900':'bg-white hover:bg-gray-50 border-gray-200'}`}>{i.label}</Link>})}</div>)
}

export default function Profile({ user }){
    const { flash } = usePage().props;
    const form = useForm({ name: user?.name || '', email: user?.email || '', phone: user?.phone || '' });
    const pwd = useForm({ current_password:'', password:'', password_confirmation:'' });

    const submitProfile = (e)=>{ e.preventDefault(); form.patch(route('account.profile.update'), { preserveScroll:true, onSuccess:()=> toast.success('Profile updated'), onError:()=> toast.error('Update failed')}); };
    const submitPwd = (e)=>{ e.preventDefault(); pwd.put(route('account.password.update'), { preserveScroll:true, onSuccess:()=> {toast.success('Password changed'); pwd.reset();}, onError:(errs)=> toast.error(Object.values(errs)[0]||'Failed')}); };

    return (
        <StorefrontLayout>
            <div className="max-w-3xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-black">Profile</h1>
                <p className="text-sm text-gray-500 font-semibold mt-1">Update your personal information</p>
                <div className="mt-6"><AccountNav/></div>
                {flash?.success && <div className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.success}</div>}
                {flash?.error && <div className="mb-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.error}</div>}

                <form onSubmit={submitProfile} className="bg-white border rounded-xl p-6 space-y-4">
                    <h3 className="font-black">Personal Information</h3>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Name *</label>
                        <input value={form.data.name} onChange={e=>form.setData('name', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold focus:border-rose-500 outline-none" />
                        {form.errors.name && <div className="text-xs text-red-600 mt-1">{form.errors.name}</div>}
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Email *</label>
                        <input type="email" value={form.data.email} onChange={e=>form.setData('email', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold focus:border-rose-500 outline-none" />
                        {form.errors.email && <div className="text-xs text-red-600 mt-1">{form.errors.email}</div>}
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Phone</label>
                        <input value={form.data.phone} onChange={e=>form.setData('phone', e.target.value)} placeholder="+880..." className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold focus:border-rose-500 outline-none" />
                        {form.errors.phone && <div className="text-xs text-red-600 mt-1">{form.errors.phone}</div>}
                    </div>
                    <button disabled={form.processing} className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-black text-sm disabled:opacity-60">Save Changes</button>
                </form>

                <form onSubmit={submitPwd} className="mt-6 bg-white border rounded-xl p-6 space-y-4">
                    <h3 className="font-black">Change Password</h3>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Current Password *</label>
                        <input type="password" value={pwd.data.current_password} onChange={e=>pwd.setData('current_password', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold focus:border-rose-500 outline-none" />
                        {pwd.errors.current_password && <div className="text-xs text-red-600 mt-1">{pwd.errors.current_password}</div>}
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500">New Password *</label>
                        <input type="password" value={pwd.data.password} onChange={e=>pwd.setData('password', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold focus:border-rose-500 outline-none" />
                        {pwd.errors.password && <div className="text-xs text-red-600 mt-1">{pwd.errors.password}</div>}
                    </div>
                    <div>
                        <label className="text-xs font-bold uppercase text-gray-500">Confirm New Password *</label>
                        <input type="password" value={pwd.data.password_confirmation} onChange={e=>pwd.setData('password_confirmation', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold focus:border-rose-500 outline-none" />
                    </div>
                    <button disabled={pwd.processing} className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-black text-sm disabled:opacity-60">Update Password</button>
                </form>
            </div>
        </StorefrontLayout>
    )
}
