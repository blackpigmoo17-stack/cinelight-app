const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);
const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const sig = req.headers["stripe-signature"];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).json({ error: `Webhook error: ${err.message}` });
  }

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const email = session.customer_email?.toLowerCase().trim();
        if (!email) break;

        await supabase.from("subscribers").upsert({
          email,
          stripe_customer_id: session.customer,
          stripe_subscription_id: session.subscription,
          status: "pro",
          updated_at: new Date().toISOString(),
        }, { onConflict: "email" });
        break;
      }

      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        await supabase.from("subscribers")
          .update({ status: "free", updated_at: new Date().toISOString() })
          .eq("stripe_subscription_id", subscription.id);
        break;
      }
    }

    res.status(200).json({ received: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

export const config = { api: { bodyParser: false } };
