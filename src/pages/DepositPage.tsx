import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { Copy, AlertCircle, CheckCircle2 } from "lucide-react";
import { useState } from "react";

const wallets = [
  { network: "BEP-20 (BSC)", address: "0x742d35Cc6634C0532925a3b844Bc9e7595f2bD38" },
  { network: "TRC-20 (TRON)", address: "TLfVYMwLRz5G4QnNWWr2LhFX7xPGKd3vR5" },
];

const DepositPage = () => {
  const [amount, setAmount] = useState("");
  const [selectedNetwork, setSelectedNetwork] = useState(0);
  const fee = amount ? (parseFloat(amount) * 0.05).toFixed(2) : "0.00";
  const netAmount = amount ? (parseFloat(amount) - parseFloat(fee)).toFixed(2) : "0.00";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Deposit USDT</h1>
          <p className="text-muted-foreground mb-8">Send USDT to the wallet address below</p>

          {/* Network Selection */}
          <div className="glass-card rounded-xl p-6 mb-6">
            <h2 className="font-display font-semibold text-foreground mb-4">Select Network</h2>
            <div className="grid grid-cols-2 gap-3">
              {wallets.map((w, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedNetwork(i)}
                  className={`p-4 rounded-lg border text-left transition-all ${
                    selectedNetwork === i
                      ? "border-primary bg-primary/10"
                      : "border-border bg-secondary hover:border-border/80"
                  }`}
                >
                  <p className={`text-sm font-medium ${selectedNetwork === i ? "text-primary" : "text-foreground"}`}>
                    {w.network}
                  </p>
                </button>
              ))}
            </div>
          </div>

          {/* Wallet Address */}
          <div className="glass-card rounded-xl p-6 mb-6 gold-border">
            <h2 className="font-display font-semibold text-foreground mb-3">
              {wallets[selectedNetwork].network} Wallet Address
            </h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-secondary rounded-lg px-4 py-3 font-mono text-sm text-foreground break-all">
                {wallets[selectedNetwork].address}
              </div>
              <Button
                variant="gold"
                size="icon"
                onClick={() => navigator.clipboard.writeText(wallets[selectedNetwork].address)}
              >
                <Copy size={16} />
              </Button>
            </div>
            <div className="flex items-start gap-2 mt-4 text-xs text-muted-foreground">
              <AlertCircle size={14} className="text-primary mt-0.5 shrink-0" />
              <p>Only send USDT on the {wallets[selectedNetwork].network} network. Sending other tokens may result in permanent loss.</p>
            </div>
          </div>

          {/* Amount */}
          <div className="glass-card rounded-xl p-6 mb-6">
            <h2 className="font-display font-semibold text-foreground mb-4">Investment Amount</h2>
            <Input
              type="number"
              placeholder="Enter amount (min 100 USDT)"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="bg-secondary border-border text-lg h-14 font-display"
              min={100}
            />

            {amount && parseFloat(amount) < 100 && (
              <p className="text-destructive text-sm mt-2 flex items-center gap-1">
                <AlertCircle size={14} /> Minimum deposit is 100 USDT
              </p>
            )}

            <div className="mt-4 space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Deposit Fee (5%)</span>
                <span className="text-foreground">${fee} USDT</span>
              </div>
              <div className="flex justify-between border-t border-border/50 pt-2">
                <span className="text-muted-foreground">Net Investment</span>
                <span className="text-primary font-semibold">${netAmount} USDT</span>
              </div>
            </div>
          </div>

          <Button
            variant="gold"
            size="lg"
            className="w-full"
            disabled={!amount || parseFloat(amount) < 100}
          >
            <CheckCircle2 size={18} className="mr-2" />
            Confirm Deposit
          </Button>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default DepositPage;
