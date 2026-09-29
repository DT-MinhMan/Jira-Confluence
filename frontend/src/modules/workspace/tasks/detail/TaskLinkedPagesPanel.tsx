"use client";

import React, { useState, useEffect, useRef } from "react";
import {
  BookOpen,
  ExternalLink,
  Plus,
  Trash2,
  Loader2,
  FileText,
  Search,
  Check,
  X,
} from "lucide-react";
import { toast } from "react-hot-toast";
import api from "@/lib/axiosIns";
import { apiRoutes } from "@/config/apiRoutes";
import { taskService } from "@/modules/workspace/shared/services/taskService";

interface LinkedPage {
  id: string;
  title: string;
  slug: string;
  updatedAt: string;
}

interface WorkspacePageOption {
  _id: string;
  id?: string;
  title: string;
  slug: string;
}

interface TaskLinkedPagesPanelProps {
  workspaceId: string;
  workspaceKey?: string;
  taskId: string;
  canEdit: boolean;
}

export default function TaskLinkedPagesPanel({
  workspaceId,
  workspaceKey,
  taskId,
  canEdit,
}: TaskLinkedPagesPanelProps) {
  const [linkedPages, setLinkedPages] = useState<LinkedPage[]>([]);
  const [loading, setLoading] = useState(true);
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [availablePages, setAvailablePages] = useState<WorkspacePageOption[]>([]);
  const [loadingAvailable, setLoadingAvailable] = useState(false);
  const [linkingId, setLinkingId] = useState<string | null>(null);
  const [unlinkingId, setUnlinkingId] = useState<string | null>(null);

  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    let isMounted = true;
    async function fetchLinkedPages() {
      if (!workspaceId || !taskId) return;
      try {
        setLoading(true);
        const pages = await taskService.getLinkedPages(workspaceId, taskId);
        if (isMounted) setLinkedPages(pages);
      } catch {
        // Fallback silently if no links or route error
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    void fetchLinkedPages();
    return () => {
      isMounted = false;
    };
  }, [workspaceId, taskId]);

  // Click outside to close search popover
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowSearch(false);
      }
    }
    if (showSearch) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSearch]);

  const handleOpenSearch = async () => {
    setShowSearch(true);
    setSearchQuery("");
    if (availablePages.length === 0) {
      setLoadingAvailable(true);
      try {
        const key = workspaceKey || workspaceId;
        const res = await api.get(apiRoutes.PAGES.BY_WORKSPACE(key));
        const list = Array.isArray(res.data)
          ? res.data
          : res.data?.data || [];
        setAvailablePages(list);
      } catch {
        toast.error("Could not load workspace documents");
      } finally {
        setLoadingAvailable(false);
      }
    }
  };

  const handleLinkPage = async (page: WorkspacePageOption) => {
    const pageId = page._id || page.id;
    if (!pageId) return;

    setLinkingId(pageId);
    try {
      const updated = await taskService.linkPage(workspaceId, taskId, pageId);
      setLinkedPages(updated);
      setShowSearch(false);
      toast.success(`Linked to document "${page.title}"`);
    } catch {
      toast.error("Failed to link document");
    } finally {
      setLinkingId(null);
    }
  };

  const handleUnlinkPage = async (pageId: string) => {
    setUnlinkingId(pageId);
    try {
      const updated = await taskService.unlinkPage(workspaceId, taskId, pageId);
      setLinkedPages(updated);
      toast.success("Document unlinked");
    } catch {
      toast.error("Failed to unlink document");
    } finally {
      setUnlinkingId(null);
    }
  };

  const filteredAvailable = availablePages.filter((page) => {
    const pageId = page._id || page.id;
    const isAlreadyLinked = linkedPages.some((lp) => lp.id === pageId);
    const matchesSearch =
      !searchQuery ||
      page.title.toLowerCase().includes(searchQuery.toLowerCase());
    return !isAlreadyLinked && matchesSearch;
  });

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <BookOpen className="w-4 h-4 text-[#2563EB] dark:text-[#3B82F6]" />
          <h3 className="text-[0.9375rem] font-semibold text-[#111111] dark:text-[#E8E8E7]">
            Linked Documents ({linkedPages.length})
          </h3>
        </div>

        {canEdit && (
          <div className="relative" ref={popoverRef}>
            <button
              type="button"
              onClick={() => (showSearch ? setShowSearch(false) : handleOpenSearch())}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-semibold text-[#2563EB] dark:text-[#3B82F6] bg-[#EFF6FF] dark:bg-[rgba(37,99,235,0.15)] hover:bg-[#DBEAFE] dark:hover:bg-[rgba(37,99,235,0.25)] rounded-[6px] transition-colors"
            >
              <Plus className="w-3.5 h-3.5" />
              Link Document
            </button>

            {showSearch && (
              <div
                className="absolute right-0 top-8 z-50 w-72 bg-white dark:bg-[#252525] rounded-[8px] border border-[#EAEAEA] dark:border-white/[0.1] shadow-lg p-2 space-y-2 animate-in fade-in duration-150"
                style={{ boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)" }}
              >
                <div className="relative">
                  <Search className="absolute left-2.5 top-2.5 w-3.5 h-3.5 text-[#9B9A97]" />
                  <input
                    type="text"
                    autoFocus
                    placeholder="Search documents..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-3 py-1.5 text-xs bg-[#F7F6F3] dark:bg-[#1E1E1E] rounded-[6px] border border-transparent focus:border-[#2563EB] outline-none text-[#111111] dark:text-[#E8E8E7]"
                  />
                </div>

                <div className="max-h-48 overflow-y-auto divide-y divide-[#EAEAEA] dark:divide-white/[0.06]">
                  {loadingAvailable ? (
                    <div className="flex items-center justify-center py-4 text-xs text-[#9B9A97] gap-2">
                      <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading...
                    </div>
                  ) : filteredAvailable.length === 0 ? (
                    <div className="py-4 text-center text-xs text-[#9B9A97]">
                      {searchQuery ? "No matching documents found" : "No other documents available"}
                    </div>
                  ) : (
                    filteredAvailable.map((page) => {
                      const pageId = page._id || page.id || "";
                      return (
                        <button
                          key={pageId}
                          type="button"
                          disabled={linkingId === pageId}
                          onClick={() => handleLinkPage(page)}
                          className="w-full flex items-center justify-between p-2 text-left hover:bg-[#F7F6F3] dark:hover:bg-[#2E2E2E] rounded-[4px] transition-colors group"
                        >
                          <div className="flex items-center gap-2 min-w-0 pr-2">
                            <FileText className="w-3.5 h-3.5 text-[#787774] flex-shrink-0" />
                            <span className="text-xs text-[#111111] dark:text-[#E8E8E7] truncate font-medium">
                              {page.title || "Untitled"}
                            </span>
                          </div>
                          {linkingId === pageId ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin text-[#2563EB]" />
                          ) : (
                            <Plus className="w-3.5 h-3.5 text-[#9B9A97] group-hover:text-[#2563EB]" />
                          )}
                        </button>
                      );
                    })
                  )}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex items-center gap-2 text-xs text-[#9B9A97] py-2">
          <Loader2 className="w-3.5 h-3.5 animate-spin" /> Loading linked documents...
        </div>
      ) : linkedPages.length === 0 ? (
        <div className="rounded-[6px] border border-dashed border-[#EAEAEA] dark:border-white/[0.08] p-3 text-center text-xs text-[#787774] dark:text-[#9B9A97]">
          No documents linked yet. Connect PRDs, specs, or wiki pages to this task.
        </div>
      ) : (
        <div className="space-y-1.5">
          {linkedPages.map((page) => {
            const pageUrl = workspaceKey
              ? `/workspaces/${workspaceKey}/pages/${page.slug}`
              : `/documents`;

            return (
              <div
                key={page.id}
                className="flex items-center justify-between gap-3 p-2.5 rounded-[6px] bg-[#F9F9F8] dark:bg-[#252525] border border-[#EAEAEA] dark:border-white/[0.06] hover:border-[#2563EB]/40 transition-colors group"
              >
                <a
                  href={pageUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2.5 min-w-0 flex-1 hover:text-[#2563EB] transition-colors"
                >
                  <FileText className="w-4 h-4 text-[#2563EB] flex-shrink-0" />
                  <span className="text-xs font-semibold text-[#111111] dark:text-[#E8E8E7] truncate group-hover:text-[#2563EB]">
                    {page.title}
                  </span>
                  <ExternalLink className="w-3 h-3 text-[#9B9A97] opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                </a>

                {canEdit && (
                  <button
                    type="button"
                    onClick={() => handleUnlinkPage(page.id)}
                    disabled={unlinkingId === page.id}
                    title="Unlink document"
                    className="p-1 rounded-[4px] text-[#9B9A97] hover:text-[#EF4444] hover:bg-white dark:hover:bg-[#2E2E2E] transition-colors"
                  >
                    {unlinkingId === page.id ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : (
                      <Trash2 className="w-3.5 h-3.5" />
                    )}
                  </button>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
