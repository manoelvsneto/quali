import { useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Download } from 'lucide-react';
import { QuotationsList } from './QuotationsList';

export const QueryPanel = () => {
  const { projectId } = useParams();
  const [filters, setFilters] = useState({ documentId: '', codeIds: '' });

  const { data: quotations, refetch } = useQuery({
    queryKey: ['query', projectId, filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.documentId) params.append('documentId', filters.documentId);
      if (filters.codeIds) params.append('codeIds', filters.codeIds);

      const response = await api.get(`/projects/${projectId}/query?${params}`);
      return response.data;
    },
    enabled: !!projectId,
  });

  const exportCSV = () => {
    if (!quotations) return;

    const csv = [
      ['Document', 'Text', 'Codes', 'Created At'],
      ...quotations.map((q: any) => [
        typeof q.documentId === 'object' ? q.documentId.title : q.documentId,
        q.exactText,
        q.codeIds.map((c: any) => c.name).join('; '),
        new Date(q.createdAt).toLocaleDateString(),
      ]),
    ]
      .map((row) => row.map((cell) => `"${cell}"`).join(','))
      .join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'quotations.csv';
    a.click();
  };

  return (
    <div className="p-8">
      <h1 className="text-3xl font-bold mb-6">Query & Export</h1>

      <div className="card mb-6">
        <h3 className="text-lg font-semibold mb-4">Filters</h3>
        <div className="grid grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Document ID"
            value={filters.documentId}
            onChange={(e) => setFilters({ ...filters, documentId: e.target.value })}
            className="input"
          />
          <input
            type="text"
            placeholder="Code IDs (comma-separated)"
            value={filters.codeIds}
            onChange={(e) => setFilters({ ...filters, codeIds: e.target.value })}
            className="input"
          />
        </div>
        <button onClick={() => refetch()} className="btn btn-primary mt-4">
          Search
        </button>
      </div>

      <div className="card">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold">
            Results ({quotations?.length || 0})
          </h3>
          <button onClick={exportCSV} className="btn btn-secondary flex items-center gap-2">
            <Download size={20} />
            Export CSV
          </button>
        </div>

        <QuotationsList quotations={quotations || []} projectId={projectId!} />
      </div>
    </div>
  );
};
