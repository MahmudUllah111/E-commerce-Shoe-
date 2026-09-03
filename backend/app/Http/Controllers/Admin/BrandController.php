<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Brand;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;

class BrandController extends Controller
{
    public function index(Request $request)
    {
        $q = Brand::withCount('products');
        if ($request->filled('search')) {
            $s = '%' . $request->search . '%';
            $q->where(fn($qq)=> $qq->where('name','like',$s)->orWhere('slug','like',$s));
        }
        if ($request->filled('is_active') && $request->is_active !== 'all') {
            $q->where('is_active', $request->is_active === '1' || $request->is_active === 'true');
        }
        $brands = $q->orderBy('name')->paginate(20)->withQueryString();

        return Inertia::render('Admin/Brands/Index', [
            'brands'  => $brands,
            'filters' => $request->only(['search','is_active']),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255|unique:brands,name',
            'slug'      => 'nullable|string|max:255|unique:brands,slug',
            'is_active' => 'nullable|boolean',
            'logo'      => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:3072',
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['name']);
        $base = $slug; $c=1;
        while (Brand::where('slug',$slug)->exists()) $slug = $base.'-'.$c++;

        $logoPath = null;
        if ($request->hasFile('logo')) {
            $logoPath = $this->storeImage($request->file('logo'), 'brands');
        }

        Brand::create([
            'name'      => $validated['name'],
            'slug'      => $slug,
            'is_active' => $validated['is_active'] ?? true,
            'logo'      => $logoPath,
        ]);

        return back()->with('success','Brand created.');
    }

    public function update(Request $request, Brand $brand)
    {
        $validated = $request->validate([
            'name'      => 'required|string|max:255|unique:brands,name,' . $brand->id,
            'slug'      => 'nullable|string|max:255|unique:brands,slug,' . $brand->id,
            'is_active' => 'nullable|boolean',
            'logo'      => 'nullable|image|mimes:jpeg,png,jpg,webp,svg|max:3072',
            'remove_logo' => 'nullable|boolean',
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['name']);
        if ($slug !== $brand->slug) {
            $base=$slug; $c=1;
            while (Brand::where('slug',$slug)->where('id','!=',$brand->id)->exists()) $slug=$base.'-'.$c++;
        }

        $data = [
            'name'      => $validated['name'],
            'slug'      => $slug,
            'is_active' => $validated['is_active'] ?? $brand->is_active,
        ];

        if ($request->hasFile('logo')) {
            if ($brand->logo) $this->deleteFile($brand->logo);
            $data['logo'] = $this->storeImage($request->file('logo'), 'brands');
        } elseif (!empty($validated['remove_logo'])) {
            if ($brand->logo) $this->deleteFile($brand->logo);
            $data['logo'] = null;
        }

        $brand->update($data);
        return back()->with('success','Brand updated.');
    }

    public function destroy(Brand $brand)
    {
        // Prevent delete if products exist
        if ($brand->products()->exists()) {
            return back()->withErrors(['brand' => 'Cannot delete brand with associated products. Deactivate instead.']);
        }
        if ($brand->logo) $this->deleteFile($brand->logo);
        $brand->delete();
        return back()->with('success','Brand deleted.');
    }

    public function bulk(Request $request)
    {
        $validated = $request->validate([
            'ids'    => 'required|array|min:1',
            'ids.*'  => 'integer|exists:brands,id',
            'action' => 'required|in:delete,activate,deactivate',
        ]);
        if ($validated['action'] === 'delete') {
            $brands = Brand::whereIn('id',$validated['ids'])->withCount('products')->get();
            foreach ($brands as $b) {
                if ($b->products_count === 0) {
                    if ($b->logo) $this->deleteFile($b->logo);
                    $b->delete();
                }
            }
        } elseif ($validated['action'] === 'activate') {
            Brand::whereIn('id',$validated['ids'])->update(['is_active'=>true]);
        } else {
            Brand::whereIn('id',$validated['ids'])->update(['is_active'=>false]);
        }
        return back()->with('success','Bulk action completed.');
    }

    private function storeImage($file, string $folder): string
    {
        $ext = strtolower($file->getClientOriginalExtension() ?: 'jpg');
        // SVG bypass resize
        if ($ext === 'svg') {
            $filename = Str::uuid() . '.svg';
            $file->storeAs($folder, $filename, 'public');
            return '/storage/' . $folder . '/' . $filename;
        }
        $filename = Str::uuid() . '.' . $ext;
        $relative = $folder . '/' . $filename;
        $full = storage_path('app/public/' . $relative);
        if (!is_dir(dirname($full))) mkdir(dirname($full),0755,true);
        try {
            $m = new ImageManager(new GdDriver());
            $img = $m->read($file->getRealPath());
            $img->coverDown(400,400);
            file_put_contents($full, (string)$img->toJpeg(85));
        } catch (\Throwable $e) {
            $file->storeAs($folder, $filename, 'public');
        }
        return '/storage/' . $relative;
    }

    private function deleteFile(?string $url): void
    {
        if (!$url) return;
        $path = str_replace('/storage/','',$url);
        if (Storage::disk('public')->exists($path)) Storage::disk('public')->delete($path);
    }
}
