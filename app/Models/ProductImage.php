<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ProductImage extends Model {
    protected $fillable = ['product_id','image_url','url','is_primary','display_order'];
    protected $casts = ['is_primary'=>'boolean'];
    public function product(){ return $this->belongsTo(Product::class); }
}
