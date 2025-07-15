
import * as React from 'react';
import { X } from 'lucide-react';
import type { Transaction } from '../types.ts';

interface TradeDetailModalProps {
    isOpen: boolean;
    onClose: () => void;
    trade: Transaction | null;
}

const TradeDetailModal = ({ isOpen, onClose, trade }: TradeDetailModalProps) => {
    if (!isOpen || !trade) return null;

    const formatDate = (isoString?: string) => {
        if (!isoString) return 'N/A';
        const date = new Date(isoString);
        return date.toLocaleString('en-US', {
            year: 'numeric', month: '2-digit', day: '2-digit',
            hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false
        }).replace(',', '');
    };

    const DetailRow = ({ label, value, valueClassName = 'text-foreground' }: { label: string; value: React.ReactNode; valueClassName?: string; }) => (
        <div className="flex justify-between items-center py-2.5">
            <span className="text-muted-foreground">{label}</span>
            <span className={`font-semibold ${valueClassName}`}>{value}</span>
        </div>
    );
    
    const isLong = trade.direction === 'Buy';
    const pnlColor = (trade.profit ?? 0) >= 0 ? 'text-success' : 'text-destructive';

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-popover text-popover-foreground rounded-lg p-6 w-full max-w-md mx-4" onClick={e => e.stopPropagation()}>
                <header className="flex justify-between items-center relative pb-4 border-b border-border">
                    <div>
                        <h2 className="text-xl font-bold">{trade.pair?.replace('-', '/')}</h2>
                        <span className={`text-sm font-bold ${isLong ? 'text-success' : 'text-destructive'}`}>
                            {isLong ? 'Long' : 'Short'}
                        </span>
                    </div>
                    <button onClick={onClose} className="p-1 text-muted-foreground hover:text-foreground">
                        <X size={24} />
                    </button>
                </header>

                <main className="mt-4 text-sm divide-y divide-border">
                    <DetailRow label="Entry Time" value={formatDate(trade.date)} />
                    <DetailRow label="Entry Price" value={`$${trade.entryPrice?.toFixed(4) ?? 'N/A'}`} />
                    <DetailRow label="Exit Time" value={formatDate(trade.endTime)} />
                    <DetailRow label="Exit Price" value={`$${trade.exitPrice?.toFixed(4) ?? 'N/A'}`} />
                    <DetailRow label="Stake" value={`$${trade.stake?.toLocaleString() ?? 'N/A'}`} />
                    <DetailRow label="Commission" value={`$${trade.commission?.toFixed(2) ?? 'N/A'}`} />
                    <DetailRow 
                        label="Profit / Loss" 
                        value={`${(trade.profit ?? 0) >= 0 ? '+' : ''}$${trade.profit?.toFixed(2) ?? 'N/A'}`} 
                        valueClassName={`text-lg ${pnlColor}`} 
                    />
                </main>
            </div>
        </div>
    );
};

export default TradeDetailModal;
