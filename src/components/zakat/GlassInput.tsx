interface GlassInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  suffix?: string;
  info?: string;
}

const GlassInput = ({ label, value, onChange, suffix, info }: GlassInputProps) => {
  return (
    <div className="space-y-1.5">
      <label className="text-sm font-medium text-foreground/80">{label}</label>
      <div className="relative">
        <input
          type="number"
          min={0}
          value={value || ""}
          onChange={(e) => {
            const val = parseFloat(e.target.value);
            onChange(isNaN(val) || val < 0 ? 0 : val);
          }}
          placeholder="0"
          className="glass-input pr-14"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
      {info && (
        <p className="text-xs text-primary/70">{info}</p>
      )}
    </div>
  );
};

export default GlassInput;
