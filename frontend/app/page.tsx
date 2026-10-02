"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence, useInView, animate } from "framer-motion";
import {
  Activity,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarClock,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
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
  Quote,
  Radio,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Star,
  UsersRound,
  Workflow,
  Zap,
} from "lucide-react";
import { HeroAuthActions, HeroEasySignUpForm } from "./LandingAuthActions";
import LandingGlassNavbar from "./LandingGlassNavbar";
import BackToTop from "@/shared/components/back-to-top/BackToTop";

// ==========================================
// DỮ LIỆU GỐC 100% TỪ TASKFLOW
// ==========================================
const trustedTeams = [
  "Nhóm Startup",
  "Doanh nghiệp Agency",
  "Đội ngũ Lập trình viên",
  "Nhóm Phát triển Sản phẩm",
  "Doanh nghiệp Lớn",
];

// Số liệu thống kê hỗ trợ hiệu ứng Count-Up (như Unbrew template)
const statsData = [
  { value: 10000, suffix: "+", label: "Nhiệm vụ hoàn thành", detail: "được theo dõi trên mọi dự án" },
  { value: 500, suffix: "+", label: "Đội ngũ tham gia", detail: "cộng tác liền mạch và hiệu quả" },
  { value: 99.9, suffix: "%", decimals: 1, label: "Thời gian hoạt động", detail: "độ ổn định chuẩn doanh nghiệp" },
];

// 6 Thẻ Bento Grid phong cách Linear/Raycast với Spotlight Glow & Sheen
const colorBlockFeatures = [
  {
    badge: "KANBAN",
    title: "Bảng Kanban",
    desc: "Trực quan hóa luồng công việc từ backlog đến hoàn thành với các cột trạng thái được thiết kế cho đội ngũ triển khai.",
    action: "Khám phá Kanban",
    icon: KanbanSquare,
    accentColor: "#10B981", // Emerald Green
    accentClass: "text-emerald-400",
    badgeClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20",
    iconBgClass: "bg-emerald-500/10 text-emerald-400 border border-emerald-500/25",
    borderHoverClass: "hover:border-emerald-500/50 hover:shadow-emerald-950/40",
    glowGradient: "radial-gradient(400px circle at 50% 0%, rgba(16, 185, 129, 0.18), transparent 70%)",
    previewType: "kanban",
  },
  {
    badge: "SPRINT",
    title: "Kế hoạch Sprint",
    desc: "Lập kế hoạch sprint, cân bằng khối lượng công việc và gắn kết mục tiêu sản phẩm với thực thi.",
    action: "Lập kế hoạch Sprint",
    icon: GitBranch,
    accentColor: "#F97316", // Terracotta Orange
    accentClass: "text-orange-400",
    badgeClass: "bg-orange-500/10 text-orange-400 border border-orange-500/20",
    iconBgClass: "bg-orange-500/10 text-orange-400 border border-orange-500/25",
    borderHoverClass: "hover:border-orange-500/50 hover:shadow-orange-950/40",
    glowGradient: "radial-gradient(400px circle at 50% 0%, rgba(249, 115, 22, 0.18), transparent 70%)",
    previewType: "sprint",
  },
  {
    badge: "CỘNG TÁC",
    title: "Cộng tác đội ngũ",
    desc: "Sử dụng bình luận, nhắc tên (@mention), lịch sử hoạt động và phân công trách nhiệm trong cùng một không gian làm việc.",
    action: "Cộng tác ngay",
    icon: UsersRound,
    accentColor: "#A855F7", // Purple / Violet
    accentClass: "text-purple-400",
    badgeClass: "bg-purple-500/10 text-purple-400 border border-purple-500/20",
    iconBgClass: "bg-purple-500/10 text-purple-400 border border-purple-500/25",
    borderHoverClass: "hover:border-purple-500/50 hover:shadow-purple-950/40",
    glowGradient: "radial-gradient(400px circle at 50% 0%, rgba(168, 85, 247, 0.18), transparent 70%)",
    previewType: "team",
  },
  {
    badge: "PHÂN TÍCH",
    title: "Phân tích & Tiến độ",
    desc: "Theo dõi tốc độ sprint, rào cản, khối lượng công việc và sức khỏe dự án qua các bảng điều khiển trực quan.",
    action: "Xem phân tích",
    icon: BarChart3,
    accentColor: "#3B82F6", // Royal Blue
    accentClass: "text-blue-400",
    badgeClass: "bg-blue-500/10 text-blue-400 border border-blue-500/20",
    iconBgClass: "bg-blue-500/10 text-blue-400 border border-blue-500/25",
    borderHoverClass: "hover:border-blue-500/50 hover:shadow-blue-950/40",
    glowGradient: "radial-gradient(400px circle at 50% 0%, rgba(59, 130, 246, 0.18), transparent 70%)",
    previewType: "analytics",
  },
  {
    badge: "THỜI GIAN THỰC",
    title: "Cập nhật thời gian thực",
    desc: "Theo dõi tiến độ, di chuyển nhiệm vụ và hoạt động dự án được đồng bộ trực tiếp khi các thành viên phối hợp.",
    action: "Xem đồng bộ trực tiếp",
    icon: Radio,
    accentColor: "#06B6D4", // Ocean Cyan
    accentClass: "text-cyan-400",
    badgeClass: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20",
    iconBgClass: "bg-cyan-500/10 text-cyan-400 border border-cyan-500/25",
    borderHoverClass: "hover:border-cyan-500/50 hover:shadow-cyan-950/40",
    glowGradient: "radial-gradient(400px circle at 50% 0%, rgba(6, 182, 212, 0.18), transparent 70%)",
    previewType: "realtime",
  },
  {
    badge: "BẢO MẬT",
    title: "Phân quyền theo vai trò",
    desc: "Bảo vệ không gian làm việc với tính năng kiểm soát truy cập rõ ràng cho quản trị viên, thành viên và khách.",
    action: "Kiểm tra phân quyền",
    icon: ShieldCheck,
    accentColor: "#EF4444", // Crimson Red
    accentClass: "text-rose-400",
    badgeClass: "bg-rose-500/10 text-rose-400 border border-rose-500/20",
    iconBgClass: "bg-rose-500/10 text-rose-400 border border-rose-500/25",
    borderHoverClass: "hover:border-rose-500/50 hover:shadow-rose-950/40",
    glowGradient: "radial-gradient(400px circle at 50% 0%, rgba(239, 68, 68, 0.18), transparent 70%)",
    previewType: "roles",
  },
];

const metricCards = [
  { label: "hoàn thành", value: "24", subtitle: "trong 7 ngày qua", icon: CheckCircle2, tone: "text-emerald-400", bg: "bg-emerald-950/40 border border-emerald-500/20" },
  { label: "đã cập nhật", value: "86", subtitle: "trong 7 ngày qua", icon: PencilLine, tone: "text-[#5F2CFF]", bg: "bg-[#5F2CFF]/10 border border-[#5F2CFF]/20" },
  { label: "đã tạo", value: "31", subtitle: "trong 7 ngày qua", icon: FileText, tone: "text-[#DFF6FF]", bg: "bg-[#DFF6FF]/10 border border-[#DFF6FF]/20" },
  { label: "sắp đến hạn", value: "12", subtitle: "trong 7 ngày tới", icon: CalendarClock, tone: "text-amber-400", bg: "bg-amber-950/40 border border-amber-500/20" },
];

const previewTasks = [
  { key: "ALT-128", title: "Thiết kế ma trận phân quyền không gian làm việc", priority: "Cao", type: "Story", avatar: "MN", color: "bg-[#5F2CFF]" },
  { key: "ALT-134", title: "Kết nối bảng sprint với luồng hoạt động", priority: "Trung bình", type: "Task", avatar: "LT", color: "bg-emerald-600" },
  { key: "ALT-139", title: "Kiểm thử cài đặt tùy chọn thông báo", priority: "Thấp", type: "Bug", avatar: "QA", color: "bg-amber-600" },
];

const roles = [
  { role: "Quản trị viên (Admin)", access: "Toàn quyền quản trị hệ thống", level: "100%", color: "bg-gradient-to-r from-[#5F2CFF] to-[#DFF6FF]" },
  { role: "Chủ không gian làm việc", access: "Thanh toán, quản lý thành viên, cài đặt", level: "82%", color: "bg-gradient-to-r from-[#5F2CFF] to-[#DFF6FF]" },
  { role: "Thành viên", access: "Tạo, phân công, cập nhật công việc", level: "58%", color: "bg-gradient-to-r from-[#5F2CFF] to-[#DFF6FF]" },
  { role: "Khách", access: "Chỉ xem dự án được phân quyền", level: "30%", color: "bg-gradient-to-r from-[#5F2CFF] to-[#DFF6FF]" },
];

const steps = [
  { num: "01", title: "Tạo không gian làm việc", desc: "Khởi tạo không gian nhóm trong vài giây với các loại tác vụ và phân quyền linh hoạt." },
  { num: "02", title: "Mời đội ngũ tham gia", desc: "Mời lập trình viên, PM và các bên liên quan với bảo mật phân quyền chi tiết theo vai trò." },
  { num: "03", title: "Tạo nhiệm vụ công việc", desc: "Sắp xếp ưu tiên các đầu việc trong backlog, chỉ định người phụ trách và đặt hạn hoàn thành một cách dễ dàng." },
  { num: "04", title: "Theo dõi tiến độ", desc: "Giao sản phẩm đúng hạn với bảng Kanban thời gian thực và các chỉ số đo lường sprint." },
];

// Dữ liệu đánh giá người dùng thực tế (Testimonials Carousel)
const testimonials = [
  {
    quote: "TaskFlow đã thay thế hoàn toàn bộ đôi Trello + Google Docs rườm rà trước đây của chúng tôi. Tính năng đồng bộ sprint trên Kanban và ma trận phân quyền đã giảm một nửa thời gian họp lập kế hoạch sprint.",
    name: "Alex Rivera",
    role: "Kỹ sư Frontend trưởng",
    company: "FinFlow Tech",
    avatar: "AR",
    accent: "from-[#5F2CFF] to-indigo-600",
  },
  {
    quote: "Khả năng đồng bộ thời gian thực cực kỳ nhanh chóng. Khi các lập trình viên kéo thả một nhiệm vụ trên bảng sprint, tất cả các bên liên quan đều thấy tiến độ cập nhật ngay lập tức không có độ trễ.",
    name: "Minh Thu",
    role: "Giám đốc sản phẩm cấp cao",
    company: "NextGen Media",
    avatar: "MT",
    accent: "from-emerald-500 to-teal-600",
  },
  {
    quote: "Thiết lập phân quyền chi tiết cho lập trình viên, nhà thiết kế và khách bên ngoài chỉ mất chưa đầy 2 phút. Đây là giải pháp thay thế Jira trực quan nhất mà chúng tôi từng trải nghiệm.",
    name: "David Chen",
    role: "Giám đốc kỹ thuật",
    company: "CloudScale Studio",
    avatar: "DC",
    accent: "from-blue-500 to-cyan-600",
  },
  {
    quote: "Theo dõi tốc độ sprint và phân tích khối lượng công việc đã mang lại cho startup của chúng tôi tầm nhìn rõ ràng và chính xác ngay trước đợt phát hành phiên bản lớn.",
    name: "Sarah Jenkins",
    role: "Chuyên gia Scrum & Agile Coach",
    company: "Velocity AI",
    avatar: "SJ",
    accent: "from-purple-500 to-pink-600",
  },
];

const faqs = [
  {
    question: "TaskFlow là gì?",
    answer: "TaskFlow là nền tảng quản lý dự án toàn diện dành cho các đội ngũ cần không gian làm việc, quản lý nhiệm vụ, bảng Kanban, lập kế hoạch sprint, cộng tác và theo dõi tiến độ dự án tập trung tại một nơi.",
  },
  {
    question: "Những ai nên sử dụng TaskFlow?",
    answer: "TaskFlow được thiết kế dành cho các đội ngũ phát triển phần mềm, startup, agency, freelancer, nhà quản lý sản phẩm (PM), quản lý dự án và các nhóm Agile cần một không gian làm việc linh hoạt, đáng tin cậy.",
  },
  {
    question: "TaskFlow có hỗ trợ phân quyền người dùng không?",
    answer: "Có. Nền tảng cung cấp hệ thống phân quyền chi tiết theo vai trò bao gồm Quản trị viên, Chủ không gian làm việc, Thành viên và Khách giúp quản lý quyền hạn và bảo mật an toàn.",
  },
  {
    question: "Đội ngũ có thể theo dõi tiến độ theo thời gian thực không?",
    answer: "Có. TaskFlow cung cấp tính năng cập nhật thời gian thực, nhật ký hoạt động, thẻ phân tích trực quan, thanh tiến độ và báo cáo hiệu suất làm việc chuyên sâu.",
  },
];

// Component đếm số tự động tăng dần khi cuộn tới (Count-Up Animation như Unbrew)
function AnimatedCounter({
  target,
  suffix = "",
  decimals = 0,
}: {
  target: number;
  suffix?: string;
  decimals?: number;
}) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLSpanElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-40px" });

  useEffect(() => {
    if (!isInView) return;
    const controls = animate(0, target, {
      duration: 2.2,
      ease: [0.16, 1, 0.3, 1], // easeOutExpo
      onUpdate: (latest) => setCount(latest),
    });
    return () => controls.stop();
  }, [isInView, target]);

  return (
    <span ref={ref}>
      {decimals > 0 ? count.toFixed(decimals) : Math.floor(count).toLocaleString()}
      {suffix}
    </span>
  );
}

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);
  const [activeStepIndex, setActiveStepIndex] = useState(0);

  // Testimonials carousel state
  const [activeTestimonial, setActiveTestimonial] = useState(0);
  const [isTestimonialPaused, setIsTestimonialPaused] = useState(false);

  // Tự động xoay vòng bước quy trình (mỗi 2.5 giây)
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveStepIndex((prev) => (prev + 1) % steps.length);
    }, 2500);
    return () => clearInterval(timer);
  }, []);

  // Tự động chuyển testimonial carousel (mỗi 4.5 giây)
  useEffect(() => {
    if (isTestimonialPaused) return;
    const timer = setInterval(() => {
      setActiveTestimonial((prev) => (prev + 1) % testimonials.length);
    }, 4500);
    return () => clearInterval(timer);
  }, [isTestimonialPaused]);

  return (
    <div className="min-h-screen bg-[#070C18] text-[#E2E8F0] selection:bg-[#5F2CFF] selection:text-white">
      {/* ========================================================
          STICKY FLOATING GLASS NAVBAR
      ======================================================== */}
      <LandingGlassNavbar />

      {/* ========================================================
          HERO SECTION (DARK AESTHETICS + VIOLET GLOW + DEPTH)
      ======================================================== */}
      {/* ========================================================
          HERO SECTION (COLORLIB EASY TEMPLATE INSPIRATION + CHROME VIOLET DARK THEME)
      ======================================================== */}
      <section className="relative overflow-hidden bg-gradient-to-b from-[#0B1120] via-[#070C18] to-[#070C18] pt-24 pb-24 sm:pt-32 sm:pb-32 lg:pt-36 lg:pb-40">
        {/* Ambient atmospheric glows */}
        <div className="pointer-events-none absolute -top-40 left-1/4 h-[500px] w-[700px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(95,44,255,0.22),transparent_70%)] blur-3xl" />
        <div className="pointer-events-none absolute top-20 right-10 h-[450px] w-[550px] rounded-full bg-[radial-gradient(ellipse_at_center,rgba(223,246,255,0.08),transparent_70%)] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 items-center gap-12 lg:grid-cols-12 lg:gap-8">
            {/* Left Column: Intro & Sign-up form (Colorlib Easy intro) */}
            <div className="lg:col-span-6 xl:col-span-6">
              {/* Product Badge */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="mb-6 inline-flex items-center gap-2 rounded-full border border-[#5F2CFF]/30 bg-[#5F2CFF]/10 px-4 py-1.5 text-xs font-bold text-[#DFF6FF]"
              >
                <Sparkles className="h-3.5 w-3.5 text-[#5F2CFF]" />
                <span>Nền tảng quản lý Agile & Sprint thế hệ mới</span>
                <span className="flex h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
              </motion.div>

              {/* Main Headline (Bold, clear, Easy-inspired) */}
              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1, ease: "easeOut" }}
                className="text-4xl font-black tracking-tight text-white sm:text-5xl sm:leading-[1.12] lg:text-6xl"
              >
                Quản lý công việc & Sprint dễ dàng,{" "}
                <span className="block text-[#5F2CFF] drop-shadow-[0_0_35px_rgba(95,44,255,0.55)]">
                  không còn gián đoạn.
                </span>
              </motion.h1>

              {/* Subtitle */}
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2, ease: "easeOut" }}
                className="mt-6 max-w-xl text-base leading-relaxed text-slate-300 sm:text-lg"
              >
                Đồng bộ hóa Kanban board, sprint planning và phân quyền vai trò theo thời gian thực.
                TaskFlow kết nối sức mạnh quản lý tinh gọn của Jira cùng tính cộng tác mượt mà của Confluence.
              </motion.p>

              {/* Easy-inspired Interactive Sign-up Form */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.3, ease: "easeOut" }}
                className="mt-8"
              >
                <HeroEasySignUpForm />
              </motion.div>
            </div>

            {/* Right Column: Hero Showcase Visual (Easy template hero_img.png) */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 25 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
              className="relative flex items-center justify-center lg:col-span-6 xl:col-span-6 lg:justify-end"
            >
              {/* Backlight Glow Aura */}
              <div className="pointer-events-none absolute -inset-4 sm:-inset-8 rounded-full bg-[radial-gradient(circle_at_center,rgba(95,44,255,0.35)_0%,rgba(223,246,255,0.12)_45%,transparent_70%)] blur-3xl opacity-80" />

              {/* Floating Illustration Container */}
              <motion.div
                animate={{ y: [0, -12, 0] }}
                transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                className="relative z-10 w-full max-w-[500px]"
              >
                {/* Visual Glass Frame for hero_img */}
                <div className="relative overflow-hidden rounded-3xl border border-white/[0.12] bg-[#0E1726]/85 p-4 sm:p-6 shadow-[0_25px_60px_rgba(0,0,0,0.7),0_0_40px_rgba(95,44,255,0.2)] backdrop-blur-xl">
                  {/* Subtle top decoration bar */}
                  <div className="mb-4 flex items-center justify-between border-b border-white/[0.08] pb-3">
                    <div className="flex items-center gap-1.5">
                      <span className="h-2.5 w-2.5 rounded-full bg-rose-500/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-amber-500/80" />
                      <span className="h-2.5 w-2.5 rounded-full bg-emerald-500/80" />
                    </div>
                    <div className="flex items-center gap-1.5 text-[11px] font-bold text-[#DFF6FF]">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                      Giao diện TaskFlow Workspace
                    </div>
                  </div>

                  {/* The exact hero_img.png asset */}
                  <div className="relative flex items-center justify-center overflow-hidden rounded-2xl bg-[#090E1C]/60 p-2 sm:p-3">
                    <Image
                      src="/hero_img.png"
                      alt="TaskFlow Agile Workspace & Analytics Showcase"
                      width={465}
                      height={442}
                      priority
                      className="h-auto w-full max-h-[380px] object-contain drop-shadow-2xl transition-transform duration-300 hover:scale-[1.02]"
                    />
                  </div>
                </div>

                {/* Floating Badge 1: Top-Left Sprint Velocity */}
                <motion.div
                  animate={{ y: [0, -8, 0], x: [0, 4, 0] }}
                  transition={{ duration: 4.8, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -left-3 sm:-left-6 top-14 z-20 rounded-2xl border border-white/[0.12] bg-[#111C30]/95 p-3.5 shadow-2xl shadow-black/80 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="flex h-2 w-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                    <p className="text-[10px] font-bold uppercase tracking-wider text-slate-300">
                      Tiến độ Sprint 14
                    </p>
                  </div>
                  <p className="mt-1 text-xl font-black text-[#5F2CFF] drop-shadow-[0_0_12px_rgba(95,44,255,0.4)]">
                    92% Hoàn thành
                  </p>
                  <div className="mt-2 h-1.5 w-28 rounded-full bg-slate-700/80">
                    <div className="h-1.5 w-[92%] rounded-full bg-gradient-to-r from-[#5F2CFF] to-[#DFF6FF] shadow-[0_0_8px_rgba(95,44,255,0.6)]" />
                  </div>
                </motion.div>

                {/* Floating Badge 2: Bottom-Right Live Sync Members */}
                <motion.div
                  animate={{ y: [0, 8, 0], x: [0, -4, 0] }}
                  transition={{ duration: 5.2, delay: 0.5, repeat: Infinity, ease: "easeInOut" }}
                  className="absolute -right-3 sm:-right-6 bottom-4 z-20 rounded-2xl border border-white/[0.12] bg-[#111C30]/95 p-3.5 shadow-2xl shadow-black/80 backdrop-blur-xl"
                >
                  <div className="flex items-center gap-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
                    </span>
                    <p className="text-[10px] font-bold text-[#DFF6FF]">Đồng bộ trực tuyến</p>
                  </div>
                  <p className="mt-1 text-xs font-semibold text-white">4 thành viên đang làm việc</p>
                  <div className="mt-2 flex -space-x-1.5">
                    {["PM", "FE", "BE", "QA"].map((m, i) => (
                      <span
                        key={m}
                        className={`grid h-6 w-6 place-items-center rounded-full border-2 border-[#111C30] text-[9px] font-bold text-white shadow-sm ${
                          i === 0 ? "bg-[#5F2CFF]" : i === 1 ? "bg-emerald-600" : i === 2 ? "bg-indigo-600" : "bg-amber-600"
                        }`}
                      >
                        {m}
                      </span>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>
          </div>
        </div>

        {/* Easy-inspired Slant Divider at Hero bottom */}
        <div className="absolute bottom-0 left-0 right-0 w-full overflow-hidden leading-none z-10 pointer-events-none">
          <svg
            viewBox="0 0 1597 120"
            preserveAspectRatio="none"
            className="relative block w-full h-8 sm:h-14 lg:h-20 fill-[#070C18]"
          >
            <polygon points="0 120 1597 0 1597 120" />
            <line x1="0" y1="120" x2="1597" y2="0" stroke="rgba(95, 44, 255, 0.2)" strokeWidth="1.5" />
          </svg>
        </div>
      </section>

      {/* ========================================================
          CLIENT / PARTNER LOGOS STRIP (EASY TEMPLATE LOGO BAR)
      ======================================================== */}
      <section className="relative bg-[#070C18] py-8 sm:py-10 border-b border-white/[0.06]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-5">
            <p className="text-xs font-bold uppercase tracking-widest text-slate-400">
              Được tin cậy bởi các đội ngũ agile & công nghệ hiện đại
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-8 lg:gap-12">
            {trustedTeams.map((team) => (
              <span
                key={team}
                className="group flex items-center gap-2 rounded-xl border border-white/[0.06] bg-white/[0.02] px-4 py-2 text-xs font-bold text-slate-300 transition-all duration-200 hover:border-[#5F2CFF]/40 hover:bg-[#5F2CFF]/10 hover:text-white hover:-translate-y-0.5"
              >
                <span className="text-[#5F2CFF] font-black group-hover:drop-shadow-[0_0_8px_rgba(95,44,255,0.8)]">✦</span>
                {team}
              </span>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          DEDICATED INTERACTIVE WORKSPACE DASHBOARD PREVIEW
      ======================================================== */}
      <section id="workspace-demo" className="relative overflow-hidden bg-[#070C18] py-16 sm:py-24">
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="mx-auto max-w-3xl text-center mb-12 sm:mb-16">
            <span className="inline-flex items-center gap-2 rounded-full border border-[#5F2CFF]/30 bg-[#5F2CFF]/10 px-3.5 py-1 text-xs font-bold text-[#DFF6FF]">
              ⚡ Trải nghiệm Kanban Board trực quan
            </span>
            <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl lg:text-5xl">
              Không gian làm việc thời gian thực cho mọi Sprint
            </h2>
            <p className="mt-3 text-base text-slate-300 sm:text-lg">
              Theo dõi tiến độ, chuyển đổi trạng thái task và đồng bộ hóa công việc ngay trên một giao diện thống nhất.
            </p>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 35 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-50px" }}
            transition={{ duration: 0.7, ease: "easeOut" }}
            className="relative"
          >
            {/* Ambient backlight glow */}
            <div className="pointer-events-none absolute -inset-6 rounded-3xl bg-gradient-to-r from-[#5F2CFF]/25 via-[#DFF6FF]/10 to-[#5F2CFF]/25 blur-3xl opacity-75" />

            {/* Floating badge 1: Active sprint */}
            <motion.div
              animate={{ y: [0, -10, 0] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -left-4 top-12 z-20 hidden rounded-2xl border border-white/[0.12] bg-[#111C30]/95 p-4 shadow-2xl shadow-black/80 backdrop-blur-xl md:block"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Sprint đang chạy</p>
              <p className="mt-1 text-2xl font-black text-[#5F2CFF] drop-shadow-[0_0_12px_rgba(95,44,255,0.5)]">72%</p>
              <div className="mt-2 h-1.5 w-32 rounded-full bg-slate-700/80">
                <div className="h-1.5 w-[72%] rounded-full bg-gradient-to-r from-[#5F2CFF] to-[#DFF6FF] shadow-[0_0_8px_rgba(95,44,255,0.6)]" />
              </div>
            </motion.div>

            {/* Floating badge 2: Workspace members */}
            <motion.div
              animate={{ y: [0, -8, 0] }}
              transition={{ duration: 5, delay: 1, repeat: Infinity, ease: "easeInOut" }}
              className="absolute -right-4 bottom-12 z-20 hidden rounded-2xl border border-white/[0.12] bg-[#111C30]/95 p-4 shadow-2xl shadow-black/80 backdrop-blur-xl lg:block"
            >
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Thành viên workspace</p>
              <div className="mt-2 flex -space-x-2">
                {["PM", "FE", "BE", "QA"].map((m, i) => (
                  <span
                    key={m}
                    className={`grid h-8 w-8 place-items-center rounded-full border-2 border-[#111C30] text-[10px] font-bold text-white shadow-md ${
                      i === 0 ? "bg-[#5F2CFF]" : i === 1 ? "bg-emerald-600" : i === 2 ? "bg-purple-600" : "bg-amber-600"
                    }`}
                  >
                    {m}
                  </span>
                ))}
              </div>
            </motion.div>

            {/* Window Container */}
            <div className="relative overflow-hidden rounded-2xl border border-white/[0.12] bg-[#111C30] shadow-[0_25px_60px_rgba(0,0,0,0.8),0_0_40px_rgba(95,44,255,0.15)]">
              {/* Window Bar */}
              <div className="flex items-center justify-between border-b border-white/[0.08] bg-[#0E1726] px-4 py-3">
                <div className="flex items-center gap-2">
                  <span className="h-3 w-3 rounded-full bg-rose-500/80" />
                  <span className="h-3 w-3 rounded-full bg-amber-500/80" />
                  <span className="h-3 w-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 hidden text-xs font-semibold text-slate-300 sm:inline-block">
                    TaskFlow / Phân phối sản phẩm / Sprint 24
                  </span>
                </div>
                {/* Live Sync with pulse radar wave aura */}
                <div className="flex items-center gap-2 rounded-md border border-white/[0.08] bg-[#151F32] px-3 py-1 text-xs font-bold text-[#DFF6FF]">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  </span>
                  Đồng bộ trực tiếp
                </div>
              </div>

              {/* Window Body */}
              <div className="p-4 sm:p-6 bg-[#0B132B]/80">
                {/* 4 Metric Cards */}
                <div className="mb-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                  {metricCards.map((item) => {
                    const Icon = item.icon;
                    return (
                      <div
                        key={item.label}
                        className="flex items-center gap-3.5 rounded-xl border border-white/[0.08] bg-[#151F32] p-3.5 shadow-xs transition-colors hover:border-[#5F2CFF]/40"
                      >
                        <div className={`grid h-10 w-10 place-items-center rounded-lg ${item.bg}`}>
                          <Icon className={`h-5 w-5 ${item.tone}`} />
                        </div>
                        <div>
                          <p className="text-xl font-black leading-none text-white">
                            {item.value}
                          </p>
                          <p className="text-xs font-bold capitalize text-slate-200">
                            {item.label}
                          </p>
                          <p className="text-[10px] text-slate-400">{item.subtitle}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Real 3-Column Kanban Board Preview */}
                <div className="grid gap-4 lg:grid-cols-3">
                  {["CẦN LÀM", "ĐANG THỰC HIỆN", "ĐÁNH GIÁ"].map((col, idx) => (
                    <div
                      key={col}
                      className="rounded-xl border border-white/[0.08] bg-[#151F32] p-3.5 shadow-xs"
                    >
                      <div className="mb-3 flex items-center justify-between border-b border-white/[0.06] pb-2">
                        <h4 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-200">
                          {col}
                          <span className="grid h-5 w-5 place-items-center rounded-full bg-slate-800 text-[10px] font-bold text-slate-300">
                            {idx === 0 ? "2" : idx === 1 ? "1" : "1"}
                          </span>
                        </h4>
                        <MoreHorizontal className="h-4 w-4 text-slate-400" />
                      </div>

                      <div className="space-y-2.5">
                        {previewTasks.slice(idx === 2 ? 1 : 0, idx === 0 ? 2 : 3).map((task) => (
                          <div
                            key={task.key}
                            className="rounded-lg border border-white/[0.06] bg-[#1D293D] p-3 shadow-xs transition-all duration-200 hover:border-[#5F2CFF] hover:shadow-[0_0_16px_rgba(95,44,255,0.25)] hover:-translate-y-0.5"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[11px] font-bold text-[#5F2CFF]">
                                {task.key}
                              </span>
                              <span
                                className={`rounded px-1.5 py-0.5 text-[10px] font-bold ${
                                  task.priority === "Cao"
                                    ? "bg-rose-950 text-rose-300 border border-rose-800/40"
                                    : task.priority === "Trung bình"
                                    ? "bg-blue-950 text-blue-300 border border-blue-800/40"
                                    : "bg-slate-800 text-slate-300 border border-slate-700/40"
                                }`}
                              >
                                {task.priority}
                              </span>
                            </div>
                            <p className="mt-1.5 text-xs font-semibold text-white">
                              {task.title}
                            </p>
                            <div className="mt-3 flex items-center justify-between">
                              <span className="text-[10px] font-medium text-slate-400">{task.type}</span>
                              <div
                                className={`grid h-6 w-6 place-items-center rounded-full ${task.color} text-[10px] font-bold text-white shadow-xs`}
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
          </motion.div>
        </div>
      </section>

      {/* ========================================================
          BENTO GRID FEATURE CARDS (WITH LIGHT SHEEN & SPOTLIGHT GLOW)
      ======================================================== */}
      <section id="features" className="relative overflow-hidden py-20 lg:py-24 bg-[#070C18] border-t border-white/[0.08]">
        {/* Background ambient lighting */}
        <div className="pointer-events-none absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[radial-gradient(ellipse_at_center,rgba(95,44,255,0.08),transparent_70%)] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center mb-14"
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#5F2CFF]">
              Tính năng cốt lõi
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-5xl">
              Mọi công cụ đội ngũ bạn cần để hoàn thành dự án.
            </h2>
            <p className="mt-4 text-base text-slate-300">
              Công cụ mạnh mẽ được xây dựng với tốc độ, sự rõ ràng và khả năng kiểm soát tập trung tại một nơi.
            </p>
          </motion.div>

          {/* 3-Column Bento Grid phong cách Linear / Raycast */}
          <div className="grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
            {colorBlockFeatures.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <motion.div
                  key={feat.title}
                  initial={{ opacity: 0, y: 25 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: "-30px" }}
                  transition={{ duration: 0.5, delay: idx * 0.08, ease: "easeOut" }}
                  whileHover={{ y: -6 }}
                  className={`group relative flex flex-col justify-between overflow-hidden rounded-2xl border border-white/[0.08] bg-[#0E1626]/80 p-6 backdrop-blur-xl shadow-lg transition-all duration-300 ${feat.borderHoverClass}`}
                >
                  {/* Spotlight glow behind each card on hover */}
                  <div
                    className="pointer-events-none absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"
                    style={{ background: feat.glowGradient }}
                  />

                  {/* Vệt sáng lướt qua thẻ khi rê chuột (Shine effect lấy cảm hứng từ Unbrew) */}
                  <div className="pointer-events-none absolute -inset-full top-0 block h-full w-1/2 -skew-x-12 bg-gradient-to-r from-transparent via-white/[0.04] to-transparent opacity-0 transition-all duration-1000 group-hover:translate-x-[250%] group-hover:opacity-100" />

                  {/* Header: Icon spotlight + Badge */}
                  <div className="relative z-10">
                    <div className="flex items-center justify-between">
                      <div className={`grid h-11 w-11 place-items-center rounded-xl shadow-sm ${feat.iconBgClass}`}>
                        <Icon className="h-5 w-5" />
                      </div>
                      <span className={`rounded-md px-2 py-0.5 text-[10px] font-extrabold uppercase tracking-wider ${feat.badgeClass}`}>
                        {feat.badge}
                      </span>
                    </div>

                    {/* Title & Description */}
                    <h3 className="mt-4 text-lg font-bold text-white tracking-tight group-hover:text-white transition-colors">
                      {feat.title}
                    </h3>
                    <p className="mt-1.5 text-xs leading-relaxed text-slate-400">
                      {feat.desc}
                    </p>
                  </div>

                  {/* Interactive Micro UI Widget */}
                  <div className="relative z-10 my-5 overflow-hidden rounded-xl border border-white/[0.06] bg-[#0A101D]/70 p-3.5 backdrop-blur-sm">
                    {feat.previewType === "kanban" && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            ALT-102 Phân quyền vai trò
                          </span>
                          <span className="rounded bg-emerald-500/15 px-1.5 py-0.5 text-[9px] font-semibold text-emerald-400 border border-emerald-500/25">
                            Hoàn thành
                          </span>
                        </div>
                        <div className="rounded-lg border border-white/[0.06] bg-white/[0.03] p-2 text-[10px] text-slate-300">
                          Tạo danh mục chào mừng thành viên mới
                        </div>
                      </div>
                    )}

                    {feat.previewType === "sprint" && (
                      <div>
                        <div className="flex items-center justify-between text-[11px] font-bold text-slate-300">
                          <span className="flex items-center gap-1.5">
                            <GitBranch className="h-3.5 w-3.5 text-orange-400" />
                            Tiến độ Sprint 24
                          </span>
                          <span className="text-[10px] font-bold text-orange-400">80%</span>
                        </div>
                        <div className="mt-2.5 h-1.5 w-full rounded-full bg-white/[0.08] overflow-hidden">
                          <motion.div
                            initial={{ width: 0 }}
                            whileInView={{ width: "80%" }}
                            viewport={{ once: true }}
                            transition={{ duration: 1, ease: "easeOut" }}
                            className="h-full rounded-full bg-gradient-to-r from-orange-500 to-amber-400 shadow-[0_0_8px_rgba(249,115,22,0.5)]"
                          />
                        </div>
                        <p className="mt-2 text-[10px] text-slate-400">Đã hoàn thành 16 / 20 story points</p>
                      </div>
                    )}

                    {feat.previewType === "team" && (
                      <div className="flex items-center justify-between">
                        <div className="flex -space-x-2">
                          {["AL", "TM", "MN", "FE"].map((user, uIdx) => (
                            <div
                              key={user}
                              className={`grid h-8 w-8 place-items-center rounded-full border-2 border-[#0A101D] text-[10px] font-bold text-white shadow-sm ${
                                uIdx === 0 ? "bg-purple-600" : uIdx === 1 ? "bg-indigo-600" : uIdx === 2 ? "bg-emerald-600" : "bg-amber-600"
                              }`}
                            >
                              {user}
                            </div>
                          ))}
                        </div>
                        <span className="flex items-center gap-1.5 rounded-full border border-purple-500/20 bg-purple-500/10 px-2 py-0.5 text-[10px] font-semibold text-purple-300">
                          <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          4 Đang hoạt động
                        </span>
                      </div>
                    )}

                    {feat.previewType === "analytics" && (
                      <div className="flex items-end justify-between gap-2 h-14 pt-1">
                        {[35, 60, 45, 80, 65, 95].map((h, i) => (
                          <div key={i} className="flex-1 flex flex-col items-center gap-1">
                            <div
                              className="w-full rounded-t-sm bg-blue-500/40 transition-all duration-300 group-hover:bg-blue-400 group-hover:shadow-[0_0_8px_rgba(59,130,246,0.6)]"
                              style={{ height: `${h}%` }}
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {feat.previewType === "realtime" && (
                      <div className="flex items-center justify-between py-1">
                        <div className="flex items-center gap-2">
                          <div className="relative grid h-8 w-8 place-items-center rounded-lg bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                            <Radio className="h-4 w-4 animate-pulse" />
                          </div>
                          <div>
                            <p className="text-[11px] font-bold text-white">Đồng bộ trực tiếp</p>
                            <p className="text-[9px] text-slate-400">Đã kết nối WebSocket</p>
                          </div>
                        </div>
                        <span className="rounded bg-cyan-500/15 px-1.5 py-0.5 text-[9px] font-bold text-cyan-400">
                          &lt; 5ms
                        </span>
                      </div>
                    )}

                    {feat.previewType === "roles" && (
                      <div className="space-y-1.5 text-xs">
                        <div className="flex items-center justify-between rounded bg-white/[0.04] px-2 py-1 text-[10px]">
                          <span className="text-slate-300">Quản trị viên</span>
                          <span className="font-bold text-rose-400">Toàn quyền</span>
                        </div>
                        <div className="flex items-center justify-between rounded bg-white/[0.04] px-2 py-1 text-[10px]">
                          <span className="text-slate-300">Thành viên</span>
                          <span className="font-bold text-slate-400">Theo phân công</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer: Action Link */}
                  <div className="relative z-10 flex items-center justify-between border-t border-white/[0.06] pt-3 text-xs font-semibold text-slate-400 group-hover:text-white transition-colors">
                    <span>{feat.action}</span>
                    <ArrowRight className={`h-3.5 w-3.5 transition-transform group-hover:translate-x-1 ${feat.accentClass}`} />
                  </div>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          ROLE PERMISSIONS SECTION
      ======================================================== */}
      <section id="roles" className="py-20 bg-[#0A0F1E] border-t border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center mb-12"
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#5F2CFF]">
              Bảo mật & Quản trị
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Kiểm soát truy cập theo vai trò đảm bảo an toàn tuyệt đối.
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Bảo vệ không gian làm việc với các cấp độ truy cập rõ ràng cho quản trị viên, thành viên và khách.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 max-w-5xl mx-auto">
            {roles.map((r, idx) => (
              <motion.div
                key={r.role}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.1 }}
                whileHover={{ y: -4 }}
                className="rounded-xl border border-white/[0.08] bg-[#151F32] p-5 shadow-xs transition-colors hover:border-[#5F2CFF]/40 hover:shadow-[0_0_20px_rgba(95,44,255,0.15)]"
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-black text-white">{r.role}</span>
                  <span className="text-xs font-bold text-[#5F2CFF]">{r.level}</span>
                </div>
                <p className="mt-2 text-xs text-slate-400">{r.access}</p>
                <div className="mt-4 h-1.5 w-full rounded-full bg-slate-800 overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    whileInView={{ width: r.level }}
                    viewport={{ once: true }}
                    transition={{ duration: 1, delay: 0.2 + idx * 0.1, ease: "easeOut" }}
                    className={`h-1.5 rounded-full ${r.color}`}
                  />
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          4-STEP WORKFLOW (THỐNG NHẤT VỀ CHROME VIOLET #5F2CFF)
      ======================================================== */}
      <section id="how-it-works" className="py-20 bg-[#070C18] border-t border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center mb-16"
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#5F2CFF]">
              Quy trình làm việc
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Khởi đầu và vận hành chỉ trong vài phút.
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Các bước đơn giản, linh hoạt để tổ chức đội ngũ và hoàn thành dự án một cách rõ ràng.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 py-4">
            {steps.map((st, idx) => {
              const isActive = activeStepIndex === idx;

              return (
                <motion.div
                  key={st.num}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.08 }}
                  animate={{
                    scale: isActive ? 1.04 : 0.98,
                    y: isActive ? -6 : 0,
                  }}
                  onClick={() => setActiveStepIndex(idx)}
                  className={`cursor-pointer relative overflow-hidden rounded-2xl border p-6 transition-colors duration-200 ${
                    isActive
                      ? "border-[#5F2CFF] ring-2 ring-[#5F2CFF]/30 bg-[#152238] shadow-2xl shadow-[#5F2CFF]/20"
                      : "border-white/[0.08] bg-[#111C30]/80 shadow-xs opacity-75 hover:opacity-100 hover:border-white/20"
                  }`}
                >
                  {/* Progress bar for active step */}
                  {isActive && (
                    <motion.div
                      key={`progress-${idx}-${activeStepIndex}`}
                      initial={{ width: "0%" }}
                      animate={{ width: "100%" }}
                      transition={{ duration: 2.5, ease: "linear" }}
                      className="absolute top-0 left-0 h-1.5 bg-gradient-to-r from-[#5F2CFF] to-[#DFF6FF]"
                    />
                  )}

                  <div className="flex items-center justify-between">
                    <span
                      className={`text-3xl font-black transition-colors duration-200 ${
                        isActive ? "text-[#5F2CFF] drop-shadow-[0_0_12px_rgba(95,44,255,0.4)]" : "text-slate-600"
                      }`}
                    >
                      {st.num}
                    </span>
                    {isActive && (
                      <span className="rounded-full bg-[#5F2CFF] px-2 py-0.5 text-[10px] font-bold text-white shadow-sm shadow-[#5F2CFF]/40">
                        Đang chọn
                      </span>
                    )}
                  </div>

                  <h3 className="mt-3 text-lg font-bold text-white">
                    {st.title}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed text-slate-400">
                    {st.desc}
                  </p>
                </motion.div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ========================================================
          STATS BANNER (COUNT-UP ANIMATION NHƯ UNBREW)
      ======================================================== */}
      <section className="relative overflow-hidden py-16 bg-[#0A0F1E] border-t border-white/[0.08]">
        {/* Subtle ambient light */}
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(95,44,255,0.12),transparent_70%)]" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-8 text-center md:grid-cols-3">
            {statsData.map((st, idx) => (
              <motion.div
                key={st.label}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: idx * 0.12 }}
                whileHover={{ scale: 1.03 }}
              >
                <p className="text-4xl font-black text-[#5F2CFF] sm:text-5xl drop-shadow-[0_0_24px_rgba(95,44,255,0.4)]">
                  <AnimatedCounter target={st.value} suffix={st.suffix} decimals={st.decimals} />
                </p>
                <p className="mt-2 text-base font-bold text-white">
                  {st.label}
                </p>
                <p className="mt-1 text-xs text-slate-400">{st.detail}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          TESTIMONIALS CAROUSEL SECTION (LẤY CẢM HỨNG TỪ UNBREW)
      ======================================================== */}
      <section id="testimonials" className="relative overflow-hidden py-20 bg-[#070C18] border-t border-white/[0.08]">
        <div className="pointer-events-none absolute top-10 left-10 w-96 h-96 bg-[radial-gradient(ellipse_at_center,rgba(95,44,255,0.06),transparent_70%)] blur-3xl" />

        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="mx-auto max-w-3xl text-center mb-14"
          >
            <p className="text-xs font-extrabold uppercase tracking-[0.2em] text-[#5F2CFF]">
              Được các đội ngũ Agile tin dùng
            </p>
            <h2 className="mt-2 text-3xl font-black tracking-tight text-white sm:text-4xl">
              Lựa chọn tin cậy của các nhà quản lý luôn hoàn thành đúng tiến độ.
            </h2>
            <p className="mt-3 text-sm text-slate-300">
              Khám phá cách các đội ngũ phát triển và sản phẩm tăng tốc độ triển khai cùng TaskFlow.
            </p>
          </motion.div>

          {/* Testimonial Card Showcase */}
          <div
            className="mx-auto max-w-3xl"
            onMouseEnter={() => setIsTestimonialPaused(true)}
            onMouseLeave={() => setIsTestimonialPaused(false)}
          >
            <div className="relative min-h-[260px] overflow-hidden rounded-3xl border border-white/[0.08] bg-[#0E1626]/80 p-8 sm:p-10 shadow-2xl backdrop-blur-xl">
              {/* Decorative quotation icon */}
              <div className="absolute right-6 top-6 text-[#5F2CFF]/15">
                <Quote className="h-20 w-20" />
              </div>

              <AnimatePresence mode="wait">
                <motion.div
                  key={activeTestimonial}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.35, ease: "easeOut" }}
                  className="relative z-10 flex flex-col justify-between h-full"
                >
                  {/* Star rating */}
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="h-4 w-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>

                  {/* Quote text */}
                  <p className="my-5 text-base sm:text-lg leading-relaxed text-slate-200 font-medium">
                    &ldquo;{testimonials[activeTestimonial].quote}&rdquo;
                  </p>

                  {/* Author metadata */}
                  <div className="flex items-center justify-between border-t border-white/[0.08] pt-4">
                    <div className="flex items-center gap-3.5">
                      <div className={`grid h-10 w-10 place-items-center rounded-full bg-gradient-to-tr ${testimonials[activeTestimonial].accent} text-xs font-bold text-white shadow-md`}>
                        {testimonials[activeTestimonial].avatar}
                      </div>
                      <div>
                        <p className="text-sm font-bold text-white">{testimonials[activeTestimonial].name}</p>
                        <p className="text-xs text-slate-400">
                          {testimonials[activeTestimonial].role} · <span className="text-[#DFF6FF]">{testimonials[activeTestimonial].company}</span>
                        </p>
                      </div>
                    </div>

                    {/* Navigation buttons */}
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        aria-label="Đánh giá trước"
                        onClick={() =>
                          setActiveTestimonial((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))
                        }
                        className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white active:scale-95"
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Đánh giá tiếp theo"
                        onClick={() =>
                          setActiveTestimonial((prev) => (prev + 1) % testimonials.length)
                        }
                        className="grid h-8 w-8 place-items-center rounded-full border border-white/10 bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white active:scale-95"
                      >
                        <ChevronRight className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Indicator dots */}
            <div className="mt-6 flex items-center justify-center gap-2">
              {testimonials.map((_, i) => (
                <button
                  key={i}
                  type="button"
                  aria-label={`Chuyển đến trang ${i + 1}`}
                  onClick={() => setActiveTestimonial(i)}
                  className={`h-2 rounded-full transition-all duration-300 ${
                    activeTestimonial === i
                      ? "w-8 bg-[#5F2CFF] shadow-[0_0_8px_rgba(95,44,255,0.6)]"
                      : "w-2 bg-slate-700 hover:bg-slate-500"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================
          FAQS SECTION
      ======================================================== */}
      <section className="py-20 bg-[#070C18] border-t border-white/[0.08]">
        <div className="mx-auto max-w-3xl px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="text-center mb-12"
          >
            <h2 className="text-3xl font-black text-white">
              Câu hỏi thường gặp
            </h2>
            <p className="mt-2 text-sm text-slate-300">
              Giải đáp chi tiết giúp đội ngũ của bạn bắt đầu nhanh chóng và thuận lợi.
            </p>
          </motion.div>

          <div className="space-y-3">
            {faqs.map((faq, idx) => (
              <motion.div
                key={faq.question}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="overflow-hidden rounded-xl border border-white/[0.08] bg-[#111C30] transition-colors hover:border-white/20"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="flex w-full items-center justify-between p-4 text-left text-sm font-bold text-white transition-colors hover:text-[#DFF6FF]"
                >
                  <span>{faq.question}</span>
                  <ChevronDown
                    className={`h-4 w-4 transition-transform duration-200 ${
                      openFaq === idx ? "rotate-180 text-[#5F2CFF]" : "text-slate-400"
                    }`}
                  />
                </button>
                <AnimatePresence>
                  {openFaq === idx && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeOut" }}
                      className="border-t border-white/[0.06] px-4 pb-4 pt-2 text-xs leading-relaxed text-slate-300"
                    >
                      {faq.answer}
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ========================================================
          BOTTOM CTA BANNER (CHROME VIOLET GRADIENT + MORPH HOVER)
      ======================================================== */}
      <section className="py-16 bg-[#0A0F1E] border-t border-white/[0.08]">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <motion.div
            initial={{ opacity: 0, y: 25 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-40px" }}
            transition={{ duration: 0.6 }}
            className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#4A1FD4] via-[#5F2CFF] to-[#7C4DFF] p-8 text-white shadow-2xl sm:p-14 text-center border border-white/20 shadow-[0_0_60px_rgba(95,44,255,0.35)]"
          >
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(223,246,255,0.2),transparent_70%)]" />

            <div className="relative z-10">
              <h2 className="text-3xl font-black sm:text-5xl text-white">
                Bắt đầu cùng TaskFlow ngay hôm nay
              </h2>
              <p className="mt-4 text-base text-violet-100 max-w-2xl mx-auto">
                Cộng tác, theo dõi sprint và hoàn thành công việc hiệu quả vượt trội cùng cả đội ngũ.
              </p>
              <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                <Link
                  href="/register"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl bg-white px-8 py-3.5 text-sm font-bold text-[#4A1FD4] shadow-xl transition-all duration-300 hover:rounded-2xl hover:bg-[#DFF6FF] hover:scale-105 hover:shadow-[0_0_30px_rgba(255,255,255,0.4)] active:scale-95 sm:w-auto"
                >
                  Tạo tài khoản miễn phí <ArrowRight className="h-4 w-4" />
                </Link>
                <Link
                  href="/aboutUs"
                  className="inline-flex w-full items-center justify-center gap-2 rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all duration-300 hover:rounded-2xl hover:bg-white/20 hover:scale-105 active:scale-95 sm:w-auto"
                >
                  Về đội ngũ của chúng tôi
                </Link>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* ========================================================
          FOOTER
      ======================================================== */}
      <footer className="border-t border-white/[0.08] bg-[#070C18] py-12">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 gap-8 md:grid-cols-4">
            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Nền tảng
              </h4>
              <ul className="mt-4 space-y-2 text-xs text-slate-400">
                <li><a href="#features" className="hover:text-[#5F2CFF] transition-colors">Bảng Kanban</a></li>
                <li><a href="#features" className="hover:text-[#5F2CFF] transition-colors">Kế hoạch Sprint</a></li>
                <li><a href="#roles" className="hover:text-[#5F2CFF] transition-colors">Phân quyền theo vai trò</a></li>
                <li><a href="#how-it-works" className="hover:text-[#5F2CFF] transition-colors">Quy trình 4 bước</a></li>
                <li><a href="#testimonials" className="hover:text-[#5F2CFF] transition-colors">Đánh giá từ khách hàng</a></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Không gian làm việc
              </h4>
              <ul className="mt-4 space-y-2 text-xs text-slate-400">
                <li><Link href="/workspaces" className="hover:text-[#5F2CFF] transition-colors">Xem các không gian làm việc</Link></li>
                <li><Link href="/dashboard" className="hover:text-[#5F2CFF] transition-colors">Tổng quan bảng điều khiển</Link></li>
                <li><Link href="/dashboard/permissions" className="hover:text-[#5F2CFF] transition-colors">Ma trận phân quyền</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Công ty
              </h4>
              <ul className="mt-4 space-y-2 text-xs text-slate-400">
                <li><Link href="/aboutUs" className="hover:text-[#5F2CFF] transition-colors">Về TaskFlow</Link></li>
                <li><Link href="/login" className="hover:text-[#5F2CFF] transition-colors">Đăng nhập</Link></li>
                <li><Link href="/register" className="hover:text-[#5F2CFF] transition-colors">Bắt đầu miễn phí</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-white">
                Chỉ số nền tảng
              </h4>
              <div className="mt-4 space-y-2 text-xs text-slate-400">
                <p><strong className="text-white">10,000+</strong> Nhiệm vụ đã hoàn thành</p>
                <p><strong className="text-white">500+</strong> Đội ngũ đã tham gia</p>
                <p className="flex items-center gap-1.5 text-emerald-400 font-semibold">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
                  Thời gian hoạt động 99.9%
                </p>
              </div>
            </div>
          </div>

          <div className="mt-12 flex flex-col items-center justify-between border-t border-white/[0.08] pt-6 text-xs text-slate-500 sm:flex-row">
            <p>© {new Date().getFullYear()} TaskFlow. Bảo lưu mọi quyền.</p>
            <BackToTop />
          </div>
        </div>
      </footer>
    </div>
  );
}
