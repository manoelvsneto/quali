import { Download, ZoomIn, ZoomOut, Maximize } from 'lucide-react';

interface NetworkControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onExport: () => void;
}

export const NetworkControls = ({ onZoomIn, onZoomOut, onFit, onExport }: NetworkControlsProps) => {
  return (
    <div className="absolute top-4 right-4 bg-white rounded-lg shadow-lg p-2 flex flex-col gap-2">
      <button
        onClick={onZoomIn}
        className="p-2 hover:bg-gray-100 rounded"
        title="Zoom In"
      >
        <ZoomIn size={20} />
      </button>
      <button
        onClick={onZoomOut}
        className="p-2 hover:bg-gray-100 rounded"
        title="Zoom Out"
      >
        <ZoomOut size={20} />
      </button>
      <button
        onClick={onFit}
        className="p-2 hover:bg-gray-100 rounded"
        title="Fit to Screen"
      >
        <Maximize size={20} />
      </button>
      <button
        onClick={onExport}
        className="p-2 hover:bg-gray-100 rounded"
        title="Export as PNG"
      >
        <Download size={20} />
      </button>
    </div>
  );
};
