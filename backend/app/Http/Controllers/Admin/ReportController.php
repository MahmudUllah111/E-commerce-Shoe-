<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;
use Inertia\Inertia;
use Symfony\Component\HttpFoundation\StreamedResponse;

class ReportController extends Controller
{
    public function index(Request $request)
    {
        $from = $request->get('from') ? Carbon::parse($request->get('from'))->startOfDay() : Carbon::now()->subDays(30)->startOfDay();
        $to = $request->get('to') ? Carbon::parse($request->get('to'))->endOfDay() : Carbon::now()->endOfDay();
        $categoryId = $request->get('category_id');
        $productId = $request->get('product_id');

        // Base order query with date range
        $orderQuery = Order::whereBetween('created_at', [$from, $to]);

        // Filter by category/product via items
        if ($categoryId) {
            $orderQuery->whereHas('items.product', fn($q) => $q->where('category_id', $categoryId));
        }
        if ($productId) {
            $orderQuery->whereHas('items', fn($q) => $q->where('product_id', $productId));
        }

        $orders = (clone $orderQuery)->get();
        $totalSales = 0;
        foreach ($orders as $o) {
            $totalSales += (float) ($o->total_amount ?? $o->total ?? 0);
        }
        $totalOrders = $orders->count();
        $avgOrderValue = $totalOrders ? round($totalSales / $totalOrders, 2) : 0;

        // Timeseries daily sales for chart
        $daily = [];
        $period = Carbon::parse($from)->copy();
        $end = Carbon::parse($to)->copy();
        // Cap at 60 days for performance
        $days = min($period->diffInDays($end) + 1, 90);
        for ($i=0; $i<$days; $i++) {
            $d = Carbon::parse($from)->addDays($i)->toDateString();
            if (Carbon::parse($d)->gt($to)) break;
            $q = Order::whereDate('created_at', $d);
            if ($categoryId) $q->whereHas('items.product', fn($qq)=> $qq->where('category_id',$categoryId));
            if ($productId) $q->whereHas('items', fn($qq)=> $qq->where('product_id',$productId));
            $sum = (float) $q->sum('total_amount');
            $cnt = $q->count();
            $daily[] = ['date'=>$d, 'sales'=> round($sum,2), 'orders'=>$cnt];
        }

        // Best-selling table: aggregate order_items
        $bestQ = OrderItem::query()
            ->join('orders','order_items.order_id','=','orders.id')
            ->join('products','order_items.product_id','=','products.id')
            ->leftJoin('categories','products.category_id','=','categories.id')
            ->whereBetween('orders.created_at', [$from,$to])
            ->select(
                'products.id as product_id',
                'products.name as product_name',
                'products.slug as product_slug',
                'products.price as product_price',
                'categories.name as category_name',
                DB::raw('SUM(order_items.quantity) as total_qty'),
                DB::raw('SUM(order_items.quantity * order_items.unit_price) as total_revenue'),
                DB::raw('COUNT(DISTINCT orders.id) as orders_count')
            )
            ->groupBy('products.id','products.name','products.slug','products.price','categories.name')
            ->orderByDesc('total_qty');

        if ($categoryId) $bestQ->where('products.category_id', $categoryId);
        if ($productId) $bestQ->where('products.id', $productId);

        $bestSelling = $bestQ->limit(20)->get();

        // For CSV limit larger
        $summary = [
            'total_sales' => round($totalSales,2),
            'total_orders' => $totalOrders,
            'avg_order_value' => $avgOrderValue,
            'from' => $from->toDateString(),
            'to' => $to->toDateString(),
        ];

        return Inertia::render('Admin/Reports/Index', [
            'summary' => $summary,
            'daily' => $daily,
            'bestSelling' => $bestSelling,
            'filters' => [
                'from' => $from->toDateString(),
                'to' => $to->toDateString(),
                'category_id' => $categoryId ? (int)$categoryId : null,
                'product_id' => $productId ? (int)$productId : null,
            ],
            'categories' => Category::select('id','name','slug')->orderBy('name')->get(),
            'products' => Product::select('id','name','slug','category_id')->orderBy('name')->limit(200)->get(),
        ]);
    }

    public function export(Request $request): StreamedResponse
    {
        $from = $request->get('from') ? Carbon::parse($request->get('from'))->startOfDay() : Carbon::now()->subDays(30)->startOfDay();
        $to = $request->get('to') ? Carbon::parse($request->get('to'))->endOfDay() : Carbon::now()->endOfDay();
        $categoryId = $request->get('category_id');
        $productId = $request->get('product_id');

        $q = OrderItem::query()
            ->join('orders','order_items.order_id','=','orders.id')
            ->join('products','order_items.product_id','=','products.id')
            ->leftJoin('categories','products.category_id','=','categories.id')
            ->whereBetween('orders.created_at', [$from,$to])
            ->select(
                'orders.order_number',
                'orders.created_at as order_date',
                'orders.customer_name',
                'orders.customer_email',
                'orders.status',
                'products.name as product_name',
                'categories.name as category_name',
                'order_items.quantity',
                'order_items.unit_price',
                DB::raw('order_items.quantity * order_items.unit_price as line_total'),
                'orders.total_amount'
            )
            ->orderBy('orders.created_at','desc');

        if ($categoryId) $q->where('products.category_id', $categoryId);
        if ($productId) $q->where('products.id', $productId);

        $filename = 'sales-report-'.$from->format('Y-m-d').'_to_'.$to->format('Y-m-d').'.csv';

        return response()->streamDownload(function() use ($q) {
            $out = fopen('php://output','w');
            fputcsv($out, ['Date','Order #','Customer','Email','Status','Product','Category','Qty','Unit Price','Line Total','Order Total']);
            $q->chunk(500, function($rows) use ($out) {
                foreach ($rows as $r) {
                    $total = $r->total_amount ?? 0;
                    fputcsv($out, [
                        Carbon::parse($r->order_date)->format('Y-m-d H:i'),
                        $r->order_number,
                        $r->customer_name,
                        $r->customer_email,
                        $r->status,
                        $r->product_name,
                        $r->category_name,
                        $r->quantity,
                        number_format((float)$r->unit_price,2,'.',''),
                        number_format((float)$r->line_total,2,'.',''),
                        number_format((float)$total,2,'.',''),
                    ]);
                }
            });
            fclose($out);
        }, $filename, [
            'Content-Type' => 'text/csv',
            'Content-Disposition' => "attachment; filename=\"$filename\"",
        ]);
    }
}
