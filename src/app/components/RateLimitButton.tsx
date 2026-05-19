import React, { useState } from 'react';
import { Button } from '../ui/button';
import { useRateLimit } from '../hooks/useRateLimit';
import { Loader2 } from 'lucide-react';
import { cn } from '../ui/utils';

interface RateLimitButtonProps extends React.ComponentProps<typeof Button> {
  onClick: (event: React.MouseEvent<HTMLButtonElement>) => Promise<any> | void;
  label: string;
  loadingLabel?: string;
  cooldownSeconds?: number;
  icon?: React.ReactNode;
}

/**
 * A professional button component that prevents duplicate clicks and enforces a cooldown.
 */
export function RateLimitButton({
  onClick,
  label,
  loadingLabel = "جاري التنفيذ...",
  cooldownSeconds = 30,
  icon,
  className,
  disabled,
  ...props
}: RateLimitButtonProps) {
  const [loading, setLoading] = useState(false);
  const { cooldown, isCooldown, startCooldown } = useRateLimit(cooldownSeconds);

  const handleClick = async (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || isCooldown) return;

    try {
      setLoading(true);
      const result = await onClick(e);
      
      // We always start cooldown after a successful or failed attempt 
      // if it was a submission action.
      startCooldown();
    } catch (error) {
      console.error("Button execution error:", error);
      // Even on error, we might want a cooldown to prevent spamming failed requests
      startCooldown();
    } finally {
      setLoading(false);
    }
  };

  const getButtonText = () => {
    if (loading) return loadingLabel;
    if (isCooldown) return `انتظر ${cooldown} ثانية`;
    return label;
  };

  return (
    <Button
      {...props}
      onClick={handleClick}
      disabled={disabled || loading || isCooldown}
      className={cn(
        "relative transition-all duration-300",
        isCooldown && "opacity-80 grayscale-[0.5]",
        className
      )}
    >
      {loading ? (
        <Loader2 className="animate-spin mr-2 h-4 w-4" />
      ) : (
        !isCooldown && icon && <span className="ml-2">{icon}</span>
      )}
      <span>{getButtonText()}</span>
    </Button>
  );
}
