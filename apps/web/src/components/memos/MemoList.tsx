import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Memo } from '../../types';
import { Trash2, Edit2, StickyNote } from 'lucide-react';

interface MemoListProps {
  projectId: string;
}

export const MemoList = ({ projectId }: MemoListProps) => {
  const queryClient = useQueryClient();

  const { data: memos } = useQuery({
    queryKey: ['memos', projectId],
    queryFn: async () => {
      const response = await api.get<Memo[]>(`/projects/${projectId}/memos`);
      return response.data;
    },
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
    <div className="space-y-4">
      {memos?.map((memo) => (
        <div key={memo._id} className="card group relative">
          <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              onClick={() => handleDelete(memo._id)}
              className="p-2 text-red-600 hover:bg-red-50 rounded"
              title="Delete memo"
            >
              <Trash2 size={16} />
            </button>
          </div>

          <div className="flex items-start gap-3">
            <StickyNote className="text-yellow-500 mt-1" size={20} />
            <div className="flex-1">
              <div className="text-sm text-gray-500 mb-2">
                {new Date(memo.createdAt).toLocaleDateString()}
              </div>
              <div className="prose prose-sm">{memo.content}</div>
              {memo.tags.length > 0 && (
                <div className="flex gap-2 mt-2">
                  {memo.tags.map((tag, idx) => (
                    <span key={idx} className="px-2 py-1 bg-gray-100 text-xs rounded">
                      {tag}
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};
