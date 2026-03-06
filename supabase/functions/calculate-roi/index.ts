import { createClient } from "https://esm.sh/@supabase/supabase-js@2.98.0";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceRoleKey);

    // Get platform settings
    const { data: settingsData } = await supabase.from("platform_settings").select("*");
    const settings: Record<string, string> = {};
    settingsData?.forEach((s: { key: string; value: string }) => { settings[s.key] = s.value; });
    const monthlyRoi = parseFloat(settings.monthly_roi ?? "10") / 100;

    // Current month key (YYYY-MM)
    const now = new Date();
    const forMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;

    // Get all confirmed deposits
    const { data: deposits } = await supabase
      .from("deposits")
      .select("user_id, net_amount")
      .eq("status", "confirmed");

    if (!deposits || deposits.length === 0) {
      return new Response(JSON.stringify({ message: "No confirmed deposits found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Aggregate deposits per user
    const userTotals: Record<string, number> = {};
    for (const d of deposits) {
      userTotals[d.user_id] = (userTotals[d.user_id] ?? 0) + Number(d.net_amount);
    }

    let payoutsCreated = 0;
    let payoutsSkipped = 0;

    for (const [userId, totalDeposit] of Object.entries(userTotals)) {
      // Check if ROI already paid for this month
      const { data: existing } = await supabase
        .from("roi_payouts")
        .select("id")
        .eq("user_id", userId)
        .eq("for_month", forMonth)
        .limit(1);

      if (existing && existing.length > 0) {
        payoutsSkipped++;
        continue;
      }

      const roiAmount = totalDeposit * monthlyRoi;
      if (roiAmount <= 0) continue;

      // Insert ROI payout
      await supabase.from("roi_payouts").insert({
        user_id: userId,
        amount: roiAmount,
        for_month: forMonth,
      });

      // Create notification
      await supabase.from("notifications").insert({
        user_id: userId,
        title: "Monthly ROI Credited 💰",
        message: `Your monthly ROI of $${roiAmount.toFixed(2)} USDT (${(monthlyRoi * 100).toFixed(0)}% on $${totalDeposit.toFixed(2)}) has been credited to your account for ${forMonth}.`,
        type: "success",
      });

      payoutsCreated++;
    }

    return new Response(
      JSON.stringify({ success: true, forMonth, payoutsCreated, payoutsSkipped }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("ROI calculation error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
