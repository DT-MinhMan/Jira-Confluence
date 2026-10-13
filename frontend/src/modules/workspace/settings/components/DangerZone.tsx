"use client";

import { KeyboardEvent } from "react";
import { Loader2, LogOut, ShieldAlert, Trash2 } from "lucide-react";

import { WorkspaceInfo } from "../types/workspaceSettings.type";

export interface DangerZoneProps {
  workspace: WorkspaceInfo;
  canManageWorkspace: boolean;
  showDeleteDialog: boolean;
  setShowDeleteDialog: (value: boolean) => void;
  deleteConfirm: string;
  setDeleteConfirm: (value: string) => void;
  deleting: boolean;
  handleDelete: () => void;
  showLeaveDialog: boolean;
  setShowLeaveDialog: (value: boolean) => void;
  leaveConfirm: string;
  setLeaveConfirm: (value: string) => void;
  leaving: boolean;
  handleLeave: () => void;
  handleDeleteConfirmKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
  handleLeaveConfirmKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}

export default function DangerZone({
  workspace,
  canManageWorkspace,
  showDeleteDialog,
  setShowDeleteDialog,
  deleteConfirm,
  setDeleteConfirm,
  deleting,
  handleDelete,
  showLeaveDialog,
  setShowLeaveDialog,
  leaveConfirm,
  setLeaveConfirm,
  leaving,
  handleLeave,
  handleDeleteConfirmKeyDown,
  handleLeaveConfirmKeyDown,
}: DangerZoneProps) {
  return (
    <>
      <section className="mt-12 p-5 border border-red-200 dark:border-red-900/50 bg-red-50 dark:bg-red-900/20 rounded-lg space-y-6">
        <h3 className="text-red-800 dark:text-red-200 font-bold flex items-center gap-2">
          <ShieldAlert className="w-5 h-5" /> Vùng nguy hiểm
        </h3>

        <div className="pb-6 border-b border-red-200 dark:border-red-800">
          <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">Rời khỏi không gian làm việc</p>
          <p className="text-sm text-red-600 dark:text-red-300 mb-3">
            {canManageWorkspace
              ? "Bạn là chủ sở hữu không gian làm việc. Bạn phải xóa không gian làm việc trước khi rời đi."
              : "Bạn sẽ mất quyền truy cập vào không gian làm việc này."}
          </p>
          <button
            type="button"
            onClick={() => setShowLeaveDialog(true)}
            className="flex items-center gap-2 px-4 py-2 bg-amber-600 text-white hover:bg-amber-700 rounded-[6px] text-sm font-semibold transition-colors shadow-sm shadow-amber-600/20"
          >
            <LogOut className="w-4 h-4" />
            Rời khỏi không gian làm việc
          </button>
        </div>

        {canManageWorkspace && (
          <div>
            <p className="text-sm font-semibold text-red-800 dark:text-red-200 mb-1">Xóa không gian làm việc</p>
            <p className="text-sm text-red-600 dark:text-red-300 mb-4">
              Xóa không gian làm việc này cùng với bảng, backlog và các nội dung liên quan. Hành động này không thể hoàn tác.
            </p>
            <button
              type="button"
              onClick={() => {
                setDeleteConfirm("");
                setShowDeleteDialog(true);
              }}
              className="px-4 py-2 bg-[#9F2F2D] text-white hover:bg-[#8F2927] rounded-[6px] text-sm font-semibold transition-colors flex items-center gap-2 shadow-sm shadow-[#9F2F2D]/20"
            >
              <Trash2 className="w-4 h-4" />
              Xóa không gian làm việc
            </button>
          </div>
        )}
      </section>

      {showDeleteDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#202020] rounded-[10px] border border-[#EAEAEA] dark:border-white/[0.06] shadow-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-[#FDEBEC] dark:bg-[rgba(159,47,45,0.12)] flex items-center justify-center flex-shrink-0">
                <Trash2 className="w-5 h-5 text-[#9F2F2D] dark:text-[#F87171]" />
              </div>
              <h2 className="text-lg font-bold text-[#111111] dark:text-[#E8E8E7]">Xóa không gian làm việc</h2>
            </div>
            <p className="text-sm text-[#787774] dark:text-[#9B9A97] mb-4">
              Hành động này sẽ xóa không gian làm việc{" "}
              <span className="font-semibold text-[#111111] dark:text-[#E8E8E7]">{workspace.name}</span> và không thể hoàn
              tác. Nhập <span className="font-mono font-semibold">delete</span> để xác nhận.
            </p>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              onKeyDown={handleDeleteConfirmKeyDown}
              placeholder="delete"
              className="w-full mb-4 px-4 py-2 border border-[#EAEAEA] dark:border-white/[0.08] rounded-[6px] bg-white dark:bg-[#252525] text-[#111111] dark:text-[#E8E8E7] outline-none focus:border-[#9F2F2D]"
              autoFocus
            />
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={() => {
                  setShowDeleteDialog(false);
                  setDeleteConfirm("");
                }}
                className="px-4 py-2 text-sm font-medium text-[#111111] dark:text-[#E8E8E7] bg-[#F9F9F8] dark:bg-[#252525] hover:bg-[#F0F0EE] dark:hover:bg-[#2E2E2E] rounded-[6px] transition-colors"
              >
                Hủy
              </button>
              <button
                type="button"
                onClick={handleDelete}
                disabled={deleteConfirm !== "delete" || deleting}
                className="px-4 py-2 text-sm font-medium text-white bg-[#9F2F2D] hover:bg-[#8F2927] disabled:bg-[#F5C6C7] disabled:cursor-not-allowed rounded-[6px] transition-colors flex items-center gap-2"
              >
                {deleting && <Loader2 className="w-4 h-4 animate-spin" />}
                {deleting ? "Đang xóa..." : "Xác nhận xóa"}
              </button>
            </div>
          </div>
        </div>
      )}

      {showLeaveDialog && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-[#202020] rounded-[10px] border border-[#EAEAEA] dark:border-white/[0.06] shadow-2xl p-6">
            {canManageWorkspace ? (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-amber-100 dark:bg-amber-950/40 flex items-center justify-center flex-shrink-0">
                    <ShieldAlert className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                  </div>
                  <h2 className="text-lg font-bold text-[#111111] dark:text-[#E8E8E7]">
                    Bạn là chủ sở hữu không gian làm việc này
                  </h2>
                </div>
                <p className="text-sm text-[#787774] dark:text-[#9B9A97] mb-6">
                  Bạn có muốn xóa không gian làm việc{" "}
                  <span className="font-semibold text-[#111111] dark:text-[#E8E8E7]">{workspace.name}</span> ngay bây giờ? Hành
                  động này sẽ xóa toàn bộ dữ liệu và không thể hoàn tác.
                </p>
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowLeaveDialog(false)}
                    className="px-4 py-2 text-sm font-medium text-[#111111] dark:text-[#E8E8E7] bg-[#F9F9F8] dark:bg-[#252525] hover:bg-[#F0F0EE] dark:hover:bg-[#2E2E2E] rounded-[6px] transition-colors"
                  >
                    Đóng
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setShowLeaveDialog(false);
                      setDeleteConfirm("");
                      setShowDeleteDialog(true);
                      window.setTimeout(() => {
                        document.querySelector<HTMLInputElement>('input[placeholder="delete"]')?.focus();
                      }, 0);
                    }}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#9F2F2D] hover:bg-[#8F2927] rounded-[6px] transition-colors flex items-center gap-2"
                  >
                    <Trash2 className="w-4 h-4" />
                    Đi đến xóa không gian làm việc
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-[#FDEBEC] dark:bg-[rgba(159,47,45,0.12)] flex items-center justify-center flex-shrink-0">
                    <LogOut className="w-5 h-5 text-[#9F2F2D] dark:text-[#F87171]" />
                  </div>
                  <h2 className="text-lg font-bold text-[#111111] dark:text-[#E8E8E7]">Rời khỏi không gian làm việc</h2>
                </div>
                <p className="text-sm text-[#787774] dark:text-[#9B9A97] mb-4">
                  Bạn sẽ mất quyền truy cập vào không gian làm việc{" "}
                  <span className="font-semibold text-[#111111] dark:text-[#E8E8E7]">{workspace.name}</span>. Nhập{" "}
                  <span className="font-mono font-semibold">leave</span> để xác nhận.
                </p>
                <input
                  type="text"
                  value={leaveConfirm}
                  onChange={(e) => setLeaveConfirm(e.target.value)}
                  onKeyDown={handleLeaveConfirmKeyDown}
                  placeholder="leave"
                  className="w-full mb-4 px-4 py-2 border border-[#EAEAEA] dark:border-white/[0.08] rounded-[6px] bg-white dark:bg-[#252525] text-[#111111] dark:text-[#E8E8E7] outline-none focus:border-[#9F2F2D]"
                  autoFocus
                />
                <div className="flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setShowLeaveDialog(false);
                      setLeaveConfirm("");
                    }}
                    className="px-4 py-2 text-sm font-medium text-[#111111] dark:text-[#E8E8E7] bg-[#F9F9F8] dark:bg-[#252525] hover:bg-[#F0F0EE] dark:hover:bg-[#2E2E2E] rounded-[6px] transition-colors"
                  >
                    Hủy
                  </button>
                  <button
                    type="button"
                    onClick={handleLeave}
                    disabled={leaveConfirm !== "leave" || leaving}
                    className="px-4 py-2 text-sm font-medium text-white bg-[#9F2F2D] hover:bg-[#8F2927] disabled:bg-[#F5C6C7] disabled:cursor-not-allowed rounded-[6px] transition-colors flex items-center gap-2"
                  >
                    {leaving && <Loader2 className="w-4 h-4 animate-spin" />}
                    {leaving ? "Đang rời khỏi..." : "Xác nhận rời khỏi"}
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
