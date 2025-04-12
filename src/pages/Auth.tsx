
import { Navigate } from "react-router-dom";
import MainLayout from "@/layouts/MainLayout";

const Auth = () => {
  // Always redirect to home since users are always authenticated
  return <Navigate to="/" />;
};

export default Auth;
