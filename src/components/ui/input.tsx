import * as React from "react";

import { cn } from "@/lib/utils";
import { type LucideIcon } from "lucide-react";

type InputProps = React.ComponentProps<"input"> & {
  icon?: LucideIcon;
};

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ icon: Icon, ...props }, ref) => {
    if (Icon != null) {
      <div className="relative">
        {Icon != null ? (
          <Icon
            size={16}
            className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground"
          />
        ) : null}
        <BaseInput ref={ref} {...props} />
      </div>;
    }

    return <BaseInput {...props} ref={ref} />;
  },
);
Input.displayName = "Input";

const BaseInput = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input">
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
BaseInput.displayName = "BaseInput";

export { Input };
