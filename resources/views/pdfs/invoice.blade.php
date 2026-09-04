<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body{font-family: DejaVu Sans, sans-serif; font-size:12px; color:#1e293b;}
.header{border-bottom:3px solid #0f172a; padding-bottom:12px; margin-bottom:16px;}
.h1{font-size:22px; font-weight:900; color:#0f172a;}
.muted{color:#64748b;}
.table{width:100%; border-collapse:collapse; margin-top:12px;}
.table th{background:#0f172a; color:#fff; padding:8px; text-align:left; font-size:11px; text-transform:uppercase;}
.table td{padding:8px; border-bottom:1px solid #e2e8f0;}
.total-box{float:right; width:260px; margin-top:16px;}
.total-box table{width:100%;}
.total-box td{padding:6px;}
.grand{font-weight:900; font-size:14px; border-top:2px solid #0f172a;}
</style></head><body>
<div class="header">
<table style="width:100%"><tr>
<td><div class="h1">TRUSTED<span style="color:#e11d48">MART</span></div><div class="muted">Invoice • {{ $order->order_number }}</div></td>
<td style="text-align:right"><div><strong>Date:</strong> {{ $order->created_at->format('Y-m-d H:i') }}</div><div><strong>Status:</strong> {{ ucfirst($order->status) }} • {{ ucfirst($order->payment_status) }}</div></td>
</tr></table>
</div>

<table style="width:100%"><tr>
<td style="width:50%; vertical-align:top;">
<h3 style="margin:0 0 6px;">Bill / Ship To</h3>
<div><strong>{{ $order->customer_name }}</strong></div>
<div>{{ $order->customer_email }} • {{ $order->customer_phone }}</div>
<div style="margin-top:6px;">{{ $order->shipping_address }}</div>
<div style="margin-top:4px;"><strong>Method:</strong> {{ $order->shipping_method }}</div>
</td>
<td style="width:50%; vertical-align:top; text-align:right;">
<div>TrustedMart Ltd.</div><div class="muted">Dhaka, Bangladesh</div><div class="muted">mahmudsets@gmail.com</div>
</td>
</tr></table>

<table class="table">
<thead><tr><th>#</th><th>Item</th><th>Variant</th><th style="text-align:center;">Qty</th><th style="text-align:right;">Unit</th><th style="text-align:right;">Total</th></tr></thead>
<tbody>
@foreach($order->items as $i => $it)
<tr>
<td>{{ $i+1 }}</td>
<td><strong>{{ $it->product_name_snapshot ?? $it->product?->name ?? 'Product' }}</strong></td>
<td>{{ $it->size }} / {{ $it->color }}</td>
<td style="text-align:center;">{{ $it->quantity }}</td>
<td style="text-align:right;">${{ number_format($it->unit_price ?? $it->price_snapshot ?? 0,2) }}</td>
<td style="text-align:right;">${{ number_format(($it->unit_price ?? $it->price_snapshot ?? 0) * $it->quantity,2) }}</td>
</tr>
@endforeach
</tbody>
</table>

<div class="total-box">
<table>
<tr><td>Subtotal</td><td style="text-align:right;">${{ number_format($order->subtotal,2) }}</td></tr>
<tr><td>Discount @if($order->coupon_code) ({{ $order->coupon_code }}) @endif</td><td style="text-align:right;">- ${{ number_format($order->discount_amount,2) }}</td></tr>
<tr><td>Shipping ({{ $order->shipping_method }})</td><td style="text-align:right;">${{ number_format($order->shipping_cost,2) }}</td></tr>
<tr><td>Tax</td><td style="text-align:right;">${{ number_format($order->tax ?? $order->tax_amount ?? 0,2) }}</td></tr>
<tr><td class="grand">Total</td><td class="grand" style="text-align:right;">${{ number_format($order->total_amount ?? $order->total,2) }}</td></tr>
<tr><td>Payment: {{ $order->payment_method }} ({{ $order->payment_status }})</td><td></td></tr>
</table>
</div>
<div style="clear:both; margin-top:60px; border-top:1px solid #e2e8f0; padding-top:8px; text-align:center;" class="muted">Thank you for shopping at TrustedMart • This is a computer-generated invoice.</div>
</body></html>
