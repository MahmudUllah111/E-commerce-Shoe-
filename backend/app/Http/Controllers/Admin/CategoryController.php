<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Intervention\Image\ImageManager;
use Intervention\Image\Drivers\Gd\Driver as GdDriver;

class CategoryController extends Controller
{
    public function index(Request $request)
    {
        $q = Category::with(['children', 'parent'])->withCount('products');

        if ($request->filled('search')) {
            $s = '%' . $request->search . '%';
            $q->where(fn($qq) => $qq->where('name', 'like', $s)->orWhere('slug', 'like', $s));
        }
        if ($request->filled('is_active') && $request->is_active !== 'all') {
            $q->where('is_active', $request->is_active === '1' || $request->is_active === 'true');
        }

        // For tree view, get roots with children recursively; for table, paginate
        $categories = $q->orderBy('name')->paginate(20)->withQueryString();

        // Also build tree for tree view tab
        $tree = Category::with(['children' => fn($qq) => $qq->withCount('products')->orderBy('name'), 'parent'])
            ->withCount('products')
            ->whereNull('parent_id')
            ->orderBy('name')
            ->get();

        return Inertia::render('Admin/Categories/Index', [
            'categories' => $categories,
            'tree'       => $tree,
            'filters'    => $request->only(['search','is_active']),
        ]);
    }

    public function create()
    {
        // Not separate page; modal uses same index, but support standalone
        return Inertia::render('Admin/Categories/Create', [
            'parents' => Category::whereNull('parent_id')->orderBy('name')->get(),
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255|unique:categories,name',
            'slug'        => 'nullable|string|max:255|unique:categories,slug',
            'description' => 'nullable|string|max:1000',
            'parent_id'   => 'nullable|exists:categories,id',
            'is_active'   => 'nullable|boolean',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:3072',
        ]);

        $slug = $validated['slug'] ?? Str::slug($validated['name']);
        $base = $slug;
        $c = 1;
        while (Category::where('slug', $slug)->exists()) $slug = $base . '-' . $c++;

        $imagePath = null;
        if ($request->hasFile('image')) {
            $imagePath = $this->storeImage($request->file('image'));
        }

        Category::create([
            'name'        => $validated['name'],
            'slug'        => $slug,
            'description' => $validated['description'] ?? null,
            'parent_id'   => $validated['parent_id'] ?? null,
            'is_active'   => $validated['is_active'] ?? true,
            'image'       => $imagePath,
        ]);

        return back()->with('success', 'Category created.');
    }

    public function edit(Category $category)
    {
        return Inertia::render('Admin/Categories/Edit', [
            'category' => $category,
            'parents'  => Category::where('id','!=',$category->id)->orderBy('name')->get(),
        ]);
    }

    public function update(Request $request, Category $category)
    {
        $validated = $request->validate([
            'name'        => 'required|string|max:255|unique:categories,name,' . $category->id,
            'slug'        => 'nullable|string|max:255|unique:categories,slug,' . $category->id,
            'description' => 'nullable|string|max:1000',
            'parent_id'   => 'nullable|exists:categories,id',
            'is_active'   => 'nullable|boolean',
            'image'       => 'nullable|image|mimes:jpeg,png,jpg,webp|max:3072',
            'remove_image'=> 'nullable|boolean',
        ]);

        if (!empty($validated['parent_id']) && (int)$validated['parent_id'] === (int)$category->id) {
            return back()->withErrors(['parent_id' => 'Category cannot be its own parent.']);
        }

        $slug = $validated['slug'] ?? Str::slug($validated['name']);
        if ($slug !== $category->slug) {
            $base = $slug; $c=1;
            while (Category::where('slug',$slug)->where('id','!=',$category->id)->exists()) $slug = $base.'-'.$c++;
        }

        $data = [
            'name'        => $validated['name'],
            'slug'        => $slug,
            'description' => $validated['description'] ?? null,
            'parent_id'   => $validated['parent_id'] ?? null,
            'is_active'   => $validated['is_active'] ?? $category->is_active,
        ];

        if ($request->hasFile('image')) {
            if ($category->image) $this->deleteFile($category->image);
            $data['image'] = $this->storeImage($request->file('image'));
        } elseif (!empty($validated['remove_image'])) {
            if ($category->image) $this->deleteFile($category->image);
            $data['image'] = null;
        }

        $category->update($data);
        return back()->with('success', 'Category updated.');
    }

    public function destroy(Category $category)
    {
        // Soft delete; optionally reassign children to parent
        $category->delete();
        return back()->with('success', 'Category moved to trash.');
    }

    public function bulk(Request $request)
    {
        $validated = $request->validate([
            'ids'    => 'required|array|min:1',
            'ids.*'  => 'integer|exists:categories,id',
            'action' => 'required|in:delete,activate,deactivate',
        ]);
        if ($validated['action'] === 'delete') {
            Category::whereIn('id', $validated['ids'])->delete();
        } elseif ($validated['action'] === 'activate') {
            Category::whereIn('id', $validated['ids'])->update(['is_active' => true]);
        } else {
            Category::whereIn('id', $validated['ids'])->update(['is_active' => false]);
        }
        return back()->with('success', 'Bulk action completed.');
    }

    private function storeImage($file): string
    {
        $filename = Str::uuid() . '.' . ($file->getClientOriginalExtension() ?: 'jpg');
        $relative = 'categories/' . $filename;
        $full = storage_path('app/public/' . $relative);
        if (!is_dir(dirname($full))) mkdir(dirname($full), 0755, true);
        try {
            $m = new ImageManager(new GdDriver());
            $img = $m->read($file->getRealPath());
            $img->coverDown(600, 600);
            file_put_contents($full, (string) $img->toJpeg(85));
        } catch (\Throwable $e) {
            $file->storeAs('categories', $filename, 'public');
        }
        return '/storage/' . $relative;
    }

    private function deleteFile(?string $url): void
    {
        if (!$url) return;
        $path = str_replace('/storage/', '', $url);
        if (Storage::disk('public')->exists($path)) Storage::disk('public')->delete($path);
    }
}
