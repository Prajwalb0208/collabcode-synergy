
import React from "react";
import { useNavigate } from "react-router-dom";
import { useRoomHistory } from "@/contexts/RoomHistoryContext";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Clock, ArrowRight, Plus, Users, Code } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Rooms = () => {
  const { recentRooms } = useRoomHistory();
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="container max-w-7xl py-12">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center">
            <History className="mr-3 h-7 w-7 text-primary" />
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Your Coding Rooms</h1>
              <p className="text-muted-foreground mt-1">
                Join a recent room or create a new collaborative coding space
              </p>
            </div>
          </div>
          
          <Button onClick={() => navigate("/new-room")} size="lg" className="w-full md:w-auto">
            <Plus className="mr-2 h-4 w-4" />
            Create New Room
          </Button>
        </div>

        {recentRooms.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="p-10 flex flex-col items-center text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                <Code className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-2xl font-semibold mb-2">No Rooms Yet</h3>
              <p className="text-muted-foreground max-w-md mb-8">
                You haven't joined any coding rooms yet. Create your first room to start collaborating with others.
              </p>
              <Button onClick={() => navigate("/new-room")} size="lg">
                <Plus className="mr-2 h-4 w-4" />
                Create Your First Room
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {/* Create New Room Card */}
              <Card 
                className="border-dashed bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer h-[220px] flex flex-col justify-center"
                onClick={() => navigate("/new-room")}
              >
                <CardContent className="flex flex-col items-center justify-center text-center p-6 h-full">
                  <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-4">
                    <Plus className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="text-xl font-medium mb-2">Create New Room</h3>
                  <p className="text-muted-foreground text-sm">
                    Start a new collaborative coding session
                  </p>
                </CardContent>
              </Card>
              
              {/* Recent Rooms */}
              {recentRooms.map((room) => (
                <Card 
                  key={room.id} 
                  className="overflow-hidden hover:shadow-md transition-all h-[220px] flex flex-col"
                >
                  <CardHeader className="pb-2 flex flex-row items-start justify-between space-y-0">
                    <div>
                      <CardTitle className="text-xl font-semibold">{room.name || `Room ${room.id.substring(0, 8)}`}</CardTitle>
                      <CardDescription className="flex items-center mt-1">
                        <Clock className="h-3.5 w-3.5 mr-1.5" />
                        {formatDistanceToNow(room.lastVisited, { addSuffix: true })}
                      </CardDescription>
                    </div>
                    <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                      <Users className="h-4 w-4 text-primary" />
                    </div>
                  </CardHeader>
                  <CardContent className="pb-0 flex-grow">
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {room.description || "Collaborative coding session"}
                    </p>
                  </CardContent>
                  <div className="mt-auto p-6 pt-0">
                    <Button
                      variant="default"
                      className="w-full"
                      onClick={() => navigate(`/room/${room.id}`)}
                    >
                      Join Room
                      <ArrowRight className="ml-2 h-4 w-4" />
                    </Button>
                  </div>
                </Card>
              ))}
            </div>
          </>
        )}
      </div>
    </MainLayout>
  );
};

export default Rooms;
