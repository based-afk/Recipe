import { Bookmark, ArrowRight } from "lucide-react";

export default function RecipeCard({ recipe, isSaved, onSave, onUnsave, onClick }) {
  const handleBookmark = (e) => {
    e.stopPropagation();
    if (isSaved) {
      onUnsave(recipe.id);
    } else {
      onSave(recipe);
    }
  };

  const handleViewClick = (e) => {
    e.stopPropagation();
    onClick();
  };

  const ingredientPreview = [
    ...(recipe.usedIngredients || []),
    ...(recipe.missedIngredients || []),
  ].slice(0, 5);

  return (
    <div className="group bg-surface rounded-lg overflow-hidden shadow-md shadow-black/40 hover:shadow-xl hover:shadow-black/60 transition-all duration-300 hover:-translate-y-0.5 animate-in fade-in duration-500">
      <div className="flex h-[210px]">

        {/* ── Left: text content ── */}
        <div className="flex flex-col justify-between p-5 w-[55%] min-w-0">
          <div className="min-w-0">
            {/* Section overline */}
            <p className="text-accent text-[9px] font-body font-semibold tracking-[0.18em] uppercase mb-2">
              Recipes
            </p>

            {/* Title */}
            <h3 className="font-heading text-text-primary text-lg font-bold leading-tight line-clamp-2 mb-3">
              {recipe.title}
            </h3>

            {/* Metadata columns */}
            <div className="flex gap-4 mb-3">
              {recipe.readyInMinutes != null && (
                <div>
                  <p className="text-text-muted text-[9px] uppercase tracking-wide mb-0.5">Time</p>
                  <p className="text-text-secondary text-[11px] font-semibold">{recipe.readyInMinutes} min</p>
                </div>
              )}
              {recipe.servings != null && (
                <div>
                  <p className="text-text-muted text-[9px] uppercase tracking-wide mb-0.5">Serves</p>
                  <p className="text-text-secondary text-[11px] font-semibold">{recipe.servings}</p>
                </div>
              )}
              {recipe.diets && recipe.diets.length > 0 && (
                <div className="min-w-0">
                  <p className="text-text-muted text-[9px] uppercase tracking-wide mb-0.5">Diet</p>
                  <p className="text-text-secondary text-[11px] font-semibold capitalize truncate">
                    {recipe.diets[0]}
                  </p>
                </div>
              )}
            </div>

            {/* Ingredient description */}
            {ingredientPreview.length > 0 && (
              <p className="text-text-muted text-[10px] font-body leading-relaxed line-clamp-2">
                {ingredientPreview.map((ing) => ing.name).join(", ")}
              </p>
            )}
          </div>

          {/* CTA */}
          <button
            onClick={handleViewClick}
            className="flex items-center gap-1.5 w-fit text-[10px] font-body font-semibold tracking-[0.12em] uppercase border border-border text-text-secondary hover:border-accent hover:text-accent px-3 py-1.5 rounded transition-colors duration-200 active:scale-95"
          >
            View Recipe
            <ArrowRight size={11} />
          </button>
        </div>

        {/* ── Right: image ── */}
        <div className="relative flex-1 overflow-hidden">
          {recipe.image ? (
            <img
              src={recipe.image}
              alt={recipe.title}
              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
              onError={(e) => {
                e.currentTarget.style.display = "none";
                e.currentTarget.parentNode.classList.add(
                  "flex", "items-center", "justify-center", "bg-surface-hover", "text-4xl"
                );
                e.currentTarget.parentNode.textContent = "🍽️";
              }}
            />
          ) : (
            <div className="w-full h-full bg-surface-hover flex items-center justify-center text-4xl">
              🍽️
            </div>
          )}

          {/* Bookmark overlay */}
          <button
            onClick={handleBookmark}
            aria-label={isSaved ? "Unsave recipe" : "Save recipe"}
            className="absolute top-2.5 right-2.5 z-10 p-1.5 rounded-full bg-black/50 hover:bg-black/75 transition-colors active:scale-90"
          >
            <Bookmark
              size={14}
              className={`transition-colors duration-200 ${
                isSaved ? "fill-accent text-accent" : "text-white hover:text-accent"
              }`}
            />
          </button>
        </div>

      </div>
    </div>
  );
}
