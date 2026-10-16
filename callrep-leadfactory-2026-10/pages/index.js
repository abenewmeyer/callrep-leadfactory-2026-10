import { useState, useEffect } from 'react';
import Head from 'next/head';
import { RetellWebClient } from 'retell-client-js-sdk';

const SALES_AGENT_ID = process.env.NEXT_PUBLIC_RETELL_PAUL_AGENT_ID || 'agent_76c42e6231345371c0f0f89b90';

export default function Home() {
  const [salesClient, setSalesClient] = useState(null);
  const [isCalling, setIsCalling] = useState(false);
  const [bubbleText, setBubbleText] = useState('Talk to Sales AI');

  useEffect(() => {
    // Load any needed scripts
  }, []);

  async function toggleSalesCall() {
    if (!salesClient) {
      const client = new RetellWebClient();
      client.on('call_ended', () => {
        setIsCalling(false);
        setBubbleText('Talk to Sales AI');
      });
      setSalesClient(client);
    }

    if (isCalling) {
      salesClient?.stopCall();
      setIsCalling(false);
      setBubbleText('Call Ended');
      setTimeout(() => setBubbleText('Talk to Sales AI'), 2000);
      return;
    }

    setBubbleText('Connecting...');
    try {
      const res = await fetch('/api/create-web-call', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ agent_id: SALES_AGENT_ID }),
      });
      if (!res.ok) throw new Error('API Error');
      const data = await res.json();
      await salesClient.startCall({ accessToken: data.access_token });
      setIsCalling(true);
      setBubbleText('Live with Sales');
    } catch (e) {
      console.error(e);
      setBubbleText('Connection Failed');
      alert('Check RETELL_API_KEY in Vercel environment variables.');
    }
  }

  function calc() {
    const job = Number(document.getElementById('job')?.value || 0);
    const missed = Number(document.getElementById('missed')?.value || 0);
    const annual = job * missed * 52;
    const net = (annual * 0.5) - (97 * 12);
    const fmt = new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    const annualEl = document.getElementById('annualLoss');
    const netEl = document.getElementById('netGain');
    if (annualEl) annualEl.innerText = fmt.format(annual);
    if (netEl) netEl.innerText = fmt.format(net > 0 ? net : 0);
  }

  return (
    <>
      <Head>
        <title>CallRep.app — Never Miss a Call. Never Miss a Job.</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700;800&family=Oswald:wght@600;700&display=swap" rel="stylesheet" />
        <style>{`
          body { font-family: 'Inter', sans-serif; font-size: 16px; }
          .font-display { font-family: 'Oswald', sans-serif; }
          .btn-cta { background: linear-gradient(135deg, #22c55e, #16a34a); }
        `}</style>
      </Head>

      <div className="bg-slate-50 text-slate-900 min-h-screen">
        {/* Floating Sales Widget */}
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
          <div className="bg-white px-4 py-2 rounded-lg shadow-xl border border-slate-200 mb-2 font-bold text-base">
            {bubbleText}
          </div>
          <button
            onClick={toggleSalesCall}
            className={`h-16 w-16 rounded-full shadow-2xl flex items-center justify-center text-white text-2xl ${
              isCalling ? 'bg-red-600 animate-pulse' : 'bg-emerald-600'
            }`}
          >
            {isCalling ? '■' : '☎'}
          </button>
        </div>

        <div className="max-w-6xl mx-auto px-6 py-12">
          <nav className="flex justify-between items-center mb-16">
            <div className="flex items-center gap-2">
              <div className="h-10 w-10 bg-slate-900 rounded-lg flex items-center justify-center text-white font-black text-lg">CR</div>
              <div className="font-display text-2xl font-bold">CallRep.app</div>
            </div>
            <div className="flex gap-4 items-center">
              <a href="/login" className="text-slate-600 font-medium text-base hover:text-slate-900">Login</a>
              <a
                href={`https://buy.stripe.com/cNibJ2dUgb2w3Td3Ms1ck0a`}
                className="btn-cta px-6 py-3 rounded-xl text-white font-bold shadow-lg text-base"
              >
                Start for $97/mo
              </a>
            </div>
          </nav>

          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm font-bold mb-6">
                <span className="inline-block w-2 h-2 bg-emerald-500 rounded-full mr-1 animate-pulse"></span>
                Accepting New Trades
              </div>
              <h1 className="font-display text-5xl md:text-6xl font-black text-slate-900 leading-tight mb-6">
                Never Miss a Call.<br />
                <span className="text-emerald-600">Never Miss a Job.</span>
              </h1>
              <p className="text-xl text-slate-600 mb-8 leading-relaxed">
                The AI receptionist built for plumbers, electricians, HVAC and skilled trades.
                We answer 24/7, book estimates, and send you the details instantly.
              </p>
              <div className="flex gap-4 flex-wrap">
                <a
                  href="https://buy.stripe.com/cNibJ2dUgb2w3Td3Ms1ck0a"
                  className="btn-cta px-8 py-4 rounded-2xl text-white font-bold text-lg shadow-xl"
                >
                  Get Started
                </a>
                <a href="#audit" className="px-8 py-4 rounded-2xl bg-white border border-slate-200 text-slate-700 font-bold text-lg">
                  Calculate ROI
                </a>
              </div>
            </div>

            <div className="bg-white p-8 rounded-3xl shadow-xl border border-slate-100 space-y-3">
              <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Select Your Agent</h3>
              
              <div className="w-full text-left p-4 rounded-xl border-2 border-emerald-500 bg-emerald-50">
                <div className="font-bold text-lg">Paul</div>
                <div className="text-base text-slate-500">Calm Professional — Main CallRep Agent</div>
              </div>
              
              <div className="w-full text-left p-4 rounded-xl border border-slate-200">
                <div className="font-bold text-lg">Rita</div>
                <div className="text-base text-slate-500">Warm & Helpful</div>
              </div>
              
              <div className="w-full text-left p-4 rounded-xl border border-slate-200">
                <div className="font-bold text-lg">Jack</div>
                <div className="text-base text-slate-500">Direct & Strong</div>
              </div>
            </div>
          </div>
        </div>

        {/* ROI Calculator */}
        <div id="audit" className="bg-white py-20 border-t border-slate-100">
          <div className="max-w-4xl mx-auto px-6">
            <div className="bg-slate-50 p-10 rounded-3xl border border-slate-200">
              <h2 className="font-display text-3xl font-black mb-8">ROI Calculator</h2>
              <div className="grid md:grid-cols-2 gap-8 mb-8">
                <div>
                  <label className="block font-bold text-slate-500 text-base mb-2">Avg Job Value ($)</label>
                  <input
                    type="number"
                    id="job"
                    defaultValue="450"
                    onInput={calc}
                    className="w-full p-4 rounded-xl border text-lg"
                  />
                </div>
                <div>
                  <label className="block font-bold text-slate-500 text-base mb-2">Missed Calls / Week</label>
                  <input
                    type="number"
                    id="missed"
                    defaultValue="5"
                    onInput={calc}
                    className="w-full p-4 rounded-xl border text-lg"
                  />
                </div>
              </div>
              <div className="flex justify-between items-end border-t pt-8">
                <div>
                  <div className="text-sm font-bold text-slate-400 uppercase">Annual Loss</div>
                  <div id="annualLoss" className="text-4xl font-black">$117,000</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-bold text-emerald-600 uppercase">Net Gain</div>
                  <div id="netGain" className="text-4xl font-black text-emerald-600">$57,336</div>
                  <div className="text-sm text-slate-400">*After $97/mo cost</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
