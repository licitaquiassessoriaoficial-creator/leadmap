"use client";

import { useState } from "react";
import type { Session } from "next-auth";

import { Header } from "@/components/layout/header";
import { Sidebar } from "@/components/layout/sidebar";

export function AppShell({
  user,
  children
}: {
  user: Session["user"];
  children: React.ReactNode;
}) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="min-h-screen md:grid md:grid-cols-[18rem,1fr]">
      <Sidebar user={user} isOpen={isOpen} onNavigate={() => setIsOpen(false)} />
      {isOpen ? (
        <button
          type="button"
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 z-30 bg-slate-950/30 md:hidden"
        />
      ) : null}
      <div className="relative flex min-h-screen flex-col">
        <Header user={user} onMenuClick={() => setIsOpen((current) => !current)} />
        <main className="flex-1 px-4 py-6 md:px-6">{children}</main>
      </div>
    </div>
  );
}
