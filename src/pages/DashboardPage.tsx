import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import StatCard from "@/components/StatCard";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Wallet, TrendingUp, ArrowDownToLine, ArrowUpFromLine,
  Users, DollarSign, Copy, ExternalLink
} from "lucide-react";

const mockData = {
  balance: "2,500.00",
  deposit: "3,000.00",
  withdrawal: "500.00",
  roi: "250.00",
  referralEarning: "180.00",
  referralCode: "GX8A2F",
  totalReferrals: 12,
  recentTransactions: [
    { type: "ROI", amount: "+25.00", date: "2026-03-04", status: "Credited" },
    { type: "Deposit", amount: "+1,000.00", date: "2026-03-01", status: "Completed" },
    { type: "Referral", amount: "+40.00", date: "2026-02-28", status: "Credited" },
    { type: "Withdrawal", amount: "-200.00", date: "2026-02-25", status: "Approved" },
  ],
};

const DashboardPage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
        >
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Dashboard</h1>
              <p className="text-muted-foreground text-sm mt-1">Welcome back, Investor</p>
            </div>
            <div className="flex gap-3">
              <Button variant="gold" size="sm" asChild>
                <Link to="/deposit"><ArrowDownToLine size={16} className="mr-1" /> Deposit</Link>
              </Button>
              <Button variant="gold-outline" size="sm" asChild>
                <Link to="/withdrawal"><ArrowUpFromLine size={16} className="mr-1" /> Withdraw</Link>
              </Button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            <StatCard icon={<Wallet size={20} />} label="Current Balance" value={`$${mockData.balance}`} subtext="USDT" />
            <StatCard icon={<ArrowDownToLine size={20} />} label="Total Deposit" value={`$${mockData.deposit}`} />
            <StatCard icon={<TrendingUp size={20} />} label="Total ROI Earned" value={`$${mockData.roi}`} subtext="10% Monthly" />
            <StatCard icon={<Users size={20} />} label="Referral Earnings" value={`$${mockData.referralEarning}`} subtext={`${mockData.totalReferrals} referrals`} />
          </div>

          {/* Referral Code */}
          <div className="glass-card rounded-xl p-6 mb-8 gold-border">
            <h2 className="font-display font-semibold text-foreground mb-3">Your Referral Code</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-secondary rounded-lg px-4 py-3 font-mono text-lg text-primary font-bold tracking-wider">
                {mockData.referralCode}
              </div>
              <Button variant="gold-outline" size="icon" onClick={() => navigator.clipboard.writeText(mockData.referralCode)}>
                <Copy size={16} />
              </Button>
              <Button variant="gold" size="sm" asChild>
                <Link to="/referral"><ExternalLink size={14} className="mr-1" /> View Levels</Link>
              </Button>
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-display font-semibold text-foreground mb-4">Recent Transactions</h2>
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
                  {mockData.recentTransactions.map((tx, i) => (
                    <tr key={i} className="border-b border-border/30 last:border-0">
                      <td className="py-3 text-sm text-foreground flex items-center gap-2">
                        <DollarSign size={14} className="text-primary" />
                        {tx.type}
                      </td>
                      <td className={`py-3 text-sm font-medium ${tx.amount.startsWith("+") ? "text-green-400" : "text-red-400"}`}>
                        {tx.amount}
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">{tx.date}</td>
                      <td className="py-3">
                        <span className="text-xs px-2 py-1 rounded-full bg-primary/10 text-primary font-medium">
                          {tx.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </motion.div>
      </div>

      <Footer />
    </div>
  );
};

export default DashboardPage;
