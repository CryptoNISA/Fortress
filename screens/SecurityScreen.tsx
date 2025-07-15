
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  Lock,
  KeyRound,
  ShieldCheck,
  X,
  Eye,
  EyeOff,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";
import { useAuth } from "../contexts/AuthContext.tsx";

type ModalType = "password" | "fund_password" | "2fa" | null;

// Reusable Modal Component
interface SecurityModalProps {
  title: string;
  children: React.ReactNode;
  onClose: () => void;
}

const SecurityModal: React.FC<SecurityModalProps> = ({
  title,
  children,
  onClose,
}) => {
  return (
    <div
      className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 animate-fade-in"
      onClick={onClose}
    >
      <div
        className="bg-card rounded-lg w-full max-w-md shadow-2xl animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between p-4 border-b border-border">
          <h2 className="text-lg font-semibold">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-secondary rounded-lg transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
        <div className="p-4">{children}</div>
      </div>
    </div>
  );
};

// Change Password Form Component
const ChangePasswordForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { changePassword, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    current: false,
    new: false,
    confirm: false,
  });
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (formData.newPassword.length < 8) {
      setStatus({
        type: "error",
        message: "New password must be at least 8 characters",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      setStatus({ type: "error", message: "Passwords do not match" });
      return;
    }

    try {
      await changePassword(formData.currentPassword, formData.newPassword);
      setStatus({ type: "success", message: "Password changed successfully!" });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to change password",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Current Password */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Current Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.current ? "text" : "password"}
            value={formData.currentPassword}
            onChange={(e) =>
              setFormData({ ...formData, currentPassword: e.target.value })
            }
            className="w-full p-3 pr-10 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter current password"
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords({
                ...showPasswords,
                current: !showPasswords.current,
              })
            }
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPasswords.current ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* New Password */}
      <div>
        <label className="block text-sm font-medium mb-2">New Password</label>
        <div className="relative">
          <input
            type={showPasswords.new ? "text" : "password"}
            value={formData.newPassword}
            onChange={(e) =>
              setFormData({ ...formData, newPassword: e.target.value })
            }
            className="w-full p-3 pr-10 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter new password"
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords({ ...showPasswords, new: !showPasswords.new })
            }
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPasswords.new ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          At least 8 characters required
        </p>
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Confirm New Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.confirm ? "text" : "password"}
            value={formData.confirmPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmPassword: e.target.value })
            }
            className="w-full p-3 pr-10 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Confirm new password"
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords({
                ...showPasswords,
                confirm: !showPasswords.confirm,
              })
            }
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPasswords.confirm ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {status && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            status.type === "success"
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {status.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : null}
        {isLoading ? "Changing..." : "Change Password"}
      </button>
    </form>
  );
};

// Fund Password Form Component
const FundPasswordForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, setFundPassword, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    loginPassword: "",
    fundPassword: "",
    confirmFundPassword: "",
  });
  const [showPasswords, setShowPasswords] = useState({
    login: false,
    fund: false,
    confirm: false,
  });
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (formData.fundPassword.length < 6) {
      setStatus({
        type: "error",
        message: "Fund password must be at least 6 characters",
      });
      return;
    }

    if (formData.fundPassword !== formData.confirmFundPassword) {
      setStatus({ type: "error", message: "Fund passwords do not match" });
      return;
    }

    try {
      await setFundPassword(formData.loginPassword, formData.fundPassword);
      setStatus({
        type: "success",
        message: "Fund password set successfully!",
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to set fund password",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-warning/10 border border-warning/20 text-warning p-3 rounded-lg text-sm">
        <p>
          Your login password is required to verify your identity before setting
          a fund password.
        </p>
      </div>

      {/* Login Password */}
      <div>
        <label className="block text-sm font-medium mb-2">Login Password</label>
        <div className="relative">
          <input
            type={showPasswords.login ? "text" : "password"}
            value={formData.loginPassword}
            onChange={(e) =>
              setFormData({ ...formData, loginPassword: e.target.value })
            }
            className="w-full p-3 pr-10 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter your login password"
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords({
                ...showPasswords,
                login: !showPasswords.login,
              })
            }
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPasswords.login ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Fund Password */}
      <div>
        <label className="block text-sm font-medium mb-2">
          {user?.fundPassword ? "New Fund Password" : "Fund Password"}
        </label>
        <div className="relative">
          <input
            type={showPasswords.fund ? "text" : "password"}
            value={formData.fundPassword}
            onChange={(e) =>
              setFormData({ ...formData, fundPassword: e.target.value })
            }
            className="w-full p-3 pr-10 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter fund password"
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords({ ...showPasswords, fund: !showPasswords.fund })
            }
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPasswords.fund ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
        <p className="text-xs text-muted-foreground mt-1">
          At least 6 characters required
        </p>
      </div>

      {/* Confirm Fund Password */}
      <div>
        <label className="block text-sm font-medium mb-2">
          Confirm Fund Password
        </label>
        <div className="relative">
          <input
            type={showPasswords.confirm ? "text" : "password"}
            value={formData.confirmFundPassword}
            onChange={(e) =>
              setFormData({ ...formData, confirmFundPassword: e.target.value })
            }
            className="w-full p-3 pr-10 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Confirm fund password"
            required
          />
          <button
            type="button"
            onClick={() =>
              setShowPasswords({
                ...showPasswords,
                confirm: !showPasswords.confirm,
              })
            }
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPasswords.confirm ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {status && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            status.type === "success"
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {status.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className="w-full bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
      >
        {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : null}
        {isLoading
          ? "Setting..."
          : user?.fundPassword
            ? "Update Fund Password"
            : "Set Fund Password"}
      </button>
    </form>
  );
};

// Two Factor Auth Form Component
const TwoFactorAuthForm: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const { user, toggle2FA, isLoading } = useAuth();
  const [formData, setFormData] = useState({
    loginPassword: "",
    code: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [status, setStatus] = useState<{
    type: "success" | "error";
    message: string;
  } | null>(null);

  const isEnabling = !user?.twoFactorEnabled;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=otpauth://totp/Fortress%20Investment%20Group:${encodeURIComponent(user?.email || "")}?secret=${user?.twoFactorSecret}&issuer=Fortress%20Investment%20Group`;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus(null);

    if (isEnabling && formData.code.length !== 6) {
      setStatus({
        type: "error",
        message: "Please enter a valid 6-digit code",
      });
      return;
    }

    try {
      await toggle2FA(formData.loginPassword, formData.code);
      setStatus({
        type: "success",
        message: `2FA ${isEnabling ? "enabled" : "disabled"} successfully!`,
      });
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setStatus({
        type: "error",
        message:
          err instanceof Error ? err.message : "Failed to update 2FA settings",
      });
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {isEnabling && (
        <div className="text-center">
          <h3 className="font-medium mb-3">Scan QR Code</h3>
          <div className="bg-white p-4 rounded-lg inline-block mb-3">
            <img src={qrCodeUrl} alt="2FA QR Code" className="w-48 h-48" />
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Scan this QR code with your authenticator app (Google Authenticator,
            Authy, etc.)
          </p>
        </div>
      )}

      {/* Login Password */}
      <div>
        <label className="block text-sm font-medium mb-2">Login Password</label>
        <div className="relative">
          <input
            type={showPassword ? "text" : "password"}
            value={formData.loginPassword}
            onChange={(e) =>
              setFormData({ ...formData, loginPassword: e.target.value })
            }
            className="w-full p-3 pr-10 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring"
            placeholder="Enter your login password"
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
          >
            {showPassword ? (
              <EyeOff className="w-4 h-4" />
            ) : (
              <Eye className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* 2FA Code (only when enabling) */}
      {isEnabling && (
        <div>
          <label className="block text-sm font-medium mb-2">
            Authenticator Code
          </label>
          <input
            type="text"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value })}
            className="w-full p-3 bg-background border border-border rounded-lg focus:outline-none focus:ring-2 focus:ring-ring text-center text-lg tracking-widest"
            placeholder="000000"
            maxLength={6}
            pattern="[0-9]{6}"
            required
          />
          <p className="text-xs text-muted-foreground mt-1">
            Enter the 6-digit code from your authenticator app
          </p>
        </div>
      )}

      {status && (
        <div
          className={`flex items-center gap-2 p-3 rounded-lg text-sm ${
            status.type === "success"
              ? "bg-success/10 text-success"
              : "bg-destructive/10 text-destructive"
          }`}
        >
          {status.type === "success" ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <AlertCircle className="w-4 h-4" />
          )}
          {status.message}
        </div>
      )}

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full disabled:opacity-50 text-white py-3 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 ${
          isEnabling
            ? "bg-success hover:bg-success/90"
            : "bg-destructive hover:bg-destructive/90"
        }`}
      >
        {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : null}
        {isLoading
          ? "Processing..."
          : isEnabling
            ? "Enable 2FA"
            : "Disable 2FA"}
      </button>
    </form>
  );
};

// Main Security Screen Component
export default function SecurityScreen() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [activeModal, setActiveModal] = useState<ModalType>(null);

  const securityItems = [
    {
      icon: Lock,
      label: "Change Password",
      description: "Update your login password",
      status: "Set",
      statusClass: "bg-success/10 text-success",
      action: () => setActiveModal("password"),
    },
    {
      icon: KeyRound,
      label: "Fund Password",
      description: "Set password for withdrawals",
      status: user?.fundPassword ? "Set" : "Not Set",
      statusClass: user?.fundPassword ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
      action: () => setActiveModal("fund_password"),
    },
    {
      icon: ShieldCheck,
      label: "Two-Factor Authentication",
      description: "Secure your account with 2FA",
      status: user?.twoFactorEnabled ? "Enabled" : "Disabled",
      statusClass: user?.twoFactorEnabled ? "bg-success/10 text-success" : "bg-destructive/10 text-destructive",
      action: () => setActiveModal("2fa"),
    },
  ];

  return (
    <div className="min-h-screen bg-background text-foreground pb-24">
      {/* Header */}
      <div className="flex items-center gap-4 p-4 border-b border-border">
        <button
          onClick={() => navigate(-1)}
          className="p-2 hover:bg-secondary rounded-lg transition-colors"
        >
          <ArrowLeft className="w-5 h-5" />
        </button>
        <h1 className="text-xl font-semibold">Security Center</h1>
      </div>

      {/* Security Settings List */}
      <div className="p-4">
        <div className="bg-card rounded-lg overflow-hidden">
          {securityItems.map((item, index) => {
            const IconComponent = item.icon;
            return (
              <button
                key={index}
                onClick={item.action}
                className="w-full flex items-center justify-between p-4 hover:bg-secondary transition-colors border-b border-border last:border-b-0"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center">
                    <IconComponent className="w-5 h-5 text-primary" />
                  </div>
                  <div className="text-left">
                    <div className="font-medium text-card-foreground">
                      {item.label}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {item.description}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <span className={`px-2 py-1 text-xs font-semibold rounded-full ${item.statusClass}`}>
                    {item.status}
                  </span>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Modals */}
      {activeModal === "password" && (
        <SecurityModal
          title="Change Password"
          onClose={() => setActiveModal(null)}
        >
          <ChangePasswordForm onClose={() => setActiveModal(null)} />
        </SecurityModal>
      )}

      {activeModal === "fund_password" && (
        <SecurityModal
          title={
            user?.fundPassword ? "Change Fund Password" : "Set Fund Password"
          }
          onClose={() => setActiveModal(null)}
        >
          <FundPasswordForm onClose={() => setActiveModal(null)} />
        </SecurityModal>
      )}

      {activeModal === "2fa" && (
        <SecurityModal
          title={
            user?.twoFactorEnabled
              ? "Disable Two-Factor Authentication"
              : "Enable Two-Factor Authentication"
          }
          onClose={() => setActiveModal(null)}
        >
          <TwoFactorAuthForm onClose={() => setActiveModal(null)} />
        </SecurityModal>
      )}
    </div>
  );
}