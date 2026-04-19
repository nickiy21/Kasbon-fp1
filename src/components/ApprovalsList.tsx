"use client";

import { useState } from "react";
import { verifyByLeader, verifyByFinance, approveByOwner, KasbonResponse } from "@/lib/actions/kasbon-actions";
import { KasbonCard } from "./DashboardClient";
import { useSession } from "next-auth/react";

export default function ApprovalsList({ initialRequests }: { initialRequests: any[] }) {
  const { data: session } = useSession();
  const [requests, setRequests] = useState(initialRequests);
  const [loading, setLoading] = useState<string | null>(null);

  const handleAction = async (id: string, approve: boolean, type: 'leader' | 'finance' | 'owner', note?: string) => {
    setLoading(id);
    let res: KasbonResponse;

    if (type === 'leader') {
      res = await verifyByLeader(id, approve, note);
    } else if (type === 'finance') {
      res = await verifyByFinance(id, approve, note);
    } else {
      res = await approveByOwner(id, approve, note);
    }

    if (res.success) {
      setRequests(requests.filter(r => r.id !== id));
    } else {
      alert(res.error || "Gagal memproses permintaan.");
    }
    setLoading(null);
  };

  if (requests.length === 0) {
    return (
      <div className="fastprix-card flex flex-col items-center justify-center py-20 text-center">
        <div className="mb-4 h-16 w-16 rounded-full bg-zinc-100 p-4 text-zinc-400">
          <svg fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h3 className="text-lg font-bold text-zinc-900">Semua Selesai!</h3>
        <p className="text-sm text-zinc-500">Tidak ada pengajuan kasbon yang menunggu persetujuan Anda.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-3">
      {requests.map((req) => {
        const userRole = (session?.user as any)?.role;
        const isStep1 = req.status === "PENDING";
        const isStep2 = req.status === "LEADER_VERIFIED";
        const isStep3 = req.status === "FINANCE_VERIFIED";
        
        // Step 1: Assigned Verificator or Admin
        const canVerify = isStep1 && (userRole === "ADMIN" || req.accRole === userRole);
        // Step 2: Finance or Admin
        const canFinance = isStep2 && (userRole === "ADMIN" || userRole === "FINANCE");
        // Step 3: Admin Final
        const canApprove = isStep3 && userRole === "ADMIN";

        return (
          <div key={req.id} className={loading === req.id ? "opacity-50 pointer-events-none" : ""}>
            <KasbonCard 
              request={req} 
              showActions={true}
              onVerify={canVerify ? (id: string, approve: boolean, note?: string) => handleAction(id, approve, 'leader', note) : undefined}
              onFinance={canFinance ? (id: string, approve: boolean, note?: string) => handleAction(id, approve, 'finance', note) : undefined}
              onApprove={canApprove ? (id: string, approve: boolean, note?: string) => handleAction(id, approve, 'owner', note) : undefined}
            />
          </div>
        );
      })}
    </div>
  );

}
