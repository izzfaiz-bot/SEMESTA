// components/dashboard/DashboardSidebar.tsx

"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import {
  BookOpen,
  ChevronLeft,
  ChevronRight,
  Film,
  GraduationCap,
  House,
  KeyRound,
  Layers3,
  LogOut,
  Menu,
  Presentation,
  Rocket,
  Sparkles,
  X,
} from "lucide-react";

import Image from "next/image";

const menus = [
  {
    label: "Dashboard",
    description: "Ringkasan aktivitas",
    href: "/dashboard",
    icon: House,
  },
  {
    label: "Fenomena",
    description: "Kategori dan fenomena sains",
    href: "/dashboard/materials",
    icon: Layers3,
  },
  {
    label: "Materi Pembelajaran",
    description: "Kelola video dan presentasi",
    href: "/dashboard/learning-materials",
    icon: BookOpen,
  },
  {
    label: "Kuis Interaktif",
    description: "Soal dan jawaban",
    href: "/dashboard/quizzes",
    icon: GraduationCap,
  },
  {
    label: "Ubah Kata Sandi",
    description: "Keamanan akun",
    href: "/dashboard/settings/password",
    icon: KeyRound,
  },
];

type DashboardSidebarProps = {
  email?: string;
};

export default function DashboardSidebar({
  email = "Administrator",
}: DashboardSidebarProps) {
  const pathname = usePathname();
  const router = useRouter();

  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  async function handleLogout() {
    if (loggingOut) return;

    setLoggingOut(true);

    try {
      const response = await fetch("/api/admin/logout", {
        method: "POST",
      });

      if (!response.ok) {
        throw new Error("Logout gagal");
      }

      router.replace("/login");
      router.refresh();
    } catch {
      setLoggingOut(false);
      alert("Logout gagal. Silakan coba lagi.");
    }
  }

  function navigate(href: string) {
    setMobileOpen(false);

    if (pathname !== href) {
      router.push(href);
    }
  }

  function isActive(href: string) {
    if (href === "/dashboard") {
      return pathname === href;
    }

    if (href === "/dashboard/learning-materials") {
      return pathname === href;
    }

    return pathname === href || pathname.startsWith(`${href}/`);
  }

  return (
    <>
      {/* Tombol buka menu mobile */}
      <button
        type="button"
        onClick={() => setMobileOpen(true)}
        aria-label="Buka menu navigasi"
        className="fixed left-3 top-3 z-[60] flex h-10 w-10 items-center justify-center rounded-xl border border-sky-200 bg-[#eaf8ff] text-sky-700 shadow-sm transition hover:bg-sky-100 lg:hidden"
      >
        <Menu size={21} />
      </button>

      {/* Overlay mobile */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Tutup menu navigasi"
          onClick={() => setMobileOpen(false)}
          className="fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-sm lg:hidden"
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 flex flex-col border-r border-sky-200/80 bg-[#eaf8ff] transition-[width,transform] duration-300 ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        } ${
          collapsed ? "w-[76px]" : "w-[260px]"
        } lg:relative lg:inset-auto lg:h-full lg:shrink-0 lg:translate-x-0`}
      >
        {/* Logo */}
        <div
          className={`flex h-[82px] shrink-0 items-center border-b border-sky-200/80 ${
            collapsed ? "justify-center px-2" : "gap-3 px-4"
          }`}
        >
          <div className="relative flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-white shadow-lg shadow-sky-300/40">
  <Image
    src="/logo-semesta.jpeg"
    alt="Logo SEMESTA"
    width={44}
    height={44}
    priority
    className="h-full w-full object-contain"
  />

  <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full border-2 border-[#eaf8ff] bg-amber-400">
    <Sparkles size={9} className="text-white" />
  </span>
</div>

          {!collapsed && (
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-black tracking-wide text-sky-950">
                SEMESTA
              </h1>

              <p className="text-[10px] font-extrabold tracking-[0.17em] text-sky-600">
                DASHBOARD
              </p>
            </div>
          )}

          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            aria-label="Tutup sidebar"
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 transition hover:bg-sky-100 lg:hidden"
          >
            <X size={19} />
          </button>
        </div>

        {/* Tombol collapse */}
        <button
          type="button"
          onClick={() => setCollapsed((current) => !current)}
          title={collapsed ? "Perlebar sidebar" : "Perkecil sidebar"}
          aria-label={collapsed ? "Perlebar sidebar" : "Perkecil sidebar"}
          className="absolute -right-3 top-1/2 z-[60] hidden h-7 w-7 -translate-y-1/2 items-center justify-center rounded-full border border-sky-200 bg-white text-sky-600 shadow-sm transition hover:scale-110 hover:bg-sky-50 lg:flex"
        >
          {collapsed ? (
            <ChevronRight size={17} />
          ) : (
            <ChevronLeft size={17} />
          )}
        </button>

        {/* Menu navigasi */}
        <div className="min-h-0 flex-1 overflow-y-auto px-3 py-5">
          {!collapsed && (
            <p className="mb-3 px-3 text-[10px] font-extrabold uppercase tracking-[0.18em] text-slate-400">
              Menu Utama
            </p>
          )}

          <nav className="space-y-2">
            {menus.map((item) => {
              const Icon = item.icon;
              const active = isActive(item.href);

              return (
                <button
                  key={item.href}
                  type="button"
                  title={collapsed ? item.label : undefined}
                  onClick={() => navigate(item.href)}
                  aria-current={active ? "page" : undefined}
                  className={`group relative flex h-[62px] w-full items-center rounded-2xl transition-all duration-200 ${
                    collapsed
                      ? "justify-center px-0"
                      : "gap-3 px-3"
                  } ${
                    active
                      ? "bg-gradient-to-r from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-300/40"
                      : "text-slate-600 hover:bg-white/80 hover:text-sky-700"
                  }`}
                >
                  <span
                    className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl transition-colors ${
                      active
                        ? "bg-white/20 text-white"
                        : "bg-white/80 text-slate-500 group-hover:bg-sky-100 group-hover:text-sky-600"
                    }`}
                  >
                    <Icon size={20} strokeWidth={2.1} />
                  </span>

                  {!collapsed && (
                    <>
                      <span className="min-w-0 flex-1 text-left">
                        <span className="block truncate text-[13px] font-bold">
                          {item.label}
                        </span>

                        <span
                          className={`mt-1 block truncate text-[10px] ${
                            active
                              ? "text-sky-100"
                              : "text-slate-400"
                          }`}
                        >
                          {item.description}
                        </span>
                      </span>

                      {active && (
                        <ChevronRight
                          size={16}
                          className="shrink-0 text-white/90"
                        />
                      )}
                    </>
                  )}

                  {collapsed && active && (
                    <span className="absolute right-1 top-2 h-2 w-2 rounded-full border border-white bg-amber-300" />
                  )}
                </button>
              );
            })}
          </nav>
        </div>

        {/* Informasi administrator dan logout */}
        <div className="shrink-0 border-t border-sky-200/80 p-3">
          <div
            className={`mb-2 flex min-h-[62px] items-center rounded-2xl border border-sky-100 bg-white/60 p-2 ${
              collapsed ? "justify-center" : "gap-3 px-3"
            }`}
          >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-400 to-violet-500 text-white shadow-sm">
              <KeyRound size={19} />
            </div>

            {!collapsed && (
              <div className="min-w-0 flex-1">
                <p className="truncate text-xs font-extrabold text-slate-800">
                  Administrator
                </p>

                <p className="truncate text-[10px] text-slate-500">
                  {email}
                </p>
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={handleLogout}
            disabled={loggingOut}
            title={collapsed ? "Keluar" : undefined}
            className={`flex h-11 w-full items-center rounded-xl text-sm font-bold text-rose-500 transition hover:bg-rose-100/70 disabled:cursor-not-allowed disabled:opacity-50 ${
              collapsed ? "justify-center px-0" : "gap-3 px-3"
            }`}
          >
            <span className="flex h-6 w-6 shrink-0 items-center justify-center">
              <LogOut size={19} />
            </span>

            {!collapsed && (
              <span>{loggingOut ? "Keluar..." : "Keluar"}</span>
            )}
          </button>
        </div>
      </aside>
    </>
  );
}
