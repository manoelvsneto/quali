import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FileText, Code2, StickyNote, ArrowLeft, Upload, Trash2, Edit2, BookText } from 'lucide-react';
import { api } from '../../lib/api';
import { Project, Document, Code, Memo, ResearchQuestion } from '../../types';
import { DocumentUpload } from '../documents/DocumentUpload';
import { CodeList } from '../codes/CodeList';
import { MemoList } from '../memos/MemoList';
import { MemoEditor } from '../memos/MemoEditor';
import { EditProjectModal } from './EditProjectModal';
import { ResearchQuestionEditor } from '../researchQuestions/ResearchQuestionEditor';
import { ResearchQuestionList } from '../researchQuestions/ResearchQuestionList';
import { ArticlesList } from '../articles/ArticlesList';

type Tab = 'documents' | 'codes' | 'memos' | 'articles';

export const ProjectDetail = () => {
  const { projectId } = useParams<{ projectId: string }>();
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<Tab>('documents');
  const [showEditModal, setShowEditModal] = useState(false);

  const { data: project } = useQuery({
    queryKey: ['project', projectId],
    queryFn: async () => {
      const response = await api.get<Project>(`/projects/${projectId}`);
      return response.data;
    },
    enabled: !!projectId,
  });

  const { data: documents } = useQuery({
    queryKey: ['documents', projectId],
    queryFn: async () => {
      const response = await api.get<Document[]>(`/projects/${projectId}/documents`);
      return response.data;
    },
    enabled: !!projectId && activeTab === 'documents',
  });

  const { data: codes } = useQuery({
    queryKey: ['codes', projectId],
    queryFn: async () => {
      const response = await api.get<Code[]>(`/projects/${projectId}/codes`);
      return response.data;
    },
    enabled: !!projectId && activeTab === 'codes',
  });

  const { data: memos } = useQuery({
    queryKey: ['memos', projectId],
    queryFn: async () => {
      const response = await api.get<Memo[]>(`/projects/${projectId}/memos`);
      return response.data;
    },
    enabled: !!projectId && activeTab === 'memos',
  });

  const { data: researchQuestions } = useQuery({
    queryKey: ['research-questions', projectId],
    queryFn: async () => {
      const response = await api.get<ResearchQuestion[]>(`/projects/${projectId}/research-questions`);
      return response.data;
    },
    enabled: !!projectId && activeTab === 'research-questions',
  });

  const queryClient = useQueryClient();

  const deleteDocument = useMutation({
    mutationFn: async (documentId: string) => {
      await api.delete(`/documents/${documentId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
    },
  });

  const handleDeleteDocument = (docId: string, docTitle: string) => {
    if (window.confirm(`Are you sure you want to delete "${docTitle}"?`)) {
      deleteDocument.mutate(docId);
    }
  };

  if (!project) {
    return <div className="p-8">Loading...</div>;
  }

  const tabs = [
    { id: 'documents' as Tab, label: 'Documents', icon: FileText, count: documents?.length || 0 },
    { id: 'codes' as Tab, label: 'Codes', icon: Code2, count: codes?.length || 0 },
    { id: 'memos' as Tab, label: 'Memos', icon: StickyNote, count: memos?.length || 0 },
    { id: 'articles' as Tab, label: 'Articles', icon: BookText, count: 0 },
  ];

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-8 py-6">
        <button
          onClick={() => navigate('/projects')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
        >
          <ArrowLeft size={20} />
          Back to Projects
        </button>
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <h1 className="text-3xl font-bold">{project.name}</h1>
            {project.description && (
              <p className="text-gray-600 mt-2">{project.description}</p>
            )}
            
            {project.authors && project.authors.length > 0 && (
              <div className="mt-4 flex items-start gap-2">
                <Users size={16} className="text-gray-500 mt-1" />
                <div className="flex-1">
                  <div className="text-sm font-medium text-gray-700 mb-1">Authors:</div>
                  <div className="flex flex-wrap gap-3">
                    {project.authors.map((author, index) => (
                      <div key={index} className="bg-blue-50 px-3 py-1 rounded-full text-sm">
                        <span className="font-medium">{author.name}</span>
                        {author.affiliation && (
                          <span className="text-gray-600 ml-1">({author.affiliation})</span>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <button
            onClick={() => setShowEditModal(true)}
            className="btn btn-secondary flex items-center gap-2"
          >
            <Edit2 size={16} />
            Edit Project
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="bg-white border-b px-8">
        <div className="flex gap-8">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-3 border-b-2 transition-colors ${
                  activeTab === tab.id
                    ? 'border-blue-600 text-blue-600'
                    : 'border-transparent text-gray-600 hover:text-gray-900'
                }`}
              >
                <Icon size={20} />
                <span>{tab.label}</span>
                <span className="px-2 py-0.5 bg-gray-100 text-xs rounded-full">
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-auto p-8">
        {activeTab === 'documents' && (
          <div className="space-y-6">
            <DocumentUpload projectId={projectId!} />
            
            {documents && documents.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {documents.map((doc) => (
                  <div
                    key={doc._id}
                    className="card hover:shadow-lg transition-shadow group relative"
                  >
                    <div
                      onClick={() => navigate(`/documents/${doc._id}`)}
                      className="cursor-pointer"
                    >
                      <div className="flex items-start gap-3">
                        <FileText className="text-blue-600 mt-1" size={24} />
                        <div className="flex-1 min-w-0">
                          <h3 className="font-semibold truncate">{doc.title}</h3>
                          <p className="text-sm text-gray-500 mt-1">
                            {doc.type.toUpperCase()} • {new Date(doc.createdAt).toLocaleDateString()}
                          </p>
                          {doc.bibtex && (
                            <div className="flex items-center gap-1 mt-2 text-xs text-blue-600">
                              <BookOpen size={12} />
                              <span>Has BibTeX</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteDocument(doc._id, doc.title);
                      }}
                      className="absolute top-4 right-4 p-2 text-red-600 hover:bg-red-50 rounded opacity-0 group-hover:opacity-100 transition-opacity"
                      title="Delete document"
                    >
                      <Trash2 size={18} />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No documents yet. Upload your first document above.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'codes' && (
          <div className="space-y-6">
            <div className="card">
              <h3 className="text-lg font-semibold mb-4">Create New Code</h3>
              <CreateCodeForm projectId={projectId!} />
            </div>

            {codes && codes.length > 0 ? (
              <CodeList codes={codes} projectId={projectId} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <Code2 className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No codes yet. Create your first code above.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'memos' && (
          <div className="space-y-6">
            <MemoEditor projectId={projectId!} />
            
            {memos && memos.length > 0 ? (
              <MemoList projectId={projectId!} />
            ) : (
              <div className="text-center py-12 text-gray-500">
                <StickyNote className="w-12 h-12 mx-auto mb-4 opacity-50" />
                <p>No memos yet. Write your first memo above.</p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'articles' && (
          <ArticlesList projectId={projectId!} />
        )}
      </div>

      {showEditModal && (
        <EditProjectModal
          project={project}
          onClose={() => setShowEditModal(false)}
        />
      )}
    </div>
  );
};

// Component for creating codes
const CreateCodeForm = ({ projectId }: { projectId: string }) => {
  const [name, setName] = useState('');
  const [color, setColor] = useState('#3B82F6');
  const [description, setDescription] = useState('');
  const queryClient = useQueryClient();

  const createCode = useMutation({
    mutationFn: async (data: any) => {
      await api.post(`/projects/${projectId}/codes`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['codes', projectId] });
      setName('');
      setDescription('');
      setColor('#3B82F6');
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createCode.mutate({ name, color, description });
  };

  const colors = [
    '#3B82F6', '#EF4444', '#10B981', '#F59E0B', '#8B5CF6',
    '#EC4899', '#14B8A6', '#F97316', '#6366F1', '#84CC16',
  ];

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-sm font-medium mb-1">Code Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="input"
          required
          placeholder="e.g., Motivation, Barriers, etc."
        />
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Color</label>
        <div className="flex gap-2">
          {colors.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => setColor(c)}
              className={`w-8 h-8 rounded-full border-2 ${
                color === c ? 'border-gray-900 scale-110' : 'border-gray-300'
              } transition-transform`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium mb-1">Description (optional)</label>
        <textarea
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          className="input"
          rows={2}
          placeholder="Describe what this code represents..."
        />
      </div>

      <button type="submit" className="btn btn-primary w-full">
        Create Code
      </button>
    </form>
  );
};
