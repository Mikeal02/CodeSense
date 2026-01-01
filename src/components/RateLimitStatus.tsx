import { useState, useEffect } from "react";
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

const RateLimitStatus = ({ githubToken, className }: RateLimitStatusProps) => {
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
    // Refresh every 30 seconds
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
              "h-8 gap-2 text-xs",
              isCritical && "text-destructive",
              isLow && !isCritical && "text-yellow-500",
              !isLow && "text-muted-foreground",
              className
            )}
          >
            {isLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            ) : error ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : isCritical ? (
              <AlertTriangle className="w-3.5 h-3.5" />
            ) : isLow ? (
              <Activity className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-3.5 h-3.5" />
            )}
            {rateLimit && (
              <span>
                {rateLimit.remaining}/{rateLimit.limit}
              </span>
            )}
          </Button>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-xs">
          <div className="space-y-2">
            <div className="font-medium">GitHub API Rate Limit</div>
            {rateLimit ? (
              <>
                <div className="w-full h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className={cn(
                      "h-full transition-all duration-300",
                      isCritical ? "bg-destructive" : isLow ? "bg-yellow-500" : "bg-primary"
                    )}
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <div className="text-xs text-muted-foreground space-y-1">
                  <p>Remaining: {rateLimit.remaining} of {rateLimit.limit}</p>
                  <p>Used: {rateLimit.used} requests</p>
                  {resetTime && (
                    <p>Resets: {resetTime.toLocaleTimeString()}</p>
                  )}
                </div>
                {githubToken ? (
                  <p className="text-xs text-primary">✓ Using authenticated token</p>
                ) : (
                  <p className="text-xs text-muted-foreground">
                    Add a token for 5,000 requests/hour
                  </p>
                )}
              </>
            ) : error ? (
              <p className="text-xs text-destructive">{error}</p>
            ) : null}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default RateLimitStatus;
