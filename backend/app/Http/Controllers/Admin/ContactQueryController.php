<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\ContactQuery;
use Illuminate\Http\Request;
use Inertia\Inertia;

class ContactQueryController extends Controller
{
    public function index(Request $request)
    {
        $query = ContactQuery::latest();

        if ($request->filled('search')) {
            $s = '%' . $request->search . '%';
            $query->where(function($q) use ($s) {
                $q->where('name', 'like', $s)
                  ->orWhere('email', 'like', $s)
                  ->orWhere('subject', 'like', $s)
                  ->orWhere('message', 'like', $s);
            });
        }

        if ($request->filled('status') && $request->status !== 'all') {
            $query->where('status', $request->status);
        }

        $queries = $query->paginate(15)->withQueryString();

        return Inertia::render('Admin/Queries/Index', [
            'queries' => $queries,
            'filters' => $request->only(['search', 'status']),
        ]);
    }

    public function markStatus(Request $request, ContactQuery $query)
    {
        $data = $request->validate([
            'status' => 'required|string|in:unread,read,replied',
        ]);

        $query->update(['status' => $data['status']]);

        return back()->with('success', 'Query marked as ' . $data['status'] . '.');
    }

    public function destroy(ContactQuery $query)
    {
        $query->delete();
        return back()->with('success', 'Customer inquiry deleted.');
    }
}
