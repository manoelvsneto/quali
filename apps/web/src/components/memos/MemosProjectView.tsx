import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Memo } from '../../types';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { MemoEditor } from './MemoEditor';

export const MemosProjectView = () => {
  const { projectId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const { data: memos } = useQuery({
    queryKey: ['memos', projectId],
    queryFn: async () => {
      const response = await api.get<Memo[]>(`/projects/${projectId}/memos`);
      return response.data;
    },
    enabled: !!projectId,
  });

  const deleteMemo = useMutation({
    mutationFn: async (memoId: string) => {
      await api.delete(`/memos/${memoId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memos', projectId] });
    },
  });

  const handleDelete = (memoId: string) => {
    if (window.confirm('Are you sure you want to delete this memo?')) {
      deleteMemo.mutate(memoId);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <button
          onClick={() => navigate('/memos')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
        >
          <ArrowLeft size={20} />
          Back to Projects
        </button>

        <h1 className="text-3xl font-bold mb-8">Memos</h1>

        <div className="mb-8">
          <MemoEditor projectId={projectId!} />
        </div>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">All Memos ({memos?.length || 0})</h2>
          
          {memos && memos.length > 0 ? (
            <div className="space-y-4">
              {memos.map((memo) => (
                <div key={memo._id} className="card group relative">
                  <button
                    onClick={() => handleDelete(memo._id)}
                    className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity p-2 text-red-600 hover:bg-red-50 rounded"
                    title="Delete memo"
                  >
                    <Trash2 size={16} />
                  </button>
                  
                  <div className="prose prose-sm max-w-none pr-16">
                    <p className="whitespace-pre-wrap">{memo.content}</p>
                  </div>
                  
                  {memo.tags && memo.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                      {memo.tags.map((tag, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs"
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                  
                  <div className="text-xs text-gray-500 mt-4">
                    {new Date(memo.createdAt).toLocaleString()}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-gray-500">
              <p>No memos yet. Create your first memo above.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
