import { Trash2 } from 'lucide-react';
import { Quotation } from '../../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface QuotationsListProps {
  quotations: Quotation[];
  projectId: string;
}

export const QuotationsList = ({ quotations, projectId }: QuotationsListProps) => {
  const queryClient = useQueryClient();

  const deleteQuotation = useMutation({
    mutationFn: async (quotationId: string) => {
      await api.delete(`/quotations/${quotationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['all-quotations', projectId] });
    },
  });

  const handleDelete = (quotationId: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      deleteQuotation.mutate(quotationId);
    }
  };

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-4 py-2 text-left">Text</th>
            <th className="px-4 py-2 text-left">Codes</th>
            <th className="px-4 py-2 text-left">Date</th>
            <th className="px-4 py-2 text-left w-20">Actions</th>
          </tr>
        </thead>
        <tbody>
          {quotations?.map((q: any) => (
            <tr key={q._id} className="border-t group">
              <td className="px-4 py-3">{q.exactText.slice(0, 100)}...</td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {q.codeIds.map((c: any) => (
                    <span
                      key={c._id}
                      className="px-2 py-1 rounded text-xs text-white"
                      style={{ backgroundColor: c.color }}
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              </td>
              <td className="px-4 py-3 text-sm text-gray-600">
                {new Date(q.createdAt).toLocaleDateString()}
              </td>
              <td className="px-4 py-3">
                <button
                  onClick={() => handleDelete(q._id)}
                  className="opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete quotation"
                >
                  <Trash2 size={16} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
