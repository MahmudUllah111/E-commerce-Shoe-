<?php

namespace Database\Seeders;

use App\Models\ChatbotKnowledgeBase;
use Illuminate\Database\Seeder;

class ChatbotKnowledgeBaseSeeder extends Seeder
{
    public function run(): void
    {
        $entries = [
            [
                'category' => 'Shipping & Delivery',
                'question' => 'How long does delivery take in Bangladesh?',
                'answer' => "🚚 **Nationwide Delivery Timelines:**\n- **Inside Dhaka Metropolitan:** 24 to 48 hours.\n- **Outside Dhaka (all divisions & districts):** 3 to 5 business days via standard courier partners.\n- You will receive an SMS and email notification with live courier tracking once dispatched.",
                'keywords' => 'delivery time, shipping duration, how long, dhaka delivery, courier, delivery speed, arrival',
                'sort_order' => 1,
            ],
            [
                'category' => 'Shipping & Delivery',
                'question' => 'What are the delivery charges?',
                'answer' => "📦 **Shipping Charges:**\n- **Free Shipping** on all orders over **\$100**!\n- For orders under \$100, standard delivery is **\$5 inside Dhaka** and **\$8 nationwide**.",
                'keywords' => 'shipping cost, delivery fee, shipping charge, free shipping, shipping price',
                'sort_order' => 2,
            ],
            [
                'category' => 'Shipping & Delivery',
                'question' => 'How do I track my order?',
                'answer' => "🔍 You can track your order status anytime by visiting our [Track Order](/track-order) page! Just enter your order number (e.g., `#ORD-123456`) or tracking number. If you have an account, you can also view order status in your [Account Dashboard](/account/orders).",
                'keywords' => 'track order, track parcel, tracking status, where is my order, order lookup, track shipment',
                'sort_order' => 3,
            ],
            [
                'category' => 'Returns & Exchanges',
                'question' => 'What is your return and exchange policy?',
                'answer' => "🔄 **30-Day Hassle-Free Doorstep Exchange:**\n- You can return or exchange any footwear within **30 days** of delivery.\n- Shoes must be unworn outdoors with all original boxes, tags, and accessories intact.\n- Size swaps are complimentary: our delivery courier brings your new size and collects the old pair right at your doorstep!",
                'keywords' => 'return policy, exchange, size swap, return shoe, 30 day, exchange policy, refund guarantee',
                'sort_order' => 4,
            ],
            [
                'category' => 'Returns & Exchanges',
                'question' => 'How do I exchange my shoe size if it does not fit?',
                'answer' => "👟 **Easy 3-Step Size Exchange:**\n1. Reach out via our [Contact Us](/contact) page or email `support@trustedmart.com` with your Order ID and desired size.\n2. We verify stock and immediately dispatch your replacement size.\n3. Hand the original pair to the courier when your new pair arrives. No hassle!",
                'keywords' => 'change size, wrong size, shoe does not fit, exchange size, replacement size',
                'sort_order' => 5,
            ],
            [
                'category' => 'Returns & Exchanges',
                'question' => 'How long does a refund take?',
                'answer' => "💳 If you prefer a refund over an exchange, your payment will be refunded to your original payment method (bKash, Nagad, or Bank Card) within **3 to 5 business days** after our hub inspects the returned pair.",
                'keywords' => 'refund duration, how long refund, money back, refund time, return money',
                'sort_order' => 6,
            ],
            [
                'category' => 'Stock & Restock Alerts',
                'question' => 'What if a shoe size or color is out of stock?',
                'answer' => "🔔 **Automated Restock Alerts:**\nIf your desired size is sold out, click the **'Notify me when available'** button on the product page or in your [Wishlist](/wishlist). Enter your email, and our automated warehouse system will email you the exact moment that size is replenished!",
                'keywords' => 'out of stock, restock, sold out, notify me, back in stock, restock alert, unavailable size',
                'sort_order' => 7,
            ],
            [
                'category' => 'Payments & Checkout',
                'question' => 'Do you support Cash on Delivery (COD)?',
                'answer' => "💵 **Yes!** We provide full **Cash on Delivery (COD)** nationwide across Bangladesh. You can inspect the outer packaging and pay the courier cash when the package arrives.",
                'keywords' => 'cash on delivery, cod, pay on delivery, pay cash, cash payment',
                'sort_order' => 8,
            ],
            [
                'category' => 'Payments & Checkout',
                'question' => 'What digital payment methods do you accept?',
                'answer' => "🔒 In addition to Cash on Delivery, we accept:\n- **Mobile Banking:** bKash, Nagad\n- **Debit / Credit Cards:** Visa, MasterCard, American Express\n- All online transactions are protected by 256-bit SSL encryption.",
                'keywords' => 'payment method, bkash, nagad, visa, mastercard, card payment, credit card, pay online',
                'sort_order' => 9,
            ],
            [
                'category' => 'Payments & Checkout',
                'question' => 'How do I use a coupon or promo code?',
                'answer' => "🎁 During checkout on the [Checkout Page](/checkout), enter your promo code in the coupon field and click **'Apply'**. For new shoppers, try promo code **WELCOME10** for 10% off orders over \$100!",
                'keywords' => 'coupon, promo code, discount code, voucher, welcome10, promo discount',
                'sort_order' => 10,
            ],
            [
                'category' => 'Sizing & Authenticity',
                'question' => 'Are your shoes 100% genuine and authentic?',
                'answer' => "🛡️ **100% Genuine Guarantee:**\nTrustedMart partners exclusively with verified global brand distributors. Every single pair features genuine serial barcodes, original brand packaging, and is physically inspected prior to dispatch. Zero counterfeits tolerated.",
                'keywords' => 'authentic, genuine, real shoes, original, counterfeit, fake, quality',
                'sort_order' => 11,
            ],
            [
                'category' => 'Sizing & Authenticity',
                'question' => 'What sizing system do you use?',
                'answer' => "📏 All shoe sizes across our website are standard **US athletic footwear sizing**. If you are between sizes or buying running shoes, we generally recommend selecting a half size up for optimal comfort.",
                'keywords' => 'size chart, us size, sizing, fit, shoe size, what size',
                'sort_order' => 12,
            ],
            [
                'category' => 'Support & Store Location',
                'question' => 'Where is your store located?',
                'answer' => "📍 **Flagship Store & HQ:**\nHouse 24, Road 7, Dhanmondi, Dhaka 1205, Bangladesh.\n- **Showroom Hours:** Saturday to Thursday, 10:00 AM - 8:00 PM BST.\n- You are welcome to visit to try on shoes and get fitted by our specialists!",
                'keywords' => 'store location, address, showroom, office, visit store, location, dhanmondi, dhaka',
                'sort_order' => 13,
            ],
            [
                'category' => 'Support & Store Location',
                'question' => 'How do I contact customer support?',
                'answer' => "📞 **Reach Our Customer Care Team:**\n- **Phone Hotline:** +880 1700-000000 (9:00 AM - 9:00 PM BST, Daily)\n- **Direct Email:** `support@trustedmart.com`\n- **Online Portal:** [Contact Us](/contact) page\n- We respond to all email messages within 2 to 4 business hours!",
                'keywords' => 'contact support, contact us, customer care, email, phone number, call, help desk',
                'sort_order' => 14,
            ],
        ];

        foreach ($entries as $data) {
            ChatbotKnowledgeBase::updateOrCreate(
                ['question' => $data['question']],
                $data
            );
        }
    }
}
