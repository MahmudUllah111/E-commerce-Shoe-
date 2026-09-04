import AdminLayout from '@/Layouts/AdminLayout';
import { Link, useForm, usePage } from '@inertiajs/react';
import { useState } from 'react';
import toast from 'react-hot-toast';

function Toolbar({ onExec }){
    const btns = [
        {label:'B', cmd:'bold', title:'Bold'},
        {label:'I', cmd:'italic', title:'Italic'},
        {label:'H1', cmd:'h1'},
        {label:'H2', cmd:'h2'},
        {label:'• List', cmd:'ul'},
        {label:'Link', cmd:'link'},
    ];
    return (
        <div className="flex flex-wrap gap-1 p-2 border-b bg-gray-50 rounded-t-xl">
            {btns.map(b=> (
                <button key={b.cmd} type="button" onClick={()=>onExec(b.cmd)} className="px-2.5 py-1 text-xs font-black border bg-white rounded hover:bg-gray-100" title={b.title||b.label}>{b.label}</button>
            ))}
            <span className="text-[11px] text-gray-500 font-semibold ml-2 self-center">Simple WYSIWYG — HTML is saved</span>
        </div>
    );
}

export default function Edit({ page }){
    const { flash } = usePage().props;
    const form = useForm({ title: page.title, slug: page.slug, content: page.content||'' });
    const [mode,setMode]=useState('visual'); // visual | html

    const exec = (cmd)=>{
        const ta = document.getElementById('content-area');
        if (!ta) return;
        const start = ta.selectionStart;
        const end = ta.selectionEnd;
        const sel = form.data.content.substring(start,end) || 'text';
        let insert='';
        if(cmd==='bold') insert=`<strong>${sel}</strong>`;
        else if(cmd==='italic') insert=`<em>${sel}</em>`;
        else if(cmd==='h1') insert=`<h1>${sel}</h1>`;
        else if(cmd==='h2') insert=`<h2>${sel}</h2>`;
        else if(cmd==='ul') insert=`<ul><li>${sel}</li></ul>`;
        else if(cmd==='link') { const url=prompt('URL','https://'); if(!url) return; insert=`<a href="${url}">${sel}</a>`; }
        const next = form.data.content.substring(0,start)+insert+form.data.content.substring(end);
        form.setData('content', next);
        setTimeout(()=>{ ta.focus(); ta.setSelectionRange(start, start+insert.length); },0);
    };

    const submit=(e)=>{
        e.preventDefault();
        form.put(route('admin.pages.update', page.id), {
            preserveScroll:true,
            onSuccess:()=> toast.success('Page saved'),
            onError:()=> toast.error('Failed to save'),
        });
    };

    return (
        <AdminLayout header={`Edit — ${page.title}`}>
            {flash?.success && <div className="mb-4 bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-3 rounded-xl text-sm font-bold">{flash.success}</div>}
            <Link href={route('admin.pages.index')} className="text-sm font-bold text-gray-600 hover:text-slate-900">← Back to Pages</Link>
            <form onSubmit={submit} className="mt-4 bg-white border border-gray-200 rounded-xl overflow-hidden">
                <div className="p-5 grid md:grid-cols-2 gap-4 border-b">
                    <div>
                        <label className="text-xs font-black uppercase text-gray-500">Title *</label>
                        <input value={form.data.title} onChange={e=>form.setData('title', e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm font-bold" />
                        {form.errors.title && <div className="text-xs text-rose-600 mt-1">{form.errors.title}</div>}
                    </div>
                    <div>
                        <label className="text-xs font-black uppercase text-gray-500">Slug *</label>
                        <input value={form.data.slug} onChange={e=>form.setData('slug', e.target.value)} className="mt-1 w-full px-3 py-2.5 border rounded-lg text-sm font-mono" />
                        {form.errors.slug && <div className="text-xs text-rose-600 mt-1">{form.errors.slug}</div>}
                        <div className="text-[11px] text-gray-500 mt-1">Public URL: /pages/{form.data.slug}</div>
                    </div>
                </div>
                <div className="p-5">
                    <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-black uppercase text-gray-500">Content</label>
                        <div className="inline-flex rounded-full border p-1 bg-gray-50">
                            <button type="button" onClick={()=>setMode('visual')} className={`px-3 py-1 rounded-full text-xs font-black ${mode==='visual'?'bg-slate-900 text-white':'text-gray-600'}`}>Visual</button>
                            <button type="button" onClick={()=>setMode('html')} className={`px-3 py-1 rounded-full text-xs font-black ${mode==='html'?'bg-slate-900 text-white':'text-gray-600'}`}>HTML</button>
                        </div>
                    </div>
                    <div className="border border-gray-200 rounded-xl overflow-hidden">
                        <Toolbar onExec={exec} />
                        {mode==='visual' ? (
                            <textarea id="content-area" value={form.data.content} onChange={e=>form.setData('content', e.target.value)} rows={14} className="w-full px-4 py-3 text-sm leading-relaxed outline-none font-medium" placeholder="<h1>About TrustedMart</h1><p>Our story...</p>" />
                        ) : (
                            <textarea value={form.data.content} onChange={e=>form.setData('content', e.target.value)} rows={14} className="w-full px-4 py-3 font-mono text-xs bg-slate-900 text-emerald-200 outline-none" />
                        )}
                    </div>
                    {form.errors.content && <div className="text-xs text-rose-600 mt-1">{form.errors.content}</div>}
                    <div className="mt-4 flex gap-2">
                        <button disabled={form.processing} className="px-6 py-2.5 bg-slate-900 text-white rounded-full font-black text-sm disabled:opacity-60">Save Page</button>
                        <a href={`/pages/${page.slug}`} target="_blank" className="px-6 py-2.5 border rounded-full font-bold text-sm hover:bg-gray-50">Preview</a>
                    </div>
                    <div className="mt-6 border-t pt-4">
                        <div className="text-xs font-black uppercase text-gray-500 mb-2">Live Preview</div>
                        <div className="prose prose-sm max-w-none border rounded-xl p-4 bg-gray-50" dangerouslySetInnerHTML={{__html: form.data.content || '<p class="text-gray-400">Nothing to preview</p>'}} />
                    </div>
                </div>
            </form>
        </AdminLayout>
    );
}
