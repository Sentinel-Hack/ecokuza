import React from "react";
import { Card } from "@/components/ui/card";

export function SummaryCard({ title, value, icon: Icon, trend }) {
  return (
    <Card className="flex-shrink-0 w-40 h-[90px] p-3 elevation-2 hover:elevation-3 transition-smooth">
      <div className="flex flex-col h-full justify-between">
        <div className="flex items-start justify-between">
          <p className="text-xs text-muted-foreground font-medium">{title}</p>
          {Icon && <Icon className="w-4 h-4 text-primary" />}
        </div>
        <div className="space-y-1">
          <p className="text-2xl font-bold">{value}</p>
          {trend && (
            <p className={`text-xs font-medium ${trend.positive ? "text-primary" : "text-destructive"}`}>
              {trend.positive ? "↑" : "↓"} {trend.value}
            </p>
          )}
        </div>
      </div>
    </Card>
  );
}
