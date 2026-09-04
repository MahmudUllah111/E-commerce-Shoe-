<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Attribute extends Model {
    protected $fillable = ['name','slug'];
    public function values(){ return $this->hasMany(AttributeValue::class); }
    public function categories(){ return $this->belongsToMany(Category::class, 'category_attribute'); }
}
