"use client";

import { useState } from "react";
import { format } from "date-fns";
import { id } from "date-fns/locale";
import { CheckCircle2, XCircle, Clock } from "lucide-react";
import { useRouter } from "next/navigation";

export default function OvertimeApprovalsList({ initialRequests }: { initialRequests: any[] }) {
  const [requests, setRequests] = useState(initialRequests);
  const [notes, setNotes] = useState<Record<string, string>>({});
  const [isProcessing, setIsProcessing] = useState<string | null>(null);
  const router = useRouter();

  if (requests.length === 0) {
    return (
      <div className="mt-8 mb-12 rounded-3xl border-2 border-dashed border-zinc-200 bg-zinc-50 p-12 text-center">
        <h3 className="text-sm font-black uppercase tracking-widest text-zinc-400">Tidak ada pengajuan lembur</h3>
        <p className="mt-2 text-xs font-bold text-zinc-500">
          Semua pengajuan lembur telah diproses atau belum ada yang masuk ke antrean Anda.
        </p>
      </div>
    );
  }

  const handleApproveReject = async (id: string, isApproved: boolean) => {
    setIsProcessing(id);
    const note = notes[id] || "";

    if (!isApproved && !note.trim()) {
        alert("Mohon isi catatan alasan penolakan.");
        setIsProcessing(null);
        return;
    }

    try {
      const res = await fetch(`/api/overtime/${id}/approve`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isApproved, notes: note }),
      });

      if (!res.ok) {
        throw new Error("Gagal memproses pengajuan");
      }

      setRequests(requests.filter((r) => r.id !== id));
      router.refresh();
    } catch (error) {
      console.error(error);
      alert("Terjadi kesalahan sistem");
    } finally {
      setIsProcessing(null);
    }
  };

  return (
    <div className="mt-8 mb-12">
        <h2 className="mb-6 text-xl font-black italic tracking-tighter text-zinc-900 uppercase">
          Antrean Lembur
        </h2>
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2 xl:grid-cols-3">
        {requests.map((request) => (
            <div key={request.id} className="fastprix-card flex flex-col justify-between border-t-4 border-t-zinc-900">
            <div>
                <div className="flex items-center justify-between border-b border-zinc-100 pb-4">
                <div className="flex flex-col">
                    <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
                    DIVISI: <span className="text-red-600">{request.division || "N/A"}</span>
                    </span>
                    <span className="mt-1 text-base font-black italic tracking-tighter text-zinc-900 uppercase">
                    {request.employeeName}
                    </span>
                </div>
                </div>

                <div className="mt-4 grid grid-cols-2 gap-y-4 gap-x-2 text-[10px] border-b border-zinc-100 pb-4">
                <div>
                    <span className="font-bold text-zinc-400 uppercase tracking-tighter">Hari, Tanggal:</span>
                    <p className="font-black text-zinc-900">{request.overtimeDay}, {format(new Date(request.overtimeDate), "dd/MM/yyyy")}</p>
                </div>
                <div>
                    <span className="font-bold text-zinc-400 uppercase tracking-tighter">Jam Lembur:</span>
                    <p className="font-black text-zinc-900">{request.startTime} - {request.endTime}</p>
                </div>
                <div className="col-span-2">
                    <span className="font-bold text-zinc-400 uppercase tracking-tighter">Alamat / No Telp:</span>
                    <p className="font-black text-zinc-900 line-clamp-2">{request.address} / {request.phoneNumber}</p>
                </div>
                </div>

                <div className="mt-4">
                <span className="text-[9px] uppercase font-black tracking-widest text-zinc-400 flex items-center gap-1">
                    Keperluan Lembur
                </span>
                <p className="mt-1 text-xs font-medium leading-relaxed text-zinc-600 italic">
                    "{request.reason}"
                </p>
                </div>

                {request.spvNotes && request.status === "SPV_APPROVED" && (
                    <div className="mt-4 rounded-xl bg-blue-50 p-3 border border-blue-100">
                        <span className="text-[9px] uppercase font-black tracking-widest text-blue-600 flex items-center gap-1">
                        Catatan SPV
                        </span>
                        <p className="mt-1 text-[11px] font-bold leading-relaxed text-zinc-800">
                        {request.spvNotes}
                        </p>
                    </div>
                )}
            </div>

            <div className="mt-6 flex flex-col gap-4">
                <div>
                <label className="mb-2 block text-[9px] font-black uppercase tracking-widest text-zinc-400">
                    Catatan (Wajib jika menolak)
                </label>
                <textarea
                    value={notes[request.id] || ""}
                    onChange={(e) => setNotes({ ...notes, [request.id]: e.target.value })}
                    placeholder="Berikan alasan atau catatan..."
                    className="w-full rounded-xl border-2 border-zinc-100 bg-zinc-50 p-3 text-xs font-bold text-zinc-900 focus:border-red-600 focus:outline-none"
                    rows={2}
                />
                </div>
                <div className="flex gap-3">
                <button
                    onClick={() => handleApproveReject(request.id, true)}
                    disabled={isProcessing === request.id}
                    className="flex-1 rounded-xl bg-emerald-600 py-3 text-[10px] font-black tracking-widest text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
                >
                    {isProcessing === request.id ? "MEMPROSES..." : "APPROVE"}
                </button>
                <button
                    onClick={() => handleApproveReject(request.id, false)}
                    disabled={isProcessing === request.id}
                    className="flex-1 rounded-xl bg-zinc-100 py-3 text-[10px] font-black tracking-widest text-zinc-600 transition-all hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-600/20 active:scale-[0.98] disabled:opacity-50"
                >
                    REJECT
                </button>
                </div>
            </div>
            </div>
        ))}
        </div>
    </div>
  );
}
