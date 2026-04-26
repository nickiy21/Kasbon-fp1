"use client";

import { useState } from "react";
import { createDirectKasbon } from "@/lib/actions/kasbon-actions";
import { 
  AlertCircle, 
  CheckCircle2, 
  DollarSign, 
  User, 
  ArrowRight,
  Search,
  ShieldAlert
} from "lucide-react";

interface DirectKasbonFormProps {
  users: any[];
}

export default function DirectKasbonForm({ users }: DirectKasbonFormProps) {
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUserId, setSelectedUserId] = useState("");
  const [amount, setAmount] = useState("");
  const [purpose, setPurpose] = useState("");
  const [repaymentMonths, setRepaymentMonths] = useState("1");

  const filteredUsers = users.filter(user => 
    user.name?.toLowerCase().includes(searchTerm.toLowerCase()) || 
    user.username?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.nik?.includes(searchTerm)
  );

  const selectedUser = users.find(u => u.id === selectedUserId);

  const formatNumber = (val: string) => {
    if (!val) return "";
    const num = val.replace(/\D/g, "");
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
  };

  const parseNumber = (val: string) => {
    return val.replace(/\./g, "");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedUserId || !amount || !purpose) {
      setMessage({ type: "error", text: "Mohon lengkapi semua data." });
      return;
    }

    setLoading(true);
    setMessage(null);

    const formData = new FormData();
    formData.append("targetUserId", selectedUserId);
    formData.append("amount", parseNumber(amount));
    formData.append("purpose", purpose);
    formData.append("repaymentMonths", repaymentMonths);

    const result = await createDirectKasbon(formData);

    if (result.success) {
      setMessage({ type: "success", text: "Kasbon Ganti Rugi berhasil diinput dan langsung disetujui!" });
      setAmount("");
      setPurpose("");
      setSelectedUserId("");
      setSearchTerm("");
    } else {
      setMessage({ type: "error", text: result.error || "Gagal menginput kasbon." });
    }
    setLoading(false);
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-8">
      <div className="fastprix-card shadow-2xl border-t-8 border-amber-500">
        <div className="mb-8 flex items-center gap-4">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500 text-white shadow-lg shadow-amber-500/20">
            <ShieldAlert size={28} />
          </div>
          <div>
            <h2 className="text-2xl font-black italic text-zinc-900 uppercase tracking-tighter">
              INPUT KASBON <span className="text-amber-500">GANTI RUGI</span>
            </h2>
            <p className="text-[10px] text-zinc-400 uppercase tracking-widest font-black">
              Finance & Admin Direct Entry Module
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* USER SELECTION */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 border-b border-zinc-100 pb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <User size={14} /> Pilih Karyawan
            </h3>
            
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400">
                <Search size={18} />
              </div>
              <input
                type="text"
                placeholder="Cari Nama, Username, atau NIK..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="block w-full rounded-xl border-2 border-zinc-200 bg-white py-3 pl-12 pr-4 text-sm font-bold text-black transition-all focus:border-amber-500 focus:outline-none"
              />
            </div>

            {searchTerm && !selectedUserId && (
              <div className="max-h-60 overflow-y-auto rounded-xl border-2 border-zinc-100 bg-zinc-50 p-2 shadow-inner">
                {filteredUsers.length > 0 ? (
                  filteredUsers.map(user => (
                    <button
                      key={user.id}
                      type="button"
                      onClick={() => {
                        setSelectedUserId(user.id);
                        setSearchTerm(user.name || user.username);
                      }}
                      className="flex w-full items-center justify-between rounded-lg p-3 text-left hover:bg-white hover:shadow-sm transition-all"
                    >
                      <div>
                        <p className="text-xs font-black uppercase text-zinc-900">{user.name || user.username}</p>
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">NIK: {user.nik || "-"}</p>
                      </div>
                      <div className="text-[10px] font-black uppercase text-amber-600 bg-amber-50 px-2 py-1 rounded">
                        {user.division || "No Division"}
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="p-4 text-center text-xs font-bold text-zinc-400 uppercase">Karyawan tidak ditemukan</p>
                )}
              </div>
            )}

            {selectedUser && (
              <div className="animate-in fade-in slide-in-from-top-2 flex items-center justify-between rounded-2xl bg-emerald-50 border-2 border-emerald-100 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                    <User size={20} />
                  </div>
                  <div>
                    <p className="text-xs font-black uppercase text-emerald-900">{selectedUser.name || selectedUser.username}</p>
                    <p className="text-[9px] font-bold text-emerald-600 uppercase tracking-widest">{selectedUser.nik} • {selectedUser.division}</p>
                  </div>
                </div>
                <button 
                  type="button" 
                  onClick={() => {
                    setSelectedUserId("");
                    setSearchTerm("");
                  }}
                  className="text-[10px] font-black uppercase text-red-600 hover:underline"
                >
                  Ganti
                </button>
              </div>
            )}
          </div>

          {/* KASBON DATA */}
          <div className="space-y-6">
            <h3 className="flex items-center gap-2 border-b border-zinc-100 pb-2 text-[10px] font-black uppercase tracking-widest text-zinc-500">
              <DollarSign size={14} /> Data Kasbon Ganti Rugi
            </h3>
            
            <div className="grid gap-6 sm:grid-cols-2">
              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-600">
                  Nominal Ganti Rugi
                </label>
                <div className="relative">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-sm font-black text-amber-600">Rp</span>
                  <input
                    type="text"
                    required
                    value={formatNumber(amount)}
                    onChange={(e) => setAmount(parseNumber(e.target.value))}
                    className="block w-full rounded-xl border-2 border-zinc-200 bg-white py-3 pl-12 pr-4 text-sm font-black text-black transition-all focus:border-amber-500 focus:outline-none"
                    placeholder="Contoh: 500.000"
                  />
                </div>
              </div>

              <div>
                <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-600">
                  Tenor Pelunasan
                </label>
                <select
                  value={repaymentMonths}
                  onChange={(e) => setRepaymentMonths(e.target.value)}
                  className="block w-full rounded-xl border-2 border-zinc-200 bg-white py-3 px-4 text-sm font-black text-black transition-all focus:border-amber-500 focus:outline-none h-[46px]"
                >
                  <option value="1">1 BULAN (POTONG GAJI BERIKUTNYA)</option>
                  <option value="2">2 BULAN</option>
                  <option value="3">3 BULAN</option>
                </select>
              </div>
            </div>

            <div>
              <label className="mb-2 block text-[10px] font-black uppercase tracking-widest text-zinc-600">
                Deskripsi Kerusakan / Ganti Rugi
              </label>
              <textarea
                required
                rows={4}
                value={purpose}
                onChange={(e) => setPurpose(e.target.value)}
                className="block w-full rounded-2xl border-2 border-zinc-200 bg-white py-4 px-4 text-sm font-black text-black transition-all focus:border-amber-500 focus:outline-none"
                placeholder="Jelaskan detail barang yang rusak/hilang dan kronologinya..."
              />
            </div>
          </div>

          {/* BYPASS INFO */}
          <div className="rounded-xl bg-amber-50 p-4 border border-amber-100">
            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest flex items-center gap-2">
              <AlertCircle size={14} /> INFORMASI BYPASS VALIDASI
            </p>
            <ul className="mt-2 space-y-1 text-[9px] font-bold text-amber-600 uppercase tracking-wide list-disc pl-4">
              <li>Mengabaikan syarat masa kerja 3 bulan.</li>
              <li>Mengabaikan syarat pelunasan kasbon sebelumnya.</li>
              <li>Status langsung APPROVED (Menunggu Pencairan/Disbursement).</li>
              <li>Tanpa alur persetujuan SPV Divisi.</li>
            </ul>
          </div>

          {message && (
            <div className={`flex items-center gap-4 rounded-2xl p-5 text-sm font-black uppercase tracking-tighter shadow-sm ${
              message.type === "success" 
                ? "bg-emerald-50 text-emerald-700 border border-emerald-100" 
                : "bg-red-50 text-red-700 border border-red-100"
            }`}>
              {message.type === "success" ? <CheckCircle2 size={24} /> : <AlertCircle size={24} />}
              {message.text}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || !selectedUserId || !amount || !purpose}
            className="group relative flex w-full items-center justify-center overflow-hidden rounded-2xl bg-zinc-900 py-5 text-sm font-black uppercase tracking-[0.2em] text-white transition-all hover:bg-amber-500 hover:shadow-2xl hover:shadow-amber-500/30 active:scale-[0.98] disabled:bg-zinc-400 disabled:cursor-not-allowed"
          >
            <span className="relative z-10 flex items-center gap-3">
              {loading ? "PROSES DATA..." : <>SIMPAN & APPROVE LANGSUNG <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" /></>}
            </span>
          </button>
        </form>
      </div>
    </div>
  );
}
