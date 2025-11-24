import React from 'react';
import './index.css';
import { BrowserRouter, Routes, Route, Link } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { TooltipProvider } from '@/components/ui/tooltip';
import { Toaster as AppToaster } from '@/components/ui/toaster';
import { Toaster as SonnerToaster } from '@/components/ui/sonner';
import Index from '@/pages/Index';
import NotFound from '@/pages/NotFound';
import Home from '@/components/Home';
import InsightsPage from '@/pages/mentor/InsightsPage';
import LeaderboardPage from '@/pages/mentor/LeaderboardPage';
import ActivityLogPage from '@/pages/mentor/ActivityLogPage';
import ResourcesPage from '@/pages/mentor/ResourcesPage';
import TreesListPage from '@/pages/mentor/TreesListPage';
import RecordTreePage from '@/pages/mentor/RecordTreePage';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';

const queryClient = new QueryClient()

const Navigation = () => {
  return (
    <nav className="bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <div className="flex-shrink-0 flex items-center">
              <Link to="/" className="text-xl font-bold text-green-600">
                Ecokuza
              </Link>
            </div>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link
                to="/"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Home
              </Link>
              <Link
                to="/insights"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Insights
              </Link>
              <Link
                to="/leaderboard"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Leaderboard
              </Link>
              <Link
                to="/record-tree"
                className="border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700 inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium"
              >
                Record Tree
              </Link>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

const App = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <BrowserRouter>
          <div className="min-h-screen bg-gray-50">
            <Navigation />
            <main className="py-6">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <Routes>
                  <Route path="/" element={<Index />}>
                    <Route index element={<Home />} />
                    <Route path="insights" element={<InsightsPage />} />
                    <Route path="leaderboard" element={<LeaderboardPage />} />
                    <Route path="activity-log" element={<ActivityLogPage />} />
                    <Route path="resources" element={<ResourcesPage />} />
                    <Route path="trees" element={<TreesListPage />} />
                    <Route path="record-tree" element={<RecordTreePage />} />
                  </Route>
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/signup" element={<SignupPage />} />
                  <Route path="*" element={<NotFound />} />
                </Routes>
              </div>
            </main>
          </div>
          <AppToaster />
          <SonnerToaster />
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  );
};

export default App
