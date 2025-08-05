
import * as React from "react";
import { useNavigate } from "react-router-dom";
import {
  CreditCard,
  Download,
  Scale,
  Headset,
  Volume2,
  Gift,
  Users,
  MessageSquare,
  ShieldCheck,
} from "lucide-react";
import type { CryptoCoin } from "../types.ts";
import { useAuth } from "../contexts/AuthContext.tsx";
import { MOCK_CRYPTO_COINS } from "../lib/mock-market-data.ts";

const iconMap: { [key: string]: React.ElementType } = {
  CreditCard,
  Download,
  Scale,
  Headset,
  Gift,
  Users,
  MessageSquare,
  ShieldCheck,
};

const carouselSlides = [
  {
    bg: "https://greenstreetnews.com/tachyon/2022/06/fortress_investment-scaled.jpg?resize=1200,630",
    text: "SECURE & RELIABLE",
  },
  {
    bg: "https://media.licdn.com/dms/image/v2/D4E3DAQED9UYygoLY2Q/image-scale_191_1128/image-scale_191_1128/0/1715719849990/fortress_investment_group_cover?e=2147483647&v=beta&t=lEcbjUJh5PWzPXohDMaO4BIbTuimL1mRUfi5REhSsL8",
    text: "INSTANT TRANSACTIONS",
  },
  {
    bg: "https://www.topdevelopers.co/blog/wp-content/uploads/crypto-exchange-app-development-a-comprehensive-guide.jpg",
    text: "ADVANCED CHARTING",
  },
  {
    bg: "https://stealthex.io/blog/wp-content/uploads/2022/09/Best_Crypto_Exchanges-1-min.png",
    text: "NAVIGATE VOLATILITY",
  },
];

const HomeScreen = () => {
  const navigate = useNavigate();
  const { systemSettings } = useAuth();
  const [activeSlide, setActiveSlide] = React.useState(0);
  const [activeTab, setActiveTab] = React.useState("Hot");
  const [marketData, setMarketData] = React.useState<CryptoCoin[]>([]);
  const [loading, setLoading] = React.useState(true);

  const actionMenuItems = React.useMemo(() => {
    const defaultItems = [
      {
        id: "recharge",
        icon: "https://cdn-icons-png.flaticon.com/512/1019/1019709.png",
        label: "Recharge",
        path: "/profile",
        state: { view: "deposit" },
      },
      {
        id: "withdraw",
        icon: "https://cdn-icons-png.flaticon.com/512/2953/2953358.png",
        label: "Withdraw",
        path: "/profile",
        state: { view: "withdraw" },
      },
      {
        id: "balance",
        icon: "https://cdn-icons-png.flaticon.com/512/1570/1570911.png",
        label: "Balance",
        path: "/profile",
        state: {},
      },
      {
        id: "support",
        icon: "https://cdn-icons-png.flaticon.com/512/259/259582.png",
        label: "Support",
        path: "https://t.me/FortressInvestmentSupport",
      },
    ];

    if (systemSettings?.homepageActionItems) {
      return systemSettings.homepageActionItems
        .filter((item) => item.enabled)
        .sort((a, b) => a.order - b.order)
        .map((item) => {
            const isUrl = typeof item.icon === 'string' && item.icon.startsWith('http');
            return ({ ...item, icon: isUrl ? item.icon : iconMap[item.icon] || Headset });
        });
    }

    return defaultItems;
  }, [systemSettings]);

  React.useEffect(() => {
    const loadMarketData = () => {
      setLoading(true);
      // Use mock data in development to avoid CORS and fetch issues
      setTimeout(() => {
        setMarketData(MOCK_CRYPTO_COINS.slice(0, 10));
        setLoading(false);
      }, 100);
    };

    loadMarketData();
    // Update mock data periodically to simulate real-time changes
    const intervalId = setInterval(() => {
      const updatedData = MOCK_CRYPTO_COINS.slice(0, 10).map((coin) => ({
        ...coin,
        current_price: coin.current_price * (0.98 + Math.random() * 0.04), // ±2% variation
        price_change_percentage_24h:
          (coin.price_change_percentage_24h || 0) * (0.9 + Math.random() * 0.2), // ±10% variation
      }));
      setMarketData(updatedData);
    }, 30000);

    return () => clearInterval(intervalId);
  }, []);

  React.useEffect(() => {
    if (carouselSlides.length <= 1) return;
    const timer = setTimeout(() => {
      setActiveSlide((prev) => (prev + 1) % carouselSlides.length);
    }, 5000);
    return () => clearTimeout(timer);
  }, [activeSlide]);

  const handleActionClick = (path: string, state?: any) => {
    if (path.startsWith("http")) {
      window.open(path, "_blank", "noopener,noreferrer");
    } else {
      navigate(path, { state });
    }
  };

  const MarketRow = ({ coin }: { coin: CryptoCoin }) => {
    const isPositive = (coin.price_change_percentage_24h || 0) >= 0;
    const priceColor = isPositive ? "text-success" : "text-destructive";
    const badgeBg = isPositive ? "bg-success" : "bg-destructive";
    const changeText = `${isPositive ? '+' : ''} ${(coin.price_change_percentage_24h || 0).toFixed(2)}%`;

    return (
        <div
            className="grid grid-cols-3 items-center py-3 px-2 rounded-md hover:bg-secondary cursor-pointer"
            onClick={() => navigate(`/trading/${coin.symbol.toUpperCase()}-USDT`)}
        >
            <div className="flex items-center gap-2">
                <img src={coin.image} alt={coin.name} className="w-7 h-7" />
                <p className="font-bold">{coin.symbol.toUpperCase()}/USDT</p>
            </div>
            <p className={`text-center font-semibold ${priceColor}`}>
                {coin.current_price.toLocaleString("en-US", {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 6,
                })}
            </p>
            <div className="flex justify-end">
                <div className={`${badgeBg} text-white font-semibold text-sm px-3 py-1.5 rounded-md`}>
                    {changeText}
                </div>
            </div>
        </div>
    );
  };

  return (
    <div className="animate-fade-in">
        <div className="max-w-screen-xl mx-auto px-4 sm:px-6 lg:px-8">
            <header className="py-4">
                <h1 className="text-xl font-bold text-center">Home</h1>
            </header>

            <main className="space-y-6">
                {/* Carousel */}
                <div className="relative w-full h-44 bg-card rounded-lg overflow-hidden group">
                {carouselSlides.map((slide, index) => (
                    <div
                    key={index}
                    className={`absolute inset-0 transition-opacity duration-1000 ${index === activeSlide ? "opacity-100" : "opacity-0"}`}
                    >
                    <img
                        src={slide.bg}
                        alt={slide.text}
                        className="w-full h-full object-cover"
                    />
                    <div
                        className="absolute bg-gradient-to-t from-black/60 to-transparent p-4 flex flex-col justify-end"
                        style={{
                        top: "-15px",
                        left: "0px",
                        right: "0px",
                        bottom: "0px",
                        }}
                    >
                        <h2 className="text-xl font-bold uppercase text-white text-center">
                        {slide.text}
                        </h2>
                    </div>
                    </div>
                ))}
                <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex space-x-2">
                    {carouselSlides.map((_, index) => (
                    <button
                        key={index}
                        onClick={() => setActiveSlide(index)}
                        className={`w-2 h-2 rounded-full transition-colors ${index === activeSlide ? "bg-accent-gold" : "bg-muted-foreground"}`}
                    ></button>
                    ))}
                </div>
                </div>

                {/* Announcement Bar */}
                <div className="flex items-center space-x-3 bg-secondary p-2 rounded-lg text-sm overflow-hidden">
                <Volume2 size={20} className="text-accent-gold flex-shrink-0" />
                <div className="flex-grow relative h-5">
                    <p className="absolute whitespace-nowrap animate-marquee">
                    Upgrade Announcement: System maintenance will be performed this
                    Sunday from 2 AM to 4 AM UTC.
                    </p>
                </div>
                </div>

                {/* Quick Action Menu */}
                <div className="grid grid-cols-4 gap-4 text-center">
                {actionMenuItems.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                        key={item.id}
                        onClick={() => handleActionClick(item.path, item.state)}
                        className="flex flex-col items-center space-y-2"
                        >
                        {typeof Icon === 'function' ? (
                            <Icon size={28} className="text-accent-gold" />
                        ) : (
                            <img src={Icon as string} alt={item.label} className="w-7 h-7" />
                        )}
                        <span className="text-sm font-medium">{item.label}</span>
                        </button>
                    );
                })}
                </div>

                {/* Market Data */}
                <div>
                <div className="flex space-x-6 border-b border-border mb-2">
                    <button
                    onClick={() => setActiveTab("Hot")}
                    className={`py-2 font-semibold ${activeTab === "Hot" ? "text-accent-gold border-b-2 border-accent-gold" : "text-foreground"}`}
                    >
                    Hot
                    </button>
                    <button
                    onClick={() => setActiveTab("Commodity")}
                    className={`py-2 font-semibold ${activeTab === "Commodity" ? "text-accent-gold border-b-2 border-accent-gold" : "text-foreground"}`}
                    >
                    Commodity
                    </button>
                </div>

                <div>
                    <div className="grid grid-cols-3 text-sm text-muted-foreground mb-2 px-2">
                    <p className="text-left">Name</p>
                    <p className="text-center">Price</p>
                    <p className="text-right">24h chg%</p>
                    </div>
                    <div className="space-y-1">
                    {loading && (
                        <p className="text-center text-muted-foreground py-4">
                        Loading...
                        </p>
                    )}
                    {!loading &&
                        activeTab === "Hot" &&
                        marketData.map((coin) => (
                        <MarketRow key={coin.id} coin={coin} />
                        ))}
                    {!loading && activeTab === "Commodity" && (
                        <p className="text-center text-muted-foreground py-4">
                        Commodity data not available.
                        </p>
                    )}
                    </div>
                </div>
                </div>
            </main>
        </div>
    </div>
  );
};

export default HomeScreen;
