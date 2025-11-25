import React, { useState } from "react";
import { Home, Plus, TreeDeciduous, Lightbulb, Trophy, List, BookOpen, Bell, User, Menu, X, LogOut, Award } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { NavLink } from "@/components/NavLink";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const navItems = [
  { title: "Dashboard", icon: Home, path: "/dashboard" },
  { title: "Record Tree", icon: Plus, path: "/record" },
  { title: "Trees List", icon: TreeDeciduous, path: "/trees" },
  { title: "AI Insights", icon: Lightbulb, path: "/insights" },
  { title: "Leaderboard", icon: Trophy, path: "/leaderboard" },
  { title: "Certifications", icon: Award, path: "/certifications" },
  { title: "Activity Log", icon: List, path: "/activity" },
  { title: "Resources", icon: BookOpen, path: "/resources" },
  { title: "Notifications", icon: Bell, path: "/notifications" },
  { title: "Profile", icon: User, path: "/profile" },
];

export function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    // Clear user data from localStorage
    localStorage.removeItem("user");
    localStorage.removeItem("authToken");
    // Redirect to login page
    navigate("/login");
  };

  return (
    <div className="flex min-h-screen w-full bg-background">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed left-0 top-0 z-50 h-full bg-card border-r border-border transition-smooth",
          "lg:sticky lg:z-30",
          sidebarOpen ? "translate-x-0 w-[240px]" : "-translate-x-full w-[70px]",
          "lg:translate-x-0",
        )}
      >
        <div className="flex flex-col h-full">
          <div className="h-16 flex items-center justify-between px-4 border-b border-border">
            <div className={cn("flex items-center gap-3", !sidebarOpen && "lg:justify-center lg:w-full")}>
              <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                <TreeDeciduous className="w-6 h-6 text-primary-foreground" />
              </div>
              {sidebarOpen && <span className="font-medium text-lg">4K Club</span>}
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="icon"
                className="hidden lg:flex"
                onClick={() => setSidebarOpen(!sidebarOpen)}
              >
                <Menu className="w-5 h-5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="lg:hidden"
                onClick={() => setSidebarOpen(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>
          </div>

          <nav className="flex-1 overflow-y-auto py-4">
            <ul className="space-y-1 px-2">
              {navItems.map((item) => (
                <li key={item.path}>
                  <NavLink
                    to={item.path}
                    className={cn(
                      "flex items-center gap-3 px-3 py-3 rounded-xl transition-smooth hover:bg-muted",
                      !sidebarOpen && "lg:justify-center",
                    )}
                    activeClassName="bg-primary/10 text-primary font-medium"
                    onClick={() => setSidebarOpen(false)}
                  >
                    <item.icon className="w-6 h-6 flex-shrink-0" />
                    {sidebarOpen && <span>{item.title}</span>}
                  </NavLink>
                </li>
              ))}
            </ul>
          </nav>

          <div className="border-t border-border p-2">
            <Button
              variant="ghost"
              className={cn(
                "w-full justify-start gap-3 text-red-600 hover:text-red-700 hover:bg-red-50",
                !sidebarOpen && "lg:justify-center lg:px-3",
              )}
              onClick={handleLogout}
            >
              <LogOut className="w-6 h-6 flex-shrink-0" />
              {sidebarOpen && <span>Logout</span>}
            </Button>
          </div>
        </div>
      </aside>

      <div className="flex-1 flex flex-col w-full lg:w-auto">
        <header className="sticky top-0 z-30 h-16 bg-card border-b border-border flex items-center px-4 lg:hidden">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(true)}
          >
            <Menu className="w-6 h-6" />
          </Button>
          <div className="ml-3 flex items-center gap-2">
            <TreeDeciduous className="w-6 h-6 text-primary" />
            <span className="font-medium text-lg">4K Club</span>
          </div>
        </header>

        <main className="flex-1 overflow-y-auto">
          {children}
        </main>
      </div>
    </div>
  );
}
