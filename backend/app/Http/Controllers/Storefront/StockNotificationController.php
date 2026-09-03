<?php

namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;

class StockNotificationController extends Controller
{
    public function subscribe(Request $request)
    {
        $data = $request->validate([
            'email' => 'required|email|max:255',
            'product_id' => 'required|exists:products,id',
            'variant_id' => 'required|exists:product_variants,id',
        ]);

        // Ensure variant belongs to product
        $variant = DB::table('product_variants')->where('id', $data['variant_id'])->where('product_id', $data['product_id'])->first();
        if (!$variant) {
            return back()->with('error', 'Variant does not belong to product.');
        }

        DB::table('stock_notifications')->updateOrInsert(
            ['email' => strtolower(trim($data['email'])), 'variant_id' => $data['variant_id']],
            [
                'product_id' => $data['product_id'],
                'status' => 'pending',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );

        $product = DB::table('products')->where('id', $data['product_id'])->first();

        // Send admin alert email (genuine SMTP)
        try {
            $adminEmail = config('mail.from.address', env('MAIL_FROM_ADDRESS', 'mahmudsets@gmail.com'));
            $body = "Hello Administrator,\n\nA customer has requested a restock notification:\n\n" .
                    "Customer Email: {$data['email']}\n" .
                    "Shoe Model: {$product->name} (ID: {$product->id})\n" .
                    "Size Requested: US {$variant->size_value} (Color: {$variant->color_name})\n" .
                    "Current Stock: {$variant->stock_quantity} pairs\n\n" .
                    "Update inventory from Admin Panel: ".url('/admin/inventory')."\n\n- TrustedMart Automated Inventory Alert";

            Mail::raw($body, function ($message) use ($adminEmail, $product, $variant) {
                $message->to($adminEmail)->subject("🔔 Restock Demand: {$product->name} (US {$variant->size_value})");
            });
        } catch (\Throwable $e) {
            Log::error('Admin restock alert email failed: '.$e->getMessage());
            // Don't fail request if mail fails — still register notification
        }

        return back()->with('success', 'You will be notified when this size is back in stock! We also alerted the store admin.');
    }
}
