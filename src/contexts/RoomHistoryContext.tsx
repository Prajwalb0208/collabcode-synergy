
import React, { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "./AuthContext";
import { Github } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

interface Room {
  id: string;
  name: string;
  description?: string;
  lastVisited: Date;
  owner: string;
  participants: string[];
  pendingRequests: string[];
  gitHubRepo?: string;
}

interface RoomHistoryContextType {
  recentRooms: Room[];
  addRoom: (roomId: string) => void;
  updateRoomDetails: (roomId: string, details: Partial<Omit<Room, 'id'>>) => void;
  isRoomOwner: (roomId: string) => boolean;
  isParticipant: (roomId: string) => boolean;
  isPendingApproval: (roomId: string) => boolean;
  requestAccess: (roomId: string) => void;
  approveAccess: (roomId: string, userId: string) => void;
  denyAccess: (roomId: string, userId: string) => void;
  connectGithubRepo: (roomId: string, repoUrl: string) => void;
}

const RoomHistoryContext = createContext<RoomHistoryContextType | undefined>(undefined);

export const useRoomHistory = () => {
  const context = useContext(RoomHistoryContext);
  if (!context) {
    throw new Error("useRoomHistory must be used within a RoomHistoryProvider");
  }
  return context;
};

export const RoomHistoryProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const userId = user?.id || "anonymous";

  // Use user ID in localStorage key to separate room history by user
  const storageKey = `roomHistory_${userId}`;

  const [recentRooms, setRecentRooms] = useState<Room[]>(() => {
    const saved = localStorage.getItem(storageKey);
    if (saved) {
      try {
        // Convert string dates back to Date objects
        const parsed = JSON.parse(saved);
        return parsed.map((room: any) => ({
          ...room,
          lastVisited: new Date(room.lastVisited),
          owner: room.owner || userId,
          participants: room.participants || [userId],
          pendingRequests: room.pendingRequests || [],
          description: room.description || "",
          gitHubRepo: room.gitHubRepo || ""
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    // Save to localStorage whenever recentRooms changes
    localStorage.setItem(storageKey, JSON.stringify(recentRooms));
  }, [recentRooms, storageKey]);

  const addRoom = (roomId: string) => {
    setRecentRooms(prev => {
      // Check if room already exists
      const existingIndex = prev.findIndex(room => room.id === roomId);
      
      if (existingIndex >= 0) {
        // Update existing room
        const newRooms = [...prev];
        newRooms[existingIndex] = {
          ...newRooms[existingIndex],
          lastVisited: new Date(),
          participants: newRooms[existingIndex].participants.includes(userId)
            ? newRooms[existingIndex].participants
            : [...newRooms[existingIndex].participants, userId]
        };
        return newRooms;
      } else {
        // Add new room, limit to 10 recent rooms
        const newRoom = {
          id: roomId,
          name: `Room ${roomId.substring(0, 4)}...`,
          description: "Collaborative coding session",
          lastVisited: new Date(),
          owner: userId,
          participants: [userId],
          pendingRequests: []
        };
        return [newRoom, ...prev].slice(0, 10);
      }
    });
  };

  const updateRoomDetails = (roomId: string, details: Partial<Omit<Room, 'id'>>) => {
    setRecentRooms(prev => {
      return prev.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            ...details
          };
        }
        return room;
      });
    });
  };

  const connectGithubRepo = (roomId: string, repoUrl: string) => {
    updateRoomDetails(roomId, { gitHubRepo: repoUrl });
    toast({
      title: "GitHub Repository Connected",
      description: "Your room is now linked to GitHub repository",
    });
  };

  const isRoomOwner = (roomId: string) => {
    const room = recentRooms.find(r => r.id === roomId);
    return room ? room.owner === userId : false;
  };

  const isParticipant = (roomId: string) => {
    const room = recentRooms.find(r => r.id === roomId);
    return room ? room.participants.includes(userId) : false;
  };

  const isPendingApproval = (roomId: string) => {
    const room = recentRooms.find(r => r.id === roomId);
    return room ? room.pendingRequests.includes(userId) : false;
  };

  const requestAccess = (roomId: string) => {
    setRecentRooms(prev => {
      return prev.map(room => {
        if (room.id === roomId && !room.pendingRequests.includes(userId)) {
          return {
            ...room,
            pendingRequests: [...room.pendingRequests, userId]
          };
        }
        return room;
      });
    });
  };

  const approveAccess = (roomId: string, requestUserId: string) => {
    setRecentRooms(prev => {
      return prev.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            participants: room.participants.includes(requestUserId)
              ? room.participants
              : [...room.participants, requestUserId],
            pendingRequests: room.pendingRequests.filter(id => id !== requestUserId)
          };
        }
        return room;
      });
    });
  };

  const denyAccess = (roomId: string, requestUserId: string) => {
    setRecentRooms(prev => {
      return prev.map(room => {
        if (room.id === roomId) {
          return {
            ...room,
            pendingRequests: room.pendingRequests.filter(id => id !== requestUserId)
          };
        }
        return room;
      });
    });
  };

  return (
    <RoomHistoryContext.Provider
      value={{
        recentRooms,
        addRoom,
        updateRoomDetails,
        isRoomOwner,
        isParticipant,
        isPendingApproval,
        requestAccess,
        approveAccess,
        denyAccess,
        connectGithubRepo
      }}
    >
      {children}
    </RoomHistoryContext.Provider>
  );
};
