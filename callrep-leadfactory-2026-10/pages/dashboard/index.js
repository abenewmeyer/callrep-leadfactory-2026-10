import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';

export default function Dashboard() {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [subscribers, setSubscribers] = useState([]);
  const [calls, setCalls] = useState([]);
  const [leadsCount, setLeadsCount] = useState(0);

  useEffect(() => {
    checkUser();
  }, []);

  async function checkUser() {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.push('/login');
      return;
    }

    setUser(session.user);

    // Get profile + role
    const { data: profileData } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();

    setProfile(profileData);

    // Load data based on role
    if (profileData?.role === 'superadmin' || profileData?.role === 'admin') {
      // Admins see everything
      const { data: subs } = await supabase.from('subscribers').select('*').limit(50);
      setSubscribers(subs || []);
      const { count } = await supabase.from('leads').select('*', { count: 'exact', head: true });
      setLeadsCount(count || 0);
    } else if (profileData?.role === 'sales_rep') {
      // Sales reps only see their own sales
      const { data: subs } = await supabase
        .from('subscribers')
        .select('*')
        .eq('sales_rep_id', session.user.id);
      setSubscribers(subs || []);
    } else {
      // Subscriber sees only themselves
      const { data: subs } = await supabase
        .from('subscribers')
        .select('*')
        .eq('profile_id', session.user.id);
      setSubscribers(subs || []);

      if (subs?.[0]) {
        const { data: callData } = await supabase
          .from('calls')
          .select('*')
          .eq('subscriber_id', subs[0].id)
          .order('started_at', { ascending: false })
          .limit(20);
        setCalls(callData || []);
      }
    }

    setLoading(false);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.push('/login');
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <p className="text-xl text-slate-600">Loading dashboard...</p>
      </div>
    );
  }

  const role = profile?.role || 'subscriber';
  const isAdmin = role === 'admin' || role === 'superadmin';
  const isSales = role === 'sales_rep';
  const isSubscriber = role === 'subscriber';

  return (
    <>
      <Head>
        <title>Dashboard — CallRep</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <div className="min-h-screen bg-slate-50 text-slate-900" style={{ fontSize: '16px' }}>
        {/* Header */}
        <header className="bg-white border-b border-slate-200 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black">CR</div>
            <div>
              <div className="font-bold text-xl">CallRep Dashboard</div>
              <div className="text-sm text-slate-500 capitalize">{role.replace('_', ' ')}</div>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <span className="text-base text-slate-600">{user?.email}</span>
            <button
              onClick={handleSignOut}
              className="px-5 py-2 bg-slate-100 hover:bg-slate-200 rounded-lg font-medium text-base"
            >
              Sign Out
            </button>
          </div>
        </header>

        <main className="max-w-6xl mx-auto px-6 py-10">
          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-6 mb-10">
            {isAdmin && (
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
                <div className="text-4xl font-black text-emerald-600">{leadsCount.toLocaleString()}</div>
                <div className="text-base text-slate-500 mt-1">Total Leads in Factory</div>
              </div>
            )}
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-4xl font-black text-slate-900">{subscribers.length}</div>
              <div className="text-base text-slate-500 mt-1">
                {isSubscriber ? 'Your Subscription' : isSales ? 'Your Sales' : 'Active Subscribers'}
              </div>
            </div>
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div className="text-4xl font-black text-slate-900">{calls.length}</div>
              <div className="text-base text-slate-500 mt-1">Recent Calls</div>
            </div>
          </div>

          {/* Subscriber View */}
          {isSubscriber && (
            <div className="space-y-8">
              <section className="bg-white p-8 rounded-2xl border border-slate-200">
                <h2 className="text-2xl font-bold mb-6">Your Calls</h2>
                {calls.length === 0 ? (
                  <p className="text-slate-500 text-lg">No calls recorded yet.</p>
                ) : (
                  <div className="space-y-4">
                    {calls.map((call) => (
                      <div key={call.id} className="border border-slate-100 rounded-xl p-5">
                        <div className="flex justify-between items-start">
                          <div>
                            <div className="font-bold text-lg">{call.direction || 'Inbound'}</div>
                            <div className="text-base text-slate-500 mt-1">
                              {call.started_at ? new Date(call.started_at).toLocaleString() : '—'}
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="font-bold text-lg">{call.duration_seconds || 0}s</div>
                          </div>
                        </div>
                        {call.summary && (
                          <p className="mt-3 text-base text-slate-700 bg-slate-50 p-4 rounded-lg">
                            {call.summary}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </section>

              <section className="bg-white p-8 rounded-2xl border border-slate-200">
                <h2 className="text-2xl font-bold mb-4">Support</h2>
                <p className="text-base text-slate-600 mb-4">Need help? Submit a plain-text request.</p>
                <a
                  href="/dashboard/support"
                  className="inline-block bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl text-base"
                >
                  Open Support Ticket
                </a>
              </section>
            </div>
          )}

          {/* Sales Rep / Admin View */}
          {(isSales || isAdmin) && (
            <section className="bg-white p-8 rounded-2xl border border-slate-200">
              <h2 className="text-2xl font-bold mb-6">
                {isSales ? 'Your Subscribers' : 'All Subscribers'}
              </h2>
              {subscribers.length === 0 ? (
                <p className="text-slate-500 text-lg">No subscribers yet.</p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-500 text-base">
                        <th className="pb-3 pr-4">Plan</th>
                        <th className="pb-3 pr-4">Status</th>
                        <th className="pb-3 pr-4">Phone</th>
                        <th className="pb-3">Created</th>
                      </tr>
                    </thead>
                    <tbody>
                      {subscribers.map((sub) => (
                        <tr key={sub.id} className="border-b border-slate-100">
                          <td className="py-4 pr-4 font-medium text-base capitalize">{sub.plan || '—'}</td>
                          <td className="py-4 pr-4">
                            <span className={`px-3 py-1 rounded-full text-sm font-bold ${
                              sub.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                            }`}>
                              {sub.status}
                            </span>
                          </td>
                          <td className="py-4 pr-4 text-base">{sub.phone_number || '—'}</td>
                          <td className="py-4 text-base text-slate-500">
                            {sub.created_at ? new Date(sub.created_at).toLocaleDateString() : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}

          {/* Admin quick links */}
          {isAdmin && (
            <div className="mt-10 flex gap-4 flex-wrap">
              <a href="/dashboard/leads" className="bg-slate-900 text-white font-bold px-6 py-3 rounded-xl text-base">
                Lead Factory
              </a>
              <a href="/dashboard/import" className="bg-emerald-600 text-white font-bold px-6 py-3 rounded-xl text-base">
                Import CSV
              </a>
            </div>
          )}
        </main>
      </div>
    </>
  );
}
