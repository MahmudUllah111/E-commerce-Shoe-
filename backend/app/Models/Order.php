<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\SoftDeletes;
class Order extends Model {
    use SoftDeletes;
    protected $fillable = ['order_number','user_id','customer_name','customer_email','customer_phone','shipping_address','shipping_address_id','shipping_method','subtotal','shipping_cost','tax','tax_amount','total','total_amount','discount_amount','coupon_id','coupon_code','status','payment_method','payment_status'];
    protected $casts = ['subtotal'=>'decimal:2','total_amount'=>'decimal:2'];
    public function items(){ return $this->hasMany(OrderItem::class); }
    public function user(){ return $this->belongsTo(User::class); }
}
