import React from "react";
import { Link, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/ThemeToggle";

const Navbar = () => {
  const location = useLocation();
  
  // Check if we're on certain pages where the navbar should have a different style
  const isSpecialPage = ["/new-room", "/room"].some(path => 
    location.pathname.startsWith(path)
  );
  
  if (isSpecialPage) {
    return (
      <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center gap-2">
            <span className="font-semibold tracking-tight">CollabCode</span>
          </Link>
          
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button variant="outline" size="sm" asChild>
              <Link to="/rooms">My Rooms</Link>
            </Button>
          </div>
        </div>
      </header>
    );
  }
  
  return (
    <header className="fixed top-0 left-0 right-0 z-50 border-b bg-background/80 backdrop-blur-sm">
      <div className="container flex h-16 items-center">
        <Link to="/" className="mr-6 flex items-center gap-2">
          <span className="font-semibold tracking-tight">CollabCode</span>
        </Link>
        <nav className="flex flex-1 items-center justify-between">
          <div className="flex gap-6">
            <Link 
              to="/" 
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground/80",
                location.pathname === "/" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Home
            </Link>
            <Link 
              to="/rooms"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground/80",
                location.pathname === "/rooms" ? "text-foreground" : "text-foreground/60"
              )}
            >
              My Rooms
            </Link>
            <Link 
              to="/docs"
              className={cn(
                "text-sm font-medium transition-colors hover:text-foreground/80",
                location.pathname === "/docs" ? "text-foreground" : "text-foreground/60"
              )}
            >
              Docs
            </Link>
          </div>
          <div className="flex items-center gap-2">
            <ThemeToggle />
            <Button asChild>
              <Link to="/new-room">New Room</Link>
            </Button>
          </div>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
