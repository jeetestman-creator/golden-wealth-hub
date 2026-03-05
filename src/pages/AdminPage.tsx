import { motion } from "framer-motion";
import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { Users, ArrowDownToLine, ArrowUpFromLine, Search, TrendingUp, LogOut, LayoutDashboard, FileText, Percent } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

type Tab = "dashboard" | "users" | "deposits" | "withdrawals" | "roi" | "referral" | "settings";

const sidebarItems: { key: Tab; label: string; icon: React.ReactNode }[] = [
  { key: "dashboard", label: "Dashboard", icon: <LayoutDashboard size={18} /> },
  { key: "users", label: "Users", icon: <Users size={18} /> },
  { key: "deposits", label: "Deposits", icon: <ArrowDownToLine size={18} /> },
  { key: "withdrawals", label: "Withdrawals", icon: <ArrowUpFromLine size={18} /> },
  { key: "roi", label: "ROI Settings", icon: <TrendingUp size={18} /> },
  { key: "referral", label: "Referral Settings", icon: <Percent size={18} /> },
  { key: "settings", label: "T&C / Privacy", icon: <FileText size={18} /> },
];

const AdminPage = () => {
  const { user, loading, isAdmin, signOut } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [search, setSearch] = useState("");

  useEffect(() => {
    if (!loading && (!user || !isAdmin)) navigate("/dashboard");
  }, [user, loading, isAdmin, navigate]);

  const { data: profiles } = useQuery({
    queryKey: ["admin_profiles"],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*");
      return data ?? [];
    },
    enabled: isAdmin,
  });

  const { data: allDeposits } = useQuery({
    queryKey: ["admin_deposits"],
    queryFn: async () => {
      const { data } = await supabase.from("deposits").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: isAdmin,
  });

  const { data: allWithdrawals } = useQuery({
    queryKey: ["admin_withdrawals"],
    queryFn: async () => {
      const { data } = await supabase.from("withdrawals").select("*").order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: isAdmin,
  });

  const { data: settings } = useQuery({
    queryKey: ["platform_settings"],
    queryFn: async () => {
      const { data } = await supabase.from("platform_settings").select("*");
      const map: Record<string, string> = {};
      data?.forEach(s => { map[s.key] = s.value; });
      return map;
    },
    enabled: isAdmin,
  });

  const [roiValues, setRoiValues] = useState<Record<string, string>>({});
  const [refValues, setRefValues] = useState<Record<string, string>>({});
  const [tcText, setTcText] = useState("");
  const [ppText, setPpText] = useState("");

  useEffect(() => {
    if (settings) {
      setRoiValues({
        monthly_roi: settings.monthly_roi ?? "10",
        min_investment: settings.min_investment ?? "100",
        deposit_fee: settings.deposit_fee ?? "5",
        withdrawal_fee: settings.withdrawal_fee ?? "5",
      });
      setRefValues({
        referral_level_1: settings.referral_level_1 ?? "8",
        referral_level_2: settings.referral_level_2 ?? "4",
        referral_level_3: settings.referral_level_3 ?? "2",
        referral_level_4: settings.referral_level_4 ?? "1",
      });
      setTcText(settings.terms_and_conditions ?? "");
      setPpText(settings.privacy_policy ?? "");
    }
  }, [settings]);

  const updateSetting = async (key: string, value: string) => {
    const { error } = await supabase.from("platform_settings").update({ value }).eq("key", key);
    if (error) toast.error(`Failed to update ${key}`);
  };

  const saveRoiSettings = async () => {
    for (const [key, value] of Object.entries(roiValues)) {
      await updateSetting(key, value);
    }
    toast.success("ROI settings saved!");
    queryClient.invalidateQueries({ queryKey: ["platform_settings"] });
  };

  const saveRefSettings = async () => {
    for (const [key, value] of Object.entries(refValues)) {
      await updateSetting(key, value);
    }
    toast.success("Referral settings saved!");
    queryClient.invalidateQueries({ queryKey: ["platform_settings"] });
  };

  const saveLegalSettings = async () => {
    await updateSetting("terms_and_conditions", tcText);
    await updateSetting("privacy_policy", ppText);
    toast.success("Legal documents saved!");
  };

  const handleDepositAction = async (id: string, status: "confirmed" | "rejected") => {
    const { error } = await supabase.from("deposits").update({ status }).eq("id", id);
    if (error) toast.error("Action failed");
    else { toast.success(`Deposit ${status}`); queryClient.invalidateQueries({ queryKey: ["admin_deposits"] }); }
  };

  const handleWithdrawalAction = async (id: string, status: "approved" | "rejected") => {
    const { error } = await supabase.from("withdrawals").update({ status }).eq("id", id);
    if (error) toast.error("Action failed");
    else { toast.success(`Withdrawal ${status}`); queryClient.invalidateQueries({ queryKey: ["admin_withdrawals"] }); }
  };

  const getUserName = (userId: string) => profiles?.find(p => p.user_id === userId)?.full_name ?? "Unknown";

  if (loading || !isAdmin) return null;

  const filteredProfiles = profiles?.filter(p =>
    !search || p.full_name?.toLowerCase().includes(search.toLowerCase()) || p.email?.toLowerCase().includes(search.toLowerCase())
  );

  const totalDeposits = allDeposits?.filter(d => d.status === "confirmed").reduce((s, d) => s + Number(d.net_amount), 0) ?? 0;
  const totalWithdrawals = allWithdrawals?.filter(w => w.status === "approved" || w.status === "completed").reduce((s, w) => s + Number(w.amount), 0) ?? 0;

  return (
    <div className="min-h-screen bg-background flex">
      <aside className="w-64 border-r border-border/50 bg-card/50 p-4 hidden md:flex flex-col">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center font-display font-bold text-primary-foreground text-sm">GX</div>
          <span className="font-display font-bold gold-text">Admin Panel</span>
        </div>
        <nav className="flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <button key={item.key} onClick={() => setActiveTab(item.key)} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${activeTab === item.key ? "bg-primary/10 text-primary" : "text-muted-foreground hover:text-foreground hover:bg-secondary"}`}>
              {item.icon}{item.label}
            </button>
          ))}
        </nav>
        <button onClick={() => { signOut(); navigate("/"); }} className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive transition-all mt-4">
          <LogOut size={18} />Logout
        </button>
      </aside>

      <main className="flex-1 p-6 overflow-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {activeTab === "dashboard" && (
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-6">Admin Dashboard</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                  { label: "Total Users", value: String(profiles?.length ?? 0), icon: <Users size={20} /> },
                  { label: "Total Deposits", value: `$${totalDeposits.toFixed(2)}`, icon: <ArrowDownToLine size={20} /> },
                  { label: "Total Withdrawals", value: `$${totalWithdrawals.toFixed(2)}`, icon: <ArrowUpFromLine size={20} /> },
                  { label: "Pending Withdrawals", value: String(allWithdrawals?.filter(w => w.status === "pending").length ?? 0), icon: <TrendingUp size={20} /> },
                ].map((s) => (
                  <div key={s.label} className="glass-card rounded-xl p-5">
                    <div className="flex items-start justify-between">
                      <div><p className="text-sm text-muted-foreground">{s.label}</p><p className="text-2xl font-display font-bold text-foreground mt-1">{s.value}</p></div>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">{s.icon}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === "users" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-display font-bold text-foreground">Manage Users</h1>
                <div className="relative w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10 bg-secondary border-border" />
                </div>
              </div>
              <div className="glass-card rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                      <th className="p-4 font-medium">Name</th><th className="p-4 font-medium">Email</th><th className="p-4 font-medium">Phone</th><th className="p-4 font-medium">Referral Code</th><th className="p-4 font-medium">Joined</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredProfiles?.map((u) => (
                      <tr key={u.id} className="border-b border-border/30">
                        <td className="p-4 text-sm text-foreground">{u.full_name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                        <td className="p-4 text-sm text-muted-foreground">{u.phone || "-"}</td>
                        <td className="p-4 text-sm text-primary font-mono">{u.referral_code}</td>
                        <td className="p-4 text-sm text-muted-foreground">{u.created_at.slice(0, 10)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "deposits" && (
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-6">Deposit Requests</h1>
              <div className="glass-card rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                      <th className="p-4 font-medium">User</th><th className="p-4 font-medium">Amount</th><th className="p-4 font-medium">Network</th><th className="p-4 font-medium">Date</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allDeposits?.map((d) => (
                      <tr key={d.id} className="border-b border-border/30">
                        <td className="p-4 text-sm text-foreground">{getUserName(d.user_id)}</td>
                        <td className="p-4 text-sm text-foreground font-medium">${Number(d.amount).toFixed(2)}</td>
                        <td className="p-4 text-sm text-muted-foreground">{d.network}</td>
                        <td className="p-4 text-sm text-muted-foreground">{d.created_at.slice(0, 10)}</td>
                        <td className="p-4"><span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${d.status === "confirmed" ? "bg-green-500/10 text-green-400" : d.status === "pending" ? "bg-yellow-500/10 text-yellow-400" : "bg-red-500/10 text-red-400"}`}>{d.status}</span></td>
                        <td className="p-4">
                          {d.status === "pending" && (
                            <div className="flex gap-2">
                              <Button variant="gold" size="sm" onClick={() => handleDepositAction(d.id, "confirmed")}>Approve</Button>
                              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDepositAction(d.id, "rejected")}>Reject</Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "withdrawals" && (
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-6">Withdrawal Requests</h1>
              <div className="glass-card rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                      <th className="p-4 font-medium">User</th><th className="p-4 font-medium">Amount</th><th className="p-4 font-medium">Wallet</th><th className="p-4 font-medium">Network</th><th className="p-4 font-medium">Date</th><th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {allWithdrawals?.map((w) => (
                      <tr key={w.id} className="border-b border-border/30">
                        <td className="p-4 text-sm text-foreground">{getUserName(w.user_id)}</td>
                        <td className="p-4 text-sm text-foreground font-medium">${Number(w.amount).toFixed(2)}</td>
                        <td className="p-4 text-sm font-mono text-muted-foreground">{w.wallet_address.slice(0, 10)}...</td>
                        <td className="p-4 text-sm text-muted-foreground">{w.network}</td>
                        <td className="p-4 text-sm text-muted-foreground">{w.created_at.slice(0, 10)}</td>
                        <td className="p-4">
                          {w.status === "pending" && (
                            <div className="flex gap-2">
                              <Button variant="gold" size="sm" onClick={() => handleWithdrawalAction(w.id, "approved")}>Approve</Button>
                              <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleWithdrawalAction(w.id, "rejected")}>Reject</Button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {activeTab === "roi" && (
            <div className="max-w-xl">
              <h1 className="text-2xl font-display font-bold text-foreground mb-6">ROI Settings</h1>
              <div className="glass-card rounded-xl p-6 space-y-4">
                {[
                  { key: "monthly_roi", label: "Monthly ROI (%)" },
                  { key: "min_investment", label: "Minimum Investment (USDT)" },
                  { key: "deposit_fee", label: "Deposit Fee (%)" },
                  { key: "withdrawal_fee", label: "Withdrawal Fee (%)" },
                ].map(f => (
                  <div key={f.key}>
                    <label className="text-sm text-muted-foreground mb-2 block">{f.label}</label>
                    <Input value={roiValues[f.key] ?? ""} onChange={(e) => setRoiValues(v => ({ ...v, [f.key]: e.target.value }))} className="bg-secondary border-border" />
                  </div>
                ))}
                <Button variant="gold" className="mt-4" onClick={saveRoiSettings}>Save Settings</Button>
              </div>
            </div>
          )}

          {activeTab === "referral" && (
            <div className="max-w-xl">
              <h1 className="text-2xl font-display font-bold text-foreground mb-6">Referral Commission Settings</h1>
              <div className="glass-card rounded-xl p-6 space-y-4">
                {[1, 2, 3, 4].map(level => (
                  <div key={level}>
                    <label className="text-sm text-muted-foreground mb-2 block">Level {level} Commission (%)</label>
                    <Input value={refValues[`referral_level_${level}`] ?? ""} onChange={(e) => setRefValues(v => ({ ...v, [`referral_level_${level}`]: e.target.value }))} className="bg-secondary border-border" />
                  </div>
                ))}
                <Button variant="gold" className="mt-4" onClick={saveRefSettings}>Save Commission Rates</Button>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="max-w-3xl">
              <h1 className="text-2xl font-display font-bold text-foreground mb-6">Terms & Privacy Policy</h1>
              <div className="glass-card rounded-xl p-6 space-y-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Terms & Conditions</label>
                  <textarea value={tcText} onChange={(e) => setTcText(e.target.value)} className="w-full h-48 bg-secondary border border-border rounded-lg p-4 text-sm text-foreground resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Privacy Policy</label>
                  <textarea value={ppText} onChange={(e) => setPpText(e.target.value)} className="w-full h-48 bg-secondary border border-border rounded-lg p-4 text-sm text-foreground resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none" />
                </div>
                <Button variant="gold" onClick={saveLegalSettings}>Save Changes</Button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminPage;
