"use client";

import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      className="relative flex min-h-screen text-slate-900"
      style={{
        background:
          "linear-gradient(180deg, #FFF5F9 0%, #FFF0F6 42%, #FFE9F1 100%)",
      }}
    >
      {/* Page-level ambient pink mesh */}
      <div
        aria-hidden
        className="pointer-events-none fixed inset-0 z-0"
        style={{
          background:
            "radial-gradient(800px 420px at 12% 0%, rgba(216,27,96,0.07), transparent 60%), radial-gradient(900px 500px at 100% 100%, rgba(255,182,203,0.18), transparent 60%)",
        }}
      />
      <div className="relative z-10 flex w-full">
        <AdminSidebar />
        <div className="min-w-0 flex-1">{children}</div>
      </div>
    </div>
  );
}
