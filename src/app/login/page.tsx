"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await signIn("credentials", {
        redirect: false,
        username,
        password,
      });

      if (res?.error) {
        setError("Invalid username or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-2xl dark:bg-zinc-950 dark:border dark:border-zinc-800">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tighter text-red-600">
            FASTPRIX<span className="text-zinc-900 dark:text-white">1</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500">
            Sistem Pengajuan Kasbon Karyawan
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-lg bg-red-50 p-3 text-center text-sm font-medium text-red-600 dark:bg-red-900/20">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Username
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-xl border-2 border-zinc-200 bg-white py-3 pl-10 pr-3 text-sm font-black text-black transition-all focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/10"
                  placeholder="admin / mo / mekanik"
                />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold uppercase tracking-widest text-zinc-500">
                Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3 text-zinc-400">
                  <Lock size={18} />
                </div>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-xl border-2 border-zinc-200 bg-white py-3 pl-10 pr-3 text-sm font-black text-black transition-all focus:border-red-600 focus:outline-none focus:ring-4 focus:ring-red-600/10"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center rounded-xl bg-red-600 py-3 text-sm font-bold text-white transition-all hover:bg-red-700 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-red-500/50 disabled:bg-zinc-400"
          >
            {loading ? "Logging in..." : "MASUK KE SISTEM"}
          </button>
        </form>

        <div className="mt-8 rounded-2xl bg-zinc-50 p-6 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-4">
            Akun Demo System v2.0
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-zinc-600 dark:text-zinc-400">
            <div className="space-y-1">
              <p><span className="font-black text-zinc-900 dark:text-white uppercase">Admin:</span> admin</p>
              <p><span className="font-black text-zinc-900 dark:text-white uppercase">Employee:</span> mekanik</p>
            </div>
            <div className="space-y-1">
              <p><span className="font-black text-red-600 uppercase">SPV Doorsmer:</span> spv_doorsmer</p>
              <p><span className="font-black text-red-600 uppercase">SPV Marketing:</span> spv_marketing</p>
              <p><span className="font-black text-red-600 uppercase">SPV Mekanik:</span> spv_mekanik</p>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
            <p className="text-[10px] font-black uppercase text-zinc-500">
              Password: <span className="text-zinc-900 dark:text-white select-all">password123</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
