import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface AdBannerProps {
  slot: string;
  className?: string;
  format?: "auto" | "rectangle" | "horizontal" | "vertical";
}

const AdBanner = ({ slot, className, format = "auto" }: AdBannerProps) => {
  const adRef = useRef<HTMLModElement>(null);
  const pushedRef = useRef(false);

  useEffect(() => {
    if (pushedRef.current || !adRef.current) return;

    try {
      const adsbygoogle = (window as any).adsbygoogle || [];
      adsbygoogle.push({});
      pushedRef.current = true;
    } catch (error) {
      console.error("AdSense push failed:", error);
    }
  }, []);

  return (
    <div className={cn("w-full flex flex-col items-center justify-center", className)}>
      <span className="text-xs text-muted-foreground uppercase tracking-wider mb-2">
        Advertisement
      </span>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{ display: "block", minHeight: "90px", width: "100%" }}
        data-ad-client="ca-pub-2155749617238027"
        data-ad-slot={slot}
        data-ad-format={format}
        data-full-width-responsive="true"
      />
    </div>
  );
};

export default AdBanner;
