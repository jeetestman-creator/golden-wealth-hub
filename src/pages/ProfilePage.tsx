import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { User, Mail, Phone, Shield, Edit2 } from "lucide-react";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";

const ProfilePage = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [fullName, setFullName] = useState("");
  const [phone, setPhone] = useState("");

  useEffect(() => { if (!loading && !user) navigate("/login"); }, [user, loading, navigate]);

  const { data: profile } = useQuery({
    queryKey: ["profile", user?.id],
    queryFn: async () => {
      const { data } = await supabase.from("profiles").select("*").eq("user_id", user!.id).single();
      return data;
    },
    enabled: !!user,
  });

  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name ?? "");
      setPhone(profile.phone ?? "");
    }
  }, [profile]);

  const handleSave = async () => {
    if (!user) return;
    const { error } = await supabase.from("profiles").update({ full_name: fullName, phone }).eq("user_id", user.id);
    if (error) {
      toast.error("Failed to update profile");
    } else {
      toast.success("Profile updated!");
      setEditing(false);
      queryClient.invalidateQueries({ queryKey: ["profile"] });
    }
  };

  if (loading || !user) return null;

  const initials = (profile?.full_name ?? "U").split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-display font-bold text-foreground mb-8">My Profile</h1>

          <div className="glass-card rounded-xl p-6 mb-6 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-display text-2xl font-bold">{initials}</div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">{profile?.full_name || "User"}</h2>
              <p className="text-sm text-muted-foreground">Member since {profile?.created_at?.slice(0, 7)}</p>
              <p className="text-xs text-primary mt-1">Referral Code: {profile?.referral_code}</p>
            </div>
          </div>

          <div className="glass-card rounded-xl p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display font-semibold text-foreground">Personal Information</h2>
              <Button variant="gold-outline" size="sm" onClick={() => setEditing(!editing)}>
                <Edit2 size={14} className="mr-1" /> {editing ? "Cancel" : "Edit"}
              </Button>
            </div>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <User size={16} className="text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Full Name</label>
                  {editing ? <Input value={fullName} onChange={(e) => setFullName(e.target.value)} className="bg-secondary border-border mt-1" /> : <p className="text-sm text-foreground">{profile?.full_name}</p>}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Mail size={16} className="text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Email</label>
                  <p className="text-sm text-foreground">{profile?.email}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Phone size={16} className="text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Mobile Number</label>
                  {editing ? <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="bg-secondary border-border mt-1" /> : <p className="text-sm text-foreground">{profile?.phone || "Not set"}</p>}
                </div>
              </div>
            </div>
            {editing && <Button variant="gold" size="sm" className="mt-6" onClick={handleSave}>Save Changes</Button>}
          </div>

          <div className="glass-card rounded-xl p-6">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2"><Shield size={18} className="text-primary" /> Security</h2>
            <div className="space-y-3">
              <Button variant="gold-outline" size="sm" className="w-full justify-start">Change Password</Button>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
