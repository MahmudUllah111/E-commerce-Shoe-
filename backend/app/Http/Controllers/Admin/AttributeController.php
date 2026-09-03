<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Attribute;
use App\Models\AttributeValue;
use App\Models\Category;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class AttributeController extends Controller
{
    public function index()
    {
        $attributes = Attribute::with(['values' => fn($q)=> $q->orderBy('display_order'), 'categories:id,name,slug'])
            ->orderBy('name')
            ->get();

        $categories = Category::select('id','name','slug')->orderBy('name')->get();

        return Inertia::render('Admin/Attributes/Index', [
            'attributes' => $attributes,
            'categories' => $categories,
        ]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100|unique:attributes,name',
            'slug' => 'nullable|string|max:100|unique:attributes,slug',
        ]);
        $slug = $data['slug'] ?? Str::slug($data['name']);
        Attribute::create(['name'=>$data['name'],'slug'=>$slug]);
        return back()->with('success','Attribute created.');
    }

    public function update(Request $request, Attribute $attribute)
    {
        $data = $request->validate([
            'name' => 'required|string|max:100|unique:attributes,name,'.$attribute->id,
            'slug' => 'nullable|string|max:100|unique:attributes,slug,'.$attribute->id,
        ]);
        $attribute->update([
            'name'=>$data['name'],
            'slug'=> $data['slug'] ?? Str::slug($data['name']),
        ]);
        return back()->with('success','Attribute updated.');
    }

    public function destroy(Attribute $attribute)
    {
        $attribute->delete();
        return back()->with('success','Attribute deleted.');
    }

    // Values
    public function storeValue(Request $request, Attribute $attribute)
    {
        $data = $request->validate([
            'value' => 'required|string|max:100',
            'display_order' => 'nullable|integer|min:0',
        ]);
        $maxOrder = $attribute->values()->max('display_order') ?? -1;
        $attribute->values()->create([
            'value'=>$data['value'],
            'display_order'=> $data['display_order'] ?? $maxOrder+1,
        ]);
        return back()->with('success','Value added.');
    }

    public function updateValue(Request $request, AttributeValue $value)
    {
        $data = $request->validate([
            'value' => 'required|string|max:100',
            'display_order' => 'nullable|integer|min:0',
        ]);
        $value->update([
            'value'=>$data['value'],
            'display_order'=> $data['display_order'] ?? $value->display_order,
        ]);
        return back()->with('success','Value updated.');
    }

    public function destroyValue(AttributeValue $value)
    {
        $value->delete();
        return back()->with('success','Value deleted.');
    }

    public function reorderValues(Request $request, Attribute $attribute)
    {
        $data = $request->validate([
            'order' => 'required|array',
            'order.*' => 'integer|exists:attribute_values,id',
        ]);
        DB::transaction(function() use ($data) {
            foreach ($data['order'] as $idx => $id) {
                AttributeValue::where('id',$id)->update(['display_order'=>$idx]);
            }
        });
        return back()->with('success','Order updated.');
    }

    public function syncCategories(Request $request, Attribute $attribute)
    {
        $data = $request->validate([
            'category_ids' => 'nullable|array',
            'category_ids.*' => 'integer|exists:categories,id',
        ]);
        $attribute->categories()->sync($data['category_ids'] ?? []);
        return back()->with('success','Categories updated.');
    }
}
