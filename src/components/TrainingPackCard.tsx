import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Copy, Check } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

interface TrainingPackCardProps {
  name: string;
  creator: string;
  code: string;
  difficulty: "Beginner" | "Intermediate" | "Advanced" | "Expert";
  type: string;
  description: string;
}

const difficultyColors = {
  Beginner: "bg-emerald-500/20 text-emerald-300 border-emerald-500/50",
  Intermediate: "bg-blue-500/20 text-blue-300 border-blue-500/50",
  Advanced: "bg-orange-500/20 text-orange-300 border-orange-500/50",
  Expert: "bg-red-500/20 text-red-300 border-red-500/50",
};

export const TrainingPackCard = ({
  name,
  creator,
  code,
  difficulty,
  type,
  description,
}: TrainingPackCardProps) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    toast({
      title: "Code copied!",
      description: "Training pack code copied to clipboard",
    });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <Card className="group relative overflow-hidden border-border bg-card hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_20px_rgba(59,130,246,0.3)]">
      <div className="p-6 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <h3 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
              {name}
            </h3>
            <p className="text-sm text-muted-foreground">by {creator}</p>
          </div>
          <Badge className={difficultyColors[difficulty]}>{difficulty}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Badge variant="outline" className="border-secondary/50 text-secondary">
            {type}
          </Badge>
        </div>

        <p className="text-sm text-muted-foreground line-clamp-2">{description}</p>

        <div className="pt-4 border-t border-border space-y-3">
          <div className="flex items-center justify-between gap-2">
            <code className="text-xs font-mono bg-muted/50 px-3 py-1.5 rounded border border-border text-primary">
              {code}
            </code>
            <Button
              size="sm"
              variant="ghost"
              onClick={handleCopy}
              className="hover:bg-primary/10 hover:text-primary"
            >
              {copied ? (
                <Check className="h-4 w-4" />
              ) : (
                <Copy className="h-4 w-4" />
              )}
            </Button>
          </div>
        </div>
      </div>

      <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-secondary/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none" />
    </Card>
  );
};
