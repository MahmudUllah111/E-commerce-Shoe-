<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Address extends Model {
    protected $fillable = ['user_id','label','street','city','state','zip','country','is_default'];
    protected $casts = ['is_default'=>'boolean'];
    public function user(){ return $this->belongsTo(User::class); }
}
