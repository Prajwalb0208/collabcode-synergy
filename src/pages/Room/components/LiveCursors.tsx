
import React from "react";

interface LiveCursorsProps {
  containerRef: React.RefObject<HTMLDivElement>;
  cursorPositions: Record<string, { x: number; y: number; userName: string }>;
}

const LiveCursors: React.FC<LiveCursorsProps> = ({ containerRef, cursorPositions }) => {
  return (
    <>
      {Object.entries(cursorPositions).map(([userId, { x, y, userName }]) => (
        <div
          key={userId}
          className="absolute pointer-events-none z-50"
          style={{
            left: `${x}px`,
            top: `${y}px`,
            transform: "translate(-50%, -50%)"
          }}
        >
          <div className="flex flex-col items-center">
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M5 3L19 12L5 21L5 3Z"
                fill="#3b82f6"
                stroke="#3b82f6"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="bg-blue-500 text-white text-xs px-1 py-0.5 rounded mt-1 whitespace-nowrap">
              {userName}
            </span>
          </div>
        </div>
      ))}
    </>
  );
};

export default LiveCursors;
