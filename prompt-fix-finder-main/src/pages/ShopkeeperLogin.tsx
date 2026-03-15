import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "@/lib/api";
import { ArrowLeft, Mail, Lock, Eye, EyeOff, ExternalLink, Store } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";

const ShopkeeperLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      const data = await authAPI.login({
        email: formData.email,
        password: formData.password,
      });

      if (data.success) {
        // Save token and user info
        localStorage.setItem("enlance_token", data.data.token);
        localStorage.setItem(
          "enlance_current_shop",
          JSON.stringify({
            shopId: data.data._id,
            shopName: data.data.name,
            shopAvatar: data.data.name?.charAt(0).toUpperCase(),
            shopRating: 4.8,
            shopLocation: data.data.locationLink || "",
          })
        );

        toast({
          title: "Login Successful",
          description: `Welcome back, ${data.data.name}!`,
        });
        navigate("/shopkeeper/dashboard");
      } else {
        toast({
          title: "Login Failed",
          description: data.message || "Invalid email or password",
          variant: "destructive",
        });
      }
    } catch (error: any) {
      toast({
        title: "Login Failed",
        description: error.message || "Cannot connect to server.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const registrationFormUrl =
    "https://docs.google.com/forms/d/1Ii0pJthkTPfAyxfS_sN1Sbc9WX51X1X0yuOk49l0o1s/preview";


  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24 py-12">
        <div className="max-w-md w-full mx-auto">
          <Button variant="ghost" className="mb-8 -ml-4" onClick={() => navigate("/")}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="mb-8 animate-fade-in">
            <Logo size="md" />
            <h1 className="text-3xl font-bold text-foreground mt-6 mb-2">Shopkeeper Login</h1>
            <p className="text-muted-foreground">Access your repair shop dashboard</p>
          </div>

          {/* Registration Notice */}
          <div className="mb-8 p-4 rounded-xl bg-primary/5 border border-primary/20 animate-slide-up">
            <div className="flex items-start gap-3">
              <Store className="h-5 w-5 text-primary mt-0.5" />
              <div className="w-full">
                <p className="font-medium text-foreground mb-2">New Shopkeeper?</p>
                <p className="text-sm text-muted-foreground mb-3">
                  New shopkeepers must register first using the form below. Include your Google Maps location URL for customers to find you.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  asChild
                  className="transition-all duration-300 hover:bg-primary hover:text-primary-foreground hover:border-primary hover:shadow-lg hover:scale-105"
                >
                  <a
                    href={registrationFormUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Open Shopkeeper Registration Form in new tab"
                  >
                    Register Your Shop
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
                <p className="text-xs text-muted-foreground mt-3 italic">
                  If the form does not open, please contact admin.
                </p>
              </div>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up" style={{ animationDelay: "100ms" }}>
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your shop email"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  disabled={isLoading}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  className="pl-10 pr-10"
                  value={formData.password}
                  onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                  disabled={isLoading}
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full" disabled={isLoading}>
              {isLoading ? "Signing In..." : "Sign In to Dashboard"}
            </Button>
          </form>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-16">
        <div className="text-center text-primary-foreground max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-primary-foreground/20 flex items-center justify-center animate-float">
            <Store className="w-12 h-12" />
          </div>
          <h2 className="text-3xl font-bold mb-4">Grow Your Repair Business</h2>
          <p className="text-primary-foreground/80">
            Connect with customers looking for mobile repair services. Receive requests, send quotes, and build your reputation.
          </p>

          <div className="mt-8 grid grid-cols-3 gap-4 text-center">
            <div className="p-4 rounded-xl bg-primary-foreground/10">
              <div className="text-2xl font-bold">500+</div>
              <div className="text-sm text-primary-foreground/70">Active Users</div>
            </div>
            <div className="p-4 rounded-xl bg-primary-foreground/10">
              <div className="text-2xl font-bold">50+</div>
              <div className="text-sm text-primary-foreground/70">Verified Shops</div>
            </div>
            <div className="p-4 rounded-xl bg-primary-foreground/10">
              <div className="text-2xl font-bold">4.8</div>
              <div className="text-sm text-primary-foreground/70">Avg Rating</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShopkeeperLogin;
