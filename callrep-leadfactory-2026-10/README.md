# CallRep + Lead Factory Platform
**Created:** October 2026  
**Repo:** https://github.com/abenewmeyer/callrep-leadfactory-2026-10  
**Stack:** Vercel (free) + Supabase (free) + Retell AI + Stripe

## What this builds
- Public CallRep.app landing page with WebRTC click-to-call (Paul agent)
- Role-based dashboards:
  - Subscriber → only their own info + calls
  - Sales Rep → only subscribers they closed
  - Admin / Superadmin → everything
- Lead Factory with enrichment engine (batch size 25)
- Full digital footprint enrichment (website, email, phone type, quality score)
- Ready for future services: Google Business Profile, website builds, hosting, Yelp, Yellow Pages

## One-time Setup (do in this order)

### 1. Supabase
1. Go to https://supabase.com/dashboard/project/mzupwdapvqfdwoekceur
2. Make sure project is **Active**
3. Open **SQL Editor** → New query
4. Copy the entire contents of `supabase-schema.sql` and run it
5. Go to **Authentication → Users** → Add user:
   - Email: `abenewmeyer@gmail.com`
   - Password: `cebu2026`
   - Auto Confirm User: ON
6. After the user is created, copy the User UUID and run this in SQL Editor:
```sql
insert into public.profiles (id, email, full_name, role)
values ('PASTE_THE_USER_UUID_HERE', 'abenewmeyer@gmail.com', 'Abe Newmeyer', 'superadmin')
on conflict (id) do update set role = 'superadmin';
```

### 2. Environment Variables
1. Copy `.env.example` to `.env.local`
2. Fill in the real values (Supabase keys, Retell key, Stripe keys)

### 3. Deploy to Vercel
1. Go to https://vercel.com → Add New Project
2. Import the GitHub repo `callrep-leadfactory-2026-10`
3. Add all the same environment variables in Vercel → Settings → Environment Variables
4. Deploy

### 4. Point Domain
1. In Vercel project → Settings → Domains
2. Add `callrep.app` and `www.callrep.app`
3. Follow the DNS instructions Vercel shows

### 5. Stripe Webhook
1. Stripe Dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://your-vercel-domain.vercel.app/api/stripe-webhook`
3. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`
4. Copy the signing secret into Vercel as `STRIPE_WEBHOOK_SECRET`

## Local Development
```bash
npm install
npm run dev
```

## Important Notes
- Batch size for enrichment is locked at 25 (proven stable)
- All enrichment runs are fully timestamped for compliance
- RLS is enforced so subscribers and sales reps cannot see each other’s data
- Large readable fonts used throughout the dashboards
