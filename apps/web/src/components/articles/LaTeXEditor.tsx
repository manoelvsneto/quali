import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Article } from '../../types';
import { Save, Eye, EyeOff, BookOpen, Download, ArrowLeft, FileText, Loader2 } from 'lucide-react';

export const LaTeXEditor = () => {
  const { articleId } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [content, setContent] = useState('');
  const [showPreview, setShowPreview] = useState(true);
  const [autoSave, setAutoSave] = useState(true);
  const [isCompiling, setIsCompiling] = useState(false);
  const [compiledPdfUrl, setCompiledPdfUrl] = useState<string | null>(null);
  const [compileError, setCompileError] = useState<string | null>(null);

  const { data: article } = useQuery({
    queryKey: ['article', articleId],
    queryFn: async () => {
      const response = await api.get<Article>(`/articles/${articleId}`);
      return response.data;
    },
    enabled: !!articleId,
  });

  useEffect(() => {
    if (article) {
      setContent(article.latexContent);
    }
  }, [article]);

  const saveMutation = useMutation({
    mutationFn: async (latexContent: string) => {
      await api.put(`/articles/${articleId}`, { latexContent });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['article', articleId] });
    },
  });

  // Auto-save
  useEffect(() => {
    if (!autoSave || !content || content === article?.latexContent) return;

    const timer = setTimeout(() => {
      saveMutation.mutate(content);
    }, 2000);

    return () => clearTimeout(timer);
  }, [content, autoSave]);

  const handleManualSave = () => {
    saveMutation.mutate(content);
  };

  const handleCompile = async () => {
    setIsCompiling(true);
    setCompileError(null);

    try {
      const response = await api.post(`/articles/${articleId}/compile`, {}, {
        responseType: 'blob',
      });

      const blob = response.data;
      const url = URL.createObjectURL(blob);
      
      if (compiledPdfUrl) {
        URL.revokeObjectURL(compiledPdfUrl);
      }
      
      setCompiledPdfUrl(url);
    } catch (error: any) {
      console.error('Compilation error:', error);
      
      let errorMessage = 'Failed to compile LaTeX. ';
      
      if (error.response?.status === 500) {
        errorMessage += 'Please check your LaTeX syntax. Common issues: missing packages, unmatched braces, undefined commands.';
      } else if (error.message?.includes('timeout')) {
        errorMessage += 'Compilation took too long. Try simplifying your document.';
      } else {
        errorMessage += error.response?.data?.message || 'Server error occurred.';
      }
      
      setCompileError(errorMessage);
    } finally {
      setIsCompiling(false);
    }
  };

  const handleDownloadTex = () => {
    const blob = new Blob([content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${article?.title || 'article'}.tex`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = () => {
    if (compiledPdfUrl) {
      const a = document.createElement('a');
      a.href = compiledPdfUrl;
      a.download = `${article?.title || 'article'}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  const highlightLatex = (text: string) => {
    // Highlight básico de comandos LaTeX
    return text
      .replace(/(\\[a-zA-Z]+)/g, '<span class="text-blue-600">$1</span>')
      .replace(/(\{|\})/g, '<span class="text-purple-600">$1</span>')
      .replace(/(%.+$)/gm, '<span class="text-gray-500 italic">$1</span>');
  };

  if (!article) return <div className="p-8">Loading...</div>;

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="bg-white border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              onClick={() => navigate(`/projects/${article.projectId}`)}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
            >
              <ArrowLeft size={20} />
            </button>
            <div>
              <h1 className="text-xl font-bold">{article.title}</h1>
              <p className="text-sm text-gray-500">
                {saveMutation.isPending ? 'Saving...' : 'Saved'} • Auto-save: {autoSave ? 'ON' : 'OFF'}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={autoSave}
                onChange={(e) => setAutoSave(e.target.checked)}
                className="rounded"
              />
              Auto-save
            </label>

            <button
              onClick={handleManualSave}
              className="btn btn-secondary flex items-center gap-2"
              disabled={saveMutation.isPending}
            >
              <Save size={16} />
              Save
            </button>

            <button
              onClick={handleCompile}
              disabled={isCompiling}
              className="btn btn-primary flex items-center gap-2"
            >
              {isCompiling ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  Compiling...
                </>
              ) : (
                <>
                  <FileText size={16} />
                  Compile PDF
                </>
              )}
            </button>

            <button
              onClick={() => setShowPreview(!showPreview)}
              className="btn btn-secondary flex items-center gap-2"
            >
              {showPreview ? <EyeOff size={16} /> : <Eye size={16} />}
              {showPreview ? 'Hide' : 'Show'} Preview
            </button>
          </div>
        </div>
      </div>

      {/* Editor + Preview */}
      <div className="flex-1 flex overflow-hidden">
        {/* Editor LaTeX */}
        <div className={showPreview ? 'w-1/2 border-r' : 'w-full'}>
          <textarea
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-full p-6 font-mono text-sm resize-none focus:outline-none bg-gray-900 text-gray-100"
            spellCheck={false}
            placeholder="Write your LaTeX content here..."
            style={{
              tabSize: 2,
              lineHeight: '1.6',
            }}
          />
        </div>

        {/* PDF Preview */}
        {showPreview && (
          <div className="w-1/2 bg-gray-50 flex flex-col">
            <div className="bg-white border-b px-4 py-3 flex items-center justify-between">
              <h3 className="font-semibold text-gray-700">PDF Preview</h3>
              {compiledPdfUrl && (
                <button
                  onClick={handleDownloadPdf}
                  className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
                >
                  <Download size={14} />
                  Download PDF
                </button>
              )}
            </div>

            <div className="flex-1 overflow-auto">
              {compileError && (
                <div className="m-4 p-4 bg-red-50 border border-red-200 rounded-lg">
                  <p className="text-sm text-red-800 font-medium">Compilation Error</p>
                  <p className="text-sm text-red-600 mt-1">{compileError}</p>
                </div>
              )}

              {compiledPdfUrl ? (
                <div className="h-full">
                  <iframe
                    src={compiledPdfUrl}
                    className="w-full h-full border-0"
                    title="PDF Preview"
                  />
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center h-full p-8 text-center">
                  <FileText size={64} className="text-gray-300 mb-4" />
                  <h3 className="text-lg font-medium text-gray-700 mb-2">
                    No PDF Preview Yet
                  </h3>
                  <p className="text-sm text-gray-500 mb-4">
                    Click "Compile PDF" to generate a preview of your LaTeX document
                  </p>
                  <button
                    onClick={handleCompile}
                    disabled={isCompiling}
                    className="btn btn-primary flex items-center gap-2"
                  >
                    {isCompiling ? (
                      <>
                        <Loader2 size={16} className="animate-spin" />
                        Compiling...
                      </>
                    ) : (
                      <>
                        <FileText size={16} />
                        Compile Now
                      </>
                    )}
                  </button>

                  <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-md">
                    <p className="text-xs text-blue-800">
                      <strong>💡 Note:</strong> Compilation uses either local pdflatex (if installed) 
                      or an online LaTeX compiler as fallback. Make sure your document has valid LaTeX syntax.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Toolbar inferior */}
      <div className="bg-white border-t px-6 py-3 flex items-center justify-between text-sm">
        <div className="text-gray-600">
          Lines: {content.split('\n').length} • Characters: {content.length}
        </div>
        <div className="flex items-center gap-4">
          <button 
            onClick={() => navigate(`/projects/${article.projectId}`)}
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            <BookOpen size={14} />
            View Project Bibliography
          </button>
          <button 
            onClick={handleDownloadTex}
            className="text-blue-600 hover:underline flex items-center gap-1"
          >
            <Download size={14} />
            Download .tex
          </button>
        </div>
      </div>
    </div>
  );
};
