import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { faqService } from '@/services/faqService';
import { FAQ, FAQCategory } from '@/types';
import { ArrowLeft, ThumbsUp, ThumbsDown, HelpCircle, ShieldAlert, Check } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Spinner } from '@/components/ui/Spinner';
import { useUIStore } from '@/store/uiStore';

export const FAQDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [faq, setFaq] = useState<FAQ | null>(null);
  const [category, setCategory] = useState<FAQCategory | null>(null);
  const [relatedFaqs, setRelatedFaqs] = useState<FAQ[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [feedbackSent, setFeedbackSent] = useState<boolean>(false);
  const { addToast } = useUIStore();

  useEffect(() => {
    async function loadFaq() {
      if (!id) return;
      try {
        setLoading(true);
        const item = await faqService.getFAQ(id);
        if (item) {
          setFaq(item);
          const [cats, allFaqs] = await Promise.all([
            faqService.getCategories(),
            faqService.getFAQs(item.categoryId),
          ]);
          setCategory(cats.find((c) => c.categoryId === item.categoryId) || null);
          setRelatedFaqs(allFaqs.filter((f) => f.faqId !== item.faqId).slice(0, 3));
        }
      } finally {
        setLoading(false);
      }
    }
    void loadFaq();
  }, [id]);

  const handleFeedback = async (isHelpful: boolean) => {
    if (!id || feedbackSent) return;
    try {
      const counts = await faqService.submitFeedback(id, isHelpful);
      if (faq) {
        setFaq({
          ...faq,
          helpfulCount: counts.helpfulCount,
          unhelpfulCount: counts.unhelpfulCount,
        });
      }
      setFeedbackSent(true);
      addToast('success', 'Thank you for your feedback! It helps IT improve documentation.');
    } catch {
      addToast('error', 'Failed to register feedback.');
    }
  };

  if (loading) {
    return (
      <div className="py-20 flex justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  if (!faq) {
    return (
      <div className="text-center py-16 space-y-4">
        <h2 className="text-lg font-bold text-slate-800">FAQ Article Not Found</h2>
        <p className="text-xs text-slate-500">The knowledge article you requested does not exist or was retired.</p>
        <Link to="/faq">
          <Button variant="outline" size="sm" leftIcon={<ArrowLeft className="w-4 h-4" />}>
            Back to FAQ
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/faq"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to all questions</span>
        </Link>
      </div>

      {/* Main Article Card */}
      <Card className="p-8">
        <div className="space-y-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Badge variant="primary">{category ? category.name : 'General IT'}</Badge>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-400">Article #{faq.faqId}</span>
            </div>
            <h1 className="text-2xl font-bold text-slate-900 leading-snug">{faq.question}</h1>
          </div>

          <div className="prose prose-sm max-w-none text-slate-700 leading-relaxed whitespace-pre-line border-t border-b border-slate-100 py-6">
            {faq.answer}
          </div>

          {/* Keywords */}
          {faq.keywords && faq.keywords.length > 0 && (
            <div className="flex items-center gap-2 flex-wrap text-xs text-slate-500">
              <span className="font-semibold text-slate-600">Keywords:</span>
              {faq.keywords.map((kw) => (
                <span key={kw} className="bg-slate-100 text-slate-700 px-2 py-0.5 rounded text-2xs">
                  #{kw}
                </span>
              ))}
            </div>
          )}

          {/* Feedback section */}
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-200/80 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div>
              <div className="text-xs font-semibold text-slate-800">Was this article helpful?</div>
              <div className="text-2xs text-slate-500 mt-0.5">
                {faq.helpfulCount || 0} users found this helpful
              </div>
            </div>

            <div className="flex items-center gap-2">
              {feedbackSent ? (
                <div className="inline-flex items-center gap-1.5 text-xs text-emerald-600 font-semibold bg-emerald-50 px-3 py-1.5 rounded-lg border border-emerald-200">
                  <Check className="w-4 h-4" />
                  <span>Feedback recorded</span>
                </div>
              ) : (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />}
                    onClick={() => handleFeedback(true)}
                  >
                    Yes, Helpful
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    leftIcon={<ThumbsDown className="w-3.5 h-3.5 text-rose-500" />}
                    onClick={() => handleFeedback(false)}
                  >
                    No
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>
      </Card>

      {/* Still need help? CTA */}
      <div className="bg-white rounded-xl border border-slate-200 p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-amber-50 text-amber-600 border border-amber-200 flex items-center justify-center shrink-0">
            <HelpCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-900">Still having trouble?</h4>
            <p className="text-xs text-slate-500 mt-0.5">
              Submit a service ticket and our hospital IT technicians will respond promptly.
            </p>
          </div>
        </div>
        <Link to="/issues/new">
          <Button variant="primary" size="sm" leftIcon={<ShieldAlert className="w-4 h-4" />}>
            Submit Ticket
          </Button>
        </Link>
      </div>

      {/* Related Articles */}
      {relatedFaqs.length > 0 && (
        <div className="space-y-3 pt-2">
          <h3 className="text-sm font-bold text-slate-900">Related Articles in this Category</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {relatedFaqs.map((rel) => (
              <Card key={rel.faqId} className="hover:border-sky-300 transition-colors p-4">
                <Link to={`/faq/${rel.faqId}`} className="block">
                  <h4 className="text-xs font-semibold text-slate-900 hover:text-sky-600 transition-colors line-clamp-1">
                    {rel.question}
                  </h4>
                  <p className="text-2xs text-slate-500 mt-1 line-clamp-2">{rel.answer}</p>
                </Link>
              </Card>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
