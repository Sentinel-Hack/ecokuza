import React, { useState } from 'react';
import AuthImg2 from '../assets/authimage2.svg';
import { ENDPOINTS, apiCall } from '@/lib/api';

const LoginPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Use centralized endpoints from src/lib/api.js

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const payload = {
        email: formData.email,
        password: formData.password,
        remember_me: formData.rememberMe,
      };

      const data = await apiCall(ENDPOINTS.AUTH_SIGNIN, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      // backend returns access & refresh
      if (data.access) localStorage.setItem('access_token', data.access);
      if (data.refresh) localStorage.setItem('refresh_token', data.refresh);
      setSuccess('Sign in successful! Redirecting...');
      setTimeout(() => { window.location.href = '/dashboard'; }, 1000);
    } catch (err) {
      setError('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = () => {
    window.location.href = '/forgot-password';
  };

  const handleSignUp = () => {
    window.location.href = '/signup';
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4">
       {/* Overlay */}
       <div className="absolute inset-0 z-0 pointer-events-none">
              <img src={AuthImg2} className="w-full h-full object-cover brightness-75" />
            </div>

      {/* Form Box */}
      <div className="relative z-10 bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">

        <h1 className="text-3xl font-bold text-center mb-2 text-[#3D4F22]">ECOKUZA</h1>
        <h2 className="text-xl font-semibold text-center mb-6 text-[#3D4F22]">Please sign in</h2>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="text-sm font-medium mb-1 block text-gray-700">Email address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange}
              autoFocus
              className="w-full px-4 py-2 bg-white text-black placeholder-gray-500 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block text-gray-700">Password</label>
            <input 
              type="password" 
              name="password" 
              value={formData.password} 
              onChange={handleInputChange}
              className="w-full px-4 py-2 bg-white text-black placeholder-gray-500 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <label className="flex items-center text-sm">
              <input 
                type="checkbox" 
                name="rememberMe" 
                checked={formData.rememberMe} 
                onChange={handleInputChange} 
                className="mr-2 w-4 h-4 cursor-pointer"
              />
              Remember me
            </label>
            <button 
              type="button"
              className="text-sm text-[#3D4F22] hover:underline"
              onClick={handleForgotPassword}
            >
              Forgot password?
            </button>
          </div>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#6DA704] text-white py-3 rounded-md font-semibold hover:bg-[#5A9603] disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Don't have an account? <button 
            onClick={handleSignUp}
            className="text-[#3D4F22] font-semibold hover:underline"
          >
            Sign Up
          </button>
        </p>

      </div>
    </div>
  );
};

export default LoginPage;
