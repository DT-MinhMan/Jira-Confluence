import { Metadata } from "next";

export const metadata: Metadata = {
  title: "About Us - TaskFlow",
  description: "TaskFlow - Modern project management, task tracking, and team collaboration workspace.",
};

export default function AboutPage() {
  return (
    <div className="app-page-narrow py-12">
      <h1 className="mb-8 text-3xl font-bold text-[#111111] dark:text-[#E8E8E7]">
        About TaskFlow
      </h1>

      <div className="space-y-8">
        <section className="rounded-[12px] border border-[#EAEAEA] bg-white p-6 dark:border-white/[0.06] dark:bg-[#252525]">
          <h2 className="mb-4 text-xl font-semibold text-[#111111] dark:text-[#E8E8E7]">
            Our Mission
          </h2>
          <p className="text-[#787774] dark:text-[#9B9A97] leading-relaxed">
            TaskFlow is a modern, unified workspace platform designed to streamline task tracking,
            sprint execution, and team collaboration. From initial project planning to sprint delivery
            and retrospectives, TaskFlow empowers agile teams to organize work with clarity, boost
            productivity, and ship on time.
          </p>
        </section>

        <section className="rounded-[12px] border border-[#EAEAEA] bg-white p-6 dark:border-white/[0.06] dark:bg-[#252525]">
          <h2 className="mb-4 text-xl font-semibold text-[#111111] dark:text-[#E8E8E7]">
            Key Features
          </h2>
          <ul className="space-y-3 text-[#787774] dark:text-[#9B9A97]">
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6]" />
              <span>Workspaces and projects with granular role-based access control</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6]" />
              <span>Sprint planning, backlog prioritization, and milestone tracking</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6]" />
              <span>Interactive Kanban boards, list views, and calendar scheduling</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6]" />
              <span>Real-time collaborative document editor and team knowledge base</span>
            </li>
            <li className="flex items-start gap-3">
              <span className="mt-1 h-2 w-2 rounded-full bg-[#2563EB] dark:bg-[#3B82F6]" />
              <span>Built-in team chat, video meetings, and instant notifications</span>
            </li>
          </ul>
        </section>

        <section className="rounded-[12px] border border-[#EAEAEA] bg-white p-6 dark:border-white/[0.06] dark:bg-[#252525]">
          <h2 className="mb-4 text-xl font-semibold text-[#111111] dark:text-[#E8E8E7]">
            Technology Stack
          </h2>
          <p className="text-[#787774] dark:text-[#9B9A97] leading-relaxed">
            Built with Next.js, React, TypeScript, TailwindCSS, and NestJS, adhering to modern
            software development standards for a lightning-fast, secure, and resilient user experience.
          </p>
        </section>
      </div>
    </div>
  );
}
