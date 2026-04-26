"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { LogOut, User, ChevronDown } from "lucide-react";
import { ROLE_LABELS } from "@/lib/constants";


export default function Navbar() {
  const { data: session } = useSession();
  const pathname = usePathname();
  const [isProfileOpen, setIsProfileOpen] = useState(false);

  return (
    <nav className="border-b border-zinc-200 bg-white">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <span className="text-xl font-bold tracking-tighter text-red-600">
              FASTPRIX<span className="text-zinc-900">1</span>
            </span>
            <span className="rounded bg-red-600 px-1.5 py-0.5 text-[10px] font-bold text-white">
              KASBON
            </span>
          </Link>

          {session && (
            <div className="hidden md:flex md:items-center md:gap-4">
              <Link
                href="/dashboard"
                className="text-sm font-medium text-zinc-600 hover:text-red-600"
              >
                Dashboard
              </Link>
              {session.user && (session.user as any).role === "EMPLOYEE" && (
                <Link
                  href="/request"
                  className="text-sm font-medium text-zinc-600 hover:text-red-600"
                >
                  Ajukan Kasbon
                </Link>
              )}
              {session.user && ["HC", "FINANCE", "DOORSMER", "MARKETING", "MEKANIK", "ADMIN"].includes((session.user as any).role) && (
                <>
                  <Link
                    href="/approvals"
                    className="text-sm font-medium text-zinc-600 hover:text-red-600"
                  >
                    Persetujuan
                  </Link>
                  <Link
                    href="/history"
                    className="text-sm font-medium text-zinc-600 hover:text-red-600"
                  >
                    Riwayat
                  </Link>
                </>
              )}
              {session.user && ["ADMIN", "FINANCE"].includes((session.user as any).role) && (
                <Link
                  href="/admin/direct-kasbon"
                  className="text-sm font-bold text-amber-600 hover:text-zinc-900"
                >
                  Ganti Rugi
                </Link>
              )}
              {session.user && (session.user as any).role === "ADMIN" && (
                <Link
                  href="/admin/members"
                  className="text-sm font-bold text-red-600 hover:text-zinc-900"
                >
                  Kelola Member
                </Link>
              )}
            </div>
          )}
        </div>

        <div className="flex items-center gap-4">
          {session ? (
            <div className="relative">
              <button 
                onClick={() => setIsProfileOpen(!isProfileOpen)}
                className="flex items-center gap-2 rounded-full p-1 hover:bg-zinc-100 transition-all focus:ring-2 focus:ring-red-100 outline-none"
              >
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-red-100 text-red-600 transition-transform active:scale-90">
                  <User size={16} />
                </div>
                <div className="hidden flex-col items-start sm:flex text-left">
                  <span className="text-xs font-black text-zinc-900 uppercase tracking-tighter leading-none mb-0.5">
                    {session?.user?.name || (session?.user as any).username}
                  </span>
                  <span className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest leading-none">
                    {ROLE_LABELS[(session?.user as any).role] || (session?.user as any).role}
                  </span>
                </div>
                <ChevronDown size={14} className={`text-zinc-400 transition-transform ${isProfileOpen ? 'rotate-180' : ''}`} />
              </button>

              {isProfileOpen && (
                <>
                  <div 
                    className="fixed inset-0 z-40" 
                    onClick={() => setIsProfileOpen(false)}
                  />
                  <div className="absolute right-0 mt-3 w-56 origin-top-right rounded-2xl bg-white p-4 shadow-2xl ring-1 ring-black/5 animate-in fade-in zoom-in-95 duration-200 z-50 border border-zinc-100">
                    <div className="mb-4">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Account Info</p>
                      <p className="text-sm font-black text-zinc-900 truncate">@{ (session?.user as any).username }</p>
                    </div>
                    
                    <div className="mb-4 pt-3 border-t border-zinc-50">
                      <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Role Permission</p>
                      <span className="inline-block rounded-lg bg-red-600 px-2 py-1 text-[9px] font-black text-white uppercase tracking-wider">
                        {ROLE_LABELS[(session?.user as any).role] || (session?.user as any).role}

                      </span>
                    </div>



                    <button
                      onClick={() => signOut()}
                      className="mt-2 w-full flex items-center justify-between group rounded-xl bg-zinc-50 p-3 text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <div className="flex items-center gap-2">
                        <LogOut size={16} className="transition-transform group-hover:scale-110" />
                        <span className="text-xs font-black uppercase">Logout</span>
                      </div>
                    </button>
                  </div>
                </>
              )}
            </div>
          ) : (
            pathname !== "/login" && (
              <button
                onClick={() => window.location.href = "/login"}
                className="rounded-xl bg-red-600 px-6 py-2.5 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-red-600/20 transition-all hover:bg-red-700 active:scale-95"
              >
                Login
              </button>
            )
          )}
        </div>
      </div>
    </nav>
  );
}
