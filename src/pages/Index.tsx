
import React from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import MainLayout from "@/layouts/MainLayout";
import JoinSessionForm from "@/components/JoinSessionForm";
import { generateRoomId } from "@/lib/utils";
import { ArrowRight, Code, Plus, Share2 } from "lucide-react";

const Index = () => {
  const navigate = useNavigate();

  const handleCreateNewRoom = () => {
    const newRoomId = generateRoomId();
    navigate(`/room/${newRoomId}`);
  };

  return (
    <MainLayout>
      <section className="bg-gradient-to-b from-background to-muted/30 py-24 md:py-32">
        <div className="container max-w-6xl">
          <div className="text-center mb-12 space-y-4">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
              Collaborate on Code in Real-Time
            </h1>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Create or join a coding session to work together with teammates,
              share your screen, and solve problems together.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Create New Session Card */}
            <div className="bg-card border rounded-lg shadow-sm p-6 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Plus className="h-8 w-8 text-primary" />
              </div>
              <h2 className="text-2xl font-semibold mb-2">Create New Session</h2>
              <p className="text-muted-foreground mb-6">
                Start a new collaborative coding session and invite others to join
              </p>
              <Button size="lg" onClick={handleCreateNewRoom} className="w-full">
                Create New Room
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>

            {/* Join Existing Session */}
            <div className="bg-card border rounded-lg shadow-sm p-6">
              <JoinSessionForm />
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-background">
        <div className="container max-w-6xl">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Code className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Real-time Coding</h3>
              <p className="text-muted-foreground">
                Code together in real-time with teammates across the world
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Share2 className="h-5 w-5 text-primary" />
              </div>
              <h3 className="text-xl font-semibold">Share &amp; Collaborate</h3>
              <p className="text-muted-foreground">
                Share your code, get feedback, and collaborate effortlessly
              </p>
            </div>
            <div className="space-y-2">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className="text-primary"
                >
                  <rect x="2" y="3" width="20" height="14" rx="2" ry="2" />
                  <path d="M8 21h8" />
                  <path d="M12 17v4" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold">Built-in Video Chat</h3>
              <p className="text-muted-foreground">
                Communicate with teammates using integrated audio and video chat
              </p>
            </div>
          </div>
        </div>
      </section>
    </MainLayout>
  );
};

export default Index;
