import { useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Code } from '../../types';

interface ResearchQuestionEditorProps {
  projectId: string;
}

export const ResearchQuestionEditor = ({ projectId }: ResearchQuestionEditorProps) => {
  const [question, setQuestion] = useState('');
  const [description, setDescription] = useState('');
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const { data: codes } = useQuery({
    queryKey: ['codes', projectId],
    queryFn: async () => {
      const response = await api.get<Code[]>(`/projects/${projectId}/codes`);
      return response.data;
    },
  });

  const createRQ = useMutation({
    mutationFn: async () => {
      await api.post(`/projects/${projectId}/research-questions`, {
        question,
        description,
        codeIds: selectedCodes,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['research-questions', projectId] });
      setQuestion('');
      setDescription('');
      setSelectedCodes([]);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (question.trim()) {
      createRQ.mutate();
    }
  };

  const toggleCode = (codeId: string) => {
    setSelectedCodes(prev =>
      prev.includes(codeId)
        ? prev.filter(id => id !== codeId)
        : [...prev, codeId]
    );
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="text-lg font-semibold mb-4">Create Research Question</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Research Question</label>
          <input
            type="text"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="input"
            placeholder="e.g., How do users perceive...?"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Description (optional)</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            rows={3}
            placeholder="Additional context or notes..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Link to Codes (optional)</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-40 overflow-y-auto p-2 bg-gray-50 rounded">
            {codes?.map((code) => (
              <label key={code._id} className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={selectedCodes.includes(code._id)}
                  onChange={() => toggleCode(code._id)}
                  className="rounded"
                />
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded" style={{ backgroundColor: code.color }} />
                  <span className="text-sm">{code.name}</span>
                </div>
              </label>
            ))}
          </div>
        </div>

        <button
          type="submit"
          disabled={createRQ.isPending}
          className="btn btn-primary w-full"
        >
          {createRQ.isPending ? 'Creating...' : 'Create Research Question'}
        </button>
      </div>
    </form>
  );
};
