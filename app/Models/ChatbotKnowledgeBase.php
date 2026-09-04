<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class ChatbotKnowledgeBase extends Model
{
    use HasFactory;

    protected $fillable = [
        'category',
        'question',
        'answer',
        'keywords',
        'is_active',
        'sort_order',
        'hit_count',
    ];

    protected $casts = [
        'is_active' => 'boolean',
        'sort_order' => 'integer',
        'hit_count' => 'integer',
    ];

    public function scopeActive($query)
    {
        return $query->where('is_active', true);
    }

    public function incrementHit(): void
    {
        $this->increment('hit_count');
    }
}
