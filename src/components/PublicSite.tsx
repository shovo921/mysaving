import { useState } from 'react';
import {
  ArrowRight,
  ArrowUpRight,
  Check,
  Menu,
  X,
} from 'lucide-react';
import { ResilientImage } from './ResilientImage';
import { CurrencyCode, LoanRecord, SavingsGroup } from '../types/savings';
import { formatMoney } from '../data/seedData';
import { BLOG_ARTICLES } from '../data/blogData';
import { BlogPage } from './BlogPage';
import { ContactPage } from './ContactPage';
import { AboutPage } from './AboutPage';
import { PricingPage } from './PricingPage';
import { LegalPage } from './LegalPage';

export type WorkspaceTab = 'overview' | 'groups' | 'ledger' | 'loans' | 'shareout';
export type PublicPageKey = 'home' | 'about' | 'pricing' | 'blog' | 'contact' | 'privacy' | 'terms';

interface PublicSiteProps {
  onOpenWorkspace: (initialTab?: WorkspaceTab) => void;
  groups: SavingsGroup[];
  loans: LoanRecord[];
  totalSavingsUsd: number;
  totalMembersCount: number;
  currency: CurrencyCode;
}

type StakeholderKey = 'groups' | 'ngos' | 'fsps';
type PortfolioFilter = 'All' | 'Partnerships' | 'Regional Pilots' | 'Case Studies';

const MSC_LOGO_SRC = '/assets/aistudio/1729770806-Admin-Small-Logo_9ae28f40.png';

const OFFICIAL_SERVICES = [
  {
    num: '01.',
    title: 'Programme Readiness and Solution Design',
    summary:
      'Aligning NGO and institutional savings-group operations, local constitutions, and facilitator workflows prior to digital rollout.',
  },
  {
    num: '02.',
    title: 'Data Analytics & Performance Reporting',
    summary:
      'Transforming meeting-level group records into real-time district dashboards, portfolio health reports, and donor-ready metrics.',
  },
  {
    num: '03.',
    title: 'Consultation for Financial Inclusion & Platform Customization',
    summary:
      'Tailoring VSLA, ISAL, and SILC cycle rules, local-language workflows, and multi-currency setups for regional programmes.',
  },
  {
    num: '04.',
    title: 'Bulk Procurement Facilitation',
    summary:
      'Leveraging verified collective savings power to connect mature savings groups to wholesale agricultural inputs and enterprise supplies.',
  },
  {
    num: '05.',
    title: 'Credit Reference Reporting',
    summary:
      'Generating auditable, multi-cycle financial histories and standardized credit packets for responsible formal financial service providers.',
  },
  {
    num: '06.',
    title: 'Custom Solutions for Facilitating Agencies',
    summary:
      'Dedicated multi-cohort oversight portals, community-based trainer supervision tools, and custom API integrations for partner organizations.',
  },
];

const PORTFOLIO_ITEMS: {
  id: string;
  category: Exclude<PortfolioFilter, 'All'>;
  region: string;
  title: string;
  description: string;
  metric: string;
  image: string;
}[] = [
  {
    id: 'cedis-project',
    category: 'Partnerships',
    region: 'Zimbabwe',
    title: 'CEDIS Project (Catalysing Economic Development through the Informal Sector)',
    description:
      'Strengthening grassroots accountability and informal-sector enterprise growth by transitioning savings groups from manual notebooks to verifiable digital ledgers.',
    metric: '167,000+ active members across national network',
    image: '/src/assets/images/hero_savings_group_1795270919657.jpg',
  },
  {
    id: 'tanzania-demo',
    category: 'Regional Pilots',
    region: 'Tanzania · East Africa',
    title: 'Tanzania Field Digitization & Leja ya Akiba Transition',
    description:
      'Live field demonstrations alongside humanitarian and financial inclusion teams showing treasurers how offline mobile ledgers mirror familiar Swahili savings books.',
    metric: '100% offline-ready meeting capture',
    image: '/assets/msc-tanzania-demo.jpg',
  },
  {
    id: 'mercy-corps-linkages',
    category: 'Case Studies',
    region: 'Southern Africa',
    title: 'Formal Financial Institution & Direct Loan Application Pathways',
    description:
      'Partnering with development agencies including Mercy Corps to onboard large savings-group networks and connect verifiable repayment histories to formal credit.',
    metric: 'Automated cycle archive & credit statements',
    image: '/src/assets/images/impact_small_business_1795270922186.jpg',
  },
];

export function PublicSite({
  onOpenWorkspace,
  groups,
  loans,
  totalSavingsUsd,
  totalMembersCount,
  currency,
}: PublicSiteProps) {
  const [activePage, setActivePage] = useState<PublicPageKey>('home');
  const [activeArticleSlug, setActiveArticleSlug] = useState<string | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeStakeholder, setActiveStakeholder] = useState<StakeholderKey>('groups');
  const [portfolioFilter, setPortfolioFilter] = useState<PortfolioFilter>('All');
  const [previewShares, setPreviewShares] = useState<number>(48);

  const navigateTo = (page: PublicPageKey, articleSlug?: string | null) => {
    setActivePage(page);
    setActiveArticleSlug(articleSlug ?? null);
    setMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const activeLoansUsd = loans
    .filter((l) => l.status !== 'Repaid')
    .reduce(
      (acc, l) =>
        acc + Math.max(0, l.principalUsd * (1 + l.interestRatePercent / 100) - l.amountRepaidUsd),
      0
    );

  const repaymentRate = Math.round(
    (loans.reduce((acc, l) => acc + l.amountRepaidUsd, 0) /
      Math.max(
        1,
        loans.reduce((acc, l) => acc + l.principalUsd * (1 + l.interestRatePercent / 100), 0)
      )) *
      100
  );

  const sharePricePreview = 5;
  const dividendYieldRate = 0.16;
  const memberSaved = previewShares * sharePricePreview;
  const memberDividend = memberSaved * dividendYieldRate;
  const memberPayout = memberSaved + memberDividend;

  const navLinks: { key: PublicPageKey; label: string }[] = [
    { key: 'home', label: 'Platform' },
    { key: 'about', label: 'About' },
    { key: 'pricing', label: 'Pricing' },
    { key: 'blog', label: 'Blog' },
    { key: 'contact', label: 'Contact' },
  ];

  const featuredJournalStories = BLOG_ARTICLES.slice(0, 3);
  const visiblePortfolio =
    portfolioFilter === 'All'
      ? PORTFOLIO_ITEMS
      : PORTFOLIO_ITEMS.filter((item) => item.category === portfolioFilter);

  return (
    <div className="min-h-screen bg-white text-slate-900 flex flex-col">
      {/* Strict 3-Zone Top Bar Contract with Official MSC Logo */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-sm border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 h-16 flex items-center justify-between gap-8">
          {/* Zone 1: Brand Lockup (Official MSC Logo + Single-Line Wordmark) */}
          <button
            type="button"
            onClick={() => navigateTo('home')}
            className="inline-flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 cursor-pointer group"
          >
            <img
              src={MSC_LOGO_SRC}
              alt="My Savings Companion logo"
              className="h-9 w-9 object-contain shrink-0"
            />
            <span className="font-display text-lg font-bold tracking-tight text-slate-900 group-hover:text-emerald-900 transition-colors">
              My Savings Companion
            </span>
          </button>

          {/* Zone 2: 5 concise single-line navigation links */}
          <nav
            aria-label="Primary"
            className="hidden md:flex items-center gap-7 text-sm font-medium"
          >
            {navLinks.map((item) => {
              const isCurrent = activePage === item.key;
              return (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigateTo(item.key)}
                  aria-current={isCurrent ? 'page' : undefined}
                  className={`py-1 underline-offset-8 transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isCurrent
                      ? 'text-slate-900 underline decoration-emerald-900 decoration-2'
                      : 'text-slate-600 hover:text-slate-900 hover:underline decoration-slate-300'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Single Primary Action */}
          <div className="flex items-center gap-3 shrink-0">
            <button
              type="button"
              onClick={() => onOpenWorkspace('overview')}
              className="hidden sm:inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              aria-label={mobileMenuOpen ? 'Close navigation menu' : 'Open navigation menu'}
              onClick={() => setMobileMenuOpen((prev) => !prev)}
              className="md:hidden inline-flex items-center justify-center w-10 h-10 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-200 bg-white px-6 py-4 space-y-3">
            <div className="flex flex-col space-y-1 text-sm font-medium">
              {navLinks.map((item) => (
                <button
                  key={item.key}
                  type="button"
                  onClick={() => navigateTo(item.key)}
                  className={`text-left py-2.5 transition-colors cursor-pointer ${
                    activePage === item.key
                      ? 'text-emerald-900 font-semibold'
                      : 'text-slate-700 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </div>
            <button
              type="button"
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenWorkspace('overview');
              }}
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
            >
              <span>Open Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        )}
      </header>

      <main className="flex-1">
        {activePage === 'about' && (
          <AboutPage onNavigatePage={navigateTo} onOpenWorkspace={onOpenWorkspace} />
        )}

        {activePage === 'pricing' && (
          <PricingPage onNavigatePage={navigateTo} onOpenWorkspace={onOpenWorkspace} />
        )}

        {activePage === 'blog' && (
          <BlogPage
            initialArticleSlug={activeArticleSlug}
            onSelectArticleSlug={(slug) => setActiveArticleSlug(slug)}
            onOpenWorkspace={onOpenWorkspace}
          />
        )}

        {activePage === 'contact' && <ContactPage onOpenWorkspace={onOpenWorkspace} />}

        {(activePage === 'privacy' || activePage === 'terms') && (
          <LegalPage mode={activePage} onNavigatePage={navigateTo} />
        )}

        {/* HOME / PLATFORM LANDING PAGE */}
        {activePage === 'home' && (
          <>
            {/* Clean Compact Single-Image Editorial Hero Section */}
            <section className="border-b border-slate-200 bg-white">
              <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-8 pb-10 lg:pt-12 lg:pb-12">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">
                  {/* Left Editorial Copy Column */}
                  <div className="lg:col-span-6 flex flex-col justify-center">
                    <p className="text-sm font-medium text-emerald-900">
                      Inclusive Digital Solutions · Zimbabwe &amp; Regional Africa
                    </p>
                    <h1
                      className="mt-3 font-display font-bold tracking-tight text-slate-950 leading-[1.06]"
                      style={{
                        fontSize: 'clamp(2.25rem, 3.8vw, 3.45rem)',
                        textWrap: 'balance',
                      }}
                    >
                      Connecting Savings Groups to Opportunity.
                    </h1>
                    <p className="mt-4 text-base text-slate-600 leading-relaxed max-w-xl">
                      My Savings Companion helps communities and development partners manage
                      savings, strengthen accountability and connect trusted group data to skills,
                      markets and responsible finance.
                    </p>

                    <div className="mt-6 flex flex-wrap items-center gap-3.5">
                      <button
                        type="button"
                        onClick={() => onOpenWorkspace('overview')}
                        className="inline-flex items-center gap-2.5 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>Launch Live Workspace</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => navigateTo('contact')}
                        className="inline-flex items-center gap-1.5 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:text-emerald-900 rounded-lg border border-slate-200 hover:border-slate-300 bg-white transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>Request a Demo</span>
                        <ArrowUpRight className="w-4 h-4" />
                      </button>
                    </div>

                    <div className="mt-7 pt-5 border-t border-slate-200 flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
                      <span>VSLA · ISAL · SILC Compliant</span>
                      <span aria-hidden="true">·</span>
                      <span>100% Offline Mobile Capture</span>
                      <span aria-hidden="true">·</span>
                      <span>info@inclusivedigital.net</span>
                    </div>
                  </div>

                  {/* Right Compact Single Landscape Image (Shorter Height, Zero Cropped Faces) */}
                  <div className="lg:col-span-6">
                    <figure className="w-full">
                      <div className="h-[260px] sm:h-[320px] lg:h-[360px] w-full rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 shadow-xs">
                        <ResilientImage
                          src="/src/assets/images/hero_tanzania_landscape_1795273611517.jpg"
                          alt="My Savings Companion field demonstration in Tanzania comparing printed Leja ya Akiba na Mikopo ledger book with the mobile application"
                          className="w-full h-full object-cover object-top"
                          fallbackTitle="Tanzania Field Demonstration"
                          fallbackSubtitle="Leja ya Akiba na Mikopo · Digital Ledger Transition"
                        />
                      </div>
                      <figcaption className="mt-2.5 flex items-center justify-between gap-4 text-xs text-slate-500 px-0.5">
                        <span className="font-medium text-slate-700">
                          Tanzania Field Demonstration
                        </span>
                        <span>Paper Ledger → Digital Companion</span>
                      </figcaption>
                    </figure>
                  </div>
                </div>

                {/* Official "Join The Savings Group Movement" 4-Column Quantitative Strip */}
                <div className="mt-9 pt-7 border-t border-slate-200 grid grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
                  <div>
                    <p className="font-mono text-2xl lg:text-3xl font-semibold text-slate-900 tabular-nums">
                      2,500,000
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Goal: 2.5M Savings Group Members by 2026
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-2xl lg:text-3xl font-semibold text-slate-900 tabular-nums">
                      192,400
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Savings Groups Target Across Partner Programmes
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-2xl lg:text-3xl font-semibold text-emerald-900 tabular-nums">
                      167,000
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Current Membership Count Active on MSC
                    </p>
                  </div>
                  <div>
                    <p className="font-mono text-2xl lg:text-3xl font-semibold text-slate-900 tabular-nums">
                      {formatMoney(totalSavingsUsd, currency)}
                    </p>
                    <p className="mt-1 text-sm text-slate-600">
                      Live Sandbox Cohort Savings ({groups.length} groups · {totalMembersCount}{' '}
                      members)
                    </p>
                  </div>
                </div>
              </div>
            </section>

            {/* Beyond Digital Record-Keeping: Official Core Narrative */}
            <section className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-14 items-start">
                <div className="lg:col-span-5">
                  <p className="text-sm font-medium text-emerald-900">
                    Beyond Digital Record-Keeping
                  </p>
                  <h2
                    className="mt-2 font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900"
                    style={{ textWrap: 'balance' }}
                  >
                    More Than a Digital Record Book.
                  </h2>
                  <p className="mt-4 text-sm text-slate-500">
                    Preserving trusted group histories from Cycle 1 to formal financial inclusion.
                  </p>
                </div>
                <div className="lg:col-span-7 space-y-5 text-base text-slate-600 leading-relaxed">
                  <p className="text-slate-900 font-medium text-lg leading-relaxed">
                    Digitisation is more than replacing paper. It gives savings groups trusted
                    records, stronger accountability and a financial history that can be preserved
                    across cycles.
                  </p>
                  <p>
                    My Savings Companion brings member information, meetings, savings, loans,
                    repayments, group funds and share-outs into one connected platform—making group
                    finances easier to manage, understand and verify.
                  </p>
                  <p>
                    With MSC, communities can manage their own information, demonstrate performance
                    and build stronger pathways to skills, markets, enterprise opportunities and
                    responsible financial services.
                  </p>
                </div>
              </div>
            </section>

            {/* All 6 Official MSC Product Features & Benefits (Asymmetric Bento Grid) */}
            <section className="py-20 lg:py-24 bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="max-w-2xl">
                  <p className="text-sm font-medium text-emerald-900">
                    MSC Product Features and Benefits
                  </p>
                  <h2
                    className="mt-2 font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900"
                    style={{ textWrap: 'balance' }}
                  >
                    Every phase of the savings cycle in one connected platform.
                  </h2>
                </div>

                <div className="mt-12 grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Feature 01 & 02 Marquee */}
                  <article className="lg:col-span-2 bg-slate-50/70 border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
                    <div className="md:col-span-7 p-8 flex flex-col justify-between">
                      <div>
                        <p className="font-mono text-xs text-slate-500">01 · Core Ledger</p>
                        <h3 className="mt-3 font-display text-xl font-bold text-slate-900">
                          Complete Cycle Management
                        </h3>
                        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                          Manage meetings, attendance, savings, loans, repayments, group funds,
                          penalties, expenses and share-outs in one connected platform.
                        </p>
                      </div>
                      <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">
                          Meetings · Savings · Group Funds · Penalties
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenWorkspace('ledger')}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-900 hover:text-emerald-700 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>Try Meeting Ledger</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                    <div className="md:col-span-5 min-h-[240px] bg-slate-100 border-t md:border-t-0 md:border-l border-slate-200">
                      <ResilientImage
                        src="/src/assets/images/feature_offline_field_1795270920916.jpg"
                        alt="Community trainer holding a mobile ledger device next to a traditional savings group book"
                        className="w-full h-full object-cover"
                        fallbackTitle="Complete Cycle Management"
                        fallbackSubtitle="Offline-first mobile and tablet records"
                      />
                    </div>
                  </article>

                  {/* Feature 02: Membership & Governance */}
                  <article className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col justify-between">
                    <div>
                      <p className="font-mono text-xs text-slate-500">02 · Group Trust</p>
                      <h3 className="mt-3 font-display text-xl font-bold text-slate-900">
                        Membership and Governance
                      </h3>
                      <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                        Maintain trusted member profiles, assign leadership roles and preserve clear
                        records of participation and group decision-making across cycles.
                      </p>
                    </div>
                    <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Committee role tracking</span>
                      <button
                        type="button"
                        onClick={() => onOpenWorkspace('groups')}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-900 hover:text-emerald-700 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>Inspect Groups</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </article>

                  {/* Feature 03: Loans & Portfolio Visibility */}
                  <article className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col justify-between">
                    <div>
                      <p className="font-mono text-xs text-slate-500">03 · Risk Control</p>
                      <h3 className="mt-3 font-display text-xl font-bold text-slate-900">
                        Loans and Portfolio Visibility
                      </h3>
                      <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                        Track loan disbursements, repayments, outstanding balances and portfolio
                        performance—helping groups and programmes identify emerging risks early.
                      </p>
                    </div>
                    <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between">
                      <span className="text-xs text-slate-500">Direct FSP credit statements</span>
                      <button
                        type="button"
                        onClick={() => onOpenWorkspace('loans')}
                        className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-900 hover:text-emerald-700 whitespace-nowrap shrink-0 cursor-pointer"
                      >
                        <span>Open Loan Book</span>
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </article>

                  {/* Feature 04: Programme Intelligence (Marquee col-span-2) */}
                  <article className="lg:col-span-2 bg-slate-50/70 border border-slate-200 rounded-xl overflow-hidden grid grid-cols-1 md:grid-cols-12">
                    <div className="md:col-span-5 min-h-[240px] bg-slate-100 border-b md:border-b-0 md:border-r border-slate-200">
                      <ResilientImage
                        src="/src/assets/images/feature_programme_office_1795270922480.jpg"
                        alt="Financial inclusion programme coordinator reviewing group analytics in Harare"
                        className="w-full h-full object-cover"
                        fallbackTitle="Programme Intelligence"
                        fallbackSubtitle="Real-time multi-group portfolio oversight"
                      />
                    </div>
                    <div className="md:col-span-7 p-8 flex flex-col justify-between">
                      <div>
                        <p className="font-mono text-xs text-slate-500">
                          04 · Institutional Oversight
                        </p>
                        <h3 className="mt-3 font-display text-xl font-bold text-slate-900">
                          Programme Intelligence
                        </h3>
                        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                          Transform group activity into timely insights on participation, financial
                          performance, governance, inclusion and programme progress across districts
                          and multi-currency cohorts.
                        </p>
                      </div>
                      <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between gap-4">
                        <span className="text-xs text-slate-500">
                          Portfolio health · Multi-currency · CSV reporting
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenWorkspace('overview')}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-900 hover:text-emerald-700 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>View Live Dashboard</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </article>

                  {/* Feature 05 & 06 Balanced Pair */}
                  <div className="lg:col-span-3 grid grid-cols-1 md:grid-cols-2 gap-6">
                    <article className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col justify-between">
                      <div>
                        <p className="font-mono text-xs text-slate-500">05 · Cycle Closure</p>
                        <h3 className="mt-3 font-display text-xl font-bold text-slate-900">
                          Share-Out and Cycle Transition
                        </h3>
                        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                          Calculate individual payouts, account for outstanding obligations,
                          archive completed cycles and preserve financial histories seamlessly
                          across new cycles.
                        </p>
                      </div>
                      <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-xs text-slate-500">Automated per-share math</span>
                        <button
                          type="button"
                          onClick={() => onOpenWorkspace('shareout')}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-900 hover:text-emerald-700 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>Run Share-Out Calculator</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </article>

                    <article className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col justify-between">
                      <div>
                        <p className="font-mono text-xs text-slate-500">06 · Rural Readiness</p>
                        <h3 className="mt-3 font-display text-xl font-bold text-slate-900">
                          Mobile and Offline Access
                        </h3>
                        <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                          Capture group activity in areas with limited connectivity and synchronise
                          records automatically when internet access becomes available.
                        </p>
                      </div>
                      <div className="mt-6 pt-5 border-t border-slate-200 flex items-center justify-between">
                        <span className="text-xs text-slate-500">
                          Android Google Play &amp; Web Browser
                        </span>
                        <button
                          type="button"
                          onClick={() => onOpenWorkspace('ledger')}
                          className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-900 hover:text-emerald-700 whitespace-nowrap shrink-0 cursor-pointer"
                        >
                          <span>Test Offline Queue</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    </article>
                  </div>
                </div>
              </div>
            </section>

            {/* All 6 Official Services ("Our Services") */}
            <section className="py-20 lg:py-24 bg-slate-50 border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                  <div className="max-w-2xl">
                    <p className="text-sm font-medium text-emerald-900">Our Services</p>
                    <h2
                      className="mt-2 font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900"
                      style={{ textWrap: 'balance' }}
                    >
                      End-to-end advisory and deployment services for implementing partners.
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('contact')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-900 hover:text-emerald-700 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Discuss a New Project</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-12 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-10">
                  {OFFICIAL_SERVICES.map((service) => (
                    <div
                      key={service.num}
                      className="border-t border-slate-300 pt-5 flex flex-col justify-between"
                    >
                      <div>
                        <p className="font-mono text-xs font-semibold text-emerald-900">
                          {service.num}
                        </p>
                        <h3 className="mt-2 font-display text-lg font-bold text-slate-900">
                          {service.title}
                        </h3>
                        <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                          {service.summary}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => navigateTo('contact')}
                        className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-slate-900 hover:text-emerald-900 transition-colors self-start cursor-pointer"
                      >
                        <span>Request Service Brief</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </section>

            {/* Stakeholder Solutions: Interactive Mechanism-to-Outcome Showcase */}
            <section className="py-20 lg:py-24 bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                  <div className="max-w-2xl">
                    <p className="text-sm font-medium text-emerald-900">
                      Built for the Whole Ecosystem
                    </p>
                    <h2
                      className="mt-2 font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900"
                      style={{ textWrap: 'balance' }}
                    >
                      One shared ledger connecting communities, programmes, and lenders.
                    </h2>
                  </div>

                  <div
                    role="tablist"
                    aria-label="Stakeholder Solutions"
                    className="inline-flex items-center p-1 bg-slate-100 rounded-lg border border-slate-200 self-start lg:self-auto overflow-x-auto max-w-full"
                  >
                    {(
                      [
                        { key: 'groups', label: 'Savings Groups' },
                        { key: 'ngos', label: 'Implementing NGOs' },
                        { key: 'fsps', label: 'Financial Institutions' },
                      ] as const
                    ).map((tab) => (
                      <button
                        key={tab.key}
                        role="tab"
                        type="button"
                        aria-selected={activeStakeholder === tab.key}
                        onClick={() => setActiveStakeholder(tab.key)}
                        className={`px-4 py-2 text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                          activeStakeholder === tab.key
                            ? 'bg-white text-slate-900 shadow-xs'
                            : 'text-slate-600 hover:text-slate-900'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mt-10 border border-slate-200 rounded-xl bg-slate-50/70 p-8 lg:p-10">
                  {activeStakeholder === 'groups' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                      <div className="lg:col-span-6 space-y-5">
                        <p className="font-mono text-xs text-slate-500">
                          For VSLA, ISAL &amp; SILC Communities
                        </p>
                        <h3 className="font-display text-2xl font-bold text-slate-900">
                          Shorter meetings, clear member balances, and stress-free share-outs.
                        </h3>
                        <p className="text-sm lg:text-base text-slate-600 leading-relaxed">
                          Treasurers and secretaries spend less time counting columns by hand and
                          more time serving members. Every member sees their exact share count,
                          loan obligation, and projected end-of-cycle payout in plain figures.
                        </p>
                        <ul className="space-y-3 pt-2 text-sm text-slate-700">
                          <li className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                            <span>
                              Cuts routine meeting reconciliation time from 90 minutes to under 25
                              minutes.
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                            <span>
                              Works offline during village meetings and backs up automatically when
                              online.
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                            <span>
                              Protects member trust with transparent interest and share-out math.
                            </span>
                          </li>
                        </ul>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => onOpenWorkspace('shareout')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <span>Open Full Share-Out Engine</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 lg:p-7">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Interactive Share-Out Preview
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Share price $5.00 · 16% cycle interest yield
                            </p>
                          </div>
                          <span className="font-mono text-xs text-slate-500">Cycle #3</span>
                        </div>

                        <div className="mt-5">
                          <div className="flex items-center justify-between text-sm">
                            <label
                              htmlFor="preview-shares-slider"
                              className="font-medium text-slate-700"
                            >
                              Member shares accumulated this cycle
                            </label>
                            <span className="font-mono font-semibold text-slate-900 tabular-nums">
                              {previewShares} shares
                            </span>
                          </div>
                          <input
                            id="preview-shares-slider"
                            type="range"
                            min={10}
                            max={120}
                            step={2}
                            value={previewShares}
                            onChange={(e) => setPreviewShares(Number(e.target.value))}
                            className="mt-3 w-full accent-emerald-900 cursor-pointer"
                          />
                          <div className="flex justify-between text-xs text-slate-400 font-mono mt-1">
                            <span>10 shares</span>
                            <span>65 shares</span>
                            <span>120 shares</span>
                          </div>
                        </div>

                        <div className="mt-6 pt-5 border-t border-slate-200 grid grid-cols-3 gap-4">
                          <div>
                            <p className="text-xs text-slate-500">Principal Saved</p>
                            <p className="mt-1 font-mono text-lg font-semibold text-slate-900 tabular-nums">
                              {formatMoney(memberSaved, currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Interest Dividend</p>
                            <p className="mt-1 font-mono text-lg font-semibold text-emerald-800 tabular-nums">
                              +{formatMoney(memberDividend, currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Projected Payout</p>
                            <p className="mt-1 font-mono text-lg font-semibold text-slate-900 tabular-nums">
                              {formatMoney(memberPayout, currency)}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStakeholder === 'ngos' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                      <div className="lg:col-span-6 space-y-5">
                        <p className="font-mono text-xs text-slate-500">
                          For Implementing NGOs &amp; Development Programmes
                        </p>
                        <h3 className="font-display text-2xl font-bold text-slate-900">
                          Replace delayed quarterly spreadsheets with live district intelligence.
                        </h3>
                        <p className="text-sm lg:text-base text-slate-600 leading-relaxed">
                          Monitor dozens or hundreds of savings groups across provinces without
                          waiting for field officers to transcribe paper forms. Spot inactive
                          groups, rising loan arrears, and strong cohorts ready for enterprise
                          grants.
                        </p>
                        <ul className="space-y-3 pt-2 text-sm text-slate-700">
                          <li className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                            <span>
                              Consolidated savings, loan utilization, and attendance metrics across
                              districts.
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                            <span>
                              Early-warning portfolio alerts for overdue loans and missed meetings.
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                            <span>
                              Instant CSV exports formatted for donor reporting and programme
                              audits.
                            </span>
                          </li>
                        </ul>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => onOpenWorkspace('overview')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <span>Explore Programme Dashboard</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl overflow-hidden">
                        <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                          <p className="text-sm font-semibold text-slate-900">
                            Active Cohort Snapshot
                          </p>
                          <span className="text-xs text-slate-500 font-mono">
                            {groups.length} groups · {totalMembersCount} members
                          </span>
                        </div>
                        <div className="divide-y divide-slate-200">
                          {groups.map((grp) => (
                            <div
                              key={grp.id}
                              className="px-6 py-3.5 flex items-center justify-between gap-4 text-sm"
                            >
                              <div className="min-w-0">
                                <p className="font-medium text-slate-900 truncate">{grp.name}</p>
                                <p className="text-xs text-slate-500">
                                  {grp.methodology} · {grp.district}, {grp.province}
                                </p>
                              </div>
                              <div className="text-right shrink-0">
                                <p className="font-mono text-xs font-medium text-slate-900 tabular-nums">
                                  Cycle {grp.cycleNumber} · {grp.meetingsCompleted}/
                                  {grp.totalPlannedMeetings} mtgs
                                </p>
                                <p className="text-xs text-emerald-800 mt-0.5">{grp.status}</p>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  )}

                  {activeStakeholder === 'fsps' && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
                      <div className="lg:col-span-6 space-y-5">
                        <p className="font-mono text-xs text-slate-500">
                          For Banks, Microfinance Institutions &amp; SACCOs
                        </p>
                        <h3 className="font-display text-2xl font-bold text-slate-900">
                          Underwrite community groups with auditable multi-cycle cashflow data.
                        </h3>
                        <p className="text-sm lg:text-base text-slate-600 leading-relaxed">
                          Informal savings groups often demonstrate exceptional repayment
                          discipline yet remain invisible to formal credit committees. My Savings
                          Companion produces structured, timestamped financial histories that
                          reduce onboarding and due-diligence costs.
                        </p>
                        <ul className="space-y-3 pt-2 text-sm text-slate-700">
                          <li className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                            <span>
                              Verified multi-cycle savings accumulation and internal loan repayment
                              records.
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                            <span>
                              Direct loan application packet generation and Credit Reference
                              Reporting.
                            </span>
                          </li>
                          <li className="flex items-start gap-3">
                            <Check className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                            <span>
                              Lower customer acquisition cost for group savings accounts and
                              productive credit.
                            </span>
                          </li>
                        </ul>
                        <div className="pt-2">
                          <button
                            type="button"
                            onClick={() => onOpenWorkspace('loans')}
                            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            <span>Inspect Credit History Statement</span>
                            <ArrowRight className="w-4 h-4" />
                          </button>
                        </div>
                      </div>

                      <div className="lg:col-span-6 bg-white border border-slate-200 rounded-xl p-6 lg:p-7">
                        <div className="flex items-center justify-between pb-4 border-b border-slate-200">
                          <div>
                            <p className="text-sm font-semibold text-slate-900">
                              Portfolio Credit Readiness Summary
                            </p>
                            <p className="text-xs text-slate-500 mt-0.5">
                              Aggregated verified cohort ledger
                            </p>
                          </div>
                          <span className="text-xs font-medium text-emerald-800">
                            Audit Verified
                          </span>
                        </div>
                        <div className="mt-5 grid grid-cols-2 gap-6">
                          <div>
                            <p className="text-xs text-slate-500">Total Verified Savings</p>
                            <p className="mt-1 font-mono text-xl font-semibold text-slate-900 tabular-nums">
                              {formatMoney(totalSavingsUsd, currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Active Loan Balance</p>
                            <p className="mt-1 font-mono text-xl font-semibold text-slate-900 tabular-nums">
                              {formatMoney(activeLoansUsd, currency)}
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Cumulative Recovery Rate</p>
                            <p className="mt-1 font-mono text-xl font-semibold text-emerald-800 tabular-nums">
                              {repaymentRate}%
                            </p>
                          </div>
                          <div>
                            <p className="text-xs text-slate-500">Average Cycle Maturity</p>
                            <p className="mt-1 font-mono text-xl font-semibold text-slate-900 tabular-nums">
                              3.5 cycles
                            </p>
                          </div>
                        </div>
                        <p className="mt-6 pt-4 border-t border-slate-200 text-xs text-slate-500">
                          Every transaction includes member ID, meeting timestamp, and
                          local-to-cloud sync audit state.
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>

            {/* Portfolio, Partnerships & Regional Projects (CEDIS, Tanzania Demo, Mercy Corps) */}
            <section className="py-20 lg:py-24 bg-slate-50 border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6">
                  <div className="max-w-2xl">
                    <p className="text-sm font-medium text-emerald-900">
                      Projects, Pilots &amp; Partnerships
                    </p>
                    <h2
                      className="mt-2 font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900"
                      style={{ textWrap: 'balance' }}
                    >
                      Proven across Zimbabwe and East &amp; Southern Africa.
                    </h2>
                  </div>

                  <div
                    role="tablist"
                    aria-label="Filter projects and partnerships"
                    className="inline-flex items-center p-1 bg-white rounded-lg border border-slate-200 self-start lg:self-auto overflow-x-auto max-w-full"
                  >
                    {(['All', 'Partnerships', 'Regional Pilots', 'Case Studies'] as const).map(
                      (tab) => (
                        <button
                          key={tab}
                          role="tab"
                          type="button"
                          aria-selected={portfolioFilter === tab}
                          onClick={() => setPortfolioFilter(tab)}
                          className={`px-3.5 py-1.5 text-xs sm:text-sm font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            portfolioFilter === tab
                              ? 'bg-emerald-900 text-white'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {tab}
                        </button>
                      )
                    )}
                  </div>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-6">
                  {visiblePortfolio.map((item) => (
                    <article
                      key={item.id}
                      className="bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-[4/3] w-full bg-slate-100 border-b border-slate-200 overflow-hidden">
                          <ResilientImage
                            src={item.image}
                            alt={item.title}
                            className="w-full h-full object-cover object-top"
                            fallbackTitle={item.title}
                            fallbackSubtitle={item.region}
                          />
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-emerald-900">{item.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{item.region}</span>
                          </div>
                          <h3 className="mt-2 font-display text-lg font-bold text-slate-900 leading-snug">
                            {item.title}
                          </h3>
                          <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">
                            {item.description}
                          </p>
                        </div>
                      </div>
                      <div className="px-6 py-4 border-t border-slate-100 text-xs font-mono text-slate-700">
                        {item.metric}
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* Official Facilitator Testimonials (Mutasa District) */}
            <section className="py-20 lg:py-24 bg-white border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
                  <div className="lg:col-span-5">
                    <div className="h-full min-h-[340px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
                      <ResilientImage
                        src="/src/assets/images/impact_small_business_1795270922186.jpg"
                        alt="Community savings group entrepreneur in her tailoring workshop"
                        className="w-full h-full object-cover"
                        fallbackTitle="Hear From Our Clients & Partners"
                        fallbackSubtitle="Community-Based Facilitators in Zimbabwe"
                      />
                    </div>
                  </div>

                  <div className="lg:col-span-7 flex flex-col justify-between">
                    <div>
                      <p className="text-sm font-medium text-emerald-900">
                        Hear From Our Clients &amp; Partners
                      </p>
                      <h2
                        className="mt-2 font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900"
                        style={{ textWrap: 'balance' }}
                      >
                        Trusted on the ground by Community-Based Facilitators.
                      </h2>
                      <p className="mt-4 text-base text-slate-600 leading-relaxed">
                        Facilitators supporting rural wards rely on My Savings Companion to keep
                        multi-cycle group histories intact and expand the number of communities
                        they can mentor effectively.
                      </p>
                    </div>

                    <div className="mt-8 space-y-6">
                      <blockquote className="pt-6 border-t border-slate-200">
                        <p className="text-base lg:text-lg text-slate-800 leading-relaxed">
                          “My Savings Companion is amazing; it’s very easy to use and is now making
                          my life easier, enabling me to support even more groups.”
                        </p>
                        <footer className="mt-3 text-xs text-slate-500">
                          <span className="font-semibold text-slate-900">Maria Kwambana</span>
                          <span aria-hidden="true"> · </span>
                          <span>Community Based Facilitator, Mutasa District</span>
                        </footer>
                      </blockquote>

                      <blockquote className="pt-6 border-t border-slate-200">
                        <p className="text-base lg:text-lg text-slate-800 leading-relaxed">
                          “What I like about My Savings Companion is that no group records are
                          going to be lost, even for previous cycles. All records are managed from
                          the phone; it’s easy to use and is now making my job way easier.”
                        </p>
                        <footer className="mt-3 text-xs text-slate-500">
                          <span className="font-semibold text-slate-900">Memory Nyagumbo</span>
                          <span aria-hidden="true"> · </span>
                          <span>Community Based Facilitator, Mutasa</span>
                        </footer>
                      </blockquote>
                    </div>
                  </div>
                </div>
              </div>
            </section>

            {/* Latest from the Field Journal (Official Blog Stories Preview) */}
            <section className="py-20 lg:py-24 bg-slate-50 border-b border-slate-200">
              <div className="max-w-7xl mx-auto px-6 lg:px-8">
                <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                  <div>
                    <p className="text-sm font-medium text-emerald-900">
                      Blog · Financial Inclusion for All
                    </p>
                    <h2 className="mt-2 font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
                      Impact stories and financial inclusion dispatches.
                    </h2>
                  </div>
                  <button
                    type="button"
                    onClick={() => navigateTo('blog')}
                    className="inline-flex items-center gap-1.5 text-sm font-semibold text-emerald-900 hover:text-emerald-700 whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Browse All Articles</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                <div className="mt-10 grid grid-cols-1 md:grid-cols-3 gap-8">
                  {featuredJournalStories.map((story) => (
                    <article
                      key={story.slug}
                      onClick={() => navigateTo('blog', story.slug)}
                      className="group cursor-pointer bg-white border border-slate-200 rounded-xl overflow-hidden flex flex-col justify-between"
                    >
                      <div>
                        <div className="aspect-[4/3] w-full bg-slate-100 border-b border-slate-200 overflow-hidden">
                          <ResilientImage
                            src={story.image}
                            alt={story.title}
                            className="w-full h-full object-cover group-hover:scale-[1.02] transition-transform duration-300"
                            fallbackTitle={story.title}
                            fallbackSubtitle={story.location}
                          />
                        </div>
                        <div className="p-6">
                          <div className="flex items-center gap-2 text-xs text-slate-500">
                            <span className="font-semibold text-emerald-900">{story.category}</span>
                            <span aria-hidden="true">·</span>
                            <span>{story.readTime}</span>
                          </div>
                          <h3 className="mt-2 font-display text-lg font-bold text-slate-900 group-hover:text-emerald-900 transition-colors leading-snug">
                            {story.title}
                          </h3>
                          <p className="mt-2 text-sm text-slate-600 line-clamp-3 leading-relaxed">
                            {story.deck}
                          </p>
                        </div>
                      </div>
                      <div className="px-6 pb-5">
                        <p className="text-xs font-semibold text-slate-900 group-hover:text-emerald-900 inline-flex items-center gap-1.5">
                          <span>Read More</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </p>
                      </div>
                    </article>
                  ))}
                </div>
              </div>
            </section>

            {/* Focused Conversion Strip */}
            <section className="py-16 lg:py-20 bg-white">
              <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                <div className="max-w-2xl">
                  <p className="text-sm font-medium text-emerald-900">Do You Need a New Project?</p>
                  <h2
                    className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900"
                    style={{ textWrap: 'balance' }}
                  >
                    Free for community groups. Built with Inclusive Digital Solutions for partner
                    programmes.
                  </h2>
                  <p className="mt-3 text-base text-slate-600 leading-relaxed">
                    Launch the live workspace to test offline ledger capture and automated
                    share-outs, or get in touch with our Harare team to plan your rollout.
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-4 shrink-0">
                  <button
                    type="button"
                    onClick={() => onOpenWorkspace('overview')}
                    className="inline-flex items-center gap-2 px-6 py-3 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <span>Open Live Workspace</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => navigateTo('contact')}
                    className="px-5 py-3 text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    Get In Touch
                  </button>
                </div>
              </div>
            </section>
          </>
        )}
      </main>

      {/* Quiet Structured Multi-Column Footer with Official MSC Logo */}
      <footer className="bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 py-14 grid grid-cols-1 md:grid-cols-12 gap-10">
          <div className="md:col-span-5">
            <button
              type="button"
              onClick={() => navigateTo('home')}
              className="inline-flex items-center gap-2.5 text-left cursor-pointer"
            >
              <img
                src={MSC_LOGO_SRC}
                alt="My Savings Companion logo"
                className="h-9 w-9 object-contain shrink-0"
              />
              <span className="font-display font-bold text-base text-slate-900">
                My Savings Companion
              </span>
            </button>
            <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-sm">
              My Savings Companion is a digital platform built to support savings groups to track
              savings, lending, and share-outs—all in one place.
            </p>
            <p className="mt-4 text-xs text-slate-500">
              Inclusive Digital Solutions · 3131 Mount Pleasant Heights, Harare, Zimbabwe
              <br />
              +263 71 562 1202 · info@inclusivedigital.net
            </p>
          </div>

          <div className="md:col-span-2 space-y-2.5 text-sm">
            <p className="font-semibold text-slate-900">Platform</p>
            <ul className="space-y-2 text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('home')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  Home &amp; Features
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('about')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  About Us
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('pricing')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  Pricing &amp; Deployment
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenWorkspace('overview')}
                  className="text-emerald-900 font-medium hover:text-emerald-700 cursor-pointer"
                >
                  Live Workspace
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-3 space-y-2.5 text-sm">
            <p className="font-semibold text-slate-900">Resources &amp; Tools</p>
            <ul className="space-y-2 text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('blog')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  Blog &amp; Impact Stories
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenWorkspace('shareout')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  Share-Out Calculator
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => onOpenWorkspace('loans')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  Credit Reference Statements
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('contact')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  Contact Us &amp; FAQs
                </button>
              </li>
            </ul>
          </div>

          <div className="md:col-span-2 space-y-2.5 text-sm">
            <p className="font-semibold text-slate-900">Governance</p>
            <ul className="space-y-2 text-slate-600">
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('privacy')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  Privacy &amp; Data Protection
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={() => navigateTo('terms')}
                  className="hover:text-slate-900 cursor-pointer"
                >
                  Terms of Service
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-200 py-5 px-6 lg:px-8 max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <span>© {new Date().getFullYear()} Inclusive Digital Solutions. All rights reserved.</span>
          <span>mysavingscompanion.net · Connecting Savings Groups to Opportunity</span>
        </div>
      </footer>
    </div>
  );
}
