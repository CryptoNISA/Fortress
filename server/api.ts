
import type { User, Transaction, KYCStatus, KycRequest, PendingDeposit, Notification, PendingWithdrawal, SecondContractTrade, UserDetails, KYCData, LoginRecord, SystemSettings, ReferralInfo, VipTier } from '../types.ts';

// --- DATABASE PERSISTENCE ---
const DB_KEY = 'fortressInvestmentDB';

interface MockDB {
  users: Record<string, User>;
  kycImages: Record<string, {idFront: string, idBack: string}>;
  systemSettings: SystemSettings;
}

const initialDb: MockDB = {
  users: {
    'admin@fortress.com': {
      name: 'Admin',
      email: 'admin@fortress.com',
      uid: 'UID-ADMIN',
      password: 'admin',
      fundPassword: 'fundpassword123',
      twoFactorEnabled: false,
      twoFactorSecret: 'JBSWY3DPEHPK3PXP', // Example secret, generate per user in real app
      isAdmin: true,
      kycStatus: 'verified',
      vipLevel: 5,
      portfolio: { balance: 0, pendingBalance: 0, pl: 0, plPercentage: 0, referralRewards: 0, totalDeposits: 0 },
      transactions: [],
      notifications: [],
      activeSecondContracts: [],
      secondContractHistory: [],
      loginHistory: [],
      referralCode: 'ADMINREF',
      referredUsers: [],
    }
  },
  kycImages: {},
  systemSettings: {
    depositAddressTrc20: 'TABCDefg1234567890HIJKLMNopqrstuvwXYZ',
    depositAddressErc20: '0x1234567890abcdef1234567890abcdef12345678',
    depositAddressBtc: 'bc1qza9876543210fedcba9876543210fedcba123',
    homepageActionItems: [
      { id: 'recharge', order: 1, enabled: true, label: 'Recharge', icon: 'https://cdn-icons-png.flaticon.com/512/1019/1019709.png', path: '/profile', state: { view: 'deposit' } },
      { id: 'withdraw', order: 2, enabled: true, label: 'Withdraw', icon: 'https://cdn-icons-png.flaticon.com/512/2953/2953358.png', path: '/profile', state: { view: 'withdraw' } },
      { id: 'balance', order: 3, enabled: true, label: 'Balance', icon: 'https://cdn-icons-png.flaticon.com/512/1570/1570911.png', path: '/profile', state: {} },
      { id: 'support', order: 4, enabled: true, label: 'Support', icon: 'https://cdn-icons-png.flaticon.com/512/259/259582.png', path: 'https://t.me/FortressInvestmentSupport', state: {} },
    ],
    vipTiers: [
        { level: 0, depositThreshold: -1, tradeLimit: 0 },
        { level: 1, depositThreshold: 0, tradeLimit: 1 },
        { level: 2, depositThreshold: 500, tradeLimit: 2 },
        { level: 3, depositThreshold: 2000, tradeLimit: 3 },
        { level: 4, depositThreshold: 5000, tradeLimit: 4 },
        { level: 5, depositThreshold: 10000, tradeLimit: 'unlimited' },
    ],
  },
};

// --- USER DATA NORMALIZATION & HELPERS ---

const generateReferralCode = (uid: string) => `REF${uid.replace('UID-','').slice(0,6).toUpperCase()}`;

const updateUserVipLevel = (user: User, vipTiers: VipTier[]) => {
    // First, calculate total deposits
    const totalDeposits = user.transactions
        .filter(tx => tx.type === 'Deposit' && tx.status === 'Completed')
        .reduce((sum, tx) => sum + tx.amount, 0);
    user.portfolio.totalDeposits = totalDeposits;

    // Check balance condition for VIP0
    if (user.portfolio.balance < 120) {
        user.vipLevel = 0;
        return;
    }

    // If balance is sufficient, use deposit-based logic for VIP 1 and above
    const sortedTiers = [...(vipTiers || [])]
      .filter(tier => tier.level > 0) // Exclude VIP0 from this logic
      .sort((a, b) => b.depositThreshold - a.depositThreshold);

    let assignedLevel = 1; // Default to VIP 1 if balance is >= 120
    for (const tier of sortedTiers) {
        if (totalDeposits >= tier.depositThreshold) {
            assignedLevel = tier.level;
            break;
        }
    }
    user.vipLevel = assignedLevel;
};


// This function ensures any partial user object (from storage or creation) is a complete, valid User object.
const ensureCompleteUser = (user: Partial<User>, vipTiers: VipTier[]): User => {
    if (!user.uid) throw new Error("User object must have a UID.");
    if (!user.email) throw new Error("User object must have an email.");
    if (!user.name) throw new Error("User object must have a name.");
    
    const completeUser: User = {
        name: user.name,
        email: user.email.toLowerCase(),
        uid: user.uid,
        photoURL: user.photoURL,
        password: user.password || 'password123',
        fundPassword: user.fundPassword || '',
        twoFactorEnabled: user.twoFactorEnabled || false,
        twoFactorSecret: user.twoFactorSecret || 'JBSWY3DPEHPK3PXP',
        portfolio: {
            balance: user.portfolio?.balance || 0,
            pendingBalance: user.portfolio?.pendingBalance || 0,
            pl: user.portfolio?.pl || 0,
            plPercentage: user.portfolio?.plPercentage || 0,
            referralRewards: user.portfolio?.referralRewards || 0,
            totalDeposits: user.portfolio?.totalDeposits || 0,
        },
        transactions: user.transactions || [],
        notifications: user.notifications || [],
        kycStatus: user.kycStatus || 'unverified',
        fullName: user.fullName || user.name,
        dateOfBirth: user.dateOfBirth || '',
        country: user.country || '',
        address: user.address || '',
        isAdmin: user.isAdmin || false,
        vipLevel: user.vipLevel || 1,
        activeSecondContracts: user.activeSecondContracts || [],
        secondContractHistory: user.secondContractHistory || [],
        loginHistory: user.loginHistory || [],
        referralCode: user.referralCode || generateReferralCode(user.uid),
        referredUsers: user.referredUsers || [],
    };
    
    updateUserVipLevel(completeUser, vipTiers);

    return completeUser;
};

const loadDB = (): MockDB => {
    const loadedDb: MockDB = JSON.parse(JSON.stringify(initialDb));
    try {
        const rawDb = localStorage.getItem(DB_KEY);
        if (rawDb && rawDb !== 'undefined') {
            const storedDb: MockDB = JSON.parse(rawDb);
            const finalUsers: Record<string, User> = {};
            
            // First, establish the correct system settings and VIP tiers
            if (storedDb.systemSettings) {
                loadedDb.systemSettings = { ...loadedDb.systemSettings, ...storedDb.systemSettings };
                 if (!loadedDb.systemSettings.vipTiers) {
                    loadedDb.systemSettings.vipTiers = initialDb.systemSettings.vipTiers;
                }
            }
            const currentVipTiers = loadedDb.systemSettings.vipTiers || [];

            // Normalize all stored users
            if (storedDb && storedDb.users) {
                Object.values(storedDb.users).forEach(userFromFile => {
                    if (userFromFile && userFromFile.email) {
                        const normalizedUser = ensureCompleteUser(userFromFile, currentVipTiers);
                        finalUsers[normalizedUser.email] = normalizedUser;
                    }
                });
            }

            // Ensure admin user is always present and correctly configured.
            // If admin is not in the stored DB, add the default admin.
            if (!finalUsers['admin@fortress.com']) {
                const pristineAdmin = ensureCompleteUser(initialDb.users['admin@fortress.com'], currentVipTiers);
                finalUsers[pristineAdmin.email] = pristineAdmin;
            } else {
                // If admin exists, ensure their isAdmin flag is true.
                // The password and other data from storage are preserved.
                finalUsers['admin@fortress.com'].isAdmin = true;
            }
            
            loadedDb.users = finalUsers;
            
            if (storedDb.kycImages) {
                Object.assign(loadedDb.kycImages, storedDb.kycImages);
            }
        } else {
             // If no stored DB, initialize with normalized admin user
            const currentVipTiers = loadedDb.systemSettings.vipTiers || [];
            loadedDb.users = {
                'admin@fortress.com': ensureCompleteUser(initialDb.users['admin@fortress.com'], currentVipTiers)
            };
        }
    } catch (e) {
        console.error("Failed to load or merge mock DB. Using initial state.", e);
        return JSON.parse(JSON.stringify(initialDb));
    }
    
    // --- Special update for UID-10001 ---
    const userToUpdate = Object.values(loadedDb.users).find(u => u.uid === 'UID-10001');
    if (userToUpdate) {
        const randomAmount = Math.floor(Math.random() * 901) + 100; // Random amount between 100 and 1000
        userToUpdate.portfolio.balance += randomAmount;

        const newTransaction: Transaction = {
            id: `tx-rand-adj-${Date.now()}`,
            type: 'Admin Adjustment',
            asset: 'USDT',
            amount: randomAmount,
            status: 'Completed',
            date: new Date().toISOString()
        };
        
        if (!userToUpdate.transactions) {
            userToUpdate.transactions = [];
        }
        userToUpdate.transactions.unshift(newTransaction);

        const newNotification: Notification = {
            id: `notif-rand-adj-${Date.now()}`,
            type: 'system',
            title: 'Account Credited',
            message: `A random bonus of $${randomAmount.toFixed(2)} has been added to your account.`,
            date: new Date().toISOString(),
            read: false,
        };
        
        if (!userToUpdate.notifications) {
            userToUpdate.notifications = [];
        }
        userToUpdate.notifications.unshift(newNotification);
    }
    // --- End special update ---

    return loadedDb;
};

const saveDB = () => {
  try {
    localStorage.setItem(DB_KEY, JSON.stringify(db));
  } catch (e) {
    console.error("Failed to save mock DB to localStorage", e);
  }
};

let db: MockDB = loadDB();

const apiCall = <T>(data: T, delay = 500): Promise<T> =>
  new Promise((resolve, reject) =>
    setTimeout(() => {
      try {
        if (data === undefined) {
          resolve(data);
          return;
        }
        resolve(JSON.parse(JSON.stringify(data)));
      } catch (error) {
        reject(error);
      }
    }, delay)
  );

const apiError = (message: string, delay = 500): Promise<any> =>
  new Promise((_, reject) => setTimeout(() => reject(new Error(message)), delay));

const findUserByUid = (uid: string) => Object.values(db.users).find(u => u.uid === uid);

const findUserByEmail = (email: string): User | undefined => {
  if (!email) {
    return undefined;
  }
  const lowerCaseEmail = email.toLowerCase();
  // Find the key in a case-insensitive way to make lookup more robust.
  const userKey = Object.keys(db.users).find(key => key.toLowerCase() === lowerCaseEmail);
  return userKey ? db.users[userKey] : undefined;
};

const checkAdmin = (token: string): User => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user || !user.isAdmin) {
        throw new Error("Unauthorized: Admin access required.");
    }
    return user;
}

interface DepositDetails {
    amount: number;
    network: 'TRC20' | 'ERC20' | 'BTC';
    asset: string;
    transactionProof: string;
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

interface CreateUserDetails {
    name: string;
    email: string;
    password?: string;
}

export const apiSignup = (name: string, email: string, password: string, details: UserDetails, referralCode?: string): Promise<{user: User, token: string}> => {
  const lowerEmail = email.toLowerCase();
  if (findUserByEmail(email)) {
    return apiError("An account with this email already exists.");
  }
  
  const formattedName = name.trim().split(/\s+/).map(p => p.charAt(0).toUpperCase() + p.slice(1)).join(' ');
  
  let maxId = 10000;
  Object.values(db.users).forEach(user => {
      const numericPart = user.uid.startsWith('UID-') ? user.uid.substring(4) : user.uid;
      const numericId = parseInt(numericPart, 10);
      if (!isNaN(numericId) && numericId > maxId) {
          maxId = numericId;
      }
  });
  const uid = `UID-${maxId + 1}`;

  const partialNewUser: Partial<User> = { 
      name: formattedName, 
      email: lowerEmail, 
      uid, 
      password,
      fullName: formattedName, 
      dateOfBirth: details.dateOfBirth,
      country: details.country, 
      address: details.address,
      portfolio: { balance: 0, pendingBalance: 0, pl: 0, plPercentage: 0, referralRewards: 0, totalDeposits: 0 },
      transactions: [],
  };
  
  const newUser = ensureCompleteUser(partialNewUser, db.systemSettings.vipTiers || []);
  db.users[lowerEmail] = newUser;

  if (referralCode) {
    const referrer = Object.values(db.users).find(u => u.referralCode === referralCode.trim().toUpperCase());
    if (referrer) {
      if (!referrer.referredUsers) referrer.referredUsers = [];
      referrer.referredUsers.unshift({
        uid: newUser.uid,
        name: newUser.name,
        status: 'registered',
        reward: 0,
        date: new Date().toISOString(),
      });
    }
  }

  saveDB();
  
  const { password: _, ...userToReturn } = newUser;
  return apiCall({ user: userToReturn, token: `TOKEN_${uid}`});
};

export const apiLogin = (email: string, password: string, loginInfo: { userAgent: string }): Promise<{user: User, token: string}> => {
  const user = findUserByEmail(email);
  if (user && user.password === password) {
    user.loginHistory.unshift({
        date: new Date().toISOString(),
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        device: loginInfo.userAgent,
    });
    saveDB();
    const { password: _, ...userToReturn } = user;
    return apiCall({ user: userToReturn, token: `TOKEN_${user.uid}`});
  }
  return apiError("Invalid credentials.");
};

export const apiGetUserByToken = (token: string): Promise<User> => {
  const uid = token.replace('TOKEN_', '');
  const user = findUserByUid(uid);
  if (user) {
    const { password: _, ...userToReturn } = user;
    return apiCall(userToReturn);
  }
  return apiError("Invalid token.");
};

export const apiDeposit = (token: string, details: DepositDetails): Promise<User> => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user) return apiError("User not found.");
    
    const newTransaction: Transaction = {
        id: `tx-${Date.now()}`, type: 'Deposit', status: 'Pending',
        ...details, date: new Date().toISOString()
    };
    user.transactions.unshift(newTransaction);
    
    const admin = db.users['admin@fortress.com'];
    if (admin) {
        admin.notifications.unshift({
            id: `notif-${Date.now()}`, type: 'system', title: 'New Deposit Request',
            message: `${user.name} has submitted a new deposit of ${details.amount} ${details.asset}.`,
            date: new Date().toISOString(), read: false,
        });
    }
    saveDB();
    const { password: _, ...userToReturn } = user;
    return apiCall(userToReturn);
};

export const apiSubmitKyc = (token: string, kycData: KYCData): Promise<User> => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user) return apiError("User not found.");

    user.fullName = kycData.fullName;
    user.dateOfBirth = kycData.dateOfBirth;
    user.country = kycData.country;
    user.address = kycData.address;
    user.kycStatus = 'pending';
    db.kycImages[uid] = { idFront: kycData.idFrontBase64, idBack: kycData.idBackBase64 };

    const admin = db.users['admin@fortress.com'];
    if (admin) {
        admin.notifications.unshift({
            id: `notif-${Date.now()}`, type: 'system', title: 'New KYC Submission',
            message: `${user.name} has submitted documents for KYC verification.`,
            date: new Date().toISOString(), read: false,
        });
    }
    saveDB();
    const { password: _, ...userToReturn } = user;
    return apiCall(userToReturn);
};

export const apiWithdraw = (token: string, passwordAttempt: string, details: WithdrawDetails): Promise<User> => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user) return apiError("User not found.");
    if (user.password !== passwordAttempt) return apiError("Incorrect password.");
    if (user.kycStatus !== 'verified') return apiError("KYC verification is required for withdrawals.");
    if (user.portfolio.balance < details.amount) return apiError("Insufficient balance.");

    const newTransaction: Transaction = {
        id: `tx-wd-${Date.now()}`, type: 'Withdrawal', status: 'Pending',
        amount: details.amount, address: details.address, asset: details.asset,
        date: new Date().toISOString(),
    };
    user.transactions.unshift(newTransaction);
    
    const admin = db.users['admin@fortress.com'];
    if (admin) {
        admin.notifications.unshift({
            id: `notif-${Date.now()}`, type: 'system', title: 'New Withdrawal Request',
            message: `${user.name} has requested a withdrawal of ${details.amount} ${details.asset}.`,
            date: new Date().toISOString(), read: false,
        });
    }
    saveDB();
    const { password: _, ...userToReturn } = user;
    return apiCall(userToReturn);
};

export const apiChangePassword = (token: string, currentPasswordAttempt: string, newPassword: string): Promise<User> => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user) return apiError("User not found.");
    if (user.password !== currentPasswordAttempt) return apiError("Incorrect current password.");
    if (newPassword.length < 8) return apiError("New password must be at least 8 characters.");

    user.password = newPassword;
    saveDB();
    const { password, ...userToReturn } = user;
    return apiCall(userToReturn);
};

export const apiSetFundPassword = (token: string, loginPasswordAttempt: string, newFundPassword: string): Promise<User> => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user) return apiError("User not found.");
    if (user.password !== loginPasswordAttempt) return apiError("Incorrect login password.");
    if (newFundPassword.length < 6) return apiError("Fund password must be at least 6 characters.");

    user.fundPassword = newFundPassword;
    saveDB();
    const { password, ...userToReturn } = user;
    return apiCall(userToReturn);
};

// Note: 2FA code validation is mocked here. In a real app, you'd use a library like `notp`.
const verify2FACode = (secret: string, code: string) => {
    // Mock validation: accept any 6-digit code for demo purposes
    return /^\d{6}$/.test(code);
};

export const apiToggle2FA = (token: string, loginPasswordAttempt: string, code: string): Promise<User> => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user) return apiError("User not found.");
    if (user.password !== loginPasswordAttempt) return apiError("Incorrect login password.");
    
    const isEnabling = !user.twoFactorEnabled;
    
    if (isEnabling) {
        if (!user.twoFactorSecret) {
            user.twoFactorSecret = 'JBSWY3DPEHPK3PXP'; // Generate a real secret in production
        }
        if (!verify2FACode(user.twoFactorSecret, code)) {
            return apiError("Invalid authenticator code.");
        }
        user.twoFactorEnabled = true;
    } else {
        // For disabling, password check is enough
        user.twoFactorEnabled = false;
    }
    
    saveDB();
    const { password, ...userToReturn } = user;
    return apiCall(userToReturn);
};

export const apiPlaceSecondContractTrade = (token: string, details: PlaceSecondContractTradeDetails): Promise<User> => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user) return apiError("User not found.");

    const vipTiers = db.systemSettings.vipTiers || [];
    const userVipInfo = vipTiers.find(tier => tier.level === (user.vipLevel || 1));
    const userTradeLimit = userVipInfo ? userVipInfo.tradeLimit : 1;

    const activeTradeCount = user.activeSecondContracts?.length || 0;

    if (userTradeLimit !== 'unlimited' && activeTradeCount >= userTradeLimit) {
        return apiError(`Trade limit of ${userTradeLimit} reached for VIP ${user.vipLevel}. Please wait for active trades to complete or upgrade your VIP level.`);
    }

    const { amount, type, option, entryPrice } = details;
    const commission = amount * option.commissionRate;
    const totalCost = amount + commission;

    if (totalCost > user.portfolio.balance) {
      return apiError("Insufficient balance to cover stake and commission.");
    }
    user.portfolio.balance -= totalCost;
    updateUserVipLevel(user, db.systemSettings.vipTiers || []);

    const newTrade: SecondContractTrade = {
        id: `sctrade-${Date.now()}`, pair: "BTC-USDT", type,
        duration: option.duration, profitRate: option.profitRate,
        commissionRate: option.commissionRate, amount: amount,
        status: "active", entryPrice: entryPrice,
        closesAt: new Date(Date.now() + option.duration * 1000).toISOString(),
        userId: user.uid, created_date: new Date().toISOString(),
    };
    if (!user.activeSecondContracts) user.activeSecondContracts = [];
    user.activeSecondContracts.unshift(newTrade);
    
    saveDB();
    const { password: _, ...userToReturn } = user;
    return apiCall(userToReturn, 200);
}

export const apiCompleteSecondContractTrade = async (token: string, tradeId: string, currentPrice: number): Promise<User> => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user) return apiError("User not found.");
  
    const tradeIndex = user.activeSecondContracts.findIndex(t => t.id === tradeId);
    if (tradeIndex === -1) {
      // It might have already been resolved by an admin, which is fine.
      const { password: _, ...userToReturn } = user;
      return apiCall(userToReturn, 100); 
    }
  
    const trade = user.activeSecondContracts[tradeIndex];
    
    // In the new flow, trades wait for admin approval. We just remove the trade from the active list.
    user.activeSecondContracts.splice(tradeIndex, 1);
    
    // Add a notification that it's pending review.
    user.notifications.unshift({
      id: `notif-pending-${trade.id}`, type: 'transaction', title: `Contract Expired`,
      message: `Your ${trade.duration}s contract on ${trade.pair} has expired and is awaiting settlement by an administrator.`,
      date: new Date().toISOString(), read: false,
    });
    
    saveDB();
    const { password: _, ...userToReturn } = user;
    return apiCall(userToReturn, 200);
  };

export const apiMarkAllNotificationsAsRead = (token: string): Promise<User> => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user) return apiError("User not found.");
    user.notifications.forEach(n => n.read = true);
    saveDB();
    const { password: _, ...userToReturn } = user;
    return apiCall(userToReturn, 200);
}

export const apiMarkNotificationAsRead = (token: string, notificationId: string): Promise<User> => {
    const uid = token.replace('TOKEN_', '');
    const user = findUserByUid(uid);
    if (!user) return apiError("User not found.");
    const notification = user.notifications.find(n => n.id === notificationId);
    if (notification) { notification.read = true; saveDB(); }
    const { password: _, ...userToReturn } = user;
    return apiCall(userToReturn, 100);
}

// --- SYSTEM SETTINGS API ---
export const apiGetSystemSettings = (): Promise<SystemSettings> => {
    return apiCall(db.systemSettings);
}

export const apiUpdateSystemSettings = (token: string, adminPasswordAttempt: string, newSettings: SystemSettings): Promise<void> => {
    const admin = checkAdmin(token);
    if (admin.password !== adminPasswordAttempt) return apiError("Incorrect admin password");

    db.systemSettings = { ...db.systemSettings, ...newSettings };
    saveDB();
    return apiCall(undefined);
}

// --- ADMIN API ---
export const apiVerifyAdminPassword = (token: string, passwordAttempt: string): Promise<boolean> => {
    const admin = checkAdmin(token);
    if (admin.password !== passwordAttempt) {
        return apiError("Incorrect admin password.");
    }
    return apiCall(true, 200);
};

export const apiAdminCreateUser = (token: string, details: CreateUserDetails): Promise<void> => {
    checkAdmin(token);
    return apiSignup(details.name, details.email, details.password || 'password123', {
        dateOfBirth: '1990-01-01', country: 'United States', address: '123 Test St'
    }).then(() => undefined); // Discard signup's return value
};

export const apiGetAllUsers = (token: string): Promise<User[]> => {
    checkAdmin(token);
    const users = Object.values(db.users).map(({ password, ...user }) => user);
    return apiCall(users);
};

export const apiGetPendingKyc = (token: string): Promise<KycRequest[]> => {
    checkAdmin(token);
    const pendingUsers = Object.values(db.users).filter(u => u.kycStatus === 'pending');
    return apiCall(pendingUsers.map(user => ({ user, kycImages: db.kycImages[user.uid] || { idFront: '', idBack: '' } })));
};

export const apiUpdateKycStatus = (token: string, adminPasswordAttempt: string, targetUserId: string, status: 'verified' | 'rejected'): Promise<void> => {
    const admin = checkAdmin(token);
    if (admin.password !== adminPasswordAttempt) return apiError("Incorrect admin password");
    
    const targetUser = findUserByUid(targetUserId);
    if (!targetUser) return apiError("Target user not found.");
    targetUser.kycStatus = status;
    
    targetUser.notifications.unshift({
        id: `notif-${Date.now()}`, type: 'system', title: `KYC ${status === 'verified' ? 'Approved' : 'Rejected'}`,
        message: status === 'verified' ? 'Your identity has been successfully verified.' : 'Your KYC submission has been rejected. Please resubmit.',
        date: new Date().toISOString(), read: false,
    });
    saveDB();
    return apiCall(undefined);
};

export const apiGetPendingDeposits = (token: string): Promise<PendingDeposit[]> => {
    checkAdmin(token);
    return apiCall(Object.values(db.users).flatMap(user => user.transactions
        .filter(tx => tx.type === 'Deposit' && tx.status === 'Pending')
        .map(transaction => ({ userId: user.uid, userName: user.name, userEmail: user.email, transaction }))
    ));
};

export const apiUpdateDepositStatus = (token: string, adminPasswordAttempt: string, targetUserId: string, transactionId: string, status: 'Completed' | 'Failed'): Promise<void> => {
    const admin = checkAdmin(token);
    if (admin.password !== adminPasswordAttempt) return apiError("Incorrect admin password");

    const targetUser = findUserByUid(targetUserId);
    if (!targetUser) return apiError("Target user not found.");
    const transaction = targetUser.transactions.find(tx => tx.id === transactionId);
    if (!transaction || transaction.type !== 'Deposit') return apiError("Deposit transaction not found.");
    
    const wasFirstDeposit = !targetUser.transactions.some(tx => tx.type === 'Deposit' && tx.status === 'Completed');

    transaction.status = status;
    if (status === 'Completed') {
        targetUser.portfolio.balance += transaction.amount;
        updateUserVipLevel(targetUser, db.systemSettings.vipTiers || []); // Update VIP Level
        
        if (wasFirstDeposit) {
            const referrer = Object.values(db.users).find(u => u.referredUsers?.some(ru => ru.uid === targetUser.uid));
            if (referrer) {
                const referredUserInfo = referrer.referredUsers.find(ru => ru.uid === targetUser.uid);
                if (referredUserInfo && referredUserInfo.status === 'registered') {
                    const rewardAmount = 10; // $10 reward
                    referredUserInfo.status = 'deposited';
                    referredUserInfo.reward = rewardAmount;
                    
                    if (typeof referrer.portfolio.referralRewards === 'undefined') {
                        referrer.portfolio.referralRewards = 0;
                    }
                    referrer.portfolio.referralRewards += rewardAmount;
                    referrer.portfolio.balance += rewardAmount;

                    referrer.notifications.unshift({
                        id: `notif-ref-${Date.now()}`,
                        type: 'system',
                        title: 'Referral Reward!',
                        message: `Your referral ${targetUser.name} made their first deposit! You've earned a $${rewardAmount} reward.`,
                        date: new Date().toISOString(),
                        read: false,
                    });
                }
            }
        }
    }

    targetUser.notifications.unshift({
        id: `notif-${Date.now()}`, type: 'transaction', title: `Deposit ${status}`,
        message: `Your deposit of ${transaction.amount} ${transaction.asset} has been ${status === 'Completed' ? 'approved' : 'declined'}.`,
        date: new Date().toISOString(), read: false,
    });
    saveDB();
    return apiCall(undefined);
};

export const apiGetPendingWithdrawals = (token: string): Promise<PendingWithdrawal[]> => {
    checkAdmin(token);
    return apiCall(Object.values(db.users).flatMap(user => user.transactions
        .filter(tx => tx.type === 'Withdrawal' && tx.status === 'Pending')
        .map(transaction => ({ userId: user.uid, userName: user.name, userEmail: user.email, transaction }))
    ));
};

export const apiUpdateWithdrawalStatus = (token: string, adminPasswordAttempt: string, targetUserId: string, transactionId: string, status: 'Completed' | 'Failed'): Promise<void> => {
    const admin = checkAdmin(token);
    if (admin.password !== adminPasswordAttempt) return apiError("Incorrect admin password");

    const targetUser = findUserByUid(targetUserId);
    if (!targetUser) return apiError("Target user not found.");
    const transaction = targetUser.transactions.find(tx => tx.id === transactionId);
    if (!transaction || transaction.type !== 'Withdrawal') return apiError("Withdrawal transaction not found.");
    if (transaction.status !== 'Pending') return apiError("Transaction is not pending.");
    
    transaction.status = status;
    if (status === 'Completed') {
        if (targetUser.portfolio.balance < transaction.amount) {
            transaction.status = 'Failed';
            targetUser.notifications.unshift({ id: `notif-${Date.now()}`, type: 'transaction', title: `Withdrawal Failed`, message: `Your withdrawal of ${transaction.amount} ${transaction.asset} failed due to insufficient funds.`, date: new Date().toISOString(), read: false });
            saveDB();
            return apiError("Withdrawal failed due to insufficient funds.");
        }
        targetUser.portfolio.balance -= transaction.amount;
        updateUserVipLevel(targetUser, db.systemSettings.vipTiers || []);
    }

    targetUser.notifications.unshift({ id: `notif-${Date.now()}`, type: 'transaction', title: `Withdrawal ${status}`, message: `Your withdrawal of ${transaction.amount} ${transaction.asset} has been ${status === 'Completed' ? 'approved' : 'declined'}.`, date: new Date().toISOString(), read: false });
    saveDB();
    return apiCall(undefined);
};

export const apiUpdateUserBalance = (token: string, adminPasswordAttempt: string, targetUserId: string, newBalance: number): Promise<void> => {
    const admin = checkAdmin(token);
    if (admin.password !== adminPasswordAttempt) return apiError("Incorrect admin password");

    const targetUser = findUserByUid(targetUserId);
    if (!targetUser) return apiError("Target user not found.");
    
    const diff = newBalance - targetUser.portfolio.balance;
    targetUser.portfolio.balance = newBalance;
    updateUserVipLevel(targetUser, db.systemSettings.vipTiers || []);
    
    targetUser.transactions.unshift({
        id: `adj-${Date.now()}`, type: 'Admin Adjustment', asset: 'USDT',
        amount: diff, status: 'Completed', date: new Date().toISOString()
    });
    saveDB();
    return apiCall(undefined);
}

export const apiAddManualTransaction = (token: string, adminPasswordAttempt: string, details: ManualTransactionDetails): Promise<void> => {
    const admin = checkAdmin(token);
    if (admin.password !== adminPasswordAttempt) return apiError("Incorrect admin password");

    const targetUser = findUserByEmail(details.userEmail);
    if (!targetUser) return apiError("Target user not found.");
    
    targetUser.transactions.unshift({
        id: `manual-${Date.now()}`, type: details.type, asset: details.asset,
        amount: details.amount, status: 'Completed', date: new Date().toISOString(),
    });
    
    if (details.type === 'Deposit') targetUser.portfolio.balance += details.amount;
    else {
        if (targetUser.portfolio.balance < details.amount) return apiError("Manual withdrawal failed: insufficient user balance.");
        targetUser.portfolio.balance -= details.amount;
    }
    
    updateUserVipLevel(targetUser, db.systemSettings.vipTiers || []);
    
    targetUser.notifications.unshift({
        id: `notif-${Date.now()}`, type: 'transaction', title: `Manual ${details.type}`,
        message: `An admin has processed a manual ${details.type} of ${details.amount} ${details.asset} for your account.`,
        date: new Date().toISOString(),
        read: false,
    });
    
    saveDB();
    return apiCall(undefined);
};

export const apiGetAllTrades = (token: string): Promise<Transaction[]> => {
    checkAdmin(token);
    const allTrades: Transaction[] = [];
    Object.values(db.users).forEach(user => {
        user.transactions.forEach(tx => {
            if (tx.type === 'Trade') {
                allTrades.push({ ...tx, userEmail: user.email, userName: user.name });
            }
        });
    });
    allTrades.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return apiCall(allTrades);
};

export const apiGetAllOrders = (token: string): Promise<Transaction[]> => {
    checkAdmin(token);
    const allOrders: Transaction[] = [];
    Object.values(db.users).forEach(user => {
        user.transactions.forEach(tx => {
            if (tx.type === 'Deposit' || tx.type === 'Withdrawal') {
                allOrders.push({ ...tx, userEmail: user.email, userName: user.name, userId: user.uid });
            }
        });
    });
    allOrders.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    return apiCall(allOrders);
};

export const apiGetAllActiveContracts = (token: string): Promise<SecondContractTrade[]> => {
    checkAdmin(token);
    const allActiveContracts: SecondContractTrade[] = [];
    Object.values(db.users).forEach(user => {
        if (user.activeSecondContracts) {
            allActiveContracts.push(...user.activeSecondContracts);
        }
    });
    allActiveContracts.sort((a,b) => new Date(b.created_date).getTime() - new Date(a.created_date).getTime());
    return apiCall(allActiveContracts);
}

export const apiAdminResolveContract = (token: string, adminPasswordAttempt: string, tradeId: string, resolution: 'win' | 'loss'): Promise<void> => {
    const admin = checkAdmin(token);
    if (admin.password !== adminPasswordAttempt) return apiError("Incorrect admin password");

    let targetUser: User | undefined;
    let trade: SecondContractTrade | undefined;
    let tradeIndex: number = -1;

    for (const user of Object.values(db.users)) {
        if (user.activeSecondContracts) {
            tradeIndex = user.activeSecondContracts.findIndex(t => t.id === tradeId);
            if (tradeIndex !== -1) {
                targetUser = user;
                trade = user.activeSecondContracts[tradeIndex];
                break;
            }
        }
    }
    
    if (!targetUser || !trade) return apiError("Active contract not found.");

    targetUser.activeSecondContracts.splice(tradeIndex, 1);

    const isWin = resolution === 'win';
    const closePrice = trade.entryPrice + (isWin ? 100 : -100) * Math.random();
    const pnl = isWin ? trade.amount * trade.profitRate : -trade.amount;
    const payout = isWin ? trade.amount + pnl : 0;
    targetUser.portfolio.balance += payout;
    updateUserVipLevel(targetUser, db.systemSettings.vipTiers || []);

    const resolvedTrade: SecondContractTrade = { ...trade, status: isWin ? "won" : "lost", closePrice: closePrice };
    if (!targetUser.secondContractHistory) targetUser.secondContractHistory = [];
    targetUser.secondContractHistory.unshift(resolvedTrade);

    const newTransaction: Transaction = {
        id: `tx-${trade.id}`, type: 'Trade', status: 'Completed', amount: pnl, asset: trade.pair.split('-')[1] || 'USDT',
        date: trade.created_date, endTime: new Date().toISOString(), pair: trade.pair,
        direction: trade.type === 'buy' ? 'Buy' : 'Sell', stake: trade.amount, commission: trade.amount * trade.commissionRate,
        profit: pnl, entryPrice: trade.entryPrice, exitPrice: closePrice, settlementDuration: trade.duration,
        profitPercentage: trade.profitRate * 100, commissionPercentage: trade.commissionRate * 100,
    };
    targetUser.transactions.unshift(newTransaction);
    
    targetUser.notifications.unshift({
        id: `notif-admin-${trade.id}`, type: 'transaction', title: `Contract Settled by Admin`,
        message: `Your contract on ${trade.pair} was manually settled as a ${isWin ? 'Win' : 'Loss'}. P/L: $${pnl.toFixed(2)}.`,
        date: new Date().toISOString(), read: false,
    });
    saveDB();
    return apiCall(undefined);
}
