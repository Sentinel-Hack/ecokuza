import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiCall, ENDPOINTS } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { Trophy, TrendingUp, Medal, RefreshCw } from 'lucide-react';

export default function LeaderboardPage() {
  const [allTimeLeaderboard, setAllTimeLeaderboard] = useState([]);
  const [weeklyLeaderboard, setWeeklyLeaderboard] = useState([]);
  const [userRank, setUserRank] = useState(null);
  const [loading, setLoading] = useState(true);
  const [limit, setLimit] = useState(10);
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaderboards();
  }, [limit]);

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);

      // Fetch all-time leaderboard
      const allTimeRes = await apiCall(`${ENDPOINTS.LEADERBOARD}?limit=${limit}`, {
        method: 'GET',
      });
      if (allTimeRes.ok) {
        const data = await allTimeRes.json();
        setAllTimeLeaderboard(data.leaderboard || []);
      }

      // Fetch weekly leaderboard
      const weeklyRes = await apiCall(`${ENDPOINTS.LEADERBOARD}/weekly?limit=${limit}`, {
        method: 'GET',
      });
      if (weeklyRes.ok) {
        const data = await weeklyRes.json();
        setWeeklyLeaderboard(data.leaderboard || []);
      }

      // Fetch user rank
      const userRes = await apiCall(`${ENDPOINTS.LEADERBOARD}/me/`, {
        method: 'GET',
      });
      if (userRes.ok) {
        const data = await userRes.json();
        setUserRank(data);
      }
    } catch (error) {
      console.error('Error fetching leaderboards:', error);
      toast({
        title: 'Error',
        description: 'Failed to load leaderboard data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchLeaderboards();
    toast({
      title: 'Refreshed',
      description: 'Leaderboard data updated',
    });
  };

  const getMedalIcon = (rank) => {
    switch (rank) {
      case 1:
        return <Trophy className="w-5 h-5 text-yellow-500" />;
      case 2:
        return <Medal className="w-5 h-5 text-gray-400" />;
      case 3:
        return <Medal className="w-5 h-5 text-orange-500" />;
      default:
        return null;
    }
  };

  const LeaderboardTable = ({ entries, isWeekly = false }) => (
    <div className="space-y-2">
      {entries.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">
          No users on the leaderboard yet
        </div>
      ) : (
        entries.map((entry, index) => (
          <div
            key={entry.id}
            className="flex items-center justify-between p-4 rounded-lg border bg-card hover:bg-accent/50 transition"
          >
            <div className="flex items-center gap-4 flex-1">
              <div className="flex items-center gap-2 w-12">
                {getMedalIcon(entry.rank)}
                <span className="text-lg font-bold text-muted-foreground">
                  #{entry.rank}
                </span>
              </div>
              <div className="flex-1">
                <p className="font-semibold">{entry.first_name || entry.email}</p>
                <p className="text-sm text-muted-foreground">{entry.email}</p>
              </div>
            </div>

            <div className="flex items-center gap-6">
              <div className="text-right">
                <p className="text-sm text-muted-foreground">Trees Verified</p>
                <p className="text-lg font-bold">{entry.tree_count || 0}</p>
              </div>
              <div className="text-right min-w-24">
                <p className="text-sm text-muted-foreground">
                  {isWeekly ? 'Weekly' : 'Total'} Points
                </p>
                <p className="text-2xl font-bold text-blue-600">
                  {entry.weekly_points || entry.points || 0}
                </p>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Leaderboard</h1>
          <p className="text-muted-foreground mt-1">
            Track your progress and compete with others
          </p>
        </div>
        <Button
          onClick={handleRefresh}
          variant="outline"
          size="icon"
          disabled={loading}
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </Button>
      </div>

      {/* User Rank Card */}
      {userRank && (
        <Card className="bg-linear-to-r from-blue-600/10 to-purple-600/10 border-blue-200">
          <CardContent className="pt-6">
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Your Rank</p>
                <p className="text-3xl font-bold text-blue-600">
                  #{userRank.rank}
                </p>
                <p className="text-xs text-muted-foreground mt-1">
                  out of {userRank.total_users} users
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Points</p>
                <p className="text-3xl font-bold">{userRank.points}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trees Verified</p>
                <p className="text-3xl font-bold text-green-600">
                  {userRank.tree_records_verified}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Trees Submitted</p>
                <p className="text-3xl font-bold">
                  {userRank.tree_records_total}
                </p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Verification Rate</p>
                <p className="text-3xl font-bold text-purple-600">
                  {Math.round(userRank.percentage_verified)}%
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Leaderboard Tabs */}
      <Tabs defaultValue="alltime" className="space-y-4">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="alltime" className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4" />
            All Time
          </TabsTrigger>
          <TabsTrigger value="weekly" className="flex items-center gap-2">
            <Trophy className="w-4 h-4" />
            This Week
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alltime">
          <Card>
            <CardHeader>
              <CardTitle>All Time Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <p className="text-muted-foreground mt-2">Loading leaderboard...</p>
                </div>
              ) : (
                <LeaderboardTable entries={allTimeLeaderboard} />
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="weekly">
          <Card>
            <CardHeader>
              <CardTitle>Weekly Leaderboard</CardTitle>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-center py-8">
                  <div className="inline-block animate-spin">
                    <RefreshCw className="w-6 h-6" />
                  </div>
                  <p className="text-muted-foreground mt-2">Loading leaderboard...</p>
                </div>
              ) : (
                <LeaderboardTable entries={weeklyLeaderboard} isWeekly={true} />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Limit Selector */}
      <div className="flex items-center justify-center gap-2">
        <span className="text-sm text-muted-foreground">Show:</span>
        {[5, 10, 20, 50].map((num) => (
          <Button
            key={num}
            variant={limit === num ? 'default' : 'outline'}
            size="sm"
            onClick={() => setLimit(num)}
          >
            {num}
          </Button>
        ))}
      </div>
    </div>
  );
}
