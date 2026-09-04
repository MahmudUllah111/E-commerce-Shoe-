<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;

class WishlistRequest extends Model
{
    protected $fillable = ['user_id','product_id','product_variant_id','preferred_size','preferred_color','email','status','notified_at'];
    protected $casts = ['notified_at'=>'datetime'];

    public function user(){ return $this->belongsTo(User::class); }
    public function product(){ return $this->belongsTo(Product::class); }
    public function variant(){ return $this->belongsTo(ProductVariant::class, 'product_variant_id'); }
}
