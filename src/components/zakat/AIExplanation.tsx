import { Loader2, Sparkles } from "lucide-react";

interface AIExplanationProps {
  explanation: string;
  loading: boolean;
  onFetch: () => void;
  hasResult: boolean;
}

const AIExplanation = ({ explanation, loading, onFetch, hasResult }: AIExplanationProps) => {
  if (!hasResult) return null;

  return (
    <div className="glass-card p-6 sm:p-8 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Sparkles className="h-5 w-5 text-primary" />
          <h3 className="text-lg font-bold text-foreground">AI Explanation</h3>
        </div>
        {!explanation && !loading && (
          <button onClick={onFetch} className="btn-gradient text-xs py-2 px-4">
            Generate
          </button>
        )}
      </div>

      {loading && (
        <div className="flex items-center gap-2 text-muted-foreground text-sm">
          <Loader2 className="h-4 w-4 animate-spin" />
          Generating explanation...
        </div>
      )}

      {explanation && (
        <p className="text-sm text-muted-foreground leading-relaxed whitespace-pre-line">
          {explanation}
        </p>
      )}
    </div>
  );
};

export default AIExplanation;
