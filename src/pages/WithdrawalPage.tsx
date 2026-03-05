import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { AlertCircle, ArrowUpFromLine, Clock } from "lucide-react";
import { useState } from "react";

const pendingRequests = [
  { amount: "200.00", date: "2026-03-03", status: "Pending" },
  { amount: "300.00", date: "2026-02-20", status: "Approved" },
];

const WithdrawalPage = () => {
  const [amount, setAmount] = useState("");
  const [walletAddress, setWalletAddress] = useState("");
  const [network, setNetwork] = useState("BEP-20");
  const fee = amount ? (parseFloat(amount) * 0.05).toFixed(2) : "0.00";
  const netAmount = amount ? (parseFloat(amount) - parseFloat(fee)).toFixed(2) : "0.00";

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
                    <button
                      key={n}
                      onClick={() => setNetwork(n)}
                      className={`p-3 rounded-lg border text-sm font-medium transition-all ${
                        network === n
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-border bg-secondary text-foreground hover:border-border/80"
                      }`}
                    >
                      {n}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Your USDT Wallet Address</label>
                <Input
                  placeholder="Enter your wallet address"
                  value={walletAddress}
                  onChange={(e) => setWalletAddress(e.target.value)}
                  className="bg-secondary border-border font-mono"
                />
              </div>

              <div>
                <label className="text-sm text-muted-foreground mb-2 block">Amount (USDT)</label>
                <Input
                  type="number"
                  placeholder="Enter withdrawal amount"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="bg-secondary border-border text-lg h-14 font-display"
                />
              </div>

              {amount && (
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Withdrawal Fee (5%)</span>
                    <span className="text-foreground">${fee}</span>
                  </div>
                  <div className="flex justify-between border-t border-border/50 pt-2">
                    <span className="text-muted-foreground">You'll Receive</span>
                    <span className="text-primary font-semibold">${netAmount} USDT</span>
                  </div>
                </div>
              )}

              <div className="flex items-start gap-2 text-xs text-muted-foreground">
                <AlertCircle size={14} className="text-primary mt-0.5 shrink-0" />
                <p>Withdrawals are processed within 24-48 hours after admin approval.</p>
              </div>
            </div>

            <Button variant="gold" size="lg" className="w-full mt-6" disabled={!amount || !walletAddress}>
              <ArrowUpFromLine size={18} className="mr-2" />
              Submit Withdrawal Request
            </Button>
          </div>

          {/* Pending Requests */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-display font-semibold text-foreground mb-4">Withdrawal History</h2>
            <div className="space-y-3">
              {pendingRequests.map((r, i) => (
                <div key={i} className="flex items-center justify-between p-4 bg-secondary rounded-lg">
                  <div className="flex items-center gap-3">
                    <Clock size={16} className="text-muted-foreground" />
                    <div>
                      <p className="text-sm font-medium text-foreground">${r.amount} USDT</p>
                      <p className="text-xs text-muted-foreground">{r.date}</p>
                    </div>
                  </div>
                  <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                    r.status === "Pending"
                      ? "bg-yellow-500/10 text-yellow-400"
                      : "bg-green-500/10 text-green-400"
                  }`}>
                    {r.status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default WithdrawalPage;
