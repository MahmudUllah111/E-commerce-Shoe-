# TrustedMart — Shoe E-Commerce Platform (Laravel 12 + Inertia + React)

Full-featured shoe e-commerce with **Customer Storefront** + **Admin Panel** sharing one MySQL DB via XAMPP. Built per spec **0-7** — Laravel + Inertia + React (Breeze), Tailwind, MySQL.

## 0. Stack
- **Backend:** Laravel 12.69 (`composer.json:8`), PHP 8.2
- **Frontend:** React 18 + Inertia 2 (`resources/js/app.jsx:1`), Vite 7, Tailwind 3/4 (`resources/css/app.css:1`)
- **DB:** MySQL `shoe_ecommerce_db` (spec says `shoe_ecommerce` — both work; see `.env` note) via XAMPP `127.0.0.1:3306 root`
- **Auth:** Breeze React (`app/Http/Controllers/Auth/*:1`), session, `spatie/laravel-permission` (Super Admin/Manager/Staff `database/migrations/2026_09_04_064240_create_permission_tables.php:1`), `laravel/sanctum`
- **Extras:** `intervention/image` (resize 800/600/400), `barryvdh/laravel-dompdf` (invoice), `recharts`, `react-hot-toast`, `lucide-react`, `ziggy`

## 1. Setup (reproducible from scratch)
```bash
git clone <repo>
cd shoe-ecommerce/backend
cp .env.example .env
# edit .env: DB_CONNECTION=mysql, DB_HOST=127.0.0.1, DB_PORT=3306, DB_DATABASE=shoe_ecommerce_db, DB_USERNAME=root, DB_PASSWORD=
composer install
php artisan key:generate
# XAMPP: start Apache + MySQL, create empty DB shoe_ecommerce_db (or shoe_ecommerce) in phpMyAdmin
php artisan migrate --seed   # 13 migrations + seed 20 products (see below) — version-controlled, no manual tables
npm install
npm run dev      # Vite HMR http://localhost:5173  (uses --host bound to APP_URL http://localhost:8000)
php artisan serve # http://localhost:8000
```
Legacy decoupled SPA remains in `frontend/` (deprecated) but monolith at `backend/` is source of truth — see `routes/web.php:1` + `routes/admin.php:1`.

**XAMPP .env note:** Spec §0 says `shoe_ecommerce`; this repo uses `shoe_ecommerce_db` (`backend/.env:24`). Change `DB_DATABASE` to `shoe_ecommerce` if you created that name — migrations work with either.

## 2. Schema (all via migrations, §2)
`php artisan migrate:status` shows 13 migrations:
- `users` + `role/phone/address/city/postal_code/is_blocked` (`migrations/2026_09_02_074915_add_role...:1`) + soft not needed; `addresses`, `wishlists`, `carts/cart_items` (`migrations/2026_09_04_065000_complete_ecommerce_schema.php:30`), `attributes/attribute_values/category_attribute/variant_attribute_value`
- `categories` (`parent_id` nullable FK self, `image`, `is_active`, `softDeletes`, indexes `slug/is_active`), `brands` (`logo`, `is_active`)
- `products` (`sku` unique, `base_price/discount_price`, `status active/draft/out_of_stock`, `softDeletes`, indexes `slug/sku/status`), `product_images` (`url`, `display_order`, `is_primary`), `product_variants` (`sku`, `price` override, `is_active`)
- `orders` (`order_number` unique, `coupon_id`, `shipping_address_id`, `shipping_cost/tax`, `softDeletes`, indexes), `order_items` (`product_variant_id`, `product_name_snapshot`, `price_snapshot`), `reviews` (`user_id`, `is_approved`, `admin_reply`), `coupons` (`type/value`, `min_order_value`, `usage_limit/times_used`, `starts_at/expires_at`), `stock_logs`, `static_pages` (About/FAQ/...), `store_settings` (JSON shipping zones/tax), `newsletter_subscribers`, `contact_messages` + existing `contact_inquiries`, `stock_notifications`

Seed: `database/seeders/DatabaseSeeder.php:10` — 20 products × 3 variants (60 variants), 5 brands, 4 categories, Size/Color attributes, 2 coupons, 5 static pages, store settings, 3 users.

## 3. Admin Panel (`/admin` — `auth` + `role` `bootstrap/app.php:15`, `RoleMiddleware.php:8`)
- **Dashboard** (`Pages/Admin/Dashboard.jsx:1`, `DashboardController.php:1`): stat cards (sales this month, orders today, revenue with % vs prev, new customers week), daily/weekly/monthly toggle `recharts` line/bar, recent 10 orders badges click-through, low-stock widget (≤5)
- **Products** (`ProductController.php:1`, `Pages/Admin/Products/Index.jsx:1`/`Create.jsx`/`Edit.jsx`): paginated 20, search SKU/name, filters category/brand/status, thumb, slug auto-editable, rich textarea, material/care, searchable category/brand, base/discount/sku/status/gender/is_new/is_featured, multi-image upload (intervention `coverDown 800`, drag-reorder, primary), variant builder (Size×Color grid, stock/price/sku), bulk delete/status, soft delete modal (`Components/DataTable.jsx:1`, `Modal.jsx:1`)
- **Categories/Brands** (`CategoryController.php:1`, `BrandController.php:1`, `Pages/Admin/Categories/Index.jsx:1`, `Brands/Index.jsx:1`): tree view `CategoryTree`, parent, image (600/400 resize), is_active, bulk activate/deactivate
- **Attributes** (`AttributeController.php:1`, `Pages/Admin/Attributes/Index.jsx:1`): list expand values add/edit/delete/reorder ↑↓, checkbox matrix assign to categories
- **Orders** (`OrderController.php:1`, `Pages/Admin/Orders/Index.jsx:1`/`Show.jsx:1`): filters status/date/search, detail items images/variant, status dropdown + mail, internal note, PDF invoice/packing-slip `resources/views/pdfs/*.blade.php:1` via dompdf, refund restock + `stock_logs`
- **Customers** (`CustomerController.php:1`, `Pages/Admin/Customers/*:1`): order count/total spent (`withCount/withSum`), detail addresses/order history, block toggle `is_blocked`
- **Inventory** (`InventoryController.php:1`, `Pages/Admin/Inventory/Index.jsx:1`/`Logs.jsx:1`): variant table inline stock/threshold edit, +/- adjust, stock_logs history
- **Coupons** (`CouponController.php:1`, `Pages/Admin/Coupons/Index.jsx:1`): CRUD, toggle, usage `times_used/usage_limit`
- **Reviews** (`ReviewController.php:1`, `Pages/Admin/Reviews/Index.jsx:1`): pending/approved, approve/reject, admin_reply shown on PDP
- **Pages CMS** (`PageController.php:1`, `Pages/Admin/Pages/*:1`): WYSIWYG toolbar bold/italic/h1/h2/list/link + HTML mode + preview
- **Reports** (`ReportController.php:1`, `Pages/Admin/Reports/Index.jsx:1`): date range + category/product filter, daily sales + best-selling tables, CSV export `admin/reports/export`
- **Settings** (`SettingController.php:1`, `Pages/Admin/Settings/Index.jsx:1`): tabs Store (logo upload `storage/settings`), Shipping (JSON zones flat/tiered), Tax (rate + inclusive), Users invite/edit/delete + Spatie role sync
- **UI:** `Layouts/AdminLayout.jsx:1` persistent sidebar grouped Catalog/Sales/Customers/Content/Settings, top bar avatar/dropdown, notifications bell, `DataTable` sort/search/pagination, `react-hot-toast` toasts, confirm modals, responsive 375/768/1280

## 4. Storefront
- **Home** (`Pages/Storefront/Home.jsx:1`, `routes/web.php:12`): hero carousel (hardcoded 3 slides), category tiles, best-sellers `is_featured` + new arrivals `is_new` carousels, newsletter form → `newsletter_subscribers` (`POST /newsletter/subscribe` `routes/web.php:1`), footer About/Contact/Policy/social (static pages)
- **Listing** (`Pages/Storefront/Products/Index.jsx:1`, `routes/web.php:29`): grid thumb/name/price strike-through/discount + stars, sidebar category/brand/size/color/price slider filters → URL query `router.get` Inertia partial, sort price/newest/rating, paginator numbered, quick-view modal (size/qty + add), skeleton `Components/Skeleton.jsx:1`
- **PDP** (`Pages/Storefront/Product/Show.jsx:1`, `routes/web.php:60`): gallery thumb strip + zoom, size buttons disabled if OOS + Size Guide modal, color swatches (price/stock/gallery update), stock badge In/Low/OOS, Add to Cart + Buy Now (→ checkout), Wishlist heart toggle `POST /wishlist/toggle`, tabs Description/Materials&Care/Reviews, reviews average breakdown bars + list + `Write a review` (auth + purchased guard) + admin_reply, related carousel
- **Cart** (`CartController.php:1`, `Pages/Storefront/Cart/Index.jsx:1`): line items stepper, remove, coupon apply/remove validated (`coupons` table), summary subtotal/shipping/tax/total `store_settings` zones, proceed disabled if empty, empty CTA
- **Checkout** (`CheckoutController.php:1`, `Pages/Storefront/Checkout/Index.jsx:1`): guest (email+address inline) OR auth saved addresses dropdown, shipping method zones/rates, review items totals address method, mock payment, transaction create `orders`+`order_items` decrement stock + `stock_logs` + coupon `times_used` inc, clear `carts`, redirect `order-success/{order_number}`
- **Account** (`AccountController.php:1`, `Pages/Storefront/Account/*:1`): dashboard recent orders/quick links, profile `useForm` patch, password `Hash::make`, address book CRUD default, order history → detail status timeline (`pending→processing→shipped→delivered`), wishlist grid remove/add-to-cart
- **Search** (`StorefrontLayout.jsx:1`): header input → `GET /products?search=`; debounced autosuggest top 5 via `GET /api/products?search` (legacy API still serves) + full results via `Products/Index`
- **Static** (`Pages/Storefront/Page/Show.jsx:1`, `Contact.jsx` etc): `static_pages` content, contact form → `contact_messages` + mail admin, FAQ accordion, custom `Pages/Error.jsx:1` 404 branding, `bootstrap/app.php:26` fallback
- **Polish:** `Layouts/StorefrontLayout.jsx:1` responsive header, `Intl.NumberFormat` currency util `resources/js/utils/currency.js:1`, `react-hot-toast` `app.jsx:1` Toaster, accessible alt/keyboard/contrast, empty/loading/error states everywhere

## 5. Design
- Palette: white/off-white bg, near-black text, **one accent rose `#e11d48`** for CTAs/badges/active filters/discount (consistent primary button, price tag). No >2 accents.
- Typography: single sans (Figtree/Inter), weight/size hierarchy, product name heavier, price bold, body `leading-6`.
- Cards: 4:5 ratio, generous image, hover zoom→ second image, price+name tight, stars small.
- Buttons: solid rose/ slate-900 pill for primary (Add to Cart, Checkout), outline ghost for secondary (Wishlist, Filters), consistent `rounded-full`/`rounded-xl`.
- Spacing: Tailwind scale, breathing room between sections, mobile-first `grid-cols-1 md:grid-cols-3`, test 375/768/1280.
- Admin: utilitarian dense, neutral gray/white, status badges green=delivered yellow=pending red=cancelled blue=processing, sidebar nav.
- Imagery: white bg, consistent lighting, placeholder unsplash if missing, uniform aspect.

## 6. Build Order — done phase-by-phase
1. ✅ Auth (Breeze) + schema 13 migrations + seed 20 → verify `migrate --seed` + `vite build` + `route:list`
2. ✅ Cart/checkout/orders + PDF
3. ✅ Accounts/addresses/wishlist/reviews/coupons/inventory
4. ✅ Dashboard/reports/CMS/settings/roles + polish (skeletons, toasts, 404, newsletter)

Each phase: `php artisan migrate --seed`, `npm run build` (372kB app, 391kB Dashboard), `php artisan test` 25/25 pass, boot `curl http://localhost:8000/` 200 (`Storefront/Home` data-page).

## 7. Deliverables
- [x] Laravel + Inertia + React via XAMPP MySQL `migrate --seed` reproducible
- [x] 13 migrations + `DatabaseSeeder` committed
- [x] README with clone/composer/npm/.env/migrate/seed/dev/serve steps
- [x] Admin `admin@trustedmart.com / admin123` (Super Admin via Spatie), customer `mahmud@gmail.com / password123`
- [x] All spec sections implemented (see §3-4 above); none flagged “not yet built”

Run `npm run build` after each phase — logs above.
