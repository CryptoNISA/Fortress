
import * as React from 'react';
import { useAuth } from './AuthContext.tsx';
import type { Order, Trade } from '../types.ts';

// --- TYPE DEFINITIONS ---

interface PlaceOrderDetails {
    pair: string;
    direction: 'Buy' | 'Sell';
    stake: number;
    settlementDuration: number;
    profitPercentage: number;
    commissionPercentage: number;
}

interface ActiveTradeState {
    pair: string;
    direction: 'Buy' | 'Sell';
    stake: number;
    expectedProfit: number;
    entryPrice: number;
    settlementDuration: number;
    profitPercentage: number;
    commissionPercentage: number;
    startTime: string;
}

interface TradeResultState {
    outcome: 'Win' | 'Loss';
    pnl: number;
    stake?: number;
    profitPercentage?: number;
}

interface TradingContextType {
    activePair: string;
    chartData: any[];
    bids: Order[];
    asks: Order[];
    trades: Trade[];
    headerStats: any;
    activeTrade: ActiveTradeState | null;
    tradeResult: TradeResultState | null;
    timeLeft: number;
    placeOrder: (details: PlaceOrderDetails) => void;
    clearTradeResult: () => void;
    setActivePair: (pair: string) => void;
}

// --- MOCK DATA GENERATORS ---
const generateInitialChartData = (length = 50) => {
    const data = [];
    let lastPrice = 68000;
    for (let i = 0; i < length; i++) {
        const open = lastPrice;
        const priceChange = (Math.random() - 0.48) * 500;
        lastPrice += priceChange;
        const volume = Math.random() * 100 + 10;
        data.push({ name: `T-${length - i}`, price: lastPrice, volume, open, close: lastPrice });
    }
    return data;
};

const generateOrderBook = (count: number, startPrice: number, isBids: boolean) => {
    return Array.from({length: count}, (_, i) => {
        const price = startPrice + (isBids ? -i : i) * Math.random() * 10;
        const amount = Math.random() * 2;
        return { price, amount, total: price * amount };
    }).sort((a,b) => isBids ? b.price - a.price : a.price - b.price);
};

const generateInitialTrades = (length = 30): Trade[] => {
    return Array.from({length}, (_, i) => ({
        id: `trade-${i}`,
        time: new Date(Date.now() - i * 15000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'}),
        price: 69480 + Math.random() * 40 - 20,
        amount: Math.random() * 0.5,
        type: Math.random() > 0.5 ? 'buy' : 'sell'
    }));
};


const TradingContext = React.createContext<TradingContextType | undefined>(undefined);

export const TradingProvider = ({ children }: { children: React.ReactNode }) => {
    const { user, setUser, completeTrade } = useAuth();
    
    const activeTradeTimeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
    const countdownIntervalRef = React.useRef<ReturnType<typeof setInterval> | null>(null);

    // --- STATE MANAGEMENT ---
    const [activePair, setActivePair] = React.useState('BTC-USDT');
    const [chartData, setChartData] = React.useState(generateInitialChartData());
    const [bids, setBids] = React.useState(() => generateOrderBook(20, 69450, true));
    const [asks, setAsks] = React.useState(() => generateOrderBook(20, 69500, false));
    const [trades, setTrades] = React.useState<Trade[]>(generateInitialTrades());
    const [headerStats, setHeaderStats] = React.useState({
        lastPrice: chartData[chartData.length - 1].price,
        changeValue: 1230.45,
        changePercent: 1.82,
        isPositive: true,
        high: 70123.88,
        low: 68890.10
    });
    
    // Ref to hold the latest stats to avoid stale closures in setInterval
    const headerStatsRef = React.useRef(headerStats);
    headerStatsRef.current = headerStats;


    // Trade State
    const [activeTrade, setActiveTrade] = React.useState<ActiveTradeState | null>(null);
    const [tradeResult, setTradeResult] = React.useState<TradeResultState | null>(null);
    const [timeLeft, setTimeLeft] = React.useState(0);
    
    // --- REAL-TIME DATA SIMULATION ---
    React.useEffect(() => {
        const simulationInterval = setInterval(() => {
            setChartData(prevData => {
                if (prevData.length === 0) return [];
                const lastPoint = prevData[prevData.length - 1];
                const newPrice = lastPoint.price + (Math.random() - 0.48) * 150;
                const newData = [...prevData.slice(1), {
                    name: new Date().toLocaleTimeString([], { minute: '2-digit', second: '2-digit'}),
                    price: newPrice,
                    volume: Math.random() * 100 + 10,
                    open: lastPoint.price,
                    close: newPrice
                }];

                setHeaderStats(prev => ({
                    ...prev,
                    lastPrice: newPrice,
                    changeValue: newPrice - prev.high + 500,
                    changePercent: ((newPrice - prev.high + 500) / prev.high) * 100,
                    isPositive: newPrice >= lastPoint.price
                }));
                return newData;
            });
            
            setTrades(prev => {
                const newTrade: Trade = {
                    id: `trade-${Date.now()}`,
                    time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit'}),
                    price: headerStatsRef.current.lastPrice + (Math.random() - 0.5) * 10,
                    amount: Math.random() * 0.5,
                    type: Math.random() > 0.5 ? 'buy' : 'sell'
                };
                return [newTrade, ...prev.slice(0, 29)];
            });
            
            const updateOrders = (orders: Order[]) => orders.map(o => ({...o, price: o.price + (Math.random() - 0.5) * 0.5, amount: Math.max(0.001, o.amount + (Math.random() - 0.5) * 0.1)}));
            setBids(prev => updateOrders(prev).sort((a,b) => b.price - a.price));
            setAsks(prev => updateOrders(prev).sort((a,b) => a.price - b.price));

        }, 2000);

        return () => {
            clearInterval(simulationInterval);
            if (activeTradeTimeoutRef.current) clearTimeout(activeTradeTimeoutRef.current);
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        };
    }, []); // Empty array ensures this runs only once

    const placeOrder = (details: PlaceOrderDetails) => {
        if (!user) return;

        const commission = details.stake * (details.commissionPercentage / 100);
        const totalCost = details.stake + commission;

        setUser(prevUser => {
            if (!prevUser) return null;
            return { ...prevUser, portfolio: { ...prevUser.portfolio, balance: prevUser.portfolio.balance - totalCost }};
        });

        const newActiveTrade: ActiveTradeState = {
            ...details,
            entryPrice: headerStats.lastPrice,
            expectedProfit: details.stake * (details.profitPercentage / 100),
            startTime: new Date().toISOString(),
        };
        setActiveTrade(newActiveTrade);
        setTimeLeft(details.settlementDuration);
        
        if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
        countdownIntervalRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev <= 1) {
                    if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);

        if (activeTradeTimeoutRef.current) clearTimeout(activeTradeTimeoutRef.current);
        activeTradeTimeoutRef.current = setTimeout(() => {
            if (countdownIntervalRef.current) clearInterval(countdownIntervalRef.current);
            
            const exitPrice = headerStatsRef.current.lastPrice;
            
            let isWin = false;
            if (newActiveTrade.direction === 'Buy' && exitPrice > newActiveTrade.entryPrice) isWin = true;
            if (newActiveTrade.direction === 'Sell' && exitPrice < newActiveTrade.entryPrice) isWin = true;
            
            const pnl = isWin ? newActiveTrade.expectedProfit : -newActiveTrade.stake;
            const commission = newActiveTrade.stake * (newActiveTrade.commissionPercentage / 100);

            completeTrade({
                pair: newActiveTrade.pair,
                direction: newActiveTrade.direction,
                stake: newActiveTrade.stake,
                commission,
                profit: pnl,
                entryPrice: newActiveTrade.entryPrice,
                exitPrice,
                startTime: newActiveTrade.startTime,
                settlementDuration: newActiveTrade.settlementDuration,
                profitPercentage: newActiveTrade.profitPercentage,
                commissionPercentage: newActiveTrade.commissionPercentage,
            });
            
            setTradeResult({ 
                outcome: isWin ? 'Win' : 'Loss', 
                pnl,
                stake: newActiveTrade.stake,
                profitPercentage: newActiveTrade.profitPercentage,
            });
            setActiveTrade(null);

        }, details.settlementDuration * 1000);
    };

    const clearTradeResult = () => {
        setTradeResult(null);
    };

    const value = {
        activePair,
        chartData,
        bids,
        asks,
        trades,
        headerStats,
        activeTrade,
        tradeResult,
        timeLeft,
        placeOrder,
        clearTradeResult,
        setActivePair
    };

    return <TradingContext.Provider value={value}>{children}</TradingContext.Provider>;
};


export const useTrading = () => {
    const context = React.useContext(TradingContext);
    if (context === undefined) {
        throw new Error('useTrading must be used within a TradingProvider');
    }
    return context;
};