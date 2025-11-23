import React, { useState } from "react";
import { TreeCard } from "@/components/TreeCard";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";

export default function TreesListPage() {
  const [searchQuery, setSearchQuery] = useState("");

  const recentTrees = [
    {
      id: "TRE-001",
      name: "Mango Tree",
      plantedDate: "2024-01-15",
      lastUpdate: "2 days ago",
      status: "thriving",
      aiVerified: true,
    },
    {
      id: "TRE-002",
      name: "Neem Tree",
      plantedDate: "2024-02-10",
      lastUpdate: "5 days ago",
      status: "healthy",
      aiVerified: true,
    },
    {
      id: "TRE-003",
      name: "Guava Tree",
      plantedDate: "2024-03-05",
      lastUpdate: "1 week ago",
      status: "needs-attention",
      aiVerified: false,
    },
  ];

  const filteredTrees = recentTrees.filter(
    (tree) =>
      tree.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      tree.id.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Trees List</h1>
        <p className="text-sm text-muted-foreground">
          View and manage all trees in your 4K Club
        </p>
      </div>

      <div className="space-y-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search trees..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9 h-10"
          />
        </div>

        <div className="space-y-3">
          {filteredTrees.map((tree) => (
            <TreeCard key={tree.id} {...tree} />
          ))}
        </div>
      </div>
    </div>
  );
}
