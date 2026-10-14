"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type MouseEvent as ReactMouseEvent, type KeyboardEvent as ReactKeyboardEvent } from "react";
import { useRouter } from "next/navigation";
import { isAxiosError } from "axios";
import toast from "react-hot-toast";
import { ArrowRight, Bell, Check, CheckCheck, FileText, Loader2, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/shared/constants/queryKeys";
import {
  AppNotification,
  notificationService,
  NotificationType,
  NotificationListResponse,
} from "@/modules/notifications/services/notification.service";
import { useNotificationRealtime } from "@/lib/realtime/hooks/use-notification-realtime";
import {
  getTaskStatusTransition,
  TaskStatusTransition,
} from "@/modules/notifications/utils/notification-status.utils";

interface NotificationPanelProps {
  onClose: () => void;
  onUnreadCountChange?: (count: number) => void;
}

type NotificationCategory = "DIRECT" | "WATCHING";
type NotificationTab = "ALL" | "UNREAD" | "DIRECT";
type InviteActionStatus = "accepted" | "declined" | "expired" | "unavailable";

const INVITE_NOTIFICATION_STATE_KEY = "sdlc.inviteNotificationState";

interface StoredInviteNotificationState {
  status: InviteActionStatus;
  message: string;
}

interface NotificationViewModel {
  id: string;
  actor: { name: string; avatar?: string };
  actionText: string;
  target?: { id?: string; key?: string; title?: string; type: string };
  messageSnippet?: string;
  href?: string;
  createdAt: string;
  isRead: boolean;
  category: NotificationCategory;
  type: "STANDARD" | "INVITE";
  statusTransition?: TaskStatusTransition;
  inviteData?: {
    inviteId?: string;
    workspaceKey?: string;
    workspaceName: string;
    message?: string;
    statusMessage?: string;
    status?: string;
    role?: string;
  };
}

const DIRECT_TYPES: NotificationType[] = [
  "TASK_ASSIGNED",
  "COMMENT_MENTIONED",
  "WORKSPACE_INVITED",
  "THREAD_REPLY",
  "CHAT_MENTIONED",
];

function actorName(notification: AppNotification): string {
  return (
    notification.actor?.fullName ||
    notification.actor?.email ||
    "Một đồng nghiệp"
  );
}

function initials(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) return "?";
  const parts = trimmed.split(/\s+/).slice(0, 2);
  return parts.map((part) => part.charAt(0).toUpperCase()).join("");
}

function actionText(type: NotificationType): string {
  switch (type) {
    case "TASK_ASSIGNED":
      return "đã giao một nhiệm vụ cho bạn";
    case "TASK_STATUS_CHANGED":
      return "đã thay đổi trạng thái nhiệm vụ";
    case "COMMENT_MENTIONED":
      return "đã nhắc đến bạn trong một bình luận";
    case "TASK_COMMENT_CREATED":
      return "đã bình luận về nhiệm vụ";
    case "WORKSPACE_INVITED":
      return "đã mời bạn tham gia không gian làm việc";
    case "THREAD_REPLY":
      return "đã trả lời trong một chủ đề";
    case "CHAT_MENTIONED":
      return "đã nhắc đến bạn trong kênh trò chuyện";
    default:
      return "đã gửi thông báo cho bạn";
  }
}

function readStoredInviteNotificationState(): Record<string, StoredInviteNotificationState> {
  if (typeof window === "undefined") return {};

  try {
    const raw = window.sessionStorage.getItem(INVITE_NOTIFICATION_STATE_KEY);
    if (!raw) return {};
    return JSON.parse(raw) as Record<string, StoredInviteNotificationState>;
  } catch {
    return {};
  }
}

function getStoredInviteNotificationState(notificationId: string): StoredInviteNotificationState | undefined {
  return readStoredInviteNotificationState()[notificationId];
}

function persistInviteNotificationState(
  notificationId: string,
  state: StoredInviteNotificationState,
): void {
  if (typeof window === "undefined") return;

  const current = readStoredInviteNotificationState();
  current[notificationId] = state;
  window.sessionStorage.setItem(INVITE_NOTIFICATION_STATE_KEY, JSON.stringify(current));
}

function getApiErrorMessage(error: unknown, fallback: string): string {
  if (!isAxiosError(error)) return fallback;

  const message = error.response?.data?.message;
  if (Array.isArray(message)) return message[0] ?? fallback;
  if (typeof message === "string" && message.trim()) return message;
  return fallback;
}

function getInviteFailureState(
  error: unknown,
  fallback: string,
): { message: string; status?: InviteActionStatus } {
  const message = getApiErrorMessage(error, fallback);
  if (!isAxiosError(error) || error.response?.status !== 410) {
    return { message };
  }

  const normalized = message.toLowerCase();
  if (normalized.includes("accepted")) return { message, status: "accepted" };
  if (normalized.includes("declined")) return { message, status: "declined" };
  if (normalized.includes("expired")) return { message, status: "expired" };
  return { message, status: "unavailable" };
}


function buildNotificationHref(notification: AppNotification): string | undefined {
  if (notification.type === "WORKSPACE_INVITED") {
    return "/workspaces";
  }

  const metadata = notification.metadata ?? {};


  const taskKey = typeof metadata.taskKey === "string" ? metadata.taskKey : undefined;
  const workspaceRouteKey =
    (typeof metadata.workspaceKey === "string" ? metadata.workspaceKey : undefined) ||
    (typeof metadata.workspaceId === "string" ? metadata.workspaceId : undefined) ||
    notification.workspaceId;

  if (taskKey && workspaceRouteKey) {
    return `/workspaces/${encodeURIComponent(workspaceRouteKey)}/board/key/${encodeURIComponent(taskKey)}`;
  }

  return undefined;
}

function mapNotification(notification: AppNotification): NotificationViewModel {
  const name = actorName(notification);
  const metadata = notification.metadata ?? {};
  const isChatNotification = ["THREAD_REPLY", "CHAT_MENTIONED"].includes(notification.type);
  const taskKey = typeof metadata.taskKey === "string" ? metadata.taskKey : undefined;
  const taskTitle = typeof metadata.taskTitle === "string" ? metadata.taskTitle : notification.message;
  const workspaceName =
    typeof metadata.workspaceName === "string" ? metadata.workspaceName : notification.message || "Workspace";
  const storedInviteState = notification.type === "WORKSPACE_INVITED"
    ? getStoredInviteNotificationState(notification.id)
    : undefined;
  const inviteRole = typeof metadata.role === "string" ? metadata.role : undefined;
  const rawInviteMessage = typeof notification.message === "string" ? notification.message.trim() : "";
  const normalizedInviteMessage = rawInviteMessage.toLowerCase();
  const messageLooksLikeRole = normalizedInviteMessage.startsWith("role:");
  const pendingInviteMessage = rawInviteMessage && !messageLooksLikeRole
    ? rawInviteMessage
    : undefined;

  const cleanMessage = typeof notification.message === "string"
    ? notification.message.replace(/(?:\[@|@\[)([^\]]+)\]\(([^)]+)\)/g, '@$1')
    : undefined;

  return {
    id: notification.id,
    actor: {
      name,
      avatar: notification.actor?.avatar || initials(name),
    },
    actionText: actionText(notification.type),
    target: !isChatNotification && (taskKey || taskTitle)
      ? {
          id: typeof metadata.taskId === "string" ? metadata.taskId : notification.entityId,
          key: taskKey,
          title: taskTitle || notification.title,
          type: "Task",
        }
      : undefined,
    messageSnippet: isChatNotification ? cleanMessage : undefined,
    createdAt: notification.createdAt,
    isRead: Boolean(notification.readAt),
    href: buildNotificationHref(notification),
    category: DIRECT_TYPES.includes(notification.type) ? "DIRECT" : "WATCHING",
    type: notification.type === "WORKSPACE_INVITED" ? "INVITE" : "STANDARD",
    statusTransition:
      notification.type === "TASK_STATUS_CHANGED"
        ? getTaskStatusTransition(metadata)
        : undefined,
    inviteData: notification.type === "WORKSPACE_INVITED"
      ? {
          inviteId: typeof metadata.inviteId === "string" ? metadata.inviteId : notification.entityId,
          workspaceKey: typeof metadata.workspaceKey === "string" ? metadata.workspaceKey : undefined,
          workspaceName,
          message: pendingInviteMessage,
          statusMessage: storedInviteState?.message,
          status: storedInviteState?.status ?? (typeof metadata.status === "string" ? metadata.status : undefined),
          role: inviteRole,
        }
      : undefined,
  };
}

function groupName(createdAt: string): string {
  const date = new Date(createdAt);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);

  if (date.toDateString() === today.toDateString()) return "Mới nhất";
  if (date.toDateString() === yesterday.toDateString()) return "Hôm qua";
  return "Cũ hơn";
}

function formatTime(createdAt: string): string {
  return new Date(createdAt).toLocaleString("vi-VN", {
    weekday: "short",
    hour: "numeric",
    minute: "numeric",
  });
}

export default function NotificationPanel({
  onClose,
  onUnreadCountChange,
}: NotificationPanelProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<NotificationTab>("ALL");
  const [inviteActionId, setInviteActionId] = useState<string | null>(null);

  const panelRef = useRef<HTMLDivElement>(null);

  const { data: listData, isLoading, error: queryError } = useQuery({
    queryKey: queryKeys.notifications.list(),
    queryFn: () => notificationService.list(1, 30),
    staleTime: 30_000,
  });

  const { data: unreadCount = 0 } = useQuery({
    queryKey: queryKeys.notifications.unreadCount(),
    queryFn: () => notificationService.unreadCount(),
    staleTime: 30_000,
  });

  useEffect(() => {
    if (onUnreadCountChange) {
      onUnreadCountChange(unreadCount);
    }
  }, [unreadCount, onUnreadCountChange]);

  const error = queryError ? "Could not load notifications." : null;

  const notifications = useMemo(() => {
    return (listData?.notifications || []).map(mapNotification);
  }, [listData]);

  const handleRealtimeCreated = useCallback((notification?: AppNotification) => {
    if (!notification) return;

    queryClient.setQueryData<NotificationListResponse>(queryKeys.notifications.list(), (current) => {
      if (!current) return current;
      const exists = current.notifications.some((item) => item.id === notification.id);
      const nextNotifications = exists
        ? current.notifications.map((item) => item.id === notification.id ? notification : item)
        : [notification, ...current.notifications];
      return {
        ...current,
        notifications: nextNotifications,
      };
    });

    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
  }, [queryClient]);

  const handleRealtimeRead = useCallback((notificationId?: string) => {
    if (!notificationId) return;

    queryClient.setQueryData<NotificationListResponse>(queryKeys.notifications.list(), (current) => {
      if (!current) return current;
      return {
        ...current,
        notifications: current.notifications.map((item) =>
          item.id === notificationId
            ? { ...item, readAt: new Date().toISOString() }
            : item
        ),
      };
    });

    queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
  }, [queryClient]);

  const handleRealtimeReadAll = useCallback(() => {
    queryClient.setQueryData<NotificationListResponse>(queryKeys.notifications.list(), (current) => {
      if (!current) return current;
      return {
        ...current,
        notifications: current.notifications.map((item) => ({
          ...item,
          readAt: new Date().toISOString(),
        })),
      };
    });

    queryClient.setQueryData<number>(queryKeys.notifications.unreadCount(), 0);
  }, [queryClient]);

  useNotificationRealtime({
    onCreated: handleRealtimeCreated,
    onRead: handleRealtimeRead,
    onReadAll: handleRealtimeReadAll,
  });

  useEffect(() => {
    const handleOutsideClick = (event: MouseEvent) => {
      const target = event.target as Node;
      if (panelRef.current && !panelRef.current.contains(target)) {
        onClose();
      }
    };

    document.addEventListener("mousedown", handleOutsideClick);
    return () => document.removeEventListener("mousedown", handleOutsideClick);
  }, [onClose]);

  const markAllAsReadMutation = useMutation({
    mutationFn: () => notificationService.markAllAsRead(),
    onMutate: async () => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() });
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() });

      const previousListData = queryClient.getQueryData<NotificationListResponse>(queryKeys.notifications.list());
      const previousUnreadCount = queryClient.getQueryData<number>(queryKeys.notifications.unreadCount());

      if (previousListData) {
        queryClient.setQueryData<NotificationListResponse>(queryKeys.notifications.list(), {
          ...previousListData,
          notifications: previousListData.notifications.map((n) => ({
            ...n,
            readAt: new Date().toISOString(),
          })),
        });
      }

      queryClient.setQueryData<number>(queryKeys.notifications.unreadCount(), 0);

      return { previousListData, previousUnreadCount };
    },
    onError: (err, variables, context) => {
      if (context?.previousListData) {
        queryClient.setQueryData(queryKeys.notifications.list(), context.previousListData);
      }
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(queryKeys.notifications.unreadCount(), context.previousUnreadCount);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
  });

  const markAsReadMutation = useMutation({
    mutationFn: (id: string) => notificationService.markAsRead(id),
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.list() });
      await queryClient.cancelQueries({ queryKey: queryKeys.notifications.unreadCount() });

      const previousListData = queryClient.getQueryData<NotificationListResponse>(queryKeys.notifications.list());
      const previousUnreadCount = queryClient.getQueryData<number>(queryKeys.notifications.unreadCount());

      if (previousListData) {
        queryClient.setQueryData<NotificationListResponse>(queryKeys.notifications.list(), {
          ...previousListData,
          notifications: previousListData.notifications.map((n) =>
            n.id === id ? { ...n, readAt: new Date().toISOString() } : n
          ),
        });
      }

      if (typeof previousUnreadCount === "number" && previousUnreadCount > 0) {
        queryClient.setQueryData<number>(queryKeys.notifications.unreadCount(), previousUnreadCount - 1);
      }

      return { previousListData, previousUnreadCount };
    },
    onError: (err, id, context) => {
      if (context?.previousListData) {
        queryClient.setQueryData(queryKeys.notifications.list(), context.previousListData);
      }
      if (context?.previousUnreadCount !== undefined) {
        queryClient.setQueryData(queryKeys.notifications.unreadCount(), context.previousUnreadCount);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
    },
  });

  const updateInviteNotification = (
    id: string,
    status: InviteActionStatus,
    message: string,
  ) => {
    persistInviteNotificationState(id, { status, message });
    queryClient.setQueryData<NotificationListResponse>(queryKeys.notifications.list(), (current) => {
      if (!current) return current;
      return {
        ...current,
        notifications: current.notifications.map((item) =>
          item.id === id && item.type === "WORKSPACE_INVITED"
            ? {
                ...item,
                readAt: item.readAt || new Date().toISOString(),
                metadata: {
                  ...item.metadata,
                  status,
                },
              }
            : item
        ),
      };
    });
  };

  const handleNotificationClick = async (notification: NotificationViewModel) => {
    if (!notification.isRead) {
      await markAsReadMutation.mutateAsync(notification.id);
    }

    if (!notification.href) return;

    onClose();
    router.push(notification.href);
  };

  const handleNotificationKeyDown = (
    event: ReactKeyboardEvent<HTMLDivElement>,
    notification: NotificationViewModel,
  ) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    event.preventDefault();
    handleNotificationClick(notification);
  };

  const acceptInviteMutation = useMutation({
    mutationFn: ({ inviteId }: { inviteId: string; notificationId: string }) =>
      notificationService.acceptWorkspaceInvite(inviteId),
    onMutate: ({ notificationId }) => {
      setInviteActionId(`${notificationId}:accept`);
    },
    onSuccess: async (data, { notificationId }) => {
      updateInviteNotification(notificationId, "accepted", "Đã chấp nhận lời mời.");
      
      await notificationService.markAsRead(notificationId);
      
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      toast.success("Đã chấp nhận lời mời tham gia không gian làm việc.");
      onClose();
      
      const notification = notifications.find((n) => n.id === notificationId);
      const workspaceKey = notification?.inviteData?.workspaceKey;
      router.push(workspaceKey ? `/workspaces/${encodeURIComponent(workspaceKey)}` : "/workspaces");
    },
    onError: (error, { notificationId }) => {
      const failure = getInviteFailureState(error, "Không thể chấp nhận lời mời.");
      if (failure.status) {
        updateInviteNotification(notificationId, failure.status, failure.message);
        notificationService.markAsRead(notificationId).finally(() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
          queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
        });
      }
      toast.error(failure.message);
    },
    onSettled: () => {
      setInviteActionId(null);
    },
  });

  const declineInviteMutation = useMutation({
    mutationFn: ({ inviteId }: { inviteId: string; notificationId: string }) =>
      notificationService.declineWorkspaceInvite(inviteId),
    onMutate: ({ notificationId }) => {
      setInviteActionId(`${notificationId}:decline`);
    },
    onSuccess: async (data, { notificationId }) => {
      updateInviteNotification(notificationId, "declined", "Đã từ chối lời mời.");
      
      await notificationService.markAsRead(notificationId);
      
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
      queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
      toast.success("Đã từ chối lời mời tham gia không gian làm việc.");
    },
    onError: (error, { notificationId }) => {
      const failure = getInviteFailureState(error, "Không thể từ chối lời mời.");
      if (failure.status) {
        updateInviteNotification(notificationId, failure.status, failure.message);
        notificationService.markAsRead(notificationId).finally(() => {
          queryClient.invalidateQueries({ queryKey: queryKeys.notifications.list() });
          queryClient.invalidateQueries({ queryKey: queryKeys.notifications.unreadCount() });
        });
      }
      toast.error(failure.message);
    },
    onSettled: () => {
      setInviteActionId(null);
    },
  });

  const markAllAsRead = () => {
    markAllAsReadMutation.mutate();
  };

  const handleAcceptInvite = async (
    event: ReactMouseEvent<HTMLButtonElement>,
    notification: NotificationViewModel,
  ) => {
    event.stopPropagation();
    const inviteId = notification.inviteData?.inviteId;
    if (!inviteId) {
      toast.error("Không tìm thấy thông tin lời mời.");
      return;
    }
    acceptInviteMutation.mutate({ inviteId, notificationId: notification.id });
  };

  const handleDeclineInvite = async (
    event: ReactMouseEvent<HTMLButtonElement>,
    notification: NotificationViewModel,
  ) => {
    event.stopPropagation();
    const inviteId = notification.inviteData?.inviteId;
    if (!inviteId) {
      toast.error("Không tìm thấy thông tin lời mời.");
      return;
    }
    declineInviteMutation.mutate({ inviteId, notificationId: notification.id });
  };

  const filteredNotifications = useMemo(() => {
    return notifications.filter((notification) => {
      if (activeTab === "UNREAD") return !notification.isRead;
      if (activeTab === "DIRECT") return notification.category === "DIRECT";
      return true;
    });
  }, [activeTab, notifications]);

  const emptyMessage = useMemo(() => {
    if (activeTab === "UNREAD") {
      return {
        title: "Bạn đã xem hết thông báo!",
        desc: "Không có thông báo chưa đọc nào.",
      };
    }
    if (activeTab === "DIRECT") {
      return {
        title: "Không có thông báo trực tiếp",
        desc: "Các thông báo gán việc hoặc nhắc đến bạn sẽ xuất hiện ở đây.",
      };
    }
    return {
      title: "Chưa có thông báo nào",
      desc: "Tất cả các thông báo mới sẽ xuất hiện ở đây.",
    };
  }, [activeTab]);

  const groupedNotifications = useMemo(() => {
    return filteredNotifications.reduce<Record<string, NotificationViewModel[]>>((groups, notification) => {
      const key = groupName(notification.createdAt);
      groups[key] = groups[key] ?? [];
      groups[key].push(notification);
      return groups;
    }, {});
  }, [filteredNotifications]);

  const groupOrder = ["Mới nhất", "Hôm qua", "Cũ hơn"];

  return (
    <div
      ref={panelRef}
      className="absolute right-0 top-12 w-[min(calc(100vw-32px),420px)] bg-white dark:bg-[#202020] rounded-[10px] border border-[#EAEAEA] dark:border-white/[0.06] z-50 flex flex-col max-h-[85vh]"
      style={{ boxShadow: "0 8px 32px rgba(0,0,0,0.12), 0 2px 8px rgba(0,0,0,0.06)" }}
    >
      <div className="px-4 pt-3.5 border-b border-[#EAEAEA] dark:border-white/[0.06] flex flex-col gap-2.5">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <h2 className="text-[0.9375rem] font-semibold text-[#111111] dark:text-[#E8E8E7]">Thông báo</h2>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.5 text-[0.6875rem] font-bold rounded-full bg-[#2563EB]/10 text-[#2563EB] dark:bg-[#3B82F6]/15 dark:text-[#3B82F6]">
                {unreadCount > 99 ? "99+" : unreadCount} mới
              </span>
            )}
          </div>
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <button
                type="button"
                onClick={markAllAsRead}
                disabled={markAllAsReadMutation.isPending}
                title="Đánh dấu tất cả là đã đọc"
                className="px-2 py-1 text-[0.75rem] font-medium text-[#2563EB] dark:text-[#3B82F6] hover:bg-[#2563EB]/10 rounded-[6px] transition-colors flex items-center gap-1.5 disabled:opacity-50"
              >
                <CheckCheck className="w-3.5 h-3.5" />
                <span>Đã đọc tất cả</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-1.5 hover:bg-[#F7F6F3] dark:hover:bg-white/5 rounded-[6px] text-[#ABABAB] dark:text-[#6B6B6B] transition-colors"
              title="Đóng"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={() => setActiveTab("ALL")}
            className={`pb-2 text-[0.8125rem] font-semibold border-b-2 transition-colors ${
              activeTab === "ALL"
                ? "border-[#2563EB] text-[#2563EB] dark:text-[#3B82F6] dark:border-[#3B82F6]"
                : "border-transparent text-[#787774] dark:text-[#9B9A97] hover:text-[#111111] dark:hover:text-[#E8E8E7]"
            }`}
          >
            Tất cả
          </button>
          <button
            onClick={() => setActiveTab("UNREAD")}
            className={`pb-2 text-[0.8125rem] font-semibold border-b-2 transition-colors flex items-center gap-1.5 ${
              activeTab === "UNREAD"
                ? "border-[#2563EB] text-[#2563EB] dark:text-[#3B82F6] dark:border-[#3B82F6]"
                : "border-transparent text-[#787774] dark:text-[#9B9A97] hover:text-[#111111] dark:hover:text-[#E8E8E7]"
            }`}
          >
            <span>Chưa đọc</span>
            {unreadCount > 0 && (
              <span className="px-1.5 py-0.2 text-[0.625rem] font-bold rounded-full bg-[#2563EB] text-white dark:bg-[#3B82F6]">
                {unreadCount > 99 ? "99+" : unreadCount}
              </span>
            )}
          </button>
          <button
            onClick={() => setActiveTab("DIRECT")}
            className={`pb-2 text-[0.8125rem] font-semibold border-b-2 transition-colors ${
              activeTab === "DIRECT"
                ? "border-[#2563EB] text-[#2563EB] dark:text-[#3B82F6] dark:border-[#3B82F6]"
                : "border-transparent text-[#787774] dark:text-[#9B9A97] hover:text-[#111111] dark:hover:text-[#E8E8E7]"
            }`}
          >
            Trực tiếp
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {isLoading ? (
          <div className="p-12 text-center flex flex-col items-center gap-3">
            <Loader2 className="w-5 h-5 animate-spin text-[#2563EB] dark:text-[#3B82F6]" />
            <p className="text-[0.8125rem] text-[#787774] dark:text-[#9B9A97]">Đang tải thông báo...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-14 h-14 bg-[#F7F6F3] dark:bg-[#252525] rounded-full flex items-center justify-center mb-3">
              <Bell className="w-7 h-7 text-[#ABABAB] dark:text-[#6B6B6B]" />
            </div>
            <p className="text-[0.8125rem] font-semibold text-[#111111] dark:text-[#E8E8E7]">{error}</p>
          </div>
        ) : filteredNotifications.length === 0 ? (
          <div className="p-12 text-center flex flex-col items-center">
            <div className="w-12 h-12 bg-[#F7F6F3] dark:bg-[#252525] rounded-full flex items-center justify-center mb-3">
              <Bell className="w-6 h-6 text-[#ABABAB] dark:text-[#6B6B6B]" />
            </div>
            <p className="text-[0.8125rem] font-semibold text-[#111111] dark:text-[#E8E8E7]">{emptyMessage.title}</p>
            <p className="text-[0.6875rem] text-[#787774] dark:text-[#9B9A97] mt-1">{emptyMessage.desc}</p>
          </div>
        ) : (
          <div className="p-2.5 space-y-4">
            {groupOrder.map((group) => {
              const items = groupedNotifications[group];
              if (!items?.length) return null;

              return (
                <div key={group}>
                  <h3 className="text-[0.6875rem] font-bold text-[#ABABAB] dark:text-[#6B6B6B] uppercase tracking-wider mb-1.5 px-1">{group}</h3>
                  <div className="space-y-0.5">
                    {items.map((notification) => {
                      const inviteStatus = notification.inviteData?.status?.toLowerCase();
                      const isPendingInvite = notification.type === "INVITE" && (!inviteStatus || inviteStatus === "pending");
                      const isAccepting = inviteActionId === `${notification.id}:accept`;
                      const isDeclining = inviteActionId === `${notification.id}:decline`;
                      const isInviteBusy = isAccepting || isDeclining;

                      return (
                        <div
                          key={notification.id}
                          role="button"
                          tabIndex={0}
                          onClick={() => handleNotificationClick(notification)}
                          onKeyDown={(event) => handleNotificationKeyDown(event, notification)}
                          className={`w-full text-left relative p-2.5 rounded-[8px] transition-all group hover:bg-[#F9F9F8] dark:hover:bg-[#252525] border border-transparent hover:border-[#EAEAEA] dark:hover:border-white/8 cursor-pointer focus:outline-none focus:ring-2 focus:ring-[#2563EB]/40 ${!notification.isRead ? "bg-[#EFF6FF]/30 dark:bg-[rgba(37,99,235,0.06)]" : ""}`}
                        >
                          {!notification.isRead && (
                            <button
                              type="button"
                              title="Đánh dấu đã đọc"
                              onClick={(e) => {
                                e.stopPropagation();
                                markAsReadMutation.mutate(notification.id);
                              }}
                              className="absolute top-2.5 right-2 w-6 h-6 flex items-center justify-center rounded-md hover:bg-[#2563EB]/10 text-[#2563EB] dark:text-[#3B82F6] transition-colors"
                            >
                              <span className="block group-hover:hidden w-2 h-2 bg-[#2563EB] dark:bg-[#3B82F6] rounded-full" />
                              <Check className="hidden group-hover:block w-3.5 h-3.5" />
                            </button>
                          )}

                          <div className="flex items-start gap-2.5 pr-6">
                            <div className="w-7 h-7 rounded-full bg-[#2563EB] dark:bg-[#3B82F6] text-white flex items-center justify-center text-[0.6875rem] font-bold flex-shrink-0 overflow-hidden mt-0.5">
                              {notification.actor.avatar?.startsWith("http") ? (
                                <img src={notification.actor.avatar} alt="" className="w-full h-full object-cover" />
                              ) : (
                                notification.actor.avatar
                              )}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="text-[0.8125rem] text-[#787774] dark:text-[#9B9A97] leading-snug">
                                <span className="font-semibold text-[#111111] dark:text-[#E8E8E7]">{notification.actor.name}</span>{" "}{notification.actionText}
                              </p>

                              {notification.type === "STANDARD" && notification.target && (
                                <div className="mt-1 flex items-center gap-1.5 bg-[#F9F9F8] dark:bg-[#252525] border border-[#EAEAEA] dark:border-white/[0.06] rounded-[4px] px-2 py-0.5 w-fit max-w-full hover:border-[#2563EB]/40 transition-colors">
                                  <FileText className="w-3 h-3 text-[#2563EB] dark:text-[#3B82F6] flex-shrink-0" />
                                  <span className="text-[0.6875rem] font-medium text-[#787774] dark:text-[#9B9A97] truncate">
                                    {notification.target.key ? `${notification.target.key}: ` : ""}{notification.target.title}
                                  </span>
                                </div>
                              )}

                              {notification.messageSnippet && (
                                <div className="mt-1 px-2 py-1 bg-[#F9F9F8] dark:bg-[#252525] border border-[#EAEAEA] dark:border-white/[0.06] rounded-[4px] text-[0.75rem] text-[#787774] dark:text-[#9B9A97] italic max-w-full truncate">
                                  {notification.messageSnippet}
                                </div>
                              )}

                              {notification.statusTransition && (
                                <div className="mt-1 flex w-fit items-center gap-1.5 text-[0.6875rem] font-medium text-[#787774] dark:text-[#9B9A97]">
                                  <span className="rounded-[4px] border border-[#EAEAEA] bg-[#F9F9F8] px-1.5 py-0.5 dark:border-white/[0.06] dark:bg-[#252525]">
                                    {notification.statusTransition.from}
                                  </span>
                                  <ArrowRight className="h-3 w-3 text-[#ABABAB] dark:text-[#6B6B6B]" />
                                  <span className="rounded-[4px] border border-[#EAEAEA] bg-[#F9F9F8] px-1.5 py-0.5 dark:border-white/[0.06] dark:bg-[#252525]">
                                    {notification.statusTransition.to}
                                  </span>
                                </div>
                              )}

                              {notification.type === "INVITE" && notification.inviteData && (
                                isPendingInvite ? (
                                  <div className="mt-2 bg-[#F9F9F8] dark:bg-[#252525] border border-[#EAEAEA] dark:border-white/[0.06] rounded-[6px] p-2.5">
                                    <div className="flex items-center justify-between">
                                      <p className="text-[0.75rem] font-semibold text-[#111111] dark:text-[#E8E8E7]">{notification.inviteData.workspaceName}</p>
                                      {notification.inviteData.role && (
                                        <span className="text-[0.6875rem] text-[#787774] dark:text-[#9B9A97]">Vai trò: {notification.inviteData.role}</span>
                                      )}
                                    </div>
                                    {notification.inviteData.message && (
                                      <p className="text-[0.6875rem] text-[#ABABAB] dark:text-[#6B6B6B] mt-1">{notification.inviteData.message}</p>
                                    )}
                                    <div className="mt-2.5 flex items-center gap-2" onClick={(event) => event.stopPropagation()}>
                                      <button
                                        type="button"
                                        onClick={(event) => handleAcceptInvite(event, notification)}
                                        disabled={isInviteBusy || !notification.inviteData.inviteId}
                                        className="inline-flex items-center justify-center rounded-[5px] bg-[#2563EB] px-2.5 py-1 text-[0.6875rem] font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-60"
                                      >
                                        {isAccepting ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                                        Chấp nhận
                                      </button>
                                      <button
                                        type="button"
                                        onClick={(event) => handleDeclineInvite(event, notification)}
                                        disabled={isInviteBusy || !notification.inviteData.inviteId}
                                        className="inline-flex items-center justify-center rounded-[5px] border border-[#EAEAEA] px-2.5 py-1 text-[0.6875rem] font-semibold text-[#787774] transition-colors hover:bg-white dark:border-white/[0.08] dark:text-[#C9C9C7] dark:hover:bg-white/[0.06] disabled:cursor-not-allowed disabled:opacity-60"
                                      >
                                        {isDeclining ? <Loader2 className="mr-1 h-3 w-3 animate-spin" /> : null}
                                        Từ chối
                                      </button>
                                    </div>
                                  </div>
                                ) : (
                                  <div className="mt-1 flex items-center gap-1.5 text-[0.6875rem]">
                                    <span className="font-medium text-[#787774] dark:text-[#9B9A97]">
                                      {notification.inviteData.workspaceName}:
                                    </span>
                                    <span className={`font-medium ${
                                      inviteStatus === "accepted"
                                        ? "text-emerald-600 dark:text-emerald-400"
                                        : inviteStatus === "declined"
                                          ? "text-[#ABABAB] dark:text-[#6B6B6B]"
                                          : "text-[#787774] dark:text-[#9B9A97]"
                                    }`}>
                                      {notification.inviteData.statusMessage || (
                                        inviteStatus === "accepted"
                                          ? "Đã chấp nhận lời mời."
                                          : inviteStatus === "declined"
                                            ? "Đã từ chối lời mời."
                                            : "Lời mời đã được xử lý."
                                      )}
                                    </span>
                                  </div>
                                )
                              )}

                              <p className="text-[0.6875rem] text-[#ABABAB] dark:text-[#6B6B6B] mt-1">{formatTime(notification.createdAt)}</p>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
