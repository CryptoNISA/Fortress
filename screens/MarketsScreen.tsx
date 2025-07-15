
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  RefreshCw,
  Star,
  ChevronUp,
  ChevronDown,
  AlertCircle
} from 'lucide-react';
import type { CryptoCoin, SortKey } from '../types.ts';

// Static mock data with updated 2025 prices
const mockCryptoData: CryptoCoin[] = [
  {
    id: 'bitcoin', symbol: 'BTC', name: 'Bitcoin',
    current_price: 108740.19, price_change_percentage_24h: -0.15,
    market_cap: 2150000000000, market_cap_rank: 1, total_volume: 1030000000,
    image: 'https://assets.coingecko.com/coins/images/1/small/bitcoin.png', high_24h: 110000, low_24h: 105000
  },
  {
    id: 'ripple', symbol: 'XRP', name: 'XRP',
    current_price: 2.27416, price_change_percentage_24h: -0.05,
    market_cap: 129000000000, market_cap_rank: 2, total_volume: 4420470000,
    image: 'https://assets.coingecko.com/coins/images/44/small/xrp-symbol-white-128.png', high_24h: 2.3, low_24h: 2.1
  },
  {
    id: 'ethereum', symbol: 'ETH', name: 'Ethereum',
    current_price: 2547.7, price_change_percentage_24h: -0.39,
    market_cap: 306000000000, market_cap_rank: 3, total_volume: 1020000000,
    image: 'https://assets.coingecko.com/coins/images/279/small/ethereum.png', high_24h: 2600, low_24h: 2500
  },
  {
    id: 'litecoin', symbol: 'LTC', name: 'Litecoin',
    current_price: 87.56, price_change_percentage_24h: -0.46,
    market_cap: 6580000000, market_cap_rank: 4, total_volume: 1510730000,
    image: 'https://assets.coingecko.com/coins/images/2/small/litecoin.png', high_24h: 90, low_24h: 85
  },
  {
    id: 'cardano', symbol: 'ADA', name: 'Cardano',
    current_price: 0.58486, price_change_percentage_24h: -0.12,
    market_cap: 20400000000, market_cap_rank: 5, total_volume: 1681150000,
    image: 'https://assets.coingecko.com/coins/images/975/small/cardano.png', high_24h: 0.6, low_24h: 0.55
  },
  {
    id: 'tron', symbol: 'TRX', name: 'TRON',
    current_price: 0.285657, price_change_percentage_24h: 0.00,
    market_cap: 24500000000, market_cap_rank: 6, total_volume: 581320000,
    image: 'https://assets.coingecko.com/coins/images/1094/small/tron-logo.png', high_24h: 0.3, low_24h: 0.28
  },
  {
    id: 'ethereum-classic', symbol: 'ETC', name: 'Ethereum Classic',
    current_price: 16.6581, price_change_percentage_24h: 0.26,
    market_cap: 2450000000, market_cap_rank: 7, total_volume: 1620000,
    image: 'https://assets.coingecko.com/coins/images/453/small/ethereum-classic-logo.png', high_24h: 17, low_24h: 16
  },
  {
    id: 'eos', symbol: 'EOS', name: 'EOS',
    current_price: 0.7231, price_change_percentage_24h: -1.35,
    market_cap: 767000000, market_cap_rank: 8, total_volume: 40650000,
    image: 'https://assets.coingecko.com/coins/images/738/small/eos-eos-logo.png', high_24h: 0.75, low_24h: 0.70
  },
  {
    id: 'chainlink', symbol: 'LINK', name: 'Chainlink',
    current_price: 13.4586, price_change_percentage_24h: 0.16,
    market_cap: 8150000000, market_cap_rank: 9, total_volume: 1239300000,
    image: 'https://assets.coingecko.com/coins/images/877/small/chainlink-new-logo.png', high_24h: 14, low_24h: 13
  },
  {
    id: 'bitcoin-cash', symbol: 'BCH', name: 'Bitcoin Cash',
    current_price: 497.03, price_change_percentage_24h: 0.40,
    market_cap: 9820000000, market_cap_rank: 10, total_volume: 1406950000,
    image: 'https://assets.coingecko.com/coins/images/780/small/bitcoin-cash-circle.png', high_24h: 500, low_24h: 490
  },
  {
    id: 'iota', symbol: 'IOTA', name: 'IOTA',
    current_price: 0.1587, price_change_percentage_24h: 0.00,
    market_cap: 558000000, market_cap_rank: 11, total_volume: 165180000,
    image: 'https://assets.coingecko.com/coins/images/692/small/IOTA_Swirl.png', high_24h: 0.16, low_24h: 0.15
  },
  {
    id: 'tellor', symbol: 'TRB', name: 'Tellor',
    current_price: 36.831, price_change_percentage_24h: 0.34,
    market_cap: 98700000, market_cap_rank: 12, total_volume: 87030000,
    image: 'https://assets.coingecko.com/coins/images/9644/small/Blk_icon_current.png', high_24h: 38, low_24h: 35
  },
  {
    id: 'zcash', symbol: 'ZEC', name: 'Zcash',
    current_price: 39.22, price_change_percentage_24h: 1.81,
    market_cap: 623000000, market_cap_rank: 13, total_volume: 74490000,
    image: 'https://assets.coingecko.com/coins/images/486/small/circle-zcash-color.png', high_24h: 40, low_24h: 38
  },
  {
    id: 'monero', symbol: 'XMR', name: 'Monero',
    current_price: 319.55, price_change_percentage_24h: 0.96,
    market_cap: 5920000000, market_cap_rank: 14, total_volume: 945030000,
    image: 'https://assets.coingecko.com/coins/images/69/small/monero_logo.png', high_24h: 325, low_24h: 315
  },
  {
    id: 'bitcoin-sv', symbol: 'BSV', name: 'Bitcoin SV',
    current_price: 24.35, price_change_percentage_24h: 0.48,
    market_cap: 481000000, market_cap_rank: 15, total_volume: 316620000,
    image: 'https://assets.coingecko.com/coins/images/6799/small/BSV.png', high_24h: 25, low_24h: 24
  },
  {
    id: 'huobi-token', symbol: 'HT', name: 'Huobi Token',
    current_price: 1.7964, price_change_percentage_24h: 1.74,
    market_cap: 278000000, market_cap_rank: 16, total_volume: 1349890000,
    image: 'https://assets.coingecko.com/coins/images/2822/small/huobi-token-logo.png', high_24h: 1.85, low_24h: 1.75
  },
];

const formatVolume = (volume: number) => {
  if (volume >= 1e9) return `${(volume / 1e9).toFixed(2)}B`;
  if (volume >= 1e6) return `${(volume / 1e6).toFixed(2)}M`;
  if (volume >= 1e3) return `${(volume / 1e3).toFixed(2)}K`;
  return volume.toString();
};

const CoinRow = ({ coin, navigate }: { coin: CryptoCoin, navigate: (path: string) => void }) => {
  const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
  const changeColor = isPositive ? 'text-success' : 'text-destructive';
  const changeBgColor = isPositive ? 'bg-success' : 'bg-destructive';
  const changeText = `${isPositive ? '+' : ''}${(coin.price_change_percentage_24h || 0).toFixed(2)}%`;

  return (
    <div
      onClick={() => navigate(`/coin/${coin.id}`)}
      className="grid grid-cols-12 items-center py-4 px-4 border-b border-border hover:bg-secondary cursor-pointer transition-colors"
    >
      {/* Name/24H amount */}
      <div className="col-span-4 flex items-center gap-3">
        <img src={coin.image} alt={coin.name} className="w-8 h-8 rounded-full" />
        <div>
          <div className="font-bold">
            <span className="text-base text-foreground">{coin.symbol.toUpperCase()}</span>
            <span className="text-xs text-muted-foreground">/USDT</span>
          </div>
          <div className="text-xs text-muted-foreground mt-1">
            24H {formatVolume(coin.total_volume)}
          </div>
        </div>
      </div>

      {/* Last price */}
      <div className="col-span-4 text-right">
        <div className={`text-base font-bold ${changeColor}`}>
          {coin.current_price < 1 ? coin.current_price.toFixed(6) : coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div className="text-xs text-muted-foreground mt-1">
          ${coin.current_price < 1 ? coin.current_price.toFixed(6) : coin.current_price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
      </div>

      {/* 24H chg% */}
      <div className="col-span-4 text-right">
        <div className={`inline-block px-3 py-1.5 text-primary-foreground text-sm font-semibold rounded-md ${changeBgColor}`}>
          {changeText}
        </div>
      </div>
    </div>
  );
};

export default function Markets() {
  const [coins, setCoins] = useState<CryptoCoin[]>(mockCryptoData);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('market_cap_rank');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const navigate = useNavigate();

  // Simulate data refresh with small price variations
  const refreshData = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setCoins(prevCoins =>
        prevCoins.map(coin => ({
          ...coin,
          current_price: coin.current_price * (1 + (Math.random() - 0.5) * 0.02), // ±1% variation
          price_change_percentage_24h: coin.price_change_percentage_24h + (Math.random() - 0.5) * 2 // ±1% variation
        }))
      );
      setIsRefreshing(false);
    }, 1000);
  }, []);

  const sortedAndFilteredCoins = useMemo(() => {
    return coins
      .filter(coin =>
        coin.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coin.symbol.toLowerCase().includes(searchTerm.toLowerCase())
      )
      .sort((a, b) => {
        const valA = a[sortKey];
        const valB = b[sortKey];
        if (valA === null) return 1;
        if (valB === null) return -1;
        if (valA < valB) return sortOrder === 'asc' ? -1 : 1;
        if (valA > valB) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
  }, [coins, searchTerm, sortKey, sortOrder]);

  const SortButton = ({ tsortKey, label }: {tsortKey: SortKey, label: string}) => {
    const isActive = sortKey === tsortKey;
    
    const handleSort = () => {
        if (isActive) {
            setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'));
        } else {
            setSortKey(tsortKey);
            setSortOrder('desc'); // Default to descending for new sort keys
        }
    };
    
    return (
        <button onClick={handleSort} className={`flex items-center gap-1 ${isActive ? 'text-primary' : 'text-muted-foreground'}`}>
            <span>{label}</span>
            {isActive && (sortOrder === 'asc' ? <ChevronUp size={16} /> : <ChevronDown size={16} />)}
        </button>
    );
};

  return (
    <div className="animate-fade-in max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <header className="py-4 border-b border-border">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-bold">Markets</h1>
          <div className="flex items-center gap-2">
            <button
              onClick={refreshData}
              disabled={isRefreshing}
              className="bg-card border border-border rounded-lg p-3 disabled:opacity-50 hover:bg-secondary transition-colors"
            >
              <RefreshCw size={20} className={isRefreshing ? 'animate-spin' : ''} />
            </button>
          </div>
        </div>
      </header>

      {/* Tab */}
      <div className="py-2">
        <div className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-lg text-sm font-medium">
          USDT
        </div>
      </div>

      {/* Search */}
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <input
            type="text"
            placeholder="Search coins..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-card border border-border rounded-lg pl-10 pr-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-ring"
          />
        </div>
      </div>

      {/* Market Data */}
      <div className="bg-card rounded-lg shadow-sm dark:shadow-none overflow-hidden">
        {/* Header Row */}
        <div className="grid grid-cols-12 items-center p-4 border-b border-border text-xs font-semibold text-muted-foreground">
          <div className="col-span-4">
            <SortButton tsortKey="market_cap_rank" label="Name/24H amount" />
          </div>
          <div className="col-span-4 text-right">
            <SortButton tsortKey="current_price" label="Last price" />
          </div>
          <div className="col-span-4 text-right">
            <SortButton tsortKey="price_change_percentage_24h" label="24H chg%" />
          </div>
        </div>

        {/* Data Rows */}
        <div>
          {loading ? (
            <div className="text-center py-10 text-muted-foreground">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2">Loading...</p>
            </div>
          ) : error ? (
            <div className="text-center py-10 text-destructive">
              <AlertCircle size={48} className="mx-auto mb-4" />
              <p>{error}</p>
            </div>
          ) : sortedAndFilteredCoins.length === 0 ? (
            <p className="text-center py-10 text-muted-foreground">No coins found</p>
          ) : (
            sortedAndFilteredCoins.map(coin => (
              <CoinRow
                key={coin.id}
                coin={coin}
                navigate={navigate}
              />
            ))
          )}
        </div>
      </div>
    </div>
  );
}
