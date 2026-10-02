"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, X, ArrowUpRight, Sparkles } from "lucide-react";
import { NavAuthActions } from "./LandingAuthActions";
import AdminNavLink from "./AdminNavLink";

const navLinks = [
  { name: "Tính năng", href: "#features" },
  { name: "Xem trước Bảng", href: "#workspace-demo" },
  { name: "Phân quyền", href: "#roles" },
  { name: "Quy trình", href: "#how-it-works" },
  { name: "Đánh giá", href: "#testimonials" },
  { name: "Về chúng tôi", href: "/aboutUs", isRoute: true },
];

export default function LandingGlassNavbar() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [hoveredIdx, setHoveredIdx] = useState<number | null>(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="fixed top-3 sm:top-4 inset-x-0 z-50 px-3 sm:px-6 pointer-events-none"
    >
      <div className="pointer-events-auto mx-auto max-w-7xl">
        <div
          className={`relative flex items-center justify-between px-3 sm:px-5 py-2.5 transition-all duration-300 rounded-2xl md:rounded-full ${isScrolled
              ? "bg-[#070C18]/85 backdrop-blur-2xl border border-white/[0.14] shadow-[0_8px_32px_0_rgba(0,0,0,0.5),0_0_20px_rgba(95,44,255,0.12)]"
              : "bg-[#0B1120]/75 backdrop-blur-xl border border-white/[0.1] shadow-[0_8px_24px_0_rgba(0,0,0,0.35)]"
            }`}
        >
          {/* Subtle top reflection line */}
          <div className="pointer-events-none absolute inset-x-10 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/25 to-transparent rounded-full" />

          {/* Left: Brand Logo */}
          <div className="flex items-center gap-6">
            <Link href="/" className="group flex items-center gap-2.5">
              <div className="relative">
                <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-[#5F2CFF] to-cyan-500 opacity-40 blur-sm group-hover:opacity-75 transition duration-300" />
                <Image
                  src="/icon.png"
                  alt="TaskFlow Logo"
                  width={34}
                  height={34}
                  className="relative h-8 w-8 sm:h-8 sm:w-8 object-contain transition-transform duration-300 group-hover:scale-105"
                  priority
                />
              </div>
              <div className="flex items-center gap-1.5">
                <span className="text-base sm:text-lg font-black tracking-tight text-white group-hover:text-white/90 transition-colors">
                  TaskFlow
                </span>
              </div>
            </Link>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1">
              {navLinks.map((item, idx) => {
                const LinkComponent = item.isRoute ? Link : "a";
                return (
                  <motion.div
                    key={item.name}
                    className="relative"
                    onMouseEnter={() => setHoveredIdx(idx)}
                    onMouseLeave={() => setHoveredIdx(null)}
                  >
                    <LinkComponent
                      href={item.href}
                      className="relative z-10 px-3 py-1.5 text-xs font-medium text-slate-300 transition-colors duration-200 hover:text-white flex items-center gap-1"
                    >
                      {item.name}
                    </LinkComponent>

                    {/* Animated hover highlight pill */}
                    {hoveredIdx === idx && (
                      <motion.div
                        layoutId="nav-hover-pill"
                        transition={{ type: "spring", stiffness: 400, damping: 30 }}
                        className="absolute inset-0 rounded-full bg-white/[0.08] border border-white/[0.08] backdrop-blur-sm z-0"
                      />
                    )}
                  </motion.div>
                );
              })}

              <div className="ml-1 pl-2 border-l border-white/10">
                <AdminNavLink />
              </div>
            </nav>
          </div>

          {/* Right Action Group */}
          <div className="flex items-center gap-2 sm:gap-3">
            <NavAuthActions />

            {/* Mobile Menu Toggle Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Mở menu di động"
              className="lg:hidden p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/[0.08] border border-white/[0.08] transition-colors"
            >
              {mobileMenuOpen ? <X size={18} /> : <Menu size={18} />}
            </button>
          </div>
        </div>

        {/* Mobile Dropdown Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.98 }}
              transition={{ duration: 0.2, ease: "easeOut" }}
              className="mt-2 lg:hidden rounded-2xl bg-[#0B1120]/95 backdrop-blur-2xl border border-white/[0.12] p-4 shadow-2xl shadow-black/60"
            >
              <nav className="flex flex-col gap-1">
                {navLinks.map((item) => {
                  const LinkComponent = item.isRoute ? Link : "a";
                  return (
                    <LinkComponent
                      key={item.name}
                      href={item.href}
                      onClick={() => setMobileMenuOpen(false)}
                      className="flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium text-slate-200 hover:text-white hover:bg-white/[0.08] transition-colors"
                    >
                      <span>{item.name}</span>
                      <ArrowUpRight size={14} className="text-slate-400" />
                    </LinkComponent>
                  );
                })}

                <div className="pt-2 mt-2 border-t border-white/10 px-3">
                  <AdminNavLink />
                </div>
              </nav>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
