
import { Button } from "@/components/ui/button";
import MainLayout from "@/layouts/MainLayout";
import { useNavigate } from "react-router-dom";
import { 
  Code, 
  Users, 
  MessagesSquare, 
  Video, 
  Sparkles, 
  Github,
  ArrowRight
} from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  return (
    <MainLayout>
      <section className="container pt-16 md:pt-24 pb-8 relative">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -left-40 -top-40 h-[40rem] w-[40rem] rounded-full bg-primary/5"></div>
          <div className="absolute -right-40 -bottom-40 h-[40rem] w-[40rem] rounded-full bg-primary/5"></div>
        </div>
        
        <div className="relative mx-auto text-center max-w-3xl space-y-6 animate-fade-in">
          <div className="inline-flex items-center px-3 py-1 rounded-full border border-border bg-background/50 text-sm mb-2">
            <span className="text-muted-foreground">Collaborate in Real-time</span>
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
            Code Together, <span className="text-primary">Build Together</span>
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            A real-time collaborative coding platform with AI assistance, 
            designed for seamless team development.
          </p>
          <div className="flex flex-wrap justify-center gap-4 mt-8">
            <Button size="lg" onClick={() => navigate("/new-room")}>
              Create Room
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button size="lg" variant="outline" onClick={() => navigate("/rooms")}>
              Join Existing Room
            </Button>
          </div>
        </div>
      </section>

      <section className="container py-16 md:py-24 relative">
        <div className="grid gap-8 md:grid-cols-3 mb-16">
          <div className="p-6 rounded-xl backdrop-blur-sm bg-card/30 border border-border/50 animate-fade-in" style={{animationDelay: '100ms'}}>
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
              <Code className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Real-time Coding</h3>
            <p className="text-muted-foreground">
              Code together in real-time with syntax highlighting and live cursors, just like you're sitting next to each other.
            </p>
          </div>
          
          <div className="p-6 rounded-xl backdrop-blur-sm bg-card/30 border border-border/50 animate-fade-in" style={{animationDelay: '200ms'}}>
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">AI Assistance</h3>
            <p className="text-muted-foreground">
              Get intelligent code suggestions, bug fixes, and performance improvements as you write.
            </p>
          </div>
          
          <div className="p-6 rounded-xl backdrop-blur-sm bg-card/30 border border-border/50 animate-fade-in" style={{animationDelay: '300ms'}}>
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
              <Github className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-medium mb-2">Git Integration</h3>
            <p className="text-muted-foreground">
              Seamlessly integrate with GitHub repositories for version control and team collaboration.
            </p>
          </div>
        </div>
        
        <div className="relative rounded-2xl overflow-hidden border border-border/50 shadow-md animate-fade-in" style={{animationDelay: '400ms'}}>
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-primary/10"></div>
          <div className="p-8 md:p-12 relative">
            <div className="grid md:grid-cols-2 gap-8 items-center">
              <div>
                <h2 className="text-3xl font-bold mb-4">Experience the future of collaborative coding</h2>
                <p className="text-muted-foreground mb-6">
                  Whether you're teaching, pair programming, or working on a team project,
                  CollabCode makes remote collaboration as effective as being in the same room.
                </p>
                <div className="flex flex-wrap gap-4">
                  <Button onClick={() => navigate("/demo")}>
                    Try Demo
                  </Button>
                  <Button variant="outline" onClick={() => navigate("/documentation")}>
                    Learn More
                  </Button>
                </div>
              </div>
              <div className="bg-code rounded-xl overflow-hidden border border-border/50 shadow-sm">
                <div className="bg-black/10 px-4 py-2 border-b border-border/50 flex items-center gap-2">
                  <div className="flex space-x-2">
                    <div className="h-3 w-3 rounded-full bg-destructive/80"></div>
                    <div className="h-3 w-3 rounded-full bg-yellow-500/80"></div>
                    <div className="h-3 w-3 rounded-full bg-green-500/80"></div>
                  </div>
                  <span className="text-xs text-muted-foreground ml-2">example.js</span>
                </div>
                <pre className="p-4 text-sm font-mono overflow-auto text-foreground">
{`function calculateTotal(items) {
  return items
    .map(item => item.price * item.quantity)
    .reduce((sum, val) => sum + val, 0);
}

// AI Suggestion: Add type annotations
// function calculateTotal(items: Item[]): number

const result = calculateTotal(cartItems);
console.log(\`Total: $\${result.toFixed(2)}\`);`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="container py-16 text-center">
        <h2 className="text-3xl font-bold mb-12">All the tools you need</h2>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
          <div className="flex flex-col items-center animate-fade-in" style={{animationDelay: '100ms'}}>
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
              <Users className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-1">Multiple Users</h3>
            <p className="text-sm text-muted-foreground">
              Collaborate with unlimited team members
            </p>
          </div>
          
          <div className="flex flex-col items-center animate-fade-in" style={{animationDelay: '200ms'}}>
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
              <MessagesSquare className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-1">Team Chat</h3>
            <p className="text-sm text-muted-foreground">
              Discuss code changes in real-time
            </p>
          </div>
          
          <div className="flex flex-col items-center animate-fade-in" style={{animationDelay: '300ms'}}>
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
              <Video className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-1">Video Calls</h3>
            <p className="text-sm text-muted-foreground">
              Face-to-face collaboration
            </p>
          </div>
          
          <div className="flex flex-col items-center animate-fade-in" style={{animationDelay: '400ms'}}>
            <div className="rounded-full w-12 h-12 flex items-center justify-center bg-primary/10 mb-4">
              <Sparkles className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-lg font-medium mb-1">AI Code Reviews</h3>
            <p className="text-sm text-muted-foreground">
              Automatic code improvement suggestions
            </p>
          </div>
        </div>
      </section>
      
      <section className="container py-16 md:py-24">
        <div className="rounded-2xl bg-primary/5 p-8 md:p-12 text-center relative overflow-hidden border border-primary/10">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-primary/10 to-transparent opacity-50"></div>
          <div className="relative">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Start Collaborating Today</h2>
            <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Create your first collaborative coding room and invite your team to join.
            </p>
            <Button size="lg" onClick={() => navigate("/new-room")}>
              Get Started
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
