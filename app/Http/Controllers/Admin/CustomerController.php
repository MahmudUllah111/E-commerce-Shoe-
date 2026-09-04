<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class CustomerController extends Controller
{
    public function index(Request $request)
    {
        $q = User::where('role','customer')->withCount('orders')->withSum('orders as total_spent','total_amount');

        if ($request->filled('search')) {
            $s = '%'.$request->search.'%';
            $q->where(fn($qq)=> $qq->where('name','like',$s)->orWhere('email','like',$s)->orWhere('phone','like',$s));
        }
        if ($request->filled('blocked') && $request->blocked !== 'all') {
            $q->where('is_blocked', $request->blocked === 'blocked' ? 1 : 0);
        }

        $customers = $q->latest()->paginate(20)->withQueryString();

        // map total_spent fallback if sum null
        $customers->getCollection()->transform(function($u){
            $u->total_spent = $u->total_spent ?? 0;
            return $u;
        });

        return Inertia::render('Admin/Customers/Index', [
            'customers' => $customers,
            'filters' => $request->only(['search','blocked']),
        ]);
    }

    public function show(User $customer)
    {
        if ($customer->role !== 'customer') {
            // still allow viewing any user but enforce customer role?
        }
        $customer->load(['addresses','orders' => fn($q)=> $q->latest()->with(['items.product'])->take(20)]);
        $customer->loadCount('orders');
        $customer->total_spent = $customer->orders()->sum('total_amount');

        // order history paginated separate if needed; we pass recent
        $orders = $customer->orders()->with(['items.product'])->latest()->paginate(10);

        return Inertia::render('Admin/Customers/Show', [
            'customer' => $customer,
            'orders' => $orders,
            'addresses' => $customer->addresses,
        ]);
    }

    public function toggleBlock(User $customer)
    {
        $customer->update(['is_blocked' => !$customer->is_blocked]);
        return back()->with('success', $customer->is_blocked ? 'Customer blocked.' : 'Customer unblocked.');
    }

    public function destroy(User $customer)
    {
        $customer->delete();
        return redirect()->route('admin.customers.index')->with('success', 'Customer deleted.');
    }
}
