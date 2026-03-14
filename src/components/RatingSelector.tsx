const ratingLabels: Record<number, { label: string; color: string; bg: string; border: string }> = {
  1: { label: "Insatisfatório", color: "text-red-600", bg: "bg-red-50", border: "border-red-300" },
  2: { label: "Precisa Melhorar", color: "text-orange-600", bg: "bg-orange-50", border: "border-orange-300" },
  3: { label: "Atende Parcialmente", color: "text-yellow-600", bg: "bg-yellow-50", border: "border-yellow-300" },
  4: { label: "Atende Plenamente", color: "text-blue-600", bg: "bg-blue-50", border: "border-blue-300" },
  5: { label: "Supera Expectativas", color: "text-green-600", bg: "bg-green-50", border: "border-green-300" },
};

interface RatingSelectorProps {
  value: number | null;
  onChange: (value: number) => void;
}

const RatingSelector = ({ value, onChange }: RatingSelectorProps) => {
  return (
    <div className="flex flex-wrap gap-2">
      {[1, 2, 3, 4, 5].map((rating) => {
        const isSelected = value === rating;
        const meta = ratingLabels[rating];
        return (
          <button
            key={rating}
            type="button"
            onClick={() => onChange(rating)}
            className={`flex items-center gap-2 px-3 py-2 rounded-xl border text-sm font-medium transition-all duration-150 ${
              isSelected
                ? `${meta.bg} ${meta.border} ${meta.color} shadow-sm scale-105`
                : "bg-muted/40 border-border text-muted-foreground hover:bg-secondary hover:border-primary/20"
            }`}
          >
            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
              isSelected ? `${meta.bg} ${meta.color} border ${meta.border}` : "bg-background border border-border text-foreground"
            }`}>
              {rating}
            </span>
            <span className="hidden sm:inline">{meta.label}</span>
          </button>
        );
      })}
    </div>
  );
};

export { ratingLabels };
export default RatingSelector;
