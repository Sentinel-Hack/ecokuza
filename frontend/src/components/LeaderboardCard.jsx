import React from "react";
import { Trophy } from "lucide-react";
import { Card } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";

export function LeaderboardCard({ entries }) {
  return (
    <Card className="w-full p-4 elevation-2">
      <div className="space-y-3">
        {entries.map((entry) => (
          <div
            key={entry.rank}
            className={`p-3 rounded-lg transition-smooth ${
              entry.isCurrentUser ? "bg-primary/10 border border-primary/20" : "bg-muted/50"
            }`}
          >
            <div className="flex items-start gap-3">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 font-bold text-sm ${
                  entry.rank === 1
                    ? "bg-warning text-warning-foreground"
                    : entry.rank === 2
                    ? "bg-muted text-foreground"
                    : entry.rank === 3
                    ? "bg-accent/30 text-accent-foreground"
                    : "bg-background text-foreground"
                }`}
              >
                {entry.rank <= 3 ? <Trophy className="w-4 h-4" /> : entry.rank}
              </div>

              <div className="flex-1 space-y-2">
                <div>
                  <h4 className="font-medium text-sm">{entry.clubName}</h4>
                  <p className="text-xs text-muted-foreground">{entry.school}</p>
                </div>

                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="font-medium">
                      {entry.points} / {entry.maxPoints} points
                    </span>
                  </div>
                  <Progress value={(entry.points / entry.maxPoints) * 100} className="h-1.5" />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </Card>
  );
}
