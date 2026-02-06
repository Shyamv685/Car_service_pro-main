
import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { Check, AlertCircle, UserPlus, Truck, User, ShieldCheck, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const { login } = useApp();
  const [role, setRole] = useState<UserRole>(UserRole.USER);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    if (!email || !password) {
      setError('Please fill in all fields');
      setLoading(false);
      return;
    }

    if (isSignUp && !name) {
      setError('Please enter your full name');
      setLoading(false);
      return;
    }

    // For demo purposes, allow any password > 6 chars (Supabase requirement usually)
    if (password.length < 6) {
      setError('Password must be at least 6 characters');
      setLoading(false);
      return;
    }

    const errorMsg = await login(role, email, password, isSignUp ? name : undefined, isSignUp);
    
    if (errorMsg) {
      setError(errorMsg);
      if (isSignUp && errorMsg.includes("User already registered")) {
          setIsSignUp(false); // Switch to login
      }
    }
    setLoading(false);
  };

  const getRoleLabel = (r: UserRole) => {
    if (r === UserRole.USER) return 'User';
    if (r === UserRole.DRIVER) return 'Driver';
    return 'Admin';
  };

  const getRoleIcon = (r: UserRole) => {
    if (r === UserRole.USER) return <User size={16} />;
    if (r === UserRole.DRIVER) return <Truck size={16} />;
    return <ShieldCheck size={16} />;
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-10 rounded-2xl shadow-xl border border-gray-100">
        
        {/* Header Section matching the image */}
        <div className="flex flex-col items-center">
            <div className="bg-blue-500 p-3 rounded-xl mb-4 shadow-lg shadow-blue-200">
                <Check size={32} className="text-white" strokeWidth={3} />
            </div>
            <h2 className="text-3xl font-bold text-gray-900 tracking-tight">Car Service</h2>
            <p className="mt-2 text-gray-500">
                {isSignUp ? 'Create your account' : 'Sign in to your account'}
            </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleLogin}>
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm flex items-center">
                <AlertCircle size={16} className="mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <div className="space-y-5">
                {isSignUp && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1.5">Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                        placeholder="John Doe"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-gray-400">
                        <UserPlus size={20} />
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    placeholder="Enter your email"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">Password</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-lg placeholder-gray-400 text-black focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all bg-white"
                    placeholder="Min 6 characters"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Role</label>
                  <div className="flex space-x-2">
                    {[UserRole.USER, UserRole.DRIVER, UserRole.ADMIN].map((r) => (
                      <button
                        key={r}
                        type="button"
                        onClick={() => setRole(r)}
                        className={`flex-1 flex items-center justify-center py-2.5 px-2 rounded-lg text-sm font-medium transition-all border ${
                          role === r
                            ? 'bg-blue-500 text-white border-blue-600 shadow-md'
                            : 'bg-white text-gray-600 border-gray-300 hover:bg-gray-50 hover:border-gray-400'
                        }`}
                      >
                        <span className="mr-1.5 hidden xs:inline">{getRoleIcon(r)}</span>
                        {getRoleLabel(r)}
                      </button>
                    ))}
                  </div>
                </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-3.5 px-4 border border-transparent text-sm font-bold rounded-lg text-white bg-blue-500 hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors shadow-lg shadow-blue-200 disabled:opacity-70 disabled:cursor-not-allowed"
            >
              {loading ? (
                <Loader2 className="animate-spin" />
              ) : (
                isSignUp ? 'Sign Up' : `Sign in as ${getRoleLabel(role)}`
              )}
            </button>

            <div className="text-center mt-6">
              <button 
                type="button"
                onClick={() => {
                  setIsSignUp(!isSignUp);
                  setError('');
                  setName('');
                  setEmail('');
                  setPassword('');
                }}
                className="text-blue-500 hover:text-blue-700 font-medium text-sm transition-colors"
              >
                {isSignUp ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
              </button>
            </div>
        </form>
      </div>
    </div>
  );
}
