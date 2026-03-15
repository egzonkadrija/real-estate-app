"use client";

import * as React from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link, Locale, usePathname, useRouter } from "@/i18n/routing";
import { usePathname as useNativePathname, useSearchParams } from "next/navigation";
import {
  LayoutDashboard,
  Building2,
  Mail,
  ClipboardList,
  Users,
  LogOut,
  Menu,
  X,
  Search,
} from "lucide-react";
import { BrandMark } from "@/components/branding/BrandMark";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const t = useTranslations("admin");
  const locale = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const nativePathname = useNativePathname();
  const searchParams = useSearchParams();
  const [sidebarOpen, setSidebarOpen] = React.useState(false);
  const [globalSearch, setGlobalSearch] = React.useState(searchParams.get("q") ?? "");
  const isLoginPage = pathname === "/admin/login" || pathname.endsWith("/admin/login");

  React.useEffect(() => {
    setGlobalSearch(searchParams.get("q") ?? "");
  }, [searchParams]);

  React.useEffect(() => {
    const timeout = window.setTimeout(() => {
      const next = new URLSearchParams(searchParams);
      const nextValue = globalSearch.trim();

      if (nextValue) {
        next.set("q", nextValue);
      } else {
        next.delete("q");
      }

      const nextQuery = next.toString();
      const target = nextQuery ? `${nativePathname}?${nextQuery}` : nativePathname;
      const current = `${nativePathname}${searchParams.toString() ? `?${searchParams}` : ""}`;

      if (target !== current) {
        router.replace(target, { locale });
      }
    }, 250);

    return () => window.clearTimeout(timeout);
  }, [globalSearch, locale, nativePathname, router, searchParams]);

  async function handleLogout() {
    const shouldLogout = window.confirm("Are you sure you want to log out?");
    if (!shouldLogout) {
      return;
    }

    try {
      await fetch("/api/auth/logout", { method: "POST" });
    } finally {
      router.replace("/admin/login", { locale });
    }
  }

  const navItems = [
    { href: "/admin/dashboard" as const, label: t("dashboard"), icon: LayoutDashboard },
    { href: "/admin/properties" as const, label: t("properties"), icon: Building2 },
    { href: "/admin/requests" as const, label: "Submitted Properties", icon: ClipboardList },
    { href: "/admin/contacts" as const, label: "Requested Properties", icon: Mail },
    { href: "/admin/agents" as const, label: t("agents"), icon: Users },
  ];

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar - Desktop */}
      <aside className="hidden w-64 flex-shrink-0 border-r border-gray-200 bg-white lg:block">
        <div className="flex h-16 items-center border-b border-gray-200 px-6">
          <Link
            href="/admin/dashboard"
            className="flex items-center gap-2 rounded-md focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <BrandMark className="h-9 w-9 shrink-0 text-blue-600" />
            <span className="inline-flex flex-col justify-center leading-none">
              <span className="text-lg font-extrabold tracking-wide text-gray-900">
                NOVA
              </span>
              <span className="mt-0.5 block w-full text-center text-[9px] font-semibold tracking-[0.2em] text-blue-600">
                STATE
              </span>
            </span>
          </Link>
        </div>
        <nav className="flex flex-col gap-1 p-4">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-blue-50 text-blue-600"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <item.icon className="h-5 w-5" />
              {item.label}
            </Link>
          ))}
        </nav>
        <div className="mt-auto border-t border-gray-200 p-4">
          <button
            onClick={handleLogout}
            className="flex w-full cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-gray-600 transition-colors hover:bg-red-50 hover:text-red-600"
          >
            <LogOut className="h-5 w-5" />
            Logout
          </button>
        </div>
      </aside>

      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <aside className="fixed left-0 top-0 h-full w-64 bg-white shadow-xl">
            <div className="flex h-16 items-center justify-between border-b border-gray-200 px-6">
              <Link
                href="/admin/dashboard"
                onClick={() => setSidebarOpen(false)}
                className="inline-flex items-center gap-2 rounded-md leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
              >
                <BrandMark className="h-8 w-8 shrink-0 text-blue-600" />
                <span className="inline-flex flex-col justify-center leading-none">
                  <span className="text-lg font-extrabold tracking-wide text-gray-900">
                    NOVA
                  </span>
                  <span className="mt-0.5 block w-full text-center text-[9px] font-semibold tracking-[0.2em] text-blue-600">
                    STATE
                  </span>
                </span>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="cursor-pointer rounded-md p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="px-4 pb-3 pt-3">
              <div className="flex items-center gap-2 rounded-lg border border-gray-200 px-3 py-2 text-sm">
                <Search className="h-4 w-4 text-gray-500" />
                <input
                  value={globalSearch}
                  onChange={(e) => setGlobalSearch(e.target.value)}
                  className="w-full bg-transparent outline-none"
                  placeholder="Search..."
                />
                {globalSearch ? (
                  <button
                    type="button"
                    onClick={() => setGlobalSearch("")}
                    className="cursor-pointer rounded-full p-1 text-gray-500 hover:bg-gray-100"
                  >
                    <X className="h-4 w-4" />
                  </button>
                ) : null}
              </div>
            </div>
            <nav className="flex flex-col gap-1 p-4">
              {navItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
                    pathname.startsWith(item.href)
                      ? "bg-blue-50 text-blue-600"
                      : "text-gray-600 hover:bg-gray-100"
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              ))}
              <button
                onClick={handleLogout}
                className="mt-4 flex cursor-pointer items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-5 w-5" />
                Logout
              </button>
            </nav>
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex flex-1 flex-col">
        {/* Mobile header */}
        <header className="flex h-16 items-center gap-4 border-b border-gray-200 bg-white px-4 lg:hidden">
          <button
            onClick={() => setSidebarOpen(true)}
            className="cursor-pointer rounded-md p-1"
          >
            <Menu className="h-5 w-5" />
          </button>
          <Link
            href="/admin/dashboard"
            className="inline-flex items-center gap-2 rounded-md leading-none focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500"
          >
            <BrandMark className="h-8 w-8 shrink-0 text-blue-600" />
            <span className="inline-flex flex-col justify-center leading-none">
              <span className="text-lg font-extrabold tracking-wide text-gray-900">
                NOVA
              </span>
              <span className="mt-0.5 block w-full text-center text-[9px] font-semibold tracking-[0.2em] text-blue-600">
                STATE
              </span>
            </span>
          </Link>
        </header>
        <main className="flex-1 p-4 md:p-6 lg:p-8">
          <div className="mb-4 hidden items-center gap-2 rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm lg:flex">
            <Search className="h-4 w-4 text-gray-500" />
            <input
              value={globalSearch}
              onChange={(e) => setGlobalSearch(e.target.value)}
              className="flex-1 bg-transparent outline-none"
              placeholder="Search..."
            />
            {globalSearch ? (
              <button
                type="button"
                onClick={() => setGlobalSearch("")}
                className="cursor-pointer rounded-full p-1 text-gray-500 hover:bg-gray-100"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}
          </div>
          {children}
        </main>
      </div>
    </div>
  );
}
