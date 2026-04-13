import { useState, useEffect, useRef } from "react";
import { X, Check } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import api from "@/api/axios";

export default function CookingMode({ recipeId, onClose }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [recipe, setRecipe] = useState(null);
  const [steps, setSteps] = useState([]);
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const listRef = useRef(null);
  const stepRefs = useRef([]);

  useEffect(() => {
    api
      .get(`/api/recipes/${recipeId}`)
      .then((res) => {
        const recipe = res.data.recipeDetails;
        const parsed = recipe?.analyzedInstructions?.[0]?.steps ?? [];
        setRecipe(recipe);
        setSteps(parsed);
        setActiveStep(0);
      })
      .catch(() => setError("Failed to load recipe instructions."))
      .finally(() => setLoading(false));
  }, [recipeId]);

  useEffect(() => {
    const onKey = (e) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  useEffect(() => {
    stepRefs.current = [];
  }, [steps]);

  useEffect(() => {
    if (!steps.length) return;
    const container = listRef.current;
    if (!container) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((entry) => entry.isIntersecting);
        if (!visible.length) return;
        const best = visible.reduce((prev, curr) =>
          curr.intersectionRatio > prev.intersectionRatio ? curr : prev,
        );
        const index = Number(best.target.dataset.stepIndex ?? 0);
        setActiveStep((prev) => (prev === index ? prev : index));
      },
      {
        root: container,
        rootMargin: "-20% 0px -55% 0px",
        threshold: [0.15, 0.3, 0.45, 0.6, 0.75],
      },
    );

    stepRefs.current.forEach((el) => {
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, [steps]);

  const title = recipe?.title ?? "Recipe";
  const hasTime = recipe?.readyInMinutes != null;
  const hasServings = recipe?.servings != null;
  const handleMarkDone = (index) => {
    const next = Math.min(index + 1, steps.length - 1);
    const el = stepRefs.current[next];
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    }
    setActiveStep(next);
  };

  const handleLogout = async () => {
    await logout();
    navigate("/");
  };

  return (
    <div className="fixed inset-0 bg-black z-50 flex flex-col">
      <div className="shrink-0 h-16 border-b border-white/5 bg-background/80 backdrop-blur-lg px-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-heading text-text-primary tracking-wide">
          <span className="text-xl" aria-hidden="true">
            🍲
          </span>
          <span className="text-base">GourmetGraph</span>
        </div>
        <div className="flex items-center gap-4">
          <Link
            to="/saved"
            className="text-sm font-body text-text-secondary hover:text-text-primary transition-colors"
          >
            Saved
          </Link>
          {user && (
            <button
              onClick={handleLogout}
              className="text-sm font-body text-text-secondary hover:text-text-primary transition-colors"
              aria-label="Logout"
            >
              Logout
            </button>
          )}
          <button
            onClick={onClose}
            className="inline-flex items-center gap-2 text-sm font-body text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Go back"
          >
            <X size={16} />
            Back
          </button>
        </div>
      </div>

      <div
        ref={listRef}
        className="flex-1 min-h-0 overflow-y-auto overscroll-contain"
      >
        {loading ? (
          <div className="mx-auto w-full max-w-2xl px-6 md:px-10 py-12">
            <p className="text-text-secondary font-body animate-pulse">
              Loading instructions...
            </p>
          </div>
        ) : error ? (
          <div className="mx-auto w-full max-w-2xl px-6 md:px-10 py-12">
            <p className="text-red-400 font-body">{error}</p>
          </div>
        ) : steps.length === 0 ? (
          <div className="mx-auto w-full max-w-2xl px-6 md:px-10 py-12">
            <p className="text-text-secondary font-body">
              No step-by-step instructions available for this recipe.
            </p>
          </div>
        ) : (
          <div className="mx-auto w-full max-w-2xl px-6 md:px-10 py-10">
            <p className="text-xs uppercase tracking-[0.3em] text-text-muted mb-3">
              Recipe
            </p>
            <h1 className="font-heading text-3xl md:text-4xl text-text-primary mb-4">
              {title}
            </h1>
            <div className="flex flex-wrap gap-6 text-sm text-text-secondary mb-10">
              {hasTime && <span>⏱ {recipe.readyInMinutes} min</span>}
              {hasServings && <span>🍽 {recipe.servings} servings</span>}
            </div>

            <ol className="relative">
              {steps.map((step, index) => {
                const isCompleted = index < activeStep;
                const isActive = index === activeStep;
                const isLast = index === steps.length - 1;
                const dotClasses = isActive
                  ? "h-8 w-8 bg-accent text-black shadow-[0_0_0_4px_rgba(245,197,24,0.2)]"
                  : isCompleted
                    ? "h-7 w-7 bg-accent/15 text-accent border border-accent/40"
                    : "h-7 w-7 border border-border bg-surface text-text-muted";
                const lineClasses = isCompleted ? "bg-accent/60" : "bg-border";
                const labelClasses = isActive
                  ? "text-accent"
                  : "text-text-muted";
                const bodyClasses = isCompleted
                  ? "text-text-secondary/70"
                  : isActive
                    ? "text-text-primary"
                    : "text-text-secondary";

                return (
                  <li
                    key={step.number ?? index}
                    ref={(el) => {
                      stepRefs.current[index] = el;
                    }}
                    data-step-index={index}
                    className={`relative flex gap-4 ${isLast ? "pb-0" : "pb-8"}`}
                  >
                    <div className="relative flex flex-col items-center">
                      <span
                        className={`flex items-center justify-center rounded-full transition-all duration-200 ${dotClasses}`}
                      >
                        {isCompleted ? (
                          <Check size={14} />
                        ) : (
                          <span className="text-xs font-semibold">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        )}
                      </span>
                      {!isLast && (
                        <span className={`mt-2 w-px flex-1 ${lineClasses}`} />
                      )}
                    </div>
                    <div className="pt-1 flex-1">
                      <p
                        className={`text-xs uppercase tracking-[0.2em] ${labelClasses}`}
                      >
                        Step {String(index + 1).padStart(2, "0")}
                      </p>
                      <p
                        className={`mt-2 text-base leading-relaxed ${bodyClasses}`}
                      >
                        {step.step}
                      </p>
                    </div>
                    {isActive && (
                      <button
                        type="button"
                        onClick={() => handleMarkDone(index)}
                        disabled={isLast}
                        className="mt-1 flex items-center justify-center rounded-full border border-accent/30 px-3 py-1 text-accent transition-colors hover:bg-accent/10 disabled:cursor-default disabled:opacity-40"
                        aria-label={isLast ? "Finish recipe" : "Mark step done"}
                      >
                        <Check size={12} />
                      </button>
                    )}
                  </li>
                );
              })}
            </ol>
          </div>
        )}
      </div>
    </div>
  );
}
