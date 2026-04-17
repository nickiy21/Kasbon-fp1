"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User, DollarSign, ClipboardCheck, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const { data: session } = useSession();

  return (
    <nav className="border-b border-zinc-200 bg-white dark:border-zinc-800 dark:bg-black">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tighter text-red-600">
              FASTPRIX<span className="text-zinc-900 dark:text-white">1</span>
            </span>
            <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              KASBON
            </span>
          </Link>

          {session && (
            <div className="hidden md:flex md:items-center md:gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
              >
                Dashboard
              </Link>
              {session.user && (session.user as any).role === "EMPLOYEE" && (
                <Link
                  href="/request"
                  className="text-sm font-medium text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                >
                  Ajukan Kasbon
                </Link>
              )}
              {session.user && ["LEADER", "ADMIN", "OWNER"].includes((session.user as any).role) && (
                <Link
                  href="/approvals"
                  className="text-sm font-medium text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                >
                  Persetujuan
                </Link>
              )}
              {session.user && ["LEADER", "ADMIN", "OWNER"].includes((session.user as any).role) && (
                <Link
                  href="/history"
                  className="text-sm font-medium text-zinc-600 hover:text-red-600 dark:text-zinc-400 dark:hover:text-red-400"
                >
                  Riwayat
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 dark:bg-red-900/30">
                  <User size={16} />
                </div>
                <div className="hidden flex-col sm:flex">
                  <span className="text-xs font-semibold text-zinc-900 dark:text-white">
                    {session?.user?.name}
                  </span>
                  <span className="text-[10px] text-zinc-500 uppercase">
                    {(session?.user as any).role}
                  </span>
                </div>
              </div>
              <button
                onClick={() => signOut()}
                className="rounded-lg p-2 text-zinc-500 hover:bg-zinc-100 hover:text-red-600 dark:hover:bg-zinc-800"
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <Link
              href="/api/auth/signin"
              className="fastprix-button"
            >
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
