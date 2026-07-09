import * as React from "react";
import { AlertCircle, CheckCircle2 } from "lucide-react";

import { cn } from "@/lib/utils";

interface AlertProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: "error" | "success";
}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant = "error", children, ...props }, ref) => {
    const Icon = variant === "error" ? AlertCircle : CheckCircle2;
    return (
      <div
        ref={ref}
        role="alert"
        className={cn(
          "flex items-start gap-2 rounded-md border px-3 py-2 text-sm",
          variant === "error"
            ? "border-loss/30 bg-loss/10 text-loss"
            : "border-success/30 bg-success/10 text-success",
          className
        )}
        {...props}
      >
        <Icon className="mt-0.5 h-4 w-4 shrink-0" />
        <span>{children}</span>
      </div>
    );
  }
);
Alert.displayName = "Alert";

export { Alert };
