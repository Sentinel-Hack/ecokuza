import React from "react";
import { ActivityLogItem } from "@/components/ActivityLogItem";
import { Camera, Droplets, TreeDeciduous } from "lucide-react";

export default function ActivityLogPage() {
  const activities = [
    { icon: Camera, description: "John M. uploaded a photo for Tree TRE-001", timestamp: "2 hours ago", type: "success" },
    { icon: Droplets, description: "Watering completed for 5 trees in Section A", timestamp: "5 hours ago", type: "info" },
    { icon: TreeDeciduous, description: "New tree planted: Avocado (TRE-024)", timestamp: "1 day ago", type: "success" },
    { icon: Camera, description: "AI verification completed for 3 trees", timestamp: "2 days ago", type: "info" },
  ];

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Recent Activity</h1>
        <p className="text-sm text-muted-foreground">
          Track all activities in your 4K Club
        </p>
      </div>

      <div className="space-y-2">
        {activities.map((activity, index) => (
          <ActivityLogItem key={index} {...activity} />
        ))}
      </div>
    </div>
  );
}
