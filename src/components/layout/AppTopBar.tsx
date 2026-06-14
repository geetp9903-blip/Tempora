"use client";

import { usePathname } from "next/navigation";
import { useAuth } from "@/providers/AuthProvider";
import { Menu, Search, Bell } from "lucide-react";

const ROUTE_NAMES: Record<string, string> = {
  "/dashboard": "Dashboard",
  "/tasks": "Tasks",
  "/calendar": "Calendar",
  "/analytics": "Analytics",
  "/settings": "Settings",
};

export function AppTopBar() {
  const pathname = usePathname();
  const { user } = useAuth();

  // Get the base route name
  const getPageTitle = () => {
    const baseRoute = `/${pathname.split("/")[1]}`;
    return ROUTE_NAMES[baseRoute] || "Overview";
  };

  return (
    <header className="h-16 border-b border-white/5 bg-tempora-black/50 backdrop-blur-xl flex items-center justify-between px-4 md:px-8 sticky top-0 z-30">
      <div className="flex items-center gap-4">
        {/* Mobile menu toggle placeholder */}
        <button className="md:hidden p-2 text-white/60 hover:text-white transition-colors">
          <Menu className="w-6 h-6" />
        </button>
        
        <h1 className="text-xl font-semibold text-white tracking-tight">
          {getPageTitle()}
        </h1>
      </div>

      <div className="flex items-center gap-4">
        {/* Search Placeholder */}
        <div className="hidden md:flex items-center gap-2 bg-white/5 border border-white/10 rounded-full px-3 py-1.5 focus-within:border-tempora-purple/50 focus-within:ring-1 focus-within:ring-tempora-purple/50 transition-all duration-200">
          <Search className="w-4 h-4 text-white/40" />
          <input 
            type="text" 
            placeholder="Search..." 
            className="bg-transparent border-none outline-none text-sm text-white placeholder:text-white/30 w-48"
          />
        </div>

        {/* Notifications */}
        <button className="p-2 text-white/60 hover:text-white transition-colors relative">
          <Bell className="w-5 h-5" />
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-tempora-cyan rounded-full shadow-[0_0_8px_rgba(45,212,191,0.6)]"></span>
        </button>

        {/* User Profile */}
        <div className="flex items-center gap-3 pl-4 border-l border-white/10 ml-2">
          <div className="flex flex-col items-end hidden md:flex">
            <span className="text-sm font-medium text-white">{user?.user_metadata?.full_name || "User"}</span>
            <span className="text-xs text-white/40">{user?.email}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-tempora-purple to-tempora-cyan p-[2px]">
            <div className="w-full h-full rounded-full bg-tempora-dark flex items-center justify-center overflow-hidden">
              {user?.user_metadata?.avatar_url ? (
                <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-sm font-bold text-white">
                  {(user?.email?.[0] || "U").toUpperCase()}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
