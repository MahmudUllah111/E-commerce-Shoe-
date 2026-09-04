<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ProductVariant;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class InventoryController extends Controller
{
    public function index(Request $request)
    {
        $q = \App\Models\Product::with(['images', 'category', 'brand', 'variants'])->latest('updated_at');

        if ($request->filled('search')) {
            $s = '%' . $request->search . '%';
            $q->where(function($qq) use ($s) {
                $qq->where('name', 'like', $s)
                   ->orWhere('sku', 'like', $s)
                   ->orWhereHas('brand', fn($b) => $b->where('name', 'like', $s))
                   ->orWhereHas('category', fn($c) => $c->where('name', 'like', $s))
                   ->orWhereHas('variants', fn($v) => $v->where('sku', 'like', $s)->orWhere('color_name', 'like', $s)->orWhere('size_value', 'like', $s));
            });
        }

        if ($request->filled('low_stock') && $request->low_stock === '1') {
            $q->whereHas('variants', fn($v) => $v->whereRaw('stock_quantity <= low_stock_threshold'));
        }

        $products = $q->paginate(15)->withQueryString();

        // Transform collection to summarize variant stats per shoe
        $products->getCollection()->transform(function($p) {
            $variants = $p->variants;
            $p->total_stock = $variants->sum('stock_quantity');
            $p->low_stock_count = $variants->filter(fn($v) => $v->stock_quantity <= $v->low_stock_threshold)->count();
            $p->out_of_stock_count = $variants->filter(fn($v) => $v->stock_quantity == 0)->count();
            
            // Pending stock notifications for this product's variants
            $variantIds = $variants->pluck('id')->toArray();
            $p->pending_notifications = !empty($variantIds)
                ? DB::table('stock_notifications')->whereIn('variant_id', $variantIds)->where('status', 'pending')->count()
                : 0;

            return $p;
        });

        // stock_logs recent for display
        $logs = DB::table('stock_logs')
            ->join('product_variants','stock_logs.product_variant_id','=','product_variants.id')
            ->join('products','product_variants.product_id','=','products.id')
            ->select('stock_logs.*','products.name as product_name','product_variants.size_value','product_variants.sku')
            ->orderByDesc('stock_logs.created_at')
            ->limit(50)
            ->get();

        $pendingGlobal = DB::table('stock_notifications')->where('status','pending')->count();

        return Inertia::render('Admin/Inventory/Index', [
            'products' => $products,
            'filters' => $request->only(['search', 'low_stock']),
            'logs' => $logs,
            'pendingGlobal' => $pendingGlobal,
        ]);
    }

    public function updateStock(Request $request, ProductVariant $variant)
    {
        $data = $request->validate([
            'stock_quantity' => 'required|integer|min:0|max:100000',
            'reason' => 'nullable|string|max:500',
        ]);

        $old = $variant->stock_quantity;
        $new = (int)$data['stock_quantity'];
        $change = $new - $old;

        DB::transaction(function() use ($variant, $new, $change, $request, $data){
            $variant->update(['stock_quantity'=>$new]);
            if ($change !== 0) {
                DB::table('stock_logs')->insert([
                    'product_variant_id'=>$variant->id,
                    'change_amount'=>$change,
                    'reason'=> $data['reason'] ?? 'manual adjustment',
                    'created_by'=>$request->user()?->id,
                    'created_at'=>now(),
                    'updated_at'=>now(),
                ]);
            }
        });

        // If restocked from 0 → >0, notify waiting customers (genuine SMTP)
        $notified = 0;
        if ($old == 0 && $new > 0) {
            $notified = $this->notifyRestock($variant);
        }

        $msg = 'Stock updated: '.$old.' → '.$new;
        if ($notified > 0) $msg .= " — notified {$notified} waiting customer(s) via email.";

        return back()->with('success', $msg);
    }

    public function updateThreshold(Request $request, ProductVariant $variant)
    {
        $data = $request->validate([
            'low_stock_threshold' => 'required|integer|min:0|max:1000',
        ]);
        $variant->update(['low_stock_threshold'=>(int)$data['low_stock_threshold']]);
        return back()->with('success', 'Threshold updated.');
    }

    public function adjust(Request $request, ProductVariant $variant)
    {
        $data = $request->validate([
            'change_amount' => 'required|integer|min:-10000|max:10000|not_in:0',
            'reason' => 'nullable|string|max:500',
        ]);
        $old = $variant->stock_quantity;
        $new = $old + (int)$data['change_amount'];
        if ($new < 0) return back()->with('error', 'Resulting stock cannot be negative.');

        DB::transaction(function() use ($variant, $new, $data, $request){
            $variant->update(['stock_quantity'=>$new]);
            DB::table('stock_logs')->insert([
                'product_variant_id'=>$variant->id,
                'change_amount'=>(int)$data['change_amount'],
                'reason'=> $data['reason'] ?? 'manual adjustment',
                'created_by'=>$request->user()?->id,
                'created_at'=>now(),
                'updated_at'=>now(),
            ]);
        });

        $notified = 0;
        if ($old == 0 && $new > 0) {
            $notified = $this->notifyRestock($variant->fresh());
        }

        $msg = 'Stock adjusted by '.$data['change_amount'].' → '.$new;
        if ($notified > 0) $msg .= " — notified {$notified} waiting customer(s).";

        return back()->with('success', $msg);
    }

    public function logs(Request $request)
    {
        $q = DB::table('stock_logs')
            ->join('product_variants','stock_logs.product_variant_id','=','product_variants.id')
            ->join('products','product_variants.product_id','=','products.id')
            ->leftJoin('users','stock_logs.created_by','=','users.id')
            ->select('stock_logs.*','products.name as product_name','product_variants.size_value','product_variants.sku','users.name as creator_name');

        if ($request->filled('variant_id')) $q->where('stock_logs.product_variant_id', $request->variant_id);
        if ($request->filled('search')) {
            $s = '%'.$request->search.'%';
            $q->where(function($qq) use ($s){
                $qq->where('products.name','like',$s)->orWhere('product_variants.sku','like',$s);
            });
        }

        $logs = $q->orderByDesc('stock_logs.created_at')->paginate(30)->withQueryString();

        return Inertia::render('Admin/Inventory/Logs', [
            'logs'=>$logs,
            'filters'=>$request->only(['variant_id','search']),
        ]);
    }

    private function notifyRestock(ProductVariant $variant): int
    {
        $product = $variant->product ?? \App\Models\Product::find($variant->product_id);
        if (!$product) return 0;

        $notified = 0;

        // 1) Legacy stock_notifications for this variant
        $pending = DB::table('stock_notifications')
            ->where('variant_id', $variant->id)
            ->where('status', 'pending')
            ->get();

        foreach ($pending as $sub) {
            try {
                $productUrl = url("/product/{$product->slug}");
                $body = "Hello,\n\nGreat news! The shoe you were waiting for is back in stock!\n\n".
                        "Model: {$product->name}\n".
                        "Size: US {$variant->size_value} (Color: {$variant->color_name})\n".
                        "Available Units: {$variant->stock_quantity}\n".
                        "Price: $".number_format((float)($variant->price ?? $product->price),2)."\n\n".
                        "You added this to your wishlist and requested an alert. Grab it before it sells out again!\n".
                        "Shop now: {$productUrl}\n\n".
                        "— TrustedMart Team\n".
                        "Need help? Contact ".config('mail.from.address')."\n";

                Mail::raw($body, function($m) use ($sub, $product, $variant){
                    $m->to($sub->email)->subject("🎉 Back in Stock: {$product->name} (US {$variant->size_value} • {$variant->color_name}) — TrustedMart");
                });
            } catch (\Throwable $e) {
                Log::error('Restock email failed to '.$sub->email.': '.$e->getMessage());
                continue;
            }

            DB::table('stock_notifications')->where('id', $sub->id)->update([
                'status' => 'notified',
                'notified_at' => now(),
                'updated_at' => now(),
            ]);
            $notified++;
        }

        // 2) Wishlist requests for this exact variant or exact Size+Color string
        $requests = \App\Models\WishlistRequest::where('product_id', $variant->product_id)
            ->where('status', 'pending')
            ->where(function($q) use ($variant) {
                $q->where('product_variant_id', $variant->id)
                  ->orWhere(function($qq) use ($variant) {
                      $qq->where(function($x) use ($variant) { $x->where('preferred_size', (string)$variant->size_value)->orWhere('preferred_size', '')->orWhereNull('preferred_size'); })
                         ->where(function($y) use ($variant) { $y->where('preferred_color', $variant->color_name)->orWhere('preferred_color', '')->orWhereNull('preferred_color'); });
                      // Only count if at least one of preferred fields matches exactly when provided
                      $qq->whereRaw("(preferred_size = ? OR preferred_size = '' OR preferred_size IS NULL)", [(string)$variant->size_value])
                         ->whereRaw("(preferred_color = ? OR preferred_color = '' OR preferred_color IS NULL)", [$variant->color_name]);
                  });
            })
            ->get()
            ->filter(function($req) use ($variant) {
                // Enforce exact match when both preferred fields are provided
                $size = trim((string)($req->preferred_size ?? ''));
                $color = trim((string)($req->preferred_color ?? ''));
                if ($size !== '' && $color !== '') {
                    return $size === (string)$variant->size_value && $color === $variant->color_name;
                }
                if ($size !== '' && $color === '') {
                    return $size === (string)$variant->size_value;
                }
                if ($size === '' && $color !== '') {
                    return $color === $variant->color_name;
                }
                // If request has specific variant_id, must match
                if (!empty($req->product_variant_id)) {
                    return (int)$req->product_variant_id === (int)$variant->id;
                }
                // No preference -> notify for any variant restock of this product (fallback to legacy behavior)
                return true;
            })
            ->values();

        // Avoid notifying same email+variant twice (duplicate pending check already done, but filter exact)
        $seen = [];
        foreach ($requests as $req) {
            $key = strtolower($req->email).'|'.$variant->id;
            if (isset($seen[$key])) continue;
            $seen[$key] = true;

            // Double-check exact Size+Color when request specifies them
            $size = trim((string)($req->preferred_size ?? ''));
            $color = trim((string)($req->preferred_color ?? ''));
            if ($size !== '' && $size !== (string)$variant->size_value) continue;
            if ($color !== '' && $color !== $variant->color_name) continue;

            try {
                $productUrl = url("/product/{$product->slug}");
                $body = "Hello,\n\nGreat news! The exact shoe you requested is back in stock!\n\n".
                        "Model: {$product->name}\n".
                        "Size: US {$variant->size_value} (Color: {$variant->color_name})\n".
                        "Available Units: {$variant->stock_quantity}\n".
                        "Price: $".number_format((float)($variant->price ?? $product->price),2)."\n\n".
                        "You requested this specific size/color on our wishlist. Grab it before it sells out again!\n".
                        "Shop now: {$productUrl}\n\n".
                        "— TrustedMart Team\n";

                Mail::raw($body, function($m) use ($req, $product, $variant){
                    $m->to($req->email)->subject("🎉 Back in Stock: {$product->name} (US {$variant->size_value} • {$variant->color_name}) — TrustedMart");
                });
            } catch (\Throwable $e) {
                Log::error('Wishlist request restock email failed to '.$req->email.': '.$e->getMessage());
                continue;
            }

            $req->update(['status' => 'notified', 'notified_at' => now()]);
            $notified++;
        }

        return $notified;
    }
}
