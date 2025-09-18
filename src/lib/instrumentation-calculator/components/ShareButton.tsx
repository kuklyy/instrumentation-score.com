import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger
} from "@/components/ui/tooltip";
import { Share2, Check, Copy } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export function ShareButton() {
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  const handleShare = async () => {
    try {
      const url = window.location.href;

      if (navigator.share) {
        // Use native sharing if available
        await navigator.share({
          title: "My Instrumentation Score",
          text: "Check out my instrumentation score calculation",
          url: url
        });
      } else {
        // Fallback to clipboard
        await navigator.clipboard.writeText(url);
        setCopied(true);

        toast({
          title: "Link copied!",
          description: "The shareable link has been copied to your clipboard.",
        });

        setTimeout(() => setCopied(false), 2000);
      }
    } catch (error) {
      console.error("Failed to share:", error);

      // Fallback: try to copy to clipboard manually
      try {
        await navigator.clipboard.writeText(window.location.href);
        setCopied(true);

        toast({
          title: "Link copied!",
          description: "The shareable link has been copied to your clipboard.",
        });

        setTimeout(() => setCopied(false), 2000);
      } catch (clipboardError) {
        toast({
          title: "Sharing failed",
          description: "Unable to share or copy the link. Please copy the URL manually.",
          variant: "destructive"
        });
      }
    }
  };

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          onClick={handleShare}
          className="border-slate-700 hover:bg-slate-700"
          disabled={copied}
        >
          {copied ? (
            <Check className="h-4 w-4 text-green-500" />
          ) : (
            <Share2 className="h-4 w-4" />
          )}
          <span className="ml-2 hidden sm:inline">
            {copied ? "Copied!" : "Share"}
          </span>
        </Button>
      </TooltipTrigger>
      <TooltipContent>
        <p>Share your score configuration</p>
      </TooltipContent>
    </Tooltip>
  );
}