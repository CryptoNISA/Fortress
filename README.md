# Fortress Investment Group

A comprehensive crypto trading application by Fortress Investment Group, with live market data, an advanced trading interface, and user profile management.

This is a sophisticated, feature-rich web application designed to simulate a real-world cryptocurrency trading platform. It's built with modern web technologies and focuses on providing a clean, responsive, and intuitive user experience for both traders and administrators.

## ✨ Features

### For Users
- **Secure Authentication:** Standard email/password signup and login.
- **Dashboard Homepage:** At-a-glance view of market movers, announcements, and quick actions.
- **Live Market Data:** Real-time (simulated) price updates for various cryptocurrency pairs.
- **Advanced Trading:** 
    - A "Second Contract" trading interface for placing timed trades (Buy/Long or Sell/Short).
    - Interactive charts powered by Recharts.
    - Order book and recent trades widgets.
- **Comprehensive Profile Management:**
    - **KYC Verification:** A complete flow for users to submit identity documents for verification.
    - **Deposit & Withdrawal:** A mock process for managing funds with multiple crypto networks (TRC20, ERC20, BTC).
    - **Order History:** A detailed view of all past transactions.
    - **Security Center:** Change password, set up a separate fund password, and manage 2FA.
    - **Referral Program:** Unique referral codes and links for users to invite friends and earn rewards.
- **Customizable Appearance:** Switch between Light, Dark, and System themes.
- **Responsive Design:** Fully usable on both desktop and mobile devices.

### For Admins
- **Admin Dashboard:** Overview of key platform statistics (total users, pending requests).
- **User Management:** View all users, edit balances, and create new users manually.
- **KYC Approval Queue:** Review and approve/reject user KYC submissions with ID image viewing.
- **Order Management:** A centralized view to manage all pending deposits and withdrawals.
- **Trade Control:** Manually resolve active timed contracts for users.
- **System Settings:** Configure platform-wide settings like deposit addresses, homepage action items, and VIP tier rules.

## 🛠️ Tech Stack

- **Frontend:** React, TypeScript
- **Styling:** Tailwind CSS with CSS Variables for theming
- **Charting:** Recharts
- **Icons:** Lucide React
- **Module System:** ES Modules with `importmap` (no build step)
- **Mock Backend:** A complete mock API server running in the browser using `localStorage` for persistence.

## 🚀 Running the Application

This application is designed to run in a special environment that supports direct ES module imports. Simply load the `index.html` file, and the application will start. All data is mocked and stored in your browser's `localStorage`.

**Admin Credentials:**
- **Email:** `admin@fortress.com`
- **Password:** `admin`
