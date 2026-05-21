import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Link, useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useLoginMutation } from '../../store/services/authApi';
import { setCredentials } from '../../store/slices/authSlice';
import toast from 'react-hot-toast';
import { Lock, Mail, Loader2 } from 'lucide-react';
import ThemeToggle from '../common/ThemeToggle';

const loginSchema = z.object({
  email: z.string().email('Invalid email address').trim().toLowerCase(),
  password: z.string().min(1, 'Password is required'),
});

const Login = () => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [login, { isLoading }] = useLoginMutation();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: '', password: '' },
  });

  const onSubmit = async (data) => {
    try {
      const res = await login(data).unwrap();
      dispatch(setCredentials({
        user: { _id: res._id, name: res.name, email: res.email, avatar: res.avatar },
        token: res.token
      }));
      toast.success(`Welcome back, ${res.name}!`);
      navigate('/boards');
    } catch (err) {
      toast.error(err?.data?.message || 'Login failed');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-dark-950 relative overflow-hidden">
      {/* Theme Toggle */}
      <div className="absolute top-4 right-4 z-50">
        <ThemeToggle className="bg-white/5 backdrop-blur-md shadow-md border border-white/10" />
      </div>

      {/* Decorative Orbs */}
      <div className="absolute top-1/4 left-1/4 w-[30rem] h-[30rem] bg-indigo-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-[30rem] h-[30rem] bg-pink-500/10 rounded-full blur-3xl -z-10 pointer-events-none"></div>

      <div className="w-full max-w-md glass-panel rounded-2xl p-8 shadow-2xl relative border border-white/5 animate-slide-up">
        <div className="text-center mb-8">
          <h2 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 dark:from-indigo-400 dark:via-purple-400 dark:to-pink-400 bg-clip-text text-transparent">
            Collaborative Board
          </h2>
          <p className="text-slate-400 mt-2 text-sm">Sign in to start planning in real-time</p>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Email Address
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="email"
                placeholder="you@example.com"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm ${
                  errors.email ? 'border-red-500/50 focus:border-red-500' : ''
                }`}
                {...register('email')}
              />
            </div>
            {errors.email && (
              <p className="text-xs text-red-400 mt-1.5">{errors.email.message}</p>
            )}
          </div>

          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2">
              Password
            </label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
              <input
                type="password"
                placeholder="••••••••"
                className={`w-full pl-10 pr-4 py-2.5 rounded-lg glass-input text-sm ${
                  errors.password ? 'border-red-500/50 focus:border-red-500' : ''
                }`}
                {...register('password')}
              />
            </div>
            {errors.password && (
              <p className="text-xs text-red-400 mt-1.5">{errors.password.message}</p>
            )}
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full flex items-center justify-center gap-2 py-3 rounded-lg font-semibold text-sm bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 text-white shadow-lg hover:opacity-90 transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 disabled:opacity-50"
          >
            {isLoading ? (
              <Loader2 className="w-5 h-5 animate-spin" />
            ) : (
              'Sign In'
            )}
          </button>
        </form>

        <p className="text-center mt-6 text-xs text-slate-400">
          Don't have an account?{' '}
          <Link
            to="/register"
            className="text-indigo-400 font-semibold hover:text-indigo-300 transition-colors"
          >
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Login;
