<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class AttributeValue extends Model {
    protected $fillable = ['attribute_id','value','display_order'];
    public function attribute(){ return $this->belongsTo(Attribute::class); }
    public function variants(){ return $this->belongsToMany(ProductVariant::class, 'variant_attribute_value'); }
}
