import { ArrowDown } from "lucide-react";

const HeroSection = () => {
  return (
    <section className="relative py-20 px-4 text-center">
      <div className="max-w-3xl mx-auto space-y-6 animate-fade-in-up">
        <div className="inline-flex items-center gap-2 rounded-full border border-border/50 bg-secondary/50 px-4 py-1.5 text-xs font-medium text-muted-foreground backdrop-blur-sm">
          <span className="h-1.5 w-1.5 rounded-full bg-primary animate-pulse" />
          Powered by AI
        </div>

        <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold tracking-tight leading-tight">
          <span className="text-gradient">AI Powered</span>{" "}
          <span className="text-foreground">Zakat Calculator</span>
        </h1>

        <p className="text-lg sm:text-xl text-muted-foreground max-w-xl mx-auto leading-relaxed">
          Calculate your Zakat accurately with real-time metal prices and
          detailed Islamic breakdown.
        </p>

        <button
          onClick={() =>
            document
              .getElementById("calculator")
              ?.scrollIntoView({ behavior: "smooth" })
          }
          className="btn-gradient text-base gap-2 group"
        >
          Calculate Now
          <ArrowDown className="h-4 w-4 transition-transform group-hover:translate-y-0.5" />
        </button>
      </div>
    </section>
  );
};

export default HeroSection;
