import { useNavigate } from "react-router-dom";
import { User, Store, MapPin, MessageSquare, Shield, Clock } from "lucide-react";
import Logo from "@/components/Logo";
import LoginCard from "@/components/LoginCard";
import FeatureCard from "@/components/FeatureCard";

const Landing = () => {
  const navigate = useNavigate();

  const features = [
    {
      icon: MapPin,
      title: "Find Nearby Shops",
      description: "Connect with verified repair shops in your area instantly",
    },
    {
      icon: MessageSquare,
      title: "Secure Chat",
      description: "Communicate directly with shopkeepers about your repair needs",
    },
    {
      icon: Shield,
      title: "Verified Experts",
      description: "All repair shops are verified for quality and trust",
    },
    {
      icon: Clock,
      title: "Real-Time Tracking",
      description: "Track your repair status from request to completion",
    },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        {/* Background gradient */}
        <div className="absolute inset-0 gradient-hero opacity-90" />
        
        {/* Decorative circles */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-primary-foreground/10 rounded-full blur-3xl" />
        <div className="absolute bottom-10 right-10 w-96 h-96 bg-secondary/20 rounded-full blur-3xl" />
        
        <div className="relative z-10 container mx-auto px-4 py-8">
          {/* Header */}
          <header className="flex items-center justify-between mb-16 animate-fade-in">
            <Logo variant="white" size="md" />
            <nav className="hidden md:flex items-center gap-6">
              <a href="#features" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">Features</a>
              <a href="#about" className="text-primary-foreground/80 hover:text-primary-foreground transition-colors">About</a>
            </nav>
          </header>

          {/* Hero Content */}
          <div className="text-center py-16 md:py-24">
            <h1 
              className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6 animate-slide-up opacity-0"
              style={{ animationDelay: "100ms", animationFillMode: "forwards" }}
            >
              Real-Time Mobile Repair
              <br />
              <span className="text-primary-foreground/80">& Service Tracker</span>
            </h1>
            
            <p 
              className="text-lg md:text-xl text-primary-foreground/80 max-w-2xl mx-auto mb-12 animate-slide-up opacity-0"
              style={{ animationDelay: "200ms", animationFillMode: "forwards" }}
            >
              Connect with verified mobile repair experts near you. Upload your issue, 
              get instant quotes, and track your repair in real-time.
            </p>

            {/* Login Cards */}
            <div className="grid md:grid-cols-2 gap-6 max-w-2xl mx-auto">
              <LoginCard
                title="User Login"
                description="Submit repair requests and track your mobile repairs"
                icon={User}
                onClick={() => navigate("/user/login")}
                delay={300}
              />
              <LoginCard
                title="Shopkeeper Login"
                description="Manage repair requests and connect with customers"
                icon={Store}
                onClick={() => navigate("/shopkeeper/login")}
                delay={400}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Features Section */}
      <section id="features" className="py-20 bg-background">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Why Choose ENLANCE?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Experience seamless mobile repair services with our comprehensive platform
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <FeatureCard
                key={feature.title}
                {...feature}
                delay={500 + index * 100}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-border">
        <div className="container mx-auto px-4 text-center">
          <Logo size="sm" />
          <p className="text-muted-foreground text-sm mt-4">
            © 2024 ENLANCE. All rights reserved. | Real-Time Mobile Repair Tracker
          </p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
