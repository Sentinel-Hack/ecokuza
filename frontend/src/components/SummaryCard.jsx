import React from "react";
import { Card } from "@/components/ui/card";

export function SummaryCard({ title, value, icon: Icon, trend }) {
  return (
    <Card className="w-full p-4 md:p-5 elevation-2 hover:elevation-3 transition-smooth hover:shadow-md">
      <div className="flex flex-col h-full justify-between min-h-[110px] md:min-h-[120px]">
        <div className="flex items-start justify-between mb-3">
          <p className="text-xs md:text-sm text-muted-foreground font-medium flex-1">{title}</p>
          {Icon && <Icon className="w-5 h-5 md:w-6 md:h-6 text-primary flex-shrink-0 ml-2" />}
        </div>
        <div className="space-y-2">
          <p className="text-2xl md:text-3xl font-bold text-slate-900">{value}</p>
          {trend && (
            <p className={`text-xs md:text-sm font-semibold ${trend.positive ? "text-emerald-600" : "text-red-600"}`}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
