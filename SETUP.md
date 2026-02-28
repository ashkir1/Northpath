# NorthPath — Setup in 20 Minutes

## Step 1: Install dependencies
```
npm install
```

## Step 2: Fill in your .env.local

Open `.env.local` and fill in these values:

**Supabase** (supabase.com → Your project → Settings → API):
- `NEXT_PUBLIC_SUPABASE_URL` — looks like `https://xxxx.supabase.co`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — the "anon public" key
- `SUPABASE_SERVICE_ROLE_KEY` — the "service_role" key (keep this secret)

**Stripe** (stripe.com → Developers → API keys):
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` — the full `pk_test_51T5eod...` key
- `STRIPE_SECRET_KEY` — the full `sk_test_51T5eod...` key
- `STRIPE_WEBHOOK_SECRET` — run `stripe listen` to get this (see Step 4)

**Resend** — already filled in from your screenshot ✓

## Step 3: Set up Supabase database
1. Go to supabase.com → your project → SQL Editor
2. Create a new query
3. Paste the entire contents of `supabase-schema.sql`
4. Click Run

## Step 4: Set up Stripe webhook (for local dev)
```
npm install -g stripe
stripe login
stripe listen --forward-to localhost:3000/api/webhook
```
Copy the `whsec_...` secret it gives you → paste into `.env.local` as `STRIPE_WEBHOOK_SECRET`

## Step 5: Run locally
```
npm run dev
```
Open http://localhost:3000

## Step 6: Deploy to Vercel
1. Push to GitHub
2. Import at vercel.com
3. Add all .env.local variables in Vercel dashboard → Settings → Environment Variables
4. Deploy

## Step 7: Set up Stripe webhook in production
1. Stripe dashboard → Developers → Webhooks → Add endpoint
2. URL: `https://yourapp.vercel.app/api/webhook`
3. Events: `checkout.session.completed`
4. Copy the signing secret → add as `STRIPE_WEBHOOK_SECRET` in Vercel

## Done. Your agency owners can now:
1. Land on northpath.vercel.app
2. Join the waitlist (email captured, confirmation sent)
3. Start their application at /apply
4. Pay $697 via Stripe
5. Receive their package via email

