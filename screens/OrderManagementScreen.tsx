
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import type { Transaction } from '../types.ts';
import { ArrowLeft, Repeat, Banknote, ArrowUpRight, CheckCircle, Clock, XCircle, ArrowDownLeft } from 'lucide-react';
import TradeDetailModal from '../components/TradeDetailModal.tsx';

// Reusable component for a single transaction item
const TransactionItem = ({ tx, onTradeClick }: { tx: Transaction, onTradeClick: (tx: Transaction) => void }) => {
    const isPositive = tx.type === 'Deposit' || (tx.type === 'Trade' && (tx.amount || 0) >= 0) || (tx.type === 'Admin Adjustment' && (tx.amount || 0) >= 0);
    const isNegative = tx.type === 'Withdrawal' || (tx.type === 'Trade' && (tx.amount || 0) < 0) || (tx.type === 'Admin Adjustment' && (tx.amount || 0) < 0);
    const isTrade = tx.type === 'Trade' && tx.status === 'Completed';

    const getIcon = () => {
        switch (tx.type) {
            case 'Deposit': return <Banknote size={24} className="text-success" />;
            case 'Withdrawal': return <ArrowUpRight size={24} className="text-destructive" />;
            case 'Trade': return isPositive ? <ArrowDownLeft size={24} className="text-success" /> : <ArrowDownLeft size={24} className="text-destructive" />;
            case 'Admin Adjustment': return <Repeat size={24} className="text-primary" />;
            case 'Signup Bonus': return <Banknote size={24} className="text-success" />;
            default: return <Repeat size={24} className="text-muted-foreground" />;
        }
    };
    
    const getStatusInfo = (status: Transaction['status']) => {
        switch (status) {
            case 'Completed': return { Icon: CheckCircle, className: 'text-success' };
            case 'Pending': return { Icon: Clock, className: 'text-warning' };
            case 'Failed': return { Icon: XCircle, className: 'text-destructive' };
            case 'Open': return { Icon: Clock, className: 'text-blue-500' };
            default: return { Icon: Clock, className: 'text-muted-foreground' };
        }
    };
    
    const StatusBadge = ({ status }: { status: Transaction['status'] }) => {
        const { Icon, className } = getStatusInfo(status);
        return (
            <div className={`flex items-center gap-1 text-xs font-semibold ${className}`}>
                <Icon size={14} />
                <span>{status}</span>
            </div>
        );
    };

    const content = (
        <>
            <div className="flex items-center gap-4">
                <div className="flex-shrink-0">{getIcon()}</div>
                <div>
                    <p className="font-bold">{tx.pair || tx.type}</p>
                    <p className="text-xs text-muted-foreground">{new Date(tx.date).toLocaleString()}</p>
                </div>
            </div>
            <div className="text-right">
                <p className={`font-mono font-bold ${isPositive ? 'text-success' : isNegative ? 'text-destructive' : 'text-foreground'}`}>
                    {isPositive && tx.type !== 'Admin Adjustment' ? '+' : ''}{tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 6 })} {tx.asset}
                </p>
                <StatusBadge status={tx.status} />
            </div>
        </>
    );

    const commonClasses = "w-full bg-card p-4 rounded-lg flex items-center justify-between shadow-sm";

    if (isTrade) {
        return (
            <button
                onClick={() => onTradeClick(tx)}
                className={`${commonClasses} hover:bg-secondary transition-colors text-left`}
            >
                {content}
            </button>
        )
    }

    return <div className={commonClasses}>{content}</div>;
};

const OrderManagementScreen = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [filter, setFilter] = React.useState<'all' | 'deposits' | 'withdrawals' | 'trades'>('all');
    const [selectedTrade, setSelectedTrade] = React.useState<Transaction | null>(null);

    const filteredTransactions = React.useMemo(() => {
        if (!user) return [];
        let txs = [...user.transactions];
        
        switch (filter) {
            case 'deposits':
                txs = txs.filter(tx => tx.type === 'Deposit');
                break;
            case 'withdrawals':
                txs = txs.filter(tx => tx.type === 'Withdrawal');
                break;
            case 'trades':
                txs = txs.filter(tx => tx.type === 'Trade');
                break;
        }

        return txs.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    }, [user, filter]);

    const FilterButton = ({ label, value }: { label: string; value: typeof filter }) => (
        <button
            onClick={() => setFilter(value)}
            className={`px-4 py-2 text-sm font-semibold rounded-lg transition-colors ${
                filter === value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
            }`}
        >
            {label}
        </button>
    );

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex items-center gap-4 p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-semibold">Order Management</h1>
            </header>

            <main className="p-4 max-w-5xl mx-auto pb-24">
                <div className="flex items-center gap-2 mb-6 overflow-x-auto pb-2">
                    <FilterButton label="All" value="all" />
                    <FilterButton label="Deposits" value="deposits" />
                    <FilterButton label="Withdrawals" value="withdrawals" />
                    <FilterButton label="Trades" value="trades" />
                </div>
                
                <div className="space-y-3">
                    {filteredTransactions.length > 0 ? (
                        filteredTransactions.map(tx => <TransactionItem key={tx.id} tx={tx} onTradeClick={setSelectedTrade} />)
                    ) : (
                        <div className="text-center text-muted-foreground py-16 bg-card rounded-lg">
                            <p className="font-semibold">No transactions found.</p>
                            <p className="text-sm mt-1">Your transaction history will appear here.</p>
                        </div>
                    )}
                </div>
            </main>

            <TradeDetailModal 
                isOpen={!!selectedTrade}
                onClose={() => setSelectedTrade(null)}
                trade={selectedTrade}
            />
        </div>
    );
};

export default OrderManagementScreen;
