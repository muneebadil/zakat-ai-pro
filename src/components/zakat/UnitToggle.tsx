interface UnitToggleProps {
  unit: "gram" | "tola";
  onChange: (unit: "gram" | "tola") => void;
}

const UnitToggle = ({ unit, onChange }: UnitToggleProps) => {
  return (
    <div className="flex rounded-xl bg-secondary/50 p-0.5 w-fit">
      {(["gram", "tola"] as const).map((u) => (
        <button
          key={u}
          onClick={() => onChange(u)}
          className={`rounded-lg px-4 py-1.5 text-xs font-medium transition-all duration-200 ${
            unit === u
              ? "bg-primary/20 text-primary shadow-sm"
              : "text-muted-foreground hover:text-foreground"
          }`}
        >
          {u === "gram" ? "Gram" : "Tola"}
        </button>
      ))}
    </div>
  );
};

export default UnitToggle;
