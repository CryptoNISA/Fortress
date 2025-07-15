
import * as React from 'react';
import type { User, KycRequest, PendingDeposit, Notification, PendingWithdrawal, SecondContractTrade, UserDetails, KYCData, SystemSettings, ReferralInfo, Transaction } from '../types.ts';
import { apiLogin, apiSignup, apiGetUserByToken, apiDeposit, apiSubmitKyc, apiWithdraw, apiGetAllUsers, apiGetPendingKyc, apiUpdateKycStatus, apiGetPendingDeposits, apiUpdateDepositStatus, apiMarkAllNotificationsAsRead, apiMarkNotificationAsRead, apiGetPendingWithdrawals, apiUpdateWithdrawalStatus, apiUpdateUserBalance, apiAddManualTransaction, apiGetAllTrades, apiPlaceSecondContractTrade, apiCompleteSecondContractTrade, apiVerifyAdminPassword, apiAdminCreateUser, apiGetAllActiveContracts, apiAdminResolveContract, apiGetSystemSettings, apiUpdateSystemSettings, apiChangePassword, apiSetFundPassword, apiToggle2FA, apiGetAllOrders } from '../server/api.ts';

const AUTH_TOKEN_KEY = 'fortressInvestmentAuthToken';

interface DepositDetails {
    amount: number;
    network: 'TRC20' | 'ERC20' | 'BTC';
    asset: string;
    transactionProof: string; // base64
}

interface WithdrawDetails {
    amount: number;
    address: string;
    asset: string;
}

interface ManualTransactionDetails {
    userEmail: string;
    type: 'Deposit' | 'Withdrawal';
    asset: string;
    amount: number;
}

interface ContractOption {
    duration: number;
    profitRate: number;
    commissionRate: number;
}
interface PlaceSecondContractTradeDetails {
    amount: number;
    type: 'buy' | 'sell';
    option: ContractOption;
    entryPrice: number;
}

interface CompleteTradeDetails {
    pair: string;
    direction: 'Buy' | 'Sell';
    stake: number;
    commission: number;
    profit: number; // pnl
    entryPrice: number;
    exitPrice: number;
    startTime: string;
    settlementDuration: number;
    profitPercentage: number;
    commissionPercentage: number;
}

interface CreateUserDetails {
    name: string;
    email: string;
    password?: string;
}

interface AuthContextType {
  user: User | null;
  isLoggedIn: boolean;
  isInitialized: boolean;
  isLoading: boolean;
  isAdmin: boolean;
  systemSettings: SystemSettings | null;
  login: (email: string, password: string) => Promise<void>;
  signup: (name: string, email: string, password: string, details: UserDetails, referralCode?: string) => Promise<void>;
  logout: () => void;
  deposit: (details: DepositDetails) => Promise<void>;
  updateUserPhoto: (photoFile: File) => Promise<void>;
  submitKyc: (kycData: KYCData) => Promise<void>;
  withdraw: (password: string, details: WithdrawDetails) => Promise<void>;
  placeSecondContractTrade: (details: PlaceSecondContractTradeDetails) => Promise<void>;
  completeSecondContractTrade: (tradeId: string, currentPrice: number) => Promise<void>;
  completeTrade: (details: CompleteTradeDetails) => void;
  markAllNotificationsAsRead: () => Promise<void>;
  markNotificationAsRead: (notificationId: string) => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  changePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  setFundPassword: (loginPassword: string, fundPassword: string) => Promise<void>;
  toggle2FA: (loginPassword: string, code: string) => Promise<void>;
  // Admin functions
  verifyAdminPassword: (password: string) => Promise<boolean>;
  adminCreateUser: (details: CreateUserDetails) => Promise<void>;
  fetchAllUsers: () => Promise<User[]>;
  fetchPendingKyc: () => Promise<KycRequest[]>;
  updateKycStatus: (password: string, targetUserId: string, status: 'verified' | 'rejected') => Promise<void>;
  fetchPendingDeposits: () => Promise<PendingDeposit[]>;
  updateDepositStatus: (password: string, targetUserId: string, transactionId: string, status: 'Completed' | 'Failed') => Promise<void>;
  fetchPendingWithdrawals: () => Promise<PendingWithdrawal[]>;
  updateWithdrawalStatus: (password: string, targetUserId: string, transactionId: string, status: 'Completed' | 'Failed') => Promise<void>;
  updateUserBalance: (password: string, targetUserId: string, newBalance: number) => Promise<void>;
  addManualTransaction: (password: string, details: ManualTransactionDetails) => Promise<void>;
  fetchAllTrades: () => Promise<Transaction[]>;
  fetchAllOrders: () => Promise<Transaction[]>;
  fetchAllActiveContracts: () => Promise<SecondContractTrade[]>;
  adminResolveContract: (password: string, tradeId: string, resolution: 'win' | 'loss') => Promise<void>;
  updateSystemSettings: (password: string, newSettings: SystemSettings) => Promise<void>;
}

const AuthContext = React.createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = React.useState<User | null>(null);
  const [token, setToken] = React.useState<string | null>(null);
  const [isInitialized, setIsInitialized] = React.useState<boolean>(false);
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isAdmin, setIsAdmin] = React.useState<boolean>(false);
  const [systemSettings, setSystemSettings] = React.useState<SystemSettings | null>(null);

  const rehydrateSession = React.useCallback(async () => {
    try {
      const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
      if (storedToken) {
        const fetchedUser = await apiGetUserByToken(storedToken);
        const storedPhoto = localStorage.getItem(`fortressInvestmentPhoto-${fetchedUser.uid}`);
        if (storedPhoto) {
            fetchedUser.photoURL = storedPhoto;
        }
        setUser(fetchedUser);
        setToken(storedToken);
        setIsAdmin(fetchedUser.isAdmin || false);
      }
      const settings = await apiGetSystemSettings();
      setSystemSettings(settings);
    } catch (error) {
      console.error("Session rehydration failed:", error);
      localStorage.removeItem(AUTH_TOKEN_KEY);
    } finally {
      setIsInitialized(true);
    }
  }, []);

  React.useEffect(() => {
    rehydrateSession();
  }, [rehydrateSession]);
  
  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const { user: loggedInUser, token: new_token } = await apiLogin(email, password, { userAgent: navigator.userAgent });
      const storedPhoto = localStorage.getItem(`fortressInvestmentPhoto-${loggedInUser.uid}`);
      if (storedPhoto) {
          loggedInUser.photoURL = storedPhoto;
      }
      setUser(loggedInUser);
      setToken(new_token);
      setIsAdmin(loggedInUser.isAdmin || false);
      localStorage.setItem(AUTH_TOKEN_KEY, new_token);
    } catch (error) {
       console.error("Login failed:", error);
       throw error; // re-throw to be caught in the component
    } finally {
      setIsLoading(false);
    }
  };
  
  const signup = async (name: string, email: string, password: string, details: UserDetails, referralCode?: string) => {
    setIsLoading(true);
    try {
        const { user: signedUpUser, token: new_token } = await apiSignup(name, email, password, details, referralCode);
        setUser(signedUpUser);
        setToken(new_token);
        setIsAdmin(signedUpUser.isAdmin || false);
        localStorage.setItem(AUTH_TOKEN_KEY, new_token);
    } catch(error) {
        console.error("Signup failed:", error);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const logout = () => {
    if (user) {
        localStorage.removeItem(`fortressInvestmentPhoto-${user.uid}`);
    }
    setUser(null);
    setToken(null);
    setIsAdmin(false);
    localStorage.removeItem(AUTH_TOKEN_KEY);
  };
  
  const deposit = async (details: DepositDetails) => {
      if(!token) throw new Error("Not authenticated");
      setIsLoading(true);
      try {
          const updatedUser = await apiDeposit(token, details);
          setUser(prevUser => prevUser ? {...prevUser, ...updatedUser} : updatedUser);
      } catch (error) {
          console.error("Deposit failed:", error);
          throw error;
      } finally {
          setIsLoading(false);
      }
  };

  const submitKyc = async (kycData: KYCData) => {
      if(!token) throw new Error("Not authenticated");
      setIsLoading(true);
      try {
        const updatedUser = await apiSubmitKyc(token, kycData);
        setUser(prevUser => prevUser ? {...prevUser, ...updatedUser} : updatedUser);
      } catch (error) {
        console.error("KYC Submission failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
  };
  
  const withdraw = async (password: string, details: WithdrawDetails) => {
      if(!token) throw new Error("Not authenticated");
      setIsLoading(true);
      try {
        const updatedUser = await apiWithdraw(token, password, details);
        setUser(prevUser => prevUser ? {...prevUser, ...updatedUser} : updatedUser);
      } catch (error) {
        console.error("Withdrawal failed:", error);
        throw error;
      } finally {
        setIsLoading(false);
      }
  };

  const placeSecondContractTrade = async (details: PlaceSecondContractTradeDetails) => {
    if(!token) throw new Error("Not authenticated");
    setIsLoading(true);
    try {
      const updatedUser = await apiPlaceSecondContractTrade(token, details);
      setUser(prevUser => prevUser ? {...prevUser, ...updatedUser} : updatedUser);
    } catch(error) {
      console.error("Failed to place second contract trade:", error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  };

  const completeSecondContractTrade = async (tradeId: string, currentPrice: number) => {
      if(!token) throw new Error("Not authenticated");
      try {
          const updatedUser = await apiCompleteSecondContractTrade(token, tradeId, currentPrice);
          setUser(prevUser => prevUser ? { ...prevUser, ...updatedUser } : updatedUser);
      } catch (error) {
          console.error("Second Contract completion failed:", error);
          throw error;
      }
  };

  const completeTrade = (details: CompleteTradeDetails) => {
    setUser(prevUser => {
        if (!prevUser) return null;
        
        const vipTiers = systemSettings?.vipTiers;
        if (!vipTiers) return prevUser;

        const payout = details.stake + details.profit;
        const newBalance = prevUser.portfolio.balance + payout;

        const newTransaction: Transaction = {
            id: `tx-trade-${Date.now()}`,
            type: 'Trade',
            status: 'Completed',
            asset: details.pair.split('-')[1],
            amount: details.profit,
            date: details.startTime,
            endTime: new Date().toISOString(),
            pair: details.pair,
            direction: details.direction,
            stake: details.stake,
            commission: details.commission,
            profit: details.profit,
            entryPrice: details.entryPrice,
            exitPrice: details.exitPrice,
            settlementDuration: details.settlementDuration,
            profitPercentage: details.profitPercentage,
            commissionPercentage: details.commissionPercentage,
        };
        
        const updatedUser: User = {
            ...prevUser,
            portfolio: {
                ...prevUser.portfolio,
                balance: newBalance,
            },
            transactions: [newTransaction, ...prevUser.transactions],
        };
        
        if (updatedUser.portfolio.balance < 120) {
            updatedUser.vipLevel = 0;
        } else {
            const sortedTiers = [...vipTiers]
              .filter(tier => tier.level > 0)
              .sort((a, b) => b.depositThreshold - a.depositThreshold);
        
            let assignedLevel = 1;
            for (const tier of sortedTiers) {
                if (updatedUser.portfolio.totalDeposits >= tier.depositThreshold) {
                    assignedLevel = tier.level;
                    break;
                }
            }
            updatedUser.vipLevel = assignedLevel;
        }
        
        return updatedUser;
    });
  };

  const updateUserPhoto = (photoFile: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (!user) {
        return reject(new Error("User not authenticated"));
      }
      setIsLoading(true);
      const reader = new FileReader();
      reader.readAsDataURL(photoFile);
      reader.onload = () => {
        const dataUrl = reader.result as string;
        localStorage.setItem(`fortressInvestmentPhoto-${user.uid}`, dataUrl);
        setUser(prevUser => (prevUser ? { ...prevUser, photoURL: dataUrl } : null));
        setIsLoading(false);
        resolve();
      };
      reader.onerror = error => {
        setIsLoading(false);
        reject(error);
      };
    });
  };

  const markAllNotificationsAsRead = async () => {
      if(!token) throw new Error("Not authenticated");
      setIsLoading(true);
      try {
          const updatedUser = await apiMarkAllNotificationsAsRead(token);
          setUser(prevUser => prevUser ? {...prevUser, ...updatedUser} : updatedUser);
      } catch (error) {
          console.error("Failed to mark all notifications as read:", error);
          throw error;
      } finally {
          setIsLoading(false);
      }
  };

  const markNotificationAsRead = async (notificationId: string) => {
    if(!token) throw new Error("Not authenticated");
    try {
        const updatedUser = await apiMarkNotificationAsRead(token, notificationId);
        setUser(prevUser => prevUser ? {...prevUser, ...updatedUser} : updatedUser);
    } catch (error) {
        console.error(`Failed to mark notification ${notificationId} as read:`, error);
        throw error;
    }
  };

  const changePassword = async (currentPassword: string, newPassword: string) => {
    if (!token) throw new Error("Not authenticated");
    setIsLoading(true);
    try {
        const updatedUser = await apiChangePassword(token, currentPassword, newPassword);
        setUser(prevUser => prevUser ? { ...prevUser, ...updatedUser } : updatedUser);
    } catch (error) {
        console.error("Failed to change password:", error);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const setFundPassword = async (loginPassword: string, fundPassword: string) => {
    if (!token) throw new Error("Not authenticated");
    setIsLoading(true);
    try {
        const updatedUser = await apiSetFundPassword(token, loginPassword, fundPassword);
        setUser(prevUser => prevUser ? { ...prevUser, ...updatedUser } : updatedUser);
    } catch (error) {
        console.error("Failed to set fund password:", error);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };

  const toggle2FA = async (loginPassword: string, code: string) => {
    if (!token) throw new Error("Not authenticated");
    setIsLoading(true);
    try {
        const updatedUser = await apiToggle2FA(token, loginPassword, code);
        setUser(prevUser => prevUser ? { ...prevUser, ...updatedUser } : updatedUser);
    } catch (error) {
        console.error("Failed to toggle 2FA:", error);
        throw error;
    } finally {
        setIsLoading(false);
    }
  };


  // --- Admin Functions ---
  const verifyAdminPassword = async (password: string): Promise<boolean> => {
    if (!token) throw new Error("Not authenticated");
    return apiVerifyAdminPassword(token, password);
  }

  const adminCreateUser = async (details: CreateUserDetails): Promise<void> => {
      if (!token) throw new Error("Not authenticated");
      await apiAdminCreateUser(token, details);
  }

  const fetchAllUsers = async (): Promise<User[]> => {
    if (!token) throw new Error("Not authenticated");
    return apiGetAllUsers(token);
  };

  const fetchPendingKyc = async (): Promise<KycRequest[]> => {
    if (!token) throw new Error("Not authenticated");
    return apiGetPendingKyc(token);
  };

  const updateKycStatus = async (password: string, targetUserId: string, status: 'verified' | 'rejected'): Promise<void> => {
    if(!token) throw new Error("Not authenticated");
    await apiUpdateKycStatus(token, password, targetUserId, status);
  };

  const fetchPendingDeposits = async (): Promise<PendingDeposit[]> => {
    if (!token) throw new Error("Not authenticated");
    return apiGetPendingDeposits(token);
  };
  
  const updateDepositStatus = async (password: string, targetUserId: string, transactionId: string, status: 'Completed' | 'Failed'): Promise<void> => {
      if(!token) throw new Error("Not authenticated");
      await apiUpdateDepositStatus(token, password, targetUserId, transactionId, status);
  };

  const fetchPendingWithdrawals = async (): Promise<PendingWithdrawal[]> => {
    if (!token) throw new Error("Not authenticated");
    return apiGetPendingWithdrawals(token);
  }

  const updateWithdrawalStatus = async (password: string, targetUserId: string, transactionId: string, status: 'Completed' | 'Failed'): Promise<void> => {
    if (!token) throw new Error("Not authenticated");
    await apiUpdateWithdrawalStatus(token, password, targetUserId, transactionId, status);
  }

  const updateUserBalance = async (password: string, targetUserId: string, newBalance: number): Promise<void> => {
    if (!token) throw new Error("Not authenticated");
    await apiUpdateUserBalance(token, password, targetUserId, newBalance);
  }
  
  const addManualTransaction = async (password: string, details: ManualTransactionDetails): Promise<void> => {
      if(!token) throw new Error("Not authenticated");
      await apiAddManualTransaction(token, password, details);
  }

  const fetchAllTrades = async (): Promise<Transaction[]> => {
      if(!token) throw new Error("Not authenticated");
      return apiGetAllTrades(token);
  }

  const fetchAllOrders = async (): Promise<Transaction[]> => {
      if(!token) throw new Error("Not authenticated");
      return apiGetAllOrders(token);
  }

  const fetchAllActiveContracts = async (): Promise<SecondContractTrade[]> => {
    if(!token) throw new Error("Not authenticated");
    return apiGetAllActiveContracts(token);
  }

  const adminResolveContract = async (password: string, tradeId: string, resolution: 'win' | 'loss'): Promise<void> => {
    if(!token) throw new Error("Not authenticated");
    return apiAdminResolveContract(token, password, tradeId, resolution);
  }
  
  const updateSystemSettings = async (password: string, newSettings: SystemSettings): Promise<void> => {
    if(!token) throw new Error("Not authenticated");
    await apiUpdateSystemSettings(token, password, newSettings);
    const settings = await apiGetSystemSettings();
    setSystemSettings(settings);
  };


  const value: AuthContextType = {
    user,
    isLoggedIn: !!user,
    isInitialized,
    isLoading,
    isAdmin,
    systemSettings,
    login,
    signup,
    logout,
    deposit,
    updateUserPhoto,
    submitKyc,
    withdraw,
    placeSecondContractTrade,
    completeSecondContractTrade,
    completeTrade,
    markAllNotificationsAsRead,
    markNotificationAsRead,
    setUser,
    changePassword,
    setFundPassword,
    toggle2FA,
    // Admin
    verifyAdminPassword,
    adminCreateUser,
    fetchAllUsers,
    fetchPendingKyc,
    updateKycStatus,
    fetchPendingDeposits,
    updateDepositStatus,
    fetchPendingWithdrawals,
    updateWithdrawalStatus,
    updateUserBalance,
    addManualTransaction,
    fetchAllTrades,
    fetchAllOrders,
    fetchAllActiveContracts,
    adminResolveContract,
    updateSystemSettings,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = React.useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within a AuthProvider');
  }
  return context;
};
