import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import KasbonForm from "@/components/KasbonForm";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function RequestPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/login?callbackUrl=/request");
  }

  const profile = await prisma.employeeProfile.findUnique({
    where: { userId: session.user.id },
  });

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      <Link href="/dashboard" className="mb-6 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-red-600 transition-colors">
        <ChevronLeft size={16} /> Kembali ke Dashboard
      </Link>
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-black italic tracking-tighter text-zinc-900">
          AJUKAN <span className="text-red-600">KASBON</span>
        </h1>

        <p className="mt-2 text-zinc-500 uppercase tracking-widest text-[10px] font-bold">
          Step 1: Employee Submission
        </p>
      </div>

      <KasbonForm basicSalary={profile?.basicSalary || 0} />
    </div>
  );
}
