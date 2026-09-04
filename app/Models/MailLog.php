<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class MailLog extends Model
{
    protected $fillable = [
        'type',
        'direction',
        'from_email',
        'to_email',
        'subject',
        'body',
        'status',
        'error_message',
    ];

    public static function record(string $type, string $direction, string $from, string $to, string $subject, string $body, string $status = 'sent', ?string $errorMessage = null): self
    {
        try {
            return self::create([
                'type' => $type,
                'direction' => $direction,
                'from_email' => $from,
                'to_email' => $to,
                'subject' => $subject,
                'body' => $body,
                'status' => $status,
                'error_message' => $errorMessage,
            ]);
        } catch (\Throwable $e) {
            \Illuminate\Support\Facades\Log::warning('Failed to write to mail_logs: ' . $e->getMessage());
            return new self();
        }
    }
}
