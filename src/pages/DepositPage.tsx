import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Copy, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { toast } from "sonner";
import { useEffect } from "react";

const DepositPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [amount, setAmount] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { if (!loading && !user) navigate("/login"); }, [user, loading, navigate]);

  const { data: wallets } = useQuery({
    queryKey: ["wallet_addresses"],
    queryFn: async () => {
      const { data } = await supabase.from("wallet_addresses").select("*").eq("is_active", true);
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

  const depositFee = parseFloat(settings?.deposit_fee ?? "5");
  const minInvestment = parseFloat(settings?.min_investment ?? "100");
  const fee = amount ? (parseFloat(amount) * depositFee / 100).toFixed(2) : "0.00";
  const netAmount = amount ? (parseFloat(amount) - parseFloat(fee)).toFixed(2) : "0.00";
  const currentWallet = wallets?.[selectedNetwork];

  const handleDeposit = async () => {
    if (!user || !amount || parseFloat(amount) < minInvestment || !currentWallet) return;
    setSubmitting(true);
    const { error } = await supabase.from("deposits").insert({
      user_id: user.id,
      amount: parseFloat(amount),
      fee: parseFloat(fee),
      net_amount: parseFloat(netAmount),
      network: currentWallet.network,
    });
    if (error) {
      toast.error("Failed to submit deposit");
    } else {
      toast.success("Deposit submitted! Awaiting admin confirmation.");
      setAmount("");
    }
    setSubmitting(false);
  };

  if (loading || !user) return null;

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Deposit USDT</h1>
          <p className="text-muted-foreground mb-8">Send USDT to the wallet address below</p>

          <div className="glass-card rounded-xl p-6 mb-6">
            <h2 className="font-display font-semibold text-foreground mb-4">Select Network</h2>
            <div className="grid grid-cols-2 gap-3">
              {wallets?.map((w, i) => (
                <button key={i} onClick={() => setSelectedNetwork(i)} className={`p-4 rounded-lg border text-left transition-all ${selectedNetwork === i ? "border-primary bg-primary/10" : "border-border bg-secondary hover:border-border/80"}`}>
                  <p className={`text-sm font-medium ${selectedNetwork === i ? "text-primary" : "text-foreground"}`}>{w.network}</p>
                </button>
              ))}
            </div>
          </div>

          {currentWallet && (
            <div className="glass-card rounded-xl p-6 mb-6 gold-border">
              <h2 className="font-display font-semibold text-foreground mb-3">{currentWallet.network} Wallet Address</h2>
              <div className="flex items-center gap-3">
                <div className="flex-1 bg-secondary rounded-lg px-4 py-3 font-mono text-sm text-foreground break-all">{currentWallet.address}</div>
                <Button variant="gold" size="icon" onClick={() => { navigator.clipboard.writeText(currentWallet.address); toast.success("Copied!"); }}>
                  <Copy size={16} />
                </Button>
              </div>
              <div className="flex items-start gap-2 mt-4 text-xs text-muted-foreground">
                <AlertCircle size={14} className="text-primary mt-0.5 shrink-0" />
                <p>Only send USDT on the {currentWallet.network} network.</p>
              </div>
            </div>
          )}

          <div className="glass-card rounded-xl p-6 mb-6">
            <h2 className="font-display font-semibold text-foreground mb-4">Investment Amount</h2>
            <Input type="number" placeholder={`Enter amount (min ${minInvestment} USDT)`} value={amount} onChange={(e) => setAmount(e.target.value)} className="bg-secondary border-border text-lg h-14 font-display" min={minInvestment} />
            {amount && parseFloat(amount) < minInvestment && (
              <p className="text-destructive text-sm mt-2 flex items-center gap-1"><AlertCircle size={14} /> Minimum deposit is {minInvestment} USDT</p>
            )}
            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between"><span className="text-muted-foreground">Deposit Fee ({depositFee}%)</span><span className="text-foreground">${fee} USDT</span></div>
              <div className="flex justify-between border-t border-border/50 pt-2"><span className="text-muted-foreground">Net Investment</span><span className="text-primary font-semibold">${netAmount} USDT</span></div>
            </div>
          </div>

          <Button variant="gold" size="lg" className="w-full" disabled={!amount || parseFloat(amount) < minInvestment || submitting} onClick={handleDeposit}>
            <CheckCircle2 size={18} className="mr-2" /> {submitting ? "Submitting..." : "Confirm Deposit"}
          </Button>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default DepositPage;
