
export interface UserDetails {
  dateOfBirth: string;
  country: string;
  address: string;
}

export interface KYCData {
    fullName: string;
    dateOfBirth: string;
    country: string;
    address: string;
    idFrontBase64: string;
    idBackBase64: string;
}

export interface CryptoCoin {
  id: string;
  symbol: string;
  name: string;
  image: string;
  current_price: number;
  market_cap: number;
  market_cap_rank: number;
  total_volume: number;
  high_24h: number | null;
  low_24h: number | null;
  price_change_percentage_24h: number | null;
  description?: string;
}

export type SortKey = 'market_cap' | 'current_price' | 'price_change_percentage_24h' | 'market_cap_rank';

export interface Order {
    price: number;
    amount: number;
    total: number;
}

export interface Trade {
    id: string;
    time: string;
    price: number;
    amount: number;
    type: 'buy' | 'sell';
}

export interface TradeHistory {
  id: string;
  pair: string;
  entryPrice: number;
  exitPrice: number;
  startTime: string; // ISO string
  endTime: string; // ISO string
  direction: 'Buy' | 'Sell';
  amount: number;
  profit: number; // Can be positive or negative
}


// --- SHARED USER & TRANSACTION TYPES ---

export type KYCStatus = 'unverified' | 'pending' | 'verified' | 'rejected';

export interface Notification {
  id: string;
  title: string;
  message: string;
  date: string; // ISO string
  read: boolean;
  type: 'security' | 'transaction' | 'system';
}

export interface Transaction {
  id:string;
  type: 'Deposit' | 'Withdrawal' | 'Trade' | 'Admin Adjustment' | 'Signup Bonus';
  asset: string;
  amount: number; // For trades, this is the PROFIT/LOSS.
  status: 'Completed' | 'Pending' | 'Failed' | 'Open';
  date: string; // This will be the start time for trades
  network?: 'TRC20' | 'ERC20' | 'BTC';
  transactionProof?: string;
  address?: string;
  
  // Trade specific
  pair?: string;
  direction?: 'Buy' | 'Sell';
  stake?: number;
  commission?: number;
  profit?: number; // Redundant with amount, but explicit.
  entryPrice?: number;
  exitPrice?: number;
  endTime?: string; // For trades
  settlementDuration?: number;
  profitPercentage?: number;
  commissionPercentage?: number;
  userEmail?: string; // For admin view
  userName?: string; // For admin view
  userId?: string; // for admin actions
}

export interface UserPortfolio {
  balance: number;
  pendingBalance: number;
  pl: number;
  plPercentage: number;
  referralRewards: number;
  totalDeposits: number;
}

export interface SecondContractTrade {
  id: string;
  pair: string;
  type: "buy" | "sell";
  duration: number;
  profitRate: number;
  commissionRate: number;
  amount: number; // stake
  status: "active" | "won" | "lost";
  entryPrice: number;
  closePrice?: number;
  closesAt: string;
  userId: string;
  created_date: string;
}

export interface LoginRecord {
    date: string; // ISO string
    ipAddress: string;
    device: string;
}

export interface ReferralInfo {
  uid: string;
  name: string;
  status: 'registered' | 'deposited';
  reward: number;
  date: string; // ISO string
}

export interface User {
  name: string;
  email: string;
  uid: string;
  photoURL?: string;
  password?: string; // This is for mock auth only, DO NOT DO THIS IN PRODUCTION
  fundPassword?: string;
  twoFactorEnabled?: boolean;
  twoFactorSecret?: string;
  portfolio: UserPortfolio;
  transactions: Transaction[];
  notifications: Notification[];
  kycStatus: KYCStatus;
  fullName?: string;
  dateOfBirth?: string;
  country?: string;
  address?: string;
  isAdmin?: boolean;
  vipLevel: number;
  activeSecondContracts: SecondContractTrade[];
  secondContractHistory: SecondContractTrade[];
  loginHistory: LoginRecord[];
  referralCode: string;
  referredUsers: ReferralInfo[];
}

// --- ADMIN PANEL TYPES ---

export interface KycRequest {
    user: User;
    kycImages: {
        idFront: string;
        idBack: string;
    };
}

export interface PendingDeposit {
    userEmail: string;
    userName: string;
    userId: string;
    transaction: Transaction;
}

export interface PendingWithdrawal {
    userEmail: string;
    userName: string;
    userId: string;
    transaction: Transaction;
}

// --- SECOND CONTRACT TYPES ---
export interface SecondContractResultDetails {
    pair: string;
    direction: 'Buy' | 'Sell';
    stake: number;
    commission: number;
    profit: number; // PNL
    payout: number; // Amount to return to user (stake + profit for win, 0 for loss)
    entryPrice: number;
    exitPrice: number;
    startTime: string; // ISO
    settlementDuration: number; // seconds
    profitPercentage: number;
    commissionPercentage: number;
}

export interface HomepageActionItem {
    id: string;
    label: string;
    icon: string;
    path: string;
    state?: any;
    enabled: boolean;
    order: number;
}

export interface VipTier {
    level: number;
    depositThreshold: number;
    tradeLimit: number | 'unlimited';
}

export interface SystemSettings {
    depositAddressTrc20: string;
    depositAddressErc20: string;
    depositAddressBtc: string;
    homepageActionItems?: HomepageActionItem[];
    vipTiers?: VipTier[];
}
