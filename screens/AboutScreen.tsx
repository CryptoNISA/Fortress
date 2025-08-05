
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronRight, Building, Globe, Users } from 'lucide-react';

// --- Reusable Components (can be local to this file) ---
const StatCard = ({ value, label, icon }: { value: string; label: string; icon: React.ReactNode }) => (
    <div className="bg-card p-6 rounded-xl shadow-sm dark:shadow-none border border-border flex flex-col items-center text-center">
        {icon}
        <p className="text-4xl font-extrabold text-card-foreground mt-3">{value}</p>
        <p className="text-muted-foreground mt-1">{label}</p>
    </div>
);

const PolicySection = ({ title, children }: { title: string, children: React.ReactNode }) => (
    <div className="bg-card rounded-xl p-6 shadow-sm dark:shadow-none border border-border">
        <h3 className="text-xl font-bold text-card-foreground mb-3">{title}</h3>
        <div className="space-y-2 text-muted-foreground leading-relaxed">
            {children}
        </div>
    </div>
);


// --- Main Screen Component ---
const AboutScreen = () => {
    const navigate = useNavigate();
    const [view, setView] = React.useState('menu'); // 'menu', 'about', 'agreement', 'policy'

    // --- Back Button Handling Logic ---
    React.useEffect(() => {
        const handlePopState = () => {
            if (view !== 'menu') {
                setView('menu');
            }
        };
        window.addEventListener('popstate', handlePopState);
        return () => window.removeEventListener('popstate', handlePopState);
    }, [view]);

    const changeView = (newView: string) => {
        if (view === 'menu' && newView !== 'menu') {
            window.history.pushState({ view: newView }, '');
        }
        setView(newView);
    };

    const handleBack = () => {
        if (view !== 'menu') {
            window.history.back();
        } else {
            navigate(-1);
        }
    };
    // --- End Back Button Logic ---


    const getTitle = () => {
        switch (view) {
            case 'about': return 'About Fortress';
            case 'agreement': return 'User Agreement';
            case 'policy': return 'Privacy Policy';
            default: return 'About';
        }
    };
    
    const menuItems = [
        { label: 'About us', action: () => changeView('about') },
        { label: 'User Agreement', action: () => changeView('agreement') },
        { label: 'Privacy Policy', action: () => changeView('policy') },
    ];
    
    const renderContent = () => {
        switch (view) {
            case 'about':
                return (
                    <div className="space-y-8">
                        <section className="text-center">
                            <h2 className="text-2xl md:text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-purple-500 to-blue-500 mb-2">
                                Institutional Investors
                            </h2>
                            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
                                We manage assets on behalf of many of the world’s largest and most sophisticated investors, who in turn represent the interests of millions of workers and retirees.
                            </p>
                        </section>
                        
                        <PolicySection title="Overview: Trusted Stewards of Institutional Capital">
                            <p>Fortress has been a trusted partner for institutional investors for over two decades. Our overriding objective is to help these limited partners achieve their investment goals and to support the financial well-being and security of their beneficiaries. These limited partners include public and private pensions, sovereign wealth funds, endowments and foundations, insurance companies and family offices.</p>
                        </PolicySection>

                        <section className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
                            <StatCard value="1,700" label="Institutional Investors" icon={<Building size={36} className="text-primary"/>} />
                            <StatCard value="50+" label="Countries Represented" icon={<Globe size={36} className="text-blue-500"/>} />
                            <StatCard value="8,500" label="Institutional Commitments" icon={<Users size={36} className="text-success"/>} />
                        </section>

                        <footer className="text-center text-sm text-muted-foreground pt-8 border-t border-border">
                            <p>As of December 31, 2023.</p>
                        </footer>
                    </div>
                );
            case 'agreement':
                return (
                     <div className="space-y-8">
                        <PolicySection title="1. Introduction">
                            <p>This User Agreement ("Agreement") is a contract between you and Fortress Investment Group ("Fortress," "we," "us," or "our") and applies to your use of the Fortress trading platform and all related services ("Services"). By opening an account and using our Services, you agree to be bound by the terms and conditions of this Agreement.</p>
                        </PolicySection>
                        <PolicySection title="2. User Obligations">
                            <p>You agree to provide accurate, current, and complete information during the registration process and to update such information to keep it accurate. You are responsible for maintaining the confidentiality of your account credentials and for all activities that occur under your account.</p>
                        </PolicySection>
                        <PolicySection title="3. Trading Risks">
                            <p>You acknowledge and agree that trading cryptocurrencies involves significant risk. The value of digital assets can be volatile and may fluctuate, and you may lose more than your initial investment. You should carefully consider your investment objectives and risk tolerance before trading.</p>
                        </PolicySection>
                    </div>
                );
            case 'policy':
                return (
                    <div className="space-y-8">
                        <PolicySection title="1. Information We Collect">
                            <p>We collect personal information you provide to us, such as your name, email address, and financial information, when you register for an account and use our Services. We also collect information automatically, such as your IP address and device information.</p>
                        </PolicySection>
                        <PolicySection title="2. How We Use Your Information">
                            <p>We use your information to provide, maintain, and improve our Services, to process transactions, to verify your identity, and to communicate with you. We may also use your information for marketing purposes, subject to your consent where required by law.</p>
                        </PolicySection>
                        <PolicySection title="3. Data Security">
                            <p>We implement robust security measures to protect your personal information from unauthorized access, use, or disclosure. However, no method of transmission over the Internet or electronic storage is 100% secure.</p>
                        </PolicySection>
                    </div>
                );
            case 'menu':
            default:
                return (
                     <div className="bg-card rounded-lg shadow-sm dark:shadow-none border border-border overflow-hidden">
                        <div className="divide-y divide-border">
                            {menuItems.map(item => (
                                <button key={item.label} onClick={item.action} className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors text-left">
                                    <span className="font-medium text-card-foreground">{item.label}</span>
                                    <ChevronRight size={20} className="text-muted-foreground" />
                                </button>
                            ))}
                        </div>
                    </div>
                );
        }
    };

    return (
        <div className="bg-background text-foreground min-h-screen font-sans">
             <header className="sticky top-0 z-10 bg-background/80 backdrop-blur-lg">
                <div className="max-w-5xl mx-auto p-4 flex items-center">
                    <button onClick={handleBack} className="p-2 mr-2 rounded-full hover:bg-secondary">
                        <ArrowLeft size={24} />
                    </button>
                    <h1 className="text-2xl font-bold">{getTitle()}</h1>
                </div>
            </header>
            <main className="max-w-5xl mx-auto p-4 md:p-6 pb-24 animate-fade-in">
                {renderContent()}
            </main>
        </div>
    );
};

export default AboutScreen;
