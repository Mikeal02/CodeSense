import React, { useState, useEffect, forwardRef } from "react";
import { Activity, AlertTriangle, Check, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "./ui/button";
import { fetchFromGitHubProxy } from "@/lib/githubProxy";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "./ui/tooltip";

interface RateLimitStatusProps {
  githubToken?: string | null;
  className?: string;
}

interface RateLimitData {
  limit: number;
  remaining: number;
  reset: number;
  used: number;
}

const RateLimitStatus = forwardRef<HTMLDivElement, RateLimitStatusProps>(({ githubToken, className }, ref) => {
  const [rateLimit, setRateLimit] = useState<RateLimitData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchRateLimit = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await fetchFromGitHubProxy<{ rate: RateLimitData }>({
        endpoint: "/rate_limit",
        userToken: githubToken,
      });
      setRateLimit(data.rate);
    } catch (err) {
      setError("Failed to fetch");
      console.error("Rate limit fetch error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchRateLimit();
    const interval = setInterval(fetchRateLimit, 30000);
    return () => clearInterval(interval);
  }, [githubToken]);

  if (!rateLimit && !error) {
    return null;
  }

  const percentage = rateLimit ? (rateLimit.remaining / rateLimit.limit) * 100 : 0;
  const isLow = percentage < 20;
  const isCritical = percentage < 5;
  const resetTime = rateLimit ? new Date(rateLimit.reset * 1000) : null;

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={fetchRateLimit}
            disabled={isLoading}
            className={cn(
              "h-7 gap-1.5 text-[10px] rounded-lg",
              isCritical && "text-destructive",
              isLow && !isCritical && "text-warning",
              !isLow && "text-muted-foreground/60",
              className
            )}
          >
            {isLoading ? (
              <RefreshCw className="w-3 h-3 animate-spin" />
            ) : error ? (
              <AlertTriangle className="w-3 h-3" />
            ) : isCritical ? (
              <AlertTriangle className="w-3 h-3" />
            ) : isLow ? (
              <Activity className="w-3 h-3" />
            ) : (
              <Check className="w-3 h-3" />
            )}
            {rateLimit && (
              <span className="font-mono">
                {rateLimit.remaining}/{rateLimit.limit}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-medium text-xs">GitHub API Rate Limit</div>
            {rateLimit ? (
              <>
                <div className="w-full h-1.5 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300 rounded-full",
                      isCritical ? "bg-destructive" : isLow ? "bg-warning" : "bg-primary"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-[10px] text-muted-foreground space-y-0.5">
                  <p>Remaining: {rateLimit.remaining} of {rateLimit.limit}</p>
                  <p>Used: {rateLimit.used} requests</p>
                  {resetTime && <p>Resets: {resetTime.toLocaleTimeString()}</p>}
                </div>
                {githubToken ? (
                  <p className="text-[10px] text-primary">✓ Authenticated token</p>
                ) : (
                  <p className="text-[10px] text-muted-foreground">Add a token for 5,000 req/hr</p>
                )}
              </>
            ) : error ? (
              <p className="text-[10px] text-destructive">{error}</p>
            ) : null}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RateLimitStatus;
