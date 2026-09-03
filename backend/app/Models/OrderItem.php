<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class OrderItem extends Model {
    protected $fillable = ['order_id','product_id','product_variant_id','size','color','quantity','unit_price','product_name_snapshot','price_snapshot'];
    public function order(){ return $this->belongsTo(Order::class); }
    public function product(){ return $this->belongsTo(Product::class); }
    public function productVariant(){ return $this->belongsTo(ProductVariant::class, 'product_variant_id'); }
    public function variant(){ return $this->belongsTo(ProductVariant::class, 'product_variant_id'); }
}
