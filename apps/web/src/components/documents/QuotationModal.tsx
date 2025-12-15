import { useState } from 'react';
import { X } from 'lucide-react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../lib/api';
import { Code } from '../../types';

interface QuotationModalProps {
  documentId: string;
  selection: { start: number; end: number; text: string };
  codes: Code[];
  onClose: () => void;
}

export const QuotationModal = ({ documentId, selection, codes, onClose }: QuotationModalProps) => {
  const [selectedCodes, setSelectedCodes] = useState<string[]>([]);
  const queryClient = useQueryClient();

  const createQuotation = useMutation({
    mutationFn: async (data: any) => {
      await api.post('/quotations', data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['quotations', documentId] });
      onClose();
    },
  });

  const toggleCode = (codeId: string) => {
    setSelectedCodes((prev) =>
      prev.includes(codeId) ? prev.filter((id) => id !== codeId) : [...prev, codeId]
    );
  };

  const handleSubmit = () => {
    if (selectedCodes.length === 0) return;

    createQuotation.mutate({
      documentId,
      startOffset: selection.start,
      endOffset: selection.end,
      exactText: selection.text,
      codeIds: selectedCodes,
    });
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 w-full max-w-lg">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">Create Quotation</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <X size={24} />
          </button>
        </div>

        <div className="mb-4 p-3 bg-gray-50 rounded">
          <div className="text-sm text-gray-600 mb-1">Selected Text:</div>
          <div className="font-medium">"{selection.text.slice(0, 200)}..."</div>
        </div>

        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Select Codes:</label>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {codes.map((code) => (
              <label
                key={code._id}
                className="flex items-center gap-2 p-2 rounded hover:bg-gray-50 cursor-pointer"
              >
                <input
                  type="checkbox"
                  checked={selectedCodes.includes(code._id)}
                  onChange={() => toggleCode(code._id)}
                  className="w-4 h-4"
                />
                <span
                  className="w-4 h-4 rounded"
                  style={{ backgroundColor: code.color }}
                />
                <span>{code.name}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={handleSubmit}
            disabled={selectedCodes.length === 0 || createQuotation.isPending}
            className="btn btn-primary flex-1"
          >
            Create
          </button>
          <button onClick={onClose} className="btn btn-secondary">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
