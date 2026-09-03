<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Str;
use Spatie\Permission\Models\Role;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {
        // Roles
        foreach (['Super Admin','Manager','Staff'] as $r) {
            Role::firstOrCreate(['name'=>$r, 'guard_name'=>'web']);
        }

        // Admin / demo customer
        DB::table('users')->updateOrInsert(
            ['email' => 'admin@trustedmart.com'],
            [
                'name' => 'Store Administrator',
                'password' => Hash::make('admin123'),
                'role' => 'admin',
                'phone' => '+1234567890',
                'address' => 'Central Hub, TrustedMart HQ',
                'city' => 'Dhaka',
                'postal_code' => '1230',
                'created_at' => now(),
                'updated_at' => now(),
            ]
        );
        $admin = \App\Models\User::where('email','admin@trustedmart.com')->first();
        if ($admin) { try { $admin->assignRole('Super Admin'); } catch(\Throwable $e){} }

        DB::table('users')->updateOrInsert(
            ['email'=>'mahmud@gmail.com'],
            ['name'=>'Mahmud','password'=>Hash::make('password123'),'role'=>'customer','phone'=>'+8801000000000','address'=>'Road 10','city'=>'Dhaka','postal_code'=>'1207','created_at'=>now(),'updated_at'=>now()]
        );
        DB::table('users')->updateOrInsert(
            ['email'=>'customer@trustedmart.com'],
            ['name'=>'Demo Customer','password'=>Hash::make('password123'),'role'=>'customer','phone'=>'+8801000000001','address'=>'House 12','city'=>'Dhaka','postal_code'=>'1206','created_at'=>now(),'updated_at'=>now()]
        );

        // Categories
        $cats = [
            ['name'=>'Sneakers','slug'=>'sneakers'],
            ['name'=>'Sports','slug'=>'sports'],
            ['name'=>'Formals','slug'=>'formals'],
            ['name'=>'Casuals','slug'=>'casuals'],
        ];
        foreach ($cats as $c) {
            DB::table('categories')->updateOrInsert(['slug'=>$c['slug']], array_merge($c, ['description'=>$c['name'].' collection','is_active'=>true,'created_at'=>now(),'updated_at'=>now()]));
        }
        $catIds = DB::table('categories')->pluck('id','slug');

        // Brands
        $brands = [
            ['name'=>'Nike','slug'=>'nike'],
            ['name'=>'Adidas','slug'=>'adidas'],
            ['name'=>'Puma','slug'=>'puma'],
            ['name'=>'Bata','slug'=>'bata'],
            ['name'=>'Apex','slug'=>'apex'],
        ];
        foreach ($brands as $b) {
            DB::table('brands')->updateOrInsert(['slug'=>$b['slug']], array_merge($b, ['logo'=>null,'is_active'=>true,'created_at'=>now(),'updated_at'=>now()]));
        }
        $brandIds = DB::table('brands')->pluck('id','slug');

        // Attributes
        $sizeAttr = DB::table('attributes')->updateOrInsert(['slug'=>'size'], ['name'=>'Size','slug'=>'size','created_at'=>now(),'updated_at'=>now()]);
        $sizeId = DB::table('attributes')->where('slug','size')->value('id');
        $colorAttr = DB::table('attributes')->updateOrInsert(['slug'=>'color'], ['name'=>'Color','slug'=>'color','created_at'=>now(),'updated_at'=>now()]);
        $colorId = DB::table('attributes')->where('slug','color')->value('id');
        foreach (['6','7','8','9','10','11'] as $i=>$v) {
            DB::table('attribute_values')->updateOrInsert(['attribute_id'=>$sizeId,'value'=>$v],[ 'display_order'=>$i, 'created_at'=>now(),'updated_at'=>now()]);
        }
        foreach (['Black','White','Red','Blue'] as $i=>$v) {
            DB::table('attribute_values')->updateOrInsert(['attribute_id'=>$colorId,'value'=>$v],[ 'display_order'=>$i, 'created_at'=>now(),'updated_at'=>now()]);
        }

        // Assign attributes to categories
        foreach ($catIds as $cid) {
            DB::table('category_attribute')->updateOrInsert(['category_id'=>$cid,'attribute_id'=>$sizeId],['created_at'=>now(),'updated_at'=>now()]);
            DB::table('category_attribute')->updateOrInsert(['category_id'=>$cid,'attribute_id'=>$colorId],['created_at'=>now(),'updated_at'=>now()]);
        }

        // Products — 20 sample with distinct images & rich variations
        // Curated Unsplash shoe images (100% real footwear, running shoes, sneakers, leather dress shoes)
        $shoeImages = [
            'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=700&auto=format&fit=crop&q=80', // Red Nike Air Max runner
            'https://images.unsplash.com/photo-1608231387042-66d1773070a5?w=700&auto=format&fit=crop&q=80', // White Puma sneaker
            'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=700&auto=format&fit=crop&q=80', // Nike Air modern street sneaker
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700&auto=format&fit=crop&q=80', // Nike Air Jordan sneaker
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=700&auto=format&fit=crop&q=80', // Bright green Nike zoom running shoe
            'https://images.unsplash.com/photo-1600185365483-26d7a4cc7519?w=700&auto=format&fit=crop&q=80', // Nike react sneaker white/black
            'https://images.unsplash.com/photo-1525966222134-fcfa99b8ae77?w=700&auto=format&fit=crop&q=80', // Vans classic checkerboard shoe
            'https://images.unsplash.com/photo-1551107696-a4b0c5a0d9a2?w=700&auto=format&fit=crop&q=80', // Adidas sneaker runner
            'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=700&auto=format&fit=crop&q=80', // Blue Nike running shoe
            'https://images.unsplash.com/photo-1603808033192-082d6919d3e1?w=700&auto=format&fit=crop&q=80', // Puma suede classic sneaker
            'https://images.unsplash.com/photo-1491553895911-0055eca6402d?w=700&auto=format&fit=crop&q=80', // Black Nike running athletic shoe
            'https://images.unsplash.com/photo-1511556820780-d912e42b4980?w=700&auto=format&fit=crop&q=80', // Nike high-top retro basketball sneaker
            'https://images.unsplash.com/photo-1577803645773-f96470509666?w=700&auto=format&fit=crop&q=80', // Salomon trail outdoor running shoe
            'https://images.unsplash.com/photo-1518002171953-a080ee817e1f?w=700&auto=format&fit=crop&q=80', // Adidas white Stan Smith tennis shoe
            'https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=700&auto=format&fit=crop&q=80', // Classic leather oxford formal shoe
            'https://images.unsplash.com/photo-1614252369475-531eba835eb1?w=700&auto=format&fit=crop&q=80', // Leather brogue formal dress shoe
            'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=700&auto=format&fit=crop&q=80', // Colorful designer athletic shoes
            'https://images.unsplash.com/photo-1515955656352-a1fa3ffcd111?w=700&auto=format&fit=crop&q=80', // Blue running shoe side profile
            'https://images.unsplash.com/photo-1575537302964-96cd47c06b1b?w=700&auto=format&fit=crop&q=80', // Modern sport athletic trainer
            'https://images.unsplash.com/photo-1582588678413-dbf45f4823e9?w=700&auto=format&fit=crop&q=80', // Red running trainers
        ];
        $secondaryImages = [
            'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1595950653106-6c9ebd614d3a?w=700&auto=format&fit=crop&q=80',
            'https://images.unsplash.com/photo-1600269452121-4f2416e55c28?w=700&auto=format&fit=crop&q=80',
        ];
        $colorHexMap = ['Black'=>'#111111','White'=>'#f8fafc','Red'=>'#dc2626','Blue'=>'#2563eb','Beige'=>'#d6c7b8','Brown'=>'#7c2d12'];
        $colorNames = array_keys($colorHexMap);

        // Update all existing products and images to ensure 100% active status and authentic shoe photography
        $existingProductIds = DB::table('products')->pluck('id')->toArray();
        if (!empty($existingProductIds)) {
            DB::table('products')->update(['status' => 'active']);
            foreach ($existingProductIds as $idx => $exId) {
                $pImg = $shoeImages[$idx % count($shoeImages)];
                $sImg = $shoeImages[($idx + 7) % count($shoeImages)];
                DB::table('product_images')->where('product_id', $exId)->delete();
                DB::table('product_images')->insert([
                    ['product_id'=>$exId,'image_url'=>$pImg,'url'=>$pImg,'is_primary'=>true,'display_order'=>0,'created_at'=>now(),'updated_at'=>now()],
                    ['product_id'=>$exId,'image_url'=>$sImg,'url'=>$sImg,'is_primary'=>false,'display_order'=>1,'created_at'=>now(),'updated_at'=>now()],
                ]);
            }
        }

        // Force reseed with distinct data if table has fewer than 20
        if (DB::table('products')->count() < 20) {
            $names = ['Air Max Pegasus','Ultraboost Runner','RS-X Street','Classic Leather','Formal Oxford Elite','Court Sneak','Trail Hiker Pro','Urban Glide','Speedster 500','Heritage Canvas','Zoom Fly Ease','Cloud Stride','Street Pulse','Apex Motion','Bata Comfit Walk','Puma Nitro Blaze','Adidas Grand Court','Nike Revolution Rise','Sparx FastLane','Lotto Trend'];
            $genders = ['Men','Women','Kids','Unisex'];
            $descriptions = [
                'Breathable engineered mesh with responsive foam for all-day cushioning.',
                'Premium leather upper with hand-stitched detailing and cushioned insole.',
                'Trail-ready grip with water-resistant overlay and rugged outsole.',
                'Lightweight knit upper with adaptive fit and energy return.',
                'Formal cap-toe with polished leather and comfortable arch support.',
            ];
            $materialsList = [
                'Engineered mesh upper, foam midsole, rubber outsole',
                'Full-grain leather, textile lining, EVA midsole',
                'Knit textile, TPU cage, Continental rubber',
                'Suede + mesh, Ortholite sockliner, durable outsole',
            ];
            $shuffledBrands = array_keys($brandIds->toArray());
            $shuffledCats = array_keys($catIds->toArray());
            for ($i=0; $i<20; $i++) {
                $brandSlug = $shuffledBrands[$i % count($shuffledBrands)];
                $catSlug = $shuffledCats[$i % count($shuffledCats)];
                $name = $names[$i] . ' ' . ($i+1);
                $slug = Str::slug($name).'-'.rand(100,999);
                $price = rand(6000,18000)/100; // 60-180 diverse
                $isFeatured = $i<4;
                $pid = DB::table('products')->insertGetId([
                    'name'=>$name,
                    'slug'=>$slug,
                    'brand_id'=>$brandIds[$brandSlug],
                    'category_id'=>$catIds[$catSlug],
                    'gender'=>$genders[$i % count($genders)],
                    'price'=>$price,
                    'original_price'=> $price + rand(800,4000)/100,
                    'base_price'=>$price,
                    'discount_price'=> ($i % 3 === 0) ? round($price*0.85,2) : null,
                    'sku'=>'SKU-'.strtoupper(Str::random(6)),
                    'status'=>'active',
                    'rating'=> rand(38,50)/10,
                    'reviews_count'=> rand(3,64),
                    'is_new'=> $i<6,
                    'is_featured'=> $isFeatured,
                    'description'=>$descriptions[$i % count($descriptions)] . ' Model '.$name.' crafted for '.$genders[$i % count($genders)].' — ideal for '.$catSlug.'.',
                    'materials'=>$materialsList[$i % count($materialsList)],
                    'care_instructions'=>'Wipe with soft cloth, air dry away from direct heat. Use shoe tree to retain shape.',
                    'created_at'=>now()->subDays(rand(0,30)),
                    'updated_at'=>now(),
                ]);
                // Primary + secondary images distinct per product
                $primaryImg = $shoeImages[$i % count($shoeImages)];
                $secondaryImg = $shoeImages[($i+7) % count($shoeImages)];
                DB::table('product_images')->insert([
                    ['product_id'=>$pid,'image_url'=>$primaryImg,'url'=>$primaryImg,'is_primary'=>true,'display_order'=>0,'created_at'=>now(),'updated_at'=>now()],
                    ['product_id'=>$pid,'image_url'=>$secondaryImg,'url'=>$secondaryImg,'is_primary'=>false,'display_order'=>1,'created_at'=>now(),'updated_at'=>now()],
                ]);
                // Rich variations: sizes 7-11 + 2 colors per product
                $chosenColors = array_rand(array_flip($colorNames), 2);
                if (!is_array($chosenColors)) $chosenColors = [$chosenColors];
                $sizes = ($catSlug === 'formals') ? ['7','8','9','10'] : ['7','8','9','10','11'];
                foreach ($sizes as $sz) {
                    foreach ($chosenColors as $col) {
                        // Limit to 6 variants per product (size x color combos) to avoid explosion
                        if (DB::table('product_variants')->where('product_id',$pid)->count() >= 6) break 2;
                        $vid = DB::table('product_variants')->insertGetId([
                            'product_id'=>$pid,'sku'=>'VAR-'.$pid.'-'.$sz.'-'.strtoupper(Str::slug($col)).'-'.Str::upper(Str::random(3)),'size_value'=>$sz,'color_name'=>$col,'color_hex'=>$colorHexMap[$col],'stock_quantity'=> rand(0,18),'low_stock_threshold'=>3,'price'=> (rand(0,1) ? null : round($price + rand(-500,800)/100,2)),'is_active'=>true,'created_at'=>now(),'updated_at'=>now()
                        ]);
                        // Link variant to attribute_values for filtering (Size + Color)
                        $sizeValId = DB::table('attribute_values')->where('attribute_id',$sizeId)->where('value',$sz)->value('id');
                        $colorValId = DB::table('attribute_values')->where('attribute_id',$colorId)->where('value',$col)->value('id');
                        if ($sizeValId) DB::table('variant_attribute_value')->updateOrInsert(['product_variant_id'=>$vid,'attribute_value_id'=>$sizeValId],['created_at'=>now(),'updated_at'=>now()]);
                        if ($colorValId) DB::table('variant_attribute_value')->updateOrInsert(['product_variant_id'=>$vid,'attribute_value_id'=>$colorValId],['created_at'=>now(),'updated_at'=>now()]);
                    }
                }
            }
        }

        // Coupons
        DB::table('coupons')->updateOrInsert(['code'=>'WELCOME10'], ['discount_type'=>'percentage','discount_value'=>10,'type'=>'percentage','value'=>10,'min_order_amount'=>100,'min_order_value'=>100,'usage_limit'=>500,'times_used'=>0,'is_active'=>true,'starts_at'=>now()->subDay(),'expires_at'=>now()->addMonths(2),'valid_until'=>now()->addMonths(2),'created_at'=>now(),'updated_at'=>now()]);
        DB::table('coupons')->updateOrInsert(['code'=>'FLAT15'], ['discount_type'=>'fixed','discount_value'=>15,'type'=>'fixed','value'=>15,'min_order_amount'=>80,'min_order_value'=>80,'usage_limit'=>200,'times_used'=>0,'is_active'=>true,'starts_at'=>now()->subDay(),'expires_at'=>now()->addMonth(),'valid_until'=>now()->addMonth(),'created_at'=>now(),'updated_at'=>now()]);

        // Static pages
        foreach ([
            ['slug'=>'about','title'=>'About Us','content'=>'<h1>About TrustedMart</h1><p>Modern footwear retail — craftsmanship, comfort, performance.</p>'],
            ['slug'=>'faq','title'=>'FAQ','content'=>'<h1>FAQ</h1><p>Shipping • Returns • Sizing</p>'],
            ['slug'=>'return-policy','title'=>'Return Policy','content'=>'<h1>Returns</h1><p>30-day returns on unworn shoes.</p>'],
            ['slug'=>'terms','title'=>'Terms & Conditions','content'=>'<p>Terms...</p>'],
            ['slug'=>'privacy','title'=>'Privacy Policy','content'=>'<p>Privacy...</p>'],
        ] as $p) {
            DB::table('static_pages')->updateOrInsert(['slug'=>$p['slug']], array_merge($p,['created_at'=>now(),'updated_at'=>now()]));
        }

        // Store settings
        foreach ([
            ['key'=>'store_name','value'=>'TrustedMart'],
            ['key'=>'contact_email','value'=>'mahmudsets@gmail.com'],
            ['key'=>'shipping_zones','value'=>json_encode([['zone'=>'Inside Dhaka','rate'=>5],['zone'=>'Outside Dhaka','rate'=>15]])],
            ['key'=>'tax_rate','value'=>'0'],
        ] as $s) {
            DB::table('store_settings')->updateOrInsert(['key'=>$s['key']], ['value'=>$s['value'],'created_at'=>now(),'updated_at'=>now()]);
        }
    }
}
