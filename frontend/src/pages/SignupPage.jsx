import React, { useState } from 'react';
import AuthImg from '../assets/authimage.png';
import { ENDPOINTS, apiCall } from '@/lib/api';

const SignupPage = () => {
  const [formData, setFormData] = useState({
    firstName: '',
    email: '',
    password: '',
    acceptTerms: false
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
      if (!formData.acceptTerms) {
        setError('Please accept the terms and conditions');
        setLoading(false);
        return;
      }

      const payload = {
        first_name: formData.firstName,
        email: formData.email,
        password: formData.password,
      };

      await apiCall(ENDPOINTS.AUTH_SIGNUP, {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      setSuccess('Registration successful! Please verify your email.');
      setTimeout(() => { window.location.href = '/login'; }, 2000);
    } catch (err) {
      setError('Network error. Check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const handleSignIn = () => {
    window.location.href = '/login';
  };

  return (
    <div 
      className="min-h-screen flex items-center justify-center p-4">

        <div className="absolute inset-0 z-0 pointer-events-none">
          <img src ={AuthImg} className="w-full h-full object-cover brightness-75" />
        </div>
        
      <div className="relative z-10 bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-[#3D4F22]">ECOKUZA</h1>
        <h2 className="text-xl font-semibold text-center mb-6 text-[#3D4F22]">Register your account</h2>

        {error && <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded-md text-sm">{error}</div>}
        {success && <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">{success}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">

          <div>
            <label className="text-sm font-medium mb-1 block text-gray-700">First name</label>
            <input 
              type="text" 
              name="firstName" 
              value={formData.firstName} 
              onChange={handleInputChange}
              autoFocus
              className="w-full px-4 py-2 bg-white text-black placeholder-gray-500 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
              required
            />
          </div>

          <div>
            <label className="text-sm font-medium mb-1 block text-gray-700">Email Address</label>
            <input 
              type="email" 
              name="email" 
              value={formData.email} 
              onChange={handleInputChange}
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

          <label className="flex items-start text-sm cursor-pointer">
            <input 
              type="checkbox" 
              name="acceptTerms" 
              checked={formData.acceptTerms} 
              onChange={handleInputChange}
              className="mr-2 mt-1 w-4 h-4 cursor-pointer"
            />
            I Accept <span className="font-bold text-[#3D4F22] ml-1">Terms and Conditions</span>
          </label>

          <button 
            type="submit"
            disabled={loading}
            className="w-full bg-[#6DA704] text-white py-3 rounded-md font-semibold hover:bg-[#5A9603] disabled:bg-gray-400 transition-colors"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>

        </form>

        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account? <button 
            onClick={handleSignIn}
            className="text-[#3D4F22] font-semibold hover:underline"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );
};

export default SignupPage;
