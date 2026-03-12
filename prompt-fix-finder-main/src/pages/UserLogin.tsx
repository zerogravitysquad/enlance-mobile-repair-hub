import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Mail, Lock, Eye, EyeOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Logo from "@/components/Logo";
import { useToast } from "@/hooks/use-toast";

const UserLogin = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Demo users data
    const users: Record<string, { password: string; name: string; avatar: string; city: string }> = {
      "santhosh@gmail.com": { password: "santhosh", name: "Santhosh", avatar: "S", city: "Coimbatore" },
      "vidhyasagar@gmail.com": { password: "vidhyasagar", name: "Vidhyasagar", avatar: "V", city: "Coimbatore" },
    };
    
    const user = users[formData.email];
    
    if (user && user.password === formData.password) {
      // Set current user in localStorage
      localStorage.setItem(
        "enlance_current_user",
        JSON.stringify({ userId: `user_${user.name.toLowerCase()}`, userName: user.name, userAvatar: user.avatar, city: user.city })
      );
      toast({
        title: "Login Successful",
        description: `Welcome back, ${user.name}!`,
      });
      navigate("/user/dashboard");
    } else if (formData.email && formData.password) {
      toast({
        title: "Invalid Credentials",
        description: "Try santhosh@gmail.com/santhosh or vidhyasagar@gmail.com/vidhyasagar",
        variant: "destructive",
      });
    } else {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="min-h-screen bg-background flex">
      {/* Left Side - Form */}
      <div className="flex-1 flex flex-col justify-center px-8 md:px-16 lg:px-24">
        <div className="max-w-md w-full mx-auto">
          <Button
            variant="ghost"
            className="mb-8 -ml-4"
            onClick={() => navigate("/")}
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Home
          </Button>

          <div className="mb-8 animate-fade-in">
            <Logo size="md" />
            <h1 className="text-3xl font-bold text-foreground mt-6 mb-2">
              Welcome Back
            </h1>
            <p className="text-muted-foreground">
              Sign in to your account to continue
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6 animate-slide-up">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  className="pl-10"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
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
                  onChange={(e) =>
                    setFormData({ ...formData, password: e.target.value })
                  }
                />
                <button
                  type="button"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <Button type="submit" size="lg" className="w-full">
              Sign In
            </Button>

            <p className="text-center text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/user/register"
                className="text-primary font-medium hover:underline"
              >
                Register Now
              </Link>
            </p>
          </form>
        </div>
      </div>

      {/* Right Side - Decorative */}
      <div className="hidden lg:flex flex-1 gradient-hero items-center justify-center p-16">
        <div className="text-center text-primary-foreground max-w-md">
          <div className="w-24 h-24 mx-auto mb-8 rounded-3xl bg-primary-foreground/20 flex items-center justify-center animate-float">
            <svg
              className="w-12 h-12"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h2 className="text-3xl font-bold mb-4">Get Your Device Fixed</h2>
          <p className="text-primary-foreground/80">
            Upload your mobile issue, connect with verified repair shops, and track
            your repair in real-time. It's that simple!
          </p>
        </div>
      </div>
    </div>
  );
};

export default UserLogin;
