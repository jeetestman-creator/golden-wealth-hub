import { motion } from "framer-motion";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Users, DollarSign, ArrowDownToLine, ArrowUpFromLine,
  Search, Settings, Shield, TrendingUp, LogOut, LayoutDashboard,
  FileText, Percent
} from "lucide-react";

const mockUsers = [
  { id: 1, name: "John Doe", email: "john@example.com", phone: "+1234567890", balance: "2,500", status: "Active" },
  { id: 2, name: "Sarah Miller", email: "sarah@example.com", phone: "+0987654321", balance: "1,200", status: "Active" },
  { id: 3, name: "Alex Kim", email: "alex@example.com", phone: "+1122334455", balance: "800", status: "Suspended" },
];

const mockWithdrawals = [
  { id: 1, user: "John Doe", amount: "200.00", wallet: "0x742d...bD38", network: "BEP-20", status: "Pending", date: "2026-03-03" },
  { id: 2, user: "Sarah Miller", amount: "500.00", wallet: "TLfV...3vR5", network: "TRC-20", status: "Pending", date: "2026-03-04" },
];

const mockDeposits = [
  { id: 1, user: "Alex Kim", amount: "1,000.00", network: "BEP-20", status: "Confirmed", date: "2026-03-01" },
  { id: 2, user: "John Doe", amount: "500.00", network: "TRC-20", status: "Pending", date: "2026-03-04" },
];

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
  const [activeTab, setActiveTab] = useState<Tab>("dashboard");
  const [search, setSearch] = useState("");

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar */}
      <aside className="w-64 border-r border-border/50 bg-card/50 p-4 hidden md:flex flex-col">
        <div className="flex items-center gap-2 mb-8 px-2">
          <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center font-display font-bold text-primary-foreground text-sm">
            GX
          </div>
          <span className="font-display font-bold gold-text">Admin Panel</span>
        </div>

        <nav className="flex-1 space-y-1">
          {sidebarItems.map((item) => (
            <button
              key={item.key}
              onClick={() => setActiveTab(item.key)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                activeTab === item.key
                  ? "bg-primary/10 text-primary"
                  : "text-muted-foreground hover:text-foreground hover:bg-secondary"
              }`}
            >
              {item.icon}
              {item.label}
            </button>
          ))}
        </nav>

        <button className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-muted-foreground hover:text-destructive transition-all mt-4">
          <LogOut size={18} />
          Logout
        </button>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-6 overflow-auto">
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          {/* Dashboard Tab */}
          {activeTab === "dashboard" && (
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-6">Admin Dashboard</h1>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Users", value: "1,247", icon: <Users size={20} /> },
                  { label: "Total Deposits", value: "$125,400", icon: <ArrowDownToLine size={20} /> },
                  { label: "Total Withdrawals", value: "$45,200", icon: <ArrowUpFromLine size={20} /> },
                  { label: "Active ROI", value: "$8,500/mo", icon: <TrendingUp size={20} /> },
                ].map((s) => (
                  <div key={s.label} className="glass-card rounded-xl p-5">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-muted-foreground">{s.label}</p>
                        <p className="text-2xl font-display font-bold text-foreground mt-1">{s.value}</p>
                      </div>
                      <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary">
                        {s.icon}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div>
              <div className="flex items-center justify-between mb-6">
                <h1 className="text-2xl font-display font-bold text-foreground">Manage Users</h1>
                <div className="relative w-64">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    placeholder="Search users..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    className="pl-10 bg-secondary border-border"
                  />
                </div>
              </div>
              <div className="glass-card rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                      <th className="p-4 font-medium">Name</th>
                      <th className="p-4 font-medium">Email</th>
                      <th className="p-4 font-medium">Phone</th>
                      <th className="p-4 font-medium">Balance</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockUsers.map((u) => (
                      <tr key={u.id} className="border-b border-border/30">
                        <td className="p-4 text-sm text-foreground">{u.name}</td>
                        <td className="p-4 text-sm text-muted-foreground">{u.email}</td>
                        <td className="p-4 text-sm text-muted-foreground">{u.phone}</td>
                        <td className="p-4 text-sm text-foreground font-medium">${u.balance}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            u.status === "Active" ? "bg-green-500/10 text-green-400" : "bg-red-500/10 text-red-400"
                          }`}>
                            {u.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button variant="ghost" size="sm">Edit</Button>
                            <Button variant="ghost" size="sm" className="text-destructive">Suspend</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Deposits Tab */}
          {activeTab === "deposits" && (
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-6">Deposit Requests</h1>
              <div className="glass-card rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                      <th className="p-4 font-medium">User</th>
                      <th className="p-4 font-medium">Amount</th>
                      <th className="p-4 font-medium">Network</th>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Status</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockDeposits.map((d) => (
                      <tr key={d.id} className="border-b border-border/30">
                        <td className="p-4 text-sm text-foreground">{d.user}</td>
                        <td className="p-4 text-sm text-foreground font-medium">${d.amount}</td>
                        <td className="p-4 text-sm text-muted-foreground">{d.network}</td>
                        <td className="p-4 text-sm text-muted-foreground">{d.date}</td>
                        <td className="p-4">
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                            d.status === "Confirmed" ? "bg-green-500/10 text-green-400" : "bg-yellow-500/10 text-yellow-400"
                          }`}>
                            {d.status}
                          </span>
                        </td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button variant="gold" size="sm">Approve</Button>
                            <Button variant="ghost" size="sm" className="text-destructive">Reject</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Withdrawals Tab */}
          {activeTab === "withdrawals" && (
            <div>
              <h1 className="text-2xl font-display font-bold text-foreground mb-6">Withdrawal Requests</h1>
              <div className="glass-card rounded-xl overflow-hidden">
                <table className="w-full">
                  <thead>
                    <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                      <th className="p-4 font-medium">User</th>
                      <th className="p-4 font-medium">Amount</th>
                      <th className="p-4 font-medium">Wallet</th>
                      <th className="p-4 font-medium">Network</th>
                      <th className="p-4 font-medium">Date</th>
                      <th className="p-4 font-medium">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {mockWithdrawals.map((w) => (
                      <tr key={w.id} className="border-b border-border/30">
                        <td className="p-4 text-sm text-foreground">{w.user}</td>
                        <td className="p-4 text-sm text-foreground font-medium">${w.amount}</td>
                        <td className="p-4 text-sm font-mono text-muted-foreground">{w.wallet}</td>
                        <td className="p-4 text-sm text-muted-foreground">{w.network}</td>
                        <td className="p-4 text-sm text-muted-foreground">{w.date}</td>
                        <td className="p-4">
                          <div className="flex gap-2">
                            <Button variant="gold" size="sm">Approve</Button>
                            <Button variant="ghost" size="sm" className="text-destructive">Reject</Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ROI Settings */}
          {activeTab === "roi" && (
            <div className="max-w-xl">
              <h1 className="text-2xl font-display font-bold text-foreground mb-6">ROI Settings</h1>
              <div className="glass-card rounded-xl p-6 space-y-4">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Monthly ROI (%)</label>
                  <Input defaultValue="10" className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Minimum Investment (USDT)</label>
                  <Input defaultValue="100" className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Deposit Fee (%)</label>
                  <Input defaultValue="5" className="bg-secondary border-border" />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Withdrawal Fee (%)</label>
                  <Input defaultValue="5" className="bg-secondary border-border" />
                </div>
                <Button variant="gold" className="mt-4">Save Settings</Button>
              </div>
            </div>
          )}

          {/* Referral Settings */}
          {activeTab === "referral" && (
            <div className="max-w-xl">
              <h1 className="text-2xl font-display font-bold text-foreground mb-6">Referral Commission Settings</h1>
              <div className="glass-card rounded-xl p-6 space-y-4">
                {[1, 2, 3, 4].map((level) => (
                  <div key={level}>
                    <label className="text-sm text-muted-foreground mb-2 block">Level {level} Commission (%)</label>
                    <Input
                      defaultValue={level === 1 ? "8" : level === 2 ? "4" : level === 3 ? "2" : "1"}
                      className="bg-secondary border-border"
                    />
                  </div>
                ))}
                <Button variant="gold" className="mt-4">Save Commission Rates</Button>
              </div>
            </div>
          )}

          {/* T&C / Privacy */}
          {activeTab === "settings" && (
            <div className="max-w-3xl">
              <h1 className="text-2xl font-display font-bold text-foreground mb-6">Terms & Privacy Policy</h1>
              <div className="glass-card rounded-xl p-6 space-y-6">
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Terms & Conditions</label>
                  <textarea
                    className="w-full h-48 bg-secondary border border-border rounded-lg p-4 text-sm text-foreground resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    defaultValue="Enter your terms and conditions here..."
                  />
                </div>
                <div>
                  <label className="text-sm text-muted-foreground mb-2 block">Privacy Policy</label>
                  <textarea
                    className="w-full h-48 bg-secondary border border-border rounded-lg p-4 text-sm text-foreground resize-none focus:border-primary focus:ring-1 focus:ring-primary outline-none"
                    defaultValue="Enter your privacy policy here..."
                  />
                </div>
                <Button variant="gold">Save Changes</Button>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};

export default AdminPage;
