import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { ArrowDownToLine, ArrowUpFromLine, TrendingUp, Filter, ChevronLeft, ChevronRight } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { format } from "date-fns";

type TransactionItem = {
  id: string;
  type: "deposit" | "withdrawal" | "roi";
  amount: number;
  netAmount?: number;
  fee?: number;
  status: string;
  date: string;
  network?: string;
  walletAddress?: string;
  forMonth?: string;
};

const statusColors: Record<string, string> = {
  pending: "bg-yellow-500/10 text-yellow-400",
  confirmed: "bg-green-500/10 text-green-400",
  approved: "bg-green-500/10 text-green-400",
  completed: "bg-green-500/10 text-green-400",
  rejected: "bg-destructive/10 text-destructive",
  paid: "bg-green-500/10 text-green-400",
};

const typeIcons = {
  deposit: <ArrowDownToLine size={14} />,
  withdrawal: <ArrowUpFromLine size={14} />,
  roi: <TrendingUp size={14} />,
};

const TransactionHistoryPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [currentPage, setCurrentPage] = useState(1);
  const PAGE_SIZE = 10;

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  const { data: deposits } = useQuery({
    queryKey: ["deposits", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("deposits").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
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

  const { data: roiPayouts } = useQuery({
    queryKey: ["roi_payouts", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("roi_payouts").select("*").eq("user_id", user!.id).order("created_at", { ascending: false });
      return data ?? [];
    },
    enabled: !!user,
  });

  if (loading) return <div className="min-h-screen bg-background flex items-center justify-center"><p className="text-muted-foreground">Loading...</p></div>;
  if (!user) return null;

  const allTransactions: TransactionItem[] = [
    ...(deposits?.map(d => ({
      id: d.id,
      type: "deposit" as const,
      amount: Number(d.amount),
      netAmount: Number(d.net_amount),
      fee: Number(d.fee),
      status: d.status,
      date: d.created_at,
      network: d.network,
    })) ?? []),
    ...(withdrawals?.map(w => ({
      id: w.id,
      type: "withdrawal" as const,
      amount: Number(w.amount),
      netAmount: Number(w.net_amount),
      fee: Number(w.fee),
      status: w.status,
      date: w.created_at,
      network: w.network,
      walletAddress: w.wallet_address,
    })) ?? []),
    ...(roiPayouts?.map(r => ({
      id: r.id,
      type: "roi" as const,
      amount: Number(r.amount),
      status: "paid",
      date: r.created_at,
      forMonth: r.for_month,
    })) ?? []),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filterTx = (txs: TransactionItem[]) =>
    statusFilter === "all" ? txs : txs.filter(t => t.status === statusFilter);

  const renderTable = (transactions: TransactionItem[]) => {
    const filtered = filterTx(transactions);
    if (filtered.length === 0) {
      return <p className="text-muted-foreground text-sm py-8 text-center">No transactions found.</p>;
    }
    const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
    const page = Math.min(currentPage, totalPages);
    const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

    return (
      <div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-muted-foreground border-b border-border/50">
                <th className="pb-3 font-medium">Type</th>
                <th className="pb-3 font-medium">Amount</th>
                <th className="pb-3 font-medium">Net</th>
                <th className="pb-3 font-medium">Fee</th>
                <th className="pb-3 font-medium">Date</th>
                <th className="pb-3 font-medium">Details</th>
                <th className="pb-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(tx => (
                <tr key={tx.id} className="border-b border-border/30 last:border-0 hover:bg-secondary/30 transition-colors">
                  <td className="py-3 text-sm text-foreground">
                    <span className="flex items-center gap-2">
                      <span className="text-primary">{typeIcons[tx.type]}</span>
                      <span className="capitalize">{tx.type === "roi" ? "ROI Payout" : tx.type}</span>
                    </span>
                  </td>
                  <td className={`py-3 text-sm font-medium ${tx.type === "withdrawal" ? "text-red-400" : "text-green-400"}`}>
                    {tx.type === "withdrawal" ? "-" : "+"}${tx.amount.toFixed(2)}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {tx.netAmount !== undefined ? `$${tx.netAmount.toFixed(2)}` : "—"}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {tx.fee !== undefined && tx.fee > 0 ? `$${tx.fee.toFixed(2)}` : "—"}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground">
                    {format(new Date(tx.date), "MMM dd, yyyy HH:mm")}
                  </td>
                  <td className="py-3 text-sm text-muted-foreground max-w-[150px] truncate">
                    {tx.network && <span className="text-xs bg-secondary px-2 py-0.5 rounded mr-1">{tx.network}</span>}
                    {tx.forMonth && <span className="text-xs bg-secondary px-2 py-0.5 rounded">{tx.forMonth}</span>}
                    {tx.walletAddress && <span className="text-xs font-mono">{tx.walletAddress.slice(0, 10)}…</span>}
                  </td>
                  <td className="py-3">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium capitalize ${statusColors[tx.status] ?? "bg-secondary text-muted-foreground"}`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground">
              Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, filtered.length)} of {filtered.length}
            </p>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                disabled={page <= 1}
                onClick={() => setCurrentPage(p => p - 1)}
              >
                <ChevronLeft size={14} className="mr-1" /> Prev
              </Button>
              {Array.from({ length: totalPages }, (_, i) => i + 1)
                .filter(p => p === 1 || p === totalPages || Math.abs(p - page) <= 1)
                .map((p, idx, arr) => (
                  <span key={p}>
                    {idx > 0 && arr[idx - 1] !== p - 1 && <span className="text-muted-foreground text-xs px-1">…</span>}
                    <Button
                      variant={p === page ? "gold" : "ghost"}
                      size="sm"
                      className="w-8 h-8 p-0"
                      onClick={() => setCurrentPage(p)}
                    >
                      {p}
                    </Button>
                  </span>
                ))}
              <Button
                variant="ghost"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setCurrentPage(p => p + 1)}
              >
                Next <ChevronRight size={14} className="ml-1" />
              </Button>
            </div>
          </div>
        )}
      </div>
    );
  };

  const depositTxs = allTransactions.filter(t => t.type === "deposit");
  const withdrawalTxs = allTransactions.filter(t => t.type === "withdrawal");
  const roiTxs = allTransactions.filter(t => t.type === "roi");

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-3xl font-display font-bold text-foreground">Transaction History</h1>
              <p className="text-muted-foreground text-sm mt-1">View all your deposits, withdrawals, and ROI payouts</p>
            </div>
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-muted-foreground" />
              <Select value={statusFilter} onValueChange={setStatusFilter}>
                <SelectTrigger className="w-[140px] h-9 text-sm">
                  <SelectValue placeholder="Filter status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Statuses</SelectItem>
                  <SelectItem value="pending">Pending</SelectItem>
                  <SelectItem value="confirmed">Confirmed</SelectItem>
                  <SelectItem value="approved">Approved</SelectItem>
                  <SelectItem value="rejected">Rejected</SelectItem>
                  <SelectItem value="paid">Paid</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-muted-foreground text-xs mb-1">Total Deposits</p>
              <p className="text-lg font-bold text-green-400">{depositTxs.length}</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-muted-foreground text-xs mb-1">Total Withdrawals</p>
              <p className="text-lg font-bold text-red-400">{withdrawalTxs.length}</p>
            </div>
            <div className="glass-card rounded-xl p-4 text-center">
              <p className="text-muted-foreground text-xs mb-1">ROI Payouts</p>
              <p className="text-lg font-bold text-primary">{roiTxs.length}</p>
            </div>
          </div>

          <Tabs defaultValue="all" className="glass-card rounded-xl p-6">
            <TabsList className="mb-4">
              <TabsTrigger value="all">All ({allTransactions.length})</TabsTrigger>
              <TabsTrigger value="deposits">Deposits ({depositTxs.length})</TabsTrigger>
              <TabsTrigger value="withdrawals">Withdrawals ({withdrawalTxs.length})</TabsTrigger>
              <TabsTrigger value="roi">ROI ({roiTxs.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all">{renderTable(allTransactions)}</TabsContent>
            <TabsContent value="deposits">{renderTable(depositTxs)}</TabsContent>
            <TabsContent value="withdrawals">{renderTable(withdrawalTxs)}</TabsContent>
            <TabsContent value="roi">{renderTable(roiTxs)}</TabsContent>
          </Tabs>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default TransactionHistoryPage;
