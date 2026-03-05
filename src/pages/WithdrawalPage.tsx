import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AlertCircle, ArrowUpFromLine, Clock } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const WithdrawalPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("BEP-20");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!loading && !user) navigate("/login"); }, [user, loading, navigate]);

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

  const { data: withdrawals } = useQuery({
    queryKey: ["withdrawals", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("withdrawals").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  const withdrawalFee = parseFloat(settings?.withdrawal_fee ?? "5");
  const fee = amount ? (parseFloat(amount) * withdrawalFee / 100).toFixed(2) : "0.00";
  const netAmount = amount ? (parseFloat(amount) - parseFloat(fee)).toFixed(2) : "0.00";

  const handleWithdraw = async () => {
    if (!user || !amount || !walletAddress) return;
    setSubmitting(true);
    const { error } = await supabase.from("withdrawals").insert({
      user_id: user.id,
      amount: parseFloat(amount),
      fee: parseFloat(fee),
      net_amount: parseFloat(netAmount),
      wallet_address: walletAddress,
      network,
    });
    if (error) {
      toast.error("Failed to submit withdrawal request");
    } else {
      toast.success("Withdrawal request submitted! Awaiting admin approval.");
      setAmount("");
      setWalletAddress("");
      queryClient.invalidateQueries({ queryKey: ["withdrawals"] });
    }
    setSubmitting(false);
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Withdraw USDT</h1>
          <p className="text-muted-foreground mb-8">Submit a withdrawal request for admin approval</p>

          <div className="glass-card rounded-xl p-6 mb-6">
            <h2 className="font-display font-semibold text-foreground mb-4">Withdrawal Details</h2>
            <div className="space-y-4">
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Network</label>
                <div className="grid grid-cols-2 gap-3">
                  {["BEP-20", "TRC-20"].map((n) => (
                    <button key={n} onClick={() => setNetwork(n)} className={`p-3 rounded-lg border text-sm font-medium transition-all ${network === n ? "border-primary bg-primary/10 text-primary" : "border-border bg-secondary text-foreground"}`}>
                      {n}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Your USDT Wallet Address</label>
                <Input placeholder="Enter your wallet address" value={walletAddress} onChange={(e) => setWalletAddress(e.target.value)} className="bg-secondary border-border font-mono" />
              </div>
              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Amount (USDT)</label>
                <Input type="number" placeholder="Enter withdrawal amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-secondary border-border text-lg h-14 font-display" />
              </div>
              {amount && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between"><span className="text-muted-foreground">Withdrawal Fee ({withdrawalFee}%)</span><span className="text-foreground">${fee}</span></div>
                  <div className="flex justify-between border-t border-border/50 pt-2"><span className="text-muted-foreground">You'll Receive</span><span className="text-primary font-semibold">${netAmount} USDT</span></div>
                </div>
              )}
              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertCircle size={14} className="text-primary mt-0.5 shrink-0" />
                <p>Withdrawals are processed within 24-48 hours after admin approval.</p>
              </div>
            </div>
            <Button variant="gold" size="lg" className="w-full mt-6" disabled={!amount || !walletAddress || submitting} onClick={handleWithdraw}>
              <ArrowUpFromLine size={18} className="mr-2" /> {submitting ? "Submitting..." : "Submit Withdrawal Request"}
            </Button>
          </div>

          <div className="glass-card rounded-xl p-6">
            <h2 className="font-display font-semibold text-foreground mb-4">Withdrawal History</h2>
            {withdrawals?.length === 0 ? (
              <p className="text-muted-foreground text-sm">No withdrawal requests yet.</p>
            ) : (
              <div className="space-y-3">
                {withdrawals?.map((r) => (
                  <div key={r.id} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                    <div className="flex items-center gap-3">
                      <Clock size={16} className="text-muted-foreground" />
                      <div>
                        <p className="text-sm font-medium text-foreground">${Number(r.amount).toFixed(2)} USDT</p>
                        <p className="text-xs text-muted-foreground">{r.created_at.slice(0, 10)}</p>
                      </div>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                      r.status === "pending" ? "bg-yellow-500/10 text-yellow-400"
                      : r.status === "approved" || r.status === "completed" ? "bg-green-500/10 text-green-400"
                      : "bg-red-500/10 text-red-400"
                    }`}>
                      {r.status}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default WithdrawalPage;
