<!DOCTYPE html>
<html><head><meta charset="utf-8"><style>
body{font-family: DejaVu Sans, sans-serif; font-size:12px; color:#1e293b;}
.h1{font-size:20px; font-weight:900;}
.table{width:100%; border-collapse:collapse; margin-top:12px;}
.table th{background:#334155; color:#fff; padding:8px; text-align:left; font-size:11px;}
.table td{padding:8px; border-bottom:1px solid #e2e8f0;}
.badge{padding:4px 8px; background:#0f172a; color:#fff; border-radius:4px; font-size:10px; font-weight:900;}
.muted{color:#64748b;}
</style></head><body>
<div style="border-bottom:3px solid #0f172a; padding-bottom:10px; margin-bottom:14px;">
<div class="h1">PACKING SLIP</div>
<div class="muted">{{ $order->order_number }} • {{ $order->created_at->format('Y-m-d') }}</div>
</div>
<table style="width:100%"><tr>
<td style="width:60%"><strong>Ship To:</strong><br>{{ $order->customer_name }}<br>{{ $order->shipping_address }}<br>{{ $order->customer_phone }} • {{ $order->customer_email }}</td>
<td style="width:40%; text-align:right;"><span class="badge">{{ strtoupper($order->status) }}</span><div style="margin-top:6px;"><strong>Method:</strong> {{ $order->shipping_method }}</div><div><strong>Items:</strong> {{ $order->items->sum('quantity') }}</div></td>
</tr></table>

<table class="table">
<thead><tr><th>#</th><th>Product</th><th>Size / Color</th><th style="text-align:center;">Qty</th><th>SKU</th></tr></thead>
<tbody>
@foreach($order->items as $i=>$it)
<tr>
<td>{{ $i+1 }}</td>
<td>{{ $it->product_name_snapshot ?? $it->product?->name }}</td>
<td>{{ $it->size }} / {{ $it->color }}</td>
<td style="text-align:center; font-weight:900;">{{ $it->quantity }}</td>
<td style="font-family:monospace; font-size:11px;">{{ $it->productVariant?->sku ?? $it->product?->sku ?? '-' }}</td>
</tr>
@endforeach
</tbody>
</table>
<div style="margin-top:20px; border:1px dashed #94a3b8; padding:10px; font-size:11px;">
<strong>Instructions:</strong> Verify quantities before sealing. Include return slip if applicable.
</div>
</body></html>
