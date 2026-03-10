import { useState, useEffect } from "react";
import { X } from "lucide-react";
import { Button } from "@/components/ui/button";
import api from "@/api/axios";

export default function CookingMode({ recipeId, onClose }) {
  const [steps, setSteps] = useState([]);
  const [currentStep, setCurrentStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    api
      .get(`/api/recipes/${recipeId}`)
      .then((res) => {
        const recipe = res.data.recipeDetails;
        const parsed = recipe?.analyzedInstructions?.[0]?.steps ?? [];
        setSteps(parsed);
      })
      .catch(() => setError("Failed to load recipe instructions."))
      .finally(() => setLoading(false));
  }, [recipeId]);

  // Escape key closes cooking mode
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  const progress =
    steps.length > 0 ? ((currentStep + 1) / steps.length) * 100 : 0;

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      {/* Progress bar */}
      <div className="h-1 w-full bg-surface shrink-0">
        <div
          className="h-full bg-accent transition-all duration-400 ease-out"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Close button */}
      <button
        onClick={onClose}
        aria-label="Exit cooking mode"
        className="absolute top-4 right-4 text-text-muted hover:text-white transition-colors z-10"
      >
        <X size={24} />
      </button>

      {/* Content */}
      <div className="flex-1 flex flex-col justify-center items-start px-8 md:px-20 max-w-4xl mx-auto w-full">
        {loading ? (
          <p className="text-text-secondary font-body animate-pulse">
            Loading instructions…
          </p>
        ) : error ? (
          <p className="text-red-400 font-body">{error}</p>
        ) : steps.length === 0 ? (
          <p className="text-text-secondary font-body">
            No step-by-step instructions available for this recipe.
          </p>
        ) : (
          <>
            <p className="font-heading text-accent text-7xl md:text-8xl font-bold mb-8 leading-none select-none">
              {String(currentStep + 1).padStart(2, "0")}
            </p>
            <p className="text-white text-xl md:text-2xl font-body leading-relaxed">
              {steps[currentStep]?.step}
            </p>
          </>
        )}
      </div>

      {/* Navigation */}
      {!loading && !error && steps.length > 0 && (
        <div className="shrink-0 flex items-center justify-between px-8 pb-10">
          <Button
            variant="outline"
            onClick={() => setCurrentStep((p) => Math.max(0, p - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>

          <span className="text-text-muted font-body text-sm">
            {currentStep + 1} / {steps.length}
          </span>

          {currentStep < steps.length - 1 ? (
            <Button onClick={() => setCurrentStep((p) => p + 1)}>
              Next
            </Button>
          ) : (
            <Button onClick={onClose}>Finish</Button>
          )}
        </div>
      )}
    </div>
  );
}
