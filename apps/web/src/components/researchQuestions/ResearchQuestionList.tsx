import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { ResearchQuestion } from '../../types';
import { Trash2, Edit2 } from 'lucide-react';

interface ResearchQuestionListProps {
  researchQuestions: ResearchQuestion[];
  projectId: string;
}

export const ResearchQuestionList = ({ researchQuestions, projectId }: ResearchQuestionListProps) => {
  const queryClient = useQueryClient();

  const deleteRQ = useMutation({
    mutationFn: async (rqId: string) => {
      await api.delete(`/research-questions/${rqId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['research-questions', projectId] });
    },
  });

  const handleDelete = (rqId: string, question: string) => {
    if (window.confirm(`Are you sure you want to delete this research question?\n\n"${question}"`)) {
      deleteRQ.mutate(rqId);
    }
  };

  return (
    <div className="space-y-4">
      {researchQuestions.map((rq) => (
        <div key={rq._id} className="card group relative">
          <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleDelete(rq._id, rq.question)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Delete research question"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="pr-16">
            <h4 className="font-semibold text-lg mb-2">{rq.question}</h4>
            {rq.description && (
              <p className="text-gray-600 text-sm mb-3">{rq.description}</p>
            )}

            {Array.isArray(rq.codeIds) && rq.codeIds.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {rq.codeIds.map((code: any) => (
                  <span
                    key={code._id}
                    className="px-3 py-1 rounded text-sm text-white"
                    style={{ backgroundColor: code.color }}
                  >
                    {code.name}
                  </span>
                ))}
              </div>
            )}

            <div className="text-xs text-gray-500 mt-3">
              Created {new Date(rq.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
