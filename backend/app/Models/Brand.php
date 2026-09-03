<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Support\Str;
class Brand extends Model {
    protected $fillable = ['name','slug','logo','is_active'];
    protected $casts = ['is_active'=>'boolean'];
    public function products(){ return $this->hasMany(Product::class); }
    protected static function booted(){ static::creating(fn($m)=> $m->slug = $m->slug ?: Str::slug($m->name)); }
}
