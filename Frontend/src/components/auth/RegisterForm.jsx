import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register as registerRequest } from '../../api/authApi';
import useAuth from '../../hooks/useAuth';
import ErrorMessage from '../common/ErrorMessage';
import Loader from '../common/Loader';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default function RegisterForm() {
  const navigate = useNavigate();
  const auth = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  function validate() {
    if (!name.trim() || !email.trim() || !password || !confirmPassword) {
      return 'All fields are required';
    }

    if (!emailRegex.test(email)) {
      return 'Please enter a valid email address';
    }

    if (password.length < 6) {
      return 'Password must be at least 6 characters';
    }

    if (password !== confirmPassword) {
      return 'Passwords must match';
    }

    return null;
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validate();

    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await registerRequest(name, email, password);
      auth.login(data.user, data.token);
      navigate('/dashboard', { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-[#111111] px-6 pt-20">
      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-5">
        <div className="space-y-2 text-center">
          <h1 className="text-4xl font-bold text-white">Register</h1>
          <p className="text-sm text-[#9ca3af]">
            Create your interview strategy workspace.
          </p>
        </div>

        <ErrorMessage message={error} />

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            Name
          </label>
          <input
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Sai Charan"
            className="w-full rounded-xl border border-[#2a2a2a] bg-white px-4 py-3 text-[#111111] placeholder-gray-500 focus:border-[#e91e63] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            className="w-full rounded-xl border border-[#2a2a2a] bg-white px-4 py-3 text-[#111111] placeholder-gray-500 focus:border-[#e91e63] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            placeholder="Create a password"
            className="w-full rounded-xl border border-[#2a2a2a] bg-white px-4 py-3 text-[#111111] placeholder-gray-500 focus:border-[#e91e63] focus:outline-none"
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs font-semibold uppercase tracking-wide text-[#6b7280]">
            Confirm Password
          </label>
          <input
            type="password"
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
            placeholder="Confirm your password"
            className="w-full rounded-xl border border-[#2a2a2a] bg-white px-4 py-3 text-[#111111] placeholder-gray-500 focus:border-[#e91e63] focus:outline-none"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#e91e63] px-6 py-3 font-semibold text-white transition-all duration-200 hover:bg-[#c2185b] disabled:cursor-not-allowed disabled:opacity-70"
        >
          {loading ? (
            <>
              <Loader size="sm" />
              Registering...
            </>
          ) : (
            'Register'
          )}
        </button>

        <p className="text-center text-sm text-[#9ca3af]">
          Already have an account?{' '}
          <Link to="/login" className="font-semibold text-[#e91e63]">
            Login
          </Link>
        </p>
      </form>
    </main>
  );
}
