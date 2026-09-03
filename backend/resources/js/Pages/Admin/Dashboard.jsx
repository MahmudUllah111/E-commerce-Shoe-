import AdminLayout from '@/Layouts/AdminLayout';
import { Link, router } from '@inertiajs/react';
import { useState } from 'react';
import { LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

function formatCurrency(n){
    return new Intl.NumberFormat('en-US',{style:'currency',currency:'USD'}).format(Number(n||0));
}
function ChangeBadge({value}){
    if (value===null || value===undefined) return null;
    const positive = value>=0;
    return (
        <span className={`inline-flex items-center gap-1 text-xs font-black px-2 py-0.5 rounded-full ${positive?'bg-emerald-50 text-emerald-700 border border-emerald-200':'bg-rose-50 text-rose-700 border border-rose-200'}`}>
            {positive ? '▲' : '▼'} {Math.abs(value)}%
        </span>
    );
}
function StatusBadge({status}){
    const map = {
        pending: 'bg-amber-100 text-amber-800 border-amber-200',
        processing: 'bg-blue-100 text-blue-800 border-blue-200',
        shipped: 'bg-indigo-100 text-indigo-800 border-indigo-200',
        delivered: 'bg-emerald-100 text-emerald-800 border-emerald-200',
        cancelled: 'bg-rose-100 text-rose-800 border-rose-200',
        refunded: 'bg-gray-100 text-gray-700 border-gray-200',
    };
    const cls = map[status] || 'bg-gray-100 text-gray-700 border-gray-200';
    return <span className={`px-2 py-1 rounded text-[11px] font-black uppercase tracking-wide border ${cls}`}>{status}</span>;
}

export default function Dashboard({ stats, recentOrders, lowStock, chartSeries, range: initialRange='daily' }) {
    const [range, setRange] = useState(initialRange);
    const [chartType, setChartType] = useState('line');
    const series = chartSeries || { daily: [], weekly: [], monthly: [] };
    const data = range==='weekly' ? series.weekly : range==='monthly' ? series.monthly : series.daily;

    const handleRange = (r)=>{
        setRange(r);
        router.get(route('admin.dashboard'), {range:r}, {preserveState:true, preserveScroll:true, only:['chartData','range']});
    };

    const totalSalesLabel = range==='monthly' ? 'Sales (12M)' : range==='weekly' ? 'Sales (8W)' : 'Sales (7D)';

    return (
        <AdminLayout header="Dashboard">
            {/* Stat cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8" role="region" aria-label="Key metrics">
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="text-[11px] font-extrabold tracking-widest text-gray-500 uppercase">Total Sales This Month</div>
                    <div className="mt-1 flex items-center gap-2">
                        <div className="text-2xl font-black tracking-tight" aria-label={`Total sales ${formatCurrency(stats.total_sales)}`}>{formatCurrency(stats.total_sales)}</div>
                        <ChangeBadge value={stats.sales_change} />
                    </div>
                    <div className="text-xs text-gray-500 font-semibold mt-1">vs {formatCurrency(stats.total_sales_prev)} last month</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="text-[11px] font-extrabold tracking-widest text-gray-500 uppercase">Orders Today</div>
                    <div className="mt-1 flex items-center gap-2">
                        <div className="text-2xl font-black">{stats.orders_today}</div>
                        <ChangeBadge value={stats.orders_change} />
                    </div>
                    <div className="text-xs text-gray-500 font-semibold mt-1">{stats.orders_yesterday} yesterday</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="text-[11px] font-extrabold tracking-widest text-gray-500 uppercase">Revenue &bull; % Change</div>
                    <div className="mt-1 flex items-center gap-2">
                        <div className="text-2xl font-black">{formatCurrency(stats.revenue)}</div>
                        <ChangeBadge value={stats.revenue_change} />
                    </div>
                    <div className="text-xs text-gray-500 font-semibold mt-1">All-time revenue • month-over-month</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="text-[11px] font-extrabold tracking-widest text-rose-600 uppercase">Low Stock • New Customers</div>
                    <div className="mt-1 flex items-center gap-2">
                        <div className="text-2xl font-black">{stats.low_stock_count} items</div>
                        <span className="text-xs font-bold text-gray-500">• {stats.new_customers} new (7d)</span>
                        <ChangeBadge value={stats.customers_change} />
                    </div>
                    <div className="text-xs text-gray-500 font-semibold mt-1">≤3 units threshold • vs {stats.new_customers_prev} last week</div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
                        <h3 className="font-black text-sm">Sales Overview • <span className="text-gray-500 font-bold">{totalSalesLabel}</span></h3>
                        <div className="flex items-center gap-2">
                            <div className="inline-flex rounded-full border border-gray-200 p-1 bg-gray-50" role="tablist" aria-label="Time range">
                                {['daily','weekly','monthly'].map(r=> (
                                    <button key={r} onClick={()=>handleRange(r)} role="tab" aria-selected={range===r} className={`px-3 py-1 rounded-full text-xs font-black capitalize ${range===r?'bg-slate-900 text-white shadow':'text-gray-600 hover:bg-white'}`}>{r}</button>
                                ))}
                            </div>
                            <div className="inline-flex rounded-full border border-gray-200 p-1 bg-gray-50">
                                <button onClick={()=>setChartType('line')} className={`px-3 py-1 rounded-full text-xs font-black ${chartType==='line'?'bg-white shadow border':'text-gray-500'}`} aria-pressed={chartType==='line'}>Line</button>
                                <button onClick={()=>setChartType('bar')} className={`px-3 py-1 rounded-full text-xs font-black ${chartType==='bar'?'bg-white shadow border':'text-gray-500'}`} aria-pressed={chartType==='bar'}>Bar</button>
                            </div>
                        </div>
                    </div>
                    {data.length===0 ? (
                        <div className="h-64 flex items-center justify-center text-sm font-semibold text-gray-500 border border-dashed rounded-xl">No sales data for this period</div>
                    ) : (
                    <div className="h-72" role="img" aria-label={`Sales chart ${range} showing ${data.length} points`}>
                        <ResponsiveContainer width="100%" height="100%">
                            {chartType==='line' ? (
                                <LineChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                                    <XAxis dataKey="name" tick={{fontSize:12, fontWeight:600}} axisLine={false} tickLine={false}/>
                                    <YAxis tickFormatter={(v)=> `$${v}`} tick={{fontSize:12}} axisLine={false} tickLine={false}/>
                                    <Tooltip formatter={(v)=> [formatCurrency(v),'Sales']} contentStyle={{borderRadius:12, border:'1px solid #e2e8f0', fontSize:12, fontWeight:700}}/>
                                    <Line type="monotone" dataKey="sales" stroke="#e11d48" strokeWidth={2.5} dot={{r:3}} activeDot={{r:5}} />
                                </LineChart>
                            ) : (
                                <BarChart data={data}>
                                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9"/>
                                    <XAxis dataKey="name" tick={{fontSize:12, fontWeight:600}} axisLine={false} tickLine={false}/>
                                    <YAxis tickFormatter={(v)=> `$${v}`} tick={{fontSize:12}} axisLine={false} tickLine={false}/>
                                    <Tooltip formatter={(v)=> [formatCurrency(v),'Sales']} contentStyle={{borderRadius:12, border:'1px solid #e2e8f0', fontSize:12, fontWeight:700}}/>
                                    <Bar dataKey="sales" fill="#0f172a" radius={[6,6,0,0]} />
                                </BarChart>
                            )}
                        </ResponsiveContainer>
                    </div>
                    )}
                    <div className="mt-2 text-[11px] font-bold text-gray-400">Hover for details • {range==='daily' ? 'Last 7 days' : range==='weekly' ? 'Last 8 weeks' : 'Last 12 months'}</div>
                </div>
                <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <h3 className="font-black text-sm mb-3">Low-Stock Alerts</h3>
                    {lowStock.length===0 ? (
                        <div className="text-sm text-gray-500 font-semibold py-6 text-center border border-dashed rounded-xl">All stocked ✓ • No items at risk</div>
                    ) : (
                        <div className="space-y-2 max-h-[320px] overflow-auto pr-1">
                            {lowStock.map((r)=>(
                                <Link key={r.variant_id || r.sku} href={`/admin/inventory?search=${encodeURIComponent(r.sku||r.name)}`} className="flex justify-between items-center text-sm py-2 px-3 border border-gray-100 rounded-lg hover:bg-rose-50 hover:border-rose-200 transition">
                                    <span className="font-semibold line-clamp-1">{r.name} — <span className="font-bold text-gray-700">US {r.size_value}</span> <span className="text-xs text-gray-500">({r.sku})</span></span>
                                    <span className={`font-black px-2 py-1 rounded-full text-xs border ${r.stock_quantity===0?'bg-rose-600 text-white border-rose-600':'bg-amber-100 text-amber-800 border-amber-200'}`}>{r.stock_quantity}</span>
                                </Link>
                            ))}
                        </div>
                    )}
                    <Link href="/admin/inventory?low_stock=1" className="mt-3 inline-flex text-xs font-black text-rose-600 hover:text-rose-700">View all low stock →</Link>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-xl p-5 mt-6 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                    <h3 className="font-black text-sm">Recent Orders — last 10</h3>
                    <Link href="/admin/orders" className="text-xs font-black text-slate-900 hover:text-rose-600">View all →</Link>
                </div>
                {recentOrders.length===0 ? (
                    <div className="py-10 text-center text-sm font-semibold text-gray-500 border border-dashed rounded-xl">No orders yet</div>
                ) : (
                <div className="overflow-x-auto -mx-5 px-5">
                    <table className="w-full text-sm">
                        <thead className="text-gray-500 font-black border-b">
                            <tr><th className="py-2 text-left">Order #</th><th className="text-left">Customer</th><th className="text-left">Status</th><th className="text-right">Total</th><th className="text-right">Date</th></tr>
                        </thead>
                        <tbody>
                            {recentOrders.map(o=> (
                                <tr key={o.id} className="border-b last:border-0 hover:bg-gray-50">
                                    <td className="py-2.5"><Link href={`/admin/orders/${o.id}`} className="font-mono font-bold text-slate-900 hover:text-rose-600">{o.order_number}</Link></td>
                                    <td className="font-semibold text-gray-700">{o.customer_name}</td>
                                    <td><StatusBadge status={o.status}/></td>
                                    <td className="text-right font-black">{formatCurrency(o.total_amount)}</td>
                                    <td className="text-right text-xs font-semibold text-gray-500">{new Date(o.created_at).toLocaleDateString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                )}
            </div>
        </AdminLayout>
    );
}
