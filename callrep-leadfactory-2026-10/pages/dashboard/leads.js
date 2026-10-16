import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { supabase } from '../../lib/supabase';

export default function LeadsPage() {
  const router = useRouter();
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ total: 0, withWebsite: 0, withEmail: 0, mobile: 0 });
  const [tradeFilter, setTradeFilter] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 50;

  useEffect(() => {
    loadData();
  }, [page, tradeFilter]);

  async function loadData() {
    setLoading(true);

    // Stats
    const { count: total } = await supabase.from('leads').select('*', { count: 'exact', head: true });
    const { count: withWebsite } = await supabase.from('leads').select('*', { count: 'exact', head: true }).not('website', 'is', null);
    const { count: withEmail } = await supabase.from('leads').select('*', { count: 'exact', head: true }).not('email', 'is', null);
    const { count: mobile } = await supabase.from('leads').select('*', { count: 'exact', head: true }).eq('phone_type', 'mobile');

    setStats({
      total: total || 0,
      withWebsite: withWebsite || 0,
      withEmail: withEmail || 0,
      mobile: mobile || 0,
    });

    // Leads list
    let query = supabase
      .from('leads')
      .select('id, company_name, owner_name, phone, phone_type, email, website, trade, city, state, lead_quality_score, status')
      .order('id', { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (tradeFilter) {
      query = query.eq('trade', tradeFilter);
    }

    const { data } = await query;
    setLeads(data || []);
    setLoading(false);
  }

  async function exportCSV() {
    // Simple client-side export of current page (full export can be server-side later)
    const headers = ['company_name', 'owner_name', 'phone', 'phone_type', 'email', 'website', 'trade', 'city', 'state', 'lead_quality_score'];
    const rows = leads.map(l => headers.map(h => `"${(l[h] || '').toString().replace(/"/g, '""')}"`).join(','));
    const csv = [headers.join(','), ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `leads_export_page_${page}.csv`;
    a.click();
  }

  return (
    <>
      <Head>
        <title>Lead Factory — CallRep</title>
        <script src="https://cdn.tailwindcss.com"></script>
      </Head>

      <div className="min-h-screen bg-slate-50" style={{ fontSize: '16px' }}>
        <header className="bg-white border-b border-slate-200 px-6 py-5 flex justify-between items-center">
          <div className="flex items-center gap-3">
            <a href="/dashboard" className="text-slate-500 hover:text-slate-900 text-base">← Dashboard</a>
            <h1 className="text-2xl font-bold">Lead Factory</h1>
          </div>
          <button
            onClick={exportCSV}
            className="bg-emerald-600 text-white font-bold px-5 py-2 rounded-lg text-base"
          >
            Export Current Page CSV
          </button>
        </header>

        <main className="max-w-7xl mx-auto px-6 py-8">
          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-3xl font-black text-slate-900">{stats.total.toLocaleString()}</div>
              <div className="text-sm text-slate-500 mt-1">Total Leads</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-3xl font-black text-emerald-600">{stats.withWebsite.toLocaleString()}</div>
              <div className="text-sm text-slate-500 mt-1">With Website</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-3xl font-black text-emerald-600">{stats.withEmail.toLocaleString()}</div>
              <div className="text-sm text-slate-500 mt-1">With Email</div>
            </div>
            <div className="bg-white p-5 rounded-xl border border-slate-200">
              <div className="text-3xl font-black text-blue-600">{stats.mobile.toLocaleString()}</div>
              <div className="text-sm text-slate-500 mt-1">Mobile Numbers</div>
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-4 mb-6">
            <select
              value={tradeFilter}
              onChange={(e) => { setTradeFilter(e.target.value); setPage(1); }}
              className="p-3 border border-slate-300 rounded-lg text-base"
            >
              <option value="">All Trades</option>
              <option value="plumber">Plumber</option>
              <option value="electrician">Electrician</option>
            </select>
          </div>

          {/* Table */}
          <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
            {loading ? (
              <p className="p-8 text-center text-slate-500 text-lg">Loading leads...</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left">
                  <thead className="bg-slate-50 border-b border-slate-200">
                    <tr className="text-slate-500 text-sm uppercase tracking-wide">
                      <th className="px-4 py-3">Company</th>
                      <th className="px-4 py-3">Owner</th>
                      <th className="px-4 py-3">Phone</th>
                      <th className="px-4 py-3">Type</th>
                      <th className="px-4 py-3">Email</th>
                      <th className="px-4 py-3">Website</th>
                      <th className="px-4 py-3">Trade</th>
                      <th className="px-4 py-3">Score</th>
                    </tr>
                  </thead>
                  <tbody>
                    {leads.map((lead) => (
                      <tr key={lead.id} className="border-b border-slate-100 hover:bg-slate-50">
                        <td className="px-4 py-3 font-medium">{lead.company_name || '—'}</td>
                        <td className="px-4 py-3">{lead.owner_name || '—'}</td>
                        <td className="px-4 py-3 font-mono text-sm">{lead.phone || '—'}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            lead.phone_type === 'mobile' ? 'bg-blue-100 text-blue-700' : 'bg-slate-100 text-slate-600'
                          }`}>
                            {lead.phone_type || '—'}
                          </span>
                        </td>
                        <td className="px-4 py-3 text-sm">{lead.email || '—'}</td>
                        <td className="px-4 py-3 text-sm truncate max-w-[180px]">
                          {lead.website ? (
                            <a href={lead.website} target="_blank" rel="noreferrer" className="text-emerald-600 underline">
                              {lead.website.replace(/^https?:\/\//, '').slice(0, 30)}
                            </a>
                          ) : '—'}
                        </td>
                        <td className="px-4 py-3 capitalize">{lead.trade || '—'}</td>
                        <td className="px-4 py-3 font-bold">{lead.lead_quality_score || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-5 py-2 bg-white border border-slate-300 rounded-lg font-medium disabled:opacity-40"
            >
              ← Previous
            </button>
            <span className="text-slate-600">Page {page}</span>
            <button
              onClick={() => setPage(p => p + 1)}
              disabled={leads.length < pageSize}
              className="px-5 py-2 bg-white border border-slate-300 rounded-lg font-medium disabled:opacity-40"
            >
              Next →
            </button>
          </div>
        </main>
      </div>
    </>
  );
}
