
import * as React from 'react';
import { X } from 'lucide-react';

interface PlaceOrderDetails {
    pair: string;
    direction: 'Buy' | 'Sell';
    stake: number;
    settlementDuration: number;
    profitPercentage: number;
    commissionPercentage: number;
}

interface TradeOrderModalProps {
    isOpen: boolean;
    onClose: () => void;
    tradeDirection: 'Buy' | 'Sell';
    pair: string;
    price: number;
    balance: number;
    onPlaceOrder: (details: PlaceOrderDetails) => void;
}

const settlementOptions = [
    { duration: 60, profit: 5, commission: 2, label: '60s' },
    { duration: 200, profit: 25, commission: 4, label: '200s' },
    { duration: 400, profit: 50, commission: 8, label: '400s' },
];


const presetAmounts = [50, 100, 500, 1000];

const TradeOrderModal = ({ isOpen, onClose, tradeDirection, pair, price, balance, onPlaceOrder }: TradeOrderModalProps) => {
    const [selectedSettlement, setSelectedSettlement] = React.useState(settlementOptions[0]);
    const [amount, setAmount] = React.useState<number | string>('');
    const [error, setError] = React.useState('');

    React.useEffect(() => {
        if(isOpen) {
            setError('');
            setAmount('');
        }
    }, [isOpen]);

    const numAmount = Number(amount);
    const commissionAmount = isNaN(numAmount) || numAmount <= 0 ? 0 : (numAmount * (selectedSettlement.commission / 100));
    const totalCost = numAmount + commissionAmount;

    const expectedProfit = React.useMemo(() => {
        if (!isNaN(numAmount) && numAmount > 0) {
            return (numAmount * (selectedSettlement.profit / 100)).toFixed(2);
        }
        return '0.00';
    }, [amount, selectedSettlement]);

    const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        if (value === '' || /^[0-9\b]+$/.test(value)) {
            setAmount(value);
            if (error) setError('');
        }
    }
    
    const handlePurchase = () => {
        setError('');
        if (numAmount <= 0) {
            setError('Please enter a valid amount.');
            return;
        }
        if (balance < totalCost) {
            setError('Insufficient balance to cover stake and fee.');
            return;
        }
        onPlaceOrder({
            pair: pair,
            direction: tradeDirection,
            stake: numAmount,
            settlementDuration: selectedSettlement.duration,
            profitPercentage: selectedSettlement.profit,
            commissionPercentage: selectedSettlement.commission,
        });
    };

    if (!isOpen) return null;
    
    const directionColor = tradeDirection === 'Buy' ? 'text-success' : 'text-destructive';

    return (
        <div className="fixed inset-0 bg-black/70 z-[100] flex items-center justify-center animate-fade-in-fast" onClick={onClose}>
            <div className="bg-popover text-popover-foreground rounded-lg p-6 w-full max-w-sm mx-4" onClick={e => e.stopPropagation()}>
                <header className="flex justify-center items-center relative mb-6">
                    <h2 className="text-xl font-semibold">Place Order</h2>
                    <button onClick={onClose} className="absolute right-0 p-1 text-muted-foreground hover:text-foreground">
                        <X size={24} />
                    </button>
                </header>

                <main className="space-y-6">
                    {/* Settlement Duration */}
                    <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Settlement Period</label>
                        <div className="grid grid-cols-3 gap-2">
                            {settlementOptions.map(option => (
                                <button
                                    key={option.duration}
                                    onClick={() => setSelectedSettlement(option)}
                                    className={`p-2 rounded-md border text-center transition-colors ${selectedSettlement.duration === option.duration ? 'border-accent-gold' : 'border-border hover:border-border/80'}`}
                                >
                                    <p className="font-semibold">Settlement {option.label}</p>
                                    <p className="text-xs text-muted-foreground">Profit {option.profit}%</p>
                                </button>
                            ))}
                        </div>
                    </div>
                    
                    {/* Investment Amount */}
                    <div>
                        <label className="text-sm text-muted-foreground mb-2 block">Invest amount (Stake)</label>
                        <div className="grid grid-cols-5 gap-2 mb-3">
                            {presetAmounts.map(preset => (
                                <button key={preset} onClick={() => setAmount(preset)} className="bg-secondary hover:bg-secondary/80 rounded-md py-1 text-xs truncate">{preset.toLocaleString()}</button>
                            ))}
                             <button onClick={() => setAmount(Math.floor(balance))} className="bg-secondary hover:bg-secondary/80 rounded-md py-1 text-xs">All-in</button>
                        </div>
                        <input
                            type="text"
                            value={amount}
                            onChange={handleAmountChange}
                            placeholder="Enter stake amount"
                            className="w-full bg-transparent border border-border rounded-md p-2 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
                        />
                    </div>
                    
                    {/* Order Summary */}
                    <div className="space-y-2 text-sm border-t border-border pt-4">
                        <div className="flex justify-between text-muted-foreground">
                            <span>Balance: <span className="text-foreground">{balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span></span>
                            <span>Handling fee: <span className="text-foreground">{selectedSettlement.commission}%</span></span>
                        </div>
                        <div className="grid grid-cols-4 text-muted-foreground font-semibold mt-2">
                            <span>Name</span>
                            <span className="text-center">Direct</span>
                            <span className="text-center">Stake</span>
                            <span className="text-right">Now Price</span>
                        </div>
                        <div className="grid grid-cols-4 text-foreground font-medium">
                            <span>{pair.replace('-', '/')}</span>
                            <span className={`text-center font-bold ${directionColor}`}>{tradeDirection}</span>
                            <span className="text-center">{numAmount > 0 ? numAmount.toLocaleString() : '0'}</span>
                            <span className="text-right">{price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                        </div>
                    </div>
                     {error && <p className="text-destructive text-xs text-center mt-2">{error}</p>}
                </main>

                <footer className="mt-8">
                    <button onClick={handlePurchase} className="w-full bg-accent-gold text-black font-bold py-3 rounded-lg text-lg hover:opacity-90 transition-opacity">
                        Purchase
                    </button>
                    <p className="text-center mt-2 text-muted-foreground">
                        Total Cost: <span className="text-foreground font-semibold">{totalCost > 0 ? totalCost.toFixed(2) : '0.00'}</span>
                        <span className="mx-2">|</span>
                        Expected Profit: <span className="text-foreground font-semibold">{expectedProfit}</span>
                    </p>
                </footer>
            </div>
        </div>
    );
};

export default TradeOrderModal;