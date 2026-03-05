import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { motion } from "framer-motion";
import { User, Mail, Phone, Shield, Edit2 } from "lucide-react";
import { useState } from "react";

const ProfilePage = () => {
  const [editing, setEditing] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="container mx-auto px-4 pt-24 pb-12">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto">
          <h1 className="text-3xl font-display font-bold text-foreground mb-8">My Profile</h1>

          {/* Avatar Section */}
          <div className="glass-card rounded-xl p-6 mb-6 flex items-center gap-6">
            <div className="w-20 h-20 rounded-full gold-gradient flex items-center justify-center text-primary-foreground font-display text-2xl font-bold">
              JD
            </div>
            <div>
              <h2 className="text-xl font-display font-bold text-foreground">John Doe</h2>
              <p className="text-sm text-muted-foreground">Member since Feb 2026</p>
              <p className="text-xs text-primary mt-1">Referral Code: GX8A2F</p>
            </div>
          </div>

          {/* Profile Details */}
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
                  {editing ? (
                    <Input defaultValue="John Doe" className="bg-secondary border-border mt-1" />
                  ) : (
                    <p className="text-sm text-foreground">John Doe</p>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Mail size={16} className="text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Email</label>
                  <p className="text-sm text-foreground">john.doe@example.com</p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <Phone size={16} className="text-muted-foreground shrink-0" />
                <div className="flex-1">
                  <label className="text-xs text-muted-foreground">Mobile Number</label>
                  {editing ? (
                    <Input defaultValue="+1 234 567 890" className="bg-secondary border-border mt-1" />
                  ) : (
                    <p className="text-sm text-foreground">+1 234 567 890</p>
                  )}
                </div>
              </div>
            </div>

            {editing && (
              <Button variant="gold" size="sm" className="mt-6">
                Save Changes
              </Button>
            )}
          </div>

          {/* Security */}
          <div className="glass-card rounded-xl p-6">
            <h2 className="font-display font-semibold text-foreground mb-4 flex items-center gap-2">
              <Shield size={18} className="text-primary" /> Security
            </h2>
            <div className="space-y-3">
              <Button variant="gold-outline" size="sm" className="w-full justify-start">
                Change Password
              </Button>
              <Button variant="gold-outline" size="sm" className="w-full justify-start">
                Enable Two-Factor Authentication
              </Button>
            </div>
          </div>
        </motion.div>
      </div>
      <Footer />
    </div>
  );
};

export default ProfilePage;
