import React from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SummaryCard } from "@/components/SummaryCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TreeDeciduous, Droplets, Sun, Users, TrendingUp, Plus, ArrowRight, Lightbulb, Trophy, List, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";

const summaryData = [
  { title: "Total Trees", value: "247", icon: TreeDeciduous, trend: { value: "12%", positive: true } },
  { title: "Active This Week", value: "18", icon: TrendingUp, trend: { value: "8%", positive: true } },
  { title: "Trees Watered", value: "156", icon: Droplets, trend: { value: "5%", positive: true } },
  { title: "Healthy Trees", value: "95%", icon: Sun },
  { title: "Club Members", value: "32", icon: Users },
];

const dashboardSections = [
  {
    title: "Trees List",
    description: "View and manage all trees in your 4K Club",
    icon: TreeDeciduous,
    path: "/trees",
    buttonText: "View Trees",
  },
  {
    title: "AI Insights",
    description: "Get intelligent insights about your trees' health and growth",
    icon: Lightbulb,
    path: "/insights",
    buttonText: "View Insights",
  },
  {
    title: "Leaderboard",
    description: "Track your club's performance against others",
    icon: Trophy,
    path: "/leaderboard",
    buttonText: "View Leaderboard",
  },
  {
    title: "Activity Log",
    description: "View recent activities and updates",
    icon: List,
    path: "/activity",
    buttonText: "View Activity",
  },
  {
    title: "Resources",
    description: "Access helpful guides and tutorials",
    icon: BookOpen,
    path: "/resources",
    buttonText: "View Resources",
  },
];

export default function Index() {
  return (
    <DashboardLayout>
      <div className="p-4 space-y-6 max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Welcome back, Mentor! 👋</h1>
          <p className="text-sm text-muted-foreground">
            Here's what's happening with your 4K Club today
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {summaryData.map((data, index) => (
            <SummaryCard key={index} {...data} />
          ))}
        </div>

        {/* Quick Actions */}
        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild size="lg" className="flex-1">
            <Link to="/record" className="flex items-center justify-center gap-2">
              <Plus className="w-5 h-5" />
              Record Tree Update
            </Link>
          </Button>
        </div>

        {/* Dashboard Sections */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {dashboardSections.map((section, index) => (
            <Card key={index} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-primary/10 text-primary">
                      <section.icon className="w-5 h-5" />
                    </div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground mb-4">
                  {section.description}
                </p>
                <Button asChild variant="outline" size="sm" className="w-full">
                  <Link to={section.path} className="flex items-center justify-between">
                    {section.buttonText}
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </DashboardLayout>
  );
}
