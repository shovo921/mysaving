export type Methodology = 'VSLA' | 'ISAL' | 'SILC';

export type CurrencyCode = 'USD' | 'ZiG' | 'ZAR' | 'ZMW';

export type MemberRole = 'Chairperson' | 'Treasurer' | 'Secretary' | 'Box Keeper' | 'Member';

export type LedgerEntryType =
  | 'Savings'
  | 'Social Fund'
  | 'Loan Disbursement'
  | 'Loan Repayment'
  | 'Penalty'
  | 'Expense';

export type LoanStatus = 'Active' | 'Overdue' | 'Repaid';

export type SyncState = 'Synced' | 'Pending Sync';

export interface GroupMember {
  id: string;
  groupId: string;
  name: string;
  role: MemberRole;
  phone: string;
  sharesHeld: number;
  socialFundContributedUsd: number;
  attendanceRate: number; // 0-100
  joinedDate: string;
}

export interface SavingsGroup {
  id: string;
  name: string;
  methodology: Methodology;
  district: string;
  province: string;
  cycleNumber: number;
  cycleStartDate: string;
  cycleEndDate: string;
  sharePriceUsd: number;
  interestRatePercent: number;
  socialFundPerMeetingUsd: number;
  meetingsCompleted: number;
  totalPlannedMeetings: number;
  facilitator: string;
  partnerOrg: string;
  lastSyncedAt: string;
  status: 'Active' | 'Approaching Share-Out' | 'Cycle Closed';
}

export interface LoanRecord {
  id: string;
  groupId: string;
  memberId: string;
  memberName: string;
  purpose: string;
  principalUsd: number;
  interestRatePercent: number;
  amountRepaidUsd: number;
  disbursedDate: string;
  dueDate: string;
  status: LoanStatus;
  syncState: SyncState;
}

export interface LedgerEntry {
  id: string;
  groupId: string;
  memberId?: string;
  memberName: string;
  date: string;
  type: LedgerEntryType;
  amountUsd: number;
  sharesDelta?: number;
  note: string;
  syncState: SyncState;
}

export interface MonthlyMetric {
  month: string;
  savingsUsd: number;
  loansDisbursedUsd: number;
  repaymentsUsd: number;
}
