<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Coupon;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class CouponController extends Controller
{
    public function index(Request $request)
    {
        $q = Coupon::query()->latest();

        if ($request->filled('search')) {
            $s = '%'.$request->search.'%';
            $q->where('code','like',$s);
        }
        if ($request->filled('is_active') && $request->is_active !== 'all') {
            $q->where('is_active', $request->is_active === '1' || $request->is_active === 'active' ? 1 : 0);
        }
        if ($request->filled('type') && $request->type !== 'all') {
            $q->where(function($qq) use ($request){
                $qq->where('type',$request->type)->orWhere('discount_type',$request->type);
            });
        }

        $coupons = $q->paginate(20)->withQueryString();

        return Inertia::render('Admin/Coupons/Index', [
            'coupons' => $coupons,
            'filters' => $request->only(['search','is_active','type']),
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'code' => 'required|string|max:50|unique:coupons,code',
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'is_active' => 'nullable|boolean',
        ]);

        if ($data['type']==='percentage' && $data['value']>100) {
            return back()->withErrors(['value'=>'Percentage cannot exceed 100'])->withInput();
        }

        $coupon = Coupon::create([
            'code' => strtoupper(trim($data['code'])),
            'type' => $data['type'],
            'discount_type' => $data['type'],
            'value' => $data['value'],
            'discount_value' => $data['value'],
            'min_order_value' => $data['min_order_value'] ?? 0,
            'min_order_amount' => $data['min_order_value'] ?? 0,
            'usage_limit' => $data['usage_limit'] ?? null,
            'times_used' => 0,
            'starts_at' => $data['starts_at'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
            'valid_until' => $data['expires_at'] ?? null,
            'is_active' => $data['is_active'] ?? true,
        ]);

        return back()->with('success', 'Coupon created: '.$coupon->code);
    }

    public function update(Request $request, Coupon $coupon)
    {
        $data = $request->validate([
            'code' => ['required','string','max:50', Rule::unique('coupons','code')->ignore($coupon->id)],
            'type' => 'required|in:percentage,fixed',
            'value' => 'required|numeric|min:0',
            'min_order_value' => 'nullable|numeric|min:0',
            'usage_limit' => 'nullable|integer|min:1',
            'starts_at' => 'nullable|date',
            'expires_at' => 'nullable|date|after_or_equal:starts_at',
            'is_active' => 'nullable|boolean',
        ]);

        if ($data['type']==='percentage' && $data['value']>100) {
            return back()->withErrors(['value'=>'Percentage cannot exceed 100'])->withInput();
        }

        $coupon->update([
            'code' => strtoupper(trim($data['code'])),
            'type' => $data['type'],
            'discount_type' => $data['type'],
            'value' => $data['value'],
            'discount_value' => $data['value'],
            'min_order_value' => $data['min_order_value'] ?? 0,
            'min_order_amount' => $data['min_order_value'] ?? 0,
            'usage_limit' => $data['usage_limit'] ?? null,
            'starts_at' => $data['starts_at'] ?? null,
            'expires_at' => $data['expires_at'] ?? null,
            'valid_until' => $data['expires_at'] ?? null,
            'is_active' => $data['is_active'] ?? $coupon->is_active,
        ]);

        return back()->with('success', 'Coupon updated.');
    }

    public function toggle(Coupon $coupon)
    {
        $coupon->update(['is_active' => !$coupon->is_active]);
        return back()->with('success', $coupon->is_active ? 'Coupon activated.' : 'Coupon deactivated.');
    }

    public function destroy(Coupon $coupon)
    {
        $coupon->delete();
        return back()->with('success', 'Coupon deleted.');
    }
}
