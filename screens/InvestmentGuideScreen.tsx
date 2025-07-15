
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, BookOpen, ChevronDown, TrendingUp, ShieldCheck, PieChart, BrainCircuit } from 'lucide-react';

const AccordionItem = ({ icon, title, children, isOpen, onToggle }: { icon: React.ReactNode; title: string; children: React.ReactNode; isOpen: boolean; onToggle: () => void; }) => {
    return (
        <div className="border-b border-border">
            <button
                onClick={onToggle}
                className="w-full flex justify-between items-center text-left p-4 hover:bg-secondary transition-colors"
            >
                <div className="flex items-center gap-4">
                    {icon}
                    <span className="font-semibold text-lg">{title}</span>
                </div>
                <ChevronDown size={24} className={`transform transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`} />
            </button>
            <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${isOpen ? 'max-h-screen' : 'max-h-0'}`}
            >
                <div className="p-4 pt-0 text-muted-foreground space-y-4">
                    {children}
                </div>
            </div>
        </div>
    );
};

const InvestmentGuideScreen = () => {
    const navigate = useNavigate();
    const [openAccordion, setOpenAccordion] = React.useState<string | null>(null);

    const toggleAccordion = (title: string) => {
        setOpenAccordion(openAccordion === title ? null : title);
    };

    const guideContent = [
        {
            icon: <BrainCircuit size={24} className="text-primary" />,
            title: 'What is Cryptocurrency?',
            content: (
                <>
                    <p>Cryptocurrency is a digital or virtual currency that uses cryptography for security. Unlike traditional currencies issued by governments (like the U.S. dollar), cryptocurrencies are typically decentralized.</p>
                    <p><strong>Key Features:</strong></p>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                        <li><strong>Decentralized:</strong> Not controlled by any single entity like a bank or government.</li>
                        <li><strong>Blockchain Technology:</strong> Transactions are recorded on a public ledger called a blockchain.</li>
                        <li><strong>Secure:</strong> Cryptographic techniques secure transactions and control the creation of new units.</li>
                    </ul>
                </>
            ),
        },
        {
            icon: <TrendingUp size={24} className="text-success" />,
            title: 'Understanding the Market',
            content: (
                 <>
                    <p>The crypto market is known for its volatility. Understanding key concepts can help you navigate it.</p>
                    <p><strong>Bull vs. Bear Market:</strong></p>
                    <ul className="list-disc list-inside space-y-1 pl-2">
                        <li>A <strong>bull market</strong> is characterized by rising prices and optimism.</li>
                        <li>A <strong>bear market</strong> is characterized by falling prices and pessimism.</li>
                    </ul>
                     <p className="mt-2"><strong>Volatility:</strong> This refers to how quickly and drastically prices change. High volatility means higher potential rewards but also higher risks.</p>
                </>
            ),
        },
        {
            icon: <PieChart size={24} className="text-yellow-500" />,
            title: 'Common Trading Strategies',
            content: (
                <>
                    <p>There are many ways to approach trading. Here are a few common strategies:</p>
                    <ul className="list-disc list-inside space-y-2 pl-2">
                        <li><strong>HODLing (Buy and Hold):</strong> The simplest strategy. You buy a cryptocurrency and hold it for a long period, regardless of short-term price fluctuations, believing in its long-term potential.</li>
                        <li><strong>Day Trading:</strong> Buying and selling assets within the same day to profit from small price movements. This is a high-risk, high-reward strategy that requires significant time and attention.</li>
                        <li><strong>Swing Trading:</strong> Holding assets for several days or weeks to profit from expected "swings" in the market. It's a middle ground between HODLing and day trading.</li>
                    </ul>
                </>
            ),
        },
        {
            icon: <ShieldCheck size={24} className="text-blue-500" />,
            title: 'Risk Management',
            content: (
                <>
                    <p>Protecting your capital is the most important part of investing. Never invest more than you are willing to lose.</p>
                     <ul className="list-disc list-inside space-y-2 pl-2">
                        <li><strong>Diversification:</strong> Don't put all your eggs in one basket. Spread your investments across different cryptocurrencies to reduce risk.</li>
                        <li><strong>Do Your Own Research (DYOR):</strong> Don't just follow hype. Understand the technology, team, and purpose behind any crypto you invest in.</li>
                        <li><strong>Use Stop-Loss Orders:</strong> Automatically sell an asset if it drops to a certain price to limit your potential losses.</li>
                    </ul>
                </>
            ),
        },
    ];

    return (
        <div className="bg-background text-foreground min-h-screen font-sans">
             <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg">
                <div className="max-w-4xl mx-auto p-4 flex items-center">
                    <button onClick={() => navigate(-1)} className="p-2 mr-2 rounded-full hover:bg-secondary">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold">Investment Guide</h1>
                </div>
            </header>
            <main className="max-w-4xl mx-auto p-4 md:p-6 pb-24 animate-fade-in">
                <div className="bg-card rounded-lg overflow-hidden border border-border">
                    {guideContent.map((item) => (
                        <AccordionItem
                            key={item.title}
                            icon={item.icon}
                            title={item.title}
                            isOpen={openAccordion === item.title}
                            onToggle={() => toggleAccordion(item.title)}
                        >
                            {item.content}
                        </AccordionItem>
                    ))}
                </div>
            </main>
        </div>
    );
};

export default InvestmentGuideScreen;
