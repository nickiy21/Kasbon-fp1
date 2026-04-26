import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { getUsersWithStats } from "@/lib/actions/user-actions";
import DirectKasbonForm from "@/components/DirectKasbonForm";

export default async function DirectKasbonPage() {
  const session = await getServerSession(authOptions);

  if (!session || ((session.user as any).role !== "ADMIN" && (session.user as any).role !== "FINANCE")) {
    redirect("/dashboard");
  }

  const users = await getUsersWithStats();

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8 bg-white">
      <header className="mb-8">
        <h1 className="text-2xl font-black italic tracking-tighter text-zinc-900 uppercase">
          Kasbon <span className="text-amber-500">Ganti Rugi</span>
        </h1>
        <p className="text-xs font-bold uppercase tracking-widest text-zinc-400">
          Input Langsung Ganti Rugi Barang Rusak/Hilang (Bypass SOP)
        </p>
      </header>

      <DirectKasbonForm users={users} />
    </div>
  );
}
