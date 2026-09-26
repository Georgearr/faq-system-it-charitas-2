import React, { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { faqService } from '@/services/faqService';
import { FAQ, FAQCategory } from '@/types';
import { Search, HelpCircle, ShieldAlert, ArrowRight, ThumbsUp, ThumbsDown } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { EmptyState } from '@/components/ui/EmptyState';

export const FAQPage: React.FC = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const catParam = searchParams.get('cat') || 'all';
  const queryParam = searchParams.get('q') || '';

  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [faqs, setFaqs] = useState<FAQ[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(catParam);
  const [searchQuery, setSearchQuery] = useState<string>(queryParam);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function init() {
      try {
        setLoading(true);
        const [catList, faqList] = await Promise.all([
          faqService.getCategories(),
          faqService.getFAQs(),
        ]);
        setCategories(catList);
        setFaqs(faqList);
      } finally {
        setLoading(false);
      }
    }
    void init();
  }, []);

  useEffect(() => {
    setSelectedCategory(catParam);
  }, [catParam]);

  const handleCategorySelect = (catId: string) => {
    setSelectedCategory(catId);
    const newParams = new URLSearchParams(searchParams);
    if (catId === 'all') {
      newParams.delete('cat');
    } else {
      newParams.set('cat', catId);
    }
    setSearchParams(newParams);
  };

  const handleSearchChange = (val: string) => {
    setSearchQuery(val);
    const newParams = new URLSearchParams(searchParams);
    if (val.trim()) {
      newParams.set('q', val.trim());
    } else {
      newParams.delete('q');
    }
    setSearchParams(newParams);
  };

  const filteredFaqs = faqs.filter((faq) => {
    const matchesCat = selectedCategory === 'all' || faq.categoryId === selectedCategory;
    const q = searchQuery.toLowerCase().trim();
    const matchesSearch =
      !q ||
      faq.question.toLowerCase().includes(q) ||
      faq.answer.toLowerCase().includes(q) ||
      faq.keywords.some((k) => k.toLowerCase().includes(q));
    return matchesCat && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 mb-1">
            <HelpCircle className="w-4 h-4" />
            <span>Knowledge Base</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900">Hospital IT FAQ & Solutions</h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Standard troubleshooting procedures, credentials policy, and hospital systems guidance.
          </p>
        </div>

        {/* Search input */}
        <div className="relative max-w-xl">
          <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => handleSearchChange(e.target.value)}
            placeholder="Filter questions by keyword (e.g. Wi-Fi, printer, barcode, EMR)..."
            className="w-full pl-10 pr-4 py-2 bg-slate-50 rounded-lg border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 focus:border-sky-600 focus:bg-white transition-all shadow-2xs"
          />
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap items-center gap-1.5 pt-1">
          <button
            onClick={() => handleCategorySelect('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
              selectedCategory === 'all'
                ? 'bg-sky-600 text-white font-semibold shadow-xs'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            All Categories ({faqs.length})
          </button>
          {categories.map((c) => {
            const count = faqs.filter((f) => f.categoryId === c.categoryId).length;
            const isSelected = selectedCategory === c.categoryId;
            return (
              <button
                key={c.categoryId}
                onClick={() => handleCategorySelect(c.categoryId)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white font-semibold shadow-xs'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {c.name} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* FAQ Listing */}
      {loading ? (
        <div className="py-16 flex justify-center"><Spinner size="lg" /></div>
      ) : filteredFaqs.length === 0 ? (
        <EmptyState
          icon={<HelpCircle className="w-10 h-10 text-slate-300" />}
          title="No FAQ articles matched your query"
          description={`We couldn't find an answer for "${searchQuery}". Please submit a ticket to the IT service desk.`}
          action={
            <Link to="/issues/new">
              <Button variant="primary" size="sm" leftIcon={<ShieldAlert className="w-4 h-4" />}>
                Submit an IT Issue
              </Button>
            </Link>
          }
        />
      ) : (
        <div className="space-y-3">
          {filteredFaqs.map((faq) => {
            const category = categories.find((c) => c.categoryId === faq.categoryId);
            return (
              <Card key={faq.faqId} className="hover:border-sky-300 transition-colors">
                <div className="space-y-2.5">
                  <div className="flex items-start justify-between gap-4">
                    <Link
                      to={`/faq/${faq.faqId}`}
                      className="text-base font-semibold text-slate-900 hover:text-sky-600 transition-colors flex items-center gap-2 group"
                    >
                      <span>{faq.question}</span>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-sky-600 group-hover:translate-x-1 transition-all" />
                    </Link>
                    {category && (
                      <Badge variant="neutral" size="sm" className="shrink-0">
                        {category.name}
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    {faq.answer}
                  </p>
                  <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-2xs text-slate-400">
                    <div className="flex items-center gap-2">
                      {faq.keywords.map((kw) => (
                        <span key={kw} className="bg-slate-100 px-2 py-0.5 rounded text-slate-600">
                          #{kw}
                        </span>
                      ))}
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="flex items-center gap-1 text-slate-500">
                        <ThumbsUp className="w-3 h-3 text-emerald-600" />
                        <span>{faq.helpfulCount || 0}</span>
                      </span>
                      <span className="flex items-center gap-1 text-slate-500">
                        <ThumbsDown className="w-3 h-3 text-slate-400" />
                        <span>{faq.unhelpfulCount || 0}</span>
                      </span>
                    </div>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
};
