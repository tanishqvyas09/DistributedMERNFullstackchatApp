import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { supabase } from "../utils/supabaseClient";

export default function ProtectedRoute({ children }) {
  const [isLoading, setIsLoading] = useState(true);
  const [session, setSession] = useState(null);

  useEffect(() => {
    const checkSession = async () => {
      const { data, error } = await supabase.auth.getSession();
      setSession(data?.session || null);
      setIsLoading(false);
    };

    checkSession();
  }, []);

  if (isLoading) return <div>Loading...</div>;

  return session ? children : <Navigate to="/" replace />;
}
