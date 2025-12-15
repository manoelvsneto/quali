import { useState, useEffect, useRef } from 'react';
import { useAuthStore } from '../../store/authStore';
import { Tag, X } from 'lucide-react';

interface PDFViewerProps {
  documentId: string;
  onTextSelect?: (selection: { start: number; end: number; text: string }) => void;
}

interface ContextMenuPosition {
  x: number;
  y: number;
  text: string;
}

export const PDFViewer = ({ documentId, onTextSelect }: PDFViewerProps) => {
  const [pdfUrl, setPdfUrl] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [contextMenu, setContextMenu] = useState<ContextMenuPosition | null>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const accessToken = useAuthStore((state) => state.accessToken);

  useEffect(() => {
    const fetchPDF = async () => {
      try {
        const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:4000';
        const url = `${apiUrl}/api/documents/${documentId}/file`;
        
        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${accessToken}`,
          },
        });
        
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType?.includes('pdf')) {
          throw new Error(`Expected PDF but got ${contentType}`);
        }
        
        const blob = await response.blob();
        
        if (blob.size === 0) {
          throw new Error('Empty PDF file');
        }
        
        const objectUrl = URL.createObjectURL(blob);
        setPdfUrl(objectUrl);
      } catch (err: any) {
        console.error('Error fetching PDF:', err);
        setError(err.message);
      }
    };

    if (accessToken && documentId) {
      fetchPDF();
    }

    return () => {
      if (pdfUrl) {
        URL.revokeObjectURL(pdfUrl);
      }
    };
  }, [documentId, accessToken]);

  // Detectar quando há texto selecionado e mostrar popup ao clicar
  useEffect(() => {
    const handleMouseUp = (e: MouseEvent) => {
      // Pequeno delay para garantir que a seleção foi completada
      setTimeout(() => {
        const selection = window.getSelection();
        const selectedText = selection?.toString().trim();

        if (selectedText && selectedText.length > 0) {
          // Posicionar popup próximo ao mouse
          setContextMenu({
            x: e.clientX,
            y: e.clientY,
            text: selectedText,
          });
        }
      }, 10);
    };

    // Fechar menu ao clicar fora
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      if (!target.closest('.context-menu') && !target.closest('iframe')) {
        // Se clicou fora do menu e não está selecionando texto
        const selection = window.getSelection();
        if (!selection?.toString().trim()) {
          setContextMenu(null);
        }
      }
    };

    document.addEventListener('mouseup', handleMouseUp);
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      document.removeEventListener('mouseup', handleMouseUp);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  const handleCreateQuotation = () => {
    if (contextMenu?.text && onTextSelect) {
      const start = 0;
      const end = contextMenu.text.length;
      onTextSelect({ start, end, text: contextMenu.text });
      setContextMenu(null);
      
      // Limpar seleção
      window.getSelection()?.removeAllRanges();
    }
  };

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full bg-gray-50 p-8">
        <div className="text-red-600 mb-4">Failed to load PDF</div>
        <div className="text-sm text-gray-600">{error}</div>
      </div>
    );
  }

  if (!pdfUrl) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="text-gray-600">Loading PDF...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full relative">
      {/* Instruções */}
      <div className="bg-blue-50 border-b border-blue-200 p-3">
        <div className="text-sm text-blue-800">
          <strong>💡 Como criar quotation:</strong> Selecione o texto no PDF (arraste o mouse) que um popup aparecerá automaticamente
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="flex-1 bg-gray-800">
        <iframe
          ref={iframeRef}
          src={pdfUrl}
          className="w-full h-full border-0"
          title="PDF Viewer"
        />
      </div>

      {/* Popup flutuante */}
      {contextMenu && (
        <div
          className="context-menu fixed bg-white rounded-lg shadow-2xl border border-gray-200 py-2 z-50 min-w-[280px] max-w-[400px]"
          style={{
            left: `${Math.min(contextMenu.x, window.innerWidth - 320)}px`,
            top: `${Math.min(contextMenu.y + 10, window.innerHeight - 200)}px`,
          }}
        >
          {/* Preview do texto selecionado */}
          <div className="px-4 py-2 border-b border-gray-100">
            <div className="text-xs text-gray-500 mb-1 font-medium">✓ Text selected:</div>
            <div className="text-sm text-gray-700 max-h-24 overflow-y-auto bg-gray-50 p-2 rounded">
              "{contextMenu.text.substring(0, 150)}
              {contextMenu.text.length > 150 ? '...' : ''}"
            </div>
            <div className="text-xs text-gray-400 mt-1">
              {contextMenu.text.length} characters
            </div>
          </div>

          {/* Botões de ação */}
          <div className="p-2">
            <button
              onClick={handleCreateQuotation}
              className="w-full px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center justify-center gap-2 font-medium mb-2"
            >
              <Tag size={18} />
              <span>Create Quotation & Add Codes</span>
            </button>

            <button
              onClick={() => setContextMenu(null)}
              className="w-full px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg transition-colors flex items-center justify-center gap-2 text-sm"
            >
              <X size={16} />
              <span>Cancel</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
