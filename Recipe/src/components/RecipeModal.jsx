import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";
import CookingMode from "./CookingMode";

export default function RecipeModal({ recipeId, onClose }) {
  const [recipe, setRecipe] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cookingMode, setCookingMode] = useState(false);

  useEffect(() => {
    api
      .get(`/api/recipes/${recipeId}`)
      .then((res) => setRecipe(res.data.recipeDetails))
      .catch(() => setError("Failed to load recipe."))
      .finally(() => setLoading(false));
  }, [recipeId]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [onClose]);

  if (cookingMode) {
    return (
      <CookingMode recipeId={recipeId} onClose={() => setCookingMode(false)} />
    );
  }

  const steps = recipe?.analyzedInstructions?.[0]?.steps ?? [];
  const summaryText = recipe?.summary
    ? recipe.summary.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim()
    : "";
  const description = summaryText
    ? summaryText.length > 240
      ? `${summaryText.slice(0, 240).trim()}...`
      : summaryText
    : "";
  const ingredients = recipe?.extendedIngredients ?? [];
  const visibleIngredients = ingredients.slice(0, 8);
  const extraIngredients = Math.max(ingredients.length - visibleIngredients.length, 0);
  const showStartCooking = !loading && !error && steps.length > 0;
  const largeImage = recipe?.image
    ? recipe.image.replace(/-\d+x\d+(?=\.)/, "-636x393")
    : "";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="relative w-full max-w-5xl max-h-[90vh] overflow-hidden rounded-2xl bg-surface text-text-primary border border-border shadow-[0_20px_60px_rgba(0,0,0,0.6)]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Close */}
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 flex h-8 w-8 items-center justify-center rounded-full border border-white/10 bg-black/50 text-white/70 transition-colors hover:text-white"
        >
          <X size={14} />
        </button>

        <div className="max-h-[90vh] overflow-y-auto">
          {loading ? (
            <p className="font-body animate-pulse py-16 text-center text-text-secondary">
              Loading...
            </p>
          ) : error ? (
            <p className="font-body py-16 text-center text-red-400">{error}</p>
          ) : (
            <div className="grid md:grid-cols-[1.1fr_1fr]">
              <div className="order-2 md:order-1 p-8 md:p-10">
                <div className="flex items-center gap-3 text-[11px] uppercase tracking-[0.24em] text-text-muted">
                  <span className="font-semibold">Recipes</span>
                  <span className="h-px flex-1 bg-border" />
                </div>

                <h2 className="mt-4 font-heading text-3xl md:text-4xl font-semibold leading-tight text-text-primary">
                  {recipe.title}
                </h2>

                <div className="mt-6 grid grid-cols-2 gap-6 text-[11px] uppercase tracking-[0.18em] text-text-muted sm:grid-cols-4">
                  {recipe.readyInMinutes != null && (
                    <div>
                      <p>Time</p>
                      <p className="mt-1 text-sm font-semibold tracking-normal text-text-primary">
                        {recipe.readyInMinutes} min
                      </p>
                    </div>
                  )}
                  {recipe.servings != null && (
                    <div>
                      <p>Serves</p>
                      <p className="mt-1 text-sm font-semibold tracking-normal text-text-primary">
                        {recipe.servings}
                      </p>
                    </div>
                  )}
                  {recipe.diets?.length > 0 && (
                    <div>
                      <p>Diet</p>
                      <p className="mt-1 text-sm font-semibold tracking-normal text-text-primary capitalize">
                        {recipe.diets[0]}
                      </p>
                    </div>
                  )}
                  {recipe.dishTypes?.length > 0 && (
                    <div>
                      <p>Type</p>
                      <p className="mt-1 text-sm font-semibold tracking-normal text-text-primary capitalize">
                        {recipe.dishTypes[0]}
                      </p>
                    </div>
                  )}
                </div>

                {description && (
                  <p className="mt-6 text-sm leading-relaxed text-text-secondary">
                    {description}
                  </p>
                )}

                {visibleIngredients.length > 0 && (
                  <div className="mt-6">
                    <p className="text-[11px] uppercase tracking-[0.2em] text-text-muted">
                      Ingredients
                    </p>
                    <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-2 text-sm text-text-secondary">
                      {visibleIngredients.map((ing, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-white/40" />
                          <span className="leading-snug">{ing.original}</span>
                        </li>
                      ))}
                    </ul>
                    {extraIngredients > 0 && (
                      <p className="mt-2 text-xs text-text-muted">
                        + {extraIngredients} more
                      </p>
                    )}
                  </div>
                )}

                {showStartCooking && (
                  <div className="mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setCookingMode(true)}
                      className="border-border text-text-primary hover:bg-surface-hover"
                    >
                      View Recipe -&gt;
                    </Button>
                  </div>
                )}
              </div>

              <div className="order-1 md:order-2 md:border-l md:border-border">
                <div className="h-64 w-full md:h-full">
                  {recipe?.image ? (
                    <img
                      src={largeImage}
                      alt={recipe.title}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-surface-hover text-4xl">
                      🍽️
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
