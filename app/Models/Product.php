<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Product extends Model {
    use SoftDeletes;
    protected $fillable = ['name','slug','description','care_instructions','brand_id','category_id','gender','price','original_price','base_price','discount_price','sku','status','rating','reviews_count','is_new','is_featured','is_on_sale','materials'];
    protected $casts = ['price'=>'decimal:2','original_price'=>'decimal:2','rating'=>'decimal:1','is_new'=>'boolean','is_featured'=>'boolean','is_on_sale'=>'boolean'];
    protected $appends = ['material'];

    public function getMaterialAttribute(){ return $this->attributes['materials'] ?? null; }
    public function setMaterialAttribute($value){ $this->attributes['materials'] = $value; }

    public function brand(){ return $this->belongsTo(Brand::class); }
    public function category(){ return $this->belongsTo(Category::class); }
    public function images(){ return $this->hasMany(ProductImage::class); }
    public function variants(){ return $this->hasMany(ProductVariant::class); }
    public function reviews(){ return $this->hasMany(Review::class); }
    protected static function booted(){ static::creating(function($m){ if(empty($m->slug)) $m->slug = Str::slug($m->name).'-'.rand(100,999); }); }
}
