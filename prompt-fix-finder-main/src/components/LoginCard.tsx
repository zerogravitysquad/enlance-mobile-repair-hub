import { LucideIcon } from "lucide-react";
import { Button } from "./ui/button";

interface LoginCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  onClick: () => void;
  delay?: number;
}

const LoginCard = ({ title, description, icon: Icon, onClick, delay = 0 }: LoginCardProps) => {
  return (
    <div
      className="animate-slide-up opacity-0 group cursor-pointer"
      style={{ animationDelay: `${delay}ms`, animationFillMode: "forwards" }}
      onClick={onClick}
    >
      <div className="relative bg-card rounded-2xl p-8 shadow-card hover:shadow-card-hover transition-all duration-300 hover:-translate-y-2 border border-border/50 overflow-hidden">
        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 gradient-primary opacity-0 group-hover:opacity-5 transition-opacity duration-300" />
        
        <div className="relative z-10">
          <div className="w-16 h-16 rounded-2xl gradient-primary flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
            <Icon className="w-8 h-8 text-primary-foreground" />
          </div>
          
          <h3 className="text-xl font-semibold text-card-foreground mb-2">{title}</h3>
          <p className="text-muted-foreground mb-6">{description}</p>
          
          <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-all duration-300">
            Login as {title.split(" ")[0]}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default LoginCard;
