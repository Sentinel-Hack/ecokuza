import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { InsightCard } from "@/components/InsightCard";

export default function InsightsPage() {
  const insights = [
    {
      title: "Optimal Watering Time",
      description: "Based on weather patterns, water your trees in the early morning for best results.",
      actionLabel: "View Details",
    },
    {
      title: "Growth Milestone",
      description: "Your Mango tree (TRE-001) has grown 15cm this month! Keep up the great care.",
      actionLabel: "See Tree",
    },
    {
      title: "Pest Alert",
      description: "Weather conditions may increase pest activity. Check trees regularly this week.",
      actionLabel: "Learn More",
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto p-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">AI Growth Insights</h1>
          <p className="text-sm text-muted-foreground">
            Get intelligent insights about your trees' health and growth patterns
          </p>
        </div>

        <div className="space-y-4">
          {insights.map((insight, index) => (
            <InsightCard key={index} {...insight} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
