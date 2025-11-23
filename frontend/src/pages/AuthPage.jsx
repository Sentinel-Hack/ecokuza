import React, { useState } from 'react';
import AuthImg from '../assets/authimage.svg'
import AuthImg2 from '../assets/authimage2.svg'

const AuthPage = () => {
  const [currentPage, setCurrentPage] = useState('signin');
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    rememberMe: false,
    acceptTerms: false
  });

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  // Replace with your actual Django backend URL
  const API_BASE_URL = 'http://127.0.0.1:8000/authentification';

  const handleSubmit = async () => {
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      let endpoint = '';
      let payload = {};

      if (currentPage === 'signin') {
        endpoint = `${API_BASE_URL}/signin/`;
        payload = {
          email: formData.email,
          password: formData.password,
          remember_me: formData.rememberMe
        };
      } else if (currentPage === 'signup') {
        if (!formData.acceptTerms) {
          setError('Please accept the terms and conditions');
          setLoading(false);
          return;
        }
        endpoint = `${API_BASE_URL}/signup/`;
        payload = {
          first_name: formData.firstName,
          email: formData.email,
          password: formData.password
        };
      } else if (currentPage === 'forgot') {
        endpoint = `${API_BASE_URL}/forgot-password/`;
        payload = {
          email: formData.email
        };
      }

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        if (currentPage === 'signin') {
          // Store tokens
          localStorage.setItem('access_token', data.access);
          localStorage.setItem('refresh_token', data.refresh);
          setSuccess('Sign in successful! Redirecting...');
          // Redirect to dashboard after 1 second
          setTimeout(() => {
            window.location.href = '/dashboard';
          }, 1000);
        } else if (currentPage === 'signup') {
          setSuccess('Registration successful! Please check your email to verify your account.');
          setTimeout(() => {
            setCurrentPage('signin');
          }, 2000);
        } else if (currentPage === 'forgot') {
          setSuccess('Password reset link has been sent to your email!');
          setTimeout(() => {
            setCurrentPage('signin');
          }, 2000);
        }
      } else {
        setError(data.error || 'An error occurred. Please try again.');
      }
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  const SignInPage = () => (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-cover bg-center">
        <img src={AuthImg2} alt="Authentication" className="w-full h-full object-cover filter brightness-75" />
      </div>
      
      <div className="relative bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-[#3D4F22]">ECOKUZA</h1>
        <h2 className="text-xl font-semibold text-center mb-6 text-[#3D4F22]">Please sign in</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none"
            />
          </div>
          
          <div className="flex items-center justify-between">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleInputChange}
                className="mr-2 rounded text-[#3D4F22] focus:ring-green-500"
              />
              <span className="text-sm text-gray-700">Remember me</span>
            </label>
            <button
              type="button"
              onClick={() => setCurrentPage('forgot')}
              className="text-sm text-[#3D4F22] hover:text-[#5A9603]"
            >
              Forgot password?
            </button>
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#6DA704] text-white py-3 rounded-md font-semibold hover:bg-[#5A9603] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
        </div>
        
        <p className="text-center mt-6 text-sm text-gray-600">
          Don't have an account?{' '}
          <button
            onClick={() => setCurrentPage('signup')}
            className="text-[#3D4F22] hover:text-[#5A9603] font-semibold"
          >
            Sign Up
          </button>
        </p>
      </div>
    </div>
  );

  const SignUpPage = () => (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-cover bg-center">
         <img src={AuthImg} alt="Authentication" className="w-full h-full object-cover filter brightness-75" />
      </div>
      
      <div className="relative bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-[#3D4F22]">ECOKUZA</h1>
        <h2 className="text-xl font-semibold text-center mb-6 text-[#3D4F22]">Register your account</h2>
        
        {error && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-[#5A9603] rounded-md text-sm">
            {success}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">First name</label>
            <input
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5A9603] focus:border-transparent outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email Address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5A9603] focus:border-transparent outline-none"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5A9603] focus:border-transparent outline-none"
            />
          </div>
          
          <label className="flex items-start cursor-pointer">
            <input
              type="checkbox"
              name="acceptTerms"
              checked={formData.acceptTerms}
              onChange={handleInputChange}
              className="mr-2 mt-1 rounded text-[#3D4F22] focus:ring-[#5A9603]"
            />
            <span className="text-sm text-gray-700">
              I Accept{' '}
              <span className="font-bold text-[#3D4F22]">Terms And Condition</span>
            </span>
          </label>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#6DA704] text-white py-3 rounded-md font-semibold hover:bg-[#5A9603] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Registering...' : 'Register'}
          </button>
        </div>
        
        <p className="text-center mt-6 text-sm text-gray-600">
          Already have an account?{' '}
          <button
            onClick={() => setCurrentPage('signin')}
            className="text-[#6DA704] hover:text-[#3D4F22] font-semibold"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );

  const ForgotPasswordPage = () => (
    <div className="min-h-screen flex items-center justify-center p-4 relative">
      <div className="absolute inset-0 bg-cover bg-center">
        <img src={AuthImg2} alt="Authentication" className="w-full h-full object-cover filter brightness-75" />
      </div>
      
      <div className="relative bg-white rounded-lg shadow-2xl p-8 w-full max-w-md">
        <h1 className="text-3xl font-bold text-center mb-2 text-[#3D4F22]">ECOKUZA</h1>
        <h2 className="text-xl font-semibold text-center mb-2 text-gray-800">Reset your password</h2>
        <p className="text-center text-sm text-gray-600 mb-6">
          Please enter your email address. You will receive a link to create a new password via email.
        </p>
        
        {error && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
            {error}
          </div>
        )}
        
        {success && (
          <div className="mb-4 p-3 bg-green-100 border border-green-400 text-green-700 rounded-md text-sm">
            {success}
          </div>
        )}
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email address</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-[#5A9603] focus:border-transparent outline-none"
            />
          </div>
          
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="w-full bg-[#6DA704] text-white py-3 rounded-md font-semibold hover:bg-[#5A9603] transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Sending...' : 'Send'}
          </button>
        </div>
        
        <p className="text-center mt-6 text-sm text-gray-600">
          Remember your password?{' '}
          <button
            onClick={() => setCurrentPage('signin')}
            className="text-[#6DA704] hover:text-[#3D4F22] font-semibold"
          >
            Sign In
          </button>
        </p>
      </div>
    </div>
  );

  return (
    <div>
      {currentPage === 'signin' && <SignInPage />}
      {currentPage === 'signup' && <SignUpPage />}
      {currentPage === 'forgot' && <ForgotPasswordPage />}
    </div>
  );
};

export default AuthPage;