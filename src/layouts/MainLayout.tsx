
import React from "react";
import Navbar from "@/components/Navbar";
import { RoomHistoryProvider } from "@/contexts/RoomHistoryContext";

interface MainLayoutProps {
  children: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({ children }) => {
  return (
    <RoomHistoryProvider>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 mt-16 pb-8">{children}</main>
      </div>
    </RoomHistoryProvider>
  );
};

export default MainLayout;
