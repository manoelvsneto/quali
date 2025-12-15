import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Project } from '../../types';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { ProjectForm } from './ProjectForm';
import { EditProjectModal } from './EditProjectModal';

export const ProjectList = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | null>(null);

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get<Project[]>('/projects');
      return response.data;
    },
  });

  const deleteProject = useMutation({
    mutationFn: async (projectId: string) => {
      await api.delete(`/projects/${projectId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projects'] });
    },
  });

  const handleDelete = (projectId: string, projectName: string) => {
    if (window.confirm(`Are you sure you want to delete "${projectName}"? This will delete all documents, codes, quotations, and memos in this project.`)) {
      deleteProject.mutate(projectId);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading projects...</div>;
  }

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Projects</h1>
        <button
          onClick={() => setShowForm(true)}
          className="btn btn-primary flex items-center gap-2"
        >
          <Plus size={20} />
          New Project
        </button>
      </div>

      {projects && projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => (
            <div
              key={project._id}
              className="card hover:shadow-lg transition-shadow group relative"
            >
              <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setEditingProject(project);
                  }}
                  className="p-2 text-blue-600 hover:bg-blue-50 rounded"
                  title="Edit project"
                >
                  <Edit2 size={16} />
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(project._id, project.name);
                  }}
                  className="p-2 text-red-600 hover:bg-red-50 rounded"
                  title="Delete project"
                >
                  <Trash2 size={16} />
                </button>
              </div>

              <div
                onClick={() => navigate(`/projects/${project._id}`)}
                className="cursor-pointer"
              >
                <h3 className="text-xl font-semibold mb-2 pr-20">{project.name}</h3>
                <p className="text-gray-600">{project.description || 'No description'}</p>
                <div className="text-sm text-gray-500 mt-4">
                  Created {new Date(project.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-600 mb-4">No projects yet</p>
          <button
            onClick={() => setShowForm(true)}
            className="btn btn-primary"
          >
            Create Your First Project
          </button>
        </div>
      )}

      {showForm && <ProjectForm onClose={() => setShowForm(false)} />}
      
      {editingProject && (
        <EditProjectModal
          project={editingProject}
          onClose={() => setEditingProject(null)}
        />
      )}
    </div>
  );
};
