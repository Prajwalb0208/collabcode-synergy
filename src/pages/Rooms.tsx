
import React from "react";
import { useNavigate } from "react-router-dom";
import { useRoomHistory } from "@/contexts/RoomHistoryContext";
import MainLayout from "@/layouts/MainLayout";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { History, Clock, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

const Rooms = () => {
  const { recentRooms } = useRoomHistory();
  const navigate = useNavigate();

  return (
    <MainLayout>
      <div className="container py-8">
        <div className="flex items-center mb-6">
          <History className="mr-2 h-6 w-6 text-primary" />
          <h1 className="text-3xl font-bold">Recent Rooms</h1>
        </div>

        {recentRooms.length === 0 ? (
          <Card>
            <CardContent className="p-6 flex flex-col items-center text-center">
              <History className="h-12 w-12 text-muted-foreground mb-4" />
              <h3 className="text-xl font-medium mb-2">No Room History</h3>
              <p className="text-muted-foreground mb-6">
                You haven't joined any rooms yet. Create or join a room to get started.
              </p>
              <Button onClick={() => navigate("/new-room")}>Create New Room</Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentRooms.map((room) => (
              <Card key={room.id} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-2">
                  <CardTitle>{room.name}</CardTitle>
                  <CardDescription className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {formatDistanceToNow(room.lastVisited, { addSuffix: true })}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => navigate(`/room/${room.id}`)}
                  >
                    Join Room
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </MainLayout>
  );
};

export default Rooms;
