import React, { useEffect, useState } from 'react';
import { faqService } from '@/services/faqService';
import { useUIStore } from '@/store/uiStore';
import { FAQCategory } from '@/types';
import { FolderTree, Plus, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';

export const AdminCategories: React.FC = () => {
  const { addToast } = useUIStore();
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);

  // New Category Modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [saving, setSaving] = useState(false);

  const loadCategories = async () => {
    try {
      setLoading(true);
      const list = await faqService.getCategories();
      setCategories(list);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadCategories();
  }, []);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !description.trim()) return;

    setSaving(true);
    const newCat: FAQCategory = {
      categoryId: `cat_${name.toLowerCase().replace(/\W+/g, '_')}`,
      name: name.trim(),
      description: description.trim(),
      icon: 'Folder',
      status: 'active',
      sortOrder: categories.length + 1,
    };

    setCategories((prev) => [...prev, newCat]);
    addToast('success', `Category "${name}" created.`);
    setIsModalOpen(false);
    setName('');
    setDescription('');
    setSaving(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">System Service Categories</h1>
          <p className="text-xs text-slate-500 mt-1">
            Categorization structure for hospital issue routing and FAQ organization.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={() => setIsModalOpen(true)} leftIcon={<Plus className="w-4 h-4" />}>
          Add Category
        </Button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <Card key={c.categoryId} className="p-5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-xs">
                    <FolderTree className="w-4 h-4" />
                  </div>
                  <h3 className="text-sm font-bold text-slate-900">{c.name}</h3>
                </div>
                <Badge variant={c.status === 'active' ? 'success' : 'neutral'} size="sm">
                  {c.status.toUpperCase()}
                </Badge>
              </div>

              <p className="text-xs text-slate-600 leading-relaxed min-h-10">
                {c.description}
              </p>

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-2xs text-slate-400">
                <span className="font-mono">ID: {c.categoryId}</span>
                <span>Sort: {c.sortOrder}</span>
              </div>
            </Card>
          ))}
        </div>
      )}

      {/* Create Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Add System Service Category">
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Category Name *"
            placeholder="e.g. Telemedicine & Video Consultation"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />

          <Textarea
            label="Description *"
            placeholder="Explain what devices or systems fall under this category..."
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button type="button" variant="ghost" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={saving} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              Save Category
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
