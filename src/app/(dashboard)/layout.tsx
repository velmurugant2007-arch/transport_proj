import { redirect } from "next/navigation";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  if (!session) redirect("/login");

  return (
    <div suppressHydrationWarning className="flex min-h-screen w-full relative">
      <div className="hidden md:flex h-screen sticky top-0 shrink-0 z-[50]">
        <Sidebar />
      </div>
      <div className="flex flex-col flex-1 min-w-0">
        <Header />
        <main
          className="flex-1 overflow-auto relative z-[10] p-4 md:p-8"
        >
          <div className="max-w-[1600px] mx-auto">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
