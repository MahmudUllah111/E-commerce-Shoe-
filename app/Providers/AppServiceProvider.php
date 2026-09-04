<?php

namespace App\Providers;

use App\Models\StoreSetting;
use Illuminate\Support\Facades\Config;
use Illuminate\Support\Facades\Schema;
use Illuminate\Support\Facades\Vite;
use Illuminate\Support\ServiceProvider;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        Vite::prefetch(concurrency: 3);

        $this->configureMail();
    }

    protected function configureMail(): void
    {
        try {
            if (Schema::hasTable('store_settings')) {
                $settings = StoreSetting::whereIn('key', [
                    'mail_mailer',
                    'mail_host',
                    'mail_port',
                    'mail_username',
                    'mail_password',
                    'mail_encryption',
                    'mail_from_address',
                    'mail_from_name',
                ])->pluck('value', 'key');

                if ($settings->has('mail_mailer') && !empty($settings['mail_mailer'])) {
                    Config::set('mail.default', $settings['mail_mailer']);
                }

                if ($settings->has('mail_host') && !empty($settings['mail_host'])) {
                    Config::set('mail.mailers.smtp.host', $settings['mail_host']);
                }

                if ($settings->has('mail_port') && !empty($settings['mail_port'])) {
                    Config::set('mail.mailers.smtp.port', (int)$settings['mail_port']);
                }

                if ($settings->has('mail_username')) {
                    Config::set('mail.mailers.smtp.username', $settings['mail_username']);
                }

                if ($settings->has('mail_password')) {
                    Config::set('mail.mailers.smtp.password', $settings['mail_password']);
                }

                if ($settings->has('mail_encryption')) {
                    $enc = strtolower($settings['mail_encryption']);
                    $scheme = match ($enc) {
                        'ssl', 'smtps' => 'smtps',
                        'tls', 'starttls' => null,
                        'none', 'null', '' => null,
                        default => $enc,
                    };
                    Config::set('mail.mailers.smtp.scheme', $scheme);
                }

                if ($settings->has('mail_from_address') && !empty($settings['mail_from_address'])) {
                    Config::set('mail.from.address', $settings['mail_from_address']);
                }

                if ($settings->has('mail_from_name') && !empty($settings['mail_from_name'])) {
                    Config::set('mail.from.name', $settings['mail_from_name']);
                }
            }
        } catch (\Throwable $e) {
            // Silently ignore during migration or db disconnect
        }
    }
}
