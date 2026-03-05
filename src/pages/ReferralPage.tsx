import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { motion } from "framer-motion";
import { Users, Copy, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";

const levels = [
  { level: 1, percent: "8%", members: 5, earned: "400.00" },
  { level: 2, percent: "4%", members: 8, earned: "160.00" },
  { level: 3, percent: "2%", members: 3, earned: "30.00" },
  { level: 4, percent: "1%", members: 0, earned: "0.00" },
];

const referrals = [
  { name: "John D.", level: 1, invested: "500", earned: "40.00", date: "2026-02-15" },
  { name: "Sarah M.", level: 1, invested: "1,000", earned: "80.00", date: "2026-02-20" },
  { name: "Alex K.", level: 2, invested: "200", earned: "8.00", date: "2026-03-01" },
];

const ReferralPage = () => {
  const referralLink = "https://goldxusdt.com/ref/GX8A2F";

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Referral Income</h1>
          <p className="text-muted-foreground mb-8">Build your network and earn passive commission</p>

          {/* Referral Link */}
          <div className="glass-card rounded-xl p-6 mb-8 gold-border">
            <h2 className="font-display font-semibold text-foreground mb-3">Your Referral Link</h2>
            <div className="flex items-center gap-3">
              <div className="flex-1 bg-secondary rounded-lg px-4 py-3 text-sm text-muted-foreground truncate">
                {referralLink}
              </div>
              <Button variant="gold" size="sm" onClick={() => navigator.clipboard.writeText(referralLink)}>
                <Copy size={14} className="mr-1" /> Copy
              </Button>
            </div>
          </div>

          {/* Level Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {levels.map((l, i) => (
              <motion.div
                key={l.level}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0, transition: { delay: i * 0.1 } }}
                className="glass-card-hover rounded-xl p-6 text-center"
              >
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                  <span className="text-primary font-display font-bold text-lg">{l.level}</span>
                </div>
                <p className="text-2xl font-display font-bold text-primary mb-1">{l.percent}</p>
                <p className="text-sm text-muted-foreground">Commission</p>
                <div className="border-t border-border/50 mt-4 pt-4 space-y-1">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Members</span>
                    <span className="text-foreground font-medium">{l.members}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Earned</span>
                    <span className="text-primary font-medium">${l.earned}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Referral Table */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-display font-semibold text-foreground mb-4">Referral History</h2>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                    <th className="pb-3 font-medium">Name</th>
                    <th className="pb-3 font-medium">Level</th>
                    <th className="pb-3 font-medium">Invested</th>
                    <th className="pb-3 font-medium">Commission</th>
                    <th className="pb-3 font-medium">Date</th>
                  </tr>
                </thead>
                <tbody>
                  {referrals.map((r, i) => (
                    <tr key={i} className="border-b border-border/30 last:border-0">
                      <td className="py-3 text-sm text-foreground flex items-center gap-2">
                        <Users size={14} className="text-primary" /> {r.name}
                      </td>
                      <td className="py-3 text-sm">
                        <span className="px-2 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium">
                          Level {r.level}
                        </span>
                      </td>
                      <td className="py-3 text-sm text-muted-foreground">${r.invested}</td>
                      <td className="py-3 text-sm text-green-400 font-medium">+${r.earned}</td>
                      <td className="py-3 text-sm text-muted-foreground">{r.date}</td>
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

export default ReferralPage;
