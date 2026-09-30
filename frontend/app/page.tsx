"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  FileText,
  GitBranch,
  KanbanSquare,
  LayoutGrid,
  LockKeyhole,
  MoreHorizontal,
  PanelRight,
  PencilLine,
  Plus,
  Radio,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  UsersRound,
  Workflow,
  Zap,
} from "lucide-react";
import { HeroAuthActions, NavAuthActions } from "./LandingAuthActions";
import AdminNavLink from "./AdminNavLink";
import BackToTop from "@/shared/components/back-to-top/BackToTop";
import { useTheme } from "@/shared/hooks/useTheme";

// ==========================================
// DỮ LIỆU GỐC 100% TỪ TASKFLOW
// ==========================================
const trustedTeams = [
  "Startup Teams",
  "Agencies",
  "Developers",
  "Product Teams",
  "Enterprise Teams",
];

const stats = [
  { value: "10,000+", label: "Tasks completed", detail: "tracked across all projects" },
  { value: "500+", label: "Teams onboarded", detail: "collaborating seamlessly" },
  { value: "99.9%", label: "Platform uptime", detail: "enterprise-grade stability" },
];

// 6 Thẻ Color-Block nổi bật phong cách Atlassian (như ảnh mẫu)
const colorBlockFeatures = [
  {
    badge: "KANBAN",
    title: "Kanban Board",
    desc: "Visualize flow from backlog to done with status columns built for delivery teams.",
    color: "bg-[#2D5A27]", // Forest Olive Green
    accent: "text-[#86EFAC]",
    action: "Explore Kanban",
    icon: KanbanSquare,
    topBg: "bg-[#1E3A1A]",
    previewType: "kanban",
  },
  {
    badge: "SPRINT",
    title: "Sprint Planning",
    desc: "Plan iterations, balance capacity, and keep product priorities connected to execution.",
    color: "bg-[#C2410C]", // Rich Terracotta Orange
    accent: "text-[#FDBA74]",
    action: "Plan Sprints",
    icon: GitBranch,
    topBg: "bg-[#7C2D12]",
    previewType: "sprint",
  },
  {
    badge: "TEAMS",
    title: "Team Collaboration",
    desc: "Use comments, mentions, activity history, and ownership signals in one workspace.",
    color: "bg-[#6D28D9]", // Royal Purple
    accent: "text-[#DDD6FE]",
    action: "Collaborate Now",
    icon: UsersRound,
    topBg: "bg-[#4C1D95]",
    previewType: "team",
  },
  {
    badge: "ANALYTICS",
    title: "Analytics & Health",
    desc: "Monitor velocity, blockers, workload, and delivery health with focused dashboards.",
    color: "bg-[#0C66E4]", // Atlassian Royal Blue
    accent: "text-[#93C5FD]",
    action: "View Analytics",
    icon: BarChart3,
    topBg: "bg-[#00388A]",
    previewType: "analytics",
  },
  {
    badge: "REAL-TIME",
    title: "Real-time Updates",
    desc: "See progress, task movement, and project activity as teams collaborate live.",
    color: "bg-[#0E7490]", // Deep Ocean Teal
    accent: "text-[#67E8F9]",
    action: "See Live Sync",
    icon: Radio,
    topBg: "bg-[#155E75]",
    previewType: "realtime",
  },
  {
    badge: "SECURITY",
    title: "Role Permissions",
    desc: "Protect workspaces with clear access control for admins, members, and guests.",
    color: "bg-[#991B1B]", // Crimson Ruby Red
    accent: "text-[#FECACA]",
    action: "Check Roles",
    icon: ShieldCheck,
    topBg: "bg-[#7F1D1D]",
    previewType: "roles",
  },
];

const metricCards = [
  { label: "completed", value: "24", subtitle: "in the last 7 days", icon: CheckCircle2, tone: "text-emerald-500", bg: "bg-emerald-50 dark:bg-emerald-950/40" },
  { label: "updated", value: "86", subtitle: "in the last 7 days", icon: PencilLine, tone: "text-blue-500", bg: "bg-blue-50 dark:bg-blue-950/40" },
  { label: "created", value: "31", subtitle: "in the last 7 days", icon: FileText, tone: "text-indigo-500", bg: "bg-indigo-50 dark:bg-indigo-950/40" },
  { label: "due soon", value: "12", subtitle: "in the next 7 days", icon: CalendarClock, tone: "text-amber-500", bg: "bg-amber-50 dark:bg-amber-950/40" },
];

const previewTasks = [
  { key: "ALT-128", title: "Design workspace permission matrix", priority: "High", type: "Story", avatar: "MN", color: "bg-indigo-600" },
  { key: "ALT-134", title: "Connect sprint board with activity feed", priority: "Medium", type: "Task", avatar: "LT", color: "bg-emerald-600" },
  { key: "ALT-139", title: "QA notification preferences", priority: "Low", type: "Bug", avatar: "QA", color: "bg-amber-600" },
];

const roles = [
  { role: "Admin", access: "Full system control", level: "100%", color: "bg-[#0C66E4]" },
  { role: "Workspace Owner", access: "Billing, members, settings", level: "82%", color: "bg-[#6D28D9]" },
  { role: "Member", access: "Create, assign, update work", level: "58%", color: "bg-[#0E7490]" },
  { role: "Guest", access: "Scoped project visibility", level: "30%", color: "bg-[#B45309]" },
];

const steps = [
  { num: "01", title: "Create Workspace", desc: "Set up your team space in seconds with custom issue types and permissions." },
  { num: "02", title: "Invite Team", desc: "Add developers, PMs, and stakeholders with granular role-based security." },
  { num: "03", title: "Create Tasks", desc: "Prioritize backlog items, assign owners, and set deadlines with zero friction." },
  { num: "04", title: "Track Progress", desc: "Ship iterations on time with real-time Kanban boards and sprint metrics." },
];

const faqs = [
  {
    question: "What is TaskFlow?",
    answer: "TaskFlow is a project management platform for teams that need workspaces, tasks, Kanban boards, sprint planning, collaboration, and project progress tracking in one place.",
  },
  {
    question: "Who should use TaskFlow?",
    answer: "It is built for developer teams, startups, agencies, freelancers, product managers, project managers, and agile teams that need a reliable workspace.",
  },
  {
    question: "Does TaskFlow support permissions?",
    answer: "Yes. The platform includes role-based access for Admins, Workspace Owners, Members, and Guests so teams can manage visibility and control safely.",
  },
  {
    question: "Can teams track progress in real time?",
    answer: "Yes. TaskFlow provides real-time updates, activity tracking, analytics cards, progress bars, and productivity reporting as core features.",
  },
];

export default function LandingPage() {
  useTheme();
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Tự động xoay vòng phóng to/thu nhỏ lần lượt 4 bước quy trình (mỗi 2.5 giây)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#091E42] selection:bg-[#0C66E4] selection:text-white dark:bg-[#0B132B] dark:text-[#E2E8F0]">
      {/* ========================================================
          STICKY HEADER (ATLASSIAN JIRA STYLE)
      ======================================================== */}
      <header className="sticky top-0 z-50 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-white/[0.08] dark:bg-[#0B132B]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="group flex items-center gap-2.5">
              <Image
                src="/icon.png"
                alt="TaskFlow Logo"
                width={36}
                height={36}
                className="h-9 w-9 object-contain transition-transform duration-200 group-hover:scale-105"
                priority
              />
              <div className="flex flex-col">
                <div className="flex items-center gap-1.5">
                  <span className="text-lg font-black tracking-tight text-[#091E42] dark:text-white">
                    TaskFlow
                  </span>
                  <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-[#0C66E4] dark:bg-blue-900/40 dark:text-blue-300">
                    Jira+
                  </span>
                </div>
              </div>
            </Link>

            <nav className="hidden items-center gap-6 md:flex">
              <a
                href="#features"
                className="text-sm font-semibold text-slate-600 transition hover:text-[#0C66E4] dark:text-slate-300 dark:hover:text-blue-400"
              >
                Features
              </a>
              <a
                href="#workspace-demo"
                className="text-sm font-semibold text-slate-600 transition hover:text-[#0C66E4] dark:text-slate-300 dark:hover:text-blue-400"
              >
                Board Preview
              </a>
              <a
                href="#roles"
                className="text-sm font-semibold text-slate-600 transition hover:text-[#0C66E4] dark:text-slate-300 dark:hover:text-blue-400"
              >
                Permissions
              </a>
              <a
                href="#how-it-works"
                className="text-sm font-semibold text-slate-600 transition hover:text-[#0C66E4] dark:text-slate-300 dark:hover:text-blue-400"
              >
                How It Works
              </a>
              <Link
                href="/aboutUs"
                className="text-sm font-semibold text-slate-600 transition hover:text-[#0C66E4] dark:text-slate-300 dark:hover:text-blue-400"
              >
                About Us
              </Link>
              <AdminNavLink />
            </nav>
          </div>

          <div className="flex items-center gap-3">
            <NavAuthActions />
          </div>
        </div>
      </header>

      {/* ========================================================
          HERO SECTION (BRIGHT & HIGH CONTRAST)
      ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#F4F5F7] via-white to-white py-16 sm:py-24 dark:from-[#0F172A] dark:via-[#0B132B] dark:to-[#0B132B]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center">


            {/* Main Headline */}
            <motion.h1
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="text-4xl font-black tracking-tight text-[#091E42] dark:text-white sm:text-6xl sm:leading-[1.12]"
            >
              Manage tasks, sprint planning, and team collaboration in{" "}
              <span className="text-[#0C66E4] dark:text-blue-400">one unified flow.</span>
            </motion.h1>

            {/* Subtitle from original content */}
            <motion.p
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="mt-6 text-lg leading-relaxed text-slate-600 dark:text-slate-300 sm:text-xl"
            >
              TaskFlow is a modern project and task management platform for workspaces, Kanban boards,
              sprint planning, collaboration, permissions, and real-time project tracking.
            </motion.p>

            {/* CTA Group */}
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="mt-8 flex flex-col items-center justify-center gap-4 sm:flex-row"
            >
              <HeroAuthActions />
            </motion.div>

            {/* Trusted Teams Bar */}
            <div className="mt-12 border-t border-slate-200/80 pt-6 dark:border-white/[0.08]">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Trusted by modern agile teams
              </p>
              <div className="mt-4 flex flex-wrap items-center justify-center gap-3 sm:gap-6">
                {trustedTeams.map((team) => (
                  <span
                    key={team}
                    className="rounded-full bg-slate-100 px-3.5 py-1 text-xs font-semibold text-slate-700 dark:bg-white/[0.08] dark:text-slate-300"
                  >
                    ✦ {team}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* ========================================================
              AUTHENTIC WORKSPACE DASHBOARD PREVIEW
          ======================================================== */}
          <div id="workspace-demo" className="relative mt-16 sm:mt-20">
            {/* Floating badges */}
            <div className="absolute -left-4 top-12 z-20 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/[0.1] dark:bg-[#151F32] md:block">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Active sprint</p>
              <p className="mt-1 text-2xl font-black text-[#0C66E4]">72%</p>
              <div className="mt-2 h-1.5 w-32 rounded-full bg-slate-100 dark:bg-slate-700">
                <div className="h-1.5 w-[72%] rounded-full bg-[#0C66E4]" />
              </div>
            </div>

            <div className="absolute -right-4 bottom-12 z-20 hidden rounded-xl border border-slate-200 bg-white p-4 shadow-xl dark:border-white/[0.1] dark:bg-[#151F32] lg:block">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">Workspace members</p>
              <div className="mt-2 flex -space-x-2">
                {["PM", "FE", "BE", "QA"].map((m, i) => (
                  <span
                    key={m}
                    className={`grid h-8 w-8 place-items-center rounded-full border-2 border-white text-[10px] font-bold text-white shadow-sm dark:border-slate-800 ${i === 0 ? "bg-[#0C66E4]" : i === 1 ? "bg-emerald-600" : i === 2 ? "bg-purple-600" : "bg-amber-600"
                      }`}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </div>

            {/* Window Container */}
            <div className="overflow-hidden rounded-2xl border border-slate-200/90 bg-white shadow-2xl dark:border-white/[0.12] dark:bg-[#111C30]">
              {/* Window Bar */}
              <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-4 py-3 dark:border-white/[0.08] dark:bg-[#0E1726]">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-400" />
                  <span className="h-3 w-3 rounded-full bg-amber-400" />
                  <span className="h-3 w-3 rounded-full bg-emerald-400" />
                  <span className="ml-3 hidden text-xs font-semibold text-slate-600 dark:text-slate-300 sm:inline-block">
                    TaskFlow / Product Delivery / Sprint 24
                  </span>
                </div>
                <div className="flex items-center gap-2 rounded-md bg-white px-3 py-1 text-xs font-bold text-[#0C66E4] shadow-xs dark:bg-[#151F32]">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  Live Sync
                </div>
              </div>

              {/* Window Body */}
              <div className="p-4 sm:p-6 bg-slate-50/60 dark:bg-[#0B132B]/60">
                {/* 4 Metric Cards */}
                <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {metricCards.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-3.5 rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-white/[0.08] dark:bg-[#151F32]"
                      >
                        <div className={`grid h-10 w-10 place-items-center rounded-lg ${item.bg}`}>
                          <Icon className={`h-5 w-5 ${item.tone}`} />
                        </div>
                        <div>
                          <p className="text-xl font-black leading-none text-[#091E42] dark:text-white">
                            {item.value}
                          </p>
                          <p className="text-xs font-bold capitalize text-slate-700 dark:text-slate-200">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-slate-600 dark:text-slate-300">{item.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Real 3-Column Kanban Board Preview */}
                <div className="grid gap-4 lg:grid-cols-3">
                  {["TO DO", "IN PROGRESS", "REVIEW"].map((col, idx) => (
                    <div
                      key={col}
                      className="rounded-xl border border-slate-200 bg-white p-3.5 shadow-xs dark:border-white/[0.08] dark:bg-[#151F32]"
                    >
                      <div className="mb-3 flex items-center justify-between border-b border-slate-100 pb-2 dark:border-white/[0.06]">
                        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                          {col}
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-100 text-[10px] font-bold text-slate-600 dark:bg-slate-800 dark:text-slate-300">
                            {idx === 0 ? "2" : idx === 1 ? "1" : "1"}
                          </span>
                        </h4>
                        <MoreHorizontal className="h-4 w-4 text-slate-600 dark:text-slate-300" />
                      </div>

                      <div className="space-y-2.5">
                        {previewTasks.slice(idx === 2 ? 1 : 0, idx === 0 ? 2 : 3).map((task) => (
                          <div
                            key={task.key}
                            className="rounded-lg border border-slate-200 bg-white p-3 shadow-xs transition hover:border-[#0C66E4] dark:border-white/[0.06] dark:bg-[#1D293D]"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-[#0C66E4] dark:text-blue-400">
                                {task.key}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.2 text-[10px] font-bold ${task.priority === "High"
                                  ? "bg-rose-100 text-rose-700 dark:bg-rose-950 dark:text-rose-300"
                                  : task.priority === "Medium"
                                    ? "bg-blue-100 text-blue-700 dark:bg-blue-950 dark:text-blue-300"
                                    : "bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300"
                                  }`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            <p className="mt-1 text-xs font-semibold text-slate-900 dark:text-white">
                              {task.title}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-[10px] font-medium text-slate-600 dark:text-slate-300">{task.type}</span>
                              <div
                                className={`grid h-6 w-6 place-items-center rounded-full ${task.color} text-[10px] font-bold text-white`}
                              >
                                {task.avatar}
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          COLOR-BLOCK FEATURE CARDS (THE ATLASSIAN WAY)
      ======================================================== */}
      <section id="features" className="py-20 lg:py-28 bg-[#FAFBFC] dark:bg-[#070C18]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0C66E4]">
              Core Capabilities
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#091E42] dark:text-white sm:text-5xl">
              Everything your team needs to deliver work.
            </h2>
            <p className="mt-4 text-base text-slate-600 dark:text-slate-300">
              Powerful tools built with speed, clarity, and enterprise control in one place.
            </p>
          </div>

          {/* 3-Column Grid of Rich Color-Block Cards (Like the User's Screenshot) */}
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
            {colorBlockFeatures.map((feat) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  whileHover={{ y: -6 }}
                  transition={{ duration: 0.2 }}
                  className="group flex flex-col overflow-hidden rounded-2xl shadow-lg transition-shadow hover:shadow-2xl"
                >
                  {/* Top Graphic Area */}
                  <div className={`relative flex h-52 items-center justify-center p-6 ${feat.topBg}`}>
                    {/* Background Decorative Circles / Pattern */}
                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(255,255,255,0.15),transparent_60%)]" />

                    {feat.previewType === "kanban" && (
                      <div className="relative z-10 flex w-full max-w-[240px] flex-col gap-2 rounded-xl bg-white/10 p-3 backdrop-blur-md border border-white/20">
                        <div className="flex items-center justify-between text-white text-[11px] font-bold">
                          <span>Task Flow</span>
                          <span className="rounded bg-emerald-400/20 px-1.5 text-emerald-300">Done</span>
                        </div>
                        <div className="rounded-lg bg-white p-2 text-[11px] font-bold text-slate-900 shadow">
                          Define workspace roles
                        </div>
                        <div className="rounded-lg bg-white/80 p-2 text-[10px] text-slate-800">
                          Create onboarding checklist
                        </div>
                      </div>
                    )}

                    {feat.previewType === "sprint" && (
                      <div className="relative z-10 w-full max-w-[240px] rounded-xl bg-white/10 p-4 backdrop-blur-md border border-white/20 text-white">
                        <div className="flex items-center gap-2 text-xs font-bold">
                          <GitBranch className="h-4 w-4 text-amber-300" />
                          <span>Sprint 24 Iteration</span>
                        </div>
                        <div className="mt-3 h-2 w-full rounded-full bg-white/20">
                          <div className="h-2 w-4/5 rounded-full bg-amber-400" />
                        </div>
                        <p className="mt-2 text-[10px] text-white/80">80% Committed Work Done</p>
                      </div>
                    )}

                    {feat.previewType === "team" && (
                      <div className="relative z-10 flex items-center justify-center gap-2">
                        {["AL", "TM", "MN", "FE"].map((user, idx) => (
                          <div
                            key={user}
                            className={`grid h-12 w-12 place-items-center rounded-full border-2 border-white text-xs font-bold text-white shadow-lg ${idx % 2 === 0 ? "bg-indigo-500" : "bg-purple-500"
                              }`}
                          >
                            {user}
                          </div>
                        ))}
                      </div>
                    )}

                    {feat.previewType === "analytics" && (
                      <div className="relative z-10 flex items-end gap-2 h-24">
                        {[40, 65, 50, 85, 70, 95].map((h, i) => (
                          <div
                            key={i}
                            className="w-6 rounded-t-md bg-blue-300/80 transition-all group-hover:bg-white"
                            style={{ height: `${h}%` }}
                          />
                        ))}
                      </div>
                    )}

                    {feat.previewType === "realtime" && (
                      <div className="relative z-10 flex flex-col items-center gap-2 text-white">
                        <Radio className="h-10 w-10 text-cyan-300 animate-pulse" />
                        <span className="text-xs font-bold">Instant WebSocket Sync</span>
                      </div>
                    )}

                    {feat.previewType === "roles" && (
                      <div className="relative z-10 flex flex-col gap-1.5 w-full max-w-[220px] text-white text-xs">
                        <div className="flex justify-between bg-white/10 px-2.5 py-1 rounded">
                          <span>Admin</span> <strong>100%</strong>
                        </div>
                        <div className="flex justify-between bg-white/10 px-2.5 py-1 rounded">
                          <span>Member</span> <strong>58%</strong>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Bottom Solid Color Block (Inspired by screenshot) */}
                  <div className={`flex flex-1 flex-col justify-between p-6 text-white ${feat.color}`}>
                    <div>
                      {/* Pill Badge */}
                      <span className="inline-block rounded-md bg-white px-2.5 py-0.5 text-[10px] font-extrabold uppercase tracking-wider text-slate-900 shadow-sm">
                        {feat.badge}
                      </span>

                      {/* Title & Description */}
                      <h3 className="mt-3 text-xl font-black leading-snug">
                        {feat.title}
                      </h3>
                      <p className="mt-2 text-xs leading-relaxed text-white/90">
                        {feat.desc}
                      </p>
                    </div>

                    {/* Action Arrow Link */}
                    <div className="mt-6 flex items-center gap-1.5 text-xs font-bold transition group-hover:gap-2.5">
                      <span>{feat.action}</span>
                      <ArrowRight className="h-3.5 w-3.5" />
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          ROLE PERMISSIONS SECTION (ORIGINAL DATA)
      ======================================================== */}
      <section id="roles" className="py-20 bg-white dark:bg-[#0B132B] border-t border-slate-200 dark:border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0C66E4]">
              Security & Governance
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#091E42] dark:text-white sm:text-4xl">
              Role-based access control built for security.
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Protect workspaces with clear access control for admins, members, and guests.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {roles.map((r) => (
              <div
                key={r.role}
                className="rounded-xl border border-slate-200 bg-[#FAFBFC] p-5 shadow-xs dark:border-white/[0.08] dark:bg-[#151F32]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-[#091E42] dark:text-white">{r.role}</span>
                  <span className="text-xs font-bold text-[#0C66E4] dark:text-blue-400">{r.level}</span>
                </div>
                <p className="mt-2 text-xs text-slate-600 dark:text-slate-400">{r.access}</p>
                <div className="mt-4 h-1.5 w-full rounded-full bg-slate-200 dark:bg-slate-700">
                  <div className={`h-1.5 rounded-full ${r.color}`} style={{ width: r.level }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          4-STEP WORKFLOW (ORIGINAL DATA)
      ======================================================== */}
      <section id="how-it-works" className="py-20 bg-slate-50 dark:bg-[#070C18] border-t border-slate-200 dark:border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-16">
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#0C66E4]">
              Workflow
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-[#091E42] dark:text-white sm:text-4xl">
              Get up and running in minutes.
            </h2>
            <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">
              Simple, flexible steps to organize your team and ship projects with clarity.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 py-4">
            {steps.map((st, idx) => {
              const isActive = activeStepIndex === idx;
              const stepColors = [
                { border: "border-[#0C66E4]", text: "text-[#0C66E4]", bar: "bg-[#0C66E4]", ring: "ring-[#0C66E4]/30", shadow: "shadow-blue-500/20" },
                { border: "border-[#6D28D9]", text: "text-[#6D28D9]", bar: "bg-[#6D28D9]", ring: "ring-[#6D28D9]/30", shadow: "shadow-purple-500/20" },
                { border: "border-[#C2410C]", text: "text-[#C2410C]", bar: "bg-[#C2410C]", ring: "ring-[#C2410C]/30", shadow: "shadow-orange-500/20" },
                { border: "border-[#16A34A]", text: "text-[#16A34A]", bar: "bg-[#16A34A]", ring: "ring-[#16A34A]/30", shadow: "shadow-emerald-500/20" },
              ][idx];

              return (
                <motion.div
                  key={st.num}
                  animate={{
                    scale: isActive ? 1.07 : 0.98,
                    y: isActive ? -8 : 0,
                  }}
                  transition={{
                    type: "spring",
                    stiffness: 300,
                    damping: 24,
                  }}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`cursor-pointer relative overflow-hidden rounded-2xl border p-6 transition-colors duration-300 ${isActive
                    ? `${stepColors.border} ${stepColors.ring} ring-2 bg-white shadow-2xl ${stepColors.shadow} dark:bg-[#152238]`
                    : "border-slate-200 bg-white/80 shadow-xs dark:border-white/[0.08] dark:bg-[#111C30]/80 opacity-75 hover:opacity-100"
                    }`}
                >
                  {/* Thanh đếm tiến trình xoay vòng bước */}
                  {isActive && (
                    <motion.div
                      key={`progress-${idx}-${activeStepIndex}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.5, ease: "linear" }}
                      className={`absolute top-0 left-0 h-1.5 ${stepColors.bar}`}
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-3xl font-black transition-colors duration-300 ${isActive ? stepColors.text : "text-slate-300 dark:text-slate-700"
                        }`}
                    >
                      {st.num}
                    </span>
                    {isActive && (
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-bold text-white ${stepColors.bar}`}>
                        Active
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-[#091E42] dark:text-white">
                    {st.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-600 dark:text-slate-400">
                    {st.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          STATS BANNER (ORIGINAL DATA)
      ======================================================== */}
      <section className="py-16 bg-white dark:bg-[#0B132B] border-t border-slate-200 dark:border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            {stats.map((st) => (
              <div key={st.label}>
                <p className="text-4xl font-black text-[#0C66E4] dark:text-blue-400 sm:text-5xl">
                  {st.value}
                </p>
                <p className="mt-2 text-base font-bold text-[#091E42] dark:text-white">
                  {st.label}
                </p>
                <p className="mt-1 text-xs text-slate-600 dark:text-slate-300">{st.detail}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          FAQS (ORIGINAL QUESTIONS & ANSWERS)
      ======================================================== */}
      <section className="py-20 bg-slate-50 dark:bg-[#070C18] border-t border-slate-200 dark:border-white/[0.08]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-black text-[#091E42] dark:text-white">
              Frequently Asked Questions
            </h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              Clear answers to help your team get started smoothly.
            </p>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <div
                key={faq.question}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white dark:border-white/[0.08] dark:bg-[#111C30]"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between p-4 text-left text-sm font-bold text-slate-900 dark:text-white hover:text-[#0C66E4]"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 text-slate-400 transition-transform ${openFaq === idx ? "rotate-180 text-[#0C66E4]" : ""
                      }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      className="border-t border-slate-100 px-4 pb-4 pt-2 text-xs leading-relaxed text-slate-600 dark:border-white/[0.06] dark:text-slate-300"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          BOTTOM CTA (ATLASSIAN ROYAL BLUE)
      ======================================================== */}
      <section className="py-16 bg-white dark:bg-[#0B132B]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#0052CC] to-[#0C66E4] p-8 text-white shadow-xl sm:p-14 text-center">
            <h2 className="text-3xl font-black sm:text-5xl">
              Get started with TaskFlow today
            </h2>
            <p className="mt-4 text-base text-blue-100 max-w-2xl mx-auto">
              Collaborate, track sprints, and deliver high-impact work with your entire team.
            </p>
            <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <Link
                href="/register"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-[#0052CC] shadow-md transition hover:bg-blue-50 sm:w-auto"
              >
                Create Free Account <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/aboutUs"
                className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white transition hover:bg-white/20 sm:w-auto"
              >
                About Our Team
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FOOTER (AUTHENTIC TASKFLOW LINKS)
      ======================================================== */}
      <footer className="border-t border-slate-200 bg-[#FAFBFC] py-12 dark:border-white/[0.08] dark:bg-[#070C18]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Platform
              </h4>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li><a href="#features" className="hover:text-[#0C66E4]">Kanban Board</a></li>
                <li><a href="#features" className="hover:text-[#0C66E4]">Sprint Planning</a></li>
                <li><a href="#roles" className="hover:text-[#0C66E4]">Role Permissions</a></li>
                <li><a href="#how-it-works" className="hover:text-[#0C66E4]">4-Step Workflow</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Workspaces
              </h4>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li><Link href="/workspaces" className="hover:text-[#0C66E4]">View Workspaces</Link></li>
                <li><Link href="/dashboard" className="hover:text-[#0C66E4]">Dashboard Overview</Link></li>
                <li><Link href="/dashboard/permissions" className="hover:text-[#0C66E4]">Permissions Matrix</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Company
              </h4>
              <ul className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <li><Link href="/aboutUs" className="hover:text-[#0C66E4]">About TaskFlow</Link></li>
                <li><Link href="/login" className="hover:text-[#0C66E4]">Sign In</Link></li>
                <li><Link href="/register" className="hover:text-[#0C66E4]">Get Started Free</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
                Platform Stats
              </h4>
              <div className="mt-4 space-y-2 text-xs text-slate-600 dark:text-slate-400">
                <p><strong>10,000+</strong> Tasks completed</p>
                <p><strong>500+</strong> Teams onboarded</p>
                <p className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  99.9% Platform Uptime
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between border-t border-slate-200/80 pt-6 text-xs text-slate-500 dark:border-white/[0.06] sm:flex-row">
            <p>© {new Date().getFullYear()} TaskFlow. All rights reserved.</p>
            <BackToTop />
          </div>
        </div>
      </footer>
    </div>
  );
}
