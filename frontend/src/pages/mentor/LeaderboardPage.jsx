import React from "react";
import { LeaderboardCard } from "@/components/LeaderboardCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function LeaderboardPage() {
  const leaderboardData = {
    county: [
      { rank: 1, clubName: "Green Warriors", school: "Nairobi High", points: 2850, maxPoints: 3000, isCurrentUser: false },
      { rank: 2, clubName: "Eco Champions", school: "Your School", points: 2640, maxPoints: 3000, isCurrentUser: true },
      { rank: 3, clubName: "Nature Lovers", school: "Westlands Academy", points: 2420, maxPoints: 3000, isCurrentUser: false },
    ],
    national: [
      { rank: 1, clubName: "Forest Guardians", school: "Mombasa Central", points: 3500, maxPoints: 4000, isCurrentUser: false },
      { rank: 12, clubName: "Eco Champions", school: "Your School", points: 2640, maxPoints: 4000, isCurrentUser: true },
      { rank: 3, clubName: "Tree Planters United", school: "Kisumu Primary", points: 3200, maxPoints: 4000, isCurrentUser: false },
    ],
  };

  return (
    <div className="space-y-6 max-w-7xl mx-auto p-4">
      <div className="space-y-2">
        <h1 className="text-2xl font-bold">Leaderboard</h1>
        <p className="text-sm text-muted-foreground">
          Track your club's performance against others
        </p>
      </div>

      <Tabs defaultValue="county" className="w-full">
        <TabsList className="grid w-full grid-cols-2 h-10">
          <TabsTrigger value="county">County</TabsTrigger>
          <TabsTrigger value="national">National</TabsTrigger>
        </TabsList>
        <TabsContent value="county" className="mt-3">
          <LeaderboardCard entries={leaderboardData.county} />
        </TabsContent>
        <TabsContent value="national" className="mt-3">
          <LeaderboardCard entries={leaderboardData.national} />
        </TabsContent>
      </Tabs>
    </div>
  );
}
