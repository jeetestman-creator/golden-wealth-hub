import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Mail, Lock, Eye, EyeOff, User, Phone } from "lucide-react";
import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { lovable } from "@/integrations/lovable";
import { toast } from "sonner";

const SignupPage = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [step, setStep] = useState<"form" | "otp">("form");
  const [otp, setOtp] = useState(["", "", "", "", "", ""]);
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [referralCode, setReferralCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [signupEmail, setSignupEmail] = useState("");
  const navigate = useNavigate();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Look up referrer if referral code provided
    let referredBy: string | undefined;
    if (referralCode) {
      const { data: referrer } = await supabase
        .from("profiles")
        .select("user_id")
        .eq("referral_code", referralCode.toUpperCase())
        .maybeSingle();
      if (referrer) referredBy = referrer.user_id;
    }

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: window.location.origin + "/dashboard",
        data: {
          full_name: fullName,
          phone,
          ...(referredBy && { referred_by: referredBy }),
        },
      },
    });

    if (error) {
      toast.error(error.message);
    } else {
      setSignupEmail(email);
      setStep("otp");
      toast.success("Verification email sent! Check your inbox.");
    }
    setLoading(false);
  };

  const handleOtpVerify = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const token = otp.join("");
    const { error } = await supabase.auth.verifyOtp({
      email: signupEmail,
      token,
      type: "signup",
    });
    if (error) {
      toast.error(error.message);
    } else {
      toast.success("Account verified! Welcome to Gold X USDT!");
      navigate("/dashboard");
    }
    setLoading(false);
  };

  const handleOtpChange = (index: number, value: string) => {
    if (value.length > 1) return;
    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);
    if (value && index < 5) {
      document.getElementById(`otp-${index + 1}`)?.focus();
    }
  };

  const handleGoogleSignup = async () => {
    const result = await lovable.auth.signInWithOAuth("google", {
      redirect_uri: window.location.origin + "/dashboard",
    });
    if (result.error) {
      toast.error("Google signup failed");
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <div className="flex items-center justify-center min-h-screen pt-16 px-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
          <div className="glass-card rounded-2xl p-8 gold-border">
            <div className="text-center mb-8">
              <div className="w-14 h-14 rounded-full gold-gradient flex items-center justify-center font-display font-bold text-primary-foreground text-lg mx-auto mb-4">GX</div>
              <h1 className="text-2xl font-display font-bold text-foreground">
                {step === "form" ? "Create Account" : "Verify Email"}
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {step === "form" ? "Join Gold X USDT and start earning" : "Enter the 6-digit code sent to your email"}
              </p>
            </div>

            {step === "form" ? (
              <form className="space-y-4" onSubmit={handleSignup}>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input placeholder="Full Name" value={fullName} onChange={(e) => setFullName(e.target.value)} className="pl-10 bg-secondary border-border" required />
                </div>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} className="pl-10 bg-secondary border-border" required />
                </div>
                <div className="relative">
                  <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input type="tel" placeholder="Mobile Number" value={phone} onChange={(e) => setPhone(e.target.value)} className="pl-10 bg-secondary border-border" />
                </div>
                <div className="relative">
                  <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                  <Input type={showPassword ? "text" : "password"} placeholder="Password (min 6 chars)" value={password} onChange={(e) => setPassword(e.target.value)} className="pl-10 pr-10 bg-secondary border-border" required minLength={6} />
                  <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
                <Input placeholder="Referral Code (Optional)" value={referralCode} onChange={(e) => setReferralCode(e.target.value)} className="bg-secondary border-border" />
                <Button variant="gold" size="lg" className="w-full" type="submit" disabled={loading}>
                  {loading ? "Creating account..." : "Sign Up"}
                </Button>

                <div className="relative my-6">
                  <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-border" /></div>
                  <div className="relative flex justify-center text-xs"><span className="bg-card px-3 text-muted-foreground">or continue with</span></div>
                </div>

                <Button variant="outline" size="lg" className="w-full" type="button" onClick={handleGoogleSignup}>
                  <svg className="w-4 h-4 mr-2" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  Continue with Google
                </Button>
              </form>
            ) : (
              <form className="space-y-6" onSubmit={handleOtpVerify}>
                <div className="flex justify-center gap-3">
                  {otp.map((digit, i) => (
                    <input
                      key={i}
                      id={`otp-${i}`}
                      type="text"
                      inputMode="numeric"
                      maxLength={1}
                      value={digit}
                      onChange={(e) => handleOtpChange(i, e.target.value)}
                      className="w-12 h-14 text-center text-xl font-display font-bold bg-secondary border border-border rounded-lg text-foreground focus:border-primary focus:ring-1 focus:ring-primary outline-none transition-all"
                    />
                  ))}
                </div>
                <Button variant="gold" size="lg" className="w-full" type="submit" disabled={loading}>
                  {loading ? "Verifying..." : "Verify & Create Account"}
                </Button>
                <p className="text-center text-sm text-muted-foreground">
                  Didn't receive the code? <button type="button" className="text-primary hover:underline" onClick={() => toast.info("Check your email inbox and spam folder")}>Resend</button>
                </p>
              </form>
            )}

            <p className="text-center text-sm text-muted-foreground mt-6">
              Already have an account? <Link to="/login" className="text-primary hover:underline font-medium">Login</Link>
            </p>
          </div>
        </motion.div>
      </div>
    </div>
  );
};

export default SignupPage;
