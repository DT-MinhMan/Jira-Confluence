"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowRight,
  Bell,
  ChevronDown,
  LayoutDashboard,
  Loader2,
  LogOut,
  Mail,
  Repeat,
  Settings,
  Shield,
  User,
  X,
  Zap,
} from "lucide-react";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import NotificationPanel from "@/modules/notifications/components/NotificationPanel";
import { notificationService } from "@/modules/notifications/services/notification.service";
import { useNotificationRealtime } from "@/lib/realtime/hooks/use-notification-realtime";
import { ADMIN_URL, IS_SUPER_ADMIN } from "@/lib/admin-url";
import { useAccountSwitcherStore } from "@/stores/account-switcher.store";
import AccountSwitcher from "@/shared/components/layout/account-switcher/AccountSwitcher";

export function NavAuthActions() {
  const { isAuthenticated, isLoading, user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSwitcher, setShowSwitcher] = useState(false);
  const [hasFetched, setHasFetched] = useState(false);
  const [unreadNotificationCount, setUnreadNotificationCount] = useState(0);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Account-switcher badge count
  const accountsCount = useAccountSwitcherStore((s) => s.accounts.length);

  const refreshUnreadNotificationCount = useCallback(() => {
    if (!isAuthenticated) return;

    notificationService
      .unreadCount()
      .then(setUnreadNotificationCount)
      .catch(() => setUnreadNotificationCount(0));
  }, [isAuthenticated]);

  useNotificationRealtime({
    enabled: isAuthenticated,
    onCreated: refreshUnreadNotificationCount,
    onRead: refreshUnreadNotificationCount,
    onReadAll: refreshUnreadNotificationCount,
  });

  useEffect(() => {
    refreshUnreadNotificationCount();
  }, [refreshUnreadNotificationCount]);
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false);
      }
    }

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (isLoading) {
    return <Loader2 className="h-5 w-5 animate-spin text-gray-400" />;
  }

  if (isAuthenticated) {
    return (
      <div className="relative flex items-center gap-2" ref={dropdownRef}>
        <button
          type="button"
          onClick={() => setShowNotifications((open) => !open)}
          className="relative rounded-lg p-2 text-slate-300 transition hover:bg-white/10 hover:text-white"
          aria-label="Open notifications"
        >
          <Bell className="h-5 w-5" />
          {unreadNotificationCount > 0 && (
            <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-rose-500 px-1 text-[0.625rem] font-bold leading-none text-white">
              {unreadNotificationCount > 99 ? "99+" : unreadNotificationCount}
            </span>
          )}
        </button>

        <button
          type="button"
          onClick={() => setDropdownOpen((open) => !open)}
          className="flex items-center gap-2 rounded-lg px-3 py-1.5 text-slate-200 transition hover:bg-white/10"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#5F2CFF] overflow-hidden text-sm font-semibold text-white shadow-sm shadow-[#5F2CFF]/40">
            {user?.avatar ? (
              <img src={user.avatar} alt="avatar" className="h-full w-full object-cover" />
            ) : (
              user?.fullName?.charAt(0)?.toUpperCase() ??
              user?.email?.charAt(0)?.toUpperCase() ??
              "U"
            )}
          </div>
          <span className="hidden max-w-36 truncate text-sm font-medium sm:block">
            {user?.fullName ?? user?.email}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400" />
        </button>

        {showNotifications && (
          <NotificationPanel
            onClose={() => setShowNotifications(false)}
            onUnreadCountChange={setUnreadNotificationCount}
          />
        )}
        {dropdownOpen && (
          <div className="absolute right-0 top-12 z-50 w-56 overflow-hidden rounded-xl border border-white/[0.08] bg-[#151F32] py-2 shadow-2xl shadow-black/50 backdrop-blur-xl">
            <div className="flex items-start gap-2 border-b border-white/[0.06] px-4 py-2">
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-white">
                  {user?.fullName ?? "User"}
                </p>
                <p className="truncate text-xs text-slate-400">{user?.email}</p>
              </div>
              <button
                type="button"
                onClick={() => setShowSwitcher((v) => !v)}
                title="Chuyển account"
                aria-label="Chuyển account"
                aria-expanded={showSwitcher}
                className={`relative grid h-7 w-7 shrink-0 place-items-center rounded-md transition ${showSwitcher
                    ? "bg-[#5F2CFF]/20 text-[#DFF6FF]"
                    : "text-[#DFF6FF] hover:bg-[#5F2CFF]/15"
                  }`}
              >
                {showSwitcher ? <X className="h-3.5 w-3.5" /> : <Repeat className="h-4 w-4" />}
                {accountsCount > 0 && !showSwitcher && (
                  <span className="absolute -right-0.5 -top-0.5 min-w-[14px] rounded-full bg-[#5F2CFF] px-1 text-[9px] font-semibold leading-[14px] text-white">
                    {accountsCount}
                  </span>
                )}
              </button>
            </div>

            {showSwitcher && (
              <div className="border-b border-white/[0.06]">
                <AccountSwitcher
                  open={showSwitcher}
                  hasFetched={hasFetched}
                  setHasFetched={setHasFetched}
                  onCloseMenu={() => setDropdownOpen(false)}
                />
              </div>
            )}

            <Link
              href="/dashboard"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/5 hover:text-white"
              onClick={() => setDropdownOpen(false)}
            >
              <LayoutDashboard className="h-4 w-4 text-[#5F2CFF]" />
              Dashboard
            </Link>

            <Link
              href="/profile"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/5 hover:text-white"
              onClick={() => setDropdownOpen(false)}
            >
              <User className="h-4 w-4 text-slate-400" />
              Profile
            </Link>

            <Link
              href="/settings"
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-slate-200 transition hover:bg-white/5 hover:text-white"
              onClick={() => setDropdownOpen(false)}
            >
              <Settings className="h-4 w-4 text-slate-400" />
              Settings
            </Link>

            {IS_SUPER_ADMIN(user?.role) && (
              <>
                <div className="mt-2 border-t border-white/[0.06] pt-2">
                  <a
                    href={ADMIN_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setDropdownOpen(false)}
                    className="flex w-full items-center gap-3 px-4 py-2.5 text-sm font-medium text-[#DFF6FF] transition hover:bg-[#5F2CFF]/15"
                  >
                    <Shield className="h-4 w-4 text-[#5F2CFF]" />
                    Trang quản trị
                    <span className="ml-auto text-[10px] uppercase tracking-wider text-slate-500">↗</span>
                  </a>
                </div>
              </>
            )}

            <div className="mt-2 border-t border-white/[0.06] pt-2">
              <button
                type="button"
                onClick={() => {
                  setDropdownOpen(false);
                  void logout();
                }}
                className="flex w-full items-center gap-3 px-4 py-2.5 text-left text-sm text-rose-400 transition hover:bg-rose-500/10"
              >
                <LogOut className="h-4 w-4" />
                Log out
              </button>
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex items-center gap-3">
      <Link
        href="/login"
        className="hidden rounded-lg px-3.5 py-2 text-sm font-semibold text-slate-300 transition hover:text-[#DFF6FF] hover:bg-white/5 sm:inline-flex"
      >
        Login
      </Link>
      <Link
        href="/register"
        className="inline-flex items-center gap-2 rounded-lg bg-[#5F2CFF] px-4 py-2 text-sm font-bold text-white shadow-lg shadow-[#5F2CFF]/25 transition hover:bg-[#4A1FD4] hover:shadow-[#5F2CFF]/40 active:scale-95"
      >
        Get Started <ArrowRight className="h-4 w-4" />
      </Link>
    </div>
  );
}

export function HeroAuthActions() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="inline-flex items-center gap-2 rounded-xl border border-white/10 bg-[#151F32] px-6 py-3.5 text-sm font-semibold text-slate-300 shadow-md">
        <Loader2 className="h-4 w-4 animate-spin text-[#5F2CFF]" />
        Checking workspace
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <Link
        href="/dashboard"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5F2CFF] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#5F2CFF]/30 transition duration-200 hover:bg-[#4A1FD4] hover:shadow-[#5F2CFF]/50 hover:-translate-y-0.5 active:translate-y-0 sm:w-auto"
      >
        Go to Dashboard <LayoutDashboard className="h-4 w-4" />
      </Link>
    );
  }

  return (
    <>
      <Link
        href="/register"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#5F2CFF] px-7 py-3.5 text-sm font-bold text-white shadow-xl shadow-[#5F2CFF]/30 transition duration-200 hover:bg-[#4A1FD4] hover:shadow-[#5F2CFF]/50 hover:-translate-y-0.5 active:translate-y-0 sm:w-auto"
      >
        Get Started Free <ArrowRight className="h-4 w-4" />
      </Link>
      <Link
        href="/login"
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/15 bg-white/[0.04] px-7 py-3.5 text-sm font-semibold text-slate-200 backdrop-blur-md transition duration-200 hover:border-[#5F2CFF]/60 hover:bg-white/[0.08] hover:text-[#DFF6FF] hover:-translate-y-0.5 active:translate-y-0 sm:w-auto"
      >
        View Demo Workspace
      </Link>
    </>
  );
}

/**
 * Easy-Template inspired Hero Sign-up Form:
 * Clean unified pill/rounded input container with email + CTA button,
 * plus seamless behavior for authenticated users and micro trust badges.
 */
export function HeroEasySignUpForm() {
  const { isAuthenticated, isLoading } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (isAuthenticated) {
      router.push("/dashboard");
      return;
    }
    if (email.trim()) {
      router.push(`/register?email=${encodeURIComponent(email.trim())}`);
    } else {
      router.push("/register");
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-14 w-full max-w-md items-center justify-center rounded-2xl border border-white/10 bg-[#111C30]/80 backdrop-blur-md">
        <Loader2 className="h-5 w-5 animate-spin text-[#5F2CFF]" />
        <span className="ml-2.5 text-sm text-slate-300">Đang kiểm tra tài khoản...</span>
      </div>
    );
  }

  if (isAuthenticated) {
    return (
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full max-w-lg">
        <Link
          href="/dashboard"
          className="inline-flex items-center justify-center gap-2.5 rounded-2xl bg-[#5F2CFF] px-7 py-4 text-base font-bold text-white shadow-xl shadow-[#5F2CFF]/35 transition-all duration-200 hover:bg-[#4E21D9] hover:shadow-[#5F2CFF]/50 hover:-translate-y-0.5 active:translate-y-0"
        >
          <LayoutDashboard className="h-5 w-5" />
          Vào Dashboard làm việc
          <ArrowRight className="h-4 w-4" />
        </Link>
        <a
          href="#workspace-demo"
          className="inline-flex items-center justify-center gap-2 rounded-2xl border border-white/15 bg-white/[0.04] px-6 py-4 text-sm font-semibold text-slate-200 backdrop-blur-md transition-all duration-200 hover:border-[#5F2CFF]/50 hover:bg-white/[0.08] hover:text-[#DFF6FF]"
        >
          Xem Board Preview
        </a>
      </div>
    );
  }

  return (
    <div className="w-full max-w-lg">
      <form
        onSubmit={handleSubmit}
        className="group relative flex flex-col sm:flex-row items-stretch sm:items-center gap-2 rounded-2xl border border-white/15 bg-[#111C30]/90 p-2 shadow-2xl shadow-black/60 backdrop-blur-xl transition-all duration-200 focus-within:border-[#5F2CFF]/70 focus-within:ring-2 focus-within:ring-[#5F2CFF]/30"
      >
        <div className="relative flex flex-1 items-center pl-3">
          <Mail className="h-5 w-5 text-slate-400 group-focus-within:text-[#5F2CFF] transition-colors" />
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Nhập email công việc của bạn..."
            className="w-full bg-transparent px-3 py-2.5 text-sm font-medium text-white placeholder-slate-400 outline-none"
          />
        </div>
        <button
          type="submit"
          className="inline-flex items-center justify-center gap-2 rounded-xl bg-[#5F2CFF] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-[#5F2CFF]/30 transition-all duration-200 hover:bg-[#4E21D9] hover:shadow-[#5F2CFF]/50 hover:scale-[1.02] active:scale-95 whitespace-nowrap"
        >
          <span>Bắt đầu ngay</span>
          <ArrowRight className="h-4 w-4" />
        </button>
      </form>

      {/* Trust micro badges */}
      <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs text-slate-400">
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-400 font-bold">✓</span> Miễn phí dùng thử
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-400 font-bold">✓</span> Không cần thẻ tín dụng
        </span>
        <span className="flex items-center gap-1.5">
          <span className="text-emerald-400 font-bold">✓</span> Thiết lập trong 2 phút
        </span>
      </div>
    </div>
  );
}


