<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Update - TrustedMart</title>
    <style>
        body { margin: 0; padding: 0; background-color: #f8fafc; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; color: #1e293b; line-height: 1.5; }
        .wrapper { width: 100%; background-color: #f8fafc; padding: 24px 0; }
        .container { max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 16px; overflow: hidden; border: 1px solid #e2e8f0; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05); }
        .header { background-color: #0f172a; padding: 28px 32px; text-align: center; }
        .logo { font-size: 24px; font-weight: 900; letter-spacing: -0.5px; color: #ffffff; text-decoration: none; }
        .logo-rose { color: #e11d48; }
        .content { padding: 32px; }
        .headline { font-size: 22px; font-weight: 800; color: #0f172a; margin: 0 0 8px 0; }
        .subline { font-size: 14px; color: #64748b; margin: 0 0 24px 0; }
        .badge { display: inline-block; padding: 6px 12px; border-radius: 999px; font-size: 12px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; }
        .badge-pending { background-color: #fef3c7; color: #92400e; }
        .badge-shipped { background-color: #dbeafe; color: #1e40af; }
        .badge-delivered { background-color: #d1fae5; color: #065f46; }
        .badge-cancelled { background-color: #fee2e2; color: #991b1b; }
        .badge-refunded { background-color: #f3e8ff; color: #6b21a8; }
        .badge-processing { background-color: #e0e7ff; color: #3730a3; }
        .item { display: flex; gap: 12px; padding: 12px 0; border-bottom: 1px solid #f1f5f9; }
        .item:last-child { border-bottom: none; }
        .item-img { width: 56px; height: 56px; border-radius: 12px; background: #f8fafc; border: 1px solid #e2e8f0; object-fit: contain; }
        .item-name { font-weight: 700; font-size: 14px; color: #0f172a; }
        .item-meta { font-size: 12px; color: #64748b; margin-top: 2px; }
        .item-price { font-weight: 800; font-size: 14px; color: #0f172a; margin-left: auto; }
        .totals { margin-top: 24px; border-top: 2px solid #f1f5f9; padding-top: 16px; }
        .total-row { display: flex; justify-content: space-between; font-size: 14px; padding: 4px 0; }
        .total-row.grand { font-weight: 800; font-size: 16px; color: #0f172a; border-top: 1px solid #f1f5f9; padding-top: 8px; margin-top: 8px; }
        .note { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; margin-top: 20px; font-size: 14px; color: #334155; }
        .footer { text-align: center; padding: 24px 32px; font-size: 12px; color: #94a3b8; }
        .btn { display: inline-block; padding: 12px 24px; border-radius: 999px; background: #0f172a; color: #ffffff; text-decoration: none; font-weight: 700; font-size: 14px; margin-top: 16px; }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <div class="header">
                <div class="logo">TRUSTED<span class="logo-rose">MART</span></div>
            </div>
            <div class="content">
                <p class="headline">{{ ucfirst($status) }} Order #{{ $order->order_number }}</p>
                <p class="subline">Hi {{ $order->customer_name }}, here's an update on your order.</p>

                <div style="margin-bottom: 20px;">
                    <span class="badge badge-{{ $status }}">{{ ucfirst($status) }}</span>
                </div>

                <h3 style="font-size: 14px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.05em; color: #64748b; margin: 24px 0 8px 0;">Items</h3>
                @foreach($order->items as $it)
                    <div class="item">
                        <img src="{{ $it->product?->images?->firstWhere('is_primary', true)?->image_url ?? $it->product?->images?->first()?->image_url ?? '' }}" class="item-img" alt="">
                        <div>
                            <div class="item-name">{{ $it->product_name_snapshot ?? $it->product?->name }}</div>
                            <div class="item-meta">Size: {{ $it->size }} • Color: {{ $it->color }} • Qty: {{ $it->quantity }}</div>
                        </div>
                        <div class="item-price">${{ number_format(($it->unit_price ?? $it->price_snapshot) * $it->quantity, 2) }}</div>
                    </div>
                @endforeach

                <div class="totals">
                    <div class="total-row"><span>Subtotal</span><span>${{ number_format($order->subtotal, 2) }}</span></div>
                    @if(($order->discount_amount ?? 0) > 0)
                        <div class="total-row"><span>Discount{{ $order->coupon_code ? ' ('.$order->coupon_code.')' : '' }}</span><span style="color:#065f46;">- ${{ number_format($order->discount_amount, 2) }}</span></div>
                    @endif
                    <div class="total-row"><span>Shipping</span><span>${{ number_format($order->shipping_cost, 2) }}</span></div>
                    <div class="total-row"><span>Tax</span><span>${{ number_format($order->tax ?? $order->tax_amount ?? 0, 2) }}</span></div>
                    <div class="total-row grand"><span>Total</span><span>${{ number_format($order->total_amount ?? $order->total, 2) }}</span></div>
                </div>

                @if($note)
                    <div class="note">
                        <strong>Note:</strong> {{ $note }}
                    </div>
                @endif

                <div style="text-align: center; margin-top: 24px;">
                    <a href="{{ url('/track-order?order='.$order->order_number) }}" class="btn">Track Order</a>
                </div>
            </div>
            <div class="footer">
                TrustedMart — Need help? Contact us at {{ config('mail.from.address', 'support@trustedmart.com') }}
            </div>
        </div>
    </div>
</body>
</html>
