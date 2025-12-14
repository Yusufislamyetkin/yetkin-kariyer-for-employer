"use client";

import Link from "next/link";
import Image from "next/image";
import { signOutAction } from "@/app/actions/auth";
import { ThemeToggle } from "@/app/components/ThemeToggle";
import { useTheme } from "@/app/contexts/ThemeContext";
import {
  LayoutDashboard,
  Briefcase,
  FolderKanban,
  Trophy,
  FileText,
  Users,
  BarChart3,
  Menu,
  X,
  LogOut,
  User,
  Code,
  Search,
  Calendar,
  MessageSquare,
  Bell,
  Building2,
} from "lucide-react";
import { useState, useEffect, useMemo, useCallback } from "react";
import { usePathname } from "next/navigation";
import { ThemeProvider } from "@/app/contexts/ThemeContext";

type NavigationItem = {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
};

type NavigationGroup = {
  title: string;
  items: NavigationItem[];
};

export function DashboardLayoutClient({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  return (
    <ThemeProvider>
      <DashboardLayoutContent session={session}>{children}</DashboardLayoutContent>
    </ThemeProvider>
  );
}

function DashboardLayoutContent({
  children,
  session,
}: {
  children: React.ReactNode;
  session: any;
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isMobile, setIsMobile] = useState(false);
  const pathname = usePathname();
  const { toggleTheme } = useTheme();

  const checkMobile = useCallback(() => {
    const mobile = window.innerWidth < 1024;
    setIsMobile(mobile);
    if (mobile) {
      setSidebarOpen(false);
    }
  }, []);

  useEffect(() => {
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, [checkMobile]);

  // Map paths to their hub categories
  const pathToHubMap: Record<string, string> = {
    "/dashboard/jobs": "/dashboard/hub/is-yonetimi",
    "/dashboard/freelancer": "/dashboard/hub/is-yonetimi",
    "/dashboard/hackathons": "/dashboard/hub/is-yonetimi",
    "/dashboard/cv-pool": "/dashboard/hub/aday-yonetimi",
    "/dashboard/candidate-matcher": "/dashboard/hub/aday-yonetimi",
    "/dashboard/interviews": "/dashboard/hub/aday-yonetimi",
    "/dashboard/top-users": "/dashboard/hub/aday-yonetimi",
    "/dashboard/messages": "/dashboard/hub/aday-yonetimi",
    "/dashboard/analytics": "/dashboard/hub/aday-yonetimi",
  };

  const navigationGroups: NavigationGroup[] = useMemo(() => {
    return [
      {
        title: "Anasayfa",
        items: [
          {
            name: "Dashboard",
            href: "/dashboard",
            icon: LayoutDashboard,
          },
        ],
      },
      {
        title: "İş Yönetimi",
        items: [
          {
            name: "İş Yönetimi",
            href: "/dashboard/hub/is-yonetimi",
            icon: Briefcase,
          },
        ],
      },
      {
        title: "Aday Yönetimi",
        items: [
          {
            name: "Aday Yönetimi",
            href: "/dashboard/hub/aday-yonetimi",
            icon: Users,
          },
        ],
      },
    ];
  }, []);

  const isActiveLink = useCallback(
    (href: string) => {
      if (!pathname) return false;
      if (pathname === href) return true;
      if (href === "/dashboard" || href === "/") return false;

      // Check if current path belongs to this hub
      for (const [path, hubPath] of Object.entries(pathToHubMap)) {
        if (pathname.startsWith(path) && hubPath === href) {
          return true;
        }
      }

      // Check for exact matches
      const hasExactMatch = navigationGroups.some((group) =>
        group.items.some((item) => item.href !== href && pathname === item.href)
      );

      if (hasExactMatch) {
        return false;
      }

      return pathname.startsWith(`${href}/`);
    },
    [pathname, navigationGroups]
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-blue-50/30 to-purple-50/30 dark:from-gray-900 dark:via-gray-800 dark:to-gray-900 transition-colors duration-200">
      {/* Sidebar overlay */}
      <div
        className={`fixed inset-0 z-40 bg-black/50 transition-opacity duration-300 ${
          sidebarOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setSidebarOpen(false)}
        aria-hidden={!sidebarOpen}
      />

      {/* Sidebar */}
      <aside
        className={`fixed top-0 left-0 z-50 h-screen w-64 border-r border-gray-200/50 dark:border-gray-700/50 transition-transform duration-300 bg-white/85 dark:bg-gray-900/85 backdrop-blur-md ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-col h-full">
          {/* Logo */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200/50 dark:border-gray-700/50">
            <Link
              href="/dashboard"
              className="text-2xl font-display font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              YTK Career
            </Link>
            <button
              onClick={() => setSidebarOpen(false)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2 overflow-y-auto">
            {navigationGroups.map((group) => (
              <div key={group.title} className="space-y-1 mb-6">
                <h3 className="px-4 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-2">
                  {group.title}
                </h3>
                {group.items.map((item) => {
                  const Icon = item.icon;
                  const isActive = isActiveLink(item.href);
                  return (
                    <Link
                      key={item.name}
                      href={item.href}
                      className={`relative flex items-center gap-3 rounded-xl px-4 py-3 text-gray-700 transition-all duration-200 dark:text-gray-300 ${
                        isActive
                          ? "bg-gradient-to-r from-blue-500/10 to-purple-500/10 text-blue-600 dark:from-blue-500/20 dark:to-purple-500/20 dark:text-blue-400 font-semibold"
                          : "hover:bg-gray-100/50 dark:hover:bg-gray-700/50"
                      }`}
                      onClick={() => isMobile && setSidebarOpen(false)}
                    >
                      {isActive && (
                        <span className="absolute left-0 top-1/2 h-8 w-1 -translate-y-1/2 rounded-r-full bg-gradient-to-b from-blue-500 to-purple-500" />
                      )}
                      <Icon
                        className={`h-5 w-5 ${
                          isActive
                            ? "text-blue-600 dark:text-blue-400"
                            : ""
                        }`}
                      />
                      <span className="flex-1 font-medium">{item.name}</span>
                    </Link>
                  );
                })}
              </div>
            ))}
          </nav>

          {/* User section */}
          <div className="border-t border-gray-200/50 dark:border-gray-700/50 p-4">
            <Link
              href="/dashboard/settings"
              className="flex items-center gap-3 mb-3 px-2 py-2 rounded-xl hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all"
              onClick={() => isMobile && setSidebarOpen(false)}
            >
              <div className="relative w-10 h-10 rounded-full overflow-hidden bg-gradient-to-br from-blue-500 to-purple-500 flex items-center justify-center">
                {session.user?.profileImage ? (
                  <Image
                    src={session.user.profileImage}
                    alt={session.user?.name || "Profil"}
                    fill
                    className="object-cover"
                    sizes="40px"
                  />
                ) : (
                  <User className="h-5 w-5 text-white" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 truncate">
                  {session.user?.name || "İşveren"}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 truncate">
                  {session.user?.email}
                </p>
              </div>
            </Link>
            <div className="mb-2">
              <button
                onClick={toggleTheme}
                className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-gray-700 dark:text-gray-300 hover:bg-gray-100/50 dark:hover:bg-gray-700/50 transition-all"
              >
                <ThemeToggle />
                <span className="text-sm font-medium">Tema</span>
              </button>
            </div>
            <form action={signOutAction}>
              <button
                type="submit"
                className="w-full flex items-center gap-3 px-4 py-2 rounded-xl text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-all"
              >
                <LogOut className="h-5 w-5" />
                <span className="text-sm font-medium">Çıkış Yap</span>
              </button>
            </form>
          </div>
        </div>
      </aside>

      {/* Main content */}
      <div className={`${sidebarOpen ? "lg:pl-64" : ""} w-full`}>
        {/* Header */}
        <div className="sticky top-0 z-30 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200/50 dark:border-gray-700/50">
          <div className="flex items-center justify-between h-14 px-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
            >
              <Menu className="h-6 w-6" />
            </button>
            <Link
              href="/dashboard"
              className="text-xl font-display font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              YTK Career
            </Link>
            <div className="w-6" />
          </div>
        </div>

        {/* Page content */}
        <main className="p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
