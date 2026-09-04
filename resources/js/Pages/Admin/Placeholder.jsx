import AdminLayout from '@/Layouts/AdminLayout';

export default function Placeholder({ page }) {
    return (
        <AdminLayout header={page}>
            <div className="bg-white border rounded-xl p-8 text-center">
                <h2 className="text-xl font-black mb-2">{page} — Coming Soon</h2>
                <p className="text-gray-500 text-sm">This section is scaffolded (routes/admin.php) and will be completed in Phase 3 per spec. The migration + layout are already in place.</p>
                <div className="mt-4 text-xs text-gray-400">Spec §3.{page} • Soft deletes, indexes, DataTable component ready.</div>
            </div>
        </AdminLayout>
    );
}
