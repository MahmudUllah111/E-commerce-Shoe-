<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
class Coupon extends Model {
    protected $fillable = ['code','type','discount_type','value','discount_value','min_order_value','min_order_amount','usage_limit','times_used','starts_at','expires_at','valid_until','is_active'];
    protected $casts = ['is_active'=>'boolean','starts_at'=>'datetime','expires_at'=>'datetime'];
}
