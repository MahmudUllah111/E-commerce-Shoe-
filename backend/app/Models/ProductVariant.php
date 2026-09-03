<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class ProductVariant extends Model {
    protected $fillable = ['product_id','sku','size_value','color_name','color_hex','stock_quantity','low_stock_threshold','price','is_active'];
    protected $casts = ['is_active'=>'boolean','price'=>'decimal:2'];
    public function product(){ return $this->belongsTo(Product::class); }
    public function attributeValues(){ return $this->belongsToMany(AttributeValue::class, 'variant_attribute_value'); }
}
