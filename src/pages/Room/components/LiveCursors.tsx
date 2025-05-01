
import React, { RefObject } from "react";
import { LiveCursor } from "../types";

interface LiveCursorsProps {
  containerRef: RefObject<HTMLDivElement>;
  cursorPositions: Record<string, { x: number; y: number; userName: string }>;
}

const LiveCursors: React.FC<LiveCursorsProps> = ({ containerRef, cursorPositions }) => {
  // Get initials from username
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  return (
    <div className="absolute inset-0 pointer-events-none z-10">
      {Object.entries(cursorPositions).map(([userId, position]) => (
        <div
          key={userId}
          className="absolute transform -translate-x-1/2 -translate-y-1/2"
          style={{ 
            left: position.x, 
            top: position.y,
            transition: 'left 0.2s ease, top 0.2s ease'
          }}
        >
          <div className="flex flex-col items-center">
            <div className="cursor-pointer">
              <svg width="24" height="36" viewBox="0 0 24 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5.65376 12.3673H5.46026L5.31717 12.4976L0.76633 16.5016L0.131618 17.0658L0.2721 17.8794L5.79208 35.0264L5.95362 35.4846L6.43542 35.6328L12.0318 37.1053L12.7969 37.3212L13.1054 36.6062L16.3259 27.9889L20.0447 32.4121L20.2451 32.6383L20.5366 32.7432L25.1644 34.4127L25.5408 34.5345L25.8538 34.2459L29.5734 30.7876L30.3989 30.0137L29.9011 29.0941L17.9363 8.40831L17.4867 7.63373L16.632 7.81959L6.23799 10.333L5.44945 10.5047L5.34157 11.3071L5.65376 12.3673Z" 
                  fill="#2563EB" stroke="#FFFFFF"/>
              </svg>
            </div>
            <div className="select-none bg-primary text-white text-xs px-2 py-1 rounded-md shadow-sm mt-1">
              <span className="whitespace-nowrap">{position.userName}</span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

export default LiveCursors;
