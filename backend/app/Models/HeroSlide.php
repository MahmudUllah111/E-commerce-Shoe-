<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class HeroSlide extends Model
{
    protected $fillable = ['title','subtitle','badge','discount_badge','cta_text','cta_link','bg_image','shoe_image','sort_order','is_active'];
    protected $casts = ['is_active'=>'boolean'];
}
