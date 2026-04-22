import type { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: { value: number; positive: boolean };
  color?: string;
}

export function MetricCard({ title, value, subtitle, icon: Icon, trend, color = "primary" }: MetricCardProps) {
  return (
    <div className="rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{title}</p>
          <p className="mt-2 text-2xl font-bold text-foreground">{value}</p>
          {subtitle && <p className="mt-1 text-xs text-muted-foreground">{subtitle}</p>}
          {trend && (
            <p className={`mt-1 text-xs font-medium ${trend.positive ? "text-status-open" : "text-destructive"}`}>
              {trend.positive ? "↑" : "↓"} {Math.abs(trend.value)}% vs semana anterior
            </p>
          )}
        </div>
        <div className={`flex h-10 w-10 items-center justify-center rounded-xl bg-${color}/10`}>
          <Icon className={`h-5 w-5 text-${color}`} />
        </div>
      </div>
    </div>
  );
}
