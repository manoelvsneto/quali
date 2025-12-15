import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Article } from '../../types';
import { FileText, Trash2, Plus } from 'lucide-react';
import { useState } from 'react';

interface ArticlesListProps {
  projectId: string;
}

export const ArticlesList = ({ projectId }: ArticlesListProps) => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newTitle, setNewTitle] = useState('');

  const { data: articles } = useQuery({
    queryKey: ['articles', projectId],
    queryFn: async () => {
      const response = await api.get<Article[]>(`/projects/${projectId}/articles`);
      return response.data;
    },
  });

  const createMutation = useMutation({
    mutationFn: async (title: string) => {
      await api.post(`/projects/${projectId}/articles`, { title });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles', projectId] });
      setShowCreateForm(false);
      setNewTitle('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: async (articleId: string) => {
      await api.delete(`/articles/${articleId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['articles', projectId] });
    },
  });

  const handleCreate = () => {
    if (newTitle.trim()) {
      createMutation.mutate(newTitle);
    }
  };

  const handleDelete = (articleId: string, title: string) => {
    if (window.confirm(`Delete article "${title}"?`)) {
      deleteMutation.mutate(articleId);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">LaTeX Articles</h3>
        <button
          onClick={() => setShowCreateForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={16} />
          New Article
        </button>
      </div>

      {showCreateForm && (
        <div className="card">
          <h4 className="font-medium mb-3">Create New Article</h4>
          <input
            type="text"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            placeholder="Article title..."
            className="input mb-3"
            autoFocus
          />
          <div className="flex gap-2">
            <button
              onClick={handleCreate}
              disabled={!newTitle.trim() || createMutation.isPending}
              className="btn btn-primary"
            >
              Create
            </button>
            <button
              onClick={() => {
                setShowCreateForm(false);
                setNewTitle('');
              }}
              className="btn btn-secondary"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {articles && articles.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {articles.map((article) => (
            <div
              key={article._id}
              className="card hover:shadow-lg transition-shadow group relative cursor-pointer"
              onClick={() => navigate(`/articles/${article._id}`)}
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDelete(article._id, article.title);
                }}
                className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <Trash2 size={16} />
              </button>

              <div className="flex items-start gap-3">
                <FileText className="text-green-600 mt-1" size={24} />
                <div className="flex-1 min-w-0">
                  <h4 className="font-semibold truncate pr-8">{article.title}</h4>
                  <p className="text-sm text-gray-500 mt-1">
                    LaTeX • {new Date(article.updatedAt).toLocaleDateString()}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
          <p>No articles yet. Create your first LaTeX article.</p>
        </div>
      )}
    </div>
  );
};
