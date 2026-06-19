const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_ANON_KEY
);

module.exports = async function handler(req, res) {
  if (req.method !== "POST") return res.status(405).json({ error: "Method not allowed" });

  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "กรุณาใส่ email" });

  try {
    const { data, error } = await supabase
      .from("subscribers")
      .select("status, email")
      .eq("email", email.toLowerCase().trim())
      .single();

    if (error || !data) {
      return res.status(200).json({ status: "free", isPro: false });
    }

    res.status(200).json({
      status: data.status,
      isPro: data.status === "pro",
      email: data.email,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
