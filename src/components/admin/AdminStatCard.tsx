import { LucideIcon } from "lucide-react";

interface AdminStatCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  accentColor?: string;
}

export function AdminStatCard({ label, value, icon: Icon, trend, accentColor = "text-primary" }: AdminStatCardProps) {
  return (
    <div className="group relative overflow-hidden rounded-xl border border-border/50 bg-card p-4 transition-all duration-200 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5">
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <p className="text-3xl font-bold tracking-tight">{value}</p>
          {trend && <p className="text-xs text-muted-foreground">{trend}</p>}
        </div>
        <div className={`flex items-center justify-center w-10 h-10 rounded-lg bg-muted/50 ${accentColor}`}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="absolute bottom-0 left-0 h-0.5 w-full bg-gradient-to-r from-primary/50 to-transparent opacity-0 transition-opacity group-hover:opacity-100" />
    </div>
  );
}
