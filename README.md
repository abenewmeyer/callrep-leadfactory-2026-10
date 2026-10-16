# CallRep + Lead Factory Platform
**Repo created:** October 2026  
**Stack:** Vercel + Supabase (free tier) + Retell AI + Stripe

## What this system does
- Public CallRep.app landing page with WebRTC sales widget (Paul agent)
- Subscriber dashboard (calls, summaries, cancel, support tickets)
- Sales-rep dashboard (only their own subscribers)
- Superadmin / Admin dashboard (everything)
- Lead Factory with enrichment engine (batch size 25)
- Full digital-footprint enrichment (website, email, phone type, social signals, quality score)
- Ready for future suite: Google Business Profile, website builds, hosting, Yelp/Yellow Pages management

## Roles & Access (RLS enforced)
- **Subscriber** → only their own data + their calls
- **Sales Rep** → only subscribers they personally closed
- **Admin / Superadmin** → full access

## Quick Start
1. Clone this repo
2. Create `.env.local` from `.env.example`
3. Push to Vercel and add the environment variables
4. Point `callrep.app` to the Vercel project
5. Run the SQL schema in Supabase
6. Import CSVs and start enrichment

See `/docs` folder for detailed handoff notes.
