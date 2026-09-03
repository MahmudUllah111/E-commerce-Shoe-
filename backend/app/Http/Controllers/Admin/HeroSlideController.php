<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\HeroSlide;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Storage;

class HeroSlideController extends Controller
{
    public function index()
    {
        $slides = HeroSlide::orderBy('sort_order')->orderBy('id')->get();
        return Inertia::render('Admin/Hero/Index', ['slides' => $slides]);
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'badge' => 'nullable|string|max:100',
            'discount_badge' => 'nullable|string|max:100',
            'cta_text' => 'required|string|max:100',
            'cta_link' => 'required|string|max:255',
            'bg_image' => 'nullable|string|max:500',
            'shoe_image' => 'nullable|string|max:500',
            'bg_upload' => 'nullable|image|max:4096',
            'shoe_upload' => 'nullable|image|max:4096',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('bg_upload')) {
            $path = $request->file('bg_upload')->store('hero', 'public');
            $data['bg_image'] = Storage::disk('public')->url($path);
        }
        if ($request->hasFile('shoe_upload')) {
            $path = $request->file('shoe_upload')->store('hero', 'public');
            $data['shoe_image'] = Storage::disk('public')->url($path);
        }
        unset($data['bg_upload'], $data['shoe_upload']);
        $data['is_active'] = $request->boolean('is_active', true);
        $data['sort_order'] = $data['sort_order'] ?? HeroSlide::max('sort_order') + 1;

        HeroSlide::create($data);
        return back()->with('success', 'Hero slide created.');
    }

    public function update(Request $request, HeroSlide $heroSlide)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'subtitle' => 'nullable|string|max:500',
            'badge' => 'nullable|string|max:100',
            'discount_badge' => 'nullable|string|max:100',
            'cta_text' => 'required|string|max:100',
            'cta_link' => 'required|string|max:255',
            'bg_image' => 'nullable|string|max:500',
            'shoe_image' => 'nullable|string|max:500',
            'bg_upload' => 'nullable|image|max:4096',
            'shoe_upload' => 'nullable|image|max:4096',
            'sort_order' => 'nullable|integer',
            'is_active' => 'nullable|boolean',
        ]);

        if ($request->hasFile('bg_upload')) {
            $path = $request->file('bg_upload')->store('hero', 'public');
            $data['bg_image'] = Storage::disk('public')->url($path);
        }
        if ($request->hasFile('shoe_upload')) {
            $path = $request->file('shoe_upload')->store('hero', 'public');
            $data['shoe_image'] = Storage::disk('public')->url($path);
        }
        unset($data['bg_upload'], $data['shoe_upload']);
        $data['is_active'] = $request->boolean('is_active');

        $heroSlide->update($data);
        return back()->with('success', 'Hero slide updated.');
    }

    public function destroy(HeroSlide $heroSlide)
    {
        $heroSlide->delete();
        return back()->with('success', 'Hero slide deleted.');
    }

    public function reorder(Request $request)
    {
        $data = $request->validate(['ids' => 'required|array', 'ids.*' => 'exists:hero_slides,id']);
        foreach ($data['ids'] as $index => $id) {
            HeroSlide::where('id', $id)->update(['sort_order' => $index]);
        }
        return back()->with('success', 'Order updated.');
    }
}
