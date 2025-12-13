import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface GlassInputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

const GlassInput = forwardRef<HTMLInputElement, GlassInputProps>(
  ({ className, label, error, leftIcon, rightIcon, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = type === 'password';
    const inputType = isPassword ? (showPassword ? 'text' : 'password') : type;

    return (
      <div className="w-full space-y-2">
        {label && (
          <label className="text-sm font-medium text-foreground/80">
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground">
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            type={inputType}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            className={cn(
              'w-full px-4 py-3 rounded-xl',
              'bg-card/50 border border-border/50',
              'text-foreground placeholder:text-muted-foreground',
              'transition-all duration-300',
              'focus:outline-none focus:border-primary focus:ring-2 focus:ring-primary/20',
              'hover:border-border',
              leftIcon && 'pl-12',
              (rightIcon || isPassword) && 'pr-12',
              error && 'border-destructive focus:border-destructive focus:ring-destructive/20',
              className
            )}
            {...props}
          />
          {(rightIcon || isPassword) && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              {isPassword ? (
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-muted-foreground hover:text-foreground transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              ) : (
                <span className="text-muted-foreground">{rightIcon}</span>
              )}
            </div>
          )}
          {/* Focus glow effect */}
          <motion.div
            className="absolute inset-0 rounded-xl pointer-events-none"
            animate={{
              boxShadow: isFocused
                ? '0 0 0 4px hsl(43 96% 56% / 0.1)'
                : '0 0 0 0px transparent',
            }}
            transition={{ duration: 0.2 }}
          />
        </div>
        {error && (
          <motion.p
            initial={{ opacity: 0, y: -4 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-sm text-destructive"
          >
            {error}
          </motion.p>
        )}
      </div>
    );
  }
);

GlassInput.displayName = 'GlassInput';

export default GlassInput;
