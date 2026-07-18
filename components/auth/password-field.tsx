"use client";

import * as React from "react";
import { Lock, Eye, EyeOff } from "lucide-react";
import { AuthInput, type AuthInputProps } from "./auth-input";

export type PasswordFieldProps = Omit<AuthInputProps, "icon" | "rightSlot" | "type"> & {
  /** Override the default Lock icon. */
  icon?: React.ReactNode;
};

export const PasswordField = React.forwardRef<HTMLInputElement, PasswordFieldProps>(
  ({ icon, ...props }, ref) => {
    const [show, setShow] = React.useState(false);

    return (
      <AuthInput
        ref={ref}
        type={show ? "text" : "password"}
        dir="ltr"
        icon={icon ?? <Lock className="h-5 w-5" />}
        rightSlot={
          <button
            type="button"
            onClick={() => setShow((s) => !s)}
            tabIndex={-1}
            aria-label={show ? "پنهان کردن رمز" : "نمایش رمز"}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            {show ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        }
        {...props}
      />
    );
  }
);
PasswordField.displayName = "PasswordField";
