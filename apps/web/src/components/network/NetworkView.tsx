import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Code, Quotation, Document } from '../../types';
import { NetworkGraph } from './NetworkGraph';

type NetworkType = 'codes' | 'quotations' | 'combined' | 'stats';

interface NetworkStats {
  codeCoOccurrence: Map<string, { count: number; code1: Code; code2: Code }>;
  quotationsByCode: Map<string, Quotation[]>;
  documentsByCode: Map<string, Set<string>>;
}

export const NetworkView = () => {
  const { projectId } = useParams();
  const [networkType, setNetworkType] = useState<NetworkType>('codes');
  const [stats, setStats] = useState<NetworkStats>({
    codeCoOccurrence: new Map(),
    quotationsByCode: new Map(),
    documentsByCode: new Map(),
  });

  const { data: codes } = useQuery({
    queryKey: ['codes', projectId],
    queryFn: async () => {
      const response = await api.get<Code[]>(`/projects/${projectId}/codes`);
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
    enabled: !!projectId,
  });

  const { data: allQuotations } = useQuery({
    queryKey: ['all-quotations', projectId],
    queryFn: async () => {
      const response = await api.get<Quotation[]>(`/projects/${projectId}/query`);
      return response.data;
    },
    enabled: !!projectId,
  });

  useEffect(() => {
    if (!codes || !allQuotations) return;

    const codeCoOccurrence = new Map<string, { count: number; code1: Code; code2: Code }>();
    const quotationsByCode = new Map<string, Quotation[]>();
    const documentsByCode = new Map<string, Set<string>>();

    codes.forEach((code) => {
      quotationsByCode.set(code._id, []);
      documentsByCode.set(code._id, new Set());
    });

    allQuotations.forEach((quotation) => {
      if (!quotation.codeIds || !Array.isArray(quotation.codeIds)) {
        return;
      }

      const quotCodes = quotation.codeIds.filter(code => code && code._id);

      quotCodes.forEach((code) => {
        if (!code || !code._id) return;
        
        const quots = quotationsByCode.get(code._id) || [];
        quots.push(quotation);
        quotationsByCode.set(code._id, quots);

        const docId = typeof quotation.documentId === 'object' && quotation.documentId
          ? quotation.documentId._id 
          : quotation.documentId;
        
        if (docId) {
          const docs = documentsByCode.get(code._id) || new Set();
          docs.add(docId);
          documentsByCode.set(code._id, docs);
        }
      });

      for (let i = 0; i < quotCodes.length; i++) {
        for (let j = i + 1; j < quotCodes.length; j++) {
          const code1 = quotCodes[i];
          const code2 = quotCodes[j];
          
          if (!code1 || !code2 || !code1._id || !code2._id) continue;
          
          const key = [code1._id, code2._id].sort().join('-');
          
          const existing = codeCoOccurrence.get(key);
          if (existing) {
            existing.count++;
          } else {
            codeCoOccurrence.set(key, { count: 1, code1, code2 });
          }
        }
      }
    });

    setStats({ codeCoOccurrence, quotationsByCode, documentsByCode });
  }, [codes, allQuotations]);

  if (!codes || !documents || !allQuotations) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="h-full flex flex-col">
      <div className="bg-white border-b px-8 py-4">
        <h1 className="text-3xl font-bold mb-4">Network Visualization</h1>
        
        <div className="flex gap-4">
          <button
            onClick={() => setNetworkType('codes')}
            className={`px-4 py-2 rounded ${
              networkType === 'codes' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Codes Network
          </button>
          <button
            onClick={() => setNetworkType('quotations')}
            className={`px-4 py-2 rounded ${
              networkType === 'quotations' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Quotations Network
          </button>
          <button
            onClick={() => setNetworkType('combined')}
            className={`px-4 py-2 rounded ${
              networkType === 'combined' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Combined Network
          </button>
          <button
            onClick={() => setNetworkType('stats')}
            className={`px-4 py-2 rounded ${
              networkType === 'stats' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700'
            }`}
          >
            Statistics
          </button>
        </div>

        <div className="mt-4 flex gap-6 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded bg-gray-600"></div>
            <span>Documents</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rotate-45 bg-yellow-400"></div>
            <span>Quotations</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 rounded-full bg-blue-500"></div>
            <span>Codes</span>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-hidden">
        {networkType === 'stats' ? (
          <div className="h-full overflow-auto p-8">
            <div className="max-w-4xl mx-auto space-y-6">
              <h2 className="text-2xl font-semibold">Network Statistics</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="card">
                  <div className="text-3xl font-bold text-blue-600">{codes.length}</div>
                  <div className="text-sm text-gray-600">Total Codes</div>
                </div>
                <div className="card">
                  <div className="text-3xl font-bold text-yellow-600">{allQuotations.length}</div>
                  <div className="text-sm text-gray-600">Total Quotations</div>
                </div>
                <div className="card">
                  <div className="text-3xl font-bold text-gray-600">{documents.length}</div>
                  <div className="text-sm text-gray-600">Total Documents</div>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="h-full bg-gray-50 p-4">
            <NetworkGraph
              codes={codes}
              quotations={allQuotations}
              documents={documents}
              type={networkType as 'codes' | 'quotations' | 'combined'}
            />
          </div>
        )}
      </div>

      <div className="bg-white border-t px-8 py-4">
        <div className="flex gap-8 text-sm">
          <div>
            <span className="font-semibold">Total Codes:</span> {codes.length}
          </div>
          <div>
            <span className="font-semibold">Total Quotations:</span> {allQuotations.length}
          </div>
          <div>
            <span className="font-semibold">Total Documents:</span> {documents.length}
          </div>
          <div>
            <span className="font-semibold">Co-occurrences:</span> {stats.codeCoOccurrence.size}
          </div>
        </div>
      </div>
    </div>
  );
};