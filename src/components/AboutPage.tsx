import { ArrowRight, Check } from 'lucide-react';
import { ResilientImage } from './ResilientImage';
import { PublicPageKey, WorkspaceTab } from './PublicSite';

interface AboutPageProps {
  onNavigatePage: (page: PublicPageKey) => void;
  onOpenWorkspace: (tab?: WorkspaceTab) => void;
}

export function AboutPage({ onNavigatePage, onOpenWorkspace }: AboutPageProps) {
  return (
    <div className="bg-white">
      {/* Editorial Header */}
      <section className="border-b border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-14 pb-14">
          <p className="text-sm font-medium text-emerald-900">
            About Inclusive Digital Solutions · Harare, Zimbabwe
          </p>
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <h1
              className="lg:col-span-7 font-display font-bold tracking-tight text-slate-900 leading-[1.08]"
              style={{
                fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
                textWrap: 'balance',
              }}
            >
              Transitioning community savings groups from manual ledgers to lasting financial opportunity.
            </h1>
            <p className="lg:col-span-5 text-base text-slate-600 leading-relaxed">
              My Savings Companion is built by Inclusive Digital Solutions to equip grassroots
              savings groups and development partners with trusted digital tools for savings,
              lending, share-outs, and formal credit pathways.
            </p>
          </div>
        </div>
      </section>

      {/* Official Team Expertise & Studio Photography */}
      <section className="py-16 lg:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-stretch">
          <div className="lg:col-span-6">
            <div className="h-full min-h-[300px] lg:min-h-[430px] rounded-xl overflow-hidden border border-slate-200 bg-slate-100">
              <ResilientImage
                src="/src/assets/images/about_harare_team_1795271822146.jpg"
                alt="Inclusive Digital Solutions engineers and field specialists in Harare reviewing regional savings group deployments"
                className="w-full h-full object-cover"
                fallbackTitle="Inclusive Digital Solutions"
                fallbackSubtitle="Mount Pleasant Heights, Harare"
              />
            </div>
          </div>

          <div className="lg:col-span-6 flex flex-col justify-between py-1">
            <div className="space-y-5">
              <p className="font-mono text-xs text-emerald-900 font-medium">
                Our Skills · The Team’s Expertise
              </p>
              <h2 className="font-display text-2xl lg:text-3xl font-bold tracking-tight text-slate-900">
                Deep financial inclusion experience paired with field-tested engineering.
              </h2>
              <p className="text-sm lg:text-base text-slate-600 leading-relaxed">
                At Inclusive Digital Solutions, our My Savings Companion team brings a wealth of
                expertise in digital transformation, specializing in transitioning savings groups
                from manual to digital operations. We possess deep knowledge of financial inclusion
                challenges, enabling us to develop tailored solutions for marginalized communities.
              </p>
              <p className="text-sm lg:text-base text-slate-600 leading-relaxed">
                Our comprehensive training programs empower facilitators with the skills needed
                for effective community engagement, while our partnership development abilities
                foster collaborative initiatives such as the CEDIS Project and Mercy Corps credit
                pathways. Combined with data management, user-centric design, and disciplined
                project management, we support communities across Zimbabwe, Tanzania, and regional
                Africa.
              </p>
            </div>

            <div className="mt-8 pt-6 border-t border-slate-200 grid grid-cols-3 gap-4">
              <div>
                <p className="font-mono text-xl lg:text-2xl font-semibold text-slate-900 tabular-nums">
                  2.5M
                </p>
                <p className="text-xs text-slate-500 mt-1">2026 Member Goal</p>
              </div>
              <div>
                <p className="font-mono text-xl lg:text-2xl font-semibold text-slate-900 tabular-nums">
                  192,400
                </p>
                <p className="text-xs text-slate-500 mt-1">2026 Group Goal</p>
              </div>
              <div>
                <p className="font-mono text-xl lg:text-2xl font-semibold text-emerald-900 tabular-nums">
                  167,000
                </p>
                <p className="text-xs text-slate-500 mt-1">Current Members</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Six Core Team Competencies */}
      <section className="py-16 lg:py-20 bg-slate-50 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-emerald-900">Core Competencies</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
              How Inclusive Digital Solutions delivers lasting field adoption.
            </h2>
          </div>

          <div className="mt-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                index: '01.',
                title: 'Manual-to-Digital Transformation',
                body: 'Structured migration of existing paper passbooks into clean digital cycles without losing historical member balances or local trust.',
              },
              {
                index: '02.',
                title: 'Facilitator & CBT Training',
                body: 'Practical hands-on training programmes equipping community-based facilitators to mentor larger cohorts accurately.',
              },
              {
                index: '03.',
                title: 'Data Management & Analytics',
                body: 'Actionable portfolio intelligence tracking savings mobilization, loan recovery, participation, and governance across wards.',
              },
              {
                index: '04.',
                title: 'User-Centric Offline Design',
                body: 'Accessible mobile and web interfaces engineered for everyday Android phones and intermittent rural network coverage.',
              },
              {
                index: '05.',
                title: 'Partnership & Credit Linkages',
                body: 'Connecting disciplined savings cohorts to NGOs, bulk procurement suppliers, and responsible formal financial service providers.',
              },
              {
                index: '06.',
                title: 'Disciplined Project Delivery',
                body: 'Reliable deployment planning, milestone tracking, and direct Harare-based support for national and cross-border initiatives.',
              },
            ].map((item) => (
              <div
                key={item.index}
                className="bg-white border border-slate-200 rounded-xl p-7"
              >
                <p className="font-mono text-xs text-emerald-900 font-medium">{item.index}</p>
                <h3 className="mt-2.5 font-display text-lg font-bold text-slate-900">
                  {item.title}
                </h3>
                <p className="mt-2.5 text-sm text-slate-600 leading-relaxed">{item.body}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology Alignment Table */}
      <section className="py-16 lg:py-20 bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8">
          <div className="max-w-2xl">
            <p className="text-sm font-medium text-emerald-900">Supported Methodologies</p>
            <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
              Configured cleanly for VSLA, ISAL, and SILC groups.
            </h2>
            <p className="mt-3 text-sm lg:text-base text-slate-600 leading-relaxed">
              Implementing organizations often work across districts using different community
              savings traditions. My Savings Companion supports all three under one unified
              reporting architecture.
            </p>
          </div>

          <div className="mt-10 border border-slate-200 rounded-xl overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[680px]">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500">
                  <th className="py-3.5 px-6">Dimension</th>
                  <th className="py-3.5 px-5">VSLA</th>
                  <th className="py-3.5 px-5">ISAL</th>
                  <th className="py-3.5 px-5">SILC</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 text-sm">
                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">Typical Cycle Length</td>
                  <td className="py-3.5 px-5 text-slate-600">9 – 12 months</td>
                  <td className="py-3.5 px-5 text-slate-600">6 – 12 months</td>
                  <td className="py-3.5 px-5 text-slate-600">9 – 12 months</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">Savings Structure</td>
                  <td className="py-3.5 px-5 text-slate-600">1–5 fixed shares per meeting</td>
                  <td className="py-3.5 px-5 text-slate-600">Fixed shares or agreed deposits</td>
                  <td className="py-3.5 px-5 text-slate-600">Share-based with flexible multiples</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">Social / Welfare Fund</td>
                  <td className="py-3.5 px-5 text-slate-600">Separate flat contribution per meeting</td>
                  <td className="py-3.5 px-5 text-slate-600">Optional emergency pool or carry-over</td>
                  <td className="py-3.5 px-5 text-slate-600">Mandatory social fund ledger</td>
                </tr>
                <tr>
                  <td className="py-3.5 px-6 font-medium text-slate-900">End-of-Cycle Share-Out</td>
                  <td className="py-3.5 px-5 text-slate-900 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-800" />
                      Automated pro-rata per share
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-900 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-800" />
                      Automated with loan offset
                    </span>
                  </td>
                  <td className="py-3.5 px-5 text-slate-900 font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <Check className="w-4 h-4 text-emerald-800" />
                      Automated &amp; archived
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </section>

      {/* Closing CTA */}
      <section className="py-16 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="max-w-2xl">
            <h2 className="font-display text-2xl lg:text-3xl font-bold text-slate-900">
              Explore the live ledger or talk with our Harare implementation team.
            </h2>
            <p className="mt-2 text-sm text-slate-600">
              Try every workflow directly in your browser with sample cohort data, or schedule a
              walkthrough for your programme officers.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-4 shrink-0">
            <button
              type="button"
              onClick={() => onOpenWorkspace('groups')}
              className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              <span>Inspect Group Registry</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={() => onNavigatePage('contact')}
              className="px-5 py-2.5 text-sm font-semibold text-slate-800 bg-white border border-slate-200 hover:bg-slate-100 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
            >
              Contact Our Team
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
