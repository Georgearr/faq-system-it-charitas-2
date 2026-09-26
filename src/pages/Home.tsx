import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { faqService } from '@/services/faqService';
import { FAQ, FAQCategory } from '@/types';
import { Search, ShieldAlert, FileSearch, HelpCircle, PhoneCall, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Card } from '@/components/ui/Card';
import { Spinner } from '@/components/ui/Spinner';

export const Home: React.FC = () => {
  const navigate = useNavigate();
  const [categories, setCategories] = useState<FAQCategory[]>([]);
  const [popularFaqs, setPopularFaqs] = useState<FAQ[]>([]);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [cats, faqs] = await Promise.all([
          faqService.getCategories(),
          faqService.getFAQs(),
        ]);
        setCategories(cats);
        setPopularFaqs(faqs.slice(0, 4));
      } finally {
        setLoading(false);
      }
    }
    void loadData();
  }, []);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      navigate(`/faq?q=${encodeURIComponent(search.trim())}`);
    } else {
      navigate('/faq');
    }
  };

  return (
    <div className="space-y-10">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 text-white p-8 sm:p-12 shadow-md">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-sky-500/20 text-sky-300 text-xs font-medium border border-sky-400/30">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Hospital IT Service Desk & Self-Service</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight leading-tight">
            How can the Charitas IT Team assist you today?
          </h1>

          <p className="text-sm sm:text-base text-slate-300 leading-relaxed max-w-2xl">
            Search our curated clinical & administrative knowledge base, submit technical incident tickets, or track resolution status in real time.
          </p>

          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="pt-2 max-w-xl flex gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3.5 top-3 w-5 h-5 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search issues, EMR errors, Wi-Fi, printer calibration..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white text-slate-900 placeholder:text-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-sky-400 shadow-sm"
              />
            </div>
            <Button type="submit" variant="primary" size="md">
              Search
            </Button>
          </form>

          {/* Quick links under hero */}
          <div className="flex flex-wrap items-center gap-3 pt-3 text-xs text-slate-300">
            <span className="font-semibold text-slate-400">Popular:</span>
            <Link to="/faq?q=EMR" className="hover:text-sky-300 underline underline-offset-2">EMR Record Unlock</Link>
            <span className="text-slate-600">•</span>
            <Link to="/faq?q=wifi" className="hover:text-sky-300 underline underline-offset-2">Staff Wi-Fi Setup</Link>
            <span className="text-slate-600">•</span>
            <Link to="/faq?q=printer" className="hover:text-sky-300 underline underline-offset-2">Pharmacy Label Printer</Link>
          </div>
        </div>
      </section>

      {/* Quick Action Tiles */}
      <section className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Link
          to="/issues/new"
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-sky-400 hover:shadow-xs transition-all flex items-start gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <ShieldAlert className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
              Submit an IT Issue
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Report hardware, software, or network issues. Guest & staff submission supported.
            </p>
          </div>
        </Link>

        <Link
          to="/issues/track"
          className="bg-white p-5 rounded-xl border border-slate-200 hover:border-sky-400 hover:shadow-xs transition-all flex items-start gap-4 group"
        >
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-100 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <FileSearch className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
              Track Guest Ticket
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              Check progress and reply using your private ticket reference token.
            </p>
          </div>
        </Link>

        <div className="bg-white p-5 rounded-xl border border-slate-200 flex items-start gap-4">
          <div className="w-10 h-10 rounded-xl bg-rose-50 text-rose-600 border border-rose-100 flex items-center justify-center shrink-0">
            <PhoneCall className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">
              Urgent IT Hotline
            </h3>
            <p className="text-xs text-slate-500 mt-1 leading-relaxed">
              For emergency clinical outages (ICU, ER, OR), call internal extension <span className="font-bold text-rose-600">1100</span>.
            </p>
          </div>
        </div>
      </section>

      {/* Categories Grid */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Browse Knowledge Categories</h2>
            <p className="text-xs text-slate-500 mt-0.5">Explore standard procedures and troubleshooting guides</p>
          </div>
          <Link to="/faq" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
            <span>View All</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center"><Spinner size="md" /></div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <Link
                key={cat.categoryId}
                to={`/faq?cat=${cat.categoryId}`}
                className="bg-white p-5 rounded-xl border border-slate-200 hover:border-sky-300 hover:shadow-xs transition-all group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-lg bg-slate-100 text-sky-600 flex items-center justify-center group-hover:bg-sky-50 transition-colors">
                    <HelpCircle className="w-5 h-5" />
                  </div>
                  <h3 className="text-sm font-semibold text-slate-900 group-hover:text-sky-600 transition-colors">
                    {cat.name}
                  </h3>
                </div>
                <p className="text-xs text-slate-500 mt-2.5 line-clamp-2 leading-relaxed">
                  {cat.description}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>

      {/* Frequently Asked Questions */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold text-slate-900">Featured Knowledge Base Articles</h2>
            <p className="text-xs text-slate-500 mt-0.5">Quick answers verified by Charitas IT staff</p>
          </div>
          <Link to="/faq" className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1">
            <span>Browse Full KB</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-12 flex justify-center"><Spinner size="md" /></div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {popularFaqs.map((faq) => (
              <Card key={faq.faqId} className="hover:border-sky-300 transition-colors">
                <Link to={`/faq/${faq.faqId}`} className="block">
                  <div className="flex items-start justify-between gap-4">
                    <h3 className="text-sm font-semibold text-slate-900 hover:text-sky-600 transition-colors">
                      {faq.question}
                    </h3>
                    <Badge variant="neutral" size="sm" className="shrink-0">
                      Helpful ({faq.helpfulCount || 0})
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 mt-2 line-clamp-2 leading-relaxed">
                    {faq.answer}
                  </p>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </section>
    </div>
  );
};
