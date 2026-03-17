import { useState, useEffect } from "react";
import RecipeCard from "@/components/RecipeCard";
import RecipeModal from "@/components/RecipeModal";
import api from "@/api/axios";

export default function SavedRecipes() {
  const [recipes, setRecipes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [cookingRecipeId, setCookingRecipeId] = useState(null);

  useEffect(() => {
    api
      .get("/api/saved")
      .then((res) => setRecipes(res.data.recipes ?? []))
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const handleUnsave = async (spoonacularId) => {
    try {
      await api.delete(`/api/saved/${spoonacularId}`);
      setRecipes((prev) =>
        prev.filter((r) => r.spoonacular_id !== spoonacularId),
      );
    } catch (err) {
      console.error("Failed to unsave recipe", err);
    }
  };

  // Normalize DB row shape → RecipeCard shape
  const normalized = recipes.map((r) => ({
    id: r.spoonacular_id,
    title: r.title,
    image: r.image_url,
    readyInMinutes: r.ready_in_minutes,
    servings: r.servings,
    diets: [],
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-text-secondary font-body animate-pulse">
          Loading saved recipes…
        </p>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <h1 className="font-heading text-4xl md:text-5xl text-text-primary mb-10">
          Saved Recipes
        </h1>

        {normalized.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-28 text-center">
            <p className="text-text-secondary font-body text-lg mb-2">
              No saved recipes yet.
            </p>
            <p className="text-text-muted font-body text-sm">
              Search for recipes and bookmark the ones you love.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {normalized.map((recipe) => (
              <RecipeCard
                key={recipe.id}
                recipe={recipe}
                isSaved={true}
                onSave={() => {}}
                onUnsave={handleUnsave}
                onClick={() => setCookingRecipeId(recipe.id)}
              />
            ))}
          </div>
        )}
      </div>

      {cookingRecipeId && (
        <RecipeModal
          recipeId={cookingRecipeId}
          onClose={() => setCookingRecipeId(null)}
        />
      )}
    </main>
  );
}
