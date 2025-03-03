
import React, { useEffect, useState } from "react";

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
  // Mock cursors - in a real app, these would come from a real-time connection
  const [cursors, setCursors] = useState<Cursor[]>([
    { id: "user1", x: 150, y: 120, color: "#3b82f6", name: "Alice" },
    { id: "user2", x: 250, y: 220, color: "#10b981", name: "Bob" }
  ]);

  useEffect(() => {
    // Simulate cursor movement
    const interval = setInterval(() => {
      setCursors(prev => 
        prev.map(cursor => ({
          ...cursor,
          x: cursor.x + Math.random() * 10 - 5,
          y: cursor.y + Math.random() * 10 - 5
        }))
      );
    }, 1000);

    return () => clearInterval(interval);
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
