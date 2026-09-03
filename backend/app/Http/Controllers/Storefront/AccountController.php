<?php
namespace App\Http\Controllers\Storefront;

use App\Http\Controllers\Controller;
use App\Models\Address;
use App\Models\Order;
use App\Models\Wishlist;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rule;
use Inertia\Inertia;

class AccountController extends Controller
{
    public function dashboard(Request $request)
    {
        $user = $request->user();
        $recentOrders = Order::where('user_id', $user->id)->with(['items.product'])->latest()->take(5)->get();
        $addresses = Address::where('user_id', $user->id)->latest()->get();
        $wishlist = Wishlist::where('user_id', $user->id)->with(['product.images','product.brand'])->latest()->take(6)->get();
        $stats = [
            'orders_count' => Order::where('user_id', $user->id)->count(),
            'total_spent' => Order::where('user_id', $user->id)->sum('total_amount'),
            'wishlist_count' => Wishlist::where('user_id', $user->id)->count(),
            'addresses_count' => $addresses->count(),
        ];
        return Inertia::render('Storefront/Account/Dashboard', [
            'user' => $user,
            'recentOrders' => $recentOrders,
            'addresses' => $addresses,
            'wishlist' => $wishlist,
            'stats' => $stats,
        ]);
    }

    public function profile(Request $request)
    {
        $user = $request->user();
        $addresses = Address::where('user_id', $user->id)->latest()->get();
        return Inertia::render('Storefront/Account/Profile', [
            'user' => $user,
            'addresses' => $addresses,
        ]);
    }

    public function updateProfile(Request $request)
    {
        $user = $request->user();
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required','email','max:255', Rule::unique('users','email')->ignore($user->id)],
            'phone' => 'nullable|string|max:50',
        ]);
        $user->update($data);
        if ($user->isDirty('email')) {
            $user->email_verified_at = null;
            $user->save();
        }
        return back()->with('success', 'Profile updated successfully.');
    }

    public function updatePassword(Request $request)
    {
        $request->validate([
            'current_password' => 'required|current_password',
            'password' => 'required|string|min:8|confirmed',
        ]);
        $request->user()->update(['password' => Hash::make($request->password)]);
        return back()->with('success', 'Password changed successfully.');
    }

    public function addresses(Request $request)
    {
        $user = $request->user();
        $addresses = Address::where('user_id', $user->id)->orderByDesc('is_default')->latest()->get();
        return Inertia::render('Storefront/Account/Addresses', [
            'addresses' => $addresses,
            'user' => $user,
        ]);
    }

    public function storeAddress(Request $request)
    {
        $data = $request->validate([
            'label' => 'nullable|string|max:50',
            'street' => 'required|string|max:500',
            'city' => 'required|string|max:255',
            'state' => 'nullable|string|max:255',
            'zip' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:255',
            'is_default' => 'nullable|boolean',
        ]);
        $data['user_id'] = $request->user()->id;
        $data['country'] = $data['country'] ?? 'Bangladesh';
        $data['is_default'] = (bool)($data['is_default'] ?? false);
        if ($data['is_default']) {
            Address::where('user_id', $data['user_id'])->update(['is_default'=>false]);
        }
        // if first address, make default
        if (Address::where('user_id', $data['user_id'])->count()===0) $data['is_default']=true;
        $address = Address::create($data);
        return back()->with('success', 'Address added.');
    }

    public function updateAddress(Request $request, Address $address)
    {
        $this->authorizeAddress($request, $address);
        $data = $request->validate([
            'label' => 'nullable|string|max:50',
            'street' => 'required|string|max:500',
            'city' => 'required|string|max:255',
            'state' => 'nullable|string|max:255',
            'zip' => 'nullable|string|max:50',
            'country' => 'nullable|string|max:255',
            'is_default' => 'nullable|boolean',
        ]);
        $data['is_default'] = (bool)($data['is_default'] ?? $address->is_default);
        if ($data['is_default']) {
            Address::where('user_id', $request->user()->id)->where('id','!=',$address->id)->update(['is_default'=>false]);
        }
        $address->update($data);
        return back()->with('success', 'Address updated.');
    }

    public function destroyAddress(Request $request, Address $address)
    {
        $this->authorizeAddress($request, $address);
        $address->delete();
        // ensure one default remains if deleted was default
        if ($address->is_default) {
            $first = Address::where('user_id', $request->user()->id)->first();
            if ($first) $first->update(['is_default'=>true]);
        }
        return back()->with('success', 'Address removed.');
    }

    public function setDefaultAddress(Request $request, Address $address)
    {
        $this->authorizeAddress($request, $address);
        Address::where('user_id', $request->user()->id)->update(['is_default'=>false]);
        $address->update(['is_default'=>true]);
        return back()->with('success', 'Default address updated.');
    }

    public function orders(Request $request)
    {
        $user = $request->user();
        $orders = Order::where('user_id', $user->id)->with(['items.product'])->latest()->paginate(10)->withQueryString();
        return Inertia::render('Storefront/Account/Orders', [
            'orders' => $orders,
        ]);
    }

    public function orderShow(Request $request, Order $order)
    {
        if ((int)$order->user_id !== (int)$request->user()->id && !in_array($request->user()->role, ['admin','Super Admin','Manager','Staff'])) {
            abort(403);
        }
        $order->load(['items.product.images','items.product.brand','items.productVariant']);
        $timeline = $this->buildTimeline($order);
        return Inertia::render('Storefront/Account/OrderShow', [
            'order' => $order,
            'timeline' => $timeline,
        ]);
    }

    public function wishlist(Request $request)
    {
        $items = Wishlist::where('user_id', $request->user()->id)->with(['product.images','product.brand','product.variants'])->latest()->get();
        return Inertia::render('Storefront/Account/Wishlist', [
            'items' => $items,
        ]);
    }

    // Public wishlist page for backward compat / storefront wishlist index
    public function wishlistIndex(Request $request)
    {
        if ($request->user()) {
            $items = Wishlist::where('user_id', $request->user()->id)->with(['product.images','product.brand','product.variants'])->latest()->get();
        } else {
            $items = collect();
        }
        return Inertia::render('Storefront/Wishlist/Index', [
            'items' => $items,
        ]);
    }

    public function wishlistToggle(Request $request)
    {
        $request->validate([
            'product_id' => 'required|exists:products,id',
        ]);
        $userId = $request->user()->id;
        $productId = $request->product_id;
        $existing = Wishlist::where('user_id', $userId)->where('product_id', $productId)->first();
        if ($existing) {
            $existing->delete();
            return back()->with('success', 'Removed from wishlist.');
        }
        Wishlist::create(['user_id'=>$userId, 'product_id'=>$productId]);
        return back()->with('success', 'Added to wishlist.');
    }

    public function wishlistDestroy(Request $request, $productId = null)
    {
        $pid = $productId ?? $request->input('product_id');
        $q = Wishlist::where('user_id', $request->user()->id);
        if ($pid) $q->where('product_id', $pid);
        elseif ($request->has('id')) $q->where('id', $request->input('id'));
        $item = $q->first();
        if ($item) $item->delete();
        return back()->with('success', 'Removed from wishlist.');
    }

    private function authorizeAddress(Request $request, Address $address): void
    {
        if ((int)$address->user_id !== (int)$request->user()->id) abort(403);
    }

    private function buildTimeline(Order $order): array
    {
        $statuses = ['pending','processing','shipped','delivered'];
        $currentIdx = array_search($order->status, $statuses);
        // cancelled/refunded are terminal
        if (in_array($order->status, ['cancelled','refunded'])) {
            return [
                ['label'=>'Order Placed','done'=>true,'date'=>$order->created_at],
                ['label'=>ucfirst($order->status),'done'=>true,'date'=>$order->updated_at, 'isTerminal'=>true],
            ];
        }
        $timeline = [];
        foreach ($statuses as $i => $s) {
            $timeline[] = [
                'label' => ucfirst($s),
                'done' => $currentIdx !== false && $i <= $currentIdx,
                'active' => $order->status === $s,
                'date' => $i===0 ? $order->created_at : ($order->status === $s ? $order->updated_at : null),
            ];
        }
        return $timeline;
    }
}
