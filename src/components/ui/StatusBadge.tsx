
const STYLES: Record<string, string> = {
  Approved:  'bg-green-100 text-green-700 border border-green-200',
  Rejected:  'bg-red-100 text-red-700 border border-red-200',
  Pending:   'bg-amber-100 text-amber-700 border border-amber-200',
  Cancelled: 'bg-gray-100 text-gray-500 border border-gray-200',
  Processed: 'bg-blue-100 text-blue-700 border border-blue-200',
};

interface Props {
  status: string;
}

export default function StatusBadge({ status }: Props) {
  return (
    <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${STYLES[status] ?? 'bg-gray-100 text-gray-500'}`}>
      {status}
    </span>
  );
}