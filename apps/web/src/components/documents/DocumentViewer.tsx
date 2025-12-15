import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Document, Code, Quotation } from '../../types';
import { CodeList } from '../codes/CodeList';
import { QuotationModal } from './QuotationModal';
import { PDFViewer } from './PDFViewer';
import { AIChatPanel } from './AIChatPanel';
import { Trash2, ArrowLeft, BookOpen, MessageSquare } from 'lucide-react';

export const DocumentViewer = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  
  const [selectedText, setSelectedText] = useState<{ start: number; end: number; text: string } | null>(null);
  const [showQuotationModal, setShowQuotationModal] = useState(false);
  const [showBibtex, setShowBibtex] = useState(false);
  const [rightPanel, setRightPanel] = useState<'quotations' | 'ai'>('quotations');

  const { data: document } = useQuery({
    queryKey: ['document', id],
    queryFn: async () => {
      const response = await api.get<Document>(`/documents/${id}`);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: quotations } = useQuery({
    queryKey: ['quotations', id],
    queryFn: async () => {
      const response = await api.get<Quotation[]>(`/documents/${id}/quotations`);
      return response.data;
    },
    enabled: !!id,
  });

  const { data: codes } = useQuery({
    queryKey: ['codes', document?.projectId],
    queryFn: async () => {
      const response = await api.get<Code[]>(`/projects/${document?.projectId}/codes`);
      return response.data;
    },
    enabled: !!document?.projectId,
  });

  const deleteDocument = useMutation({
    mutationFn: async () => {
      await api.delete(`/documents/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['documents'] });
      navigate(`/projects/${document?.projectId}`);
    },
  });

  const deleteQuotation = useMutation({
    mutationFn: async (quotationId: string) => {
      await api.delete(`/quotations/${quotationId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations', id] });
    },
  });

  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete "${document?.title}"?`)) {
      deleteDocument.mutate();
    }
  };

  const handleDeleteQuotation = (quotationId: string) => {
    if (window.confirm('Are you sure you want to delete this quotation?')) {
      deleteQuotation.mutate(quotationId);
    }
  };

  const handleTextSelection = () => {
    const selection = window.getSelection();
    if (!selection || selection.toString().length === 0) return;

    const range = selection.getRangeAt(0);
    const selectedText = selection.toString();
    
    const preSelectionRange = range.cloneRange();
    preSelectionRange.selectNodeContents(range.startContainer.parentElement!);
    preSelectionRange.setEnd(range.startContainer, range.startOffset);
    
    const start = preSelectionRange.toString().length;
    const end = start + selectedText.length;

    setSelectedText({ start, end, text: selectedText });
    setShowQuotationModal(true);
  };

  const highlightText = (text: string) => {
    if (!quotations || quotations.length === 0) return text;

    const sorted = [...quotations].sort((a, b) => a.startOffset - b.startOffset);
    const parts: JSX.Element[] = [];
    let lastIndex = 0;

    sorted.forEach((q, idx) => {
      if (q.startOffset > lastIndex) {
        parts.push(<span key={`text-${idx}`}>{text.slice(lastIndex, q.startOffset)}</span>);
      }

      const colors = q.codeIds.map((c) => c.color);
      const bgColor = colors[0] || '#3B82F6';

      parts.push(
        <mark
          key={`quote-${idx}`}
          style={{ backgroundColor: bgColor + '40', cursor: 'pointer' }}
          className="rounded px-1"
          title={q.codeIds.map((c) => c.name).join(', ')}
        >
          {q.exactText}
        </mark>
      );

      lastIndex = q.endOffset;
    });

    if (lastIndex < text.length) {
      parts.push(<span key="text-end">{text.slice(lastIndex)}</span>);
    }

    return parts;
  };

  if (!document) return <div className="p-8">Loading...</div>;

  const isPDF = document.type.toLowerCase() === 'pdf';

  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button
            onClick={() => navigate(`/projects/${document.projectId}`)}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft size={20} />
            Back to Project
          </button>
          <h1 className="text-xl font-semibold">{document.title}</h1>
          {document.bibtex && (
            <button
              onClick={() => setShowBibtex(!showBibtex)}
              className="btn btn-secondary flex items-center gap-2"
              title="View BibTeX"
            >
              <BookOpen size={16} />
              BibTeX
            </button>
          )}
        </div>
        
        <button
          onClick={handleDelete}
          className="btn btn-danger flex items-center gap-2"
        >
          <Trash2 size={18} />
          Delete
        </button>
      </div>

      {/* BibTeX Modal */}
      {showBibtex && document.bibtex && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-2xl max-h-[80vh] overflow-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">BibTeX Citation</h2>
              <button
                onClick={() => setShowBibtex(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </button>
            </div>
            
            <pre className="bg-gray-50 p-4 rounded font-mono text-sm overflow-x-auto">
              {document.bibtex}
            </pre>
            
            <div className="mt-4 flex gap-2">
              <button
                onClick={() => {
                  navigator.clipboard.writeText(document.bibtex!);
                  alert('BibTeX copied to clipboard!');
                }}
                className="btn btn-primary"
              >
                Copy to Clipboard
              </button>
              <button
                onClick={() => setShowBibtex(false)}
                className="btn btn-secondary"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r bg-white p-4 overflow-y-auto">
          <h3 className="font-semibold mb-4">Codes</h3>
          {codes && <CodeList codes={codes} compact />}
        </div>

        <div className="flex-1 overflow-hidden">
          {isPDF ? (
            <PDFViewer
              documentId={id!}
              onTextSelect={(selection) => {
                setSelectedText(selection);
                setShowQuotationModal(true);
              }}
            />
          ) : (
            <div className="h-full overflow-y-auto p-8">
              <div className="max-w-4xl mx-auto">
                <div
                  className="prose prose-lg max-w-none bg-white p-8 rounded-lg shadow"
                  onMouseUp={handleTextSelection}
                >
                  {highlightText(document.textContent)}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right: Quotations */}
        <div className="w-80 border-l bg-white flex flex-col">
          {/* Tabs */}
          <div className="border-b flex">
            <button
              onClick={() => setRightPanel('quotations')}
              className={`flex-1 px-4 py-3 text-sm font-medium ${
                rightPanel === 'quotations'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              Quotations ({quotations?.length || 0})
            </button>
            <button
              onClick={() => setRightPanel('ai')}
              className={`flex-1 px-4 py-3 text-sm font-medium flex items-center justify-center gap-2 ${
                rightPanel === 'ai'
                  ? 'border-b-2 border-indigo-600 text-indigo-600'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              <MessageSquare size={16} />
              AI Chat
            </button>
          </div>

          {/* Content */}
          <div className="flex-1 overflow-y-auto p-4">
            {rightPanel === 'quotations' ? (
              <div className="space-y-3">
                {quotations?.map((q) => (
                  <div key={q._id} className="p-3 bg-gray-50 rounded-lg text-sm group relative">
                    <button
                      onClick={() => handleDeleteQuotation(q._id)}
                      className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity p-1 text-red-600 hover:bg-red-100 rounded"
                      title="Delete quotation"
                    >
                      <Trash2 size={14} />
                    </button>
                    
                    <div className="font-medium mb-2 pr-6">"{q.exactText.slice(0, 50)}..."</div>
                    <div className="flex flex-wrap gap-1">
                      {q.codeIds.map((code) => (
                        <span
                          key={code._id}
                          className="px-2 py-1 rounded text-xs text-white"
                          style={{ backgroundColor: code.color }}
                        >
                          {code.name}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <AIChatPanel documentId={id!} />
            )}
          </div>
        </div>

        {showQuotationModal && selectedText && codes && (
          <QuotationModal
            documentId={id!}
            selection={selectedText}
            codes={codes}
            onClose={() => {
              setShowQuotationModal(false);
              setSelectedText(null);
            }}
          />
        )}
      </div>
    </div>
  );
};
