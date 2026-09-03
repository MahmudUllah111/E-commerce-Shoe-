<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Review extends Model {
    protected $fillable = ['product_id','user_id','author_name','user_name','rating','comment','status','is_approved','admin_reply','admin_reply_at'];
    protected $casts = ['is_approved'=>'boolean','rating'=>'integer','admin_reply_at'=>'datetime'];
    public function product(){ return $this->belongsTo(Product::class); }
    public function user(){ return $this->belongsTo(User::class); }
}
