import { useState } from 'react';
import { Plus, Trash2, Edit2, Check, X } from 'lucide-react';
import { Author } from '../../types';

interface AuthorsManagerProps {
  authors: Author[];
  onChange: (authors: Author[]) => void;
}

export const AuthorsManager = ({ authors, onChange }: AuthorsManagerProps) => {
  const [isAdding, setIsAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [formData, setFormData] = useState<Author>({
    name: '',
    affiliation: '',
    email: '',
    orcid: '',
  });

  const handleAdd = () => {
    if (formData.name.trim()) {
      onChange([...authors, formData]);
      setFormData({ name: '', affiliation: '', email: '', orcid: '' });
      setIsAdding(false);
    }
  };

  const handleEdit = (index: number) => {
    setFormData(authors[index]);
    setEditingIndex(index);
    setIsAdding(true);
  };

  const handleUpdate = () => {
    if (editingIndex !== null && formData.name.trim()) {
      const updated = [...authors];
      updated[editingIndex] = formData;
      onChange(updated);
      setFormData({ name: '', affiliation: '', email: '', orcid: '' });
      setIsAdding(false);
      setEditingIndex(null);
    }
  };

  const handleDelete = (index: number) => {
    onChange(authors.filter((_, i) => i !== index));
  };

  const handleCancel = () => {
    setFormData({ name: '', affiliation: '', email: '', orcid: '' });
    setIsAdding(false);
    setEditingIndex(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <label className="block text-sm font-medium">Authors</label>
        {!isAdding && (
          <button
            type="button"
            onClick={() => setIsAdding(true)}
            className="text-sm text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            <Plus size={16} />
            Add Author
          </button>
        )}
      </div>

      {isAdding && (
        <div className="bg-gray-50 p-4 rounded-lg space-y-3">
          <div>
            <label className="block text-xs font-medium mb-1">Name *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="input text-sm"
              placeholder="Author name"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-medium mb-1">Affiliation</label>
            <input
              type="text"
              value={formData.affiliation}
              onChange={(e) => setFormData({ ...formData, affiliation: e.target.value })}
              className="input text-sm"
              placeholder="University or Institution"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium mb-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="input text-sm"
                placeholder="author@email.com"
              />
            </div>
            <div>
              <label className="block text-xs font-medium mb-1">ORCID</label>
              <input
                type="text"
                value={formData.orcid}
                onChange={(e) => setFormData({ ...formData, orcid: e.target.value })}
                className="input text-sm"
                placeholder="0000-0000-0000-0000"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={editingIndex !== null ? handleUpdate : handleAdd}
              className="btn btn-primary text-sm flex items-center gap-1"
            >
              <Check size={16} />
              {editingIndex !== null ? 'Update' : 'Add'}
            </button>
            <button
              type="button"
              onClick={handleCancel}
              className="btn btn-secondary text-sm flex items-center gap-1"
            >
              <X size={16} />
              Cancel
            </button>
          </div>
        </div>
      )}

      {authors.length > 0 && (
        <div className="space-y-2">
          {authors.map((author, index) => (
            <div key={index} className="bg-white border rounded-lg p-3 group">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="font-medium">{author.name}</div>
                  {author.affiliation && (
                    <div className="text-sm text-gray-600">{author.affiliation}</div>
                  )}
                  <div className="flex gap-4 mt-1 text-xs text-gray-500">
                    {author.email && <span>{author.email}</span>}
                    {author.orcid && <span>ORCID: {author.orcid}</span>}
                  </div>
                </div>
                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    type="button"
                    onClick={() => handleEdit(index)}
                    className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                    title="Edit author"
                  >
                    <Edit2 size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(index)}
                    className="p-1 text-red-600 hover:bg-red-50 rounded"
                    title="Delete author"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {authors.length === 0 && !isAdding && (
        <div className="text-sm text-gray-500 italic">
          No authors added yet
        </div>
      )}
    </div>
  );
};
