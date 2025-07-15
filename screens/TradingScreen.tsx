

import * as React from 'react';
import { useParams } from 'react-router-dom';
import { ChevronDown, Hourglass, View } from 'lucide-react';
import { ComposedChart, Line, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid, Cell } from 'recharts';
import type { Order, Trade } from '../types.ts';
import { useAuth } from '../contexts/AuthContext.tsx';
import TradeOrderModal from '../components/TradeOrderModal.tsx';
import ActiveTradeModal from '../components/ActiveTradeModal.tsx';
import TradeResultModal from '../components/TradeResultModal.tsx';
import { useTrading } from '../contexts/TradingContext.tsx';

const TradingScreen = () => {
    const { pair: paramPair } = useParams<{ pair?: string }>();
    const { user } = useAuth();

    const {
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
    } = useTrading();

    // Sync URL parameter with context
    React.useEffect(() => {
        if (paramPair && paramPair !== activePair) {
            setActivePair(paramPair);
        }
    }, [paramPair, activePair, setActivePair]);


    // Modal State
    const [isOrderModalOpen, setIsOrderModalOpen] = React.useState(false);
    const [modalTradeDirection, setModalTradeDirection] = React.useState<'Buy' | 'Sell'>('Buy');
    const [isTradeActiveModalOpen, setIsTradeActiveModalOpen] = React.useState(false);

    const handlePlaceOrder = (details: any) => {
        placeOrder(details);
        setIsOrderModalOpen(false);
    };
    
    const chartColors = {
        grid: 'rgb(var(--border))',
        axis: 'rgb(var(--muted-foreground))',
        tooltipBg: 'rgb(var(--popover))',
        tooltipBorder: 'rgb(var(--border))',
        text: 'rgb(var(--popover-foreground))',
        primary: 'rgb(var(--primary))',
    };

    // --- REUSABLE COMPONENTS ---

    const OrderBook = ({ bids, asks }: { bids: Order[]; asks: Order[]; }) => (
        <div className="bg-card rounded-lg p-3 h-full flex flex-col border border-border">
            <h3 className="text-lg font-bold mb-2">Order Book</h3>
            <div className="grid grid-cols-2 gap-4 text-xs mb-1 text-muted-foreground">
                <div>Price (USDT)</div>
                <div className="text-right">Amount (BTC)</div>
            </div>
            <div className="flex-grow overflow-y-auto text-xs">
                 <div className="h-1/2 flex flex-col justify-end">
                    {asks.slice(0, 8).reverse().map((order, i) => (
                        <div key={i} className="relative flex justify-between items-center h-6 hover:bg-secondary">
                            <div className="absolute top-0 left-0 h-full bg-destructive/10" style={{ width: `${Math.random() * 80 + 10}%` }}></div>
                            <span className="z-10 text-destructive">{order.price.toFixed(2)}</span>
                            <span className="z-10">{order.amount.toFixed(4)}</span>
                        </div>
                    ))}
                </div>
                 <div className={`text-lg font-bold text-center py-2 ${headerStats.isPositive ? 'text-success' : 'text-destructive'}`}>
                     {headerStats.lastPrice.toFixed(2)}
                </div>
                 <div className="h-1/2">
                    {bids.slice(0, 8).map((order, i) => (
                         <div key={i} className="relative flex justify-between items-center h-6 hover:bg-secondary">
                            <div className="absolute top-0 left-0 h-full bg-success/10" style={{ width: `${Math.random() * 80 + 10}%` }}></div>
                            <span className="z-10 text-success">{order.price.toFixed(2)}</span>
                            <span className="z-10">{order.amount.toFixed(4)}</span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
    
    const RecentTrades = ({ trades }: { trades: Trade[] }) => (
        <div className="bg-card rounded-lg p-3 h-full flex flex-col border border-border">
            <h3 className="text-lg font-bold mb-2">Recent Trades</h3>
            <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground mb-1">
                <span>Time</span>
                <span className="text-right">Price (USDT)</span>
                <span className="text-right">Amount (BTC)</span>
            </div>
            <div className="flex-grow overflow-y-auto">
                {trades.map(trade => (
                    <div key={trade.id} className={`grid grid-cols-3 gap-2 text-xs py-1 ${trade.type === 'buy' ? 'text-success' : 'text-destructive'}`}>
                        <span className="text-muted-foreground">{trade.time}</span>
                        <span className="text-right">{trade.price.toFixed(2)}</span>
                        <span className="text-right">{trade.amount.toFixed(4)}</span>
                    </div>
                ))}
            </div>
        </div>
    );
    
    const OrderForm = () => {
        const handleOpenModal = (direction: 'Buy' | 'Sell') => {
            setModalTradeDirection(direction);
            setIsOrderModalOpen(true);
        };
        
        const formatTime = (seconds: number) => {
            const minutes = Math.floor(seconds / 60);
            const secs = seconds % 60;
            return `${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
        };

        if (activeTrade) {
            const directionClass = activeTrade.direction === 'Buy' ? 'bg-success/10 text-success' : 'bg-destructive/10 text-destructive';
            return (
                 <div className="bg-card rounded-lg p-4 border border-border h-full flex flex-col justify-center">
                    <div className="text-center">
                       <Hourglass size={24} className="mx-auto text-yellow-400 animate-spin" style={{ animationDuration: '2s' }} />
                       <h3 className="text-lg font-bold mt-2">Trade in Progress</h3>
                       <div className={`mt-2 inline-flex items-center px-3 py-1 rounded-full text-sm font-semibold ${directionClass}`}>
                            {activeTrade.direction} {activeTrade.pair.split('-')[0]} for ${activeTrade.stake}
                       </div>
                    </div>
                    <div className="text-center my-4">
                        <p className="text-sm text-muted-foreground">Time Remaining</p>
                        <p className="text-4xl font-mono font-bold text-foreground">{formatTime(timeLeft)}</p>
                    </div>
                    <button 
                        onClick={() => setIsTradeActiveModalOpen(true)}
                        className="w-full py-2 rounded-lg font-semibold text-primary-foreground transition-colors bg-primary hover:bg-primary/90 flex items-center justify-center gap-2">
                        <View size={16} /> View Trade Details
                    </button>
                </div>
            );
        }

        return (
            <div className="bg-card rounded-lg p-4 border border-border h-full flex flex-col justify-center">
                <h3 className="text-lg font-bold text-center mb-2">Place Timed Trade</h3>
                <p className="text-xs text-center text-muted-foreground mb-4">Select a direction to open the order modal.</p>
                <div className="flex space-x-4">
                    <button
                        onClick={() => handleOpenModal('Buy')}
                        className="w-full py-3 rounded-lg font-bold text-white transition-colors bg-success hover:bg-success/90">
                        Buy / Long
                    </button>
                    <button
                        onClick={() => handleOpenModal('Sell')}
                        className="w-full py-3 rounded-lg font-bold text-white transition-colors bg-destructive hover:bg-destructive/90">
                        Sell / Short
                    </button>
                </div>
            </div>
        )
    };

    return (
        <div className="p-2 lg:p-4 max-w-screen-2xl mx-auto text-foreground">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
                {/* Main Content: Chart and Order Form */}
                <div className="lg:col-span-9 space-y-4">
                    {/* Header */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 bg-card rounded-lg border border-border">
                        <div className="flex items-center space-x-4">
                            <div className="relative group">
                                <button className="flex items-center text-2xl font-bold">
                                    {activePair.replace('-', '/')} <ChevronDown size={20} className="ml-2 group-hover:text-primary" />
                                </button>
                            </div>
                        </div>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2 mt-4 sm:mt-0 text-sm">
                            <div>
                                <p className="text-muted-foreground">Last Price</p>
                                <p className={`font-semibold ${headerStats.isPositive ? 'text-success' : 'text-destructive'}`}>{headerStats.lastPrice.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">24h Change</p>
                                <p className={`font-semibold ${headerStats.isPositive ? 'text-success' : 'text-destructive'}`}>{headerStats.isPositive ? '+' : ''}{headerStats.changeValue.toFixed(2)} ({headerStats.isPositive ? '+' : ''}{headerStats.changePercent.toFixed(2)}%)</p>
                            </div>
                            <div>
                                <p className="text-muted-foreground">24h High</p>
                                <p className="font-semibold">{headerStats.high.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            </div>
                             <div>
                                <p className="text-muted-foreground">24h Low</p>
                                <p className="font-semibold">{headerStats.low.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
                            </div>
                        </div>
                    </div>
                    {/* Chart */}
                    <div className="bg-card rounded-lg p-4 h-96 border border-border">
                        <ResponsiveContainer width="100%" height="100%">
                           <ComposedChart data={chartData} margin={{ top: 5, right: 0, left: -20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke={chartColors.grid} vertical={false} />
                                <XAxis dataKey="name" stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis yAxisId="left" stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} domain={['dataMin - 100', 'dataMax + 100']} tickFormatter={(value) => `$${Number(value).toFixed(0)}`} />
                                <YAxis yAxisId="right" orientation="right" stroke={chartColors.axis} fontSize={12} tickLine={false} axisLine={false} domain={[0, 'dataMax + 100']} tickFormatter={(value) => `${(value).toFixed(0)}`} />
                                <Tooltip 
                                    contentStyle={{ backgroundColor: chartColors.tooltipBg, border: `1px solid ${chartColors.tooltipBorder}`, borderRadius: '0.5rem', color: chartColors.text }}
                                    itemStyle={{ color: chartColors.text }}
                                    labelStyle={{ color: chartColors.text, fontWeight: 'bold' }}
                                />
                                <Line yAxisId="left" type="monotone" dataKey="price" stroke={chartColors.primary} strokeWidth={2} dot={false} />
                                <Bar yAxisId="right" dataKey="volume" barSize={20}>
                                    {chartData.map((entry, index) => (
                                       <Cell key={`cell-${index}`} fill={entry.close >= entry.open ? 'rgb(var(--success))' : 'rgb(var(--destructive))'} />
                                    ))}
                                </Bar>
                            </ComposedChart>
                        </ResponsiveContainer>
                    </div>
                     {/* Order form on smaller screens */}
                    <div className="lg:hidden h-64">
                        <OrderForm />
                    </div>
                </div>
                {/* Side Content: Order Book and Trades */}
                <div className="lg:col-span-3 space-y-4">
                     <div className="h-96">
                        <OrderBook bids={bids} asks={asks} />
                    </div>
                     <div className="h-80">
                         <RecentTrades trades={trades} />
                    </div>
                     {/* Order form on larger screens */}
                    <div className="hidden lg:block h-64">
                        <OrderForm />
                    </div>
                </div>
            </div>

            <TradeOrderModal
                isOpen={isOrderModalOpen}
                onClose={() => setIsOrderModalOpen(false)}
                onPlaceOrder={handlePlaceOrder}
                tradeDirection={modalTradeDirection}
                pair={activePair}
                price={headerStats.lastPrice}
                balance={user?.portfolio.balance || 0}
            />

            {activeTrade && (
                 <ActiveTradeModal 
                    isOpen={isTradeActiveModalOpen}
                    onClose={() => setIsTradeActiveModalOpen(false)}
                    tradeDetails={{
                        pair: activeTrade.pair,
                        direction: activeTrade.direction,
                        stake: activeTrade.stake,
                        expectedProfit: activeTrade.expectedProfit,
                        entryPrice: activeTrade.entryPrice,
                    }}
                    timeLeft={timeLeft}
                    livePrice={headerStats.lastPrice}
                />
            )}
            
            <TradeResultModal 
                isOpen={!!tradeResult}
                onClose={clearTradeResult}
                result={tradeResult}
            />
        </div>
    );
};

export default TradingScreen;