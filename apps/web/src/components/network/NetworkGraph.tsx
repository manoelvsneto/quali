import { useEffect, useRef } from 'react';
import { Network } from 'vis-network';
import { Code, Quotation, Document, ResearchQuestion } from '../../types';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface NetworkGraphProps {
  codes: Code[];
  quotations: Quotation[];
  documents: Document[];
  researchQuestions?: ResearchQuestion[];
  type: 'codes' | 'quotations' | 'combined';
}

export const NetworkGraph = ({ codes, quotations, documents, researchQuestions, type }: NetworkGraphProps) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const networkRef = useRef<Network | null>(null);

  useEffect(() => {
    if (!containerRef.current || !codes || !quotations || !documents) return;

    const nodes: any[] = [];
    const edges: any[] = [];

    if (type === 'codes' || type === 'combined') {
      // Add code nodes
      codes.forEach((code) => {
        if (!code || !code._id) return; // Verificação
        
        const quotCount = quotations.filter((q) => 
          q.codeIds && Array.isArray(q.codeIds) && q.codeIds.some((c) => c && c._id === code._id)
        ).length;
        
        nodes.push({
          id: `code-${code._id}`,
          label: code.name,  // Nome visível no nó
          color: {
            background: code.color,
            border: code.color,
            highlight: {
              background: code.color,
              border: '#000000',
            }
          },
          shape: 'dot',
          size: Math.max(quotCount * 3 + 15, 20),
          group: 'code',
          title: `<b>${code.name}</b><br/>${quotCount} quotations`,
          font: {
            size: 14,
            color: '#ffffff',
            face: 'arial',
            background: 'rgba(0,0,0,0.5)',
          },
        });
      });

      // Create code co-occurrence edges
      const codeCoOccurrence = new Map<string, number>();
      
      quotations.forEach((quotation) => {
        if (!quotation.codeIds || !Array.isArray(quotation.codeIds)) return;
        
        const quotCodes = quotation.codeIds.filter(c => c && c._id);
        
        for (let i = 0; i < quotCodes.length; i++) {
          for (let j = i + 1; j < quotCodes.length; j++) {
            const code1 = quotCodes[i];
            const code2 = quotCodes[j];
            
            if (!code1 || !code2 || !code1._id || !code2._id) continue;
            
            const key = [code1._id, code2._id].sort().join('-');
            codeCoOccurrence.set(key, (codeCoOccurrence.get(key) || 0) + 1);
          }
        }
      });

      codeCoOccurrence.forEach((count, key) => {
        const [code1, code2] = key.split('-');
        edges.push({
          from: `code-${code1}`,
          to: `code-${code2}`,
          value: count,
          title: `${count} co-occurrences`,
          color: { color: '#94a3b8', opacity: 0.6 },
        });
      });
    }

    if (type === 'quotations' || type === 'combined') {
      // Add document nodes
      documents.forEach((doc) => {
        if (!doc || !doc._id) return; // Verificação
        
        const docQuotations = quotations.filter((q) => {
          if (!q) return false;
          const docId = typeof q.documentId === 'object' && q.documentId
            ? q.documentId._id 
            : q.documentId;
          return docId === doc._id;
        });
        
        nodes.push({
          id: `doc-${doc._id}`,
          label: doc.title.length > 25 ? doc.title.substring(0, 22) + '...' : doc.title,
          color: {
            background: '#64748b',
            border: '#475569',
          },
          shape: 'box',
          size: 25,
          group: 'document',
          title: `<b>${doc.title}</b><br/>${docQuotations.length} quotations`,
          font: {
            size: 12,
            color: '#ffffff',
          },
        });

        // Add quotation nodes for this document
        docQuotations.forEach((quotation, index) => {
          if (!quotation || !quotation._id) return; // Verificação
          
          const quotText = quotation.exactText?.substring(0, 30) || 'No text';
          
          nodes.push({
            id: `quot-${quotation._id}`,
            label: `Q${index + 1}`,  // Mostrar número da quotation
            color: {
              background: '#fbbf24',
              border: '#f59e0b',
            },
            shape: 'diamond',
            size: 15,
            group: 'quotation',
            title: `<b>Quotation ${index + 1}</b><br/>${quotText}...<br/><i>${quotation.codeIds.length} codes</i>`,
            font: {
              size: 10,
              color: '#000000',
            },
          });

          // Link quotation to document
          edges.push({
            from: `doc-${doc._id}`,
            to: `quot-${quotation._id}`,
            color: { color: '#cbd5e1' },
            arrows: 'to',
          });

          // Link quotation to codes
          if (quotation.codeIds && Array.isArray(quotation.codeIds)) {
            quotation.codeIds.forEach((code) => {
              if (!code || !code._id) return; // Verificação
              
              edges.push({
                from: `quot-${quotation._id}`,
                to: `code-${code._id}`,
                color: { color: code.color || '#3B82F6', opacity: 0.4 },
                arrows: 'to',
              });
            });
          }
        });
      });
    }

    // Add research question nodes
    if (researchQuestions && researchQuestions.length > 0) {
      researchQuestions.forEach((rq) => {
        nodes.push({
          id: `rq-${rq._id}`,
          label: rq.question.substring(0, 30) + '...',
          color: {
            background: '#8b5cf6',
            border: '#7c3aed',
          },
          shape: 'star',
          size: 25,
          group: 'research-question',
          title: `<b>Research Question</b><br/>${rq.question}`,
          font: {
            size: 12,
            color: '#ffffff',
          },
        });

        // Link research questions to codes
        if (Array.isArray(rq.codeIds)) {
          rq.codeIds.forEach((code: any) => {
            if (code && code._id) {
              edges.push({
                from: `rq-${rq._id}`,
                to: `code-${code._id}`,
                color: { color: '#a78bfa', opacity: 0.6 },
                arrows: 'to',
              });
            }
          });
        }
      });
    }

    const data = { nodes, edges };

    const options = {
      nodes: {
        font: {
          size: 14,
          color: '#ffffff',
          face: 'Arial',
          strokeWidth: 3,
          strokeColor: '#000000',
        },
        borderWidth: 2,
        borderWidthSelected: 4,
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.3)',
          size: 10,
          x: 3,
          y: 3,
        },
      },
      edges: {
        width: 2,
        smooth: {
          type: 'continuous',
        },
        shadow: {
          enabled: true,
          color: 'rgba(0,0,0,0.2)',
          size: 5,
          x: 2,
          y: 2,
        },
      },
      physics: {
        enabled: true,
        barnesHut: {
          gravitationalConstant: -3000,
          centralGravity: 0.3,
          springLength: 150,
          springConstant: 0.04,
          damping: 0.09,
          avoidOverlap: 0.8,
        },
        stabilization: {
          iterations: 200,
          updateInterval: 25,
        },
      },
      interaction: {
        hover: true,
        tooltipDelay: 100,
        zoomView: true,
        dragView: true,
        navigationButtons: true,
        keyboard: {
          enabled: true,
        },
      },
      groups: {
        code: {
          shape: 'dot',
        },
        quotation: {
          shape: 'diamond',
        },
        document: {
          shape: 'box',
        },
        'research-question': {
          shape: 'star',
        },
      },
    };

    networkRef.current = new Network(containerRef.current, data, options);

    // Auto-fit após estabilização
    networkRef.current.once('stabilizationIterationsDone', () => {
      networkRef.current?.fit({
        animation: {
          duration: 1000,
          easingFunction: 'easeInOutQuad',
        },
      });
    });

    networkRef.current.on('click', (params) => {
      if (params.nodes.length > 0) {
        const nodeId = params.nodes[0];
        const node = nodes.find(n => n.id === nodeId);
        if (node) {
          console.log('Clicked:', node.label, node);
        }
      }
    });

    return () => {
      networkRef.current?.destroy();
    };
  }, [codes, quotations, documents, researchQuestions, type]);

  const handleZoomIn = () => {
    const scale = networkRef.current?.getScale();
    if (scale) {
      networkRef.current?.moveTo({ scale: scale * 1.2 });
    }
  };

  const handleZoomOut = () => {
    const scale = networkRef.current?.getScale();
    if (scale) {
      networkRef.current?.moveTo({ scale: scale * 0.8 });
    }
  };

  const handleFit = () => {
    networkRef.current?.fit({
      animation: {
        duration: 500,
        easingFunction: 'easeInOutQuad',
      },
    });
  };

  return (
    <div className="relative w-full h-full">
      <div 
        ref={containerRef} 
        className="w-full h-full"
        style={{ minHeight: '600px' }}
      />
      
      {/* Controls */}
      <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
        <button
          onClick={handleZoomIn}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom In"
        >
          <ZoomIn size={20} />
        </button>
        <button
          onClick={handleZoomOut}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Zoom Out"
        >
          <ZoomOut size={20} />
        </button>
        <button
          onClick={handleFit}
          className="p-2 hover:bg-gray-100 rounded transition-colors"
          title="Fit to Screen"
        >
          <Maximize size={20} />
        </button>
      </div>

      {/* Info Panel */}
      <div className="absolute bottom-4 left-4 bg-white rounded-lg shadow-lg p-3 text-sm">
        <div className="font-semibold mb-2">Legend:</div>
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-blue-500"></div>
            <span>Codes (size = quotations)</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-gray-600"></div>
            <span>Documents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rotate-45 bg-yellow-400"></div>
            <span>Quotations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 star-shape bg-purple-500"></div>
            <span>Research Questions</span>
          </div>
        </div>
      </div>
    </div>
  );
};
