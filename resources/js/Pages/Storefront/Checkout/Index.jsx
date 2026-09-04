import StorefrontLayout from '@/Layouts/StorefrontLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

export default function Index({ cart, summary, shipping_methods, addresses = [], auth, store, order_token }) {
    const { flash } = usePage().props;
    const user = auth?.user || usePage().props.auth?.user;

    const defaultAddr = addresses.find(a=>a.is_default) || addresses[0];
    const [selectedAddressId, setSelectedAddressId] = useState(defaultAddr?.id || '');
    const [showNewAddress, setShowNewAddress] = useState(!addresses.length);
    const [shippingMethod, setShippingMethod] = useState(summary?.selected_method?.id || shipping_methods?.[0]?.id || 'standard');

    // recalc display shipping cost locally
    const selectedShipping = shipping_methods.find(m=>m.id===shippingMethod) || shipping_methods[0];
    const localShippingCost = selectedShipping ? Number(selectedShipping.cost) : Number(summary?.shipping_cost || 0);
    const localTotal = Number(summary?.subtotal || 0) - Number(summary?.discount || 0) + localShippingCost + Number(summary?.tax || 0);

    const form = useForm({
        customer_name: user?.name || '',
        customer_email: user?.email || '',
        customer_phone: user?.phone || '',
        address_id: defaultAddr?.id || '',
        street: defaultAddr?.street || user?.address || '',
        city: defaultAddr?.city || user?.city || '',
        state: defaultAddr?.state || '',
        zip: defaultAddr?.zip || user?.postal_code || '',
        country: defaultAddr?.country || 'Bangladesh',
        shipping_method: shippingMethod,
        payment_method: 'cod',
        bkash_number: '',
        bkash_trx: '',
        nagad_number: '',
        nagad_trx: '',
        save_address: false,
    });

    const handleAddressSelect = (id) => {
        setSelectedAddressId(id);
        if (id === '') {
            setShowNewAddress(true);
            form.setData({
                ...form.data,
                address_id: '',
                street: '',
                city: '',
                state: '',
                zip: '',
                country: 'Bangladesh'
            });
        } else {
            setShowNewAddress(false);
            const found = addresses.find(a => String(a.id) === String(id));
            form.setData({
                ...form.data,
                address_id: id,
                street: found?.street || form.data.street,
                city: found?.city || form.data.city,
                state: found?.state || form.data.state,
                zip: found?.zip || form.data.zip,
                country: found?.country || form.data.country || 'Bangladesh'
            });
        }
    };

    const submit = (e) => {
        e.preventDefault();
        form.setData('shipping_method', shippingMethod);
        form.setData('order_token', order_token);
        form.post(route('checkout.store'), {
            onSuccess: () => toast.success('Placing order...'),
            onError: (errs) => toast.error(Object.values(errs)[0] || 'Checkout failed'),
        });
    };

    // derived summary for review - update tax proportionally? keep original tax for simplicity, but show local shipping
    return (
        <StorefrontLayout>
            <div className="max-w-7xl mx-auto px-6 py-8">
                <h1 className="text-3xl font-black">Checkout</h1>
                <p className="text-sm text-gray-500 font-semibold mt-1">
                    {user ? `Signed in as ${user.email} • Your saved profile & default address are auto-filled below.` : 'Guest checkout or sign in to auto-fill your saved address.'}
                </p>

                {!user && (
                    <div className="mt-4 bg-slate-900 text-white rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
                        <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-full bg-rose-600 text-white flex items-center justify-center text-sm font-black shrink-0">👤</span>
                            <div>
                                <div className="font-bold text-sm">Already a TrustedMart customer?</div>
                                <div className="text-xs text-slate-300">Sign in to auto-fill your saved shipping address and details instantly.</div>
                            </div>
                        </div>
                        <Link href="/login" className="px-5 py-2 bg-white text-slate-900 rounded-full font-black text-xs hover:bg-gray-100 shrink-0">
                            Sign In Now →
                        </Link>
                    </div>
                )}

                {flash?.error && <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-4 py-3 rounded-lg text-sm font-semibold">{flash.error}</div>}

                <form onSubmit={submit} className="mt-6 grid lg:grid-cols-[1fr_400px] gap-8">
                    <div className="space-y-6">
                        {/* Step 1: Contact */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <h2 className="font-black flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">1</span> Contact Information</h2>
                            <div className="grid sm:grid-cols-2 gap-4 mt-4">
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">Full Name *</label>
                                    <input value={form.data.customer_name} onChange={e=>form.setData('customer_name', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold focus:border-rose-500 outline-none" placeholder="John Doe" />
                                    {form.errors.customer_name && <div className="text-xs text-red-600 mt-1">{form.errors.customer_name}</div>}
                                </div>
                                <div>
                                    <label className="text-xs font-bold uppercase text-gray-500">Phone *</label>
                                    <input value={form.data.customer_phone} onChange={e=>form.setData('customer_phone', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold focus:border-rose-500 outline-none" placeholder="+880..." />
                                    {form.errors.customer_phone && <div className="text-xs text-red-600 mt-1">{form.errors.customer_phone}</div>}
                                </div>
                                <div className="sm:col-span-2">
                                    <label className="text-xs font-bold uppercase text-gray-500">Email *</label>
                                    <input type="email" value={form.data.customer_email} onChange={e=>form.setData('customer_email', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold focus:border-rose-500 outline-none" placeholder="you@example.com" />
                                    {form.errors.customer_email && <div className="text-xs text-red-600 mt-1">{form.errors.customer_email}</div>}
                                </div>
                            </div>
                        </div>

                        {/* Step 2: Shipping Address */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <h2 className="font-black flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">2</span> Shipping Address</h2>

                            {addresses.length > 0 && (
                                <div className="mt-4 space-y-2">
                                    <div className="text-xs font-bold uppercase text-gray-500">Saved Addresses</div>
                                    {addresses.map(a => (
                                        <label key={a.id} className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer ${String(selectedAddressId)===String(a.id) ? 'border-slate-900 bg-slate-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                            <input type="radio" name="address" checked={String(selectedAddressId)===String(a.id)} onChange={()=>handleAddressSelect(a.id)} className="mt-1" />
                                            <div className="flex-1">
                                                <div className="font-bold text-sm">{a.label || 'Address'} {a.is_default && <span className="text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-1">DEFAULT</span>}</div>
                                                <div className="text-sm text-gray-600">{a.street}, {a.city}{a.state? ', '+a.state:''} {a.zip} • {a.country}</div>
                                            </div>
                                        </label>
                                    ))}
                                    <label className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer ${showNewAddress ? 'border-slate-900 bg-slate-50' : 'border-gray-200'}`}>
                                        <input type="radio" checked={showNewAddress} onChange={()=>handleAddressSelect('')} />
                                        <span className="font-bold text-sm">Use a new address</span>
                                    </label>
                                </div>
                            )}

                            {showNewAddress && (
                                <div className="grid sm:grid-cols-2 gap-4 mt-4">
                                    <div className="sm:col-span-2">
                                        <label className="text-xs font-bold uppercase text-gray-500">Street *</label>
                                        <input value={form.data.street} onChange={e=>form.setData('street', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold focus:border-rose-500 outline-none" placeholder="123 Main St" />
                                        {form.errors.street && <div className="text-xs text-red-600 mt-1">{form.errors.street}</div>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500">City *</label>
                                        <input value={form.data.city} onChange={e=>form.setData('city', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold" placeholder="Dhaka" />
                                        {form.errors.city && <div className="text-xs text-red-600 mt-1">{form.errors.city}</div>}
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500">State / Division</label>
                                        <input value={form.data.state} onChange={e=>form.setData('state', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold" placeholder="Dhaka" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500">ZIP</label>
                                        <input value={form.data.zip} onChange={e=>form.setData('zip', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold" placeholder="1209" />
                                    </div>
                                    <div>
                                        <label className="text-xs font-bold uppercase text-gray-500">Country</label>
                                        <input value={form.data.country} onChange={e=>form.setData('country', e.target.value)} className="mt-1 w-full px-3 py-2.5 rounded-lg border border-gray-200 text-sm font-semibold" />
                                    </div>
                                    {user && (
                                        <label className="sm:col-span-2 flex items-center gap-2 text-sm font-semibold mt-1">
                                            <input type="checkbox" checked={form.data.save_address} onChange={e=>form.setData('save_address', e.target.checked)} /> Save this address for next time
                                        </label>
                                    )}
                                </div>
                            )}
                        </div>

                        {/* Step 3: Shipping Method */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <h2 className="font-black flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">3</span> Shipping Method</h2>
                            <div className="mt-4 space-y-2">
                                {shipping_methods.map(m => (
                                    <label key={m.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${shippingMethod===m.id ? 'border-slate-900 bg-slate-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="shipping_method" checked={shippingMethod===m.id} onChange={()=>{setShippingMethod(m.id); form.setData('shipping_method', m.id);}} />
                                            <div>
                                                <div className="font-bold text-sm">{m.name}</div>
                                                <div className="text-xs text-gray-500 font-semibold">{m.eta}</div>
                                            </div>
                                        </div>
                                        <div className="font-black">${Number(m.cost).toFixed(2)}</div>
                                    </label>
                                ))}
                                {form.errors.shipping_method && <div className="text-xs text-red-600">{form.errors.shipping_method}</div>}
                            </div>
                        </div>

                        {/* Step 4: Payment */}
                        <div className="bg-white border border-gray-200 rounded-2xl p-6">
                            <h2 className="font-black flex items-center gap-2"><span className="w-6 h-6 rounded-full bg-slate-900 text-white flex items-center justify-center text-xs">4</span> Payment Method</h2>
                            <div className="mt-4 space-y-3">
                                {[
                                    {id:'cod', label:'Cash on Delivery', desc:'Pay when the rider delivers — no advance needed', eta:'Pay at doorstep'},
                                    {id:'bkash', label:'bKash', desc:'Send to 017XX-XXXXXX — enter TrxID', eta:'Instant'},
                                    {id:'nagad', label:'Nagad', desc:'Send to 018XX-XXXXXX — enter TrxID', eta:'Instant'},
                                    {id:'sslcommerz', label:'SSLCommerz', desc:'Visa / Mastercard / Amex — mock gateway', eta:'Secure'},
                                ].map(m=>(
                                    <label key={m.id} className={`flex items-center justify-between p-3 rounded-lg border cursor-pointer ${form.data.payment_method===m.id ? 'border-slate-900 bg-slate-50' : 'border-gray-200 hover:bg-gray-50'}`}>
                                        <div className="flex items-center gap-3">
                                            <input type="radio" name="payment_method" checked={form.data.payment_method===m.id} onChange={()=> form.setData('payment_method', m.id)} />
                                            <div>
                                                <div className="font-black text-sm">{m.label}</div>
                                                <div className="text-xs text-gray-500 font-semibold">{m.desc}</div>
                                            </div>
                                        </div>
                                        <div className="text-xs font-bold text-gray-600">{m.eta}</div>
                                    </label>
                                ))}
                                {form.data.payment_method==='bkash' && (
                                    <div className="grid sm:grid-cols-2 gap-3 bg-pink-50 border border-pink-200 rounded-lg p-4">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500">bKash Number</label>
                                            <input value={form.data.bkash_number} onChange={e=>form.setData('bkash_number', e.target.value)} placeholder="01XXXXXXXXX" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500">TrxID</label>
                                            <input value={form.data.bkash_trx} onChange={e=>form.setData('bkash_trx', e.target.value)} placeholder="TrxID" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                                        </div>
                                        <div className="sm:col-span-2 text-xs text-pink-700 font-semibold">Send payment to <span className="font-black">01712345678</span> (TrustedMart bKash Personal) and enter TrxID.</div>
                                    </div>
                                )}
                                {form.data.payment_method==='nagad' && (
                                    <div className="grid sm:grid-cols-2 gap-3 bg-orange-50 border border-orange-200 rounded-lg p-4">
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500">Nagad Number</label>
                                            <input value={form.data.nagad_number} onChange={e=>form.setData('nagad_number', e.target.value)} placeholder="01XXXXXXXXX" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                                        </div>
                                        <div>
                                            <label className="text-xs font-bold uppercase text-gray-500">TrxID</label>
                                            <input value={form.data.nagad_trx} onChange={e=>form.setData('nagad_trx', e.target.value)} placeholder="TrxID" className="mt-1 w-full px-3 py-2 rounded-lg border border-gray-200 text-sm" />
                                        </div>
                                        <div className="sm:col-span-2 text-xs text-orange-700 font-semibold">Send to <span className="font-black">01812345678</span> (Nagad) and enter TrxID.</div>
                                    </div>
                                )}
                                {form.data.payment_method==='sslcommerz' && (
                                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-xs font-semibold text-blue-800">You will be redirected to SSLCommerz sandbox (mock). For demo, order will be marked <span className="font-black">paid</span> instantly.</div>
                                )}
                                {form.data.payment_method==='cod' && (
                                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-4 text-xs font-semibold text-emerald-800">Pay cash to delivery hero. Order will be <span className="font-black">unpaid</span> until delivered.</div>
                                )}
                                {form.errors.payment_method && <div className="text-xs text-red-600">{form.errors.payment_method}</div>}
                            </div>
                        </div>
                    </div>

                    {/* Order Review Sidebar */}
                    <div className="bg-white border border-gray-200 rounded-2xl p-6 h-fit sticky top-20">
                        <h3 className="font-black text-lg">Order Review</h3>
                        <div className="mt-4 divide-y">
                            {(cart.items||[]).map(it=> (
                                <div key={it.id} className="flex gap-3 py-3">
                                    <img src={it.product?.image} alt={it.product?.name} className="w-14 h-14 object-contain bg-gray-50 rounded border" />
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm font-bold line-clamp-1">{it.product?.name}</div>
                                        <div className="text-xs text-gray-500 font-semibold">{it.variant?.size_value} • {it.variant?.color_name} × {it.quantity}</div>
                                    </div>
                                    <div className="text-sm font-black">${Number(it.line_total).toFixed(2)}</div>
                                </div>
                            ))}
                        </div>
                        <div className="mt-4 space-y-2 text-sm border-t pt-4">
                            <div className="flex justify-between"><span className="text-gray-600 font-semibold">Subtotal</span><span className="font-bold">${Number(summary?.subtotal||0).toFixed(2)}</span></div>
                            {Number(summary?.discount||0) >0 && <div className="flex justify-between text-green-700"><span className="font-semibold">Discount {summary?.coupon?.code && `(${summary.coupon.code})`}</span><span className="font-bold">- ${Number(summary.discount).toFixed(2)}</span></div>}
                            <div className="flex justify-between"><span className="text-gray-600 font-semibold">Shipping • {selectedShipping?.name}</span><span className="font-bold">${Number(localShippingCost).toFixed(2)}</span></div>
                            <div className="flex justify-between"><span className="text-gray-600 font-semibold">Tax</span><span className="font-bold">${Number(summary?.tax||0).toFixed(2)}</span></div>
                            <div className="flex justify-between text-base font-black border-t pt-3"><span>Total</span><span className="text-rose-600">${Number(localTotal).toFixed(2)}</span></div>
                        </div>
                        <button type="submit" disabled={form.processing} className="mt-6 w-full py-3.5 bg-slate-900 text-white rounded-full font-black hover:bg-black disabled:opacity-60">
                            {form.processing ? 'Placing order...' : `Place Order • $${Number(localTotal).toFixed(2)}`}
                        </button>
                        <Link href="/cart" className="mt-3 block text-center text-sm font-bold text-gray-600 hover:text-slate-900">← Back to Cart</Link>
                    </div>
                </form>
            </div>
        </StorefrontLayout>
    );
}
