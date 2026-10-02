'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { useAuth } from '@/modules/auth/shared/hooks/useAuth';
import { inviteService, InviteDetails } from '@/modules/workspace/shared/services/inviteService';
import toast from 'react-hot-toast';
import {
  Loader2,
  CheckCircle2,
  XCircle,
  AlertCircle,
  Building2,
  UserPlus,
  ArrowRight,
  ShieldCheck,
  UsersRound,
  Calendar,
  Check,
  LogOut,
  Mail,
  Sparkles,
} from 'lucide-react';

interface Props {
  token: string;
}

function getRoleMeta(role: string) {
  const normalized = (role || '').toLowerCase();
  if (normalized.includes('admin')) {
    return {
      label: 'Quản trị viên',
      badgeColor: 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-950/60 dark:text-purple-300 dark:border-purple-800/80',
      icon: ShieldCheck,
      description: 'Toàn quyền quản trị cài đặt, chu kỳ sprint và lời mời thành viên.',
      permissions: [
        'Quản lý chu kỳ sprint, sắp xếp backlog & phiên bản phát hành',
        'Mời thành viên mới và cấu hình phân quyền vai trò',
        'Toàn quyền đọc & ghi trên tất cả tài liệu Confluence',
      ],
    };
  }
  if (normalized.includes('viewer') || normalized.includes('guest')) {
    return {
      label: 'Người xem',
      badgeColor: 'bg-teal-100 text-teal-800 border-teal-200 dark:bg-teal-950/60 dark:text-teal-300 dark:border-teal-800/80',
      icon: UsersRound,
      description: 'Quyền chỉ đọc bảng sprint, nhiệm vụ và tài liệu.',
      permissions: [
        'Xem bảng Kanban và tiến độ sprint theo thời gian thực',
        'Đọc tài liệu mô tả và đặc tả dự án Confluence',
        'Bình luận về các ticket và cập nhật được phân công',
      ],
    };
  }
  return {
    label: 'Thành viên dự án',
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-950/60 dark:text-blue-300 dark:border-blue-800/80',
    icon: UsersRound,
    description: 'Thành viên phát triển Agile với đầy đủ quyền thực thi nhiệm vụ và tài liệu.',
    permissions: [
      'Tạo, ước tính và phân công nhiệm vụ sprint & lỗi',
      'Kéo thả thẻ nhiệm vụ qua các cột trạng thái Kanban',
      'Tạo và chỉnh sửa tài liệu cộng tác Confluence',
    ],
  };
}

export default function AcceptInvitePage({ token }: Props) {
  const router = useRouter();
  const { user, isAuthenticated, isLoading: authLoading, logout } = useAuth();
  const [invite, setInvite] = useState<InviteDetails | null>(null);
  const [loadingInvite, setLoadingInvite] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [fetchError, setFetchError] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  useEffect(() => {
    inviteService
      .getInviteByToken(token)
      .then(setInvite)
      .catch(() => setFetchError('Lời mời này không tồn tại hoặc đã hết hạn.'))
      .finally(() => setLoadingInvite(false));
  }, [token]);

  const isLinkInvite = invite?.type === 'link';

  // Auto-redirect when already a member (email invite accepted via register flow)
  useEffect(() => {
    if (
      invite?.status === 'accepted' &&
      isAuthenticated &&
      !isLinkInvite &&
      user?.email.toLowerCase() === (invite.invitedEmail ?? '').toLowerCase()
    ) {
      router.replace(`/workspaces/${invite.workspaceKey}`);
    }
  }, [invite, isAuthenticated, user, router, isLinkInvite]);

  // Auto-accept link invites when authenticated
  useEffect(() => {
    if (isLinkInvite && isAuthenticated && invite?.status === 'pending' && !accepting && !done) {
      handleAccept();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLinkInvite, isAuthenticated, invite?.status]);

  const handleAccept = async () => {
    setAccepting(true);
    try {
      const workspaceKey = invite?.workspaceKey;
      if (!workspaceKey) {
        toast.error('Không thể xác định không gian làm việc của lời mời.');
        return;
      }

      await inviteService.acceptInvite(token);
      setDone(true);
      toast.success('Bạn đã tham gia không gian làm việc thành công!');
      setTimeout(() => router.push(`/workspaces/${workspaceKey}`), 1500);
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (e: any) {
      const status = e?.response?.status;
      const workspaceKey = invite?.workspaceKey;
      if (status === 409 && workspaceKey) {
        toast.success('Bạn đã là thành viên của không gian làm việc này.');
        setTimeout(() => router.push(`/workspaces/${workspaceKey}`), 1500);
        setDone(true);
        return;
      }
      toast.error(e?.response?.data?.message || 'Không thể chấp nhận lời mời.');
    } finally {
      setAccepting(false);
    }
  };

  // ==========================================
  // LOADING STATE
  // ==========================================
  if (loadingInvite || authLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFBFC] dark:bg-[#0B0F17] p-4">
        <div className="flex flex-col items-center gap-4 text-center">
          <div className="relative">
            <Image
              src="/icon.png"
              alt="TaskFlow Logo"
              width={48}
              height={48}
              className="h-12 w-12 rounded-2xl shadow-md"
            />
            <div className="absolute -bottom-1 -right-1 flex h-5 w-5 items-center justify-center rounded-full bg-blue-600 text-white">
              <Loader2 className="h-3 w-3 animate-spin" />
            </div>
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">
              Đang xác thực lời mời không gian làm việc...
            </h2>
            <p className="mt-1 text-xs text-slate-500">Đang kết nối đến không gian làm việc bảo mật TaskFlow</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // ERROR / INVALID STATE
  // ==========================================
  if (fetchError) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFBFC] dark:bg-[#0B0F17] p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-xl dark:border-white/10 dark:bg-slate-900">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-red-600 dark:bg-red-950/40 dark:text-red-400">
            <XCircle className="h-8 w-8" />
          </div>
          <h1 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
            Lời mời đã hết hạn hoặc không hợp lệ
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
            {fetchError}
          </p>
          <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 dark:border-white/10 dark:bg-slate-800/60">
            Nếu bạn mới nhận được lời mời này gần đây, vui lòng liên hệ quản trị viên không gian làm việc để nhận đường dẫn mời mới.
          </div>
          <div className="mt-6">
            <Link
              href="/"
              className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-[#0C66E4] px-5 py-3 text-sm font-bold text-white shadow-md transition hover:bg-blue-700"
            >
              Quay lại trang chủ TaskFlow
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!invite) return null;

  const isExpiredOrUsed = invite.status !== 'pending';
  const emailMismatch =
    !isLinkInvite &&
    isAuthenticated &&
    !!invite.invitedEmail &&
    user?.email.toLowerCase() !== invite.invitedEmail.toLowerCase();
  const roleMeta = getRoleMeta(invite.role);
  const RoleIcon = roleMeta.icon;

  // ==========================================
  // SUCCESS / JOINED STATE
  // ==========================================
  if (done) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#FAFBFC] dark:bg-[#0B0F17] p-4">
        <div className="w-full max-w-md rounded-3xl border border-slate-200/80 bg-white p-8 text-center shadow-2xl dark:border-white/10 dark:bg-slate-900">
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-emerald-50 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400">
            <CheckCircle2 className="h-10 w-10 animate-pulse" />
          </div>
          <h1 className="mt-5 text-2xl font-black text-slate-900 dark:text-white">
            Chào mừng bạn đến với {invite.workspaceName}!
          </h1>
          <p className="mt-2 text-sm text-slate-600 dark:text-slate-400">
            Bạn đã tham gia thành công với vai trò <strong className="text-blue-600 dark:text-blue-400">{roleMeta.label}</strong>.
          </p>
          <div className="mt-6 flex flex-col items-center gap-2">
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100 dark:bg-slate-800">
              <div className="h-full w-full animate-[progress_1.5s_ease-in-out] bg-emerald-500 rounded-full" />
            </div>
            <p className="text-xs text-slate-400">Đang chuyển hướng đến bảng làm việc của bạn...</p>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // MAIN INVITATION CARD (ATLASSIAN JIRA STYLE)
  // ==========================================
  return (
    <div className="min-h-screen flex flex-col justify-between bg-[#FAFBFC] dark:bg-[#0B0F17] text-slate-900 dark:text-slate-100">
      {/* Top minimal bar */}
      <header className="border-b border-slate-200/80 bg-white/80 dark:border-white/[0.08] dark:bg-[#0B0F17]/80 backdrop-blur-sm px-4 py-3">
        <div className="mx-auto flex max-w-5xl items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/icon.png"
              alt="TaskFlow Logo"
              width={28}
              height={28}
              className="h-7 w-7 rounded-lg"
            />
            <span className="font-extrabold text-slate-900 dark:text-white text-base">TaskFlow</span>
            <span className="rounded bg-blue-100 dark:bg-blue-950/60 px-1.5 py-0.5 text-[10px] font-bold text-blue-700 dark:text-blue-300 uppercase tracking-wider">
              Lời mời Workspace
            </span>
          </Link>
          <Link
            href="/"
            className="text-xs font-semibold text-slate-500 hover:text-slate-900 dark:hover:text-white transition"
          >
            Quay lại Trang chủ
          </Link>
        </div>
      </header>

      {/* Center invitation box */}
      <main className="flex flex-1 items-center justify-center p-4 py-12">
        <div className="w-full max-w-lg rounded-3xl border border-slate-200/90 bg-white p-7 sm:p-9 shadow-xl dark:border-white/10 dark:bg-slate-900">
          {/* Workspace Identity */}
          <div className="flex items-center gap-4 border-b border-slate-200/80 dark:border-white/10 pb-6">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0C66E4] to-blue-700 text-white shadow-md">
              <Building2 className="h-7 w-7" />
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h1 className="truncate text-xl font-black text-slate-900 dark:text-white">
                  {invite.workspaceName}
                </h1>
                <span className="shrink-0 rounded-md bg-slate-100 dark:bg-slate-800 px-2 py-0.5 font-mono text-xs font-bold text-blue-600 dark:text-blue-400 border border-slate-200 dark:border-slate-700">
                  {invite.workspaceKey}
                </span>
              </div>
              <p className="mt-1 text-xs text-slate-500 flex items-center gap-1.5">
                <span>Được mời bởi</span>
                <strong className="text-slate-700 dark:text-slate-300">
                  {invite.invitedBy?.fullName || invite.invitedBy?.email}
                </strong>
              </p>
            </div>
          </div>

          {/* Role & Permissions Detail Box */}
          <div className="mt-6 rounded-2xl border border-slate-200/80 bg-slate-50/80 p-5 dark:border-white/10 dark:bg-slate-800/40">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                Vai trò được chỉ định
              </span>
              <span
                className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-bold ${roleMeta.badgeColor}`}
              >
                <RoleIcon className="h-3.5 w-3.5" />
                {roleMeta.label}
              </span>
            </div>

            <p className="mt-2.5 text-xs text-slate-600 dark:text-slate-300">
              {roleMeta.description}
            </p>

            <div className="mt-4 space-y-2 border-t border-slate-200/70 pt-3 dark:border-white/10 text-xs text-slate-600 dark:text-slate-300">
              {roleMeta.permissions.map((perm, idx) => (
                <div key={idx} className="flex items-start gap-2">
                  <Check className="h-3.5 w-3.5 text-emerald-500 mt-0.5 shrink-0" />
                  <span>{perm}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Invitation Metadata */}
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>
                {invite.invitedEmail ? `Gửi tới: ${invite.invitedEmail}` : 'Đường dẫn mời công khai'}
              </span>
            </div>
            {invite.expiresAt && (
              <div className="flex items-center gap-1.5 text-slate-400">
                <Calendar className="h-3.5 w-3.5" />
                <span>Hết hạn vào {new Date(invite.expiresAt).toLocaleDateString('vi-VN')}</span>
              </div>
            )}
          </div>

          {/* Dynamic Status / Warning Alerts */}
          {isExpiredOrUsed && (
            <div className="mt-6 flex items-start gap-3 rounded-xl border border-yellow-200 bg-yellow-50 p-4 text-xs text-yellow-800 dark:border-yellow-800 dark:bg-yellow-950/40 dark:text-yellow-300">
              <AlertCircle className="h-4 w-4 shrink-0 text-yellow-600 dark:text-yellow-400 mt-0.5" />
              <div>
                <strong className="block font-semibold">Lời mời không còn khả dụng</strong>
                <span>
                  Đường dẫn mời này {invite.status === 'accepted' ? 'đã được chấp nhận' : 'đã hết hạn hoặc bị thu hồi'}.
                </span>
              </div>
            </div>
          )}

          {!isExpiredOrUsed && emailMismatch && (
            <div className="mt-6 rounded-xl border border-amber-300 bg-amber-50 p-4 text-xs text-amber-900 dark:border-amber-800 dark:bg-amber-950/40 dark:text-amber-200">
              <div className="flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-amber-600 mt-0.5" />
                <div>
                  <strong className="block font-semibold">Phát hiện tài khoản khác</strong>
                  <p className="mt-1 leading-relaxed">
                    Lời mời này được gửi riêng cho <strong>{invite.invitedEmail}</strong>, nhưng bạn hiện đang đăng nhập với tài khoản <strong>{user?.email}</strong>.
                  </p>
                  <button
                    type="button"
                    onClick={() => void logout()}
                    className="mt-3 inline-flex items-center gap-1.5 font-bold text-blue-700 dark:text-blue-400 underline hover:text-blue-800"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Chuyển tài khoản hoặc đăng xuất
                  </button>
                </div>
              </div>
            </div>
          )}

          {!isExpiredOrUsed && !isAuthenticated && (
            <div className="mt-6 rounded-xl border border-blue-200 bg-blue-50/80 p-4 text-xs text-blue-900 dark:border-blue-900/60 dark:bg-blue-950/40 dark:text-blue-200">
              <div className="flex items-center gap-2 font-semibold">
                <Sparkles className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                <span>Yêu cầu tài khoản</span>
              </div>
              <p className="mt-1 leading-relaxed text-blue-800/90 dark:text-blue-300">
                {isLinkInvite
                  ? 'Đăng nhập hoặc đăng ký tài khoản miễn phí để tham gia không gian làm việc này.'
                  : `Vui lòng đăng nhập với ${invite.invitedEmail} để chấp nhận lời mời tham gia không gian làm việc.`}
              </p>
            </div>
          )}

          {/* Action Button Row */}
          {!isExpiredOrUsed && !emailMismatch && (
            <div className="mt-7 space-y-3">
              {isAuthenticated ? (
                <>
                  <div className="flex items-center justify-between rounded-xl bg-slate-100 dark:bg-slate-800/60 px-3.5 py-2 text-xs text-slate-600 dark:text-slate-300">
                    <span>Tham gia với tên:</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {user?.fullName || user?.email}
                    </span>
                  </div>

                  <button
                    type="button"
                    onClick={handleAccept}
                    disabled={accepting}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0C66E4] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700 disabled:opacity-60"
                  >
                    {accepting ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Đang tham gia không gian làm việc...</span>
                      </>
                    ) : (
                      <>
                        <UserPlus className="h-4 w-4" />
                        <span>Chấp nhận lời mời & Tham gia</span>
                        <ArrowRight className="h-4 w-4" />
                      </>
                    )}
                  </button>

                  <Link
                    href="/"
                    className="block text-center text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-300 py-1"
                  >
                    Từ chối / Để sau
                  </Link>
                </>
              ) : (
                <div className="grid gap-3">
                  <Link
                    href={`/login?callbackUrl=/invites/accept/${token}`}
                    className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#0C66E4] px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
                  >
                    <span>Đăng nhập để chấp nhận</span>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                  <Link
                    href={`/register?callbackUrl=/invites/accept/${token}`}
                    className="flex w-full items-center justify-center rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800 dark:text-slate-200 dark:hover:bg-slate-700"
                  >
                    Tạo tài khoản mới
                  </Link>
                </div>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Footer minimal */}
      <footer className="border-t border-slate-200/70 bg-white/50 dark:border-white/[0.05] dark:bg-[#0B0F17]/50 py-4 text-center text-xs text-slate-400">
        <p>© {new Date().getFullYear()} Nền tảng TaskFlow Workspace. Chuẩn quy trình Agile hiện đại.</p>
      </footer>
    </div>
  );
}
