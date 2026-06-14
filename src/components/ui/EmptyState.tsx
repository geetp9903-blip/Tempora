import { ReactNode } from "react";
import { LucideIcon } from "lucide-react";

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: ReactNode;
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-white/5 border border-white/10 rounded-2xl">
      <div className="w-16 h-16 rounded-full bg-tempora-purple/10 flex items-center justify-center mb-4">
        <Icon className="w-8 h-8 text-tempora-purple" />
      </div>
      <h3 className="text-lg font-semibold text-white mb-2">{title}</h3>
      <p className="text-sm text-white/60 max-w-md mb-6">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
