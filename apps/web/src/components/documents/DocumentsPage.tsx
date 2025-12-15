import { useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Project } from '../../types';
import { FileText } from 'lucide-react';

export const DocumentsPage = () => {
  const navigate = useNavigate();

  const { data: projects, isLoading } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await api.get<Project[]>('/projects');
      return response.data;
    },
  });

  if (isLoading) {
    return <div className="p-8">Loading projects...</div>;
  }

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <FileText className="w-16 h-16 mx-auto text-blue-600 mb-4" />
          <h2 className="text-3xl font-bold mb-2">Documents</h2>
          <p className="text-gray-600">
            Select a project to view and manage your documents
          </p>
        </div>

        {projects && projects.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {projects.map((project) => (
              <div
                key={project._id}
                onClick={() => navigate(`/projects/${project._id}`)}
                className="card hover:shadow-lg cursor-pointer transition-shadow"
              >
                <h3 className="text-xl font-semibold mb-2">{project.name}</h3>
                <p className="text-gray-600">
                  {project.description || 'No description'}
                </p>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600 mb-4">No projects yet</p>
            <button
              onClick={() => navigate('/projects')}
              className="btn btn-primary"
            >
              Create Your First Project
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
