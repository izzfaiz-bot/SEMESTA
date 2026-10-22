// app/dashboard/layout.tsx
"use client";

import { useEffect, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import { Atom, LoaderCircle } from "lucide-react";
import DashboardSidebar from "@/components/dashboard/DashboardSidebar";

type Admin = {
  email: string;
};

export default function DashboardLayout({
  children,
}: {
  children: ReactNode;
}) {
  const router = useRouter();
  const [admin, setAdmin] = useState<Admin | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    async function checkAdmin() {
      try {
        const response = await fetch("/api/admin/me", {
          cache: "no-store",
        });

        if (!response.ok) {
          router.replace("/login");
          return;
        }

        const data = await response.json();
        const currentAdmin = data.admin ?? data;

        if (active) {
          setAdmin({
            email: currentAdmin.email ?? "Administrator",
          });
        }
      } catch {
        router.replace("/login");
      } finally {
        if (active) setLoading(false);
      }
    }

    void checkAdmin();

    return () => {
      active = false;
    };
  }, [router]);

  if (loading) {
    return (
      <main className="flex h-dvh items-center justify-center overflow-hidden bg-[#eaf8ff]">
        <div className="flex flex-col items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-sky-400 to-blue-600 text-white shadow-lg shadow-sky-200">
            <Atom size={32} className="animate-pulse" />
          </div>
          <LoaderCircle size={24} className="animate-spin text-sky-600" />
          <p className="text-sm font-bold text-sky-800">
            Menyiapkan SEMESTA...
          </p>
        </div>
      </main>
    );
  }

  if (!admin) return null;

  return (
    <main className="h-dvh overflow-hidden bg-[#eaf8ff] text-slate-800">
      <div className="flex h-full min-w-0">
        <DashboardSidebar email={admin.email} />

        <div className="flex h-full min-w-0 flex-1 flex-col overflow-hidden border-l border-sky-200/80">
          {children}
        </div>
      </div>
    </main>
  );
}