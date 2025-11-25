import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { ResourceCard } from "@/components/ResourceCard";
import { FileText, Video, Link as LinkIcon } from "lucide-react";

export default function ResourcesPage() {
  const resources = [
    { icon: FileText, title: "Tree Care Guide", type: "pdf" },
    { icon: Video, title: "Watering Tutorial", type: "video" },
    { icon: FileText, title: "Pest Control Tips", type: "pdf" },
    { icon: LinkIcon, title: "Climate Resources", type: "link" },
    { icon: Video, title: "Planting Best Practices", type: "video" },
    { icon: FileText, title: "Growth Tracking", type: "pdf" },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto p-4">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Resources</h1>
          <p className="text-sm text-muted-foreground">
            Access helpful guides and tutorials for tree care and maintenance
          </p>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 md:gap-4">
          {resources.map((resource, index) => (
            <ResourceCard key={index} {...resource} />
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
