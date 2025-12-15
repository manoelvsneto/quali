import { useState } from 'react';
import { Upload } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';

interface DocumentUploadProps {
  projectId: string;
}

export const DocumentUpload = ({ projectId }: DocumentUploadProps) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState('');
  const [bibtex, setBibtex] = useState('');
  const [showBibtex, setShowBibtex] = useState(false);
  const queryClient = useQueryClient();

  const uploadMutation = useMutation({
    mutationFn: async () => {
      const formData = new FormData();
      formData.append('file', file!);
      if (title) formData.append('title', title);
      if (bibtex) formData.append('bibtex', bibtex);

      await api.post(`/projects/${projectId}/documents`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents', projectId] });
      setFile(null);
      setTitle('');
      setBibtex('');
      setShowBibtex(false);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (file) uploadMutation.mutate();
  };

  return (
    <form onSubmit={handleSubmit} className="card">
      <h3 className="text-lg font-semibold mb-4">Upload Document</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Title (optional)</label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="input"
            placeholder="Document title"
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">File (.txt, .docx, .pdf)</label>
          <input
            type="file"
            accept=".txt,.docx,.pdf"
            onChange={(e) => setFile(e.target.files?.[0] || null)}
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded file:border-0 file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
          />
        </div>

        <div>
          <button
            type="button"
            onClick={() => setShowBibtex(!showBibtex)}
            className="text-sm text-blue-600 hover:text-blue-700"
          >
            {showBibtex ? '− Hide' : '+ Add'} BibTeX/LaTeX Reference
          </button>
        </div>

        {showBibtex && (
          <div>
            <label className="block text-sm font-medium mb-1">
              BibTeX/LaTeX Citation
            </label>
            <textarea
              value={bibtex}
              onChange={(e) => setBibtex(e.target.value)}
              className="input font-mono text-sm"
              rows={8}
              placeholder={`@article{Author2024,
  author = {Author, First},
  title = {Document Title},
  journal = {Journal Name},
  year = {2024},
  volume = {1},
  pages = {1-10}
}`}
            />
            <p className="text-xs text-gray-500 mt-1">
              Paste your BibTeX citation here for bibliographic reference
            </p>
          </div>
        )}

        <button
          type="submit"
          disabled={!file || uploadMutation.isPending}
          className="btn btn-primary w-full flex items-center justify-center gap-2"
        >
          <Upload size={20} />
          {uploadMutation.isPending ? 'Uploading...' : 'Upload'}
        </button>
      </div>
    </form>
  );
};
