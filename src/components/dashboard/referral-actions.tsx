"use client";

import { useState } from "react";
import { Copy, Check, MessageCircle, Twitter, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ReferralActionsProps {
  referralCode: string;
  shareUrl: string;
}

export function ReferralActions({
  referralCode,
  shareUrl,
}: ReferralActionsProps) {
  const [codeCopied, setCodeCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);

  const copyCode = async () => {
    await navigator.clipboard.writeText(referralCode);
    setCodeCopied(true);
    toast.success("Referral code copied!");
    setTimeout(() => setCodeCopied(false), 2000);
  };

  const copyLink = async () => {
    await navigator.clipboard.writeText(shareUrl);
    setLinkCopied(true);
    toast.success("Share link copied!");
    setTimeout(() => setLinkCopied(false), 2000);
  };

  const shareWhatsApp = () => {
    const text = encodeURIComponent(
      `🚀 Join Code Hunters and level up your dev skills! Use my referral code: ${referralCode}\n\n${shareUrl}`
    );
    window.open(`https://wa.me/?text=${text}`, "_blank");
  };

  const shareTwitter = () => {
    const text = encodeURIComponent(
      `Join @CodeHunters and start building real-world projects! 🔥\n\nUse my referral code: ${referralCode}`
    );
    window.open(
      `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`,
      "_blank"
    );
  };

  return (
    <div className="space-y-4">
      {/* Referral code */}
      <div className="flex items-center gap-3">
        <div className="flex-1 rounded-lg border border-border bg-background px-4 py-3">
          <p className="text-xs text-muted">Your Code</p>
          <p className="font-mono text-lg font-bold text-primary tracking-wider">
            {referralCode}
          </p>
        </div>
        <Button
          variant="outline"
          size="icon"
          onClick={copyCode}
          className="h-14 w-14 shrink-0"
        >
          {codeCopied ? (
            <Check className="h-5 w-5 text-success" />
          ) : (
            <Copy className="h-5 w-5" />
          )}
        </Button>
      </div>

      {/* Share link */}
      <div className="flex items-center gap-2 overflow-hidden rounded-lg border border-border bg-background px-3 py-2">
        <Link2 className="h-4 w-4 shrink-0 text-muted" />
        <p className="truncate text-xs text-muted flex-1">{shareUrl}</p>
        <button
          onClick={copyLink}
          className="shrink-0 text-xs font-medium text-primary hover:text-primary-hover transition-colors"
        >
          {linkCopied ? "Copied!" : "Copy"}
        </button>
      </div>

      {/* Social share */}
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={shareWhatsApp}
          className="flex-1 gap-2 text-green-500 border-green-500/30 hover:bg-green-500/10"
        >
          <MessageCircle className="h-4 w-4" />
          WhatsApp
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={shareTwitter}
          className="flex-1 gap-2 text-sky-400 border-sky-400/30 hover:bg-sky-400/10"
        >
          <Twitter className="h-4 w-4" />
          Twitter
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={copyLink}
          className="flex-1 gap-2"
        >
          <Copy className="h-4 w-4" />
          Copy Link
        </Button>
      </div>
    </div>
  );
}
