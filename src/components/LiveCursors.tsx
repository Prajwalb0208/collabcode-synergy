
import React, { useEffect, useState } from "react";
import { socketService } from "@/services/socketService";

interface Cursor {
  id: string;
  x: number;
  y: number;
  color: string;
  name: string;
}

interface LiveCursorsProps {
  containerRef: React.RefObject<HTMLDivElement>;
}

const LiveCursors: React.FC<LiveCursorsProps> = ({ containerRef }) => {
  const [cursors, setCursors] = useState<Cursor[]>([
    { id: "user1", x: 150, y: 120, color: "#3b82f6", name: "Alice" },
    { id: "user2", x: 250, y: 220, color: "#10b981", name: "Bob" }
  ]);

  useEffect(() => {
    // Set up listeners for cursor movements from other users
    const handleCursorMove = (data: { userId: string; x: number; y: number; name: string }) => {
      setCursors(prev => {
        // Find if this user cursor already exists
        const existingIndex = prev.findIndex(c => c.id === data.userId);
        
        if (existingIndex >= 0) {
          // Update existing cursor
          const updated = [...prev];
          updated[existingIndex] = {
            ...updated[existingIndex],
            x: data.x,
            y: data.y
          };
          return updated;
        } else {
          // Add new cursor with a random color
          const colors = ["#3b82f6", "#10b981", "#f59e0b", "#ef4444", "#8b5cf6", "#ec4899"];
          const randomColor = colors[Math.floor(Math.random() * colors.length)];
          
          return [...prev, {
            id: data.userId,
            x: data.x,
            y: data.y,
            color: randomColor,
            name: data.name
          }];
        }
      });
    };

    socketService.on("cursor-move", handleCursorMove);
    
    // Handle users joining and leaving
    socketService.on("user-joined", (data) => {
      // User cursors are added when they move their mouse
    });
    
    socketService.on("user-left", (data) => {
      setCursors(prev => prev.filter(c => c.id !== data.userId));
    });

    // For demo purposes - animate cursors slightly
    const interval = setInterval(() => {
      setCursors(prev => 
        prev.map(cursor => ({
          ...cursor,
          x: cursor.x + (Math.random() * 6 - 3),
          y: cursor.y + (Math.random() * 6 - 3)
        }))
      );
    }, 2000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  if (!containerRef.current) return null;

  return (
    <>
      {cursors.map(cursor => (
        <div 
          key={cursor.id}
          className="absolute z-10 pointer-events-none transition-all duration-100 ease-out"
          style={{ 
            transform: `translate(${cursor.x}px, ${cursor.y}px)`,
          }}
        >
          <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path 
              d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.00158691 17.2664L0 0L18.3192 17.263H9.99425L9.76272 17.2956L5.65376 12.3673Z" 
              fill={cursor.color}
            />
          </svg>
          
          <div 
            className="px-2 py-1 rounded-md text-xs text-white shadow-sm absolute whitespace-nowrap"
            style={{ 
              backgroundColor: cursor.color,
              transform: "translate(8px, -20px)"
            }}
          >
            {cursor.name}
          </div>
        </div>
      ))}
    </>
  );
};

export default LiveCursors;
