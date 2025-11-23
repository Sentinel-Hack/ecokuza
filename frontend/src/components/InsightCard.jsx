import React from "react";
import { Lightbulb, ArrowRight } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export function InsightCard({ title, description, actionLabel, onAction }) {
  return (
    <Card className="w-full h-[120px] p-4 elevation-2 bg-gradient-to-br from-accent/5 to-primary/5 border-accent/20">
      <div className="flex gap-3 h-full">
        <div className="w-10 h-10 rounded-full bg-accent/20 flex items-center justify-center flex-shrink-0">
          <Lightbulb className="w-5 h-5 text-accent-foreground" />
        </div>

        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          <div>
            <h3 className="font-medium text-sm mb-1">{title}</h3>
            <p className="text-xs text-muted-foreground line-clamp-2">{description}</p>
          </div>

          {actionLabel && onAction && (
            <Button
              variant="ghost"
              size="sm"
              className="self-start -ml-2 text-xs h-auto py-1 px-2 text-accent-foreground hover:text-accent-foreground hover:bg-accent/10"
              onClick={onAction}
            >
              {actionLabel}
              <ArrowRight className="w-3 h-3 ml-1" />
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
