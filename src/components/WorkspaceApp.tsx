import React, { useMemo, useState } from 'react';
import {
  ArrowLeft,
  Calculator,
  Check,
  Cloud,
  CloudOff,
  Download,
  FileSpreadsheet,
  Landmark,
  LayoutDashboard,
  Menu,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Users,
  Wallet,
  X,
} from 'lucide-react';
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import {
  CurrencyCode,
  GroupMember,
  LedgerEntry,
  LedgerEntryType,
  LoanRecord,
  LoanStatus,
  MemberRole,
  Methodology,
  SavingsGroup,
} from '../types/savings';
import {
  CURRENCY_CONFIG,
  MONTHLY_PORTFOLIO_METRICS,
  formatMoney,
} from '../data/seedData';
import { WorkspaceTab } from './PublicSite';

interface WorkspaceAppProps {
  initialTab: WorkspaceTab;
  onBackToSite: () => void;
  groups: SavingsGroup[];
  members: GroupMember[];
  loans: LoanRecord[];
  ledger: LedgerEntry[];
  currency: CurrencyCode;
  onChangeCurrency: (c: CurrencyCode) => void;
  isOfflineMode: boolean;
  onToggleOfflineMode: () => void;
  onSyncPending: () => void;
  onAddGroup: (group: SavingsGroup, initialChair: GroupMember) => void;
  onAddMember: (member: GroupMember) => void;
  onRecordLedgerEntry: (entry: LedgerEntry) => void;
  onIssueLoan: (loan: LoanRecord) => void;
  onRecordRepayment: (loanId: string, amountUsd: number) => void;
  onResetDemoData: () => void;
}

function downloadCsv(filename: string, headers: string[], rows: (string | number)[][]) {
  const escapeCell = (val: string | number) => {
    const str = String(val);
    if (str.includes(',') || str.includes('"') || str.includes('\n')) {
      return `"${str.replace(/"/g, '""')}"`;
    }
    return str;
  };
  const csvContent = [
    headers.map(escapeCell).join(','),
    ...rows.map((r) => r.map(escapeCell).join(',')),
  ].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

const TAB_META: Record<WorkspaceTab, { label: string; breadcrumb: string }> = {
  overview: { label: 'Programme Overview', breadcrumb: 'Programme Overview' },
  groups: { label: 'Savings Groups', breadcrumb: 'Savings Groups' },
  ledger: { label: 'Meeting & Ledger', breadcrumb: 'Meeting & Ledger' },
  loans: { label: 'Loan Portfolio', breadcrumb: 'Loan Portfolio' },
  shareout: { label: 'Share-Out Calculator', breadcrumb: 'Share-Out Calculator' },
};

export function WorkspaceApp({
  initialTab,
  onBackToSite,
  groups,
  members,
  loans,
  ledger,
  currency,
  onChangeCurrency,
  isOfflineMode,
  onToggleOfflineMode,
  onSyncPending,
  onAddGroup,
  onAddMember,
  onRecordLedgerEntry,
  onIssueLoan,
  onRecordRepayment,
  onResetDemoData,
}: WorkspaceAppProps) {
  const [activeTab, setActiveTab] = useState<WorkspaceTab>(initialTab);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState<string>(groups[0]?.id ?? '');
  const [syncNotice, setSyncNotice] = useState<string | null>(null);

  // Overview filters
  const [overviewSearch, setOverviewSearch] = useState('');
  const [methodologyFilter, setMethodologyFilter] = useState<'ALL' | Methodology>('ALL');

  // Group creation modal & Add member inline state
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [newGroupForm, setNewGroupForm] = useState({
    name: '',
    methodology: 'VSLA' as Methodology,
    district: '',
    province: 'Harare',
    sharePriceUsd: '5',
    interestRatePercent: '10',
    socialFundPerMeetingUsd: '1',
    chairName: '',
    chairPhone: '+263 77 ',
  });
  const [newGroupError, setNewGroupError] = useState<string | null>(null);

  const [showAddMemberForm, setShowAddMemberForm] = useState(false);
  const [newMemberForm, setNewMemberForm] = useState({
    name: '',
    role: 'Member' as MemberRole,
    phone: '+263 77 ',
    initialShares: '4',
  });

  // Ledger filters & entry form
  const [ledgerGroupFilter, setLedgerGroupFilter] = useState<string>('ALL');
  const [ledgerTypeFilter, setLedgerTypeFilter] = useState<'ALL' | LedgerEntryType>('ALL');
  const [ledgerSearch, setLedgerSearch] = useState('');
  const [showLedgerModal, setShowLedgerModal] = useState(false);
  const [ledgerForm, setLedgerForm] = useState({
    groupId: groups[0]?.id ?? '',
    memberId: members[0]?.id ?? '',
    type: 'Savings' as LedgerEntryType,
    sharesCount: '3',
    amountUsd: '15',
    note: '',
  });
  const [ledgerError, setLedgerError] = useState<string | null>(null);

  // Loan filters & modals
  const [loanStatusFilter, setLoanStatusFilter] = useState<'ALL' | LoanStatus>('ALL');
  const [loanSearch, setLoanSearch] = useState('');
  const [showNewLoanModal, setShowNewLoanModal] = useState(false);
  const [loanForm, setLoanForm] = useState({
    groupId: groups[0]?.id ?? '',
    memberId: members[0]?.id ?? '',
    principalUsd: '150',
    purpose: '',
    dueDate: '2027-02-15',
  });
  const [loanFormError, setLoanFormError] = useState<string | null>(null);

  const [repaymentLoan, setRepaymentLoan] = useState<LoanRecord | null>(null);
  const [repaymentAmount, setRepaymentAmount] = useState('');
  const [repaymentError, setRepaymentError] = useState<string | null>(null);

  const [creditStatementGroupId, setCreditStatementGroupId] = useState<string | null>(null);

  // Share-out state
  const [shareOutGroupId, setShareOutGroupId] = useState<string>(groups[0]?.id ?? '');
  const [distributeSocialFund, setDistributeSocialFund] = useState<boolean>(false);

  const pendingSyncCount = useMemo(() => {
    const ledgerPending = ledger.filter((e) => e.syncState === 'Pending Sync').length;
    const loansPending = loans.filter((l) => l.syncState === 'Pending Sync').length;
    return ledgerPending + loansPending;
  }, [ledger, loans]);

  const handleSyncClick = () => {
    if (pendingSyncCount === 0) return;
    onSyncPending();
    setSyncNotice(`Synchronized ${pendingSyncCount} offline record${pendingSyncCount > 1 ? 's' : ''} to cloud ledger.`);
    window.setTimeout(() => setSyncNotice(null), 4000);
  };

  // Aggregate calculations
  const groupFinancials = useMemo(() => {
    const map: Record<
      string,
      {
        memberCount: number;
        totalShares: number;
        savingsUsd: number;
        socialFundUsd: number;
        activeLoanBalanceUsd: number;
        overdueLoanBalanceUsd: number;
        interestEarnedUsd: number;
        penaltiesUsd: number;
        expensesUsd: number;
        avgAttendance: number;
      }
    > = {};

    groups.forEach((g) => {
      const gMembers = members.filter((m) => m.groupId === g.id);
      const totalShares = gMembers.reduce((s, m) => s + m.sharesHeld, 0);
      const savingsUsd = totalShares * g.sharePriceUsd;
      const socialFundUsd = gMembers.reduce((s, m) => s + m.socialFundContributedUsd, 0);
      const avgAttendance =
        gMembers.length > 0
          ? Math.round(gMembers.reduce((s, m) => s + m.attendanceRate, 0) / gMembers.length)
          : 0;

      const gLoans = loans.filter((l) => l.groupId === g.id);
      const activeLoanBalanceUsd = gLoans
        .filter((l) => l.status !== 'Repaid')
        .reduce(
          (s, l) =>
            s + Math.max(0, l.principalUsd * (1 + l.interestRatePercent / 100) - l.amountRepaidUsd),
          0
        );
      const overdueLoanBalanceUsd = gLoans
        .filter((l) => l.status === 'Overdue')
        .reduce(
          (s, l) =>
            s + Math.max(0, l.principalUsd * (1 + l.interestRatePercent / 100) - l.amountRepaidUsd),
          0
        );
      const interestEarnedUsd = gLoans.reduce((s, l) => {
        const interestPortion = l.principalUsd * (l.interestRatePercent / 100);
        const totalDue = l.principalUsd + interestPortion;
        const paidRatio = Math.min(1, l.amountRepaidUsd / Math.max(1, totalDue));
        return s + interestPortion * paidRatio;
      }, 0);

      const gLedger = ledger.filter((e) => e.groupId === g.id);
      const penaltiesUsd = gLedger
        .filter((e) => e.type === 'Penalty')
        .reduce((s, e) => s + e.amountUsd, 0);
      const expensesUsd = gLedger
        .filter((e) => e.type === 'Expense')
        .reduce((s, e) => s + e.amountUsd, 0);

      map[g.id] = {
        memberCount: gMembers.length,
        totalShares,
        savingsUsd,
        socialFundUsd,
        activeLoanBalanceUsd,
        overdueLoanBalanceUsd,
        interestEarnedUsd,
        penaltiesUsd,
        expensesUsd,
        avgAttendance,
      };
    });

    return map;
  }, [groups, members, loans, ledger]);

  const portfolioTotals = useMemo(() => {
    let totalSavingsUsd = 0;
    let totalActiveLoansUsd = 0;
    let totalOverdueUsd = 0;
    let totalAttendanceSum = 0;
    let activeGroupsCount = 0;

    groups.forEach((g) => {
      const f = groupFinancials[g.id];
      if (!f) return;
      totalSavingsUsd += f.savingsUsd;
      totalActiveLoansUsd += f.activeLoanBalanceUsd;
      totalOverdueUsd += f.overdueLoanBalanceUsd;
      totalAttendanceSum += f.avgAttendance;
      activeGroupsCount += 1;
    });

    const parRate =
      totalActiveLoansUsd > 0 ? Math.round((totalOverdueUsd / totalActiveLoansUsd) * 1000) / 10 : 0;
    const avgAttendance =
      activeGroupsCount > 0 ? Math.round(totalAttendanceSum / activeGroupsCount) : 0;

    return {
      totalSavingsUsd,
      totalActiveLoansUsd,
      totalOverdueUsd,
      parRate,
      avgAttendance,
    };
  }, [groups, groupFinancials]);

  const chartData = useMemo(() => {
    const rate = CURRENCY_CONFIG[currency].rateFromUsd;
    return MONTHLY_PORTFOLIO_METRICS.map((m) => ({
      month: m.month,
      Savings: Math.round(m.savingsUsd * rate),
      Loans: Math.round(m.loansDisbursedUsd * rate),
      Repayments: Math.round(m.repaymentsUsd * rate),
    }));
  }, [currency]);

  const filteredOverviewGroups = useMemo(() => {
    return groups.filter((g) => {
      const matchesMethod = methodologyFilter === 'ALL' || g.methodology === methodologyFilter;
      const q = overviewSearch.trim().toLowerCase();
      const matchesQuery =
        !q ||
        g.name.toLowerCase().includes(q) ||
        g.district.toLowerCase().includes(q) ||
        g.province.toLowerCase().includes(q) ||
        g.facilitator.toLowerCase().includes(q);
      return matchesMethod && matchesQuery;
    });
  }, [groups, methodologyFilter, overviewSearch]);

  const selectedGroup = groups.find((g) => g.id === selectedGroupId) ?? groups[0];
  const selectedGroupMembers = members.filter((m) => m.groupId === selectedGroup?.id);

  const filteredLedger = useMemo(() => {
    return ledger.filter((entry) => {
      const matchesGroup = ledgerGroupFilter === 'ALL' || entry.groupId === ledgerGroupFilter;
      const matchesType = ledgerTypeFilter === 'ALL' || entry.type === ledgerTypeFilter;
      const q = ledgerSearch.trim().toLowerCase();
      const matchesQuery =
        !q ||
        entry.memberName.toLowerCase().includes(q) ||
        entry.note.toLowerCase().includes(q) ||
        entry.type.toLowerCase().includes(q);
      return matchesGroup && matchesType && matchesQuery;
    });
  }, [ledger, ledgerGroupFilter, ledgerTypeFilter, ledgerSearch]);

  const filteredLoans = useMemo(() => {
    return loans.filter((loan) => {
      const matchesStatus = loanStatusFilter === 'ALL' || loan.status === loanStatusFilter;
      const q = loanSearch.trim().toLowerCase();
      const groupName = groups.find((g) => g.id === loan.groupId)?.name ?? '';
      const matchesQuery =
        !q ||
        loan.memberName.toLowerCase().includes(q) ||
        loan.purpose.toLowerCase().includes(q) ||
        groupName.toLowerCase().includes(q);
      return matchesStatus && matchesQuery;
    });
  }, [loans, groups, loanStatusFilter, loanSearch]);

  // Share-Out Engine Calculations
  const shareOutGroup = groups.find((g) => g.id === shareOutGroupId) ?? groups[0];
  const shareOutCalculation = useMemo(() => {
    if (!shareOutGroup) return null;
    const gMembers = members.filter((m) => m.groupId === shareOutGroup.id);
    const fin = groupFinancials[shareOutGroup.id];
    if (!fin) return null;

    const totalShareCapitalUsd = fin.savingsUsd;
    const netProfitUsd = Math.max(0, fin.interestEarnedUsd + fin.penaltiesUsd - fin.expensesUsd);
    const distributableSocialUsd = distributeSocialFund ? fin.socialFundUsd : 0;
    const totalDistributableUsd = totalShareCapitalUsd + netProfitUsd + distributableSocialUsd;
    const valuePerShareUsd =
      fin.totalShares > 0 ? totalDistributableUsd / fin.totalShares : shareOutGroup.sharePriceUsd;
    const returnOnSavingsPct =
      totalShareCapitalUsd > 0
        ? Math.round(((totalDistributableUsd - totalShareCapitalUsd) / totalShareCapitalUsd) * 1000) /
          10
        : 0;

    const memberRows = gMembers.map((m) => {
      const memberOutstandingUsd = loans
        .filter((l) => l.groupId === shareOutGroup.id && l.memberId === m.id && l.status !== 'Repaid')
        .reduce(
          (s, l) =>
            s + Math.max(0, l.principalUsd * (1 + l.interestRatePercent / 100) - l.amountRepaidUsd),
          0
        );
      const grossPayoutUsd = m.sharesHeld * valuePerShareUsd;
      const netCashPayoutUsd = Math.max(0, grossPayoutUsd - memberOutstandingUsd);
      return {
        member: m,
        savedUsd: m.sharesHeld * shareOutGroup.sharePriceUsd,
        grossPayoutUsd,
        outstandingLoanUsd: memberOutstandingUsd,
        netCashPayoutUsd,
      };
    });

    return {
      totalShares: fin.totalShares,
      totalShareCapitalUsd,
      interestEarnedUsd: fin.interestEarnedUsd,
      penaltiesUsd: fin.penaltiesUsd,
      expensesUsd: fin.expensesUsd,
      socialFundUsd: fin.socialFundUsd,
      netProfitUsd,
      totalDistributableUsd,
      valuePerShareUsd,
      returnOnSavingsPct,
      memberRows,
    };
  }, [shareOutGroup, members, groupFinancials, loans, distributeSocialFund]);

  // Handlers
  const handleCreateGroupSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setNewGroupError(null);
    const sharePrice = Number(newGroupForm.sharePriceUsd);
    const interest = Number(newGroupForm.interestRatePercent);
    const social = Number(newGroupForm.socialFundPerMeetingUsd);

    if (!newGroupForm.name.trim() || !newGroupForm.district.trim() || !newGroupForm.chairName.trim()) {
      setNewGroupError('Please enter a group name, district, and founding chairperson name.');
      return;
    }
    if (Number.isNaN(sharePrice) || sharePrice <= 0) {
      setNewGroupError('Share price must be a positive USD value.');
      return;
    }

    const groupId = `grp-${Date.now()}`;
    const today = new Date().toISOString().slice(0, 10);
    const nextYear = new Date(Date.now() + 335 * 86400000).toISOString().slice(0, 10);

    const newGroup: SavingsGroup = {
      id: groupId,
      name: newGroupForm.name.trim(),
      methodology: newGroupForm.methodology,
      district: newGroupForm.district.trim(),
      province: newGroupForm.province,
      cycleNumber: 1,
      cycleStartDate: today,
      cycleEndDate: nextYear,
      sharePriceUsd: sharePrice,
      interestRatePercent: Number.isNaN(interest) ? 10 : interest,
      socialFundPerMeetingUsd: Number.isNaN(social) ? 1 : social,
      meetingsCompleted: 1,
      totalPlannedMeetings: 24,
      facilitator: 'Community-Based Trainer',
      partnerOrg: 'Inclusive Digital Solutions Network',
      lastSyncedAt: isOfflineMode ? 'Pending local sync' : `${today} 10:00`,
      status: 'Active',
    };

    const chairMember: GroupMember = {
      id: `m-${Date.now()}`,
      groupId,
      name: newGroupForm.chairName.trim(),
      role: 'Chairperson',
      phone: newGroupForm.chairPhone.trim() || '+263 77 000 0000',
      sharesHeld: 4,
      socialFundContributedUsd: newGroup.socialFundPerMeetingUsd,
      attendanceRate: 100,
      joinedDate: today,
    };

    onAddGroup(newGroup, chairMember);
    setSelectedGroupId(groupId);
    setShareOutGroupId(groupId);
    setShowNewGroupModal(false);
    setNewGroupForm({
      name: '',
      methodology: 'VSLA',
      district: '',
      province: 'Harare',
      sharePriceUsd: '5',
      interestRatePercent: '10',
      socialFundPerMeetingUsd: '1',
      chairName: '',
      chairPhone: '+263 77 ',
    });
  };

  const handleAddMemberSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedGroup || !newMemberForm.name.trim()) return;
    const shares = Math.max(0, Number(newMemberForm.initialShares) || 0);
    onAddMember({
      id: `m-${Date.now()}`,
      groupId: selectedGroup.id,
      name: newMemberForm.name.trim(),
      role: newMemberForm.role,
      phone: newMemberForm.phone.trim() || '+263 77 000 0000',
      sharesHeld: shares,
      socialFundContributedUsd: selectedGroup.socialFundPerMeetingUsd,
      attendanceRate: 100,
      joinedDate: new Date().toISOString().slice(0, 10),
    });
    setNewMemberForm({ name: '', role: 'Member', phone: '+263 77 ', initialShares: '4' });
    setShowAddMemberForm(false);
  };

  const handleLedgerSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLedgerError(null);
    const targetGroup = groups.find((g) => g.id === ledgerForm.groupId);
    if (!targetGroup) {
      setLedgerError('Please select a savings group.');
      return;
    }

    const groupMembers = members.filter((m) => m.groupId === targetGroup.id);
    const targetMember = groupMembers.find((m) => m.id === ledgerForm.memberId) ?? groupMembers[0];

    let amountUsd = Number(ledgerForm.amountUsd);
    let sharesDelta: number | undefined;

    if (ledgerForm.type === 'Savings') {
      const shares = Math.max(1, Math.round(Number(ledgerForm.sharesCount) || 0));
      sharesDelta = shares;
      amountUsd = shares * targetGroup.sharePriceUsd;
    }

    if (Number.isNaN(amountUsd) || amountUsd <= 0) {
      setLedgerError('Amount must be greater than zero.');
      return;
    }

    onRecordLedgerEntry({
      id: `tx-${Date.now()}`,
      groupId: targetGroup.id,
      memberId: ledgerForm.type === 'Expense' ? undefined : targetMember?.id,
      memberName:
        ledgerForm.type === 'Expense'
          ? 'Group Administration'
          : targetMember?.name ?? 'Group Member',
      date: new Date().toISOString().slice(0, 10),
      type: ledgerForm.type,
      amountUsd,
      sharesDelta,
      note:
        ledgerForm.note.trim() ||
        (ledgerForm.type === 'Savings'
          ? `Meeting share purchase (${sharesDelta} shares)`
          : `${ledgerForm.type} entry`),
      syncState: isOfflineMode ? 'Pending Sync' : 'Synced',
    });

    setShowLedgerModal(false);
    setLedgerForm((prev) => ({ ...prev, note: '' }));
  };

  const handleIssueLoanSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoanFormError(null);
    const targetGroup = groups.find((g) => g.id === loanForm.groupId);
    const groupMembers = members.filter((m) => m.groupId === loanForm.groupId);
    const targetMember = groupMembers.find((m) => m.id === loanForm.memberId) ?? groupMembers[0];
    const principal = Number(loanForm.principalUsd);

    if (!targetGroup || !targetMember) {
      setLoanFormError('Select a valid group and member.');
      return;
    }
    if (Number.isNaN(principal) || principal <= 0) {
      setLoanFormError('Enter a valid loan principal amount in USD.');
      return;
    }
    if (!loanForm.purpose.trim()) {
      setLoanFormError('Please specify the productive purpose of this loan.');
      return;
    }

    onIssueLoan({
      id: `ln-${Date.now()}`,
      groupId: targetGroup.id,
      memberId: targetMember.id,
      memberName: targetMember.name,
      purpose: loanForm.purpose.trim(),
      principalUsd: principal,
      interestRatePercent: targetGroup.interestRatePercent,
      amountRepaidUsd: 0,
      disbursedDate: new Date().toISOString().slice(0, 10),
      dueDate: loanForm.dueDate,
      status: 'Active',
      syncState: isOfflineMode ? 'Pending Sync' : 'Synced',
    });

    setShowNewLoanModal(false);
    setLoanForm((prev) => ({ ...prev, purpose: '', principalUsd: '150' }));
  };

  const handleRepaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!repaymentLoan) return;
    setRepaymentError(null);
    const amount = Number(repaymentAmount);
    const totalDue =
      repaymentLoan.principalUsd * (1 + repaymentLoan.interestRatePercent / 100);
    const remaining = Math.max(0, totalDue - repaymentLoan.amountRepaidUsd);

    if (Number.isNaN(amount) || amount <= 0) {
      setRepaymentError('Enter a valid positive repayment amount.');
      return;
    }
    if (amount > remaining + 0.01) {
      setRepaymentError(`Repayment exceeds remaining balance ($${remaining.toFixed(2)} USD).`);
      return;
    }

    onRecordRepayment(repaymentLoan.id, amount);
    setRepaymentLoan(null);
    setRepaymentAmount('');
  };

  const handleExportLedgerCsv = () => {
    const headers = ['Date', 'Group', 'Member', 'Type', 'Amount (USD)', 'Sync State', 'Note'];
    const rows = filteredLedger.map((tx) => [
      tx.date,
      groups.find((g) => g.id === tx.groupId)?.name ?? tx.groupId,
      tx.memberName,
      tx.type,
      tx.amountUsd.toFixed(2),
      tx.syncState,
      tx.note,
    ]);
    downloadCsv('my-savings-companion-ledger.csv', headers, rows);
  };

  const handleExportShareOutCsv = () => {
    if (!shareOutGroup || !shareOutCalculation) return;
    const headers = [
      'Member Name',
      'Role',
      'Shares Held',
      'Saved Principal (USD)',
      'Gross Payout (USD)',
      'Outstanding Loan Deduction (USD)',
      'Net Cash Payout (USD)',
    ];
    const rows = shareOutCalculation.memberRows.map((row) => [
      row.member.name,
      row.member.role,
      row.member.sharesHeld,
      row.savedUsd.toFixed(2),
      row.grossPayoutUsd.toFixed(2),
      row.outstandingLoanUsd.toFixed(2),
      row.netCashPayoutUsd.toFixed(2),
    ]);
    downloadCsv(
      `${shareOutGroup.name.toLowerCase().replace(/\s+/g, '-')}-share-out.csv`,
      headers,
      rows
    );
  };

  const creditStatementGroup = creditStatementGroupId
    ? groups.find((g) => g.id === creditStatementGroupId) ?? null
    : null;

  const navItems: { id: WorkspaceTab; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
    { id: 'overview', label: 'Programme Overview', icon: LayoutDashboard },
    { id: 'groups', label: 'Savings Groups', icon: Users },
    { id: 'ledger', label: 'Meeting & Ledger', icon: FileSpreadsheet },
    { id: 'loans', label: 'Loan Portfolio', icon: Wallet },
    { id: 'shareout', label: 'Share-Out Calculator', icon: Calculator },
  ];

  const ledgerModalMembers = members.filter((m) => m.groupId === ledgerForm.groupId);
  const loanModalMembers = members.filter((m) => m.groupId === loanForm.groupId);

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex">
      {/* Mobile Sidebar Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
          aria-hidden="true"
        />
      )}

      {/* Left Sidebar Navigation (256px) */}
      <aside
        className={`fixed lg:sticky top-0 left-0 z-50 h-screen w-64 bg-white border-r border-slate-200 flex flex-col justify-between transition-transform duration-200 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        <div>
          <div className="h-16 px-5 flex items-center justify-between border-b border-slate-200">
            <button
              type="button"
              onClick={onBackToSite}
              className="inline-flex items-center gap-2.5 text-left whitespace-nowrap shrink-0 cursor-pointer group"
            >
              <img
                src="/assets/aistudio/1729770806-Admin-Small-Logo_9ae28f40.png"
                alt="My Savings Companion logo"
                className="h-8 w-8 object-contain shrink-0"
              />
              <span className="font-display text-sm font-bold tracking-tight text-slate-900 group-hover:text-emerald-900 transition-colors">
                My Savings Companion
              </span>
            </button>
            <button
              type="button"
              aria-label="Close sidebar"
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-1.5 text-slate-500 hover:text-slate-900 cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <nav aria-label="Workspace Navigation" className="p-3 space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => {
                    setActiveTab(item.id);
                    setSidebarOpen(false);
                  }}
                  className={`w-full flex items-center gap-3 px-3.5 py-2.5 text-sm font-medium rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                    isActive
                      ? 'bg-emerald-900 text-white'
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="truncate">{item.label}</span>
                </button>
              );
            })}
          </nav>
        </div>

        <div className="p-4 border-t border-slate-200 space-y-2">
          <button
            type="button"
            onClick={onBackToSite}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-3.5 h-3.5 shrink-0" />
            <span>Back to Public Website</span>
          </button>
          <button
            type="button"
            onClick={onResetDemoData}
            className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-medium text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
          >
            <RotateCcw className="w-3.5 h-3.5 shrink-0" />
            <span>Reset Cohort Data</span>
          </button>
          <p className="px-3 pt-2 text-[11px] text-slate-400">
            Inclusive Digital Solutions · Harare
          </p>
        </div>
      </aside>

      {/* Main Viewport */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Contextual Workspace Top Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white border-b border-slate-200 px-4 lg:px-8 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <button
              type="button"
              aria-label="Open navigation menu"
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-lg border border-slate-200 text-slate-700 hover:bg-slate-50 cursor-pointer shrink-0"
            >
              <Menu className="w-4 h-4" />
            </button>
            <div className="flex items-center gap-2 text-sm min-w-0">
              <span className="hidden sm:inline text-slate-400 whitespace-nowrap">Workspace</span>
              <span className="hidden sm:inline text-slate-300" aria-hidden="true">/</span>
              <h1 className="font-display font-semibold text-slate-900 truncate">
                {TAB_META[activeTab].breadcrumb}
              </h1>
            </div>
          </div>

          {/* Right Functional Controls: Currency Selector + Offline Sync Control */}
          <div className="flex items-center gap-2.5 shrink-0">
            <label htmlFor="workspace-currency" className="sr-only">
              Display Currency
            </label>
            <select
              id="workspace-currency"
              value={currency}
              onChange={(e) => onChangeCurrency(e.target.value as CurrencyCode)}
              className="h-9 px-2.5 text-xs font-mono font-medium bg-white border border-slate-200 rounded-lg text-slate-800 hover:border-slate-300 cursor-pointer"
            >
              {(Object.keys(CURRENCY_CONFIG) as CurrencyCode[]).map((code) => (
                <option key={code} value={code}>
                  {code}
                </option>
              ))}
            </select>

            <button
              type="button"
              onClick={onToggleOfflineMode}
              className={`h-9 inline-flex items-center gap-1.5 px-3 text-xs font-medium rounded-lg border transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                isOfflineMode
                  ? 'bg-amber-50 border-amber-300 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isOfflineMode ? (
                <>
                  <CloudOff className="w-3.5 h-3.5" />
                  <span>Offline Capture</span>
                </>
              ) : (
                <>
                  <Cloud className="w-3.5 h-3.5 text-emerald-800" />
                  <span className="hidden sm:inline">Online Sync</span>
                </>
              )}
            </button>

            {pendingSyncCount > 0 && (
              <button
                type="button"
                onClick={handleSyncClick}
                className="h-9 inline-flex items-center gap-1.5 px-3 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Sync ({pendingSyncCount})</span>
              </button>
            )}
          </div>
        </header>

        {/* Sync Feedback Banner */}
        {syncNotice && (
          <div
            role="status"
            className="bg-emerald-50 border-b border-emerald-200 px-6 lg:px-8 py-2.5 text-xs font-medium text-emerald-900 flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Check className="w-3.5 h-3.5" />
              {syncNotice}
            </span>
            <button
              type="button"
              onClick={() => setSyncNotice(null)}
              className="text-emerald-800 hover:text-emerald-950 cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Active View Content */}
        <main className="flex-1 p-5 lg:p-8 max-w-7xl w-full mx-auto space-y-6">
          {/* VIEW 1: PROGRAMME OVERVIEW */}
          {activeTab === 'overview' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900">
                    Programme Intelligence
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Consolidated cycle health across {groups.length} active community savings groups
                    and {members.length} registered members.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setLedgerForm((prev) => ({
                        ...prev,
                        groupId: groups[0]?.id ?? '',
                        memberId: members.find((m) => m.groupId === groups[0]?.id)?.id ?? '',
                      }));
                      setShowLedgerModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Record Meeting Entry</span>
                  </button>
                </div>
              </div>

              {/* 4-Metric KPI Grid */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-medium text-slate-500">Total Pooled Savings</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                    {formatMoney(portfolioTotals.totalSavingsUsd, currency)}
                  </p>
                  <p className="mt-1.5 text-xs text-emerald-800">
                    Across {groups.length} active cycles · {members.length} members
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-medium text-slate-500">Active Loan Portfolio</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                    {formatMoney(portfolioTotals.totalActiveLoansUsd, currency)}
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500">
                    {loans.filter((l) => l.status !== 'Repaid').length} active &amp; overdue loans
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-medium text-slate-500">Portfolio Overdue (PAR)</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                    {portfolioTotals.parRate}%
                  </p>
                  <p
                    className={`mt-1.5 text-xs font-medium ${
                      portfolioTotals.parRate > 15 ? 'text-amber-700' : 'text-emerald-800'
                    }`}
                  >
                    {formatMoney(portfolioTotals.totalOverdueUsd, currency)} overdue ·{' '}
                    {portfolioTotals.parRate > 15 ? 'Coaching Needed' : 'Nominal Range'}
                  </p>
                </div>

                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs font-medium text-slate-500">Average Meeting Attendance</p>
                  <p className="mt-2 font-mono text-2xl font-semibold text-slate-900 tabular-nums">
                    {portfolioTotals.avgAttendance}%
                  </p>
                  <p className="mt-1.5 text-xs text-slate-500">
                    {pendingSyncCount > 0
                      ? `${pendingSyncCount} local entries queued for sync`
                      : 'All field devices synchronized'}
                  </p>
                </div>
              </div>

              {/* Savings vs Loan Volume Chart */}
              <div className="bg-white border border-slate-200 rounded-xl p-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-5 border-b border-slate-100">
                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-900">
                      Six-Month Savings Mobilization vs. Loan Activity
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Values displayed in {CURRENCY_CONFIG[currency].label}
                    </p>
                  </div>
                  <div className="flex items-center gap-5 text-xs text-slate-600">
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-900 inline-block" />
                      Cumulative Savings
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs bg-slate-400 inline-block" />
                      Loans Disbursed
                    </span>
                    <span className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-xs bg-emerald-500 inline-block" />
                      Repayments
                    </span>
                  </div>
                </div>
                <div className="h-72 w-full pt-5">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={chartData} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                      <XAxis
                        dataKey="month"
                        tick={{ fontSize: 12, fill: '#64748b' }}
                        axisLine={{ stroke: '#e2e8f0' }}
                        tickLine={false}
                      />
                      <YAxis
                        tick={{ fontSize: 12, fill: '#64748b', fontFamily: 'IBM Plex Mono' }}
                        axisLine={false}
                        tickLine={false}
                        width={64}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: '#ffffff',
                          borderColor: '#e2e8f0',
                          borderRadius: '8px',
                          fontSize: '12px',
                        }}
                      />
                      <Bar dataKey="Savings" fill="#065f46" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      <Bar dataKey="Loans" fill="#94a3b8" radius={[4, 4, 0, 0]} maxBarSize={32} />
                      <Bar
                        dataKey="Repayments"
                        fill="#10b981"
                        radius={[4, 4, 0, 0]}
                        maxBarSize={32}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Group Health Portfolio Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div>
                    <h3 className="font-display text-base font-semibold text-slate-900">
                      Cohort Group Performance
                    </h3>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Select any group to inspect members, governance, and cycle progress.
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={overviewSearch}
                        onChange={(e) => setOverviewSearch(e.target.value)}
                        placeholder="Search group or district..."
                        aria-label="Search savings groups"
                        className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg text-slate-900 placeholder:text-slate-400 w-56"
                      />
                    </div>

                    <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                      {(['ALL', 'VSLA', 'ISAL', 'SILC'] as const).map((method) => (
                        <button
                          key={method}
                          type="button"
                          onClick={() => setMethodologyFilter(method)}
                          className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            methodologyFilter === method
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {method === 'ALL' ? 'All' : method}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {filteredOverviewGroups.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-sm font-medium text-slate-900">
                      No savings groups match your current filter.
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Clear your search query or register a new community group.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setOverviewSearch('');
                        setMethodologyFilter('ALL');
                      }}
                      className="mt-4 px-4 py-2 text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer"
                    >
                      Reset Filters
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[780px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500">
                          <th className="py-3 px-5">Savings Group</th>
                          <th className="py-3 px-4">Location &amp; Facilitator</th>
                          <th className="py-3 px-4 text-right">Members</th>
                          <th className="py-3 px-4 text-right">Pooled Savings</th>
                          <th className="py-3 px-4 text-right">Active Loans</th>
                          <th className="py-3 px-4 text-right">Attendance</th>
                          <th className="py-3 px-5">Cycle Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-sm">
                        {filteredOverviewGroups.map((g) => {
                          const fin = groupFinancials[g.id];
                          return (
                            <tr
                              key={g.id}
                              onClick={() => {
                                setSelectedGroupId(g.id);
                                setActiveTab('groups');
                              }}
                              className="hover:bg-slate-50 transition-colors cursor-pointer"
                            >
                              <td className="py-3.5 px-5">
                                <p className="font-semibold text-slate-900">{g.name}</p>
                                <p className="text-xs text-slate-500 mt-0.5">
                                  {g.methodology} · Cycle {g.cycleNumber} · {g.meetingsCompleted}/
                                  {g.totalPlannedMeetings} meetings
                                </p>
                              </td>
                              <td className="py-3.5 px-4">
                                <p className="text-slate-800">{g.district}</p>
                                <p className="text-xs text-slate-500">{g.facilitator}</p>
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                                {fin?.memberCount ?? 0}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-medium tabular-nums text-slate-900">
                                {formatMoney(fin?.savingsUsd ?? 0, currency)}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                                {formatMoney(fin?.activeLoanBalanceUsd ?? 0, currency)}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                                {fin?.avgAttendance ?? 0}%
                              </td>
                              <td className="py-3.5 px-5">
                                <span
                                  className={`text-xs font-medium ${
                                    g.status === 'Approaching Share-Out'
                                      ? 'text-amber-700'
                                      : 'text-emerald-800'
                                  }`}
                                >
                                  {g.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* VIEW 2: SAVINGS GROUPS & MEMBER GOVERNANCE */}
          {activeTab === 'groups' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900">
                    Savings Groups &amp; Governance
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Manage group constitutions, share prices, elected committee roles, and member
                    registers.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowNewGroupModal(true)}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Register Savings Group</span>
                </button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Group Directory Column */}
                <div className="lg:col-span-4 bg-white border border-slate-200 rounded-xl divide-y divide-slate-200 overflow-hidden">
                  <div className="px-5 py-3.5 bg-slate-50/70 text-xs font-semibold text-slate-500">
                    Active Groups ({groups.length})
                  </div>
                  {groups.map((g) => {
                    const isSelected = g.id === selectedGroup?.id;
                    const fin = groupFinancials[g.id];
                    return (
                      <button
                        key={g.id}
                        type="button"
                        onClick={() => setSelectedGroupId(g.id)}
                        className={`w-full text-left px-5 py-4 transition-colors cursor-pointer ${
                          isSelected ? 'bg-emerald-50/70' : 'hover:bg-slate-50'
                        }`}
                      >
                        <div className="flex items-start justify-between gap-2">
                          <p
                            className={`text-sm font-semibold ${
                              isSelected ? 'text-emerald-950' : 'text-slate-900'
                            }`}
                          >
                            {g.name}
                          </p>
                          <span className="font-mono text-xs text-slate-500 shrink-0">
                            {g.methodology}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 mt-1">
                          {g.district}, {g.province} · {fin?.memberCount ?? 0} members
                        </p>
                        <p className="mt-2 font-mono text-xs font-medium text-slate-800 tabular-nums">
                          Savings: {formatMoney(fin?.savingsUsd ?? 0, currency)}
                        </p>
                      </button>
                    );
                  })}
                </div>

                {/* Selected Group Detail & Member Roster */}
                {selectedGroup && (
                  <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl overflow-hidden">
                    <div className="p-6 border-b border-slate-200">
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div>
                          <p className="text-xs font-medium text-emerald-900">
                            {selectedGroup.methodology} · Cycle {selectedGroup.cycleNumber} ·{' '}
                            {selectedGroup.partnerOrg}
                          </p>
                          <h3 className="mt-1 font-display text-xl font-bold text-slate-900">
                            {selectedGroup.name}
                          </h3>
                          <p className="text-xs text-slate-500 mt-1">
                            {selectedGroup.district}, {selectedGroup.province} · Facilitator:{' '}
                            {selectedGroup.facilitator} · Last sync: {selectedGroup.lastSyncedAt}
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              setShareOutGroupId(selectedGroup.id);
                              setActiveTab('shareout');
                            }}
                            className="px-3.5 py-2 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Run Share-Out
                          </button>
                          <button
                            type="button"
                            onClick={() => setCreditStatementGroupId(selectedGroup.id)}
                            className="px-3.5 py-2 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                          >
                            Credit Statement
                          </button>
                        </div>
                      </div>

                      {/* Constitution Parameters Strip */}
                      <div className="mt-6 pt-5 border-t border-slate-100 grid grid-cols-2 sm:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-xs text-slate-500">Share Price</p>
                          <p className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums">
                            {formatMoney(selectedGroup.sharePriceUsd, currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Loan Interest Rate</p>
                          <p className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums">
                            {selectedGroup.interestRatePercent}% / cycle
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Social Fund / Mtg</p>
                          <p className="mt-0.5 font-mono font-semibold text-slate-900 tabular-nums">
                            {formatMoney(selectedGroup.socialFundPerMeetingUsd, currency)}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Cycle Window</p>
                          <p className="mt-0.5 font-mono text-xs font-medium text-slate-900 tabular-nums">
                            {selectedGroup.cycleStartDate} → {selectedGroup.cycleEndDate}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Member Roster Toolbar */}
                    <div className="px-6 py-4 bg-slate-50/70 border-b border-slate-200 flex items-center justify-between gap-4">
                      <p className="text-sm font-semibold text-slate-900">
                        Member Register ({selectedGroupMembers.length})
                      </p>
                      <button
                        type="button"
                        onClick={() => setShowAddMemberForm((prev) => !prev)}
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-900 hover:text-emerald-700 cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>{showAddMemberForm ? 'Cancel' : 'Add Member'}</span>
                      </button>
                    </div>

                    {showAddMemberForm && (
                      <form
                        onSubmit={handleAddMemberSubmit}
                        className="p-5 bg-slate-50 border-b border-slate-200 grid grid-cols-1 sm:grid-cols-12 gap-3 items-end"
                      >
                        <div className="sm:col-span-4">
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Member Full Name
                          </label>
                          <input
                            type="text"
                            required
                            value={newMemberForm.name}
                            onChange={(e) =>
                              setNewMemberForm((f) => ({ ...f, name: e.target.value }))
                            }
                            placeholder="e.g. Tariro Chikomo"
                            className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Committee Role
                          </label>
                          <select
                            value={newMemberForm.role}
                            onChange={(e) =>
                              setNewMemberForm((f) => ({
                                ...f,
                                role: e.target.value as MemberRole,
                              }))
                            }
                            className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg"
                          >
                            <option value="Member">Member</option>
                            <option value="Chairperson">Chairperson</option>
                            <option value="Treasurer">Treasurer</option>
                            <option value="Secretary">Secretary</option>
                            <option value="Box Keeper">Box Keeper</option>
                          </select>
                        </div>
                        <div className="sm:col-span-2">
                          <label className="block text-xs font-medium text-slate-700 mb-1">
                            Opening Shares
                          </label>
                          <input
                            type="number"
                            min={0}
                            value={newMemberForm.initialShares}
                            onChange={(e) =>
                              setNewMemberForm((f) => ({ ...f, initialShares: e.target.value }))
                            }
                            className="w-full px-3 py-1.5 text-sm bg-white border border-slate-300 rounded-lg font-mono"
                          />
                        </div>
                        <div className="sm:col-span-3">
                          <button
                            type="submit"
                            className="w-full px-4 py-2 text-xs font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg cursor-pointer"
                          >
                            Save Member
                          </button>
                        </div>
                      </form>
                    )}

                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse min-w-[600px]">
                        <thead>
                          <tr className="border-b border-slate-200 text-xs font-semibold text-slate-500">
                            <th className="py-3 px-6">Member</th>
                            <th className="py-3 px-4">Role</th>
                            <th className="py-3 px-4 text-right">Shares</th>
                            <th className="py-3 px-4 text-right">Total Saved</th>
                            <th className="py-3 px-6 text-right">Attendance</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200 text-sm">
                          {selectedGroupMembers.map((m) => (
                            <tr key={m.id} className="hover:bg-slate-50/70">
                              <td className="py-3 px-6">
                                <p className="font-medium text-slate-900">{m.name}</p>
                                <p className="text-xs text-slate-500 font-mono">{m.phone}</p>
                              </td>
                              <td className="py-3 px-4 text-slate-700">{m.role}</td>
                              <td className="py-3 px-4 text-right font-mono tabular-nums text-slate-900">
                                {m.sharesHeld}
                              </td>
                              <td className="py-3 px-4 text-right font-mono font-medium tabular-nums text-slate-900">
                                {formatMoney(m.sharesHeld * selectedGroup.sharePriceUsd, currency)}
                              </td>
                              <td className="py-3 px-6 text-right font-mono tabular-nums text-slate-700">
                                {m.attendanceRate}%
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* VIEW 3: MEETING & TRANSACTION LEDGER */}
          {activeTab === 'ledger' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900">
                    Meeting &amp; Transaction Ledger
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Audit-ready record of savings shares, loan movements, social funds, penalties,
                    and expenses.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={handleExportLedgerCsv}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    <span>Download CSV</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const defaultGrp =
                        ledgerGroupFilter !== 'ALL' ? ledgerGroupFilter : groups[0]?.id ?? '';
                      setLedgerForm({
                        groupId: defaultGrp,
                        memberId: members.find((m) => m.groupId === defaultGrp)?.id ?? '',
                        type: 'Savings',
                        sharesCount: '3',
                        amountUsd: '15',
                        note: '',
                      });
                      setShowLedgerModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Record Meeting Entry</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={ledgerSearch}
                        onChange={(e) => setLedgerSearch(e.target.value)}
                        placeholder="Search member or note..."
                        aria-label="Search ledger entries"
                        className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg w-56"
                      />
                    </div>

                    <select
                      aria-label="Filter by group"
                      value={ledgerGroupFilter}
                      onChange={(e) => setLedgerGroupFilter(e.target.value)}
                      className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800"
                    >
                      <option value="ALL">All Groups</option>
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name}
                        </option>
                      ))}
                    </select>

                    <select
                      aria-label="Filter by transaction type"
                      value={ledgerTypeFilter}
                      onChange={(e) =>
                        setLedgerTypeFilter(e.target.value as 'ALL' | LedgerEntryType)
                      }
                      className="px-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800"
                    >
                      <option value="ALL">All Types</option>
                      <option value="Savings">Savings</option>
                      <option value="Social Fund">Social Fund</option>
                      <option value="Loan Disbursement">Loan Disbursement</option>
                      <option value="Loan Repayment">Loan Repayment</option>
                      <option value="Penalty">Penalty</option>
                      <option value="Expense">Expense</option>
                    </select>
                  </div>

                  <p className="text-xs text-slate-500 font-mono tabular-nums">
                    {filteredLedger.length} entries shown
                  </p>
                </div>

                {filteredLedger.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-sm font-medium text-slate-900">No ledger entries found.</p>
                    <p className="text-xs text-slate-500 mt-1">
                      Adjust your filter or record a new meeting transaction.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[780px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500">
                          <th className="py-3 px-5">Date</th>
                          <th className="py-3 px-4">Group &amp; Member</th>
                          <th className="py-3 px-4">Category</th>
                          <th className="py-3 px-4">Note</th>
                          <th className="py-3 px-4 text-right">Amount</th>
                          <th className="py-3 px-5 text-right">Sync State</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-sm">
                        {filteredLedger.map((tx) => {
                          const isOutflow =
                            tx.type === 'Expense' || tx.type === 'Loan Disbursement';
                          return (
                            <tr key={tx.id} className="hover:bg-slate-50/70">
                              <td className="py-3 px-5 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                                {tx.date}
                              </td>
                              <td className="py-3 px-4">
                                <p className="font-medium text-slate-900">{tx.memberName}</p>
                                <p className="text-xs text-slate-500">
                                  {groups.find((g) => g.id === tx.groupId)?.name ?? tx.groupId}
                                </p>
                              </td>
                              <td className="py-3 px-4 text-slate-700 whitespace-nowrap">
                                {tx.type}
                              </td>
                              <td className="py-3 px-4 text-xs text-slate-600 max-w-xs truncate">
                                {tx.note}
                              </td>
                              <td
                                className={`py-3 px-4 text-right font-mono font-medium tabular-nums whitespace-nowrap ${
                                  isOutflow ? 'text-slate-700' : 'text-emerald-800'
                                }`}
                              >
                                {isOutflow ? '-' : '+'}
                                {formatMoney(tx.amountUsd, currency)}
                              </td>
                              <td className="py-3 px-5 text-right text-xs font-medium whitespace-nowrap">
                                <span
                                  className={
                                    tx.syncState === 'Pending Sync'
                                      ? 'text-amber-700'
                                      : 'text-slate-500'
                                  }
                                >
                                  {tx.syncState}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* VIEW 4: LOAN PORTFOLIO & CREDIT LINKAGES */}
          {activeTab === 'loans' && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900">
                    Loan Portfolio &amp; Formal Credit Linkages
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Monitor disbursements, flag overdue obligations, record repayments, and generate
                    verifiable FSP credit statements.
                  </p>
                </div>
                <div className="flex items-center gap-2.5">
                  <button
                    type="button"
                    onClick={() => setCreditStatementGroupId(groups[0]?.id ?? null)}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-800 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Landmark className="w-4 h-4 text-emerald-900" />
                    <span>FSP Credit Statement</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      const gId = groups[0]?.id ?? '';
                      setLoanForm({
                        groupId: gId,
                        memberId: members.find((m) => m.groupId === gId)?.id ?? '',
                        principalUsd: '150',
                        purpose: '',
                        dueDate: '2027-02-15',
                      });
                      setShowNewLoanModal(true);
                    }}
                    className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Issue New Loan</span>
                  </button>
                </div>
              </div>

              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="p-5 border-b border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <div className="relative">
                      <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={loanSearch}
                        onChange={(e) => setLoanSearch(e.target.value)}
                        placeholder="Search borrower or purpose..."
                        aria-label="Search loans"
                        className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg w-56"
                      />
                    </div>

                    <div className="inline-flex items-center p-0.5 bg-slate-100 rounded-lg border border-slate-200">
                      {(['ALL', 'Active', 'Overdue', 'Repaid'] as const).map((status) => (
                        <button
                          key={status}
                          type="button"
                          onClick={() => setLoanStatusFilter(status)}
                          className={`px-3 py-1 text-xs font-medium rounded-md transition-colors whitespace-nowrap shrink-0 cursor-pointer ${
                            loanStatusFilter === status
                              ? 'bg-white text-slate-900 shadow-xs'
                              : 'text-slate-600 hover:text-slate-900'
                          }`}
                        >
                          {status === 'ALL' ? 'All' : status}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-xs text-slate-500 font-mono tabular-nums">
                    {filteredLoans.length} loan records
                  </p>
                </div>

                {filteredLoans.length === 0 ? (
                  <div className="p-10 text-center">
                    <p className="text-sm font-medium text-slate-900">
                      No loan records match your filter.
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse min-w-[860px]">
                      <thead>
                        <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500">
                          <th className="py-3 px-5">Borrower &amp; Group</th>
                          <th className="py-3 px-4">Enterprise Purpose</th>
                          <th className="py-3 px-4 text-right">Total Due</th>
                          <th className="py-3 px-4 text-right">Repaid</th>
                          <th className="py-3 px-4 text-right">Remaining</th>
                          <th className="py-3 px-4">Due Date</th>
                          <th className="py-3 px-4">Status</th>
                          <th className="py-3 px-5 text-right">Action</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200 text-sm">
                        {filteredLoans.map((loan) => {
                          const totalDueUsd =
                            loan.principalUsd * (1 + loan.interestRatePercent / 100);
                          const remainingUsd = Math.max(0, totalDueUsd - loan.amountRepaidUsd);
                          return (
                            <tr key={loan.id} className="hover:bg-slate-50/70">
                              <td className="py-3.5 px-5">
                                <p className="font-semibold text-slate-900">{loan.memberName}</p>
                                <p className="text-xs text-slate-500">
                                  {groups.find((g) => g.id === loan.groupId)?.name ?? loan.groupId}
                                </p>
                              </td>
                              <td className="py-3.5 px-4 text-xs text-slate-600 max-w-xs">
                                {loan.purpose}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-800 whitespace-nowrap">
                                {formatMoney(totalDueUsd, currency)}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono tabular-nums text-emerald-800 whitespace-nowrap">
                                {formatMoney(loan.amountRepaidUsd, currency)}
                              </td>
                              <td className="py-3.5 px-4 text-right font-mono font-medium tabular-nums text-slate-900 whitespace-nowrap">
                                {formatMoney(remainingUsd, currency)}
                              </td>
                              <td className="py-3.5 px-4 font-mono text-xs text-slate-600 tabular-nums whitespace-nowrap">
                                {loan.dueDate}
                              </td>
                              <td className="py-3.5 px-4 whitespace-nowrap">
                                <span
                                  className={`text-xs font-semibold ${
                                    loan.status === 'Overdue'
                                      ? 'text-red-700'
                                      : loan.status === 'Active'
                                      ? 'text-amber-700'
                                      : 'text-emerald-800'
                                  }`}
                                >
                                  {loan.status}
                                </span>
                              </td>
                              <td className="py-3.5 px-5 text-right whitespace-nowrap">
                                {loan.status !== 'Repaid' ? (
                                  <button
                                    type="button"
                                    onClick={() => {
                                      setRepaymentLoan(loan);
                                      setRepaymentAmount(Math.min(50, remainingUsd).toFixed(2));
                                      setRepaymentError(null);
                                    }}
                                    className="px-3 py-1.5 text-xs font-semibold text-emerald-900 bg-emerald-50 hover:bg-emerald-100 rounded-md transition-colors cursor-pointer"
                                  >
                                    Record Payment
                                  </button>
                                ) : (
                                  <span className="text-xs text-slate-400">Settled</span>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </>
          )}

          {/* VIEW 5: AUTOMATED SHARE-OUT CALCULATOR */}
          {activeTab === 'shareout' && shareOutGroup && shareOutCalculation && (
            <>
              <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
                <div>
                  <h2 className="font-display text-2xl font-bold text-slate-900">
                    Automated Share-Out Calculator
                  </h2>
                  <p className="text-sm text-slate-600 mt-1">
                    Compute exact end-of-cycle share value, deduct unpaid member loans, and export
                    the cash distribution sheet.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleExportShareOutCsv}
                  className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Export Share-Out CSV</span>
                </button>
              </div>

              {/* Controls Bar */}
              <div className="bg-white border border-slate-200 rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-4">
                  <div>
                    <label
                      htmlFor="shareout-group"
                      className="block text-xs font-medium text-slate-500 mb-1"
                    >
                      Select Savings Group
                    </label>
                    <select
                      id="shareout-group"
                      value={shareOutGroup.id}
                      onChange={(e) => setShareOutGroupId(e.target.value)}
                      className="px-3 py-2 text-sm font-medium border border-slate-300 rounded-lg bg-white text-slate-900"
                    >
                      {groups.map((g) => (
                        <option key={g.id} value={g.id}>
                          {g.name} (Cycle {g.cycleNumber})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="pt-4 md:pt-5">
                    <label className="inline-flex items-center gap-2.5 text-sm text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={distributeSocialFund}
                        onChange={(e) => setDistributeSocialFund(e.target.checked)}
                        className="w-4 h-4 accent-emerald-900 rounded cursor-pointer"
                      />
                      <span>Include Social Fund in payout (instead of carrying over)</span>
                    </label>
                  </div>
                </div>

                <div className="text-left md:text-right">
                  <p className="text-xs text-slate-500">Calculated Value Per Share</p>
                  <p className="font-mono text-2xl font-bold text-emerald-900 tabular-nums">
                    {formatMoney(shareOutCalculation.valuePerShareUsd, currency)}
                  </p>
                  <p className="text-xs text-slate-500 font-mono tabular-nums">
                    Base share {formatMoney(shareOutGroup.sharePriceUsd, currency)} · +
                    {shareOutCalculation.returnOnSavingsPct}% cycle return
                  </p>
                </div>
              </div>

              {/* Pool Breakdown Strip */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs text-slate-500">Member Share Capital</p>
                  <p className="mt-1.5 font-mono text-xl font-semibold text-slate-900 tabular-nums">
                    {formatMoney(shareOutCalculation.totalShareCapitalUsd, currency)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
                    {shareOutCalculation.totalShares} total shares
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs text-slate-500">Collected Loan Interest</p>
                  <p className="mt-1.5 font-mono text-xl font-semibold text-emerald-800 tabular-nums">
                    +{formatMoney(shareOutCalculation.interestEarnedUsd, currency)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Penalties: +{formatMoney(shareOutCalculation.penaltiesUsd, currency)}
                  </p>
                </div>
                <div className="bg-white border border-slate-200 rounded-xl p-5">
                  <p className="text-xs text-slate-500">Group Expenses Deducted</p>
                  <p className="mt-1.5 font-mono text-xl font-semibold text-slate-900 tabular-nums">
                    -{formatMoney(shareOutCalculation.expensesUsd, currency)}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">
                    Social fund: {formatMoney(shareOutCalculation.socialFundUsd, currency)} (
                    {distributeSocialFund ? 'Included' : 'Carried over'})
                  </p>
                </div>
                <div className="bg-white border border-emerald-900/30 rounded-xl p-5">
                  <p className="text-xs font-medium text-emerald-900">Total Distributable Pool</p>
                  <p className="mt-1.5 font-mono text-xl font-bold text-slate-900 tabular-nums">
                    {formatMoney(shareOutCalculation.totalDistributableUsd, currency)}
                  </p>
                  <p className="mt-1 text-xs text-emerald-800">
                    Net cycle profit: {formatMoney(shareOutCalculation.netProfitUsd, currency)}
                  </p>
                </div>
              </div>

              {/* Member-by-Member Payout Schedule Table */}
              <div className="bg-white border border-slate-200 rounded-xl overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                  <h3 className="font-display text-base font-semibold text-slate-900">
                    Member Payout Schedule — {shareOutGroup.name}
                  </h3>
                  <span className="text-xs text-slate-500">
                    Unpaid loans automatically deducted from gross payout
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse min-w-[720px]">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/70 text-xs font-semibold text-slate-500">
                        <th className="py-3 px-6">Member</th>
                        <th className="py-3 px-4 text-right">Shares Held</th>
                        <th className="py-3 px-4 text-right">Principal Saved</th>
                        <th className="py-3 px-4 text-right">Gross Payout</th>
                        <th className="py-3 px-4 text-right">Unpaid Loan Deduction</th>
                        <th className="py-3 px-6 text-right">Net Cash Payout</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200 text-sm">
                      {shareOutCalculation.memberRows.map((row) => (
                        <tr key={row.member.id} className="hover:bg-slate-50/70">
                          <td className="py-3.5 px-6">
                            <p className="font-medium text-slate-900">{row.member.name}</p>
                            <p className="text-xs text-slate-500">{row.member.role}</p>
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                            {row.member.sharesHeld}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-700">
                            {formatMoney(row.savedUsd, currency)}
                          </td>
                          <td className="py-3.5 px-4 text-right font-mono tabular-nums text-slate-900">
                            {formatMoney(row.grossPayoutUsd, currency)}
                          </td>
                          <td
                            className={`py-3.5 px-4 text-right font-mono tabular-nums ${
                              row.outstandingLoanUsd > 0 ? 'text-red-700 font-medium' : 'text-slate-400'
                            }`}
                          >
                            {row.outstandingLoanUsd > 0
                              ? `-${formatMoney(row.outstandingLoanUsd, currency)}`
                              : formatMoney(0, currency)}
                          </td>
                          <td className="py-3.5 px-6 text-right font-mono font-semibold tabular-nums text-emerald-900">
                            {formatMoney(row.netCashPayoutUsd, currency)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* MODAL: Register New Savings Group */}
      {showNewGroupModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-new-group-title"
          className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 id="modal-new-group-title" className="font-display text-lg font-bold text-slate-900">
                Register New Savings Group
              </h3>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setShowNewGroupModal(false)}
                className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleCreateGroupSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Group Name</label>
                <input
                  type="text"
                  required
                  value={newGroupForm.name}
                  onChange={(e) => setNewGroupForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="e.g. Epworth Youth Artisans VSLA"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Methodology
                  </label>
                  <select
                    value={newGroupForm.methodology}
                    onChange={(e) =>
                      setNewGroupForm((f) => ({
                        ...f,
                        methodology: e.target.value as Methodology,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="VSLA">VSLA</option>
                    <option value="ISAL">ISAL</option>
                    <option value="SILC">SILC</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">District</label>
                  <input
                    type="text"
                    required
                    value={newGroupForm.district}
                    onChange={(e) => setNewGroupForm((f) => ({ ...f, district: e.target.value }))}
                    placeholder="e.g. Goromonzi"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Share Price (USD)
                  </label>
                  <input
                    type="number"
                    min={1}
                    step="0.5"
                    value={newGroupForm.sharePriceUsd}
                    onChange={(e) =>
                      setNewGroupForm((f) => ({ ...f, sharePriceUsd: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Interest (%)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={30}
                    value={newGroupForm.interestRatePercent}
                    onChange={(e) =>
                      setNewGroupForm((f) => ({ ...f, interestRatePercent: e.target.value }))
                    }
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Social Fund ($)
                  </label>
                  <input
                    type="number"
                    min={0}
                    step="0.5"
                    value={newGroupForm.socialFundPerMeetingUsd}
                    onChange={(e) =>
                      setNewGroupForm((f) => ({
                        ...f,
                        socialFundPerMeetingUsd: e.target.value,
                      }))
                    }
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-2 border-t border-slate-100">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Founding Chairperson
                  </label>
                  <input
                    type="text"
                    required
                    value={newGroupForm.chairName}
                    onChange={(e) => setNewGroupForm((f) => ({ ...f, chairName: e.target.value }))}
                    placeholder="Full name"
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Phone</label>
                  <input
                    type="tel"
                    value={newGroupForm.chairPhone}
                    onChange={(e) => setNewGroupForm((f) => ({ ...f, chairPhone: e.target.value }))}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              {newGroupError && <p className="text-xs text-red-700 font-medium">{newGroupError}</p>}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewGroupModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg cursor-pointer"
                >
                  Create Group
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Record Meeting Ledger Entry */}
      {showLedgerModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-ledger-title"
          className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <h3 id="modal-ledger-title" className="font-display text-lg font-bold text-slate-900">
                  Record Meeting Entry
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isOfflineMode
                    ? 'Offline Capture active — entry will queue locally until synced.'
                    : 'Entry will synchronize immediately to the group ledger.'}
                </p>
              </div>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setShowLedgerModal(false)}
                className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleLedgerSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Savings Group
                  </label>
                  <select
                    value={ledgerForm.groupId}
                    onChange={(e) => {
                      const nextGrp = e.target.value;
                      const firstMember = members.find((m) => m.groupId === nextGrp)?.id ?? '';
                      setLedgerForm((f) => ({ ...f, groupId: nextGrp, memberId: firstMember }));
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Transaction Type
                  </label>
                  <select
                    value={ledgerForm.type}
                    onChange={(e) =>
                      setLedgerForm((f) => ({ ...f, type: e.target.value as LedgerEntryType }))
                    }
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    <option value="Savings">Savings (Shares)</option>
                    <option value="Social Fund">Social Fund</option>
                    <option value="Penalty">Penalty</option>
                    <option value="Expense">Group Expense</option>
                  </select>
                </div>
              </div>

              {ledgerForm.type !== 'Expense' && (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Member</label>
                  <select
                    value={ledgerForm.memberId}
                    onChange={(e) => setLedgerForm((f) => ({ ...f, memberId: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    {ledgerModalMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name} ({m.role})
                      </option>
                    ))}
                  </select>
                </div>
              )}

              {ledgerForm.type === 'Savings' ? (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Number of Shares Purchased (1–5 shares per meeting)
                  </label>
                  <input
                    type="number"
                    min={1}
                    max={20}
                    value={ledgerForm.sharesCount}
                    onChange={(e) => setLedgerForm((f) => ({ ...f, sharesCount: e.target.value }))}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                  />
                  <p className="mt-1 text-xs text-slate-500 font-mono tabular-nums">
                    Calculated deposit:{' '}
                    {formatMoney(
                      (Number(ledgerForm.sharesCount) || 0) *
                        (groups.find((g) => g.id === ledgerForm.groupId)?.sharePriceUsd ?? 5),
                      currency
                    )}
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Amount (USD Base)
                  </label>
                  <input
                    type="number"
                    min={0.5}
                    step="0.5"
                    value={ledgerForm.amountUsd}
                    onChange={(e) => setLedgerForm((f) => ({ ...f, amountUsd: e.target.value }))}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Meeting Note (Optional)
                </label>
                <input
                  type="text"
                  value={ledgerForm.note}
                  onChange={(e) => setLedgerForm((f) => ({ ...f, note: e.target.value }))}
                  placeholder="e.g. Meeting #23 regular deposit"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>

              {ledgerError && <p className="text-xs text-red-700 font-medium">{ledgerError}</p>}

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowLedgerModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg cursor-pointer"
                >
                  {isOfflineMode ? 'Queue Offline Entry' : 'Save Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Issue New Loan */}
      {showNewLoanModal && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-loan-title"
          className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-lg overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 id="modal-loan-title" className="font-display text-lg font-bold text-slate-900">
                Issue Group Loan
              </h3>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setShowNewLoanModal(false)}
                className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleIssueLoanSubmit} className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Savings Group
                  </label>
                  <select
                    value={loanForm.groupId}
                    onChange={(e) => {
                      const nextGrp = e.target.value;
                      const firstMember = members.find((m) => m.groupId === nextGrp)?.id ?? '';
                      setLoanForm((f) => ({ ...f, groupId: nextGrp, memberId: firstMember }));
                    }}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Borrower</label>
                  <select
                    value={loanForm.memberId}
                    onChange={(e) => setLoanForm((f) => ({ ...f, memberId: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg bg-white"
                  >
                    {loanModalMembers.map((m) => (
                      <option key={m.id} value={m.id}>
                        {m.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">
                    Principal (USD)
                  </label>
                  <input
                    type="number"
                    min={10}
                    step="5"
                    value={loanForm.principalUsd}
                    onChange={(e) => setLoanForm((f) => ({ ...f, principalUsd: e.target.value }))}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Due Date</label>
                  <input
                    type="date"
                    value={loanForm.dueDate}
                    onChange={(e) => setLoanForm((f) => ({ ...f, dueDate: e.target.value }))}
                    className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                  />
                </div>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Enterprise / Loan Purpose
                </label>
                <input
                  type="text"
                  required
                  value={loanForm.purpose}
                  onChange={(e) => setLoanForm((f) => ({ ...f, purpose: e.target.value }))}
                  placeholder="e.g. Solar irrigation pump deposit or wholesale grain stock"
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg"
                />
              </div>
              {loanFormError && <p className="text-xs text-red-700 font-medium">{loanFormError}</p>}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowNewLoanModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg cursor-pointer"
                >
                  Disburse Loan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Record Loan Repayment */}
      {repaymentLoan && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-repay-title"
          className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-md overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <h3 id="modal-repay-title" className="font-display text-lg font-bold text-slate-900">
                Record Loan Repayment
              </h3>
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setRepaymentLoan(null)}
                className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <form onSubmit={handleRepaymentSubmit} className="p-6 space-y-4">
              <div className="text-sm space-y-1 pb-3 border-b border-slate-100">
                <p className="font-semibold text-slate-900">{repaymentLoan.memberName}</p>
                <p className="text-xs text-slate-500">{repaymentLoan.purpose}</p>
                <p className="text-xs font-mono text-slate-700 pt-1 tabular-nums">
                  Remaining balance:{' '}
                  {formatMoney(
                    Math.max(
                      0,
                      repaymentLoan.principalUsd * (1 + repaymentLoan.interestRatePercent / 100) -
                        repaymentLoan.amountRepaidUsd
                    ),
                    currency
                  )}
                </p>
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Repayment Amount (USD Base)
                </label>
                <input
                  type="number"
                  min={1}
                  step="0.5"
                  value={repaymentAmount}
                  onChange={(e) => setRepaymentAmount(e.target.value)}
                  className="w-full px-3 py-2 text-sm font-mono border border-slate-300 rounded-lg"
                />
              </div>
              {repaymentError && <p className="text-xs text-red-700 font-medium">{repaymentError}</p>}
              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setRepaymentLoan(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg cursor-pointer"
                >
                  Confirm Payment
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: Verifiable FSP Credit History Statement */}
      {creditStatementGroup && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-credit-title"
          className="fixed inset-0 z-50 bg-slate-950/50 flex items-center justify-center p-4"
        >
          <div className="bg-white border border-slate-200 rounded-xl w-full max-w-xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-emerald-900">
                  Formal Financial Linkage Packet
                </p>
                <h3 id="modal-credit-title" className="font-display text-lg font-bold text-slate-900">
                  Verified Group Credit Statement
                </h3>
              </div>
              <button
                type="button"
                aria-label="Close statement"
                onClick={() => setCreditStatementGroupId(null)}
                className="p-1 text-slate-500 hover:text-slate-900 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-6 space-y-5">
              <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-200">
                <div>
                  <select
                    aria-label="Select group for credit statement"
                    value={creditStatementGroup.id}
                    onChange={(e) => setCreditStatementGroupId(e.target.value)}
                    className="font-display text-base font-bold text-slate-900 border border-slate-200 rounded-lg px-3 py-1.5 bg-white"
                  >
                    {groups.map((g) => (
                      <option key={g.id} value={g.id}>
                        {g.name}
                      </option>
                    ))}
                  </select>
                  <p className="text-xs text-slate-500 mt-1.5">
                    {creditStatementGroup.methodology} · {creditStatementGroup.district},{' '}
                    {creditStatementGroup.province} · Cycle {creditStatementGroup.cycleNumber}
                  </p>
                </div>
                <div className="text-right text-xs text-slate-500 font-mono">
                  <p>Generated: {new Date().toISOString().slice(0, 10)}</p>
                  <p className="text-emerald-800 font-medium mt-0.5">Audit Trail Verified</p>
                </div>
              </div>

              {(() => {
                const fin = groupFinancials[creditStatementGroup.id];
                const gLoans = loans.filter((l) => l.groupId === creditStatementGroup.id);
                const totalIssued = gLoans.reduce((s, l) => s + l.principalUsd, 0);
                const totalDue = gLoans.reduce(
                  (s, l) => s + l.principalUsd * (1 + l.interestRatePercent / 100),
                  0
                );
                const totalRepaid = gLoans.reduce((s, l) => s + l.amountRepaidUsd, 0);
                const recoveryPct =
                  totalDue > 0 ? Math.round((totalRepaid / totalDue) * 1000) / 10 : 100;

                return (
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-sm">
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-xs text-slate-500">Pooled Savings</p>
                      <p className="mt-1 font-mono font-semibold text-slate-900 tabular-nums">
                        {formatMoney(fin?.savingsUsd ?? 0, currency)}
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-xs text-slate-500">Internal Loans Issued</p>
                      <p className="mt-1 font-mono font-semibold text-slate-900 tabular-nums">
                        {formatMoney(totalIssued, currency)}
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-xs text-slate-500">Recovery Rate</p>
                      <p className="mt-1 font-mono font-semibold text-emerald-800 tabular-nums">
                        {recoveryPct}%
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-xs text-slate-500">Registered Members</p>
                      <p className="mt-1 font-mono font-semibold text-slate-900 tabular-nums">
                        {fin?.memberCount ?? 0}
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-xs text-slate-500">Meeting Attendance</p>
                      <p className="mt-1 font-mono font-semibold text-slate-900 tabular-nums">
                        {fin?.avgAttendance ?? 0}%
                      </p>
                    </div>
                    <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg">
                      <p className="text-xs text-slate-500">Completed Cycles</p>
                      <p className="mt-1 font-mono font-semibold text-slate-900 tabular-nums">
                        {creditStatementGroup.cycleNumber}
                      </p>
                    </div>
                  </div>
                );
              })()}

              <p className="text-xs text-slate-500 leading-relaxed">
                This statement summarizes digitally recorded meeting activity from My Savings
                Companion (Inclusive Digital Solutions, Harare) to assist partner banks and
                microfinance institutions during group credit underwriting.
              </p>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setCreditStatementGroupId(null)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-100 rounded-lg cursor-pointer"
                >
                  Close
                </button>
                <button
                  type="button"
                  onClick={() => {
                    const fin = groupFinancials[creditStatementGroup.id];
                    downloadCsv(
                      `${creditStatementGroup.name.toLowerCase().replace(/\s+/g, '-')}-credit-statement.csv`,
                      ['Field', 'Value'],
                      [
                        ['Savings Group', creditStatementGroup.name],
                        ['Methodology', creditStatementGroup.methodology],
                        ['District', `${creditStatementGroup.district}, ${creditStatementGroup.province}`],
                        ['Cycle Number', creditStatementGroup.cycleNumber],
                        ['Members', fin?.memberCount ?? 0],
                        ['Pooled Savings (USD)', (fin?.savingsUsd ?? 0).toFixed(2)],
                        ['Active Loan Balance (USD)', (fin?.activeLoanBalanceUsd ?? 0).toFixed(2)],
                        ['Average Attendance (%)', fin?.avgAttendance ?? 0],
                      ]
                    );
                  }}
                  className="inline-flex items-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-emerald-900 hover:bg-emerald-800 rounded-lg cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>Download Statement CSV</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
