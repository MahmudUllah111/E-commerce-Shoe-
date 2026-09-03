<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $range = $request->get('range', 'daily'); // daily|weekly|monthly for chart selection initial
        $now = Carbon::now();

        // --- Sales this month ---
        $startThisMonth = $now->copy()->startOfMonth();
        $endThisMonth = $now->copy()->endOfMonth();
        $startPrevMonth = $now->copy()->subMonthNoOverflow()->startOfMonth();
        $endPrevMonth = $now->copy()->subMonthNoOverflow()->endOfMonth();

        $salesThisMonth = (float) Order::whereBetween('created_at', [$startThisMonth, $endThisMonth])->sum('total_amount');
        $salesPrevMonth = (float) Order::whereBetween('created_at', [$startPrevMonth, $endPrevMonth])->sum('total_amount');

        // --- Orders today vs yesterday ---
        $ordersToday = Order::whereDate('created_at', today())->count();
        $ordersYesterday = Order::whereDate('created_at', Carbon::yesterday())->count();

        // --- Revenue totals (all time) % change vs previous month total sales? spec says revenue % change vs previous ---
        $totalRevenue = (float) Order::sum('total_amount');

        // --- New customers week ---
        $startThisWeek = $now->copy()->startOfWeek();
        $endThisWeek = $now->copy()->endOfWeek();
        $startPrevWeek = $now->copy()->subWeek()->startOfWeek();
        $endPrevWeek = $now->copy()->subWeek()->endOfWeek();
        $newCustomersWeek = User::where('role','customer')->whereBetween('created_at', [$startThisWeek, $endThisWeek])->count();
        $newCustomersPrevWeek = User::where('role','customer')->whereBetween('created_at', [$startPrevWeek, $endPrevWeek])->count();

        $pct = function($curr, $prev) {
            if ($prev == 0) return $curr > 0 ? 100 : 0;
            return round((($curr - $prev) / $prev) * 100, 1);
        };

        $stats = [
            'total_sales' => $salesThisMonth,
            'total_sales_prev' => $salesPrevMonth,
            'sales_change' => $pct($salesThisMonth, $salesPrevMonth),
            'orders_today' => $ordersToday,
            'orders_yesterday' => $ordersYesterday,
            'orders_change' => $pct($ordersToday, $ordersYesterday),
            'new_customers' => $newCustomersWeek,
            'new_customers_prev' => $newCustomersPrevWeek,
            'customers_change' => $pct($newCustomersWeek, $newCustomersPrevWeek),
            'revenue' => $totalRevenue,
            'revenue_change' => $pct($salesThisMonth, $salesPrevMonth), // revenue change mirrors sales change for spec
            'low_stock_count' => DB::table('product_variants')->where('stock_quantity','<=',3)->count(),
        ];

        // --- Recent orders 10 ---
        $recentOrders = Order::with(['items','user'])->latest()->take(10)->get()->map(function($o){
            return [
                'id' => $o->id,
                'order_number' => $o->order_number,
                'status' => $o->status,
                'payment_status' => $o->payment_status,
                'total_amount' => $o->total_amount ?? $o->total ?? 0,
                'customer_name' => $o->customer_name ?? $o->user?->name ?? 'Guest',
                'created_at' => $o->created_at,
            ];
        });

        // --- Low stock widget ---
        $lowStock = DB::table('product_variants')
            ->join('products','product_variants.product_id','=','products.id')
            ->where('product_variants.stock_quantity','<=',5)
            ->select('products.name','products.id as product_id','product_variants.id as variant_id','product_variants.size_value','product_variants.stock_quantity','product_variants.sku')
            ->orderBy('product_variants.stock_quantity','asc')
            ->limit(10)
            ->get();

        // --- Chart data ---
        // Daily: last 7 days
        $daily = [];
        for ($i=6; $i>=0; $i--) {
            $d = $now->copy()->subDays($i);
            $sum = (float) Order::whereDate('created_at', $d->toDateString())->sum('total_amount');
            $daily[] = ['name' => $d->format('D'), 'date' => $d->format('m/d'), 'sales' => round($sum,2), 'orders' => Order::whereDate('created_at', $d->toDateString())->count()];
        }
        // Weekly: last 8 weeks buckets Monday-Sunday
        $weekly = [];
        for ($i=7; $i>=0; $i--) {
            $start = $now->copy()->subWeeks($i)->startOfWeek();
            $end = $now->copy()->subWeeks($i)->endOfWeek();
            $sum = (float) Order::whereBetween('created_at', [$start, $end])->sum('total_amount');
            $weekly[] = ['name' => $start->format('M d'), 'sales' => round($sum,2), 'orders' => Order::whereBetween('created_at', [$start,$end])->count()];
        }
        // Monthly: last 12 months
        $monthly = [];
        for ($i=11; $i>=0; $i--) {
            $m = $now->copy()->subMonthsNoOverflow($i);
            $start = $m->copy()->startOfMonth();
            $end = $m->copy()->endOfMonth();
            $sum = (float) Order::whereBetween('created_at', [$start,$end])->sum('total_amount');
            $monthly[] = ['name' => $m->format('M'), 'full' => $m->format('M Y'), 'sales' => round($sum,2), 'orders' => Order::whereBetween('created_at', [$start,$end])->count()];
        }

        // Choose initial chartData based on request range
        $chartData = match($range) {
            'weekly' => $weekly,
            'monthly' => $monthly,
            default => $daily,
        };

        return Inertia::render('Admin/Dashboard', [
            'stats' => $stats,
            'recentOrders' => $recentOrders,
            'lowStock' => $lowStock,
            'chartData' => $chartData,
            'chartSeries' => [
                'daily' => $daily,
                'weekly' => $weekly,
                'monthly' => $monthly,
            ],
            'range' => $range,
        ]);
    }
}
