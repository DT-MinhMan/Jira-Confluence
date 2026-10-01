
"use client";

import { Shield } from "lucide-react";
import { useAuth } from "@/modules/auth/shared/hooks/useAuth";
import { ADMIN_URL, IS_SUPER_ADMIN } from "@/lib/admin-url";

export default function AdminNavLink() {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading || !isAuthenticated) return null;
  if (!IS_SUPER_ADMIN(user?.role)) return null;

  return (
    <a
      href={ADMIN_URL}
      target="_blank"
      rel="noopener noreferrer"
      className="inline-flex items-center gap-1.5 rounded-lg border border-[#5F2CFF]/30 bg-[#5F2CFF]/10 px-3 py-1.5 text-sm font-medium text-[#DFF6FF] transition hover:bg-[#5F2CFF]/20 hover:border-[#5F2CFF]/60"
    >
      <Shield className="h-4 w-4 text-[#5F2CFF]" />
      Trang quản trị
      <span className="text-[10px] leading-none text-slate-400">↗</span>
    </a>
  );
}
