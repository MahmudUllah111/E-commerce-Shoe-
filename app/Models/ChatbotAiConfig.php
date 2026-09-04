<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Facades\Crypt;
use Illuminate\Support\Facades\DB;

class ChatbotAiConfig extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'provider',
        'api_url',
        'api_key',
        'model_name',
        'temperature',
        'max_tokens',
        'is_active',
        'is_enabled',
        'last_tested_at',
        'last_test_status',
        'last_test_message',
    ];

    protected $casts = [
        'temperature' => 'float',
        'max_tokens' => 'integer',
        'is_active' => 'boolean',
        'is_enabled' => 'boolean',
        'last_tested_at' => 'datetime',
    ];

    protected $appends = ['masked_key', 'is_configured'];

    // Automatically encrypt api_key when setting
    public function setApiKeyAttribute($value)
    {
        if (!empty($value)) {
            $this->attributes['api_key'] = Crypt::encryptString(trim($value));
        }
    }

    // Safely decrypt api_key when retrieving for server-side API call
    public function getDecryptedApiKey(): ?string
    {
        if (empty($this->attributes['api_key'])) {
            return null;
        }

        try {
            return Crypt::decryptString($this->attributes['api_key']);
        } catch (\Throwable $e) {
            return null;
        }
    }

    // Masked key for safe admin UI display
    public function getMaskedKeyAttribute(): string
    {
        $raw = $this->getDecryptedApiKey();
        if (!$raw) {
            return 'Not Set';
        }
        $len = strlen($raw);
        if ($len <= 8) {
            return str_repeat('•', max(4, $len));
        }
        return substr($raw, 0, 3) . str_repeat('•', 8) . substr($raw, -4);
    }

    public function getIsConfiguredAttribute(): bool
    {
        return !empty($this->attributes['api_key']);
    }

    // Set this config as the single active configuration
    public function makeActive(): bool
    {
        return DB::transaction(function () {
            static::query()->update(['is_active' => false]);
            $this->is_active = true;
            $this->is_enabled = true;
            return $this->save();
        });
    }

    public function scopeActive($query)
    {
        return $query->where('is_active', true)->where('is_enabled', true);
    }
}
