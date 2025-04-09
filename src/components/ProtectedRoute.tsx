
import { ReactNode, useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Loader2 } from "lucide-react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, isLoading } = useAuth();
  const location = useLocation();
  const [showLoader, setShowLoader] = useState(true);

  // Only show loading indicator for a reasonable time
  useEffect(() => {
    const timer = setTimeout(() => {
      setShowLoader(false);
    }, 3000); // 3 seconds max loading time

    return () => clearTimeout(timer);
  }, []);

  // Show loading state while checking authentication
  if (isLoading && showLoader) {
    return (
      <div className="flex flex-col items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
        <span className="mt-4 text-lg">Checking authentication...</span>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!user) {
    // Pass the current location to redirect back after login
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  // Render children if user is authenticated
  return <>{children}</>;
};

export default ProtectedRoute;
