<?php
namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\StaticPage;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PageController extends Controller
{
    public function index()
    {
        $pages = StaticPage::orderBy('title')->get();
        // Ensure default pages exist
        $defaults = [
            ['slug'=>'about','title'=>'About Us'],
            ['slug'=>'faq','title'=>'FAQ'],
            ['slug'=>'return-policy','title'=>'Return Policy'],
            ['slug'=>'terms','title'=>'Terms & Conditions'],
            ['slug'=>'privacy','title'=>'Privacy Policy'],
        ];
        foreach ($defaults as $d) {
            if (!$pages->contains('slug',$d['slug'])) {
                $p = StaticPage::create(['slug'=>$d['slug'],'title'=>$d['title'],'content'=>'<p>'.$d['title'].' content coming soon.</p>']);
                $pages->push($p);
            }
        }
        return Inertia::render('Admin/Pages/Index', [
            'pages' => StaticPage::orderBy('title')->get(),
        ]);
    }

    public function edit(StaticPage $page)
    {
        return Inertia::render('Admin/Pages/Edit', [
            'page' => $page,
        ]);
    }

    public function update(Request $request, StaticPage $page)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:static_pages,slug,'.$page->id,
            'content' => 'nullable|string',
        ]);

        // Basic sanitization: allow common html tags, strip script
        $content = $data['content'] ?? '';
        $content = preg_replace('#<script(.*?)>(.*?)</script>#is', '', $content);

        $page->update([
            'title' => $data['title'],
            'slug' => \Illuminate\Support\Str::slug($data['slug']),
            'content' => $content,
        ]);

        return redirect()->route('admin.pages.index')->with('success','Page updated.');
    }

    public function store(Request $request)
    {
        $data = $request->validate([
            'title' => 'required|string|max:255',
            'slug' => 'required|string|max:255|unique:static_pages,slug',
            'content' => 'nullable|string',
        ]);
        $content = preg_replace('#<script(.*?)>(.*?)</script>#is', '', $data['content'] ?? '');
        $page = StaticPage::create([
            'title'=>$data['title'],
            'slug'=> \Illuminate\Support\Str::slug($data['slug']),
            'content'=>$content,
        ]);
        return redirect()->route('admin.pages.index')->with('success','Page created.');
    }

    public function destroy(StaticPage $page)
    {
        // Prevent deleting core pages? Allow but warn
        $page->delete();
        return back()->with('success','Page deleted.');
    }
}
