"use client";

import React, { useCallback, useEffect, useRef, useState } from "react";
import { useMutation } from "@tanstack/react-query";
import {
  Upload,
  X,
  FileText,
  FileImage,
  FileSpreadsheet,
  FileType2,
  Loader2,
  AlertCircle,
  Check,
} from "lucide-react";
import { toast } from "react-hot-toast";
import { documentService } from "../services/documentService";
import { useWorkspaces } from "@/modules/workspace/shared/hooks/useWorkspaces";

const ALLOWED_EXTENSIONS = [
  ".pdf",
  ".doc",
  ".docx",
  ".xls",
  ".xlsx",
  ".ppt",
  ".pptx",
  ".png",
  ".jpg",
  ".jpeg",
  ".webp",
];

const MAX_FILE_SIZE = 20 * 1024 * 1024; // 20 MB

function formatSize(size: number) {
  const kb = size / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  return `${(kb / 1024).toFixed(1)} MB`;
}

function getFileIcon(extension: string) {
  const ext = extension.toLowerCase();
  if ([".png", ".jpg", ".jpeg", ".webp"].includes(ext)) return FileImage;
  if ([".xls", ".xlsx"].includes(ext)) return FileSpreadsheet;
  if ([".ppt", ".pptx"].includes(ext)) return FileType2;
  return FileText;
}

function getBackendErrorMessage(error: unknown, fallback: string): string {
  const candidate = error as {
    response?: { data?: { message?: string | string[] } };
    message?: string;
  };
  const apiMessage = candidate.response?.data?.message;
  if (Array.isArray(apiMessage)) return apiMessage[0] ?? fallback;
  return apiMessage || candidate.message || fallback;
}

export interface DocumentUploadModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  /** Nếu truyền vào, tự động gán workspace này khi upload */
  defaultWorkspaceId?: string;
}

export default function DocumentUploadModal({
  open,
  onClose,
  onSuccess,
  defaultWorkspaceId,
}: DocumentUploadModalProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState("");
  const [isDragging, setIsDragging] = useState(false);
  const [fileError, setFileError] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);
  const [selectedWorkspaces, setSelectedWorkspaces] = useState<Set<string>>(
    new Set(defaultWorkspaceId ? [defaultWorkspaceId] : []),
  );

  const { data: workspaces = [], isLoading: loadingWorkspaces } = useWorkspaces();

  // Reset form when modal opens
  useEffect(() => {
    if (open) {
      setFile(null);
      setName("");
      setFileError(null);
      setNameError(null);
      setIsDragging(false);
      setSelectedWorkspaces(new Set(defaultWorkspaceId ? [defaultWorkspaceId] : []));
    }
  }, [open, defaultWorkspaceId]);

  const validateFile = useCallback((selectedFile: File): string | null => {
    const ext = "." + (selectedFile.name.split(".").pop()?.toLowerCase() || "");
    if (!ALLOWED_EXTENSIONS.includes(ext)) {
      return `Định dạng tệp "${ext}" không được hỗ trợ. Chỉ chấp nhận PDF, Word, Excel, PowerPoint hoặc Ảnh.`;
    }
    if (selectedFile.size > MAX_FILE_SIZE) {
      return `Kích thước tệp (${formatSize(selectedFile.size)}) vượt quá giới hạn cho phép (20MB).`;
    }
    return null;
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    setFileError(null);
    setNameError(null);

    const error = validateFile(selectedFile);
    if (error) {
      setFileError(error);
      setFile(null);
      return;
    }

    setFile(selectedFile);
    // Tự động điền tên tài liệu từ tên file gốc (bỏ extension)
    const baseName = selectedFile.name.replace(/\.[^/.]+$/, "");
    setName(baseName);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    const droppedFile = e.dataTransfer.files?.[0];
    if (droppedFile) {
      handleFileSelect(droppedFile);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const toggleWorkspace = (wsId: string) => {
    setSelectedWorkspaces((prev) => {
      const next = new Set(prev);
      if (next.has(wsId)) next.delete(wsId);
      else next.add(wsId);
      return next;
    });
  };

  const uploadMutation = useMutation({
    mutationFn: () => {
      if (!file) throw new Error("Chưa chọn tệp");
      const workspaceIds = defaultWorkspaceId
        ? [defaultWorkspaceId]
        : Array.from(selectedWorkspaces);
      return documentService.upload(file, {
        name: name.trim() || undefined,
        workspaceIds,
      });
    },
    onSuccess: () => {
      toast.success("Tải lên tài liệu thành công");
      onSuccess?.();
      onClose();
    },
    onError: (err) => {
      const errorMsg = getBackendErrorMessage(err, "Tải lên tài liệu thất bại");
      const lower = errorMsg.toLowerCase();
      if (
        lower.includes("already exists") ||
        lower.includes("đã tồn tại") ||
        lower.includes("name")
      ) {
        setNameError(errorMsg);
      } else if (
        lower.includes("unsupported") ||
        lower.includes("mime") ||
        lower.includes("extension") ||
        lower.includes("file")
      ) {
        setFileError(errorMsg);
      } else {
        toast.error(errorMsg);
      }
    },
  });

  // Handle Escape key
  useEffect(() => {
    if (!open) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !uploadMutation.isPending) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, uploadMutation.isPending]);

  if (!open) return null;

  const fileExt = file ? "." + (file.name.split(".").pop()?.toLowerCase() || "") : "";
  const IconComponent = file ? getFileIcon(fileExt) : Upload;

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/60 p-4 backdrop-blur-sm animate-in fade-in duration-200"
      onClick={() => {
        if (!uploadMutation.isPending) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="upload-document-title"
        className="w-full max-w-lg overflow-hidden rounded-[10px] border border-[#EAEAEA] bg-white shadow-2xl dark:border-white/[0.08] dark:bg-[#202020] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#EAEAEA] px-5 py-4 dark:border-white/[0.08]">
          <div className="flex items-center gap-2">
            <Upload className="h-5 w-5 text-[#2563EB] dark:text-[#3B82F6]" />
            <h3
              id="upload-document-title"
              className="text-[0.9375rem] font-bold text-[#111111] dark:text-[#E8E8E7]"
            >
              Tải lên tài liệu
            </h3>
          </div>
          <button
            type="button"
            disabled={uploadMutation.isPending}
            onClick={onClose}
            aria-label="Đóng"
            className="rounded-[4px] p-1.5 text-[#ABABAB] transition-colors hover:bg-[#F7F6F3] hover:text-[#111111] disabled:opacity-40 dark:text-[#6B6B6B] dark:hover:bg-white/5 dark:hover:text-[#E8E8E7]"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[calc(85vh-130px)] overflow-y-auto p-5 space-y-4">
          {/* Dropzone */}
          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => fileInputRef.current?.click()}
              className={`flex cursor-pointer flex-col items-center justify-center rounded-[8px] border-2 border-dashed p-7 text-center transition-all ${
                isDragging
                  ? "border-[#2563EB] bg-[#EFF6FF] dark:border-[#3B82F6] dark:bg-[rgba(37,99,235,0.08)]"
                  : "border-[#EAEAEA] bg-[#FAF9F7] hover:border-[#2563EB]/50 hover:bg-[#F7F6F3] dark:border-white/10 dark:bg-[#252525] dark:hover:border-white/20 dark:hover:bg-[#2A2A2A]"
              }`}
            >
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-white shadow-sm dark:bg-[#303030]">
                <Upload className="h-6 w-6 text-[#2563EB] dark:text-[#3B82F6]" />
              </div>
              <p className="text-sm font-semibold text-[#111111] dark:text-[#E8E8E7]">
                Kéo thả tệp tin vào đây, hoặc{" "}
                <span className="text-[#2563EB] dark:text-[#3B82F6]">chọn tệp</span>
              </p>
              <p className="mt-1 text-xs text-[#787774] dark:text-[#9B9A97]">
                Hỗ trợ PDF, Word, Excel, PowerPoint, Ảnh (Tối đa 20MB)
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_EXTENSIONS.join(",")}
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) handleFileSelect(selected);
                  // Reset input value to allow selecting the same file again if desired
                  e.target.value = "";
                }}
              />
            </div>
          ) : (
            /* Selected File Preview */
            <div className="rounded-[8px] border border-[#EAEAEA] bg-[#FAF9F7] p-3.5 dark:border-white/10 dark:bg-[#252525]">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-white shadow-sm dark:bg-[#303030]">
                    <IconComponent className="h-5 w-5 text-[#2563EB] dark:text-[#3B82F6]" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-[#111111] dark:text-[#E8E8E7]">
                      {file.name}
                    </p>
                    <p className="text-xs text-[#787774] dark:text-[#9B9A97]">
                      {formatSize(file.size)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <button
                    type="button"
                    disabled={uploadMutation.isPending}
                    onClick={() => fileInputRef.current?.click()}
                    className="text-xs font-medium text-[#2563EB] hover:underline disabled:opacity-40 dark:text-[#3B82F6]"
                  >
                    Đổi tệp
                  </button>
                  <button
                    type="button"
                    disabled={uploadMutation.isPending}
                    onClick={() => {
                      setFile(null);
                      setName("");
                      setFileError(null);
                      setNameError(null);
                    }}
                    className="rounded-[4px] p-1 text-[#ABABAB] hover:bg-[#F7F6F3] hover:text-[#111111] disabled:opacity-40 dark:text-[#6B6B6B] dark:hover:bg-white/5 dark:hover:text-[#E8E8E7]"
                    title="Xóa tệp"
                  >
                    <X className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={ALLOWED_EXTENSIONS.join(",")}
                className="hidden"
                onChange={(e) => {
                  const selected = e.target.files?.[0];
                  if (selected) handleFileSelect(selected);
                  e.target.value = "";
                }}
              />
            </div>
          )}

          {/* File Error inline */}
          {fileError && (
            <div className="flex items-center gap-2 rounded-[6px] bg-red-50 p-2.5 text-xs text-red-600 dark:bg-red-950/30 dark:text-red-400">
              <AlertCircle className="h-4 w-4 shrink-0" />
              <span>{fileError}</span>
            </div>
          )}

          {/* Document Name input */}
          {file && (
            <div>
              <label
                htmlFor="document-name-input"
                className="mb-1.5 block text-xs font-semibold uppercase tracking-wider text-[#787774] dark:text-[#9B9A97]"
              >
                Tên tài liệu
              </label>
              <input
                id="document-name-input"
                type="text"
                value={name}
                disabled={uploadMutation.isPending}
                onChange={(e) => {
                  setName(e.target.value);
                  if (nameError) setNameError(null);
                }}
                placeholder="Nhập tên tài liệu..."
                className={`w-full rounded-[6px] border bg-transparent px-3 py-2 text-sm text-[#111111] placeholder-[#ABABAB] outline-none transition focus:border-[#2563EB] dark:text-[#E8E8E7] dark:placeholder-[#6B6B6B] ${
                  nameError
                    ? "border-red-500 focus:border-red-500"
                    : "border-[#EAEAEA] dark:border-white/10"
                }`}
              />
              {nameError && (
                <p className="mt-1 flex items-center gap-1.5 text-xs text-red-600 dark:text-red-400">
                  <AlertCircle className="h-3.5 w-3.5 shrink-0" />
                  <span>{nameError}</span>
                </p>
              )}
            </div>
          )}

          {/* Workspace selection (only if defaultWorkspaceId is not provided) */}
          {!defaultWorkspaceId && workspaces.length > 0 && (
            <div>
              <label className="mb-2 block text-xs font-semibold uppercase tracking-wider text-[#787774] dark:text-[#9B9A97]">
                Gán vào không gian làm việc (tùy chọn)
              </label>
              {loadingWorkspaces ? (
                <div className="flex items-center gap-2 py-2 text-xs text-[#787774] dark:text-[#9B9A97]">
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Đang tải danh sách...
                </div>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {workspaces.map((ws) => {
                    const isSelected = selectedWorkspaces.has(ws._id);
                    return (
                      <button
                        key={ws._id}
                        type="button"
                        disabled={uploadMutation.isPending}
                        onClick={() => toggleWorkspace(ws._id)}
                        className={`inline-flex items-center gap-1.5 rounded-[4px] border px-2.5 py-1 text-xs font-medium transition-all ${
                          isSelected
                            ? "border-[#2563EB]/40 bg-[#EFF6FF] text-[#1F6C9F] dark:bg-[rgba(37,99,235,0.12)] dark:text-[#93C5FD]"
                            : "border-[#EAEAEA] bg-[#FAF9F7] text-[#787774] hover:border-[#2563EB]/20 hover:bg-[#EFF6FF] dark:border-white/10 dark:bg-[#252525] dark:text-[#9B9A97] dark:hover:bg-[rgba(37,99,235,0.08)]"
                        }`}
                      >
                        {isSelected && <Check className="h-3 w-3" />}
                        {ws.name}
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 border-t border-[#EAEAEA] bg-[#F9F9F8] px-5 py-3.5 dark:border-white/[0.08] dark:bg-[#252525]">
          <button
            type="button"
            disabled={uploadMutation.isPending}
            onClick={onClose}
            className="rounded-[6px] border border-[#EAEAEA] px-4 py-2 text-xs font-semibold text-[#111111] transition-colors hover:bg-[#F7F6F3] disabled:opacity-50 dark:border-white/10 dark:text-[#E8E8E7] dark:hover:bg-white/5"
          >
            Hủy
          </button>
          <button
            type="button"
            disabled={!file || !name.trim() || uploadMutation.isPending}
            onClick={() => uploadMutation.mutate()}
            className="inline-flex items-center gap-2 rounded-[6px] bg-[#2563EB] px-4 py-2 text-xs font-semibold text-white transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-50 dark:bg-[#3B82F6] dark:hover:bg-[#2563EB]"
          >
            {uploadMutation.isPending ? (
              <>
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
                <span>Đang tải lên...</span>
              </>
            ) : (
              <>
                <Upload className="h-3.5 w-3.5" />
                <span>Tải lên</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
