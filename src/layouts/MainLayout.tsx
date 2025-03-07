
import React from "react";
import Navbar from "@/components/Navbar";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mt-16 pb-8">{children}</main>
    </div>
  );
};

export default MainLayout;
