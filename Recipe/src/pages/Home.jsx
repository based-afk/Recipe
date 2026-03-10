import { useState, useEffect, useMemo } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import RecipeCard from "@/components/RecipeCard";
import SkeletonCard from "@/components/SkeletonCard";
import CookingMode from "@/components/CookingMode";
import api from "@/api/axios";
import { X, Clock, TrendingUp, ChevronRight } from "lucide-react";

const DIETS = ["vegetarian", "vegan", "gluten free", "dairy free"];

const POPULAR_INGREDIENTS = [
  "eggs",
  "chicken",
  "tomato",
  "garlic",
  "onion",
  "pasta",
  "rice",
  "cheese",
  "potato",
  "spinach",
  "mushroom",
  "lemon",
];

const TRENDING_SEARCHES = [
  {
    label: "Pasta Night",
    emoji: "🍝",
    ingredients: ["pasta", "tomato", "garlic"],
  },
  {
    label: "Healthy Breakfast",
    emoji: "🍳",
    ingredients: ["eggs", "spinach", "cheese"],
  },
  {
    label: "Asian Stir Fry",
    emoji: "🥡",
    ingredients: ["chicken", "garlic", "onion"],
  },
  {
    label: "Comfort Soup",
    emoji: "🍲",
    ingredients: ["potato", "onion", "carrot"],
  },
];

const SORT_OPTIONS = [
  { value: "none", label: "Most Relevant" },
  { value: "cooking_time", label: "Cooking Time" },
  { value: "rating", label: "Rating" },
  { value: "popularity", label: "Popularity" },
];

const LS_KEY = "recipe-recent-searches";

function loadRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(LS_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(ingredients) {
  if (!ingredients.length) return;
  const label = ingredients.join(", ");
  const prev = loadRecentSearches().filter((r) => r !== label);
  localStorage.setItem(LS_KEY, JSON.stringify([label, ...prev].slice(0, 5)));
}

export default function Home() {
  const [inputValue, setInputValue] = useState("");
  const [ingredients, setIngredients] = useState([]);
  const [diets, setDiets] = useState([]);
  const [recipes, setRecipes] = useState([]);
  const [searching, setSearching] = useState(false);
  const [searchError, setSearchError] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [savedIds, setSavedIds] = useState(new Set());
  const [cookingRecipeId, setCookingRecipeId] = useState(null);
  const [sortBy, setSortBy] = useState("none");
  const [recentSearches, setRecentSearches] = useState(loadRecentSearches);

  useEffect(() => {
    api
      .get("/api/saved")
      .then((res) => {
        const ids = new Set(
          (res.data.recipes ?? []).map((r) => r.spoonacular_id),
        );
        setSavedIds(ids);
      })
      .catch(() => {});
  }, []);

  const addIngredient = (val) => {
    const v = (val ?? inputValue).trim().toLowerCase();
    if (v && !ingredients.includes(v)) {
      setIngredients((prev) => [...prev, v]);
    }
    setInputValue("");
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addIngredient();
    }
  };

  const removeIngredient = (index) => {
    setIngredients((prev) => prev.filter((_, i) => i !== index));
  };

  const toggleDiet = (d) => {
    setDiets((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d],
    );
  };

  const applyTrendingSearch = (trendIngredients) => {
    setIngredients(trendIngredients);
    setInputValue("");
  };

  const applyRecentSearch = (label) => {
    const parts = label
      .split(", ")
      .map((s) => s.trim())
      .filter(Boolean);
    setIngredients(parts);
    setInputValue("");
  };

  const handleSearch = async () => {
    if (ingredients.length === 0) return;
    setSearching(true);
    setSearchError("");
    setHasSearched(true);
    setSortBy("none");
    try {
      const params = { ingredients: ingredients.join(",") };
      if (diets.length > 0) params.diet = diets.join(",");
      const res = await api.get("/api/recipes/search", { params });
      setRecipes(res.data.recipeDetails?.results ?? []);
      saveRecentSearch(ingredients);
      setRecentSearches(loadRecentSearches());
    } catch {
      setSearchError("Failed to fetch recipes. Please try again.");
    } finally {
      setSearching(false);
    }
  };

  const handleSave = async (recipe) => {
    try {
      await api.post("/api/saved", {
        spoonacular_id: recipe.id,
        title: recipe.title,
        image_url: recipe.image,
        ready_in_minutes: recipe.readyInMinutes,
        servings: recipe.servings,
      });
      setSavedIds((prev) => new Set([...prev, recipe.id]));
    } catch (err) {
      console.error("Failed to save recipe", err);
    }
  };

  const handleUnsave = async (spoonacularId) => {
    try {
      await api.delete(`/api/saved/${spoonacularId}`);
      setSavedIds((prev) => {
        const next = new Set(prev);
        next.delete(spoonacularId);
        return next;
      });
    } catch (err) {
      console.error("Failed to unsave recipe", err);
    }
  };

  const sortedRecipes = useMemo(() => {
    const copy = [...recipes];
    if (sortBy === "cooking_time")
      copy.sort(
        (a, b) => (a.readyInMinutes ?? 999) - (b.readyInMinutes ?? 999),
      );
    else if (sortBy === "rating")
      copy.sort(
        (a, b) => (b.spoonacularScore ?? 0) - (a.spoonacularScore ?? 0),
      );
    else if (sortBy === "popularity")
      copy.sort((a, b) => (b.aggregateLikes ?? 0) - (a.aggregateLikes ?? 0));
    return copy;
  }, [recipes, sortBy]);

  return (
    <main className="min-h-screen bg-background">
      {/* ── Hero / Search section ── */}
      <section className="flex flex-col items-center justify-center py-16 px-6 text-center">
        <h1 className="font-heading text-5xl md:text-7xl text-text-primary mb-2 leading-tight max-w-2xl">
          What's in your kitchen?
        </h1>
        <p className="text-text-muted font-body text-sm mb-8">
          Add ingredients one by one and we'll find what you can cook
        </p>

        <div className="w-full max-w-xl">
          {/* Ingredient chips */}
          {ingredients.length > 0 && (
            <div className="mb-3">
              <p className="text-xs text-text-secondary font-body mb-2 text-left">
                {ingredients.length} ingredient
                {ingredients.length !== 1 ? "s" : ""} added
              </p>
              <div className="flex flex-wrap gap-2 justify-start">
                {ingredients.map((ing, i) => (
                  <span
                    key={i}
                    className="inline-flex items-center gap-1.5 border border-accent text-accent text-sm px-3 py-1 rounded-full font-body transition-all duration-200 animate-in fade-in slide-in-from-bottom-2"
                  >
                    {ing}
                    <button
                      onClick={() => removeIngredient(i)}
                      aria-label={`Remove ${ing}`}
                      className="hover:text-white transition-colors leading-none active:scale-90"
                    >
                      <X size={13} />
                    </button>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Text input */}
          <Input
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={
              ingredients.length === 0
                ? "e.g. eggs, tomato, onion — press Enter to add"
                : "Add another ingredient…"
            }
            className="w-full h-12 text-base mb-3"
          />

          {/* Diet filter chips */}
          <div className="flex flex-wrap gap-2 mb-5 justify-start">
            {DIETS.map((d) => (
              <button
                key={d}
                onClick={() => toggleDiet(d)}
                title={`Filter by ${d}`}
                className={`px-4 py-1.5 rounded-full text-sm font-body border transition-all duration-200 active:scale-95 ${
                  diets.includes(d)
                    ? "bg-accent border-accent text-black font-semibold shadow-sm shadow-accent/30"
                    : "border-border text-text-secondary hover:border-accent hover:text-accent"
                }`}
              >
                {d}
              </button>
            ))}
            {diets.length > 0 && (
              <button
                onClick={() => setDiets([])}
                className="px-3 py-1.5 rounded-full text-xs font-body border border-border text-text-muted hover:text-text-secondary hover:border-text-secondary transition-colors"
              >
                clear filters
              </button>
            )}
          </div>

          {/* Search button */}
          <Button
            onClick={handleSearch}
            disabled={ingredients.length === 0 || searching}
            size="lg"
            className="w-full text-base active:scale-[0.98] transition-transform"
          >
            {searching ? "Searching…" : "Find Recipes"}
          </Button>

          {searchError && (
            <p className="text-red-400 text-sm font-body mt-3">{searchError}</p>
          )}
        </div>
      </section>

      {/* ── Empty state (before first search) ── */}
      {!hasSearched && (
        <section className="px-6 pb-16 max-w-4xl mx-auto space-y-10">
          {/* Recent searches */}
          {recentSearches.length > 0 && (
            <div>
              <h2 className="text-text-secondary text-xs font-body uppercase tracking-widest mb-3 flex items-center gap-2">
                <Clock size={13} /> Recent searches
              </h2>
              <div className="flex flex-wrap gap-2">
                {recentSearches.map((r, i) => (
                  <button
                    key={i}
                    onClick={() => applyRecentSearch(r)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-body border border-border text-text-secondary hover:border-accent hover:text-accent transition-all duration-200 active:scale-95"
                  >
                    {r}
                    <ChevronRight size={12} className="opacity-50" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Popular ingredients */}
          <div>
            <h2 className="text-text-secondary text-xs font-body uppercase tracking-widest mb-3">
              Popular ingredients
            </h2>
            <div className="flex flex-wrap gap-2">
              {POPULAR_INGREDIENTS.map((ing) => (
                <button
                  key={ing}
                  onClick={() => addIngredient(ing)}
                  disabled={ingredients.includes(ing)}
                  className={`px-4 py-1.5 rounded-full text-sm font-body border transition-all duration-200 active:scale-95 ${
                    ingredients.includes(ing)
                      ? "border-accent text-accent bg-accent/10 cursor-default"
                      : "border-border text-text-secondary hover:border-accent hover:text-accent hover:bg-accent/5"
                  }`}
                >
                  {ing}
                  {ingredients.includes(ing) ? " ✓" : " +"}
                </button>
              ))}
            </div>
          </div>

          {/* Trending searches */}
          <div>
            <h2 className="text-text-secondary text-xs font-body uppercase tracking-widest mb-3 flex items-center gap-2">
              <TrendingUp size={13} /> Try searching for
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {TRENDING_SEARCHES.map((t) => (
                <button
                  key={t.label}
                  onClick={() => applyTrendingSearch(t.ingredients)}
                  className="flex flex-col items-center gap-2 p-4 rounded-xl bg-surface border border-border hover:border-accent/50 hover:bg-surface-hover transition-all duration-200 active:scale-95 group"
                >
                  <span className="text-3xl group-hover:scale-110 transition-transform duration-200">
                    {t.emoji}
                  </span>
                  <span className="text-sm font-body text-text-secondary group-hover:text-text-primary transition-colors text-center">
                    {t.label}
                  </span>
                  <span className="text-[11px] text-text-muted text-center leading-snug">
                    {t.ingredients.join(", ")}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── Results section ── */}
      {hasSearched && (
        <section className="px-6 pb-16 max-w-6xl mx-auto">
          {/* Pantry visualization */}
          {ingredients.length > 0 && !searching && (
            <div className="flex flex-wrap items-center gap-2 mb-5 p-3 rounded-lg bg-surface border border-border">
              <span className="text-xs text-text-muted font-body">
                Your pantry:
              </span>
              {ingredients.map((ing, i) => (
                <span
                  key={i}
                  className="text-xs bg-surface-hover text-accent border border-accent/30 px-2.5 py-0.5 rounded-full font-body"
                >
                  {ing}
                </span>
              ))}
            </div>
          )}

          {/* Results header + sort */}
          {!searching && recipes.length > 0 && (
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
              <p className="text-text-secondary font-body text-sm">
                Showing{" "}
                <span className="text-text-primary font-semibold">
                  {recipes.length}
                </span>{" "}
                recipe{recipes.length !== 1 ? "s" : ""} with{" "}
                <span className="text-accent">{ingredients.join(", ")}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSortBy(opt.value)}
                    className={`px-3 py-1 rounded-full text-xs font-body border transition-all duration-200 active:scale-95 ${
                      sortBy === opt.value
                        ? "bg-accent border-accent text-black font-semibold"
                        : "border-border text-text-secondary hover:border-accent hover:text-accent"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Skeleton loading grid */}
          {searching && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          )}

          {/* Empty results */}
          {!searching && hasSearched && recipes.length === 0 && (
            <div className="text-center py-16">
              <p className="text-text-muted font-body text-5xl mb-4">🥲</p>
              <p className="text-text-secondary font-body mb-2">
                No recipes found for those ingredients.
              </p>
              <p className="text-text-muted font-body text-sm">
                Try removing a filter or swapping an ingredient.
              </p>
            </div>
          )}

          {/* Recipe grid */}
          {!searching && sortedRecipes.length > 0 && (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {sortedRecipes.map((recipe) => (
                <RecipeCard
                  key={recipe.id}
                  recipe={recipe}
                  isSaved={savedIds.has(recipe.id)}
                  onSave={handleSave}
                  onUnsave={handleUnsave}
                  onClick={() => setCookingRecipeId(recipe.id)}
                />
              ))}
            </div>
          )}
        </section>
      )}

      {/* Cooking mode overlay */}
      {cookingRecipeId && (
        <CookingMode
          recipeId={cookingRecipeId}
          onClose={() => setCookingRecipeId(null)}
        />
      )}
    </main>
  );
}
