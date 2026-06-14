import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { AppSidebar } from "@/components/layout/AppSidebar";
import { AppTopBar } from "@/components/layout/AppTopBar";
import { PageTransition } from "@/components/ui/PageTransition";

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // If the user is not logged in, redirect them to the login page
  if (!user) {
    redirect("/login");
  }

  return (
    <div className="flex min-h-screen bg-tempora-dark overflow-hidden">
      <AppSidebar />
      
      {/* Main Content Wrapper */}
      <div className="flex-1 flex flex-col min-w-0 md:pl-64">
        <AppTopBar />
        
        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-7xl mx-auto h-full">
            <PageTransition>
              {children}
            </PageTransition>
          </div>
        </main>
      </div>
      
      {/* Background Orbs for the app area */}
      <div className="fixed top-[-20%] left-[-10%] w-[50%] h-[50%] bg-tempora-purple/10 rounded-full blur-[120px] pointer-events-none z-0" />
      <div className="fixed bottom-[-20%] right-[-10%] w-[40%] h-[40%] bg-tempora-cyan/5 rounded-full blur-[120px] pointer-events-none z-0" />
    </div>
  );
}
