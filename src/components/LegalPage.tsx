import { ArrowLeft } from 'lucide-react';
import { PublicPageKey } from './PublicSite';

interface LegalPageProps {
  mode: 'privacy' | 'terms';
  onNavigatePage: (page: PublicPageKey) => void;
}

export function LegalPage({ mode, onNavigatePage }: LegalPageProps) {
  const isPrivacy = mode === 'privacy';

  return (
    <div className="bg-white">
      <div className="max-w-4xl mx-auto px-6 lg:px-8 pt-12 pb-20">
        <div className="pb-6 border-b border-slate-200 flex items-center justify-between gap-4">
          <button
            type="button"
            onClick={() => onNavigatePage('home')}
            className="inline-flex items-center gap-2 text-sm font-medium text-slate-600 hover:text-slate-900 cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Platform</span>
          </button>
          <span className="font-mono text-xs text-slate-500">Effective November 2026</span>
        </div>

        <header className="pt-10 pb-8 border-b border-slate-200">
          <p className="text-sm font-medium text-emerald-900">
            Inclusive Digital Solutions · Legal &amp; Data Governance
          </p>
          <h1 className="mt-2 font-display text-3xl lg:text-4xl font-bold tracking-tight text-slate-900">
            {isPrivacy ? 'Privacy & Data Protection Policy' : 'Terms of Service'}
          </h1>
          <p className="mt-3 text-base text-slate-600 leading-relaxed">
            {isPrivacy
              ? 'How My Savings Companion protects community savings records, member identities, offline local storage, and formal credit history exports.'
              : 'Governing terms for community savings groups, facilitating NGOs, and financial institutions using My Savings Companion.'}
          </p>
        </header>

        <div className="pt-8 space-y-8 text-sm lg:text-base text-slate-700 leading-relaxed max-w-3xl">
          {isPrivacy ? (
            <>
              <section className="space-y-2.5">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  1. Community Ownership of Financial Records
                </h2>
                <p>
                  Every savings group retains ownership of its member register, meeting attendance,
                  share ledger, social fund balances, and internal loan history. Inclusive Digital
                  Solutions acts strictly as the technology processor providing secure offline
                  capture, cloud synchronization, and reporting infrastructure.
                </p>
              </section>
              <section className="space-y-2.5">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  2. Consent Before Formal Credit Sharing
                </h2>
                <p>
                  Group credit history statements are never sold or shared with third-party lenders
                  without explicit group authorization. Financial institutions receive verified
                  cycle packets only when authorized group officers or designated programme
                  coordinators export or submit them.
                </p>
              </section>
              <section className="space-y-2.5">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  3. Offline Device Storage &amp; Sync Security
                </h2>
                <p>
                  Records captured offline remain stored locally on the treasurer’s or trainer’s
                  device until encrypted synchronization completes. All in-transit synchronization
                  between mobile/web clients and cloud infrastructure uses modern TLS encryption.
                </p>
              </section>
              <section className="space-y-2.5">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  4. Data Protection Contact
                </h2>
                <p>
                  Questions regarding data access, cycle archival, or removal requests may be sent
                  to <span className="font-medium text-slate-900">info@inclusivedigital.net</span>{' '}
                  or our office at 3131 Mount Pleasant Heights, Harare, Zimbabwe.
                </p>
              </section>
            </>
          ) : (
            <>
              <section className="space-y-2.5">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  1. Scope of the Platform
                </h2>
                <p>
                  My Savings Companion provides digital record-keeping, automated calculation tools,
                  and programme analytics for VSLA, ISAL, and SILC savings groups. Inclusive Digital
                  Solutions does not hold physical cash, issue direct credit, or operate as a
                  deposit-taking bank.
                </p>
              </section>
              <section className="space-y-2.5">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  2. Community Access &amp; Institutional Licensing
                </h2>
                <p>
                  Core savings-cycle record-keeping is provided free of charge to grassroots
                  community savings groups. Facilitating agencies, NGOs, and financial service
                  providers licensing institutional dashboards agree to their applicable programme
                  service schedule.
                </p>
              </section>
              <section className="space-y-2.5">
                <h2 className="font-display text-xl font-bold text-slate-900">
                  3. Accuracy of Meeting Entries
                </h2>
                <p>
                  Group treasurers and secretaries remain responsible for verifying physical cash
                  box counts against digital entries during each meeting prior to closing a session
                  or executing an end-of-cycle share-out.
                </p>
              </section>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
