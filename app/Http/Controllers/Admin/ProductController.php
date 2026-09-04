<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use App\Models\Category;
use App\Models\Product;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;

class ProductController extends Controller
{
    public function index(Request $request)
    {
        $q = Product::with(['brand', 'category', 'images' => fn($qq) => $qq->orderBy('display_order'), 'variants']);

        if ($request->filled('search')) {
            $s = '%' . $request->search . '%';
            $q->where(function ($qq) use ($s) {
                $qq->where('name', 'like', $s)
                    ->orWhere('slug', 'like', $s)
                    ->orWhere('sku', 'like', $s)
                    ->orWhere('description', 'like', $s);
            });
        }
        if ($request->filled('category_id')) {
            $q->where('category_id', $request->category_id);
        }
        if ($request->filled('brand_id')) {
            $q->where('brand_id', $request->brand_id);
        }
        if ($request->filled('status') && $request->status !== 'all') {
            $q->where('status', $request->status);
        }
        if ($request->filled('gender') && $request->gender !== 'all') {
            $q->where('gender', $request->gender);
        }

        $sort = $request->get('sort', 'latest');
        match ($sort) {
            'price_low'  => $q->orderBy('base_price', 'asc'),
            'price_high' => $q->orderBy('base_price', 'desc'),
            'name_asc'   => $q->orderBy('name', 'asc'),
            'name_desc'  => $q->orderBy('name', 'desc'),
            default      => $q->latest(),
        };

        $products = $q->paginate(20)->withQueryString();

        return Inertia::render('Admin/Products/Index', [
            'products'   => $products,
            'filters'    => $request->only(['search', 'category_id', 'brand_id', 'status', 'gender', 'sort']),
            'categories' => Category::select('id','name','slug','parent_id')->orderBy('name')->get(),
            'brands'     => Brand::select('id','name','slug')->orderBy('name')->get(),
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Products/Create', [
            'categories' => Category::with('children')->whereNull('parent_id')->orderBy('name')->get(),
            'allCategories' => Category::orderBy('name')->get(),
            'brands'     => Brand::orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'slug'              => 'nullable|string|max:255|unique:products,slug',
            'description'       => 'nullable|string',
            'material'          => 'nullable|string|max:500',
            'materials'         => 'nullable|string|max:500',
            'care_instructions' => 'nullable|string|max:1000',
            'category_id'       => 'required|exists:categories,id',
            'brand_id'          => 'required|exists:brands,id',
            'gender'            => 'nullable|in:Men,Women,Kids,Unisex',
            'base_price'        => 'required|numeric|min:0',
            'discount_price'    => 'nullable|numeric|min:0|lt:base_price',
            'sku'               => 'nullable|string|max:100|unique:products,sku',
            'status'            => 'required|in:active,draft,out_of_stock',
            'is_new'            => 'nullable|boolean',
            'is_featured'       => 'nullable|boolean',
            'is_on_sale'        => 'nullable|boolean',
            'images'            => 'nullable|array|max:10',
            'images.*'          => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'existing_images'   => 'nullable|array',
            'image_order'       => 'nullable|array',
            'primary_index'     => 'nullable|integer|min:0',
            'variants'          => 'nullable|array',
            'variants.*.sku'            => 'nullable|string|max:100',
            'variants.*.size_value'     => 'required_with:variants|string|max:50',
            'variants.*.color_name'     => 'nullable|string|max:50',
            'variants.*.color_hex'      => 'nullable|string|max:20',
            'variants.*.stock_quantity' => 'required_with:variants|integer|min:0',
            'variants.*.price'          => 'nullable|numeric|min:0',
            'variants.*.is_active'      => 'nullable|boolean',
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['name']);
        $base = $slug;
        $counter = 1;
        while (Product::where('slug', $slug)->exists()) {
            $slug = $base . '-' . $counter++;
        }

        $product = Product::create([
            'name'              => $validated['name'],
            'slug'              => $slug,
            'description'       => $validated['description'] ?? null,
            'materials'         => $validated['material'] ?? $validated['materials'] ?? null,
            'care_instructions' => $validated['care_instructions'] ?? null,
            'category_id'       => $validated['category_id'],
            'brand_id'          => $validated['brand_id'],
            'gender'            => $validated['gender'] ?? 'Unisex',
            'price'             => $validated['base_price'],
            'base_price'        => $validated['base_price'],
            'discount_price'    => $validated['discount_price'] ?? null,
            'original_price'    => $validated['discount_price'] ?? null,
            'sku'               => $validated['sku'] ?? strtoupper(Str::random(8)),
            'status'            => $validated['status'],
            'is_new'            => $validated['is_new'] ?? false,
            'is_featured'       => $validated['is_featured'] ?? false,
            'is_on_sale'        => $validated['is_on_sale'] ?? false,
        ]);

        // Images
        $this->handleImages($request, $product, $validated);

        // Variants
        if (!empty($validated['variants'])) {
            foreach ($validated['variants'] as $v) {
                $product->variants()->create([
                    'sku'            => $v['sku'] ?? strtoupper(Str::random(6)),
                    'size_value'     => $v['size_value'],
                    'color_name'     => $v['color_name'] ?? 'Default',
                    'color_hex'      => $v['color_hex'] ?? '#000000',
                    'stock_quantity' => $v['stock_quantity'] ?? 0,
                    'price'          => $v['price'] ?? null,
                    'is_active'      => $v['is_active'] ?? true,
                ]);
            }
        }

        return redirect()->route('admin.products.index')->with('success', 'Product created successfully.');
    }

    public function edit(Product $product)
    {
        $product->load(['images' => fn($q) => $q->orderBy('display_order'), 'variants', 'category', 'brand']);
        return Inertia::render('Admin/Products/Edit', [
            'product'       => $product,
            'categories'    => Category::with('children')->whereNull('parent_id')->orderBy('name')->get(),
            'allCategories' => Category::orderBy('name')->get(),
            'brands'        => Brand::orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Product $product)
    {
        $validated = $request->validate([
            'name'              => 'required|string|max:255',
            'slug'              => 'nullable|string|max:255|unique:products,slug,' . $product->id,
            'description'       => 'nullable|string',
            'material'          => 'nullable|string|max:500',
            'materials'         => 'nullable|string|max:500',
            'care_instructions' => 'nullable|string|max:1000',
            'category_id'       => 'required|exists:categories,id',
            'brand_id'          => 'required|exists:brands,id',
            'gender'            => 'nullable|in:Men,Women,Kids,Unisex',
            'base_price'        => 'required|numeric|min:0',
            'discount_price'    => 'nullable|numeric|min:0|lt:base_price',
            'sku'               => 'nullable|string|max:100|unique:products,sku,' . $product->id,
            'status'            => 'required|in:active,draft,out_of_stock',
            'is_new'            => 'nullable|boolean',
            'is_featured'       => 'nullable|boolean',
            'images'            => 'nullable|array|max:10',
            'images.*'          => 'nullable|image|mimes:jpeg,png,jpg,webp|max:5120',
            'existing_images'   => 'nullable|array',
            'existing_images.*.id' => 'nullable|integer|exists:product_images,id',
            'existing_images.*.is_primary' => 'nullable|boolean',
            'existing_images.*.display_order' => 'nullable|integer',
            'remove_image_ids'  => 'nullable|array',
            'remove_image_ids.*'=> 'integer|exists:product_images,id',
            'image_order'       => 'nullable|array',
            'primary_index'     => 'nullable|integer|min:0',
            'primary_image_id'  => 'nullable|integer|exists:product_images,id',
            'variants'          => 'nullable|array',
            'variants.*.id'            => 'nullable|integer|exists:product_variants,id',
            'variants.*.sku'            => 'nullable|string|max:100',
            'variants.*.size_value'     => 'required_with:variants|string|max:50',
            'variants.*.color_name'     => 'nullable|string|max:50',
            'variants.*.color_hex'      => 'nullable|string|max:20',
            'variants.*.stock_quantity' => 'required_with:variants|integer|min:0',
            'variants.*.price'          => 'nullable|numeric|min:0',
            'variants.*.is_active'      => 'nullable|boolean',
            'remove_variant_ids' => 'nullable|array',
            'remove_variant_ids.*' => 'integer|exists:product_variants,id',
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['name']);
        if ($slug !== $product->slug) {
            $base = $slug;
            $counter = 1;
            while (Product::where('slug', $slug)->where('id', '!=', $product->id)->exists()) {
                $slug = $base . '-' . $counter++;
            }
        }

        $product->update([
            'name'              => $validated['name'],
            'slug'              => $slug,
            'description'       => $validated['description'] ?? null,
            'materials'         => $validated['material'] ?? $validated['materials'] ?? null,
            'care_instructions' => $validated['care_instructions'] ?? null,
            'category_id'       => $validated['category_id'],
            'brand_id'          => $validated['brand_id'],
            'gender'            => $validated['gender'] ?? $product->gender,
            'price'             => $validated['base_price'],
            'base_price'        => $validated['base_price'],
            'discount_price'    => $validated['discount_price'] ?? null,
            'original_price'    => $validated['discount_price'] ?? null,
            'sku'               => $validated['sku'] ?? $product->sku,
            'status'            => $validated['status'],
            'is_new'            => $validated['is_new'] ?? $product->is_new,
            'is_featured'       => $validated['is_featured'] ?? $product->is_featured,
            'is_on_sale'        => $validated['is_on_sale'] ?? $product->is_on_sale,
        ]);

        // Remove images if requested
        if (!empty($validated['remove_image_ids'])) {
            $imgs = $product->images()->whereIn('id', $validated['remove_image_ids'])->get();
            foreach ($imgs as $img) {
                $this->deleteImageFile($img->image_url ?? $img->url);
                $img->delete();
            }
        }

        // Update display_order / is_primary for existing images if provided
        if (!empty($validated['existing_images'])) {
            foreach ($validated['existing_images'] as $ei) {
                if (isset($ei['id'])) {
                    $product->images()->where('id', $ei['id'])->update([
                        'is_primary'    => (bool)($ei['is_primary'] ?? false),
                        'display_order' => $ei['display_order'] ?? 0,
                    ]);
                }
            }
        }
        if ($request->filled('primary_image_id')) {
            $product->images()->update(['is_primary' => false]);
            $product->images()->where('id', $request->primary_image_id)->update(['is_primary' => true]);
        }

        $this->handleImages($request, $product, $validated, true);

        // Variants sync
        if (isset($validated['variants'])) {
            $keepIds = [];
            foreach ($validated['variants'] as $v) {
                if (!empty($v['id'])) {
                    $variant = $product->variants()->where('id', $v['id'])->first();
                    if ($variant) {
                        $variant->update([
                            'sku'            => $v['sku'] ?? $variant->sku,
                            'size_value'     => $v['size_value'],
                            'color_name'     => $v['color_name'] ?? $variant->color_name,
                            'color_hex'      => $v['color_hex'] ?? $variant->color_hex,
                            'stock_quantity' => $v['stock_quantity'],
                            'price'          => $v['price'] ?? null,
                            'is_active'      => $v['is_active'] ?? true,
                        ]);
                        $keepIds[] = $variant->id;
                    }
                } else {
                    $new = $product->variants()->create([
                        'sku'            => $v['sku'] ?? strtoupper(Str::random(6)),
                        'size_value'     => $v['size_value'],
                        'color_name'     => $v['color_name'] ?? 'Default',
                        'color_hex'      => $v['color_hex'] ?? '#000000',
                        'stock_quantity' => $v['stock_quantity'] ?? 0,
                        'price'          => $v['price'] ?? null,
                        'is_active'      => $v['is_active'] ?? true,
                    ]);
                    $keepIds[] = $new->id;
                }
            }
            // delete removed variants explicitly or those not kept + in remove list
            if (!empty($validated['remove_variant_ids'])) {
                $product->variants()->whereIn('id', $validated['remove_variant_ids'])->delete();
            }
            // If variants array provided and some existing not in keepIds, keep them unless explicitly removed? We don't auto-delete.
        } elseif (!empty($validated['remove_variant_ids'])) {
            $product->variants()->whereIn('id', $validated['remove_variant_ids'])->delete();
        }

        return redirect()->route('admin.products.index')->with('success', 'Product updated successfully.');
    }

    public function destroy(Product $product)
    {
        $product->delete();
        return redirect()->route('admin.products.index')->with('success', 'Product moved to trash.');
    }

    public function bulk(Request $request)
    {
        $validated = $request->validate([
            'ids'    => 'required|array|min:1',
            'ids.*'  => 'integer|exists:products,id',
            'action' => 'required|in:delete,active,draft,out_of_stock',
        ]);

        $ids = $validated['ids'];

        if ($validated['action'] === 'delete') {
            Product::whereIn('id', $ids)->delete();
            return back()->with('success', count($ids) . ' products moved to trash.');
        }

        Product::whereIn('id', $ids)->update(['status' => $validated['action']]);
        return back()->with('success', count($ids) . ' products updated to ' . $validated['action'] . '.');
    }

    private function handleImages(Request $request, Product $product, array $validated, bool $isUpdate = false): void
    {
        $existingCount = $product->images()->count();
        $orderOffset = $existingCount;

        if ($request->hasFile('images')) {
            foreach ($request->file('images') as $idx => $file) {
                if (!$file || !$file->isValid()) continue;
                $path = $this->storeResizedImage($file);
                $product->images()->create([
                    'image_url'     => $path,
                    'url'           => $path,
                    'is_primary'    => ($existingCount === 0 && $idx === 0 && !$isUpdate) ? true : false,
                    'display_order' => $orderOffset + $idx,
                ]);
            }
        }

        // handle primary_index for new uploads if specified
        if ($request->filled('primary_index') && $request->hasFile('images')) {
            $allImages = $product->images()->orderBy('display_order')->get();
            $pi = (int)$request->primary_index;
            if (isset($allImages[$pi])) {
                $product->images()->update(['is_primary' => false]);
                $allImages[$pi]->update(['is_primary' => true]);
            }
        }

        // Ensure at least one primary if none
        if ($product->images()->where('is_primary', true)->count() === 0 && $product->images()->count() > 0) {
            $product->images()->orderBy('display_order')->first()->update(['is_primary' => true]);
        }
    }

    private function storeResizedImage($file): string
    {
        $filename = Str::uuid() . '.' . ($file->getClientOriginalExtension() ?: 'jpg');
        $relativePath = 'products/' . $filename;
        $fullStoragePath = storage_path('app/public/' . $relativePath);

        // Ensure directory exists
        if (!is_dir(dirname($fullStoragePath))) {
            mkdir(dirname($fullStoragePath), 0755, true);
        }

        try {
            $manager = new ImageManager(new GdDriver());
            $image = $manager->read($file->getRealPath());
            // Resize to 800x800 cover, keep aspect via scaleDown + cover
            $image->coverDown(800, 800);
            // Encode based on extension
            $encoded = $image->toJpeg(85);
            file_put_contents($fullStoragePath, (string) $encoded);
        } catch (\Throwable $e) {
            // Fallback to simple store
            $file->storeAs('products', $filename, 'public');
        }

        return '/storage/' . $relativePath;
    }

    private function deleteImageFile(?string $url): void
    {
        if (!$url) return;
        $path = str_replace('/storage/', '', $url);
        if (Storage::disk('public')->exists($path)) {
            Storage::disk('public')->delete($path);
        }
    }
}
