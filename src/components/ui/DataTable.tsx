
interface Column<T> {
  key:       string;
  header:    string;
  sortable?: boolean;
  render:    (row: T) => React.ReactNode;
}

interface Props<T> {
  columns:    Column<T>[];
  data:       T[];
  keyField:   keyof T;
  emptyText?: string;
}

export default function DataTable<T>({ columns, data, keyField, emptyText = 'No data found.' }: Props<T>) {
  if (data.length === 0) {
    return (
      <div className="text-center py-10 text-gray-400 text-sm">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-sm">
        <thead className="bg-gray-50">
          <tr>
            {columns.map(col => (
              <th key={col.key} className="text-left px-4 py-3 text-xs font-medium text-gray-500">
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {data.map(row => (
            <tr key={String(row[keyField])} className="hover:bg-gray-50/50 transition-colors">
              {columns.map(col => (
                <td key={col.key} className="px-4 py-3">
                  {col.render(row)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}