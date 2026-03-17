import { Bookmark } from "lucide-react";

export default function RecipeCard({
  recipe,
  isSaved,
  onSave,
  onUnsave,
  onClick,
}) {
  const getDisplayTitle = (title) => {
    if (!title) return "";
    const lower = title.toLowerCase();
    const withIndex = lower.indexOf(" with ");
    if (withIndex === -1) return title;
    return title.slice(0, withIndex).trim();
  };

  const handleBookmark = (e) => {
    e.stopPropagation();
    if (isSaved) {
      onUnsave(recipe.id);
    } else {
      onSave(recipe);
    }
  };

  const hasTime = recipe.readyInMinutes != null;
  const hasServings = recipe.servings != null;

  return (
    <div className="group cursor-pointer select-none" onClick={onClick}>
      <div className="relative overflow-hidden rounded-[18px] border border-white/10 bg-black/40 transition-all duration-300 ease-out group-hover:-translate-y-2 group-hover:scale-[1.02] group-hover:shadow-[0_25px_50px_rgba(0,0,0,0.5)]">
        {/* Image */}
        <div className="relative aspect-[4/3] overflow-hidden">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover transition-transform duration-500 ease-out group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentNode.classList.add(
                  "flex",
                  "items-center",
                  "justify-center",
                  "bg-surface-hover",
                  "text-4xl",
                );
                e.currentTarget.parentNode.textContent = "🍽️";
              }}
            />
          ) : (
            <div className="w-full h-full bg-surface-hover flex items-center justify-center text-4xl">
              🍽️
            </div>
          )}

          {/* Gradient overlay */}
          <div className="absolute inset-0 pointer-events-none bg-[linear-gradient(to_top,rgba(0,0,0,0.85)_0%,rgba(0,0,0,0.55)_40%,rgba(0,0,0,0.15)_70%,transparent_100%)]" />

          {/* Text overlay */}
          <div className="absolute bottom-4 left-4 right-4 z-10 text-left">
            <h3 className="font-body text-[22px] font-bold leading-snug tracking-[-0.3px] text-white line-clamp-2 drop-shadow-[0_4px_12px_rgba(0,0,0,0.6)]">
              {getDisplayTitle(recipe.title)}
            </h3>
            <div className="mt-1.5 flex items-center gap-2 text-[13px] font-body text-white/85">
              {hasTime && <span>⏱ {recipe.readyInMinutes} min</span>}
              {hasTime && hasServings && (
                <span className="text-white/60">•</span>
              )}
              {hasServings && <span>🍽 {recipe.servings} servings</span>}
            </div>
          </div>
        </div>

        {/* Bookmark */}
        <button
          onClick={handleBookmark}
          aria-label={isSaved ? "Unsave recipe" : "Save recipe"}
          className="absolute top-3.5 right-3.5 z-20 rounded-full bg-black/40 p-2 backdrop-blur-md transition-transform duration-200 ease-out hover:scale-110"
        >
          <Bookmark
            size={14}
            className={`transition-colors duration-200 ${
              isSaved
                ? "fill-accent text-accent"
                : "text-white hover:text-accent"
            }`}
          />
        </button>
      </div>
    </div>
  );
}
