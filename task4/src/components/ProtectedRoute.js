import React, { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";

import { UserAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { user, isUserLoaded } = UserAuth();
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (loading && isUserLoaded) {
      setLoading(false);
    }
  }, [loading, isUserLoaded]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!user || Object.keys(user).length === 0) {
    return <Navigate to="/" />;
  }

  return children;
}
