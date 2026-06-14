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
  Clock
} from "lucide-react";
import { useAuth } from "@/providers/AuthProvider";

const NAV_ITEMS = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Tasks", href: "/tasks", icon: CheckSquare },
  { name: "Calendar", href: "/calendar", icon: CalendarIcon },
  { name: "Analytics", href: "/analytics", icon: BarChart3 },
];

export function AppSidebar() {
  const pathname = usePathname();
  const { signOut } = useAuth();

  return (
    <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-white/10 bg-tempora-black/50 backdrop-blur-xl flex flex-col z-40 hidden md:flex">
      {/* Brand */}
      <div className="h-16 flex items-center px-6 border-b border-white/5">
        <Link href="/dashboard" className="flex items-center gap-2 text-xl font-bold text-white group">
          <Clock className="w-6 h-6 text-tempora-purple group-hover:rotate-12 transition-transform duration-300" />
          <span>Tempora</span>
        </Link>
      </div>

      {/* Navigation */}
      <div className="flex-1 py-6 px-4 flex flex-col gap-2">
        <div className="text-xs font-semibold text-white/40 uppercase tracking-wider mb-2 px-2">Menu</div>
        {NAV_ITEMS.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          const Icon = item.icon;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
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
          onClick={() => signOut()}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-white/60 hover:text-red-400 hover:bg-red-500/10 transition-colors duration-200 text-left"
        >
          <LogOut className="w-5 h-5" />
          <span className="font-medium">Sign Out</span>
        </button>
      </div>
    </aside>
  );
}
