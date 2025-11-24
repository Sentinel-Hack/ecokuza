import { useState, useCallback } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { authApi, activitiesApi, treesApi, leaderboardApi } from '@/services/api';
import { toast } from '@/components/ui/use-toast';

export const useAuth = () => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (credentials) => {
    try {
      setIsLoading(true);
      const response = await authApi.login(credentials);
      localStorage.setItem('token', response.data.token);
      setUser(response.data.user);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Login failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const register = useCallback(async (userData) => {
    try {
      setIsLoading(true);
      const response = await authApi.register(userData);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem('token');
    setUser(null);
  }, []);

  const getProfile = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await authApi.getProfile();
      setUser(response.data);
      return response.data;
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to fetch profile');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    user,
    isLoading,
    error,
    login,
    register,
    logout,
    getProfile,
  };
};

export const useActivities = () => {
  const queryClient = useQueryClient();
  
  const { data: activities, isLoading, error } = useQuery({
    queryKey: ['activities'],
    queryFn: () => activitiesApi.getAll().then(res => res.data),
  });

  const createActivity = useMutation({
    mutationFn: (data) => activitiesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['activities'] });
      toast({
        title: 'Success',
        description: 'Activity recorded successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to record activity',
        variant: 'destructive',
      });
    },
  });

  return {
    activities,
    isLoading,
    error,
    createActivity: createActivity.mutate,
    isCreating: createActivity.isLoading,
  };
};

export const useTrees = () => {
  const queryClient = useQueryClient();
  
  const { data: trees, isLoading, error } = useQuery({
    queryKey: ['trees'],
    queryFn: () => treesApi.getAll().then(res => res.data),
  });

  const { data: stats, isLoading: isLoadingStats } = useQuery({
    queryKey: ['trees', 'stats'],
    queryFn: () => treesApi.getStats().then(res => res.data),
  });

  const recordTree = useMutation({
    mutationFn: (data) => treesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['trees'] });
      queryClient.invalidateQueries({ queryKey: ['trees', 'stats'] });
      toast({
        title: 'Success',
        description: 'Tree recorded successfully',
      });
    },
    onError: (error) => {
      toast({
        title: 'Error',
        description: error.response?.data?.message || 'Failed to record tree',
        variant: 'destructive',
      });
    },
  });

  return {
    trees,
    stats,
    isLoading: isLoading || isLoadingStats,
    error,
    recordTree: recordTree.mutate,
    isRecording: recordTree.isLoading,
  };
};

export const useLeaderboard = () => {
  const { data: leaderboard, isLoading, error } = useQuery({
    queryKey: ['leaderboard'],
    queryFn: () => leaderboardApi.getGlobal().then(res => res.data),
  });

  return {
    leaderboard,
    isLoading,
    error,
  };
};
