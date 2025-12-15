import { Trash2 } from 'lucide-react';
import { Code } from '../../types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface CodeListProps {
  codes: Code[];
  compact?: boolean;
  projectId?: string;
}

export const CodeList = ({ codes, compact = false, projectId }: CodeListProps) => {
  const queryClient = useQueryClient();

  const deleteCode = useMutation({
    mutationFn: async (codeId: string) => {
      await api.delete(`/codes/${codeId}`);
    },
    onSuccess: () => {
      if (projectId) {
        queryClient.invalidateQueries({ queryKey: ['codes', projectId] });
      }
    },
  });

  const handleDelete = (codeId: string, codeName: string) => {
    if (window.confirm(`Are you sure you want to delete the code "${codeName}"? This will remove it from all quotations.`)) {
      deleteCode.mutate(codeId);
    }
  };

  return (
    <div className="space-y-2">
      {codes.map((code) => (
        <div
          key={code._id}
          className={`flex items-center justify-between gap-3 ${compact ? 'p-2' : 'p-3 bg-white rounded-lg shadow-sm'} group`}
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-4 h-4 rounded flex-shrink-0" style={{ backgroundColor: code.color }} />
            <div className="flex-1 min-w-0">
              <div className="font-medium truncate">{code.name}</div>
              {!compact && code.description && (
                <div className="text-sm text-gray-600 truncate">{code.description}</div>
              )}
            </div>
          </div>
          
          {projectId && (
            <button
              onClick={() => handleDelete(code._id, code.name)}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-600 hover:bg-red-50 rounded"
              title="Delete code"
            >
              <Trash2 size={16} />
            </button>
          )}
        </div>
      ))}
    </div>
  );
};
