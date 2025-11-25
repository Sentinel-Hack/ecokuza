import { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { apiCall, ENDPOINTS } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import {
  Trophy,
  Award,
  Star,
  Lock,
  RefreshCw,
  Zap,
} from 'lucide-react';

const IconMap = {
  sprout: '🌱',
  tree: '🌳',
  leaf: '🍃',
  trees: '🌲',
  'shield-alert': '🛡️',
  'shield-check': '✅',
  crown: '👑',
  award: '🏆',
};

const LevelColors = {
  bronze: 'bg-orange-50 border-orange-200',
  silver: 'bg-gray-50 border-gray-200',
  gold: 'bg-yellow-50 border-yellow-200',
  platinum: 'bg-purple-50 border-purple-200',
};

const LevelBadgeColors = {
  bronze: 'bg-orange-100 text-orange-800',
  silver: 'bg-gray-100 text-gray-800',
  gold: 'bg-yellow-100 text-yellow-800',
  platinum: 'bg-purple-100 text-purple-800',
};

export default function CertificationsPage() {
  const [allCertifications, setAllCertifications] = useState([]);
  const [userCertifications, setUserCertifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [checkingNew, setCheckingNew] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchCertifications();
  }, []);

  const fetchCertifications = async () => {
    try {
      setLoading(true);

      // Fetch all available certifications
      const allRes = await apiCall(`${ENDPOINTS.CERTIFICATIONS}`, {
        method: 'GET',
      });
      if (allRes.ok) {
        const data = await allRes.json();
        setAllCertifications(data);
      }

      // Fetch user's earned certifications
      const userRes = await apiCall(
        `${ENDPOINTS.CERTIFICATIONS}my-certifications/`,
        { method: 'GET' }
      );
      if (userRes.ok) {
        const data = await userRes.json();
        setUserCertifications(data.earned_certifications || []);
      }
    } catch (error) {
      console.error('Error fetching certifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCheckNewCertifications = async () => {
    try {
      setCheckingNew(true);
      const res = await apiCall(
        `${ENDPOINTS.CERTIFICATIONS}check-new/`,
        { method: 'GET' }
      );

      if (res.ok) {
        const data = await res.json();
        if (data.newly_earned.length > 0) {
          toast({
            title: '🎉 Congratulations!',
            description: `You earned ${data.newly_earned.length} new certification(s)!`,
          });
          fetchCertifications();
        } else {
          toast({
            title: 'No new certifications',
            description: 'Keep working to earn more certifications!',
          });
        }
      }
    } catch (error) {
      console.error('Error checking certifications:', error);
      toast({
        title: 'Error',
        description: 'Failed to check for new certifications',
        variant: 'destructive',
      });
    } finally {
      setCheckingNew(false);
    }
  };

  const isEarned = (certId) => {
    return userCertifications.some((uc) => uc.certification.id === certId);
  };

  const getEarnedCertification = (certId) => {
    return userCertifications.find((uc) => uc.certification.id === certId);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto p-4">
        {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Certifications & Badges</h1>
          <p className="text-muted-foreground mt-1">
            Earn badges and certificates by achieving milestones
          </p>
        </div>
        <Button
          onClick={handleCheckNewCertifications}
          variant="default"
          disabled={loading || checkingNew}
        >
          <Zap className={`w-4 h-4 mr-2 ${checkingNew ? 'animate-spin' : ''}`} />
          {checkingNew ? 'Checking...' : 'Check Progress'}
        </Button>
      </div>

      {/* Earned Certifications Summary */}
      {userCertifications.length > 0 && (
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Certifications Earned</p>
                <p className="text-3xl font-bold text-blue-600">
                  {userCertifications.length}
                </p>
              </div>
              <Trophy className="w-12 h-12 text-yellow-500" />
            </div>
          </CardContent>
        </Card>
      )}

      {/* Earned Certifications */}
      {userCertifications.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Trophy className="w-6 h-6" />
            Your Certifications
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {userCertifications.map((userCert) => (
              <Card
                key={userCert.id}
                className={`${LevelColors[userCert.certification.level]} border-2`}
              >
                <CardContent className="pt-6">
                  <div className="text-center">
                    <div className="text-4xl mb-3">
                      {IconMap[userCert.certification.icon] || '🏆'}
                    </div>
                    <h3 className="font-bold text-lg">
                      {userCert.certification.name}
                    </h3>
                    <Badge
                      className={`mt-2 ${LevelBadgeColors[userCert.certification.level]}`}
                      variant="outline"
                    >
                      {userCert.certification.level_display}
                    </Badge>
                    <p className="text-sm text-muted-foreground mt-3">
                      {userCert.certification.description}
                    </p>
                    <p className="text-xs text-muted-foreground mt-4">
                      Earned: {new Date(userCert.earned_at).toLocaleDateString()}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

        {/* All Certifications */}
      <div className="space-y-4">
        <h2 className="text-2xl font-bold flex items-center gap-2">
          <Award className="w-6 h-6" />
          All Certifications
        </h2>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin mb-4">
              <RefreshCw className="w-6 h-6" />
            </div>
            <p className="text-muted-foreground">Loading certifications...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCertifications.map((cert) => {
              const earned = isEarned(cert.id);
              const earnedCert = getEarnedCertification(cert.id);

              return (
                <Card
                  key={cert.id}
                  className={`${
                    earned
                      ? LevelColors[cert.level]
                      : 'bg-gray-100 border-gray-300 opacity-60'
                  } border-2 transition`}
                >
                  <CardContent className="pt-6">
                    <div className="text-center">
                      <div
                        className={`text-4xl mb-3 ${
                          earned ? '' : 'opacity-50 grayscale'
                        }`}
                      >
                        {earned ? IconMap[cert.icon] || '🏆' : <Lock className="w-8 h-8 mx-auto" />}
                      </div>

                      <h3 className="font-bold text-lg">{cert.name}</h3>

                      <Badge
                        className={LevelBadgeColors[cert.level]}
                        variant="outline"
                      >
                        {cert.level_display}
                      </Badge>

                      <p className="text-sm text-muted-foreground mt-3">
                        {cert.description}
                      </p>

                      {/* Requirements */}
                      <div className="mt-4 space-y-2 text-xs text-muted-foreground">
                        {cert.required_points > 0 && (
                          <div>
                            {earned ? (
                              <p className="text-green-600">✓ Points: {cert.required_points}</p>
                            ) : (
                              <p>Points: {cert.required_points}</p>
                            )}
                          </div>
                        )}
                        {cert.required_trees > 0 && (
                          <div>
                            {earned ? (
                              <p className="text-green-600">
                                ✓ Trees: {cert.required_trees}
                              </p>
                            ) : (
                              <p>Trees: {cert.required_trees}</p>
                            )}
                          </div>
                        )}
                        {cert.required_verification_rate > 0 && (
                          <div>
                            {earned ? (
                              <p className="text-green-600">
                                ✓ Verification: {cert.required_verification_rate.toFixed(0)}%
                              </p>
                            ) : (
                              <p>Verification: {cert.required_verification_rate.toFixed(0)}%</p>
                            )}
                          </div>
                        )}
                      </div>

                      {earned && earnedCert && (
                        <p className="text-xs text-green-600 font-semibold mt-4">
                          Earned {new Date(earnedCert.earned_at).toLocaleDateString()}
                        </p>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </DashboardLayout>
  );
}
