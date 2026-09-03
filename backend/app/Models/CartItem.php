<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class CartItem extends Model {
    protected $fillable = ['cart_id','product_variant_id','quantity'];
    protected $casts = ['quantity'=>'integer'];
    public function cart(){ return $this->belongsTo(Cart::class); }
    public function variant(){ return $this->belongsTo(ProductVariant::class, 'product_variant_id'); }
    public function productVariant(){ return $this->belongsTo(ProductVariant::class, 'product_variant_id'); }
}
