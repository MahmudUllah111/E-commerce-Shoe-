<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Product;
use App\Models\Review;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ReviewController extends Controller
{
    public function index(Request $request)
    {
        $q = Review::with(['product','user'])->latest();

        if ($request->filled('status') && $request->status !== 'all') {
            $q->where('status', $request->status);
        }
        if ($request->filled('rating') && $request->rating !== 'all') {
            $q->where('rating', (int)$request->rating);
        }
        if ($request->filled('search')) {
            $s = '%'.$request->search.'%';
            $q->where(function($qq) use ($s){
                $qq->where('comment','like',$s)
                   ->orWhere('user_name','like',$s)
                   ->orWhere('author_name','like',$s)
                   ->orWhereHas('product', fn($p)=> $p->where('name','like',$s))
                   ->orWhereHas('user', fn($u)=> $u->where('name','like',$s)->orWhere('email','like',$s));
            });
        }

        $reviews = $q->paginate(20)->withQueryString();

        return Inertia::render('Admin/Reviews/Index', [
            'reviews' => $reviews,
            'filters' => $request->only(['status','rating','search']),
        ]);
    }

    public function approve(Review $review)
    {
        $review->update(['status'=>'approved','is_approved'=>true]);
        $this->recalcProductRating($review->product_id);
        return back()->with('success', 'Review approved.');
    }

    public function reject(Review $review)
    {
        $wasApproved = $review->status === 'approved';
        $review->update(['status'=>'rejected','is_approved'=>false]);
        if ($wasApproved) $this->recalcProductRating($review->product_id);
        return back()->with('success', 'Review rejected.');
    }

    public function reply(Request $request, Review $review)
    {
        $data = $request->validate([
            'admin_reply' => 'required|string|max:2000',
        ]);
        $review->update([
            'admin_reply' => $data['admin_reply'],
            'admin_reply_at' => now(),
        ]);
        return back()->with('success', 'Reply saved and will be shown publicly.');
    }

    public function destroy(Review $review)
    {
        $pid = $review->product_id;
        $wasApproved = $review->status === 'approved';
        $review->delete();
        if ($wasApproved) $this->recalcProductRating($pid);
        return back()->with('success', 'Review deleted.');
    }

    private function recalcProductRating($productId): void
    {
        try {
            $agg = Review::where('product_id', $productId)->where('status','approved')->selectRaw('AVG(rating) as avg_rating, COUNT(*) as cnt')->first();
            $avg = $agg->avg_rating ? round($agg->avg_rating,1) : 5.0;
            $cnt = $agg->cnt ?? 0;
            Product::where('id', $productId)->update(['rating'=>$avg,'reviews_count'=>$cnt]);
        } catch (\Throwable $e) {}
    }
}
