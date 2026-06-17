"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  CheckSquare, 
  Calendar as CalendarIcon, 
  BarChart3, 
  Settings,
  LogOut,
  X
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";
import { useSidebar } from "@/providers/SidebarProvider";
import Image from "next/image";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Calendar", href: "/calendar", icon: CalendarIcon },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();
  const { isOpen, close } = useSidebar();

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-tempora-dark/80 backdrop-blur-sm md:hidden"
          onClick={close}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        className={`
          fixed top-0 bottom-0 left-0 w-64 border-r border-white/10 bg-tempora-black/95 md:bg-tempora-black/50 backdrop-blur-xl flex flex-col z-50 transition-transform duration-300 ease-in-out
          ${isOpen ? "translate-x-0" : "-translate-x-full"} 
          md:translate-x-0
        `}
      >
        {/* Brand */}
        <div className="h-16 flex items-center justify-between px-6 border-b border-white/5">
          <Link href="/dashboard" className="flex items-center gap-3 text-xl font-bold text-white group" onClick={close}>
            <div className="w-8 h-8 relative group-hover:scale-110 transition-transform duration-300">
              <Image src="/icon.png" alt="Tempora Logo" fill className="object-contain" />
            </div>
            <span>Tempora</span>
          </Link>
          <button 
            className="md:hidden text-white/40 hover:text-white transition-colors"
            onClick={close}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 px-4 flex flex-col gap-2 overflow-y-auto">
          <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">Menu</div>
          {NAV_ITEMS.map((item) => {
            const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
            const Icon = item.icon;
            
            return (
              <Link 
                key={item.href} 
                href={item.href}
                onClick={close}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                  isActive 
                    ? "bg-tempora-purple/10 text-tempora-purple shadow-[0_0_15px_rgba(124,58,237,0.15)]" 
                    : "text-white/60 hover:text-white hover:bg-white/5"
                }`}
              >
                <Icon className={`w-5 h-5 ${isActive ? "text-tempora-purple" : ""}`} />
                <span className="font-medium">{item.name}</span>
              </Link>
            );
          })}
        </div>

        {/* Footer / User Actions */}
        <div className="p-4 border-t border-white/5 flex flex-col gap-2">
          <Link 
            href="/settings"
            onClick={close}
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
              pathname.startsWith("/settings")
                ? "bg-tempora-purple/10 text-tempora-purple shadow-[0_0_15px_rgba(124,58,237,0.15)]" 
                : "text-white/60 hover:text-white hover:bg-white/5"
            }`}
          >
            <Settings className="w-5 h-5" />
            <span className="font-medium">Settings</span>
          </Link>
          <button 
            onClick={() => {
              close();
              signOut();
            }}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 text-left"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
