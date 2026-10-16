import Stripe from 'stripe';
import { createServiceClient } from '../../lib/supabase';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

export const config = {
  api: {
    bodyParser: false,
  },
};

async function buffer(readable) {
  const chunks = [];
  for await (const chunk of readable) {
    chunks.push(typeof chunk === 'string' ? Buffer.from(chunk) : chunk);
  }
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).end();
  }

  const buf = await buffer(req);
  const sig = req.headers['stripe-signature'];

  let event;
  try {
    event = stripe.webhooks.constructEvent(buf, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const supabase = createServiceClient();

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object;
    const customerEmail = session.customer_details?.email;
    const customerId = session.customer;
    const subscriptionId = session.subscription;

    if (customerEmail) {
      // Find or create profile
      const { data: existing } = await supabase
        .from('profiles')
        .select('id')
        .eq('email', customerEmail)
        .single();

      let profileId = existing?.id;

      if (!profileId) {
        // Note: real user creation should happen via Supabase Auth
        // This is a placeholder for linking
        console.log('New customer checkout:', customerEmail);
      }

      // Upsert subscriber record
      await supabase.from('subscribers').upsert({
        profile_id: profileId,
        stripe_customer_id: customerId,
        stripe_subscription_id: subscriptionId,
        status: 'active',
        plan: session.metadata?.plan || 'monthly',
        updated_at: new Date().toISOString(),
      }, { onConflict: 'stripe_customer_id' });
    }
  }

  if (event.type === 'customer.subscription.deleted') {
    const subscription = event.data.object;
    await supabase
      .from('subscribers')
      .update({ status: 'canceled', updated_at: new Date().toISOString() })
      .eq('stripe_subscription_id', subscription.id);
  }

  res.json({ received: true });
}
