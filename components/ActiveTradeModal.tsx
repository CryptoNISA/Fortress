
import * as React from 'react';
import { X } from 'lucide-react';

interface ActiveTradeDetails {
    pair: string;
    direction: 'Buy' | 'Sell';
    stake: number;
    expectedProfit: number;
    entryPrice: number;
}

interface ActiveTradeModalProps {
    isOpen: boolean;
    onClose: () => void;
    tradeDetails: ActiveTradeDetails | null;
    timeLeft: number;
    livePrice: number;
}

const DigitBox = ({ digit }: { digit: string }) => (
    <div className="bg-accent-gold text-slate-900 p-3 sm:p-4 rounded-md text-4xl sm:text-5xl font-bold leading-none flex items-center justify-center">
        {digit}
    </div>
);

const ActiveTradeModal = ({ isOpen, onClose, tradeDetails, timeLeft, livePrice }: ActiveTradeModalProps) => {
    if (!isOpen || !tradeDetails) return null;

    const formatTime = (seconds: number) => {
        const minutes = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
    };
    
    const isPriceUp = livePrice >= tradeDetails.entryPrice;

    const [minutesStr, secondsStr] = formatTime(timeLeft).split(':');
    const directionColor = tradeDetails.direction === 'Buy' ? 'text-success' : 'text-destructive';
    const priceColor = isPriceUp ? 'text-success' : 'text-destructive';

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-popover text-popover-foreground rounded-lg p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                <header className="flex justify-center items-center relative mb-6">
                    <h2 className="text-xl font-semibold">{tradeDetails.pair.replace('-', '/')}</h2>
                    <button onClick={onClose} className="absolute right-0 p-1 text-muted-foreground hover:text-foreground">
                        <X size={24} />
                    </button>
                </header>

                <main className="space-y-6">
                    {/* Live Price */}
                    <div className="text-center">
                        <p className="text-sm text-muted-foreground">Now Price</p>
                        <p className={`text-4xl font-bold ${priceColor}`}>{livePrice.toFixed(2)}</p>
                    </div>

                    {/* Countdown Timer */}
                    <div className="flex justify-center items-center gap-1">
                        <DigitBox digit={minutesStr[0]} />
                        <DigitBox digit={minutesStr[1]} />
                        <span className="text-4xl font-bold text-accent-gold mx-1">:</span>
                        <DigitBox digit={secondsStr[0]} />
                        <DigitBox digit={secondsStr[1]} />
                    </div>

                    {/* Trade Summary */}
                    <div className="text-sm border-t border-border pt-4">
                        <div className="grid grid-cols-3 text-muted-foreground font-semibold text-center">
                            <span>Direct</span>
                            <span>Amount</span>
                            <span>Expected Profit</span>
                        </div>
                        <div className="grid grid-cols-3 text-foreground font-medium text-center mt-1">
                            <span className={directionColor}>{tradeDetails.direction}</span>
                            <span>{Number(tradeDetails.stake).toLocaleString()}</span>
                            <span>{tradeDetails.expectedProfit.toFixed(2)}</span>
                        </div>
                    </div>
                </main>

                <footer className="mt-8">
                    <button onClick={onClose} className="w-full bg-accent-gold text-slate-900 font-bold py-3 rounded-lg text-lg hover:opacity-90 transition-opacity">
                        Close
                    </button>
                </footer>
            </div>
        </div>
    );
};

export default ActiveTradeModal;