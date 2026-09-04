<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Order Confirmation - TrustedMart</title>
    <style>
        body {
            margin: 0;
            padding: 0;
            background-color: #f8fafc;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #1e293b;
            line-height: 1.5;
        }
        .wrapper {
            width: 100%;
            background-color: #f8fafc;
            padding: 24px 0;
        }
        .container {
            max-width: 600px;
            margin: 0 auto;
            background-color: #ffffff;
            border-radius: 16px;
            overflow: hidden;
            border: 1px solid #e2e8f0;
            box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
        }
        .header {
            background-color: #0f172a;
            padding: 28px 32px;
            text-align: center;
        }
        .logo {
            font-size: 24px;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #ffffff;
            text-decoration: none;
        }
        .logo-rose {
            color: #e11d48;
        }
        .content {
            padding: 32px;
        }
        .headline {
            font-size: 22px;
            font-weight: 800;
            color: #0f172a;
            margin: 0 0 8px 0;
        }
        .subline {
            font-size: 14px;
            color: #64748b;
            margin: 0 0 24px 0;
        }
        .note-box {
            background-color: #f0fdf4;
            border: 1px solid #bbf7d0;
            border-radius: 12px;
            padding: 14px 18px;
            margin-bottom: 24px;
            font-size: 13px;
            color: #166534;
            font-weight: 600;
        }
        .attach-box {
            background-color: #eff6ff;
            border: 1px solid #bfdbfe;
            border-radius: 12px;
            padding: 16px 20px;
            margin-bottom: 24px;
        }
        .attach-title {
            font-size: 13px;
            font-weight: 800;
            color: #1e40af;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            margin-bottom: 4px;
        }
        .attach-desc {
            font-size: 13px;
            color: #1e3a8a;
            margin: 0;
        }
        .order-card {
            background-color: #f8fafc;
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 20px;
            margin-bottom: 24px;
        }
        .card-row {
            display: table;
            width: 100%;
            margin-bottom: 12px;
        }
        .card-row:last-child {
            margin-bottom: 0;
        }
        .card-col {
            display: table-cell;
            width: 50%;
            vertical-align: top;
            font-size: 13px;
        }
        .card-label {
            font-size: 11px;
            font-weight: 700;
            text-transform: uppercase;
            color: #94a3b8;
            letter-spacing: 0.5px;
            margin-bottom: 2px;
        }
        .card-value {
            font-weight: 700;
            color: #0f172a;
        }
        .status-badge {
            display: inline-block;
            padding: 2px 10px;
            border-radius: 9999px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            background-color: #dbeafe;
            color: #1e40af;
        }
        .table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 24px;
        }
        .table th {
            text-align: left;
            padding: 10px 12px;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            color: #64748b;
            border-bottom: 2px solid #e2e8f0;
        }
        .table td {
            padding: 14px 12px;
            font-size: 13px;
            border-bottom: 1px solid #f1f5f9;
            vertical-align: middle;
        }
        .item-name {
            font-weight: 700;
            color: #0f172a;
            margin-bottom: 2px;
        }
        .item-variant {
            font-size: 11px;
            color: #64748b;
            font-weight: 600;
        }
        .totals-table {
            width: 100%;
            border-collapse: collapse;
            margin-top: 12px;
            margin-bottom: 24px;
        }
        .totals-table td {
            padding: 6px 12px;
            font-size: 13px;
        }
        .totals-label {
            text-align: right;
            color: #64748b;
            font-weight: 600;
            width: 75%;
        }
        .totals-val {
            text-align: right;
            font-weight: 700;
            color: #0f172a;
            width: 25%;
        }
        .total-grand-label {
            text-align: right;
            font-size: 16px;
            font-weight: 900;
            color: #0f172a;
            padding-top: 10px;
            border-top: 2px solid #0f172a;
        }
        .total-grand-val {
            text-align: right;
            font-size: 18px;
            font-weight: 900;
            color: #e11d48;
            padding-top: 10px;
            border-top: 2px solid #0f172a;
        }
        .btn-wrapper {
            text-align: center;
            margin: 28px 0;
        }
        .btn {
            display: inline-block;
            background-color: #0f172a;
            color: #ffffff !important;
            padding: 14px 32px;
            border-radius: 9999px;
            font-size: 14px;
            font-weight: 800;
            text-decoration: none;
            text-align: center;
            box-shadow: 0 4px 6px -1px rgba(15, 23, 42, 0.2);
        }
        .footer {
            background-color: #f8fafc;
            padding: 24px 32px;
            border-top: 1px solid #e2e8f0;
            text-align: center;
            font-size: 12px;
            color: #94a3b8;
        }
        .footer a {
            color: #64748b;
            text-decoration: underline;
        }
    </style>
</head>
<body>
    <div class="wrapper">
        <div class="container">
            <!-- Header -->
            <div class="header">
                <a href="{{ url('/') }}" class="logo">
                    TRUSTED<span class="logo-rose">MART</span>
                </a>
            </div>

            <!-- Content -->
            <div class="content">
                <h1 class="headline">Thank You for Your Order!</h1>
                <p class="subline">
                    Hello <strong>{{ $order->customer_name }}</strong>, we have successfully received your order and our team is preparing it for shipment.
                </p>

                @if(!empty($statusNote))
                <div class="note-box">
                    🔔 <strong>Status Update:</strong> {{ $statusNote }}
                </div>
                @endif

                <!-- Attachment Notice -->
                <div class="attach-box">
                    <div class="attach-title">📎 Attached Documents</div>
                    <p class="attach-desc">
                        For your convenience, your official <strong>Invoice PDF</strong> (<code>invoice-{{ $order->order_number }}.pdf</code>) and <strong>Warehouse Packing Slip</strong> (<code>packing-slip-{{ $order->order_number }}.pdf</code>) are generated and attached to this email.
                    </p>
                </div>

                <!-- Order Overview Card -->
                <div class="order-card">
                    <div class="card-row">
                        <div class="card-col">
                            <div class="card-label">Order Number</div>
                            <div class="card-value" style="font-family: monospace; font-size: 14px;">{{ $order->order_number }}</div>
                        </div>
                        <div class="card-col" style="text-align: right;">
                            <div class="card-label">Order Date</div>
                            <div class="card-value">{{ $order->created_at->format('M d, Y • h:i A') }}</div>
                        </div>
                    </div>
                    <div class="card-row" style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #e2e8f0;">
                        <div class="card-col">
                            <div class="card-label">Shipping Destination</div>
                            <div class="card-value" style="font-weight: 500;">
                                {{ $order->shipping_address }}<br>
                                <span style="font-size: 12px; color: #64748b;">Phone: {{ $order->customer_phone }}</span>
                            </div>
                        </div>
                        <div class="card-col" style="text-align: right;">
                            <div class="card-label">Delivery Method</div>
                            <div class="card-value">{{ $order->shipping_method }}</div>
                            <div style="margin-top: 6px;">
                                <span class="status-badge">{{ strtoupper($order->status) }}</span>
                            </div>
                        </div>
                    </div>
                </div>

                <!-- Itemized Products Table -->
                <table class="table">
                    <thead>
                        <tr>
                            <th>Shoe Details</th>
                            <th style="text-align: center;">Size / Color</th>
                            <th style="text-align: center;">Qty</th>
                            <th style="text-align: right;">Price</th>
                        </tr>
                    </thead>
                    <tbody>
                        @foreach($order->items as $item)
                        <tr>
                            <td>
                                <div class="item-name">{{ $item->product_name_snapshot ?? $item->product?->name ?? 'Footwear' }}</div>
                                <div class="item-variant">SKU: {{ $item->productVariant?->sku ?? $item->product?->sku ?? '-' }}</div>
                            </td>
                            <td style="text-align: center; font-weight: 600; color: #334155;">
                                US {{ $item->size }}<br>
                                <span style="font-size: 11px; color: #64748b;">{{ $item->color }}</span>
                            </td>
                            <td style="text-align: center; font-weight: 700; color: #0f172a;">
                                {{ $item->quantity }}
                            </td>
                            <td style="text-align: right; font-weight: 700; color: #0f172a;">
                                ${{ number_format(($item->unit_price ?? $item->price_snapshot ?? 0) * $item->quantity, 2) }}
                            </td>
                        </tr>
                        @endforeach
                    </tbody>
                </table>

                <!-- Financial Totals -->
                <table class="totals-table">
                    <tr>
                        <td class="totals-label">Subtotal:</td>
                        <td class="totals-val">${{ number_format($order->subtotal, 2) }}</td>
                    </tr>
                    @if((float)$order->discount_amount > 0)
                    <tr>
                        <td class="totals-label" style="color: #16a34a;">Discount @if($order->coupon_code) ({{ $order->coupon_code }}) @endif:</td>
                        <td class="totals-val" style="color: #16a34a;">- ${{ number_format($order->discount_amount, 2) }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td class="totals-label">Shipping ({{ $order->shipping_method }}):</td>
                        <td class="totals-val">${{ number_format($order->shipping_cost, 2) }}</td>
                    </tr>
                    @if((float)($order->tax ?? $order->tax_amount ?? 0) > 0)
                    <tr>
                        <td class="totals-label">Tax:</td>
                        <td class="totals-val">${{ number_format($order->tax ?? $order->tax_amount ?? 0, 2) }}</td>
                    </tr>
                    @endif
                    <tr>
                        <td class="total-grand-label">Grand Total:</td>
                        <td class="total-grand-val">${{ number_format($order->total_amount ?? $order->total, 2) }}</td>
                    </tr>
                    <tr>
                        <td colspan="2" style="text-align: right; font-size: 12px; color: #64748b; padding-top: 4px;">
                            Payment: <strong>{{ strtoupper($order->payment_method) }}</strong> ({{ strtoupper($order->payment_status) }})
                        </td>
                    </tr>
                </table>

                <!-- Action Button -->
                <div class="btn-wrapper">
                    <a href="{{ url('/track-order?order=' . $order->order_number) }}" class="btn">
                        📦 Live Order Tracking →
                    </a>
                </div>

                <p style="font-size: 13px; color: #64748b; text-align: center; margin-top: 24px;">
                    Have questions or need adjustments to your order? Feel free to reply directly to this email or contact us at <a href="mailto:{{ config('mail.from.address') }}" style="color: #e11d48; font-weight: 600;">{{ config('mail.from.address') }}</a>.
                </p>
            </div>

            <!-- Footer -->
            <div class="footer">
                <p style="margin: 0 0 6px 0; font-weight: 600; color: #64748b;">TrustedMart Footwear Retail</p>
                <p style="margin: 0;">Craftsmanship • Comfort • High-Performance Footwear</p>
                <p style="margin: 10px 0 0 0; font-size: 11px;">© {{ date('Y') }} TrustedMart. All rights reserved.</p>
            </div>
        </div>
    </div>
</body>
</html>

