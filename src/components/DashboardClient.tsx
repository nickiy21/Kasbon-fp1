import { 
  Clock, 
  CheckCircle2, 
  XCircle, 
  AlertCircle, 
  ShieldCheck, 
  Wallet 
} from "lucide-react";
import { format } from "date-fns";
import { id } from "date-fns/locale";

export default function StatusBadge({ status }: { status: string }) {
  const styles = {
    PENDING: "bg-yellow-50 text-yellow-700 border-yellow-200 dark:bg-yellow-900/20 dark:text-yellow-400 dark:border-yellow-800",
    LEADER_VERIFIED: "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-800",
    APPROVED: "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-900/20 dark:text-emerald-400 dark:border-emerald-800",
    REJECTED: "bg-red-50 text-red-700 border-red-200 dark:bg-red-900/20 dark:text-red-400 dark:border-red-800",
    PAID: "bg-zinc-100 text-zinc-700 border-zinc-200 dark:bg-zinc-800 dark:text-zinc-300 dark:border-zinc-700",
  }[status] || "bg-zinc-50 text-zinc-600";

  const labels = {
    PENDING: "Menunggu Leader",
    LEADER_VERIFIED: "Terverifikasi Leader",
    APPROVED: "Disetujui Owner",
    REJECTED: "Ditolak",
    PAID: "Lunas",
  }[status] || status;

  const icons = {
    PENDING: <Clock size={12} />,
    LEADER_VERIFIED: <ShieldCheck size={12} />,
    APPROVED: <CheckCircle2 size={12} />,
    REJECTED: <XCircle size={12} />,
    PAID: <Wallet size={12} />,
  }[status];

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${styles}`}>
      {icons}
      {labels}
    </span>
  );
}

export function KasbonCard({ request, showActions = false, onVerify, onApprove }: any) {
  return (
    <div className="fastprix-card overflow-hidden border-t-4 border-t-zinc-900 group hover:border-t-red-600 transition-all duration-300">
      <div className="flex items-center justify-between border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div className="flex flex-col">
          <span className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-400">
            DIVISI: <span className="text-red-600">{request.division || "N/A"}</span>
          </span>
          <span className="mt-1 text-base font-black italic tracking-tighter text-zinc-900 dark:text-white uppercase">
            {request.employeeName || request.employee.name}
          </span>
        </div>
        <StatusBadge status={request.status} />
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4">
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
          <span className="text-[9px] uppercase font-black tracking-widest text-zinc-400">Kasbon</span>
          <p className="text-base font-black text-red-600">
            Rp{request.amount.toLocaleString('id-ID')}
          </p>
        </div>
        <div className="rounded-xl bg-zinc-50 p-3 dark:bg-zinc-900/50">
          <span className="text-[9px] uppercase font-black tracking-widest text-zinc-400">Tenor</span>
          <p className="text-sm font-black text-zinc-900 dark:text-white">
            {request.repaymentMonths} BULAN
          </p>
        </div>
      </div>

      {/* DETAIL INFO GRID */}
      <div className="mt-4 grid grid-cols-2 gap-y-4 gap-x-2 text-[10px] border-b border-zinc-100 pb-4 dark:border-zinc-800">
        <div>
          <span className="font-bold text-zinc-400 uppercase tracking-tighter">Gaji Pokok:</span>
          <p className="font-black text-zinc-900 dark:text-zinc-200">Rp{request.basicSalary?.toLocaleString('id-ID') || "0"}</p>
        </div>
        <div>
          <span className="font-bold text-zinc-400 uppercase tracking-tighter">Masuk Kerja:</span>
          <p className="font-black text-zinc-900 dark:text-zinc-200">{request.joinDate ? format(new Date(request.joinDate), "dd/MM/yyyy") : "N/A"}</p>
        </div>
        <div>
          <span className="font-bold text-zinc-400 uppercase tracking-tighter">Status SP:</span>
          <p className={`font-black ${request.spStatus ? "text-red-600" : "text-emerald-500"}`}>
            {request.spStatus ? "ADA SP" : "TIDAK ADA"}
          </p>
        </div>
        <div>
          <span className="font-bold text-zinc-400 uppercase tracking-tighter">Saldo Lunas:</span>
          <p className={`font-black ${request.isPreviousPaid ? "text-emerald-500" : "text-red-600"}`}>
            {request.isPreviousPaid ? "YA (LUNAS)" : "BELUM LUNAS"}
          </p>
        </div>
      </div>

      <div className="mt-4">
        <span className="text-[9px] uppercase font-black tracking-widest text-zinc-400 flex items-center gap-1">
           Tujuan Penggunaan
        </span>
        <p className="mt-1 text-xs font-medium leading-relaxed text-zinc-600 dark:text-zinc-400 line-clamp-3 italic">
          "{request.purpose}"
        </p>
      </div>

      <div className="mt-6 flex items-center justify-between text-[9px] font-black text-zinc-400 uppercase tracking-widest">
         <span>Dibuat: {request.submissionDate ? format(new Date(request.submissionDate), "dd MMM yyyy", { locale: id }) : "-"}</span>
         <span className="text-zinc-300">#{request.id.slice(-4).toUpperCase()}</span>
      </div>

      {showActions && (
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => {
              if (onVerify) onVerify(request.id, true);
              else if (onApprove) onApprove(request.id, true);
            }}
            className="flex-1 rounded-xl bg-emerald-600 py-3 text-[10px] font-black tracking-widest text-white shadow-lg shadow-emerald-600/20 transition-all hover:bg-emerald-700 hover:scale-[1.02] active:scale-[0.98]"
          >
            APPROVE
          </button>
          <button
            onClick={() => {
              if (onVerify) onVerify(request.id, false);
              else if (onApprove) onApprove(request.id, false);
            }}
            className="flex-1 rounded-xl bg-zinc-100 py-3 text-[10px] font-black tracking-widest text-zinc-600 transition-all hover:bg-red-600 hover:text-white hover:shadow-lg hover:shadow-red-600/20 active:scale-[0.98] dark:bg-zinc-800 dark:text-zinc-400"
          >
            REJECT
          </button>
        </div>
      )}
    </div>
  );
}
