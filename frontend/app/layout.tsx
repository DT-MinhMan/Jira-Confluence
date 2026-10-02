import "@/styles/globals.css";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import QueryProvider from "@/shared/providers/QueryProvider";
import TokenHandler from "@/modules/auth/shared/components/TokenHandler";
import ToastProvider from "@/shared/providers/ToastProvider";
import { Suspense } from "react";

export const metadata = {
    title: {
      template: '%s - TaskFlow',
      default: 'TaskFlow — Nền tảng Quản lý Dự án & Công việc Hiện đại',
    },
    description: "TaskFlow là không gian làm việc số hiện đại hỗ trợ theo dõi nhiệm vụ, bảng Kanban, kế hoạch sprint và cộng tác nhóm.",
    icons: {
      icon: [
        { url: "/favicon.ico?v=5", sizes: "any" },
        { url: "/icon.png?v=5", type: "image/png", sizes: "512x512" },
      ],
      shortcut: "/favicon.ico?v=5",
      apple: "/apple-icon.png?v=5",
    },
    openGraph: {
      title: "TaskFlow",
      type: "website",
      locale: "vi_VN",
    },
  };


export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="vi" suppressHydrationWarning className={`${GeistSans.variable} ${GeistMono.variable}`}>
      <head>
        <link rel="icon" href="/favicon.ico?v=5" sizes="any" />
        <link rel="icon" type="image/png" href="/icon.png?v=5" sizes="512x512" />
        <link rel="shortcut icon" href="/favicon.ico?v=5" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var theme = localStorage.getItem('app-theme') || 'system';
                  var classList = document.documentElement.classList;
                  classList.remove('light', 'dark');
                  if (theme === 'system') {
                    var systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
                    classList.add(systemTheme);
                  } else {
                    classList.add(theme);
                  }
                } catch (e) {}
              })();
              (function() {
                try {
                  var scale = localStorage.getItem('app-font-scale') || '1';
                  document.documentElement.style.setProperty('--font-scale', scale);
                } catch (e) {}
              })();
            `,
          }}
        />
      </head>
      <body className="" suppressHydrationWarning>
        <Suspense>
          <QueryProvider>
            <TokenHandler />
            <ToastProvider />
            {children}
          </QueryProvider>
        </Suspense>
      </body>
    </html>
  );
}
