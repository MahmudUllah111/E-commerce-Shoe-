# TrustedMart — Footwear E-Commerce Platform

A complete, modern footwear retail platform built as a unified **Laravel 12 + Inertia.js + React** monolith.

---

## Architecture Overview

The application is unified directly in the project root:
- **Backend**: Laravel 12 (PHP 8.2+) with Eloquent ORM, MySQL, Sessions, Authentication, and SMTP Mailers.
- **Frontend**: Inertia.js v2 with React 18, Tailwind CSS, Lucide icons, and Recharts.
- **Root Directory Structure**:
  - `app/` — Controllers, Models, Mailables, Policies, Providers
  - `routes/` — `web.php` (Storefront, CMS, and Cart), `admin.php` (Admin control panel), `auth.php` (Authentication)
  - `resources/js/` — Inertia React Pages (`Storefront/`, `Admin/`, `Auth/`, `Profile/`), Layouts, and Components
  - `database/` — Migrations, Seeders, and Factories
  - `public/` — Web entry point, Vite compiled assets, and storage symlink

---

## Quick Start

### 1. Requirements
- PHP 8.2+ with MySQL / XAMPP
- Node.js 18+ and npm
- Composer

### 2. Environment Configuration
Verify your `.env` configuration at the root of the project:
```env
APP_NAME=TrustedMart
APP_ENV=local
APP_URL=http://127.0.0.1:8000

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=shoe_ecommerce_db
DB_USERNAME=root
DB_PASSWORD=
DB_SOCKET=/Applications/XAMPP/xamppfiles/var/mysql/mysql.sock

MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=mahmudsets@gmail.com
MAIL_PASSWORD=nyrqxlhqkanwzvvr
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="mahmudsets@gmail.com"
MAIL_FROM_NAME="TrustedMart"
```

### 3. Run Migrations & Storage Link
```bash
php artisan storage:link
php artisan migrate
```

### 4. Start Development Server
Run the unified command from the root directory:
```bash
composer run dev
```
This automatically starts:
- Laravel HTTP server on `http://127.0.0.1:8000`
- Vite frontend hot-reload on `http://localhost:5173`
- Queue worker for asynchronous order notifications
- Application log tailing

---

## Key Features & Pages
- **Storefront & Landing**:
  - Rotating rounded hero banner (`/`)
  - Filterable footwear catalog with live search, brand, category, gender, and price range filters (`/products`)
  - Shoe details with size/color selection and real-time stock status (`/product/{slug}`)
- **Wishlist & Restock System**:
  - Saved favorites with non-breaking vertical card layout (`/wishlist`)
  - Interactive "Notify me when available" restock alert drawer connected to Gmail SMTP
- **Checkout & Tracking**:
  - Guest and user checkout with COD and digital payments (`/checkout`)
  - Order status tracking with packing slips and customer invoices (`/track-order`)
- **Organized Customer Policy CMS**:
  - About Us (`/pages/about` or `/about`)
  - FAQ with categorized Q&A (`/pages/faq` or `/faq`)
  - 30-Day Return & Exchange Policy (`/pages/return-policy` or `/returns`)
  - Terms & Conditions (`/pages/terms` or `/terms`)
  - Privacy Policy (`/pages/privacy` or `/privacy`)
- **Admin Control Panel**:
  - Product, inventory, brand, category, and review management (`/admin`)
  - Restock notifications waiting list & batch dispatch
  - Live SMTP mail logs & test mail sender (`/admin/settings`)
