import React from 'react'
import './index.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { TooltipProvider } from '@/components/ui/tooltip'
import { Toaster as AppToaster } from '@/components/ui/toaster'
import { Toaster as SonnerToaster } from '@/components/ui/sonner'
import Index from '@/pages/Index'
import NotFound from '@/pages/NotFound'
import Home from '@/components/Home'
import AuthPage from '@/pages/AuthPage'
import InsightsPage from '@/pages/mentor/InsightsPage'
import LeaderboardPage from '@/pages/mentor/LeaderboardPage'
import ActivityLogPage from '@/pages/mentor/ActivityLogPage'
import ResourcesPage from '@/pages/mentor/ResourcesPage'
import TreesListPage from '@/pages/mentor/TreesListPage'
import LoginPage from './pages/LoginPage'
import SignupPage from './pages/SignupPage'

const queryClient = new QueryClient()

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AppToaster />
        <SonnerToaster />
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/authpage" element={<AuthPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/signup" element={<SignupPage />} />
            <Route path="/dashboard" element={<Index />} />
            <Route path="/trees" element={<TreesListPage />} />
            <Route path="/insights" element={<InsightsPage />} />
            <Route path="/leaderboard" element={<LeaderboardPage />} />
            <Route path="/activity" element={<ActivityLogPage />} />
            <Route path="/resources" element={<ResourcesPage />} />
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </QueryClientProvider>
  )
}

export default App
