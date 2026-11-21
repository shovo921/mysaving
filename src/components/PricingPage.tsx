import { useState } from 'react';
import { ArrowRight, Check } from 'lucide-react';
import { PublicPageKey, WorkspaceTab } from './PublicSite';

interface PricingPageProps {
  onNavigatePage: (page: PublicPageKey) => void;
  onOpenWorkspace: (tab?: WorkspaceTab) => void;
}

export function PricingPage({ onNavigatePage, onOpenWorkspace }: PricingPageProps) {
  const [groupCount, setGroupCount] = useState<number>(40);
  const [includeCbtTraining, setIncludeCbtTraining] = useState<boolean>(true);
  const [includeFspExports, setIncludeFspExports] = useState<boolean>(false);

  // Transparent institutional cohort estimate (USD/year)
  const perGroupAnnualUsd = groupCount >= 150 ? 18 : groupCount >= 50 ? 22 : 26;
  const platformLicenseUsd = groupCount * perGroupAnnualUsd;
  const trainingAddonUsd = includeCbtTraining ? 450 : 0;
  const fspAddonUsd = includeFspExports ? 600 : 0;
  const estimatedAnnualTotalUsd = platformLicenseUsd + trainingAddonUsd + fspAddonUsd;
  const monthlyEquivalentUsd = Math.round(estimatedAnnualTotalUsd / 12);

  return (
    <div className="bg-white">
      {/* Header */}
      <section className="border-b border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-14 pb-12">
          <p className="text-sm font-medium text-emerald-900">Transparent Access &amp; Licensing</p>
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <h1
              className="lg:col-span-7 font-display font-bold tracking-tight text-slate-900 leading-[1.08]"
              style={{
                fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
                textWrap: 'balance',
              }}
            >
              Free for community savers. Predictable licensing for implementing partners.
            </h1>
            <p className="lg:col-span-5 text-base text-slate-600 leading-relaxed">
              We never charge grassroots savings groups for core record-keeping. Facilitating NGOs
              and financial service providers fund multi-group dashboards, analytics, and field
              onboarding through modest cohort licensing.
            </p>
          </div>
        </div>
      </section>

      {/* Two Clear Audience Tiers + Interactive Cohort Estimator */}
      <section className="py-16 lg:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Tier 1 */}
            <div className="bg-white border border-slate-200 rounded-xl p-8 flex flex-col justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-900">
                  For Community Savings Groups
                </p>
                <div className="mt-3 flex items-baseline gap-2.5">
                  <span className="font-display text-4xl font-bold text-slate-900">$0</span>
                  <span className="text-sm text-slate-500">· Free forever for grassroots groups</span>
                </div>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Designed for self-managed VSLA, ISAL, and SILC groups digitizing meetings on a
                  treasurer’s Android device or browser.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {[
                    'Unlimited meetings, members, and savings cycles',
                    'Full offline capture with automatic cloud backup',
                    'Automated share-out and unpaid loan offset calculator',
                    'Standard group ledger CSV export and credit summary',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => onOpenWorkspace('groups')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Start Free in Workspace</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Tier 2 */}
            <div className="bg-white border border-emerald-900/35 rounded-xl p-8 flex flex-col justify-between">
              <div>
                <p className="text-sm font-medium text-emerald-900">
                  For Implementing Organizations, NGOs &amp; FSPs
                </p>
                <div className="mt-3 flex items-baseline gap-2.5">
                  <span className="font-display text-4xl font-bold text-slate-900">
                    Programme License
                  </span>
                  <span className="text-sm text-slate-500">· Scaled by active groups</span>
                </div>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Built for facilitating agencies overseeing field officers, multiple districts,
                  donor reporting, and formal financial institution linkages.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-slate-700">
                  {[
                    'Consolidated multi-district Programme Intelligence dashboard',
                    'Community-Based Trainer (CBT) role assignments & sync monitoring',
                    'Multi-currency portfolio consolidation (USD, ZiG, ZAR, ZMW)',
                    'Early-warning PAR & attendance alerts plus FSP credit packets',
                  ].map((item) => (
                    <li key={item} className="flex items-start gap-2.5">
                      <Check className="w-4 h-4 text-emerald-800 mt-0.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="mt-8 pt-6 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => onNavigatePage('contact')}
                  className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <span>Request Tailored Programme Quote</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Interactive Institutional Budget Estimator */}
          <div className="mt-10 bg-slate-50 border border-slate-200 rounded-xl p-7 lg:p-9 grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            <div className="lg:col-span-7 space-y-5">
              <div>
                <p className="text-xs font-medium text-emerald-900">
                  Interactive Programme Budget Estimator
                </p>
                <h2 className="mt-1.5 font-display text-2xl font-bold text-slate-900">
                  Estimate annual institutional licensing for your grant proposal.
                </h2>
              </div>

              <div>
                <div className="flex items-center justify-between text-sm">
                  <label htmlFor="cohort-size-slider" className="font-medium text-slate-700">
                    Active savings groups supervised
                  </label>
                  <span className="font-mono font-semibold text-slate-900 tabular-nums">
                    {groupCount} groups (~{groupCount * 22} members)
                  </span>
                </div>
                <input
                  id="cohort-size-slider"
                  type="range"
                  min={10}
                  max={250}
                  step={5}
                  value={groupCount}
                  onChange={(e) => setGroupCount(Number(e.target.value))}
                  className="mt-3 w-full accent-emerald-900 cursor-pointer"
                />
                <div className="flex justify-between text-xs text-slate-400 font-mono mt-1">
                  <span>10 groups</span>
                  <span>100 groups</span>
                  <span>250 groups</span>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-4 text-sm text-slate-700">
                <label className="inline-flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeCbtTraining}
                    onChange={(e) => setIncludeCbtTraining(e.target.checked)}
                    className="w-4 h-4 accent-emerald-900 cursor-pointer"
                  />
                  <span>Include CBT Field Training Workshop (+$450)</span>
                </label>
                <label className="inline-flex items-center gap-2.5 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={includeFspExports}
                    onChange={(e) => setIncludeFspExports(e.target.checked)}
                    className="w-4 h-4 accent-emerald-900 cursor-pointer"
                  />
                  <span>FSP / Bank API Credit Integration (+$600)</span>
                </label>
              </div>
            </div>

            <div className="lg:col-span-5 bg-white border border-slate-200 rounded-xl p-6 space-y-4">
              <div className="flex items-baseline justify-between border-b border-slate-200 pb-4">
                <span className="text-xs font-medium text-slate-500">Estimated Annual Total</span>
                <span className="font-mono text-3xl font-bold text-slate-900 tabular-nums">
                  ${estimatedAnnualTotalUsd.toLocaleString()}
                </span>
              </div>
              <dl className="space-y-2 text-xs text-slate-600">
                <div className="flex justify-between">
                  <dt>Platform rate ({groupCount} groups × ${perGroupAnnualUsd}/yr)</dt>
                  <dd className="font-mono text-slate-900 tabular-nums">
                    ${platformLicenseUsd.toLocaleString()}
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Monthly budget equivalent</dt>
                  <dd className="font-mono text-slate-900 tabular-nums">
                    ~${monthlyEquivalentUsd.toLocaleString()} / mo
                  </dd>
                </div>
                <div className="flex justify-between">
                  <dt>Estimated cost per saver / year</dt>
                  <dd className="font-mono text-emerald-800 font-medium tabular-nums">
                    ${(estimatedAnnualTotalUsd / (groupCount * 22)).toFixed(2)}
                  </dd>
                </div>
              </dl>
              <button
                type="button"
                onClick={() => onNavigatePage('contact')}
                className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors cursor-pointer"
              >
                <span>Request Formal Proposal for {groupCount} Groups</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Capability Comparison Matrix */}
      <section className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <h2 className="font-display text-2xl lg:text-3xl font-bold text-slate-900">
            Detailed Capability Matrix
          </h2>
          <div className="mt-8 bg-white border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[640px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500">
                  <th className="py-3.5 px-6">Capability</th>
                  <th className="py-3.5 px-6">Community Groups (Free)</th>
                  <th className="py-3.5 px-6">Implementing Organizations</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                {[
                  {
                    cap: 'Savings-Cycle & Meeting Ledger',
                    free: 'Unlimited meetings & cycles',
                    org: 'Unlimited groups, cycles & cohorts',
                  },
                  {
                    cap: 'Offline Field Capture & Queue',
                    free: 'Full offline Android & web capture',
                    org: 'Full offline mode + sync health monitor',
                  },
                  {
                    cap: 'Automated Share-Out Calculator',
                    free: 'Included with CSV payout sheet',
                    org: 'Included + multi-cycle archive & audit log',
                  },
                  {
                    cap: 'Multi-Currency Reporting',
                    free: '1 primary currency per cycle',
                    org: 'Consolidated USD, ZiG, ZAR & ZMW views',
                  },
                  {
                    cap: 'Programme Intelligence & PAR Alerts',
                    free: 'Single-group summary',
                    org: 'District dashboards, attendance & overdue flags',
                  },
                  {
                    cap: 'Onboarding & Support',
                    free: 'Self-guided docs & community support',
                    org: 'Harare-led CBT training & priority support',
                  },
                ].map((row) => (
                  <tr key={row.cap} className="hover:bg-slate-50/60">
                    <td className="py-3.5 px-6 font-medium text-slate-900">{row.cap}</td>
                    <td className="py-3.5 px-6 text-slate-600">{row.free}</td>
                    <td className="py-3.5 px-6 text-slate-900 font-medium">{row.org}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* 4-Step Deployment Timeline */}
      <section className="py-16 lg:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <p className="text-sm font-medium text-emerald-900">Implementation Cadence</p>
          <h2 className="mt-2 font-display text-3xl font-bold text-slate-900">
            From contract to synced district dashboards in four weeks.
          </h2>
          <div className="mt-10 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                step: '01. Week 1',
                title: 'Constitution & Cohort Setup',
                desc: 'Configure operating districts, reporting currencies, and VSLA/ISAL/SILC templates.',
              },
              {
                step: '02. Week 2',
                title: 'CBT & Officer Training',
                desc: 'Hands-on training for community-based trainers on offline meeting recording and sync.',
              },
              {
                step: '03. Week 3',
                title: 'Pilot Group Digitization',
                desc: 'Register initial groups, migrate opening share balances, and verify first field sync.',
              },
              {
                step: '04. Ongoing',
                title: 'Live Programme Intelligence',
                desc: 'Track savings mobilization, spot overdue risks early, and prepare FSP credit linkages.',
              },
            ].map((phase) => (
              <div key={phase.step} className="border-t border-slate-300 pt-5">
                <p className="font-mono text-xs text-emerald-900 font-medium">{phase.step}</p>
                <h3 className="mt-2 font-display text-lg font-bold text-slate-900">
                  {phase.title}
                </h3>
                <p className="mt-2 text-sm text-slate-600 leading-relaxed">{phase.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
