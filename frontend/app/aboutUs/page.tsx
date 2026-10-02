"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Check,
  CheckCircle2,
  Clock,
  Code2,
  FileText,
  Flame,
  GitBranch,
  HeartHandshake,
  KanbanSquare,
  Layers,
  LockKeyhole,
  Play,
  RefreshCw,
  Rocket,
  ShieldCheck,
  Sparkles,
  Terminal,
  UsersRound,
  Zap,
} from "lucide-react";
import { NavAuthActions } from "../LandingAuthActions";
import AdminNavLink from "../AdminNavLink";
import BackToTop from "@/shared/components/back-to-top/BackToTop";

// ==========================================
// DỮ LIỆU THỬ NGHIỆM THỰC TẾ TỪ README.MD
// ==========================================
const testLogs = [
  { file: "src/modules/workspace/tests/workspace.service.spec.ts", time: "1.12s", tests: 48 },
  { file: "src/modules/tasks/tests/task.lifecycle.spec.ts", time: "0.85s", tests: 64 },
  { file: "src/modules/auth/tests/rbac.guard.spec.ts", time: "0.64s", tests: 32 },
  { file: "src/modules/documents/tests/confluence.spec.ts", time: "1.34s", tests: 56 },
  { file: "src/modules/sprints/tests/sprint.engine.spec.ts", time: "0.98s", tests: 42 },
];

export default function AboutPage() {
  const [activeCard, setActiveCard] = useState<number | null>(null);
  const [isRunningTests, setIsRunningTests] = useState(false);
  const [visibleTestCount, setVisibleTestCount] = useState(5);
  const [testPassPercent, setTestPassPercent] = useState(100);

  // Hiệu ứng chạy lại test giả lập trên Terminal
  const handleRerunTests = () => {
    if (isRunningTests) return;
    setIsRunningTests(true);
    setVisibleTestCount(0);
    setTestPassPercent(0);

    let count = 0;
    const interval = setInterval(() => {
      count++;
      setVisibleTestCount(count);
      setTestPassPercent(Math.min(100, Math.round((count / testLogs.length) * 100)));
      if (count >= testLogs.length) {
        clearInterval(interval);
        setIsRunningTests(false);
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#FAFBFC] text-slate-800 antialiased dark:bg-[#0B0F17] dark:text-slate-100 transition-colors duration-200">
      {/* ========================================================
          STICKY NAVBAR (Đồng bộ chuẩn Atlassian)
          ======================================================== */}
      <header className="sticky top-0 z-40 border-b border-slate-200/80 bg-white/95 backdrop-blur-md dark:border-white/[0.08] dark:bg-[#0B0F17]/95">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Logo Brand */}
          <div className="flex items-center gap-8">
            <Link href="/" className="flex items-center gap-2.5 group">
              <Image
                src="/icon.png"
                alt="TaskFlow Logo"
                width={36}
                height={36}
                priority
                className="h-9 w-9 object-contain transition-transform duration-300 group-hover:scale-105"
              />
              <div className="flex flex-col leading-none">
                <span className="text-xl font-black tracking-tight text-slate-900 dark:text-white">
                  TaskFlow
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-400">
                  Jira & Confluence
                </span>
              </div>
            </Link>

            {/* Nav Links */}
            <nav className="hidden items-center gap-6 md:flex">
              <Link
                href="/#features"
                className="text-sm font-semibold text-slate-600 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-white"
              >
                Tính năng
              </Link>
              <Link
                href="/aboutUs"
                className="text-sm font-bold text-blue-600 dark:text-blue-400 relative"
              >
                Về chúng tôi
                <span className="absolute -bottom-2 left-0 right-0 h-0.5 rounded-full bg-blue-600 dark:bg-blue-400" />
              </Link>
              <Link
                href="/#workflow"
                className="text-sm font-semibold text-slate-600 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-white"
              >
                Quy trình
              </Link>
              <Link
                href="/#faq"
                className="text-sm font-semibold text-slate-600 transition hover:text-blue-600 dark:text-slate-300 dark:hover:text-white"
              >
                Hỏi đáp
              </Link>
            </nav>
          </div>

          {/* Right Action Group */}
          <div className="flex items-center gap-3">
            <AdminNavLink />
            <NavAuthActions />
          </div>
        </div>
      </header>

      {/* ========================================================
          HERO SECTION: ANIMATION SỨ MỆNH & TRIẾT LÝ PHÁT TRIỂN
          ======================================================== */}
      <section className="relative overflow-hidden px-4 pb-16 pt-20 sm:px-6 lg:px-8">
        {/* Subtle background ambient circles */}
        <div className="pointer-events-none absolute -top-24 left-1/2 -z-10 h-96 w-96 -translate-x-1/2 rounded-full bg-blue-500/10 blur-3xl dark:bg-blue-600/10" />

        <div className="mx-auto max-w-4xl text-center">
          {/* Headline H1 with staggered entry */}
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
            className="text-4xl font-extrabold tracking-tight text-slate-900 dark:text-white sm:text-5xl lg:text-6xl"
          >
            Được xây dựng cho các đội ngũ kỹ thuật triển khai phần mềm với{" "}
            <span className="text-[#0C66E4] dark:text-[#388BFF] inline-block hover:scale-105 transition-transform">
              sự rõ ràng
            </span>{" "}
            và{" "}
            <span className="text-[#2D5A27] dark:text-[#4ADE80] inline-block hover:scale-105 transition-transform">
              dòng chảy liên tục
            </span>
            .
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
            className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-slate-600 dark:text-slate-300"
          >
            Các đội ngũ Agile hiện đại thường lãng phí hàng giờ chuyển đổi giữa các công cụ theo dõi lỗi rời rạc, tài liệu wiki ngắt quãng và các cuộc trò chuyện phân tán.
            TaskFlow kết hợp tốc độ sprint của Jira cùng tính năng soạn thảo tài liệu thời gian thực của Confluence vào một không gian làm việc đồng nhất, nguồn dữ liệu tin cậy duy nhất.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4"
          >
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-[#0C66E4] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-blue-600/25 transition hover:bg-blue-700"
              >
                Bắt đầu miễn phí <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}>
              <Link
                href="/#features"
                className="inline-flex items-center gap-2 rounded-xl border border-slate-300 bg-white px-6 py-3 text-sm font-semibold text-slate-700 shadow-sm transition hover:bg-slate-50 dark:border-white/10 dark:bg-slate-800/80 dark:text-slate-200 dark:hover:bg-slate-800"
              >
                Khám phá tính năng <Layers className="h-4 w-4" />
              </Link>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================
          COLOR-BLOCK VALUES: 3 KHỐI MÀU VỚI SPRING HOVER & TILT
          ======================================================== */}
      <section className="px-4 py-16 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mb-12 text-center"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#0C66E4] dark:text-blue-400">
              Trụ cột cốt lõi
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Ba cam kết đằng sau mọi trải nghiệm tương tác
            </h2>
          </motion.div>

          <div className="grid gap-6 md:grid-cols-3">
            {/* Card 1: Forest Green */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onHoverStart={() => setActiveCard(0)}
              onHoverEnd={() => setActiveCard(null)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#2D5A27] p-8 text-white shadow-xl transition-all"
            >
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-150" />

              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Tốc độ
                  </span>
                  <motion.div
                    animate={activeCard === 0 ? { rotate: [0, -12, 12, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <Rocket className="h-6 w-6 text-emerald-200" />
                  </motion.div>
                </div>
                <h3 className="mt-6 text-2xl font-black leading-tight">
                  Triển khai Sprint không hỗn loạn
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-emerald-100/90">
                  Chia nhỏ các mục tiêu sản phẩm phức tạp thành các đầu việc cụ thể, dễ bàn giao. Bảng Kanban tương tác,
                  các cột trạng thái tự động và biểu đồ burndown giúp đội ngũ luôn hoàn thành cam kết trong từng chu kỳ.
                </p>
              </div>

              <div className="mt-8 border-t border-white/20 pt-4">
                <div className="space-y-2 text-xs font-medium text-emerald-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span>Bảng Kanban thời gian thực với giới hạn WIP</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-emerald-300" />
                    <span>Lập kế hoạch sprint & quản lý backlog</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 2: Royal Purple */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onHoverStart={() => setActiveCard(1)}
              onHoverEnd={() => setActiveCard(null)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#6D28D9] p-8 text-white shadow-xl transition-all"
            >
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-150" />

              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Quản trị
                  </span>
                  <motion.div
                    animate={activeCard === 1 ? { scale: [1, 1.2, 1] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <ShieldCheck className="h-6 w-6 text-purple-200" />
                  </motion.div>
                </div>
                <h3 className="mt-6 text-2xl font-black leading-tight">
                  Minh bạch tuyệt đối & Phân quyền RBAC
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-purple-100/90">
                  Tầm nhìn toàn diện về quyền sở hữu nhiệm vụ, tiến độ dự án và cấp độ bảo mật.
                  Hệ thống phân quyền 4 cấp độ chi tiết (Chủ sở hữu, Quản trị viên, Thành viên, Khách) bảo vệ các yêu cầu nhạy cảm mà vẫn giữ quy trình minh bạch.
                </p>
              </div>

              <div className="mt-8 border-t border-white/20 pt-4">
                <div className="space-y-2 text-xs font-medium text-purple-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-300" />
                    <span>Kiểm soát truy cập phân quyền 4 cấp độ chi tiết</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-purple-300" />
                    <span>Nhật ký hoạt động trực tiếp & kiểm toán thời gian thực</span>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* Card 3: Atlassian Blue */}
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -8, scale: 1.02 }}
              onHoverStart={() => setActiveCard(2)}
              onHoverEnd={() => setActiveCard(null)}
              className="group relative flex flex-col justify-between overflow-hidden rounded-3xl bg-[#0C66E4] p-8 text-white shadow-xl transition-all"
            >
              <div className="absolute -right-12 -top-12 h-36 w-36 rounded-full bg-white/10 blur-2xl transition-transform duration-500 group-hover:scale-150" />

              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-bold uppercase tracking-wider text-white">
                    Tri thức
                  </span>
                  <motion.div
                    animate={activeCard === 2 ? { rotate: [0, -10, 10, 0] } : {}}
                    transition={{ duration: 0.5 }}
                  >
                    <FileText className="h-6 w-6 text-blue-200" />
                  </motion.div>
                </div>
                <h3 className="mt-6 text-2xl font-black leading-tight">
                  Tài liệu Confluence gắn liền với công việc
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-blue-100/90">
                  Yêu cầu kỹ thuật, tài liệu hồi tưởng sprint và thiết kế kiến trúc không nên nằm ở các công cụ biệt lập bên ngoài.
                  Tài liệu được liên kết liền mạch với thẻ công việc và hoạt động của dự án.
                </p>
              </div>

              <div className="mt-8 border-t border-white/20 pt-4">
                <div className="space-y-2 text-xs font-medium text-blue-100">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-200" />
                    <span>Trình soạn thảo văn bản cộng tác chuyên sâu</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4 text-blue-200" />
                    <span>Liên kết trực tiếp tác vụ & ghi chú cuộc họp</span>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================
          ENGINEERING RIGOR & LIVE SIMULATED TERMINAL TEST SUITE
          ======================================================== */}
      <section className="border-y border-slate-200/80 bg-white py-20 dark:border-white/[0.08] dark:bg-[#111726]/40">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-12 lg:grid-cols-2">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
            >
              <div className="inline-flex items-center gap-2 rounded-full border border-emerald-300 bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 dark:border-emerald-800 dark:bg-emerald-950/40 dark:text-emerald-300">
                <CheckCircle2 className="h-3.5 w-3.5" />
                ĐỘ ỔN ĐỊNH KIẾN TRÚC ĐƯỢC XÁC MINH
              </div>

              <h2 className="mt-4 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
                Được xây dựng với quy chuẩn kỹ thuật công nghiệp và độ bao phủ kiểm thử tự động 100%.
              </h2>

              <p className="mt-4 text-base leading-relaxed text-slate-600 dark:text-slate-300">
                Chúng tôi tin rằng các công cụ quản lý dự án Agile không bao giờ được phép gián đoạn. TaskFlow được bảo chứng bởi quy trình CI/CD
                tự động với các bài kiểm thử đơn vị, tích hợp và kiểm tra an ninh toàn diện.
              </p>

              <div className="mt-8 grid grid-cols-2 gap-4">
                <motion.div
                  whileHover={{ scale: 1.03, borderColor: "#22C55E" }}
                  className="rounded-2xl border border-slate-200 bg-[#FAFBFC] p-5 dark:border-white/10 dark:bg-[#0B0F17] transition-colors"
                >
                  <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400">100%</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Tỷ lệ kiểm thử thành công
                  </p>
                  <p className="mt-1 text-xs text-slate-500">463 / 463 bài kiểm thử đạt kết quả 100%</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03, borderColor: "#0C66E4" }}
                  className="rounded-2xl border border-slate-200 bg-[#FAFBFC] p-5 dark:border-white/10 dark:bg-[#0B0F17] transition-colors"
                >
                  <p className="text-3xl font-black text-blue-600 dark:text-blue-400">54</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Bộ kiểm thử
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Bao phủ toàn diện backend & các module</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03, borderColor: "#9333EA" }}
                  className="rounded-2xl border border-slate-200 bg-[#FAFBFC] p-5 dark:border-white/10 dark:bg-[#0B0F17] transition-colors"
                >
                  <p className="text-3xl font-black text-purple-600 dark:text-purple-400">99.9%</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Thời gian hoạt động
                  </p>
                  <p className="mt-1 text-xs text-slate-500">Bộ nhớ đệm Redis + Khả năng phục hồi Docker</p>
                </motion.div>

                <motion.div
                  whileHover={{ scale: 1.03, borderColor: "#EA580C" }}
                  className="rounded-2xl border border-slate-200 bg-[#FAFBFC] p-5 dark:border-white/10 dark:bg-[#0B0F17] transition-colors"
                >
                  <p className="text-3xl font-black text-orange-600 dark:text-orange-400">0</p>
                  <p className="mt-1 text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-slate-200">
                    Lỗi an toàn kiểu
                  </p>
                  <p className="mt-1 text-xs text-slate-500">TypeScript nghiêm ngặt từ đầu đến cuối</p>
                </motion.div>
              </div>
            </motion.div>

            {/* Terminal snippet: Animated interactive test runner */}
            <motion.div
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.6 }}
              className="rounded-2xl border border-slate-800 bg-[#0F172A] p-6 text-slate-300 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <div className="h-3 w-3 rounded-full bg-red-500/80" />
                  <div className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <div className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="ml-2 font-mono text-xs text-slate-400 flex items-center gap-1.5">
                    <Terminal className="h-3.5 w-3.5 text-blue-400" />
                    pnpm --filter backend test
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleRerunTests}
                  disabled={isRunningTests}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-slate-800 px-2.5 py-1 text-[11px] font-mono font-medium text-slate-300 hover:bg-slate-700 transition disabled:opacity-50"
                  title="Mô phỏng chạy lại kiểm thử"
                >
                  <RefreshCw className={`h-3 w-3 ${isRunningTests ? "animate-spin text-blue-400" : ""}`} />
                  {isRunningTests ? "Đang chạy..." : "Chạy lại"}
                </button>
              </div>

              {/* Terminal live lines */}
              <div className="mt-5 space-y-2 font-mono text-xs leading-relaxed text-slate-300 min-h-[160px]">
                {testLogs.slice(0, visibleTestCount).map((log, idx) => (
                  <motion.div
                    key={log.file}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3 }}
                    className="flex items-center justify-between"
                  >
                    <div className="flex items-center gap-2 truncate">
                      <span className="rounded bg-emerald-950/80 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400 border border-emerald-800/80 shrink-0">
                        PASS
                      </span>
                      <span className="truncate text-slate-200">{log.file}</span>
                    </div>
                    <span className="text-slate-500 shrink-0 text-[11px]">{log.time}</span>
                  </motion.div>
                ))}

                {isRunningTests && visibleTestCount < testLogs.length && (
                  <div className="flex items-center gap-2 text-slate-400 animate-pulse text-[11px] pt-1">
                    <span className="h-1.5 w-1.5 rounded-full bg-blue-400 animate-ping" />
                    Executing suite: {testLogs[visibleTestCount]?.file}...
                  </div>
                )}

                {visibleTestCount >= testLogs.length && (
                  <motion.div
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.4 }}
                    className="my-4 border-t border-slate-800 pt-3 text-slate-400"
                  >
                    <div className="flex justify-between">
                      <span>Bộ kiểm thử:</span>
                      <span className="font-bold text-emerald-400">54 đạt, 54 tổng</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Số bài test:</span>
                      <span className="font-bold text-emerald-400">463 đạt, 463 tổng</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Snapshots:</span>
                      <span className="text-slate-400">0 tổng</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Xác minh:</span>
                      <span className="text-slate-300 font-semibold">{testPassPercent}% đã kiểm tra</span>
                    </div>
                  </motion.div>
                )}

                {visibleTestCount >= testLogs.length && (
                  <motion.p
                    initial={{ scale: 0.95, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.3 }}
                    className="rounded bg-emerald-950/60 p-2 font-semibold text-emerald-300 text-center border border-emerald-800/60 flex items-center justify-center gap-2"
                  >
                    <Check className="h-4 w-4 text-emerald-400" />
                    Đã hoàn thành toàn bộ các bài kiểm thử với tỷ lệ đạt 100%.
                  </motion.p>
                )}
              </div>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================
          CULTURE & PRINCIPLES VỚI STAGGER HOVER
          ======================================================== */}
      <section className="px-4 py-20 sm:px-6 lg:px-8">
        <div className="mx-auto max-w-7xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
            className="mx-auto max-w-2xl text-center"
          >
            <p className="text-xs font-bold uppercase tracking-widest text-[#0C66E4] dark:text-blue-400">
              Văn hóa của chúng tôi
            </p>
            <h2 className="mt-2 text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl">
              Những nguyên tắc dẫn lối cho mọi quyết định kỹ thuật & sản phẩm
            </h2>
          </motion.div>

          <div className="mt-12 grid gap-8 md:grid-cols-3">
            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50 transition-all hover:border-blue-400"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-400 transition-transform duration-300 group-hover:scale-110">
                <UsersRound className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                Doanh nghiệp mở, Trung thực & Thẳng thắn
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Thông tin không bao giờ bị khóa sau các rào cản hành chính. Mọi cập nhật nhiệm vụ, đánh giá sprint và bình luận
                đều minh bạch để đề cao tinh thần trách nhiệm.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50 transition-all hover:border-emerald-400"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-400 transition-transform duration-300 group-hover:scale-110">
                <HeartHandshake className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                Xây dựng bằng Tâm huyết & Cân bằng
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Chúng tôi cân bằng giữa tốc độ sprint thần tốc và sức khỏe lâu dài của mã nguồn. Triển khai nhanh không bao giờ đánh đổi
                sự an toàn kiểu dữ liệu, độ tin cậy hay tính tinh xảo của thiết kế.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 25 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
              whileHover={{ y: -6, scale: 1.02 }}
              className="rounded-2xl border border-slate-200/80 bg-white p-6 shadow-sm dark:border-white/10 dark:bg-slate-900/50 transition-all hover:border-purple-400"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-400 transition-transform duration-300 group-hover:scale-110">
                <Zap className="h-6 w-6" />
              </div>
              <h3 className="mt-5 text-xl font-bold text-slate-900 dark:text-white">
                Đồng hành như Một Đội ngũ Thống nhất
              </h3>
              <p className="mt-3 text-sm leading-relaxed text-slate-600 dark:text-slate-400">
                Các nhóm đa chức năng làm việc hiệu quả nhất khi nhà thiết kế, lập trình viên và người quản lý sản phẩm cùng chia sẻ
                một không gian làm việc mà không cần chuyển đổi ngữ cảnh.
              </p>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ========================================================
          CTA FOOTER BANNER VỚI SPRING HOVER
          ======================================================== */}
      <section className="px-4 pb-20 sm:px-6 lg:px-8">
        <motion.div
          initial={{ opacity: 0, scale: 0.96 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
          className="mx-auto max-w-6xl rounded-3xl bg-gradient-to-br from-[#0C66E4] via-blue-600 to-[#0747A6] p-8 text-center text-white shadow-2xl sm:p-12 relative overflow-hidden"
        >
          <div className="pointer-events-none absolute -bottom-10 -right-10 h-64 w-64 rounded-full bg-white/10 blur-2xl" />

          <h2 className="text-3xl font-extrabold sm:text-4xl">
            Sẵn sàng nâng cấp quy trình Agile cho đội ngũ của bạn?
          </h2>
          <p className="mx-auto mt-4 max-w-2xl text-base text-blue-100">
            Gia nhập cùng hàng trăm đội ngũ đang sắp xếp backlog sprint, tài liệu cộng tác và chu kỳ phát hành trên TaskFlow.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 rounded-xl bg-white px-6 py-3 text-sm font-bold text-blue-700 shadow-md transition hover:bg-blue-50"
              >
                Bắt đầu miễn phí <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-xl border border-white/30 bg-white/10 px-6 py-3 text-sm font-bold text-white transition hover:bg-white/20"
              >
                Đăng nhập vào không gian làm việc
              </Link>
            </motion.div>
          </div>
        </motion.div>
      </section>

      {/* ========================================================
          FOOTER (Đồng bộ chuẩn hệ thống)
          ======================================================== */}
      <footer className="border-t border-slate-200/80 bg-white dark:border-white/[0.08] dark:bg-[#0B0F17] px-4 py-12 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-7xl gap-8 md:grid-cols-4">
          <div>
            <Link href="/" className="flex items-center gap-2">
              <Image
                src="/icon.png"
                alt="TaskFlow"
                width={32}
                height={32}
                className="h-8 w-8 object-contain"
              />
              <span className="text-lg font-black text-slate-900 dark:text-white">TaskFlow</span>
            </Link>
            <p className="mt-3 text-xs leading-relaxed text-slate-500">
              Nền tảng quản lý Agile thế hệ mới kết nối lập kế hoạch sprint, bảng Kanban và tài liệu Confluence trong một không gian làm việc thống nhất.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Nền tảng
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-slate-500">
              <li><Link href="/#features" className="hover:text-blue-600">Bảng Kanban</Link></li>
              <li><Link href="/#features" className="hover:text-blue-600">Kế hoạch Sprint</Link></li>
              <li><Link href="/#features" className="hover:text-blue-600">Tài liệu Confluence</Link></li>
              <li><Link href="/#features" className="hover:text-blue-600">Bảo mật RBAC</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Công ty
            </h4>
            <ul className="mt-3 space-y-2 text-xs text-slate-500">
              <li><Link href="/aboutUs" className="hover:text-blue-600">Về chúng tôi</Link></li>
              <li><Link href="/#workflow" className="hover:text-blue-600">Quy trình</Link></li>
              <li><Link href="/#faq" className="hover:text-blue-600">Hỏi đáp</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 dark:text-white">
              Độ tin cậy
            </h4>
            <div className="mt-3 space-y-1.5 text-xs text-slate-500">
              <p><strong>100%</strong> Kiểm thử tự động đạt</p>
              <p><strong>54</strong> Bộ kiểm thử thành công</p>
              <p className="flex items-center gap-1.5 text-emerald-600 font-semibold">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                Thời gian hoạt động 99.9%
              </p>
            </div>
          </div>
        </div>

        <div className="mx-auto mt-10 flex max-w-7xl flex-col items-center justify-between border-t border-slate-200/80 pt-6 text-xs text-slate-500 dark:border-white/[0.08] sm:flex-row">
          <p>© {new Date().getFullYear()} TaskFlow. Bảo lưu mọi quyền.</p>
          <BackToTop />
        </div>
      </footer>
    </div>
  );
}
