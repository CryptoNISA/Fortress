
import * as React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { MOCK_CRYPTO_COINS } from '../lib/mock-market-data.ts';
import { ArrowLeft, LineChart, CandlestickChart, BarChart2 } from 'lucide-react';
import { AreaChart, Area, ResponsiveContainer, Tooltip, YAxis, XAxis, CartesianGrid } from 'recharts';

const formatNumber = (num: number, options?: Intl.NumberFormatOptions) => {
    return new Intl.NumberFormat('en-US', options).format(num);
}

const StatCard = ({ label, value, subValue }: { label: string, value: string, subValue?: string }) => (
    <div className="bg-secondary p-4 rounded-lg">
        <p className="text-sm text-muted-foreground">{label}</p>
        <p className="text-lg font-bold text-foreground">{value}</p>
        {subValue && <p className="text-xs text-muted-foreground">{subValue}</p>}
    </div>
);

const CoinDetailScreen = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [chartData, setChartData] = React.useState<any[]>([]);
    
    const coin = MOCK_CRYPTO_COINS.find(c => c.id === id);

    React.useEffect(() => {
        if (coin) {
            let lastPrice = coin.current_price;
            const data = Array.from({ length: 60 }, (_, i) => {
                const newPrice = lastPrice + (Math.random() - 0.5) * (lastPrice * 0.02);
                lastPrice = newPrice;
                return { date: new Date(Date.now() - (60 - i) * 60 * 1000).toISOString(), price: newPrice };
            });
            setChartData(data);
        }
    }, [coin]);

    if (!coin) {
        return (
            <div className="flex flex-col items-center justify-center h-screen bg-background">
                <p className="text-xl text-muted-foreground">Coin not found.</p>
                <button onClick={() => navigate(-1)} className="mt-4 px-4 py-2 bg-primary text-primary-foreground rounded-lg">Go Back</button>
            </div>
        );
    }
    
    const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
    const priceColor = isPositive ? "text-success" : "text-destructive";

    return (
        <div className="bg-background min-h-screen text-foreground font-sans">
            <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg">
                <div className="max-w-5xl mx-auto p-4 flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 mr-2 rounded-full hover:bg-secondary">
                        <ArrowLeft size={24} />
                    </button>
                    <img src={coin.image} alt={coin.name} className="w-8 h-8 mr-3"/>
                    <h1 className="text-2xl font-bold">{coin.name}</h1>
                    <span className="text-lg text-muted-foreground ml-2">({coin.symbol.toUpperCase()})</span>
                </div>
            </header>

            <main className="max-w-5xl mx-auto p-4 md:p-6 space-y-8 pb-28">
                <section className="flex flex-col md:flex-row justify-between items-start gap-4">
                    <div>
                        <p className="text-sm text-muted-foreground">{coin.name} Price ({coin.symbol.toUpperCase()})</p>
                        <p className={`text-4xl font-bold ${priceColor}`}>{formatNumber(coin.current_price, { minimumFractionDigits: 2, maximumFractionDigits: 6 })}</p>
                        <p className={`text-lg font-semibold ${priceColor}`}>
                            {isPositive ? '+' : ''}{(coin.price_change_percentage_24h || 0).toFixed(2)}% (24h)
                        </p>
                    </div>
                </section>
                
                <section className="h-80 bg-card p-4 rounded-lg border border-border">
                    <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData} margin={{ top: 5, right: 20, left: -10, bottom: 5 }}>
                            <defs>
                                <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor={isPositive ? 'rgb(var(--success))' : 'rgb(var(--destructive))'} stopOpacity={0.3}/>
                                    <stop offset="95%" stopColor={isPositive ? 'rgb(var(--success))' : 'rgb(var(--destructive))'} stopOpacity={0}/>
                                </linearGradient>
                            </defs>
                            <Tooltip
                                contentStyle={{ backgroundColor: 'rgb(var(--popover))', border: `1px solid rgb(var(--border))`, borderRadius: '0.5rem' }}
                                itemStyle={{ color: 'rgb(var(--popover-foreground))' }}
                                labelStyle={{ color: 'rgb(var(--muted-foreground))' }}
                                formatter={(value: number) => [formatNumber(value, {style: 'currency', currency: 'USD'}), "Price"]}
                                labelFormatter={(label) => new Date(label).toLocaleTimeString()}
                            />
                            <YAxis orientation="right" stroke="rgb(var(--muted-foreground))" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${Number(value).toFixed(0)}`} />
                            <Area type="monotone" dataKey="price" stroke={isPositive ? 'rgb(var(--success))' : 'rgb(var(--destructive))'} strokeWidth={2} fill="url(#chartGradient)" dot={false} />
                        </AreaChart>
                    </ResponsiveContainer>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-4">Key Statistics</h3>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <StatCard label="Market Cap" value={`$${formatNumber(coin.market_cap)}`} subValue={`Rank #${coin.market_cap_rank}`} />
                        <StatCard label="24h Volume" value={`$${formatNumber(coin.total_volume)}`} />
                        <StatCard label="24h High" value={`$${formatNumber(coin.high_24h || 0, { minimumFractionDigits: 2 })}`} />
                        <StatCard label="24h Low" value={`$${formatNumber(coin.low_24h || 0, { minimumFractionDigits: 2 })}`} />
                    </div>
                </section>

                <section>
                    <h3 className="text-xl font-bold mb-4">About {coin.name}</h3>
                    <div className="bg-card p-6 rounded-lg border border-border">
                        <p className="text-muted-foreground leading-relaxed">{coin.description || 'No description available.'}</p>
                    </div>
                </section>
            </main>
            
            <footer className="fixed bottom-0 left-0 right-0 bg-background/80 backdrop-blur-lg border-t border-border">
                <div className="max-w-5xl mx-auto p-4">
                    <button
                        onClick={() => navigate(`/trading/${coin.symbol.toUpperCase()}-USDT`)}
                        className="w-full bg-primary text-primary-foreground font-bold py-3 px-6 rounded-lg text-lg hover:bg-primary/90 transition-colors shadow-lg"
                    >
                        Trade {coin.symbol.toUpperCase()}
                    </button>
                </div>
            </footer>
        </div>
    );
};

export default CoinDetailScreen;
