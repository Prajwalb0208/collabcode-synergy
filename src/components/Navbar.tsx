
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Code, Github, UserPlus, Settings, History, LogIn, LogOut } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();

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
            <History className="h-4 w-4 mr-2" />
            Rooms
          </Button>
          <Button variant="ghost" size="sm" onClick={() => navigate("/docs")}>
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
          
          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="ml-2 flex items-center gap-2">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <span className="hidden md:inline text-sm font-medium">{user.name}</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>My Account</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate("/rooms")}>
                  <History className="mr-2 h-4 w-4" />
                  <span>My Rooms</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate("/settings")}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Settings</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => {
                  logout();
                  navigate("/");
                }}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Logout</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={() => navigate("/auth")} className="ml-2" variant="default">
              <LogIn className="mr-2 h-4 w-4" />
              Login
            </Button>
          )}
          
          <Button onClick={() => navigate("/new-room")} className="ml-2">
            New Room
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
