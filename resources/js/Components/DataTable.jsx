export default function DataTable({ columns, data, onSort }) {
    return (
        <div className="bg-white border border-gray-200 rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                    <thead>
                        <tr className="bg-gray-50 border-b text-gray-500 font-extrabold">
                            {columns.map(c=> <th key={c.key} className="px-4 py-3">{c.label}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {data.map((row,i)=> (
                            <tr key={i} className="border-b border-gray-100 hover:bg-gray-50">
                                {columns.map(c=> <td key={c.key} className="px-4 py-3">{c.render ? c.render(row[c.key], row) : row[c.key]}</td>)}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
