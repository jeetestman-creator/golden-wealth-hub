import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Wallet, TrendingUp, ArrowDownToLine, ArrowUpFromLine, Users, DollarSign, Copy, ExternalLink } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useEffect } from "react";
import { toast } from "sonner";

const DashboardPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: balance } = useQuery({
    queryKey: ["balance", user?.id],
    queryFn: async () => {
      const { data } = await supabase.rpc("get_user_balance", { p_user_id: user!.id });
      return data ?? 0;
    },
    enabled: !!user,
  });

  const { data: deposits } = useQuery({
    queryKey: ["deposits", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("deposits").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: withdrawals } = useQuery({
    queryKey: ["withdrawals", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("withdrawals").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: roiPayouts } = useQuery({
    queryKey: ["roi_payouts", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("roi_payouts").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: referralEarnings } = useQuery({
    queryKey: ["referral_earnings", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("referral_earnings").select("*").eq("user_id", user!.id);
      return data ?? [];
    },
    enabled: !!user,
  });

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return null;

  const totalDeposits = deposits?.filter(d => d.status === "confirmed").reduce((s, d) => s + Number(d.net_amount), 0) ?? 0;
  const totalROI = roiPayouts?.reduce((s, r) => s + Number(r.amount), 0) ?? 0;
  const totalReferral = referralEarnings?.reduce((s, r) => s + Number(r.amount), 0) ?? 0;

  // Combine recent transactions
  const recentTx = [
    ...(deposits?.slice(0, 5).map(d => ({ type: "Deposit", amount: `+${Number(d.amount).toFixed(2)}`, date: d.created_at.slice(0, 10), status: d.status })) ?? []),
    ...(withdrawals?.slice(0, 5).map(w => ({ type: "Withdrawal", amount: `-${Number(w.amount).toFixed(2)}`, date: w.created_at.slice(0, 10), status: w.status })) ?? []),
  ].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 8);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">Welcome back, {profile?.full_name || "Investor"}</p>
            </div>
            <div className="flex gap-3">
              <Button variant="gold" size="sm" asChild><Link to="/deposit"><ArrowDownToLine size={16} className="mr-1" /> Deposit</Link></Button>
              <Button variant="gold-outline" size="sm" asChild><Link to="/withdrawal"><ArrowUpFromLine size={16} className="mr-1" /> Withdraw</Link></Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Wallet size={20} />} label="Current Balance" value={`$${Number(balance ?? 0).toFixed(2)}`} subtext="USDT" />
            <StatCard icon={<ArrowDownToLine size={20} />} label="Total Deposits" value={`$${totalDeposits.toFixed(2)}`} />
            <StatCard icon={<TrendingUp size={20} />} label="Total ROI Earned" value={`$${totalROI.toFixed(2)}`} subtext="10% Monthly" />
            <StatCard icon={<Users size={20} />} label="Referral Earnings" value={`$${totalReferral.toFixed(2)}`} />
          </div>

          <div className="glass-card rounded-xl p-6 mb-8 gold-border">
            <h2 className="font-display font-semibold text-foreground mb-3">Your Referral Code</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-secondary rounded-lg px-4 py-3 font-mono text-lg text-primary font-bold tracking-wider">
                {profile?.referral_code ?? "Loading..."}
              </div>
              <Button variant="gold-outline" size="icon" onClick={() => { navigator.clipboard.writeText(profile?.referral_code ?? ""); toast.success("Copied!"); }}>
                <Copy size={16} />
              </Button>
              <Button variant="gold" size="sm" asChild><Link to="/referral"><ExternalLink size={14} className="mr-1" /> View Levels</Link></Button>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="font-display font-semibold text-foreground">Recent Transactions</h2>
              <Button variant="gold-outline" size="sm" asChild>
                <Link to="/transactions">View All</Link>
              </Button>
            </div>
            {recentTx.length === 0 ? (
              <p className="text-muted-foreground text-sm">No transactions yet. Make your first deposit to get started!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                      <th className="pb-3 font-medium">Type</th>
                      <th className="pb-3 font-medium">Amount (USDT)</th>
                      <th className="pb-3 font-medium">Date</th>
                      <th className="pb-3 font-medium">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {recentTx.map((tx, i) => (
                      <tr key={i} className="border-b border-border/30 last:border-0">
                        <td className="py-3 text-sm text-foreground flex items-center gap-2"><DollarSign size={14} className="text-primary" />{tx.type}</td>
                        <td className={`py-3 text-sm font-medium ${tx.amount.startsWith("+") ? "text-green-400" : "text-red-400"}`}>{tx.amount}</td>
                        <td className="py-3 text-sm text-muted-foreground">{tx.date}</td>
                        <td className="py-3"><span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium capitalize">{tx.status}</span></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default DashboardPage;
