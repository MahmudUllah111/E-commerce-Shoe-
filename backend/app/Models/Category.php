<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Support\Str;

class Category extends Model
{
    use SoftDeletes;
    protected $fillable = ['name','slug','description','parent_id','image','is_active'];
    protected $casts = ['is_active'=>'boolean'];

    public function parent() { return $this->belongsTo(Category::class, 'parent_id'); }
    public function children() { return $this->hasMany(Category::class, 'parent_id'); }
    public function products() { return $this->hasMany(Product::class); }
    public function attributes() { return $this->belongsToMany(Attribute::class, 'category_attribute'); }

    protected static function booted() {
        static::creating(function($m){ if(empty($m->slug)) $m->slug = Str::slug($m->name); });
    }
}
