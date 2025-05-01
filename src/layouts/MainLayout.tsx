
import React from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { useIsMobile } from "@/hooks/use-mobile";

interface MainLayoutProps {
  children: React.ReactNode;
  hideFooter?: boolean;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children, hideFooter = false }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />
      <main className="flex-1 mt-16">{children}</main>
      {!hideFooter && !isMobile && <Footer />}
    </div>
  );
};

export default MainLayout;
