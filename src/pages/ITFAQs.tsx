import React, { useEffect, useState } from 'react';
import { faqService } from '@/services/faqService';
import { useUIStore } from '@/store/uiStore';
import { FAQ, FAQCategory, FAQStatus } from '@/types';
import {
  Plus,
  Edit2,
  Trash2,
  Search,
  CheckCircle2,
  ThumbsUp,
  ThumbsDown,
} from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Modal } from '@/components/ui/Modal';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { Spinner } from '@/components/ui/Spinner';

export const ITFAQs: React.FC = () => {
  const { addToast } = useUIStore();
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<FAQ | null>(null);
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [status, setStatus] = useState<FAQStatus>('published');
  const [keywords, setKeywords] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      const [allFaqs, catList] = await Promise.all([
        faqService.getFAQs(),
        faqService.getCategories(),
      ]);
      setFaqs(allFaqs);
      setCategories(catList);
      if (catList.length > 0 && catList[0]) {
        setCategoryId(catList[0].categoryId);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void loadData();
  }, []);

  const openCreateModal = () => {
    setEditingFaq(null);
    setQuestion('');
    setAnswer('');
    setStatus('published');
    setKeywords('');
    if (categories.length > 0 && categories[0]) {
      setCategoryId(categories[0].categoryId);
    }
    setIsModalOpen(true);
  };

  const openEditModal = (faq: FAQ) => {
    setEditingFaq(faq);
    setQuestion(faq.question);
    setAnswer(faq.answer);
    setCategoryId(faq.categoryId);
    setStatus(faq.status);
    setKeywords(faq.keywords.join(', '));
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!question.trim() || !answer.trim() || !categoryId) return;

    try {
      setIsSaving(true);
      const kwList = keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean);

      if (editingFaq) {
        await faqService.updateFAQ(editingFaq.faqId, {
          question: question.trim(),
          answer: answer.trim(),
          categoryId,
          status,
          keywords: kwList,
        });
        addToast('success', 'FAQ updated successfully.');
      } else {
        await faqService.createFAQ({
          question: question.trim(),
          answer: answer.trim(),
          categoryId,
          status,
          keywords: kwList,
        });
        addToast('success', 'New FAQ article published.');
      }

      setIsModalOpen(false);
      void loadData();
    } catch (err) {
      addToast('error', err instanceof Error ? err.message : 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this FAQ?')) return;
    try {
      await faqService.deleteFAQ(id);
      addToast('info', 'FAQ article removed.');
      void loadData();
    } catch {
      addToast('error', 'Failed to delete FAQ.');
    }
  };

  const filteredFaqs = faqs.filter(
    (f) =>
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 tracking-tight">Knowledge Base Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Author and publish self-service guides for Charitas hospital staff.
          </p>
        </div>

        <Button variant="primary" size="md" onClick={openCreateModal} leftIcon={<Plus className="w-4 h-4" />}>
          Create FAQ Article
        </Button>
      </div>

      <Card className="p-4 flex items-center justify-between gap-4">
        <div className="relative max-w-sm w-full">
          <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Search FAQ articles..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 bg-slate-50 rounded-lg border border-slate-200 text-xs focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 focus:bg-white"
          />
        </div>

        <div className="text-xs text-slate-500">
          Showing {filteredFaqs.length} of {faqs.length} articles
        </div>
      </Card>

      {loading ? (
        <div className="py-20 flex justify-center"><Spinner size="lg" /></div>
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const cat = categories.find((c) => c.categoryId === faq.categoryId);
            return (
              <Card key={faq.faqId} className="p-5 hover:border-slate-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Badge variant="primary">{cat ? cat.name : 'General'}</Badge>
                      <Badge variant={faq.status === 'published' ? 'success' : 'neutral'}>
                        {faq.status.toUpperCase()}
                      </Badge>
                      <span className="text-2xs font-mono text-slate-400">#{faq.faqId}</span>
                    </div>

                    <h3 className="text-base font-bold text-slate-900">{faq.question}</h3>
                    <p className="text-xs text-slate-600 leading-relaxed whitespace-pre-line">
                      {faq.answer}
                    </p>

                    <div className="flex items-center gap-3 pt-2 text-2xs text-slate-400">
                      <span className="flex items-center gap-1">
                        <ThumbsUp className="w-3 h-3 text-emerald-600" />
                        <span>{faq.helpfulCount || 0} helpful</span>
                      </span>
                      <span className="flex items-center gap-1">
                        <ThumbsDown className="w-3 h-3 text-slate-400" />
                        <span>{faq.unhelpfulCount || 0} unhelpful</span>
                      </span>
                      <span>•</span>
                      <span>Keywords: {faq.keywords.join(', ') || 'None'}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    <Button variant="outline" size="sm" onClick={() => openEditModal(faq)} leftIcon={<Edit2 className="w-3.5 h-3.5" />}>
                      Edit
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(faq.faqId)} className="text-rose-600 hover:text-rose-700">
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* Create / Edit FAQ Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingFaq ? 'Edit FAQ Article' : 'Create New FAQ Article'}
        maxWidth="lg"
      >
        <form onSubmit={handleSave} className="space-y-4">
          <Input
            label="Question / Subject *"
            placeholder="e.g. How do I request toner replacement?"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="System Category *"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              required
            >
              {categories.map((c) => (
                <option key={c.categoryId} value={c.categoryId}>
                  {c.name}
                </option>
              ))}
            </Select>

            <Select
              label="Publication Status *"
              value={status}
              onChange={(e) => setStatus(e.target.value as FAQStatus)}
              required
            >
              <option value="published">Published</option>
              <option value="draft">Draft</option>
              <option value="archived">Archived</option>
            </Select>
          </div>

          <Textarea
            label="Answer & Step-by-Step Resolution *"
            placeholder="Explain clear clinical or technical guidance..."
            rows={5}
            value={answer}
            onChange={(e) => setAnswer(e.target.value)}
            required
          />

          <Input
            label="Search Keywords (comma separated)"
            placeholder="e.g. wifi, tablet, peap, domain"
            value={keywords}
            onChange={(e) => setKeywords(e.target.value)}
            helperText="Staff searching for any of these terms will locate this guide."
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <Button type="button" variant="ghost" size="md" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" size="md" isLoading={isSaving} leftIcon={<CheckCircle2 className="w-4 h-4" />}>
              {editingFaq ? 'Update Article' : 'Publish Article'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
