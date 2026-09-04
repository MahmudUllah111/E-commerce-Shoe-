<?php

namespace Tests\Feature;

use Tests\TestCase;
use App\Models\User;
use App\Models\Product;
use App\Models\Order;
use App\Models\Address;
use App\Models\ContactQuery;
use App\Models\Cart;
use App\Models\CartItem;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Mail;

use Illuminate\Foundation\Testing\RefreshDatabase;
use DatabaseSeeder;

class StorefrontIntegrationTest extends TestCase
{
    use RefreshDatabase;

    protected function setUp(): void
    {
        parent::setUp();
        $this->seed(DatabaseSeeder::class);
    }

    public function test_contact_form_stores_inquiry_and_sends_email()
    {
        Mail::fake();

        $response = $this->post('/contact', [
            'name' => 'John Shopper',
            'email' => 'mahmudshuharto500@gmail.com',
            'subject' => 'Sneaker sizing question',
            'message' => 'Do your sneakers fit true to size or run small?',
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('contact_messages', [
            'email' => 'mahmudshuharto500@gmail.com',
            'subject' => 'Sneaker sizing question',
        ]);
    }

    public function test_admin_can_access_queries_panel()
    {
        $admin = User::where('email', 'admin@trustedmart.com')->first();
        $this->assertNotNull($admin);

        $response = $this->actingAs($admin)->get('/admin/queries');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => $page->component('Admin/Queries/Index'));
    }

    public function test_track_order_page_lookup()
    {
        $order = Order::firstOrCreate(
            ['order_number' => 'ORD-TEST-12345'],
            [
                'customer_name' => 'Demo Buyer',
                'customer_email' => 'customer@trustedmart.com',
                'customer_phone' => '+880170000000',
                'shipping_address' => 'Banani, Dhaka',
                'shipping_method' => 'Standard Shipping',
                'payment_method' => 'cod',
                'payment_status' => 'paid',
                'status' => 'processing',
                'subtotal' => 120.00,
                'total_amount' => 125.00,
            ]
        );

        $response = $this->get('/track-order?order=' . $order->order_number);
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) => 
            $page->component('Storefront/TrackOrder')
                 ->where('query', $order->order_number)
                 ->where('order.order_number', $order->order_number)
        );
    }

    public function test_stock_notify_saves_subscription()
    {
        Mail::fake();

        $product = Product::with('variants')->first();
        $variant = $product->variants->first();

        $response = $this->post('/stock-notifications', [
            'email' => 'mahmudshuharto500@gmail.com',
            'product_id' => $product->id,
            'variant_id' => $variant->id,
        ]);

        $response->assertSessionHas('success');
        $this->assertDatabaseHas('stock_notifications', [
            'email' => 'mahmudshuharto500@gmail.com',
            'variant_id' => $variant->id,
        ]);
    }

    public function test_checkout_page_loads_with_autofilled_customer_data()
    {
        $customer = User::where('email', 'customer@trustedmart.com')->first();
        $this->assertNotNull($customer);

        // Ensure customer has a default address
        Address::updateOrCreate(
            ['user_id' => $customer->id, 'is_default' => 1],
            ['label' => 'Home', 'street' => 'Banani Road 11', 'city' => 'Dhaka', 'state' => 'Dhaka', 'zip' => '1213', 'country' => 'Bangladesh']
        );

        $product = Product::with('variants')->first();
        $variant = $product->variants->first();

        // Add item to cart
        $cart = Cart::firstOrCreate(['user_id' => $customer->id]);
        CartItem::firstOrCreate(['cart_id' => $cart->id, 'product_variant_id' => $variant->id], ['quantity' => 1]);

        $response = $this->actingAs($customer)->get('/checkout');
        $response->assertStatus(200);
        $response->assertInertia(fn ($page) =>
            $page->component('Storefront/Checkout/Index')
                 ->has('addresses')
                 ->where('auth.user.email', $customer->email)
        );
    }

    public function test_product_detail_page_loads_successfully()
    {
        $product = Product::first();
        $this->assertNotNull($product);

        $responseSlug = $this->get("/product/{$product->slug}");
        $responseSlug->assertStatus(200);
        $responseSlug->assertInertia(fn ($page) =>
            $page->component('Storefront/Product/Show')
                 ->has('product')
                 ->where('product.id', $product->id)
        );

        $responseId = $this->get("/product/{$product->id}");
        $responseId->assertStatus(200);
    }

    public function test_order_confirmation_mail_renders_with_invoice_and_packing_slip_attachments()
    {
        $product = Product::first();
        $variant = $product->variants()->first();

        $order = Order::create([
            'order_number' => 'TM-TEST-001',
            'customer_name' => 'John Doe',
            'customer_email' => 'johndoe@example.com',
            'customer_phone' => '+1234567890',
            'shipping_address' => '123 Test Street, City, Country',
            'shipping_method' => 'Express Courier',
            'subtotal' => 120.00,
            'shipping_cost' => 10.00,
            'discount_amount' => 12.00,
            'tax_amount' => 5.00,
            'total_amount' => 123.00,
            'status' => 'processing',
            'payment_method' => 'cod',
            'payment_status' => 'unpaid',
        ]);

        $order->items()->create([
            'product_id' => $product->id,
            'product_variant_id' => $variant->id,
            'size' => $variant->size_value,
            'color' => $variant->color_name,
            'quantity' => 1,
            'unit_price' => 120.00,
            'product_name_snapshot' => $product->name,
            'price_snapshot' => 120.00,
        ]);

        $mailable = new \App\Mail\OrderConfirmationMail($order);
        $mailable->assertSeeInHtml($order->order_number);
        $mailable->assertSeeInHtml('Thank You for Your Order!');
        $mailable->assertSeeInHtml($product->name);

        $attachments = $mailable->attachments();
        $this->assertCount(2, $attachments);
    }

    public function test_customer_can_download_invoice_and_packing_slip()
    {
        $product = Product::first();
        $order = Order::create([
            'order_number' => 'TM-TEST-002',
            'customer_name' => 'Jane Doe',
            'customer_email' => 'janedoe@example.com',
            'customer_phone' => '+1234567890',
            'shipping_address' => '456 Test Ave',
            'shipping_method' => 'Standard',
            'subtotal' => 80.00,
            'shipping_cost' => 5.00,
            'total_amount' => 85.00,
            'status' => 'pending',
            'payment_method' => 'cod',
            'payment_status' => 'unpaid',
        ]);

        $resInvoice = $this->get("/orders/{$order->order_number}/invoice");
        $resInvoice->assertStatus(200);
        $this->assertEquals('application/pdf', $resInvoice->headers->get('content-type'));

        $resSlip = $this->get("/orders/{$order->order_number}/packing-slip");
        $resSlip->assertStatus(200);
        $this->assertEquals('application/pdf', $resSlip->headers->get('content-type'));
    }
}
