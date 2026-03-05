import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Users, Copy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import { toast } from "sonner";

const ReferralPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => { if (!loading && !user) navigate("/login"); }, [user, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  const { data: earnings } = useQuery({
    queryKey: ["referral_earnings", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("referral_earnings").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const { data: settings } = useQuery({
    queryKey: ["platform_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_settings").select("*");
      const map: Record<string, string> = {};
      data?.forEach(s => { map[s.key] = s.value; });
      return map;
    },
    enabled: !!user,
  });

  if (loading || !user) return null;

  const levels = [
    { level: 1, percent: `${settings?.referral_level_1 ?? "8"}%` },
    { level: 2, percent: `${settings?.referral_level_2 ?? "4"}%` },
    { level: 3, percent: `${settings?.referral_level_3 ?? "2"}%` },
    { level: 4, percent: `${settings?.referral_level_4 ?? "1"}%` },
  ].map(l => ({
    ...l,
    members: earnings?.filter(e => e.level === l.level).length ?? 0,
    earned: earnings?.filter(e => e.level === l.level).reduce((s, e) => s + Number(e.amount), 0).toFixed(2) ?? "0.00",
  }));

  const referralLink = `${window.location.origin}/signup?ref=${profile?.referral_code ?? ""}`;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Referral Income</h1>
          <p className="text-muted-foreground mb-8">Build your network and earn passive commission</p>

          <div className="glass-card rounded-xl p-6 mb-8 gold-border">
            <h2 className="font-display font-semibold text-foreground mb-3">Your Referral Link</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-secondary rounded-lg px-4 py-3 text-sm text-muted-foreground truncate">{referralLink}</div>
              <Button variant="gold" size="sm" onClick={() => { navigator.clipboard.writeText(referralLink); toast.success("Copied!"); }}>
                <Copy size={14} className="mr-1" /> Copy
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {levels.map((l, i) => (
              <motion.div key={l.level} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }} className="glass-card-hover rounded-xl p-6 text-center">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-display font-bold text-lg">{l.level}</span>
                </div>
                <p className="text-2xl font-display font-bold text-primary mb-1">{l.percent}</p>
                <p className="text-sm text-muted-foreground">Commission</p>
                <div className="border-t border-border/50 mt-4 pt-4 space-y-1">
                  <div className="flex justify-between text-sm"><span className="text-muted-foreground">Earnings</span><span className="text-primary font-medium">${l.earned}</span></div>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="glass-card rounded-xl p-6">
            <h2 className="font-display font-semibold text-foreground mb-4">Referral History</h2>
            {earnings?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No referral earnings yet. Share your link to start earning!</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                      <th className="pb-3 font-medium">Level</th>
                      <th className="pb-3 font-medium">Commission</th>
                      <th className="pb-3 font-medium">Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {earnings?.map((r) => (
                      <tr key={r.id} className="border-b border-border/30 last:border-0">
                        <td className="py-3 text-sm"><span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">Level {r.level}</span></td>
                        <td className="py-3 text-sm text-green-400 font-medium">+${Number(r.amount).toFixed(2)}</td>
                        <td className="py-3 text-sm text-muted-foreground">{r.created_at.slice(0, 10)}</td>
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

export default ReferralPage;
