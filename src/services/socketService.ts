
import { io, Socket } from "socket.io-client";
import { toast } from "@/components/ui/use-toast";

// For demo purposes, we'll use a mock socket implementation
// In a real app, you would connect to an actual WebSocket server
class SocketService {
  private socket: Socket | null = null;
  private roomId: string | null = null;
  private userId: string | null = null;
  private isConnected: boolean = false;
  private eventHandlers: Record<string, Function[]> = {};

  constructor() {
    // In a real implementation, we would connect to a real server
    // this.socket = io("https://your-socket-server.com");
    this.mockSocketBehavior();
  }

  // For demo purposes only - simulates socket behavior
  private mockSocketBehavior() {
    this.eventHandlers = {
      "code-change": [],
      "cursor-move": [],
      "user-joined": [],
      "user-left": [],
      "connect": [],
      "disconnect": [],
      "error": []
    };
    
    // Simulate connection
    setTimeout(() => {
      this.isConnected = true;
      this.triggerEvent("connect", {});
    }, 1000);
  }

  // Connect to a specific room
  connect(roomId: string, userId: string) {
    this.roomId = roomId;
    this.userId = userId;
    
    if (this.isConnected) {
      // Simulating a join response
      setTimeout(() => {
        this.triggerEvent("user-joined", { 
          userId: "mock-user-1", 
          name: "Alice" 
        });
        this.triggerEvent("user-joined", { 
          userId: "mock-user-2", 
          name: "Bob" 
        });
        toast({
          title: "Connected to session",
          description: `You've joined collaboration room ${roomId}`,
        });
      }, 1000);
    }
    
    return this;
  }
  
  // Disconnect from the current room
  disconnect() {
    if (this.isConnected) {
      this.isConnected = false;
      this.triggerEvent("disconnect", {});
      toast({
        title: "Disconnected from session",
        description: "You've left the collaboration room",
      });
    }
  }

  // Emit code changes to other users
  emitCodeChange(code: string, file: string, language: string) {
    if (!this.isConnected || !this.roomId) return;
    
    // In a real implementation, we would emit to the server:
    // this.socket.emit("code-change", { code, file, language, roomId: this.roomId });
    
    // Simulated response from other users
    setTimeout(() => {
      // We don't trigger the local event since the local state is already updated
    }, 100);
  }

  // Emit cursor position to other users
  emitCursorPosition(x: number, y: number) {
    if (!this.isConnected || !this.roomId || !this.userId) return;
    
    // In a real implementation:
    // this.socket.emit("cursor-move", { x, y, userId: this.userId, roomId: this.roomId });
  }

  // Register event handlers
  on(event: string, callback: Function) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(callback);
    return this;
  }

  // Helper function to trigger events for the mock implementation
  private triggerEvent(event: string, data: any) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(callback => callback(data));
    }
  }
}

// Export a singleton instance
export const socketService = new SocketService();
