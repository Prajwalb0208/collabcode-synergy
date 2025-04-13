
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ArrowRight, LogIn } from "lucide-react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";

const JoinSessionForm: React.FC = () => {
  const [sessionId, setSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleJoinSession = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!sessionId.trim()) {
      toast({
        title: "Error",
        description: "Please enter a valid session ID",
        variant: "destructive"
      });
      return;
    }
    
    setLoading(true);
    
    // Navigate to the room with the provided ID
    navigate(`/room/${sessionId.trim()}`);
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-xl">Join Existing Session</CardTitle>
        <CardDescription>
          Enter a session ID to join an existing collaborative room
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleJoinSession}>
        <CardContent>
          <div className="flex items-center space-x-2">
            <Input
              placeholder="Enter session ID"
              value={sessionId}
              onChange={(e) => setSessionId(e.target.value)}
              className="flex-1"
              required
            />
          </div>
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full" disabled={loading}>
            {loading ? (
              "Joining..."
            ) : (
              <>
                <LogIn className="mr-2 h-4 w-4" />
                Join Session
              </>
            )}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};

export default JoinSessionForm;
