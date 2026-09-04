<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatbotConversation extends Model
{
    use HasFactory;

    protected $fillable = [
        'session_id',
        'user_id',
        'user_message',
        'bot_response',
        'source',
        'ai_config_id',
        'model_used',
        'is_unanswered',
        'is_fallback',
        'tokens_used',
        'response_time_ms',
        'error_message',
    ];

    protected $casts = [
        'is_unanswered' => 'boolean',
        'is_fallback' => 'boolean',
        'tokens_used' => 'integer',
        'response_time_ms' => 'integer',
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function aiConfig()
    {
        return $this->belongsTo(ChatbotAiConfig::class, 'ai_config_id');
    }
}
