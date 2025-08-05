
import * as React from 'react';
import { Routes, Route, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import type { User, KycRequest, PendingDeposit, PendingWithdrawal, Transaction, SecondContractTrade, LoginRecord, SystemSettings, HomepageActionItem, VipTier } from '../types.ts';
import { LayoutDashboard, Users, UserCheck, Banknote, LogOut, Loader, CheckCircle, XCircle, Home, ArrowUpRight, Repeat, Edit, Search, ArrowUpDown, ArrowUp, ArrowDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, UserPlus, ShieldAlert, Swords, Eye, Settings, ListOrdered, Copy, Award } from 'lucide-react';

const ImageModal = ({ isOpen, onClose, children, maxWidth = 'max-w-4xl' }: { isOpen: boolean; onClose: () => void; children: React.ReactNode; maxWidth?: string }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className={`bg-card rounded-lg p-6 w-full m-4 ${maxWidth}`} onClick={(e) => e.stopPropagation()}>
                {children}
            </div>
        </div>
    );
};

const ConfirmActionModal = ({ isOpen, onClose, onConfirm, title, children }: { isOpen: boolean, onClose: () => void, onConfirm: (password: string) => Promise<void>, title: string, children: React.ReactNode }) => {
    const [password, setPassword] = React.useState('');
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if (isOpen) {
            setPassword('');
            setError('');
        }
    }, [isOpen]);

    if (!isOpen) return null;

    const handleConfirm = async () => {
        setError('');
        if (!password) {
            setError("Password is required.");
            return;
        }
        setIsLoading(true);
        try {
            await onConfirm(password);
            onClose();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred.');
        } finally {
            setIsLoading(false);
        }
    };
    
    return (
        <ImageModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
             <div className="w-full">
                <h3 className="text-xl font-bold text-card-foreground mb-2">{title}</h3>
                <div className="text-muted-foreground mb-4">{children}</div>
                <div>
                    <label htmlFor="admin-password" className="block text-sm font-medium text-muted-foreground">Admin Password</label>
                    <input
                        type="password" id="admin-password" value={password} onChange={(e) => setPassword(e.target.value)}
                        className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        placeholder="Enter your password to confirm"
                    />
                </div>
                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-secondary text-secondary-foreground rounded-lg">Cancel</button>
                    <button disabled={isLoading} onClick={handleConfirm} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center disabled:opacity-50">
                        {isLoading ? <Loader size={20} className="animate-spin mr-2" /> : <ShieldAlert size={20} className="mr-2" />} Confirm Action
                    </button>
                </div>
             </div>
        </ImageModal>
    );
};

const CreateUserModal = ({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) => {
    const { adminCreateUser } = useAuth();
    const [details, setDetails] = React.useState({ name: '', email: '', password: '' });
    const [isLoading, setIsLoading] = React.useState(false);
    const [error, setError] = React.useState('');
    
    React.useEffect(() => { if(isOpen) { setDetails({ name: '', email: '', password: '' }); setError(''); } }, [isOpen]);

    if (!isOpen) return null;

    const handleCreate = async () => {
        setError('');
        if (!details.name || !details.email) {
            setError("Name and email are required.");
            return;
        }
        setIsLoading(true);
        try {
            await adminCreateUser(details);
            onClose();
        } catch (err) { setError(err instanceof Error ? err.message : 'An error occurred.'); } 
        finally { setIsLoading(false); }
    };
    
    return (
        <ImageModal isOpen={isOpen} onClose={onClose} maxWidth="max-w-md">
            <div className="w-full">
                <h3 className="text-xl font-bold mb-4">Create New User</h3>
                <div className="space-y-4">
                    <input type="text" placeholder="Full Name" value={details.name} onChange={e => setDetails({...details, name: e.target.value})} className="w-full bg-secondary border-border rounded-lg p-2" />
                    <input type="email" placeholder="Email Address" value={details.email} onChange={e => setDetails({...details, email: e.target.value})} className="w-full bg-secondary border-border rounded-lg p-2" />
                    <input type="password" placeholder="Password (optional, defaults to 'password123')" value={details.password} onChange={e => setDetails({...details, password: e.target.value})} className="w-full bg-secondary border-border rounded-lg p-2" />
                </div>
                {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                <div className="flex justify-end space-x-3 mt-6">
                    <button onClick={onClose} className="px-4 py-2 bg-secondary rounded-lg">Cancel</button>
                    <button disabled={isLoading} onClick={handleCreate} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg flex items-center disabled:opacity-50">
                        {isLoading ? <Loader size={20} className="animate-spin mr-2" /> : <UserPlus size={20} className="mr-2" />} Create User
                    </button>
                </div>
            </div>
        </ImageModal>
    );
};

const UserDetailsModal = ({ user, onClose }: { user: User | null; onClose: () => void }) => {
    if (!user) return null;
    return (
      <ImageModal isOpen={!!user} onClose={onClose} maxWidth="max-w-2xl">
        <h3 className="text-xl font-bold mb-4">Login History for {user.name}</h3>
        <div className="max-h-96 overflow-y-auto">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-card">
              <tr>
                <th className="p-2">Date</th>
                <th className="p-2">IP Address</th>
                <th className="p-2">Device</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {user.loginHistory && user.loginHistory.length > 0 ? (
                user.loginHistory.map((record: LoginRecord) => (
                  <tr key={record.date}>
                    <td className="p-2">{new Date(record.date).toLocaleString()}</td>
                    <td className="p-2 font-mono">{record.ipAddress}</td>
                    <td className="p-2 truncate" title={record.device}>{record.device}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={3} className="text-center p-8 text-muted-foreground">
                    No login history found.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </ImageModal>
    );
};

const StatCard = ({ title, value, icon, color }: { title: string; value: string | number; icon: React.ReactNode, color: string }) => (
    <div className={`bg-card p-6 rounded-xl shadow-md flex items-center space-x-4 border-l-4 ${color}`}>
        {icon}<div><p className="text-muted-foreground text-sm font-medium">{title}</p><p className="text-2xl font-bold">{value}</p></div>
    </div>
);

const PaginationControls = ({ currentPage, totalPages, onPageChange }: { currentPage: number, totalPages: number, onPageChange: (page: number) => void }) => {
    if (totalPages <= 1) return null;
    return (
        <div className="flex justify-between items-center p-4 border-t border-border">
            <span className="text-sm text-muted-foreground">Page {currentPage} of {totalPages}</span>
            <div className="flex items-center gap-1">
                <button onClick={() => onPageChange(1)} disabled={currentPage === 1} className="p-2 rounded-md disabled:opacity-50 hover:bg-secondary"><ChevronsLeft size={20} /></button>
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="p-2 rounded-md disabled:opacity-50 hover:bg-secondary"><ChevronLeft size={20} /></button>
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage >= totalPages} className="p-2 rounded-md disabled:opacity-50 hover:bg-secondary"><ChevronRight size={20} /></button>
                <button onClick={() => onPageChange(totalPages)} disabled={currentPage >= totalPages} className="p-2 rounded-md disabled:opacity-50 hover:bg-secondary"><ChevronsRight size={20} /></button>
            </div>
        </div>
    );
};

const DashboardView = () => {
    const { fetchAllUsers, fetchPendingKyc, fetchPendingDeposits, fetchPendingWithdrawals, addManualTransaction } = useAuth();
    const [stats, setStats] = React.useState({ users: 0, kyc: 0, deposits: 0, withdrawals: 0 });
    const [loading, setLoading] = React.useState(true);
    const [details, setDetails] = React.useState({ userEmail: '', type: 'Deposit', asset: 'USDT', amount: '' });
    const [message, setMessage] = React.useState<{type: 'success' | 'error', text: string} | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);

    React.useEffect(() => {
        const fetchStats = async () => {
            setLoading(true);
            try {
                const [users, kyc, deposits, withdrawals] = await Promise.all([ fetchAllUsers(), fetchPendingKyc(), fetchPendingDeposits(), fetchPendingWithdrawals() ]);
                setStats({ users: users.length, kyc: kyc.length, deposits: deposits.length, withdrawals: withdrawals.length });
            } catch (error) { console.error("Failed to fetch dashboard stats:", error); } 
            finally { setLoading(false); }
        };
        fetchStats();
    }, [fetchAllUsers, fetchPendingKyc, fetchPendingDeposits, fetchPendingWithdrawals]);
    
    const handleFormSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!details.userEmail || !details.amount || parseFloat(details.amount) <= 0) {
            setMessage({ type: 'error', text: 'Please fill all fields with valid values.' });
            return;
        }
        setIsConfirmOpen(true);
    };
    
    const onConfirmAction = (password: string) => {
        return addManualTransaction(password, { ...details, amount: parseFloat(details.amount), type: details.type as 'Deposit' | 'Withdrawal' }).then(() => {
            setMessage({ type: 'success', text: 'Transaction added successfully!'});
            setDetails({ userEmail: '', type: 'Deposit', asset: 'USDT', amount: '' });
        });
    };
    
    if (loading) return <div className="flex justify-center items-center h-full"><Loader className="animate-spin" size={48} /></div>;

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">Admin Dashboard</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <StatCard title="Total Users" value={stats.users} icon={<Users size={28}/>} color="border-primary" />
                <StatCard title="Pending KYC" value={stats.kyc} icon={<UserCheck size={28}/>} color="border-warning" />
                <StatCard title="Pending Deposits" value={stats.deposits} icon={<Banknote size={28}/>} color="border-success" />
                <StatCard title="Pending Withdrawals" value={stats.withdrawals} icon={<ArrowUpRight size={28}/>} color="border-destructive" />
            </div>
             <div className="bg-card p-6 rounded-xl shadow-md mt-8">
                <h2 className="text-xl font-bold mb-4">Manual Transaction</h2>
                <form onSubmit={handleFormSubmit} className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <input type="email" value={details.userEmail} onChange={e => setDetails({...details, userEmail: e.target.value})} className="w-full bg-secondary border-transparent rounded-lg p-2" placeholder="User Email" />
                        <input type="number" value={details.amount} onChange={e => setDetails({...details, amount: e.target.value})} className="w-full bg-secondary border-transparent rounded-lg p-2" placeholder="Amount" />
                        <select value={details.type} onChange={e => setDetails({...details, type: e.target.value})} className="w-full bg-secondary border-transparent rounded-lg p-2"><option value="Deposit">Deposit</option><option value="Withdrawal">Withdrawal</option></select>
                        <input type="text" value={details.asset} onChange={e => setDetails({...details, asset: e.target.value})} className="w-full bg-secondary border-transparent rounded-lg p-2" />
                    </div>
                    {message && <p className={`text-sm ${message.type === 'success' ? 'text-success' : 'text-destructive'}`}>{message.text}</p>}
                    <button type="submit" className="px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition w-full">Submit Transaction</button>
                </form>
            </div>
            <ConfirmActionModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={onConfirmAction} title="Confirm Manual Transaction">
                <p>This action will create a transaction and adjust the user's balance. This is irreversible.</p>
            </ConfirmActionModal>
        </div>
    );
};

const UsersView = () => {
    const { fetchAllUsers, updateUserBalance } = useAuth();
    const [users, setUsers] = React.useState<User[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [editingUser, setEditingUser] = React.useState<User | null>(null);
    const [viewingUser, setViewingUser] = React.useState<User | null>(null);
    const [isCreateUserOpen, setIsCreateUserOpen] = React.useState(false);
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [newBalance, setNewBalance] = React.useState('');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [sortConfig, setSortConfig] = React.useState<{ key: keyof User | 'balance', direction: 'ascending' | 'descending' }>({ key: 'name', direction: 'ascending' });
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;

    const loadUsers = React.useCallback(() => { setLoading(true); fetchAllUsers().then(setUsers).catch(console.error).finally(() => setLoading(false)); }, [fetchAllUsers]);
    React.useEffect(loadUsers, [loadUsers]);
    
    const handleEditBalanceClick = (user: User) => {
        setEditingUser(user);
        setNewBalance(String(user.portfolio.balance));
        setIsConfirmOpen(true);
    };

    const onConfirmEditBalance = (password: string) => {
        if (!editingUser) return Promise.reject();
        const bal = parseFloat(newBalance);
        if(isNaN(bal)) return Promise.reject(new Error("Invalid balance"));
        return updateUserBalance(password, editingUser.uid, bal).then(loadUsers);
    };
    
    const requestSort = (key: keyof User | 'balance') => {
        let direction: 'ascending' | 'descending' = 'ascending';
        if (sortConfig.key === key && sortConfig.direction === 'ascending') direction = 'descending';
        setSortConfig({ key, direction });
        setCurrentPage(1);
    };

    const processedUsers = React.useMemo(() => {
        let filtered = users.filter(user => user.name.toLowerCase().includes(searchTerm.toLowerCase()) || user.email.toLowerCase().includes(searchTerm.toLowerCase()));
        return filtered.sort((a, b) => {
            const aValue = sortConfig.key === 'balance' ? a.portfolio.balance : a[sortConfig.key];
            const bValue = sortConfig.key === 'balance' ? b.portfolio.balance : b[sortConfig.key];
            if (typeof aValue === 'string' && typeof bValue === 'string') return aValue.localeCompare(bValue) * (sortConfig.direction === 'ascending' ? 1 : -1);
            if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
        });
    }, [users, searchTerm, sortConfig]);

    const totalPages = Math.ceil(processedUsers.length / itemsPerPage);
    const paginatedUsers = processedUsers.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const SortableHeader = ({ label, sortKey }: { label: string, sortKey: keyof User | 'balance' }) => (
        <th className="p-4 text-left text-sm font-semibold uppercase tracking-wider cursor-pointer select-none" onClick={() => requestSort(sortKey)}>
            <div className="flex items-center gap-2">{label} {sortConfig.key !== sortKey && <ArrowUpDown size={14} />} {sortConfig.key === sortKey && (sortConfig.direction === 'ascending' ? <ArrowUp size={14} /> : <ArrowDown size={14} />)}</div>
        </th>
    );

    if (loading) return <div className="flex justify-center items-center h-full"><Loader className="animate-spin" size={48} /></div>;

    return (
        <div className="animate-fade-in">
            <div className="flex justify-between items-center mb-6"><h1 className="text-3xl font-bold">User Management</h1><button onClick={() => setIsCreateUserOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition"><UserPlus size={18} />Create User</button></div>
            <div className="mb-4 relative"><Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} /><input type="text" placeholder="Search by name or email..." value={searchTerm} onChange={(e) => {setSearchTerm(e.target.value); setCurrentPage(1);}} className="w-full max-w-sm bg-card border border-border rounded-lg pl-10 pr-4 py-2" /></div>
            <div className="bg-card rounded-lg shadow-md overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead className="bg-secondary/50"><tr><SortableHeader label="Name" sortKey="name" /><SortableHeader label="Email" sortKey="email" /><SortableHeader label="KYC Status" sortKey="kycStatus" /><SortableHeader label="Balance (USDT)" sortKey="balance" /><th className="p-4">Actions</th></tr></thead><tbody className="divide-y divide-border">{paginatedUsers.length > 0 ? paginatedUsers.map(user => (<tr key={user.uid} className="hover:bg-secondary/50"><td className="p-4">{user.name}</td><td className="p-4">{user.email}</td><td className="p-4"><span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${user.kycStatus === 'verified' ? 'bg-success/10 text-success' : user.kycStatus === 'pending' ? 'bg-warning/10 text-warning' : user.kycStatus === 'rejected' ? 'bg-destructive/10 text-destructive' : 'bg-secondary text-secondary-foreground'}`}>{user.kycStatus}</span></td><td className="p-4 font-mono">${user.portfolio.balance.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2})}</td><td className="p-4 flex gap-1"><button onClick={() => setViewingUser(user)} className="p-2 text-muted-foreground hover:text-blue-600 rounded-md"><Eye size={18} /></button><button onClick={() => handleEditBalanceClick(user)} className="p-2 text-muted-foreground hover:text-primary rounded-md"><Edit size={18} /></button></td></tr>)) : (<tr><td colSpan={5} className="text-center p-8 text-muted-foreground">No users found.</td></tr>)}</tbody></table></div><PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div>
            <CreateUserModal isOpen={isCreateUserOpen} onClose={() => { setIsCreateUserOpen(false); loadUsers(); }} />
            <UserDetailsModal user={viewingUser} onClose={() => setViewingUser(null)} />
            {editingUser && <ConfirmActionModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={onConfirmEditBalance} title={`Edit Balance for ${editingUser.name}`}><div><label>New Balance (USDT)</label><input type="number" value={newBalance} onChange={e => setNewBalance(e.target.value)} className="w-full mt-1 bg-secondary rounded-lg p-2" /></div></ConfirmActionModal>}
        </div>
    );
};

const KycView = () => {
    const { fetchPendingKyc, updateKycStatus } = useAuth();
    const [kycQueue, setKycQueue] = React.useState<KycRequest[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [selectedRequest, setSelectedRequest] = React.useState<KycRequest | null>(null);
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [actionToConfirm, setActionToConfirm] = React.useState<null | ((password: string) => Promise<void>)>(null);

    const loadKyc = React.useCallback(() => { setLoading(true); fetchPendingKyc().then(setKycQueue).finally(() => setLoading(false)); }, [fetchPendingKyc]);
    React.useEffect(loadKyc, [loadKyc]);

    const handleActionClick = (request: KycRequest, status: 'verified' | 'rejected') => {
        setActionToConfirm(() => (password: string) => updateKycStatus(password, request.user.uid, status).then(() => { loadKyc(); setSelectedRequest(null); }));
        setIsConfirmOpen(true);
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Loader className="animate-spin" size={48} /></div>;

    return (
        <div className="animate-fade-in"><h1 className="text-3xl font-bold mb-6">KYC Approval Queue</h1>{kycQueue.length === 0 ? <p className="text-center text-muted-foreground py-10">No pending KYC requests.</p> : <div className="space-y-4">{kycQueue.map(req => (<div key={req.user.uid} className="bg-card p-4 rounded-lg shadow-md flex justify-between items-center"><div><p className="font-bold">{req.user.fullName || req.user.name}</p><p className="text-sm text-muted-foreground">{req.user.email}</p></div><button onClick={() => setSelectedRequest(req)} className="px-4 py-2 bg-primary text-primary-foreground rounded-lg">Review</button></div>))}</div>}
            {selectedRequest && <ImageModal isOpen={!!selectedRequest} onClose={() => setSelectedRequest(null)}><h3 className="text-xl font-bold mb-4">{`KYC for ${selectedRequest.user.name}`}</h3><div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4"><img src={selectedRequest.kycImages.idFront} alt="ID Front" className="w-full rounded-md border" /><img src={selectedRequest.kycImages.idBack} alt="ID Back" className="w-full rounded-md border" /></div><div className="flex justify-end space-x-3 mt-4"><button onClick={() => handleActionClick(selectedRequest, 'rejected')} className="px-4 py-2 bg-destructive text-destructive-foreground rounded-lg">Reject</button><button onClick={() => handleActionClick(selectedRequest, 'verified')} className="px-4 py-2 bg-success text-success-foreground rounded-lg">Approve</button></div></ImageModal>}
            {actionToConfirm && <ConfirmActionModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={actionToConfirm} title="Confirm KYC Action"><p>Please confirm this KYC action for {selectedRequest?.user.name}.</p></ConfirmActionModal>}
        </div>
    );
};

const OrdersView = () => {
    const { fetchAllOrders, updateDepositStatus, updateWithdrawalStatus } = useAuth();

    const [orders, setOrders] = React.useState<Transaction[]>([]);
    const [loading, setLoading] = React.useState(true);
    
    const [filter, setFilter] = React.useState('all');
    const [searchTerm, setSearchTerm] = React.useState('');
    const [sortConfig, setSortConfig] = React.useState<{ key: keyof Transaction | 'userName', direction: 'asc' | 'desc' }>({ key: 'date', direction: 'desc' });
    
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 10;
    
    const [selectedOrders, setSelectedOrders] = React.useState(new Set<string>());
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [toast, setToast] = React.useState<{ message: string, visible: boolean }>({ message: '', visible: false });

    const loadOrders = React.useCallback(() => {
        setLoading(true);
        fetchAllOrders()
            .then(setOrders)
            .catch(err => console.error("Failed to fetch orders:", err))
            .finally(() => setLoading(false));
    }, [fetchAllOrders]);

    React.useEffect(loadOrders, [loadOrders]);
    
    const showToast = (message: string) => {
        setToast({ message, visible: true });
        setTimeout(() => setToast({ message: '', visible: false }), 3000);
    };

    const handleCopyToClipboard = (text: string) => {
        if(!text) return;
        navigator.clipboard.writeText(text);
        showToast('Address Copied!');
    };

    const filteredAndSortedOrders = React.useMemo(() => {
        let filtered = [...orders];
        if (filter !== 'all') {
            if (filter === 'other') {
                const mainCurrencies = ['usdt', 'trx'];
                filtered = filtered.filter(o => !mainCurrencies.includes(o.asset.toLowerCase()));
            } else {
                filtered = filtered.filter(o => o.asset.toLowerCase() === filter);
            }
        }
        if (searchTerm) {
            const term = searchTerm.toLowerCase();
            filtered = filtered.filter(order =>
                Object.values(order).some(value => String(value).toLowerCase().includes(term))
            );
        }

        return filtered.sort((a, b) => {
            const valA = a[sortConfig.key as keyof Transaction];
            const valB = b[sortConfig.key as keyof Transaction];
            if (valA === undefined || valA === null) return 1;
            if (valB === undefined || valB === null) return -1;
            if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1;
            return 0;
        });
    }, [orders, filter, searchTerm, sortConfig]);

    const paginatedOrders = React.useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredAndSortedOrders.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredAndSortedOrders, currentPage]);

    const totalPages = Math.ceil(filteredAndSortedOrders.length / itemsPerPage);

    const handleSort = (key: keyof Transaction | 'userName') => {
        setSortConfig(prev => ({
            key,
            direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc'
        }));
        setCurrentPage(1);
    };

    const handleSelectAll = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newSelectedOrders = new Set<string>();
        if (e.target.checked) {
            paginatedOrders.forEach(order => newSelectedOrders.add(order.id));
        }
        setSelectedOrders(newSelectedOrders);
    };

    const handleSelectRow = (orderId: string) => {
        const newSelectedOrders = new Set(selectedOrders);
        if (newSelectedOrders.has(orderId)) {
            newSelectedOrders.delete(orderId);
        } else {
            newSelectedOrders.add(orderId);
        }
        setSelectedOrders(newSelectedOrders);
    };
    
    const onConfirmApprove = async (password: string) => {
        const promises: Promise<void>[] = [];
        const pendingToApprove = orders.filter(o => selectedOrders.has(o.id) && o.status === 'Pending');

        for (const order of pendingToApprove) {
            if (order.type === 'Deposit') {
                promises.push(updateDepositStatus(password, order.userId!, order.id, 'Completed'));
            } else if (order.type === 'Withdrawal') {
                promises.push(updateWithdrawalStatus(password, order.userId!, order.id, 'Completed'));
            }
        }
        
        await Promise.all(promises);
        showToast(`${pendingToApprove.length} orders approved!`);
        setSelectedOrders(new Set());
        loadOrders();
    };
    
    const pendingSelectedCount = React.useMemo(() => {
        return orders.filter(o => selectedOrders.has(o.id) && o.status === 'Pending').length;
    }, [selectedOrders, orders]);

    const stats = React.useMemo(() => {
        const volumeCurrency = filter === 'all' || filter === 'other' ? 'usdt' : filter;
        const volume = filteredAndSortedOrders
            .filter(o => o.asset.toLowerCase() === volumeCurrency.toLowerCase() && o.type === 'Deposit')
            .reduce((sum, o) => sum + o.amount, 0);

        return {
            total: filteredAndSortedOrders.length,
            pending: filteredAndSortedOrders.filter(o => o.status === 'Pending').length,
            completed: filteredAndSortedOrders.filter(o => o.status === 'Completed').length,
            volume,
            volumeCurrency,
        }
    }, [filteredAndSortedOrders, filter]);
    
    const SortableHeader = ({ label, sortKey }: { label: string, sortKey: keyof Transaction | 'userName' }) => (
      <th scope="col" className="px-4 py-3 cursor-pointer select-none" onClick={() => handleSort(sortKey)}>
        <div className="flex items-center gap-1">
          {label}
          {sortConfig.key === sortKey ? (
            sortConfig.direction === 'asc' ? <ArrowUp size={14} /> : <ArrowDown size={14} />
          ) : <ArrowUpDown size={14} className="opacity-30" />}
        </div>
      </th>
    );

    if (loading) return <div className="flex justify-center items-center h-full"><Loader className="animate-spin" size={48} /></div>;

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-2">Order Management</h1>
            <p className="text-muted-foreground mb-6">Combined view of all deposit and withdrawal orders.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
                <StatCard title="Total Orders" value={stats.total.toLocaleString()} icon={<ListOrdered size={28}/>} color="border-primary" />
                <StatCard title={`Deposit Volume (${stats.volumeCurrency.toUpperCase()})`} value={stats.volume.toLocaleString('en-US', {minimumFractionDigits:2, maximumFractionDigits:2})} icon={<Banknote size={28}/>} color="border-green-500" />
                <StatCard title="Pending Orders" value={stats.pending.toLocaleString()} icon={<Loader size={28}/>} color="border-warning" />
                <StatCard title="Completed Orders" value={stats.completed.toLocaleString()} icon={<CheckCircle size={28}/>} color="border-success" />
            </div>

            <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-4">
                <div className="flex items-center gap-2 bg-card p-1 rounded-lg">
                    {['all', 'usdt', 'trx', 'other'].map(f => (
                        <button key={f} onClick={() => {setFilter(f); setCurrentPage(1)}} className={`px-3 py-1.5 text-sm font-semibold rounded-md transition-colors ${filter === f ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-secondary'}`}>
                            {f.toUpperCase()}
                        </button>
                    ))}
                </div>
                 <div className="flex items-center gap-4">
                    <button onClick={() => setIsConfirmOpen(true)} disabled={pendingSelectedCount === 0} className="px-4 py-2 bg-success text-success-foreground rounded-lg flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-success/90">
                       <CheckCircle size={16}/> Approve Selected ({pendingSelectedCount})
                    </button>
                    <div className="relative">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
                        <input type="text" placeholder="Search orders..." value={searchTerm} onChange={e => {setSearchTerm(e.target.value); setCurrentPage(1)}} className="w-full md:w-64 bg-card border border-border rounded-lg pl-10 pr-4 py-2 focus:ring-2 focus:ring-ring" />
                    </div>
                </div>
            </div>
            
            <div className="bg-card rounded-lg shadow-md overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-secondary/50 text-sm uppercase">
                            <tr>
                                <th scope="col" className="px-4 py-3">
                                    <input type="checkbox" onChange={handleSelectAll} checked={paginatedOrders.length > 0 && selectedOrders.size >= paginatedOrders.length} className="form-checkbox h-4 w-4 rounded text-primary bg-secondary border-border focus:ring-primary" />
                                </th>
                                <SortableHeader label="Order ID" sortKey="id" />
                                <SortableHeader label="User" sortKey="userName" />
                                <SortableHeader label="Type" sortKey="type" />
                                <SortableHeader label="Asset" sortKey="asset" />
                                <th scope="col" className="px-4 py-3 text-right">Amount</th>
                                <th scope="col" className="px-4 py-3">Wallet Address</th>
                                <SortableHeader label="Status" sortKey="status" />
                                <SortableHeader label="Date" sortKey="date" />
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {paginatedOrders.map(order => (
                                <tr key={order.id} className="hover:bg-secondary/50">
                                    <td className="px-4 py-3">
                                        <input type="checkbox" checked={selectedOrders.has(order.id)} onChange={() => handleSelectRow(order.id)} className="form-checkbox h-4 w-4 rounded text-primary bg-secondary border-border focus:ring-primary" />
                                    </td>
                                    <td className="px-4 py-3 font-mono text-xs">{order.id}</td>
                                    <td className="px-4 py-3">{order.userName}<br/><span className="text-xs text-muted-foreground">{order.userEmail}</span></td>
                                    <td className="px-4 py-3">
                                        <span className={`font-semibold ${order.type === 'Deposit' ? 'text-success' : 'text-destructive'}`}>{order.type}</span>
                                    </td>
                                    <td className="px-4 py-3 font-semibold">{order.asset}</td>
                                    <td className="px-4 py-3 font-mono text-right">{order.amount.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 8})}</td>
                                    <td className="px-4 py-3 font-mono text-xs">
                                        <div className="flex items-center gap-2 group">
                                            <span>{order.address ? `${order.address.substring(0, 6)}...${order.address.substring(order.address.length - 4)}` : 'N/A'}</span>
                                            {order.address && <button onClick={() => handleCopyToClipboard(order.address!)} className="opacity-0 group-hover:opacity-100 transition-opacity"><Copy size={14} className="text-muted-foreground hover:text-primary"/></button>}
                                        </div>
                                    </td>
                                    <td className="px-4 py-3">
                                        <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${order.status === 'Completed' ? 'bg-success/10 text-success' : order.status === 'Pending' ? 'bg-warning/10 text-warning' : 'bg-destructive/10 text-destructive'}`}>{order.status}</span>
                                    </td>
                                    <td className="px-4 py-3 text-xs">{new Date(order.date).toLocaleString()}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                     {paginatedOrders.length === 0 && <div className="text-center py-12 text-muted-foreground"><p className="text-lg font-medium">No matching orders found.</p><p className="text-sm mt-1">Try adjusting your search or filters.</p></div>}
                </div>
                <PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} />
            </div>
            
            <ConfirmActionModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={onConfirmApprove} title="Confirm Order Approvals">
                <p>You are about to approve <span className="font-bold text-success">{pendingSelectedCount}</span> pending orders. This action cannot be undone.</p>
            </ConfirmActionModal>
            
            <div className={`fixed top-5 right-5 bg-primary text-primary-foreground text-sm font-bold px-4 py-2 rounded-lg shadow-lg transition-transform duration-300 ease-in-out ${toast.visible ? 'translate-x-0' : 'translate-x-[150%]'}`}>
                {toast.message}
            </div>
        </div>
    );
};

const TradesView = () => {
    const { fetchAllTrades } = useAuth();
    const [trades, setTrades] = React.useState<Transaction[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [currentPage, setCurrentPage] = React.useState(1);
    const itemsPerPage = 15;

    React.useEffect(() => { setLoading(true); fetchAllTrades().then(setTrades).finally(() => setLoading(false)); }, [fetchAllTrades]);
    
    const totalPages = Math.ceil(trades.length / itemsPerPage);
    const paginatedTrades = trades.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    if (loading) return <div className="flex justify-center items-center h-full"><Loader className="animate-spin" size={48} /></div>;

    return (
        <div className="animate-fade-in"><h1 className="text-3xl font-bold mb-6">All Trade History</h1><div className="bg-card rounded-lg shadow-md overflow-hidden"><div className="overflow-x-auto"><table className="w-full text-left whitespace-nowrap"><thead className="bg-secondary/50"><tr><th className="p-4">User</th><th className="p-4">Pair</th><th className="p-4">Direction</th><th className="p-4">Stake</th><th className="p-4">P/L</th><th className="p-4">Date</th></tr></thead><tbody className="divide-y divide-border">{paginatedTrades.map(trade => (<tr key={trade.id}><td className="p-4">{trade.userName}<br/><span className="text-xs text-muted-foreground">{trade.userEmail}</span></td><td className="p-4 font-semibold">{trade.pair}</td><td className={`p-4 font-semibold ${trade.direction === 'Buy' ? 'text-success' : 'text-destructive'}`}>{trade.direction}</td><td className="p-4">{trade.stake?.toLocaleString()}</td><td className={`p-4 font-bold ${(trade.profit || 0) >= 0 ? 'text-success' : 'text-destructive'}`}>{trade.profit?.toFixed(2)}</td><td className="p-4 text-xs">{new Date(trade.date).toLocaleString()}</td></tr>))}</tbody></table></div><PaginationControls currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} /></div></div>
    );
};

const TradeControlView = () => {
    const { fetchAllActiveContracts, adminResolveContract } = useAuth();
    const [contracts, setContracts] = React.useState<SecondContractTrade[]>([]);
    const [loading, setLoading] = React.useState(true);
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [actionToConfirm, setActionToConfirm] = React.useState<null | ((password: string) => Promise<void>)>(null);

    const loadContracts = React.useCallback(() => { setLoading(true); fetchAllActiveContracts().then(setContracts).finally(() => setLoading(false)); }, [fetchAllActiveContracts]);
    React.useEffect(loadContracts, [loadContracts]);

    const handleAction = (tradeId: string, resolution: 'win' | 'loss') => {
        setActionToConfirm(() => (password: string) => adminResolveContract(password, tradeId, resolution).then(loadContracts));
        setIsConfirmOpen(true);
    };

    if (loading) return <div className="flex justify-center items-center h-full"><Loader className="animate-spin" size={48} /></div>;
    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">Trade Control</h1>
            {contracts.length === 0 ? (
                <p className="text-center text-muted-foreground py-10">No active trades platform-wide.</p>
            ) : (
                <div className="bg-card rounded-lg shadow-md overflow-x-auto">
                    <table className="w-full text-left whitespace-nowrap">
                        <thead className="bg-secondary/50">
                            <tr>
                                <th className="p-4">User ID</th>
                                <th className="p-4">Pair</th>
                                <th className="p-4">Direction</th>
                                <th className="p-4">Stake</th>
                                <th className="p-4">Entry Price</th>
                                <th className="p-4">Closes At</th>
                                <th className="p-4">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {contracts.map(c => (
                                <tr key={c.id}>
                                    <td className="p-4 text-xs font-mono">{c.userId}</td>
                                    <td className="p-4 font-semibold">{c.pair}</td>
                                    <td className={`p-4 font-semibold ${c.type === 'buy' ? 'text-success' : 'text-destructive'}`}>{c.type === 'buy' ? 'Long' : 'Short'}</td>
                                    <td className="p-4">${c.amount.toLocaleString()}</td>
                                    <td className="p-4">${c.entryPrice.toFixed(2)}</td>
                                    <td className="p-4 text-xs">{new Date(c.closesAt).toLocaleString()}</td>
                                    <td className="p-4">
                                        <div className="flex gap-2">
                                            <button onClick={() => handleAction(c.id, 'loss')} className="px-3 py-1 bg-destructive text-destructive-foreground rounded">Force Loss</button>
                                            <button onClick={() => handleAction(c.id, 'win')} className="px-3 py-1 bg-success text-success-foreground rounded">Force Win</button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
            <ConfirmActionModal isOpen={isConfirmOpen} onClose={() => setIsConfirmOpen(false)} onConfirm={actionToConfirm!} title="Confirm Trade Resolution">
                <p>This will immediately settle the trade. This action is irreversible.</p>
            </ConfirmActionModal>
        </div>
    );
};

const SettingsView = () => {
    const { systemSettings, updateSystemSettings } = useAuth();
    const [settings, setSettings] = React.useState<SystemSettings | null>(null);
    const [isLoading, setIsLoading] = React.useState(true);
    const [isConfirmOpen, setIsConfirmOpen] = React.useState(false);
    const [message, setMessage] = React.useState<{type: 'success' | 'error', text: string} | null>(null);
    
    React.useEffect(() => {
        if(systemSettings) {
            const newSettings = JSON.parse(JSON.stringify(systemSettings));
            if (newSettings.homepageActionItems) {
                newSettings.homepageActionItems.forEach((item: HomepageActionItem) => {
                    if (item.state && typeof item.state === 'object') {
                        item.state = JSON.stringify(item.state, null, 2);
                    }
                });
            }
            if (!newSettings.vipTiers) {
                 newSettings.vipTiers = [
                    { level: 1, depositThreshold: 0, tradeLimit: 1 },
                    { level: 2, depositThreshold: 500, tradeLimit: 2 },
                    { level: 3, depositThreshold: 2000, tradeLimit: 3 },
                    { level: 4, depositThreshold: 5000, tradeLimit: 4 },
                    { level: 5, depositThreshold: 10000, tradeLimit: 'unlimited' },
                ];
            }
            setSettings(newSettings);
            setIsLoading(false);
        }
    }, [systemSettings]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (!settings) return;
        setSettings({ ...settings, [e.target.name]: e.target.value });
    };

    const handleChangeActionItem = (index: number, field: keyof HomepageActionItem, value: any) => {
        if (!settings?.homepageActionItems) return;
        const newItems = [...settings.homepageActionItems];
        const currentItem = { ...newItems[index] };

        if (field === 'enabled') {
            currentItem.enabled = value;
        } else if (field === 'order') {
            currentItem.order = parseInt(value, 10) || 0;
        } else {
            (currentItem as any)[field] = value;
        }
        
        newItems[index] = currentItem;
        setSettings({ ...settings, homepageActionItems: newItems });
    };

    const handleVipChange = (index: number, field: keyof VipTier, value: string) => {
        if (!settings?.vipTiers) return;
        const newTiers = [...settings.vipTiers];
        const tier = { ...newTiers[index] };

        if (field === 'depositThreshold') {
            tier.depositThreshold = parseInt(value, 10) || 0;
        } else if (field === 'tradeLimit') {
            if (value.toLowerCase() === 'unlimited') {
                tier.tradeLimit = 'unlimited';
            } else {
                tier.tradeLimit = parseInt(value, 10) || 0;
            }
        }
        
        newTiers[index] = tier;
        setSettings({ ...settings, vipTiers: newTiers });
    };

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);
        if (!settings || !settings.depositAddressTrc20 || !settings.depositAddressErc20 || !settings.depositAddressBtc) {
            setMessage({ type: 'error', text: 'All wallet address fields are required.' });
            return;
        }
        setIsConfirmOpen(true);
    };

    const onConfirmSave = async (password: string) => {
        if (!settings) return;

        const settingsToSave = JSON.parse(JSON.stringify(settings));

        if (settingsToSave.homepageActionItems) {
            for (const item of settingsToSave.homepageActionItems) {
                if (typeof item.state === 'string' && item.state.trim()) {
                    try {
                        item.state = JSON.parse(item.state);
                    } catch (e) {
                        throw new Error(`Invalid JSON in 'State' for item "${item.label}".`);
                    }
                } else {
                    delete item.state;
                }
            }
        }
        
        await updateSystemSettings(password, settingsToSave);
        setMessage({ type: 'success', text: 'Settings updated successfully!'});
    };

    if (isLoading || !settings) {
        return <div className="flex justify-center items-center h-full"><Loader className="animate-spin" size={48} /></div>;
    }

    const FormField = ({ label, name, value }: { label: string; name: keyof SystemSettings; value: string }) => (
        <div>
            <label htmlFor={name} className="block text-sm font-medium text-muted-foreground mb-1">{label}</label>
            <input 
                type="text" 
                id={name} 
                name={name} 
                value={value} 
                onChange={handleChange}
                className="w-full max-w-lg bg-secondary border border-border rounded-lg p-2"
            />
        </div>
    );

    return (
        <div className="animate-fade-in">
            <h1 className="text-3xl font-bold mb-6">System Settings</h1>
            <form onSubmit={handleSave}>
                <div className="bg-card p-6 rounded-xl shadow-md">
                    <h2 className="text-xl font-bold mb-4">Deposit Wallet Addresses</h2>
                    <div className="space-y-4">
                        <FormField label="TRC20 Wallet Address" name="depositAddressTrc20" value={settings.depositAddressTrc20} />
                        <FormField label="ERC20 Wallet Address" name="depositAddressErc20" value={settings.depositAddressErc20} />
                        <FormField label="BTC Wallet Address" name="depositAddressBtc" value={settings.depositAddressBtc} />
                    </div>
                </div>

                <div className="bg-card p-6 rounded-xl shadow-md mt-8">
                    <h2 className="text-xl font-bold mb-4">VIP Tier Management</h2>
                    <p className="text-sm text-muted-foreground mb-4">Define VIP levels based on total completed deposits and set their concurrent trade limits.</p>
                     <div className="space-y-4">
                        {settings.vipTiers?.map((tier, index) => (
                            <div key={index} className="p-4 border border-border rounded-lg grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                                <div className="font-bold text-lg flex items-center gap-2">
                                    <Award size={20} className="text-accent-gold" />
                                    VIP {tier.level}
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground">Deposit Threshold ($)</label>
                                    <input type="number" value={tier.depositThreshold} onChange={e => handleVipChange(index, 'depositThreshold', e.target.value)} className="w-full bg-secondary rounded p-2 mt-1" />
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground">Concurrent Trade Limit</label>
                                    <input type="text" value={tier.tradeLimit} onChange={e => handleVipChange(index, 'tradeLimit', e.target.value)} className="w-full bg-secondary rounded p-2 mt-1" placeholder="e.g., 5 or unlimited" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
                
                <div className="bg-card p-6 rounded-xl shadow-md mt-8">
                    <h2 className="text-xl font-bold mb-4">Homepage Action Items</h2>
                    <p className="text-sm text-muted-foreground mb-4">Customize the quick action buttons on the user homepage. Available icons: CreditCard, Download, Scale, Headset, Gift, Users, MessageSquare, ShieldCheck.</p>
                    <div className="space-y-4">
                        {settings.homepageActionItems?.map((item, index) => (
                            <div key={item.id} className="p-4 border border-border rounded-lg grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="md:col-span-2 flex items-center gap-4">
                                    <input type="number" value={item.order} onChange={e => handleChangeActionItem(index, 'order', e.target.value)} className="w-16 bg-secondary rounded p-2" title="Order"/>
                                    <input type="text" value={item.label} onChange={e => handleChangeActionItem(index, 'label', e.target.value)} className="flex-grow bg-secondary rounded p-2" placeholder="Label"/>
                                    <label className="flex items-center gap-2 cursor-pointer">
                                        <input type="checkbox" checked={item.enabled} onChange={e => handleChangeActionItem(index, 'enabled', e.target.checked)} className="form-checkbox h-5 w-5 rounded text-primary bg-secondary border-transparent focus:ring-primary"/>
                                        <span className="text-sm">Enabled</span>
                                    </label>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground">Icon Name</label>
                                    <input type="text" value={item.icon} onChange={e => handleChangeActionItem(index, 'icon', e.target.value)} className="w-full bg-secondary rounded p-2 mt-1" placeholder="Icon Name"/>
                                </div>
                                <div>
                                    <label className="text-xs text-muted-foreground">Path/URL</label>
                                    <input type="text" value={item.path} onChange={e => handleChangeActionItem(index, 'path', e.target.value)} className="w-full bg-secondary rounded p-2 mt-1" placeholder="Path or URL"/>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-xs text-muted-foreground">State (JSON for internal paths)</label>
                                    <textarea value={item.state || ''} onChange={e => handleChangeActionItem(index, 'state', e.target.value)} className="w-full bg-secondary rounded p-2 mt-1 font-mono text-xs" rows={2} placeholder='e.g., {"view": "deposit"}'/>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {message && <p className={`mt-4 text-sm ${message.type === 'success' ? 'text-success' : 'text-destructive'}`}>{message.text}</p>}
                <button type="submit" className="mt-6 px-5 py-2.5 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition">Save All Settings</button>
            </form>

            <ConfirmActionModal 
                isOpen={isConfirmOpen} 
                onClose={() => setIsConfirmOpen(false)} 
                onConfirm={onConfirmSave} 
                title="Confirm Settings Update"
            >
                <p>Are you sure you want to update the system settings? This may affect all users.</p>
            </ConfirmActionModal>
        </div>
    );
};

const AdminSidebar = () => {
    const { logout } = useAuth();
    const navigate = useNavigate();
    const NavItem = ({ to, icon, label }: { to:string, icon:React.ReactNode, label:string }) => {
         return <NavLink to={to} end className={({isActive}) => `flex items-center space-x-3 px-3 py-3 rounded-lg transition-colors ${isActive ? "bg-primary text-primary-foreground font-semibold shadow-lg" : "text-muted-foreground hover:bg-secondary"}`}>
            {icon}<span>{label}</span>
        </NavLink>
    };

    return (
        <aside className="w-64 bg-card p-4 flex-col border-r border-border hidden md:flex">
            <div className="flex items-center space-x-2 mb-10"><div className="w-10 h-10 rounded-lg bg-gradient-to-tr from-purple-600 to-blue-500"></div><h2 className="text-xl font-bold">Fortress</h2></div>
            <nav className="flex-1 space-y-2">
                <NavItem to="/admin" icon={<LayoutDashboard size={20} />} label="Dashboard" />
                <NavItem to="/admin/users" icon={<Users size={20} />} label="Users" />
                <NavItem to="/admin/kyc" icon={<UserCheck size={20} />} label="KYC Queue" />
                <NavItem to="/admin/orders" icon={<ListOrdered size={20} />} label="All Orders" />
                <NavItem to="/admin/trades" icon={<Repeat size={20} />} label="Trade History" />
                <NavItem to="/admin/trade-control" icon={<Swords size={20} />} label="Trade Control" />
                <NavItem to="/admin/settings" icon={<Settings size={20} />} label="System Settings" />
            </nav>
            <div className="mt-auto space-y-2"><button onClick={() => navigate('/')} className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-muted-foreground hover:bg-secondary"><Home size={20} /><span>Back to App</span></button><button onClick={logout} className="w-full flex items-center space-x-3 px-3 py-3 rounded-lg text-destructive hover:bg-destructive/10"><LogOut size={20} /><span>Log Out</span></button></div>
        </aside>
    );
};

const AdminScreen = () => {
    return (
        <div className="flex min-h-screen bg-background text-foreground">
            <AdminSidebar />
            <main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto">
                <Routes>
                    <Route index element={<DashboardView />} />
                    <Route path="users" element={<UsersView />} />
                    <Route path="kyc" element={<KycView />} />
                    <Route path="orders" element={<OrdersView />} />
                    <Route path="trades" element={<TradesView />} />
                    <Route path="trade-control" element={<TradeControlView />} />
                    <Route path="settings" element={<SettingsView />} />
                </Routes>
            </main>
        </div>
    );
};

export default AdminScreen;