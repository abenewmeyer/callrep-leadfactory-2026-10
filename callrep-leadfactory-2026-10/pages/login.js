import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../lib/supabase';

export default function Login() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [mode, setMode] = useState('magic'); // 'magic' or 'password'

  async function handleMagicLink(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/dashboard`,
      },
    });

    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      setMessage('Check your email for the magic link.');
    }
  }

  async function handlePasswordLogin(e) {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);
    if (error) {
      setMessage(error.message);
    } else {
      router.push('/dashboard');
    }
  }

  return (
    <>
      <Head>
        <title>Login — CallRep</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <div className="min-h-screen bg-slate-50 flex items-center justify-center px-4">
        <div className="bg-white p-10 rounded-2xl shadow-xl border border-slate-200 w-full max-w-md">
          <div className="text-center mb-8">
            <div className="h-12 w-12 bg-slate-900 rounded-xl flex items-center justify-center text-white font-black text-xl mx-auto mb-4">CR</div>
            <h1 className="text-3xl font-bold text-slate-900">Sign in to CallRep</h1>
            <p className="text-slate-500 mt-2 text-base">Subscribers • Sales Reps • Admins</p>
          </div>

          <div className="flex gap-2 mb-6">
            <button
              onClick={() => setMode('magic')}
              className={`flex-1 py-3 rounded-lg font-bold text-base ${mode === 'magic' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Magic Link
            </button>
            <button
              onClick={() => setMode('password')}
              className={`flex-1 py-3 rounded-lg font-bold text-base ${mode === 'password' ? 'bg-emerald-600 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Password
            </button>
          </div>

          {mode === 'magic' ? (
            <form onSubmit={handleMagicLink} className="space-y-5">
              <div>
                <label className="block text-base font-bold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-4 border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-emerald-500 outline-none"
                  placeholder="you@company.com"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>
            </form>
          ) : (
            <form onSubmit={handlePasswordLogin} className="space-y-5">
              <div>
                <label className="block text-base font-bold text-slate-700 mb-2">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full p-4 border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <div>
                <label className="block text-base font-bold text-slate-700 mb-2">Password</label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full p-4 border border-slate-300 rounded-xl text-base focus:ring-2 focus:ring-emerald-500 outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-emerald-600 text-white font-bold py-4 rounded-xl text-lg hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>
          )}

          {message && (
            <p className={`mt-6 text-center text-base ${message.includes('Check') ? 'text-emerald-600' : 'text-red-600'}`}>
              {message}
            </p>
          )}

          <p className="mt-8 text-center text-slate-500 text-base">
            <a href="/" className="underline">← Back to CallRep.app</a>
          </p>
        </div>
      </div>
    </>
  );
}
