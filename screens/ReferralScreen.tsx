
import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext.tsx';
import { ArrowLeft, Gift, Users, Copy, CheckCircle, Share2 } from 'lucide-react';
import type { ReferralInfo } from '../types.ts';

const ReferralScreen = () => {
    const navigate = useNavigate();
    const { user } = useAuth();
    const [copied, setCopied] = React.useState(false);

    if (!user) {
        return (
            <div className="flex justify-center items-center h-screen bg-background">
                <p>Loading user data...</p>
            </div>
        );
    }

    const referralLink = `${window.location.origin}${window.location.pathname}#/profile?ref=${user.referralCode}`;
    const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(referralLink)}`;

    const handleCopy = (text: string) => {
        navigator.clipboard.writeText(text);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };
    
    const handleShare = () => {
        if (navigator.share) {
            navigator.share({
                title: 'Join Fortress Investment Group!',
                text: `Join me on Fortress Investment Group and let's trade! Use my referral code: ${user.referralCode}`,
                url: referralLink,
            }).catch(console.error);
        } else {
            handleCopy(referralLink);
        }
    };

    const StatCard = ({ icon, label, value }: { icon: React.ReactNode; label: string; value: string | number }) => (
        <div className="bg-card p-4 rounded-lg flex items-center space-x-4 shadow-sm">
            {icon}
            <div>
                <p className="text-sm text-muted-foreground">{label}</p>
                <p className="text-xl font-bold">{value}</p>
            </div>
        </div>
    );

    const ReferralListItem = ({ referral }: { referral: ReferralInfo }) => {
        const statusStyles = {
            registered: 'bg-warning/10 text-warning',
            deposited: 'bg-success/10 text-success',
        };
        return (
            <div className="flex justify-between items-center bg-card p-3 rounded-lg">
                <div>
                    <p className="font-semibold">{referral.name}</p>
                    <p className="text-xs text-muted-foreground">{new Date(referral.date).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                     <span className={`px-2 py-1 text-xs font-semibold rounded-full capitalize ${statusStyles[referral.status]}`}>{referral.status}</span>
                     {referral.status === 'deposited' && <p className="text-sm font-bold text-success mt-1">+${referral.reward.toFixed(2)}</p>}
                </div>
            </div>
        );
    };

    return (
        <div className="min-h-screen bg-background text-foreground">
            <header className="flex items-center gap-4 p-4 border-b border-border sticky top-0 bg-background/80 backdrop-blur-lg z-10">
                <button onClick={() => navigate(-1)} className="p-2 hover:bg-secondary rounded-lg transition-colors">
                    <ArrowLeft className="w-5 h-5" />
                </button>
                <h1 className="text-xl font-semibold">Refer & Earn</h1>
            </header>
            
            <main className="p-4 space-y-6 max-w-5xl mx-auto pb-24">
                <div className="bg-gradient-to-br from-purple-600 to-blue-500 text-white p-6 rounded-2xl shadow-lg text-center space-y-4">
                    <h2 className="text-lg font-semibold">Share Your Code & Earn Rewards!</h2>
                    <p className="text-4xl font-bold tracking-widest bg-white/20 rounded-lg py-2 px-4 inline-block">{user.referralCode}</p>
                    <div className="flex justify-center gap-4">
                        <button onClick={() => handleCopy(user.referralCode)} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                            {copied ? <CheckCircle size={16} /> : <Copy size={16} />}
                            {copied ? 'Copied!' : 'Copy Code'}
                        </button>
                         <button onClick={handleShare} className="flex items-center gap-2 bg-white/20 hover:bg-white/30 px-4 py-2 rounded-lg text-sm font-semibold transition-colors">
                            <Share2 size={16} />
                            Share Link
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="sm:col-span-1 flex items-center justify-center bg-card p-4 rounded-lg">
                        <img src={qrCodeUrl} alt="Referral QR Code" className="w-32 h-32 rounded-md border border-border" />
                    </div>
                    <div className="sm:col-span-2 grid grid-cols-1 gap-4">
                         <StatCard icon={<Users size={24} className="text-primary"/>} label="Friends Invited" value={user.referredUsers.length} />
                         <StatCard icon={<Gift size={24} className="text-success"/>} label="Total Rewards" value={`$${user.portfolio.referralRewards.toFixed(2)}`} />
                    </div>
                </div>
                
                <div>
                    <h3 className="text-lg font-semibold mb-3">Your Referrals</h3>
                    <div className="space-y-2">
                        {user.referredUsers.length > 0 ? (
                           user.referredUsers.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map(ref => <ReferralListItem key={ref.uid} referral={ref} />)
                        ) : (
                            <div className="text-center text-muted-foreground py-8 bg-card rounded-lg">
                                <p className="font-semibold">You haven't referred anyone yet.</p>
                                <p className="text-sm mt-1">Share your code to start earning!</p>
                            </div>
                        )}
                    </div>
                </div>
            </main>
        </div>
    );
};

export default ReferralScreen;
