
import React, { useState, useEffect, useCallback } from "react";
import { useAuth } from "../contexts/AuthContext.tsx";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  AreaChart,
  Area,
} from "recharts";
import {
  Loader,
  ArrowUp,
  ArrowDown,
  Wallet,
  Clock,
  CheckCircle,
  XCircle,
  Award,
} from "lucide-react";
import type { SecondContractTrade, CryptoCoin } from "../types.ts";
import { MOCK_CRYPTO_COINS } from "../lib/mock-market-data.ts";

const contractOptions = [
  { duration: 60, profitRate: 0.05, commissionRate: 0.02 },
  { duration: 100, profitRate: 0.08, commissionRate: 0.018 },
  { duration: 250, profitRate: 0.12, commissionRate: 0.015 },
  { duration: 600, profitRate: 0.20, commissionRate: 0.012 },
  { duration: 900, profitRate: 0.30, commissionRate: 0.01 },
];

const Header = ({ stats }: { stats: CryptoCoin | null }) => {
    if (!stats) return <div className="h-[88px] flex items-center justify-center bg-card rounded-lg"><Loader className="animate-spin"/></div>;
    const isPositive = (stats.price_change_percentage_24h || 0) >= 0;

    return (
        <div className="flex items-center justify-between p-4 bg-card rounded-lg shadow-md border border-border">
            <div
            className={`flex flex-col text-3xl font-bold ${isPositive ? "text-success" : "text-destructive"}`}
            >
            <span>{stats.current_price.toFixed(2)}</span>
            </div>
            <div className="text-right text-sm">
            <div className="flex justify-between items-center gap-4">
                <span className="text-muted-foreground">24h High</span>
                <span className="font-semibold">{stats.high_24h?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
                <span className="text-muted-foreground">24h Low</span>
                <span className="font-semibold">{stats.low_24h?.toFixed(2)}</span>
            </div>
            <div className="flex justify-between items-center gap-4">
                <span className="text-muted-foreground">24h Vol</span>
                <span className="font-semibold">{(stats.total_volume / 1_000_000_000).toFixed(2)}B USDT</span>
            </div>
            </div>
        </div>
    );
};

const Chart = ({ data }: { data: { time: number; price: number }[] }) => {
  return (
    <div className="bg-card rounded-lg p-2 h-72 border border-border">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 5, right: 0, left: -10, bottom: 5 }}
        >
          <defs>
            <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="rgb(var(--primary))" stopOpacity={0.4}/>
              <stop offset="95%" stopColor="rgb(var(--primary))" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid
            strokeDasharray="3 3"
            stroke="rgb(var(--border))"
            vertical={false}
          />
          <XAxis dataKey="time" stroke="rgb(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} hide />
          <YAxis
            stroke="rgb(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false}
            domain={["dataMin - 100", "dataMax + 100"]}
            tickFormatter={(value) => `$${Number(value).toFixed(0)}`}
            orientation="right"
          />
          <Tooltip
            contentStyle={{ backgroundColor: 'rgb(var(--popover))', border: `1px solid rgb(var(--border))`, borderRadius: "0.5rem" }}
            itemStyle={{ color: 'rgb(var(--popover-foreground))' }}
            labelStyle={{ display: 'none' }}
            formatter={(value: number) => [`$${value.toFixed(2)}`, 'Price']}
          />
          <Area
            type="monotone" dataKey="price" stroke="rgb(var(--primary))"
            strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" dot={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};

const Countdown = ({ to, onEnd }: { to: string; onEnd: () => void }) => {
  const [remaining, setRemaining] = useState("");
  const [expired, setExpired] = useState(new Date(to) <= new Date());

  useEffect(() => {
    if (expired) {
        onEnd();
        return;
    }
    const interval = setInterval(() => {
      const now = new Date();
      const target = new Date(to);
      const diff = target.getTime() - now.getTime();
      if (diff <= 0) {
        setRemaining("00:00");
        clearInterval(interval);
        setExpired(true);
        onEnd();
      } else {
        const minutes = Math.floor(diff / 1000 / 60);
        const seconds = Math.floor((diff / 1000) % 60);
        setRemaining(`${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [to, onEnd, expired]);

  if(expired) {
    return <span className="font-mono text-sm text-yellow-400">Awaiting Result</span>
  }

  return <span className="font-mono text-sm">{remaining}</span>;
};

const TradeResultModal = ({ isOpen, onClose, trade }: { isOpen: boolean; onClose: () => void; trade: SecondContractTrade | null; }) => {
  if (!isOpen || !trade) return null;

  const isWin = trade.status === "won";

  return (
    <div
      className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center animate-fade-in-fast"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-lg p-6 w-full max-w-sm m-4 text-center shadow-2xl border border-border"
        onClick={(e) => e.stopPropagation()}
      >
        {isWin ? (
          <CheckCircle className="w-16 h-16 text-success mx-auto mb-4" />
        ) : (
          <XCircle className="w-16 h-16 text-destructive mx-auto mb-4" />
        )}
        <h2 className="text-2xl font-bold mb-2">
          {isWin ? "Trade Won" : "Trade Lost"}
        </h2>
        <p className="text-muted-foreground mb-4">The contract has been settled.</p>
        <div className="bg-secondary rounded-md p-4 space-y-2 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Result</span><span className={`font-semibold ${isWin ? 'text-success' : 'text-destructive'}`}>{isWin ? 'Profit' : 'Loss'}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Amount</span><span>${(isWin ? trade.amount * trade.profitRate : trade.amount).toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Entry Price</span><span>${trade.entryPrice.toFixed(2)}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Close Price</span><span>${trade.closePrice?.toFixed(2)}</span></div>
        </div>
        <button
          onClick={onClose}
          className="mt-6 w-full bg-primary hover:bg-primary/90 text-primary-foreground font-bold py-2 px-4 rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  );
};


const SecondContractScreen = () => {
  const { user, placeSecondContractTrade, isLoading, systemSettings } = useAuth();
  const [chartData, setChartData] = useState<{ time: number; price: number }[]>([]);
  const [currentPrice, setCurrentPrice] = useState(0);
  const [coinStats, setCoinStats] = useState<CryptoCoin | null>(null);

  const [activeTab, setActiveTab] = useState<"trade" | "history">("trade");
  const [selectedOption, setSelectedOption] = useState(contractOptions[0]);
  const [amount, setAmount] = useState("");
  const [error, setError] = useState("");

  const [finishedTrade, setFinishedTrade] = useState<SecondContractTrade | null>(null);

  const userVipLevel = user?.vipLevel ?? 1;
  const vipTiers = systemSettings?.vipTiers || [];
  const userVipInfo = vipTiers.find(tier => tier.level === userVipLevel);
  const userTradeLimit = userVipInfo ? userVipInfo.tradeLimit : 1;
  const activeTradeCount = user?.activeSecondContracts?.length || 0;
  const canTrade = userTradeLimit === 'unlimited' || activeTradeCount < userTradeLimit;

  useEffect(() => {
    const btcData = MOCK_CRYPTO_COINS.find(c => c.id === 'bitcoin');
    if (btcData) {
        setCoinStats(btcData);
        setCurrentPrice(btcData.current_price);

        // Generate initial chart data based on mock price
        let lastPrice = btcData.current_price;
        const initialChartData = Array.from({ length: 100 }, (_, i) => {
            lastPrice -= (Math.random() - 0.5) * 50;
            return { time: Date.now() - (100 - i) * 2000, price: lastPrice };
        });
        setChartData(initialChartData);
    }
  }, []);

  useEffect(() => {
    if (chartData.length === 0) return;
    const priceInterval = setInterval(() => {
        setCurrentPrice(prev => {
            const change = (Math.random() - 0.49) * (prev * 0.0001);
            const newPrice = prev + change;
            setChartData(prevChart => [...prevChart.slice(1), { time: Date.now(), price: newPrice }]);
            setCoinStats(prevStats => prevStats ? {...prevStats, current_price: newPrice} : null);
            return newPrice;
        });
    }, 2000);
    return () => clearInterval(priceInterval);
  }, [chartData]);

  const handleTrade = async (type: "buy" | "sell") => {
    setError("");
    const numericAmount = parseFloat(amount);
    if (isNaN(numericAmount) || numericAmount <= 0) {
      setError("Please enter a valid amount.");
      return;
    }
    const commission = numericAmount * selectedOption.commissionRate;
    if (user && user.portfolio.balance < numericAmount + commission) {
      setError("Insufficient balance.");
      return;
    }

    try {
      await placeSecondContractTrade({
        amount: numericAmount,
        type,
        option: selectedOption,
        entryPrice: currentPrice,
      });
      setAmount("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Trade failed.");
    }
  };
  
  const handleCompleteTrade = useCallback((tradeId: string) => {
      // This function is now just for the client-side countdown end.
      // The actual completion is handled by the admin.
      // The `completeSecondContractTrade` in AuthContext will tell the backend to notify the user.
      console.log(`Trade ${tradeId} expired. Awaiting admin settlement.`);
  }, []);

  useEffect(() => {
    if (user?.secondContractHistory && user.secondContractHistory.length > 0) {
        const lastTrade = user.secondContractHistory[0];
        const alreadyShown = localStorage.getItem(`trade-notif-${lastTrade.id}`);
        if(!alreadyShown) {
            setFinishedTrade(lastTrade);
            localStorage.setItem(`trade-notif-${lastTrade.id}`, 'true');
        }
    }
  }, [user?.secondContractHistory]);

  const ActiveTrades = () => (
    <div className="space-y-3 mt-4">
      {user?.activeSecondContracts.map((trade) => (
        <div key={trade.id} className="bg-secondary p-3 rounded-lg flex justify-between items-center text-sm">
            <div className="font-bold">{trade.pair}</div>
            <div className={`font-semibold ${trade.type === 'buy' ? 'text-success' : 'text-destructive'}`}>{trade.type === 'buy' ? 'Long' : 'Short'}</div>
            <div>${trade.amount}</div>
            <div className="flex items-center gap-2">
                <Clock size={14} />
                <Countdown to={trade.closesAt} onEnd={() => handleCompleteTrade(trade.id)} />
            </div>
        </div>
      ))}
       {user?.activeSecondContracts.length === 0 && <p className="text-center text-muted-foreground py-4">No active contracts.</p>}
    </div>
  );

  const HistoryTrades = () => (
    <div className="space-y-3 mt-4">
      {user?.secondContractHistory.map((trade) => {
        const isWin = trade.status === 'won';
        return (
            <div key={trade.id} className="bg-secondary p-3 rounded-lg flex justify-between items-center text-sm">
                <div className="font-bold">{trade.pair}</div>
                <div className={`font-semibold ${isWin ? 'text-success' : 'text-destructive'}`}>{isWin ? 'Win' : 'Loss'}</div>
                <div>${(isWin ? trade.amount * trade.profitRate : trade.amount).toFixed(2)}</div>
                <div className="text-muted-foreground">{new Date(trade.created_date).toLocaleTimeString()}</div>
            </div>
        );
      })}
       {user?.secondContractHistory.length === 0 && <p className="text-center text-muted-foreground py-4">No contract history.</p>}
    </div>
  );

  return (
    <div className="p-4 max-w-7xl mx-auto space-y-4 text-foreground">
      <Header stats={coinStats} />
      <Chart data={chartData} />

      {/* VIP & Balance Info */}
       <div className="flex items-center justify-between p-3 bg-card rounded-lg text-sm border border-border">
          <div className="flex items-center gap-3">
              <span className="bg-accent-gold text-slate-900 text-xs font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <Award size={12} /> VIP {userVipLevel}
              </span>
              <span className="text-muted-foreground hidden sm:inline">
                  Trade Limit: {activeTradeCount} / {userTradeLimit === 'unlimited' ? '∞' : userTradeLimit}
              </span>
          </div>
          <div className="text-right">
              <span className="text-muted-foreground">Available: </span>
              <span className="font-semibold">{user?.portfolio.balance.toFixed(2)} USDT</span>
          </div>
      </div>

      {/* Trade Options */}
      <div className="grid grid-cols-5 gap-2 text-center text-xs">
        {contractOptions.map((opt) => (
          <button
            key={opt.duration}
            onClick={() => setSelectedOption(opt)}
            className={`p-2 rounded-lg border-2 transition-colors ${
              selectedOption.duration === opt.duration
                ? "border-primary bg-primary/10"
                : "border-border bg-secondary hover:bg-secondary/80"
            }`}
          >
            <p className="font-bold">{opt.duration}s</p>
            <p className="text-muted-foreground">+{opt.profitRate * 100}%</p>
          </button>
        ))}
      </div>

      {/* Amount Input */}
      <div className="relative">
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="Enter amount"
          className="w-full bg-secondary border-2 border-border rounded-lg p-3 pr-12 focus:outline-none focus:ring-2 focus:ring-ring focus:border-transparent"
        />
        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-muted-foreground">
          USDT
        </span>
      </div>
      {!canTrade && <p className="text-warning text-sm text-center -mt-2">Trade limit reached. Upgrade your VIP level for more concurrent trades.</p>}
      {error && <p className="text-destructive text-sm text-center -mt-2">{error}</p>}

      {/* Action Buttons */}
      <div className="grid grid-cols-2 gap-4">
        <button
          onClick={() => handleTrade("buy")}
          disabled={isLoading || !canTrade}
          className="bg-success hover:bg-success/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          {isLoading ? <Loader className="animate-spin"/> : <><ArrowUp /> Buy / Long</>}
        </button>
        <button
          onClick={() => handleTrade("sell")}
          disabled={isLoading || !canTrade}
          className="bg-destructive hover:bg-destructive/90 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-4 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
           {isLoading ? <Loader className="animate-spin"/> : <><ArrowDown /> Sell / Short</>}
        </button>
      </div>

      {/* History/Active Tabs */}
      <div className="bg-card rounded-lg border border-border">
        <div className="flex border-b border-border">
            <button onClick={() => setActiveTab('trade')} className={`flex-1 p-3 font-semibold ${activeTab === 'trade' ? 'bg-secondary' : ''}`}>
                Active ({activeTradeCount})
            </button>
            <button onClick={() => setActiveTab('history')} className={`flex-1 p-3 font-semibold ${activeTab === 'history' ? 'bg-secondary' : ''}`}>
                History ({user?.secondContractHistory?.length || 0})
            </button>
        </div>
        <div className="p-3 min-h-[100px]">
            {activeTab === 'trade' && <ActiveTrades />}
            {activeTab === 'history' && <HistoryTrades />}
        </div>
      </div>
       <TradeResultModal 
            isOpen={!!finishedTrade} 
            onClose={() => setFinishedTrade(null)} 
            trade={finishedTrade}
        />
    </div>
  );
};

export default SecondContractScreen;
