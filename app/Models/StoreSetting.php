<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class StoreSetting extends Model {
    protected $fillable = ['key','value'];
    public static function get($key, $default=null){ return static::where('key',$key)->value('value') ?? $default; }
}
