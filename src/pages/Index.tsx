import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Shield, TrendingUp, Users, Wallet, ArrowRight, Star, Zap, Lock } from "lucide-react";
import heroBg from "@/assets/hero-bg.jpg";

const features = [
  { icon: <TrendingUp size={24} />, title: "10% Monthly ROI", desc: "Earn consistent monthly returns on your gold-backed USDT investment." },
  { icon: <Users size={24} />, title: "4-Level Referral", desc: "Earn up to 8% referral commission across 4 levels of your network." },
  { icon: <Shield size={24} />, title: "Secure Platform", desc: "Advanced encryption and multi-layer security for all transactions." },
  { icon: <Wallet size={24} />, title: "Multi-Wallet", desc: "Support for BEP-20 and TRC-20 USDT deposits and withdrawals." },
];

const plans = [
  { label: "Min Investment", value: "100 USDT" },
  { label: "Max Investment", value: "Unlimited" },
  { label: "Monthly ROI", value: "10%" },
  { label: "Deposit Fee", value: "5%" },
  { label: "Withdrawal Fee", value: "5%" },
  { label: "Compounding", value: "NO" },
];

const referralLevels = [
  { level: 1, percent: "8%" },
  { level: 2, percent: "4%" },
  { level: 3, percent: "2%" },
  { level: 4, percent: "1%" },
];

const fadeUp = {
  hidden: { opacity: 0, y: 30 },
  visible: (i: number) => ({ opacity: 1, y: 0, transition: { delay: i * 0.1, duration: 0.5 } }),
};

const HomePage = () => {
  return (
    <div className="min-h-screen bg-background">
      <Navbar />

      {/* Hero */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0">
          <img src={heroBg} alt="Gold investment" className="w-full h-full object-cover opacity-30" />
          <div className="absolute inset-0 bg-gradient-to-b from-background/80 via-background/60 to-background" />
        </div>
        <div className="absolute inset-0 hero-glow" />

        <div className="container relative z-10 mx-auto px-4 pt-20 text-center">
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <div className="inline-flex items-center gap-2 glass-card rounded-full px-4 py-2 mb-6">
              <Star size={14} className="text-primary" />
              <span className="text-xs font-medium text-muted-foreground">Premium Gold Investment Platform</span>
            </div>
            <h1 className="text-5xl md:text-7xl font-display font-bold mb-6 leading-tight">
              Invest in <span className="gold-text">Gold</span>
              <br />
              Earn in <span className="gold-text">USDT</span>
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto mb-8">
              Start earning 10% monthly ROI with as little as 100 USDT. Backed by gold, powered by blockchain.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button variant="gold" size="xl" asChild>
                <Link to="/signup">
                  Start Investing <ArrowRight size={20} />
                </Link>
              </Button>
              <Button variant="gold-outline" size="xl" asChild>
                <Link to="/login">Login to Dashboard</Link>
              </Button>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16 max-w-3xl mx-auto">
              {[
                { label: "Monthly ROI", value: "10%" },
                { label: "Min Deposit", value: "100 USDT" },
                { label: "Referral Levels", value: "4" },
                { label: "Max Referral", value: "8%" },
              ].map((stat, i) => (
                <motion.div
                  key={stat.label}
                  custom={i}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  className="glass-card rounded-xl p-4"
                >
                  <p className="text-2xl font-display font-bold text-primary">{stat.value}</p>
                  <p className="text-xs text-muted-foreground mt-1">{stat.label}</p>
                </motion.div>
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="text-center mb-16"
          >
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Why Choose <span className="gold-text">Gold X USDT</span>
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              A secure, transparent, and profitable investment platform built for modern investors.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="glass-card-hover rounded-xl p-6"
              >
                <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center text-primary mb-4">
                  {f.icon}
                </div>
                <h3 className="font-display font-semibold text-lg mb-2 text-foreground">{f.title}</h3>
                <p className="text-sm text-muted-foreground">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Investment Plan */}
      <section className="py-24">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Investment <span className="gold-text">Plan</span>
            </h2>
          </div>

          <div className="max-w-lg mx-auto glass-card rounded-2xl p-8 gold-border">
            <div className="text-center mb-6">
              <Zap className="mx-auto text-primary mb-3" size={32} />
              <h3 className="font-display text-2xl font-bold text-foreground">Gold Standard Plan</h3>
            </div>
            <div className="space-y-4">
              {plans.map((p) => (
                <div key={p.label} className="flex justify-between items-center py-3 border-b border-border/50">
                  <span className="text-muted-foreground">{p.label}</span>
                  <span className="font-display font-semibold text-foreground">{p.value}</span>
                </div>
              ))}
            </div>
            <Button variant="gold" size="lg" className="w-full mt-8" asChild>
              <Link to="/signup">Start Investing Now</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Referral */}
      <section className="py-24 bg-card/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
              Referral <span className="gold-text">Commission</span>
            </h2>
            <p className="text-muted-foreground">Earn passive income by building your network</p>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-3xl mx-auto">
            {referralLevels.map((r, i) => (
              <motion.div
                key={r.level}
                custom={i}
                variants={fadeUp}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
                className="glass-card-hover rounded-xl p-6 text-center"
              >
                <p className="text-sm text-muted-foreground mb-2">Level {r.level}</p>
                <p className="text-3xl font-display font-bold text-primary">{r.percent}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Security */}
      <section className="py-24">
        <div className="container mx-auto px-4 text-center">
          <Lock className="mx-auto text-primary mb-6" size={40} />
          <h2 className="text-3xl md:text-4xl font-display font-bold mb-4">
            Your Investment is <span className="gold-text">Secure</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto mb-8">
            We use industry-standard encryption, secure USDT wallets (BEP-20 & TRC-20), 
            and rigorous verification processes to protect your funds at every step.
          </p>
          <Button variant="gold" size="lg" asChild>
            <Link to="/signup">Join Now — It's Free</Link>
          </Button>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default HomePage;
