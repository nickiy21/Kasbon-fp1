"use client";

import { useState, Suspense } from "react";
import { signIn } from "next-auth/react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lock, User, Eye, EyeOff, ArrowRight, UserPlus, LogIn } from "lucide-react";
import { registerUser } from "@/lib/actions/user-actions";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const callbackUrl = searchParams.get("callbackUrl") || "/dashboard";

  const [isRegistering, setIsRegistering] = useState(false);
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      if (isRegistering) {
        const formData = new FormData();
        formData.append("username", username);
        formData.append("password", password);
        
        const result = await registerUser(formData);
        if (result.success) {
          // Auto login after registration
          const res = await signIn("credentials", {
            redirect: false,
            username,
            password,
          });
          if (res?.error) {
            setError("Akun berhasil dibuat, silakan login manual.");
            setIsRegistering(false);
          } else {
            router.push(callbackUrl);
            router.refresh();
          }
        } else {
          setError(result.error || "Gagal membuat akun");
        }
      } else {
        const res = await signIn("credentials", {
          redirect: false,
          username,
          password,
        });

        if (res?.error) {
          setError("Username atau password salah");
        } else {
          router.push(callbackUrl);
          router.refresh();
        }
      }
    } catch (err) {
      setError("Terjadi kesalahan sistem");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-[calc(100vh-64px)] items-center justify-center p-4 bg-white">
      <div className="w-full max-w-md space-y-8 rounded-3xl bg-white p-8 shadow-2xl border border-zinc-100">
        <div className="text-center">
          <h1 className="text-3xl font-extrabold tracking-tighter text-red-600">
            FASTPRIX<span className="text-zinc-900">1</span>
          </h1>
          <p className="mt-2 text-sm text-zinc-500 font-medium uppercase tracking-widest">
            {isRegistering ? "Pendaftaran Akun Baru" : "Sistem Pengajuan Kasbon"}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="rounded-xl bg-red-50 p-4 text-center text-xs font-black uppercase text-red-600 border border-red-100">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Username
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                  <User size={18} />
                </div>
                <input
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full rounded-2xl border-2 border-zinc-100 bg-zinc-50/50 py-4 pl-12 pr-4 text-sm font-black text-black transition-all focus:border-red-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-600/10"
                  placeholder="Masukkan username Anda"
                />
              </div>
            </div>

            <div>
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-500">
                Password
              </label>
              <div className="relative mt-1">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 text-zinc-400">
                  <Lock size={18} />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full rounded-2xl border-2 border-zinc-100 bg-zinc-50/50 py-4 pl-12 pr-12 text-sm font-black text-black transition-all focus:border-red-600 focus:bg-white focus:outline-none focus:ring-4 focus:ring-red-600/10"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-zinc-400 hover:text-zinc-600"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <button
              type="submit"
              disabled={loading}
              className="group flex w-full items-center justify-center gap-3 rounded-2xl bg-zinc-900 py-4 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-red-600 hover:shadow-xl hover:shadow-red-600/20 active:scale-[0.98] disabled:bg-zinc-300"
            >
              {loading ? "MEMPROSES..." : (
                <>
                  {isRegistering ? "DAFTARKAN AKUN" : "MASUK KE SISTEM"}
                  <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => {
                setIsRegistering(!isRegistering);
                setError("");
              }}
              className="flex w-full items-center justify-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-red-600 transition-colors"
            >
              {isRegistering ? (
                <><LogIn size={14} /> Sudah punya akun? Login di sini</>
              ) : (
                <><UserPlus size={14} /> Belum punya akun? Daftar sekarang</>
              )}
            </button>
          </div>
        </form>

        {!isRegistering && (
           <div className="mt-8 rounded-2xl bg-zinc-50 p-6 border border-zinc-100">
           <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-red-600 mb-4">
             Akun Demo System v2.0
           </h2>
           <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-[10px] text-zinc-600">
             <div className="space-y-1">
               <p><span className="font-black text-zinc-900 uppercase">Admin:</span> admin</p>
               <p><span className="font-black text-zinc-900 uppercase">Employee:</span> mekanik</p>
             </div>
             <div className="space-y-1">
               <p><span className="font-black text-red-600 uppercase">Pimpinan:</span> spv_doorsmer</p>
               <p><span className="font-black text-red-600 uppercase">Finance/HC:</span> (Coming Soon)</p>
             </div>
           </div>
         </div>
        )}
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="flex min-h-screen items-center justify-center bg-white">Loading...</div>}>
      <LoginForm />
    </Suspense>
  )
}

