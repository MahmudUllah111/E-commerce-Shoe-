<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StoreSetting;
use App\Models\User;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Storage;
use Illuminate\Validation\Rule;
use Inertia\Inertia;
use Spatie\Permission\Models\Role;

class SettingController extends Controller
{
    public function index()
    {
        $settings = StoreSetting::pluck('value','key')->toArray();
        // decode json fields for frontend
        $shippingRaw = $settings['shipping_zones'] ?? $settings['shipping_settings'] ?? $settings['shipping_rates'] ?? null;
        $shippingZones = null;
        if ($shippingRaw) {
            $decoded = is_string($shippingRaw) ? json_decode($shippingRaw, true) : $shippingRaw;
            $shippingZones = $decoded;
        }
        $taxRaw = $settings['tax_settings'] ?? null;
        $taxSettings = null;
        if ($taxRaw) {
            $taxSettings = is_string($taxRaw) ? json_decode($taxRaw, true) : $taxRaw;
        }

        // Normalize for frontend
        $store = [
            'store_name' => $settings['store_name'] ?? 'TrustedMart',
            'store_logo' => $settings['store_logo'] ?? null,
            'contact_email' => $settings['contact_email'] ?? '',
            'contact_phone' => $settings['contact_phone'] ?? '',
            'address' => $settings['store_address'] ?? $settings['address'] ?? '',
            'shipping_zones' => $shippingZones ?? [['zone'=>'Inside Dhaka','rate'=>5],['zone'=>'Outside Dhaka','rate'=>15]],
            'tax_settings' => $taxSettings ?? ['rate'=> (float)($settings['tax_rate'] ?? 0), 'inclusive'=> (bool)($settings['tax_inclusive'] ?? false)],
            'tax_rate' => $settings['tax_rate'] ?? '0',
            'tax_inclusive' => $settings['tax_inclusive'] ?? '0',
        ];

        $mail = [
            'mail_mailer' => $settings['mail_mailer'] ?? config('mail.default', 'smtp'),
            'mail_host' => $settings['mail_host'] ?? config('mail.mailers.smtp.host', 'smtp.gmail.com'),
            'mail_port' => (string)($settings['mail_port'] ?? config('mail.mailers.smtp.port', '587')),
            'mail_username' => $settings['mail_username'] ?? config('mail.mailers.smtp.username', ''),
            'mail_password' => $settings['mail_password'] ?? config('mail.mailers.smtp.password', ''),
            'mail_encryption' => $settings['mail_encryption'] ?? (config('mail.mailers.smtp.scheme') === 'smtps' ? 'ssl' : (config('mail.mailers.smtp.scheme') ?: 'tls')),
            'mail_from_address' => $settings['mail_from_address'] ?? config('mail.from.address', 'mahmudsets@gmail.com'),
            'mail_from_name' => $settings['mail_from_name'] ?? config('mail.from.name', 'TrustedMart'),
        ];

        // Admin users: role admin or has spatie role
        $users = User::with('roles')->orderBy('name')->get()->map(function($u){
            return [
                'id' => $u->id,
                'name' => $u->name,
                'email' => $u->email,
                'role' => $u->role,
                'roles' => $u->roles->pluck('name'),
                'phone' => $u->phone,
                'is_blocked' => (bool)($u->is_blocked ?? false),
                'created_at' => $u->created_at,
            ];
        });

        $roles = Role::select('id','name')->orderBy('name')->get();
        $mailLogs = \App\Models\MailLog::latest()->take(20)->get();

        return Inertia::render('Admin/Settings/Index', [
            'settings' => $store,
            'mailSettings' => $mail,
            'mailLogs' => $mailLogs,
            'rawSettings' => $settings,
            'users' => $users,
            'roles' => $roles,
        ]);
    }

    public function update(Request $request)
    {
        $data = $request->validate([
            'store_name' => 'required|string|max:255',
            'contact_email' => 'required|email|max:255',
            'contact_phone' => 'nullable|string|max:50',
            'store_address' => 'nullable|string|max:500',
            'address' => 'nullable|string|max:500',
            'shipping_zones' => 'nullable',
            'shipping_zones_json' => 'nullable|string',
            'tax_rate' => 'nullable|numeric|min:0|max:100',
            'tax_inclusive' => 'nullable|boolean',
            'tax_settings' => 'nullable',
            'logo' => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:2048',
        ]);

        // Handle logo upload
        if ($request->hasFile('logo')) {
            $file = $request->file('logo');
            $filename = 'logo_'.time().'.'.$file->getClientOriginalExtension();
            $path = $file->storeAs('settings', $filename, 'public');
            $url = '/storage/'.$path;
            StoreSetting::updateOrInsert(['key'=>'store_logo'], ['value'=>$url, 'created_at'=>now(),'updated_at'=>now()]);
        }

        StoreSetting::updateOrInsert(['key'=>'store_name'], ['value'=>$data['store_name'], 'created_at'=>now(),'updated_at'=>now()]);
        StoreSetting::updateOrInsert(['key'=>'contact_email'], ['value'=>$data['contact_email'], 'created_at'=>now(),'updated_at'=>now()]);
        if (isset($data['contact_phone'])) {
            StoreSetting::updateOrInsert(['key'=>'contact_phone'], ['value'=>$data['contact_phone'], 'created_at'=>now(),'updated_at'=>now()]);
        }
        $addr = $data['store_address'] ?? $data['address'] ?? null;
        if ($addr !== null) {
            StoreSetting::updateOrInsert(['key'=>'store_address'], ['value'=>$addr, 'created_at'=>now(),'updated_at'=>now()]);
        }

        // Shipping zones: accept array or json string
        $zones = $data['shipping_zones'] ?? null;
        if (isset($data['shipping_zones_json'])) {
            $zones = json_decode($data['shipping_zones_json'], true) ?? $zones;
        }
        if (is_string($zones)) {
            $decoded = json_decode($zones, true);
            if (json_last_error()===JSON_ERROR_NONE) $zones = $decoded;
        }
        if ($zones !== null) {
            // Normalize to array of {zone, rate} or {name, rate, type}
            if (is_array($zones)) {
                // validate each
                $normalized = [];
                foreach ($zones as $z) {
                    if (!is_array($z)) continue;
                    $name = $z['zone'] ?? $z['name'] ?? $z['title'] ?? null;
                    if (!$name) continue;
                    $rate = $z['rate'] ?? $z['cost'] ?? $z['price'] ?? 0;
                    $type = $z['type'] ?? 'flat';
                    $normalized[] = ['zone'=>$name, 'rate'=> (float)$rate, 'type'=>$type];
                }
                StoreSetting::updateOrInsert(['key'=>'shipping_zones'], ['value'=> json_encode($normalized), 'created_at'=>now(),'updated_at'=>now()]);
                // also keep legacy keys for BC
                StoreSetting::updateOrInsert(['key'=>'shipping_settings'], ['value'=> json_encode(['zones'=>$normalized]), 'created_at'=>now(),'updated_at'=>now()]);
            }
        }

        // Tax settings
        $rate = $data['tax_rate'] ?? null;
        if (isset($data['tax_settings']) && is_array($data['tax_settings'])) {
            $rate = $data['tax_settings']['rate'] ?? $rate;
            $inclusive = $data['tax_settings']['inclusive'] ?? $data['tax_inclusive'] ?? false;
        } else {
            $inclusive = $data['tax_inclusive'] ?? false;
        }
        if ($rate !== null) {
            // normalize 0-100 -> if >1 treat as percent, store as 0-1 or percent? CartController expects 0.xxx? It handles both but we store as provided fraction? Store as raw 0.xxx if user enters 8 meaning 8% we store 0.08? Let's store as provided and Cart will handle rate/100 if >1? Simpler store as fraction: if rate >1 then /100
            $storeRate = (float)$rate;
            // If user enters 8, we want 8% = 0.08 ; cart's taxRate() returns either numeric directly, but default 0.08. If we store 8, cart would do 8* subtotal => huge. So normalize: if >1 then /100
            if ($storeRate > 1) $storeRate = $storeRate / 100;
            // but to keep display, store original percent? We'll store fraction string
            StoreSetting::updateOrInsert(['key'=>'tax_rate'], ['value'=> (string)$storeRate, 'created_at'=>now(),'updated_at'=>now()]);
            StoreSetting::updateOrInsert(['key'=>'tax_inclusive'], ['value'=> $inclusive ? '1':'0', 'created_at'=>now(),'updated_at'=>now()]);
            StoreSetting::updateOrInsert(['key'=>'tax_settings'], ['value'=> json_encode(['rate'=>$storeRate, 'inclusive'=> (bool)$inclusive]), 'created_at'=>now(),'updated_at'=>now()]);
        } elseif (isset($inclusive)) {
            StoreSetting::updateOrInsert(['key'=>'tax_inclusive'], ['value'=> $inclusive ? '1':'0', 'created_at'=>now(),'updated_at'=>now()]);
        }

        return back()->with('success','Store settings updated.');
    }

    // --- User management ---
    public function storeUser(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|email|max:255|unique:users,email',
            'password' => 'required|string|min:8|max:100',
            'role' => 'nullable|string|exists:roles,name',
            'roles' => 'nullable|array',
            'roles.*' => 'string|exists:roles,name',
            'phone' => 'nullable|string|max:50',
        ]);

        $user = User::create([
            'name' => $data['name'],
            'email' => $data['email'],
            'password' => Hash::make($data['password']),
            'role' => 'admin',
            'phone' => $data['phone'] ?? null,
        ]);

        $rolesToAssign = $data['roles'] ?? (isset($data['role']) ? [$data['role']] : ['Staff']);
        try {
            $user->assignRole($rolesToAssign);
        } catch (\Throwable $e) {
            // fallback to role column only
        }

        return back()->with('success','Admin user created.');
    }

    public function updateUser(Request $request, User $user)
    {
        $data = $request->validate([
            'name' => 'required|string|max:255',
            'email' => ['required','email','max:255', Rule::unique('users','email')->ignore($user->id)],
            'password' => 'nullable|string|min:8|max:100',
            'role' => 'nullable|string|exists:roles,name',
            'roles' => 'nullable|array',
            'roles.*' => 'string|exists:roles,name',
            'phone' => 'nullable|string|max:50',
            'is_blocked' => 'nullable|boolean',
        ]);

        $user->name = $data['name'];
        $user->email = $data['email'];
        if (!empty($data['password'])) $user->password = Hash::make($data['password']);
        if (isset($data['phone'])) $user->phone = $data['phone'];
        if (isset($data['is_blocked'])) $user->is_blocked = (bool)$data['is_blocked'];
        $user->save();

        $rolesToSync = $data['roles'] ?? (isset($data['role']) ? [$data['role']] : null);
        if ($rolesToSync !== null) {
            try { $user->syncRoles($rolesToSync); } catch (\Throwable $e) {}
            // also keep legacy column for first role
            $user->role = $rolesToSync[0] ?? $user->role;
            $user->save();
        }

        return back()->with('success','User updated.');
    }

    public function destroyUser(User $user)
    {
        if ($user->id === auth()->id()) {
            return back()->with('error','You cannot delete your own account.');
        }
        $user->delete();
        return back()->with('success','User deleted.');
    }

    public function updateMail(Request $request)
    {
        $data = $request->validate([
            'mail_mailer' => 'required|string|in:smtp,log,sendmail',
            'mail_host' => 'required|string|max:255',
            'mail_port' => 'required|numeric|min:1|max:65535',
            'mail_username' => 'nullable|string|max:255',
            'mail_password' => 'nullable|string|max:255',
            'mail_encryption' => 'nullable|string|in:tls,ssl,none',
            'mail_from_address' => 'required|email|max:255',
            'mail_from_name' => 'required|string|max:255',
        ]);

        foreach ($data as $k => $v) {
            StoreSetting::updateOrInsert(
                ['key' => $k],
                ['value' => $v ?? '', 'updated_at' => now(), 'created_at' => now()]
            );
        }

        // Apply immediately to current runtime
        Config::set('mail.default', $data['mail_mailer']);
        Config::set('mail.mailers.smtp.host', $data['mail_host']);
        Config::set('mail.mailers.smtp.port', (int)$data['mail_port']);
        Config::set('mail.mailers.smtp.username', $data['mail_username'] ?: null);
        Config::set('mail.mailers.smtp.password', $data['mail_password'] ?: null);
        Config::set('mail.mailers.smtp.scheme', $data['mail_encryption'] === 'ssl' ? 'smtps' : null);
        Config::set('mail.from.address', $data['mail_from_address']);
        Config::set('mail.from.name', $data['mail_from_name']);

        // Sync to .env file for queue workers and artisan
        $this->updateEnv([
            'MAIL_MAILER' => $data['mail_mailer'],
            'MAIL_HOST' => $data['mail_host'],
            'MAIL_PORT' => $data['mail_port'],
            'MAIL_USERNAME' => $data['mail_username'] ?? '',
            'MAIL_PASSWORD' => $data['mail_password'] ?? '',
            'MAIL_SCHEME' => ($data['mail_encryption'] === 'ssl' ? 'smtps' : ''),
            'MAIL_FROM_ADDRESS' => $data['mail_from_address'],
            'MAIL_FROM_NAME' => $data['mail_from_name'],
        ]);

        // Purge mailer cache so fresh transport is initialized
        Mail::purge();

        return back()->with('success', 'SMTP / Mail configuration successfully saved.');
    }

    public function sendTestMail(Request $request)
    {
        $data = $request->validate([
            'test_email' => 'required|email|max:255',
        ]);

        $recipient = $data['test_email'];
        $mailer = config('mail.default', 'smtp');

        try {
            Mail::purge();

            $mailInstance = Mail::mailer($mailer);
            $fromAddr = config('mail.from.address', 'support@trustedmart.com');
            $fromName = config('mail.from.name', 'TrustedMart');

            $body = "Hello!\n\n" .
                    "This is an automated test email sent from TrustedMart to verify your SMTP email setup.\n\n" .
                    "--------------------------------------------------\n" .
                    "Mailer Transport: " . strtoupper($mailer) . "\n" .
                    "SMTP Host: " . config('mail.mailers.smtp.host', 'N/A') . "\n" .
                    "SMTP Port: " . config('mail.mailers.smtp.port', 'N/A') . "\n" .
                    "From: {$fromName} <{$fromAddr}>\n" .
                    "Timestamp: " . now()->toDateTimeString() . "\n" .
                    "--------------------------------------------------\n\n" .
                    "If you received this email, your outgoing SMTP email sending feature is functioning perfectly!\n\n" .
                    "— TrustedMart Engineering";

            $mailSubject = "✅ [{$fromName}] SMTP Test Email Successful (" . now()->format('H:i:s') . ")";

            $mailInstance->raw($body, function ($msg) use ($recipient, $mailSubject) {
                $msg->to($recipient)
                    ->subject($mailSubject);
            });

            \App\Models\MailLog::record(
                'test_mail',
                'outgoing',
                $fromAddr,
                $recipient,
                $mailSubject,
                $body,
                'sent'
            );

            return back()->with('success', "Test email was sent successfully to {$recipient} via {$mailer}!");
        } catch (\Throwable $e) {
            Log::error('SMTP Test Mail Failed: ' . $e->getMessage());
            \App\Models\MailLog::record(
                'test_mail',
                'outgoing',
                $fromAddr ?? 'support@trustedmart.com',
                $recipient,
                $mailSubject ?? 'SMTP Test Email',
                $body ?? 'SMTP Test',
                'failed',
                $e->getMessage()
            );
            return back()->with('error', 'SMTP Connection Error: ' . $e->getMessage());
        }
    }

    protected function updateEnv(array $values)
    {
        $envPath = base_path('.env');
        if (!file_exists($envPath)) return;

        $content = file_get_contents($envPath);
        foreach ($values as $key => $val) {
            $val = (string)$val;
            $quoted = (str_contains($val, ' ') || empty($val)) ? "\"{$val}\"" : $val;
            if (preg_match("/^{$key}=.*/m", $content)) {
                $content = preg_replace("/^{$key}=.*/m", "{$key}={$quoted}", $content);
            } else {
                $content .= "\n{$key}={$quoted}";
            }
        }
        file_put_contents($envPath, $content);
    }
}
