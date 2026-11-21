import React, { useState } from 'react';
import {
  ArrowRight,
  Check,
  ChevronDown,
  Clock,
  Mail,
  MapPin,
  Phone,
  Smartphone,
} from 'lucide-react';
import { PLATFORM_FAQS } from '../data/blogData';
import { ResilientImage } from './ResilientImage';
import { WorkspaceTab } from './PublicSite';

interface ContactPageProps {
  onOpenWorkspace: (tab?: WorkspaceTab) => void;
}

type InquiryDepartment =
  | 'Programme Partnerships'
  | 'Savings Group Onboarding'
  | 'Financial Institution Linkages'
  | 'Technical & Sync Support';

const DEPARTMENT_DETAILS: Record<
  InquiryDepartment,
  { responseWindow: string; placeholder: string; summary: string }
> = {
  'Programme Partnerships': {
    responseWindow: 'Within 1 business day (CAT)',
    summary:
      'For NGOs, international development agencies, and facilitating networks deploying multi-group dashboards and trainer accounts.',
    placeholder:
      'Share your operating districts, approximate number of groups, methodology (VSLA, ISAL, SILC), and target launch window...',
  },
  'Savings Group Onboarding': {
    responseWindow: 'Within 1 business day (CAT)',
    summary:
      'For community treasurers, chairpersons, and community-based trainers setting up free grassroots group ledgers.',
    placeholder:
      'Tell us your group name, district, current cycle number, and whether you need Android setup guidance...',
  },
  'Financial Institution Linkages': {
    responseWindow: 'Within 1–2 business days (CAT)',
    summary:
      'For commercial banks, microfinance institutions, and SACCOs evaluating verified group credit statements and API exports.',
    placeholder:
      'Outline your institution, target provinces, group credit products, and underwriting data requirements...',
  },
  'Technical & Sync Support': {
    responseWindow: 'Same business day (08:00–17:00 CAT)',
    summary:
      'For existing treasurers or programme officers needing help with offline sync queues, CSV exports, or device transfers.',
    placeholder:
      'Describe the device model, savings group name, and exact question or sync issue you encountered...',
  },
};

export function ContactPage({ onOpenWorkspace }: ContactPageProps) {
  const [department, setDepartment] = useState<InquiryDepartment>('Programme Partnerships');
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0);
  const [form, setForm] = useState({
    fullName: '',
    organization: '',
    email: '',
    phone: '',
    countryRegion: 'Zimbabwe',
    groupScale: '10–50 savings groups',
    message: '',
  });
  const [formError, setFormError] = useState<string | null>(null);
  const [submittedRef, setSubmittedRef] = useState<string | null>(null);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!form.fullName.trim() || !form.organization.trim()) {
      setFormError('Please enter your full name and organization or savings group name.');
      return;
    }
    if (!emailRegex.test(form.email.trim())) {
      setFormError('Please provide a valid email address so our Harare team can reply.');
      return;
    }
    if (form.phone.trim() && form.phone.trim().length < 7) {
      setFormError('Please enter a valid phone or WhatsApp number including country code.');
      return;
    }
    if (!form.message.trim() || form.message.trim().length < 10) {
      setFormError('Please include a brief note describing how we can help.');
      return;
    }

    const refId = `IDS-${String(Date.now()).slice(-6)}`;
    setSubmittedRef(refId);
  };

  return (
    <div className="bg-white">
      {/* Page Header */}
      <section className="border-b border-slate-200 bg-slate-50/70">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 pt-14 pb-12">
          <p className="text-sm font-medium text-emerald-900">Contact &amp; Programme Support</p>
          <div className="mt-3 grid grid-cols-1 lg:grid-cols-12 gap-8 items-end">
            <h1
              className="lg:col-span-7 font-display font-bold tracking-tight text-slate-900 leading-[1.08]"
              style={{
                fontSize: 'clamp(2.25rem, 4vw, 3.5rem)',
                textWrap: 'balance',
              }}
            >
              Speak directly with the Inclusive Digital Solutions team in Harare.
            </h1>
            <p className="lg:col-span-5 text-base text-slate-600 leading-relaxed">
              Whether you are onboarding a single community savings group or coordinating hundreds
              of cohorts across districts, we respond directly without automated ticket loops.
            </p>
          </div>
        </div>
      </section>

      {/* Main Contact Split */}
      <section className="py-16 lg:py-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-8 grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Left Column: Direct Channels + Studio Photo + Office Details */}
          <div className="lg:col-span-5 space-y-8">
            <div className="rounded-xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[16/10]">
              <ResilientImage
                src="/src/assets/images/about_harare_team_1795271822146.jpg"
                alt="Inclusive Digital Solutions team reviewing savings group deployments in Harare"
                className="w-full h-full object-cover"
                fallbackTitle="Harare Operations Studio"
                fallbackSubtitle="Inclusive Digital Solutions"
              />
            </div>

            <dl className="divide-y divide-slate-200 border-t border-b border-slate-200 text-sm">
              <div className="py-4 flex items-start gap-3.5">
                <MapPin className="w-4 h-4 text-emerald-900 mt-0.5 shrink-0" />
                <div>
                  <dt className="font-semibold text-slate-900">Harare Headquarters</dt>
                  <dd className="text-slate-600 mt-0.5">
                    3131 Mount Pleasant Heights, Harare, Zimbabwe
                  </dd>
                </div>
              </div>
              <div className="py-4 flex items-start gap-3.5">
                <Phone className="w-4 h-4 text-emerald-900 mt-0.5 shrink-0" />
                <div>
                  <dt className="font-semibold text-slate-900">Phone &amp; WhatsApp Desk</dt>
                  <dd className="text-slate-700 mt-0.5 font-mono">+263 71 562 1202</dd>
                </div>
              </div>
              <div className="py-4 flex items-start gap-3.5">
                <Mail className="w-4 h-4 text-emerald-900 mt-0.5 shrink-0" />
                <div>
                  <dt className="font-semibold text-slate-900">Direct Email</dt>
                  <dd className="text-slate-700 mt-0.5">info@inclusivedigital.net</dd>
                </div>
              </div>
              <div className="py-4 flex items-start gap-3.5">
                <Clock className="w-4 h-4 text-emerald-900 mt-0.5 shrink-0" />
                <div>
                  <dt className="font-semibold text-slate-900">Support Hours</dt>
                  <dd className="text-slate-600 mt-0.5">
                    Monday – Friday, 08:00 – 17:00 Central Africa Time (CAT / UTC+2)
                  </dd>
                </div>
              </div>
            </dl>

            {/* Mobile & Web Access Note */}
            <div className="bg-slate-50 border border-slate-200 rounded-xl p-6">
              <div className="flex items-start gap-3">
                <Smartphone className="w-5 h-5 text-emerald-900 mt-0.5 shrink-0" />
                <div>
                  <h2 className="font-display text-base font-bold text-slate-900">
                    Field App &amp; Browser Access
                  </h2>
                  <p className="mt-1.5 text-xs text-slate-600 leading-relaxed">
                    My Savings Companion is available for Android devices via Google Play and
                    through modern web browsers for programme officers. Need an immediate live
                    sandbox?
                  </p>
                  <button
                    type="button"
                    onClick={() => onOpenWorkspace('overview')}
                    className="mt-3 inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 hover:text-emerald-700 cursor-pointer"
                  >
                    <span>Open Interactive Web Workspace</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Department-Routed Inquiry Form */}
          <div className="lg:col-span-7 bg-white border border-slate-200 rounded-xl p-7 lg:p-9">
            {submittedRef ? (
              <div className="py-10 text-center max-w-md mx-auto">
                <div className="w-12 h-12 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-800 flex items-center justify-center mx-auto">
                  <Check className="w-6 h-6" />
                </div>
                <p className="mt-4 font-mono text-xs text-slate-500">Reference {submittedRef}</p>
                <h2 className="mt-2 font-display text-2xl font-bold text-slate-900">
                  Inquiry routed to {department}
                </h2>
                <p className="mt-3 text-sm text-slate-600 leading-relaxed">
                  Thank you, <span className="font-semibold text-slate-900">{form.fullName}</span>.
                  Our Harare team will respond to{' '}
                  <span className="font-semibold text-slate-900">{form.email}</span> (
                  {DEPARTMENT_DETAILS[department].responseWindow.toLowerCase()}).
                </p>
                <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                  <button
                    type="button"
                    onClick={() => onOpenWorkspace('overview')}
                    className="px-5 py-2.5 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg cursor-pointer"
                  >
                    Explore Live Workspace
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSubmittedRef(null);
                      setForm({
                        fullName: '',
                        organization: '',
                        email: '',
                        phone: '',
                        countryRegion: 'Zimbabwe',
                        groupScale: '10–50 savings groups',
                        message: '',
                      });
                    }}
                    className="px-4 py-2.5 text-sm font-medium text-slate-700 hover:text-slate-900 cursor-pointer"
                  >
                    Submit Another Message
                  </button>
                </div>
              </div>
            ) : (
              <div>
                <h2 className="font-display text-2xl font-bold text-slate-900">Send a Message</h2>
                <p className="mt-1.5 text-sm text-slate-600">
                  Select the team best suited to your inquiry so we can prepare relevant setup
                  guidance.
                </p>

                {/* Functional Department Selector */}
                <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  {(Object.keys(DEPARTMENT_DETAILS) as InquiryDepartment[]).map((dept) => {
                    const selected = department === dept;
                    return (
                      <button
                        key={dept}
                        type="button"
                        onClick={() => setDepartment(dept)}
                        className={`text-left px-4 py-3 rounded-lg border text-sm font-medium transition-colors cursor-pointer ${
                          selected
                            ? 'bg-emerald-900 text-white border-emerald-900'
                            : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        {dept}
                      </button>
                    );
                  })}
                </div>

                <p className="mt-3 text-xs text-slate-500 leading-relaxed">
                  {DEPARTMENT_DETAILS[department].summary} Expected reply:{' '}
                  <span className="font-medium text-slate-700">
                    {DEPARTMENT_DETAILS[department].responseWindow}
                  </span>
                  .
                </p>

                <form onSubmit={handleSubmit} noValidate className="mt-6 pt-6 border-t border-slate-200 space-y-5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="cp-name"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Full Name
                      </label>
                      <input
                        id="cp-name"
                        type="text"
                        required
                        value={form.fullName}
                        onChange={(e) => setForm((f) => ({ ...f, fullName: e.target.value }))}
                        placeholder="e.g. Chipo Mukamuri"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cp-org"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Organization or Savings Group
                      </label>
                      <input
                        id="cp-org"
                        type="text"
                        required
                        value={form.organization}
                        onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))}
                        placeholder="e.g. Kubatana Women ISAL"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="cp-email"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Email Address
                      </label>
                      <input
                        id="cp-email"
                        type="email"
                        required
                        value={form.email}
                        onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                        placeholder="name@organization.org"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                    <div>
                      <label
                        htmlFor="cp-phone"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Phone / WhatsApp (Optional)
                      </label>
                      <input
                        id="cp-phone"
                        type="tel"
                        value={form.phone}
                        onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                        placeholder="+263 77 000 0000"
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                    <div>
                      <label
                        htmlFor="cp-region"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Operating Country / Region
                      </label>
                      <select
                        id="cp-region"
                        value={form.countryRegion}
                        onChange={(e) => setForm((f) => ({ ...f, countryRegion: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900"
                      >
                        <option>Zimbabwe</option>
                        <option>Zambia</option>
                        <option>Malawi</option>
                        <option>South Africa</option>
                        <option>Mozambique</option>
                        <option>Other Southern / East Africa</option>
                      </select>
                    </div>
                    <div>
                      <label
                        htmlFor="cp-scale"
                        className="block text-sm font-medium text-slate-700 mb-1.5"
                      >
                        Active Savings Groups
                      </label>
                      <select
                        id="cp-scale"
                        value={form.groupScale}
                        onChange={(e) => setForm((f) => ({ ...f, groupScale: e.target.value }))}
                        className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg bg-white text-slate-900"
                      >
                        <option>Single community group</option>
                        <option>2–10 savings groups</option>
                        <option>10–50 savings groups</option>
                        <option>50–250 savings groups</option>
                        <option>250+ savings groups</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor="cp-message"
                      className="block text-sm font-medium text-slate-700 mb-1.5"
                    >
                      How Can We Help?
                    </label>
                    <textarea
                      id="cp-message"
                      rows={4}
                      required
                      value={form.message}
                      onChange={(e) => setForm((f) => ({ ...f, message: e.target.value }))}
                      placeholder={DEPARTMENT_DETAILS[department].placeholder}
                      className="w-full px-3.5 py-2.5 text-sm border border-slate-300 rounded-lg text-slate-900 placeholder:text-slate-400"
                    />
                  </div>

                  {formError && (
                    <p role="alert" className="text-sm text-red-700 font-medium">
                      {formError}
                    </p>
                  )}

                  <div className="pt-1 flex flex-wrap items-center justify-between gap-4">
                    <span className="text-xs text-slate-500">
                      Direct dispatch to {department}
                    </span>
                    <button
                      type="submit"
                      className="px-6 py-2.5 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                    >
                      Send Inquiry
                    </button>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Common Support Questions Accordion */}
      <section className="py-16 lg:py-20 bg-slate-50">
        <div className="max-w-4xl mx-auto px-6 lg:px-8">
          <p className="text-sm font-medium text-emerald-900">Frequently Asked Questions</p>
          <h2 className="mt-2 font-display text-3xl font-bold tracking-tight text-slate-900">
            Quick answers before you write.
          </h2>

          <div className="mt-8 divide-y divide-slate-200 border-t border-b border-slate-200 bg-white rounded-xl border px-6">
            {PLATFORM_FAQS.map((faq, idx) => {
              const isOpen = openFaqIndex === idx;
              return (
                <div key={faq.question} className="py-5">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaqIndex(isOpen ? null : idx)}
                    className="w-full flex items-center justify-between gap-4 text-left cursor-pointer"
                  >
                    <span className="font-display text-base font-semibold text-slate-900">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-4 h-4 text-slate-500 shrink-0 transition-transform duration-200 ${
                        isOpen ? 'rotate-180' : ''
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <p className="mt-3 text-sm text-slate-600 leading-relaxed max-w-2xl">
                      {faq.answer}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>
    </div>
  );
}
