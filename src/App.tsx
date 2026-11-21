import { useEffect, useMemo, useState } from 'react';
import { PublicSite, WorkspaceTab } from './components/PublicSite';
import { WorkspaceApp } from './components/WorkspaceApp';
import {
  INITIAL_GROUPS,
  INITIAL_LEDGER,
  INITIAL_LOANS,
  INITIAL_MEMBERS,
} from './data/seedData';
import {
  CurrencyCode,
  GroupMember,
  LedgerEntry,
  LoanRecord,
  SavingsGroup,
} from './types/savings';

const STORAGE_KEY = 'msc_redesign_state_v1';

interface PersistedState {
  groups: SavingsGroup[];
  members: GroupMember[];
  loans: LoanRecord[];
  ledger: LedgerEntry[];
  currency: CurrencyCode;
}

function loadInitialState(): PersistedState {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<PersistedState>;
      if (
        Array.isArray(parsed.groups) &&
        Array.isArray(parsed.members) &&
        Array.isArray(parsed.loans) &&
        Array.isArray(parsed.ledger)
      ) {
        return {
          groups: parsed.groups,
          members: parsed.members,
          loans: parsed.loans,
          ledger: parsed.ledger,
          currency: parsed.currency ?? 'USD',
        };
      }
    }
  } catch {
    // Ignore storage read errors and fall back to seed data
  }

  return {
    groups: INITIAL_GROUPS,
    members: INITIAL_MEMBERS,
    loans: INITIAL_LOANS,
    ledger: INITIAL_LEDGER,
    currency: 'USD',
  };
}

export default function App() {
  const [view, setView] = useState<'site' | 'workspace'>('site');
  const [workspaceInitialTab, setWorkspaceInitialTab] = useState<WorkspaceTab>('overview');
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);

  const [state, setState] = useState<PersistedState>(loadInitialState);

  useEffect(() => {
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // Ignore storage quota errors
    }
  }, [state]);

  const totalSavingsUsd = useMemo(() => {
    return state.groups.reduce((sum, group) => {
      const groupShares = state.members
        .filter((m) => m.groupId === group.id)
        .reduce((s, m) => s + m.sharesHeld, 0);
      return sum + groupShares * group.sharePriceUsd;
    }, 0);
  }, [state.groups, state.members]);

  const handleOpenWorkspace = (tab: WorkspaceTab = 'overview') => {
    setWorkspaceInitialTab(tab);
    setView('workspace');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleBackToSite = () => {
    setView('site');
    window.scrollTo({ top: 0, behavior: 'auto' });
  };

  const handleAddGroup = (group: SavingsGroup, initialChair: GroupMember) => {
    setState((prev) => ({
      ...prev,
      groups: [group, ...prev.groups],
      members: [initialChair, ...prev.members],
    }));
  };

  const handleAddMember = (member: GroupMember) => {
    setState((prev) => ({
      ...prev,
      members: [...prev.members, member],
    }));
  };

  const handleRecordLedgerEntry = (entry: LedgerEntry) => {
    setState((prev) => {
      const updatedMembers = prev.members.map((m) => {
        if (m.id !== entry.memberId) return m;
        if (entry.type === 'Savings' && entry.sharesDelta) {
          return { ...m, sharesHeld: m.sharesHeld + entry.sharesDelta };
        }
        if (entry.type === 'Social Fund') {
          return {
            ...m,
            socialFundContributedUsd: m.socialFundContributedUsd + entry.amountUsd,
          };
        }
        return m;
      });

      const updatedGroups = prev.groups.map((g) => {
        if (g.id !== entry.groupId) return g;
        return {
          ...g,
          lastSyncedAt:
            entry.syncState === 'Pending Sync'
              ? 'Local changes queued'
              : new Date().toISOString().slice(0, 16).replace('T', ' '),
        };
      });

      return {
        ...prev,
        groups: updatedGroups,
        members: updatedMembers,
        ledger: [entry, ...prev.ledger],
      };
    });
  };

  const handleIssueLoan = (loan: LoanRecord) => {
    const ledgerEntry: LedgerEntry = {
      id: `tx-ln-${Date.now()}`,
      groupId: loan.groupId,
      memberId: loan.memberId,
      memberName: loan.memberName,
      date: loan.disbursedDate,
      type: 'Loan Disbursement',
      amountUsd: loan.principalUsd,
      note: `Loan issued: ${loan.purpose}`,
      syncState: loan.syncState,
    };

    setState((prev) => ({
      ...prev,
      loans: [loan, ...prev.loans],
      ledger: [ledgerEntry, ...prev.ledger],
    }));
  };

  const handleRecordRepayment = (loanId: string, amountUsd: number) => {
    setState((prev) => {
      const targetLoan = prev.loans.find((l) => l.id === loanId);
      if (!targetLoan) return prev;

      const totalDue =
        targetLoan.principalUsd * (1 + targetLoan.interestRatePercent / 100);
      const nextRepaid = targetLoan.amountRepaidUsd + amountUsd;
      const isFullyPaid = nextRepaid >= totalDue - 0.01;

      const updatedLoans: LoanRecord[] = prev.loans.map((l) => {
        if (l.id !== loanId) return l;
        return {
          ...l,
          amountRepaidUsd: Number(nextRepaid.toFixed(2)),
          status: isFullyPaid ? 'Repaid' : l.status,
          syncState: isOfflineMode ? 'Pending Sync' : 'Synced',
        };
      });

      const repaymentEntry: LedgerEntry = {
        id: `tx-rep-${Date.now()}`,
        groupId: targetLoan.groupId,
        memberId: targetLoan.memberId,
        memberName: targetLoan.memberName,
        date: new Date().toISOString().slice(0, 10),
        type: 'Loan Repayment',
        amountUsd,
        note: isFullyPaid
          ? `Final loan settlement (${targetLoan.purpose})`
          : `Loan installment (${targetLoan.purpose})`,
        syncState: isOfflineMode ? 'Pending Sync' : 'Synced',
      };

      return {
        ...prev,
        loans: updatedLoans,
        ledger: [repaymentEntry, ...prev.ledger],
      };
    });
  };

  const handleSyncPending = () => {
    const nowLabel = new Date().toISOString().slice(0, 16).replace('T', ' ');
    setIsOfflineMode(false);
    setState((prev) => ({
      ...prev,
      groups: prev.groups.map((g) => ({ ...g, lastSyncedAt: nowLabel })),
      ledger: prev.ledger.map((e) => ({ ...e, syncState: 'Synced' })),
      loans: prev.loans.map((l) => ({ ...l, syncState: 'Synced' })),
    }));
  };

  const handleResetDemoData = () => {
    try {
      window.localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
    setIsOfflineMode(false);
    setState({
      groups: INITIAL_GROUPS,
      members: INITIAL_MEMBERS,
      loans: INITIAL_LOANS,
      ledger: INITIAL_LEDGER,
      currency: 'USD',
    });
  };

  if (view === 'workspace') {
    return (
      <WorkspaceApp
        key={workspaceInitialTab}
        initialTab={workspaceInitialTab}
        onBackToSite={handleBackToSite}
        groups={state.groups}
        members={state.members}
        loans={state.loans}
        ledger={state.ledger}
        currency={state.currency}
        onChangeCurrency={(currency) => setState((prev) => ({ ...prev, currency }))}
        isOfflineMode={isOfflineMode}
        onToggleOfflineMode={() => setIsOfflineMode((prev) => !prev)}
        onSyncPending={handleSyncPending}
        onAddGroup={handleAddGroup}
        onAddMember={handleAddMember}
        onRecordLedgerEntry={handleRecordLedgerEntry}
        onIssueLoan={handleIssueLoan}
        onRecordRepayment={handleRecordRepayment}
        onResetDemoData={handleResetDemoData}
      />
    );
  }

  return (
    <PublicSite
      onOpenWorkspace={handleOpenWorkspace}
      groups={state.groups}
      loans={state.loans}
      totalSavingsUsd={totalSavingsUsd}
      totalMembersCount={state.members.length}
      currency={state.currency}
    />
  );
}
