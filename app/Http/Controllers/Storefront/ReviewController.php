<?php
namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Order;
use App\Models\OrderItem;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;

class ReviewController extends Controller
{
    public function store(Request $request, Product $product)
    {
        // Resolve product via slug or id already passed as Product model; if not found via slug, route binding with slugOrId won't work. So handle manual lookup fallback.
        if (!$product->exists) {
            $slugOrId = $request->route('product');
            $product = Product::where('slug', $slugOrId)->orWhere('id', $slugOrId)->firstOrFail();
        }

        $request->validate([
            'rating' => 'required|integer|min:1|max:5',
            'comment' => 'required|string|min:5|max:2000',
        ]);

        $user = $request->user();
        if (!$user) {
            return back()->with('error', 'You must be logged in to write a review.');
        }

        // Optional: only purchasers can review (spec says only for logged-in purchasers optional). If strict check desired, uncomment. For now enforce purchasers.
        $hasPurchased = Order::where('user_id', $user->id)
            ->whereIn('status', ['processing','shipped','delivered','pending']) // allow any non-cancelled
            ->whereHas('items', fn($q)=> $q->where('product_id', $product->id))
            ->exists();

        if (!$hasPurchased) {
            // allow review but as pending? spec says optional, so we enforce purchasers but with friendly message
            return back()->with('error', 'Only customers who purchased this product can write a review.');
        }

        // prevent duplicate review per user per product
        $existing = Review::where('product_id', $product->id)->where('user_id', $user->id)->first();
        if ($existing) {
            return back()->with('error', 'You have already reviewed this product.');
        }

        Review::create([
            'product_id' => $product->id,
            'user_id' => $user->id,
            'user_name' => $user->name,
            'author_name' => $user->name,
            'rating' => $request->rating,
            'comment' => $request->comment,
            'status' => 'pending', // pending approval per admin flow
            'is_approved' => false,
        ]);

        // update product rating cache optionally (only approved counts, so not now)
        return back()->with('success', 'Review submitted — pending approval.');
    }
}
