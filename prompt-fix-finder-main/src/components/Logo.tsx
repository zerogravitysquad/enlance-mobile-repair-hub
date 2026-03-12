import { Smartphone } from "lucide-react";

interface LogoProps {
  variant?: "default" | "white";
  size?: "sm" | "md" | "lg";
}

const Logo = ({ variant = "default", size = "md" }: LogoProps) => {
  const sizeClasses = {
    sm: "text-xl",
    md: "text-2xl",
    lg: "text-4xl",
  };

  const iconSizes = {
    sm: 20,
    md: 28,
    lg: 40,
  };

  return (
    <div className="flex items-center gap-2">
      <div
        className={`flex items-center justify-center rounded-xl p-2 ${
          variant === "white"
            ? "bg-primary-foreground/20"
            : "gradient-primary"
        }`}
      >
        <Smartphone
          size={iconSizes[size]}
          className={variant === "white" ? "text-primary-foreground" : "text-primary-foreground"}
        />
      </div>
      <span
        className={`font-bold tracking-tight ${sizeClasses[size]} ${
          variant === "white" ? "text-primary-foreground" : "text-foreground"
        }`}
      >
        ENLANCE
      </span>
    </div>
  );
};

export default Logo;
