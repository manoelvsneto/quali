import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Plus, X } from 'lucide-react';

interface MemoEditorProps {
  projectId: string;
}

export const MemoEditor = ({ projectId }: MemoEditorProps) => {
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const queryClient = useQueryClient();

  const createMemo = useMutation({
    mutationFn: async () => {
      await api.post(`/projects/${projectId}/memos`, {
        content,
        tags,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['memos', projectId] });
      setContent('');
      setTags([]);
      setTagInput('');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (content.trim()) {
      createMemo.mutate();
    }
  };

  const addTag = () => {
    if (tagInput.trim() && !tags.includes(tagInput.trim())) {
      setTags([...tags, tagInput.trim()]);
      setTagInput('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="text-lg font-semibold mb-4">Create New Memo</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Content</label>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="input"
            rows={6}
            placeholder="Write your memo here..."
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Tags (optional)</label>
          <div className="flex gap-2 mb-2">
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault();
                  addTag();
                }
              }}
              className="input flex-1"
              placeholder="Add a tag"
            />
            <button
              type="button"
              onClick={addTag}
              className="btn btn-secondary"
            >
              <Plus size={16} />
            </button>
          </div>
          
          {tags.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {tags.map((tag) => (
                <span
                  key={tag}
                  className="px-3 py-1 bg-blue-100 text-blue-700 rounded-full text-sm flex items-center gap-2"
                >
                  {tag}
                  <button
                    type="button"
                    onClick={() => removeTag(tag)}
                    className="hover:bg-blue-200 rounded-full p-0.5"
                  >
                    <X size={14} />
                  </button>
                </span>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={createMemo.isPending}
          className="btn btn-primary w-full"
        >
          {createMemo.isPending ? 'Creating...' : 'Create Memo'}
        </button>
      </div>
    </form>
  );
};
