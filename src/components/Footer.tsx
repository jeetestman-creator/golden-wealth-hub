import { Link } from "react-router-dom";

const Footer = () => {
  return (
    <footer className="border-t border-border/50 bg-card/50 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 rounded-full gold-gradient flex items-center justify-center font-display font-bold text-primary-foreground text-sm">
                GX
              </div>
              <span className="font-display font-bold text-lg gold-text">Gold X USDT</span>
            </div>
            <p className="text-sm text-muted-foreground">
              Premium gold investment platform powered by USDT. Earn monthly ROI with our secure investment plans.
            </p>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Quick Links</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/" className="hover:text-primary transition-colors">Home</Link></li>
              <li><Link to="/dashboard" className="hover:text-primary transition-colors">Dashboard</Link></li>
              <li><Link to="/referral" className="hover:text-primary transition-colors">Referral Program</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Investment</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/deposit" className="hover:text-primary transition-colors">Deposit</Link></li>
              <li><Link to="/withdrawal" className="hover:text-primary transition-colors">Withdrawal</Link></li>
              <li><Link to="/signup" className="hover:text-primary transition-colors">Get Started</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">Legal</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link to="/terms" className="hover:text-primary transition-colors">Terms & Conditions</Link></li>
              <li><Link to="/privacy" className="hover:text-primary transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>
        </div>
        <div className="border-t border-border/50 mt-8 pt-8 text-center text-sm text-muted-foreground">
          © {new Date().getFullYear()} Gold X USDT. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;
