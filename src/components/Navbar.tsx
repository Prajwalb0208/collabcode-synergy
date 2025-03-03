
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code, Github, UserPlus, Settings } from "lucide-react";

const Navbar = () => {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-background/90 backdrop-blur-md border-b border-border/40 fixed top-0 z-50 transition-all duration-200">
      <div className="container flex h-16 items-center justify-between">
        <div className="flex items-center gap-2" onClick={() => navigate("/")} role="button">
          <Code className="h-6 w-6 text-primary" />
          <span className="font-medium text-xl tracking-tight">CollabCode</span>
        </div>

        <nav className="hidden md:flex items-center gap-6">
          <Button variant="ghost" size="sm" onClick={() => navigate("/")}>
            Home
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/rooms")}>
            Rooms
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/documentation")}>
            Docs
          </Button>
        </nav>

        <div className="flex items-center gap-3">
          <Button variant="ghost" size="icon" aria-label="GitHub">
            <Github className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Invite People">
            <UserPlus className="h-5 w-5" />
          </Button>
          <Button variant="ghost" size="icon" aria-label="Settings">
            <Settings className="h-5 w-5" />
          </Button>
          <Button onClick={() => navigate("/new-room")} className="ml-2">
            New Room
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
