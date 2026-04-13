import { BrowserRouter, Routes, Route, Navigate, Link } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import SavedRecipes from "@/pages/SavedRecipes";

function SavedGate() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-3xl mx-auto px-6 py-16 text-center">
        <h1 className="font-heading text-3xl md:text-4xl text-text-primary mb-4">
          Save recipes when you're ready
        </h1>
        <p className="text-text-secondary font-body mb-8">
          Create an account to bookmark and revisit your favorites.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Button asChild size="lg">
            <Link to="/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link to="/register">Create account</Link>
          </Button>
        </div>
      </div>
    </main>
  );
}

function SavedRoute() {
  const { user, loading } = useAuth();
  if (loading) return null;
  return user ? <SavedRecipes /> : <SavedGate />;
}

function AppRoutes() {
  const { loading } = useAuth();
  if (loading) return null;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/" element={<Home />} />
        <Route path="/saved" element={<SavedRoute />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
