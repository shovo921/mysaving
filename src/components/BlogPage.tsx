import React, { useEffect, useMemo, useState } from 'react';
import { ArrowLeft, ArrowRight, Check, Search } from 'lucide-react';
import { BLOG_ARTICLES, BlogArticle, BlogCategory } from '../data/blogData';
import { ResilientImage } from './ResilientImage';
import { WorkspaceTab } from './PublicSite';

interface BlogPageProps {
  initialArticleSlug?: string | null;
  onSelectArticleSlug: (slug: string | null) => void;
  onOpenWorkspace: (tab?: WorkspaceTab) => void;
}

const CATEGORIES: ('All' | BlogCategory)[] = [
  'All',
  'Impact Stories',
  'Financial Inclusion',
  'Field Stories',
  'Methodology',
];

export function BlogPage({
  initialArticleSlug,
  onSelectArticleSlug,
  onOpenWorkspace,
}: BlogPageProps) {
  const [activeCategory, setActiveCategory] = useState<'All' | BlogCategory>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [readProgress, setReadProgress] = useState(0);
  const [newsletterEmail, setNewsletterEmail] = useState('');
  const [newsletterStatus, setNewsletterStatus] = useState<'idle' | 'error' | 'subscribed'>('idle');

  const activeArticle: BlogArticle | null = useMemo(() => {
    if (!initialArticleSlug) return null;
    return BLOG_ARTICLES.find((a) => a.slug === initialArticleSlug) ?? null;
  }, [initialArticleSlug]);

  useEffect(() => {
    if (!activeArticle) {
      setReadProgress(0);
      return;
    }
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      const docHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      if (docHeight <= 0) {
        setReadProgress(0);
        return;
      }
      setReadProgress(Math.min(100, Math.max(0, Math.round((scrollTop / docHeight) * 100))));
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener('scroll', handleScroll);
  }, [activeArticle]);

  const filteredArticles = useMemo(() => {
    return BLOG_ARTICLES.filter((article) => {
      const matchesCategory = activeCategory === 'All' || article.category === activeCategory;
      const q = searchQuery.trim().toLowerCase();
      const matchesQuery =
        !q ||
        article.title.toLowerCase().includes(q) ||
        article.deck.toLowerCase().includes(q) ||
        article.author.toLowerCase().includes(q) ||
        article.category.toLowerCase().includes(q);
      return matchesCategory && matchesQuery;
    });
  }, [activeCategory, searchQuery]);

  const isFiltering = activeCategory !== 'All' || searchQuery.trim().length > 0;
  const leadStory = !isFiltering
    ? BLOG_ARTICLES.find((a) => a.featuredTier === 'lead') ?? BLOG_ARTICLES[0]
    : null;
  const secondaryStories = !isFiltering
    ? BLOG_ARTICLES.filter((a) => a.featuredTier === 'secondary')
    : [];
  const archiveStories = !isFiltering
    ? BLOG_ARTICLES.filter((a) => a.featuredTier === 'archive')
    : filteredArticles;

  const handleOpenArticle = (slug: string) => {
    onSelectArticleSlug(slug);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleNewsletterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(newsletterEmail.trim())) {
      setNewsletterStatus('error');
      return;
    }
    setNewsletterStatus('subscribed');
    setNewsletterEmail('');
  };

  // LONG-FORM ASYMMETRIC EDITORIAL READER VIEW (Pattern D: 70% Reading Body / 30% Margin Notes)
  if (activeArticle) {
    const relatedArticles = BLOG_ARTICLES.filter((a) => a.slug !== activeArticle.slug).slice(0, 3);

    return (
      <article className="bg-white">
        {/* Reading depth progress bar */}
        <div
          aria-hidden="true"
          className="fixed top-16 left-0 right-0 z-30 h-0.5 bg-slate-100 pointer-events-none"
        >
          <div
            className="h-full bg-emerald-900 transition-[width] duration-150"
            style={{ width: `${readProgress}%` }}
          />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-10 pb-20">
          {/* Top Breadcrumb Return */}
          <div className="pb-8 border-b border-slate-200 flex flex-wrap items-center justify-between gap-4">
            <button
              type="button"
              onClick={() => {
                onSelectArticleSlug(null);
                window.scrollTo({ top: 0, behavior: 'auto' });
              }}
              className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span>Back to Field Journal</span>
            </button>
            <div className="flex items-center gap-2 text-xs text-slate-500">
              <span>{activeArticle.category}</span>
              <span aria-hidden="true">·</span>
              <span>{activeArticle.publishedDate}</span>
              <span aria-hidden="true">·</span>
              <span>{activeArticle.readTime}</span>
            </div>
          </div>

          {/* Editorial Headline & Deck */}
          <header className="max-w-4xl pt-10 pb-10">
            <p className="text-sm font-medium text-emerald-900">{activeArticle.location}</p>
            <h1
              className="mt-3 font-display font-bold tracking-tight text-slate-900 leading-[1.1]"
              style={{
                fontSize: 'clamp(2rem, 3.8vw, 3.25rem)',
                textWrap: 'balance',
              }}
            >
              {activeArticle.title}
            </h1>
            <p className="mt-5 text-lg lg:text-xl text-slate-600 leading-relaxed max-w-3xl">
              {activeArticle.deck}
            </p>
            <div className="mt-6 pt-6 border-t border-slate-200 flex flex-wrap items-center justify-between gap-4 text-sm">
              <div>
                <p className="font-semibold text-slate-900">{activeArticle.author}</p>
                <p className="text-xs text-slate-500 mt-0.5">{activeArticle.authorRole}</p>
              </div>
              <button
                type="button"
                onClick={() => onOpenWorkspace(activeArticle.relatedWorkspaceTab)}
                className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-900 hover:text-emerald-700 cursor-pointer whitespace-nowrap shrink-0"
              >
                <span>{activeArticle.relatedWorkspaceLabel}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </header>

          {/* Editorial Hero Figure */}
          <figure className="mb-12">
            <div className="aspect-[16/9] max-h-[540px] w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <ResilientImage
                src={activeArticle.image}
                alt={activeArticle.title}
                className="w-full h-full object-cover"
                fallbackTitle={activeArticle.title}
                fallbackSubtitle={activeArticle.location}
              />
            </div>
            <figcaption className="mt-3 text-xs text-slate-500">
              {activeArticle.imageCaption}
            </figcaption>
          </figure>

          {/* Asymmetric 70/30 Reading Canvas with Margin Notes */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
            <div className="lg:col-span-8 max-w-2xl">
              <div className="space-y-6 text-base lg:text-[17px] text-slate-700 leading-[1.8]">
                {activeArticle.paragraphs.map((para, idx) => (
                  <React.Fragment key={idx}>
                    <p
                      className={
                        idx === 0
                          ? 'first-letter:font-display first-letter:text-5xl first-letter:font-bold first-letter:float-left first-letter:mr-3 first-letter:mt-1 first-letter:leading-none first-letter:text-emerald-950'
                          : ''
                      }
                    >
                      {para}
                    </p>
                    {idx === 1 && (
                      <blockquote className="my-10 py-7 border-y border-slate-200">
                        <p className="font-display text-2xl lg:text-[26px] font-medium text-slate-900 leading-snug">
                          {activeArticle.pullQuote}
                        </p>
                        <footer className="mt-3 text-xs text-slate-500">
                          {activeArticle.author} · {activeArticle.location}
                        </footer>
                      </blockquote>
                    )}
                  </React.Fragment>
                ))}
              </div>
            </div>

            {/* Right Margin Rail: Field Figures & Direct Workspace Action */}
            <aside className="lg:col-span-4 lg:sticky lg:top-24 space-y-6">
              <div className="border-t border-slate-900 pt-5">
                <p className="text-xs font-semibold text-slate-900">Field Figures &amp; Notes</p>
                <dl className="mt-4 divide-y divide-slate-200">
                  {activeArticle.marginNotes.map((note) => (
                    <div key={note.label} className="py-4 first:pt-2">
                      <dt className="text-xs text-slate-500">{note.label}</dt>
                      <dd className="mt-1 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                        {note.value}
                      </dd>
                      <dd className="mt-1 text-xs text-slate-600 leading-relaxed">
                        {note.caption}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>

              <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
                <p className="text-xs font-medium text-emerald-900">Interactive Demonstration</p>
                <h2 className="mt-1.5 font-display text-lg font-bold text-slate-900">
                  See this workflow live in the Workspace.
                </h2>
                <p className="mt-2 text-xs text-slate-600 leading-relaxed">
                  Explore real Zimbabwean cohort data, test offline entry queuing, and export
                  verifiable financial schedules.
                </p>
                <button
                  type="button"
                  onClick={() => onOpenWorkspace(activeArticle.relatedWorkspaceTab)}
                  className="mt-4 w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
                >
                  <span>{activeArticle.relatedWorkspaceLabel}</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </aside>
          </div>

          {/* Related Stories */}
          <section className="mt-20 pt-12 border-t border-slate-200">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              Continue Reading in the Journal
            </h2>
            <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-8">
              {relatedArticles.map((item) => (
                <article
                  key={item.slug}
                  onClick={() => handleOpenArticle(item.slug)}
                  className="group cursor-pointer flex flex-col justify-between border-t border-slate-200 pt-5"
                >
                  <div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span className="text-emerald-900 font-medium">{item.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{item.readTime}</span>
                    </div>
                    <h3 className="mt-2.5 font-display text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition-colors leading-snug">
                      {item.title}
                    </h3>
                    <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                      {item.deck}
                    </p>
                  </div>
                  <p className="mt-4 text-xs font-semibold text-slate-900 group-hover:text-emerald-900 inline-flex items-center gap-1.5">
                    <span>Read Story</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </p>
                </article>
              ))}
            </div>
          </section>
        </div>
      </article>
    );
  }

  // BLOG INDEX VIEW (Pattern C: 3-Tier Editorial Salience)
  return (
    <div className="bg-white">
      {/* Masthead */}
      <section className="border-b border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-14 pb-12">
          <p className="text-sm font-medium text-emerald-900">
            Field Journal &amp; Methodology Notes
          </p>
          <div className="mt-3 flex flex-col lg:flex-row lg:items-end justify-between gap-6">
            <h1
              className="font-display font-bold tracking-tight text-slate-900 leading-[1.08] max-w-3xl"
              style={{
                fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
                textWrap: 'balance',
              }}
            >
              Dispatches from community savings groups and financial inclusion teams.
            </h1>
            <p className="text-sm text-slate-600 max-w-sm leading-relaxed">
              Practical field guides, share-out case studies, offline engineering notes, and
              programme intelligence research from Harare and across Southern Africa.
            </p>
          </div>

          {/* Filter Bar + Search */}
          <div className="mt-10 pt-6 border-t border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div
              role="tablist"
              aria-label="Filter journal by topic"
              className="inline-flex items-center p-1 bg-white rounded-lg border border-slate-200 overflow-x-auto max-w-full"
            >
              {CATEGORIES.map((category) => (
                <button
                  key={category}
                  role="tab"
                  type="button"
                  aria-selected={activeCategory === category}
                  onClick={() => setActiveCategory(category)}
                  className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    activeCategory === category
                      ? 'bg-emerald-900 text-white'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            <div className="relative w-full md:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search stories or authors..."
                aria-label="Search blog stories"
                className="w-full pl-9 pr-3 py-2 text-sm bg-white border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400"
              />
            </div>
          </div>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 space-y-16">
        {/* TIER 1: Lead Story (when unfiltered) */}
        {leadStory && (
          <section aria-label="Featured lead story">
            <article
              onClick={() => handleOpenArticle(leadStory.slug)}
              className="group cursor-pointer grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-stretch"
            >
              <div className="lg:col-span-7">
                <div className="h-full min-h-[300px] lg:min-h-[420px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                  <ResilientImage
                    src={leadStory.image}
                    alt={leadStory.title}
                    className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-300"
                    fallbackTitle={leadStory.title}
                    fallbackSubtitle={leadStory.location}
                  />
                </div>
              </div>
              <div className="lg:col-span-5 flex flex-col justify-between py-1">
                <div>
                  <div className="flex items-center gap-2 text-xs text-slate-500">
                    <span className="font-semibold text-emerald-900">{leadStory.category}</span>
                    <span aria-hidden="true">·</span>
                    <span>{leadStory.publishedDate}</span>
                    <span aria-hidden="true">·</span>
                    <span>{leadStory.readTime}</span>
                  </div>
                  <h2
                    className="mt-4 font-display text-2xl lg:text-3xl font-bold tracking-tight text-slate-900 group-hover:text-emerald-900 transition-colors leading-tight"
                    style={{ textWrap: 'balance' }}
                  >
                    {leadStory.title}
                  </h2>
                  <p className="mt-4 text-base text-slate-600 leading-relaxed">{leadStory.deck}</p>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-200 flex items-center justify-between gap-4">
                  <div className="text-xs">
                    <p className="font-semibold text-slate-900">{leadStory.author}</p>
                    <p className="text-slate-500 mt-0.5">{leadStory.location}</p>
                  </div>
                  <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-900 whitespace-nowrap shrink-0">
                    <span>Read Feature</span>
                    <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </article>
          </section>
        )}

        {/* TIER 2: Secondary Features (when unfiltered) */}
        {secondaryStories.length > 0 && (
          <section aria-label="Secondary features" className="pt-12 border-t border-slate-200">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
              {secondaryStories.map((story) => (
                <article
                  key={story.slug}
                  onClick={() => handleOpenArticle(story.slug)}
                  className="group cursor-pointer flex flex-col justify-between"
                >
                  <div>
                    <div className="aspect-[4/3] w-full rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <ResilientImage
                        src={story.image}
                        alt={story.title}
                        className="w-full h-full object-cover group-hover:scale-[1.015] transition-transform duration-300"
                        fallbackTitle={story.title}
                        fallbackSubtitle={story.location}
                      />
                    </div>
                    <div className="mt-5 flex items-center gap-2 text-xs text-slate-500">
                      <span className="font-semibold text-emerald-900">{story.category}</span>
                      <span aria-hidden="true">·</span>
                      <span>{story.publishedDate}</span>
                      <span aria-hidden="true">·</span>
                      <span>{story.readTime}</span>
                    </div>
                    <h3 className="mt-2.5 font-display text-xl lg:text-2xl font-bold text-slate-900 group-hover:text-emerald-900 transition-colors leading-snug">
                      {story.title}
                    </h3>
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed">{story.deck}</p>
                  </div>
                  <div className="mt-5 pt-4 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="text-slate-600 font-medium">{story.author}</span>
                    <span className="font-semibold text-emerald-900 inline-flex items-center gap-1">
                      <span>Read Article</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </span>
                  </div>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* TIER 3: Compact Editorial Archive Index (or Filtered Results) */}
        <section aria-label="Journal archive" className="pt-12 border-t border-slate-200">
          <div className="flex items-baseline justify-between gap-4 mb-6">
            <h2 className="font-display text-2xl font-bold text-slate-900">
              {isFiltering ? `Matching Dispatches (${archiveStories.length})` : 'Methodology & Programme Archive'}
            </h2>
            {isFiltering && (
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                }}
                className="text-xs font-semibold text-emerald-900 hover:underline cursor-pointer"
              >
                Clear Filters
              </button>
            )}
          </div>

          {archiveStories.length === 0 ? (
            <div className="py-12 px-6 text-center border border-slate-200 rounded-xl bg-slate-50">
              <p className="text-sm font-semibold text-slate-900">
                No journal stories match your current search.
              </p>
              <p className="mt-1 text-xs text-slate-500">
                Try another keyword or browse all field categories.
              </p>
              <button
                type="button"
                onClick={() => {
                  setActiveCategory('All');
                  setSearchQuery('');
                }}
                className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg cursor-pointer"
              >
                Show All Stories
              </button>
            </div>
          ) : (
            <div className="divide-y divide-slate-200 border-t border-b border-slate-200">
              {archiveStories.map((story, idx) => (
                <article
                  key={story.slug}
                  onClick={() => handleOpenArticle(story.slug)}
                  className="group py-6 grid grid-cols-1 md:grid-cols-12 gap-4 items-baseline cursor-pointer hover:bg-slate-50/70 transition-colors px-2 -mx-2 rounded-lg"
                >
                  <div className="md:col-span-3 flex items-center gap-3 text-xs text-slate-500">
                    <span className="font-mono text-slate-400">
                      {String(idx + 1).padStart(2, '0')}.
                    </span>
                    <span className="font-medium text-emerald-900">{story.category}</span>
                  </div>
                  <div className="md:col-span-6">
                    <h3 className="font-display text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition-colors">
                      {story.title}
                    </h3>
                    <p className="mt-1.5 text-sm text-slate-600 leading-relaxed">{story.deck}</p>
                  </div>
                  <div className="md:col-span-3 md:text-right text-xs text-slate-500 flex md:flex-col justify-between md:items-end gap-1">
                    <span>{story.publishedDate}</span>
                    <span className="font-medium text-slate-700">{story.readTime}</span>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        {/* Quiet Editorial Newsletter Subscription */}
        <section className="bg-slate-50 border border-slate-200 rounded-xl p-8 lg:p-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          <div className="lg:col-span-7">
            <p className="text-xs font-medium text-emerald-900">Quarterly Field Dispatch</p>
            <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
              Receive savings-group methodology guides and release notes.
            </h2>
            <p className="mt-2 text-sm text-slate-600 leading-relaxed">
              Published four times a year by Inclusive Digital Solutions in Harare. Practical field
              evidence for NGO coordinators, trainers, and FSP partners—zero marketing noise.
            </p>
          </div>
          <div className="lg:col-span-5">
            {newsletterStatus === 'subscribed' ? (
              <div className="p-4 bg-white border border-emerald-200 rounded-lg flex items-center gap-3 text-sm text-emerald-900 font-medium">
                <Check className="w-4 h-4 shrink-0" />
                <span>Subscribed to the Quarterly Field Dispatch.</span>
              </div>
            ) : (
              <form onSubmit={handleNewsletterSubmit} noValidate className="space-y-2.5">
                <div className="flex flex-col sm:flex-row gap-2.5">
                  <label htmlFor="journal-newsletter" className="sr-only">
                    Email address
                  </label>
                  <input
                    id="journal-newsletter"
                    type="email"
                    required
                    value={newsletterEmail}
                    onChange={(e) => {
                      setNewsletterEmail(e.target.value);
                      if (newsletterStatus === 'error') setNewsletterStatus('idle');
                    }}
                    placeholder="you@organization.org"
                    className="flex-1 px-3.5 py-2.5 text-sm bg-white border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400"
                  />
                  <button
                    type="submit"
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Subscribe
                  </button>
                </div>
                {newsletterStatus === 'error' && (
                  <p role="alert" className="text-xs text-red-700 font-medium">
                    Please enter a valid email address.
                  </p>
                )}
              </form>
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
