import React from "react";
import { Card } from "@/components/ui/card";

const typeColors = {
  success: "bg-primary/10 text-primary",
  info: "bg-secondary/10 text-secondary",
  warning: "bg-warning/10 text-warning",
};

export function ActivityLogItem({ icon: Icon, description, timestamp, type = "info" }) {
  return (
    <Card className="w-full h-20 p-3 elevation-1 hover:elevation-2 transition-smooth">
      <div className="flex items-center gap-3 h-full">
        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${typeColors[type]}`}>
          <Icon className="w-5 h-5" />
        </div>

        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium line-clamp-2">{description}</p>
          <p className="text-xs text-muted-foreground mt-1">{timestamp}</p>
        </div>
      </div>
    </Card>
  );
}
