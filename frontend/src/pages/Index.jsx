import React, { useState } from "react";
import { DashboardLayout } from "@/components/DashboardLayout";
import { SummaryCard } from "@/components/SummaryCard";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { TreeDeciduous, Droplets, Sun, Users, TrendingUp, Plus, ArrowRight, Lightbulb, Trophy, List, BookOpen } from "lucide-react";
import { Link } from "react-router-dom";
import AIChatModal from '@/components/AIChatModal';

const summaryData = [
  { title: "Total Trees", value: "247", icon: TreeDeciduous, trend: { value: "12%", positive: true } },
  { title: "Active This Week", value: "18", icon: TrendingUp, trend: { value: "8%", positive: true } },
  { title: "Trees Watered", value: "156", icon: Droplets, trend: { value: "5%", positive: true } },
  { title: "Healthy Trees", value: "95%", icon: Sun },
  { title: "Club Members", value: "32", icon: Users },
];

const dashboardSections = [
  {
    title: "Record Tree",
    description: "Add a new tree or update tree progress",
    icon: Plus,
    path: "/record",
    buttonText: "Record Now",
  },
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
  const [chatOpen, setChatOpen] = useState(false);
  return (
    <DashboardLayout>
      <div className="p-4 space-y-6 max-w-7xl mx-auto">
        <div className="space-y-2">
          <h1 className="text-2xl font-bold">Welcome back, Mentor! 👋</h1>
          <p className="text-sm text-muted-foreground">
            Here's what's happening with your 4K Club today
          </p>
        </div>

        {/* Summary Cards: mobile horizontal swipe + desktop grid */}
        {/* Mobile: horizontal swipeable list */}
        <div
          className="flex space-x-4 overflow-x-auto snap-x snap-mandatory pb-2 -mx-4 px-4 sm:hidden"
          style={{ WebkitOverflowScrolling: "touch" }}
        >
          {summaryData.map((data, index) => (
            <div key={index} className="snap-start flex-shrink-0 w-[85%]">
              <SummaryCard {...data} />
            </div>
          ))}
        </div>

        {/* Desktop / larger screens: grid */}
        <div className="hidden sm:grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {summaryData.map((data, index) => (
            <SummaryCard key={index} {...data} />
          ))}
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
      {/* Floating AI chat button */}
      <button
        onClick={() => setChatOpen(true)}
        aria-label="Open AI chat"
        className="fixed right-6 bottom-6 z-50 bg-green-600 hover:bg-green-700 text-white p-3 rounded-full shadow-lg flex items-center justify-center"
      >
        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-9 8v-2a4 4 0 014-4h6" />
        </svg>
      </button>

      <AIChatModal open={chatOpen} onClose={() => setChatOpen(false)} />
    </DashboardLayout>
  );
}
