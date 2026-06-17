"use client";

import { useAuth } from "@/providers/AuthProvider";
import { useDashboard } from "@/hooks/useDashboard";
import { User, LayoutDashboard, GripVertical } from "lucide-react";

export default function SettingsPage() {
  const { user } = useAuth();
  const { layout, availableWidgets, toggleWidget } = useDashboard();

  return (
    <div className="flex flex-col gap-8 h-full pb-8 max-w-4xl mx-auto">
      <div>
        <h2 className="text-2xl font-bold text-white tracking-tight">Settings</h2>
        <p className="text-white/60 mt-1">Manage your account and customize your experience.</p>
      </div>

      <div className="flex flex-col gap-6">
        {/* Account Section */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-brand-primary/20 rounded-lg">
              <User className="w-5 h-5 text-brand-primary" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Account Profile</h3>
              <p className="text-sm text-white/60">Your personal information</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Full Name</label>
              <div className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white">
                {user?.user_metadata?.full_name || "N/A"}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-white/60 mb-2">Email Address</label>
              <div className="bg-black/20 border border-white/10 rounded-xl px-4 py-3 text-white">
                {user?.email || "N/A"}
              </div>
            </div>
          </div>
        </section>

        {/* Dashboard Customization Section */}
        <section className="bg-white/5 border border-white/10 rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-tempora-purple/20 rounded-lg">
              <LayoutDashboard className="w-5 h-5 text-tempora-purple" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white">Dashboard Customization</h3>
              <p className="text-sm text-white/60">Choose which widgets appear on your dashboard.</p>
            </div>
          </div>

          <div className="flex flex-col gap-4">
            {availableWidgets.map((widget) => {
              const isEnabled = layout.includes(widget.id);
              return (
                <div 
                  key={widget.id} 
                  className={`flex items-center justify-between p-4 rounded-xl border transition-all ${
                    isEnabled ? 'bg-white/5 border-tempora-purple/30' : 'bg-black/20 border-white/5'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="text-white/20 cursor-grab active:cursor-grabbing hover:text-white/40 transition-colors">
                      <GripVertical className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className={`font-medium ${isEnabled ? 'text-white' : 'text-white/60'}`}>
                        {widget.name}
                      </h4>
                      <p className="text-sm text-white/40">{widget.description}</p>
                    </div>
                  </div>

                  <button
                    onClick={() => toggleWidget(widget.id)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-tempora-purple focus:ring-offset-2 focus:ring-offset-tempora-black ${
                      isEnabled ? 'bg-tempora-purple' : 'bg-white/10'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isEnabled ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              );
            })}
          </div>
        </section>
      </div>
    </div>
  );
}
