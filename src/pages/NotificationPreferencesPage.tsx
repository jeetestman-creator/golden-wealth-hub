import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Bell, Mail, ArrowLeft } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

interface Preferences {
  deposit_confirmed: boolean;
  deposit_rejected: boolean;
  withdrawal_approved: boolean;
  withdrawal_rejected: boolean;
  roi_payout: boolean;
}

const defaultPrefs: Preferences = {
  deposit_confirmed: true,
  deposit_rejected: true,
  withdrawal_approved: true,
  withdrawal_rejected: true,
  roi_payout: true,
};

const NotificationPreferencesPage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [prefs, setPrefs] = useState<Preferences>(defaultPrefs);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) navigate("/login");
  }, [user, loading, navigate]);

  const { data: savedPrefs, isLoading } = useQuery({
    queryKey: ["notification-preferences", user?.id],
    queryFn: async () => {
      const { data } = await supabase
        .from("notification_preferences")
        .select("*")
        .eq("user_id", user!.id)
        .maybeSingle();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (savedPrefs) {
      setPrefs({
        deposit_confirmed: savedPrefs.deposit_confirmed,
        deposit_rejected: savedPrefs.deposit_rejected,
        withdrawal_approved: savedPrefs.withdrawal_approved,
        withdrawal_rejected: savedPrefs.withdrawal_rejected,
        roi_payout: savedPrefs.roi_payout,
      });
    }
  }, [savedPrefs]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    try {
      if (savedPrefs) {
        const { error } = await supabase
          .from("notification_preferences")
          .update(prefs)
          .eq("user_id", user.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from("notification_preferences")
          .insert({ ...prefs, user_id: user.id });
        if (error) throw error;
      }
      toast.success("Notification preferences saved!");
      queryClient.invalidateQueries({ queryKey: ["notification-preferences"] });
    } catch {
      toast.error("Failed to save preferences");
    } finally {
      setSaving(false);
    }
  };

  const togglePref = (key: keyof Preferences) => {
    setPrefs((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  if (loading || !user) return null;

  const prefItems = [
    { key: "deposit_confirmed" as const, label: "Deposit Confirmed", desc: "Receive an email when your deposit is confirmed by admin" },
    { key: "deposit_rejected" as const, label: "Deposit Rejected", desc: "Receive an email when your deposit is rejected" },
    { key: "withdrawal_approved" as const, label: "Withdrawal Approved", desc: "Receive an email when your withdrawal is approved" },
    { key: "withdrawal_rejected" as const, label: "Withdrawal Rejected", desc: "Receive an email when your withdrawal is rejected" },
    { key: "roi_payout" as const, label: "Monthly ROI Payout", desc: "Receive an email when your monthly ROI is credited" },
  ];

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <Button variant="ghost" size="sm" onClick={() => navigate("/profile")} className="mb-4 text-muted-foreground">
            <ArrowLeft size={14} className="mr-1" /> Back to Profile
          </Button>

          <h1 className="text-3xl font-display font-bold text-foreground mb-2 flex items-center gap-3">
            <Bell className="text-primary" size={28} />
            Notification Preferences
          </h1>
          <p className="text-muted-foreground mb-8">Choose which email notifications you'd like to receive. In-app notifications are always enabled.</p>

          <div className="glass-card rounded-xl p-6 mb-6">
            <h2 className="font-display font-semibold text-foreground mb-1 flex items-center gap-2">
              <Mail size={18} className="text-primary" /> Email Notifications
            </h2>
            <p className="text-xs text-muted-foreground mb-6">Toggle off any email notifications you don't want to receive.</p>

            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-secondary/50 rounded-lg animate-pulse" />
                ))}
              </div>
            ) : (
              <div className="space-y-1">
                {prefItems.map((item) => (
                  <div
                    key={item.key}
                    className="flex items-center justify-between p-4 rounded-lg hover:bg-secondary/50 transition-colors"
                  >
                    <div>
                      <p className="text-sm font-medium text-foreground">{item.label}</p>
                      <p className="text-xs text-muted-foreground">{item.desc}</p>
                    </div>
                    <Switch
                      checked={prefs[item.key]}
                      onCheckedChange={() => togglePref(item.key)}
                    />
                  </div>
                ))}
              </div>
            )}
          </div>

          <Button variant="gold" onClick={handleSave} disabled={saving} className="w-full">
            {saving ? "Saving..." : "Save Preferences"}
          </Button>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default NotificationPreferencesPage;
