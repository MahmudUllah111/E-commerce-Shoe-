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

    public function reply(Request $request, ContactQuery $query)
    {
        $data = $request->validate([
            'reply_message' => 'required|string|min:3|max:5000',
        ]);

        $storeName = config('mail.from.name', 'TrustedMart');
        $body = "Hello {$query->name},\n\n" .
                "Thank you for reaching out to {$storeName}.\n\n" .
                "Regarding your inquiry: \"" . ($query->subject ?: 'Customer Inquiry') . "\"\n\n" .
                "--------------------------------------------------\n" .
                "{$data['reply_message']}\n" .
                "--------------------------------------------------\n\n" .
                "Best regards,\n" .
                "{$storeName} Support Team\n" .
                "Website: " . url('/') . "\n";

        try {
            $fromAddr = config('mail.from.address') ?: 'support@trustedmart.com';
            $replySubject = "Re: " . ($query->subject ?: "Your inquiry at {$storeName}");

            \Illuminate\Support\Facades\Mail::raw($body, function ($msg) use ($query, $replySubject) {
                $msg->to($query->email, $query->name)
                    ->subject($replySubject);
            });

            $query->update(['status' => 'replied']);

            \App\Models\MailLog::record(
                'inquiry_reply',
                'outgoing',
                $fromAddr,
                $query->email,
                $replySubject,
                $body,
                'sent'
            );

            return back()->with('success', "Reply successfully sent to {$query->email} via SMTP!");
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::error('Inquiry reply email error: ' . $e->getMessage());
            \App\Models\MailLog::record(
                'inquiry_reply',
                'outgoing',
                config('mail.from.address') ?: 'support@trustedmart.com',
                $query->email,
                "Re: " . ($query->subject ?: "Your inquiry at {$storeName}"),
                $body,
                'failed',
                $e->getMessage()
            );
            return back()->with('error', "Failed to send email: " . $e->getMessage());
        }
    }

    public function destroy(ContactQuery $query)
    {
        $query->delete();
        return back()->with('success', 'Customer inquiry deleted.');
    }
}
