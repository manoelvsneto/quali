import { useState } from 'react';
import { X } from 'lucide-react';
import { useCreateProject } from '../../hooks/useProject';
import { AuthorsManager } from './AuthorsManager';
import { Author } from '../../types';

interface ProjectFormProps {
  onClose: () => void;
}

export const ProjectForm = ({ onClose }: ProjectFormProps) => {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [authors, setAuthors] = useState<Author[]>([]);
  const createProject = useCreateProject();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createProject.mutate({ name, description, authors }, {
      onSuccess: () => onClose(),
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create New Project</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Project Name</label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="input"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="input"
              rows={3}
            />
          </div>

          <AuthorsManager authors={authors} onChange={setAuthors} />

          <div className="flex gap-2">
            <button type="submit" className="btn btn-primary flex-1">
              Create
            </button>
            <button type="button" onClick={onClose} className="btn btn-secondary">
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
