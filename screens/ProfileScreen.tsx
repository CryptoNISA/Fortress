import * as React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ChevronRight, Bell, Lock, CreditCard, Download, Repeat, ArrowLeft, HelpCircle, Mail, Users, LogOut, AlertCircle, Loader, Camera, ShieldCheck, CheckCircle2, Clock, XCircle, ArrowDownLeft, ArrowUpRight, MailCheck, Copy, Info, BookOpen, Headset, Palette, Sun, Moon, SunMoon } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext.tsx';
import type { User, Transaction, KYCStatus, Notification } from '../types.ts';
import { useTheme } from '../contexts/ThemeContext.tsx';
import type { Theme } from '../contexts/ThemeContext.tsx';

// --- Reusable Components & Helpers ---

const toBase64 = (file: File): Promise<string> => new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
});

const FormInput = ({ id, label, type = 'text', value, onChange, placeholder = '', required = true, nameProp }: {
    id: string;
    label: string;
    type?: string;
    value: string;
    onChange: React.ChangeEventHandler<HTMLInputElement>;
    placeholder?: string;
    required?: boolean;
    nameProp?: string;
}) => (
    <div>
        <label htmlFor={id} className="block text-sm font-medium text-muted-foreground">{label}</label>
        <input
            type={type}
            id={id}
            name={nameProp || id}
            value={value}
            onChange={onChange}
            placeholder={placeholder}
            required={required}
            className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-ring"
        />
    </div>
);

const CountrySelect = ({ id, value, onChange }: { id: string; value: string; onChange: React.ChangeEventHandler<HTMLSelectElement> }) => {
    const countries = [ "Brazil", "United States", "Canada", "United Kingdom", "Germany", "France", "Japan", "Australia", "India", "Mexico", "Argentina", "South Korea" ];
    return (
        <div>
            <label htmlFor={id} className="block text-sm font-medium text-muted-foreground">Country</label>
            <select
                id={id}
                name={id}
                value={value}
                onChange={onChange}
                required
                className="mt-1 block w-full px-3 py-2 bg-background border border-border rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-ring"
            >
                <option value="">Select a country</option>
                {countries.map(country => <option key={country} value={country}>{country}</option>)}
            </select>
        </div>
    );
};


const KycStatusBadge = ({ status, onClick }: { status: KYCStatus; onClick?: () => void }) => {
    const statusInfo = {
        verified: { Icon: CheckCircle2, text: 'Verified', className: 'bg-success/10 text-success' },
        pending: { Icon: Clock, text: 'Pending Review', className: 'bg-warning/10 text-warning' },
        unverified: { Icon: AlertCircle, text: 'Unverified', className: 'bg-secondary text-secondary-foreground' },
        rejected: { Icon: XCircle, text: 'Rejected', className: 'bg-destructive/20 text-destructive' },
    }[status];

    const Tag = onClick ? 'button' : 'span';

    return (
        <Tag
            onClick={onClick}
            className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold tracking-wide ${statusInfo.className} ${onClick ? 'hover:opacity-80 transition-opacity' : ''}`}
        >
            <statusInfo.Icon size={14} className="mr-1.5" />
            {statusInfo.text}
        </Tag>
    );
};

const ProfileCard = ({ user, onKycClick }: { user: User; onKycClick: () => void; }) => {
    const { updateUserPhoto, isLoading } = useAuth();
    const fileInputRef = React.useRef<HTMLInputElement>(null);
    const [copied, setCopied] = React.useState(false);

    const handlePhotoClick = () => fileInputRef.current?.click();

    const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file) {
            try {
                await updateUserPhoto(file);
            } catch (error) {
                console.error("Failed to upload photo", error);
            }
        }
    };
    
    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000); // Reset after 2 seconds
    };

    return (
        <div className="p-4 bg-card rounded-2xl shadow-sm dark:shadow-none space-y-4">
            <div className="flex items-center space-x-4">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} accept="image/*" style={{ display: 'none' }} disabled={isLoading} />
                <div className="relative group flex-shrink-0 cursor-pointer" onClick={handlePhotoClick}>
                    <img
                        src={user.photoURL || `https://api.dicebear.com/8.x/initials/svg?seed=${user.name}`}
                        alt="User"
                        className="w-20 h-20 rounded-full border-4 border-border bg-secondary p-1 object-cover"
                    />
                    <div className="absolute inset-0 bg-black/60 rounded-full flex items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-opacity">
                        {isLoading ? <Loader size={24} className="animate-spin" /> : <Camera size={24} />}
                    </div>
                </div>
                <div className="flex-1">
                    <h1 className="text-2xl font-bold text-card-foreground flex items-center gap-3">
                        {user.name}
                        <span className="bg-accent-gold text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full">
                            VIP {user.vipLevel}
                        </span>
                    </h1>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                     <div className="mt-2">
                        <KycStatusBadge status={user.kycStatus} onClick={onKycClick} />
                    </div>
                </div>
            </div>
            
             <div className="space-y-3 pt-4 border-t border-border text-sm">
                <div className="flex justify-between items-center">
                     <span className="font-medium text-muted-foreground">User ID</span>
                     <div className="flex items-center gap-2 text-foreground font-mono">
                        <span>{user.uid}</span>
                        <button onClick={() => handleCopy(user.uid)} className="text-muted-foreground hover:text-primary" title="Copy ID">
                            {copied ? <CheckCircle2 size={14} className="text-success" /> : <Copy size={14} />}
                        </button>
                    </div>
                </div>
                 <div className="flex justify-between items-center">
                     <span className="font-medium text-muted-foreground">Total Assets</span>
                     <span className="font-semibold text-lg text-foreground">
                         ${user.portfolio.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                         <span className="text-sm font-medium text-muted-foreground ml-1">USDT</span>
                     </span>
                </div>
            </div>
        </div>
    );
};


const MenuItem = ({ icon, label, onClick, badge }: { icon: React.ReactNode; label: string; onClick: () => void; badge?: number; }) => (
    <button onClick={onClick} className="w-full flex items-center justify-between p-4 bg-card rounded-lg hover:bg-secondary transition-colors shadow-sm dark:shadow-none">
        <div className="flex items-center space-x-4">
            {icon}
            <span className="font-medium text-card-foreground">{label}</span>
        </div>
        <div className="flex items-center space-x-3">
            {badge !== undefined && badge > 0 && (
                <span className="bg-primary text-primary-foreground text-xs font-bold w-6 h-6 flex items-center justify-center rounded-full">{badge}</span>
            )}
            <ChevronRight size={20} className="text-muted-foreground" />
        </div>
    </button>
);


const ViewContainer = ({ title, onBack, children }: { title: string; onBack: () => void; children: React.ReactNode }) => (
    <div className="animate-fade-in">
        <header className="flex items-center mb-6">
            <button onClick={onBack} className="p-2 mr-2 rounded-full hover:bg-secondary">
                <ArrowLeft size={24} />
            </button>
            <h2 className="text-2xl font-bold">{title}</h2>
        </header>
        {children}
    </div>
);

// --- Sub-Views ---

const ProfileView = ({ user, setView, onLogout, isAdmin }: { user: User, setView: (view: string) => void, onLogout: () => void, isAdmin: boolean }) => {
    const navigate = useNavigate();
    const unreadCount = user.notifications.filter(n => !n.read).length;

    return (
        <div className="space-y-6 animate-fade-in">
            <ProfileCard user={user} onKycClick={() => setView('kyc')} />

            {isAdmin && (
                 <div className="pt-4">
                    <MenuItem icon={<ShieldCheck size={20} className="text-primary"/>} label="Admin Panel" onClick={() => navigate('/admin')} />
                </div>
            )}

            <div className="space-y-2">
                <MenuItem icon={<CreditCard size={20} />} label="Deposit" onClick={() => setView('deposit')} />
                <MenuItem icon={<Download size={20} />} label="Withdraw" onClick={() => setView('withdraw')} />
                <MenuItem icon={<Repeat size={20} />} label="Order Management" onClick={() => navigate('/order-management')} />
            </div>
            <div className="space-y-2">
                <MenuItem icon={<ShieldCheck size={20} />} label="Identity Verification" onClick={() => setView('kyc')} />
                <MenuItem icon={<Bell size={20} />} label="Notifications" onClick={() => setView('notifications')} badge={unreadCount} />
                <MenuItem icon={<Lock size={20} />} label="Security Settings" onClick={() => navigate('/security')} />
                <MenuItem icon={<Palette size={20} />} label="Appearance" onClick={() => setView('appearance')} />
            </div>
            <div className="space-y-2">
                 <MenuItem icon={<BookOpen size={20} />} label="Investment Guide" onClick={() => navigate('/investment-guide')} />
                 <MenuItem icon={<Info size={20} />} label="About Fortress" onClick={() => navigate('/about')} />
                 <MenuItem icon={<Headset size={20} />} label="Customer Service" onClick={() => window.open('https://t.me/FortressInvestmentSupport', '_blank', 'noopener,noreferrer')} />
                 <MenuItem icon={<Users size={20} />} label="Refer Friends" onClick={() => navigate('/referral')} />
                 <MenuItem icon={<LogOut size={20} className="text-destructive"/>} label="Log Out" onClick={onLogout} />
            </div>
        </div>
    );
};

const KycView = ({ user, onBack }: { user: User, onBack: () => void }) => {
    const { submitKyc, isLoading } = useAuth();
    const [formData, setFormData] = React.useState({
        fullName: user.fullName || user.name || '',
        dateOfBirth: user.dateOfBirth || '',
        country: user.country || '',
        address: user.address || '',
    });
    const [idFront, setIdFront] = React.useState<File | null>(null);
    const [idBack, setIdBack] = React.useState<File | null>(null);
    const [error, setError] = React.useState('');

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>, setter: React.Dispatch<React.SetStateAction<File | null>>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setter(file);
        } else {
            e.target.value = '';
            setter(null);
            alert("Please select a valid image file.");
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        if (!idFront || !idBack) {
            setError('Please upload images of the front and back of your ID.');
            return;
        }
        try {
            const idFrontBase64 = await toBase64(idFront);
            const idBackBase64 = await toBase64(idBack);
            await submitKyc({ ...formData, idFrontBase64, idBackBase64 });
            onBack(); // Go back after successful submission
        } catch (err) {
            setError(err instanceof Error ? err.message : 'An error occurred.');
        }
    };
    
    if (user.kycStatus === 'verified') {
        return (
            <ViewContainer title="Identity Verification" onBack={onBack}>
                <div className="text-center p-8 bg-card rounded-lg">
                    <CheckCircle2 size={64} className="mx-auto text-success" />
                    <h3 className="mt-4 text-xl font-bold">You're Verified!</h3>
                    <p className="mt-2 text-muted-foreground">Your identity has been successfully verified. You have full access to all features.</p>
                </div>
            </ViewContainer>
        );
    }
    
    if (user.kycStatus === 'pending') {
        return (
             <ViewContainer title="Identity Verification" onBack={onBack}>
                <div className="text-center p-8 bg-card rounded-lg">
                    <Clock size={64} className="mx-auto text-warning" />
                    <h3 className="mt-4 text-xl font-bold">Verification Pending</h3>
                    <p className="mt-2 text-muted-foreground">Your documents are under review. This usually takes 1-3 business days. We'll notify you once it's complete.</p>
                </div>
            </ViewContainer>
        );
    }

    return (
        <ViewContainer title="Identity Verification" onBack={onBack}>
            <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-card rounded-lg">
                <p className="text-sm text-muted-foreground">Please provide your legal information as it appears on your government-issued ID.</p>
                
                {user.kycStatus === 'rejected' && (
                    <div className="p-3 bg-destructive/10 text-destructive rounded-lg">
                        Your previous submission was rejected. Please review your information and try again.
                    </div>
                )}

                <FormInput id="fullName" label="Full Legal Name" value={formData.fullName} onChange={e => setFormData({...formData, fullName: e.target.value})} placeholder="Your full legal name" />
                <FormInput id="dateOfBirth" label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={e => setFormData({...formData, dateOfBirth: e.target.value})} />
                <CountrySelect id="country" value={formData.country} onChange={e => setFormData({...formData, country: e.target.value})} />
                <FormInput id="address" label="Residential Address" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} placeholder="123 Crypto Lane" />

                <div>
                    <label className="block text-sm font-medium text-muted-foreground">ID Front</label>
                    <input type="file" accept="image/*" onChange={e => handleFileChange(e, setIdFront)} className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 w-full text-muted-foreground" />
                </div>
                <div>
                    <label className="block text-sm font-medium text-muted-foreground">ID Back</label>
                    <input type="file" accept="image/*" onChange={e => handleFileChange(e, setIdBack)} className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 w-full text-muted-foreground" />
                </div>
                
                {error && <p className="text-sm text-destructive">{error}</p>}
                
                <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50">
                    {isLoading ? <Loader className="animate-spin" /> : 'Submit for Verification'}
                </button>
            </form>
        </ViewContainer>
    );
};

const DepositView = ({ onBack }: { onBack: () => void; }) => {
    const { deposit, isLoading, systemSettings } = useAuth();
    const [network, setNetwork] = React.useState<'TRC20' | 'ERC20' | 'BTC'>('TRC20');
    const [amount, setAmount] = React.useState('');
    const [txProof, setTxProof] = React.useState<File | null>(null);
    const [txProofPreview, setTxProofPreview] = React.useState<string | null>(null);
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    const [copied, setCopied] = React.useState(false);

    const networks = React.useMemo(() => {
        if (!systemSettings) return null;
        return {
            'TRC20': { name: 'TRC20 (USDT)', address: systemSettings.depositAddressTrc20, asset: 'USDT' },
            'ERC20': { name: 'ERC20 (USDT)', address: systemSettings.depositAddressErc20, asset: 'USDT' },
            'BTC': { name: 'Bitcoin', address: systemSettings.depositAddressBtc, asset: 'BTC' },
        };
    }, [systemSettings]);

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file && file.type.startsWith('image/')) {
            setTxProof(file);
            setTxProofPreview(URL.createObjectURL(file));
        } else {
            if(file) alert("Please select a valid image file.");
            e.target.value = '';
            setTxProof(null);
            setTxProofPreview(null);
        }
    };
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!amount || parseFloat(amount) <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (!txProof) {
            setError('Please upload a transaction proof screenshot.');
            return;
        }

        try {
            const proofBase64 = await toBase64(txProof);
            await deposit({
                amount: parseFloat(amount),
                network,
                asset: networks![network].asset,
                transactionProof: proofBase64
            });
            setSuccess('Deposit submitted successfully! It will be reviewed shortly.');
            setAmount('');
            setTxProof(null);
            setTxProofPreview(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Deposit submission failed.');
        }
    };

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    if (!networks) {
        return (
            <ViewContainer title="Deposit Funds" onBack={onBack}>
                <div className="flex justify-center items-center h-64">
                    <Loader className="animate-spin" size={32} />
                </div>
            </ViewContainer>
        );
    }
    
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=${encodeURIComponent(networks[network].address)}`;

    return (
        <ViewContainer title="Deposit Funds" onBack={onBack}>
            <div className="space-y-6 p-4 bg-card rounded-lg">
                <div>
                    <label className="block text-sm font-medium text-muted-foreground">Select Network</label>
                    <div className="mt-2 grid grid-cols-3 gap-2 rounded-lg bg-secondary p-1">
                        {Object.keys(networks).map((net) => (
                            <button
                                key={net}
                                onClick={() => setNetwork(net as 'TRC20' | 'ERC20' | 'BTC')}
                                className={`px-3 py-2 text-sm font-semibold rounded-md transition-colors ${network === net ? 'bg-card text-card-foreground shadow-sm' : 'text-muted-foreground hover:bg-card/50'}`}
                            >
                                {networks[net as keyof typeof networks].name}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="p-4 border border-dashed border-border rounded-lg text-center">
                    <p className="text-xs text-muted-foreground mb-4">Send only {networks[network].asset} to this address.</p>
                    
                    <div className="flex justify-center my-4">
                        <img src={qrCodeUrl} alt={`${networks[network].name} QR Code`} className="rounded-lg border-4 border-border p-1 bg-white"/>
                    </div>
                    
                    <div className="bg-secondary p-3 rounded-md">
                        <p className="text-sm font-mono break-all text-foreground">{networks[network].address}</p>
                    </div>
                    <button 
                      onClick={() => handleCopy(networks[network].address)}
                      className="mt-4 flex items-center justify-center gap-2 mx-auto text-xs font-semibold text-primary hover:underline"
                    >
                      {copied ? <CheckCircle2 size={14} className="text-success" /> : <Copy size={14} />}
                      {copied ? 'Address Copied!' : 'Copy Address'}
                    </button>
                </div>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                     <FormInput
                        id="amount"
                        label={`Amount (${networks[network].asset})`}
                        type="number"
                        value={amount}
                        onChange={e => setAmount(e.target.value)}
                        placeholder="0.00"
                    />
                     <div>
                        <label className="block text-sm font-medium text-muted-foreground">Transaction Proof</label>
                        <p className="text-xs text-muted-foreground mb-2">Upload a screenshot of your transaction confirmation.</p>
                         <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleFileChange} 
                            className="mt-1 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-primary/10 file:text-primary hover:file:bg-primary/20 w-full text-muted-foreground" 
                        />
                         {txProofPreview && (
                            <div className="mt-4">
                               <img src={txProofPreview} alt="Transaction proof preview" className="rounded-lg max-h-48 w-auto mx-auto border border-border"/>
                            </div>
                         )}
                    </div>

                    {error && <p className="text-sm text-destructive">{error}</p>}
                    {success && <p className="text-sm text-success">{success}</p>}

                    <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50">
                        {isLoading ? <Loader className="animate-spin" /> : 'Submit Deposit'}
                    </button>
                </form>

            </div>
        </ViewContainer>
    );
};

const WithdrawView = ({ onBack }: { onBack: () => void; }) => {
    const { withdraw, user, isLoading } = useAuth();
    const [password, setPassword] = React.useState('');
    const [amount, setAmount] = React.useState('');
    const [address, setAddress] = React.useState('');
    const [error, setError] = React.useState('');
    const [success, setSuccess] = React.useState('');
    
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        try {
            await withdraw(password, { amount: parseFloat(amount), address, asset: 'USDT' });
            setSuccess(`Withdrawal request for ${amount} USDT submitted for review.`);
            setPassword(''); setAmount(''); setAddress('');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Withdrawal failed.');
        }
    };
    
    if (!user || user.kycStatus !== 'verified') {
       return (
            <ViewContainer title="Withdraw Funds" onBack={onBack}>
                <div className="p-4 bg-warning/10 text-warning rounded-lg">
                    <AlertCircle className="inline mr-2" />
                    Please verify your identity before making a withdrawal.
                </div>
            </ViewContainer>
        );
    }
    
    return (
        <ViewContainer title="Withdraw Funds" onBack={onBack}>
            <form onSubmit={handleSubmit} className="space-y-4 p-4 bg-card rounded-lg">
                <FormInput id="amount" label="Amount (USDT)" type="number" value={amount} onChange={e => setAmount(e.target.value)} placeholder="0.00" />
                <FormInput id="address" label="Withdrawal Address (USDT)" value={address} onChange={e => setAddress(e.target.value)} placeholder="0x..." />
                <FormInput id="password" label="Confirm Password" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                
                {error && <p className="text-sm text-destructive">{error}</p>}
                {success && <p className="text-sm text-success">{success}</p>}
                
                 <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50">
                    {isLoading ? <Loader className="animate-spin" /> : 'Submit Withdrawal'}
                </button>
            </form>
        </ViewContainer>
    );
};

const NotificationsView = ({ user, onBack }: { user: User; onBack: () => void; }) => {
    const { markAllNotificationsAsRead, markNotificationAsRead, isLoading } = useAuth();

    const handleMarkAllRead = async () => {
        if (user.notifications.some(n => !n.read)) {
            await markAllNotificationsAsRead();
        }
    };
    
    const handleMarkOneRead = (notificationId: string) => {
        const notification = user.notifications.find(n => n.id === notificationId);
        if (notification && !notification.read) {
             markNotificationAsRead(notificationId);
        }
    }

    const sortedNotifications = [...user.notifications].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    
    const notificationIcons = {
        transaction: <Repeat size={24} className="text-blue-500" />,
        security: <ShieldCheck size={24} className="text-yellow-500" />,
        system: <Bell size={24} className="text-primary" />,
    };

    return (
        <ViewContainer title="Notifications" onBack={onBack}>
            <div className="mb-4 flex justify-end">
                <button 
                    onClick={handleMarkAllRead}
                    disabled={isLoading || !user.notifications.some(n => !n.read)}
                    className="flex items-center px-3 py-1.5 bg-secondary text-secondary-foreground rounded-md text-sm font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    <MailCheck size={16} className="mr-2"/>
                    Mark all as read
                </button>
            </div>
            <div className="space-y-3">
                {sortedNotifications.length > 0 ? (
                    sortedNotifications.map(notification => (
                        <div 
                            key={notification.id} 
                            onClick={() => handleMarkOneRead(notification.id)}
                            className={`relative p-4 pl-8 bg-card rounded-lg flex items-start space-x-4 border-l-4 transition-colors ${!notification.read ? 'border-primary cursor-pointer hover:bg-secondary' : 'border-transparent'}`}
                        >
                            {!notification.read && <div className="absolute left-2 top-1/2 -translate-y-1/2 w-2 h-2 bg-primary rounded-full animate-pulse"></div>}
                            <div className="flex-shrink-0 pt-1">
                                {notificationIcons[notification.type]}
                            </div>
                            <div className="flex-grow">
                                <p className={`font-bold ${!notification.read ? 'text-card-foreground' : 'text-muted-foreground'}`}>{notification.title}</p>
                                <p className={`text-sm mt-1 ${!notification.read ? 'text-foreground' : 'text-muted-foreground'}`}>{notification.message}</p>
                                <p className="text-xs text-muted-foreground mt-2">{new Date(notification.date).toLocaleString()}</p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center p-8 bg-card rounded-lg">
                        <Bell size={48} className="mx-auto text-muted-foreground" />
                        <h3 className="mt-4 text-xl font-bold">You're all caught up!</h3>
                        <p className="mt-2 text-muted-foreground">You have no new notifications.</p>
                    </div>
                )}
            </div>
        </ViewContainer>
    );
};

const AppearanceView = ({ onBack }: { onBack: () => void; }) => {
    const { theme, setTheme } = useTheme();

    const themeOptions = [
        { value: 'light', label: 'Light', icon: <Sun size={20} /> },
        { value: 'dark', label: 'Dark', icon: <Moon size={20} /> },
        { value: 'system', label: 'System', icon: <SunMoon size={20} /> },
    ];
    
    return (
        <ViewContainer title="Appearance" onBack={onBack}>
            <div className="space-y-2">
                <p className="text-muted-foreground text-sm p-4">Choose how Fortress looks to you. Select a theme or sync with your system.</p>
                {themeOptions.map(option => (
                     <button
                        key={option.value}
                        onClick={() => setTheme(option.value as Theme)}
                        className={`w-full flex items-center justify-between p-4 bg-card rounded-lg text-left transition-colors ${theme === option.value ? 'ring-2 ring-primary' : 'hover:bg-secondary'}`}
                    >
                         <div className="flex items-center gap-4">
                            {option.icon}
                            <span className="font-medium text-card-foreground">{option.label}</span>
                        </div>
                        {theme === option.value && <CheckCircle2 size={20} className="text-primary" />}
                    </button>
                ))}
            </div>
        </ViewContainer>
    );
};


const LoginSignupForm = () => {
  const [isLogin, setIsLogin] = React.useState(true);
  const location = useLocation();
  const [formData, setFormData] = React.useState({ name: '', email: '', password: '', dateOfBirth: '', country: '', address: '', referralCode: '' });
  const [error, setError] = React.useState('');
  const { login, signup, isLoading } = useAuth();
  const { theme, setTheme } = useTheme();

  React.useEffect(() => {
    const params = new URLSearchParams(location.search);
    const refCode = params.get('ref');
    if (refCode) {
        setFormData(prev => ({ ...prev, referralCode: refCode.toUpperCase() }));
        setIsLogin(false);
    }
  }, [location.search]);
  
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
        if (isLogin) {
            await login(formData.email, formData.password);
        } else {
            await signup(formData.name, formData.email, formData.password, { 
                dateOfBirth: formData.dateOfBirth, 
                country: formData.country, 
                address: formData.address 
            }, formData.referralCode);
        }
    } catch (err) {
        setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    }
  };

  const toggleTheme = () => {
    const newTheme = theme === 'light' ? 'dark' : 'light';
    setTheme(newTheme);
  };

  return (
    <div className="max-w-md mx-auto mt-10 p-8 bg-card rounded-2xl shadow-xl animate-fade-in relative">
        <button onClick={toggleTheme} className="absolute top-4 right-4 p-2 rounded-full hover:bg-secondary text-muted-foreground hover:text-foreground">
            {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
        </button>
        <h2 className="text-3xl font-bold text-center mb-2 text-card-foreground">{isLogin ? 'Welcome Back' : 'Create Account'}</h2>
        <p className="text-center text-muted-foreground mb-6">{isLogin ? 'Log in to continue your trading journey.' : 'Join the future of finance.'}</p>
        <form onSubmit={handleSubmit} className="space-y-6">
            {!isLogin && <FormInput id="name" label="Full Name" value={formData.name} onChange={handleChange} placeholder="Alex Johnson" />}
            <FormInput id="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} placeholder="you@example.com" />
            <FormInput id="password" label="Password" type="password" value={formData.password} onChange={handleChange} placeholder="••••••••" />
            {!isLogin && (
                <>
                    <FormInput id="dateOfBirth" label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={handleChange} />
                    <CountrySelect id="country" value={formData.country} onChange={handleChange} />
                    <FormInput id="address" label="Residential Address" value={formData.address} onChange={handleChange} placeholder="123 Crypto Lane" />
                    <FormInput
                        id="referralCode"
                        nameProp="referralCode"
                        label="Referral Code (Optional)"
                        value={formData.referralCode}
                        onChange={handleChange}
                        placeholder="Enter referral code"
                        required={false}
                    />
                </>
            )}
            
            {error && <p className="text-sm text-center text-destructive">{error}</p>}
            
            <button type="submit" disabled={isLoading} className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-primary-foreground bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-ring disabled:opacity-50">
                 {isLoading ? <Loader className="animate-spin" /> : (isLogin ? 'Log In' : 'Sign Up')}
            </button>
        </form>
        <p className="mt-6 text-center text-sm text-muted-foreground">
            {isLogin ? "Don't have an account?" : "Already have an account?"}
            <button onClick={() => { setIsLogin(!isLogin); setError(''); }} className="ml-1 font-medium text-primary hover:text-primary/80">
                {isLogin ? 'Sign up' : 'Log in'}
            </button>
        </p>
    </div>
  );
};

// --- Main Component ---

const ProfileScreen = () => {
    const { user, isLoggedIn, logout, isAdmin } = useAuth();
    const location = useLocation();
    const navigate = useNavigate();
    const [view, setView] = React.useState('main');

    // --- Back Button Handling Logic ---
    React.useEffect(() => {
        const handlePopState = () => {
            if (view !== 'main') {
                setView('main');
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [view]);

    const changeView = (newView: string) => {
        if (view === 'main' && newView !== 'main') {
            window.history.pushState({ view: newView }, '');
        }
        setView(newView);
    };

    const goBack = () => {
        window.history.back();
    };
    // --- End Back Button Logic ---

    React.useEffect(() => {
        if (location.state?.view) {
            changeView(location.state.view);
            navigate(location.pathname, { replace: true, state: {} });
        }
    }, [location.state]);


    if (!isLoggedIn || !user) {
        return (
            <div className="p-4">
                <LoginSignupForm />
            </div>
        );
    }

    const renderView = () => {
        switch (view) {
            case 'kyc':
                return <KycView user={user} onBack={goBack} />;
            case 'deposit':
                return <DepositView onBack={goBack} />;
            case 'withdraw':
                return <WithdrawView onBack={goBack} />;
            case 'notifications':
                return <NotificationsView user={user} onBack={goBack} />;
            case 'appearance':
                return <AppearanceView onBack={goBack} />;
            case 'main':
            default:
                return <ProfileView user={user} setView={changeView} onLogout={logout} isAdmin={isAdmin} />;
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8 max-w-4xl mx-auto">
            {renderView()}
        </div>
    );
};

export default ProfileScreen;