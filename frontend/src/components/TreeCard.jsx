import React from "react";
import { TreeDeciduous, Sparkles } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const statusColors = {
  healthy: "bg-primary/10 text-primary border-primary/20",
  "needs-attention": "bg-warning/10 text-warning border-warning/20",
  thriving: "bg-secondary/10 text-secondary border-secondary/20",
};

const statusLabels = {
  healthy: "Healthy",
  "needs-attention": "Needs Attention",
  thriving: "Thriving",
};

export function TreeCard({ id, name, plantedDate, lastUpdate, status, aiVerified, thumbnail }) {
  return (
    <Card className="w-full h-[100px] p-3 elevation-2 hover:elevation-3 transition-smooth cursor-pointer">
      <div className="flex gap-3 h-full">
        <div className="w-20 h-full rounded-lg bg-muted flex items-center justify-center overflow-hidden flex-shrink-0">
          {thumbnail ? (
            <img src={thumbnail} alt={name} className="w-full h-full object-cover" />
          ) : (
            <TreeDeciduous className="w-8 h-8 text-muted-foreground" />
          )}
        </div>

        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div>
            <div className="flex items-start justify-between gap-2">
              <h3 className="font-medium text-sm truncate">{name}</h3>
              {aiVerified && (
                <Sparkles className="w-4 h-4 text-accent flex-shrink-0" />
              )}
            </div>
            <p className="text-xs text-muted-foreground mt-1">ID: {id}</p>
          </div>

          <div className="flex items-center justify-between gap-2">
            <Badge variant="outline" className={`text-xs ${statusColors[status]}`}>
              {statusLabels[status]}
            </Badge>
            <span className="text-xs text-muted-foreground">{lastUpdate}</span>
          </div>
        </div>
      </div>
    </Card>
  );
}
