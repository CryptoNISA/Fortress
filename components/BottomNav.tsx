
import * as React from 'react';
import { NavLink } from 'react-router-dom';
import { Home, CandlestickChart, Timer, User } from 'lucide-react';

const NavItem = ({ to, icon, label }: { to: string; icon: React.ReactNode; label: string }) => {
  const activeClass = 'text-primary';
  const inactiveClass = 'text-muted-foreground hover:text-primary';

  if (to.startsWith('http')) {
    return (
      <a
        href={to}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex flex-col items-center justify-center w-full transition-colors duration-200 ${inactiveClass}`}
      >
        {icon}
        <span className="text-xs mt-1">{label}</span>
      </a>
    );
  }

  return (
    <NavLink
      to={to}
      className={({ isActive }) => 
        `flex flex-col items-center justify-center w-full transition-colors duration-200 ${isActive ? activeClass : inactiveClass}`
      }
    >
      {icon}
      <span className="text-xs mt-1">{label}</span>
    </NavLink>
  );
};

const BottomNav = () => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 h-20 bg-background/80 backdrop-blur-lg border-t border-border flex justify-around items-center z-50">
      <NavItem to="/" icon={<Home size={24} />} label="Home" />
      <NavItem to="/markets" icon={<CandlestickChart size={24} />} label="Markets" />
      <NavItem to="/trading" icon={<Timer size={24} />} label="Contract" />
      <NavItem to="/profile" icon={<User size={24} />} label="Profile" />
    </nav>
  );
};

export default BottomNav;