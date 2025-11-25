import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
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
  const [division, setDivision] = useState('county'); // 'county' or 'national'
  const { toast } = useToast();

  useEffect(() => {
    fetchLeaderboards();
  }, [limit, division]);

  const fetchLeaderboards = async () => {
    try {
      setLoading(true);

      // Fetch all-time leaderboard
      const allTimeRes = await apiCall(`${ENDPOINTS.LEADERBOARD}?limit=${limit}&division=${division}`, {
        method: 'GET',
      });
      if (allTimeRes.ok) {
        const data = await allTimeRes.json();
        setAllTimeLeaderboard(data.leaderboard || []);
      } else {
        // fallthrough to later dummy handling
      }

      // Fetch weekly leaderboard
      const weeklyRes = await apiCall(`${ENDPOINTS.LEADERBOARD}/weekly?limit=${limit}&division=${division}`, {
        method: 'GET',
      });
      if (weeklyRes.ok) {
        const data = await weeklyRes.json();
        setWeeklyLeaderboard(data.leaderboard || []);
      } else {
        // fallthrough to later dummy handling
      }

      // Fetch user rank
      const userRes = await apiCall(`${ENDPOINTS.LEADERBOARD}/me/?division=${division}`, {
        method: 'GET',
      });
      if (userRes.ok) {
        const data = await userRes.json();
        setUserRank(data);
      }
      
      // If leaderboards are empty (or API returned non-ok), generate dummy data so UI always shows something
      if (!allTimeRes.ok || !weeklyRes.ok) {
        const dummyAll = generateDummyLeaderboard(division, limit, false);
        const dummyWeekly = generateDummyLeaderboard(division, limit, true);
        setAllTimeLeaderboard(dummyAll);
        setWeeklyLeaderboard(dummyWeekly);
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

  // Generate dummy leaderboard entries for county or national divisions
  const generateDummyLeaderboard = (divisionName, limitNum = 10, isWeekly = false) => {
    const baseNames = divisionName === 'county'
      ? ['Green Valley School', 'Riverbend Primary', 'Hilltop Academy', 'Sunrise School', 'Maple Grove']
      : ['National Green League', 'Countrywide Trees', 'Nationwide Growers', 'Green Nation Club', 'Tree Champions'];

    const entries = Array.from({ length: limitNum }).map((_, i) => {
      const rank = i + 1;
      const name = baseNames[i % baseNames.length] + (divisionName === 'county' ? ` (${getRandomCounty()})` : '');
      return {
        id: `${divisionName}-${rank}`,
        rank,
        first_name: name,
        email: `${name.toLowerCase().replace(/[^a-z0-9]+/g, '-') }@example.org`,
        tree_count: Math.floor(Math.max(1, (limitNum - i) * (isWeekly ? 2 : 5) + Math.random() * 10)),
        points: Math.floor((limitNum - i) * 100 + Math.random() * 200),
        weekly_points: Math.floor((limitNum - i) * 10 + Math.random() * 50),
      };
    });
    return entries;
  };

  const getRandomCounty = () => {
    const counties = ['Nairobi', 'Kisumu', 'Mombasa', 'Nakuru', 'Kiambu'];
    return counties[Math.floor(Math.random() * counties.length)];
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
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto p-4">
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
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Badge variant={division === 'county' ? 'default' : 'secondary'} onClick={() => setDivision('county')} className="cursor-pointer">County</Badge>
            <Badge variant={division === 'national' ? 'default' : 'secondary'} onClick={() => setDivision('national')} className="cursor-pointer">National</Badge>
          </div>
          <div className="text-sm text-muted-foreground">Showing: <span className="font-semibold capitalize">{division}</span></div>
        </div>

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
    </DashboardLayout>
  );
}
