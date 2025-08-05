

import * as React from 'react';
import { X, Trophy, Frown } from 'lucide-react';

interface TradeResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    result: {
        outcome: 'Win' | 'Loss';
        pnl: number;
        stake?: number;
        profitPercentage?: number;
    } | null;
}

const TradeResultModal = ({ isOpen, onClose, result }: TradeResultModalProps) => {
    if (!isOpen || !result) return null;

    const isWin = result.outcome === 'Win';
    const pnlColor = isWin ? 'text-success' : 'text-destructive';
    const bgColor = isWin ? 'bg-success/10' : 'bg-destructive/10';
    const iconColor = isWin ? 'text-success' : 'text-destructive';

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className={`bg-popover text-popover-foreground rounded-lg p-6 w-full max-w-xs mx-4 ${bgColor}`} onClick={e => e.stopPropagation()}>
                <header className="flex justify-end items-center relative mb-4">
                    <button onClick={onClose} className="absolute top-0 right-0 p-1 text-muted-foreground hover:text-foreground">
                        <X size={24} />
                    </button>
                </header>

                <main className="text-center">
                    <div className={`w-24 h-24 mx-auto rounded-full flex items-center justify-center ${iconColor} bg-secondary mb-4`}>
                        {isWin ? <Trophy size={60} /> : <Frown size={60} />}
                    </div>
                    <h2 className={`text-4xl font-bold ${pnlColor}`}>
                        You {result.outcome}
                    </h2>
                    <p className="text-lg text-muted-foreground mt-2">Your Profit / Loss</p>
                    <p className={`text-3xl font-bold mt-1 ${pnlColor}`}>
                        {isWin ? '+' : ''}{result.pnl.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    {isWin && result.stake && result.profitPercentage && (
                        <p className="text-sm text-muted-foreground mt-2">
                            ({result.profitPercentage}% of ${result.stake.toLocaleString()})
                        </p>
                    )}
                </main>
                
                <footer className="mt-8">
                    <button onClick={onClose} className="w-full bg-accent-gold text-slate-900 font-bold py-3 rounded-lg text-lg hover:opacity-90 transition-opacity">
                        Continue Trading
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default TradeResultModal;