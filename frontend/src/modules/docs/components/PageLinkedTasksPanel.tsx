"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { CheckCircle2, CheckSquare, ExternalLink, Loader2, Tag } from "lucide-react";
import { taskService } from "@/modules/workspace/shared/services/taskService";

interface LinkedTask {
  id: string;
  key: string;
  title: string;
  status: string;
  columnId?: string;
  priority: string;
  type: string;
}

interface PageLinkedTasksPanelProps {
  pageId: string;
  workspaceKey: string;
}

const getStatusBadge = (status: string) => {
  const s = status?.toLowerCase() || "";
  if (s.includes("done") || s.includes("complete")) {
    return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/40";
  }
  if (s.includes("progress") || s.includes("doing")) {
    return "bg-blue-100 text-blue-800 dark:bg-blue-950/40 dark:text-blue-300 border-blue-200 dark:border-blue-800/40";
  }
  if (s.includes("review")) {
    return "bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-300 border-amber-200 dark:border-amber-800/40";
  }
  return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-700";
};

const getPriorityBadge = (priority: string) => {
  const p = priority?.toLowerCase() || "";
  if (p === "urgent" || p === "highest" || p === "high") {
    return "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-950/30";
  }
  if (p === "medium") {
    return "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30";
  }
  return "text-slate-600 dark:text-slate-400 bg-slate-50 dark:bg-slate-800";
};

export default function PageLinkedTasksPanel({
  pageId,
  workspaceKey,
}: PageLinkedTasksPanelProps) {
  const [tasks, setTasks] = useState<LinkedTask[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let isMounted = true;
    async function fetchLinkedTasks() {
      if (!pageId) return;
      try {
        setLoading(true);
        const list = await taskService.getLinkedTasksForPage(pageId);
        if (isMounted) setTasks(list);
      } catch {
        // Fallback silently if none found or route error
      } finally {
        if (isMounted) setLoading(false);
      }
    }
    void fetchLinkedTasks();
    return () => {
      isMounted = false;
    };
  }, [pageId]);

  if (loading) {
    return (
      <div className="flex items-center gap-2 text-xs text-gray-400 py-4">
        <Loader2 className="w-3.5 h-3.5 animate-spin" /> Checking linked Jira tasks...
      </div>
    );
  }

  if (tasks.length === 0) {
    return null;
  }

  return (
    <section className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-800">
      <div className="flex items-center gap-2 mb-4">
        <CheckSquare className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
        <h3 className="text-sm font-semibold text-gray-900 dark:text-gray-100">
          Referenced Jira Tasks ({tasks.length})
        </h3>
        <span className="text-xs text-gray-500 dark:text-gray-400">
          Tasks linking to this specification
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {tasks.map((task) => (
          <Link
            key={task.id}
            href={`/workspaces/${workspaceKey}/board`}
            className="flex items-start justify-between gap-3 p-3 rounded-lg border border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-900 hover:border-indigo-500/50 hover:shadow-sm transition-all group"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-1.5 py-0.5 text-xs font-semibold font-mono rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/40">
                  {task.key}
                </span>
                <span
                  className={`px-1.5 py-0.5 text-[10px] font-medium rounded border ${getStatusBadge(
                    task.status || task.columnId || ""
                  )}`}
                >
                  {task.status || task.columnId || "Todo"}
                </span>
                {task.priority && (
                  <span
                    className={`px-1.5 py-0.5 text-[10px] font-medium rounded ${getPriorityBadge(
                      task.priority
                    )}`}
                  >
                    {task.priority}
                  </span>
                )}
              </div>
              <p className="text-xs font-medium text-gray-900 dark:text-gray-100 truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {task.title}
              </p>
            </div>
            <ExternalLink className="w-3.5 h-3.5 text-gray-400 group-hover:text-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0 mt-0.5" />
          </Link>
        ))}
      </div>
    </section>
  );
}
