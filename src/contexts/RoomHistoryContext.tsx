
import React, { createContext, useContext, useState, useEffect } from "react";

interface RoomHistoryContextType {
  recentRooms: { id: string; name: string; lastVisited: Date }[];
  addRoom: (roomId: string) => void;
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
  const [recentRooms, setRecentRooms] = useState<{ id: string; name: string; lastVisited: Date }[]>(() => {
    const saved = localStorage.getItem("roomHistory");
    if (saved) {
      try {
        // Convert string dates back to Date objects
        const parsed = JSON.parse(saved);
        return parsed.map((room: any) => ({
          ...room,
          lastVisited: new Date(room.lastVisited)
        }));
      } catch (e) {
        return [];
      }
    }
    return [];
  });

  useEffect(() => {
    // Save to localStorage whenever recentRooms changes
    localStorage.setItem("roomHistory", JSON.stringify(recentRooms));
  }, [recentRooms]);

  const addRoom = (roomId: string) => {
    setRecentRooms(prev => {
      // Check if room already exists
      const existingIndex = prev.findIndex(room => room.id === roomId);
      
      // Create new room object
      const updatedRoom = {
        id: roomId,
        name: `Room ${roomId.substring(0, 4)}...`,
        lastVisited: new Date()
      };
      
      if (existingIndex >= 0) {
        // Update existing room
        const newRooms = [...prev];
        newRooms[existingIndex] = updatedRoom;
        return newRooms;
      } else {
        // Add new room, limit to 10 recent rooms
        return [updatedRoom, ...prev].slice(0, 10);
      }
    });
  };

  return (
    <RoomHistoryContext.Provider value={{ recentRooms, addRoom }}>
      {children}
    </RoomHistoryContext.Provider>
  );
};
