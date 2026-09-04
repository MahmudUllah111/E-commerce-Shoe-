<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Mail\OrderConfirmationMail;
use App\Models\Order;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Inertia\Inertia;
use Barryvdh\DomPDF\Facade\Pdf;

class OrderController extends Controller
{
    public function index(Request $request)
    {
        $q = Order::with(['items.product', 'user'])->latest();

        if ($request->filled('status') && $request->status !== 'all') {
            $q->where('status', $request->status);
        }
        if ($request->filled('date_from')) {
            $q->whereDate('created_at', '>=', $request->date_from);
        }
        if ($request->filled('date_to')) {
            $q->whereDate('created_at', '<=', $request->date_to);
        }
        if ($request->filled('search')) {
            $s = '%'.$request->search.'%';
            $q->where(function($qq) use ($s) {
                $qq->where('order_number','like',$s)
                   ->orWhere('customer_name','like',$s)
                   ->orWhere('customer_email','like',$s)
                   ->orWhere('customer_phone','like',$s);
            });
        }

        $orders = $q->paginate(20)->withQueryString();

        return Inertia::render('Admin/Orders/Index', [
            'orders' => $orders,
            'filters' => $request->only(['status','date_from','date_to','search']),
            'statuses' => ['pending','processing','shipped','delivered','cancelled','refunded'],
        ]);
    }

    public function show(Request $request, Order $order)
    {
        $order->load(['items.product.images','items.productVariant','user','items.product.brand']);
        // stock logs for variants in this order
        $variantIds = $order->items->pluck('product_variant_id')->filter()->unique();
        $stockLogs = DB::table('stock_logs')
            ->whereIn('product_variant_id', $variantIds)
            ->orderByDesc('created_at')->limit(20)->get();

        return Inertia::render('Admin/Orders/Show', [
            'order' => $order,
            'stock_logs' => $stockLogs,
        ]);
    }

    public function updateStatus(Request $request, Order $order)
    {
        $data = $request->validate([
            'status' => 'required|in:pending,processing,shipped,delivered,cancelled,refunded',
            'send_email' => 'nullable|boolean',
            'internal_note' => 'nullable|string|max:2000',
        ]);

        $old = $order->status;
        $newStatus = $data['status'];
        $order->update(['status' => $newStatus]);

        if (!empty($data['internal_note'])) {
            try {
                if (\Illuminate\Support\Facades\Schema::hasTable('order_notes')) {
                    DB::table('order_notes')->insert([
                        'order_id' => $order->id,
                        'note' => $data['internal_note'],
                        'created_by' => $request->user()->id,
                        'created_at' => now(),
                        'updated_at' => now(),
                    ]);
                } else {
                    \Illuminate\Support\Facades\Log::info('Order internal note', ['order'=>$order->order_number, 'note'=>$data['internal_note'], 'by'=>$request->user()->id]);
                }
            } catch (\Throwable $e) {}
        }

        // Only send email if status actually changed and it's a customer-facing transition
        $shouldSend = $request->boolean('send_email')
            && !empty($order->customer_email)
            && $old !== $newStatus
            && in_array($newStatus, ['pending','shipped','delivered']);

        if ($shouldSend) {
            try {
                $order->load(['items.product', 'items.productVariant', 'user']);
                $note = "Status changed from {$old} to " . strtoupper($newStatus) . "." . (!empty($data['internal_note']) ? " Note: {$data['internal_note']}" : "");
                Mail::to($order->customer_email)->queue(new \App\Mail\OrderStatusMail(
                    $order,
                    $newStatus,
                    null,
                    $note
                ));
            } catch (\Throwable $e) {
                \Illuminate\Support\Facades\Log::warning('Order status email failed: '.$e->getMessage());
            }
        }

        return back()->with('success', 'Order status updated to '.$newStatus);
    }

    public function invoice(Order $order)
    {
        $order->load(['items.product','items.productVariant','user']);
        $pdf = Pdf::loadView('pdfs.invoice', compact('order'))->setPaper('a4');
        return $pdf->download('invoice-'.$order->order_number.'.pdf');
    }

    public function packingSlip(Order $order)
    {
        $order->load(['items.product','items.productVariant']);
        $pdf = Pdf::loadView('pdfs.packing-slip', compact('order'))->setPaper('a4');
        return $pdf->download('packing-slip-'.$order->order_number.'.pdf');
    }

    public function refund(Request $request, Order $order)
    {
        if ($order->status === 'refunded') {
            return back()->with('error', 'Order already refunded.');
        }
        $data = $request->validate([
            'reason' => 'nullable|string|max:1000',
            'restock' => 'nullable|boolean',
        ]);

        DB::transaction(function () use ($order, $request, $data) {
            $order->update(['status'=>'refunded','payment_status'=>'refunded']);
            if ($request->boolean('restock', true)) {
                foreach ($order->items as $item) {
                    if ($item->product_variant_id) {
                        $variant = \App\Models\ProductVariant::find($item->product_variant_id);
                        if ($variant) {
                            $variant->increment('stock_quantity', $item->quantity);
                            DB::table('stock_logs')->insert([
                                'product_variant_id' => $variant->id,
                                'change_amount' => $item->quantity,
                                'reason' => 'refund #'.$order->order_number.' - '.($data['reason'] ?? ''),
                                'created_by' => $request->user()->id,
                                'created_at' => now(),
                                'updated_at' => now(),
                            ]);
                        }
                    }
                }
            }
        });

        try {
            if (!empty($order->customer_email)) {
                $order->load(['items.product', 'items.productVariant', 'user']);
                Mail::to($order->customer_email)->send(new OrderConfirmationMail(
                    $order,
                    "Order #{$order->order_number} Refund Notification",
                    "Your order has been marked as refunded. Reason: " . ($data['reason'] ?? 'Customer request')
                ));
            }
        } catch (\Throwable $e) {}

        return back()->with('success', 'Order refunded and stock restocked.');
    }
}
